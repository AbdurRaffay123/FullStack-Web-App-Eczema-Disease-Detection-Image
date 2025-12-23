import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { authService } from './authService';

export interface Reminder {
  id: string;
  title: string;
  type: 'medication' | 'appointment' | 'custom';
  time: string;
  reminderMode?: 'recurring' | 'one-time';
  days?: string[];
  date?: string;
  customMessage?: string;
  isActive: boolean;
  timezone?: string;
  nextTriggerTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReminderData {
  title: string;
  type: 'medication' | 'appointment' | 'custom';
  time: string;
  reminderMode?: 'recurring' | 'one-time';
  days?: string[];
  date?: string;
  customMessage?: string;
  timezone?: string;
}

export interface UpdateReminderData {
  title?: string;
  type?: 'medication' | 'appointment' | 'custom';
  time?: string;
  reminderMode?: 'recurring' | 'one-time';
  days?: string[];
  date?: string;
  customMessage?: string;
  isActive?: boolean;
  timezone?: string;
}

export interface Notification {
  id: string;
  reminderId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  triggeredAt: string;
  createdAt?: string;
}

/**
 * Reminder Service for Mobile App
 * Handles all reminder-related API calls
 */
class ReminderService {
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
   * Create Reminder
   * POST /reminders
   */
  async createReminder(data: CreateReminderData): Promise<{ reminder: Reminder }> {
    return this.request<{ reminder: Reminder }>(API_ENDPOINTS.REMINDERS.CREATE, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Get All Reminders
   * GET /reminders
   */
  async getReminders(): Promise<{ reminders: Reminder[] }> {
    return this.request<{ reminders: Reminder[] }>(API_ENDPOINTS.REMINDERS.LIST);
  }

  /**
   * Get Single Reminder by ID
   * GET /reminders/:id
   */
  async getReminderById(id: string): Promise<{ reminder: Reminder }> {
    const endpoint = API_ENDPOINTS.REMINDERS.GET.replace(':id', id);
    return this.request<{ reminder: Reminder }>(endpoint);
  }

  /**
   * Update Reminder
   * PUT /reminders/:id
   */
  async updateReminder(id: string, data: UpdateReminderData): Promise<{ reminder: Reminder }> {
    const endpoint = API_ENDPOINTS.REMINDERS.UPDATE.replace(':id', id);
    return this.request<{ reminder: Reminder }>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Delete Reminder
   * DELETE /reminders/:id
   */
  async deleteReminder(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.REMINDERS.DELETE.replace(':id', id);
    await this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Get Notifications
   * GET /notifications
   */
  async getNotifications(options?: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
  }): Promise<{
    notifications: Notification[];
    total: number;
    limit: number;
    skip: number;
  }> {
    let endpoint = API_ENDPOINTS.NOTIFICATIONS.LIST;
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    try {
      return await this.request<{
        notifications: Notification[];
        total: number;
        limit: number;
        skip: number;
      }>(endpoint);
    } catch (error: any) {
      // Handle token expiration specifically
      if (error.message?.includes('expired') || error.message?.includes('Token expired')) {
        throw new Error('Token expired');
      }
      throw error;
    }
  }

  /**
   * Mark Notification as Read
   * PUT /notifications/:id/read
   */
  async markAsRead(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', id);
    await this.request(endpoint, {
      method: 'PUT',
    });
  }

  /**
   * Mark All Notifications as Read
   * PUT /notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    await this.request(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PUT',
    });
  }
}

export const reminderService = new ReminderService();





