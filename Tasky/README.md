# Tasky — Task Management & Deadline Tracker

Tasky is a React Native mobile application built with TypeScript for students and professionals to manage coursework tasks, prioritize workloads, and receive local reminders **1 day before upcoming deadlines**.

---

## Clean & Simple Color Palette

* **Primary Action & Highlights**: Ocean Indigo (`#2563EB`)
* **Clean Neutral Background**: Slate-50 (`#F8FAFC`)
* **Surfaces & Cards**: Pure White (`#FFFFFF`) with Slate-200 (`#E2E8F0`) borders
* **Typography**: Crisp Slate-900 (`#0F172A`) & Slate-600 (`#475569`)
* **Priority Visuals**:
  * **High**: Soft Rose/Crimson (`#DC2626` / `#FEE2E2`)
  * **Medium**: Warm Amber (`#D97706` / `#FEF3C7`)
  * **Low**: Clean Emerald (`#059669` / `#D1FAE5`)
* **Status Indicators**:
  * **Completed**: Jade Green (`#16A34A` / `#DCFCE7`)
  * **Pending**: Neutral Slate (`#64748B` / `#F1F5F9`)
  * **Overdue / Due Today**: Warning Crimson (`#E11D48` / `#FFE4E6`)

---

## Features

1. **Dashboard Overview (Home)**:
   - Dynamic counter statistics: **Total Tasks**, **Pending**, **Completed**, and **Due Soon**.
   - Upcoming deadlines sorted by urgency.
   - Quick "Add Task" shortcut and time-based friendly greetings.

2. **Full Task Management (Tasks)**:
   - `FlatList` with pull-to-refresh.
   - Live search bar (filters by title or description).
   - Filter chips: **All**, **Pending**, **Completed**, and **High Priority**.
   - One-tap status toggle (Pending ⇄ Completed).

3. **Add & Edit Task**:
   - Title input with length validation (minimum 3 characters).
   - Description multiline input.
   - Date & Time selector modal (prevents past dates on creation).
   - Priority selector modal (Low, Medium, High).
   - Auto-population of existing data on edit.

4. **Task Details**:
   - Navigation parameter passing (`taskId`).
   - Detailed task metadata, priority badge, due urgency status, and created date.
   - Completion toggle, edit navigation, and task deletion with native `Alert` confirmation dialog.

5. **Deadline Notification System**:
   - Automatically schedules a local device reminder **1 day before the deadline**.
   - Automatically reschedules reminders when deadlines are updated.
   - Automatically cancels reminders when tasks are completed or deleted.

6. **Offline Persistence**:
   - Local device persistence with `@react-native-async-storage/async-storage`.
   - Pre-seeded sample academic tasks on initial launch.
   - Reset sample data & clear all data tools in Settings.

---

## Academic Demonstration Checklist

| Requirement | Implementation |
| :--- | :--- |
| **Components** | `View`, `Text`, `TextInput`, `Button`/`CustomButton`, `Pressable`, `Image`, `ScrollView`, `FlatList`, `SafeAreaView`, `ActivityIndicator`, `Modal`, `Alert` |
| **Navigation** | React Navigation (Bottom Tabs + Native Stack) |
| **Screens (6 Screens)** | `HomeScreen`, `TasksScreen`, `AddTaskScreen`, `TaskDetailsScreen`, `EditTaskScreen`, `SettingsScreen` |
| **Navigation Params** | `taskId` passed to Details & Edit screens |
| **State Management** | React Context (`TaskContext`), `useState`, `useEffect`, `useMemo` |
| **Form Validation** | Required fields, min 3 chars, future date check, priority validation |
| **Data Parsing** | `JSON.parse` and `JSON.stringify` with safe error boundaries |
| **Persistence** | `AsyncStorage` |
| **Local Notifications** | `expo-notifications` (1-day prior calculation & cancellation) |
| **TypeScript** | 100% strictly typed models and navigation routes |

---

## Project Structure

```text
TaskMate/
├── src/
│   ├── components/
│   │   ├── CustomButton.tsx
│   │   ├── CustomInput.tsx
│   │   ├── DatePickerModal.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Header.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── PriorityPickerModal.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── TaskCard.tsx
│   ├── constants/
│   │   └── colors.ts
│   ├── context/
│   │   └── TaskContext.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── AddTaskScreen.tsx
│   │   ├── EditTaskScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── TaskDetailsScreen.tsx
│   │   └── TasksScreen.tsx
│   ├── services/
│   │   ├── notificationService.ts
│   │   └── storageService.ts
│   ├── types/
│   │   ├── navigation.ts
│   │   └── Task.ts
│   └── utils/
│       ├── dateUtils.ts
│       └── validation.ts
├── App.tsx
├── index.js
└── package.json
```

---

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Open on Devices
* **Android**: Press `a` in terminal or scan QR code in Expo Go app.
* **iOS**: Press `i` in terminal or scan QR code in Camera/Expo Go.
* **Web**: Press `w` in terminal to run in browser.
