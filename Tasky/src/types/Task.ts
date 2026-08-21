/**
 * Task Data Models and Types for Tasky
 */

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'Completed';

export type TaskFilter = 'All' | 'Pending' | 'Completed' | 'High';

export type DueStatus = 'Overdue' | 'Due Today' | 'Due Tomorrow' | 'Due Soon' | 'Upcoming';

export type TaskType = 'assignment' | 'quiz' | 'exam' | 'project' | 'activity' | 'reading' | 'other';

export type TaskSource = 'manual' | 'lms';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  section: string;
  studentId: string;
  about: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  studentId?: string;
  section?: string;
  about?: string;
}

export interface LmsConnectionStatus {
  connected: boolean;
  lmsUrl?: string;
  lmsUsername?: string;
  lastSync?: string;
  nextSync?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastError?: string;
}

export interface TaskNotificationItem {
  id: string;
  title: string;
  message: string;
  subjectName?: string;
  timestamp: string;
  read: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO 8601 string
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string; // ISO 8601 string
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
  notificationId?: string;
  taskType?: TaskType;
  source?: TaskSource;
  sourceUrl?: string;
  lmsSourceId?: string;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  completed: number;
  dueSoon: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  deadline: Date;
  priority: TaskPriority;
  subjectId?: string;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  deadline?: string;
  priority?: string;
  subject?: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  userGreetingName: string;
}
