# ROADMAP.md — CLAFS Feature Roadmap

**Campus Lost & Found System**
Author: Mlungisi Mbuyazi | CPUT ICT: Application Development 2026

This roadmap outlines planned features for CLAFS beyond the current academic sprint. Items are grouped by priority and complexity to help contributors pick work that matches their skill level.

---

## Current Status (Completed)

| Assignment | Feature | Status |
|---|---|---|
| A9 | Domain model — 7 entities with full business rules | ✅ Done |
| A10 | All 6 creational design patterns implemented | ✅ Done |
| A11 | Repository layer — in-memory + factory abstraction | ✅ Done |
| A12 | Service layer + REST API (Users, Reports, Claims) | ✅ Done |
| A13 | CI/CD pipeline — GitHub Actions (lint, test, security, release) | ✅ Done |
| A14 | Open-source readiness — CONTRIBUTING, ROADMAP, LICENSE, issues | ✅ Done |

---

## Phase 1 — Database & Persistence (Next Sprint)

These items replace the current in-memory storage with real PostgreSQL persistence. The repository layer (Assignment 11) was designed specifically to make this swap seamless.

### 1.1 PostgreSQL Integration
**Effort:** Medium | **Label:** `feature-request`

- Implement `DatabaseUserRepository`, `DatabaseItemReportRepository`, etc. (stubs already exist in `factories/stubs/`)
- Set up database schema using migration files (`/migrations`)
- Wire `RepositoryFactory` to read `process.env.STORAGE_TYPE` and switch automatically
- Add a `docker-compose.yml` for local PostgreSQL setup

### 1.2 Database Migrations
**Effort:** Small | **Label:** `good-first-issue`

- Add a `/migrations` folder with SQL schema files for all 7 entities
- Write a migration runner script (`npm run migrate`)
- Document the schema in `ARCHITECTURE.md`

### 1.3 Connection Pooling
**Effort:** Small | **Label:** `good-first-issue`

- Update `DatabaseConnection.js` (Singleton pattern) to use `pg.Pool` instead of a single client
- Add environment variable documentation to README

---

## Phase 2 — Authentication & Security

### 2.1 JWT Authentication Middleware
**Effort:** Medium | **Label:** `feature-request`

- Generate JWT tokens on successful login (`/api/users/login`)
- Add `authenticate` middleware to all protected routes
- Add `authorize(role)` middleware for admin-only routes
- Refresh token support

### 2.2 Rate Limiting
**Effort:** Small | **Label:** `good-first-issue`

- Add `express-rate-limit` to `/api/users/login` (max 5 attempts per 15 minutes per IP)
- Add global rate limiting to all API routes
- Return `429 Too Many Requests` with a `Retry-After` header

### 2.3 Input Sanitisation
**Effort:** Small | **Label:** `good-first-issue`

- Add `helmet` middleware for security headers
- Sanitise all string inputs to prevent XSS
- Add request size limits to the Express body parser

---

## Phase 3 — Search & Discovery

### 3.1 Full-Text Search on Reports
**Effort:** Medium | **Label:** `feature-request`

- Add `GET /api/reports/search?q=backpack` endpoint
- Implement keyword matching across `title`, `description`, and `location` fields
- Add pagination (`?page=1&limit=20`) to all list endpoints

### 3.2 Location-Based Filtering
**Effort:** Medium | **Label:** `feature-request`

- Add campus building/location taxonomy (Library, Engineering Block, etc.)
- Filter reports by campus zone: `GET /api/reports?zone=library`
- Add a `GET /api/reports/stats` endpoint returning counts by category and status

### 3.3 Image Upload via Cloudinary
**Effort:** Large | **Label:** `feature-request`

- Integrate Cloudinary SDK for image upload
- Add `POST /api/reports/:itemId/image` endpoint
- Store image URL in `ItemReport.imageUrl`
- Validate file type and size before upload

---

## Phase 4 — Notifications

### 4.1 Email Notifications via Nodemailer
**Effort:** Medium | **Label:** `feature-request`

- Implement `EmailNotificationCreator` (Factory Method pattern already scaffolded)
- Send email on: claim submitted, claim approved, claim rejected, report expiring soon
- Use environment variables for SMTP credentials
- Add email templates in `/api/templates/`

### 4.2 Real-Time Notifications via WebSockets
**Effort:** Large | **Label:** `feature-request`

- Add `socket.io` to the Express server
- Emit events to connected users when their claim status changes
- Add a `GET /api/notifications` endpoint for notification history
- Mark notifications as read: `PATCH /api/notifications/:id/read`

---

## Phase 5 — Frontend (React)

### 5.1 React Application Scaffold
**Effort:** Large | **Label:** `feature-request`

- Initialise a React app in `/client` using Vite
- Connect to the existing REST API
- Implement pages: Home, Report Item, Browse Reports, My Claims, Admin Dashboard

### 5.2 Responsive UI Components
**Effort:** Medium | **Label:** `good-first-issue`

- Build a reusable `ItemReportCard` component
- Build a `ClaimStatusBadge` component
- Mobile-first layout using Tailwind CSS

---

## Phase 6 — DevOps & Infrastructure

### 6.1 Docker Support
**Effort:** Small | **Label:** `good-first-issue`

- Add `Dockerfile` for the Node.js API
- Add `docker-compose.yml` with API + PostgreSQL services
- Document Docker setup in `README.md`

### 6.2 Deploy to Render / Railway
**Effort:** Medium | **Label:** `feature-request`

- Add deployment job to `.github/workflows/ci.yml`
- Trigger auto-deploy to Render on merge to `main`
- Add environment variable documentation

### 6.3 Redis Caching
**Effort:** Large | **Label:** `feature-request`

- Add Redis for caching `GET /api/reports` responses (TTL: 5 minutes)
- Invalidate cache on report create/update/delete
- Add cache hit/miss metrics to the health endpoint

---

## Contributing to the Roadmap

If you want to propose a new feature:

1. Open an issue with the label `feature-request`
2. Describe: what the feature does, why it's needed, and how it fits the existing architecture
3. Reference the relevant domain entity or service it would modify

Items on this roadmap are not guaranteed to be implemented — they represent direction, not commitment. Priority can shift based on academic requirements and contributor interest.
