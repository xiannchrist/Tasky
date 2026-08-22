import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, AppSettings, Subject, UserProfile } from '../types/Task';

const TASKS_STORAGE_KEY = '@Tasky:tasks_v1';
const SETTINGS_STORAGE_KEY = '@Tasky:settings_v1';
const SUBJECTS_STORAGE_KEY = '@Tasky:subjects_v1';
const PROFILE_STORAGE_KEY = '@Tasky:profile_v1';

export const DEFAULT_SUBJECTS: Subject[] = [];

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  section: '',
  studentId: '',
  about: '',
};

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
        return [];
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
    await this.saveTasks([]);
    await this.saveSubjects([]);
    return [];
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
