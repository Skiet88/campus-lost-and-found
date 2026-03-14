# SPECIFICATION.md — Campus Lost & Found System

## Project Title
**Campus Lost & Found System (CLAFS)**

---

## Domain

**Domain:** Higher Education / Campus Services

The domain is a university campus environment where thousands of students, lecturers, and staff interact daily across multiple buildings, lecture halls, libraries, cafeterias, and outdoor spaces. In such a high-traffic environment, personal items are frequently lost or misplaced. The campus administration — typically through security or student services — acts as a coordination point for reuniting lost items with their owners. This system digitizes and streamlines that process.

---

## Problem Statement

On university campuses, lost and found management is largely manual and inefficient. Students who lose items must physically visit security offices or notice boards, with no guarantee their item has been reported. Conversely, students who find items have no easy way to report them or verify ownership.

The **Campus Lost & Found System (CLAFS)** aims to solve this by providing a centralized web-based platform where:
- Students and staff can **report lost or found items** with descriptions and photos
- Claimants can **submit claims** and go through a **verification process** before retrieval
- Campus Security/Admin can **manage and approve** all reports and claims
- All registered users receive **real-time notifications** for relevant activity

---

## Individual Scope & Feasibility Justification

This project is feasible as an individual postgraduate project for the following reasons:

1. **Bounded domain** — The system focuses on a single institution (a university campus), limiting the scope to a manageable set of users and workflows.
2. **Well-defined user roles** — Three user types (Student/Staff, Lecturer, and Admin/Security) with clear, non-overlapping responsibilities.
3. **Standard web technologies** — Can be built using widely available and well-documented technologies (React, Node.js, PostgreSQL, Cloudinary for images, Nodemailer for notifications).
4. **No complex integrations** — The system is self-contained, with only optional integration to a university email system for notifications.
5. **Incremental delivery** — Core features (reporting, searching, claiming) can be delivered first, with notifications and verification layered on top.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Users must be able to register and log in using their university email |
| FR-02 | Users must be able to report a lost item with title, description, location, date, and optional image |
| FR-03 | Users must be able to report a found item with the same fields as FR-02 |
| FR-04 | Users must be able to browse and search all active lost/found reports |
| FR-05 | Users must be able to submit a claim on a found item |
| FR-06 | Admin/Security must be able to review, approve, or reject claims |
| FR-07 | The system must send email/in-app notifications to relevant users on key events |
| FR-08 | Admin must be able to mark an item as returned/resolved |
| FR-09 | Users must be able to upload images when reporting items |
| FR-10 | The system must support role-based access control (Student, Staff, Admin) |

---

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | The system must be accessible via a web browser (responsive design) |
| NFR-02 | Image uploads must not exceed 5MB per file |
| NFR-03 | The system must handle at least 500 concurrent users |
| NFR-04 | All user data must be stored securely (hashed passwords, HTTPS) |
| NFR-05 | The system must have an uptime of at least 99% during business hours |

---

## User Roles

| Role | Description |
|------|-------------|
| **Student** | Can report lost/found items, search listings, and submit claims |
| **Lecturer/Staff** | Same as Student, with additional credibility in verification |
| **Admin / Campus Security** | Full access: manage all reports, approve/reject claims, resolve cases |

---

## Technology Stack (Proposed)

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Image Storage | Cloudinary |
| Authentication | JWT + bcrypt |
| Notifications | Nodemailer (email) + WebSockets (in-app) |
| Hosting | Render / Railway |
