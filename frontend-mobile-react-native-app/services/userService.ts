import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { authService } from './authService';

export interface UserProfile {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string | null;
}

export interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

/**
 * User Service for Mobile App
 * Handles all user profile-related API calls
 */
class UserService {
  private baseURL = API_CONFIG.BASE_URL;

  private async getAuthToken(): Promise<string | null> {
    return await authService.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body } = options;
    const token = await this.getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    if (!result.success) {
      throw new Error(result.message || 'Request failed');
    }

    return result.data;
  }

  /**
   * Get Current User Profile
   * GET /users/me
   */
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>(API_ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update User Profile
   * PUT /users/update-profile
   */
  async updateProfile(data: UpdateProfileData): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>(API_ENDPOINTS.USER.UPDATE, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Update User Password
   * PUT /users/update-password
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await this.request(API_ENDPOINTS.USER.PASSWORD, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Delete User Account
   * DELETE /users/delete-account
   */
  async deleteAccount(): Promise<void> {
    await this.request(API_ENDPOINTS.USER.DELETE, {
      method: 'DELETE',
    });
  }
}

export const userService = new UserService();

