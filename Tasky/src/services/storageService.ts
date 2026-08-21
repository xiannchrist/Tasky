import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, AppSettings, Subject, UserProfile } from '../types/Task';

const TASKS_STORAGE_KEY = '@Tasky:tasks_v1';
const SETTINGS_STORAGE_KEY = '@Tasky:settings_v1';
const SUBJECTS_STORAGE_KEY = '@Tasky:subjects_v1';
const PROFILE_STORAGE_KEY = '@Tasky:profile_v1';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj-1',
    name: 'Mobile Development',
    code: 'IT301',
    color: '#2563EB', // Blue
  },
  {
    id: 'subj-2',
    name: 'Database Systems',
    code: 'IT204',
    color: '#D97706', // Amber
  },
  {
    id: 'subj-3',
    name: 'Software Engineering',
    code: 'CS302',
    color: '#7C3AED', // Purple
  },
  {
    id: 'subj-4',
    name: 'Web Development',
    code: 'IT202',
    color: '#059669', // Emerald
  },
  {
    id: 'subj-5',
    name: 'Computer Networks',
    code: 'IT305',
    color: '#EA580C', // Orange
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  section: 'BSIT 3-A',
  studentId: '2024-00123',
  about: 'Mobile Application Development Student. Aiming for Dean\'s list!',
};

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-task-1',
    title: 'Submit Web Development Project',
    description: 'Finalize the frontend responsive design and write the project report documentation.',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    priority: 'High',
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: 'subj-4',
    subjectName: 'Web Development',
    subjectColor: '#059669',
  },
  {
    id: 'sample-task-2',
    title: 'Study for Java Exam',
    description: 'Review object-oriented programming concepts, polymorphism, exceptions, and collection frameworks.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'Medium',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: 'subj-1',
    subjectName: 'Mobile Development',
    subjectColor: '#2563EB',
  },
  {
    id: 'sample-task-3',
    title: 'Complete React Native Assignment',
    description: 'Build mobile screens with navigation, state hooks, FlatList components, and async storage.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'High',
    status: 'Completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: 'subj-1',
    subjectName: 'Mobile Development',
    subjectColor: '#2563EB',
  },
  {
    id: 'sample-task-4',
    title: 'Submit Research Paper Outline',
    description: 'Draft the methodology, literature review citations, and expected experimental outcomes.',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'Medium',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: 'subj-3',
    subjectName: 'Software Engineering',
    subjectColor: '#7C3AED',
  },
  {
    id: 'sample-task-5',
    title: 'Prepare Class Presentation Slides',
    description: 'Create clean 10-minute slide deck summarizing mobile application development best practices.',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'Low',
    status: 'Completed',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    subjectId: 'subj-2',
    subjectName: 'Database Systems',
    subjectColor: '#D97706',
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  userGreetingName: 'Student',
};

/**
 * Storage Service to handle local persistence of tasks, subjects, profile, and settings.
 */
export const StorageService = {
  async getTasks(): Promise<Task[]> {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks !== null) {
        const parsed: Task[] = JSON.parse(storedTasks);
        return Array.isArray(parsed) ? parsed : [];
      } else {
        await this.saveTasks(SAMPLE_TASKS);
        return SAMPLE_TASKS;
      }
    } catch (error) {
      console.error('Error reading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      return false;
    }
  },

  async addTask(task: Task): Promise<Task[]> {
    const currentTasks = await this.getTasks();
    const updatedTasks = [task, ...currentTasks];
    await this.saveTasks(updatedTasks);
    return updatedTasks;
  },

  async updateTask(updatedTask: Task): Promise<Task[]> {
    const currentTasks = await this.getTasks();
    const updatedTasks = currentTasks.map(t =>
      t.id === updatedTask.id ? updatedTask : t
    );
    await this.saveTasks(updatedTasks);
    return updatedTasks;
  },

  async deleteTask(taskId: string): Promise<Task[]> {
    const currentTasks = await this.getTasks();
    const updatedTasks = currentTasks.filter(t => t.id !== taskId);
    await this.saveTasks(updatedTasks);
    return updatedTasks;
  },

  // Subjects Management
  async getSubjects(): Promise<Subject[]> {
    try {
      const stored = await AsyncStorage.getItem(SUBJECTS_STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      } else {
        await this.saveSubjects(DEFAULT_SUBJECTS);
        return DEFAULT_SUBJECTS;
      }
    } catch {
      return DEFAULT_SUBJECTS;
    }
  },

  async saveSubjects(subjects: Subject[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
      return true;
    } catch {
      return false;
    }
  },

  async addSubject(subject: Subject): Promise<Subject[]> {
    const current = await this.getSubjects();
    const updated = [...current, subject];
    await this.saveSubjects(updated);
    return updated;
  },

  // User Profile
  async getProfile(): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  async saveProfile(profile: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  },

  // App Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  },

  async resetToSampleData(): Promise<Task[]> {
    await this.saveTasks(SAMPLE_TASKS);
    await this.saveSubjects(DEFAULT_SUBJECTS);
    return SAMPLE_TASKS;
  },

  async clearAllTasks(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  },
};
