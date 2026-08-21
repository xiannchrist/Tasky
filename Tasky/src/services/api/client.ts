import { ENV } from '../../config/environment';
import { AuthService } from '../authService';

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

/**
 * Lightweight HTTP API Client with JWT Bearer Token Injection
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = ENV.API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
    
    // Retrieve authentication token
    const token = await AuthService.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : null;

      if (!response.ok) {
        const errorMessage =
          responseData?.detail ||
          responseData?.message ||
          `Request failed with status ${response.status}`;
        throw {
          message: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
          statusCode: response.status,
          errors: responseData?.errors,
        } as ApiError;
      }

      return {
        data: responseData,
        status: response.status,
        success: true,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw {
          message: 'Network request timed out. Please check your connection.',
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

export const apiClient = new ApiClient();
export default apiClient;
