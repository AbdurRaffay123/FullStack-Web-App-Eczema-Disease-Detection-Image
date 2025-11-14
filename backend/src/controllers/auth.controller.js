const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * User Signup Controller
 * POST /auth/signup
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(
        res,
        400,
        'Name, email, and password are required'
      );
    }

    // Create user
    const result = await authService.signup({ name, email, password });

    return successResponse(
      res,
      201,
      'User registered successfully',
      result
    );
  } catch (error) {
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return errorResponse(res, 409, error.message);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(res, 500, 'Internal server error');
  }
};

/**
 * User Login Controller
 * POST /auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Authenticate user
    const result = await authService.login(email, password);

    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    // Handle invalid credentials
    if (error.message.includes('Invalid email or password')) {
      return errorResponse(res, 401, error.message);
    }

    return errorResponse(res, 500, 'Internal server error');
  }
};

/**
 * Get Current User Profile
 * GET /auth/profile
 * Protected route
 */
const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);

    return successResponse(res, 200, 'Profile retrieved successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Internal server error');
  }
};

module.exports = {
  signup,
  login,
  getProfile,
};

