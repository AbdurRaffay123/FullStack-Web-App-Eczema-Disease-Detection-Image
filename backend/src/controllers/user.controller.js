const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Get Current User Profile
 * GET /users/me
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await userService.getProfile(userId);

    return successResponse(res, 200, 'Profile retrieved successfully', { user: profile });
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Failed to retrieve profile');
  }
};

/**
 * Update User Profile
 * PUT /users/update-profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phoneNumber, dateOfBirth } = req.body;

    const updatedProfile = await userService.updateProfile(userId, {
      fullName,
      phoneNumber,
      dateOfBirth,
    });

    return successResponse(res, 200, 'Profile updated successfully', { user: updatedProfile });
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }

    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(res, 500, 'Failed to update profile');
  }
};

/**
 * Update User Password
 * PUT /users/update-password
 */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    await userService.updatePassword(userId, oldPassword, newPassword);

    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }

    if (error.message.includes('incorrect')) {
      return errorResponse(res, 401, error.message);
    }

    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(res, 500, 'Failed to update password');
  }
};

/**
 * Delete User Account
 * DELETE /users/delete-account
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    await userService.deleteAccount(userId);

    return successResponse(res, 200, 'Account deleted successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Failed to delete account');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
};

