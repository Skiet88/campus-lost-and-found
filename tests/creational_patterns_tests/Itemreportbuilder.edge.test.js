'use strict';

/**
 * tests/creational_patterns_tests/Itemreportbuilder.edge.test.js
 * Edge-case tests for ItemReportBuilder and ItemReportDirector.
 * Covers: per-field validation, empty/falsy values, director reset behaviour.
 * Addresses issue #26.
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'edge-uuid') }));

const { ItemReportBuilder, ItemReportDirector } = require('../../creational_patterns/ItemReportBuilder');

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Returns a builder pre-filled with every required field. */
function fullyFilledBuilder() {
  return new ItemReportBuilder()
    .setUserId('user-edge')
    .setType('LOST')
    .setTitle('Test Item')
    .setDescription('A detailed description of the test item')
    .setLocation('Main Campus')
    .setDateLostFound(new Date('2026-05-01'));
}

// ── Per-field required-validation tests ───────────────────────────────────────
describe('ItemReportBuilder — per-field required validation', () => {
  test('throws when userId is missing', () => {
    const b = fullyFilledBuilder();
    b._userId = null;
    expect(() => b.build()).toThrow('"userId" is required');
  });

  test('throws when type is missing', () => {
    const b = fullyFilledBuilder();
    b._type = null;
    expect(() => b.build()).toThrow('"type" is required');
  });

  test('throws when title is missing', () => {
    const b = fullyFilledBuilder();
    b._title = null;
    expect(() => b.build()).toThrow('"title" is required');
  });

  test('throws when description is missing', () => {
    const b = fullyFilledBuilder();
    b._description = null;
    expect(() => b.build()).toThrow('"description" is required');
  });

  test('throws when location is missing', () => {
    const b = fullyFilledBuilder();
    b._location = null;
    expect(() => b.build()).toThrow('"location" is required');
  });

  test('throws when dateLostFound is missing', () => {
    const b = fullyFilledBuilder();
    b._dateLostFound = null;
    expect(() => b.build()).toThrow('"dateLostFound" is required');
  });
});

// ── Empty / falsy value tests ─────────────────────────────────────────────────
describe('ItemReportBuilder — empty string / falsy values', () => {
  test('empty string for userId is treated as missing', () => {
    const b = fullyFilledBuilder().setUserId('');
    expect(() => b.build()).toThrow('"userId" is required');
  });

  test('empty string for type is treated as missing', () => {
    const b = fullyFilledBuilder().setType('');
    expect(() => b.build()).toThrow('"type" is required');
  });

  test('empty string for title is treated as missing', () => {
    const b = fullyFilledBuilder().setTitle('');
    expect(() => b.build()).toThrow('"title" is required');
  });

  test('empty string for description is treated as missing', () => {
    const b = fullyFilledBuilder().setDescription('');
    expect(() => b.build()).toThrow('"description" is required');
  });

  test('empty string for location is treated as missing', () => {
    const b = fullyFilledBuilder().setLocation('');
    expect(() => b.build()).toThrow('"location" is required');
  });
});

// ── Director reset behaviour tests ────────────────────────────────────────────
describe('ItemReportDirector — reset behaviour', () => {
  test('director resets builder before each build, allowing consecutive builds', () => {
    const builder = new ItemReportBuilder();
    const director = new ItemReportDirector(builder);

    const first = director.buildMinimalLostReport(
      'user-1', 'Umbrella', 'A black umbrella left at reception', 'Reception', new Date()
    );
    const second = director.buildMinimalLostReport(
      'user-2', 'Jacket', 'A grey hoodie found on bench outside', 'Quad Area', new Date()
    );

    expect(first.title).toBe('Umbrella');
    expect(second.title).toBe('Jacket');
  });

  test('after director builds a report, the shared builder is in a reset state', () => {
    const builder = new ItemReportBuilder();
    const director = new ItemReportDirector(builder);

    director.buildMinimalLostReport(
      'user-1', 'Phone', 'A cracked phone found near the canteen', 'Canteen', new Date()
    );

    // Director called reset() and then set fields; after build() the builder
    // retains those values — calling build() again should succeed (not throw).
    // This documents that the builder is NOT auto-reset AFTER build().
    expect(() => builder.build()).not.toThrow();
  });

  test('director buildFullFoundReport resets then builds correctly', () => {
    const builder = new ItemReportBuilder();
    const director = new ItemReportDirector(builder);

    // First build a LOST report via director
    director.buildMinimalLostReport(
      'user-1', 'Watch', 'A silver watch found in the parking lot', 'Parking Lot', new Date()
    );

    // Then build a FOUND report — director must reset internally first
    const found = director.buildFullFoundReport(
      'user-2', 'Bag', 'A red bag found outside the library', 'BAGS', 'Library', new Date(),
      'https://example.com/bag.jpg'
    );

    expect(found.type).toBe('FOUND');
    expect(found.category).toBe('BAGS');
    expect(found.imageUrl).toBe('https://example.com/bag.jpg');
  });
});
