import { reminderService, Reminder } from '../services/reminderService';
import {
  scheduleRecurringReminderNotifications,
  cancelReminderNotifications,
  cancelAllNotifications,
  getScheduledNotifications,
} from './notificationScheduler';

/**
 * Sync reminders from backend and reconcile local scheduled notifications
 * This should be called on app start and periodically
 */
export const syncReminders = async (): Promise<void> => {
  try {
    // Get all reminders from backend
    const result = await reminderService.getReminders();
    const backendReminders = result.reminders;

    // Get all currently scheduled notifications
    const scheduledNotifications = await getScheduledNotifications();

    // Create a map of reminder IDs to their scheduled notification IDs
    const reminderNotificationMap = new Map<string, string[]>();
    scheduledNotifications.forEach(notification => {
      const reminderId = notification.content.data?.reminderId;
      if (reminderId) {
        if (!reminderNotificationMap.has(reminderId)) {
          reminderNotificationMap.set(reminderId, []);
        }
        reminderNotificationMap.get(reminderId)!.push(notification.identifier);
      }
    });

    // Cancel notifications for reminders that no longer exist or are inactive
    for (const [reminderId, notificationIds] of reminderNotificationMap.entries()) {
      const reminder = backendReminders.find(r => r.id === reminderId);
      if (!reminder || !reminder.isActive) {
        // Cancel all notifications for this reminder
        await cancelReminderNotifications(reminderId);
      }
    }

    // Schedule notifications for active reminders that don't have scheduled notifications
    for (const reminder of backendReminders) {
      if (reminder.isActive) {
        const hasScheduledNotifications = reminderNotificationMap.has(reminder.id);
        
        // If no scheduled notifications exist, schedule them
        if (!hasScheduledNotifications) {
          await scheduleRecurringReminderNotifications(reminder);
        }
      }
    }

    console.log('Reminder sync completed successfully');
  } catch (error) {
    console.error('Error syncing reminders:', error);
    // Don't throw - allow app to continue even if sync fails
  }
};

/**
 * Clear all scheduled notifications and reschedule from backend
 * Useful for force refresh
 */
export const forceSyncReminders = async (): Promise<void> => {
  try {
    // Cancel all existing notifications
    await cancelAllNotifications();

    // Get all reminders from backend
    const result = await reminderService.getReminders();
    const reminders = result.reminders;

    // Schedule notifications for all active reminders
    for (const reminder of reminders) {
      if (reminder.isActive) {
        await scheduleRecurringReminderNotifications(reminder);
      }
    }

    console.log('Force reminder sync completed successfully');
  } catch (error) {
    console.error('Error force syncing reminders:', error);
    throw error;
  }
};

