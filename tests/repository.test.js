'use strict';

/**
 * repository.test.js — Unit Tests for In-Memory Repository Layer
 *
 * Tests all CRUD operations and domain-specific queries for:
 *   InMemoryUserRepository, InMemoryItemReportRepository,
 *   InMemoryClaimRepository, InMemoryNotificationRepository,
 *   InMemoryAdminCaseRepository, and RepositoryFactory.
 *
 * Run with:  npm test (via Jest)
 */

const InMemoryUserRepository       = require('../repositories/inmemory/InMemoryUserRepository');
const InMemoryItemReportRepository = require('../repositories/inmemory/InMemoryItemReportRepository');
const {
  InMemoryClaimRepository,
  InMemoryNotificationRepository,
  InMemoryAdminCaseRepository,
} = require('../repositories/inmemory/InMemoryOtherRepositories');
const RepositoryFactory = require('../factories/RepositoryFactory');

// ── Fixtures ──────────────────────────────────────────────────────────────

const user1 = { userId: 'u-001', name: 'Thabo Nkosi',     email: 'thabo@cput.ac.za',  role: 'STUDENT',  isVerified: true  };
const user2 = { userId: 'u-002', name: 'Dr. Fatima Adams', email: 'fatima@cput.ac.za', role: 'LECTURER', isVerified: false };
const user3 = { userId: 'u-003', name: 'Security Admin',   email: 'admin@cput.ac.za',  role: 'ADMIN',    isVerified: true  };

const report1 = { itemId: 'r-001', userId: 'u-001', type: 'LOST',  title: 'Blue Backpack',   category: 'BAGS',         status: 'ACTIVE'   };
const report2 = { itemId: 'r-002', userId: 'u-002', type: 'FOUND', title: 'Student ID Card',  category: 'ID DOCUMENTS', status: 'ACTIVE'   };
const report3 = { itemId: 'r-003', userId: 'u-001', type: 'LOST',  title: 'Laptop Charger',  category: 'ELECTRONICS',  status: 'RESOLVED' };

const claim1 = { claimId: 'c-001', itemId: 'r-002', claimantId: 'u-001', status: 'PENDING',  proofDescription: 'My photo is on the card — student number 210012345' };
const claim2 = { claimId: 'c-002', itemId: 'r-002', claimantId: 'u-003', status: 'REJECTED', proofDescription: 'I lost my student card near the library entrance on Thursday' };

const notif1 = { notificationId: 'n-001', userId: 'u-001', message: 'Claim submitted',  type: 'CLAIM_SUBMITTED', isRead: false };
const notif2 = { notificationId: 'n-002', userId: 'u-001', message: 'Claim approved',   type: 'CLAIM_APPROVED',  isRead: true  };
const notif3 = { notificationId: 'n-003', userId: 'u-002', message: 'Match found',      type: 'MATCH_FOUND',     isRead: false };

const case1 = { caseId: 'ac-001', itemId: 'r-001', adminId: 'u-003', status: 'OPEN'         };
const case2 = { caseId: 'ac-002', itemId: 'r-002', adminId: 'u-003', status: 'PENDING_CLAIM' };

// ══════════════════════════════════════════════════════════════════════════
// USER REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

describe('InMemoryUserRepository', () => {
  let userRepo;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
  });

  it('save() stores a user and returns it', () => {
    const saved = userRepo.save(user1);
    expect(saved.userId).toBe('u-001');
  });

  it('save() handles multiple users', () => {
    userRepo.save(user2);
    userRepo.save(user3);
    expect(userRepo.count()).toBe(2);
  });

  it('findById() returns correct user', () => {
    userRepo.save(user1);
    userRepo.save(user2);
    expect(userRepo.findById('u-002').name).toBe('Dr. Fatima Adams');
  });

  it('findById() returns null for unknown id', () => {
    expect(userRepo.findById('u-999')).toBeNull();
  });

  it('findAll() returns all users', () => {
    userRepo.save(user1);
    userRepo.save(user2);
    userRepo.save(user3);
    expect(userRepo.findAll().length).toBe(3);
  });

  it('exists() returns true for stored user', () => {
    userRepo.save(user1);
    expect(userRepo.exists('u-001')).toBe(true);
  });

  it('exists() returns false for unknown user', () => {
    expect(userRepo.exists('u-999')).toBe(false);
  });

  it('delete() removes a user', () => {
    userRepo.save(user1);
    userRepo.save({ userId: 'u-tmp', name: 'Temp', email: 'tmp@cput.ac.za', role: 'STUDENT', isVerified: false });
    userRepo.delete('u-tmp');
    expect(userRepo.findById('u-tmp')).toBeNull();
  });

  it('delete() returns false for unknown user', () => {
    expect(userRepo.delete('u-nobody')).toBe(false);
  });

  it('findByEmail() finds by email', () => {
    userRepo.save(user1);
    userRepo.save(user3);
    expect(userRepo.findByEmail('admin@cput.ac.za').userId).toBe('u-003');
  });

  it('findByEmail() returns null for unknown email', () => {
    expect(userRepo.findByEmail('nobody@cput.ac.za')).toBeNull();
  });

  it('findByRole() returns only STUDENT users', () => {
    userRepo.save(user1);
    userRepo.save(user2);
    const students = userRepo.findByRole('STUDENT');
    expect(students.length).toBe(1);
    expect(students[0].userId).toBe('u-001');
  });

  it('findVerified() returns only verified users', () => {
    userRepo.save(user1);
    userRepo.save(user2);
    userRepo.save(user3);
    expect(userRepo.findVerified().length).toBe(2);
  });

  it('save() rejects entity without userId', () => {
    expect(() => userRepo.save({ name: 'No ID' })).toThrow();
  });

  it('returned objects are copies — mutation does not affect store', () => {
    userRepo.save(user1);
    const found = userRepo.findById('u-001');
    found.name = 'HACKED';
    expect(userRepo.findById('u-001').name).toBe('Thabo Nkosi');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ITEM REPORT REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

describe('InMemoryItemReportRepository', () => {
  let reportRepo;

  beforeEach(() => {
    reportRepo = new InMemoryItemReportRepository();
  });

  it('save() and findById() round-trip', () => {
    reportRepo.save(report1);
    reportRepo.save(report2);
    reportRepo.save(report3);
    expect(reportRepo.findById('r-001').title).toBe('Blue Backpack');
  });

  it('count() reflects total', () => {
    reportRepo.save(report1);
    reportRepo.save(report2);
    reportRepo.save(report3);
    expect(reportRepo.count()).toBe(3);
  });

  it('findByUserId() returns reports for that user', () => {
    reportRepo.save(report1);
    reportRepo.save(report2);
    reportRepo.save(report3);
    expect(reportRepo.findByUserId('u-001').length).toBe(2);
  });

  it('findByStatus() returns only ACTIVE reports', () => {
    reportRepo.save(report1);
    reportRepo.save(report2);
    reportRepo.save(report3);
    expect(reportRepo.findByStatus('ACTIVE').length).toBe(2);
  });

  it('findByType() returns only FOUND reports', () => {
    reportRepo.save(report1);
    reportRepo.save(report2);
    reportRepo.save(report3);
    const found = reportRepo.findByType('FOUND');
    expect(found.length).toBe(1);
    expect(found[0].itemId).toBe('r-002');
  });

  it('findByCategory() returns ELECTRONICS reports', () => {
    reportRepo.save(report1);
    reportRepo.save(report2);
    reportRepo.save(report3);
    expect(reportRepo.findByCategory('ELECTRONICS').length).toBe(1);
  });

  it('delete() removes a report', () => {
    reportRepo.save(report1);
    reportRepo.save({ itemId: 'r-tmp', userId: 'u-001', type: 'LOST', title: 'Temp', category: 'OTHER', status: 'ACTIVE' });
    reportRepo.delete('r-tmp');
    expect(reportRepo.findById('r-tmp')).toBeNull();
  });

  it('save() rejects entity without itemId', () => {
    expect(() => reportRepo.save({ title: 'No ID' })).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// CLAIM REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

describe('InMemoryClaimRepository', () => {
  let claimRepo;

  beforeEach(() => {
    claimRepo = new InMemoryClaimRepository();
  });

  it('save() and findById() round-trip', () => {
    claimRepo.save(claim1);
    claimRepo.save(claim2);
    expect(claimRepo.findById('c-001').claimantId).toBe('u-001');
  });

  it('findByItemId() returns all claims for an item', () => {
    claimRepo.save(claim1);
    claimRepo.save(claim2);
    expect(claimRepo.findByItemId('r-002').length).toBe(2);
  });

  it('findByClaimantId() returns correct claims', () => {
    claimRepo.save(claim1);
    claimRepo.save(claim2);
    expect(claimRepo.findByClaimantId('u-001').length).toBe(1);
  });

  it('findByStatus() returns PENDING claims only', () => {
    claimRepo.save(claim1);
    claimRepo.save(claim2);
    expect(claimRepo.findByStatus('PENDING').length).toBe(1);
  });

  it('existsByClaimantAndItem() returns true when duplicate would occur', () => {
    claimRepo.save(claim1);
    claimRepo.save(claim2);
    expect(claimRepo.existsByClaimantAndItem('u-001', 'r-002')).toBe(true);
  });

  it('existsByClaimantAndItem() returns false when no duplicate', () => {
    claimRepo.save(claim1);
    claimRepo.save(claim2);
    expect(claimRepo.existsByClaimantAndItem('u-002', 'r-001')).toBe(false);
  });

  it('save() rejects entity without claimId', () => {
    expect(() => claimRepo.save({ itemId: 'r-001' })).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATION REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

describe('InMemoryNotificationRepository', () => {
  let notifRepo;

  beforeEach(() => {
    notifRepo = new InMemoryNotificationRepository();
  });

  it('save() and count() round-trip', () => {
    notifRepo.save(notif1);
    notifRepo.save(notif2);
    notifRepo.save(notif3);
    expect(notifRepo.count()).toBe(3);
  });

  it('findByUserId() returns only that user\'s notifications', () => {
    notifRepo.save(notif1);
    notifRepo.save(notif2);
    notifRepo.save(notif3);
    expect(notifRepo.findByUserId('u-001').length).toBe(2);
  });

  it('findUnreadByUserId() returns only unread', () => {
    notifRepo.save(notif1);
    notifRepo.save(notif2);
    notifRepo.save(notif3);
    const unread = notifRepo.findUnreadByUserId('u-001');
    expect(unread.length).toBe(1);
    expect(unread[0].notificationId).toBe('n-001');
  });

  it('markAllReadByUserId() marks all unread and returns count', () => {
    notifRepo.save(notif1);
    notifRepo.save(notif2);
    notifRepo.save(notif3);
    expect(notifRepo.markAllReadByUserId('u-001')).toBe(1);
    expect(notifRepo.findUnreadByUserId('u-001').length).toBe(0);
  });

  it('markAllReadByUserId() returns 0 when all already read', () => {
    notifRepo.save(notif1);
    notifRepo.save(notif2);
    notifRepo.save(notif3);
    notifRepo.markAllReadByUserId('u-001');
    expect(notifRepo.markAllReadByUserId('u-001')).toBe(0);
  });

  it('save() rejects entity without notificationId', () => {
    expect(() => notifRepo.save({ userId: 'u-001' })).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN CASE REPOSITORY
// ══════════════════════════════════════════════════════════════════════════

describe('InMemoryAdminCaseRepository', () => {
  let caseRepo;

  beforeEach(() => {
    caseRepo = new InMemoryAdminCaseRepository();
  });

  it('save() and findById() round-trip', () => {
    caseRepo.save(case1);
    caseRepo.save(case2);
    expect(caseRepo.findById('ac-001').itemId).toBe('r-001');
  });

  it('findByItemId() returns the correct case', () => {
    caseRepo.save(case1);
    caseRepo.save(case2);
    expect(caseRepo.findByItemId('r-002').caseId).toBe('ac-002');
  });

  it('findByItemId() returns null for unknown item', () => {
    caseRepo.save(case1);
    caseRepo.save(case2);
    expect(caseRepo.findByItemId('r-999')).toBeNull();
  });

  it('findByAdminId() returns all cases for that admin', () => {
    caseRepo.save(case1);
    caseRepo.save(case2);
    expect(caseRepo.findByAdminId('u-003').length).toBe(2);
  });

  it('findByStatus() returns only OPEN cases', () => {
    caseRepo.save(case1);
    caseRepo.save(case2);
    const open = caseRepo.findByStatus('OPEN');
    expect(open.length).toBe(1);
    expect(open[0].caseId).toBe('ac-001');
  });

  it('save() rejects entity without caseId', () => {
    expect(() => caseRepo.save({ itemId: 'r-001' })).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// REPOSITORY FACTORY
// ══════════════════════════════════════════════════════════════════════════

describe('RepositoryFactory', () => {
  beforeEach(() => {
    RepositoryFactory._resetAll();
  });

  it('getUserRepository("MEMORY") returns InMemoryUserRepository', () => {
    const repo = RepositoryFactory.getUserRepository('MEMORY');
    expect(repo).toBeInstanceOf(InMemoryUserRepository);
  });

  it('Factory returns same instance on repeated calls (singleton per type)', () => {
    const a = RepositoryFactory.getUserRepository('MEMORY');
    const b = RepositoryFactory.getUserRepository('MEMORY');
    expect(a).toBe(b);
  });

  it('getItemReportRepository("MEMORY") returns correct type', () => {
    const repo = RepositoryFactory.getItemReportRepository('MEMORY');
    expect(repo).toBeInstanceOf(InMemoryItemReportRepository);
  });

  it('getClaimRepository("MEMORY") returns correct type', () => {
    const repo = RepositoryFactory.getClaimRepository('MEMORY');
    expect(repo).toBeInstanceOf(InMemoryClaimRepository);
  });

  it('getNotificationRepository("MEMORY") returns correct type', () => {
    const repo = RepositoryFactory.getNotificationRepository('MEMORY');
    expect(repo).toBeInstanceOf(InMemoryNotificationRepository);
  });

  it('getAdminCaseRepository("MEMORY") returns correct type', () => {
    const repo = RepositoryFactory.getAdminCaseRepository('MEMORY');
    expect(repo).toBeInstanceOf(InMemoryAdminCaseRepository);
  });

  it('Unknown storageType throws descriptive error', () => {
    expect(() => RepositoryFactory.getUserRepository('BLOCKCHAIN')).toThrow();
  });

  it.skip('DATABASE storageType for User returns stub (throws on method call)', () => {
    const repo = RepositoryFactory.getUserRepository('DATABASE');
    expect(() => {
      repo.save({ userId: 'x' });
    }).toThrow();
  });
});
