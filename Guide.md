# React Native Task Management App — Development Prompt

## Role

Act as a **senior React Native developer and UI/UX engineer**. Build a fully functional **Task Management / Semi-Tracker mobile application** using **React Native with TypeScript**.

The application is intended as an academic project demonstrating fundamental React Native concepts such as components, navigation, state management, user input, data handling, form validation, and notifications.

The application must be functional, organized, beginner-friendly, and easy to explain during a project demonstration.

---

# 1. Technology Requirements

Use the following technologies:

* React Native
* TypeScript
* React Navigation
* React Hooks
* `useState`
* `useEffect`
* `FlatList`
* `ScrollView`
* React Native built-in components
* Local device storage for task persistence
* Local push/local notifications for deadline reminders

Prefer a simple architecture suitable for a student project.

Do **not** introduce unnecessary technologies, libraries, backend servers, authentication systems, or cloud databases unless absolutely necessary.

---

# 2. Application Concept

Create a mobile application called:

**TaskMate — Task Management & Deadline Tracker**

The purpose of the application is to allow students to:

* Create tasks
* Set task deadlines
* Assign priorities
* Add descriptions
* Track task status
* Edit tasks
* Delete tasks
* View task details
* Mark tasks as completed
* Monitor upcoming deadlines
* Receive a notification **one day before the deadline**

Example tasks:

* Submit Web Development Project
* Study for Java Exam
* Complete React Native Assignment
* Submit Research Paper
* Prepare Presentation

---

# 3. Required Screens

The application must contain at least **five screens**.

## Screen 1 — Home / Dashboard

Create a dashboard showing an overview of the user's tasks.

Display:

* Application name
* Greeting/header
* Total Tasks
* Pending Tasks
* Completed Tasks
* Tasks Due Soon
* Upcoming task list
* Quick "Add Task" button

Example:

```text
TaskMate

Good morning! 👋

TOTAL TASKS
12

PENDING
7

COMPLETED
5

DUE SOON
2

Upcoming Tasks

Web Development Project
Due: Aug 22, 2026
Priority: High

Java Assignment
Due: Aug 24, 2026
Priority: Medium
```

Use appropriate React Native components.

---

# 4. Screen 2 — Task List

Create a screen displaying all tasks.

Use:

* `FlatList`
* `Pressable` or `TouchableOpacity`
* `View`
* `Text`
* Icons where appropriate

Each task card should display:

* Task title
* Short description
* Deadline
* Priority
* Status
* Completion indicator

Provide filtering options:

* All
* Pending
* Completed
* High Priority

Example:

```text
All | Pending | Completed | High

┌──────────────────────────┐
│ Web Development Project  │
│ Due: Aug 22, 2026        │
│ Priority: HIGH           │
│ Status: Pending          │
└──────────────────────────┘
```

Pressing a task should navigate to the **Task Details Screen**.

---

# 5. Screen 3 — Add Task

Create a form for adding a new task.

Required fields:

### Task Title

Use:

```tsx
<TextInput />
```

### Description

Use a multiline `TextInput`.

### Deadline

Allow the user to select a date.

### Priority

Allow:

* Low
* Medium
* High

### Status

Default:

* Pending

Provide:

```text
Save Task
Cancel
```

buttons.

---

# 6. Form Validation

Implement proper validation before saving.

Required validation:

### Title

* Cannot be empty
* Minimum of 3 characters

### Description

* Cannot be empty

### Deadline

* Cannot be empty
* Should be a valid date
* Preferably prevent selecting invalid/past deadlines for new tasks

### Priority

* Must have a valid priority

Display friendly validation messages.

Example:

```text
Please enter a task title.

Task title must contain at least 3 characters.

Please enter a description.

Please select a deadline.
```

Do not allow invalid data to be saved.

---

# 7. Screen 4 — Task Details

When the user selects a task from the Task List, navigate to the Task Details screen.

Pass the selected task using **React Navigation parameters**.

Display:

* Task title
* Description
* Deadline
* Priority
* Status
* Created date

Provide buttons:

```text
Mark as Completed
Edit Task
Delete Task
```

When deleting a task, show an `Alert` confirmation:

```text
Delete Task?

Are you sure you want to delete this task?

Cancel
Delete
```

---

# 8. Screen 5 — Edit Task

Create an Edit Task screen.

The existing task information must automatically populate the form.

Allow the user to modify:

* Title
* Description
* Deadline
* Priority
* Status

Use the same validation rules as the Add Task screen.

After updating:

```text
Task updated successfully.
```

Return to the Task Details screen or Task List.

---

# 9. Screen 6 — Settings / Profile

Create a simple Settings screen.

Display:

* Application name
* Version
* Notification settings
* About TaskMate

Include a notification toggle:

```text
Deadline Notifications
[ ON ]
```

The toggle should determine whether deadline reminders are scheduled.

---

# 10. Navigation

Use **React Navigation**.

Use a combination of:

### Bottom Tab Navigation

Tabs:

```text
Home
Tasks
Settings
```

and

### Stack Navigation

Stack screens:

```text
Home
Task List
Add Task
Task Details
Edit Task
Settings
```

The application should have a clear navigation structure.

---

# 11. Passing Data Between Screens

Demonstrate navigation parameter passing.

For example:

When the user selects:

```text
Web Development Project
```

navigate using a task ID:

```tsx
navigation.navigate("TaskDetails", {
  taskId: task.id,
});
```

The Task Details screen should retrieve the task using the passed ID.

Do not unnecessarily pass the entire task object if passing an ID demonstrates cleaner state/data handling.

---

# 12. State Management

Use React state management.

At minimum demonstrate:

```tsx
useState()
useEffect()
```

Manage:

* Task list
* Form values
* Loading state
* Selected task
* Notification setting
* Filters
* Validation errors

For this academic project, avoid unnecessarily complex state-management libraries.

A Context API implementation is acceptable if needed.

---

# 13. Task Data Structure

Create a TypeScript interface.

Example:

```tsx
interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Completed";
  createdAt: string;
}
```

Use strong TypeScript typing throughout the application.

Avoid unnecessary use of:

```tsx
any
```

---

# 14. Local Data Persistence

Tasks should remain available after closing and reopening the application.

Use local storage such as:

```text
AsyncStorage
```

Implement:

### Save

Store the updated task list.

### Load

Load tasks when the application starts.

### Update

Update stored tasks after editing/completing.

### Delete

Remove the task from stored data.

The application should not require a backend server.

---

# 15. Deadline Notification

Implement a **local notification system**.

When the user creates a task with a deadline, schedule a notification for **one day before the deadline**.

Example:

Task:

```text
Submit Research Paper
Deadline:
August 25, 2026 — 5:00 PM
```

Notification:

```text
TaskMate Reminder

"Submit Research Paper" is due tomorrow.
Don't forget to complete it!
```

The notification should only be scheduled if:

* Notifications are enabled
* The deadline is still in the future
* A valid reminder time can be calculated

If the deadline is less than one day away, handle the situation gracefully rather than scheduling an invalid notification.

When a task is edited, cancel the previous notification and schedule a new one.

When a task is deleted, cancel its scheduled notification.

When a task is marked completed, cancel its pending deadline notification.

---

# 16. Required React Native Components

Make sure the project genuinely demonstrates the following components:

* `View`
* `Text`
* `TextInput`
* `Button`
* `Pressable`
* `Image`
* `ScrollView`
* `FlatList`
* `SafeAreaView`
* `ActivityIndicator`
* `Modal`
* `Alert`

Do not simply import components without using them.

Use each component meaningfully.

For example:

### `ActivityIndicator`

Display while loading saved tasks.

### `Modal`

Use for:

* Priority selection
* Filter selection
* Confirmation/help information

### `Alert`

Use when:

* Deleting a task
* Successfully saving a task
* Completing a task

### `Image`

Use an application logo or simple illustration on the Home screen.

---

# 17. UI/UX Design

Create a modern but simple student-friendly interface.

Design requirements:

* Clean layout
* Rounded cards
* Clear typography
* Consistent spacing
* Easy-to-read task information
* Clear priority indicators
* Clear completed/pending states
* Mobile-friendly touch targets

Suggested visual hierarchy:

### High Priority

Clearly distinguish high-priority tasks.

### Medium Priority

Moderate visual emphasis.

### Low Priority

Minimal emphasis.

Do not overcrowd the interface.

---

# 18. Empty States

Handle cases where there are no tasks.

For example:

```text
No tasks yet 📋

Create your first task and start managing
your deadlines.

+ Add Task
```

Also create appropriate empty states for:

* No completed tasks
* No pending tasks
* No search/filter results

---

# 19. Loading State

When loading tasks from local storage:

```tsx
<ActivityIndicator />
```

Display:

```text
Loading your tasks...
```

After loading is complete, display the task list.

---

# 20. Data Parsing

Demonstrate basic data parsing.

When retrieving stored task data:

```tsx
const storedTasks = await AsyncStorage.getItem("tasks");

const tasks = storedTasks
  ? JSON.parse(storedTasks)
  : [];
```

Make sure the parsed data is handled safely and typed appropriately.

---

# 21. Task Status

Tasks should support:

```text
Pending
Completed
```

When the user taps:

```text
Mark as Completed
```

change:

```text
Pending → Completed
```

The dashboard statistics should automatically update.

---

# 22. Dashboard Statistics

Calculate dynamically:

```text
Total Tasks
Pending Tasks
Completed Tasks
Due Soon
```

Do not hardcode these values.

Example:

```tsx
const totalTasks = tasks.length;

const pendingTasks = tasks.filter(
  task => task.status === "Pending"
).length;

const completedTasks = tasks.filter(
  task => task.status === "Completed"
).length;
```

---

# 23. Due Soon Logic

Create a simple helper function that determines whether a task is due soon.

For example:

```text
Due Today
Due Tomorrow
Due Soon
Overdue
```

Display appropriate labels.

Do not rely only on string comparisons.

Use JavaScript `Date` objects or a reliable date-handling solution.

---

# 24. Error Handling

Implement basic error handling.

Handle:

* Failed local storage operations
* Invalid task data
* Notification scheduling failures
* Invalid dates
* Empty form fields

Use:

```tsx
try {
  ...
} catch (error) {
  ...
}
```

Provide user-friendly error messages.

Do not expose raw technical errors to users.

---

# 25. Recommended Project Structure

Use an organized structure similar to:

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
│   └── notificationService.ts
│
├── types/
│   └── Task.ts
│
├── utils/
│   ├── validation.ts
│   └── dateUtils.ts
│
└── constants/
    └── colors.ts
```

Keep reusable logic outside the screen components whenever practical.

---

# 26. Important Academic Requirements

The final application must clearly demonstrate these concepts:

| Requirement           | Implementation                                        |
| --------------------- | ----------------------------------------------------- |
| Components            | View, Text, TextInput, Button, Pressable, Image, etc. |
| Navigation            | React Navigation                                      |
| Multiple Screens      | At least 5 screens                                    |
| Navigation Parameters | Task ID passed to Details                             |
| State                 | useState/useEffect                                    |
| User Input            | Add/Edit Task forms                                   |
| Form Validation       | Required fields and date validation                   |
| Data Parsing          | JSON.parse / JSON.stringify                           |
| List Rendering        | FlatList                                              |
| Loading               | ActivityIndicator                                     |
| Modal                 | Priority/filter selection                             |
| Alert                 | Delete confirmation                                   |
| Persistence           | AsyncStorage                                          |
| Notifications         | Deadline reminder                                     |
| TypeScript            | Interfaces and typed navigation                       |

---

# 27. Code Quality Requirements

Write clean and understandable TypeScript.

Follow these rules:

* Use functional components.
* Use React Hooks.
* Avoid unnecessary duplication.
* Create reusable components.
* Use meaningful variable names.
* Avoid `any` whenever possible.
* Keep screens reasonably small.
* Separate storage and notification logic into services.
* Add comments only where they help explain important logic.
* Do not create unnecessary backend code.
* Do not hardcode task statistics.
* Do not hardcode task data as the application's permanent data source.

---

# 28. Installation and Setup

Provide complete setup instructions.

Include:

1. Creating the React Native project.
2. Installing required dependencies.
3. Installing React Navigation.
4. Installing AsyncStorage.
5. Installing the notification library.
6. Configuring Android/iOS notification permissions where required.
7. Running the application.

Provide commands appropriate for the selected React Native setup.

If using Expo, prefer Expo-compatible packages and explain any Expo-specific configuration.

If using Expo, consider:

```text
Expo
Expo Router OR React Navigation
AsyncStorage
Expo Notifications
```

However, because the academic requirement specifically asks for React Navigation, make sure React Navigation is actually demonstrated even if Expo is used.

---

# 29. Testing Checklist

Before considering the project complete, verify:

* [ ] Application launches successfully.
* [ ] Home screen displays.
* [ ] Bottom navigation works.
* [ ] Tasks screen displays tasks.
* [ ] Add Task works.
* [ ] Empty fields cannot be submitted.
* [ ] Invalid task titles are rejected.
* [ ] Deadline validation works.
* [ ] Task is saved.
* [ ] Task appears in the task list.
* [ ] Task details open correctly.
* [ ] Navigation parameter works.
* [ ] Task can be edited.
* [ ] Task can be marked completed.
* [ ] Task can be deleted.
* [ ] Delete confirmation uses `Alert`.
* [ ] Task statistics update dynamically.
* [ ] Tasks persist after restarting the app.
* [ ] Notification permission is requested.
* [ ] Reminder is scheduled one day before the deadline.
* [ ] Editing a task updates its notification.
* [ ] Deleting a task cancels its notification.
* [ ] Completing a task cancels its reminder.
* [ ] Loading state displays `ActivityIndicator`.
* [ ] Modal works.
* [ ] `FlatList` is used for task rendering.
* [ ] `ScrollView` is used where appropriate.
* [ ] `Image` is used meaningfully.
* [ ] TypeScript errors are resolved.

---

# 30. Expected Deliverable

Generate the complete functional application.

Provide:

1. Project setup commands.
2. Dependency installation commands.
3. Folder structure.
4. TypeScript types.
5. Navigation setup.
6. Reusable components.
7. All required screens.
8. Storage service.
9. Notification service.
10. Validation utilities.
11. Date utilities.
12. Complete working code.
13. Setup instructions.
14. Testing instructions.

Do not provide pseudocode for core functionality.

The generated code should be directly usable in a React Native project with only the necessary configuration adjustments.

Prioritize **functionality, clarity, maintainability, and demonstration of the required React Native concepts** over unnecessary complexity.
