const mongoose = require('mongoose');

/**
 * Notification Model Schema
 * Stores reminder notifications that have been triggered
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder',
      required: [true, 'Reminder is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['reminder', 'system', 'custom'],
      default: 'reminder',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, triggeredAt: -1 });
notificationSchema.index({ user: 1, triggeredAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;





