# Contributing to CLAFS — Campus Lost & Found System

Thank you for your interest in contributing to CLAFS! This document explains everything you need to get started as a contributor, from setting up the project locally to submitting your first pull request.

**Author:** Mlungisi Mbuyazi | CPUT ICT: Application Development 2026
**Repo:** https://github.com/Skiet88/campus-lost-and-found

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Running Tests](#running-tests)
6. [Picking an Issue](#picking-an-issue)
7. [Submitting a Pull Request](#submitting-a-pull-request)
8. [Commit Message Format](#commit-message-format)
9. [Code of Conduct](#code-of-conduct)

---

## Prerequisites

Before you start, make sure you have the following installed:

| Tool | Minimum Version | Check with |
|------|----------------|------------|
| Node.js | 18.x or higher | `node --version` |
| npm | 8.x or higher | `npm --version` |
| Git | Any recent version | `git --version` |

No database setup is needed — CLAFS uses in-memory repositories for development and testing.

---

## Local Setup

### 1. Fork the repository

Click the **Fork** button at the top right of the repo page. This creates your own copy under your GitHub account.

### 2. Clone your fork

```bash
git clone https://github.com/YOUR-USERNAME/campus-lost-and-found.git
cd campus-lost-and-found
```

### 3. Install dependencies

```bash
npm install
```

> If `bcrypt` fails to install (native binding issue), run:
> ```bash
> npm install --ignore-scripts
> npm rebuild bcrypt --build-from-source
> ```

### 4. Verify everything works

```bash
npm test
```

You should see all tests passing. If anything fails, open an issue before proceeding.

### 5. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

Use a descriptive name, e.g. `feature/add-search-filter` or `fix/claim-validation-bug`.

---

## Project Structure

```
campus-lost-and-found/
├── src/                        # Domain model classes (User, ItemReport, Claim, etc.)
├── services/                   # Business logic layer (UserService, ItemReportService, ClaimService)
├── repositories/               # Repository interfaces and in-memory implementations
│   ├── interfaces/             # Base Repository + entity-specific interfaces
│   └── inmemory/               # Map-backed implementations
├── factories/                  # RepositoryFactory + database stubs
├── creational_patterns/        # All 6 creational design patterns
├── api/                        # Express REST API
│   ├── routes/                 # Route handlers (users, reports, claims)
│   ├── middleware/             # Logger, error handler
│   ├── config/                 # Dependency injection setup
│   └── workers/                # Background jobs (expiry worker)
├── docs/                       # OpenAPI specification
├── tests/                      # All test files mirroring src structure
├── .github/workflows/          # CI/CD pipeline (GitHub Actions)
├── package.json
├── eslint.config.js
└── README.md
```

---

## Coding Standards

All code must pass the ESLint checks before a PR can be merged. Run linting locally:

```bash
npx eslint src/ services/ repositories/ api/ factories/ creational_patterns/ --ext .js
```

### Key rules

- Use `'use strict';` at the top of every file
- Use `require()` for imports (CommonJS — do **not** use `import`/`export`)
- All classes must have JSDoc comments on the constructor and public methods
- No `console.log` in production code — use the logger in `api/logger.js`
- Variable names must be descriptive (`claimantId` not `cid`)
- Error classes must extend `Error` and set `this.statusCode`

### Example of a well-structured service method

```js
'use strict';

/**
 * Submits a new claim for a found item.
 * Business rule: one claim per user per item.
 * @param {{ itemId, claimantId, proofDescription }} dto
 * @returns {object} saved claim
 */
submitClaim({ itemId, claimantId, proofDescription }) {
  if (!proofDescription || proofDescription.trim().length < 30) {
    throw new ValidationError('Proof description must be at least 30 characters');
  }
  // ... rest of logic
}
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run with verbose output (see individual test names)
npm run test:verbose

# Run a specific test file
npx jest tests/Claim.test.js

# Run with coverage report
npm test -- --coverage
```

**Every pull request must:**
- Pass all existing tests
- Include new tests for any new functionality
- Not reduce overall coverage

Tests live in `tests/` and mirror the structure of `src/`. If you add `src/NewFeature.js`, add `tests/NewFeature.test.js`.

---

## Picking an Issue

1. Go to the [Issues tab](https://github.com/Skiet88/campus-lost-and-found/issues)
2. Filter by label:
   - **`good-first-issue`** — small, self-contained tasks ideal for first-time contributors
   - **`feature-request`** — larger features open for implementation
   - **`bug`** — confirmed bugs that need fixing
3. Comment on the issue: _"I'd like to work on this"_ so others know it's taken
4. Wait for the maintainer to assign it to you before starting work

**Do not open a PR for an issue that isn't assigned to you** — duplicate work gets confusing fast.

---

## Submitting a Pull Request

### Before you push

```bash
# Make sure tests pass
npm test

# Make sure linting passes
npx eslint src/ services/ repositories/ api/ factories/ creational_patterns/ --ext .js

# Make sure your branch is up to date with main
git fetch origin
git rebase origin/main
```

### Push and open the PR

```bash
git push origin feature/your-feature-name
```

Then go to GitHub and click **"Compare & pull request"**.

### PR checklist

Your PR description must include:

- [ ] What issue this closes (e.g. `Closes #12`)
- [ ] What changes were made and why
- [ ] How to test the changes manually
- [ ] Confirmation that all tests pass
- [ ] Confirmation that linting passes

### PR title format

```
<type>(<scope>): <short description>

Examples:
feat(claims): add pagination to GET /api/claims
fix(auth): reset failed login counter on successful login
docs(readme): add Docker setup instructions
test(UserService): add lockout boundary test cases
```

---

## Commit Message Format

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>

Types: feat | fix | docs | test | refactor | chore | ci
```

Examples:
```
feat: add category filter to item report search
fix: prevent claim submission on expired reports
test: add boundary tests for proof description length
docs: update CONTRIBUTING with bcrypt install note
ci: add Node 22 to test matrix
```

---

## Code of Conduct

This project is part of an academic programme at CPUT. All contributors are expected to:

- Be respectful and constructive in all comments and reviews
- Give credit where it is due
- Not submit work that is not their own
- Follow the CPUT academic integrity policy

Violation of these standards will result in removal from the contributor list and reporting to the relevant academic authority.

---

## Questions?

Open a [GitHub Discussion](https://github.com/Skiet88/campus-lost-and-found/discussions) or comment on the relevant issue.
