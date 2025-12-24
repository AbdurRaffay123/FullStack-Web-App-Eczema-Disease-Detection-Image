const imageService = require('../services/image.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Upload and analyze image
 */
async function uploadAndAnalyzeImage(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'No image file provided');
    }

    const userId = req.user.userId;
    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Save image metadata
    const imageData = {
      filename: fileName,
      originalName: req.file.originalname,
      path: filePath,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    const savedImage = await imageService.uploadImage(imageData, userId);

    // Analyze image with AI service
    let analysisResult = null;
    try {
      analysisResult = await imageService.analyzeImageWithAI(filePath);
      
      // Update image with analysis result
      savedImage.analysisResult = analysisResult;
      await savedImage.save();
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      // Continue even if AI analysis fails
      analysisResult = {
        error: 'AI analysis temporarily unavailable',
        message: aiError.message
      };
    }

    return successResponse(res, HTTP_STATUS.CREATED, 'Image uploaded and analyzed successfully', {
      image: savedImage,
      analysis: analysisResult
    });
  } catch (error) {
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * Analyze existing image
 */
async function analyzeImage(req, res) {
  try {
    const { imageId } = req.params;
    const userId = req.user.userId;

    const Image = require('../models/Image');
    const image = await Image.findOne({ _id: imageId, userId });

    if (!image) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Image not found');
    }

    if (!image.path) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Image file path not found');
    }

    // Analyze image with AI service
    const analysisResult = await imageService.analyzeImageWithAI(image.path);

    // Update image with new analysis
    image.analysisResult = analysisResult;
    await image.save();

    return successResponse(res, HTTP_STATUS.OK, 'Image analyzed successfully', {
      image,
      analysis: analysisResult
    });
  } catch (error) {
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * Get user's images
 */
async function getUserImages(req, res) {
  try {
    const userId = req.user.userId;
    const images = await imageService.getUserImages(userId);

    return successResponse(res, HTTP_STATUS.OK, 'Images fetched successfully', images);
  } catch (error) {
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * Delete image
 */
async function deleteImage(req, res) {
  try {
    const { imageId } = req.params;
    const userId = req.user.userId;

    await imageService.deleteImage(imageId, userId);

    return successResponse(res, HTTP_STATUS.OK, 'Image deleted successfully');
  } catch (error) {
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
}

module.exports = {
  uploadAndAnalyzeImage,
  analyzeImage,
  getUserImages,
  deleteImage
};


