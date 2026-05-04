'use strict';

/**
 * Notification.js
 * Simple entity for notifications used in tests.
 */

const { v4: uuidv4 } = require('uuid');

const VALID_TYPES = ['MATCH_FOUND', 'CLAIM_SUBMITTED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'ITEM_RESOLVED', 'CLAIM_APPROVED'];

class Notification {
  constructor(userId, message, type) {
    if (!userId) throw new Error('userId is required');
    if (!message) throw new Error('message is required');
    if (!VALID_TYPES.includes(type)) throw new Error('Invalid notification type');

    this._notificationId = uuidv4();
    this._userId = userId;
    this._message = message;
    this._type = type;
    this._deliveryStatus = 'QUEUED';
    this._isRead = false;
    this._retryCount = 0;
    this._createdAt = new Date();
  }

  get deliveryStatus() { return this._deliveryStatus; }
  get isRead() { return this._isRead; }
  get retryCount() { return this._retryCount; }
  get type() { return this._type; }
  get message() { return this._message; }

  sendNotification() {
    if (this._deliveryStatus === 'ABANDONED') throw new Error('Cannot send an ABANDONED notification');
    this._deliveryStatus = 'SENT';
  }

  markAsRead() { this._isRead = true; }

  static markAllAsRead(notifs) {
    if (!Array.isArray(notifs)) throw new Error('Expected an array');
    notifs.forEach(n => n.markAsRead());
  }

  retryDelivery() {
    if (this._deliveryStatus === 'SENT') throw new Error('Cannot retry an already sent notification');
    if (this._deliveryStatus === 'ABANDONED') throw new Error('Cannot retry an abandoned notification');
    this._retryCount += 1;
    if (this._retryCount >= 3) this._deliveryStatus = 'ABANDONED';
  }

  toJSON() {
    return {
      notificationId: this._notificationId,
      userId: this._userId,
      message: this._message,
      type: this._type,
      deliveryStatus: this._deliveryStatus,
      isRead: this._isRead,
      retryCount: this._retryCount,
      createdAt: this._createdAt,
    };
  }
}

module.exports = Notification;
