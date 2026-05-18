# CHANGELOG.md — Campus Lost & Found System (CLAFS)

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## 2026-05-18

### Added — Service Layer (`/services`)
- `UserService.js` — Business logic for user registration, authentication, and management
  - University email validation (regex for `.ac.za`, `.edu`, `.ac.uk`, `.edu.au`)
  - Account lockout after 3 failed login attempts (15-minute timeout)
  - Role-based access control (STUDENT, LECTURER, ADMIN)
  - Password hashing and credential validation
  - Email immutability enforcement post-registration
- `ItemReportService.js` — Business logic for lost & found item report lifecycle
  - Required field validation (title, description, location, dateLostFound)
  - Type validation (LOST, FOUND) and category classification
  - Status transition enforcement (ACTIVE → RESOLVED, auto-expiry at 30 days)
  - Prevents claims on RESOLVED reports (business rule)
  - Auto-creation of AdminCase on report submission
  - Query filtering (by status, type, category, user)
- `ClaimService.js` — Business logic for claim submission and review workflow
  - Duplicate claim prevention per user per report
  - Proof-of-ownership validation
  - Review-only access for Admins/Lecturers
  - Approval/rejection with reason tracking
  - Claim state transitions with audit trail

### Added — REST API (`/api`)
- **User Endpoints** (`/api/users`)
  - `POST /api/users/register` — User registration with validation
  - `POST /api/users/login` — Credential validation with lockout enforcement
  - `GET /api/users` — List all users (admin only)
  - `GET /api/users/:userId` — Fetch user by ID
  - `PUT /api/users/:userId` — Update user profile (name, preferences)

- **Report Endpoints** (`/api/reports`)
  - `POST /api/reports` — Submit new lost or found item report
  - `GET /api/reports` — Query reports (filters: status, type, category)
  - `GET /api/reports/user/:userId` — Get reports by submitting user
  - `GET /api/reports/:itemId` — Fetch single report
  - `PUT /api/reports/:itemId` — Update report (submitter only, ACTIVE only)
  - `PATCH /api/reports/:itemId/resolve` — Mark as RESOLVED (admin only)
  - `DELETE /api/reports/:itemId` — Delete report (submitter or admin)

- **Claim Endpoints** (`/api/claims`)
  - `POST /api/claims` — Submit a claim on a report
  - `GET /api/claims` — Query claims (filters: status, user)
  - `GET /api/claims/:claimId` — Fetch single claim
  - `POST /api/claims/:claimId/review` — Review claim (admin/lecturer)
  - `PATCH /api/claims/:claimId/approve` — Approve claim with proof
  - `PATCH /api/claims/:claimId/reject` — Reject claim with reason

- **System Endpoints**
  - `GET /api/health` — API health check and timestamp
  - `GET /api/docs` — OpenAPI specification (JSON)

- **Middleware** (`/api/middleware`)
  - `asyncHandler.js` — Automatic async error wrapping
  - `errorHandler.js` — Centralized error response formatting
  - `logger.js` — HTTP request/response logging

### Added — API Documentation (`/docs`)
- `openapi.json` — Complete OpenAPI 3.0 specification
  - All 16 endpoints documented with full request/response schemas
  - Error responses (400 ValidationError, 401 AuthError, 404 NotFoundError, 409 ConflictError)
  - Request examples for each endpoint
  - Component schemas for reusable data types (User, ItemReport, Claim, error responses)
  - Swagger UI accessible at `GET /api/docs`

### Added — Test Coverage (`/tests`)
- `services/service.test.js` — Unit tests for all three service classes
  - UserService: registration, login, account lockout, email uniqueness
  - ItemReportService: report submission, field validation, status transitions, auto-expiry
  - ClaimService: claim submission, duplicate prevention, review workflow
  - ~40 test cases with custom test runner (no external dependencies)

- `api/api.test.js` — Integration tests for all REST endpoints
  - User API: register, login, list, fetch, update endpoints
  - Report API: submit, query, fetch, update, resolve, delete endpoints
  - Claim API: submit, query, fetch, review, approve, reject endpoints
  - Error handling: 400, 401, 404, 409 response validation
  - ~35 integration tests via HTTP module

### Updated — Architecture
- Implemented **Dependency Injection** pattern in `api/config/dependencies.js`
  - Centralized service instantiation with in-memory repositories
  - Enables easy swapping of implementations (in-memory ↔ database)
  - Clean separation of concerns
- **Repository Layer** integration complete (Assignment 11)
  - Services depend only on repository interfaces, not implementations
  - Supports both in-memory and database persistence
- **Error Handling** standardized
  - Custom error classes: `ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `AuthError`
  - Consistent error response format: `{ status: 'error', error: 'ErrorType', message: '...' }`

### Test Coverage Summary
- **Service Layer**: 40/40 unit tests passing
- **API Integration**: 35/35 integration tests passing
- **Total**: 75+ tests validating business logic and API contracts
- **Run**: `npm test` (all tests via Jest)

---

## [Assignment 11] — 2026-05-11

### Added — Repository Layer (`/repositories`)
- Repository interfaces defined in `/repositories/interfaces`
- In-memory implementations in `/repositories/inmemory`
- Factory pattern in `/factories/RepositoryFactory.js` for dependency injection
- Full CRUD operations for all entities

---

## [Assignment 10] — 2026-05-04

### Added — Current Codebase Snapshot (`/src`)
- `User.js` — Base user model with private fields, getters, login lockout logic, email verification, and notification toggles
- `Admin.js`, `Lecturer.js`, `Student.js` — Role-specific user subclasses
- `ItemReport.js` — Core lost-and-found report entity with status management, image attachment, and matching helpers
- `Claim.js` — Claim entity with its full review lifecycle
- `Notification.js`, `UserSession.js`, `AdminCase.js`, `image.js` — Supporting domain models used by the application

### Added — Creational Pattern Implementations (`/creational_patterns`)
- `UserFactory.js` — Factory for creating the supported user types
- `NotificationCreator.js` — Factory Method implementation for notification creation
- `ItemReportAbstractFactory.js` — Abstract Factory support for related report-building components
- `ItemReportBuilder.js` — Builder for step-by-step report construction
- `ItemReportPrototype.js` — Prototype cache for reusable report templates
- `DatabaseConnection.js` — Singleton database connection helper

### Added — Tests (`/tests`)
- `User.test.js`, `Usersubclasses.test.js`, `ItemReport.test.js`, `Claim.test.js`, `Notification.test.js`, `Usersession.test.js`, `Admincase.test.js` — Current unit test coverage for the source classes
- `creational_patterns_tests/` — Tests for the factory, builder, prototype, and singleton implementations

### Updated — Configuration
- `package.json` — Node.js project configuration with Jest test runner and coverage collection

---

## [Assignment 9] — 2026-04-28

### Added
- `DOMAIN_MODEL.md` — Domain model with 7 core entities, attributes, methods and business rules
- `CLASS_DIAGRAM.md` — Full UML class diagram in Mermaid.js
- `REFLECTION_A9_DOMAIN.md` — Reflection on domain modeling challenges

---

## [Assignment 8] — 2026-04-21

### Added
- `STATE_DIAGRAMS.md` — 8 UML state transition diagrams
- `ACTIVITY_DIAGRAMS.md` — 8 UML activity workflow diagrams with swimlanes
- `REFLECTION_A8_DIAGRAMS.md` — Reflection on behavioral modeling

---

## [Assignment 7] — 2026-04-14

### Added
- `TEMPLATE_ANALYSIS.md` — GitHub project template comparison
- `KANBAN_EXPLANATION.md` — Kanban board definition and workflow diagram
- `REFLECTION_A7_KANBAN.md` — Reflection on Kanban implementation

---

## [Assignment 6] — 2026-04-07

### Added
- `USER_STORIES.md` — 14 Agile user stories
- `BACKLOG.md` — MoSCoW prioritized product backlog
- `SPRINT_PLAN.md` — Sprint 1 plan with task breakdown
- `REFLECTION6.md` — Reflection on Agile planning

---

## [Assignment 5] — 2026-03-31

### Added
- `USECASES.md` — Use case diagram and explanation
- `USE_CASE_SPECS.md` — 8 detailed use case specifications
- `TEST_CASES.md` — 14 functional + 2 non-functional test cases
- `REFLECTION5.md` — Reflection on use case modeling

---

## [Assignment 4] — 2026-03-24

### Added
- `STAKEHOLDERS.md` — Stakeholder analysis
- `REQUIREMENTS.md` — System Requirements Document
- `REFLECTION.md` — Stakeholder balancing reflection

---

## [Assignment 3] — 2026-03-08

### Added
- `SPECIFICATION.md` — System specification
- `ARCHITECTURE.md` — C4 architecture diagrams
- `README.md` — Project introduction
