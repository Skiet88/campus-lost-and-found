# REFLECTION.md — Challenges in Balancing Stakeholder Needs
## Campus Lost & Found System (CLAFS)

---

## Introduction

Requirements engineering is rarely straightforward. While it is tempting to treat each stakeholder's needs as an isolated checklist, the reality is that stakeholder concerns frequently conflict with one another. This reflection documents the key tensions I encountered while eliciting and balancing requirements for the Campus Lost & Found System (CLAFS), and how I resolved them.

---

## Challenge 1: Privacy vs. Transparency

**Conflict:** Students who lose items want their contact information to be visible to potential finders so they can be contacted quickly. However, the IT Department and University Management raised strong concerns about exposing personal student data unnecessarily, especially given data privacy obligations.

**How I Balanced It:** I resolved this by designing the system so that users never see each other's contact details directly. Instead, all communication is routed through the system — a claimant submits a claim, and the admin acts as the intermediary. Contact details are only shared by admin after a claim is approved and ownership is verified. This satisfies the student's goal of being reunited with their item while protecting their privacy.

---

## Challenge 2: Simplicity vs. Feature Richness

**Conflict:** New and first-year students need an interface that is extremely simple and intuitive — ideally requiring no instructions at all. On the other hand, Campus Security/Admin require a feature-rich dashboard with filters, bulk actions, export tools, and status management. Building one system that serves both extremes well is genuinely difficult.

**How I Balanced It:** I adopted a role-based UI approach — the student-facing interface is kept minimal with progressive disclosure (only showing advanced options when needed), while the admin dashboard is a separate, more complex view accessible only to admin-role accounts. This way, complexity is hidden from users who do not need it.

---

## Challenge 3: Real-Time Notifications vs. System Performance

**Conflict:** Students and lecturers want instant notifications the moment a match is found or a claim is updated. However, the IT Department raised concerns about the bandwidth and server load implications of real-time WebSocket connections for hundreds of simultaneous users.

**How I Balanced It:** I adopted a hybrid notification strategy. Critical, time-sensitive events (claim approved/rejected) are delivered via email (asynchronous, low server load), while in-app notifications use WebSockets but are rate-limited and only pushed to active sessions. This reduces unnecessary server load while still delivering a near-real-time experience for active users.

---

## Challenge 4: Security vs. User Convenience

**Conflict:** The IT Department and University Management want strong security — account lockouts after failed login attempts, mandatory university email verification, and strict session timeouts. Students, however, find these measures frustrating, especially the 15-minute lockout after three failed attempts, which they perceive as overly harsh.

**How I Balanced It:** I kept the security measures in place as they are non-negotiable from a data protection standpoint, but improved the user experience around them. The lockout message is clearly worded, explains exactly when the lockout will expire, and offers a "Forgot Password" option prominently. This preserves security without leaving users confused or stranded.

---

## Challenge 5: Feasibility vs. Stakeholder Ambition

**Conflict:** University Management expressed interest in advanced features like a campus location heatmap showing where items are most frequently lost, multilingual support for international students, and a mobile app in addition to the web app. These are valuable ideas, but as a solo developer working within a semester, including all of them would be unfeasible.

**How I Balanced It:** I applied the MoSCoW prioritisation method mentally — separating Must-Have requirements (core reporting, claiming, notifications) from Should-Have (admin dashboard with CSV export) and Could-Have (heatmap, multilingual support, mobile app). The heatmap was included as a dashboard feature since it reuses existing data. Multilingual support and a mobile app were documented as future enhancements, keeping scope realistic without dismissing stakeholder ideas entirely.

---

## Key Lesson

The most important lesson from this requirements elicitation process is that **no stakeholder operates in isolation**. Every design decision made to satisfy one stakeholder has a ripple effect on others. The role of a requirements engineer is not to give everyone everything they want, but to find the design space where the most critical needs of all stakeholders are met without fundamentally compromising anyone's core concerns. Documentation, traceability, and clear communication are what make this balancing act manageable.
