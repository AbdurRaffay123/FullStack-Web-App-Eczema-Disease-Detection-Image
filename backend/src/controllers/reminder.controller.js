const reminderService = require('../services/reminder.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Create Reminder
 * POST /api/reminders
 */
const createReminder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, type, time, reminderMode, days, date, customMessage, timezone } = req.body;

    const reminder = await reminderService.createReminder(userId, {
      title,
      type,
      time,
      reminderMode,
      days,
      date,
      customMessage,
      timezone,
    });

    return successResponse(res, 201, 'Reminder created successfully', {
      reminder: {
        id: reminder._id,
        title: reminder.title,
        type: reminder.type,
        time: reminder.time,
        reminderMode: reminder.reminderMode,
        days: reminder.days,
        date: reminder.date,
        customMessage: reminder.customMessage,
        isActive: reminder.isActive,
        timezone: reminder.timezone,
        nextTriggerTime: reminder.nextTriggerTime,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Get All Reminders for User
 * GET /api/reminders
 */
const getReminders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const reminders = await reminderService.getReminders(userId);

    const formattedReminders = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      type: reminder.type,
      time: reminder.time,
      reminderMode: reminder.reminderMode,
      days: reminder.days,
      date: reminder.date,
      customMessage: reminder.customMessage,
      isActive: reminder.isActive,
      timezone: reminder.timezone,
      nextTriggerTime: reminder.nextTriggerTime,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    }));

    return successResponse(res, 200, 'Reminders retrieved successfully', {
      reminders: formattedReminders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Reminder by ID
 * GET /api/reminders/:id
 */
const getReminderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const reminder = await reminderService.getReminderById(id, userId);

    return successResponse(res, 200, 'Reminder retrieved successfully', {
      reminder: {
        id: reminder._id,
        title: reminder.title,
        type: reminder.type,
        time: reminder.time,
        reminderMode: reminder.reminderMode,
        days: reminder.days,
        date: reminder.date,
        customMessage: reminder.customMessage,
        isActive: reminder.isActive,
        timezone: reminder.timezone,
        nextTriggerTime: reminder.nextTriggerTime,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
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
 * Update Reminder
 * PUT /api/reminders/:id
 */
const updateReminder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, type, time, reminderMode, days, date, customMessage, isActive, timezone } = req.body;

    const reminder = await reminderService.updateReminder(id, userId, {
      title,
      type,
      time,
      reminderMode,
      days,
      date,
      customMessage,
      isActive,
      timezone,
    });

    return successResponse(res, 200, 'Reminder updated successfully', {
      reminder: {
        id: reminder._id,
        title: reminder.title,
        type: reminder.type,
        time: reminder.time,
        reminderMode: reminder.reminderMode,
        days: reminder.days,
        date: reminder.date,
        customMessage: reminder.customMessage,
        isActive: reminder.isActive,
        timezone: reminder.timezone,
        nextTriggerTime: reminder.nextTriggerTime,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
      },
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return errorResponse(res, 404, error.message);
    }
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Delete Reminder
 * DELETE /api/reminders/:id
 */
const deleteReminder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await reminderService.deleteReminder(id, userId);

    return successResponse(res, 200, 'Reminder deleted successfully');
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
};





