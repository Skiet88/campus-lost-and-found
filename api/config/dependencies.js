'use strict';

/**
 * dependencies.js — Dependency Injection Container
 *
 * Centralizes all repository and service initialization.
 * Follows the Inversion of Control (IoC) principle.
 *
 * Usage:
 *   const { userService, reportService, claimService } = require('./config/dependencies');
 */

const {
  UserRepository,
  ItemReportRepository,
  ClaimRepository,
  NotificationRepository,
  AdminCaseRepository,
} = require('../../repositories');
const RepositoryFactory = require('../../factories/RepositoryFactory');

const { UserService }       = require('../../services/UserService');
const { ItemReportService } = require('../../services/ItemReportService');
const { ClaimService }      = require('../../services/ClaimService');

// ── Repository Instances ──────────────────────────────────────────────────
// Storage type can be overridden via STORAGE_TYPE environment variable
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'MEMORY';

const userRepo   = RepositoryFactory.getUserRepository(STORAGE_TYPE);
const reportRepo = RepositoryFactory.getItemReportRepository(STORAGE_TYPE);
const claimRepo  = RepositoryFactory.getClaimRepository(STORAGE_TYPE);
const notifRepo  = RepositoryFactory.getNotificationRepository(STORAGE_TYPE);
const caseRepo   = RepositoryFactory.getAdminCaseRepository(STORAGE_TYPE);

// ── Service Instances ─────────────────────────────────────────────────────

const userService   = new UserService(userRepo);
const reportService = new ItemReportService(reportRepo, userRepo, caseRepo);
const claimService  = new ClaimService(claimRepo, reportRepo, userRepo, notifRepo);

// ── Export ────────────────────────────────────────────────────────────────

module.exports = {
  userService,
  reportService,
  claimService,
  // Repositories (if direct access needed)
  userRepo,
  reportRepo,
  claimRepo,
  notifRepo,
  caseRepo,
};
