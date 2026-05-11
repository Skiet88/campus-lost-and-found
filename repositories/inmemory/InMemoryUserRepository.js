'use strict';

/**
 * InMemoryUserRepository.js — In-Memory Implementation
 *
 * Stores User objects in a JavaScript Map (equivalent to a HashMap).
 * Keyed by userId.
 *
 * Used during development and unit tests. Swap for DatabaseUserRepository
 * via RepositoryFactory when connecting to PostgreSQL.
 *
 * Relates to: T-002 (POST /auth/register), US-001, DOMAIN_MODEL.md
 */

const { UserRepository } = require('../interfaces/EntityRepositories');

class InMemoryUserRepository extends UserRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} HashMap storage */
    this._storage = new Map();
  }

  // ── Generic CRUD ─────────────────────────────────────────────────────

  save(user) {
    if (!user || !user.userId) {
      throw new Error('InMemoryUserRepository.save(): entity must have a userId');
    }
    this._storage.set(user.userId, { ...user }); // shallow clone prevents mutation
    return { ...user };
  }

  findById(id) {
    const user = this._storage.get(id);
    return user ? { ...user } : null;
  }

  findAll() {
    return [...this._storage.values()].map(u => ({ ...u }));
  }

  delete(id) {
    return this._storage.delete(id);
  }

  count() {
    return this._storage.size;
  }

  // ── Domain-Specific Queries ──────────────────────────────────────────

  findByEmail(email) {
    for (const user of this._storage.values()) {
      if (user.email === email) return { ...user };
    }
    return null;
  }

  findByRole(role) {
    return [...this._storage.values()]
      .filter(u => u.role === role)
      .map(u => ({ ...u }));
  }

  findVerified() {
    return [...this._storage.values()]
      .filter(u => u.isVerified === true)
      .map(u => ({ ...u }));
  }

  // ── Test Helper ──────────────────────────────────────────────────────

  /** Clears all data — test use only, never call in production. */
  _clear() {
    this._storage.clear();
  }
}

module.exports = InMemoryUserRepository;
