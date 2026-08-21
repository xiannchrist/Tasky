import { apiClient } from './client';
import { Task, Subject, UserProfile, LmsConnectionStatus } from '../../types/Task';

/**
 * Task API Service Interface
 * Communicates with FastAPI backend for Tasks, Subjects, LMS, and Devices.
 */
export const TaskApiService = {
  // ──────────────────────────── Tasks API ────────────────────────────
  async fetchTasks(): Promise<Task[]> {
    const response = await apiClient.get<any[]>('tasks');
    return (response.data || []).map(this.mapBackendTaskToFrontend);
  },

  async fetchTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<any>(`tasks/${id}`);
    return this.mapBackendTaskToFrontend(response.data);
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const payload = {
      title: task.title,
      description: task.description || '',
      subject_id: task.subjectId ? parseInt(task.subjectId, 10) : null,
      deadline: task.deadline || null,
      priority: task.priority?.toLowerCase() || 'medium',
      status: task.status?.toLowerCase() || 'pending',
      task_type: task.taskType || 'other',
    };
    const response = await apiClient.post<any>('tasks', payload);
    return this.mapBackendTaskToFrontend(response.data);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.subjectId !== undefined) {
      payload.subject_id = updates.subjectId ? parseInt(updates.subjectId, 10) : null;
    }
    if (updates.deadline !== undefined) payload.deadline = updates.deadline;
    if (updates.priority !== undefined) payload.priority = updates.priority.toLowerCase();
    if (updates.status !== undefined) payload.status = updates.status.toLowerCase();
    if (updates.taskType !== undefined) payload.task_type = updates.taskType;

    const response = await apiClient.put<any>(`tasks/${id}`, payload);
    return this.mapBackendTaskToFrontend(response.data);
  },

  async toggleTask(id: string): Promise<Task> {
    const response = await apiClient.patch<any>(`tasks/${id}/toggle`);
    return this.mapBackendTaskToFrontend(response.data);
  },

  async deleteTask(id: string): Promise<boolean> {
    const response = await apiClient.delete(`tasks/${id}`);
    return response.success;
  },

  // ──────────────────────────── Subjects API ────────────────────────────
  async fetchSubjects(): Promise<Subject[]> {
    const response = await apiClient.get<any[]>('subjects');
    return (response.data || []).map((s: any) => ({
      id: String(s.id),
      name: s.name,
      code: s.code || '',
      color: s.color || '#3B82F6',
    }));
  },

  async createSubject(subject: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.post<any>('subjects', {
      name: subject.name,
      code: subject.code,
      color: subject.color,
    });
    const s = response.data;
    return {
      id: String(s.id),
      name: s.name,
      code: s.code || '',
      color: s.color || '#3B82F6',
    };
  },

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.put<any>(`subjects/${id}`, {
      name: subject.name,
      code: subject.code,
      color: subject.color,
    });
    const s = response.data;
    return {
      id: String(s.id),
      name: s.name,
      code: s.code || '',
      color: s.color || '#3B82F6',
    };
  },

  async deleteSubject(id: string): Promise<boolean> {
    const response = await apiClient.delete(`subjects/${id}`);
    return response.success;
  },

  // ──────────────────────────── User Profile API ────────────────────────────
  async fetchProfile(): Promise<UserProfile> {
    const response = await apiClient.get<any>('users/profile');
    const u = response.data;
    return {
      name: u.name || '',
      email: u.email || '',
      studentId: u.student_id || '',
      section: u.section || '',
      about: u.about || '',
    };
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<any>('users/profile', {
      name: profile.name,
      student_id: profile.studentId,
      section: profile.section,
      about: profile.about,
    });
    const u = response.data;
    return {
      name: u.name || '',
      email: u.email || '',
      studentId: u.student_id || '',
      section: u.section || '',
      about: u.about || '',
    };
  },

  // ──────────────────────────── LMS Sync API ────────────────────────────
  async getLmsStatus(): Promise<LmsConnectionStatus> {
    const response = await apiClient.get<any>('lms/status');
    const d = response.data;
    return {
      connected: !!d.connected,
      lmsUrl: d.lms_url,
      lmsUsername: d.lms_username,
      lastSync: d.last_sync,
      nextSync: d.next_sync,
      status: d.status || (d.connected ? 'connected' : 'disconnected'),
      lastError: d.last_error,
    };
  },

  async connectLms(params: {
    lms_url: string;
    lms_username: string;
    lms_password: string;
  }): Promise<LmsConnectionStatus> {
    const response = await apiClient.post<any>('lms/connect', params);
    const d = response.data;
    return {
      connected: !!d.connected,
      lmsUrl: d.lms_url,
      lmsUsername: d.lms_username,
      lastSync: d.last_sync,
      nextSync: d.next_sync,
      status: d.status || 'connected',
      lastError: d.last_error,
    };
  },

  async syncLmsNow(): Promise<{ success: boolean; new_tasks: number; message?: string }> {
    const response = await apiClient.post<any>('lms/sync');
    return response.data;
  },

  async disconnectLms(): Promise<boolean> {
    const response = await apiClient.delete('lms/disconnect');
    return response.success;
  },

  // ──────────────────────────── Push Device API ────────────────────────────
  async registerDeviceToken(params: {
    push_token: string;
    platform: string;
    device_name?: string;
  }): Promise<boolean> {
    try {
      const response = await apiClient.post('devices/register', params);
      return response.success;
    } catch {
      return false;
    }
  },

  // ──────────────────────────── Helper Mappers ────────────────────────────
  mapBackendTaskToFrontend(item: any): Task {
    const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
    return {
      id: String(item.id),
      title: item.title,
      description: item.description || '',
      deadline: item.deadline || new Date().toISOString(),
      priority: (capitalize(item.priority) as any) || 'Medium',
      status: (capitalize(item.status) as any) || 'Pending',
      createdAt: item.created_at || new Date().toISOString(),
      subjectId: item.subject_id ? String(item.subject_id) : undefined,
      taskType: item.task_type || 'other',
      source: item.source || 'manual',
      sourceUrl: item.source_url,
      lmsSourceId: item.lms_source_id,
    };
  },
};

export default TaskApiService;
