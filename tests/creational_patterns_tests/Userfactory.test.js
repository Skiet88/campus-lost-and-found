'use strict';

/**
 * tests/creational_patterns/UserFactory.test.js
 * Tests for Simple Factory Pattern — UserFactory.
 * Related issues: T-002, US-001
 */

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (plain) => `hashed_${plain}`),
  compare: jest.fn(async (plain, hash) => hash === `hashed_${plain}`),
}));

jest.mock('uuid', () => {
  let uuidCounter = 0;
  return { v4: jest.fn(() => `uuid-${++uuidCounter}`) };
}, { virtual: true });

const UserFactory  = require('../../creational_patterns/UserFactory');
const Admin        = require('../../src/Admin');
const Student      = require('../../src/Student');
const Lecturer     = require('../../src/Lecturer');

// counter is internal to the mock, no external reset needed

describe('UserFactory (Simple Factory)', () => {
  test('creates a Student with correct role', () => {
    const user = UserFactory.create('STUDENT', 'Bob', 'bob@cput.ac.za', 'Pass1234', { studentNumber: '219001' });
    expect(user).toBeInstanceOf(Student);
    expect(user.role).toBe('STUDENT');
    expect(user.studentNumber).toBe('219001');
  });

  test('creates a Lecturer with correct role', () => {
    const user = UserFactory.create('LECTURER', 'Carol', 'carol@cput.ac.za', 'Pass1234', { department: 'ICT' });
    expect(user).toBeInstanceOf(Lecturer);
    expect(user.department).toBe('ICT');
  });

  test('creates an Admin with correct role', () => {
    const user = UserFactory.create('ADMIN', 'Alice', 'alice@cput.ac.za', 'Pass1234');
    expect(user).toBeInstanceOf(Admin);
    expect(user.role).toBe('ADMIN');
  });

  test('throws for unknown role', () => {
    expect(() => UserFactory.create('GUEST', 'X', 'x@cput.ac.za', 'pass')).toThrow('Unknown role');
  });

  test('throws if STUDENT extras missing studentNumber', () => {
    expect(() => UserFactory.create('STUDENT', 'X', 'x@cput.ac.za', 'pass', {})).toThrow('studentNumber is required');
  });

  test('throws if LECTURER extras missing department', () => {
    expect(() => UserFactory.create('LECTURER', 'X', 'x@cput.ac.za', 'pass', {})).toThrow('department is required');
  });
});