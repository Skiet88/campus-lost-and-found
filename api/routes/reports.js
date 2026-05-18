'use strict';

/**
 * routes/reports.js — ItemReport Entity Routes
 *
 * Handles all lost & found item report endpoints:
 *   POST   /api/reports                   — Submit new report
 *   GET    /api/reports                   — List reports (with filtering)
 *   GET    /api/reports/user/:userId      — Get reports by user
 *   GET    /api/reports/:itemId           — Get single report
 *   PUT    /api/reports/:itemId           — Update report
 *   PATCH  /api/reports/:itemId/resolve   — Mark as resolved
 *   DELETE /api/reports/:itemId           — Delete report
 */

const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');

module.exports = (reportService) => {
  const router = express.Router();

  /**
   * POST /api/reports
   * Submit a new lost or found item report.
   */
  router.post('/', asyncHandler(async (req, res) => {
    const report = await reportService.submitReport(req.body);
    res.status(201).json({ status: 'success', data: report });
  }));

  /**
   * GET /api/reports
   * Get all item reports.
   * Optional query: ?status=ACTIVE  ?type=LOST  ?category=BAGS
   */
  router.get('/', asyncHandler(async (req, res) => {
    const reports = await reportService.getReportsByQuery(req.query);
    res.json({ status: 'success', count: reports.length, data: reports });
  }));

  /**
   * GET /api/reports/user/:userId
   * Get all reports submitted by a specific user.
   * NOTE: must be declared BEFORE /:itemId to avoid route shadowing.
   */
  router.get('/user/:userId', asyncHandler(async (req, res) => {
    const reports = await reportService.getReportsByUser(req.params.userId);
    res.json({ status: 'success', count: reports.length, data: reports });
  }));

  /**
   * GET /api/reports/:itemId
   * Get a single item report.
   */
  router.get('/:itemId', asyncHandler(async (req, res) => {
    const report = await reportService.getReportById(req.params.itemId);
    res.json({ status: 'success', data: report });
  }));

  /**
   * PUT /api/reports/:itemId
   * Update an item report (submitter only, ACTIVE reports only).
   * Body: { requestingUserId, title?, description?, location?, category?, imageUrl? }
   */
  router.put('/:itemId', asyncHandler(async (req, res) => {
    const { requestingUserId, ...updates } = req.body;
    const updated = await reportService.updateReport(req.params.itemId, requestingUserId, updates);
    res.json({ status: 'success', data: updated });
  }));

  /**
   * PATCH /api/reports/:itemId/resolve
   * Mark a report as RESOLVED (Admin only).
   * Body: { adminId }
   */
  router.patch('/:itemId/resolve', asyncHandler(async (req, res) => {
    const updated = await reportService.markAsResolved(req.params.itemId, req.body.adminId);
    res.json({ status: 'success', data: updated });
  }));

  /**
   * DELETE /api/reports/:itemId
   * Delete a report (submitter or admin).
   * Body: { requestingUserId }
   */
  router.delete('/:itemId', asyncHandler(async (req, res) => {
    const result = await reportService.deleteReport(req.params.itemId, req.body.requestingUserId);
    res.json({ status: 'success', data: result });
  }));

  return router;
};
