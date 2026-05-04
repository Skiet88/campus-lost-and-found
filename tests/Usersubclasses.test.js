'use strict';

/**
 * tests/models/UserSubclasses.test.js
 * Tests for Admin, Student, and Lecturer — covers inheritance and subclass-specific behaviour.
 * Related issues: T-001, T-002, US-001
 */

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (plain) => `hashed_${plain}`),
  compare: jest.fn(async (plain, hash) => hash === `hashed_${plain}`),
}), { virtual: true });

jest.mock('uuid', () => {
  let uuidCounter = 0;
  return {
    v4: jest.fn(() => `mock-uuid-${++uuidCounter}`)
  };
}, { virtual: true });

const User    = require('../src/User');
const Admin   = require('../src/Admin');
const Student = require('../src/Student');
const Lecturer = require('../src/Lecturer');

// ── Admin ─────────────────────────────────────────────────────────────────

describe('Admin', () => {
  test('extends User with role ADMIN', () => {
    const admin = new Admin('Alice Admin', 'alice@cput.ac.za', 'Pass1234');
    expect(admin).toBeInstanceOf(User);
    expect(admin.role).toBe('ADMIN');
  });

  test('manageItemReports returns action object', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    const result = admin.manageItemReports();
    expect(result.action).toBe('MANAGE_ITEM_REPORTS');
  });

  test('manageClaims returns action object', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    expect(admin.manageClaims().action).toBe('MANAGE_CLAIMS');
  });

  test('viewDashboard returns managedCasesCount', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    const dash = admin.viewDashboard();
    expect(dash).toHaveProperty('managedCasesCount', 0);
  });

  test('exportReport throws for unsupported format', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    expect(() => admin.exportReport('EXCEL')).toThrow('Unsupported export format');
  });

  test('exportReport succeeds for CSV and PDF', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    expect(admin.exportReport('CSV').format).toBe('CSV');
    expect(admin.exportReport('PDF').format).toBe('PDF');
  });

  test('trackCase adds caseId to managedCases', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    admin.trackCase('case-001');
    expect(admin.managedCases).toContain('case-001');
  });

  test('trackCase does not add duplicates', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    admin.trackCase('case-001');
    admin.trackCase('case-001');
    expect(admin.managedCases.length).toBe(1);
  });

  test('toJSON includes adminId', () => {
    const admin = new Admin('Alice', 'alice@cput.ac.za', 'Pass1234');
    const json = admin.toJSON();
    expect(json).toHaveProperty('adminId');
  });
});

// ── Student ───────────────────────────────────────────────────────────────

describe('Student', () => {
  test('extends User with role STUDENT', () => {
    const student = new Student('Bob Student', 'bob@cput.ac.za', 'Pass1234', '219012345');
    expect(student).toBeInstanceOf(User);
    expect(student.role).toBe('STUDENT');
  });

  test('throws if studentNumber is missing', () => {
    expect(() => new Student('Bob', 'bob@cput.ac.za', 'Pass1234')).toThrow('studentNumber is required');
  });

  test('reportLostItem records the item', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    student.reportLostItem('item-001');
    expect(student.reportedItems[0].itemId).toBe('item-001');
    expect(student.reportedItems[0].type).toBe('LOST');
  });

  test('reportFoundItem records the item', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    student.reportFoundItem('item-002');
    expect(student.reportedItems[0].type).toBe('FOUND');
  });

  test('reportLostItem throws if itemId is missing', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    expect(() => student.reportLostItem('')).toThrow('itemId is required');
  });

  test('submitClaim records the claim', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    student.submitClaim('claim-001');
    expect(student.submittedClaims[0].claimId).toBe('claim-001');
  });

  test('searchItems throws if query is empty', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    expect(() => student.searchItems('')).toThrow('Search query cannot be empty');
  });

  test('searchItems returns result object with query', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    const result = student.searchItems('laptop');
    expect(result.query).toBe('laptop');
  });

  test('toJSON includes studentNumber', () => {
    const student = new Student('Bob', 'bob@cput.ac.za', 'Pass1234', '219012345');
    expect(student.toJSON().studentNumber).toBe('219012345');
  });
});

// ── Lecturer ──────────────────────────────────────────────────────────────

describe('Lecturer', () => {
  test('extends User with role LECTURER', () => {
    const lec = new Lecturer('Carol Lecturer', 'carol@cput.ac.za', 'Pass1234', 'Computer Science');
    expect(lec).toBeInstanceOf(User);
    expect(lec.role).toBe('LECTURER');
  });

  test('throws if department is missing', () => {
    expect(() => new Lecturer('Carol', 'carol@cput.ac.za', 'Pass1234')).toThrow('department is required');
  });

  test('department getter returns correct value', () => {
    const lec = new Lecturer('Carol', 'carol@cput.ac.za', 'Pass1234', 'ICT');
    expect(lec.department).toBe('ICT');
  });

  test('reportLostItem and reportFoundItem work', () => {
    const lec = new Lecturer('Carol', 'carol@cput.ac.za', 'Pass1234', 'ICT');
    lec.reportLostItem('item-L1');
    lec.reportFoundItem('item-F1');
    expect(lec._reportedItems).toHaveLength(2);
  });

  test('submitClaim records claim', () => {
    const lec = new Lecturer('Carol', 'carol@cput.ac.za', 'Pass1234', 'ICT');
    lec.submitClaim('claim-L01');
    expect(lec._submittedClaims[0].claimId).toBe('claim-L01');
  });

  test('toJSON includes department', () => {
    const lec = new Lecturer('Carol', 'carol@cput.ac.za', 'Pass1234', 'ICT');
    expect(lec.toJSON().department).toBe('ICT');
  });
});