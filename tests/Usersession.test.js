'use strict';

/**
 * tests/models/UserSession.test.js
 * Tests for UserSession — token validation, idle/expiry state, termination.
 * Related issues: T-006
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-session-uuid') }));

const UserSession = require('../src/UserSession');

function makeSession(userId = 'user-001', token = 'jwt.token.abc') {
  return new UserSession(userId, token);
}

describe('UserSession — constructor', () => {
  test('creates session in ACTIVE state', () => {
    const s = makeSession();
    expect(s.status).toBe('ACTIVE');
    expect(s.jwtToken).toBe('jwt.token.abc');
  });

  test('sets expiresAt 8 hours from now', () => {
    const before = Date.now();
    const s = makeSession();
    const expected = before + 8 * 60 * 60 * 1000;
    expect(s.expiresAt.getTime()).toBeGreaterThanOrEqual(expected - 100);
    expect(s.expiresAt.getTime()).toBeLessThanOrEqual(expected + 100);
  });

  test('throws if userId is missing', () => {
    expect(() => new UserSession('', 'token')).toThrow('userId is required');
  });

  test('throws if jwtToken is missing', () => {
    expect(() => new UserSession('user-001', '')).toThrow('jwtToken is required');
  });
});

describe('UserSession — validateToken()', () => {
  test('returns true for matching, active token', () => {
    const s = makeSession();
    expect(s.validateToken('jwt.token.abc')).toBe(true);
  });

  test('returns false for wrong token', () => {
    const s = makeSession();
    expect(s.validateToken('wrong.token')).toBe(false);
  });

  test('returns false for expired session', () => {
    const s = makeSession();
    s._expiresAt = new Date(Date.now() - 1000); // force expired
    expect(s.validateToken('jwt.token.abc')).toBe(false);
  });
});

describe('UserSession — refreshSession()', () => {
  test('resets status to ACTIVE', () => {
    const s = makeSession();
    s._status = 'IDLE';
    s.refreshSession();
    expect(s.status).toBe('ACTIVE');
  });

  test('throws if session is EXPIRED', () => {
    const s = makeSession();
    s._status = 'EXPIRED';
    expect(() => s.refreshSession()).toThrow('Cannot refresh a EXPIRED session');
  });

  test('throws if session is TERMINATED', () => {
    const s = makeSession();
    s.terminateSession();
    expect(() => s.refreshSession()).toThrow('Cannot refresh a TERMINATED session');
  });
});

describe('UserSession — terminateSession()', () => {
  test('sets status to TERMINATED and clears token', () => {
    const s = makeSession();
    s.terminateSession();
    expect(s.status).toBe('TERMINATED');
    expect(s.jwtToken).toBeNull();
  });
});

describe('UserSession — isExpired()', () => {
  test('returns false for a fresh session', () => {
    const s = makeSession();
    expect(s.isExpired()).toBe(false);
  });

  test('returns true when expiresAt is in the past', () => {
    const s = makeSession();
    s._expiresAt = new Date(Date.now() - 1000);
    expect(s.isExpired()).toBe(true);
  });
});

describe('UserSession — createSession()', () => {
  test('returns session JSON and sets status ACTIVE', () => {
    const s = makeSession();
    s._status = 'IDLE';
    const result = s.createSession();
    expect(result).toHaveProperty('sessionId');
    expect(s.status).toBe('ACTIVE');
  });
});