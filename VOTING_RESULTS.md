# VOTING_RESULTS.md — Peer Engagement Results

**Campus Lost & Found System (CLAFS)**
Author: Mlungisi Mbuyazi | CPUT ICT: Application Development 2026
Repository: https://github.com/Skiet88/campus-lost-and-found

---

## Engagement Summary

| Metric | Count | Notes |
|--------|-------|-------|
| ⭐ Stars | 9 | Peers who found the project well-documented and feature-complete |
| 🍴 Forks | 16 | Peers who forked to explore or contribute |
| 👁️ Watchers | 1 | Watching for updates |
| 🐛 Open Issues | 25 | Active backlog including good-first-issue and feature-request labels |
| 🔀 Pull Requests | 0 | Branch protection rules in place — PRs require passing CI + review |

*Data recorded at time of Assignment 14 submission.*

---

## What the Numbers Mean

**16 forks** is the strongest signal of peer engagement. A fork means a classmate cloned the entire repository to either study the code structure, run it locally, or attempt a contribution. Forks are weighted more heavily in the assignment rubric than stars precisely because they represent active engagement rather than passive acknowledgement.

**9 stars** indicate that peers reviewing the repository considered it well-structured and worth bookmarking. Stars on a public repository also contribute to its discoverability.

---

## Peer Feedback Received

The following qualitative feedback was collected via the class WhatsApp group and Zoom session after sharing the repository link:

| Feedback | From | Action Taken |
|----------|------|--------------|
| "Hard to know where to start as a new contributor" | Classmate A | Added `good-first-issue` labels to 5 issues; updated CONTRIBUTING.md with explicit setup steps |
| "bcrypt install failed on my machine" | Classmate B | Added bcrypt rebuild note to CONTRIBUTING.md Prerequisites section |
| "Not clear which features are done vs planned" | Classmate C | Added "Current Status" table to ROADMAP.md clearly separating completed from planned work |
| "Issues have no labels, hard to filter" | Classmate D | Applied `good-first-issue`, `feature-request`, and `bug` labels across all open issues |
| "Good test coverage and CI pipeline" | Classmate E | No action needed — positive confirmation |

---

## Issues Labelled for Contributors

### good-first-issue (5 issues)
These are small, well-scoped tasks ideal for first-time contributors:

1. **Add database migration SQL files** — Create `/migrations` folder with schema for all 7 entities
2. **Add rate limiting to login endpoint** — Implement `express-rate-limit` on `POST /api/users/login`
3. **Add input sanitisation middleware** — Add `helmet` and string sanitisation to Express app
4. **Add Docker support** — Write `Dockerfile` and `docker-compose.yml` for API + PostgreSQL
5. **Add pagination to GET /api/reports** — Add `?page=` and `?limit=` query parameters

### feature-request (3 issues)
These are larger features open for community implementation:

1. **PostgreSQL repository implementation** — Implement the database stubs in `factories/stubs/`
2. **JWT authentication middleware** — Add token generation on login and route protection
3. **React frontend scaffold** — Initialise `/client` with Vite + React connected to the REST API
