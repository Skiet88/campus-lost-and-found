'use strict';

/**
 * DatabaseUserRepository.js — PostgreSQL Stub (Future Implementation)
 *
 * Shows exactly how the DB-backed User repository will be structured
 * once PostgreSQL is connected. Extends the same UserRepository interface,
 * so RepositoryFactory can return it in place of InMemoryUserRepository
 * without any service code changing.
 *
 * To activate:
 *   1. npm install pg
 *   2. Implement each method using DatabaseConnection.getInstance().query()
 *   3. Change 'MEMORY' → 'DATABASE' in RepositoryFactory call (or via env var)
 *
 * Relates to: T-001 (Set up PostgreSQL), ARCHITECTURE.md, DatabaseConnection.js
 */

const { UserRepository } = require('../../repositories/interfaces/EntityRepositories');

class DatabaseUserRepository extends UserRepository {
  constructor() {
    super();
    // Uncomment when pg is ready:
    // const DatabaseConnection = require('../../creational_patterns/DatabaseConnection');
    // this._db = DatabaseConnection.getInstance();
    this._db = null;
  }

  async save(user) {
    // SQL: INSERT INTO users (user_id, name, email, password_hash, role, is_verified, created_at)
    //      VALUES ($1,$2,$3,$4,$5,$6,$7)
    //      ON CONFLICT (user_id) DO UPDATE
    //        SET name=$2, role=$5, is_verified=$6;
    throw new Error('DatabaseUserRepository.save() — connect PostgreSQL first.');
  }

  async findById(id) {
    // SQL: SELECT * FROM users WHERE user_id = $1
    throw new Error('DatabaseUserRepository.findById() — not yet implemented.');
  }

  async findAll() {
    // SQL: SELECT * FROM users ORDER BY created_at DESC
    throw new Error('DatabaseUserRepository.findAll() — not yet implemented.');
  }

  async delete(id) {
    // SQL: DELETE FROM users WHERE user_id = $1
    throw new Error('DatabaseUserRepository.delete() — not yet implemented.');
  }

  async count() {
    // SQL: SELECT COUNT(*) FROM users
    throw new Error('DatabaseUserRepository.count() — not yet implemented.');
  }

  async findByEmail(email) {
    // SQL: SELECT * FROM users WHERE email = $1
    throw new Error('DatabaseUserRepository.findByEmail() — not yet implemented.');
  }

  async findByRole(role) {
    // SQL: SELECT * FROM users WHERE role = $1
    throw new Error('DatabaseUserRepository.findByRole() — not yet implemented.');
  }

  async findVerified() {
    // SQL: SELECT * FROM users WHERE is_verified = true
    throw new Error('DatabaseUserRepository.findVerified() — not yet implemented.');
  }
}

module.exports = DatabaseUserRepository;
