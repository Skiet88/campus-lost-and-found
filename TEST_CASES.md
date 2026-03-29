# TEST_CASES.md — Test Case Development
## Campus Lost & Found System (CLAFS)

---

## 1. Functional Test Cases

| Test Case ID | Requirement ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-001 | FR-01 | User registers with a valid university email | 1. Navigate to /register. 2. Enter a valid university email (e.g., s12345678@cput.ac.za). 3. Enter a strong password. 4. Click Register. | Account is created. A verification email is sent. User is redirected to a "Check your email" page. | - | - |
| TC-002 | FR-01 | User attempts to register with a non-university email | 1. Navigate to /register. 2. Enter a non-university email (e.g., user@gmail.com). 3. Enter a password. 4. Click Register. | System rejects the submission and displays: "Please use your university email address." No account is created. | - | - |
| TC-003 | FR-02 | Authenticated user logs in successfully | 1. Navigate to /login. 2. Enter valid university email and password. 3. Click Login. | JWT token is issued. User is redirected to their role-appropriate dashboard within 2 seconds. | - | - |
| TC-004 | FR-02 | Account lockout after 3 failed login attempts | 1. Navigate to /login. 2. Enter correct email but wrong password 3 times consecutively. | After the 3rd failed attempt, account is locked for 15 minutes. Message displayed: "Account temporarily locked. Try again in 15 minutes." | - | - |
| TC-005 | FR-03 | Authenticated user submits a lost item report with all required fields | 1. Log in as a student. 2. Navigate to "Report Lost Item". 3. Fill in title, category, description, date, and location. 4. Click Submit. | Item record of type LOST saved in the database with status ACTIVE. Confirmation message displayed within 3 seconds. | - | - |
| TC-006 | FR-03 | Lost item report submission fails when required fields are missing | 1. Log in as a student. 2. Navigate to "Report Lost Item". 3. Leave the description field empty. 4. Click Submit. | Form submission is blocked. Empty required fields are highlighted in red. Error message displayed. | - | - |
| TC-007 | FR-08 | User uploads an image exceeding the 5MB limit | 1. Log in as a student. 2. Navigate to "Report Lost Item". 3. Attach an image file larger than 5MB. 4. Click Submit. | System rejects the image and displays: "Image must be under 5MB." The rest of the form remains filled. User can submit without the image. | - | - |
| TC-008 | FR-05 | User searches for items by keyword | 1. Log in as a student. 2. Navigate to "Browse Items". 3. Enter "laptop" in the search bar. 4. Click Search. | All active item reports containing "laptop" in the title or description are displayed within 2 seconds. | - | - |
| TC-009 | FR-05 | User applies multiple filters simultaneously | 1. Log in as a student. 2. Navigate to "Browse Items". 3. Select category "Electronics", location "Library", and date range "Last 7 days". 4. Click Apply Filters. | Only items matching ALL three filters are displayed. Results load within 2 seconds. | - | - |
| TC-010 | FR-06 | User submits a claim with a valid proof of ownership description | 1. Log in as a student. 2. Find an active FOUND item. 3. Click "Claim This Item". 4. Enter a description of at least 30 characters. 5. Click Submit Claim. | Claim record saved with status PENDING. Admin receives an in-app and email notification within 1 minute. Claimant receives a confirmation notification. | - | - |
| TC-011 | FR-06 | User attempts to submit a claim with a description under 30 characters | 1. Log in as a student. 2. Click "Claim This Item" on a found item. 3. Enter a description of fewer than 30 characters. 4. Click Submit. | System blocks submission and displays: "Please provide at least 30 characters describing your proof of ownership." | - | - |
| TC-012 | FR-07 | Admin approves a claim | 1. Log in as Admin. 2. Navigate to "Claim Management". 3. Select a PENDING claim. 4. Click "Approve". 5. Confirm the action. | Claim status updated to APPROVED. Item status updated to RESOLVED. Both claimant and reporter receive notifications within 1 minute. | - | - |
| TC-013 | FR-07 | Admin attempts to reject a claim without providing a reason | 1. Log in as Admin. 2. Navigate to "Claim Management". 3. Select a PENDING claim. 4. Click "Reject". 5. Leave reason field empty. 6. Click Confirm. | System blocks the rejection and displays: "Please provide a reason for rejection." | - | - |
| TC-014 | FR-10 | Admin marks an item as resolved | 1. Log in as Admin. 2. Navigate to an item with an APPROVED claim. 3. Click "Mark as Resolved". 4. Confirm the action. | Item status updated to RESOLVED. Item removed from active listings. Both reporter and claimant notified. | - | - |

---

## 2. Non-Functional Test Cases

### NFR Test 1: Performance — Search Response Time Under Load

| Field | Details |
|-------|---------|
| **Test Case ID** | NFR-TC-001 |
| **Requirement ID** | NFR-08, NFR-13 |
| **Description** | Verify that search results load within 2 seconds when the system is under load with 500 concurrent users |
| **Test Tool** | Apache JMeter or k6 |
| **Test Steps** | 1. Seed the database with 10,000 active item records. 2. Configure JMeter to simulate 500 concurrent users. 3. Each virtual user sends a GET /items/search?q=laptop request simultaneously. 4. Record response times for all 500 requests. |
| **Expected Result** | Average response time is under 2 seconds. No requests time out. Server returns HTTP 200 for all requests. |
| **Actual Result** | - |
| **Status** | - |

---

### NFR Test 2: Security — SQL Injection Prevention

| Field | Details |
|-------|---------|
| **Test Case ID** | NFR-TC-002 |
| **Requirement ID** | NFR-12 |
| **Description** | Verify that the system's search and login fields are protected against SQL injection attacks |
| **Test Tool** | OWASP ZAP / Manual testing |
| **Test Steps** | 1. Navigate to the login page. 2. In the email field, enter: `' OR '1'='1`. 3. In the password field, enter: `' OR '1'='1`. 4. Click Login. 5. Repeat the same injection string in the search bar on the Browse Items page. |
| **Expected Result** | Login attempt fails with "Invalid email or password." Search returns no results or an empty state. No database error is exposed. The system does not grant unauthorized access. |
| **Actual Result** | - |
| **Status** | - |

---

## 3. Test Coverage Summary

| Category | Test Cases Covered | Requirements Traced |
|----------|--------------------|---------------------|
| Authentication | TC-001, TC-002, TC-003, TC-004 | FR-01, FR-02 |
| Item Reporting | TC-005, TC-006, TC-007 | FR-03, FR-08 |
| Search & Filter | TC-008, TC-009 | FR-05 |
| Claims | TC-010, TC-011, TC-012, TC-013 | FR-06, FR-07 |
| Resolution | TC-014 | FR-10 |
| Performance | NFR-TC-001 | NFR-08, NFR-13 |
| Security | NFR-TC-002 | NFR-12 |
