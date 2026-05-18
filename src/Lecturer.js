'use strict';

/**
 * Lecturer.js
 * Extends User with lecturer-specific attributes.
 * Relates to: CLASS_DIAGRAM.md inheritance, US-002
 */

const User = require('./User');

class Lecturer extends User {
  /**
   * @param {string} name
   * @param {string} email
   * @param {string} plainPassword
   * @param {string} department  e.g. "Computer Science"
   * @param {object} [repositories] Optional repositories object { itemReportRepository, claimRepository }
   *                                If not provided, repository-based methods will be no-ops
   */
  constructor(name, email, plainPassword, department, repositories = null) {
    super(name, email, plainPassword, 'LECTURER');
    if (!department) throw new Error('department is required for Lecturer');
    this._lecturerId = this._userId;
    this._department = department;
    this._reportedItems = [];
    this._submittedClaims = [];
    this._repositories = repositories || {};
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get lecturerId() { return this._lecturerId; }
  get department() { return this._department; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * @param {string} itemId
   */
  reportLostItem(itemId) {
    if (!itemId) throw new Error('itemId is required');
    this._reportedItems.push({ itemId, type: 'LOST', reportedAt: new Date() });
    // Only persist if repository is available
    if (this._repositories.itemReportRepository) {
      const r = this._repositories.itemReportRepository;
      if (typeof r.save === 'function') r.save({
        itemId,
        userId: this._lecturerId,
        type: 'LOST',
        title: 'Lecturer reported lost item',
        description: 'Recorded from lecturer quick-action workflow',
        category: 'GENERAL',
        status: 'ACTIVE',
      });
    }
  }

  /**
   * @param {string} itemId
   */
  reportFoundItem(itemId) {
    if (!itemId) throw new Error('itemId is required');
    this._reportedItems.push({ itemId, type: 'FOUND', reportedAt: new Date() });
    // Only persist if repository is available
    if (this._repositories.itemReportRepository) {
      const r = this._repositories.itemReportRepository;
      if (typeof r.save === 'function') r.save({
        itemId,
        userId: this._lecturerId,
        type: 'FOUND',
        title: 'Lecturer reported found item',
        description: 'Recorded from lecturer quick-action workflow',
        category: 'GENERAL',
        status: 'ACTIVE',
      });
    }
  }

  /**
   * @param {string} claimId
   */
  submitClaim(claimId) {
    if (!claimId) throw new Error('claimId is required');
    this._submittedClaims.push({ claimId, submittedAt: new Date() });
    // Only persist if repository is available
    if (this._repositories.claimRepository) {
      const c = this._repositories.claimRepository;
      const maybe = c.findById(claimId);
      if (maybe && typeof maybe.then === 'function') {
        maybe.then(claim => { if (claim) c.save(claim); }).catch(() => {});
      } else if (maybe) {
        c.save(maybe);
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      lecturerId: this._lecturerId,
      department: this._department,
    };
  }
}

module.exports = Lecturer;