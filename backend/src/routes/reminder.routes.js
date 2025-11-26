const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminder.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateCreateReminder, validateUpdateReminder } = require('../validators/reminder.validator');

/**
 * Reminder Routes
 * Base path: /api/reminders
 * All routes require authentication
 */

router.use(authenticate); // All routes require authentication

router.post('/', validateCreateReminder, reminderController.createReminder);
router.get('/', reminderController.getReminders);
router.get('/:id', reminderController.getReminderById);
router.put('/:id', validateUpdateReminder, reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;






