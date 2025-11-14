/**
 * Standardized Response Utility
 * Provides consistent API response format
 */

/**
 * Success Response
 */
const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response
 */
const errorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};

