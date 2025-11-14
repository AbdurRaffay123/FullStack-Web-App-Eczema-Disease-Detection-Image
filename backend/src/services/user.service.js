const User = require('../models/User');

/**
 * Get User Profile by ID
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    name: user.name,
    fullName: user.fullName || user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    dateOfBirth: user.dateOfBirth || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Update User Profile
 */
const updateProfile = async (userId, updateData) => {
  const { fullName, phoneNumber, dateOfBirth } = updateData;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update fields if provided
  if (fullName !== undefined) {
    user.fullName = fullName.trim() || null;
    // Also update name field for backward compatibility
    if (fullName.trim()) {
      user.name = fullName.trim();
    }
  }

  if (phoneNumber !== undefined) {
    user.phoneNumber = phoneNumber.trim() || null;
  }

  if (dateOfBirth !== undefined) {
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  }

  await user.save();

  return {
    id: user._id,
    name: user.name,
    fullName: user.fullName || user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    dateOfBirth: user.dateOfBirth || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Update User Password
 */
const updatePassword = async (userId, oldPassword, newPassword) => {
  // Find user with password field
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const isOldPasswordValid = await user.comparePassword(oldPassword);
  if (!isOldPasswordValid) {
    throw new Error('Old password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: 'Password updated successfully',
  };
};

/**
 * Delete User Account
 */
const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Delete user from database
  await User.findByIdAndDelete(userId);

  return {
    success: true,
    message: 'Account deleted successfully',
  };
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
};

