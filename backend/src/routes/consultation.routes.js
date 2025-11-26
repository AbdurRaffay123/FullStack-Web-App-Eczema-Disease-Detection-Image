const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const { validateCreateConsultation } = require('../validators/consultation.validator');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/consultations
 * @desc    Create a consultation booking
 * @access  Private
 */
router.post('/', validateCreateConsultation, consultationController.createConsultation);

/**
 * @route   GET /api/consultations
 * @desc    Get all consultations for logged-in user
 * @access  Private
 */
router.get('/', consultationController.getConsultations);

/**
 * @route   GET /api/consultations/:id
 * @desc    Get single consultation by ID
 * @access  Private
 */
router.get('/:id', consultationController.getConsultationById);

/**
 * @route   DELETE /api/consultations/:id
 * @desc    Delete a consultation booking
 * @access  Private
 */
router.delete('/:id', consultationController.deleteConsultation);

module.exports = router;

