'use strict';

/**
 * ClaimService.js — Business Logic for Claim Entity
 *
 * Enforces ALL business rules from DOMAIN_MODEL.md:
 *   - A user cannot submit more than one claim per ItemReport
 *   - Proof description must be at least 30 characters
 *   - A claim can only be approved/rejected by ADMIN
 *   - Rejecting a claim requires a mandatory rejection reason
 *   - When a claim is APPROVED, all other claims on the same item
 *     are automatically REJECTED
 *   - Claims cannot be submitted on RESOLVED or EXPIRED reports
 *
 * Relates to: FR-05, UC-05, US-005, US-007, T-011, T-012
 */

const { v4: uuidv4 } = require('uuid');
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require('../api/errors');

const MIN_PROOF_LENGTH = 30;

class ClaimService {
  /**
   * @param {import('../repositories/interfaces/EntityRepositories').ClaimRepository} claimRepo
   * @param {import('../repositories/interfaces/EntityRepositories').ItemReportRepository} reportRepo
   * @param {import('../repositories/interfaces/EntityRepositories').UserRepository} userRepo
   * @param {import('../repositories/interfaces/EntityRepositories').NotificationRepository} [notifRepo]
   */
  constructor(claimRepo, reportRepo, userRepo, notifRepo = null) {
    if (!claimRepo)  throw new Error('ClaimService requires a ClaimRepository');
    if (!reportRepo) throw new Error('ClaimService requires an ItemReportRepository');
    if (!userRepo)   throw new Error('ClaimService requires a UserRepository');
    this._claimRepo  = claimRepo;
    this._reportRepo = reportRepo;
    this._userRepo   = userRepo;
    this._notifRepo  = notifRepo;
  }

  // ── Submit Claim ──────────────────────────────────────────────────────────

  /**
   * Submits a claim for a found item.
   * Business rules enforced:
   *   - Report must be ACTIVE and of type FOUND
   *   - User cannot claim their own report
   *   - One claim per user per report
   *   - Proof description >= 30 characters
   *
   * @param {{ itemId, claimantId, proofDescription }} dto
   * @returns {object} created claim
   */
  async submitClaim({ itemId, claimantId, proofDescription }) {
    // Validate user exists
    const user = await this._userRepo.findById(claimantId);
    if (!user) throw new NotFoundError(`User "${claimantId}" not found`);

    // Validate report exists and is claimable
    const report = await this._reportRepo.findById(itemId);
    if (!report) throw new NotFoundError(`ItemReport "${itemId}" not found`);

    if (report.status === 'RESOLVED') {
      throw new ConflictError('Cannot submit a claim on a RESOLVED report');
    }
    if (report.status === 'EXPIRED') {
      throw new ConflictError('Cannot submit a claim on an EXPIRED report');
    }
    if (report.type !== 'FOUND') {
      throw new ConflictError('Claims can only be submitted on FOUND item reports');
    }
    if (report.userId === claimantId) {
      throw new ConflictError('You cannot submit a claim on your own report');
    }

    // Business rule: one claim per user per item
    if (await this._claimRepo.existsByClaimantAndItem(claimantId, itemId)) {
      throw new ConflictError('You have already submitted a claim for this item');
    }

    // Business rule: proof description >= 30 characters
    if (!proofDescription || proofDescription.trim().length < MIN_PROOF_LENGTH) {
      throw new ValidationError(`Proof description must be at least ${MIN_PROOF_LENGTH} characters`);
    }

    const now = new Date().toISOString();
    const claim = {
      claimId:          uuidv4(),
      itemId,
      claimantId,
      proofDescription: proofDescription.trim(),
      status:           'PENDING',
      rejectionReason:  null,
      createdAt:        now,
      resolvedAt:       null,
    };

    const saved = await this._claimRepo.save(claim);

    // Notify the report owner
    await this._notify(report.userId, `A new claim has been submitted for your item: "${report.title}"`, 'CLAIM_SUBMITTED');

    return saved;
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async getAllClaims() {
    return await this._claimRepo.findAll();
  }

  async getClaimById(claimId) {
    const claim = await this._claimRepo.findById(claimId);
    if (!claim) throw new NotFoundError(`Claim "${claimId}" not found`);
    return claim;
  }

  async getClaimsByItem(itemId) {
    const report = await this._reportRepo.findById(itemId);
    if (!report) throw new NotFoundError(`ItemReport "${itemId}" not found`);
    return await this._claimRepo.findByItemId(itemId);
  }

  async getClaimsByUser(claimantId) {
    const user = await this._userRepo.findById(claimantId);
    if (!user) throw new NotFoundError(`User "${claimantId}" not found`);
    return await this._claimRepo.findByClaimantId(claimantId);
  }

  async getClaimsByStatus(status) {
    const valid = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (!valid.includes(status.toUpperCase())) {
      throw new ValidationError(`Status must be one of: ${valid.join(', ')}`);
    }
    return await this._claimRepo.findByStatus(status.toUpperCase());
  }

  // ── Review (move to UNDER_REVIEW) ─────────────────────────────────────────

  /**
   * Admin moves a claim to UNDER_REVIEW status.
   * Business rule: only ADMIN can review claims.
   */
  async reviewClaim(claimId, adminId) {
    await this._assertAdmin(adminId);
    const claim = await this._claimRepo.findById(claimId);
    if (!claim) throw new NotFoundError(`Claim "${claimId}" not found`);
    if (claim.status !== 'PENDING') {
      throw new ConflictError(`Claim is already "${claim.status}" — can only review PENDING claims`);
    }
    return await this._claimRepo.save({ ...claim, status: 'UNDER_REVIEW' });
  }

  // ── Approve ────────────────────────────────────────────────────────────────

  /**
   * Admin approves a claim.
   * Business rule: when approved, ALL other claims on the same item are auto-rejected.
   * Business rule: the linked ItemReport is marked RESOLVED.
   */
  async approveClaim(claimId, adminId) {
    await this._assertAdmin(adminId);

    const claim = await this._claimRepo.findById(claimId);
    if (!claim) throw new NotFoundError(`Claim "${claimId}" not found`);
    if (!['PENDING', 'UNDER_REVIEW'].includes(claim.status)) {
      throw new ConflictError(`Cannot approve a claim with status "${claim.status}"`);
    }

    const now = new Date().toISOString();

    // Approve this claim
    const approved = await this._claimRepo.save({ ...claim, status: 'APPROVED', resolvedAt: now });

    // Auto-reject all other claims on the same item
    const others = (await this._claimRepo.findByItemId(claim.itemId)).filter(c => c.claimId !== claimId);
    for (const c of others) {
      // eslint-disable-next-line no-await-in-loop
      await this._claimRepo.save({
        ...c,
        status: 'REJECTED',
        rejectionReason: 'Another claim was approved for this item',
        resolvedAt: now,
      });
      // eslint-disable-next-line no-await-in-loop
      await this._notify(c.claimantId, 'Your claim was not successful — another claimant was approved', 'CLAIM_REJECTED');
    }

    // Mark the ItemReport as RESOLVED
    const report = await this._reportRepo.findById(claim.itemId);
    if (report) {
      // eslint-disable-next-line no-await-in-loop
      await this._reportRepo.save({ ...report, status: 'RESOLVED', lastActivityAt: now });
    }

    // Notify the successful claimant
    await this._notify(claim.claimantId, `Your claim has been APPROVED! Please collect the item from Campus Security.`, 'CLAIM_APPROVED');

    return approved;
  }

  // ── Reject ────────────────────────────────────────────────────────────────

  /**
   * Admin rejects a claim.
   * Business rule: rejectionReason is mandatory.
   */
  async rejectClaim(claimId, adminId, rejectionReason) {
    await this._assertAdmin(adminId);

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      throw new ValidationError('A rejection reason of at least 5 characters is required');
    }

    const claim = await this._claimRepo.findById(claimId);
    if (!claim) throw new NotFoundError(`Claim "${claimId}" not found`);
    if (!['PENDING', 'UNDER_REVIEW'].includes(claim.status)) {
      throw new ConflictError(`Cannot reject a claim with status "${claim.status}"`);
    }

    const rejected = await this._claimRepo.save({
      ...claim,
      status:          'REJECTED',
      rejectionReason: rejectionReason.trim(),
      resolvedAt:      new Date().toISOString(),
    });

    await this._notify(claim.claimantId, `Your claim was rejected. Reason: ${rejectionReason.trim()}`, 'CLAIM_REJECTED');

    return rejected;
  }

  // ── Cancel (claimant only) ────────────────────────────────────────────────

  async cancelClaim(claimId, claimantId) {
    const claim = await this._claimRepo.findById(claimId);
    if (!claim) throw new NotFoundError(`Claim "${claimId}" not found`);
    if (claim.claimantId !== claimantId) {
      throw new ForbiddenError('You can only cancel your own claim');
    }
    if (!['PENDING', 'UNDER_REVIEW'].includes(claim.status)) {
      throw new ConflictError(`Cannot cancel a claim with status "${claim.status}"`);
    }
    await this._claimRepo.delete(claimId);
    return { message: `Claim "${claimId}" cancelled successfully` };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  async _assertAdmin(userId) {
    const user = await this._userRepo.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenError('Only an ADMIN can perform this action');
    }
  }

  async _notify(userId, message, type) {
    if (!this._notifRepo) return;
    await this._notifRepo.save({
      notificationId: uuidv4(),
      userId,
      message,
      type,
      isRead:         false,
      deliveryStatus: 'QUEUED',
      retryCount:     0,
      createdAt:      new Date().toISOString(),
    });
  }
}

module.exports = { ClaimService };