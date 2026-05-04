'use strict';

/**
 * tests/models/Claim.test.js
 * Unit tests for Claim entity.
 * Covers: submitClaim, approveClaim, rejectClaim, cancelClaim,
 *         proofDescription length rule, rejection reason rule.
 * Related issues: UC-05, US-007
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-claim-uuid') }));

const Claim = require('../src/Claim');

const VALID_PROOF = 'This is my laptop — the serial number is HP-2024-XYZ-001 and I have the receipt.';

function makeClaim(overrides = {}) {
  return new Claim(
    overrides.itemId       || 'item-001',
    overrides.claimantId   || 'user-001',
    overrides.proof        || VALID_PROOF
  );
}

describe('Claim — constructor', () => {
  test('creates claim in PENDING state', () => {
    const c = makeClaim();
    expect(c.status).toBe('PENDING');
    expect(c.rejectionReason).toBeNull();
    expect(c.resolvedAt).toBeNull();
  });

  test('throws if itemId is missing', () => {
    expect(() => new Claim('', 'user-001', VALID_PROOF)).toThrow('itemId is required');
  });

  test('throws if claimantId is missing', () => {
    expect(() => new Claim('item-001', '', VALID_PROOF)).toThrow('claimantId is required');
  });

  test('throws if proofDescription is too short (< 30 chars)', () => {
    expect(() => new Claim('item-001', 'user-001', 'Too short')).toThrow('at least 30 characters');
  });

  test('throws if proofDescription is exactly 29 chars', () => {
    const shortProof = 'A'.repeat(29);
    expect(() => new Claim('item-001', 'user-001', shortProof)).toThrow();
  });

  test('accepts proofDescription of exactly 30 characters', () => {
    const exactProof = 'A'.repeat(30);
    expect(() => new Claim('item-001', 'user-001', exactProof)).not.toThrow();
  });
});

describe('Claim — submitClaim()', () => {
  test('returns claim JSON when status is PENDING', () => {
    const c = makeClaim();
    const result = c.submitClaim();
    expect(result).toHaveProperty('claimId');
    expect(result.status).toBe('PENDING');
  });

  test('throws if called again after initial submit', () => {
    const c = makeClaim();
    c.startReview(); // move out of PENDING
    expect(() => c.submitClaim()).toThrow('Claim already submitted');
  });
});

describe('Claim — startReview()', () => {
  test('moves PENDING to UNDER_REVIEW', () => {
    const c = makeClaim();
    c.startReview();
    expect(c.status).toBe('UNDER_REVIEW');
  });

  test('throws if not in PENDING state', () => {
    const c = makeClaim();
    c.approveClaim();
    expect(() => c.startReview()).toThrow('Only PENDING claims can be moved to UNDER_REVIEW');
  });
});

describe('Claim — approveClaim()', () => {
  test('sets status to APPROVED and records resolvedAt', () => {
    const c = makeClaim();
    c.approveClaim();
    expect(c.status).toBe('APPROVED');
    expect(c.resolvedAt).toBeInstanceOf(Date);
  });

  test('can approve from UNDER_REVIEW', () => {
    const c = makeClaim();
    c.startReview();
    c.approveClaim();
    expect(c.status).toBe('APPROVED');
  });

  test('throws if already APPROVED', () => {
    const c = makeClaim();
    c.approveClaim();
    expect(() => c.approveClaim()).toThrow();
  });

  test('throws if already REJECTED', () => {
    const c = makeClaim();
    c.rejectClaim('Item already claimed');
    expect(() => c.approveClaim()).toThrow();
  });
});

describe('Claim — rejectClaim()', () => {
  test('sets status to REJECTED with reason', () => {
    const c = makeClaim();
    c.rejectClaim('Proof insufficient');
    expect(c.status).toBe('REJECTED');
    expect(c.rejectionReason).toBe('Proof insufficient');
  });

  test('throws if rejection reason is missing', () => {
    const c = makeClaim();
    expect(() => c.rejectClaim('')).toThrow('rejection reason is required');
  });

  test('throws if claim is already APPROVED', () => {
    const c = makeClaim();
    c.approveClaim();
    expect(() => c.rejectClaim('reason')).toThrow();
  });
});

describe('Claim — cancelClaim()', () => {
  test('cancels a PENDING claim', () => {
    const c = makeClaim();
    c.cancelClaim();
    expect(c.status).toBe('REJECTED');
    expect(c.rejectionReason).toBe('Cancelled by claimant');
  });

  test('throws if claim is not PENDING', () => {
    const c = makeClaim();
    c.startReview();
    expect(() => c.cancelClaim()).toThrow('Only PENDING claims can be cancelled');
  });
});

describe('Claim — toJSON()', () => {
  test('includes all required fields', () => {
    const c = makeClaim();
    const json = c.toJSON();
    ['claimId', 'itemId', 'claimantId', 'proofDescription', 'status', 'createdAt'].forEach(f => {
      expect(json).toHaveProperty(f);
    });
  });
});