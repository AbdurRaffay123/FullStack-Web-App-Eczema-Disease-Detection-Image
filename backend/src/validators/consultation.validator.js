const { errorResponse } = require('../utils/response.util');

/**
 * Validate Create Consultation Request
 */
const validateCreateConsultation = (req, res, next) => {
  const { consultationType, preferredDate, preferredTime, reason } = req.body;

  // Validate consultation type
  const validTypes = ['video', 'phone', 'chat'];
  if (!consultationType || !validTypes.includes(consultationType.toLowerCase())) {
    return errorResponse(res, 400, `Consultation type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate preferred date
  if (!preferredDate) {
    return errorResponse(res, 400, 'Preferred date is required');
  }

  const date = new Date(preferredDate);
  if (isNaN(date.getTime())) {
    return errorResponse(res, 400, 'Invalid date format. Please use YYYY-MM-DD format');
  }

  // Validate preferred time
  if (!preferredTime) {
    return errorResponse(res, 400, 'Preferred time is required');
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(preferredTime)) {
    return errorResponse(res, 400, 'Invalid time format. Please use HH:MM format (24-hour)');
  }

  // Validate reason
  if (!reason || typeof reason !== 'string') {
    return errorResponse(res, 400, 'Reason for consultation is required');
  }

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 10) {
    return errorResponse(res, 400, 'Reason must be at least 10 characters');
  }

  if (trimmedReason.length > 1000) {
    return errorResponse(res, 400, 'Reason cannot exceed 1000 characters');
  }

  // Validate doctor information
  const { doctorName, doctorSpecialty, doctorEmail, doctorPhone, price } = req.body;

  if (!doctorName || typeof doctorName !== 'string' || !doctorName.trim()) {
    return errorResponse(res, 400, 'Doctor name is required');
  }

  if (!doctorSpecialty || typeof doctorSpecialty !== 'string' || !doctorSpecialty.trim()) {
    return errorResponse(res, 400, 'Doctor specialty is required');
  }

  if (!doctorEmail || typeof doctorEmail !== 'string' || !doctorEmail.trim()) {
    return errorResponse(res, 400, 'Doctor email is required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(doctorEmail)) {
    return errorResponse(res, 400, 'Invalid doctor email format');
  }

  // Validate price
  if (price === undefined || price === null) {
    return errorResponse(res, 400, 'Consultation price is required');
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return errorResponse(res, 400, 'Price must be a valid positive number');
  }

  next();
};

module.exports = {
  validateCreateConsultation,
};

