# ARCHITECTURE.md — Campus Lost & Found System

## Project Title
**Campus Lost & Found System (CLAFS)**

---

## Domain
**Higher Education / Campus Services** — A university campus environment where students, lecturers, and security staff interact with a centralized digital platform to report, search, claim, and manage lost and found items.

---

## Problem Statement
Manual lost and found processes on campus are inefficient. CLAFS provides a web-based platform that digitizes item reporting, image uploads, claim verification, and notifications end-to-end.

---

## C4 Architectural Diagrams

The C4 model describes software architecture at four levels of abstraction:
1. **Level 1 — System Context**: Who uses the system and what external systems it interacts with
2. **Level 2 — Container**: The major deployable units (apps, databases, services)
3. **Level 3 — Component**: The internal components within each container
4. **Level 4 — Code**: (Described in prose for key components)

---

## Level 1 — System Context Diagram

> Shows CLAFS and its relationships with users and external systems.

```mermaid
C4Context
  title System Context Diagram — Campus Lost & Found System (CLAFS)

  Person(student, "Student / Lecturer / Staff", "Reports lost or found items, searches listings, submits claims")
  Person(admin, "Campus Security / Admin", "Manages reports, verifies claims, resolves cases")

  System(clafs, "Campus Lost & Found System (CLAFS)", "Web application for reporting, claiming, and managing lost and found items on campus")

  System_Ext(emailSystem, "Email Service (SMTP / Nodemailer)", "Sends email notifications to users")
  System_Ext(cloudinary, "Cloudinary", "Stores and serves uploaded item images")
  System_Ext(universityAuth, "University Identity Provider", "Optional SSO / university email verification")

  Rel(student, clafs, "Reports items, searches, submits claims", "HTTPS")
  Rel(admin, clafs, "Manages all reports and claims", "HTTPS")
  Rel(clafs, emailSystem, "Sends notification emails", "SMTP")
  Rel(clafs, cloudinary, "Uploads and retrieves item images", "REST API")
  Rel(clafs, universityAuth, "Validates university email on registration", "OAuth2 / SMTP")
```

---

## Level 2 — Container Diagram

> Shows the major deployable components of CLAFS and how they communicate.

```mermaid
C4Container
  title Container Diagram — Campus Lost & Found System (CLAFS)

  Person(user, "Student / Staff / Lecturer", "Uses the web browser")
  Person(admin, "Admin / Campus Security", "Uses the web browser")

  Container(webApp, "React Web App", "React.js", "Single Page Application — provides the UI for all user interactions")
  Container(apiServer, "REST API Server", "Node.js + Express", "Handles all business logic: auth, item reports, claims, notifications")
  ContainerDb(db, "PostgreSQL Database", "PostgreSQL", "Stores users, item reports, claims, and notification logs")
  Container(notifService, "Notification Service", "Node.js module + WebSockets", "Sends real-time in-app and email notifications")

  System_Ext(cloudinary, "Cloudinary", "Cloud image storage")
  System_Ext(emailService, "Email Service", "SMTP / Nodemailer")

  Rel(user, webApp, "Interacts with", "HTTPS")
  Rel(admin, webApp, "Manages via", "HTTPS")
  Rel(webApp, apiServer, "API calls", "JSON / HTTPS")
  Rel(apiServer, db, "Reads and writes", "SQL / TCP")
  Rel(apiServer, cloudinary, "Uploads images", "REST API / HTTPS")
  Rel(apiServer, notifService, "Triggers notifications", "Internal call")
  Rel(notifService, emailService, "Sends emails", "SMTP")
  Rel(notifService, webApp, "Pushes real-time alerts", "WebSocket")
```

---

## Level 3 — Component Diagram: REST API Server

> Shows the internal components of the backend API server.

```mermaid
C4Component
  title Component Diagram — REST API Server

  Container_Ext(webApp, "React Web App", "React.js", "Frontend SPA")
  ContainerDb(db, "PostgreSQL", "Database")
  Container_Ext(cloudinary, "Cloudinary", "Image Storage")
  Container_Ext(notifService, "Notification Service", "Emails + WebSockets")

  Component(authController, "Auth Controller", "Express Router", "Handles registration, login, JWT issuance and validation")
  Component(itemController, "Item Controller", "Express Router", "Handles CRUD for lost and found item reports")
  Component(claimController, "Claim Controller", "Express Router", "Handles claim submissions, admin approvals/rejections")
  Component(imageController, "Image Upload Handler", "Multer + Cloudinary SDK", "Validates and uploads item images to Cloudinary")
  Component(notifController, "Notification Trigger", "Internal Module", "Fires notifications on key events (new match, claim update)")
  Component(searchController, "Search & Filter Controller", "Express Router", "Handles full-text search and filter queries on item reports")
  Component(rbacMiddleware, "RBAC Middleware", "Express Middleware", "Enforces role-based access control on protected routes")

  Rel(webApp, authController, "POST /auth/register, /auth/login", "HTTPS")
  Rel(webApp, itemController, "GET/POST/PUT /items", "HTTPS")
  Rel(webApp, claimController, "POST /claims, PUT /claims/:id", "HTTPS")
  Rel(webApp, searchController, "GET /items/search", "HTTPS")
  Rel(itemController, imageController, "Delegates image upload", "Internal")
  Rel(itemController, db, "Read/write item records", "SQL")
  Rel(claimController, db, "Read/write claim records", "SQL")
  Rel(authController, db, "Read/write user records", "SQL")
  Rel(imageController, cloudinary, "Upload image", "REST API")
  Rel(claimController, notifController, "Trigger claim notification", "Internal")
  Rel(itemController, notifController, "Trigger match notification", "Internal")
  Rel(notifController, notifService, "Send notification", "Internal")
  Rel(rbacMiddleware, authController, "Validates JWT token", "Internal")
```

---

## Level 3 — Component Diagram: React Web App

> Shows the internal structure of the frontend SPA.

```mermaid
C4Component
  title Component Diagram — React Web App (Frontend)

  Container_Ext(apiServer, "REST API Server", "Node.js + Express")

  Component(authPages, "Auth Pages", "React Components", "Login and Registration pages with form validation")
  Component(dashboard, "Dashboard", "React Component", "Landing page showing recent lost/found reports and stats")
  Component(reportForm, "Report Item Form", "React Component", "Form to report a lost or found item, includes image upload")
  Component(itemList, "Item Listings Page", "React Component", "Searchable, filterable list of all active lost/found reports")
  Component(itemDetail, "Item Detail Page", "React Component", "Shows full details of a single item, allows claim submission")
  Component(claimPanel, "Claim Management Panel", "React Component", "Admin view to review, approve, or reject claims")
  Component(notifBell, "Notification Bell", "React Component", "Real-time in-app notification indicator and dropdown")
  Component(authContext, "Auth Context / State", "React Context API", "Manages logged-in user state and JWT token")
  Component(apiService, "API Service Layer", "Axios", "Centralizes all HTTP calls to the backend API")

  Rel(authPages, apiService, "POST /auth/login, /register")
  Rel(dashboard, apiService, "GET /items/recent")
  Rel(reportForm, apiService, "POST /items")
  Rel(itemList, apiService, "GET /items/search")
  Rel(itemDetail, apiService, "GET /items/:id, POST /claims")
  Rel(claimPanel, apiService, "GET /claims, PUT /claims/:id")
  Rel(apiService, apiServer, "All API requests", "HTTPS / JSON")
  Rel(notifBell, apiServer, "Listens for events", "WebSocket")
  Rel(authContext, authPages, "Stores token after login")
```

---

## Level 4 — Key Design Decisions (Code Level)

### Authentication Flow
- User registers with university email → password hashed with `bcrypt` → stored in `users` table
- On login, a signed **JWT token** is returned → stored in browser `localStorage`
- All protected API routes validate the JWT via `rbacMiddleware` before processing

### Item Reporting Flow
1. User fills the Report Form → submits with optional image
2. Image is sent to `imageController` → uploaded to **Cloudinary** → URL returned
3. Item record (with Cloudinary URL) saved to `items` table in PostgreSQL
4. `notifController` checks for potential matches and fires notifications if found

### Claim & Verification Flow
1. User clicks "Claim This Item" on the Item Detail Page
2. Claim record created in `claims` table with status `PENDING`
3. Admin reviews claim in Claim Management Panel
4. Admin approves → status updated to `APPROVED` → both parties notified
5. Item status updated to `RESOLVED` once physically retrieved

---

## Database Schema (Summary)

```
users         → id, name, email, password_hash, role, created_at
items         → id, user_id, type (LOST/FOUND), title, description, location, date, image_url, status, created_at
claims        → id, item_id, claimant_id, description, status (PENDING/APPROVED/REJECTED), created_at
notifications → id, user_id, message, is_read, created_at
```
