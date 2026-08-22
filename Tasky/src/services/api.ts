/**
 * Tasky Mobile — Modular Production HTTP API Client
 * Configured with process.env.EXPO_PUBLIC_API_URL, Bearer token injection, and timeout handling.
 */

import { AuthService } from './authService';
import { ENV } from '../config/environment';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export class ApiService {
  private baseUrl: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL.replace(/\/+$/, '');
    this.timeoutMs = ENV.API_TIMEOUT_MS || 25000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${this.baseUrl}/${cleanEndpoint}`;

    // Attach JWT Bearer Authorization header if available
    const token = await AuthService.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        const errorMsg =
          data?.detail || data?.message || `Request failed with HTTP status ${response.status}`;
        throw {
          message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
          statusCode: response.status,
          errors: data?.errors,
        } as ApiError;
      }

      return {
        data,
        status: response.status,
        success: true,
      };
    } catch (error: any) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw {
          message: 'Connection timed out. Please check your network connection.',
          statusCode: 408,
        } as ApiError;
      }
      throw error;
    }
  }

  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiService();
export default api;
