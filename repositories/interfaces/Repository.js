'use strict';

/**
 * Repository.js — Generic Repository Interface
 *
 * Defines the standard CRUD contract that every entity-specific
 * repository must fulfil. Using a shared base keeps all repositories
 * consistent and avoids duplication of method signatures.
 *
 * CLAFS entities covered: User, ItemReport, Claim, Notification, AdminCase
 *
 * Pattern: Repository Pattern — abstracts storage behind a stable interface
 *          so services never depend on a concrete storage mechanism.
 */

class Repository {
  /**
   * Persists a new entity or overwrites an existing one with the same ID.
   * @param {object} entity
   * @returns {object} the saved entity
   */
  save(entity) {
    throw new Error(`${this.constructor.name}.save() is not implemented`);
  }

  /**
   * Retrieves an entity by its unique identifier.
   * @param {string} id
   * @returns {object|null} the entity, or null if not found
   */
  findById(id) {
    throw new Error(`${this.constructor.name}.findById() is not implemented`);
  }

  /**
   * Returns all stored entities.
   * @returns {object[]}
   */
  findAll() {
    throw new Error(`${this.constructor.name}.findAll() is not implemented`);
  }

  /**
   * Removes the entity with the given ID.
   * @param {string} id
   * @returns {boolean} true if deleted, false if not found
   */
  delete(id) {
    throw new Error(`${this.constructor.name}.delete() is not implemented`);
  }

  /**
   * Returns the total number of stored entities.
   * @returns {number}
   */
  count() {
    throw new Error(`${this.constructor.name}.count() is not implemented`);
  }

  /**
   * Returns true if an entity with the given ID exists.
   * @param {string} id
   * @returns {boolean}
   */
  exists(id) {
    return this.findById(id) !== null;
  }
}

module.exports = Repository;
