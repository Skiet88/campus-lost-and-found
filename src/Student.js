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
   */
  constructor(name, email, plainPassword, studentNumber) {
    super(name, email, plainPassword, 'STUDENT');
    if (!studentNumber) throw new Error('studentNumber is required for Student');
    this._studentId = this._userId;
    this._studentNumber = studentNumber;
    this._reportedItems = [];
    this._submittedClaims = [];
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
  }

  /**
   * Records a found item report ID for this student.
   * @param {string} itemId
   */
  reportFoundItem(itemId) {
    if (!itemId) throw new Error('itemId is required');
    this._reportedItems.push({ itemId, type: 'FOUND', reportedAt: new Date() });
  }

  /**
   * Records a claim submission for this student.
   * @param {string} claimId
   */
  submitClaim(claimId) {
    if (!claimId) throw new Error('claimId is required');
    this._submittedClaims.push({ claimId, submittedAt: new Date() });
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
