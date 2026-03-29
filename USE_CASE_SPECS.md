# USE_CASE_SPECS.md — Use Case Specifications
## Campus Lost & Found System (CLAFS)

---

## UC-01: Register & Login

**Actor:** Student, Lecturer/Staff, Admin
**Description:** Allows a new user to create an account using their university email and password, or an existing user to log in and receive a JWT session token.
**Related Requirement:** FR-01, FR-02

**Preconditions:**
- The user has a valid university email address
- The system is online and accessible

**Postconditions:**
- On registration: A new user record is created in the database; a verification email is sent
- On login: A JWT token is issued and stored in the browser; the user is redirected to their role-appropriate dashboard

**Basic Flow (Login):**
1. User navigates to the login page
2. User enters their university email and password
3. System validates the credentials against the database
4. System generates and returns a signed JWT token
5. System redirects the user to the dashboard based on their role

**Alternative Flows:**
- **AF-01A (Wrong Password):** System displays "Invalid email or password." No token is issued.
- **AF-01B (3 Failed Attempts):** Account is locked for 15 minutes. System displays lockout message and time remaining.
- **AF-01C (Unverified Email):** System prompts the user to verify their email before logging in.
- **AF-01D (Non-University Email on Registration):** System rejects the email and displays "Please use your university email address."

---

## UC-02: Report Lost Item

**Actor:** Student, Lecturer/Staff
**Description:** Allows an authenticated user to submit a report for an item they have lost on campus, including optional image upload.
**Related Requirement:** FR-02, FR-08

**Preconditions:**
- User is authenticated (valid JWT token)
- User has access to the Report Lost Item form

**Postconditions:**
- A new item record of type LOST is saved in the database with status ACTIVE
- If an image was uploaded, the image URL from Cloudinary is stored with the record
- The system checks for potential matches with existing FOUND reports
- If a match is found, the user receives a notification

**Basic Flow:**
1. User navigates to "Report Lost Item"
2. User fills in title, category, description, date lost, and campus location
3. User optionally uploads a photo of the item
4. System uploads image to Cloudinary and receives the image URL
5. System saves the item record to the database
6. System queries for matching FOUND reports
7. System displays a confirmation message to the user
8. If a match is found, system triggers a notification to the user

**Alternative Flows:**
- **AF-02A (Image Too Large):** System displays "Image must be under 5MB." Report can still be submitted without the image.
- **AF-02B (Missing Required Fields):** System highlights unfilled fields and prevents submission.
- **AF-02C (Cloudinary Unavailable):** Image upload is skipped; report is saved without an image; user is informed.

---

## UC-03: Report Found Item

**Actor:** Student, Lecturer/Staff
**Description:** Allows an authenticated user to report an item they have found on campus so the rightful owner can claim it.
**Related Requirement:** FR-03, FR-08

**Preconditions:**
- User is authenticated
- User physically has or has observed the found item

**Postconditions:**
- A new item record of type FOUND is saved in the database with status ACTIVE
- System checks for matching LOST reports and notifies relevant users if a match is found

**Basic Flow:**
1. User navigates to "Report Found Item"
2. User fills in title, category, description, date found, and campus location
3. User optionally uploads a photo of the item
4. System uploads image to Cloudinary
5. System saves the item record to the database
6. System queries for matching LOST reports
7. System notifies the matching lost item reporter if a match is detected
8. Confirmation message displayed to the finder

**Alternative Flows:**
- **AF-03A (Duplicate Report):** System warns the user if a very similar found item was recently reported at the same location.
- **AF-03B (Image Upload Fails):** Report is saved without an image; user is notified.

---

## UC-04: Search & Filter Items

**Actor:** Student, Lecturer/Staff, Admin
**Description:** Allows any authenticated user to search the active item listings using keywords, category, date range, and campus location filters.
**Related Requirement:** FR-05

**Preconditions:**
- User is authenticated
- At least one active item report exists in the system

**Postconditions:**
- A filtered list of matching items is displayed to the user
- No changes are made to any item records

**Basic Flow:**
1. User navigates to the "Browse Items" page
2. User enters a keyword in the search bar and/or selects filter options
3. System queries the database using the provided parameters
4. System returns and displays matching item cards within 2 seconds
5. User can click on any item card to view full details

**Alternative Flows:**
- **AF-04A (No Results Found):** System displays "No items match your search. Try different keywords or filters."
- **AF-04B (Empty Search):** System loads all active items by default when no filters are applied.

---

## UC-05: Submit Claim

**Actor:** Student, Lecturer/Staff
**Description:** Allows an authenticated user to submit a claim on a found item by providing a written description of proof of ownership.
**Related Requirement:** FR-06

**Preconditions:**
- User is authenticated
- The item being claimed has status ACTIVE and type FOUND
- The user has not previously submitted a claim on this item
- The user has already located the item independently (e.g., via Search & Filter or direct browsing) — this is a precondition, not part of this use case

**Postconditions:**
- A new claim record is saved in the database with status PENDING
- Admin receives an in-app and email notification of the new claim
- The claimant receives a confirmation notification

**Basic Flow:**
1. User navigates to the detail page of a found item they wish to claim
2. User clicks "Claim This Item"
3. User writes a description of proof of ownership (minimum 30 characters)
4. User submits the claim
5. System saves the claim record with status PENDING
6. System notifies Admin of the new pending claim
7. System notifies the claimant that their claim has been submitted

**Alternative Flows:**
- **AF-05A (Claim Description Too Short):** System displays "Please provide at least 30 characters describing your proof of ownership."
- **AF-05B (Duplicate Claim):** System detects the user already has an active claim on this item and displays "You have already submitted a claim for this item."
- **AF-05C (Item Already Resolved):** System prevents claim submission and informs the user the item has already been returned to its owner.

---

## UC-06: Review & Approve Claims

**Actor:** Campus Security / Admin
**Description:** Allows Admin to view all pending claims, assess each claimant's proof of ownership, and approve or reject the claim with a mandatory reason.
**Related Requirement:** FR-07

**Preconditions:**
- Admin is authenticated with the ADMIN role
- At least one claim with status PENDING exists in the system

**Postconditions:**
- Claim status is updated to APPROVED or REJECTED
- If approved, the item status is updated to RESOLVED
- Both the claimant and the item reporter are notified of the decision

**Basic Flow:**
1. Admin navigates to the "Claim Management" panel
2. System displays all claims with status PENDING
3. Admin selects a claim to review
4. Admin reads the claimant's proof of ownership description
5. Admin clicks "Approve" or "Reject"
6. If rejecting, Admin enters a mandatory rejection reason
7. System updates the claim status in the database
8. If approved, system also updates the item status to RESOLVED
9. System notifies both the claimant and the item reporter

**Alternative Flows:**
- **AF-06A (Reject Without Reason):** System prevents rejection and displays "Please provide a reason for rejection."
- **AF-06B (Multiple Claims on Same Item):** Admin sees all claims listed for the item. Approving one automatically rejects all others with a system-generated reason.

---

## UC-07: Receive Notifications

**Actor:** Student, Lecturer/Staff, Admin
**Description:** The system automatically sends in-app and email notifications to users when relevant events occur, such as a match being found, a claim being submitted, or a claim decision being made.
**Related Requirement:** FR-09

**Preconditions:**
- User is registered and has not disabled notifications in their profile settings
- A triggering event has occurred (new match, claim submitted, claim decision)

**Postconditions:**
- In-app notification appears in the user's notification bell within 1 minute
- Email notification is delivered to the user's university email within 5 minutes
- Notification is stored in the notifications table and marked as unread

**Basic Flow:**
1. A triggering event occurs (e.g., Admin approves a claim)
2. System identifies the affected users (claimant and item reporter)
3. System creates notification records in the database
4. System pushes an in-app notification to active user sessions via WebSocket
5. System sends an email via Nodemailer to the user's university email
6. User sees the notification bell indicator update in real time
7. User clicks the notification to view details

**Alternative Flows:**
- **AF-07A (User Has Disabled Email Notifications):** In-app notification is still sent; email is skipped.
- **AF-07B (User Is Offline):** In-app notification is queued and delivered when the user next logs in.
- **AF-07C (Email Delivery Failure):** System logs the failure and retries delivery after 5 minutes.

---

## UC-08: Mark Item as Resolved

**Actor:** Campus Security / Admin
**Description:** Allows Admin to mark an item report as RESOLVED once the item has been physically collected by the verified owner, closing the case.
**Related Requirement:** FR-10

**Preconditions:**
- Admin is authenticated with the ADMIN role
- The item has at least one APPROVED claim
- The item has been physically handed over to the claimant

**Postconditions:**
- Item status is updated from ACTIVE to RESOLVED in the database
- Item is removed from the active listings and moved to the resolved archive
- Both the original reporter and the successful claimant are notified

**Basic Flow:**
1. Admin navigates to the item detail page or admin dashboard
2. Admin locates the item with an APPROVED claim
3. Admin clicks "Mark as Resolved"
4. System prompts Admin to confirm the action
5. Admin confirms
6. System updates item status to RESOLVED
7. System archives the item from the active listings
8. System sends notifications to the reporter and the claimant confirming case closure

**Alternative Flows:**
- **AF-08A (No Approved Claim Exists):** System prevents resolution and displays "This item cannot be resolved without an approved claim."
- **AF-08B (Admin Accidentally Resolves):** A resolved item can be reopened by Admin within 24 hours if it was marked resolved in error.
