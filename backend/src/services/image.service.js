const Image = require('../models/Image');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Analyze image using AI microservice
 * @param {string} imagePath - Path to uploaded image
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeImageWithAI(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    // Call FastAPI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/analyze`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 30000, // 30 seconds timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    
    // If AI service is unavailable, return fallback response
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('AI service unavailable, using fallback');
      return {
        relevant: true,
        eczema_detected: false,
        confidence: 0.5,
        message: 'AI analysis service is currently unavailable. Please try again later.',
        disclaimer: 'This is an AI-based assessment and not a medical diagnosis.'
      };
    }
    
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Upload and save image
 * @param {Object} imageData - Image data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Saved image document
 */
async function uploadImage(imageData, userId) {
  try {
    const image = new Image({
      ...imageData,
      userId
    });

    await image.save();
    return image;
  } catch (error) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

/**
 * Get user's images
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of images
 */
async function getUserImages(userId) {
  try {
    const images = await Image.find({ userId }).sort({ createdAt: -1 });
    return images;
  } catch (error) {
    throw new Error(`Failed to fetch images: ${error.message}`);
  }
}

/**
 * Delete image
 * @param {string} imageId - Image ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted image
 */
async function deleteImage(imageId, userId) {
  try {
    const image = await Image.findOne({ _id: imageId, userId });
    
    if (!image) {
      throw new Error('Image not found');
    }

    // Delete file from filesystem
    if (image.path && fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    await Image.findByIdAndDelete(imageId);
    return image;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

module.exports = {
  analyzeImageWithAI,
  uploadImage,
  getUserImages,
  deleteImage
};





