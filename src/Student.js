'use strict';

/**
 * Student.js
 * Extends User with student-specific attributes and methods.
 * Relates to: CLASS_DIAGRAM.md inheritance, US-001, US-002
 */

const User = require('./User');

class Student extends User {
  /**
   * @param {string} name
   * @param {string} email
   * @param {string} plainPassword
   * @param {string} studentNumber  e.g. "219012345"
   * @param {object} [repositories] Optional repositories object { itemReportRepository, claimRepository }
   *                                If not provided, repository-based methods will be no-ops
   */
  constructor(name, email, plainPassword, studentNumber, repositories = null) {
    super(name, email, plainPassword, 'STUDENT');
    if (!studentNumber) throw new Error('studentNumber is required for Student');
    this._studentId = this._userId;
    this._studentNumber = studentNumber;
    this._reportedItems = [];
    this._submittedClaims = [];
    this._repositories = repositories || {};
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get studentId() { return this._studentId; }
  get studentNumber() { return this._studentNumber; }
  get reportedItems() { return [...this._reportedItems]; }
  get submittedClaims() { return [...this._submittedClaims]; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Records a lost item report ID for this student.
   * @param {string} itemId
   */
  reportLostItem(itemId) {
    if (!itemId) throw new Error('itemId is required');
    this._reportedItems.push({ itemId, type: 'LOST', reportedAt: new Date() });
    // Only persist if repository is available
    if (this._repositories.itemReportRepository) {
      // Persist asynchronously if repository supports it
      const r = this._repositories.itemReportRepository;
      if (typeof r.save === 'function') r.save({
        itemId,
        userId: this._studentId,
        type: 'LOST',
        title: 'Student reported lost item',
        description: 'Recorded from student quick-action workflow',
        category: 'GENERAL',
        status: 'ACTIVE',
      });
    }
  }

  /**
   * Records a found item report ID for this student.
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
        userId: this._studentId,
        type: 'FOUND',
        title: 'Student reported found item',
        description: 'Recorded from student quick-action workflow',
        category: 'GENERAL',
        status: 'ACTIVE',
      });
    }
  }

  /**
   * Records a claim submission for this student.
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
        // Promise — handle async
        maybe.then(claim => { if (claim) c.save(claim); }).catch(() => {});
      } else if (maybe) {
        c.save(maybe);
      }
    }
  }

  /**
   * Returns a stub search result (real impl queries DB/API).
   * @param {string} query
   */
  searchItems(query) {
    if (!query || query.trim() === '') throw new Error('Search query cannot be empty');
    return { studentId: this._studentId, query, results: [] };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      studentId: this._studentId,
      studentNumber: this._studentNumber,
      reportedItemsCount: this._reportedItems.length,
      submittedClaimsCount: this._submittedClaims.length,
    };
  }
}

module.exports = Student;
