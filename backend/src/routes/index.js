const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const symptomRoutes = require('./symptom.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', symptomRoutes);

// Add more route modules here as they are created
// etc.

module.exports = router;

