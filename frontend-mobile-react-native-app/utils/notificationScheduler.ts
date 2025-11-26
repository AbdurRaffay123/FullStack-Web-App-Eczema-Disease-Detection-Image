import * as Notifications from 'expo-notifications';
import { Reminder } from '../services/reminderService';

/**
 * Notification Scheduler Utility
 * Handles local alarm scheduling for reminders using expo-notifications
 * 
 * Note: Remote push notifications are not supported in Expo Go.
 * Local notifications should still work in Expo Go.
 */

// Configure notification handler with error handling
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  // Silently fail if notifications aren't available (e.g., in Expo Go with limitations)
  console.warn('Notification handler setup failed (this is expected in Expo Go):', error);
}

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    // In Expo Go, notifications may not be fully supported
    console.warn('Notification permissions request failed (this is expected in Expo Go):', error);
    return false;
  }
};

/**
 * Schedule a local notification for a reminder
 */
export const scheduleReminderNotification = async (
  reminder: Reminder
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    if (!reminder.isActive) {
      return null;
    }

    // Calculate next trigger time
    const now = new Date();
    const timeParts = reminder.time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10) || 0;

    let triggerDate: Date | null = null;

    // Handle one-time reminders
    if (reminder.reminderMode === 'one-time' && reminder.date) {
      triggerDate = new Date(reminder.date);
      triggerDate.setHours(hours, minutes, 0, 0);
      // If one-time reminder date/time has passed, don't schedule
      if (triggerDate <= now) {
        return null;
      }
    } else if (reminder.reminderMode === 'recurring' && reminder.days && reminder.days.length > 0) {
      // Handle daily reminders
      if (reminder.days.includes('daily')) {
        triggerDate = new Date(now);
        triggerDate.setHours(hours, minutes, 0, 0);
        if (triggerDate <= now) {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }
      } else {
        // Handle specific days
        const dayMap: { [key: string]: number } = {
          mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
        };
        const currentDay = now.getDay();
        const reminderDays = reminder.days.map(d => dayMap[d.toLowerCase()]).filter(d => d !== undefined).sort((a, b) => a - b);

        if (reminderDays.length === 0) {
          return null;
        }

        // Find next day
        let nextDay = reminderDays.find(d => d > currentDay);
        if (!nextDay) {
          nextDay = reminderDays[0];
        }

        const daysUntilNext = nextDay > currentDay
          ? nextDay - currentDay
          : 7 - currentDay + nextDay;

        triggerDate = new Date(now);
        triggerDate.setDate(now.getDate() + daysUntilNext);
        triggerDate.setHours(hours, minutes, 0, 0);
      }
    } else {
      console.warn('Invalid reminder mode or days for scheduling:', reminder);
      return null;
    }

    if (!triggerDate) {
      return null;
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.customMessage || `Time for: ${reminder.title}`,
        sound: true,
        data: {
          reminderId: reminder.id,
          type: reminder.type,
          reminderMode: reminder.reminderMode,
        },
      },
      trigger: {
        type: 'date',
        date: triggerDate,
      } as Notifications.DateTriggerInput,
    });

    return notificationId;
  } catch (error: any) {
    // In Expo Go, local notifications may still work but remote ones won't
    if (error?.message?.includes('remote notifications') || error?.message?.includes('Expo Go')) {
      console.warn('Remote notifications not supported in Expo Go. Local notifications should still work.');
    } else {
      console.error('Error scheduling notification:', error);
    }
    return null;
  }
};

/**
 * Schedule recurring notifications for a reminder
 * For daily reminders, schedule for the next 7 days
 * For specific days, schedule for the next occurrence of each day
 * For one-time reminders, only schedule once
 */
export const scheduleRecurringReminderNotifications = async (
  reminder: Reminder
): Promise<string[]> => {
  const notificationIds: string[] = [];

  if (!reminder.isActive) {
    return notificationIds;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return notificationIds;
    }

    const now = new Date();
    const timeParts = reminder.time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10) || 0;

    // Handle one-time reminders
    if (reminder.reminderMode === 'one-time' && reminder.date) {
      const triggerDate = new Date(reminder.date);
      triggerDate.setHours(hours, minutes, 0, 0);
      
      if (triggerDate > now) { // Only schedule if in the future
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.customMessage || `Time for: ${reminder.title}`,
            sound: true,
            data: {
              reminderId: reminder.id,
              type: reminder.type,
              reminderMode: reminder.reminderMode,
            },
          },
          trigger: {
            type: 'date',
            date: triggerDate,
          } as Notifications.DateTriggerInput,
        });
        if (notificationId) {
          notificationIds.push(notificationId);
        }
      }
    } else if (reminder.reminderMode === 'recurring' && reminder.days && reminder.days.length > 0) {
      if (reminder.days.includes('daily')) {
        // Schedule for next 7 days
        for (let i = 0; i < 7; i++) {
          const triggerDate = new Date(now);
          triggerDate.setDate(now.getDate() + i);
          triggerDate.setHours(hours, minutes, 0, 0);
          
          // Skip if time has already passed today, schedule for next day
          if (i === 0 && triggerDate <= now) {
            triggerDate.setDate(triggerDate.getDate() + 1);
          }

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: reminder.title,
              body: reminder.customMessage || `Time for: ${reminder.title}`,
              sound: true,
              data: {
                reminderId: reminder.id,
                type: reminder.type,
                reminderMode: reminder.reminderMode,
              },
            },
            trigger: {
              type: 'date',
              date: triggerDate,
            } as Notifications.DateTriggerInput,
          });

          if (notificationId) {
            notificationIds.push(notificationId);
          }
        }
      } else {
        // Schedule for each day in the reminder - find next occurrence of each day
        const dayMap: { [key: string]: number } = {
          mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
        };
        const currentDay = now.getDay();
        const reminderDays = reminder.days
          .map(d => dayMap[d.toLowerCase()])
          .filter(d => d !== undefined)
          .sort((a, b) => a - b);

        for (const day of reminderDays) {
          let daysUntilNext = day - currentDay;
          if (daysUntilNext < 0) { // If day has passed this week, schedule for next week
            daysUntilNext += 7;
          } else if (daysUntilNext === 0) { // If today, check if time has passed
            const todayTriggerTime = new Date(now);
            todayTriggerTime.setHours(hours, minutes, 0, 0);
            if (todayTriggerTime <= now) {
              daysUntilNext += 7; // Schedule for next week if time passed today
            }
          }

          const triggerDate = new Date(now);
          triggerDate.setDate(now.getDate() + daysUntilNext);
          triggerDate.setHours(hours, minutes, 0, 0);

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: reminder.title,
              body: reminder.customMessage || `Time for: ${reminder.title}`,
              sound: true,
              data: {
                reminderId: reminder.id,
                type: reminder.type,
                reminderMode: reminder.reminderMode,
              },
            },
            trigger: {
              type: 'date',
              date: triggerDate,
            } as Notifications.DateTriggerInput,
          });

          if (notificationId) {
            notificationIds.push(notificationId);
          }
        }
      }
    }
  } catch (error: any) {
    // In Expo Go, local notifications may still work but remote ones won't
    if (error?.message?.includes('remote notifications') || error?.message?.includes('Expo Go')) {
      console.warn('Remote notifications not supported in Expo Go. Local notifications should still work.');
    } else {
      console.error('Error scheduling recurring notifications:', error);
    }
  }

  return notificationIds;
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Cancel all notifications for a reminder
 */
export const cancelReminderNotifications = async (reminderId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduledNotifications.filter(
      n => n.content.data?.reminderId === reminderId
    );

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling reminder notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Error canceling all notifications:', error);
  }
};



