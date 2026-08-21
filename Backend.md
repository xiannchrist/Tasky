# TASKY — Full Backend, Database, Multi-User LMS Synchronization & Mobile Integration

## ROLE

Act as a senior full-stack software architect and engineer specializing in:

* React Native + Expo
* TypeScript
* FastAPI
* PostgreSQL
* SQLAlchemy
* REST API design
* Authentication and authorization
* Background workers / scheduled jobs
* LMS integration
* Web data synchronization
* Push notifications
* Docker
* Production deployment
* Mobile application architecture

You are working on an existing React Native + Expo mobile application called **Tasky**.

Your job is to extend the existing project into a production-ready, multi-user academic task management platform while preserving the existing UI/UX and functionality unless a change is explicitly required.

---

# 1. EXISTING APPLICATION

Tasky is currently a React Native + Expo mobile task management application.

Current technology stack:

* React Native 0.81.5
* React 19.1.0
* Expo SDK 54
* TypeScript 5.9.2
* React Navigation 7
* AsyncStorage 2.1.2
* Expo Notifications
* React Native Reanimated
* React Native Gesture Handler
* Expo Vector Icons

Existing architecture:

```text
UI
 ├── AppNavigator
 ├── HomeScreen
 ├── TasksScreen
 ├── SettingsScreen
 ├── AddTaskScreen
 ├── EditTaskScreen
 └── TaskDetailsScreen

State
 └── TaskContext

Services
 ├── storageService
 ├── notificationService
 └── api/
      ├── client.ts
      └── taskApi.ts

Types
 ├── Task.ts
 └── navigation.ts

Utils
 ├── dateUtils.ts
 └── validation.ts
```

The current app already supports:

* Task CRUD
* Subjects
* Student profile
* Task filtering
* Searching
* Task statistics
* Local persistence
* Local deadline notifications
* Backend-ready API service contracts

Do NOT unnecessarily rewrite or replace these systems.

---

# 2. MAIN OBJECTIVE

Transform Tasky from a local-only task manager into a:

> **Multi-user academic task management application that can automatically synchronize assignments, quizzes, performance tasks, projects, exams, and deadlines from the school's custom LMS into each student's Tasky account.**

The desired experience is:

```text
Instructor creates task in LMS
            ↓
LMS Sync Worker detects new task
            ↓
Tasky Backend processes task
            ↓
Task is associated with correct student
            ↓
Task is stored in PostgreSQL
            ↓
Tasky automatically displays the task
            ↓
Push notification is sent
            ↓
Student receives notification
```

The student should NOT need to manually create the task again.

For example:

```text
Instructor adds:

Database Management
Quiz 2
Deadline: August 28, 2026 11:59 PM
```

Tasky automatically creates:

```text
Database Management
Quiz 2

Due:
August 28, 2026 — 11:59 PM

Source:
School LMS
```

and sends:

```text
🔔 New Quiz

Database Management — Quiz 2

Due August 28, 2026 at 11:59 PM
```

---

# 3. IMPORTANT ARCHITECTURAL DECISION

Use the following architecture:

```text
                    CUSTOM SCHOOL LMS
                           │
                           ▼
                  ┌─────────────────┐
                  │  LMS Sync       │
                  │  Worker         │
                  │                 │
                  │ Python          │
                  │ Scheduled Sync  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   FastAPI       │
                  │   Backend       │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  └────────┬────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
               Task API        FCM
                    │             │
                    ▼             ▼
              Tasky Mobile    Push Notification
```

Do NOT put LMS scraping/synchronization logic directly inside the React Native application.

Do NOT require the mobile app to remain open for synchronization.

Do NOT use one shared LMS account for all students.

Every student must have their own:

```text
Tasky account
        +
LMS connection
        +
LMS credentials/session
        +
tasks
        +
notification device token
```

---

# 4. BACKEND TECHNOLOGY

Use:

* Python
* FastAPI
* PostgreSQL
* SQLAlchemy 2.x
* Alembic
* Pydantic
* JWT authentication
* Passlib or another secure password hashing implementation
* python-dotenv / environment configuration
* HTTP client such as httpx or requests
* BeautifulSoup where HTML parsing is necessary
* Background worker/scheduler architecture
* Firebase Cloud Messaging for remote push notifications

Use a clean modular architecture.

Recommended backend structure:

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── task.py
│   │   ├── lms_connection.py
│   │   ├── device.py
│   │   └── notification.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── subject.py
│   │   ├── lms.py
│   │   └── notification.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── tasks.py
│   │   ├── subjects.py
│   │   ├── profile.py
│   │   ├── lms.py
│   │   └── notifications.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── task_service.py
│   │   ├── lms_service.py
│   │   └── notification_service.py
│   │
│   └── workers/
│       ├── scheduler.py
│       ├── lms_sync_worker.py
│       └── deadline_worker.py
│
├── migrations/
├── tests/
├── .env.example
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

# 5. DATABASE

Use PostgreSQL.

Do NOT use MongoDB unless there is a specific technical reason.

The application requires relational relationships between:

```text
Users
Subjects
Tasks
LMS Connections
Devices
Notifications
```

Recommended schema:

```text
USERS
 ├── id
 ├── email
 ├── password_hash
 ├── name
 ├── student_id
 ├── section
 ├── about
 ├── created_at
 └── updated_at

SUBJECTS
 ├── id
 ├── user_id
 ├── name
 ├── code
 ├── color
 ├── created_at
 └── updated_at

TASKS
 ├── id
 ├── user_id
 ├── subject_id
 ├── lms_source_id
 ├── title
 ├── description
 ├── task_type
 ├── deadline
 ├── priority
 ├── status
 ├── source
 ├── source_url
 ├── created_at
 └── updated_at

LMS_CONNECTIONS
 ├── id
 ├── user_id
 ├── lms_url
 ├── lms_username
 ├── encrypted_credentials_or_session
 ├── status
 ├── last_sync_at
 ├── last_error
 ├── created_at
 └── updated_at

DEVICES
 ├── id
 ├── user_id
 ├── push_token
 ├── platform
 ├── device_name
 ├── created_at
 └── updated_at

NOTIFICATIONS
 ├── id
 ├── user_id
 ├── task_id
 ├── type
 ├── title
 ├── body
 ├── read
 ├── sent_at
 └── created_at
```

Use foreign keys and indexes appropriately.

---

# 6. USER AUTHENTICATION

Tasky must support multiple students.

Create:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
```

Registration:

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "password"
}
```

Do NOT store plaintext Tasky passwords.

Use secure password hashing.

Use JWT access tokens.

Store authentication tokens securely on the mobile device using:

```text
expo-secure-store
```

Do NOT store JWT tokens in AsyncStorage.

AsyncStorage may continue to be used for non-sensitive local application data.

---

# 7. TASK API

Create:

```text
GET    /api/tasks
GET    /api/tasks/{id}
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
POST   /api/tasks/sync
```

Every endpoint requiring user data must determine the user from the authenticated JWT.

NEVER trust a user-provided `user_id` for authorization.

For example:

```text
GET /api/tasks
```

must return only the authenticated user's tasks.

Student A must never be able to retrieve Student B's tasks.

---

# 8. SUBJECT API

Create:

```text
GET  /api/subjects
POST /api/subjects
PUT  /api/subjects/{id}
DELETE /api/subjects/{id}
```

LMS-imported tasks should attempt to match an LMS course/subject to an existing Tasky subject.

If no matching subject exists, create or suggest one according to the configured synchronization policy.

---

# 9. LMS CONNECTION

Add a new section to Tasky Settings:

```text
Settings
   ↓
LMS Integration
```

Create a screen/modal:

```text
Connect School LMS

LMS URL
[________________]

LMS Username
[________________]

LMS Password
[________________]

[ Connect LMS ]
```

After successful connection:

```text
✓ LMS Connected

Last Sync:
Just now

Next Sync:
5 minutes

[ Sync Now ]
[ Disconnect LMS ]
```

The student's LMS credentials must NEVER be stored in plaintext.

Prefer an officially supported authentication/session/token mechanism if the LMS provides one.

If credentials are absolutely required for the permitted integration, encrypt them at rest and restrict access to the synchronization service.

NEVER expose LMS credentials to the mobile client after submission.

NEVER return LMS passwords through API responses.

---

# 10. LMS SYNC ENGINE

Create a separate LMS integration layer.

Example:

```text
backend/app/lms/
├── base.py
├── custom_lms.py
├── parser.py
├── normalizer.py
└── sync.py
```

Use an adapter-style design:

```text
LMS Adapter
    │
    ├── authenticate()
    ├── fetch_courses()
    ├── fetch_tasks()
    ├── fetch_quizzes()
    ├── fetch_deadlines()
    └── normalize()
```

The system must be designed so that the school's current custom LMS implementation can later be replaced by an official API integration without rewriting the rest of Tasky.

---

# 11. CUSTOM LMS SUPPORT

The current school LMS does not provide an API.

Therefore, initially support an authorized web-based synchronization approach.

Possible approaches, depending on how the LMS actually works:

1. Authenticated HTTP requests
2. HTML parsing
3. Browser automation only when necessary
4. Official calendar/feed integration if available
5. Future official API integration

DO NOT bypass:

* CAPTCHA
* MFA
* authentication controls
* rate limits
* access controls
* anti-bot protections

Do not attempt to circumvent security mechanisms.

The implementation must only access information available to the authenticated student's own LMS account.

---

# 12. AUTOMATIC TASK CREATION

This is a core feature.

When an instructor creates:

```text
Assignment
Quiz
Performance Task
Exam
Project
Activity
Deadline
```

in the LMS, the LMS Sync Worker must detect it.

Example:

```text
Instructor creates:

Web Development
Activity 4
Due August 28, 2026 11:59 PM
```

The sync worker detects:

```text
New LMS item
```

and automatically creates:

```text
Tasky Task:

Title:
Activity 4

Subject:
Web Development

Type:
Assignment

Deadline:
August 28, 2026 11:59 PM

Source:
LMS

Source URL:
LMS task URL
```

The student must NOT have to manually create the task.

---

# 13. TASK TYPES

Support:

```text
assignment
quiz
performance_task
exam
project
activity
deadline
other
```

The Tasky UI should visually distinguish task types.

---

# 14. DUPLICATE DETECTION

This is mandatory.

The LMS may return the same task every time synchronization runs.

Example:

```text
10:00 → Activity 4
10:05 → Activity 4
10:10 → Activity 4
10:15 → Activity 4
```

Tasky must create only ONE task.

Use:

```text
lms_source_id
+
user_id
```

as the primary synchronization identity.

Example:

```text
user_id = 101
lms_source_id = assignment-82931
```

If the same item appears again:

```text
Already exists
→ update existing task if necessary
→ do not create duplicate
```

---

# 15. LMS UPDATE DETECTION

Synchronization must not only detect new tasks.

It must detect changes such as:

```text
Deadline changed
Title changed
Description changed
Task removed
Task reopened
Task marked unavailable
```

For example:

```text
Before:
Quiz 2
Due Aug 28

After LMS update:
Quiz 2
Due Aug 30
```

Tasky should update the existing task instead of creating another task.

If the deadline changes, update scheduled notifications accordingly.

---

# 16. AUTOMATIC NOTIFICATIONS

Replace the current architecture's reliance on only local deadline notifications with a hybrid notification system.

Current local notification functionality already schedules reminders 24 hours before deadlines. Preserve this functionality where useful.

Add remote push notifications using Firebase Cloud Messaging.

Notification types:

```text
NEW_TASK
NEW_QUIZ
NEW_PERFORMANCE_TASK
NEW_EXAM
DEADLINE_CHANGED
DEADLINE_TOMORROW
DEADLINE_TODAY
TASK_OVERDUE
SYNC_ERROR
```

Example:

```text
🔔 New Quiz

Database Management — Quiz 2

Due:
August 28, 2026 at 11:59 PM
```

---

# 17. DEVICE REGISTRATION

When the student logs into Tasky:

```text
Tasky
 ↓
Request notification permission
 ↓
Get push token
 ↓
POST /api/devices
 ↓
Backend associates token with authenticated user
```

Create:

```text
POST   /api/devices
DELETE /api/devices/{id}
```

Support multiple devices per user.

Example:

```text
Student A
 ├── Android Phone
 └── Tablet
```

Both can receive notifications.

---

# 18. LMS SYNC SCHEDULER

Do not depend on the mobile application being open.

The synchronization must happen on the backend.

Example:

```text
Every 5 minutes

Sync Worker
    ↓
Get active LMS connections
    ↓
For each student:
    ↓
Connect to LMS
    ↓
Fetch permitted academic items
    ↓
Normalize data
    ↓
Compare with database
    ↓
Create/update tasks
    ↓
Trigger notifications
```

For the first implementation, a scheduler is acceptable.

For production, use a proper worker architecture such as:

```text
Celery + Redis
```

or another reliable background-job system.

Do not create an uncontrolled infinite loop inside the FastAPI request process.

---

# 19. USER-SPECIFIC SYNCHRONIZATION

This is critical.

Each user has:

```text
Tasky Account
      │
      └── LMS Connection
              │
              └── LMS Account
```

Example:

```text
Student A
 └── LMS Account A
       └── Tasks A

Student B
 └── LMS Account B
       └── Tasks B
```

Student A must NEVER receive Student B's tasks.

Every database query and synchronization operation must be scoped to the authenticated user/LMS connection.

---

# 20. MOBILE APP CHANGES

Do not redesign the entire existing UI.

Preserve:

* HomeScreen
* TasksScreen
* SettingsScreen
* TaskDetailsScreen
* AddTaskScreen
* EditTaskScreen
* CustomTabBar
* TaskCard
* existing design system
* existing mascot
* existing colors
* existing animations

The current application already has centralized state and CRUD operations through `TaskContext`.

Modify the architecture so TaskContext can support:

```text
Local Tasks
+
Remote Tasks
+
LMS Imported Tasks
```

---

# 21. NEW MOBILE SCREENS

Add:

```text
LoginScreen
RegisterScreen
LMSConnectionScreen
NotificationSettingsScreen
```

Potential navigation:

```text
Authentication
├── Login
└── Register

Main Application
├── Home
├── Tasks
└── Settings

Settings
├── Profile
├── Notifications
└── LMS Integration
```

If the user is not authenticated:

```text
AuthNavigator
```

If authenticated:

```text
AppNavigator
```

---

# 22. TASK CARD CHANGES

Automatically imported tasks should indicate their source.

Example:

```text
┌──────────────────────────────┐
│ Quiz 2                       │
│ Database Management          │
│                              │
│ 📅 Aug 28, 11:59 PM          │
│                              │
│ 🟢 Imported from LMS         │
│                              │
│ [Complete]       [Details]   │
└──────────────────────────────┘
```

Manual tasks:

```text
Created manually
```

LMS tasks:

```text
Imported from LMS
```

Do not make imported tasks impossible to edit.

Allow the student to add personal metadata such as:

```text
Priority
Notes
Completion status
Subtasks
```

However, distinguish LMS-owned fields from student-owned fields.

---

# 23. TASK OWNERSHIP MODEL

Separate LMS fields from Tasky fields.

LMS-controlled:

```text
title
description
deadline
task_type
source_url
lms_source_id
subject mapping
```

Student-controlled:

```text
priority
status
notes
personal subtasks
```

When synchronization occurs, do not overwrite student-owned fields.

For example:

```text
LMS:
Deadline = Aug 30

Tasky:
Priority = High
Status = Pending
Notes = "Review chapter 5"
```

If LMS changes the deadline:

```text
Deadline → update

Priority → preserve
Status → preserve
Notes → preserve
```

---

# 24. LOCAL/OFFLINE SUPPORT

Tasky should remain usable when the device temporarily has no internet.

Continue using AsyncStorage as a local cache.

The architecture should become:

```text
             Backend
                │
                ▼
        Remote PostgreSQL
                │
                ▼
          API Service
                │
                ▼
         TaskContext
                │
                ▼
          Local Cache
                │
                ▼
          Tasky UI
```

When offline:

```text
View existing tasks
Create manual tasks
Edit permitted fields
Mark tasks completed
```

When online:

```text
Synchronize local changes
Download remote changes
Resolve conflicts
```

Do not delete local data simply because a network request fails.

---

# 25. API CLIENT CHANGES

The existing API client already provides centralized HTTP functionality and the task API already defines CRUD/sync contracts.

Extend it with:

```text
authApi.ts
taskApi.ts
subjectApi.ts
profileApi.ts
lmsApi.ts
notificationApi.ts
deviceApi.ts
```

Example:

```text
authApi
 ├── register()
 ├── login()
 ├── refreshToken()
 └── getCurrentUser()

lmsApi
 ├── connect()
 ├── disconnect()
 ├── getStatus()
 └── syncNow()

deviceApi
 ├── registerDevice()
 └── unregisterDevice()
```

---

# 26. ENVIRONMENT CONFIGURATION

Use separate environments:

```text
.env.development
.env.production
```

Mobile:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

Production:

```env
EXPO_PUBLIC_API_URL=https://api.tasky.example
```

Never place:

```text
database passwords
JWT secrets
LMS credentials
Firebase server keys
private API keys
```

inside `EXPO_PUBLIC_*` variables.

Anything exposed through the Expo public environment is considered client-visible.

---

# 27. SECURITY REQUIREMENTS

Implement:

* Password hashing
* JWT authentication
* Token expiration
* Refresh tokens if appropriate
* Secure token storage
* HTTPS in production
* CORS configuration
* Input validation
* SQL injection protection through ORM/parameterized queries
* Authorization checks
* User data isolation
* Rate limiting where appropriate
* Secure credential encryption
* No sensitive credentials in logs
* No passwords in API responses
* No secrets committed to Git
* `.env` excluded from Git

The LMS sync service must never expose one student's LMS information to another student.

---

# 28. ERROR HANDLING

The system must handle:

```text
LMS unavailable
Wrong LMS credentials
Session expired
Network timeout
LMS HTML changed
Database unavailable
Push notification failure
Duplicate LMS task
Deadline parsing failure
Unknown task type
```

Example:

```text
LMS sync failed

Reason:
Authentication failed

Last successful sync:
August 21, 2026 4:30 PM
```

Show a useful status inside:

```text
Settings → LMS Integration
```

Do not expose sensitive technical details to normal users.

Log detailed errors only on the backend.

---

# 29. LMS SYNC STATUS

Expose:

```text
GET /api/lms/status
```

Return something similar to:

```json
{
  "connected": true,
  "last_sync": "2026-08-21T17:00:00",
  "next_sync": "2026-08-21T17:05:00",
  "status": "healthy"
}
```

Mobile UI:

```text
LMS Integration

● Connected

Last synced:
2 minutes ago

Next sync:
3 minutes

[ Sync Now ]
[ Disconnect ]
```

---

# 30. MANUAL SYNC

Allow:

```text
[ Sync Now ]
```

The mobile app sends:

```text
POST /api/lms/sync
```

The backend performs synchronization for the authenticated user.

Return:

```json
{
  "success": true,
  "new_tasks": 2,
  "updated_tasks": 1,
  "removed_tasks": 0
}
```

---

# 31. NOTIFICATION RULES

When a new LMS task is detected:

```text
Create Task
+
Send push notification
```

When an existing LMS task changes deadline:

```text
Update Task
+
Reschedule local reminder
+
Send deadline-changed notification
```

When a task is deleted/removed from LMS:

Do NOT immediately delete the student's Tasky task without a defined policy.

Prefer:

```text
source_status = "removed"
```

and let the application decide how to display it.

---

# 32. DEADLINE REMINDER SYSTEM

Preserve the existing 24-hour local reminder system.

Add additional configurable reminders:

```text
24 hours before
3 hours before
1 hour before
```

Allow the student to configure notification preferences.

Example:

```text
Notification Settings

New LMS Tasks       ON
New Quizzes         ON
Deadline Tomorrow   ON
Deadline Today      ON
Deadline Changed    ON

Reminder Time
[ 24 hours before ]
```

---

# 33. DATABASE MIGRATIONS

Use Alembic.

Do NOT rely permanently on:

```python
Base.metadata.create_all()
```

for production.

Create proper migration files:

```text
alembic/
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_lms_connections.py
│   ├── 003_devices.py
│   └── 004_notifications.py
```

---

# 34. DOCKER

Prepare backend deployment using Docker.

Recommended:

```text
docker-compose.yml

services:

  api:
    FastAPI

  worker:
    LMS Sync Worker

  postgres:
    PostgreSQL

  redis:
    Redis
```

If Celery is selected:

```text
FastAPI
   │
   ▼
Redis
   │
   ▼
Celery Worker
   │
   ▼
LMS Sync
```

The architecture should support local development and production deployment.

---

# 35. DEVELOPMENT ENVIRONMENT

Local development:

```text
Windows / Linux
      │
      ├── FastAPI
      ├── PostgreSQL
      ├── Redis
      └── LMS Worker
             │
             ▼
        Tasky APK
```

For Android physical-device testing:

```text
Phone
   │
   │ Wi-Fi
   ▼
Developer PC
   │
   └── FastAPI
```

Do NOT use:

```text
localhost
```

inside the Android app when the backend is running on the developer PC.

Use the developer machine's LAN IP during local testing.

---

# 36. PRODUCTION ARCHITECTURE

Production should eventually become:

```text
                    INTERNET
                       │
                       ▼
                  HTTPS / NGINX
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
         FastAPI              Static/API
             │
             ▼
           Redis
             │
             ▼
        Sync Worker
             │
             ▼
        PostgreSQL
             │
             ▼
         FCM
             │
             ▼
       Student Phones
```

The mobile application does NOT directly connect to PostgreSQL.

Always:

```text
Mobile → FastAPI → PostgreSQL
```

Never:

```text
Mobile → PostgreSQL
```

---

# 37. DEPLOYMENT STRATEGY

Do not require Google Play Store deployment during development.

Support:

```text
Development:
APK installed directly on Android phone

Testing:
APK / development build

Production:
AAB → Google Play Store
```

The backend can be deployed independently of the mobile application.

For testing:

```text
Mobile APK
     ↓
Production/Test FastAPI
     ↓
PostgreSQL
     ↓
LMS Sync Worker
```

---

# 38. CODE QUALITY REQUIREMENTS

Before implementing new features:

1. Inspect the existing codebase.
2. Identify duplicate files.
3. Identify unused components.
4. Identify dead code.
5. Identify placeholder/mock implementations.
6. Identify duplicated types.
7. Identify inconsistent naming.
8. Identify unused dependencies.
9. Identify incorrect imports.
10. Identify API contracts that need updating.

Do NOT blindly delete files.

Only remove a file when you verify that it is unused or redundant.

Preserve functionality.

Use strict TypeScript.

Avoid:

```text
any
```

unless absolutely necessary.

Use clear naming.

Keep services separated by responsibility.

---

# 39. DO NOT OVERENGINEER THE FIRST IMPLEMENTATION

Implement in phases.

## Phase 1

Backend foundation:

```text
FastAPI
PostgreSQL
SQLAlchemy
Alembic
Authentication
Users
Tasks
Subjects
```

## Phase 2

Mobile integration:

```text
Login
Register
JWT
Secure token storage
Task API
Subject API
Profile API
```

## Phase 3

LMS connection:

```text
LMS Connection UI
LMS credentials/session handling
LMS Adapter
LMS parser
Manual Sync
```

## Phase 4

Automatic synchronization:

```text
Background worker
Scheduled synchronization
Duplicate detection
Task updates
Deadline changes
```

## Phase 5

Notifications:

```text
FCM
Device registration
New LMS task notification
Deadline notifications
Notification preferences
```

## Phase 6

Offline synchronization:

```text
Local cache
Remote sync
Conflict handling
Retry mechanism
```

## Phase 7

Deployment:

```text
Docker
NGINX
HTTPS
PostgreSQL
Redis
Worker
Production environment
APK/AAB
```

---

# 40. TESTING REQUIREMENTS

Create tests for:

### Authentication

```text
Register
Login
Invalid password
Expired token
Unauthorized request
```

### Tasks

```text
Create
Read
Update
Delete
Complete
Duplicate prevention
```

### LMS

```text
Successful login
Failed login
New task
Existing task
Updated deadline
Duplicate task
Removed task
LMS unavailable
```

### Security

```text
Student A cannot access Student B's tasks
Student A cannot access Student B's LMS connection
Invalid JWT rejected
Expired JWT rejected
```

### Notifications

```text
New LMS task
Deadline changed
Deadline reminder
Multiple devices
Notification disabled
```

---

# 41. API DOCUMENTATION

Use FastAPI's generated OpenAPI documentation.

Ensure:

```text
/api/docs
/api/redoc
```

are useful during development.

Document:

* Authentication
* Tasks
* Subjects
* LMS integration
* Devices
* Notifications

---

# 42. FINAL TARGET USER EXPERIENCE

A new student installs Tasky.

```text
Install Tasky
      ↓
Register Tasky account
      ↓
Login
      ↓
Connect School LMS
      ↓
Enter authorized LMS account information
      ↓
Tasky verifies connection
      ↓
Initial LMS synchronization
      ↓
Existing LMS tasks appear automatically
      ↓
Student continues using Tasky normally
```

Later:

```text
Instructor creates new quiz
        ↓
LMS
        ↓
Tasky Sync Worker
        ↓
Detects quiz
        ↓
Creates Tasky task automatically
        ↓
Push notification
        ↓
Student's phone
```

The student should NOT have to:

```text
Add Task
→ Type title
→ Select subject
→ Enter deadline
→ Save
```

for LMS-originated academic tasks.

---

# 43. IMPORTANT LMS INTEGRATION CONSTRAINT

The school's LMS is a custom system and currently has no API access available to the developer.

Therefore:

* Build the LMS integration behind an abstraction/interface.
* Do not hard-code LMS-specific logic throughout the backend.
* Keep all LMS-specific parsing inside the LMS adapter.
* Make it replaceable with an official API integration later.
* Do not bypass authentication/security controls.
* Only synchronize data the authenticated student is legitimately allowed to access.
* Do not expose or share LMS credentials.
* Do not store passwords in plaintext.
* Do not log passwords, cookies, session tokens, or authentication headers.

Before enabling the system for other students, verify that automated access is permitted by the school's LMS policies or obtain authorization from the LMS administrator.

---

# 44. IMPLEMENTATION RULES

Before writing code:

1. Inspect the existing Tasky project.
2. Understand the current architecture.
3. Reuse existing services and types where appropriate.
4. Do not rewrite working UI unnecessarily.
5. Create a clear implementation plan.
6. Identify files that need modification.
7. Identify files that need to be created.
8. Identify obsolete files only after verifying usage.
9. Implement incrementally.
10. Run TypeScript checks.
11. Run linting.
12. Run tests.
13. Verify imports.
14. Verify navigation.
15. Verify API contracts.
16. Verify database migrations.
17. Verify authentication.
18. Verify user isolation.
19. Verify LMS synchronization.
20. Verify notifications.

After each major phase, explain:

```text
What changed
Why it changed
Files created
Files modified
Files removed
How to run it
How to test it
Known limitations
Next step
```

Do not fabricate LMS endpoints or HTML selectors.

The custom LMS structure is currently unknown.

Create the LMS integration as an adapter and use placeholder selectors/configuration only where necessary. Clearly mark anything that must later be replaced after inspecting the actual LMS.

---

# 45. DEFINITION OF DONE

The implementation is considered successful when:

* Multiple students can create separate Tasky accounts.
* Students can securely authenticate.
* Each student can connect their own LMS account.
* LMS credentials are protected.
* Students cannot access each other's data.
* Tasks are stored in PostgreSQL.
* Manual Tasky tasks continue to work.
* LMS tasks are automatically imported.
* LMS tasks are automatically categorized.
* Duplicate LMS tasks are prevented.
* LMS deadline changes update existing tasks.
* Student-owned task metadata is preserved.
* LMS synchronization runs independently of the mobile application.
* New LMS tasks trigger push notifications.
* Deadline reminders work.
* Tasky works with temporary offline connectivity.
* API authentication is secure.
* Backend is Docker-ready.
* LMS sync worker is separated from the API.
* The mobile app can be distributed as an APK for testing.
* The backend can later be deployed to a production server.
* The system can eventually replace the custom LMS scraper with an official LMS API without rewriting the entire application.

## MOST IMPORTANT PRINCIPLE

Do not treat LMS synchronization as a simple "scrape website and create task" feature.

Treat it as a separate **LMS Integration / Synchronization subsystem**.

The final architecture should be:

```text
                     TASKY MOBILE
                           │
                           │ HTTPS
                           ▼
                    ┌──────────────┐
                    │   FastAPI    │
                    │     API      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          PostgreSQL     Redis      FCM Service
              ▲            │
              │            ▼
              │       Sync Worker
              │            │
              │            ▼
              │      LMS Adapter
              │            │
              │            ▼
              │      SCHOOL LMS
              │
              └── User-specific tasks
```

Build the system incrementally and keep the existing Tasky frontend stable while introducing the backend, database, authentication, LMS synchronization, and notification infrastructure.
