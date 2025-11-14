const symptomService = require('../services/symptom.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Create Symptom Log
 * POST /logs
 */
const createLog = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { itchinessLevel, affectedArea, possibleTriggers, additionalNotes } = req.body;

    const log = await symptomService.createLog(userId, {
      itchinessLevel,
      affectedArea,
      possibleTriggers,
      additionalNotes,
    });

    return successResponse(res, 201, 'Symptom log created successfully', { log });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Get All Logs for User
 * GET /logs
 */
const getLogs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logs = await symptomService.getLogs(userId);

    return successResponse(res, 200, 'Logs retrieved successfully', { logs });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Log by ID
 * GET /logs/:id
 */
const getLogById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const log = await symptomService.getLogById(id, userId);

    return successResponse(res, 200, 'Log retrieved successfully', { log });
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('permission')) {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

/**
 * Update Symptom Log
 * PUT /logs/:id
 */
const updateLog = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { itchinessLevel, affectedArea, possibleTriggers, additionalNotes } = req.body;

    const log = await symptomService.updateLog(id, userId, {
      itchinessLevel,
      affectedArea,
      possibleTriggers,
      additionalNotes,
    });

    return successResponse(res, 200, 'Log updated successfully', { log });
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('permission')) {
      return errorResponse(res, 403, error.message);
    }
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Delete Symptom Log
 * DELETE /logs/:id
 */
const deleteLog = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await symptomService.deleteLog(id, userId);

    return successResponse(res, 200, 'Log deleted successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('permission')) {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

module.exports = {
  createLog,
  getLogs,
  getLogById,
  updateLog,
  deleteLog,
};

