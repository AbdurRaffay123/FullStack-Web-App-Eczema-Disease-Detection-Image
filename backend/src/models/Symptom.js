const mongoose = require('mongoose');

/**
 * Symptom Log Model Schema
 * Stores user symptom logging entries
 */
const symptomLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster queries
    },
    itchinessLevel: {
      type: Number,
      required: [true, 'Itchiness level is required'],
      min: [1, 'Itchiness level must be at least 1'],
      max: [10, 'Itchiness level cannot exceed 10'],
    },
    affectedArea: {
      type: String,
      required: [true, 'Affected area is required'],
      trim: true,
      maxlength: [200, 'Affected area cannot exceed 200 characters'],
    },
    possibleTriggers: {
      type: String,
      trim: true,
      maxlength: [500, 'Possible triggers cannot exceed 500 characters'],
      default: '',
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient queries by user and date
symptomLogSchema.index({ userId: 1, createdAt: -1 });

const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);

module.exports = SymptomLog;

