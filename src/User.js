'use strict';

/**
 * User.js
 * Base class for all user types in CLAFS.
 * Implements FR-02: role-based access, email verification, account lockout.
 * Relates to: T-001, T-002, T-003, T-007, US-013
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

class User {
  /**
   * @param {string} name
   * @param {string} email
   * @param {string} plainPassword
   * @param {'STUDENT'|'LECTURER'|'ADMIN'} role
   */
  constructor(name, email, plainPassword, role = 'STUDENT') {
    if (!name || !email || !plainPassword) {
      throw new Error('name, email, and password are required');
    }
    if (!['STUDENT', 'LECTURER', 'ADMIN'].includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    this._userId = uuidv4();
    this._name = name;
    this._email = email;
    this._passwordHash = null; // set via register()
    this._plainPassword = plainPassword; // temporary, cleared after hashing
    this._role = role;
    this._isVerified = false;
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
    this._emailNotificationsEnabled = true;
    this._createdAt = new Date();
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get userId() { return this._userId; }
  get name() { return this._name; }
  get email() { return this._email; }
  get role() { return this._role; }
  get isVerified() { return this._isVerified; }
  get failedLoginAttempts() { return this._failedLoginAttempts; }
  get lockedUntil() { return this._lockedUntil; }
  get createdAt() { return this._createdAt; }
  get emailNotificationsEnabled() { return this._emailNotificationsEnabled; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Hashes the password and marks the account as registered.
   * Relates to T-003 (bcrypt password hashing).
   * @returns {Promise<void>}
   */
  async register() {
    if (!this._plainPassword) throw new Error('No password to hash');
    this._passwordHash = await bcrypt.hash(this._plainPassword, SALT_ROUNDS);
    this._plainPassword = null; // clear plain text
  }

  /**
   * Validates credentials. Enforces lockout after MAX_FAILED_ATTEMPTS.
   * Relates to T-006, T-007.
   * @param {string} plainPassword
   * @returns {Promise<boolean>}
   */
  async login(plainPassword) {
    if (this._isLocked()) {
      throw new Error(`Account locked until ${this._lockedUntil.toISOString()}`);
    }
    if (!this._passwordHash) throw new Error('User not registered yet');

    const match = await bcrypt.compare(plainPassword, this._passwordHash);
    if (!match) {
      this._failedLoginAttempts += 1;
      if (this._failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_MINUTES);
        this._lockedUntil = lockUntil;
      }
      return false;
    }

    // Reset on success
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
    return true;
  }

  /**
   * Logs the user out (session termination handled by UserSession).
   */
  logout() {
    // Delegate to UserSession; here we just signal intent
    return { userId: this._userId, loggedOutAt: new Date() };
  }

  /**
   * Marks the user's email as verified.
   */
  verifyEmail() {
    this._isVerified = true;
  }

  /**
   * Resets the password hash. Caller must supply new plain password.
   * @param {string} newPlainPassword
   * @returns {Promise<void>}
   */
  async resetPassword(newPlainPassword) {
    if (!newPlainPassword || newPlainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    this._passwordHash = await bcrypt.hash(newPlainPassword, SALT_ROUNDS);
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
  }

  /**
   * Updates mutable profile fields.
   * @param {{ name?: string }} updates
   */
  updateProfile({ name } = {}) {
    if (name) this._name = name;
    // Email cannot be changed after registration (business rule)
  }

  /**
   * Toggles email notification preference.
   */
  toggleEmailNotifications() {
    this._emailNotificationsEnabled = !this._emailNotificationsEnabled;
  }

  /**
   * Returns a plain object safe for serialisation (no password hash).
   */
  toJSON() {
    return {
      userId: this._userId,
      name: this._name,
      email: this._email,
      role: this._role,
      isVerified: this._isVerified,
      failedLoginAttempts: this._failedLoginAttempts,
      lockedUntil: this._lockedUntil,
      emailNotificationsEnabled: this._emailNotificationsEnabled,
      createdAt: this._createdAt,
    };
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  _isLocked() {
    if (!this._lockedUntil) return false;
    return new Date() < this._lockedUntil;
  }
}

module.exports = User;
