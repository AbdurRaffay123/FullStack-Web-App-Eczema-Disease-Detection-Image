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

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  /**
   * User Signup
   */
  async signup(data: SignupData): Promise<AuthResponse> {
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

    // Store token and user data
    if (result.data.token) {
      localStorage.setItem('eczema_token', result.data.token);
    }
    if (result.data.user) {
      localStorage.setItem('eczema_user', JSON.stringify(result.data.user));
    }

    return result.data;
  }

  /**
   * User Login
   */
  async login(data: LoginData): Promise<AuthResponse> {
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

    // Store token and user data
    if (result.data.token) {
      localStorage.setItem('eczema_token', result.data.token);
    }
    if (result.data.user) {
      localStorage.setItem('eczema_user', JSON.stringify(result.data.user));
    }

    return result.data;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('eczema_token');
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('eczema_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Logout - Clear stored data
   */
  logout(): void {
    localStorage.removeItem('eczema_token');
    localStorage.removeItem('eczema_user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

