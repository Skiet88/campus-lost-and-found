'use strict';

/**
 * tests/models/AdminCase.test.js
 * Tests for AdminCase — full lifecycle: open, review, escalate, resolve, close.
 * Related issues: US-007
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-case-uuid') }));

const AdminCase = require('../src/AdminCase');

function makeCase() {
  return new AdminCase('item-001', 'admin-001');
}

describe('AdminCase — constructor', () => {
  test('creates case with OPEN status', () => {
    const c = makeCase();
    expect(c.status).toBe('OPEN');
    expect(c.resolvedAt).toBeNull();
  });

  test('throws if itemId is missing', () => {
    expect(() => new AdminCase('', 'admin-001')).toThrow('itemId is required');
  });

  test('throws if adminId is missing', () => {
    expect(() => new AdminCase('item-001', '')).toThrow('adminId is required');
  });
});

describe('AdminCase — openCase()', () => {
  test('returns case JSON', () => {
    const c = makeCase();
    const result = c.openCase();
    expect(result).toHaveProperty('caseId');
    expect(c.status).toBe('OPEN');
  });
});

describe('AdminCase — reviewClaim()', () => {
  test('moves status to UNDER_REVIEW', () => {
    const c = makeCase();
    c.reviewClaim('claim-001');
    expect(c.status).toBe('UNDER_REVIEW');
  });

  test('adds a note mentioning the claimId', () => {
    const c = makeCase();
    c.reviewClaim('claim-001');
    expect(c.notes[0].note).toContain('claim-001');
  });

  test('throws if claimId is missing', () => {
    const c = makeCase();
    expect(() => c.reviewClaim('')).toThrow('claimId is required');
  });

  test('throws if case is already RESOLVED', () => {
    const c = makeCase();
    c.resolveCase('claim-approved');
    expect(() => c.reviewClaim('claim-002')).toThrow();
  });
});

describe('AdminCase — escalateCase()', () => {
  test('sets status to ESCALATED', () => {
    const c = makeCase();
    c.escalateCase();
    expect(c.status).toBe('ESCALATED');
  });

  test('records custom reason in notes', () => {
    const c = makeCase();
    c.escalateCase('Claimant did not collect after 7 days');
    expect(c.notes[0].note).toContain('Claimant did not collect');
  });

  test('throws if case is already RESOLVED', () => {
    const c = makeCase();
    c.resolveCase('claim-001');
    expect(() => c.escalateCase()).toThrow('Resolved cases cannot be escalated');
  });
});

describe('AdminCase — resolveCase()', () => {
  test('sets status to RESOLVED and records resolvedAt', () => {
    const c = makeCase();
    c.resolveCase('claim-approved-001');
    expect(c.status).toBe('RESOLVED');
    expect(c.resolvedAt).toBeInstanceOf(Date);
  });

  test('throws if approvedClaimId is missing', () => {
    const c = makeCase();
    expect(() => c.resolveCase('')).toThrow('approvedClaimId is required');
  });
});

describe('AdminCase — closeCase()', () => {
  test('sets status to CLOSED', () => {
    const c = makeCase();
    c.closeCase();
    expect(c.status).toBe('CLOSED');
  });

  test('throws if case is already RESOLVED', () => {
    const c = makeCase();
    c.resolveCase('claim-001');
    expect(() => c.closeCase()).toThrow('Case already resolved');
  });
});

describe('AdminCase — addNote()', () => {
  test('adds a note to the log', () => {
    const c = makeCase();
    c.addNote('Item stored in locker B12');
    expect(c.notes[0].note).toBe('Item stored in locker B12');
  });

  test('throws if note is empty', () => {
    const c = makeCase();
    expect(() => c.addNote('')).toThrow('Note cannot be empty');
  });
});

describe('AdminCase — shouldEscalate()', () => {
  test('returns false when status is not PENDING_COLLECTION', () => {
    const c = makeCase();
    expect(c.shouldEscalate()).toBe(false);
  });

  test('returns true when 7+ days since approval in PENDING_COLLECTION', () => {
    const c = makeCase();
    c._status = 'PENDING_COLLECTION';
    c._approvedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
    expect(c.shouldEscalate()).toBe(true);
  });
});

describe('AdminCase — shouldAutoClose()', () => {
  test('returns false for non-OPEN case', () => {
    const c = makeCase();
    c.closeCase();
    expect(c.shouldAutoClose(null)).toBe(false);
  });

  test('returns true when opened 30+ days ago with no claims', () => {
    const c = makeCase();
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    c._openedAt = thirtyOneDaysAgo;
    expect(c.shouldAutoClose(null)).toBe(true);
  });
});

describe('AdminCase — toJSON()', () => {
  test('includes expected fields', () => {
    const c = makeCase();
    const json = c.toJSON();
    ['caseId', 'itemId', 'adminId', 'status', 'notes', 'openedAt'].forEach(f => {
      expect(json).toHaveProperty(f);
    });
  });
});