'use strict';

/**
 * ItemReport.js
 * Core entity — represents a lost or found item report.
 * Business rules:
 *   - Must have title, description, location, dateLostFound
 *   - RESOLVED reports cannot receive new claims
 *   - Auto-expires after 30 days of inactivity (enforced via markAsExpired)
 *   - Only Admin can mark as RESOLVED
 * Relates to: T-009, US-003, US-004, STATE_DIAGRAMS.md
 */

const { v4: uuidv4 } = require('uuid');

const VALID_TYPES = ['LOST', 'FOUND'];
const VALID_STATUSES = ['ACTIVE', 'RESOLVED', 'EXPIRED'];
const EXPIRY_DAYS = 30;

class ItemReport {
  /**
   * @param {string} userId
   * @param {'LOST'|'FOUND'} type
   * @param {string} title
   * @param {string} description
   * @param {string} category
   * @param {string} location
   * @param {Date|string} dateLostFound
   * @param {string|null} imageUrl
   */
  constructor(userId, type, title, description, category, location, dateLostFound, imageUrl = null) {
    this._validateRequired({ userId, type, title, description, location, dateLostFound });

    if (!VALID_TYPES.includes(type)) throw new Error(`type must be LOST or FOUND`);

    this._itemId = uuidv4();
    this._userId = userId;
    this._type = type;
    this._title = title;
    this._description = description;
    this._category = category || 'GENERAL';
    this._location = location;
    this._dateLostFound = new Date(dateLostFound);
    this._imageUrl = imageUrl;
    this._status = 'ACTIVE';
    this._claims = [];
    this._createdAt = new Date();
    this._lastActivityAt = new Date();
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get itemId() { return this._itemId; }
  get userId() { return this._userId; }
  get type() { return this._type; }
  get title() { return this._title; }
  get description() { return this._description; }
  get category() { return this._category; }
  get location() { return this._location; }
  get dateLostFound() { return this._dateLostFound; }
  get imageUrl() { return this._imageUrl; }
  get status() { return this._status; }
  get createdAt() { return this._createdAt; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Submits the report (validates required fields again).
   */
  submitReport() {
    this._validateRequired({
      userId: this._userId,
      title: this._title,
      description: this._description,
      location: this._location,
      dateLostFound: this._dateLostFound,
    });
    this._lastActivityAt = new Date();
    return this.toJSON();
  }

  /**
   * Updates mutable fields on the report.
   * @param {{ title?: string, description?: string, category?: string, location?: string, imageUrl?: string }} updates
   */
  updateReport(updates = {}) {
    if (this._status !== 'ACTIVE') {
      throw new Error('Only ACTIVE reports can be updated');
    }
    const { title, description, category, location, imageUrl } = updates;
    if (title) this._title = title;
    if (description) this._description = description;
    if (category) this._category = category;
    if (location) this._location = location;
    if (imageUrl !== undefined) this._imageUrl = imageUrl;
    this._lastActivityAt = new Date();
  }

  /**
   * Soft-deletes the report by marking it expired.
   */
  deleteReport() {
    this._status = 'EXPIRED';
  }

  /**
   * Marks the report as RESOLVED. Only callable by Admin (enforced at controller layer).
   */
  markAsResolved() {
    if (this._status === 'RESOLVED') throw new Error('Already resolved');
    this._status = 'RESOLVED';
    this._lastActivityAt = new Date();
  }

  /**
   * Marks the report as EXPIRED (e.g. 30-day auto-expiry cron).
   */
  markAsExpired() {
    if (this._status === 'RESOLVED') throw new Error('Cannot expire a resolved report');
    this._status = 'EXPIRED';
  }

  /**
   * Checks if this report has been inactive for 30+ days.
   * @returns {boolean}
   */
  shouldExpire() {
    const now = new Date();
    const diffMs = now - this._lastActivityAt;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= EXPIRY_DAYS && this._status === 'ACTIVE';
  }

  /**
   * Returns matching items (stub — real impl queries DB).
   * @returns {Array}
   */
  findMatches() {
    return [];
  }

  /**
   * Registers a claim against this report.
   * @param {string} claimId
   */
  addClaim(claimId) {
    if (this._status !== 'ACTIVE') {
      throw new Error('Cannot add claim to a non-ACTIVE report');
    }
    if (this._claims.includes(claimId)) {
      throw new Error('Claim already registered');
    }
    this._claims.push(claimId);
    this._lastActivityAt = new Date();
  }

  get claimIds() { return [...this._claims]; }

  toJSON() {
    return {
      itemId: this._itemId,
      userId: this._userId,
      type: this._type,
      title: this._title,
      description: this._description,
      category: this._category,
      location: this._location,
      dateLostFound: this._dateLostFound,
      imageUrl: this._imageUrl,
      status: this._status,
      claimCount: this._claims.length,
      createdAt: this._createdAt,
    };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _validateRequired(fields) {
    for (const [key, val] of Object.entries(fields)) {
      if (val === null || val === undefined || val === '') {
        throw new Error(`${key} is required`);
      }
    }
  }
}

module.exports = ItemReport;
