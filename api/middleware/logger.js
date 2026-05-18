'use strict';

/**
 * middleware/logger.js — Request Logger Middleware
 *
 * Lightweight logging middleware — no external dependencies.
 * Logs all incoming HTTP requests with timestamp, method, and path.
 */

const logger = require('../logger');

module.exports = (req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
};
