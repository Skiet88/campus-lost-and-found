'use strict';

/**
 * ItemReportAbstractFactory.js — Abstract Factory Pattern
 *
 * Creates families of related objects for different report types.
 * A LostItemFactory produces a pre-configured ItemReport + AdminCase together.
 * A FoundItemFactory does the same but with FOUND defaults.
 * The caller never knows which concrete factory it's using.
 *
 * CLAFS Use Case:
 *   When a report is submitted, an AdminCase must always be created alongside
 *   it (business rule: AdminCase is auto-created on report submission).
 *   The Abstract Factory guarantees both objects are created consistently.
 *   Relates to: DOMAIN_MODEL.md, AdminCase business rule, T-009
 *
 * Pattern: Abstract Factory — two product hierarchies (ItemReport, AdminCase)
 *          created by concrete factories (LostItemFactory, FoundItemFactory).
 */

const ItemReport = require('../src/ItemReport');
const AdminCase = require('../src/AdminCase');

// ── Abstract Factory ──────────────────────────────────────────────────────

class ItemReportFactory {
  /**
   * @param {string} userId
   * @param {string} title
   * @param {string} description
   * @param {string} category
   * @param {string} location
   * @param {Date} dateLostFound
   * @param {string} adminId
   * @returns {{ report: ItemReport, adminCase: AdminCase }}
   */
  // eslint-disable-next-line no-unused-vars
  createReport(userId, title, description, category, location, dateLostFound, adminId) {
    throw new Error('createReport() must be implemented by subclass');
  }
}

// ── Concrete Factory A: Lost Item ─────────────────────────────────────────

class LostItemFactory extends ItemReportFactory {
  createReport(userId, title, description, category, location, dateLostFound, adminId) {
    const report = new ItemReport(
      userId, 'LOST', title, description, category, location, dateLostFound
    );
    const adminCase = new AdminCase(report.itemId, adminId);
    adminCase.openCase();
    return { report, adminCase };
  }
}

// ── Concrete Factory B: Found Item ────────────────────────────────────────

class FoundItemFactory extends ItemReportFactory {
  createReport(userId, title, description, category, location, dateLostFound, adminId) {
    const report = new ItemReport(
      userId, 'FOUND', title, description, category, location, dateLostFound
    );
    const adminCase = new AdminCase(report.itemId, adminId);
    adminCase.openCase();
    adminCase.addNote('Found item logged — awaiting claims');
    return { report, adminCase };
  }
}

module.exports = {
  ItemReportFactory,
  LostItemFactory,
  FoundItemFactory,
};