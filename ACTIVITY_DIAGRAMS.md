# ACTIVITY_DIAGRAMS.md — Activity Workflow Modeling
## Campus Lost & Found System (CLAFS)

---

## Overview

This document models 8 complex workflows in CLAFS using UML activity diagrams. Each diagram includes start/end nodes, actions, decisions, parallel actions, and swimlane labels showing which actor is responsible for each step.

---

## Workflow 1: User Registration

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"USER: Navigate to registration page"/]
    A --> B[/"USER: Fill in name, university email, password"/]
    B --> C[/"USER: Click Register"/]
    C --> D{Valid university email?}
    D -->|No| E["SYSTEM: Display email error"]
    E --> B
    D -->|Yes| F{Email already exists?}
    F -->|Yes| G["SYSTEM: Display duplicate account error"]
    G --> B
    F -->|No| H["SYSTEM: Hash password with bcrypt"]
    H --> I["SYSTEM: Save user record to database"]
    I --> J["SYSTEM: Send verification email"]
    J --> K[/"USER: Click verification link in email"/]
    K --> L{Link valid and not expired?}
    L -->|No| M["SYSTEM: Prompt to resend verification"]
    M --> J
    L -->|Yes| N["SYSTEM: Set account status to Active"]
    N --> O["SYSTEM: Redirect to login page"]
    O --> E1([End])
```

**Explanation:**
Covers FR-01 and US-001. The email validation and bcrypt hashing steps ensure only legitimate university members can register securely, addressing both the IT Department's security concerns and the student stakeholder's need for a simple onboarding experience.

**Mapped to:** FR-01, US-001, T-002, T-003, T-004

---

## Workflow 2: User Login and Authentication

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"USER: Navigate to login page"/]
    A --> B[/"USER: Enter email and password"/]
    B --> C[/"USER: Click Login"/]
    C --> D{Account exists?}
    D -->|No| E["SYSTEM: Display invalid credentials error"]
    E --> B
    D -->|Yes| F{Account locked?}
    F -->|Yes| G["SYSTEM: Display lockout message with timer"]
    G --> E1([End])
    F -->|No| H{Password correct?}
    H -->|No| I["SYSTEM: Increment failed attempt counter"]
    I --> J{Failed attempts >= 3?}
    J -->|Yes| K["SYSTEM: Lock account for 15 minutes"]
    K --> G
    J -->|No| E
    H -->|Yes| L["SYSTEM: Reset failed attempt counter"]
    L --> M["SYSTEM: Generate signed JWT token"]
    M --> N{User role?}
    N -->|Student or Lecturer| O["SYSTEM: Redirect to Student Dashboard"]
    N -->|Admin| P["SYSTEM: Redirect to Admin Dashboard"]
    O --> E2([End])
    P --> E2
```

**Explanation:**
Covers FR-02 and US-002. The account lockout logic after 3 failed attempts fulfils NFR-10 (security). Role-based redirect ensures each user type lands on the correct interface immediately after login.

**Mapped to:** FR-02, US-002, T-006, T-007

---

## Workflow 3: Report Lost Item

**Actors:** User, System, Cloudinary

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"USER: Navigate to Report Lost Item page"/]
    A --> B[/"USER: Fill in title, category, description, location, date"/]
    B --> C{Attach image?}
    C -->|Yes| D[/"USER: Select image file"/]
    D --> E{File is JPG or PNG under 5MB?}
    E -->|No| F["SYSTEM: Display file validation error"]
    F --> D
    E -->|Yes| G["CLOUDINARY: Upload image file"]
    G --> H["CLOUDINARY: Return public image URL"]
    H --> I["SYSTEM: Validate all required form fields"]
    C -->|No| I
    I --> J{All fields valid?}
    J -->|No| K["SYSTEM: Highlight invalid fields"]
    K --> B
    J -->|Yes| L["SYSTEM: Save item record with status ACTIVE"]
    L --> M["SYSTEM: Display confirmation message to user"]
    L --> N["SYSTEM: Query database for matching FOUND items"]
    N --> O{Match found?}
    O -->|Yes| P["SYSTEM: Send match notification to user"]
    O -->|No| Q["SYSTEM: No notification sent"]
    M --> E1([End])
    P --> E1
    Q --> E1
```

**Explanation:**
Covers FR-03 and FR-08. The parallel execution of showing a confirmation message and running the match query ensures immediate user feedback while the system checks for matches in the background — addressing the student's need for fast item recovery.

**Mapped to:** FR-03, FR-08, US-003, US-008, T-009, T-010

---

## Workflow 4: Submit Claim on Found Item

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"USER: Open found item detail page"/]
    A --> B[/"USER: Click Claim This Item"/]
    B --> C{User authenticated?}
    C -->|No| D["SYSTEM: Redirect to login page"]
    D --> E1([End])
    C -->|Yes| E{User already claimed this item?}
    E -->|Yes| F["SYSTEM: Display duplicate claim error"]
    F --> E1
    E -->|No| G[/"USER: Write proof of ownership description"/]
    G --> H[/"USER: Click Submit Claim"/]
    H --> I{Description at least 30 characters?}
    I -->|No| J["SYSTEM: Display minimum length error"]
    J --> G
    I -->|Yes| K["SYSTEM: Save claim with status PENDING"]
    K --> L["SYSTEM: Send confirmation notification to claimant"]
    K --> M["SYSTEM: Send new claim alert to Admin"]
    L --> E2([End])
    M --> E2
```

**Explanation:**
Covers FR-06 and US-006. The parallel notification to both the claimant and admin ensures no party is left uninformed. The 30-character minimum prevents vague or bad-faith claims, addressing the campus security admin's concern about verified handovers.

**Mapped to:** FR-06, US-006

---

## Workflow 5: Admin Reviews and Approves Claim

**Actors:** Admin, System

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"ADMIN: Receive new claim notification"/]
    A --> B[/"ADMIN: Open Claim Management panel"/]
    B --> C[/"ADMIN: Select a PENDING claim"/]
    C --> D[/"ADMIN: Read claimant proof of ownership"/]
    D --> E{Proof of ownership sufficient?}
    E -->|Yes| F[/"ADMIN: Click Approve"/]
    F --> G["SYSTEM: Update claim status to APPROVED"]
    G --> H["SYSTEM: Update item status to RESOLVED"]
    H --> I["SYSTEM: Notify claimant: Claim approved"]
    H --> J["SYSTEM: Notify reporter: Item has been claimed"]
    I --> E1([End])
    J --> E1
    E -->|No| K[/"ADMIN: Click Reject"/]
    K --> L[/"ADMIN: Enter mandatory rejection reason"/]
    L --> M{Reason provided?}
    M -->|No| N["SYSTEM: Display: Rejection reason required"]
    N --> L
    M -->|Yes| O["SYSTEM: Update claim status to REJECTED"]
    O --> P["SYSTEM: Notify claimant: Claim rejected with reason"]
    P --> E2([End])
```

**Explanation:**
Covers FR-07 and US-007. The mandatory rejection reason ensures fairness and traceability, addressing the campus security admin's need for a complete audit trail. Parallel notifications on approval keep all parties informed simultaneously.

**Mapped to:** FR-07, US-007

---

## Workflow 6: Receive and Read Notification

**Actors:** System, User

```mermaid
flowchart TD
    S([Start]) --> A

    A["SYSTEM: Key event triggered"]
    A --> B["SYSTEM: Create notification record in database"]
    B --> C["SYSTEM: Add to notification delivery queue"]
    C --> D{User has email notifications enabled?}
    D -->|Yes| E["SYSTEM: Send email via Nodemailer"]
    D -->|No| F["SYSTEM: Skip email delivery"]
    C --> G{User currently online?}
    G -->|Yes| H["SYSTEM: Push in-app notification via WebSocket"]
    G -->|No| I["SYSTEM: Queue for delivery on next login"]
    H --> J[/"USER: Notification bell indicator updates"/]
    J --> K[/"USER: Click notification"/]
    K --> L["SYSTEM: Mark notification as read in database"]
    L --> E1([End])
    E --> E1
    F --> E1
    I --> E1
```

**Explanation:**
Covers FR-09 and US-009. The parallel delivery paths for email and in-app notifications ensure users are informed regardless of whether they are currently active on the platform, addressing the student stakeholder's concern about timely updates.

**Mapped to:** FR-09, US-009

---

## Workflow 7: Mark Item as Resolved

**Actors:** Admin, System

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"ADMIN: Confirm item physically collected by owner"/]
    A --> B[/"ADMIN: Navigate to item detail page"/]
    B --> C[/"ADMIN: Click Mark as Resolved"/]
    C --> D["SYSTEM: Show confirmation dialog"]
    D --> E{Admin confirms action?}
    E -->|No| F[/"ADMIN: Cancel action"/]
    F --> E1([End])
    E -->|Yes| G["SYSTEM: Update item status to RESOLVED"]
    G --> H["SYSTEM: Move item to resolved archive"]
    H --> I["SYSTEM: Remove item from active listings"]
    I --> J["SYSTEM: Notify reporter: Item resolved"]
    I --> K["SYSTEM: Notify claimant: Case closed"]
    I --> L["SYSTEM: Update admin dashboard statistics"]
    J --> E2([End])
    K --> E2
    L --> E2
```

**Explanation:**
Covers FR-10 and US-010. The three parallel post-resolution actions — notifying the reporter, notifying the claimant, and updating dashboard stats — ensure all stakeholders are informed simultaneously and the admin dashboard remains accurate for University Management reporting.

**Mapped to:** FR-10, US-010

---

## Workflow 8: Search and Filter Items

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A

    A[/"USER: Navigate to Browse Items page"/]
    A --> B["SYSTEM: Load all active items by default"]
    B --> C["SYSTEM: Display item cards"]
    C --> D{User wants to search or filter?}
    D -->|No| E[/"USER: Browse default listings"/]
    E --> E1([End])
    D -->|Yes| F[/"USER: Enter keyword and select filters"/]
    F --> G[/"USER: Click Search or Apply Filters"/]
    G --> H["SYSTEM: Build query with parameters"]
    H --> I["SYSTEM: Execute database query"]
    I --> J{Results found?}
    J -->|Yes| K["SYSTEM: Display matching item cards"]
    J -->|No| L["SYSTEM: Display no results message"]
    K --> M{User found what they need?}
    L --> N{User wants to refine search?}
    M -->|Yes| O[/"USER: Click item card"/]
    O --> P["SYSTEM: Load full item detail page"]
    P --> E2([End])
    M -->|No| N
    N -->|Yes| F
    N -->|No| E1
```

**Explanation:**
Covers FR-05 and US-005. The looping refinement path ensures users who do not find results on the first search are guided back to try different parameters rather than hitting a dead end — directly addressing the new student stakeholder's need for an intuitive browsing experience.

**Mapped to:** FR-05, US-005

---

## Traceability Summary

| Workflow | Functional Requirement | User Story | Sprint Task |
|----------|----------------------|------------|-------------|
| User Registration | FR-01 | US-001 | T-002, T-003, T-004 |
| User Login | FR-02 | US-002 | T-006, T-007 |
| Report Lost Item | FR-03, FR-08 | US-003, US-008 | T-009, T-010 |
| Submit Claim | FR-06 | US-006 | — |
| Admin Reviews Claim | FR-07 | US-007 | — |
| Receive Notification | FR-09 | US-009 | — |
| Mark as Resolved | FR-10 | US-010 | — |
| Search and Filter | FR-05 | US-005 | — |
