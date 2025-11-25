import { useEffect, useState, useRef, useCallback } from 'react';
import { reminderService, Notification } from '../services/reminderService';
import { useToast } from '../context/ToastContext';

const POLLING_INTERVAL = 10000; // 10 seconds for faster real-time notifications

export const useNotificationPolling = (enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { showToast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());

  const checkNotifications = useCallback(async () => {
    try {
      // Get unread notifications from the last 5 minutes to catch any we might have missed
      const result = await reminderService.getNotifications({
        limit: 20,
        unreadOnly: true,
      });

      // Find new notifications (not processed before)
      const newNotifications = result.notifications.filter(
        n => !processedIdsRef.current.has(n.id) && !n.isRead
      );

      if (newNotifications.length > 0) {
        // Sort by triggeredAt to show oldest first
        newNotifications.sort((a, b) => 
          new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime()
        );

        // Add to processed set
        newNotifications.forEach(n => processedIdsRef.current.add(n.id));

        // Show toast for each new notification with a slight delay between them
        newNotifications.forEach((notification, index) => {
          setTimeout(() => {
            showToast(
              notification.message || notification.title, 
              'info',
              5000 // Show for 5 seconds
            );
          }, index * 500); // Stagger by 500ms
        });

        // Update state
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const toAdd = newNotifications.filter(n => !existingIds.has(n.id));
          return [...toAdd, ...prev].slice(0, 50); // Keep last 50
        });
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  }, [showToast]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial load immediately
    checkNotifications();

    // Set up polling
    intervalRef.current = setInterval(() => {
      checkNotifications();
    }, POLLING_INTERVAL);

    // Also check when window gains focus (user comes back to tab)
    const handleFocus = () => {
      checkNotifications();
    };
    window.addEventListener('focus', handleFocus);

    // Check when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, checkNotifications]);

  return {
    notifications,
    lastChecked,
    checkNotifications,
  };
};

