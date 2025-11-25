import { useEffect, useState, useRef } from 'react';
import { reminderService, Notification } from '../services/reminderService';
import { useToast } from '../context/ToastContext';

const POLLING_INTERVAL = 30000; // 30 seconds

export const useNotificationPolling = (enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { showToast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial load
    checkNotifications();

    // Set up polling
    intervalRef.current = setInterval(() => {
      checkNotifications();
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);

  const checkNotifications = async () => {
    try {
      const result = await reminderService.getNotifications({
        limit: 10,
        unreadOnly: true,
      });

      // Find new notifications (not processed before)
      const newNotifications = result.notifications.filter(
        n => !processedIdsRef.current.has(n.id) && !n.isRead
      );

      if (newNotifications.length > 0) {
        // Add to processed set
        newNotifications.forEach(n => processedIdsRef.current.add(n.id));

        // Show toast for each new notification
        newNotifications.forEach(notification => {
          showToast(notification.message || notification.title, 'info');
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
  };

  return {
    notifications,
    lastChecked,
    checkNotifications,
  };
};

