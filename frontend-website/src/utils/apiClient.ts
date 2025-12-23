/**
 * API Client for Website
 * Centralized HTTP client for making API requests
 * Should match mobile app's API client structure for consistency
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
  private getAuthToken(): string | null {
    // Get token from localStorage
    return localStorage.getItem('eczema_token');
  }

  private handleUnauthorized(): void {
    // Clear auth data and redirect to login
    authService.logout();
    // Redirect to login page
    if (window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
      window.location.href = '/auth';
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
    const token = this.getAuthToken();

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
        credentials: 'include', // Include cookies for CORS
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      // Handle 401 Unauthorized - Token expired or invalid
      if (response.status === 401) {
        this.handleUnauthorized();
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


