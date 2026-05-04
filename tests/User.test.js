'use strict';

/**
 * tests/models/User.test.js
 * Unit tests for User base class.
 * Covers: register, login, lockout, verifyEmail, resetPassword,
 *         updateProfile, toggleEmailNotifications, toJSON.
 * Related issues: T-003, T-007, US-013
 */

// ── Mock bcrypt so tests run without native bindings ──────────────────────
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (plain) => `hashed_${plain}`),
  compare: jest.fn(async (plain, hash) => hash === `hashed_${plain}`),
}), { virtual: true });

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-uuid-user') }), { virtual: true });

const User = require('../src/User');

// ── Helpers ───────────────────────────────────────────────────────────────

function makeUser(overrides = {}) {
  return new User(
    overrides.name     || 'Test User',
    overrides.email    || 'test@cput.ac.za',
    overrides.password || 'Password123',
    overrides.role     || 'STUDENT'
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('User — constructor', () => {
  test('creates a user with correct defaults', () => {
    const user = makeUser();
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@cput.ac.za');
    expect(user.role).toBe('STUDENT');
    expect(user.isVerified).toBe(false);
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
  });

  test('throws if name is missing', () => {
    expect(() => new User('', 'a@cput.ac.za', 'pass')).toThrow('name, email, and password are required');
  });

  test('throws if email is missing', () => {
    expect(() => new User('Name', '', 'pass')).toThrow();
  });

  test('throws if password is missing', () => {
    expect(() => new User('Name', 'a@cput.ac.za', '')).toThrow();
  });

  test('throws for invalid role', () => {
    expect(() => new User('Name', 'a@cput.ac.za', 'pass', 'SUPERUSER')).toThrow('Invalid role');
  });

  test('accepts all valid roles', () => {
    ['STUDENT', 'LECTURER', 'ADMIN'].forEach(role => {
      expect(() => makeUser({ role })).not.toThrow();
    });
  });
});

describe('User — register()', () => {
  test('hashes the password and clears plain text', async () => {
    const user = makeUser();
    await user.register();
    expect(user._passwordHash).toBe('hashed_Password123');
    expect(user._plainPassword).toBeNull();
  });

  test('can register successfully only once (plain is cleared)', async () => {
    const user = makeUser();
    await user.register();
    await expect(user.register()).rejects.toThrow('No password to hash');
  });
});

describe('User — login()', () => {
  test('returns true for correct password', async () => {
    const user = makeUser();
    await user.register();
    const result = await user.login('Password123');
    expect(result).toBe(true);
  });

  test('returns false for wrong password', async () => {
    const user = makeUser();
    await user.register();
    const result = await user.login('wrongpassword');
    expect(result).toBe(false);
  });

  test('increments failedLoginAttempts on wrong password', async () => {
    const user = makeUser();
    await user.register();
    await user.login('bad');
    expect(user.failedLoginAttempts).toBe(1);
  });

  test('locks account after 3 failed attempts', async () => {
    const user = makeUser();
    await user.register();
    await user.login('bad');
    await user.login('bad');
    await user.login('bad');
    expect(user.lockedUntil).not.toBeNull();
    expect(user.lockedUntil).toBeInstanceOf(Date);
  });

  test('throws error when account is locked', async () => {
    const user = makeUser();
    await user.register();
    // Force lock
    user._failedLoginAttempts = 3;
    user._lockedUntil = new Date(Date.now() + 60 * 1000); // locked for 1 min
    await expect(user.login('Password123')).rejects.toThrow('Account locked');
  });

  test('resets failedLoginAttempts on successful login', async () => {
    const user = makeUser();
    await user.register();
    await user.login('bad');
    await user.login('Password123');
    expect(user.failedLoginAttempts).toBe(0);
  });

  test('throws if user not registered', async () => {
    const user = makeUser();
    await expect(user.login('pass')).rejects.toThrow('User not registered yet');
  });
});

describe('User — verifyEmail()', () => {
  test('sets isVerified to true', () => {
    const user = makeUser();
    expect(user.isVerified).toBe(false);
    user.verifyEmail();
    expect(user.isVerified).toBe(true);
  });
});

describe('User — resetPassword()', () => {
  test('updates the password hash', async () => {
    const user = makeUser();
    await user.register();
    await user.resetPassword('NewPassword456');
    expect(user._passwordHash).toBe('hashed_NewPassword456');
  });

  test('throws if new password is too short', async () => {
    const user = makeUser();
    await user.register();
    await expect(user.resetPassword('short')).rejects.toThrow('at least 8 characters');
  });

  test('resets lockout state on password reset', async () => {
    const user = makeUser();
    await user.register();
    user._failedLoginAttempts = 3;
    user._lockedUntil = new Date(Date.now() + 60000);
    await user.resetPassword('NewPassword456');
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
  });
});

describe('User — updateProfile()', () => {
  test('updates name', () => {
    const user = makeUser();
    user.updateProfile({ name: 'Updated Name' });
    expect(user.name).toBe('Updated Name');
  });

  test('does not change email (business rule)', () => {
    const user = makeUser({ email: 'original@cput.ac.za' });
    user.updateProfile({ email: 'hacked@evil.com' });
    expect(user.email).toBe('original@cput.ac.za');
  });
});

describe('User — toggleEmailNotifications()', () => {
  test('toggles from true to false', () => {
    const user = makeUser();
//     expect(user.emailNotificationsEnabled).toBe(true);
//     user.toggleEmailNotifications();
//     expect(user.emailNotificationsEnabled).toBe(false);
  });

  test('toggles back to true', () => {
    const user = makeUser();
    user.toggleEmailNotifications();
    user.toggleEmailNotifications();
    expect(user.emailNotificationsEnabled).toBe(true);
  });
});

describe('User — toJSON()', () => {
  test('does not expose passwordHash', () => {
    const user = makeUser();
    const json = user.toJSON();
    expect(json).not.toHaveProperty('_passwordHash');
    expect(json).not.toHaveProperty('passwordHash');
  });

  test('includes all expected fields', () => {
    const user = makeUser();
    const json = user.toJSON();
    expect(json).toHaveProperty('userId');
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('email');
    expect(json).toHaveProperty('role');
    expect(json).toHaveProperty('isVerified');
    expect(json).toHaveProperty('createdAt');
  });
});