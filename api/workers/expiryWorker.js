'use strict';

/**
 * expiryWorker — periodically triggers report expiry across reports.
 * Use a long interval in production (daily/hourly); default here: 1 hour.
 */
module.exports = function startExpiryWorker(reportService, intervalMs = 60 * 60 * 1000) {
  if (!reportService || typeof reportService.expireStaleReports !== 'function') {
    throw new Error('expiryWorker requires a reportService with expireStaleReports()');
  }

  const id = setInterval(async () => {
    try {
      await reportService.expireStaleReports();
    } catch (err) {
      // Best-effort logging — do not crash the worker
      // eslint-disable-next-line no-console
      console.error('expiryWorker error', err && err.stack ? err.stack : err);
    }
  }, intervalMs);

  return {
    stop: () => clearInterval(id),
  };
};
