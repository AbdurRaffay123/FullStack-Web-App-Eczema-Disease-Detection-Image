const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

/**
 * @route   POST /images/upload
 * @desc    Upload and analyze image
 * @access  Private
 */
router.post('/upload', authenticate, upload.single('image'), imageController.uploadAndAnalyzeImage);

/**
 * @route   POST /images/analyze/:imageId
 * @desc    Analyze existing image
 * @access  Private
 */
router.post('/analyze/:imageId', authenticate, imageController.analyzeImage);

/**
 * @route   GET /images
 * @desc    Get user's images
 * @access  Private
 */
router.get('/', authenticate, imageController.getUserImages);

/**
 * @route   DELETE /images/:imageId
 * @desc    Delete image
 * @access  Private
 */
router.delete('/:imageId', authenticate, imageController.deleteImage);

module.exports = router;


