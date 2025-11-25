const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');

/**
 * Create Reminder
 */
const createReminder = async (userId, reminderData) => {
  const { title, type, time, reminderMode, days, date, customMessage, timezone } = reminderData;

  const reminderDataToSave = {
    user: userId,
    title: title.trim(),
    type,
    time,
    reminderMode: reminderMode || 'recurring',
    customMessage: customMessage ? customMessage.trim() : '',
    timezone: timezone || 'UTC',
    isActive: true,
  };

  // Add days for recurring reminders
  if (reminderMode === 'recurring' || !reminderMode) {
    if (days && Array.isArray(days) && days.length > 0) {
      reminderDataToSave.days = days.map(d => d.toLowerCase());
    }
  }

  // Add date for one-time reminders
  if (reminderMode === 'one-time' && date) {
    reminderDataToSave.date = new Date(date);
  }

  const reminder = await Reminder.create(reminderDataToSave);

  return reminder;
};

/**
 * Get All Reminders for User
 */
const getReminders = async (userId) => {
  const reminders = await Reminder.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  return reminders;
};

/**
 * Get Single Reminder by ID
 */
const getReminderById = async (reminderId, userId) => {
  const reminder = await Reminder.findOne({ _id: reminderId, user: userId });

  if (!reminder) {
    throw new Error('Reminder not found or you do not have permission to access it');
  }

  return reminder;
};

/**
 * Update Reminder
 */
const updateReminder = async (reminderId, userId, updateData) => {
  const reminder = await Reminder.findOne({ _id: reminderId, user: userId });

  if (!reminder) {
    throw new Error('Reminder not found or you do not have permission to update it');
  }

  // Update fields
  if (updateData.title !== undefined) {
    reminder.title = updateData.title.trim();
  }
  if (updateData.type !== undefined) {
    reminder.type = updateData.type;
  }
  if (updateData.time !== undefined) {
    reminder.time = updateData.time;
  }
  if (updateData.reminderMode !== undefined) {
    reminder.reminderMode = updateData.reminderMode;
    // Clear opposite field when mode changes
    if (updateData.reminderMode === 'one-time') {
      reminder.days = undefined;
    } else if (updateData.reminderMode === 'recurring') {
      reminder.date = undefined;
    }
  }
  if (updateData.days !== undefined) {
    if (Array.isArray(updateData.days) && updateData.days.length > 0) {
      reminder.days = updateData.days.map(d => d.toLowerCase());
    } else {
      reminder.days = undefined;
    }
  }
  if (updateData.date !== undefined) {
    reminder.date = new Date(updateData.date);
  }
  if (updateData.customMessage !== undefined) {
    reminder.customMessage = updateData.customMessage.trim();
  }
  if (updateData.isActive !== undefined) {
    reminder.isActive = updateData.isActive;
  }
  if (updateData.timezone !== undefined) {
    reminder.timezone = updateData.timezone;
  }

  await reminder.save();

  return reminder;
};

/**
 * Delete Reminder
 */
const deleteReminder = async (reminderId, userId) => {
  const reminder = await Reminder.findOneAndDelete({ _id: reminderId, user: userId });

  if (!reminder) {
    throw new Error('Reminder not found or you do not have permission to delete it');
  }

  return reminder;
};

/**
 * Get Active Reminders Due for Triggering
 */
const getDueReminders = async () => {
  const now = new Date();
  
  const reminders = await Reminder.find({
    isActive: true,
    nextTriggerTime: { $lte: now },
  }).populate('user', 'email name');

  return reminders;
};

/**
 * Create Notification for Triggered Reminder
 */
const createNotification = async (reminder) => {
  const message = reminder.customMessage || `Reminder: ${reminder.title}`;

  const notification = await Notification.create({
    user: reminder.user._id || reminder.user,
    reminder: reminder._id,
    title: reminder.title,
    message: message,
    type: 'reminder',
    isRead: false,
    triggeredAt: new Date(),
  });

  return notification;
};

/**
 * Update Reminder's Next Trigger Time
 */
const updateNextTriggerTime = async (reminderId) => {
  const reminder = await Reminder.findById(reminderId);
  if (!reminder || !reminder.isActive) {
    return;
  }

  // For one-time reminders, mark as inactive after triggering
  if (reminder.reminderMode === 'one-time') {
    reminder.isActive = false;
    reminder.nextTriggerTime = null;
  } else {
    // For recurring reminders, calculate next trigger time
    reminder.nextTriggerTime = reminder.calculateNextTrigger();
  }

  await reminder.save();

  return reminder;
};

/**
 * Get Notifications for User
 */
const getUserNotifications = async (userId, options = {}) => {
  const { limit = 50, skip = 0, unreadOnly = false } = options;

  const query = { user: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .populate('reminder', 'title type')
    .sort({ triggeredAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  const total = await Notification.countDocuments(query);

  return {
    notifications,
    total,
    limit,
    skip,
  };
};

/**
 * Mark Notification as Read
 */
const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found or you do not have permission to update it');
  }

  return notification;
};

/**
 * Mark All Notifications as Read
 */
const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  return result;
};

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  getDueReminders,
  createNotification,
  updateNextTriggerTime,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};





