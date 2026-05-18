'use strict';

/**
 * asyncHandler(fn) — convenience to handle async route handlers
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }));
 */
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
