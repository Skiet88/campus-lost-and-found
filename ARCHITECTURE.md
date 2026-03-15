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

## Level 4 — Code Diagram (Key Entities)

> Shows the core classes/entities of the system, their attributes, and relationships.

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password_hash
        +enum role
        +datetime created_at
        +register()
        +login()
        +updateProfile()
    }

    class Item {
        +int id
        +int user_id
        +enum type
        +string title
        +string description
        +string location
        +date date_lost_found
        +string image_url
        +enum status
        +datetime created_at
        +reportItem()
        +updateStatus()
        +deleteItem()
    }

    class Claim {
        +int id
        +int item_id
        +int claimant_id
        +string description
        +enum status
        +datetime created_at
        +submitClaim()
        +approveClaim()
        +rejectClaim()
    }

    class Notification {
        +int id
        +int user_id
        +string message
        +boolean is_read
        +datetime created_at
        +sendNotification()
        +markAsRead()
    }

    class Admin {
        +int id
        +string name
        +string email
        +manageItems()
        +manageClaims()
        +resolveCase()
    }

    User "1" --> "0..*" Item : reports
    User "1" --> "0..*" Claim : submits
    Item "1" --> "0..*" Claim : receives
    User "1" --> "0..*" Notification : receives
    Admin "1" --> "0..*" Claim : reviews
    Admin "1" --> "0..*" Item : manages
    Claim "1" --> "1..*" Notification : triggers
    Item "1" --> "1..*" Notification : triggers
```

---

## End-to-End Data Flow

> Shows how data moves through the entire system for the three core workflows.

### Flow 1: Reporting a Lost or Found Item

```mermaid
sequenceDiagram
    actor User
    participant WebApp as React Web App
    participant API as Node.js API Server
    participant Cloudinary as Cloudinary
    participant DB as PostgreSQL
    participant Notif as Notification Service

    User->>WebApp: Fill report form (title, description, location, image)
    WebApp->>API: POST /items (form data + image file)
    API->>API: Validate JWT token (RBAC Middleware)
    API->>Cloudinary: Upload image file
    Cloudinary-->>API: Return image URL
    API->>DB: INSERT into items table (with image URL)
    DB-->>API: Confirm item saved
    API->>DB: Query for potential matches (lost vs found)
    DB-->>API: Return matching items (if any)
    API->>Notif: Trigger match notification (if match found)
    Notif-->>User: Send email + in-app alert
    API-->>WebApp: Return success + new item data
    WebApp-->>User: Show confirmation message
```

---

### Flow 2: Claiming a Found Item

```mermaid
sequenceDiagram
    actor Claimant
    actor Admin
    participant WebApp as React Web App
    participant API as Node.js API Server
    participant DB as PostgreSQL
    participant Notif as Notification Service

    Claimant->>WebApp: View found item, click "Claim This Item"
    WebApp->>API: POST /claims (item_id + claim description)
    API->>API: Validate JWT token
    API->>DB: INSERT claim with status = PENDING
    DB-->>API: Claim saved
    API->>Notif: Notify Admin of new claim
    Notif-->>Admin: Email + in-app alert (new claim pending)
    Admin->>WebApp: Open Claim Management Panel
    WebApp->>API: GET /claims (admin only)
    API->>DB: Fetch all PENDING claims
    DB-->>API: Return claims list
    API-->>WebApp: Return claims data
    Admin->>WebApp: Click Approve / Reject
    WebApp->>API: PUT /claims/:id (status = APPROVED or REJECTED)
    API->>DB: UPDATE claim status
    API->>DB: UPDATE item status = RESOLVED (if approved)
    API->>Notif: Notify claimant of decision
    Notif-->>Claimant: Email + in-app alert (claim approved/rejected)
    API-->>WebApp: Confirm update
    WebApp-->>Admin: Show updated claim status
```

---

### Flow 3: User Login & Authentication

```mermaid
sequenceDiagram
    actor User
    participant WebApp as React Web App
    participant API as Node.js API Server
    participant DB as PostgreSQL

    User->>WebApp: Enter email and password
    WebApp->>API: POST /auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: Return user record
    API->>API: Compare password with bcrypt hash
    alt Password correct
        API->>API: Generate signed JWT token
        API-->>WebApp: Return JWT token + user role
        WebApp->>WebApp: Store JWT in localStorage
        WebApp-->>User: Redirect to Dashboard
    else Password incorrect
        API-->>WebApp: Return 401 Unauthorized
        WebApp-->>User: Show error message
    end
```

---

## Database Schema (Summary)

```
users         → id, name, email, password_hash, role (STUDENT/STAFF/ADMIN), created_at
items         → id, user_id, type (LOST/FOUND), title, description, location, date, image_url, status (ACTIVE/RESOLVED), created_at
claims        → id, item_id, claimant_id, description, status (PENDING/APPROVED/REJECTED), created_at
notifications → id, user_id, message, is_read, created_at
```
