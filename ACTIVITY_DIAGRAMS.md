# ACTIVITY_DIAGRAMS.md — Activity Workflow Modeling
## Campus Lost & Found System (CLAFS)

---

## Overview

This document models 8 complex workflows in CLAFS using UML activity diagrams. Each diagram includes start and end nodes, actions, decision points, parallel actions, and actor labels showing who is responsible for each step. All node text is written in full for clarity.

---

## Workflow 1: User Registration

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["USER: Navigate to registration page"]
    A1 --> A2["USER: Fill in name, university email and password"]
    A2 --> A3["USER: Click the Register button"]
    A3 --> D1{Is the email a valid university email address?}
    D1 -->|No| A4["SYSTEM: Display error — Please use your university email address"]
    A4 --> A2
    D1 -->|Yes| D2{Does an account with this email already exist?}
    D2 -->|Yes| A5["SYSTEM: Display error — An account with this email already exists"]
    A5 --> A2
    D2 -->|No| A6["SYSTEM: Hash the password using bcrypt with cost factor 12"]
    A6 --> A7["SYSTEM: Save the new user record to the database with status Unverified"]
    A7 --> A8["SYSTEM: Send a verification email to the user via Nodemailer"]
    A8 --> A9["USER: Open email and click the verification link"]
    A9 --> D3{Is the verification link valid and not expired?}
    D3 -->|No| A10["SYSTEM: Display error — Link has expired. Click here to resend."]
    A10 --> A8
    D3 -->|Yes| A11["SYSTEM: Update account status to Active in the database"]
    A11 --> A12["SYSTEM: Redirect the user to the login page"]
    A12 --> E([End])
```

**Explanation:**
Covers FR-01 and US-001. Email validation and bcrypt hashing ensure only legitimate university members can register securely. The verification email step ensures accounts belong to real university email owners, addressing the IT Department security concern from STAKEHOLDERS.md.

**Mapped to:** FR-01, US-001, T-002, T-003, T-004

---

## Workflow 2: User Login and Authentication

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["USER: Navigate to the login page"]
    A1 --> A2["USER: Enter university email address and password"]
    A2 --> A3["USER: Click the Login button"]
    A3 --> D1{Does an account with this email exist in the database?}
    D1 -->|No| A4["SYSTEM: Display error — Invalid email or password"]
    A4 --> A2
    D1 -->|Yes| D2{Is the account currently locked?}
    D2 -->|Yes| A5["SYSTEM: Display message — Account locked. Please try again in 15 minutes."]
    A5 --> E1([End])
    D2 -->|No| D3{Does the entered password match the stored hash?}
    D3 -->|No| A6["SYSTEM: Increment the failed login attempt counter by 1"]
    A6 --> D4{Have there been 3 or more consecutive failed attempts?}
    D4 -->|Yes| A7["SYSTEM: Lock the account for 15 minutes"]
    A7 --> A5
    D4 -->|No| A4
    D3 -->|Yes| A8["SYSTEM: Reset the failed attempt counter to zero"]
    A8 --> A9["SYSTEM: Generate a signed JWT token valid for 8 hours"]
    A9 --> D5{What is the role assigned to this user account?}
    D5 -->|Student or Lecturer| A10["SYSTEM: Redirect user to the Student Dashboard"]
    D5 -->|Admin| A11["SYSTEM: Redirect user to the Admin Dashboard"]
    A10 --> E2([End])
    A11 --> E2
```

**Explanation:**
Covers FR-02 and US-002. The lockout logic after 3 consecutive failed attempts fulfils NFR-10. Role-based redirection ensures each user type immediately sees the correct interface after login.

**Mapped to:** FR-02, US-002, T-006, T-007

---

## Workflow 3: Report Lost Item

**Actors:** User, System, Cloudinary

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["USER: Navigate to the Report Lost Item page"]
    A1 --> A2["USER: Fill in title, category, description, campus location and date lost"]
    A2 --> D1{Does the user want to attach an image?}
    D1 -->|Yes| A3["USER: Select an image file from their device"]
    A3 --> D2{Is the file a JPG or PNG and under 5MB in size?}
    D2 -->|No| A4["SYSTEM: Display error — File must be JPG or PNG and under 5MB"]
    A4 --> A3
    D2 -->|Yes| A5["CLOUDINARY: Receive and store the uploaded image file"]
    A5 --> A6["CLOUDINARY: Return the public image URL to the system"]
    A6 --> A7["SYSTEM: Attach the image URL to the item report data"]
    D1 -->|No| A7
    A7 --> D3{Are all required fields completed and valid?}
    D3 -->|No| A8["SYSTEM: Highlight all invalid or empty required fields in red"]
    A8 --> A2
    D3 -->|Yes| A9["SYSTEM: Save the item record to the database with type LOST and status ACTIVE"]
    A9 --> A10["SYSTEM: Display confirmation message to the user within 3 seconds"]
    A9 --> A11["SYSTEM: Query the database for any existing FOUND items that may match"]
    A11 --> D4{Was a potential matching FOUND item found in the database?}
    D4 -->|Yes| A12["SYSTEM: Send a match notification to the user via in-app and email"]
    D4 -->|No| A13["SYSTEM: No match notification is sent at this time"]
    A10 --> E([End])
    A12 --> E
    A13 --> E
```

**Explanation:**
Covers FR-03 and FR-08. The parallel execution of showing a confirmation and running the match query ensures immediate user feedback while the system checks for matches in the background. Addresses the student stakeholder's need for fast item recovery.

**Mapped to:** FR-03, FR-08, US-003, US-008, T-009, T-010

---

## Workflow 4: Submit Claim on Found Item

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["USER: Browse item listings and open a found item detail page"]
    A1 --> A2["USER: Click the Claim This Item button"]
    A2 --> D1{Is the user currently authenticated with a valid JWT token?}
    D1 -->|No| A3["SYSTEM: Redirect the user to the login page"]
    A3 --> E1([End])
    D1 -->|Yes| D2{Has this user already submitted a claim on this item?}
    D2 -->|Yes| A4["SYSTEM: Display error — You have already submitted a claim for this item"]
    A4 --> E1
    D2 -->|No| D3{Does this item currently have status ACTIVE and type FOUND?}
    D3 -->|No| A5["SYSTEM: Display error — This item is no longer available for claiming"]
    A5 --> E1
    D3 -->|Yes| A6["USER: Write a description of proof of ownership in the claim text field"]
    A6 --> A7["USER: Click the Submit Claim button"]
    A7 --> D4{Is the proof of ownership description at least 30 characters long?}
    D4 -->|No| A8["SYSTEM: Display error — Please provide at least 30 characters describing your proof of ownership"]
    A8 --> A6
    D4 -->|Yes| A9["SYSTEM: Save the claim record to the database with status PENDING"]
    A9 --> A10["SYSTEM: Send a confirmation notification to the claimant"]
    A9 --> A11["SYSTEM: Send a new claim alert notification to Admin or Campus Security"]
    A10 --> E2([End])
    A11 --> E2
```

**Explanation:**
Covers FR-06 and US-006. The parallel notifications to both the claimant and admin ensure no party is left uninformed. The 30-character minimum prevents vague or bad-faith claims, addressing the campus security admin's concern about verified and traceable handovers.

**Mapped to:** FR-06, US-006

---

## Workflow 5: Admin Reviews and Approves or Rejects a Claim

**Actors:** Admin, System

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["ADMIN: Receive new claim alert notification via in-app or email"]
    A1 --> A2["ADMIN: Open the Claim Management panel in the Admin Dashboard"]
    A2 --> A3["ADMIN: View the list of all claims with status PENDING"]
    A3 --> A4["ADMIN: Select a specific pending claim to review"]
    A4 --> A5["ADMIN: Read the claimant details and their proof of ownership description"]
    A5 --> D1{Is the proof of ownership description sufficient to verify the claimant as the rightful owner?}
    D1 -->|Yes| A6["ADMIN: Click the Approve button"]
    A6 --> A7["SYSTEM: Update the claim status to APPROVED in the database"]
    A7 --> A8["SYSTEM: Update the item status to RESOLVED in the database"]
    A8 --> A9["SYSTEM: Send notification to the claimant — Your claim has been approved. Please collect your item."]
    A8 --> A10["SYSTEM: Send notification to the item reporter — Your item has been claimed and is being returned to its owner."]
    A9 --> E1([End])
    A10 --> E1
    D1 -->|No| A11["ADMIN: Click the Reject button"]
    A11 --> A12["ADMIN: Type a mandatory rejection reason in the provided text field"]
    A12 --> D2{Has the admin provided a rejection reason?}
    D2 -->|No| A13["SYSTEM: Display error — A rejection reason is required before you can reject this claim"]
    A13 --> A12
    D2 -->|Yes| A14["SYSTEM: Update the claim status to REJECTED in the database"]
    A14 --> A15["SYSTEM: Send notification to the claimant — Your claim has been rejected. Reason: the reason provided by admin"]
    A15 --> E2([End])
```

**Explanation:**
Covers FR-07 and US-007. The mandatory rejection reason ensures fairness and a complete audit trail, addressing the campus security admin's need for traceable case management. Parallel notifications on approval keep both the claimant and reporter informed simultaneously.

**Mapped to:** FR-07, US-007

---

## Workflow 6: Receive and Read a Notification

**Actors:** System, User

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["SYSTEM: A key event is triggered — such as a new claim, match found, or claim decision"]
    A1 --> A2["SYSTEM: Create a notification record in the notifications table in the database"]
    A2 --> A3["SYSTEM: Add the notification to the delivery queue for processing"]
    A3 --> D1{Does the user have email notifications enabled in their profile settings?}
    D1 -->|Yes| A4["SYSTEM: Send notification email to the user via Nodemailer SMTP"]
    D1 -->|No| A5["SYSTEM: Skip email delivery for this notification"]
    A3 --> D2{Is the user currently logged in and active on the platform?}
    D2 -->|Yes| A6["SYSTEM: Push the in-app notification to the user browser via WebSocket"]
    A6 --> A7["USER: The notification bell icon updates with a new unread indicator"]
    A7 --> A8["USER: Click on the notification bell to open the notifications dropdown"]
    A8 --> A9["USER: Click on the specific notification to view its details"]
    A9 --> A10["SYSTEM: Mark the notification as read in the database"]
    A10 --> E1([End])
    D2 -->|No| A11["SYSTEM: Store the notification as unread and queue it for delivery on next login"]
    A11 --> E1
    A4 --> E1
    A5 --> E1
```

**Explanation:**
Covers FR-09 and US-009. The parallel delivery paths for email and in-app notifications ensure users are informed regardless of whether they are currently active. Addresses the student stakeholder's concern about timely updates on their reports and claims.

**Mapped to:** FR-09, US-009

---

## Workflow 7: Admin Marks Item as Resolved

**Actors:** Admin, System

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["ADMIN: Confirm that the item has been physically collected by the verified owner in person"]
    A1 --> A2["ADMIN: Navigate to the item detail page on the admin dashboard"]
    A2 --> A3["ADMIN: Click the Mark as Resolved button"]
    A3 --> A4["SYSTEM: Display a confirmation dialog — Are you sure you want to mark this item as resolved?"]
    A4 --> D1{Does the admin confirm the resolution action?}
    D1 -->|No| A5["ADMIN: Click Cancel and return to the item detail page"]
    A5 --> E1([End])
    D1 -->|Yes| A6["SYSTEM: Update the item status to RESOLVED in the database"]
    A6 --> A7["SYSTEM: Move the item record to the resolved archive"]
    A7 --> A8["SYSTEM: Remove the item from the active listings visible to all users"]
    A8 --> A9["SYSTEM: Send notification to the item reporter — Your item has been successfully returned to its owner and the case is now closed"]
    A8 --> A10["SYSTEM: Send notification to the claimant — You have collected your item and the case is now closed"]
    A8 --> A11["SYSTEM: Update the admin dashboard statistics to reflect the newly resolved case"]
    A9 --> E2([End])
    A10 --> E2
    A11 --> E2
```

**Explanation:**
Covers FR-10 and US-010. The three parallel post-resolution actions — notifying the reporter, notifying the claimant, and updating dashboard statistics — ensure all stakeholders are informed simultaneously and the admin dashboard remains accurate for University Management reporting.

**Mapped to:** FR-10, US-010

---

## Workflow 8: Search and Filter Item Listings

**Actors:** User, System

```mermaid
flowchart TD
    S([Start]) --> A1
    A1["USER: Navigate to the Browse Items page"]
    A1 --> A2["SYSTEM: Load all currently active LOST and FOUND item reports from the database by default"]
    A2 --> A3["SYSTEM: Display item cards showing title, category, campus location and date for each item"]
    A3 --> D1{Does the user want to search by keyword or apply filters?}
    D1 -->|No| A4["USER: Browse the default full listing of all active items"]
    A4 --> E1([End])
    D1 -->|Yes| A5["USER: Enter a keyword into the search bar and optionally select category, location and date filters"]
    A5 --> A6["USER: Click the Search button or Apply Filters button"]
    A6 --> A7["SYSTEM: Build a database query using the provided keyword and filter parameters"]
    A7 --> A8["SYSTEM: Execute the query against the items table in the database"]
    A8 --> D2{Did the query return any matching item records?}
    D2 -->|Yes| A9["SYSTEM: Display the matching item cards to the user with the total result count"]
    D2 -->|No| A10["SYSTEM: Display message — No items match your search. Try different keywords or filters."]
    A9 --> D3{Has the user found the item they were looking for?}
    A10 --> D4{Does the user want to refine their search with different parameters?}
    D3 -->|Yes| A11["USER: Click on the item card to open the full item detail page"]
    A11 --> A12["SYSTEM: Load and display the full item detail page including image, description and claim button"]
    A12 --> E2([End])
    D3 -->|No| D4
    D4 -->|Yes| A5
    D4 -->|No| E1
```

**Explanation:**
Covers FR-05 and US-005. The looping refinement path ensures users who do not find results on the first attempt are guided back to try different parameters, directly addressing the new student stakeholder's need for an intuitive browsing experience without dead ends.

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
