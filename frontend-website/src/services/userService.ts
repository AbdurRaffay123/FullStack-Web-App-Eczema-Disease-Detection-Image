import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

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
 * User Service
 * Handles all user profile-related API calls
 */
class UserService {
  /**
   * Get Current User Profile
   * GET /users/me
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>(
      API_ENDPOINTS.USER.PROFILE
    );

    if (response.status === 404) {
      throw new Error('Profile endpoint not found. Please ensure you are logged in and the server is running.');
    }

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to fetch profile');
    }

    if (!response.data?.data?.user) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data.user;
  }

  /**
   * Update User Profile
   * PUT /users/update-profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put<{ success: boolean; data: { user: UserProfile } }>(
      API_ENDPOINTS.USER.UPDATE,
      data
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to update profile');
    }

    return response.data.data.user;
  }

  /**
   * Update User Password
   * PUT /users/update-password
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.USER.PASSWORD,
      data
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to update password');
    }
  }

  /**
   * Delete User Account
   * DELETE /users/delete-account
   */
  async deleteAccount(): Promise<void> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.USER.DELETE
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to delete account');
    }
  }
}

export const userService = new UserService();

