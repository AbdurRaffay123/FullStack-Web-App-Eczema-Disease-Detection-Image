/**
 * User Validation Schemas
 * Validates user profile and password update requests
 */

const validateUpdateProfile = (req, res, next) => {
  const { fullName, phoneNumber, dateOfBirth } = req.body;
  const errors = [];

  // Validate fullName
  if (fullName !== undefined) {
    if (typeof fullName !== 'string') {
      errors.push('Full name must be a string');
    } else if (fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    } else if (fullName.trim().length > 100) {
      errors.push('Full name cannot exceed 100 characters');
    }
  }

  // Validate phoneNumber
  if (phoneNumber !== undefined) {
    if (typeof phoneNumber !== 'string') {
      errors.push('Phone number must be a string');
    } else if (phoneNumber.trim() !== '') {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        errors.push('Please provide a valid phone number');
      }
    }
  }

  // Validate dateOfBirth
  if (dateOfBirth !== undefined) {
    if (dateOfBirth !== null && dateOfBirth !== '') {
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.push('Date of birth must be a valid date');
      } else if (date > new Date()) {
        errors.push('Date of birth cannot be in the future');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
    });
  }

  next();
};

const validateUpdatePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const errors = [];

  if (!oldPassword) {
    errors.push('Old password is required');
  }

  if (!newPassword) {
    errors.push('New password is required');
  } else if (newPassword.length < 6) {
    errors.push('New password must be at least 6 characters');
  }

  if (oldPassword && newPassword && oldPassword === newPassword) {
    errors.push('New password must be different from old password');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
    });
  }

  next();
};

module.exports = {
  validateUpdateProfile,
  validateUpdatePassword,
};

