'use strict';

/**
 * UserService.js — Business Logic for User Entity
 *
 * Enforces ALL business rules from DOMAIN_MODEL.md:
 *   - University email validation
 *   - Account lockout after 3 failed login attempts (15-minute window)
 *   - Role-based access enforcement
 *   - Email immutability after registration
 *   - Password hashing (bcrypt simulation for in-memory)
 *
 * Uses the repository layer (Assignment 11) for all persistence.
 * Never accesses storage directly — always goes through the repository.
 *
 * Relates to: FR-02, UC-01, UC-02, US-001, US-002, T-002, T-003
 */

const { v4: uuidv4 } = require('uuid');
const { ValidationError, NotFoundError, ConflictError, AuthError } = require('../api/errors');

const VALID_ROLES   = ['STUDENT', 'LECTURER', 'ADMIN'];
const MAX_FAILURES  = 3;
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes

// Simple university email regex — must end with a known academic domain
const UNI_EMAIL_RE  = /^[^\s@]+@[^\s@]+\.(ac\.za|edu|ac\.uk|edu\.au)$/i;

class UserService {
  /**
   * @param {import('../repositories/interfaces/EntityRepositories').UserRepository} userRepo
   */
  constructor(userRepo) {
    if (!userRepo) throw new Error('UserService requires a UserRepository');
    this._repo = userRepo;
  }

  // ── Register ────────────────────────────────────────────────────────────

  /**
   * Registers a new user.
   * Business rules enforced:
   *   - Email must be a valid university email
   *   - Email must be unique
   *   - Role must be STUDENT | LECTURER | ADMIN
   *   - Name must be at least 2 characters
   *   - Password must be at least 8 characters
   *
   * @param {{ name, email, password, role }} dto
   * @returns {object} created user (passwordHash omitted)
   */
  async register({ name, email, password, role }) {
    // Validate inputs
    if (!name || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }
    if (!email || !UNI_EMAIL_RE.test(email.trim())) {
      throw new ValidationError('A valid university email address is required (e.g. student@cput.ac.za)');
    }
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (!role || !VALID_ROLES.includes(role.toUpperCase())) {
      throw new ValidationError(`Role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    // Email uniqueness check
    const existing = await this._repo.findByEmail(email.trim().toLowerCase());
    if (existing) {
      throw new ConflictError(`An account with email "${email}" already exists`);
    }

    const now = new Date().toISOString();
    const user = {
      userId:              uuidv4(),
      name:                name.trim(),
      email:               email.trim().toLowerCase(),
      passwordHash:        _hashPassword(password),   // simplified hash
      role:                role.toUpperCase(),
      isVerified:          false,
      failedLoginAttempts: 0,
      lockedUntil:         null,
      createdAt:           now,
    };

    const saved = await this._repo.save(user);
    return _sanitize(saved);
  }

  // ── Login ────────────────────────────────────────────────────────────────

  /**
   * Validates credentials and returns the user on success.
   * Business rules enforced:
   *   - Account locked after 3 consecutive failures (15-min lockout)
   *   - Failed attempts reset on successful login
   *
   * @param {{ email, password }} dto
   * @returns {object} authenticated user (passwordHash omitted)
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await this._repo.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    // Check lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      throw new AuthError(`Account locked. Try again in ${remaining} minute(s)`);
    }

    // Verify password
    if (!_verifyPassword(password, user.passwordHash)) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const update   = { ...user, failedLoginAttempts: attempts };
      if (attempts >= MAX_FAILURES) {
        update.lockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
        await this._repo.save(update);
        throw new AuthError('Account locked for 15 minutes after 3 failed login attempts');
      }
      await this._repo.save(update);
      throw new AuthError(`Invalid email or password. ${MAX_FAILURES - attempts} attempt(s) remaining`);
    }

    // Success — reset counters
    const updated = await this._repo.save({
      ...user,
      failedLoginAttempts: 0,
      lockedUntil:         null,
    });

    return _sanitize(updated);
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  async getAllUsers() {
    return (await this._repo.findAll()).map(_sanitize);
  }

  async getUserById(userId) {
    const user = await this._repo.findById(userId);
    if (!user) throw new NotFoundError(`User "${userId}" not found`);
    return _sanitize(user);
  }

  async getUsersByRole(role) {
    if (!VALID_ROLES.includes(role.toUpperCase())) {
      throw new ValidationError(`Role must be one of: ${VALID_ROLES.join(', ')}`);
    }
    return (await this._repo.findByRole(role.toUpperCase())).map(_sanitize);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * Updates a user's profile.
   * Business rule: email cannot be changed after registration.
   *
   * @param {string} userId
   * @param {{ name, role }} updates
   */
  async updateProfile(userId, updates) {
    const user = await this._repo.findById(userId);
    if (!user) throw new NotFoundError(`User "${userId}" not found`);

    if (updates.email && updates.email !== user.email) {
      throw new ValidationError('University email cannot be changed after registration');
    }
    if (updates.name && updates.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }
    if (updates.role && !VALID_ROLES.includes(updates.role.toUpperCase())) {
      throw new ValidationError(`Role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    const updated = await this._repo.save({
      ...user,
      name: updates.name ? updates.name.trim() : user.name,
      role: updates.role ? updates.role.toUpperCase() : user.role,
    });

    return _sanitize(updated);
  }

  // ── Verify Email ──────────────────────────────────────────────────────────

  async verifyEmail(userId) {
    const user = await this._repo.findById(userId);
    if (!user) throw new NotFoundError(`User "${userId}" not found`);
    if (user.isVerified) throw new ConflictError('Email is already verified');
    return _sanitize(await this._repo.save({ ...user, isVerified: true }));
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async deleteUser(userId) {
    const user = await this._repo.findById(userId);
    if (!user) throw new NotFoundError(`User "${userId}" not found`);
    await this._repo.delete(userId);
    return { message: `User "${userId}" deleted successfully` };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Simple deterministic hash for in-memory use (not for production). */
function _hashPassword(password) {
  // In production: use bcrypt.hashSync(password, 12)
  return Buffer.from(`clafs:${password}`).toString('base64');
}

function _verifyPassword(password, hash) {
  return _hashPassword(password) === hash;
}

/** Strips passwordHash from returned objects. */
function _sanitize(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { UserService };