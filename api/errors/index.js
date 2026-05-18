'use strict';

/**
 * Centralized Error Handling Module
 *
 * Single source of truth for all custom error classes used throughout the application.
 * Each error class has:
 *   - name: Error type for logging/debugging
 *   - statusCode: HTTP status code for REST responses
 *   - message: User-friendly error message
 *
 * Usage:
 *   const { ValidationError, NotFoundError } = require('./errors');
 *   throw new ValidationError('Field is required');
 */

/**
 * ValidationError (400 Bad Request)
 * Thrown when input validation fails.
 * Examples: missing required fields, invalid format, constraint violations
 */
class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * NotFoundError (404 Not Found)
 * Thrown when a requested resource does not exist.
 * Examples: user not found, item not found, claim not found
 */
class NotFoundError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

/**
 * ConflictError (409 Conflict)
 * Thrown when an operation violates business rules or state constraints.
 * Examples: duplicate email, email already verified, cannot update resolved report
 */
class ConflictError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

/**
 * AuthError (401 Unauthorized)
 * Thrown when authentication fails.
 * Examples: invalid credentials, account locked, session expired
 */
class AuthError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

/**
 * ForbiddenError (403 Forbidden)
 * Thrown when user lacks permissions to perform an action.
 * Examples: only admin can approve claims, cannot modify other user's report
 */
class ForbiddenError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

module.exports = {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthError,
  ForbiddenError,
};
