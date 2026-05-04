'use strict';

/**
 * AdminCase.js
 * Administrative record tracking the full lifecycle of an ItemReport.
 * Business rules:
 *   - Auto-created when an ItemReport is submitted
 *   - Can only be RESOLVED if at least one claim is approved
 *   - Escalated if approved claimant does not collect within 7 days
 *   - Auto-CLOSED if no claim submitted within 30 days
 * Relates to: DOMAIN_MODEL.md Entity 7, US-007, STATE_DIAGRAMS.md
 */

const { v4: uuidv4 } = require('uuid');

const VALID_STATUSES = [
  'OPEN',
  'PENDING_CLAIM',
  'UNDER_REVIEW',
  'PENDING_COLLECTION',
  'RESOLVED',
  'ESCALATED',
  'CLOSED',
];
const ESCALATION_DAYS = 7;
const AUTO_CLOSE_DAYS = 30;

class AdminCase {
  /**
   * @param {string} itemId
   * @param {string} adminId
   */
  constructor(itemId, adminId) {
    if (!itemId) throw new Error('itemId is required');
    if (!adminId) throw new Error('adminId is required');

    this._caseId = uuidv4();
    this._itemId = itemId;
    this._adminId = adminId;
    this._status = 'OPEN';
    this._notes = [];
    this._approvedClaimId = null;
    this._openedAt = new Date();
    this._resolvedAt = null;
    this._approvedAt = null;
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get caseId() { return this._caseId; }
  get itemId() { return this._itemId; }
  get adminId() { return this._adminId; }
  get status() { return this._status; }
  get notes() { return [...this._notes]; }
  get openedAt() { return this._openedAt; }
  get resolvedAt() { return this._resolvedAt; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Opens the case (called on ItemReport creation).
   */
  openCase() {
    this._status = 'OPEN';
    return this.toJSON();
  }

  /**
   * Moves case to UNDER_REVIEW when admin picks up a claim.
   * @param {string} claimId
   */
  reviewClaim(claimId) {
    if (!claimId) throw new Error('claimId is required');
    if (!['OPEN', 'PENDING_CLAIM'].includes(this._status)) {
      throw new Error(`Case must be OPEN or PENDING_CLAIM to review. Current: ${this._status}`);
    }
    this._status = 'UNDER_REVIEW';
    this.addNote(`Reviewing claim: ${claimId}`);
  }

  /**
   * Escalates the case (e.g. no collection within 7 days).
   * @param {string} reason
   */
  escalateCase(reason = 'No collection within 7 days') {
    if (this._status === 'RESOLVED') throw new Error('Resolved cases cannot be escalated');
    this._status = 'ESCALATED';
    this.addNote(`Escalated: ${reason}`);
  }

  /**
   * Resolves the case. Requires at least one approved claim.
   * @param {string} approvedClaimId
   */
  resolveCase(approvedClaimId) {
    if (!approvedClaimId) throw new Error('approvedClaimId is required to resolve');
    this._approvedClaimId = approvedClaimId;
    this._status = 'RESOLVED';
    this._resolvedAt = new Date();
    this._approvedAt = new Date();
    this.addNote(`Resolved with approved claim: ${approvedClaimId}`);
  }

  /**
   * Closes the case without resolution (e.g. 30-day no-claim auto-close).
   * @param {string} reason
   */
  closeCase(reason = 'Auto-closed: no claim within 30 days') {
    if (this._status === 'RESOLVED') {
      throw new Error('Case already resolved — use resolveCase()');
    }
    this._status = 'CLOSED';
    this._resolvedAt = new Date();
    this.addNote(`Closed: ${reason}`);
  }

  /**
   * Adds a note to the case log.
   * @param {string} note
   */
  addNote(note) {
    if (!note || note.trim() === '') throw new Error('Note cannot be empty');
    this._notes.push({ note: note.trim(), addedAt: new Date() });
  }

  /**
   * Checks if the approved claimant has not collected within 7 days.
   * @returns {boolean}
   */
  shouldEscalate() {
    if (this._status !== 'PENDING_COLLECTION' || !this._approvedAt) return false;
    const diffMs = Date.now() - this._approvedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= ESCALATION_DAYS;
  }

  /**
   * Checks if the case should auto-close (no claims in 30 days).
   * @param {Date} lastClaimAt - date of last claim, or null
   * @returns {boolean}
   */
  shouldAutoClose(lastClaimAt) {
    if (this._status !== 'OPEN') return false;
    const ref = lastClaimAt || this._openedAt;
    const diffMs = Date.now() - ref.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= AUTO_CLOSE_DAYS;
  }

  toJSON() {
    return {
      caseId: this._caseId,
      itemId: this._itemId,
      adminId: this._adminId,
      status: this._status,
      notes: this._notes,
      openedAt: this._openedAt,
      resolvedAt: this._resolvedAt,
    };
  }
}

module.exports = AdminCase;