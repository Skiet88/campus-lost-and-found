'use strict';

/**
 * tests/creational_patterns/ItemReportAbstractFactory.test.js
 * Tests for Abstract Factory Pattern.
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'af-uuid') }));

const { LostItemFactory, FoundItemFactory } = require('../../creational_patterns/ItemReportAbstractFactory');
const ItemReport = require('../../src/ItemReport');
const AdminCase  = require('../../src/AdminCase');

const BASE_ARGS = ['user-001', 'Laptop', 'HP laptop left in lab', 'ELECTRONICS', 'Lab B', new Date(), 'admin-001'];

describe('ItemReportAbstractFactory (Abstract Factory)', () => {
  test('LostItemFactory creates a LOST ItemReport and an AdminCase together', () => {
    const factory = new LostItemFactory();
    const { report, adminCase } = factory.createReport(...BASE_ARGS);
    expect(report).toBeInstanceOf(ItemReport);
    expect(adminCase).toBeInstanceOf(AdminCase);
    expect(report.type).toBe('LOST');
  });

  test('FoundItemFactory creates a FOUND ItemReport', () => {
    const factory = new FoundItemFactory();
    const { report } = factory.createReport(...BASE_ARGS);
    expect(report.type).toBe('FOUND');
  });

  test('AdminCase is OPEN after factory creation', () => {
    const factory = new LostItemFactory();
    const { adminCase } = factory.createReport(...BASE_ARGS);
    expect(adminCase.status).toBe('OPEN');
  });

  test('FoundItemFactory adds a note to the AdminCase', () => {
    const factory = new FoundItemFactory();
    const { adminCase } = factory.createReport(...BASE_ARGS);
    expect(adminCase.notes[0].note).toContain('Found item logged');
  });

  test('ItemReport and AdminCase share the same itemId', () => {
    const factory = new LostItemFactory();
    const { report, adminCase } = factory.createReport(...BASE_ARGS);
    expect(adminCase.itemId).toBe(report.itemId);
  });
});