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

  async save(report) {
    if (!report || !report.itemId) {
      throw new Error('InMemoryItemReportRepository.save(): entity must have an itemId');
    }
    this._storage.set(report.itemId, { ...report });
    return { ...report };
  }

  async findById(id) {
    const report = this._storage.get(id);
    return report ? { ...report } : null;
  }

  async findAll() {
    return [...this._storage.values()].map(r => ({ ...r }));
  }

  async delete(id) {
    return this._storage.delete(id);
  }

  async count() {
    return this._storage.size;
  }

  // ── Domain-Specific Queries ──────────────────────────────────────────

  async findByUserId(userId) {
    return [...this._storage.values()]
      .filter(r => r.userId === userId)
      .map(r => ({ ...r }));
  }

  async findByStatus(status) {
    return [...this._storage.values()]
      .filter(r => r.status === status)
      .map(r => ({ ...r }));
  }

  async findByType(type) {
    return [...this._storage.values()]
      .filter(r => r.type === type)
      .map(r => ({ ...r }));
  }

  async findByCategory(category) {
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
