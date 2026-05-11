'use strict';

/**
 * DatabaseItemReportRepository.js — PostgreSQL Stub (Future Implementation)
 *
 * Stub for the PostgreSQL-backed ItemReport repository.
 * SQL equivalents are commented in so implementation is straightforward
 * when the database layer is connected.
 *
 * Relates to: T-001 (Set up PostgreSQL), T-009 (report submission)
 */

const { ItemReportRepository } = require('../../repositories/interfaces/EntityRepositories');

class DatabaseItemReportRepository extends ItemReportRepository {
  constructor() {
    super();
    // this._db = DatabaseConnection.getInstance(); // uncomment when ready
    this._db = null;
  }

  async save(report) {
    // SQL: INSERT INTO item_reports
    //        (item_id, user_id, type, title, description, category, location,
    //         date_lost_found, image_url, status, created_at)
    //      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    //      ON CONFLICT (item_id) DO UPDATE
    //        SET title=$4, description=$5, status=$10;
    throw new Error('DatabaseItemReportRepository.save() — not yet implemented.');
  }

  async findById(id) {
    // SQL: SELECT * FROM item_reports WHERE item_id = $1
    throw new Error('DatabaseItemReportRepository.findById() — not yet implemented.');
  }

  async findAll() {
    // SQL: SELECT * FROM item_reports ORDER BY created_at DESC
    throw new Error('DatabaseItemReportRepository.findAll() — not yet implemented.');
  }

  async delete(id) {
    // SQL: DELETE FROM item_reports WHERE item_id = $1
    throw new Error('DatabaseItemReportRepository.delete() — not yet implemented.');
  }

  async count() {
    // SQL: SELECT COUNT(*) FROM item_reports
    throw new Error('DatabaseItemReportRepository.count() — not yet implemented.');
  }

  async findByUserId(userId) {
    // SQL: SELECT * FROM item_reports WHERE user_id = $1 ORDER BY created_at DESC
    throw new Error('DatabaseItemReportRepository.findByUserId() — not yet implemented.');
  }

  async findByStatus(status) {
    // SQL: SELECT * FROM item_reports WHERE status = $1
    throw new Error('DatabaseItemReportRepository.findByStatus() — not yet implemented.');
  }

  async findByType(type) {
    // SQL: SELECT * FROM item_reports WHERE type = $1
    throw new Error('DatabaseItemReportRepository.findByType() — not yet implemented.');
  }

  async findByCategory(category) {
    // SQL: SELECT * FROM item_reports WHERE category = $1
    throw new Error('DatabaseItemReportRepository.findByCategory() — not yet implemented.');
  }
}

module.exports = DatabaseItemReportRepository;
