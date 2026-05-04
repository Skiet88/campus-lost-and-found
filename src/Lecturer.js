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
   */
  constructor(name, email, plainPassword, department) {
    super(name, email, plainPassword, 'LECTURER');
    if (!department) throw new Error('department is required for Lecturer');
    this._lecturerId = this._userId;
    this._department = department;
    this._reportedItems = [];
    this._submittedClaims = [];
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
  }

  /**
   * @param {string} itemId
   */
  reportFoundItem(itemId) {
    if (!itemId) throw new Error('itemId is required');
    this._reportedItems.push({ itemId, type: 'FOUND', reportedAt: new Date() });
  }

  /**
   * @param {string} claimId
   */
  submitClaim(claimId) {
    if (!claimId) throw new Error('claimId is required');
    this._submittedClaims.push({ claimId, submittedAt: new Date() });
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