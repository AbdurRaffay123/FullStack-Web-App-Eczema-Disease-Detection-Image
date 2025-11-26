import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Alert } from 'react-native';
import { reminderService, Notification } from '../services/reminderService';
import { authService } from '../services/authService';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Calculate unread count from notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  /**
   * Load all notifications from backend
   */
  const loadNotifications = useCallback(async (showLoading: boolean = true) => {
    const authenticated = await checkAuth();
    if (!authenticated) return;

    try {
      if (showLoading) setIsLoading(true);
      const result = await reminderService.getNotifications({
        limit: 50,
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
      if (showLoading) setIsLoading(false);
    }
  }, [checkAuth]);

  /**
   * Check for new notifications (used for polling)
   */
  const checkNewNotifications = useCallback(async () => {
    const authenticated = await checkAuth();
    if (!authenticated) return;

    // Only check if app is in foreground
    if (appStateRef.current !== 'active') {
      return;
    }

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

        // Show alert for each new notification with a slight delay between them
        newNotifications.forEach((notification, index) => {
          setTimeout(() => {
            Alert.alert(
              notification.title,
              notification.message || `Reminder: ${notification.title}`,
              [{ text: 'OK' }],
              { cancelable: true }
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
  }, [checkAuth]);

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
      Alert.alert('Error', error.message || 'Failed to mark notification as read');
      throw error;
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await reminderService.markAllAsRead();
      
      // Update state immediately
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark all as read');
      throw error;
    }
  }, []);

  /**
   * Refresh notifications from backend
   */
  const refreshNotifications = useCallback(async () => {
    await loadNotifications(false);
  }, [loadNotifications]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground, check for new notifications immediately
        checkNewNotifications();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkNewNotifications]);

  // Set up polling when user is authenticated
  useEffect(() => {
    const setupPolling = async () => {
      const authenticated = await checkAuth();
      
      if (!authenticated) {
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
      await loadNotifications(false);

      // Set up polling for new notifications
      intervalRef.current = setInterval(() => {
        checkNewNotifications();
      }, POLLING_INTERVAL);
    };

    setupPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkAuth, loadNotifications, checkNewNotifications]);

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

