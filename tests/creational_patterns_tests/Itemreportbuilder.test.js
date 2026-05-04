'use strict';

/**
 * tests/creational_patterns/ItemReportBuilder.test.js
 * Tests for Builder Pattern — ItemReportBuilder and ItemReportDirector.
 * Related issues: T-009, T-010
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'builder-uuid') }));

const { ItemReportBuilder, ItemReportDirector } = require('../../creational_patterns/ItemReportBuilder');
const ItemReport = require('../../src/ItemReport');

describe('ItemReportBuilder (Builder)', () => {
  test('builds a valid ItemReport with all required fields', () => {
    const builder = new ItemReportBuilder();
    const report = builder
      .setUserId('user-001')
      .setType('LOST')
      .setTitle('Blue Backpack')
      .setDescription('A blue backpack left in the cafeteria')
      .setCategory('BAGS')
      .setLocation('Cafeteria')
      .setDateLostFound(new Date('2026-04-01'))
      .build();

    expect(report).toBeInstanceOf(ItemReport);
    expect(report.title).toBe('Blue Backpack');
    expect(report.type).toBe('LOST');
    expect(report.category).toBe('BAGS');
  });

  test('throws if required field is missing before build()', () => {
    const builder = new ItemReportBuilder();
    builder.setUserId('user-001').setType('LOST').setTitle('Test');
    // Missing description, location, date
    expect(() => builder.build()).toThrow('"description" is required');
  });

  test('throws if userId not set', () => {
    const builder = new ItemReportBuilder();
    expect(() => builder.build()).toThrow('"userId" is required');
  });

  test('defaults category to GENERAL when not set', () => {
    const builder = new ItemReportBuilder();
    const report = builder
      .setUserId('u1').setType('FOUND').setTitle('Keys')
      .setDescription('A set of keys found near the library')
      .setLocation('Library').setDateLostFound(new Date())
      .build();
    expect(report.category).toBe('GENERAL');
  });

  test('imageUrl is null when not set', () => {
    const builder = new ItemReportBuilder();
    const report = builder
      .setUserId('u1').setType('LOST').setTitle('Wallet')
      .setDescription('A brown wallet with student ID inside it')
      .setLocation('Canteen').setDateLostFound(new Date())
      .build();
    expect(report.imageUrl).toBeNull();
  });

  test('reset() clears all fields so builder is reusable', () => {
    const builder = new ItemReportBuilder();
    builder.setUserId('u1').setType('LOST');
    builder.reset();
    expect(() => builder.build()).toThrow('"userId" is required');
  });

  test('fluent methods return the builder instance', () => {
    const builder = new ItemReportBuilder();
    expect(builder.setUserId('u1')).toBe(builder);
    expect(builder.setType('LOST')).toBe(builder);
  });
});

describe('ItemReportDirector (Builder)', () => {
  test('buildMinimalLostReport creates a LOST report', () => {
    const director = new ItemReportDirector(new ItemReportBuilder());
    const report = director.buildMinimalLostReport(
      'user-001', 'Laptop', 'HP laptop serial SN123456', 'Library', new Date()
    );
    expect(report.type).toBe('LOST');
    expect(report.imageUrl).toBeNull();
  });

  test('buildFullFoundReport creates a FOUND report with imageUrl', () => {
    const director = new ItemReportDirector(new ItemReportBuilder());
    const report = director.buildFullFoundReport(
      'user-001', 'Keys', 'A set of keys found outside D block', 'KEYS', 'Block D', new Date(),
      'https://res.cloudinary.com/test.jpg'
    );
    expect(report.type).toBe('FOUND');
    expect(report.imageUrl).toBe('https://res.cloudinary.com/test.jpg');
  });
});