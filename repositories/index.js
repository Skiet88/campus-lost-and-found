'use strict';

/**
 * repositories/index.js — In-Memory Repository Implementations
 *
 * Provides concrete, in-memory implementations of all five repositories
 * required by the CLAFS service layer (Assignment 11 pattern).
 *
 * Each repository uses a plain Map as its backing store. Data is reset
 * whenever the process restarts — suitable for development and testing.
 *
 * Repositories exported:
 *   UserRepository
 *   ItemReportRepository
 *   ClaimRepository
 *   NotificationRepository
 *   AdminCaseRepository
 */

// ── Base Repository ────────────────────────────────────────────────────────

/**
 * Generic in-memory repository with a string primary key.
 * Subclasses override _pk() to return the field used as the key.
 */
class InMemoryRepository {
  constructor() {
    this._store = new Map();
  }

  /** @returns {string} primary-key field name */
  _pk() { return 'id'; }

  /**
   * Persist (insert or update) an entity.
   * @param {object} entity
   * @returns {object} the saved entity (same reference)
   */
  save(entity) {
    const key = entity[this._pk()];
    if (!key) throw new Error(`Entity missing primary key "${this._pk()}"`);
    this._store.set(key, { ...entity });
    return this._store.get(key);
  }

  /**
   * Find by primary key.
   * @param {string} id
   * @returns {object|null}
   */
  findById(id) {
    return this._store.get(id) || null;
  }

  /** @returns {object[]} all stored entities */
  findAll() {
    return Array.from(this._store.values());
  }

  /**
   * Delete by primary key.
   * @param {string} id
   */
  delete(id) {
    this._store.delete(id);
  }

  /** Wipe all data (useful between tests). */
  clear() {
    this._store.clear();
  }
}

// ══════════════════════════════════════════════════════════════════════════
// USER REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class UserRepository extends InMemoryRepository {
  _pk() { return 'userId'; }

  /**
   * Find a user by email (case-insensitive).
   * @param {string} email
   * @returns {object|null}
   */
  findByEmail(email) {
    const normalised = email.trim().toLowerCase();
    for (const user of this._store.values()) {
      if (user.email === normalised) return user;
    }
    return null;
  }

  /**
   * Find all users with a given role.
   * @param {string} role  STUDENT | LECTURER | ADMIN
   * @returns {object[]}
   */
  findByRole(role) {
    return this.findAll().filter(u => u.role === role.toUpperCase());
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ITEM REPORT REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class ItemReportRepository extends InMemoryRepository {
  _pk() { return 'itemId'; }

  /** @param {string} userId */
  findByUserId(userId) {
    return this.findAll().filter(r => r.userId === userId);
  }

  /** @param {string} status  ACTIVE | RESOLVED | EXPIRED */
  findByStatus(status) {
    return this.findAll().filter(r => r.status === status.toUpperCase());
  }

  /** @param {string} type  LOST | FOUND */
  findByType(type) {
    return this.findAll().filter(r => r.type === type.toUpperCase());
  }

  /** @param {string} category  e.g. BAGS, ELECTRONICS */
  findByCategory(category) {
    return this.findAll().filter(r => r.category === category.toUpperCase());
  }
}

// ══════════════════════════════════════════════════════════════════════════
// CLAIM REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class ClaimRepository extends InMemoryRepository {
  _pk() { return 'claimId'; }

  /** @param {string} itemId */
  findByItemId(itemId) {
    return this.findAll().filter(c => c.itemId === itemId);
  }

  /** @param {string} claimantId */
  findByClaimantId(claimantId) {
    return this.findAll().filter(c => c.claimantId === claimantId);
  }

  /** @param {string} status  PENDING | UNDER_REVIEW | APPROVED | REJECTED */
  findByStatus(status) {
    return this.findAll().filter(c => c.status === status.toUpperCase());
  }

  /**
   * Business rule: one claim per user per item.
   * @param {string} claimantId
   * @param {string} itemId
   * @returns {boolean}
   */
  existsByClaimantAndItem(claimantId, itemId) {
    return this.findAll().some(c => c.claimantId === claimantId && c.itemId === itemId);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATION REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class NotificationRepository extends InMemoryRepository {
  _pk() { return 'notificationId'; }

  /** @param {string} userId */
  findByUserId(userId) {
    return this.findAll().filter(n => n.userId === userId);
  }

  /** @param {string} userId */
  findUnreadByUserId(userId) {
    return this.findAll().filter(n => n.userId === userId && !n.isRead);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN CASE REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class AdminCaseRepository extends InMemoryRepository {
  _pk() { return 'caseId'; }

  /**
   * Find the AdminCase linked to a specific ItemReport.
   * @param {string} itemId
   * @returns {object|null}
   */
  findByItemId(itemId) {
    return this.findAll().find(c => c.itemId === itemId) || null;
  }

  /** @param {string} status  OPEN | IN_PROGRESS | CLOSED */
  findByStatus(status) {
    return this.findAll().filter(c => c.status === status.toUpperCase());
  }
}

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  UserRepository,
  ItemReportRepository,
  ClaimRepository,
  NotificationRepository,
  AdminCaseRepository,
};