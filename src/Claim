'use strict';

/**
 * Claim.js
 * Represents a claim submitted by a user for a found item.
 * Business rules:
 *   - proofDescription must be >= 30 characters
 *   - A user cannot submit more than one claim per ItemReport (enforced at service layer)
 *   - Only ADMIN can approve/reject
 *   - Rejection requires a reason
 * Relates to: UC-05, US-007, STATE_DIAGRAMS.md
 */

const { v4: uuidv4 } = require('uuid');

const VALID_STATUSES = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
const MIN_PROOF_LENGTH = 30;

class Claim {
  /**
   * @param {string} itemId
   * @param {string} claimantId
   * @param {string} proofDescription
   */
  constructor(itemId, claimantId, proofDescription) {
    if (!itemId) throw new Error('itemId is required');
    if (!claimantId) throw new Error('claimantId is required');
    if (!proofDescription || proofDescription.trim().length < MIN_PROOF_LENGTH) {
      throw new Error(`proofDescription must be at least ${MIN_PROOF_LENGTH} characters`);
    }

    this._claimId = uuidv4();
    this._itemId = itemId;
    this._claimantId = claimantId;
    this._proofDescription = proofDescription.trim();
    this._status = 'PENDING';
    this._rejectionReason = null;
    this._createdAt = new Date();
    this._resolvedAt = null;
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get claimId() { return this._claimId; }
  get itemId() { return this._itemId; }
  get claimantId() { return this._claimantId; }
  get proofDescription() { return this._proofDescription; }
  get status() { return this._status; }
  get rejectionReason() { return this._rejectionReason; }
  get createdAt() { return this._createdAt; }
  get resolvedAt() { return this._resolvedAt; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Submits the claim (moves to PENDING, already set in constructor).
   */
  submitClaim() {
    if (this._status !== 'PENDING') {
      throw new Error('Claim already submitted');
    }
    return this.toJSON();
  }

  /**
   * Moves claim to UNDER_REVIEW (admin picks it up).
   */
  startReview() {
    if (this._status !== 'PENDING') {
      throw new Error('Only PENDING claims can be moved to UNDER_REVIEW');
    }
    this._status = 'UNDER_REVIEW';
  }

  /**
   * Approves the claim. Only ADMIN should call this (enforced at controller).
   */
  approveClaim() {
    if (!['PENDING', 'UNDER_REVIEW'].includes(this._status)) {
      throw new Error(`Cannot approve a claim with status: ${this._status}`);
    }
    this._status = 'APPROVED';
    this._resolvedAt = new Date();
  }

  /**
   * Rejects the claim with a mandatory reason.
   * @param {string} reason
   */
  rejectClaim(reason) {
    if (!reason || reason.trim() === '') {
      throw new Error('A rejection reason is required');
    }
    if (!['PENDING', 'UNDER_REVIEW'].includes(this._status)) {
      throw new Error(`Cannot reject a claim with status: ${this._status}`);
    }
    this._status = 'REJECTED';
    this._rejectionReason = reason.trim();
    this._resolvedAt = new Date();
  }

  /**
   * Allows claimant to cancel their own pending claim.
   */
  cancelClaim() {
    if (this._status !== 'PENDING') {
      throw new Error('Only PENDING claims can be cancelled');
    }
    this._status = 'REJECTED';
    this._rejectionReason = 'Cancelled by claimant';
    this._resolvedAt = new Date();
  }

  toJSON() {
    return {
      claimId: this._claimId,
      itemId: this._itemId,
      claimantId: this._claimantId,
      proofDescription: this._proofDescription,
      status: this._status,
      rejectionReason: this._rejectionReason,
      createdAt: this._createdAt,
      resolvedAt: this._resolvedAt,
    };
  }
}

module.exports = Claim;
