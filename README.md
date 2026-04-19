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
 
### Assignment 7 — GitHub Kanban Board & Template Analysis
 
| Document | Description |
|----------|-------------|
| [TEMPLATE_ANALYSIS.md](./TEMPLATE_ANALYSIS.md) | Comparison of 4 GitHub project templates with justification for Automated Kanban selection |
| [KANBAN_EXPLANATION.md](./KANBAN_EXPLANATION.md) | Definition of Kanban, board structure, WIP limits, and Agile alignment |
| [REFLECTION_A7_KANBAN.md](./REFLECTION_A7_KANBAN.md) | Reflection on template selection challenges and comparison with Trello and Jira |
 
---

### Assignment 8 — Object State Modeling & Activity Workflow Modeling
 
| Document | Description |
|----------|-------------|
| [STATE_DIAGRAMS.md](./STATE_DIAGRAMS.md) | 8 UML state transition diagrams for core system objects: Item Report, Claim, User Account, Notification, Image Upload, User Session, Admin Case, Search Query |
| [ACTIVITY_DIAGRAMS.md](./ACTIVITY_DIAGRAMS.md) | 8 UML activity workflow diagrams with swimlanes covering: Registration, Login, Report Lost Item, Submit Claim, Admin Reviews Claim, Notifications, Mark as Resolved, Search & Filter |
| [REFLECTION_A8_DIAGRAMS.md](./REFLECTION_A8_DIAGRAMS.md) | Reflection on granularity challenges, parallel actions, and comparison of state vs activity diagrams |
 
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
