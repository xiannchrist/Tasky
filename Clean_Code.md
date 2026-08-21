# TaskMate — Codebase Cleanup, Refactoring, and Backend-Ready Preparation

## Role

Act as a **senior React Native + TypeScript software engineer and codebase architect**.

I have an existing **TaskMate mobile application** built with **React Native and TypeScript**.

Your task is to **audit, clean, refactor, and organize the existing codebase** without unnecessarily changing the application's existing functionality or UI.

The goal is to make the project:

* Clean
* Maintainable
* Modular
* Free from unnecessary files
* Free from duplicated code
* Free from unused imports and dependencies
* Easier to understand
* Ready for future backend/API integration
* Ready for database integration
* Ready for mobile app deployment/building

Do **not** rebuild the application from scratch unless a part of the existing implementation is fundamentally broken.

---

# 1. IMPORTANT: AUDIT BEFORE MODIFYING

Before making changes, inspect the entire project structure.

Analyze:

* `package.json`
* `app.json` / `app.config.*`
* TypeScript configuration
* Navigation
* Screens
* Components
* Hooks
* Services
* Utilities
* Types/interfaces
* Assets
* Storage logic
* Notification logic
* API-related code
* Configuration files
* Android configuration
* iOS configuration if present
* Expo configuration if Expo is being used
* Environment/configuration files
* Duplicate files
* Unused files
* Unused dependencies
* Dead code
* Commented-out code
* Temporary/demo code
* Hardcoded data
* Duplicate components
* Duplicate utility functions
* Duplicate styles
* Inconsistent naming

Do not immediately delete files.

First determine whether each file is:

1. Actively used
2. Imported indirectly
3. Required by the framework
4. Required for Android/iOS builds
5. Required by Expo
6. Required by configuration
7. Unused
8. Duplicated
9. Temporary/development-only
10. Safe to remove

---

# 2. DO NOT BREAK FUNCTIONALITY

The existing application is already functional.

Preserve the existing core functionality.

Do not remove:

* Working screens
* Working navigation
* Task creation
* Task editing
* Task deletion
* Task completion
* Task filtering
* Deadline handling
* Notifications
* Local storage
* Required UI components
* Existing validation
* Required React Native concepts

unless the code is clearly duplicated or replaced by a better existing implementation.

If you find two implementations of the same functionality:

* Determine which one is actually being used.
* Keep the better implementation.
* Migrate references if necessary.
* Remove the obsolete implementation.

---

# 3. REMOVE DUPLICATED CODE

Find and consolidate duplicate code.

Look for duplicated:

* Components
* Screens
* Hooks
* Services
* Utility functions
* Validation logic
* Date calculations
* Task filtering
* Task status logic
* Notification logic
* Storage functions
* Styles
* Constants
* Type definitions

For example, if multiple files contain:

```ts
calculateDaysUntilDeadline()
```

create one reusable utility and update all references to use it.

Do not create unnecessary abstractions for extremely small pieces of code.

The goal is **reasonable modularity**, not over-engineering.

---

# 4. REMOVE UNUSED FILES

Identify files that are no longer used.

Examples may include:

```text
ExampleScreen.tsx
TestComponent.tsx
OldTaskCard.tsx
BackupScreen.tsx
UnusedService.ts
DemoData.ts
TemporaryComponent.tsx
```

Only delete a file after verifying that it is not required.

Before deleting a file:

* Search the entire project for imports/references.
* Check dynamic imports.
* Check navigation registration.
* Check configuration references.
* Check assets referenced by the file.

Do not delete framework-required files simply because they appear unused.

---

# 5. REMOVE UNUSED DEPENDENCIES

Inspect `package.json`.

Identify dependencies that are:

* Completely unused
* Duplicated
* Left over from experimentation
* No longer required
* Replaced by another library

Before removing a dependency, verify that it is not required by:

* Runtime code
* Build configuration
* Babel
* Metro
* Expo
* Native modules
* Android
* iOS
* Testing
* Linting

Do not blindly remove packages.

After cleanup, ensure:

```bash
npm install
```

or the appropriate package-manager command succeeds.

---

# 6. CLEAN IMPORTS

Clean all TypeScript/React Native files.

Remove:

* Unused imports
* Duplicate imports
* Incorrect imports
* Imports from obsolete paths

Prefer consistent import organization.

Example:

```ts
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { TaskCard } from "../components/TaskCard";
import { useTasks } from "../hooks/useTasks";
import { Task } from "../types/Task";
```

Avoid unnecessarily long relative import paths where a reasonable project alias can be safely configured.

---

# 7. CLEAN TYPESCRIPT

Review all TypeScript code.

Remove unnecessary:

```ts
any
```

Replace it with proper interfaces/types where practical.

Centralize important domain types.

For example:

```ts
export type TaskPriority = "Low" | "Medium" | "High";

export type TaskStatus = "Pending" | "Completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}
```

Avoid defining the same `Task` interface in multiple files.

Create one source of truth.

---

# 8. ORGANIZE THE PROJECT

Use a clean architecture appropriate for a React Native student project.

If the current project structure is messy, reorganize it toward something similar to:

```text
src/
├── components/
│   ├── TaskCard.tsx
│   ├── StatCard.tsx
│   ├── PriorityBadge.tsx
│   └── EmptyState.tsx
│
├── screens/
│   ├── HomeScreen.tsx
│   ├── TasksScreen.tsx
│   ├── AddTaskScreen.tsx
│   ├── TaskDetailsScreen.tsx
│   ├── EditTaskScreen.tsx
│   └── SettingsScreen.tsx
│
├── navigation/
│   └── AppNavigator.tsx
│
├── services/
│   ├── storageService.ts
│   ├── notificationService.ts
│   └── api/
│       ├── client.ts
│       └── taskService.ts
│
├── hooks/
│   └── useTasks.ts
│
├── types/
│   ├── task.ts
│   └── navigation.ts
│
├── utils/
│   ├── dateUtils.ts
│   └── validation.ts
│
├── constants/
│   └── index.ts
│
└── config/
    └── environment.ts
```

Do not force this exact structure if the existing project already has a better organization.

The principle is:

```text
UI
↓
Hooks / State
↓
Services
↓
API / Storage
↓
Backend
↓
Database
```

---

# 9. PREPARE FOR BACKEND INTEGRATION

The application currently uses local data/storage.

Do not immediately implement the backend.

Instead, prepare the codebase so that local storage can later be replaced or supplemented by an API.

Avoid having screens directly perform storage operations everywhere.

Bad:

```ts
await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
```

inside multiple screens.

Prefer:

```ts
await taskService.createTask(task);
```

Then the service can currently use local storage.

Later it can become:

```ts
await api.post("/tasks", task);
```

without rewriting the UI.

---

# 10. CREATE A SERVICE ABSTRACTION

If appropriate, create a task service such as:

```ts
export const taskService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
};
```

The current implementation may use local storage.

Design it so that a future backend implementation can replace the storage layer.

Do not add fake API requests.

Do not create fake backend endpoints.

Do not pretend that the backend already exists.

---

# 11. PREPARE API CLIENT

If the project does not already have an API layer, create a lightweight API structure for future use.

For example:

```text
services/
└── api/
    ├── client.ts
    └── taskService.ts
```

The API client should be designed around a configurable base URL.

Example:

```ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
```

If environment variables are not currently configured, set up the project appropriately for the selected React Native environment.

Do not hardcode:

```ts
http://localhost:8000
```

throughout the application.

---

# 12. IMPORTANT: MOBILEHOST / LOCALHOST

Prepare the application for mobile testing.

Do not assume:

```text
localhost
```

always means the development computer.

For a physical phone, `localhost` refers to the phone itself.

Use environment-based configuration such as:

```text
Development
Staging
Production
```

Example concept:

```text
EXPO_PUBLIC_API_URL
```

Development:

```text
http://YOUR_LOCAL_NETWORK_IP:8000
```

Production:

```text
https://api.yourdomain.com
```

Do not commit private credentials or secrets.

---

# 13. PREPARE FOR DATABASE INTEGRATION

The mobile application should **not connect directly to PostgreSQL, MySQL, MongoDB, or another server database**.

The future architecture should be:

```text
TaskMate Mobile App
        ↓
      HTTPS
        ↓
Backend API
        ↓
Database
```

The mobile app communicates with the backend.

The backend communicates with the database.

Prepare the mobile application's service layer accordingly.

---

# 14. ENVIRONMENT CONFIGURATION

Separate configuration from application code.

Prepare configuration for:

```text
Development
Staging
Production
```

Potential variables:

```text
API_BASE_URL
APP_ENV
```

Never put:

* Database passwords
* API secrets
* JWT secrets
* Private keys
* Admin credentials

inside the React Native source code.

---

# 15. NOTIFICATION ARCHITECTURE

Review the existing notification implementation.

Ensure notification logic is isolated from UI components.

Prefer:

```text
services/
└── notificationService.ts
```

The service should handle:

* Requesting permissions
* Scheduling notifications
* Canceling notifications
* Updating notifications
* Checking notification settings

Screens should not contain large blocks of notification implementation.

For example:

```ts
await notificationService.scheduleDeadlineReminder(task);
```

rather than implementing the entire scheduling process inside `AddTaskScreen.tsx`.

---

# 16. STORAGE ARCHITECTURE

Review local storage.

Centralize storage operations.

Prefer:

```ts
storageService.getTasks()
storageService.saveTasks(tasks)
storageService.deleteTask(taskId)
```

instead of directly calling AsyncStorage throughout multiple screens.

This makes it easier to replace local storage with backend synchronization later.

---

# 17. STATE MANAGEMENT CLEANUP

Review all `useState` and `useEffect` usage.

Identify:

* Duplicate state
* Unnecessary state
* State that can be derived
* Effects that run unnecessarily
* Effects with incorrect dependencies
* State synchronization problems

Do not introduce Redux, Zustand, MobX, or another state library unless the current project genuinely requires it.

For the current application, React Context or custom hooks should be sufficient if shared state is needed.

---

# 18. CUSTOM HOOKS

If multiple screens contain the same task-management logic, extract it into a custom hook.

For example:

```ts
useTasks()
```

Possible responsibilities:

```text
tasks
loading
error
createTask()
updateTask()
deleteTask()
completeTask()
refreshTasks()
```

Keep UI-specific logic inside screens/components.

Keep data-management logic inside hooks/services.

---

# 19. VALIDATION CLEANUP

Centralize form validation.

Instead of duplicating:

```ts
if (!title.trim()) ...
```

in multiple screens, create reusable validation functions.

For example:

```ts
validateTask(task)
```

Return structured validation errors.

Ensure both:

* Add Task
* Edit Task

use the same validation rules.

---

# 20. DATE AND DEADLINE LOGIC

Centralize date-related functionality.

Create utilities for:

```text
isOverdue()
isDueToday()
isDueTomorrow()
isDueSoon()
getDaysUntilDeadline()
formatDeadline()
```

Avoid duplicating date calculations throughout the screens.

Be careful with:

* Time zones
* Date parsing
* Invalid dates
* Notification scheduling times

Use ISO-compatible date storage where practical.

---

# 21. UI CLEANUP

Do not redesign the application unnecessarily.

Instead:

* Remove duplicated styles.
* Remove unused styles.
* Consolidate repeated styles.
* Fix inconsistent spacing.
* Fix inconsistent typography.
* Fix inconsistent button styles.
* Fix inconsistent colors.
* Fix unnecessary inline styles where reusable styles are more appropriate.

Keep the existing TaskMate visual identity.

---

# 22. COMPONENT CLEANUP

Review every reusable component.

A component should have a clear responsibility.

For example:

```text
TaskCard
```

should focus on displaying a task.

It should not contain:

* Database operations
* Large storage operations
* Navigation architecture
* Notification scheduling
* Unrelated business logic

Use callbacks:

```tsx
<TaskCard
  task={task}
  onPress={handleTaskPress}
  onComplete={handleComplete}
/>
```

---

# 23. NAVIGATION CLEANUP

Review React Navigation.

Ensure:

* Screen names are consistent.
* Navigation types are properly typed.
* No duplicate screen registration exists.
* No obsolete screens remain registered.
* Parameters are typed.
* Navigation logic is centralized.

Create proper navigation types.

Example:

```ts
export type RootStackParamList = {
  Home: undefined;
  Tasks: undefined;
  AddTask: undefined;
  TaskDetails: {
    taskId: string;
  };
  EditTask: {
    taskId: string;
  };
  Settings: undefined;
};
```

---

# 24. REMOVE DEAD CODE

Remove:

* Commented-out old implementations
* Unreachable code
* Debug logs
* Temporary console logs
* Development-only alerts
* Test buttons
* Fake task data
* Unused constants
* Unused functions
* Unused styles

However, preserve meaningful documentation comments.

Do not remove useful error logging that is necessary for debugging production issues.

---

# 25. ASSET CLEANUP

Review:

```text
assets/
```

Remove assets that are genuinely unused.

Do not delete:

* App icons
* Splash screen assets
* Notification assets
* Platform-required assets
* Assets referenced by configuration

Use a consistent naming convention.

Example:

```text
taskmate-logo.png
taskmate-icon.png
empty-tasks.png
```

---

# 26. CONFIGURATION CLEANUP

Review:

```text
package.json
tsconfig.json
babel.config.*
metro.config.*
app.json
app.config.*
.gitignore
```

and any other project configuration files.

Do not modify framework configuration unnecessarily.

Make sure:

* TypeScript works
* Metro works
* Dependencies are valid
* Build configuration is valid
* Environment configuration is clear
* No secrets are committed

---

# 27. GIT CLEANUP

Make sure `.gitignore` contains appropriate entries.

Do not commit:

```text
node_modules/
.env
.env.local
.expo/
dist/
build/
*.keystore
*.jks
```

and other sensitive/build-generated files where appropriate.

Do not remove existing Git configuration unless necessary.

---

# 28. DEPLOYMENT PREPARATION

Prepare the project for mobile deployment.

Determine whether the project uses:

* Expo
* Expo managed workflow
* Expo development builds
* React Native CLI

Do not migrate frameworks unless explicitly necessary.

Verify:

```text
Android build
iOS build
Application identifier
Version
App name
Icon
Splash screen
Permissions
Notification configuration
Environment configuration
```

For Android, make sure the project can eventually produce:

```text
APK
AAB
```

Do not create a production build unless requested.

---

# 29. SECURITY CHECK

Perform a basic security review.

Look for:

* Hardcoded API keys
* Hardcoded passwords
* Tokens in source code
* Database credentials
* Sensitive URLs
* Private certificates
* Debug-only authentication
* Insecure storage of secrets

Never expose backend/database credentials inside the mobile application.

Remember:

**Anything shipped inside a mobile application can potentially be inspected by the user.**

---

# 30. PERFORMANCE CLEANUP

Look for obvious performance problems.

Review:

* Unnecessary re-renders
* Large lists
* Incorrect `FlatList` usage
* Unnecessary `useEffect`
* Expensive calculations during rendering
* Recreated functions where optimization is actually useful
* Large images
* Unnecessary storage reads

Do not prematurely optimize everything.

Only make optimizations that improve actual or obvious problems.

---

# 31. ERROR HANDLING

Create consistent error handling.

Instead of displaying raw errors:

```text
Network request failed at AxiosError...
```

show users:

```text
Unable to load your tasks.
Please try again.
```

However, preserve useful developer information in development logs.

---

# 32. OFFLINE-FIRST CONSIDERATION

Because the application currently uses local storage, preserve the ability to access existing tasks when offline.

Prepare the architecture for future synchronization:

```text
Local Data
     ↕
Sync Layer
     ↕
Backend API
```

Do not implement full synchronization yet unless it already exists.

---

# 33. DO NOT OVERENGINEER

This is important.

Do not introduce unnecessary:

* Microservices
* Redux
* GraphQL
* Complex repository patterns
* Dependency injection frameworks
* Large architecture frameworks
* Unnecessary design patterns

The application should remain understandable to a student developer.

Use the simplest architecture that provides clean separation.

---

# 34. REQUIRED FINAL AUDIT

After refactoring, perform another complete project scan.

Check for:

```text
Unused files
Unused imports
Unused dependencies
Duplicate components
Duplicate functions
Duplicate types
Dead code
Debug logs
Hardcoded data
Hardcoded secrets
Broken imports
Broken navigation
TypeScript errors
Lint errors
Build errors
```

Fix problems discovered during this final audit.

---

# 35. DO NOT CLAIM SUCCESS WITHOUT VERIFYING

Run the appropriate project checks.

For example:

```bash
npx tsc --noEmit
```

and the project's configured lint command.

Also run the application and verify the major flows.

If a command cannot be run in the current environment, clearly state that instead of claiming it passed.

---

# 36. FINAL REPORT

After completing the cleanup, provide a concise report containing:

## Files Removed

List files that were safely deleted.

```text
- example.tsx
- oldTaskService.ts
```

## Files Consolidated

Explain duplicated functionality that was merged.

## Files Created

List new files such as:

```text
src/services/taskService.ts
src/services/storageService.ts
src/services/notificationService.ts
src/types/task.ts
```

## Dependencies Removed

List packages removed and why.

## Architecture Improvements

Explain how the project is now structured.

## Backend Readiness

Explain exactly where the future backend/API integration should occur.

## Database Readiness

Explain that the mobile application will communicate with the backend rather than directly with the database.

## Deployment Readiness

Explain what has been prepared for:

* Android
* iOS
* Production configuration
* Environment variables
* App signing/building

## Remaining Issues

Clearly list anything that still requires manual configuration or cannot be verified.

---

# 37. FINAL SUCCESS CRITERIA

The cleanup is considered successful only if:

* The application still works.
* Existing functionality is preserved.
* Duplicate code is reduced.
* Unused files are removed safely.
* Unused dependencies are removed safely.
* Types are centralized.
* Services are separated from UI.
* Storage logic is centralized.
* Notification logic is centralized.
* Validation is reusable.
* Navigation is properly typed.
* Backend integration can later be added without rewriting the screens.
* Database access is kept behind the future backend.
* Environment configuration is prepared.
* No secrets are hardcoded.
* The project is easier to maintain.
* The project is easier to deploy.
* TypeScript/lint/build checks pass where they can be verified.

**Most important rule:**

Do not blindly delete files or rewrite working code.

**Inspect → Analyze → Refactor → Test → Verify → Report.**

Preserve functionality while improving the architecture.
