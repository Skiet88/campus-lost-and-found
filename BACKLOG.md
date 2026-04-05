# BACKLOG.md — Product Backlog
## Campus Lost & Found System (CLAFS)

---

## Overview

The product backlog is prioritized using the **MoSCoW** method:
- **Must-have** — core features without which the system cannot function
- **Should-have** — important features that add significant value
- **Could-have** — desirable features that can be deferred
- **Won't-have** — out of scope for this semester

Effort is estimated using **Fibonacci story points** (1, 2, 3, 5, 8) where:
- **1** = trivial (a few hours)
- **2** = simple (half a day)
- **3** = moderate (1–2 days)
- **5** = complex (3–4 days)
- **8** = very complex (a full week)

---

## Product Backlog Table

| Story ID | User Story | MoSCoW | Story Points | Dependencies | Justification |
|----------|------------|--------|-------------|--------------|---------------|
| US-001 | As a student, I want to register using my university email so that I can access the platform securely. | Must-have | 3 | None | Authentication is the gateway to all other features. No user can interact with CLAFS without an account. Directly addresses IT Department and student security concerns. |
| US-002 | As a registered user, I want to log in with my email and password so that I can access my account. | Must-have | 2 | US-001 | Login is required before any use case can be accessed. Depends on registration being complete first. |
| US-013 | As a system admin, I want passwords hashed and data transmitted over HTTPS so that user data is protected. | Must-have | 3 | US-001 | Security cannot be retrofitted after the fact. Must be built in from the start alongside authentication. |
| US-003 | As a student, I want to report a lost item with details and a photo so that others can help return it. | Must-have | 5 | US-002, US-008 | Core feature of the system. Without lost item reporting, CLAFS has no purpose. Drives the primary user flow. |
| US-004 | As a student, I want to report a found item with details and a photo so that the owner can be notified. | Must-have | 5 | US-002, US-008 | Equally core to lost item reporting. The found item report is what triggers the matching and claiming workflow. |
| US-005 | As a student, I want to search and filter item reports so that I can quickly find a specific item. | Must-have | 3 | US-003, US-004 | Users cannot claim items they cannot find. Search is the primary way users discover relevant reports. |
| US-008 | As a student, I want to upload a photo when reporting an item so that others can visually identify it. | Must-have | 3 | US-002 | Image upload is included in the report lost/found flow. Cloudinary integration must be set up before item reporting stories are complete. |
| US-006 | As a student, I want to submit a claim on a found item by describing my proof of ownership. | Must-have | 3 | US-005 | The claim workflow is the core value proposition of CLAFS. Without it, found items cannot be returned to owners. |
| US-007 | As a campus security admin, I want to review and approve or reject claims so that only verified owners collect items. | Must-have | 5 | US-006 | Admin claim management completes the end-to-end workflow. Without approval, claims are never resolved. |
| US-009 | As a registered user, I want to receive in-app and email notifications for key events. | Should-have | 5 | US-003, US-004, US-007 | Notifications significantly improve the user experience and reduce the need for manual follow-up. Important but the core workflow can function without them initially. |
| US-010 | As a campus security admin, I want to mark an item as resolved once it has been returned. | Should-have | 2 | US-007 | Case closure is important for data hygiene and admin reporting but can be added after the core claim workflow is stable. |
| US-011 | As a campus security admin, I want to view a dashboard with stats and export monthly reports. | Should-have | 5 | US-010 | Valuable for University Management and Admin but not required for the MVP to function. Builds on resolved case data. |
| US-014 | As a system admin, I want the system to handle 500 concurrent users with fast response times. | Should-have | 8 | US-003, US-004, US-005 | Performance optimisation is important but typically addressed after core features are stable. Load testing requires a working system first. |
| US-012 | As a registered user, I want to manage my profile and notification preferences. | Could-have | 2 | US-001 | Useful for personalisation but not critical to the core lost and found workflow. Can be deferred to a later sprint. |

---

## MoSCoW Summary

| Priority | Stories | Total Story Points |
|----------|---------|--------------------|
| Must-have | US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-013 | 32 |
| Should-have | US-009, US-010, US-011, US-014 | 20 |
| Could-have | US-012 | 2 |
| Won't-have | Mobile app, multilingual support, campus heatmap | — |

---

## Prioritization Justification

**Must-have stories** form the complete end-to-end workflow: register → login → report item → search → claim → admin review. These directly address the highest-priority stakeholder concerns identified in Assignment 4 — students needing a fast way to report items and admins needing a centralised management tool. Without these stories, CLAFS delivers zero value.

**Should-have stories** significantly improve the experience (notifications, dashboard, performance) but the system can technically function without them in the MVP. They are targeted for Sprint 2 and 3.

**Could-have stories** (profile management) are quality-of-life improvements that can be deferred without impacting core functionality.

**Won't-have** features (mobile app, multilingual support, heatmap) were acknowledged by University Management as desirable but are explicitly out of scope for this semester, as documented in Assignment 4's feasibility justification.
