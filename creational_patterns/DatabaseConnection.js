'use strict';

/**
 * DatabaseConnection.js — Singleton Pattern
 *
 * Ensures only one PostgreSQL connection pool exists across the entire
 * application lifetime, preventing resource exhaustion.
 *
 * CLAFS Use Case:
 *   The Node.js/Express backend uses pg (node-postgres) for all DB queries.
 *   Every service (UserService, ItemReportService, etc.) calls
 *   DatabaseConnection.getInstance() to get the shared pool.
 *   Relates to: T-001 (Set up PostgreSQL), ARCHITECTURE.md
 *
 * Pattern: Singleton — private constructor equivalent via module-level
 *          instance guard + static getInstance(). Thread-safety is handled
 *          by Node.js's single-threaded event loop; the pool itself is
 *          async-safe.
 */

let _instance = null;

class DatabaseConnection {
  /**
   * Private constructor — do not call directly, use getInstance().
   * @param {object} config - pg Pool config
   */
  constructor(config = {}) {
    if (_instance) {
      throw new Error(
        'DatabaseConnection is a Singleton. Use DatabaseConnection.getInstance() instead of new.'
      );
    }

    this._config = {
      host: config.host || process.env.DB_HOST || 'localhost',
      port: config.port || process.env.DB_PORT || 5432,
      database: config.database || process.env.DB_NAME || 'clafs',
      user: config.user || process.env.DB_USER || 'postgres',
      password: config.password || process.env.DB_PASSWORD || '',
      max: config.max || 10,           // max pool connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    // In production this would be: this._pool = new Pool(this._config);
    // We keep it as a plain object so this file works without pg installed.
    this._pool = this._createPool(this._config);
    this._isConnected = false;
    this._queryCount = 0;
  }

  // ── Singleton Accessor ────────────────────────────────────────────────

  /**
   * Returns the single DatabaseConnection instance, creating it on first call.
   * @param {object} [config] - only used on the first call
   * @returns {DatabaseConnection}
   */
  static getInstance(config = {}) {
    if (!_instance) {
      _instance = new DatabaseConnection(config);
    }
    return _instance;
  }

  /**
   * Resets the singleton (test use only — never call in production).
   */
  static _resetInstance() {
    _instance = null;
  }

  // ── Public API ────────────────────────────────────────────────────────

  /**
   * Returns the pg Pool for direct query use.
   * @returns {object}
   */
  getPool() {
    return this._pool;
  }

  /**
   * Executes a parameterised query.
   * @param {string} text  - SQL string
   * @param {Array}  params
   * @returns {Promise<object>}
   */
  async query(text, params = []) {
    this._queryCount += 1;
    // In production: return this._pool.query(text, params);
    return { rows: [], rowCount: 0, _sql: text, _params: params };
  }

  /**
   * Checks the connection (pings the DB).
   * @returns {Promise<boolean>}
   */
  async connect() {
    // In production: const client = await this._pool.connect(); client.release();
    this._isConnected = true;
    return true;
  }

  /**
   * Drains and closes the pool gracefully.
   * @returns {Promise<void>}
   */
  async disconnect() {
    // In production: await this._pool.end();
    this._isConnected = false;
    DatabaseConnection._resetInstance();
  }

  get isConnected() { return this._isConnected; }
  get queryCount()  { return this._queryCount; }
  get config()      { return { ...this._config, password: '***' }; } // mask password

  // ── Private ───────────────────────────────────────────────────────────

  _createPool(config) {
    // Returns a mock pool; swap for `new (require('pg').Pool)(config)` in production.
    return { _type: 'MockPool', config };
  }
}

module.exports = DatabaseConnection;