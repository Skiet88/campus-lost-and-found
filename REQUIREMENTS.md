# REQUIREMENTS.md — System Requirements Document (SRD)
## Campus Lost & Found System (CLAFS)

---

## 1. Introduction

This System Requirements Document (SRD) defines the functional and non-functional requirements for the Campus Lost & Found System (CLAFS). All requirements are derived from the stakeholder analysis conducted in `STAKEHOLDERS.md` and are traceable to specific stakeholder concerns.

**System:** Campus Lost & Found System (CLAFS)
**Domain:** Higher Education / Campus Services
**Version:** 1.0
**Date:** March 2026

---

## 2. Functional Requirements

Functional requirements describe what the system **shall do** — its capabilities and behaviours.

### FR-01: User Registration
**Requirement:** The system shall allow students, lecturers, and staff to register using their university email address and a password.
**Stakeholder:** All Users (Students, Lecturers, Staff)
**Acceptance Criteria:**
- Registration must reject non-university email domains (e.g., gmail.com, yahoo.com)
- A verification email must be sent to the user upon registration
- Duplicate email registrations must return a clear error message

---

### FR-02: User Login & Role-Based Access
**Requirement:** The system shall authenticate users via email and password, and grant access based on their assigned role (Student, Staff, Admin).
**Stakeholder:** All Users, IT Department, Campus Security
**Acceptance Criteria:**
- Login must return a JWT token valid for 8 hours
- Admin users must be redirected to the admin dashboard upon login
- Three failed login attempts must trigger a temporary account lockout of 15 minutes

---

### FR-03: Report a Lost Item
**Requirement:** The system shall allow authenticated users to submit a lost item report including title, description, category, date lost, campus location, and an optional image.
**Stakeholder:** Students (Item Loser), Lecturers
**Acceptance Criteria:**
- All required fields (title, description, location, date) must be validated before submission
- Optional image upload must accept JPG and PNG files only, with a maximum size of 5MB
- A confirmation message must appear within 3 seconds of successful submission

---

### FR-04: Report a Found Item
**Requirement:** The system shall allow authenticated users to submit a found item report with the same fields as a lost item report.
**Stakeholder:** Students (Item Finder), Lecturers
**Acceptance Criteria:**
- Found item reports must be clearly labelled as "FOUND" and distinguished from lost reports in the UI
- The system must automatically check for potential matches with existing lost item reports upon submission
- Reporter must receive a confirmation notification upon successful submission

---

### FR-05: Search and Filter Item Reports
**Requirement:** The system shall allow all authenticated users to search and filter item reports by keyword, category, date range, and campus location.
**Stakeholder:** All Users
**Acceptance Criteria:**
- Search results must load within 2 seconds for datasets of up to 10,000 records
- Search must support partial keyword matching (e.g., searching "bag" returns "laptop bag", "backpack")
- Filter combinations must work together (e.g., category + location + date range simultaneously)

---

### FR-06: Submit a Claim on a Found Item
**Requirement:** The system shall allow authenticated users to submit a claim on a found item by providing a written description of proof of ownership.
**Stakeholder:** Students (Item Loser), Lecturers, Campus Security
**Acceptance Criteria:**
- A user may not submit more than one claim per item
- The claim description field must have a minimum of 30 characters to prevent vague submissions
- Admin must receive an in-app and email notification within 1 minute of a claim being submitted

---

### FR-07: Admin Claim Review and Approval
**Requirement:** The system shall allow Admin/Campus Security users to review all pending claims, view claimant details, and approve or reject claims with a reason.
**Stakeholder:** Campus Security / Admin
**Acceptance Criteria:**
- The admin dashboard must list all claims with status PENDING by default
- Admin must be required to provide a rejection reason before a rejection is saved
- Both the claimant and the item reporter must be notified within 1 minute of a claim decision

---

### FR-08: Image Upload for Item Reports
**Requirement:** The system shall allow users to upload a photo of the lost or found item when submitting a report.
**Stakeholder:** All Users, Campus Security
**Acceptance Criteria:**
- Uploaded images must be stored on Cloudinary and accessible via a public URL
- Images must be displayed on the item detail page within 3 seconds of page load
- If image upload fails, the report must still be submittable without the image

---

### FR-09: Real-Time Notifications
**Requirement:** The system shall send in-app and email notifications to users when: a potential item match is found, a claim is submitted on their item, or their claim status changes.
**Stakeholder:** All Users, Campus Security
**Acceptance Criteria:**
- In-app notifications must appear within 1 minute of the triggering event
- Email notifications must be delivered within 5 minutes via SMTP
- Users must be able to mark notifications as read individually or all at once

---

### FR-10: Mark Item as Resolved
**Requirement:** The system shall allow Admin to mark an item report as RESOLVED once the item has been physically returned to its owner.
**Stakeholder:** Campus Security / Admin, University Management
**Acceptance Criteria:**
- Only Admin users may mark an item as RESOLVED
- Resolved items must be removed from the active listings and moved to a resolved archive
- Both the reporter and the successful claimant must be notified when an item is marked RESOLVED

---

### FR-11: Admin Reporting Dashboard
**Requirement:** The system shall provide Admin with a dashboard showing summary statistics including total active reports, resolved cases, pending claims, and high-frequency lost item locations.
**Stakeholder:** Campus Security / Admin, University Management
**Acceptance Criteria:**
- Dashboard statistics must refresh automatically every 5 minutes
- Admin must be able to export a monthly report as a CSV file
- The dashboard must display a campus location heatmap of where items are most frequently lost

---

### FR-12: User Profile Management
**Requirement:** The system shall allow users to view and update their profile information including name, contact number, and notification preferences.
**Stakeholder:** All Users
**Acceptance Criteria:**
- Users must be able to toggle email notifications on or off from their profile settings
- Profile updates must be saved and reflected immediately without requiring a page reload
- Users must not be able to change their university email address after registration

---

## 3. Non-Functional Requirements

Non-functional requirements describe the **quality attributes** of the system — how well it performs its functions.

---

### 3.1 Usability

**NFR-01:** The system interface shall comply with WCAG 2.1 Level AA accessibility standards to ensure usability for users with visual or motor impairments.
**Measurable Criteria:** Automated accessibility audit (e.g., Lighthouse) score of 90 or above.

**NFR-02:** The system shall be fully responsive and usable on screen widths from 320px (mobile) to 2560px (desktop) without loss of functionality.
**Measurable Criteria:** All core user flows (report, search, claim) completable on a mobile device without horizontal scrolling.

**NFR-03:** New users shall be able to complete their first lost item report without external guidance.
**Measurable Criteria:** System Usability Scale (SUS) score of at least 80/100 from user testing with first-time users.

---

### 3.2 Deployability

**NFR-04:** The system shall be deployable on both Linux and Windows server environments using standard Node.js runtime (v18 or above).
**Measurable Criteria:** Full deployment achievable in under 2 hours by a single IT staff member following the provided deployment guide.

**NFR-05:** The system shall support containerised deployment using Docker, enabling consistent environments across development, staging, and production.
**Measurable Criteria:** A single `docker-compose up` command must bring up all services (frontend, backend, database) within 5 minutes.

---

### 3.3 Maintainability

**NFR-06:** The codebase shall maintain a minimum test coverage of 70% across all backend API routes and business logic modules.
**Measurable Criteria:** Coverage report generated via Jest must show 70% or above before each production deployment.

**NFR-07:** The system shall include a comprehensive API documentation guide (using Swagger/OpenAPI) accessible at `/api/docs` for future integrations.
**Measurable Criteria:** All 12+ API endpoints must be documented with request/response examples, status codes, and authentication requirements.

---

### 3.4 Scalability

**NFR-08:** The system shall support a minimum of 500 concurrent users during peak hours (e.g., start of semester) without degradation in response time.
**Measurable Criteria:** Load testing (via Apache JMeter or k6) must show average response time below 2 seconds at 500 concurrent users.

**NFR-09:** The database schema shall be designed to support horizontal scaling, allowing read replicas to be added without application-level changes.
**Measurable Criteria:** PostgreSQL read replica can be added and connected within 1 hour without modifying application code.

---

### 3.5 Security

**NFR-10:** All user passwords shall be hashed using bcrypt with a minimum cost factor of 12 before being stored in the database.
**Measurable Criteria:** No plaintext passwords found in the database under any circumstance. Verified by automated security test.

**NFR-11:** All data transmitted between the client and server shall be encrypted using TLS 1.2 or above (HTTPS enforced).
**Measurable Criteria:** HTTP requests must be automatically redirected to HTTPS. SSL Labs scan must return a grade of A or above.

**NFR-12:** The system shall implement input validation and sanitisation on all form fields to prevent SQL injection and Cross-Site Scripting (XSS) attacks.
**Measurable Criteria:** OWASP ZAP security scan must report zero high-severity vulnerabilities before go-live.

---

### 3.6 Performance

**NFR-13:** Search results shall be returned and displayed within 2 seconds for datasets of up to 10,000 item records.
**Measurable Criteria:** Measured via browser developer tools network tab under normal network conditions (fibre or LTE).

**NFR-14:** Image uploads shall be processed and the item report saved within 5 seconds under normal network conditions.
**Measurable Criteria:** Timed from the moment the user clicks "Submit" to the appearance of the confirmation message.

---

## 4. Requirements Traceability Matrix

| Requirement ID | Description | Stakeholder(s) |
|----------------|-------------|----------------|
| FR-01 | User Registration | All Users |
| FR-02 | Login & RBAC | All Users, IT, Security |
| FR-03 | Report Lost Item | Students, Lecturers |
| FR-04 | Report Found Item | Students, Lecturers |
| FR-05 | Search & Filter | All Users |
| FR-06 | Submit Claim | Students, Lecturers, Security |
| FR-07 | Admin Claim Review | Campus Security |
| FR-08 | Image Upload | All Users, Security |
| FR-09 | Notifications | All Users, Security |
| FR-10 | Mark as Resolved | Security, Management |
| FR-11 | Admin Dashboard | Security, Management |
| FR-12 | Profile Management | All Users |
| NFR-01 | WCAG Accessibility | New Students, All Users |
| NFR-02 | Responsive Design | All Users |
| NFR-03 | Usability Score | New Students |
| NFR-04 | Deployability (OS) | IT Department |
| NFR-05 | Docker Support | IT Department |
| NFR-06 | Test Coverage | IT Department |
| NFR-07 | API Documentation | IT Department |
| NFR-08 | Concurrent Users | IT, Management |
| NFR-09 | DB Scalability | IT Department |
| NFR-10 | Password Hashing | IT, All Users |
| NFR-11 | HTTPS / TLS | IT, All Users |
| NFR-12 | Input Validation | IT, All Users |
| NFR-13 | Search Performance | All Users |
| NFR-14 | Upload Performance | All Users |
