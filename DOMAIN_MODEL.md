# DOMAIN_MODEL.md — Domain Model Documentation
## Campus Lost & Found System (CLAFS)

---

## Overview

The domain model identifies the core entities in CLAFS, their attributes, responsibilities, relationships, and the business rules that govern their behaviour. These entities were derived from the functional requirements defined in Assignment 4, the use cases modelled in Assignment 5, and the state transition diagrams in Assignment 8.

---

## Core Domain Entities

### Entity 1: User

| Field | Details |
|-------|---------|
| **Description** | Represents any person who interacts with the CLAFS system. A user can be a Student, Lecturer/Staff, or Admin/Security. |
| **Attributes** | `userId: String`, `name: String`, `email: String`, `passwordHash: String`, `role: Enum (STUDENT, LECTURER, ADMIN)`, `isVerified: Boolean`, `failedLoginAttempts: Integer`, `lockedUntil: DateTime`, `createdAt: DateTime` |
| **Methods** | `register()`, `login()`, `logout()`, `verifyEmail()`, `resetPassword()`, `updateProfile()`, `toggleEmailNotifications()` |
| **Relationships** | A User submits zero or many ItemReports. A User submits zero or many Claims. A User receives zero or many Notifications. |

**Business Rules:**
- A user must register with a valid university email address
- A user account is locked for 15 minutes after 3 consecutive failed login attempts
- A user cannot change their university email after registration
- Only users with role ADMIN can approve or reject claims

---

### Entity 2: ItemReport

| Field | Details |
|-------|---------|
| **Description** | Represents a report submitted by a user for either a lost or found item on campus. This is the core entity of the CLAFS system. |
| **Attributes** | `itemId: String`, `userId: String`, `type: Enum (LOST, FOUND)`, `title: String`, `description: String`, `category: String`, `location: String`, `dateLostFound: Date`, `imageUrl: String`, `status: Enum (ACTIVE, RESOLVED, EXPIRED)`, `createdAt: DateTime` |
| **Methods** | `submitReport()`, `updateReport()`, `deleteReport()`, `markAsResolved()`, `markAsExpired()`, `findMatches()` |
| **Relationships** | An ItemReport is submitted by one User. An ItemReport has zero or many Claims. An ItemReport has zero or one Image. An ItemReport triggers zero or many Notifications. |

**Business Rules:**
- An ItemReport must have a title, description, location, and date before it can be submitted
- An ItemReport with status RESOLVED cannot receive new claims
- An ItemReport that has been ACTIVE for 30 days with no activity is automatically marked EXPIRED
- Only the Admin can mark an ItemReport as RESOLVED

---

### Entity 3: Claim

| Field | Details |
|-------|---------|
| **Description** | Represents a claim submitted by a user who believes a found item belongs to them. A claim must go through an admin review process before it is approved or rejected. |
| **Attributes** | `claimId: String`, `itemId: String`, `claimantId: String`, `proofDescription: String`, `status: Enum (PENDING, UNDER_REVIEW, APPROVED, REJECTED)`, `rejectionReason: String`, `createdAt: DateTime`, `resolvedAt: DateTime` |
| **Methods** | `submitClaim()`, `approveClaim()`, `rejectClaim()`, `cancelClaim()` |
| **Relationships** | A Claim is submitted by one User. A Claim is associated with one ItemReport. A Claim triggers one or many Notifications. |

**Business Rules:**
- A user cannot submit more than one claim per ItemReport
- A claim proof description must be at least 30 characters long
- A claim can only be approved or rejected by a user with role ADMIN
- Rejecting a claim requires a mandatory rejection reason
- When a claim is approved, all other claims on the same item are automatically rejected

---

### Entity 4: Notification

| Field | Details |
|-------|---------|
| **Description** | Represents a system-generated notification sent to a user when a key event occurs, such as a match being found, a claim being submitted, or a claim decision being made. |
| **Attributes** | `notificationId: String`, `userId: String`, `message: String`, `type: Enum (MATCH_FOUND, CLAIM_SUBMITTED, CLAIM_APPROVED, CLAIM_REJECTED, ITEM_RESOLVED)`, `isRead: Boolean`, `deliveryStatus: Enum (QUEUED, SENT, FAILED, ABANDONED)`, `retryCount: Integer`, `createdAt: DateTime` |
| **Methods** | `sendNotification()`, `markAsRead()`, `markAllAsRead()`, `retryDelivery()` |
| **Relationships** | A Notification is sent to one User. A Notification is triggered by one ItemReport or one Claim. |

**Business Rules:**
- A notification delivery is retried up to 3 times if it fails
- After 3 failed delivery attempts the notification is marked ABANDONED
- A user can disable email notifications from their profile settings
- In-app notifications are always delivered regardless of email preferences

---

### Entity 5: Image

| Field | Details |
|-------|---------|
| **Description** | Represents an image file uploaded by a user when reporting a lost or found item. Images are stored externally on Cloudinary and referenced by URL. |
| **Attributes** | `imageId: String`, `itemId: String`, `cloudinaryUrl: String`, `publicId: String`, `fileSize: Integer`, `fileType: String`, `uploadedAt: DateTime` |
| **Methods** | `uploadImage()`, `deleteImage()`, `validateFileType()`, `validateFileSize()` |
| **Relationships** | An Image belongs to one ItemReport. An Image is stored on the external Cloudinary service. |

**Business Rules:**
- Only JPG and PNG file types are accepted
- Image file size must not exceed 5MB
- An ItemReport can have at most one image
- If an image upload fails, the report can still be submitted without an image

---

### Entity 6: UserSession

| Field | Details |
|-------|---------|
| **Description** | Represents an active authenticated session for a logged-in user. Sessions are managed using JWT tokens with a defined expiry window. |
| **Attributes** | `sessionId: String`, `userId: String`, `jwtToken: String`, `issuedAt: DateTime`, `expiresAt: DateTime`, `status: Enum (ACTIVE, IDLE, EXPIRED, TERMINATED)` |
| **Methods** | `createSession()`, `validateToken()`, `refreshSession()`, `terminateSession()`, `isExpired()` |
| **Relationships** | A UserSession belongs to one User. |

**Business Rules:**
- A JWT token is valid for 8 hours from the time of issue
- A session becomes IDLE after 30 minutes of inactivity
- A session expires after 60 minutes of being IDLE
- A session is immediately TERMINATED when the user clicks logout

---

### Entity 7: AdminCase

| Field | Details |
|-------|---------|
| **Description** | Represents the administrative record grouping all activity related to a specific item report from the point it is submitted through to final resolution or closure. Used by Campus Security to track and manage cases. |
| **Attributes** | `caseId: String`, `itemId: String`, `adminId: String`, `status: Enum (OPEN, PENDING_CLAIM, UNDER_REVIEW, PENDING_COLLECTION, RESOLVED, ESCALATED, CLOSED)`, `openedAt: DateTime`, `resolvedAt: DateTime`, `notes: String` |
| **Methods** | `openCase()`, `reviewClaim()`, `escalateCase()`, `resolveCase()`, `closeCase()`, `addNote()` |
| **Relationships** | An AdminCase is associated with one ItemReport. An AdminCase is managed by one Admin User. |

**Business Rules:**
- An AdminCase is automatically created when an ItemReport is submitted
- A case can only be marked RESOLVED if at least one claim has been approved
- A case is escalated if the approved claimant does not collect the item within 7 days
- A case is automatically CLOSED if no claim is submitted within 30 days of the report being active

---

## Entity Relationship Summary

| Relationship | Type | Multiplicity |
|-------------|------|-------------|
| User submits ItemReport | Association | 1 User → 0..* ItemReports |
| User submits Claim | Association | 1 User → 0..* Claims |
| User receives Notification | Association | 1 User → 0..* Notifications |
| User owns UserSession | Composition | 1 User → 0..1 UserSession |
| ItemReport has Claim | Aggregation | 1 ItemReport → 0..* Claims |
| ItemReport has Image | Composition | 1 ItemReport → 0..1 Image |
| ItemReport triggers Notification | Association | 1 ItemReport → 0..* Notifications |
| Claim triggers Notification | Association | 1 Claim → 1..* Notifications |
| AdminCase manages ItemReport | Association | 1 AdminCase → 1 ItemReport |
