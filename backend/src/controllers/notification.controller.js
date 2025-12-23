const reminderService = require('../services/reminder.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Get Notifications for User
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const result = await reminderService.getUserNotifications(userId, {
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      unreadOnly: unreadOnly === 'true',
    });

    const formattedNotifications = result.notifications.map(notification => ({
      id: notification._id,
      reminderId: notification.reminder?._id || notification.reminder,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      triggeredAt: notification.triggeredAt,
      createdAt: notification.createdAt,
    }));

    return successResponse(res, 200, 'Notifications retrieved successfully', {
      notifications: formattedNotifications,
      total: result.total,
      limit: result.limit,
      skip: result.skip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Notification as Read
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await reminderService.markNotificationAsRead(id, userId);

    return successResponse(res, 200, 'Notification marked as read', {
      notification: {
        id: notification._id,
        isRead: notification.isRead,
      },
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Mark All Notifications as Read
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await reminderService.markAllNotificationsAsRead(userId);

    return successResponse(res, 200, 'All notifications marked as read', {
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};








