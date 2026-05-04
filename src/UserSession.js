'use strict';

/**
 * UserSession.js
 * Manages JWT-based authenticated sessions.
 * Business rules:
 *   - JWT valid for 8 hours
 *   - IDLE after 30 minutes of inactivity
 *   - Expires after 60 minutes of being IDLE
 *   - TERMINATED immediately on logout
 * Relates to: STATE_DIAGRAMS.md (UserSession), T-006
 */

const { v4: uuidv4 } = require('uuid');

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;   // 8 hours
const IDLE_AFTER_MS = 30 * 60 * 1000;              // 30 minutes
const IDLE_EXPIRE_MS = 60 * 60 * 1000;             // 60 minutes idle → expire

const VALID_STATUSES = ['ACTIVE', 'IDLE', 'EXPIRED', 'TERMINATED'];

class UserSession {
  /**
   * @param {string} userId
   * @param {string} jwtToken - pre-generated JWT string
   */
  constructor(userId, jwtToken) {
    if (!userId) throw new Error('userId is required');
    if (!jwtToken) throw new Error('jwtToken is required');

    this._sessionId = uuidv4();
    this._userId = userId;
    this._jwtToken = jwtToken;
    this._status = 'ACTIVE';
    this._issuedAt = new Date();
    this._expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    this._lastActivityAt = new Date();
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get sessionId() { return this._sessionId; }
  get userId() { return this._userId; }
  get jwtToken() { return this._jwtToken; }
  get status() { return this._status; }
  get issuedAt() { return this._issuedAt; }
  get expiresAt() { return this._expiresAt; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Creates and returns the session record.
   */
  createSession() {
    this._status = 'ACTIVE';
    this._lastActivityAt = new Date();
    return this.toJSON();
  }

  /**
   * Validates the token is still active and not expired.
   * @param {string} token
   * @returns {boolean}
   */
  validateToken(token) {
    if (token !== this._jwtToken) return false;
    this._updateActivityStatus();
    return this._status === 'ACTIVE';
  }

  /**
   * Refreshes the session, resetting last activity and extending expiry.
   */
  refreshSession() {
    if (['EXPIRED', 'TERMINATED'].includes(this._status)) {
      throw new Error(`Cannot refresh a ${this._status} session`);
    }
    this._lastActivityAt = new Date();
    this._expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    this._status = 'ACTIVE';
  }

  /**
   * Terminates the session immediately (on logout).
   */
  terminateSession() {
    this._status = 'TERMINATED';
    this._jwtToken = null;
  }

  /**
   * Returns true if the session has passed its expiresAt time.
   * @returns {boolean}
   */
  isExpired() {
    return new Date() > this._expiresAt;
  }

  toJSON() {
    return {
      sessionId: this._sessionId,
      userId: this._userId,
      status: this._status,
      issuedAt: this._issuedAt,
      expiresAt: this._expiresAt,
      lastActivityAt: this._lastActivityAt,
    };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _updateActivityStatus() {
    const now = Date.now();
    const idleDuration = now - this._lastActivityAt.getTime();

    if (this.isExpired()) {
      this._status = 'EXPIRED';
      return;
    }
    if (idleDuration >= IDLE_EXPIRE_MS && this._status === 'IDLE') {
      this._status = 'EXPIRED';
      return;
    }
    if (idleDuration >= IDLE_AFTER_MS) {
      this._status = 'IDLE';
      return;
    }
    if (this._status === 'IDLE') {
      this._status = 'ACTIVE'; // user came back within idle window
    }
  }
}

module.exports = UserSession;