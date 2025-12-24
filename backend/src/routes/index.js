const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const symptomRoutes = require('./symptom.routes');
const reminderRoutes = require('./reminder.routes');
const notificationRoutes = require('./notification.routes');
const consultationRoutes = require('./consultation.routes');
const imageRoutes = require('./image.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', symptomRoutes);
router.use('/reminders', reminderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/consultations', consultationRoutes);
router.use('/images', imageRoutes);

module.exports = router;

