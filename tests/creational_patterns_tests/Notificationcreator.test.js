'use strict';

/**
 * tests/creational_patterns/NotificationCreator.test.js
 * Tests for Factory Method Pattern — NotificationCreator subclasses.
 * Related issues: US-011
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'notif-uuid') }));

const {
  ClaimSubmittedCreator,
  ClaimApprovedCreator,
  ClaimRejectedCreator,
  MatchFoundCreator,
  ItemResolvedCreator,
  NotificationCreator,
} = require('../../creational_patterns/NotificationCreator');

const Notification = require('../../src/Notification');

describe('NotificationCreator (Factory Method)', () => {
  test('abstract createNotification throws if not overridden', () => {
    const abstract = new NotificationCreator();
    expect(() => abstract.createNotification('u1', {})).toThrow('must be implemented by subclass');
  });

  test('ClaimSubmittedCreator produces CLAIM_SUBMITTED notification', () => {
    const creator = new ClaimSubmittedCreator();
    const n = creator.createNotification('user-001', { itemTitle: 'Laptop', claimantName: 'Bob' });
    expect(n).toBeInstanceOf(Notification);
    expect(n.type).toBe('CLAIM_SUBMITTED');
    expect(n.message).toContain('Laptop');
    expect(n.message).toContain('Bob');
  });

  test('ClaimApprovedCreator produces CLAIM_APPROVED notification', () => {
    const creator = new ClaimApprovedCreator();
    const n = creator.createNotification('user-001', { itemTitle: 'Keys' });
    expect(n.type).toBe('CLAIM_APPROVED');
    expect(n.message).toContain('Keys');
  });

  test('ClaimRejectedCreator includes rejection reason', () => {
    const creator = new ClaimRejectedCreator();
    const n = creator.createNotification('user-001', { itemTitle: 'Wallet', reason: 'Insufficient proof' });
    expect(n.type).toBe('CLAIM_REJECTED');
    expect(n.message).toContain('Insufficient proof');
  });

  test('MatchFoundCreator produces MATCH_FOUND notification', () => {
    const creator = new MatchFoundCreator();
    const n = creator.createNotification('user-001', { itemTitle: 'Backpack' });
    expect(n.type).toBe('MATCH_FOUND');
  });

  test('ItemResolvedCreator produces ITEM_RESOLVED notification', () => {
    const creator = new ItemResolvedCreator();
    const n = creator.createNotification('user-001', { itemTitle: 'Phone' });
    expect(n.type).toBe('ITEM_RESOLVED');
  });

  test('notify() sends the notification and returns it', () => {
    const creator = new ClaimApprovedCreator();
    const n = creator.notify('user-001', { itemTitle: 'Laptop' });
    expect(n.deliveryStatus).toBe('SENT');
  });
});