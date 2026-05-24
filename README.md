# Campus Lost & Found System (CLAFS)

## Introduction

The **Campus Lost & Found System (CLAFS)** is a web-based application designed to help university students, lecturers, staff, and campus security efficiently manage lost and found items on campus.

Currently, lost and found management on most campuses is manual  relying on physical offices, notice boards, and word of mouth. CLAFS replaces this with a centralized digital platform where anyone on campus can report a lost or found item, upload a photo, and connect with the rightful owner through a structured claim and verification process.

Once completed, the system will allow users to:
- 📋 **Report** lost or found items with descriptions, location, date, and images
- 🔍 **Search and browse** all active reports across campus
- ✅ **Submit and track claims** for found items
- 🔔 **Receive notifications** when a match is found or a claim is updated
- 🛡️ **Admin tools** for Campus Security to manage, verify, and resolve cases

---


## Project Documents

### System Specification & Architecture

| Document | Description |
|----------|-------------|
| [SPECIFICATION.md](./SPECIFICATION.md) | Full system specification: domain, problem statement, scope, requirements, and technology stack |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | C4 architectural diagrams (Context, Container, Component, Code levels) using Mermaid |

---

###  Stakeholder & Requirements Analysis

| Document | Description |
|----------|-------------|
| [STAKEHOLDERS.md](./STAKEHOLDERS.md) | Stakeholder analysis: 7 stakeholders with roles, concerns, pain points, and success metrics |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | System Requirements Document: 12 functional + 14 non-functional requirements with traceability matrix |
| [REFLECTION.md](./REFLECTION.md) | Reflection on challenges faced balancing stakeholder needs |

---

### Use Case Modeling & Test Case Development

| Document | Description |
|----------|-------------|
| [USECASES.md](./USECASES.md) | Use case diagram (Mermaid) with written explanation of actors, relationships, and stakeholder alignment |
| [USE_CASE_SPECS.md](./USE_CASE_SPECS.md) | 8 detailed use case specifications with preconditions, postconditions, basic and alternative flows |
| [TEST_CASES.md](./TEST_CASES.md) | 14 functional test cases + 2 non-functional tests (performance & security) |
| [REFLECTION5.md](./REFLECTION5.md) | Reflection on challenges in translating requirements to use cases and test cases |

---

###  Agile Planning

| Document | Description |
|----------|-------------|
| [USER_STORIES.md](./USER_STORIES.md) | 14 user stories with acceptance criteria and priority, traced to requirements and use cases |
| [BACKLOG.md](./BACKLOG.md) | MoSCoW prioritized product backlog with Fibonacci story points and dependencies |
| [SPRINT_PLAN.md](./SPRINT_PLAN.md) | Sprint 1 goal, selected stories, task breakdown, timeline, and definition of done |
| [REFLECTION6.md](./REFLECTION6.md) | Reflection on challenges in Agile planning as a solo developer |

---
 
### GitHub Kanban Board & Template Analysis
 
| Document | Description |
|----------|-------------|
| [TEMPLATE_ANALYSIS.md](./TEMPLATE_ANALYSIS.md) | Comparison of 4 GitHub project templates with justification for Automated Kanban selection |
| [KANBAN_EXPLANATION.md](./KANBAN_EXPLANATION.md) | Definition of Kanban, board structure, WIP limits, and Agile alignment |
| [REFLECTION_A7_KANBAN.md](./REFLECTION_A7_KANBAN.md) | Reflection on template selection challenges and comparison with Trello and Jira |
 
---

### Object State Modeling & Activity Workflow Modeling
 
| Document | Description |
|----------|-------------|
| [STATE_DIAGRAMS.md](./STATE_DIAGRAMS.md) | 8 UML state transition diagrams for core system objects: Item Report, Claim, User Account, Notification, Image Upload, User Session, Admin Case, Search Query |
| [ACTIVITY_DIAGRAMS.md](./ACTIVITY_DIAGRAMS.md) | 8 UML activity workflow diagrams with swimlanes covering: Registration, Login, Report Lost Item, Submit Claim, Admin Reviews Claim, Notifications, Mark as Resolved, Search & Filter |
| [REFLECTION_A8_DIAGRAMS.md](./REFLECTION_A8_DIAGRAMS.md) | Reflection on granularity challenges, parallel actions, and comparison of state vs activity diagrams |
 
---

### Domain Modeling & Class Diagram Development
 
| Document | Description |
|----------|-------------|
| [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) | Domain model with 7 core entities, attributes, methods, relationships and business rules |
| [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md) | Full UML class diagram in Mermaid with inheritance, composition, aggregation, multiplicity and design decisions |
| [REFLECTION_A9_DOMAIN.md](./REFLECTION_A9_DOMAIN.md) | Reflection on abstraction challenges, design trade-offs, and alignment with prior assignments |
 
---

## From Class Diagrams to Code with All Creational Patterns

This assignment turns the UML class diagram into working JavaScript source code in [`/src`](./src) and demonstrates all six creational patterns in [`/creational_patterns`](./creational_patterns). I chose JavaScript because the project stack is JavaScript-based throughout, with React.js on the frontend and Node.js + Express on the backend.

Key design decisions were to keep the domain classes focused on core behaviour, use factory-style creation where object setup is repetitive, use Builder for step-by-step report construction, use Prototype for reusable report templates, and use Singleton for the shared database connection. The unit tests in [`/tests`](./tests) cover object creation and pattern behaviour, and [`CHANGELOG.md`](./CHANGELOG.md) tracks the assignment progress.


| Document | Description |
|----------|-------------|
| [`/src`](./src) | Class implementations translated from the UML class diagram |
| [`/creational_patterns`](./creational_patterns) | Implementations of Simple Factory, Factory Method, Abstract Factory, Builder, Prototype, and Singleton |
| [`/tests`](./tests) | Unit tests validating object creation and pattern behaviour |
| [CHANGELOG.md](./CHANGELOG.md) | Assignment 10 progress summary and current project snapshot |

---

## Implementing a Persistence Repository Layer

This assignment adds a persistence repository layer on top of the existing CLAFS domain model. The repository code in [`/repositories`](./repositories) uses a generic base contract with entity-specific interfaces so storage details stay hidden behind a stable CRUD API. I used in-memory `Map`-based repositories first, then added [`/factories`](./factories) as the storage abstraction layer so the backend can be swapped later without changing calling code.

The main design choice was Factory Pattern over a full DI container because the project is still small and the factory gives the same swap-ability with less setup. A future PostgreSQL backend is represented with stub implementations in [`/factories/stubs`](./factories/stubs), and the repository tests in [`/tests`](./tests) verify the in-memory CRUD behaviour and factory routing.



| Document | Description |
|----------|-------------|
| [`/repositories`](./repositories) | Generic repository interface plus entity-specific repository contracts |
| [`/repositories/inmemory`](./repositories/inmemory) | In-memory `Map` implementations for the domain repositories |
| [`/factories`](./factories) | Repository factory and future storage stubs |
| [`/tests`](./tests) | Repository CRUD and factory tests |
| [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md) | Updated class diagram including repository interfaces, implementations, and factory |

---


---

## CI/CD Pipeline (Assignment 13)

CLAFS uses GitHub Actions for continuous integration and continuous delivery. Every push and pull request is automatically tested before any code reaches `main`.

### Pipeline Architecture

```
Push / PR
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  JOB 1 – 🔍 Lint         ESLint code quality check         │
│  JOB 2 – 🧪 Test         Jest unit + integration tests      │  ← Required
│  JOB 3 – 🔒 Security     npm audit (vulnerability scan)     │  ← status
│                                                             │    checks
│  JOB 4 – 🚀 Release      Build & upload artifact           │  ← main only
│            (runs only after merge to main)                  │
└─────────────────────────────────────────────────────────────┘
```

The workflow file lives at `.github/workflows/ci.yml`.

---

### Running Tests Locally

**Prerequisites:** Node.js 18+ and npm installed.

```bash
# 1. Clone the repository
git clone https://github.com/Skiet88/campus-lost-and-found.git
cd campus-lost-and-found

# 2. Install all dependencies (including devDependencies)
npm install

# 3. Run the full test suite
npm test

# 4. Run tests with verbose output (shows each test name)
npm run test:verbose

# 5. Run tests and open coverage report in browser
npm test -- --coverage
open coverage/lcov-report/index.html   # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

**What gets tested:**

| Test File | What it covers |
|-----------|----------------|
| `tests/User.test.js` | Registration, login, lockout, email verification |
| `tests/Usersubclasses.test.js` | Student, Lecturer, Admin role behaviour |
| `tests/ItemReport.test.js` | Report submission, status transitions, expiry |
| `tests/Claim.test.js` | Claim lifecycle, proof validation, state rules |
| `tests/Admincase.test.js` | Admin case open/review/resolve workflow |
| `tests/Notification.test.js` | Notification creation, delivery, retry |
| `tests/Usersession.test.js` | JWT session creation, validation, expiry |
| `tests/repository.test.js` | All 5 in-memory repositories + RepositoryFactory |
| `tests/creational_patterns_tests/` | Factory, Builder, Prototype, Singleton patterns |
| `tests/services/service.test.js` | UserService, ItemReportService, ClaimService |
| `tests/api/api.test.js` | REST API integration tests for all endpoints |

> **Note:** `tests/services/service.test.js` and `tests/api/api.test.js` are excluded from the default `npm test` run because they require native `bcrypt` bindings. They run correctly in the CI environment after `npm rebuild bcrypt --build-from-source`. To run them locally: `npx jest tests/services/ tests/api/` (after rebuilding bcrypt).

---

### How the CI/CD Pipeline Works

#### On every push (any branch)
1. **Lint** — ESLint checks `src/`, `services/`, `repositories/`, `api/`, `factories/`, and `creational_patterns/` for code quality issues.
2. **Test** — Jest runs the full test suite on Node.js 18 and 20 in parallel. Coverage reports are uploaded as artifacts.
3. **Security** — `npm audit --audit-level=high` scans all dependencies. Any HIGH or CRITICAL vulnerability fails the build.

#### On a Pull Request to `main`
All three jobs above run. GitHub's branch protection rules prevent the PR from being merged until:
- ✅ Lint passes
- ✅ All tests pass on both Node 18 and Node 20
- ✅ Security audit passes
- ✅ At least 1 peer review approval is received

#### On merge to `main`
After all quality gates pass and the PR is merged, the **Release job** runs:
1. Installs production-only dependencies (`npm ci --omit=dev`)
2. Generates a versioned release string: `v{package.version}-{short-sha}-{date}`
3. Packages the application into a `.zip` archive containing: `src/`, `services/`, `repositories/`, `factories/`, `api/`, `docs/`, `package.json`, and `BUILD_INFO.json`
4. Uploads the archive as a GitHub Actions artifact (retained for 90 days)

The artifact can be downloaded and deployed directly to any Node.js server (Render, Railway, a VPS, etc.).

---

### Branch Protection Rules

The `main` branch is protected by the following rules (see `PROTECTION.md` for full justification):

| Rule | Setting |
|------|---------|
| Require PR reviews | Minimum 1 approval |
| Required status checks | Lint, Test, Security |
| Up-to-date branches | Enforced |
| Direct pushes to main | Blocked |
| Force pushes | Blocked |
| Branch deletion | Blocked |

---

### Workflow File

The complete pipeline is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

| Job | Trigger | Node versions | Artifacts |
|-----|---------|---------------|-----------|
| Lint | push, PR | 20.x | — |
| Test | push, PR | 18.x, 20.x | `coverage-report/` |
| Security | push, PR | 20.x | `security-audit-report.json` |
| Release | push to main only | 20.x | `clafs-release-v*.zip` |

---

### Viewing Pipeline Results

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select the **CLAFS CI/CD Pipeline** workflow
4. Click any run to see job logs, test output, and uploaded artifacts

A green ✅ on a PR means all quality gates passed and the code is safe to merge.
A red ❌ means at least one check failed — click the failing job to see the exact error.

---
 
## Kanban Board
 
The CLAFS project is managed using a customised **Automated Kanban** board on GitHub Projects.
 
| Column | Purpose |
|--------|---------|
| Backlog | All planned user stories not yet in a sprint |
| Sprint 1 | Items committed for Sprint 1 delivery |
| In Progress | Items actively being developed (WIP limit: 3) |
| Testing | Items awaiting verification against test cases (WIP limit: 2) |
| Blocked | Items that cannot proceed due to a dependency or blocker |
| Done | Completed and verified items |
 
---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Image Storage | Cloudinary (free tier) |
| Authentication | JWT + bcrypt |
| Notifications | Nodemailer + WebSockets |
| Hosting | Render / Railway |

---

## Author

**Mlungisi Mbuyazi**
Postgraduate Student — ICT: Application Development
Cape Peninsula University of Technology (CPUT)
Academic Year: 2026
