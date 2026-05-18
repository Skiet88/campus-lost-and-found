'use strict';

/**
 * app.js — CLAFS REST API (Express)
 *
 * Configures and initializes the Express application.
 * Loads all route handlers and middleware in a clean, maintainable structure.
 *
 * Architecture:
 *   - config/dependencies.js   — Dependency Injection (IoC) for services
 *   - routes/*.js              — Route handler modules (users, reports, claims)
 *   - middleware/*.js          — Request middleware (logging, error handling)
 *
 * Principles Followed:
 *   - Single Responsibility Principle (SRP)
 *   - Separation of Concerns (SoC)
 *   - Dependency Injection (DI)
 *   - Open/Closed Principle (OCP) — easy to add new routes without modifying this file
 *
 * Run: node api/app.js
 * Docs: GET /api/docs  (OpenAPI JSON)
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');

// ── Dependency Injection ────────────────────────────────────────────────────

const { userService, reportService, claimService } = require('./config/dependencies');

// ── Middleware ──────────────────────────────────────────────────────────────

const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// ── Route Factories ─────────────────────────────────────────────────────────

const createUserRoutes   = require('./routes/users');
const createReportRoutes = require('./routes/reports');
const createClaimRoutes  = require('./routes/claims');

// ── Express Setup ───────────────────────────────────────────────────────────

const app = express();

// Body parser middleware
app.use(express.json());

// Request logging
app.use(logger);


// ── Route Mounting ─────────────────────────────────────────────────────────

app.use('/api/users',   createUserRoutes(userService));
app.use('/api/reports', createReportRoutes(reportService));
app.use('/api/claims',  createClaimRoutes(claimService));

// ── System Routes ───────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Health check endpoint. Returns API status and timestamp.
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CLAFS API',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/docs
 * Serves the OpenAPI 3.0 specification.
 */
app.get('/api/docs', (_req, res) => {
  res.json(require('../docs/openapi.json'));
});

/**
 * GET /api/swagger
 * Serves interactive Swagger UI documentation.
 */
const swaggerSpec = require('../docs/openapi.json');
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.topbar { display: none }',
  customSiteTitle: 'CLAFS API Documentation',
}));

// ── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Not Found',
    message: 'Route does not exist',
  });
});

// ── Global Error Handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ── Server Startup ─────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

// Start background workers when run directly
if (require.main === module) {
  const loggerMain = require('./logger');
  const startExpiryWorker = require('./workers/expiryWorker');

  app.listen(PORT, () => {
    loggerMain.info(`CLAFS API running on http://localhost:${PORT}`);
    loggerMain.info(`OpenAPI docs:    http://localhost:${PORT}/api/docs`);
    loggerMain.info(`Health check:    http://localhost:${PORT}/api/health`);
  });

  // Start expiry worker (hourly)
  try {
    startExpiryWorker(reportService, 60 * 60 * 1000);
    loggerMain.info('Started expiry worker (hourly)');
  } catch (err) {
    loggerMain.error(`Failed to start expiry worker: ${err.message}`);
  }
}

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = { app, userService, reportService, claimService };