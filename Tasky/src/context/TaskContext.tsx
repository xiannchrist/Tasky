import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Task,
  TaskFilter,
  TaskStatistics,
  AppSettings,
  TaskPriority,
  Subject,
  UserProfile,
  TaskNotificationItem,
  LmsConnectionStatus,
} from '../types/Task';
import { StorageService, DEFAULT_PROFILE, DEFAULT_SUBJECTS } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { TaskApiService } from '../services/api/taskApi';
import { useAuth } from './AuthContext';
import { isTaskDueSoon } from '../utils/dateUtils';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  subjects: Subject[];
  profile: UserProfile;
  lmsStatus: LmsConnectionStatus;
  notificationsList: TaskNotificationItem[];
  loading: boolean;
  isSyncingLms: boolean;
  filter: TaskFilter;
  selectedSubjectFilter?: string;
  searchQuery: string;
  statistics: TaskStatistics;
  settings: AppSettings;
  setFilter: (filter: TaskFilter) => void;
  setSelectedSubjectFilter: (subjectId?: string) => void;
  setSearchQuery: (query: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getSubjectById: (subjectId?: string) => Subject | undefined;
  addTask: (data: {
    title: string;
    description: string;
    deadline: string;
    priority: TaskPriority;
    subjectId?: string;
  }) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string) => Promise<boolean>;
  addSubject: (data: { name: string; code: string; color: string }) => Promise<Subject>;
  updateProfile: (newProfile: Partial<UserProfile>) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetToSampleTasks: () => Promise<void>;
  clearAllTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  connectLms: (params: { lms_url: string; lms_username: string; lms_password: string }) => Promise<LmsConnectionStatus>;
  syncLmsNow: () => Promise<{ success: boolean; new_tasks: number; message?: string }>;
  disconnectLms: () => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [lmsStatus, setLmsStatus] = useState<LmsConnectionStatus>({
    connected: false,
    status: 'disconnected',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncingLms, setIsSyncingLms] = useState<boolean>(false);
  const [filter, setFilter] = useState<TaskFilter>('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    userGreetingName: user?.name || 'Student',
  });

  // Load data on boot or when auth state changes
  const loadData = async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Fetch from live backend API
        try {
          const [apiTasks, apiSubjects, apiProfile, apiLms] = await Promise.allSettled([
            TaskApiService.fetchTasks(),
            TaskApiService.fetchSubjects(),
            TaskApiService.fetchProfile(),
            TaskApiService.getLmsStatus(),
          ]);

          const loadedSubjects = apiSubjects.status === 'fulfilled' ? apiSubjects.value : [];
          setSubjects(loadedSubjects);

          if (apiTasks.status === 'fulfilled') {
            // Map subjects to tasks
            const enrichedTasks = apiTasks.value.map(t => {
              const subj = loadedSubjects.find(s => s.id === t.subjectId);
              return {
                ...t,
                subjectName: subj?.name || t.subjectName,
                subjectColor: subj?.color || t.subjectColor,
              };
            });
            setTasks(enrichedTasks);
            await StorageService.saveTasks(enrichedTasks);
          }

          if (apiProfile.status === 'fulfilled' && apiProfile.value.name) {
            setProfile(apiProfile.value);
            setSettings(prev => ({ ...prev, userGreetingName: apiProfile.value.name }));
          }

          if (apiLms.status === 'fulfilled') {
            setLmsStatus(apiLms.value);
          }
        } catch (e) {
          console.warn('Backend fetch failed, falling back to local storage:', e);
          // Fallback to local storage
          const [storedTasks, storedSubjects, storedProfile] = await Promise.all([
            StorageService.getTasks(),
            StorageService.getSubjects(),
            StorageService.getProfile(),
          ]);
          setTasks(storedTasks);
          setSubjects(storedSubjects);
          setProfile(storedProfile);
        }
      } else {
        // Unauthenticated local mode
        const [storedTasks, storedSubjects, storedProfile, storedSettings] = await Promise.all([
          StorageService.getTasks(),
          StorageService.getSubjects(),
          StorageService.getProfile(),
          StorageService.getSettings(),
        ]);
        setTasks(storedTasks);
        setSubjects(storedSubjects);
        setProfile(storedProfile);
        setSettings(storedSettings);
      }
    } catch (error) {
      console.error('Failed to load initial task data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, user?.id]);

  // Compute dynamic statistics
  const statistics: TaskStatistics = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const dueSoon = tasks.filter(t => t.status === 'Pending' && isTaskDueSoon(t.deadline, false)).length;

    return { total, pending, completed, dueSoon };
  }, [tasks]);

  // Compute notifications list dynamically based on tasks and upcoming deadlines
  const notificationsList: TaskNotificationItem[] = useMemo(() => {
    const list: TaskNotificationItem[] = [];

    // Due Soon Notifications
    const dueSoonTasks = tasks.filter(t => t.status === 'Pending' && isTaskDueSoon(t.deadline, false));
    dueSoonTasks.forEach(t => {
      list.push({
        id: `notif-due-${t.id}`,
        title: 'Deadline Approaching ⏰',
        message: `Your task "${t.title}" for ${t.subjectName || 'General'} is due soon! Don't forget to submit it.`,
        subjectName: t.subjectName,
        timestamp: t.deadline,
        read: false,
      });
    });

    // Recent tasks added
    const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
    recentTasks.forEach(t => {
      list.push({
        id: `notif-new-${t.id}`,
        title: `Task for ${t.subjectName || 'General'} 📚`,
        message: `Task "${t.title}" was scheduled. Priority: ${t.priority}.`,
        subjectName: t.subjectName,
        timestamp: t.createdAt,
        read: true,
      });
    });

    return list;
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      let matchesFilter = true;
      if (filter === 'Pending') {
        matchesFilter = task.status === 'Pending';
      } else if (filter === 'Completed') {
        matchesFilter = task.status === 'Completed';
      } else if (filter === 'High') {
        matchesFilter = task.priority === 'High';
      }

      // Subject filter
      let matchesSubject = true;
      if (selectedSubjectFilter) {
        matchesSubject = task.subjectId === selectedSubjectFilter;
      }

      // Search query filter
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          Boolean(task.subjectName?.toLowerCase().includes(query));
      }

      return matchesFilter && matchesSubject && matchesSearch;
    });
  }, [tasks, filter, selectedSubjectFilter, searchQuery]);

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find(t => t.id === taskId);
  };

  const getSubjectById = (subjectId?: string): Subject | undefined => {
    if (!subjectId) return undefined;
    return subjects.find(s => s.id === subjectId);
  };

  // Add task
  const addTask = async (data: {
    title: string;
    description: string;
    deadline: string;
    priority: TaskPriority;
    subjectId?: string;
  }): Promise<Task> => {
    const subject = getSubjectById(data.subjectId);

    let createdTask: Task;

    if (isAuthenticated) {
      try {
        createdTask = await TaskApiService.createTask({
          title: data.title.trim(),
          description: data.description.trim(),
          deadline: data.deadline,
          priority: data.priority,
          subjectId: data.subjectId,
        });
        createdTask.subjectName = subject?.name;
        createdTask.subjectColor = subject?.color;
      } catch (err) {
        console.warn('API task creation failed, saving locally:', err);
        createdTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: data.title.trim(),
          description: data.description.trim(),
          deadline: data.deadline,
          priority: data.priority,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          subjectId: data.subjectId,
          subjectName: subject?.name,
          subjectColor: subject?.color,
        };
      }
    } else {
      createdTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: data.title.trim(),
        description: data.description.trim(),
        deadline: data.deadline,
        priority: data.priority,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        subjectId: data.subjectId,
        subjectName: subject?.name,
        subjectColor: subject?.color,
      };
    }

    const notificationId = await NotificationService.scheduleDeadlineReminder(
      createdTask,
      settings.notificationsEnabled
    );
    createdTask.notificationId = notificationId;

    const updatedTasks = [createdTask, ...tasks];
    setTasks(updatedTasks);
    await StorageService.saveTasks(updatedTasks);
    return createdTask;
  };

  const updateTask = async (
    taskId: string,
    data: Partial<Task>
  ): Promise<Task | undefined> => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return undefined;

    let subjectName = existing.subjectName;
    let subjectColor = existing.subjectColor;
    if (data.subjectId !== undefined) {
      const subject = getSubjectById(data.subjectId);
      subjectName = subject?.name;
      subjectColor = subject?.color;
    }

    const updatedTask: Task = {
      ...existing,
      ...data,
      subjectName,
      subjectColor,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      description: data.description !== undefined ? data.description.trim() : existing.description,
    };

    if (isAuthenticated) {
      try {
        await TaskApiService.updateTask(taskId, data);
      } catch (err) {
        console.warn('API task update failed:', err);
      }
    }

    if (data.deadline !== undefined || data.status !== undefined) {
      if (existing.notificationId) {
        await NotificationService.cancelReminder(existing.notificationId);
      }

      if (updatedTask.status === 'Pending') {
        const newNotificationId = await NotificationService.scheduleDeadlineReminder(
          updatedTask,
          settings.notificationsEnabled
        );
        updatedTask.notificationId = newNotificationId;
      } else {
        updatedTask.notificationId = undefined;
      }
    }

    const updatedList = tasks.map(t => (t.id === taskId ? updatedTask : t));
    setTasks(updatedList);
    await StorageService.saveTasks(updatedList);
    return updatedTask;
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete?.notificationId) {
      await NotificationService.cancelReminder(taskToDelete.notificationId);
    }

    if (isAuthenticated) {
      try {
        await TaskApiService.deleteTask(taskId);
      } catch (err) {
        console.warn('API task delete failed:', err);
      }
    }

    const updatedList = tasks.filter(t => t.id !== taskId);
    setTasks(updatedList);
    await StorageService.saveTasks(updatedList);
    return true;
  };

  const toggleTaskCompletion = async (taskId: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return false;

    const newStatus = target.status === 'Completed' ? 'Pending' : 'Completed';
    await updateTask(taskId, { status: newStatus });
    return true;
  };

  // Add Subject
  const addSubject = async (data: { name: string; code: string; color: string }): Promise<Subject> => {
    let newSubject: Subject;

    if (isAuthenticated) {
      try {
        newSubject = await TaskApiService.createSubject({
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          color: data.color,
        });
      } catch (err) {
        console.warn('API subject creation failed:', err);
        newSubject = {
          id: `subj-${Date.now()}`,
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          color: data.color,
        };
      }
    } else {
      newSubject = {
        id: `subj-${Date.now()}`,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        color: data.color,
      };
    }

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    await StorageService.saveSubjects(updated);
    return newSubject;
  };

  // Update Profile
  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    const merged = { ...profile, ...newProfile };
    setProfile(merged);
    await StorageService.saveProfile(merged);

    if (isAuthenticated) {
      try {
        await TaskApiService.updateProfile(merged);
      } catch (err) {
        console.warn('API profile update failed:', err);
      }
    }

    if (newProfile.name) {
      await updateSettings({ userGreetingName: newProfile.name });
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await StorageService.saveSettings(merged);

    if (newSettings.notificationsEnabled === false) {
      await NotificationService.cancelAllReminders();
    }
  };

  const resetToSampleTasks = async () => {
    setLoading(true);
    await NotificationService.cancelAllReminders();
    const samples = await StorageService.resetToSampleData();
    setTasks(samples);
    setSubjects([]);
    setProfile(DEFAULT_PROFILE);
    setLoading(false);
  };

  const clearAllTasks = async () => {
    setLoading(true);
    await NotificationService.cancelAllReminders();
    await StorageService.clearAllTasks();
    setTasks([]);
    setLoading(false);
  };

  const refreshTasks = async () => {
    await loadData();
  };

  // LMS Management
  const connectLms = async (params: {
    lms_url: string;
    lms_username: string;
    lms_password: string;
  }): Promise<LmsConnectionStatus> => {
    setIsSyncingLms(true);
    try {
      const status = await TaskApiService.connectLms(params);
      setLmsStatus(status);
      await loadData();
      return status;
    } finally {
      setIsSyncingLms(false);
    }
  };

  const syncLmsNow = async () => {
    setIsSyncingLms(true);
    try {
      const result = await TaskApiService.syncLmsNow();
      await loadData();
      return result;
    } finally {
      setIsSyncingLms(false);
    }
  };

  const disconnectLms = async (): Promise<boolean> => {
    setIsSyncingLms(true);
    try {
      const ok = await TaskApiService.disconnectLms();
      setLmsStatus({ connected: false, status: 'disconnected' });
      return ok;
    } finally {
      setIsSyncingLms(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        subjects,
        profile,
        lmsStatus,
        notificationsList,
        loading,
        isSyncingLms,
        filter,
        selectedSubjectFilter,
        searchQuery,
        statistics,
        settings,
        setFilter,
        setSelectedSubjectFilter,
        setSearchQuery,
        getTaskById,
        getSubjectById,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addSubject,
        updateProfile,
        updateSettings,
        resetToSampleTasks,
        clearAllTasks,
        refreshTasks,
        connectLms,
        syncLmsNow,
        disconnectLms,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
