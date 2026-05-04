'use strict';

/**
 * tests/models/ItemReport.test.js
 * Unit tests for ItemReport entity.
 * Covers all methods, business rules, and edge cases.
 * Related issues: T-009, US-003, US-004
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-item-uuid') }));

const ItemReport = require('../src/ItemReport');

function makeReport(overrides = {}) {
  const userId = Object.prototype.hasOwnProperty.call(overrides, 'userId') ? overrides.userId : 'user-001';
  const type = Object.prototype.hasOwnProperty.call(overrides, 'type') ? overrides.type : 'LOST';
  const title = Object.prototype.hasOwnProperty.call(overrides, 'title') ? overrides.title : 'Blue Laptop';
  const description = Object.prototype.hasOwnProperty.call(overrides, 'description') ? overrides.description : 'A blue HP laptop left in the library';
  const category = Object.prototype.hasOwnProperty.call(overrides, 'category') ? overrides.category : 'ELECTRONICS';
  const location = Object.prototype.hasOwnProperty.call(overrides, 'location') ? overrides.location : 'Library 2nd Floor';
  const dateLostFound = Object.prototype.hasOwnProperty.call(overrides, 'dateLostFound') ? overrides.dateLostFound : new Date('2026-04-01');
  const imageUrl = Object.prototype.hasOwnProperty.call(overrides, 'imageUrl') ? overrides.imageUrl : null;

  return new ItemReport(userId, type, title, description, category, location, dateLostFound, imageUrl);
}

describe('ItemReport — constructor', () => {
  test('creates report with correct fields', () => {
    const r = makeReport();
    expect(r.type).toBe('LOST');
    expect(r.title).toBe('Blue Laptop');
    expect(r.status).toBe('ACTIVE');
  });

  test('throws for missing userId', () => {
    expect(() => makeReport({ userId: '' })).toThrow('userId is required');
  });

  test('throws for invalid type', () => {
    expect(() => makeReport({ type: 'STOLEN' })).toThrow('type must be LOST or FOUND');
  });

  test('accepts LOST and FOUND types', () => {
    expect(() => makeReport({ type: 'LOST' })).not.toThrow();
    expect(() => makeReport({ type: 'FOUND' })).not.toThrow();
  });

  test('defaults category to GENERAL when not provided', () => {
    const r = makeReport({ category: undefined });
    expect(r.category).toBe('GENERAL');
  });
});

describe('ItemReport — submitReport()', () => {
  test('returns a JSON representation of the report', () => {
    const r = makeReport();
    const result = r.submitReport();
    expect(result).toHaveProperty('itemId');
    expect(result).toHaveProperty('title', 'Blue Laptop');
  });
});

describe('ItemReport — updateReport()', () => {
  test('updates title', () => {
    const r = makeReport();
    r.updateReport({ title: 'Silver Laptop' });
    expect(r.title).toBe('Silver Laptop');
  });

  test('updates multiple fields at once', () => {
    const r = makeReport();
    r.updateReport({ title: 'New Title', location: 'Cafeteria' });
    expect(r.title).toBe('New Title');
    expect(r.location).toBe('Cafeteria');
  });

  test('throws if report is not ACTIVE', () => {
    const r = makeReport();
    r.markAsResolved();
    expect(() => r.updateReport({ title: 'Attempt' })).toThrow('Only ACTIVE reports can be updated');
  });
});

describe('ItemReport — markAsResolved()', () => {
  test('sets status to RESOLVED', () => {
    const r = makeReport();
    r.markAsResolved();
    expect(r.status).toBe('RESOLVED');
  });

  test('throws if already RESOLVED', () => {
    const r = makeReport();
    r.markAsResolved();
    expect(() => r.markAsResolved()).toThrow('Already resolved');
  });
});

describe('ItemReport — markAsExpired()', () => {
  test('sets status to EXPIRED', () => {
    const r = makeReport();
    r.markAsExpired();
    expect(r.status).toBe('EXPIRED');
  });

  test('throws if already RESOLVED', () => {
    const r = makeReport();
    r.markAsResolved();
    expect(() => r.markAsExpired()).toThrow('Cannot expire a resolved report');
  });
});

describe('ItemReport — deleteReport()', () => {
  test('marks report as EXPIRED', () => {
    const r = makeReport();
    r.deleteReport();
    expect(r.status).toBe('EXPIRED');
  });
});

describe('ItemReport — addClaim()', () => {
  test('adds a claim ID to the report', () => {
    const r = makeReport();
    r.addClaim('claim-001');
    expect(r.claimIds).toContain('claim-001');
  });

  test('throws if report is not ACTIVE', () => {
    const r = makeReport();
    r.markAsExpired();
    expect(() => r.addClaim('claim-002')).toThrow('Cannot add claim to a non-ACTIVE report');
  });

  test('throws if same claim is added twice', () => {
    const r = makeReport();
    r.addClaim('claim-001');
    expect(() => r.addClaim('claim-001')).toThrow('Claim already registered');
  });
});

describe('ItemReport — shouldExpire()', () => {
  test('returns false for a newly created report', () => {
    const r = makeReport();
    expect(r.shouldExpire()).toBe(false);
  });

  test('returns true when lastActivityAt is over 30 days ago', () => {
    const r = makeReport();
    // Manually backdating the private field to simulate 31 days ago
    r._lastActivityAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(r.shouldExpire()).toBe(true);
  });

  test('returns false if status is RESOLVED', () => {
    const r = makeReport();
    r._lastActivityAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    r.markAsResolved();
    expect(r.shouldExpire()).toBe(false);
  });
});

describe('ItemReport — toJSON()', () => {
  test('includes all expected fields', () => {
    const r = makeReport();
    const json = r.toJSON();
    ['itemId', 'userId', 'type', 'title', 'description', 'status', 'createdAt'].forEach(field => {
      expect(json).toHaveProperty(field);
    });
  });
});