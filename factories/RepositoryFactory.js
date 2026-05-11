'use strict';

/**
 * RepositoryFactory.js — Factory Pattern for Storage Abstraction
 *
 * Returns the correct repository implementation based on the requested
 * storage type. Services never depend on concrete storage classes:
 * a service calls RepositoryFactory.getItemReportRepository('MEMORY')
 * and never needs to know about Maps, SQL, or JSON files.
 *
 * CLAFS Use Case:
 *   During development and testing: storageType = 'MEMORY'
 *   When PostgreSQL backend is ready: storageType = 'DATABASE'
 *   No service or controller code changes at all.
 *
 * Pattern: Factory Pattern — one static method per entity, switching on
 *   a storageType string. New backends are added by inserting a new case
 *   without modifying existing code (Open/Closed Principle).
 *
 * Why Factory over DI?
 *   As a solo developer, a central factory is simpler to manage than a
 *   full DI container (Awilix, InversifyJS). The factory gives the same
 *   interchangeability with zero configuration overhead. A DI container
 *   can be introduced later if the team grows.
 */

// ── In-Memory Implementations ─────────────────────────────────────────────
const InMemoryUserRepository       = require('../repositories/inmemory/InMemoryUserRepository');
const InMemoryItemReportRepository = require('../repositories/inmemory/InMemoryItemReportRepository');
const {
  InMemoryClaimRepository,
  InMemoryNotificationRepository,
  InMemoryAdminCaseRepository,
} = require('../repositories/inmemory/InMemoryOtherRepositories');

// ── Database Stubs (future) ───────────────────────────────────────────────
const DatabaseUserRepository       = require('./stubs/DatabaseUserRepository');
const DatabaseItemReportRepository = require('./stubs/DatabaseItemReportRepository');

// ── Singleton registry — one instance per entity+storageType ─────────────
const _registry = {};
function _key(entity, storageType) { return `${entity}:${storageType}`; }

// ── Factory ───────────────────────────────────────────────────────────────

class RepositoryFactory {

  static getUserRepository(storageType = 'MEMORY') {
    const k = _key('User', storageType);
    if (!_registry[k]) {
      switch (storageType) {
        case 'MEMORY':   _registry[k] = new InMemoryUserRepository();   break;
        case 'DATABASE': _registry[k] = new DatabaseUserRepository();   break;
        default: throw new Error(`RepositoryFactory: unknown storage type "${storageType}"`);
      }
    }
    return _registry[k];
  }

  static getItemReportRepository(storageType = 'MEMORY') {
    const k = _key('ItemReport', storageType);
    if (!_registry[k]) {
      switch (storageType) {
        case 'MEMORY':   _registry[k] = new InMemoryItemReportRepository();   break;
        case 'DATABASE': _registry[k] = new DatabaseItemReportRepository();   break;
        default: throw new Error(`RepositoryFactory: unknown storage type "${storageType}"`);
      }
    }
    return _registry[k];
  }

  static getClaimRepository(storageType = 'MEMORY') {
    const k = _key('Claim', storageType);
    if (!_registry[k]) {
      switch (storageType) {
        case 'MEMORY':   _registry[k] = new InMemoryClaimRepository(); break;
        case 'DATABASE': throw new Error('DatabaseClaimRepository — not yet implemented');
        default: throw new Error(`RepositoryFactory: unknown storage type "${storageType}"`);
      }
    }
    return _registry[k];
  }

  static getNotificationRepository(storageType = 'MEMORY') {
    const k = _key('Notification', storageType);
    if (!_registry[k]) {
      switch (storageType) {
        case 'MEMORY':   _registry[k] = new InMemoryNotificationRepository(); break;
        case 'DATABASE': throw new Error('DatabaseNotificationRepository — not yet implemented');
        default: throw new Error(`RepositoryFactory: unknown storage type "${storageType}"`);
      }
    }
    return _registry[k];
  }

  static getAdminCaseRepository(storageType = 'MEMORY') {
    const k = _key('AdminCase', storageType);
    if (!_registry[k]) {
      switch (storageType) {
        case 'MEMORY':   _registry[k] = new InMemoryAdminCaseRepository(); break;
        case 'DATABASE': throw new Error('DatabaseAdminCaseRepository — not yet implemented');
        default: throw new Error(`RepositoryFactory: unknown storage type "${storageType}"`);
      }
    }
    return _registry[k];
  }

  /** Clears all cached instances — test use only. */
  static _resetAll() {
    Object.keys(_registry).forEach(k => delete _registry[k]);
  }
}

module.exports = RepositoryFactory;
