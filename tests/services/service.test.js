'use strict';

/**
 * service.test.js — Unit Tests for Service Layer
 *
 * Tests all business logic in UserService, ItemReportService, ClaimService.
 * Uses in-memory repositories — zero external dependencies.
 *
 * Run: node tests/services/service.test.js
 */

const {
  UserRepository,
  ItemReportRepository,
  ClaimRepository,
  NotificationRepository,
  AdminCaseRepository,
} = require('../../repositories');

const { UserService }       = require('../../services/UserService');
const { ItemReportService } = require('../../services/ItemReportService');
const { ClaimService }      = require('../../services/ClaimService');

// ── Test Runner ────────────────────────────────────────────────────────────

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✅  ${name}`); passed++; }
  catch (e) { console.error(`  ❌  ${name}\n       → ${e.message}`); failed++; }
}
function assert(c, m)    { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEqual(a, b, m) { if (a !== b) throw new Error(m || `"${a}" !== "${b}"`); }
function assertThrows(fn, expectedMsg) {
  try { fn(); throw new Error('Expected throw, got none'); }
  catch (e) {
    if (e.message === 'Expected throw, got none') throw e;
    if (expectedMsg) assert(e.message.includes(expectedMsg), `Expected "${expectedMsg}" in error, got "${e.message}"`);
  }
}

// ── Shared setup ───────────────────────────────────────────────────────────

function freshSetup() {
  const userRepo   = new UserRepository();
  const reportRepo = new ItemReportRepository();
  const claimRepo  = new ClaimRepository();
  const notifRepo  = new NotificationRepository();
  const caseRepo   = new AdminCaseRepository();
  const userSvc    = new UserService(userRepo);
  const reportSvc  = new ItemReportService(reportRepo, userRepo, caseRepo);
  const claimSvc   = new ClaimService(claimRepo, reportRepo, userRepo, notifRepo);
  return { userRepo, reportRepo, claimRepo, notifRepo, caseRepo, userSvc, reportSvc, claimSvc };
}

// ══════════════════════════════════════════════════════════════════════════
// USER SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════

console.log('\n🧪  UserService');

test('register() creates a user with valid data', () => {
  const { userSvc } = freshSetup();
  const user = userSvc.register({ name: 'Thabo Nkosi', email: 'thabo@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  assertEqual(user.email, 'thabo@cput.ac.za');
  assert(!user.passwordHash, 'passwordHash must not be returned');
});

test('register() rejects non-university email', () => {
  const { userSvc } = freshSetup();
  assertThrows(() => userSvc.register({ name: 'Thabo', email: 'thabo@gmail.com', password: 'Pass1234', role: 'STUDENT' }), 'university email');
});

test('register() rejects duplicate email', () => {
  const { userSvc } = freshSetup();
  userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  assertThrows(() => userSvc.register({ name: 'B', email: 'a@cput.ac.za', password: 'Pass1234', role: 'STUDENT' }), 'already exists');
});

test('register() rejects short password', () => {
  const { userSvc } = freshSetup();
  assertThrows(() => userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: '123', role: 'STUDENT' }), '8 characters');
});

test('register() rejects invalid role', () => {
  const { userSvc } = freshSetup();
  assertThrows(() => userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Pass1234', role: 'HACKER' }));
});

test('login() succeeds with correct credentials', () => {
  const { userSvc } = freshSetup();
  userSvc.register({ name: 'Thabo', email: 'thabo@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  const result = userSvc.login({ email: 'thabo@cput.ac.za', password: 'Pass1234' });
  assertEqual(result.email, 'thabo@cput.ac.za');
});

test('login() fails with wrong password', () => {
  const { userSvc } = freshSetup();
  userSvc.register({ name: 'Thabo', email: 'thabo@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  assertThrows(() => userSvc.login({ email: 'thabo@cput.ac.za', password: 'Wrong123' }), 'Invalid email');
});

test('login() locks account after 3 failed attempts', () => {
  const { userSvc } = freshSetup();
  userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Correct1', role: 'STUDENT' });
  try { userSvc.login({ email: 'a@cput.ac.za', password: 'wrong' }); } catch {}
  try { userSvc.login({ email: 'a@cput.ac.za', password: 'wrong' }); } catch {}
  try { userSvc.login({ email: 'a@cput.ac.za', password: 'wrong' }); } catch {}
  assertThrows(() => userSvc.login({ email: 'a@cput.ac.za', password: 'Correct1' }), 'locked');
});

test('login() resets failedLoginAttempts on success', () => {
  const { userSvc, userRepo } = freshSetup();
  userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Correct1', role: 'STUDENT' });
  try { userSvc.login({ email: 'a@cput.ac.za', password: 'wrong' }); } catch {}
  userSvc.login({ email: 'a@cput.ac.za', password: 'Correct1' });
  const stored = userRepo.findByEmail('a@cput.ac.za');
  assertEqual(stored.failedLoginAttempts, 0);
});

test('updateProfile() prevents email change', () => {
  const { userSvc } = freshSetup();
  const user = userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  assertThrows(() => userSvc.updateProfile(user.userId, { email: 'new@cput.ac.za' }), 'cannot be changed');
});

test('verifyEmail() marks user as verified', () => {
  const { userSvc } = freshSetup();
  const user = userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  const verified = userSvc.verifyEmail(user.userId);
  assert(verified.isVerified);
});

test('verifyEmail() throws if already verified', () => {
  const { userSvc } = freshSetup();
  const user = userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  userSvc.verifyEmail(user.userId);
  assertThrows(() => userSvc.verifyEmail(user.userId), 'already verified');
});

test('getUserById() throws 404 for unknown user', () => {
  const { userSvc } = freshSetup();
  assertThrows(() => userSvc.getUserById('u-999'), 'not found');
});

test('deleteUser() removes the user', () => {
  const { userSvc } = freshSetup();
  const user = userSvc.register({ name: 'A', email: 'a@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  userSvc.deleteUser(user.userId);
  assertThrows(() => userSvc.getUserById(user.userId));
});

// ══════════════════════════════════════════════════════════════════════════
// ITEM REPORT SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════

console.log('\n🧪  ItemReportService');

function setupWithUsers() {
  const s = freshSetup();
  s.student = s.userSvc.register({ name: 'Thabo', email: 'thabo@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  s.admin   = s.userSvc.register({ name: 'Admin', email: 'admin@cput.ac.za',  password: 'Pass1234', role: 'ADMIN' });
  s.baseReport = {
    userId: s.student.userId,
    type: 'FOUND',
    title: 'Blue Backpack',
    description: 'Dark blue JanSport with broken front zip found near library',
    category: 'BAGS',
    location: 'Library, 2nd Floor',
    dateLostFound: '2026-05-01',
  };
  return s;
}

test('submitReport() creates a report with status ACTIVE', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  const r = reportSvc.submitReport(baseReport);
  assertEqual(r.status, 'ACTIVE');
  assert(r.itemId, 'itemId must be generated');
});

test('submitReport() auto-creates an AdminCase', () => {
  const { reportSvc, caseRepo, baseReport } = setupWithUsers();
  const r = reportSvc.submitReport(baseReport);
  const c = caseRepo.findByItemId(r.itemId);
  assert(c, 'AdminCase should be auto-created');
  assertEqual(c.status, 'OPEN');
});

test('submitReport() rejects missing title', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  assertThrows(() => reportSvc.submitReport({ ...baseReport, title: '' }), 'Title');
});

test('submitReport() rejects short description', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  assertThrows(() => reportSvc.submitReport({ ...baseReport, description: 'short' }), 'Description');
});

test('submitReport() rejects future date', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  const future = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  assertThrows(() => reportSvc.submitReport({ ...baseReport, dateLostFound: future }), 'future');
});

test('submitReport() rejects unknown user', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  assertThrows(() => reportSvc.submitReport({ ...baseReport, userId: 'u-unknown' }), 'not found');
});

test('markAsResolved() only works for ADMIN', () => {
  const { reportSvc, student, baseReport } = setupWithUsers();
  const r = reportSvc.submitReport(baseReport);
  assertThrows(() => reportSvc.markAsResolved(r.itemId, student.userId), 'ADMIN');
});

test('markAsResolved() marks report RESOLVED', () => {
  const { reportSvc, admin, baseReport } = setupWithUsers();
  const r = reportSvc.submitReport(baseReport);
  const resolved = reportSvc.markAsResolved(r.itemId, admin.userId);
  assertEqual(resolved.status, 'RESOLVED');
});

test('updateReport() blocked on RESOLVED report', () => {
  const { reportSvc, admin, student, baseReport } = setupWithUsers();
  const r = reportSvc.submitReport(baseReport);
  reportSvc.markAsResolved(r.itemId, admin.userId);
  assertThrows(() => reportSvc.updateReport(r.itemId, student.userId, { title: 'New' }), 'RESOLVED');
});

test('updateReport() blocked for non-submitter', () => {
  const { reportSvc, admin, baseReport } = setupWithUsers();
  const r = reportSvc.submitReport(baseReport);
  assertThrows(() => reportSvc.updateReport(r.itemId, admin.userId, { title: 'New' }), 'submitter');
});

test('getReportsByType() filters correctly', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  reportSvc.submitReport({ ...baseReport, type: 'FOUND' });
  reportSvc.submitReport({ ...baseReport, type: 'LOST', title: 'Lost Keys' });
  assertEqual(reportSvc.getReportsByType('FOUND').length, 1);
  assertEqual(reportSvc.getReportsByType('LOST').length, 1);
});

test('getReportsByStatus() returns ACTIVE reports', () => {
  const { reportSvc, baseReport } = setupWithUsers();
  reportSvc.submitReport(baseReport);
  reportSvc.submitReport({ ...baseReport, title: 'Another Item' });
  assertEqual(reportSvc.getReportsByStatus('ACTIVE').length, 2);
});

// ══════════════════════════════════════════════════════════════════════════
// CLAIM SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════

console.log('\n🧪  ClaimService');

function setupWithReport() {
  const s = setupWithUsers();
  s.reporter = s.userSvc.register({ name: 'Fatima', email: 'fatima@cput.ac.za', password: 'Pass1234', role: 'LECTURER' });
  s.report   = s.reportSvc.submitReport({ ...s.baseReport, userId: s.reporter.userId, type: 'FOUND' });
  s.baseClaim = {
    itemId: s.report.itemId,
    claimantId: s.student.userId,
    proofDescription: 'My student card has my photo and student number 210012345 — it is my blue backpack',
  };
  return s;
}

test('submitClaim() creates a PENDING claim', () => {
  const { claimSvc, baseClaim } = setupWithReport();
  const c = claimSvc.submitClaim(baseClaim);
  assertEqual(c.status, 'PENDING');
  assert(c.claimId, 'claimId must be generated');
});

test('submitClaim() sends a notification to report owner', () => {
  const { claimSvc, notifRepo, baseClaim, reporter } = setupWithReport();
  claimSvc.submitClaim(baseClaim);
  const notifs = notifRepo.findByUserId(reporter.userId);
  assert(notifs.length > 0, 'Notification should be sent to report owner');
  assertEqual(notifs[0].type, 'CLAIM_SUBMITTED');
});

test('submitClaim() rejects proof < 30 chars', () => {
  const { claimSvc, baseClaim } = setupWithReport();
  assertThrows(() => claimSvc.submitClaim({ ...baseClaim, proofDescription: 'too short' }), '30 characters');
});

test('submitClaim() prevents duplicate claim from same user', () => {
  const { claimSvc, baseClaim } = setupWithReport();
  claimSvc.submitClaim(baseClaim);
  assertThrows(() => claimSvc.submitClaim(baseClaim), 'already submitted');
});

test('submitClaim() prevents claiming own report', () => {
  const { claimSvc, baseClaim, reporter } = setupWithReport();
  assertThrows(() => claimSvc.submitClaim({ ...baseClaim, claimantId: reporter.userId }), 'own report');
});

test('submitClaim() rejects claim on RESOLVED report', () => {
  const { claimSvc, reportSvc, admin, baseClaim, report } = setupWithReport();
  reportSvc.markAsResolved(report.itemId, admin.userId);
  assertThrows(() => claimSvc.submitClaim(baseClaim), 'RESOLVED');
});

test('submitClaim() rejects claim on LOST report', () => {
  const { claimSvc, reportSvc, student, baseClaim, baseReport } = setupWithReport();
  const lostReport = reportSvc.submitReport({ ...baseReport, userId: student.userId, type: 'LOST', title: 'Lost Phone' });
  assertThrows(() => claimSvc.submitClaim({ ...baseClaim, itemId: lostReport.itemId }), 'FOUND');
});

test('reviewClaim() moves claim to UNDER_REVIEW', () => {
  const { claimSvc, admin, baseClaim } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  const reviewed = claimSvc.reviewClaim(claim.claimId, admin.userId);
  assertEqual(reviewed.status, 'UNDER_REVIEW');
});

test('reviewClaim() rejected for non-admin', () => {
  const { claimSvc, student, baseClaim } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  assertThrows(() => claimSvc.reviewClaim(claim.claimId, student.userId), 'ADMIN');
});

test('approveClaim() marks claim APPROVED and report RESOLVED', () => {
  const { claimSvc, reportSvc, admin, baseClaim, report } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  const approved = claimSvc.approveClaim(claim.claimId, admin.userId);
  assertEqual(approved.status, 'APPROVED');
  assertEqual(reportSvc.getReportById(report.itemId).status, 'RESOLVED');
});

test('approveClaim() auto-rejects other claims on same item', () => {
  const s = setupWithReport();
  const { claimSvc, admin, baseClaim, userSvc } = s;
  const other = userSvc.register({ name: 'Other', email: 'other@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
  const claim1 = claimSvc.submitClaim(baseClaim);
  const claim2 = claimSvc.submitClaim({
    itemId: baseClaim.itemId,
    claimantId: other.userId,
    proofDescription: 'I can also prove ownership because I have the serial number of the laptop inside',
  });
  claimSvc.approveClaim(claim1.claimId, admin.userId);
  assertEqual(claimSvc.getClaimById(claim2.claimId).status, 'REJECTED');
});

test('approveClaim() sends CLAIM_APPROVED notification to winner', () => {
  const { claimSvc, admin, notifRepo, baseClaim, student } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  claimSvc.approveClaim(claim.claimId, admin.userId);
  const notifs = notifRepo.findByUserId(student.userId).filter(n => n.type === 'CLAIM_APPROVED');
  assert(notifs.length > 0, 'Winner should receive CLAIM_APPROVED notification');
});

test('rejectClaim() requires rejectionReason', () => {
  const { claimSvc, admin, baseClaim } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  assertThrows(() => claimSvc.rejectClaim(claim.claimId, admin.userId, ''), 'rejection reason');
});

test('rejectClaim() marks claim REJECTED and sends notification', () => {
  const { claimSvc, admin, notifRepo, baseClaim, student } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  const rejected = claimSvc.rejectClaim(claim.claimId, admin.userId, 'Insufficient proof provided');
  assertEqual(rejected.status, 'REJECTED');
  const notifs = notifRepo.findByUserId(student.userId).filter(n => n.type === 'CLAIM_REJECTED');
  assert(notifs.length > 0);
});

test('cancelClaim() only works for claimant', () => {
  const { claimSvc, admin, baseClaim } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  assertThrows(() => claimSvc.cancelClaim(claim.claimId, admin.userId), 'own claim');
});

test('cancelClaim() removes the claim', () => {
  const { claimSvc, baseClaim, student } = setupWithReport();
  const claim = claimSvc.submitClaim(baseClaim);
  claimSvc.cancelClaim(claim.claimId, student.userId);
  assertThrows(() => claimSvc.getClaimById(claim.claimId), 'not found');
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(54)}`);
console.log(`Results: ${passed} passed  |  ${failed} failed`);
if (failed > 0) { console.error('Some tests failed.'); process.exit(1); }
else console.log('All tests passed ✅');