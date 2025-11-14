const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateUpdateProfile, validateUpdatePassword } = require('../validators/user.validator');

/**
 * User Routes
 * Base path: /api/users
 * All routes require authentication
 */

router.use(authenticate); // All routes require authentication

router.get('/me', userController.getProfile);
router.put('/update-profile', validateUpdateProfile, userController.updateProfile);
router.put('/update-password', validateUpdatePassword, userController.updatePassword);
router.delete('/delete-account', userController.deleteAccount);

module.exports = router;

