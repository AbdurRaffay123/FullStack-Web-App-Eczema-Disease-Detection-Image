const { errorResponse } = require('../utils/response.util');

/**
 * Validate Create Reminder Request
 */
const validateCreateReminder = (req, res, next) => {
  const { title, type, time, reminderMode, days, date, customMessage, timezone } = req.body;

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return errorResponse(res, 400, 'Title is required and must be a non-empty string');
  }

  if (title.trim().length > 200) {
    return errorResponse(res, 400, 'Title cannot exceed 200 characters');
  }

  // Validate type
  const validTypes = ['medication', 'appointment', 'custom'];
  if (!type || !validTypes.includes(type)) {
    return errorResponse(res, 400, `Type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate reminderMode
  const validModes = ['recurring', 'one-time'];
  const mode = reminderMode || 'recurring'; // Default to recurring for backward compatibility
  if (!validModes.includes(mode)) {
    return errorResponse(res, 400, `Reminder mode must be one of: ${validModes.join(', ')}`);
  }

  // Validate time
  if (!time || typeof time !== 'string') {
    return errorResponse(res, 400, 'Time is required and must be a string');
  }

  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  const isoTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!timeRegex.test(time) && !isoTimeRegex.test(time)) {
    return errorResponse(res, 400, 'Time must be in HH:MM:SS format or ISO datetime format');
  }

  // Validate based on reminder mode
  if (mode === 'recurring') {
    // For recurring reminders, days are required
    if (!days || !Array.isArray(days) || days.length === 0) {
      return errorResponse(res, 400, 'Days is required for recurring reminders and must be a non-empty array');
    }

    const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'daily'];
    const invalidDays = days.filter(day => !validDays.includes(day.toLowerCase()));
    if (invalidDays.length > 0) {
      return errorResponse(res, 400, `Invalid days: ${invalidDays.join(', ')}. Valid days are: ${validDays.join(', ')}`);
    }
  } else if (mode === 'one-time') {
    // For one-time reminders, date is required
    if (!date) {
      return errorResponse(res, 400, 'Date is required for one-time reminders');
    }

    const reminderDate = new Date(date);
    if (isNaN(reminderDate.getTime())) {
      return errorResponse(res, 400, 'Date must be a valid date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reminderDate.setHours(0, 0, 0, 0);
    if (reminderDate < today) {
      return errorResponse(res, 400, 'Date must be today or in the future');
    }
  }

  // Validate customMessage
  if (customMessage && (typeof customMessage !== 'string' || customMessage.length > 500)) {
    return errorResponse(res, 400, 'Custom message must be a string and cannot exceed 500 characters');
  }

  // Validate timezone (optional)
  if (timezone && typeof timezone !== 'string') {
    return errorResponse(res, 400, 'Timezone must be a string');
  }

  next();
};

/**
 * Validate Update Reminder Request
 */
const validateUpdateReminder = (req, res, next) => {
  const { title, type, time, reminderMode, days, date, customMessage, isActive, timezone } = req.body;

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return errorResponse(res, 400, 'Title must be a non-empty string');
    }
    if (title.trim().length > 200) {
      return errorResponse(res, 400, 'Title cannot exceed 200 characters');
    }
  }

  // Validate type if provided
  if (type !== undefined) {
    const validTypes = ['medication', 'appointment', 'custom'];
    if (!validTypes.includes(type)) {
      return errorResponse(res, 400, `Type must be one of: ${validTypes.join(', ')}`);
    }
  }

  // Validate reminderMode if provided
  if (reminderMode !== undefined) {
    const validModes = ['recurring', 'one-time'];
    if (!validModes.includes(reminderMode)) {
      return errorResponse(res, 400, `Reminder mode must be one of: ${validModes.join(', ')}`);
    }
  }

  // Validate time if provided
  if (time !== undefined) {
    if (typeof time !== 'string') {
      return errorResponse(res, 400, 'Time must be a string');
    }
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    const isoTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!timeRegex.test(time) && !isoTimeRegex.test(time)) {
      return errorResponse(res, 400, 'Time must be in HH:MM:SS format or ISO datetime format');
    }
  }

  // Validate days if provided (for recurring reminders)
  if (days !== undefined) {
    if (!Array.isArray(days) || days.length === 0) {
      return errorResponse(res, 400, 'Days must be a non-empty array');
    }
    const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'daily'];
    const invalidDays = days.filter(day => !validDays.includes(day.toLowerCase()));
    if (invalidDays.length > 0) {
      return errorResponse(res, 400, `Invalid days: ${invalidDays.join(', ')}. Valid days are: ${validDays.join(', ')}`);
    }
  }

  // Validate date if provided (for one-time reminders)
  if (date !== undefined) {
    const reminderDate = new Date(date);
    if (isNaN(reminderDate.getTime())) {
      return errorResponse(res, 400, 'Date must be a valid date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reminderDate.setHours(0, 0, 0, 0);
    if (reminderDate < today) {
      return errorResponse(res, 400, 'Date must be today or in the future');
    }
  }

  // Validate customMessage if provided
  if (customMessage !== undefined) {
    if (typeof customMessage !== 'string' || customMessage.length > 500) {
      return errorResponse(res, 400, 'Custom message must be a string and cannot exceed 500 characters');
    }
  }

  // Validate isActive if provided
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return errorResponse(res, 400, 'isActive must be a boolean');
  }

  // Validate timezone if provided
  if (timezone !== undefined && typeof timezone !== 'string') {
    return errorResponse(res, 400, 'Timezone must be a string');
  }

  next();
};

module.exports = {
  validateCreateReminder,
  validateUpdateReminder,
};





