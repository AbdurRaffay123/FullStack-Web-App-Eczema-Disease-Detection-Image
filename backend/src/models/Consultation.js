const mongoose = require('mongoose');

/**
 * Consultation Model Schema
 * Stores doctor consultation bookings
 */
const consultationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    // User Profile Data (auto-filled from user profile)
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    // Booking Data
    consultationType: {
      type: String,
      required: [true, 'Consultation type is required'],
      enum: ['video', 'phone', 'chat'],
      lowercase: true,
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
      validate: {
        validator: function(value) {
          // Preferred date should be in the future
          return value > new Date();
        },
        message: 'Preferred date must be in the future',
      },
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for consultation is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    // Doctor Information
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    doctorEmail: {
      type: String,
      required: [true, 'Doctor email is required'],
      lowercase: true,
      trim: true,
    },
    doctorPhone: {
      type: String,
      trim: true,
    },
    // System Fields
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient queries
consultationSchema.index({ user: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;

