# CHANGELOG.md — Campus Lost & Found System (CLAFS)

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
