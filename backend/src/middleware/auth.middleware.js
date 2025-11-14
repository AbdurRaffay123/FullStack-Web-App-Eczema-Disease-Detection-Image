const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response.util');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return errorResponse(res, 401, 'No token provided');
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      return errorResponse(res, 500, 'JWT_SECRET is not configured');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired');
    }

    return errorResponse(res, 500, 'Authentication failed');
  }
};

module.exports = {
  authenticate,
};

