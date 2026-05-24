'use strict';

/**
 * InMemoryItemReportRepository.js — In-Memory Implementation
 *
 * Stores ItemReport objects in a Map keyed by itemId.
 *
 * Relates to: T-009 (report submission), T-010 (React form), DOMAIN_MODEL.md
 */

const { ItemReportRepository } = require('../interfaces/EntityRepositories');

class InMemoryItemReportRepository extends ItemReportRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} HashMap storage */
    this._storage = new Map();
  }

  // ── Generic CRUD ─────────────────────────────────────────────────────

  save(report) {
    if (!report || !report.itemId) {
      throw new Error('InMemoryItemReportRepository.save(): entity must have an itemId');
    }
    this._storage.set(report.itemId, { ...report });
    return { ...report };
  }

  findById(id) {
    const report = this._storage.get(id);
    return report ? { ...report } : null;
  }

  findAll() {
    return [...this._storage.values()].map(r => ({ ...r }));
  }

  delete(id) {
    return this._storage.delete(id);
  }

  count() {
    return this._storage.size;
  }

  // ── Domain-Specific Queries ──────────────────────────────────────────

  findByUserId(userId) {
    return [...this._storage.values()]
      .filter(r => r.userId === userId)
      .map(r => ({ ...r }));
  }

  findByStatus(status) {
    return [...this._storage.values()]
      .filter(r => r.status === status)
      .map(r => ({ ...r }));
  }

  findByType(type) {
    return [...this._storage.values()]
      .filter(r => r.type === type)
      .map(r => ({ ...r }));
  }

  findByCategory(category) {
    return [...this._storage.values()]
      .filter(r => r.category === category)
      .map(r => ({ ...r }));
  }

  // ── Test Helper ──────────────────────────────────────────────────────

  _clear() {
    this._storage.clear();
  }
}

module.exports = InMemoryItemReportRepository;
