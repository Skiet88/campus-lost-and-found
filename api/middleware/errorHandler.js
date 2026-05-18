'use strict';

/**
 * middleware/errorHandler.js — Global Error Handler Middleware
 *
 * Centralizes error handling and converts service-layer errors to HTTP responses.
 * Follows a consistent error response format:
 *   { status: 'error', error: '<ErrorType>', message: '<detail>' }
 */

module.exports = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal Server Error';
  
  console.error(`[ERROR] ${err.name}: ${message}`);
  
  res.status(statusCode).json({
    status:  'error',
    error:   err.name || 'Error',
    message,
  });
};
