'use strict';

/**
 * EntityRepositories.js — Entity-Specific Repository Interfaces
 *
 * Each interface extends the generic Repository and adds domain-specific
 * query methods relevant to that entity (e.g. findByUserId, findByStatus).
 *
 * These are contracts only — concrete implementations live in /inmemory.
 */

const Repository = require('./Repository');

// ── User Repository ──────────────────────────────────────────────────────

class UserRepository extends Repository {
  /** @param {string} email @returns {object|null} */
  findByEmail(email) {
    throw new Error(`${this.constructor.name}.findByEmail() is not implemented`);
  }

  /** @param {string} role @returns {object[]} */
  findByRole(role) {
    throw new Error(`${this.constructor.name}.findByRole() is not implemented`);
  }

  /** @returns {object[]} */
  findVerified() {
    throw new Error(`${this.constructor.name}.findVerified() is not implemented`);
  }
}

// ── ItemReport Repository ────────────────────────────────────────────────

class ItemReportRepository extends Repository {
  /** @param {string} userId @returns {object[]} */
  findByUserId(userId) {
    throw new Error(`${this.constructor.name}.findByUserId() is not implemented`);
  }

  /** @param {string} status — ACTIVE | RESOLVED | EXPIRED @returns {object[]} */
  findByStatus(status) {
    throw new Error(`${this.constructor.name}.findByStatus() is not implemented`);
  }

  /** @param {string} type — LOST | FOUND @returns {object[]} */
  findByType(type) {
    throw new Error(`${this.constructor.name}.findByType() is not implemented`);
  }

  /** @param {string} category @returns {object[]} */
  findByCategory(category) {
    throw new Error(`${this.constructor.name}.findByCategory() is not implemented`);
  }
}

// ── Claim Repository ─────────────────────────────────────────────────────

class ClaimRepository extends Repository {
  /** @param {string} itemId @returns {object[]} */
  findByItemId(itemId) {
    throw new Error(`${this.constructor.name}.findByItemId() is not implemented`);
  }

  /** @param {string} claimantId @returns {object[]} */
  findByClaimantId(claimantId) {
    throw new Error(`${this.constructor.name}.findByClaimantId() is not implemented`);
  }

  /** @param {string} status — PENDING | UNDER_REVIEW | APPROVED | REJECTED @returns {object[]} */
  findByStatus(status) {
    throw new Error(`${this.constructor.name}.findByStatus() is not implemented`);
  }

  /**
   * Business rule: a user cannot submit more than one claim per item.
   * @param {string} claimantId @param {string} itemId @returns {boolean}
   */
  existsByClaimantAndItem(claimantId, itemId) {
    throw new Error(`${this.constructor.name}.existsByClaimantAndItem() is not implemented`);
  }
}

// ── Notification Repository ──────────────────────────────────────────────

class NotificationRepository extends Repository {
  /** @param {string} userId @returns {object[]} */
  findByUserId(userId) {
    throw new Error(`${this.constructor.name}.findByUserId() is not implemented`);
  }

  /** @param {string} userId @returns {object[]} */
  findUnreadByUserId(userId) {
    throw new Error(`${this.constructor.name}.findUnreadByUserId() is not implemented`);
  }

  /** @param {string} userId @returns {number} count updated */
  markAllReadByUserId(userId) {
    throw new Error(`${this.constructor.name}.markAllReadByUserId() is not implemented`);
  }
}

// ── AdminCase Repository ─────────────────────────────────────────────────

class AdminCaseRepository extends Repository {
  /** Business rule: one AdminCase per ItemReport. @param {string} itemId @returns {object|null} */
  findByItemId(itemId) {
    throw new Error(`${this.constructor.name}.findByItemId() is not implemented`);
  }

  /** @param {string} adminId @returns {object[]} */
  findByAdminId(adminId) {
    throw new Error(`${this.constructor.name}.findByAdminId() is not implemented`);
  }

  /** @param {string} status @returns {object[]} */
  findByStatus(status) {
    throw new Error(`${this.constructor.name}.findByStatus() is not implemented`);
  }
}

module.exports = {
  UserRepository,
  ItemReportRepository,
  ClaimRepository,
  NotificationRepository,
  AdminCaseRepository,
};
