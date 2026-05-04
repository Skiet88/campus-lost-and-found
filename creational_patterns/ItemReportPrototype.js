'use strict';

/**
 * ItemReportPrototype.js — Prototype Pattern
 *
 * Maintains a cache of pre-configured ItemReport templates.
 * Cloning avoids re-validating and re-constructing common report shapes.
 *
 * CLAFS Use Case:
 *   Campus Security often re-reports the same categories of items
 *   (e.g. "Student ID Card found at Library Reception").
 *   Instead of filling the full form every time, a template is cloned
 *   and only the unique fields (userId, date) are updated.
 *   Relates to: T-009, T-010 (report submission speed improvement)
 *
 * Pattern: Prototype — clone() method on a wrapper, cache of named templates.
 */

const ItemReport = require('../src/ItemReport');

// ── Prototype Wrapper ─────────────────────────────────────────────────────

class ItemReportPrototype {
  /**
   * @param {ItemReport} report
   */
  constructor(report) {
    if (!(report instanceof ItemReport)) {
      throw new Error('ItemReportPrototype requires an ItemReport instance');
    }
    this._report = report;
  }

  /**
   * Returns a deep clone of the wrapped ItemReport with a fresh itemId and timestamps.
   * Optionally override specific fields in the clone.
   *
   * @param {{ userId?: string, title?: string, description?: string,
   *           location?: string, dateLostFound?: Date, imageUrl?: string }} overrides
   * @returns {ItemReport}
   */
  clone(overrides = {}) {
    const base = this._report;
    return new ItemReport(
      overrides.userId        || base.userId,
      base.type,
      overrides.title         || base.title,
      overrides.description   || base.description,
      base.category,
      overrides.location      || base.location,
      overrides.dateLostFound || base.dateLostFound,
      overrides.imageUrl      !== undefined ? overrides.imageUrl : base.imageUrl
    );
  }

  get report() { return this._report; }
}

// ── Cache ─────────────────────────────────────────────────────────────────

class ItemReportCache {
  constructor() {
    this._cache = new Map();
  }

  /**
   * Registers a template under a key.
   * @param {string} key
   * @param {ItemReport} report
   */
  register(key, report) {
    this._cache.set(key, new ItemReportPrototype(report));
  }

  /**
   * Clones a registered template.
   * @param {string} key
   * @param {object} overrides
   * @returns {ItemReport}
   */
  clone(key, overrides = {}) {
    const proto = this._cache.get(key);
    if (!proto) throw new Error(`No prototype registered for key: "${key}"`);
    return proto.clone(overrides);
  }

  /**
   * Returns the list of registered template keys.
   * @returns {string[]}
   */
  listTemplates() {
    return [...this._cache.keys()];
  }
}

// ── Pre-loaded templates ──────────────────────────────────────────────────

function buildDefaultCache(defaultAdminId = 'system') {
  const cache = new ItemReportCache();

  cache.register(
    'student-id-found',
    new ItemReport(
      defaultAdminId,
      'FOUND',
      'Student ID Card Found',
      'A student ID card was found on campus. Please claim at the Security Office.',
      'ID DOCUMENTS',
      'Security Office Reception',
      new Date()
    )
  );

  cache.register(
    'laptop-lost',
    new ItemReport(
      defaultAdminId,
      'LOST',
      'Laptop Lost on Campus',
      'A laptop has been reported lost. Please provide serial number as proof of ownership.',
      'ELECTRONICS',
      'Unknown',
      new Date()
    )
  );

  cache.register(
    'keys-found',
    new ItemReport(
      defaultAdminId,
      'FOUND',
      'Set of Keys Found',
      'A set of keys was found on campus. Claim at the Security Office with description.',
      'KEYS',
      'Security Office Reception',
      new Date()
    )
  );

  return cache;
}

module.exports = { ItemReportPrototype, ItemReportCache, buildDefaultCache };