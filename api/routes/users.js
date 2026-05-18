'use strict';

/**
 * routes/users.js — User Entity Routes
 *
 * Handles all user-related endpoints:
 *   POST   /api/users/register      — Register new user
 *   POST   /api/users/login         — Authenticate user
 *   GET    /api/users               — List all users
 *   GET    /api/users/role/:role    — Filter by role
 *   GET    /api/users/:userId       — Get user by ID
 *   PUT    /api/users/:userId       — Update user profile
 *   PATCH  /api/users/:userId/verify — Verify email
 *   DELETE /api/users/:userId       — Delete user
 */

const express = require('express');

module.exports = (userService) => {
  const router = express.Router();

  /**
   * POST /api/users/register
   * Register a new user with a university email.
   */
  router.post('/register', (req, res, next) => {
    try {
      const user = userService.register(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/users/login
   * Authenticate a user and return their profile.
   */
  router.post('/login', (req, res, next) => {
    try {
      const user = userService.login(req.body);
      res.status(200).json({ status: 'success', data: user });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/users
   * Retrieve all users.
   */
  router.get('/', (_req, res, next) => {
    try {
      res.json({ status: 'success', data: userService.getAllUsers() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/users/role/:role
   * Retrieve all users with a given role (STUDENT | LECTURER | ADMIN).
   * NOTE: must be declared BEFORE /:userId to avoid route shadowing.
   */
  router.get('/role/:role', (req, res, next) => {
    try {
      res.json({ status: 'success', data: userService.getUsersByRole(req.params.role) });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/users/:userId
   * Retrieve a user by ID.
   */
  router.get('/:userId', (req, res, next) => {
    try {
      res.json({ status: 'success', data: userService.getUserById(req.params.userId) });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PUT /api/users/:userId
   * Update a user's name or role.
   */
  router.put('/:userId', (req, res, next) => {
    try {
      const updated = userService.updateProfile(req.params.userId, req.body);
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PATCH /api/users/:userId/verify
   * Mark a user's email as verified.
   */
  router.patch('/:userId/verify', (req, res, next) => {
    try {
      const updated = userService.verifyEmail(req.params.userId);
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  });

  /**
   * DELETE /api/users/:userId
   * Delete a user.
   */
  router.delete('/:userId', (req, res, next) => {
    try {
      res.json({ status: 'success', data: userService.deleteUser(req.params.userId) });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
