'use strict';

/**
 * UserFactory.js — Simple Factory Pattern
 *
 * Centralises the creation of User subtype instances.
 * The caller passes a role string; the factory returns the correct subclass
 * without the caller needing to know about Admin, Student, or Lecturer.
 *
 * CLAFS Use Case:
 *   When the POST /auth/register endpoint receives a role field it calls
 *   UserFactory.create() instead of manually branching on role.
 *   Relates to: T-002 (Build POST /auth/register), US-001
 *
 * Pattern: Simple Factory — one static method, no subclassing of the factory.
 */

const Admin = require('../src/Admin');
const Student = require('../src/Student');
const Lecturer = require('../src/Lecturer');

class UserFactory {
  /**
   * Creates the correct User subclass based on role.
   *
   * @param {'STUDENT'|'LECTURER'|'ADMIN'} role
   * @param {string} name
   * @param {string} email
   * @param {string} plainPassword
   * @param {object} [extras]  - role-specific extras:
   *                             STUDENT → { studentNumber }
   *                             LECTURER → { department }
   *                             ADMIN   → (none required)
   * @returns {Admin|Student|Lecturer}
   */
  static create(role, name, email, plainPassword, extras = {}) {
    switch (role) {
      case 'STUDENT':
        if (!extras.studentNumber) throw new Error('studentNumber is required for STUDENT role');
        return new Student(name, email, plainPassword, extras.studentNumber);

      case 'LECTURER':
        if (!extras.department) throw new Error('department is required for LECTURER role');
        return new Lecturer(name, email, plainPassword, extras.department);

      case 'ADMIN':
        return new Admin(name, email, plainPassword);

      default:
        throw new Error(`Unknown role: "${role}". Expected STUDENT, LECTURER, or ADMIN.`);
    }
  }
}

module.exports = UserFactory;