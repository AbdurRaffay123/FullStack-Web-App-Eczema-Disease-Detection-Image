import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

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
 * Reminder Service
 * Handles all reminder-related API calls
 */
class ReminderService {
  /**
   * Create Reminder
   * POST /reminders
   */
  async createReminder(data: CreateReminderData): Promise<Reminder> {
    const response = await apiClient.post<{ success: boolean; data: { reminder: Reminder } }>(
      API_ENDPOINTS.REMINDERS.CREATE,
      data
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to create reminder');
    }

    return response.data.data.reminder;
  }

  /**
   * Get All Reminders
   * GET /reminders
   */
  async getReminders(): Promise<Reminder[]> {
    const response = await apiClient.get<{ success: boolean; data: { reminders: Reminder[] } }>(
      API_ENDPOINTS.REMINDERS.LIST
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to fetch reminders');
    }

    return response.data.data.reminders;
  }

  /**
   * Get Single Reminder by ID
   * GET /reminders/:id
   */
  async getReminderById(id: string): Promise<Reminder> {
    const response = await apiClient.get<{ success: boolean; data: { reminder: Reminder } }>(
      API_ENDPOINTS.REMINDERS.GET,
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to fetch reminder');
    }

    return response.data.data.reminder;
  }

  /**
   * Update Reminder
   * PUT /reminders/:id
   */
  async updateReminder(id: string, data: UpdateReminderData): Promise<Reminder> {
    const response = await apiClient.put<{ success: boolean; data: { reminder: Reminder } }>(
      API_ENDPOINTS.REMINDERS.UPDATE,
      data,
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to update reminder');
    }

    return response.data.data.reminder;
  }

  /**
   * Delete Reminder
   * DELETE /reminders/:id
   */
  async deleteReminder(id: string): Promise<void> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.REMINDERS.DELETE,
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to delete reminder');
    }
  }

  /**
   * Get Notifications
   * GET /notifications
   */
  async getNotifications(options?: { limit?: number; skip?: number; unreadOnly?: boolean }): Promise<{
    notifications: Notification[];
    total: number;
    limit: number;
    skip: number;
  }> {
    const params: any = {};
    if (options?.limit) params.limit = options.limit;
    if (options?.skip) params.skip = options.skip;
    if (options?.unreadOnly) params.unreadOnly = options.unreadOnly;

    const response = await apiClient.get<{
      success: boolean;
      data: {
        notifications: Notification[];
        total: number;
        limit: number;
        skip: number;
      };
    }>(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });

    // Handle token expiration
    if (response.status === 401) {
      throw new Error('Token expired');
    }

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to fetch notifications');
    }

    return response.data.data;
  }

  /**
   * Mark Notification as Read
   * PUT /notifications/:id/read
   */
  async markAsRead(id: string): Promise<void> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ,
      {},
      { params: { id } }
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark All Notifications as Read
   * PUT /notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );

    if (response.error || !response.data?.success) {
      throw new Error(response.error || response.data?.message || 'Failed to mark all notifications as read');
    }
  }
}

export const reminderService = new ReminderService();





