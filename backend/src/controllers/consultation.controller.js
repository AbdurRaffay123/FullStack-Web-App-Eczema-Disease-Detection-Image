const consultationService = require('../services/consultation.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Create Consultation Booking
 * POST /api/consultations
 */
const createConsultation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { consultationType, preferredDate, preferredTime, reason, doctorName, doctorSpecialty, doctorEmail, doctorPhone, price } = req.body;

    const consultation = await consultationService.createConsultation(userId, {
      consultationType,
      preferredDate,
      preferredTime,
      reason,
      doctorName,
      doctorSpecialty,
      doctorEmail,
      doctorPhone,
      price,
    });

    return successResponse(res, 201, 'Consultation booking created successfully. Confirmation emails have been sent.', {
      consultation: {
        id: consultation._id,
        fullName: consultation.fullName,
        email: consultation.email,
        phoneNumber: consultation.phoneNumber,
        dateOfBirth: consultation.dateOfBirth,
        consultationType: consultation.consultationType,
        preferredDate: consultation.preferredDate,
        preferredTime: consultation.preferredTime,
        reason: consultation.reason,
        doctorName: consultation.doctorName,
        doctorSpecialty: consultation.doctorSpecialty,
        doctorEmail: consultation.doctorEmail,
        doctorPhone: consultation.doctorPhone,
        price: consultation.price,
        status: consultation.status,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
      },
    });
  } catch (error) {
    // Handle profile incomplete error specifically
    if (error.message.includes('Profile incomplete')) {
      return errorResponse(res, 400, error.message);
    }
    
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    
    next(error);
  }
};

/**
 * Get All Consultations for User
 * GET /api/consultations
 */
const getConsultations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const consultations = await consultationService.getConsultations(userId);

    const formattedConsultations = consultations.map(consultation => ({
      id: consultation._id,
      fullName: consultation.fullName,
      email: consultation.email,
      phoneNumber: consultation.phoneNumber,
      dateOfBirth: consultation.dateOfBirth,
      consultationType: consultation.consultationType,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      reason: consultation.reason,
      doctorName: consultation.doctorName,
      doctorSpecialty: consultation.doctorSpecialty,
      doctorEmail: consultation.doctorEmail,
      doctorPhone: consultation.doctorPhone,
      price: consultation.price,
      status: consultation.status,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    }));

    return successResponse(res, 200, 'Consultations retrieved successfully', {
      consultations: formattedConsultations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Consultation by ID
 * GET /api/consultations/:id
 */
const getConsultationById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const consultation = await consultationService.getConsultationById(id, userId);

    return successResponse(res, 200, 'Consultation retrieved successfully', {
      consultation: {
        id: consultation._id,
        fullName: consultation.fullName,
        email: consultation.email,
        phoneNumber: consultation.phoneNumber,
        dateOfBirth: consultation.dateOfBirth,
        consultationType: consultation.consultationType,
        preferredDate: consultation.preferredDate,
        preferredTime: consultation.preferredTime,
        reason: consultation.reason,
        doctorName: consultation.doctorName,
        doctorSpecialty: consultation.doctorSpecialty,
        doctorEmail: consultation.doctorEmail,
        doctorPhone: consultation.doctorPhone,
        price: consultation.price,
        status: consultation.status,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
      },
    });
  } catch (error) {
    if (error.message === 'Consultation not found') {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Delete Consultation
 * DELETE /api/consultations/:id
 */
const deleteConsultation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await consultationService.deleteConsultation(id, userId);

    return successResponse(res, 200, 'Consultation deleted successfully');
  } catch (error) {
    if (error.message === 'Consultation not found') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('Only pending consultations')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

module.exports = {
  createConsultation,
  getConsultations,
  getConsultationById,
  deleteConsultation,
};

