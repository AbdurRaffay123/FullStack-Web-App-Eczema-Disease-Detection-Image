/**
 * API Client for Mobile App
 * Centralized HTTP client for making API requests
 */

import { API_CONFIG, buildApiUrl } from '../config/api';
import { authService } from '../services/authService';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  timeout?: number;
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await authService.getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async handleUnauthorized(): Promise<void> {
    // Clear auth data and redirect to login
    try {
      await authService.logout();
      // Note: Navigation should be handled by the app's routing system
      // This will be handled by checking authentication state in components
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = API_CONFIG.TIMEOUT,
    } = options;

    const url = buildApiUrl(endpoint, params);
    const token = await this.getAuthToken();

    const requestHeaders: HeadersInit = {
      ...API_CONFIG.HEADERS,
      ...headers,
    };

    // Add authorization token if available
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      // Handle 401 Unauthorized - Token expired or invalid
      if (response.status === 401) {
        await this.handleUnauthorized();
        return {
          status: response.status,
          error: responseData.message || responseData.error || 'Token expired. Please login again.',
          data: responseData,
        };
      }

      if (!response.ok) {
        return {
          status: response.status,
          error: responseData.message || responseData.error || 'Request failed',
          data: responseData,
        };
      }

      return {
        status: response.status,
        data: responseData,
        message: responseData.message,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return {
          status: 408,
          error: 'Request timeout',
        };
      }

      return {
        status: 500,
        error: error.message || 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

export const apiClient = new ApiClient();


