# USER_STORIES.md — Agile User Stories
## Campus Lost & Found System (CLAFS)

---

## Overview

User stories are derived from the functional requirements defined in **Assignment 4 (REQUIREMENTS.md)** and the use cases modelled in **Assignment 5 (USECASES.md)**. Each story follows the format:

> *"As a [role], I want [action] so that [benefit]."*

All stories follow the **INVEST** criteria:
- **I**ndependent — can be developed without depending on another story
- **N**egotiable — details can be discussed and adjusted
- **V**aluable — delivers value to a specific user
- **E**stimable — can be reasonably sized
- **S**mall — completable within a single sprint
- **T**estable — has clear, verifiable acceptance criteria

---

## User Stories Table

| Story ID | Source | User Story | Acceptance Criteria | Priority |
|----------|--------|------------|---------------------|----------|
| US-001 | FR-01, UC-01 | As a **student**, I want to register using my university email so that I can access the CLAFS platform securely. | Registration rejects non-university emails. Verification email sent on signup. Duplicate emails show a clear error. | High |
| US-002 | FR-02, UC-01 | As a **registered user**, I want to log in with my email and password so that I can access my account and perform actions. | JWT token issued on success. Wrong password shows error. Account locks for 15 min after 3 failed attempts. Redirect to role-appropriate dashboard. | High |
| US-003 | FR-03, UC-02 | As a **student**, I want to report a lost item with a title, description, location, date, and photo so that others can help identify and return it. | All required fields validated before submission. Image upload accepts JPG/PNG under 5MB. Confirmation message appears within 3 seconds. Item saved with status ACTIVE. | High |
| US-004 | FR-04, UC-03 | As a **student**, I want to report a found item with details and a photo so that the rightful owner can be notified and reunite with their item. | Found item clearly labelled as FOUND in listings. System checks for matching lost reports on submission. Reporter receives confirmation notification. | High |
| US-005 | FR-05, UC-04 | As a **student**, I want to search and filter item reports by keyword, category, date, and location so that I can quickly find a specific lost or found item. | Search results load within 2 seconds for up to 10,000 records. Partial keyword matching works (e.g., "bag" returns "laptop bag"). Multiple filters work simultaneously. | High |
| US-006 | FR-06, UC-05 | As a **student**, I want to submit a claim on a found item by describing my proof of ownership so that I can recover my lost property through a verified process. | Claim description requires minimum 30 characters. Duplicate claims on same item are blocked. Admin notified within 1 minute of submission. Claimant receives confirmation. | High |
| US-007 | FR-07, UC-06 | As a **campus security admin**, I want to review all pending claims and approve or reject them with a reason so that only verified owners collect their items. | Admin dashboard lists all PENDING claims by default. Rejection requires a mandatory reason. Both claimant and reporter notified within 1 minute of decision. | High |
| US-008 | FR-08, UC-02 | As a **student**, I want to upload a photo when reporting an item so that others can visually identify it more easily. | Image stored on Cloudinary and accessible via URL. Image displayed on item detail page within 3 seconds. Report submittable without image if upload fails. | Medium |
| US-009 | FR-09, UC-07 | As a **registered user**, I want to receive in-app and email notifications for key events so that I am always informed about my reports and claims. | In-app notification appears within 1 minute of trigger. Email delivered within 5 minutes. User can mark notifications as read individually or all at once. | Medium |
| US-010 | FR-10, UC-08 | As a **campus security admin**, I want to mark an item as resolved once it has been physically returned so that the case is closed and the listing archived. | Only Admin can mark items as RESOLVED. Resolved items moved to archive, removed from active listings. Both reporter and claimant notified. | Medium |
| US-011 | FR-11 | As a **campus security admin**, I want to view a dashboard showing system statistics and export monthly reports so that I can monitor lost and found trends on campus. | Dashboard refreshes every 5 minutes. Monthly report exportable as CSV. Dashboard shows total active reports, resolved cases, and pending claims. | Medium |
| US-012 | FR-12 | As a **registered user**, I want to manage my profile and notification preferences so that I can control how the system communicates with me. | Profile updates saved immediately without page reload. Users can toggle email notifications on/off. University email cannot be changed after registration. | Low |
| US-013 | NFR-10, NFR-11 | As a **system admin**, I want all passwords hashed with bcrypt and all data transmitted over HTTPS so that user data is protected against breaches. | No plaintext passwords in the database. HTTP requests automatically redirect to HTTPS. SSL Labs scan returns grade A or above. | High |
| US-014 | NFR-08, NFR-13 | As a **system admin**, I want the system to handle 500 concurrent users with search results loading in under 2 seconds so that performance is maintained during peak usage. | Load test at 500 concurrent users shows average response time below 2 seconds. No timeouts during load test. | Medium |

---

## Traceability Summary

| Story ID | Assignment 4 Requirement | Assignment 5 Use Case |
|----------|--------------------------|-----------------------|
| US-001 | FR-01 | UC-01 |
| US-002 | FR-02 | UC-01 |
| US-003 | FR-03 | UC-02 |
| US-004 | FR-04 | UC-03 |
| US-005 | FR-05 | UC-04 |
| US-006 | FR-06 | UC-05 |
| US-007 | FR-07 | UC-06 |
| US-008 | FR-08 | UC-02 |
| US-009 | FR-09 | UC-07 |
| US-010 | FR-10 | UC-08 |
| US-011 | FR-11 | UC-12 |
| US-012 | FR-12 | — |
| US-013 | NFR-10, NFR-11 | — |
| US-014 | NFR-08, NFR-13 | — |
