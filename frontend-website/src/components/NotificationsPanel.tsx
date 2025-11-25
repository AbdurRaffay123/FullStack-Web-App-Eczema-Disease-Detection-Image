import React, { useState, useEffect } from 'react';
import { reminderService, Notification } from '../services/reminderService';
import { useToast } from '../context/ToastContext';
import { Bell, X, Check, CheckCheck, Clock } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const result = await reminderService.getNotifications({ limit: 50 });
      setNotifications(result.notifications);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await reminderService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await reminderService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark all as read', 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A2E] border border-white border-opacity-20 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-[#6A9FB5]" />
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-3 py-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white text-sm rounded-lg transition-all"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5] mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
              <p className="text-gray-300">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.isRead
                      ? 'bg-white bg-opacity-5 border-white border-opacity-10'
                      : 'bg-[#6A9FB5] bg-opacity-20 border-[#6A9FB5] border-opacity-30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white">{notification.title}</h4>
                        {!notification.isRead && (
                          <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                        )}
                      </div>
                      {notification.message && (
                        <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(notification.triggeredAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-4 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;





