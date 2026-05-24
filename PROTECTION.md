# PROTECTION.md — Branch Protection Rules

## Campus Lost & Found System (CLAFS)
**Author:** Mlungisi Mbuyazi | CPUT ICT: Application Development 2026

---

## Overview

Branch protection rules are applied to the `main` branch to enforce quality standards and prevent unstable code from entering the production codebase. This document explains each rule, why it exists, and how it aligns with CLAFS's architecture and the SDLC.

---

## Rules Configured on `main`

### 1. Require Pull Request Reviews (minimum 1 approval)

**What it does:** No developer (including the repository owner) can push directly to `main`. Every change must be submitted as a Pull Request and receive at least one approving review before it can be merged.

**Why it matters for CLAFS:**
The CLAFS codebase now spans seven layers — domain model, factories, repositories, services, API routes, middleware, and tests. A peer review catches:
- Business rule violations (e.g., a change that accidentally allows claims on RESOLVED reports)
- Security regressions (e.g., removing email validation in `UserService`)
- Breaking changes to the repository interface that would silently break services
- Missing test coverage for new features

**Industry standard:** Pull request reviews are mandatory at every professional software company. GitHub, Microsoft, and Google all require at least one approving review before merge.

---

### 2. Require Status Checks to Pass Before Merging

**What it does:** GitHub blocks the "Merge" button until all three required CI jobs pass:
- ✅ `🔍 Lint (ESLint)` — code style and quality
- ✅ `🧪 Test (Jest + Coverage)` — all unit and integration tests
- ✅ `🔒 Security Audit (npm audit)` — no high/critical vulnerabilities

**Why it matters for CLAFS:**
CLAFS has 40+ unit tests covering every entity, service, and repository. The CI pipeline runs these automatically on every PR. This means:
- A change to `ClaimService` that breaks the "one claim per user per item" rule will be caught before it ever touches `main`
- A dependency update that introduces a known CVE will be blocked by the security audit
- Syntax errors or undefined variables will be caught by ESLint before a reviewer even opens the PR

Without this rule, a developer could approve and merge a PR without the tests ever having run.

---

### 3. Require Branches to Be Up to Date Before Merging

**What it does:** The PR branch must be up to date with `main` before it can be merged. This prevents "integration blindness" — where a PR passes tests on its own branch but would fail when merged with concurrent changes.

**Why it matters for CLAFS:**
As the team grows for group work, multiple features may be developed simultaneously. For example:
- Developer A modifies `InMemoryUserRepository`
- Developer B's PR was tested against an older version that didn't have those changes

This rule ensures Developer B's tests are re-run against the current state of `main` before their code is merged.

---

### 4. No Direct Pushes to Main (Disable Force Pushes)

**What it does:** Direct pushes to `main` are blocked for all users, including administrators. Force pushes and branch deletion are also disabled.

**Why it matters for CLAFS:**
Force-pushing to `main` can silently overwrite the commit history and destroy audit trails. In an academic context, this is especially important because:
- Lecturers and markers review commit history as evidence of SDLC compliance
- The `CHANGELOG.md` tracks every feature addition and fix — force-pushing could invalidate this record
- GitHub Actions release artifacts are tied to specific SHA commits — a force push would break that chain

---

## How These Rules Map to the SDLC

```
Feature Branch  →  Pull Request  →  CI Checks  →  Review  →  Merge to main  →  CD Release
     ↑                  ↑               ↑             ↑             ↑                ↑
  Developer          Opens PR       Lint+Test       Peer          Protected      Artifact
  writes code        (no direct     Security        Approval      by rules       built &
                     push to main)  Audit runs      required                     uploaded
```

| SDLC Phase     | Branch Protection Mechanism                        |
|----------------|----------------------------------------------------|
| Development    | All work done on feature branches                  |
| Code Review    | Minimum 1 approving review required                |
| Testing        | All Jest tests must pass (status check)            |
| Security       | npm audit must pass (status check)                 |
| Release        | CD job runs only after merge to `main`             |
| Traceability   | No force pushes — full Git history preserved       |

---

## How to Configure These Rules (Step-by-Step)

1. Navigate to your repository on GitHub
2. Click **Settings** → **Branches**
3. Under **Branch protection rules**, click **Add rule**
4. In **Branch name pattern**, type: `main`
5. Enable the following:
   - ☑ **Require a pull request before merging**
     - Set **Required number of approvals** to `1`
   - ☑ **Require status checks to pass before merging**
     - ☑ **Require branches to be up to date before merging**
     - In the search box, add: `🔍 Lint (ESLint)`, `🧪 Test (Jest + Coverage)`, `🔒 Security Audit (npm audit)`
     - *(These appear in the list after the workflow has run at least once)*
   - ☑ **Do not allow bypassing the above settings**
   - ☑ **Restrict who can push to matching branches** (optional — admins only)
6. Click **Create** (or **Save changes**)

---

## Why This Matters for CLAFS Specifically

The CLAFS system handles sensitive campus data — student identities, item reports, and claim decisions. A bug in production that allows an unauthorised user to approve a claim, or that exposes student emails, would have real-world consequences. Branch protection ensures that:

1. No untested code reaches the live API
2. No dependency with a known CVE is ever deployed
3. Every change is reviewed by at least one other person
4. The Git history is a trustworthy audit trail for the entire project lifecycle

These practices directly reflect the **Software Development Life Cycle (SDLC)** principles covered in the ICT: Application Development curriculum and mirror what is expected at any professional software company.
