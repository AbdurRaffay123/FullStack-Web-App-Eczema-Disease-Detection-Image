const SymptomLog = require('../models/Symptom');

/**
 * Create Symptom Log
 */
const createLog = async (userId, logData) => {
  const { itchinessLevel, affectedArea, possibleTriggers, additionalNotes } = logData;

  const symptomLog = await SymptomLog.create({
    userId,
    itchinessLevel,
    affectedArea: affectedArea.trim(),
    possibleTriggers: possibleTriggers ? possibleTriggers.trim() : '',
    additionalNotes: additionalNotes ? additionalNotes.trim() : '',
  });

  return {
    id: symptomLog._id,
    userId: symptomLog.userId,
    itchinessLevel: symptomLog.itchinessLevel,
    affectedArea: symptomLog.affectedArea,
    possibleTriggers: symptomLog.possibleTriggers,
    additionalNotes: symptomLog.additionalNotes,
    createdAt: symptomLog.createdAt,
    updatedAt: symptomLog.updatedAt,
  };
};

/**
 * Get All Logs for User
 */
const getLogs = async (userId) => {
  const logs = await SymptomLog.find({ userId })
    .sort({ createdAt: -1 }) // Most recent first
    .select('-__v');

  return logs.map(log => ({
    id: log._id,
    userId: log.userId,
    itchinessLevel: log.itchinessLevel,
    affectedArea: log.affectedArea,
    possibleTriggers: log.possibleTriggers,
    additionalNotes: log.additionalNotes,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }));
};

/**
 * Get Single Log by ID
 */
const getLogById = async (logId, userId) => {
  const log = await SymptomLog.findById(logId);

  if (!log) {
    throw new Error('Symptom log not found');
  }

  // Check ownership
  if (log.userId.toString() !== userId.toString()) {
    throw new Error('You do not have permission to access this log');
  }

  return {
    id: log._id,
    userId: log.userId,
    itchinessLevel: log.itchinessLevel,
    affectedArea: log.affectedArea,
    possibleTriggers: log.possibleTriggers,
    additionalNotes: log.additionalNotes,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
};

/**
 * Update Symptom Log
 */
const updateLog = async (logId, userId, updateData) => {
  const log = await SymptomLog.findById(logId);

  if (!log) {
    throw new Error('Symptom log not found');
  }

  // Check ownership
  if (log.userId.toString() !== userId.toString()) {
    throw new Error('You do not have permission to update this log');
  }

  // Update fields if provided
  if (updateData.itchinessLevel !== undefined) {
    log.itchinessLevel = updateData.itchinessLevel;
  }

  if (updateData.affectedArea !== undefined) {
    log.affectedArea = updateData.affectedArea.trim();
  }

  if (updateData.possibleTriggers !== undefined) {
    log.possibleTriggers = updateData.possibleTriggers.trim();
  }

  if (updateData.additionalNotes !== undefined) {
    log.additionalNotes = updateData.additionalNotes.trim();
  }

  await log.save();

  return {
    id: log._id,
    userId: log.userId,
    itchinessLevel: log.itchinessLevel,
    affectedArea: log.affectedArea,
    possibleTriggers: log.possibleTriggers,
    additionalNotes: log.additionalNotes,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
};

/**
 * Delete Symptom Log
 */
const deleteLog = async (logId, userId) => {
  const log = await SymptomLog.findById(logId);

  if (!log) {
    throw new Error('Symptom log not found');
  }

  // Check ownership
  if (log.userId.toString() !== userId.toString()) {
    throw new Error('You do not have permission to delete this log');
  }

  await SymptomLog.findByIdAndDelete(logId);

  return {
    success: true,
    message: 'Symptom log deleted successfully',
  };
};

module.exports = {
  createLog,
  getLogs,
  getLogById,
  updateLog,
  deleteLog,
};

