'use strict';

/**
 * test_ItemReportBuilder.edge.js — Edge-Case Tests for ItemReportBuilder
 *
 * Covers edge cases for the Builder and Director patterns:
 *   - Missing required fields
 *   - Invalid / empty string values
 *   - Optional fields behaviour
 *   - Builder reuse via reset()
 *   - Director recipes
 *
 * Relates to: Issue #26 — Add edge-case tests for ItemReportBuilder
 */

const { ItemReportBuilder, ItemReportDirector } = require('../creational_patterns/ItemReportBuilder');

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns a builder pre-filled with all required fields so individual
 * tests can remove just the field they want to test.
 */
function validBuilder() {
  return new ItemReportBuilder()
    .setUserId('user-123')
    .setType('LOST')
    .setTitle('Blue Laptop')
    .setDescription('Dell XPS 15, sticker on lid')
    .setLocation('Library, Floor 2')
    .setDateLostFound('2025-04-01');
}

// ── 1. Required field validation ──────────────────────────────────────────

describe('ItemReportBuilder — missing required fields', () => {

  test('throws when userId is missing', () => {
    const builder = new ItemReportBuilder()
      .setType('LOST')
      .setTitle('Blue Laptop')
      .setDescription('Dell XPS 15')
      .setLocation('Library')
      .setDateLostFound('2025-04-01');

    expect(() => builder.build()).toThrow('"userId" is required before calling build()');
  });

  test('throws when type is missing', () => {
    const builder = new ItemReportBuilder()
      .setUserId('user-123')
      .setTitle('Blue Laptop')
      .setDescription('Dell XPS 15')
      .setLocation('Library')
      .setDateLostFound('2025-04-01');

    expect(() => builder.build()).toThrow('"type" is required before calling build()');
  });

  test('throws when title is missing', () => {
    const builder = new ItemReportBuilder()
      .setUserId('user-123')
      .setType('LOST')
      .setDescription('Dell XPS 15')
      .setLocation('Library')
      .setDateLostFound('2025-04-01');

    expect(() => builder.build()).toThrow('"title" is required before calling build()');
  });

  test('throws when description is missing', () => {
    const builder = new ItemReportBuilder()
      .setUserId('user-123')
      .setType('LOST')
      .setTitle('Blue Laptop')
      .setLocation('Library')
      .setDateLostFound('2025-04-01');

    expect(() => builder.build()).toThrow('"description" is required before calling build()');
  });

  test('throws when location is missing', () => {
    const builder = new ItemReportBuilder()
      .setUserId('user-123')
      .setType('LOST')
      .setTitle('Blue Laptop')
      .setDescription('Dell XPS 15')
      .setDateLostFound('2025-04-01');

    expect(() => builder.build()).toThrow('"location" is required before calling build()');
  });

  test('throws when dateLostFound is missing', () => {
    const builder = new ItemReportBuilder()
      .setUserId('user-123')
      .setType('LOST')
      .setTitle('Blue Laptop')
      .setDescription('Dell XPS 15')
      .setLocation('Library');

    expect(() => builder.build()).toThrow('"dateLostFound" is required before calling build()');
  });

  test('throws when build() is called on a brand-new builder with no fields', () => {
    const builder = new ItemReportBuilder();
    expect(() => builder.build()).toThrow();
  });
});

// ── 2. Empty string / whitespace edge cases ───────────────────────────────

describe('ItemReportBuilder — empty string values', () => {

  test('throws when userId is an empty string', () => {
    const builder = validBuilder().setUserId('');
    expect(() => builder.build()).toThrow('"userId" is required before calling build()');
  });

  test('throws when title is an empty string', () => {
    const builder = validBuilder().setTitle('');
    expect(() => builder.build()).toThrow('"title" is required before calling build()');
  });

  test('throws when description is an empty string', () => {
    const builder = validBuilder().setDescription('');
    expect(() => builder.build()).toThrow('"description" is required before calling build()');
  });

  test('throws when location is an empty string', () => {
    const builder = validBuilder().setLocation('');
    expect(() => builder.build()).toThrow('"location" is required before calling build()');
  });

  test('throws when dateLostFound is an empty string', () => {
    const builder = validBuilder().setDateLostFound('');
    expect(() => builder.build()).toThrow('"dateLostFound" is required before calling build()');
  });
});

// ── 3. Optional fields behaviour ──────────────────────────────────────────

describe('ItemReportBuilder — optional fields', () => {

  test('builds successfully without imageUrl (defaults to null)', () => {
    const report = validBuilder().build();
    expect(report.imageUrl).toBeNull();
  });

  test('builds successfully with imageUrl provided', () => {
    const report = validBuilder()
      .setImageUrl('https://cdn.example.com/photo.jpg')
      .build();
    expect(report.imageUrl).toBe('https://cdn.example.com/photo.jpg');
  });

  test('category defaults to GENERAL when not set', () => {
    const report = validBuilder().build();
    expect(report.category).toBe('GENERAL');
  });

  test('category is overridden when explicitly set', () => {
    const report = validBuilder().setCategory('ELECTRONICS').build();
    expect(report.category).toBe('ELECTRONICS');
  });
});

// ── 4. Successful builds ──────────────────────────────────────────────────

describe('ItemReportBuilder — successful builds', () => {

  test('builds a LOST report with all required fields', () => {
    const report = validBuilder().build();

    expect(report.userId).toBe('user-123');
    expect(report.type).toBe('LOST');
    expect(report.title).toBe('Blue Laptop');
    expect(report.description).toBe('Dell XPS 15, sticker on lid');
    expect(report.location).toBe('Library, Floor 2');
    expect(report.dateLostFound).toBe('2025-04-01');
  });

  test('builds a FOUND report with all fields including image', () => {
    const report = new ItemReportBuilder()
      .setUserId('user-456')
      .setType('FOUND')
      .setTitle('Red Umbrella')
      .setDescription('Found near the canteen entrance')
      .setCategory('ACCESSORIES')
      .setLocation('Canteen')
      .setDateLostFound('2025-04-02')
      .setImageUrl('https://cdn.example.com/umbrella.jpg')
      .build();

    expect(report.type).toBe('FOUND');
    expect(report.category).toBe('ACCESSORIES');
    expect(report.imageUrl).toBe('https://cdn.example.com/umbrella.jpg');
  });
});

// ── 5. Builder reuse via reset() ──────────────────────────────────────────

describe('ItemReportBuilder — reset() behaviour', () => {

  test('reset() clears all fields so build() throws again', () => {
    const builder = validBuilder();
    builder.build(); // first build succeeds
    builder.reset();
    expect(() => builder.build()).toThrow(); // all fields cleared
  });

  test('reset() restores category default to GENERAL', () => {
    const builder = validBuilder().setCategory('ELECTRONICS');
    builder.reset();

    // Re-fill required fields after reset
    const report = builder
      .setUserId('user-789')
      .setType('LOST')
      .setTitle('Keys')
      .setDescription('Car keys, Toyota')
      .setLocation('Parking lot')
      .setDateLostFound('2025-04-03')
      .build();

    expect(report.category).toBe('GENERAL');
  });

  test('builder can be reused after reset() to build a different report', () => {
    const builder = validBuilder();
    const first = builder.build();

    builder
      .reset()
      .setUserId('user-999')
      .setType('FOUND')
      .setTitle('Student Card')
      .setDescription('Found on the ground near Block B')
      .setLocation('Block B')
      .setDateLostFound('2025-04-05');

    const second = builder.build();

    expect(first.title).toBe('Blue Laptop');
    expect(second.title).toBe('Student Card');
    expect(second.type).toBe('FOUND');
  });
});

// ── 6. Fluent interface (method chaining) ─────────────────────────────────

describe('ItemReportBuilder — fluent interface', () => {

  test('each setter returns the builder instance for chaining', () => {
    const builder = new ItemReportBuilder();

    expect(builder.setUserId('u1')).toBe(builder);
    expect(builder.setType('LOST')).toBe(builder);
    expect(builder.setTitle('t')).toBe(builder);
    expect(builder.setDescription('d')).toBe(builder);
    expect(builder.setCategory('GENERAL')).toBe(builder);
    expect(builder.setLocation('loc')).toBe(builder);
    expect(builder.setDateLostFound('2025-01-01')).toBe(builder);
    expect(builder.setImageUrl('http://img.com')).toBe(builder);
    expect(builder.reset()).toBe(builder);
  });
});

// ── 7. Director recipes ───────────────────────────────────────────────────

describe('ItemReportDirector', () => {

  let director;

  beforeEach(() => {
    director = new ItemReportDirector(new ItemReportBuilder());
  });

  test('buildMinimalLostReport creates a LOST report with default category', () => {
    const report = director.buildMinimalLostReport(
      'user-001', 'Glasses', 'Black framed glasses', 'Lecture Hall A', '2025-04-10'
    );

    expect(report.type).toBe('LOST');
    expect(report.category).toBe('GENERAL');
    expect(report.imageUrl).toBeNull();
    expect(report.title).toBe('Glasses');
  });

  test('buildFullFoundReport creates a FOUND report with image and category', () => {
    const report = director.buildFullFoundReport(
      'user-002', 'Wallet', 'Brown leather wallet', 'ACCESSORIES',
      'Cafeteria', '2025-04-11', 'https://cdn.example.com/wallet.jpg'
    );

    expect(report.type).toBe('FOUND');
    expect(report.category).toBe('ACCESSORIES');
    expect(report.imageUrl).toBe('https://cdn.example.com/wallet.jpg');
  });

  test('director throws if a required field is missing in minimal report', () => {
    expect(() =>
      director.buildMinimalLostReport('user-001', '', 'desc', 'location', '2025-04-10')
    ).toThrow('"title" is required before calling build()');
  });

  test('director can build two reports in sequence using the same builder', () => {
    const first = director.buildMinimalLostReport(
      'user-A', 'Phone', 'iPhone 14', 'Gym', '2025-04-12'
    );
    const second = director.buildMinimalLostReport(
      'user-B', 'Charger', 'USB-C charger', 'Lab', '2025-04-13'
    );

    expect(first.title).toBe('Phone');
    expect(second.title).toBe('Charger');
  });
});
