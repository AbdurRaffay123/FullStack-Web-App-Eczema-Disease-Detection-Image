const mongoose = require('mongoose');

/**
 * Reminder Model Schema
 * Stores user reminders for medications, appointments, and custom events
 */
const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['medication', 'appointment', 'custom'],
      default: 'custom',
    },
    time: {
      type: String, // ISO time string (e.g., "14:30:00" or full ISO datetime)
      required: [true, 'Time is required'],
      validate: {
        validator: function(v) {
          // Validate ISO time format (HH:MM:SS or HH:MM)
          return /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(v) || 
                 /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(v);
        },
        message: 'Time must be in HH:MM:SS format or ISO datetime format',
      },
    },
    reminderMode: {
      type: String,
      enum: ['recurring', 'one-time'],
      default: 'recurring',
      required: true,
    },
    days: {
      type: [String],
      required: function() {
        return this.reminderMode === 'recurring';
      },
      validate: {
        validator: function(v) {
          if (this.reminderMode === 'one-time') {
            return true; // Days not required for one-time reminders
          }
          const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'daily'];
          return v && v.length > 0 && v.every(day => validDays.includes(day.toLowerCase()));
        },
        message: 'Days must be an array of valid weekdays (mon, tue, wed, thu, fri, sat, sun) or "daily"',
      },
    },
    date: {
      type: Date,
      required: function() {
        return this.reminderMode === 'one-time';
      },
      validate: {
        validator: function(v) {
          if (this.reminderMode === 'recurring') {
            return true; // Date not required for recurring reminders
          }
          if (!v) return false;
          const reminderDate = new Date(v);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate >= today; // Date should be today or in the future
        },
        message: 'Date must be today or in the future for one-time reminders',
      },
    },
    customMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Custom message cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true,
    },
    nextTriggerTime: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient queries by user and active status
reminderSchema.index({ user: 1, isActive: 1 });
reminderSchema.index({ user: 1, nextTriggerTime: 1 });

/**
 * Calculate next trigger time based on reminder mode, time, days, or date
 */
reminderSchema.methods.calculateNextTrigger = function() {
  const now = new Date();
  const timeParts = this.time.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10) || 0;

  // For one-time reminders, use the specific date
  if (this.reminderMode === 'one-time' && this.date) {
    const triggerDate = new Date(this.date);
    triggerDate.setHours(hours, minutes, 0, 0);
    
    // If the date has passed, return null (reminder won't trigger)
    if (triggerDate < now) {
      return null;
    }
    
    return triggerDate;
  }

  // For recurring reminders, use days logic
  if (this.reminderMode === 'recurring' && this.days && this.days.length > 0) {
    // If days includes 'daily', trigger every day
    if (this.days.includes('daily')) {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }

    // Find next matching day
    const dayMap = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
    const currentDay = now.getDay();
    const reminderDays = this.days.map(d => dayMap[d.toLowerCase()]).filter(d => d !== undefined).sort((a, b) => a - b);

    if (reminderDays.length === 0) {
      return null;
    }

    // Find next day in this week
    for (const day of reminderDays) {
      if (day > currentDay) {
        const next = new Date(now);
        next.setDate(now.getDate() + (day - currentDay));
        next.setHours(hours, minutes, 0, 0);
        return next;
      }
    }

    // If no day found this week, use first day of next week
    const next = new Date(now);
    const daysUntilNext = 7 - currentDay + reminderDays[0];
    next.setDate(now.getDate() + daysUntilNext);
    next.setHours(hours, minutes, 0, 0);
    return next;
  }

  return null;
};

/**
 * Pre-save hook to calculate next trigger time
 */
reminderSchema.pre('save', function(next) {
  if (this.isModified('time') || this.isModified('days') || this.isModified('date') || 
      this.isModified('reminderMode') || this.isModified('isActive')) {
    if (this.isActive) {
      this.nextTriggerTime = this.calculateNextTrigger();
    } else {
      this.nextTriggerTime = null;
    }
  }
  next();
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;





