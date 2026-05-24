'use strict';

/**
 * InMemoryOtherRepositories.js
 *
 * Contains in-memory HashMap implementations for:
 *   - InMemoryClaimRepository     (keyed by claimId)
 *   - InMemoryNotificationRepository (keyed by notificationId)
 *   - InMemoryAdminCaseRepository  (keyed by caseId)
 */

const {
  ClaimRepository,
  NotificationRepository,
  AdminCaseRepository,
} = require('../interfaces/EntityRepositories');

// ══════════════════════════════════════════════════════════════════════════
// CLAIM REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class InMemoryClaimRepository extends ClaimRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._storage = new Map();
  }

  // ── Generic CRUD ───────────────────────────────────────────────────────

  save(claim) {
    if (!claim || !claim.claimId) {
      throw new Error('InMemoryClaimRepository.save(): entity must have a claimId');
    }
    this._storage.set(claim.claimId, { ...claim });
    return { ...claim };
  }

  findById(id) {
    const claim = this._storage.get(id);
    return claim ? { ...claim } : null;
  }

  findAll() {
    return [...this._storage.values()].map(c => ({ ...c }));
  }

  delete(id) {
    return this._storage.delete(id);
  }

  count() {
    return this._storage.size;
  }

  // ── Domain-Specific Queries ────────────────────────────────────────────

  findByItemId(itemId) {
    return [...this._storage.values()]
      .filter(c => c.itemId === itemId)
      .map(c => ({ ...c }));
  }

  findByClaimantId(claimantId) {
    return [...this._storage.values()]
      .filter(c => c.claimantId === claimantId)
      .map(c => ({ ...c }));
  }

  findByStatus(status) {
    return [...this._storage.values()]
      .filter(c => c.status === status)
      .map(c => ({ ...c }));
  }

  /**
   * Business rule enforcement: a user cannot submit more than one
   * claim per ItemReport (DOMAIN_MODEL.md — Claim business rules).
   */
  existsByClaimantAndItem(claimantId, itemId) {
    for (const claim of this._storage.values()) {
      if (claim.claimantId === claimantId && claim.itemId === itemId) return true;
    }
    return false;
  }

  _clear() { this._storage.clear(); }
}

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATION REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class InMemoryNotificationRepository extends NotificationRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._storage = new Map();
  }

  // ── Generic CRUD ───────────────────────────────────────────────────────

  save(notification) {
    if (!notification || !notification.notificationId) {
      throw new Error('InMemoryNotificationRepository.save(): entity must have a notificationId');
    }
    this._storage.set(notification.notificationId, { ...notification });
    return { ...notification };
  }

  findById(id) {
    const n = this._storage.get(id);
    return n ? { ...n } : null;
  }

  findAll() {
    return [...this._storage.values()].map(n => ({ ...n }));
  }

  delete(id) {
    return this._storage.delete(id);
  }

  count() {
    return this._storage.size;
  }

  // ── Domain-Specific Queries ────────────────────────────────────────────

  findByUserId(userId) {
    return [...this._storage.values()]
      .filter(n => n.userId === userId)
      .map(n => ({ ...n }));
  }

  findUnreadByUserId(userId) {
    return [...this._storage.values()]
      .filter(n => n.userId === userId && n.isRead === false)
      .map(n => ({ ...n }));
  }

  markAllReadByUserId(userId) {
    let count = 0;
    for (const [id, n] of this._storage.entries()) {
      if (n.userId === userId && !n.isRead) {
        this._storage.set(id, { ...n, isRead: true });
        count++;
      }
    }
    return count;
  }

  _clear() { this._storage.clear(); }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN CASE REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

class InMemoryAdminCaseRepository extends AdminCaseRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._storage = new Map();
  }

  // ── Generic CRUD ───────────────────────────────────────────────────────

  save(adminCase) {
    if (!adminCase || !adminCase.caseId) {
      throw new Error('InMemoryAdminCaseRepository.save(): entity must have a caseId');
    }
    this._storage.set(adminCase.caseId, { ...adminCase });
    return { ...adminCase };
  }

  findById(id) {
    const c = this._storage.get(id);
    return c ? { ...c } : null;
  }

  findAll() {
    return [...this._storage.values()].map(c => ({ ...c }));
  }

  delete(id) {
    return this._storage.delete(id);
  }

  count() {
    return this._storage.size;
  }

  // ── Domain-Specific Queries ────────────────────────────────────────────

  /** Business rule: one AdminCase per ItemReport — returns single or null. */
  findByItemId(itemId) {
    for (const c of this._storage.values()) {
      if (c.itemId === itemId) return { ...c };
    }
    return null;
  }

  findByAdminId(adminId) {
    return [...this._storage.values()]
      .filter(c => c.adminId === adminId)
      .map(c => ({ ...c }));
  }

  findByStatus(status) {
    return [...this._storage.values()]
      .filter(c => c.status === status)
      .map(c => ({ ...c }));
  }

  _clear() { this._storage.clear(); }
}

module.exports = {
  InMemoryClaimRepository,
  InMemoryNotificationRepository,
  InMemoryAdminCaseRepository,
};
