const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;

