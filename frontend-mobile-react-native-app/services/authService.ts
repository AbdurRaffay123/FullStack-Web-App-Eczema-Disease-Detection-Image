import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const TOKEN_KEY = 'eczema_token';
const USER_KEY = 'eczema_user';

/**
 * Authentication Service for Mobile App
 * Uses SecureStore for secure token storage
 */
class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  /**
   * User Signup
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      if (!result.success) {
        throw new Error(result.message || 'Signup failed');
      }

      // Store token and user data securely
      if (result.data.token) {
        await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);
      }
      if (result.data.user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.data.user));
      }

      return result.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * User Login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }

      // Store token and user data securely
      if (result.data.token) {
        await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);
      }
      if (result.data.user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.data.user));
      }

      return result.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Get stored user
   */
  async getUser(): Promise<User | null> {
    try {
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Logout - Clear stored data
   */
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();

