'use strict';

/**
 * ItemReportBuilder.js — Builder Pattern
 *
 * Constructs an ItemReport step-by-step, allowing optional fields
 * (category, imageUrl) to be added fluently without a huge constructor.
 *
 * CLAFS Use Case:
 *   The React report form collects fields progressively across multiple
 *   steps (title → description → location → optional photo).
 *   The Builder mirrors that UX, adding each field in sequence and only
 *   calling build() when all required fields are confirmed.
 *   Relates to: T-010 (React Report Lost Item form), T-009
 *
 * Pattern: Builder — fluent interface, separate Director for common recipes.
 */

const ItemReport = require('../src/ItemReport');

class ItemReportBuilder {
  constructor() {
    this._userId = null;
    this._type = null;
    this._title = null;
    this._description = null;
    this._category = 'GENERAL';
    this._location = null;
    this._dateLostFound = null;
    this._imageUrl = null;
  }

  setUserId(userId)           { this._userId = userId;               return this; }
  setType(type)               { this._type = type;                   return this; }
  setTitle(title)             { this._title = title;                 return this; }
  setDescription(description) { this._description = description;     return this; }
  setCategory(category)       { this._category = category;           return this; }
  setLocation(location)       { this._location = location;           return this; }
  setDateLostFound(date)      { this._dateLostFound = date;          return this; }
  setImageUrl(imageUrl)       { this._imageUrl = imageUrl;           return this; }

  /**
   * Validates required fields and returns the constructed ItemReport.
   * @returns {ItemReport}
   */
  build() {
    const required = {
      userId: this._userId,
      type: this._type,
      title: this._title,
      description: this._description,
      location: this._location,
      dateLostFound: this._dateLostFound,
    };

    for (const [field, val] of Object.entries(required)) {
      if (!val) throw new Error(`ItemReportBuilder: "${field}" is required before calling build()`);
    }

    return new ItemReport(
      this._userId,
      this._type,
      this._title,
      this._description,
      this._category,
      this._location,
      this._dateLostFound,
      this._imageUrl
    );
  }

  /**
   * Resets the builder so it can be reused.
   */
  reset() {
    this._userId = null;
    this._type = null;
    this._title = null;
    this._description = null;
    this._category = 'GENERAL';
    this._location = null;
    this._dateLostFound = null;
    this._imageUrl = null;
    return this;
  }
}

// ── Director ─────────────────────────────────────────────────────────────
// Knows common report-creation recipes, uses the builder internally.

class ItemReportDirector {
  /**
   * @param {ItemReportBuilder} builder
   */
  constructor(builder) {
    this._builder = builder;
  }

  /**
   * Builds a minimal lost-item report (no image, default category).
   */
  buildMinimalLostReport(userId, title, description, location, date) {
    return this._builder
      .reset()
      .setUserId(userId)
      .setType('LOST')
      .setTitle(title)
      .setDescription(description)
      .setLocation(location)
      .setDateLostFound(date)
      .build();
  }

  /**
   * Builds a full found-item report with image and category.
   */
  buildFullFoundReport(userId, title, description, category, location, date, imageUrl) {
    return this._builder
      .reset()
      .setUserId(userId)
      .setType('FOUND')
      .setTitle(title)
      .setDescription(description)
      .setCategory(category)
      .setLocation(location)
      .setDateLostFound(date)
      .setImageUrl(imageUrl)
      .build();
  }
}

module.exports = { ItemReportBuilder, ItemReportDirector };