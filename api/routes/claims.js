'use strict';

/**
 * routes/claims.js — Claim Entity Routes
 *
 * Handles all claim submission and review workflow endpoints:
 *   POST   /api/claims                     — Submit claim
 *   GET    /api/claims                     — List claims (with filtering)
 *   GET    /api/claims/item/:itemId        — Get claims by item
 *   GET    /api/claims/user/:claimantId    — Get claims by user
 *   GET    /api/claims/:claimId            — Get single claim
 *   PATCH  /api/claims/:claimId/review     — Move to under review (Admin)
 *   PATCH  /api/claims/:claimId/approve    — Approve claim (Admin)
 *   PATCH  /api/claims/:claimId/reject     — Reject claim (Admin)
 *   DELETE /api/claims/:claimId            — Cancel claim (Claimant)
 */

const express = require('express');

module.exports = (claimService) => {
  const router = express.Router();

  /**
   * POST /api/claims
   * Submit a new claim for a found item.
   */
  router.post('/', (req, res, next) => {
    try {
      const claim = claimService.submitClaim(req.body);
      res.status(201).json({ status: 'success', data: claim });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/claims
   * Get all claims. Optional query: ?status=PENDING
   */
  router.get('/', (req, res, next) => {
    try {
      const { status } = req.query;
      const claims = status ? claimService.getClaimsByStatus(status) : claimService.getAllClaims();
      res.json({ status: 'success', count: claims.length, data: claims });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/claims/item/:itemId
   * Get all claims for a specific item report.
   * NOTE: must be declared BEFORE /:claimId to avoid route shadowing.
   */
  router.get('/item/:itemId', (req, res, next) => {
    try {
      const claims = claimService.getClaimsByItem(req.params.itemId);
      res.json({ status: 'success', count: claims.length, data: claims });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/claims/user/:claimantId
   * Get all claims submitted by a specific user.
   * NOTE: must be declared BEFORE /:claimId to avoid route shadowing.
   */
  router.get('/user/:claimantId', (req, res, next) => {
    try {
      const claims = claimService.getClaimsByUser(req.params.claimantId);
      res.json({ status: 'success', count: claims.length, data: claims });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/claims/:claimId
   * Get a single claim by ID.
   */
  router.get('/:claimId', (req, res, next) => {
    try {
      res.json({ status: 'success', data: claimService.getClaimById(req.params.claimId) });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PATCH /api/claims/:claimId/review
   * Move a claim to UNDER_REVIEW (Admin only).
   * Body: { adminId }
   */
  router.patch('/:claimId/review', (req, res, next) => {
    try {
      const updated = claimService.reviewClaim(req.params.claimId, req.body.adminId);
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PATCH /api/claims/:claimId/approve
   * Approve a claim (Admin only). Auto-rejects all other claims on same item.
   * Body: { adminId }
   */
  router.patch('/:claimId/approve', (req, res, next) => {
    try {
      const updated = claimService.approveClaim(req.params.claimId, req.body.adminId);
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PATCH /api/claims/:claimId/reject
   * Reject a claim (Admin only). Rejection reason is mandatory.
   * Body: { adminId, rejectionReason }
   */
  router.patch('/:claimId/reject', (req, res, next) => {
    try {
      const updated = claimService.rejectClaim(req.params.claimId, req.body.adminId, req.body.rejectionReason);
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  });

  /**
   * DELETE /api/claims/:claimId
   * Cancel a claim (claimant only, PENDING or UNDER_REVIEW only).
   * Body: { claimantId }
   */
  router.delete('/:claimId', (req, res, next) => {
    try {
      res.json({ status: 'success', data: claimService.cancelClaim(req.params.claimId, req.body.claimantId) });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
