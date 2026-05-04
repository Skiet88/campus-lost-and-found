'use strict';

/**
 * NotificationCreator.js — Factory Method Pattern
 *
 * Defines an interface for creating Notification objects, but lets
 * concrete subclasses (ClaimNotificationCreator, MatchNotificationCreator)
 * decide which message template to use.
 *
 * CLAFS Use Case:
 *   Different events produce different notification messages.
 *   The system needs to create notifications without hard-coding message
 *   logic in a single place.
 *   Relates to: US-011 (Receive notifications), STATE_DIAGRAMS.md
 *
 * Pattern: Factory Method — abstract creator with concrete subclasses.
 */

const Notification = require('../src/Notification');

// ── Abstract Creator ──────────────────────────────────────────────────────

class NotificationCreator {
  /**
   * Factory method — subclasses must override this.
   * @param {string} userId
   * @param {object} context
   * @returns {Notification}
   */
  // eslint-disable-next-line no-unused-vars
  createNotification(userId, context) {
    throw new Error('createNotification() must be implemented by subclass');
  }

  /**
   * Template method: creates and immediately sends the notification.
   * @param {string} userId
   * @param {object} context
   * @returns {Notification}
   */
  notify(userId, context) {
    const notification = this.createNotification(userId, context);
    notification.sendNotification();
    return notification;
  }
}

// ── Concrete Creators ─────────────────────────────────────────────────────

class ClaimSubmittedCreator extends NotificationCreator {
  createNotification(userId, { itemTitle, claimantName }) {
    const message = `A new claim has been submitted for your item: "${itemTitle}" by ${claimantName}.`;
    return new Notification(userId, message, 'CLAIM_SUBMITTED');
  }
}

class ClaimApprovedCreator extends NotificationCreator {
  createNotification(userId, { itemTitle }) {
    const message = `Great news! Your claim for "${itemTitle}" has been approved. Please collect your item from Campus Security.`;
    return new Notification(userId, message, 'CLAIM_APPROVED');
  }
}

class ClaimRejectedCreator extends NotificationCreator {
  createNotification(userId, { itemTitle, reason }) {
    const message = `Your claim for "${itemTitle}" was rejected. Reason: ${reason}.`;
    return new Notification(userId, message, 'CLAIM_REJECTED');
  }
}

class MatchFoundCreator extends NotificationCreator {
  createNotification(userId, { itemTitle }) {
    const message = `A potential match was found for your lost item: "${itemTitle}". Check the portal for details.`;
    return new Notification(userId, message, 'MATCH_FOUND');
  }
}

class ItemResolvedCreator extends NotificationCreator {
  createNotification(userId, { itemTitle }) {
    const message = `The item report for "${itemTitle}" has been marked as resolved.`;
    return new Notification(userId, message, 'ITEM_RESOLVED');
  }
}

module.exports = {
  NotificationCreator,
  ClaimSubmittedCreator,
  ClaimApprovedCreator,
  ClaimRejectedCreator,
  MatchFoundCreator,
  ItemResolvedCreator,
};