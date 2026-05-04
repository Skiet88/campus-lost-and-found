'use strict';

/**
 * tests/models/Notification.test.js
 * Tests for Notification entity — delivery lifecycle, retry logic, read state.
 * Related issues: US-011
 */

jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-notif-uuid') }));

const Notification = require('../src/Notification');

function makeNotif(overrides = {}) {
  return new Notification(
    overrides.userId  || 'user-001',
    overrides.message || 'Your claim has been approved.',
    overrides.type    || 'CLAIM_APPROVED'
  );
}

describe('Notification — constructor', () => {
  test('creates with QUEUED delivery status', () => {
    const n = makeNotif();
    expect(n.deliveryStatus).toBe('QUEUED');
    expect(n.isRead).toBe(false);
    expect(n.retryCount).toBe(0);
  });

  test('throws for missing userId', () => {
    expect(() => new Notification('', 'msg', 'CLAIM_APPROVED')).toThrow('userId is required');
  });

  test('throws for invalid type', () => {
    expect(() => new Notification('u1', 'msg', 'INVALID_TYPE')).toThrow('Invalid notification type');
  });

  test('accepts all valid types', () => {
    const types = ['MATCH_FOUND', 'CLAIM_SUBMITTED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'ITEM_RESOLVED'];
    types.forEach(type => {
      expect(() => new Notification('u1', 'message', type)).not.toThrow();
    });
  });
});

describe('Notification — sendNotification()', () => {
  test('sets deliveryStatus to SENT', () => {
    const n = makeNotif();
    n.sendNotification();
    expect(n.deliveryStatus).toBe('SENT');
  });

  test('throws if notification is ABANDONED', () => {
    const n = makeNotif();
    n._deliveryStatus = 'ABANDONED';
    expect(() => n.sendNotification()).toThrow('Cannot send an ABANDONED notification');
  });
});

describe('Notification — markAsRead()', () => {
  test('sets isRead to true', () => {
    const n = makeNotif();
    n.markAsRead();
    expect(n.isRead).toBe(true);
  });
});

describe('Notification — markAllAsRead()', () => {
  test('marks all notifications in array as read', () => {
    const notifs = [makeNotif(), makeNotif(), makeNotif()];
    Notification.markAllAsRead(notifs);
    notifs.forEach(n => expect(n.isRead).toBe(true));
  });

  test('throws if argument is not an array', () => {
    expect(() => Notification.markAllAsRead('not-an-array')).toThrow('Expected an array');
  });
});

describe('Notification — retryDelivery()', () => {
  test('increments retryCount', () => {
    const n = makeNotif();
    n.retryDelivery();
    expect(n.retryCount).toBe(1);
  });

  test('marks as ABANDONED after 3 retries', () => {
    const n = makeNotif();
    n.retryDelivery();
    n.retryDelivery();
    n.retryDelivery();
    expect(n.deliveryStatus).toBe('ABANDONED');
  });

  test('throws if already SENT', () => {
    const n = makeNotif();
    n.sendNotification();
    expect(() => n.retryDelivery()).toThrow('already sent');
  });

  test('throws if already ABANDONED', () => {
    const n = makeNotif();
    n._deliveryStatus = 'ABANDONED';
    expect(() => n.retryDelivery()).toThrow('abandoned');
  });
});