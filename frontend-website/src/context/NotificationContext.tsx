import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { reminderService, Notification } from '../services/reminderService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const POLLING_INTERVAL = 10000; // 10 seconds for faster real-time notifications

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastChecked: Date | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Calculate unread count from notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  /**
   * Load all notifications from backend
   */
  const loadNotifications = useCallback(async (showUnreadOnly: boolean = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await reminderService.getNotifications({
        limit: 50,
        unreadOnly: showUnreadOnly,
      });
      
      // Merge with existing notifications, avoiding duplicates
      setNotifications(prev => {
        const existingMap = new Map(prev.map(n => [n.id, n]));
        
        // Update or add new notifications
        result.notifications.forEach(notification => {
          existingMap.set(notification.id, notification);
        });
        
        // Sort by triggeredAt (newest first)
        return Array.from(existingMap.values()).sort(
          (a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
        );
      });
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Check for new notifications (used for polling)
   */
  const checkNewNotifications = useCallback(async () => {
    if (!user) return;

    try {
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

        // Update state - merge with existing
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
  }, [user, showToast]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (id: string) => {
    try {
      await reminderService.markAsRead(id);
      
      // Update state immediately
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to mark notification as read', 'error');
      throw error;
    }
  }, [showToast]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await reminderService.markAllAsRead();
      
      // Update state immediately
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark all as read', 'error');
      throw error;
    }
  }, [showToast]);

  /**
   * Refresh notifications from backend
   */
  const refreshNotifications = useCallback(async () => {
    await loadNotifications(false);
  }, [loadNotifications]);

  // Set up polling when user is logged in
  useEffect(() => {
    if (!user) {
      // Clear notifications when user logs out
      setNotifications([]);
      processedIdsRef.current.clear();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial load of all notifications
    loadNotifications(false);

    // Set up polling for new notifications
    intervalRef.current = setInterval(() => {
      checkNewNotifications();
    }, POLLING_INTERVAL);

    // Also check when window gains focus
    const handleFocus = () => {
      checkNewNotifications();
    };
    window.addEventListener('focus', handleFocus);

    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkNewNotifications();
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
  }, [user, loadNotifications, checkNewNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        lastChecked,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

