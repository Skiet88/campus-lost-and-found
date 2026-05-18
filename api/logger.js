'use strict';

/**
 * Simple logger wrapper.
 * Swap for `winston` or `pino` later for structured logging.
 */
function _format(level, msg) {
  return `[${new Date().toISOString()}] ${level.toUpperCase()} ${msg}`;
}

module.exports = {
  info: (msg) => { console.log(_format('info', msg)); },
  warn: (msg) => { console.warn(_format('warn', msg)); },
  error: (msg) => { console.error(_format('error', msg)); },
};
