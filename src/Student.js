'use strict';

/**
 * Student.js
 * Extends User with student-specific attributes and methods.
 * Relates to: CLASS_DIAGRAM.md inheritance, US-001, US-002
 */

const User = require('./User');
const RepositoryFactory = require('../factories/RepositoryFactory');

function createRepositoryBundle(repositories = {}) {
  return {
    itemReportRepository: repositories.itemReportRepository || RepositoryFactory.getItemReportRepository('MEMORY'),
    claimRepository: repositories.claimRepository || RepositoryFactory.getClaimRepository('MEMORY'),
  };
}

class Student extends User {
  /**
   * @param {string} name
   * @param {string} email
   * @param {string} plainPassword
   * @param {string} studentNumber  e.g. "219012345"
   */
  constructor(name, email, plainPassword, studentNumber, repositories = null) {
    super(name, email, plainPassword, 'STUDENT');
    if (!studentNumber) throw new Error('studentNumber is required for Student');
    this._studentId = this._userId;
    this._studentNumber = studentNumber;
    this._reportedItems = [];
    this._submittedClaims = [];
    this._repositories = createRepositoryBundle(repositories || {});
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
    this._repositories.itemReportRepository.save({
      itemId,
      userId: this._studentId,
      type: 'LOST',
      title: 'Student reported lost item',
      description: 'Recorded from student quick-action workflow',
      category: 'GENERAL',
      status: 'ACTIVE',
    });
  }

  /**
   * Records a found item report ID for this student.
   * @param {string} itemId
   */
  reportFoundItem(itemId) {
    if (!itemId) throw new Error('itemId is required');
    this._reportedItems.push({ itemId, type: 'FOUND', reportedAt: new Date() });
    this._repositories.itemReportRepository.save({
      itemId,
      userId: this._studentId,
      type: 'FOUND',
      title: 'Student reported found item',
      description: 'Recorded from student quick-action workflow',
      category: 'GENERAL',
      status: 'ACTIVE',
    });
  }

  /**
   * Records a claim submission for this student.
   * @param {string} claimId
   */
  submitClaim(claimId) {
    if (!claimId) throw new Error('claimId is required');
    this._submittedClaims.push({ claimId, submittedAt: new Date() });
    const claim = this._repositories.claimRepository.findById(claimId);
    if (claim) {
      this._repositories.claimRepository.save(claim);
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
