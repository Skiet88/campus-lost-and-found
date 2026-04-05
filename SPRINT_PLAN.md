# SPRINT_PLAN.md — Sprint 1 Plan
## Campus Lost & Found System (CLAFS)

---

## Sprint Overview

| Field | Details |
|-------|---------|
| **Sprint Number** | Sprint 1 |
| **Duration** | 2 weeks (14 days) |
| **Start Date** | Week 1 of development |
| **Sprint Goal** | Deliver a working authentication system and core item reporting functionality as the foundation of the CLAFS MVP |
| **Team** | Solo developer (Mlungisi Mbuyazi) |
| **Total Story Points** | 16 |

---

## Sprint Goal Statement

> *"By the end of Sprint 1, a user will be able to register, log in, and submit a lost or found item report with an optional image upload — establishing the secure, functional foundation upon which all remaining CLAFS features will be built."*

This sprint delivers the **authentication layer** and **item reporting workflow** — the two most critical components of the MVP. Without these, no other feature (search, claims, notifications) can exist. Completing this sprint means CLAFS is functional end-to-end for its most basic use case: a student can create an account and report a lost or found item.

---

## Selected User Stories for Sprint 1

| Story ID | User Story | MoSCoW | Story Points |
|----------|------------|--------|-------------|
| US-001 | As a student, I want to register using my university email so that I can access the platform securely. | Must-have | 3 |
| US-002 | As a registered user, I want to log in with my email and password so that I can access my account. | Must-have | 2 |
| US-013 | As a system admin, I want passwords hashed and data transmitted over HTTPS so that user data is protected. | Must-have | 3 |
| US-008 | As a student, I want to upload a photo when reporting an item so that others can visually identify it. | Must-have | 3 |
| US-003 | As a student, I want to report a lost item with a title, description, location, date, and photo. | Must-have | 5 |

**Total: 16 story points**

---

## Sprint Backlog — Task Breakdown

### US-001: User Registration

| Task ID | Task Description | Assigned To | Estimated Hours | Status |
|---------|-----------------|-------------|-----------------|--------|
| T-001 | Set up PostgreSQL database and create `users` table schema | Dev Team | 3 | To Do |
| T-002 | Build POST /auth/register API endpoint with university email validation | Dev Team | 4 | To Do |
| T-003 | Implement bcrypt password hashing on registration | Dev Team | 2 | To Do |
| T-004 | Set up Nodemailer for verification email on registration | Dev Team | 3 | To Do |
| T-005 | Build React registration form with field validation | Dev Team | 4 | To Do |
| T-006 | Write unit tests for registration endpoint | Dev Team | 2 | To Do |

---

### US-002: User Login

| Task ID | Task Description | Assigned To | Estimated Hours | Status |
|---------|-----------------|-------------|-----------------|--------|
| T-007 | Build POST /auth/login API endpoint with JWT token generation | Dev Team | 3 | To Do |
| T-008 | Implement account lockout logic after 3 failed login attempts | Dev Team | 2 | To Do |
| T-009 | Build React login form with error handling | Dev Team | 3 | To Do |
| T-010 | Implement role-based dashboard redirect after login | Dev Team | 2 | To Do |
| T-011 | Write unit tests for login endpoint | Dev Team | 2 | To Do |

---

### US-013: Security (Passwords & HTTPS)

| Task ID | Task Description | Assigned To | Estimated Hours | Status |
|---------|-----------------|-------------|-----------------|--------|
| T-012 | Configure HTTPS and SSL certificate on hosting environment | Dev Team | 2 | To Do |
| T-013 | Implement HTTP → HTTPS redirect middleware in Express | Dev Team | 1 | To Do |
| T-014 | Verify bcrypt cost factor set to minimum 12 in registration logic | Dev Team | 1 | To Do |

---

### US-008: Image Upload (Cloudinary)

| Task ID | Task Description | Assigned To | Estimated Hours | Status |
|---------|-----------------|-------------|-----------------|--------|
| T-015 | Create Cloudinary account and configure API keys in .env | Dev Team | 1 | To Do |
| T-016 | Install and configure Multer middleware for file handling in Express | Dev Team | 2 | To Do |
| T-017 | Build image upload service that sends file to Cloudinary and returns URL | Dev Team | 3 | To Do |
| T-018 | Add file type and size validation (JPG/PNG, max 5MB) | Dev Team | 2 | To Do |
| T-019 | Build React image upload component with preview and error handling | Dev Team | 3 | To Do |

---

### US-003: Report Lost Item

| Task ID | Task Description | Assigned To | Estimated Hours | Status |
|---------|-----------------|-------------|-----------------|--------|
| T-020 | Create `items` table schema in PostgreSQL | Dev Team | 2 | To Do |
| T-021 | Build POST /items API endpoint for lost item submission | Dev Team | 4 | To Do |
| T-022 | Implement RBAC middleware to protect item routes (authenticated users only) | Dev Team | 2 | To Do |
| T-023 | Build React "Report Lost Item" form with all required fields | Dev Team | 5 | To Do |
| T-024 | Integrate image upload component into the report form | Dev Team | 2 | To Do |
| T-025 | Display confirmation message on successful submission | Dev Team | 1 | To Do |
| T-026 | Write integration tests for item reporting endpoint | Dev Team | 3 | To Do |

---

## Sprint 1 Timeline

| Day | Focus |
|-----|-------|
| Day 1–2 | Database setup, users table, registration API (T-001 to T-003) |
| Day 3 | Email verification, HTTPS config, security hardening (T-004, T-012 to T-014) |
| Day 4–5 | Login API, JWT, lockout logic (T-007 to T-011) |
| Day 6 | Cloudinary setup, Multer, image upload service (T-015 to T-018) |
| Day 7–8 | React registration and login forms (T-005, T-009, T-010) |
| Day 9–10 | Items table, report lost item API, RBAC middleware (T-020 to T-022) |
| Day 11–12 | React report form, image integration (T-023 to T-025) |
| Day 13 | Unit and integration tests (T-006, T-011, T-026) |
| Day 14 | Sprint review, bug fixes, documentation update, commit and push to GitHub |

---

## Definition of Done

A user story is considered **Done** when:
- All tasks for the story are completed
- The feature works end-to-end in the browser
- At least one unit or integration test passes for the backend logic
- Code is committed and pushed to the GitHub repository
- No critical bugs are open against the story
