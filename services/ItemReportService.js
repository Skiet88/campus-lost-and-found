'use strict';

/**
 * ItemReportService.js — Business Logic for ItemReport Entity
 *
 * Enforces ALL business rules from DOMAIN_MODEL.md:
 *   - Required fields: title, description, location, dateLostFound
 *   - RESOLVED reports cannot receive new claims
 *   - Only ADMIN can mark a report RESOLVED
 *   - Reports ACTIVE for 30 days with no activity are auto-expired
 *   - Type must be LOST or FOUND
 *   - Status transitions follow the state diagram
 *
 * Relates to: FR-03, FR-04, UC-03, US-003, US-004, T-009, T-010
 */

const { v4: uuidv4 } = require('uuid');
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require('../api/errors');

const VALID_TYPES      = ['LOST', 'FOUND'];
const VALID_STATUSES   = ['ACTIVE', 'RESOLVED', 'EXPIRED'];
const VALID_CATEGORIES = ['BAGS', 'ELECTRONICS', 'ID DOCUMENTS', 'CLOTHING', 'KEYS', 'BOOKS', 'JEWELLERY', 'OTHER'];
const EXPIRY_DAYS      = 30;

class ItemReportService {
  /**
   * @param {import('../repositories/interfaces/EntityRepositories').ItemReportRepository} reportRepo
   * @param {import('../repositories/interfaces/EntityRepositories').UserRepository} userRepo
   * @param {import('../repositories/interfaces/EntityRepositories').AdminCaseRepository} [caseRepo]
   */
  constructor(reportRepo, userRepo, caseRepo = null) {
    if (!reportRepo) throw new Error('ItemReportService requires an ItemReportRepository');
    if (!userRepo)   throw new Error('ItemReportService requires a UserRepository');
    this._reportRepo = reportRepo;
    this._userRepo   = userRepo;
    this._caseRepo   = caseRepo;
  }

  // ── Submit Report ────────────────────────────────────────────────────────

  /**
   * Submits a new lost or found item report.
   * Business rules: all required fields must be present; type must be valid.
   * Side effect: automatically opens an AdminCase if AdminCaseRepository is provided.
   *
   * @param {{ userId, type, title, description, category, location, dateLostFound, imageUrl? }} dto
   * @returns {object} created report
   */
  async submitReport({ userId, type, title, description, category, location, dateLostFound, imageUrl }) {
    // Validate submitting user exists
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError(`User "${userId}" not found`);

    // Validate required fields
    if (!title || title.trim().length < 3) {
      throw new ValidationError('Title is required and must be at least 3 characters');
    }
    if (!description || description.trim().length < 10) {
      throw new ValidationError('Description is required and must be at least 10 characters');
    }
    if (!location || location.trim().length < 3) {
      throw new ValidationError('Location is required');
    }
    if (!dateLostFound) {
      throw new ValidationError('Date lost/found is required');
    }
    if (!type || !VALID_TYPES.includes(type.toUpperCase())) {
      throw new ValidationError(`Type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (category && !VALID_CATEGORIES.includes(category.toUpperCase())) {
      throw new ValidationError(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Validate date is not in the future
    if (new Date(dateLostFound) > new Date()) {
      throw new ValidationError('Date lost/found cannot be in the future');
    }

    const now = new Date().toISOString();
    const report = {
      itemId:        uuidv4(),
      userId,
      type:          type.toUpperCase(),
      title:         title.trim(),
      description:   description.trim(),
      category:      category ? category.toUpperCase() : 'OTHER',
      location:      location.trim(),
      dateLostFound,
      imageUrl:      imageUrl || null,
      status:        'ACTIVE',
      createdAt:     now,
      lastActivityAt: now,
    };

    const saved = await this._reportRepo.save(report);

    // Auto-create AdminCase (DOMAIN_MODEL business rule)
    if (this._caseRepo) {
      await this._caseRepo.save({
        caseId:    uuidv4(),
        itemId:    saved.itemId,
        adminId:   null,
        status:    'OPEN',
        openedAt:  now,
        resolvedAt: null,
        notes:     '',
      });
    }

    return saved;
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  async getAllReports() {
    await this._expireStaleReports();
    return await this._reportRepo.findAll();
  }

  async getReportById(itemId) {
    const report = await this._reportRepo.findById(itemId);
    if (!report) throw new NotFoundError(`ItemReport "${itemId}" not found`);
    await this._checkExpiry(report);
    return await this._reportRepo.findById(itemId); // re-fetch in case status changed
  }

  async getReportsByUser(userId) {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError(`User "${userId}" not found`);
    return await this._reportRepo.findByUserId(userId);
  }

  async getReportsByStatus(status) {
    if (!VALID_STATUSES.includes(status.toUpperCase())) {
      throw new ValidationError(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    return await this._reportRepo.findByStatus(status.toUpperCase());
  }

  async getReportsByType(type) {
    if (!VALID_TYPES.includes(type.toUpperCase())) {
      throw new ValidationError(`Type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    return await this._reportRepo.findByType(type.toUpperCase());
  }

  async getReportsByCategory(category) {
    if (!VALID_CATEGORIES.includes(category.toUpperCase())) {
      throw new ValidationError(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    return await this._reportRepo.findByCategory(category.toUpperCase());
  }

  /**
   * Filters reports based on query parameters.
   * Implements single-filter logic (status OR type OR category, not AND).
   *
   * @param {object} query - { status?, type?, category? }
   * @returns {array} filtered reports
   */
  async getReportsByQuery(query = {}) {
    await this._expireStaleReports();
    const { status, type, category } = query;

    if (status)   return await this.getReportsByStatus(status);
    if (type)     return await this.getReportsByType(type);
    if (category) return await this.getReportsByCategory(category);
    return await this.getAllReports();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * Updates an item report.
   * Business rule: only the original submitter can update their report.
   * Business rule: RESOLVED and EXPIRED reports cannot be updated.
   */
  async updateReport(itemId, requestingUserId, updates) {
    const report = await this._reportRepo.findById(itemId);
    if (!report) throw new NotFoundError(`ItemReport "${itemId}" not found`);

    if (report.userId !== requestingUserId) {
      throw new ForbiddenError('Only the original submitter can update this report');
    }
    if (report.status !== 'ACTIVE') {
      throw new ConflictError(`Cannot update a report with status "${report.status}"`);
    }

    const updated = await this._reportRepo.save({
      ...report,
      title:          updates.title       ? updates.title.trim()       : report.title,
      description:    updates.description ? updates.description.trim() : report.description,
      location:       updates.location    ? updates.location.trim()    : report.location,
      category:       updates.category    ? updates.category.toUpperCase() : report.category,
      imageUrl:       updates.imageUrl    !== undefined ? updates.imageUrl : report.imageUrl,
      lastActivityAt: new Date().toISOString(),
    });

    return updated;
  }

  // ── Resolve (Admin only) ──────────────────────────────────────────────────

  /**
   * Marks a report as RESOLVED.
   * Business rule: only ADMIN can resolve a report.
   */
  async markAsResolved(itemId, requestingUserId) {
    const admin = await this._userRepo.findById(requestingUserId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenError('Only an ADMIN can mark a report as resolved');
    }

    const report = await this._reportRepo.findById(itemId);
    if (!report) throw new NotFoundError(`ItemReport "${itemId}" not found`);
    if (report.status === 'RESOLVED') throw new ConflictError('Report is already resolved');
    if (report.status === 'EXPIRED')  throw new ConflictError('Cannot resolve an expired report');

    return await this._reportRepo.save({ ...report, status: 'RESOLVED', lastActivityAt: new Date().toISOString() });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async deleteReport(itemId, requestingUserId) {
    const report = await this._reportRepo.findById(itemId);
    if (!report) throw new NotFoundError(`ItemReport "${itemId}" not found`);

    const requester = await this._userRepo.findById(requestingUserId);
    const isAdmin   = requester && requester.role === 'ADMIN';
    if (report.userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You do not have permission to delete this report');
    }

    await this._reportRepo.delete(itemId);
    return { message: `ItemReport "${itemId}" deleted successfully` };
  }

  // ── Auto-Expiry ───────────────────────────────────────────────────────────

  /** Checks a single report for expiry and updates it if stale. */
  async _checkExpiry(report) {
    if (report.status !== 'ACTIVE') return;
    const daysSinceActivity = (Date.now() - new Date(report.lastActivityAt || report.createdAt)) / 86400000;
    if (daysSinceActivity >= EXPIRY_DAYS) {
      await this._reportRepo.save({ ...report, status: 'EXPIRED' });
    }
  }

  /** Scans all ACTIVE reports and expires stale ones. */
  async _expireStaleReports() {
    const active = await this._reportRepo.findByStatus('ACTIVE');
    for (const r of active) {
      // ensure sequential to avoid race-conditions on the in-memory repo
      // (database-backed repo may also benefit from sequential updates)
      // eslint-disable-next-line no-await-in-loop
      await this._checkExpiry(r);
    }
  }

  /** Public expiry trigger for background workers */
  async expireStaleReports() {
    await this._expireStaleReports();
  }
}

module.exports = { ItemReportService };