'use strict';

/**
 * api.test.js — Integration Tests for REST API
 *
 * Tests all routes for Users, ItemReports, and Claims via HTTP.
 * Uses Node's built-in http module — no external test framework needed.
 *
 * Run: node tests/api/api.test.js
 */

const http    = require('http');
const { app } = require('../../api/app');

// ── Test Runner ────────────────────────────────────────────────────────────

let passed = 0, failed = 0;
const PORT = 3099;

function test(name, fn) {
  return fn().then(() => { console.log(`  ✅  ${name}`); passed++; })
             .catch(e => { console.error(`  ❌  ${name}\n       → ${e.message}`); failed++; });
}

function req(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: PORT, path, method, headers: { 'Content-Type': 'application/json' } };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function assert(c, m)    { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEqual(a, b, m) { if (a !== b) throw new Error(m || `"${a}" !== "${b}"`); }

// ── State shared across tests ──────────────────────────────────────────────

let studentId, adminId, reporterId, reportId, claimId;

// ══════════════════════════════════════════════════════════════════════════
async function runAll() {

  console.log('\n🌐  User API  /api/users');

  await test('POST /api/users/register → 201', async () => {
    const r = await req('POST', '/api/users/register', { name: 'Thabo Nkosi', email: 'thabo@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
    assertEqual(r.status, 201);
    assertEqual(r.body.status, 'success');
    studentId = r.body.data.userId;
  });

  await test('POST /api/users/register (admin)', async () => {
    const r = await req('POST', '/api/users/register', { name: 'Security Admin', email: 'admin@cput.ac.za', password: 'Pass1234', role: 'ADMIN' });
    assertEqual(r.status, 201);
    adminId = r.body.data.userId;
  });

  await test('POST /api/users/register (reporter)', async () => {
    const r = await req('POST', '/api/users/register', { name: 'Dr Fatima Adams', email: 'fatima@cput.ac.za', password: 'Pass1234', role: 'LECTURER' });
    assertEqual(r.status, 201);
    reporterId = r.body.data.userId;
  });

  await test('POST /api/users/register → 400 invalid email', async () => {
    const r = await req('POST', '/api/users/register', { name: 'X', email: 'x@gmail.com', password: 'Pass1234', role: 'STUDENT' });
    assertEqual(r.status, 400);
    assertEqual(r.body.error, 'ValidationError');
  });

  await test('POST /api/users/register → 409 duplicate email', async () => {
    const r = await req('POST', '/api/users/register', { name: 'Dup', email: 'thabo@cput.ac.za', password: 'Pass1234', role: 'STUDENT' });
    assertEqual(r.status, 409);
  });

  await test('POST /api/users/login → 200', async () => {
    const r = await req('POST', '/api/users/login', { email: 'thabo@cput.ac.za', password: 'Pass1234' });
    assertEqual(r.status, 200);
    assert(!r.body.data.passwordHash, 'passwordHash must not be returned');
  });

  await test('POST /api/users/login → 401 wrong password', async () => {
    const r = await req('POST', '/api/users/login', { email: 'thabo@cput.ac.za', password: 'WrongPass' });
    assertEqual(r.status, 401);
  });

  await test('GET /api/users → 200 list', async () => {
    const r = await req('GET', '/api/users');
    assertEqual(r.status, 200);
    assert(r.body.data.length >= 3);
  });

  await test('GET /api/users/:id → 200', async () => {
    const r = await req('GET', `/api/users/${studentId}`);
    assertEqual(r.status, 200);
    assertEqual(r.body.data.userId, studentId);
  });

  await test('GET /api/users/:id → 404 unknown', async () => {
    const r = await req('GET', '/api/users/u-unknown-999');
    assertEqual(r.status, 404);
  });

  await test('PATCH /api/users/:id/verify → 200', async () => {
    const r = await req('PATCH', `/api/users/${studentId}/verify`);
    assertEqual(r.status, 200);
    assertEqual(r.body.data.isVerified, true);
  });

  await test('PATCH /api/users/:id/verify → 409 already verified', async () => {
    const r = await req('PATCH', `/api/users/${studentId}/verify`);
    assertEqual(r.status, 409);
  });

  await test('PUT /api/users/:id → 200 name update', async () => {
    const r = await req('PUT', `/api/users/${studentId}`, { name: 'Thabo Updated' });
    assertEqual(r.status, 200);
    assertEqual(r.body.data.name, 'Thabo Updated');
  });

  await test('PUT /api/users/:id → 400 email change rejected', async () => {
    const r = await req('PUT', `/api/users/${studentId}`, { email: 'new@cput.ac.za' });
    assertEqual(r.status, 400);
  });

  // ── Report API ────────────────────────────────────────────────────────

  console.log('\n🌐  Item Report API  /api/reports');

  await test('POST /api/reports → 201 FOUND report', async () => {
    const r = await req('POST', '/api/reports', {
      userId: reporterId, type: 'FOUND', title: 'Blue JanSport Backpack',
      description: 'Dark blue backpack with broken front zip found near library entrance',
      category: 'BAGS', location: 'Library, 2nd Floor', dateLostFound: '2026-05-01',
    });
    assertEqual(r.status, 201);
    assertEqual(r.body.data.status, 'ACTIVE');
    reportId = r.body.data.itemId;
  });

  await test('POST /api/reports → 201 LOST report', async () => {
    const r = await req('POST', '/api/reports', {
      userId: studentId, type: 'LOST', title: 'Samsung Galaxy S24',
      description: 'Black Samsung phone with cracked screen protector left in Eng lab',
      category: 'ELECTRONICS', location: 'Engineering Lab B', dateLostFound: '2026-05-10',
    });
    assertEqual(r.status, 201);
  });

  await test('POST /api/reports → 400 missing title', async () => {
    const r = await req('POST', '/api/reports', {
      userId: studentId, type: 'LOST', title: '', description: 'some description here',
      location: 'Somewhere', dateLostFound: '2026-05-01',
    });
    assertEqual(r.status, 400);
  });

  await test('POST /api/reports → 400 future date', async () => {
    const r = await req('POST', '/api/reports', {
      userId: studentId, type: 'LOST', title: 'Test Item',
      description: 'A valid long description for this test item report',
      location: 'Somewhere', dateLostFound: '2099-01-01',
    });
    assertEqual(r.status, 400);
  });

  await test('GET /api/reports → 200 all reports', async () => {
    const r = await req('GET', '/api/reports');
    assertEqual(r.status, 200);
    assert(r.body.count >= 2);
  });

  await test('GET /api/reports?type=FOUND → filtered', async () => {
    const r = await req('GET', '/api/reports?type=FOUND');
    assertEqual(r.status, 200);
    assert(r.body.data.every(rpt => rpt.type === 'FOUND'));
  });

  await test('GET /api/reports?status=ACTIVE → filtered', async () => {
    const r = await req('GET', '/api/reports?status=ACTIVE');
    assertEqual(r.status, 200);
    assert(r.body.data.every(rpt => rpt.status === 'ACTIVE'));
  });

  await test('GET /api/reports/:itemId → 200', async () => {
    const r = await req('GET', `/api/reports/${reportId}`);
    assertEqual(r.status, 200);
    assertEqual(r.body.data.itemId, reportId);
  });

  await test('GET /api/reports/:itemId → 404 unknown', async () => {
    const r = await req('GET', '/api/reports/r-unknown-999');
    assertEqual(r.status, 404);
  });

  await test('PUT /api/reports/:itemId → 200 update', async () => {
    const r = await req('PUT', `/api/reports/${reportId}`, { requestingUserId: reporterId, title: 'Blue Backpack (Updated)' });
    assertEqual(r.status, 200);
    assertEqual(r.body.data.title, 'Blue Backpack (Updated)');
  });

  await test('PUT /api/reports/:itemId → 403 non-submitter', async () => {
    const r = await req('PUT', `/api/reports/${reportId}`, { requestingUserId: studentId, title: 'Hacked' });
    assertEqual(r.status, 403);
  });

  await test('GET /api/reports/user/:userId → 200', async () => {
    const r = await req('GET', `/api/reports/user/${reporterId}`);
    assertEqual(r.status, 200);
    assert(r.body.data.length >= 1);
  });

  // ── Claim API ─────────────────────────────────────────────────────────

  console.log('\n🌐  Claim API  /api/claims');

  await test('POST /api/claims → 201 submit claim', async () => {
    const r = await req('POST', '/api/claims', {
      itemId: reportId, claimantId: studentId,
      proofDescription: 'My student card is inside and has my photo and student number 210012345',
    });
    assertEqual(r.status, 201);
    assertEqual(r.body.data.status, 'PENDING');
    claimId = r.body.data.claimId;
  });

  await test('POST /api/claims → 400 short proof description', async () => {
    const r = await req('POST', '/api/claims', { itemId: reportId, claimantId: adminId, proofDescription: 'short' });
    assertEqual(r.status, 400);
  });

  await test('POST /api/claims → 409 duplicate claim', async () => {
    const r = await req('POST', '/api/claims', {
      itemId: reportId, claimantId: studentId,
      proofDescription: 'My student card is inside and has my photo and student number 210012345',
    });
    assertEqual(r.status, 409);
  });

  await test('POST /api/claims → 409 claiming own report', async () => {
    const r = await req('POST', '/api/claims', {
      itemId: reportId, claimantId: reporterId,
      proofDescription: 'Trying to claim my own report should not work ever',
    });
    assertEqual(r.status, 409);
  });

  await test('GET /api/claims → 200 all claims', async () => {
    const r = await req('GET', '/api/claims');
    assertEqual(r.status, 200);
    assert(r.body.count >= 1);
  });

  await test('GET /api/claims/:claimId → 200', async () => {
    const r = await req('GET', `/api/claims/${claimId}`);
    assertEqual(r.status, 200);
    assertEqual(r.body.data.claimId, claimId);
  });

  await test('GET /api/claims?status=PENDING → filtered', async () => {
    const r = await req('GET', '/api/claims?status=PENDING');
    assertEqual(r.status, 200);
    assert(r.body.data.every(c => c.status === 'PENDING'));
  });

  await test('GET /api/claims/item/:itemId → 200', async () => {
    const r = await req('GET', `/api/claims/item/${reportId}`);
    assertEqual(r.status, 200);
    assert(r.body.count >= 1);
  });

  await test('GET /api/claims/user/:claimantId → 200', async () => {
    const r = await req('GET', `/api/claims/user/${studentId}`);
    assertEqual(r.status, 200);
    assert(r.body.count >= 1);
  });

  await test('PATCH /api/claims/:claimId/review → 200', async () => {
    const r = await req('PATCH', `/api/claims/${claimId}/review`, { adminId });
    assertEqual(r.status, 200);
    assertEqual(r.body.data.status, 'UNDER_REVIEW');
  });

  await test('PATCH /api/claims/:claimId/review → 403 non-admin', async () => {
    const r = await req('PATCH', `/api/claims/${claimId}/review`, { adminId: studentId });
    assertEqual(r.status, 403);
  });

  await test('PATCH /api/claims/:claimId/approve → 200', async () => {
    const r = await req('PATCH', `/api/claims/${claimId}/approve`, { adminId });
    assertEqual(r.status, 200);
    assertEqual(r.body.data.status, 'APPROVED');
  });

  await test('GET /api/reports/:itemId after approval → RESOLVED', async () => {
    const r = await req('GET', `/api/reports/${reportId}`);
    assertEqual(r.body.data.status, 'RESOLVED');
  });

  await test('PATCH /api/claims/:claimId/reject → 400 missing reason', async () => {
    // submit a new claim on a new report to test rejection
    const newReport = await req('POST', '/api/reports', {
      userId: reporterId, type: 'FOUND', title: 'Silver Keys',
      description: 'Set of silver keys found near the cafeteria entrance early morning',
      category: 'KEYS', location: 'Cafeteria', dateLostFound: '2026-05-12',
    });
    const nrId = newReport.body.data.itemId;
    const newClaim = await req('POST', '/api/claims', {
      itemId: nrId, claimantId: studentId,
      proofDescription: 'These are my keys with a CPUT keyring that I got from orientation day last year',
    });
    const ncId = newClaim.body.data.claimId;
    const r = await req('PATCH', `/api/claims/${ncId}/reject`, { adminId, rejectionReason: '' });
    assertEqual(r.status, 400);
  });

  await test('GET /api/health → 200', async () => {
    const r = await req('GET', '/api/health');
    assertEqual(r.status, 200);
    assertEqual(r.body.status, 'ok');
  });

  await test('GET /api/docs → 200 OpenAPI spec', async () => {
    const r = await req('GET', '/api/docs');
    assertEqual(r.status, 200);
    assert(r.body.openapi, 'Should return OpenAPI spec');
  });

  await test('GET /api/unknown → 404', async () => {
    const r = await req('GET', '/api/unknown-route');
    assertEqual(r.status, 404);
  });

}

// ── Bootstrap ─────────────────────────────────────────────────────────────

const server = http.createServer(app);
server.listen(PORT, async () => {
  try {
    await runAll();
  } finally {
    server.close();
    console.log(`\n${'─'.repeat(54)}`);
    console.log(`Results: ${passed} passed  |  ${failed} failed`);
    if (failed > 0) { console.error('Some tests failed.'); process.exit(1); }
    else console.log('All tests passed ✅');
  }
});