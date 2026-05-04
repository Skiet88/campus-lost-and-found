'use strict';

/**
 * Admin.js
 * Extends User with admin-specific capabilities.
 * Only Admin users can approve/reject claims and manage cases.
 * Relates to: CLASS_DIAGRAM.md inheritance, FR-02, US-007
 */

const User = require('./User');

class Admin extends User {
  /**
   * @param {string} name
   * @param {string} email
   * @param {string} plainPassword
   */
  constructor(name, email, plainPassword) {
    super(name, email, plainPassword, 'ADMIN');
    this._adminId = this._userId; // alias
    this._managedCases = [];
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get adminId() { return this._adminId; }
  get managedCases() { return [...this._managedCases]; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Returns all item reports (in a real system, queried from DB).
   * Placeholder for controller integration.
   */
  manageItemReports() {
    return { adminId: this._adminId, action: 'MANAGE_ITEM_REPORTS' };
  }

  /**
   * Returns all claims for review.
   */
  manageClaims() {
    return { adminId: this._adminId, action: 'MANAGE_CLAIMS' };
  }

  /**
   * Returns dashboard summary data (stub for controller).
   */
  viewDashboard() {
    return {
      adminId: this._adminId,
      action: 'VIEW_DASHBOARD',
      managedCasesCount: this._managedCases.length,
    };
  }

  /**
   * Exports a report summary (stub — real impl generates CSV/PDF).
   * @param {'CSV'|'PDF'} format
   */
  exportReport(format = 'CSV') {
    if (!['CSV', 'PDF'].includes(format)) {
      throw new Error(`Unsupported export format: ${format}`);
    }
    return { adminId: this._adminId, format, exportedAt: new Date() };
  }

  /**
   * Tracks a case this admin is managing.
   * @param {string} caseId
   */
  trackCase(caseId) {
    if (!this._managedCases.includes(caseId)) {
      this._managedCases.push(caseId);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      adminId: this._adminId,
      managedCasesCount: this._managedCases.length,
    };
  }
}

module.exports = Admin;