const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Cannot generate tokens.');
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * User Registration Service
 */
const signup = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate token
  const token = generateToken(user._id);

  // Return user without password
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * User Login Service
 */
const login = async (email, password) => {
  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id);

  // Return user without password
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Get User by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = {
  signup,
  login,
  getUserById,
  generateToken,
};

