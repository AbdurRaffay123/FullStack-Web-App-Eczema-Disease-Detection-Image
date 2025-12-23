const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { sendDoctorBookingEmail, sendUserConfirmationEmail } = require('../utils/email.util');
const logger = require('../utils/logger.util');

/**
 * Check if user profile is complete
 * Required fields: fullName (or name), email, phoneNumber, dateOfBirth
 */
const isProfileComplete = (user) => {
  const hasName = !!(user.fullName || user.name);
  const hasEmail = !!user.email;
  const hasPhone = !!user.phoneNumber;
  const hasDateOfBirth = !!user.dateOfBirth;

  return hasName && hasEmail && hasPhone && hasDateOfBirth;
};

/**
 * Get user profile for validation
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('name fullName email phoneNumber dateOfBirth');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Create Consultation Booking
 */
const createConsultation = async (userId, consultationData) => {
  // First, check if user profile is complete
  const user = await getUserProfile(userId);
  
  if (!isProfileComplete(user)) {
    throw new Error('Profile incomplete. Please complete your profile (Full Name, Email, Phone Number, and Date of Birth) before booking a consultation.');
  }

  // Extract user profile data
  const fullName = user.fullName || user.name;
  const email = user.email;
  const phoneNumber = user.phoneNumber;
  const dateOfBirth = user.dateOfBirth;

  // Extract booking data
  const { consultationType, preferredDate, preferredTime, reason, doctorName, doctorSpecialty, doctorEmail, doctorPhone, price } = consultationData;

  // Combine date and time
  const preferredDateTime = new Date(preferredDate);
  const [hours, minutes] = preferredTime.split(':');
  preferredDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  // Validate that combined date-time is in the future
  if (preferredDateTime <= new Date()) {
    throw new Error('Preferred date and time must be in the future');
  }

  const consultation = await Consultation.create({
    user: userId,
    fullName,
    email,
    phoneNumber,
    dateOfBirth,
    consultationType,
    preferredDate: preferredDateTime,
    preferredTime,
    reason: reason.trim(),
    doctorName: doctorName.trim(),
    doctorSpecialty: doctorSpecialty.trim(),
    doctorEmail: doctorEmail.trim().toLowerCase(),
    doctorPhone: doctorPhone ? doctorPhone.trim() : undefined,
    price: parseFloat(price),
    status: 'pending',
  });

  // Send emails asynchronously (don't block the response)
  // Booking is saved even if email fails
  Promise.all([
    sendDoctorBookingEmail(
      consultation, 
      doctorEmail.trim().toLowerCase(), 
      doctorName.trim(),
      doctorSpecialty.trim(),
      parseFloat(price)
    ).catch(err => {
      logger.error('Failed to send email to doctor', {
        consultationId: consultation._id,
        doctorEmail: doctorEmail.trim().toLowerCase(),
        error: err.message,
        stack: err.stack,
      });
    }),
    sendUserConfirmationEmail(
      consultation, 
      doctorName.trim(),
      doctorSpecialty.trim(),
      doctorEmail.trim().toLowerCase(), 
      doctorPhone ? doctorPhone.trim() : null,
      parseFloat(price)
    ).catch(err => {
      logger.error('Failed to send confirmation email to user', {
        consultationId: consultation._id,
        userEmail: email,
        error: err.message,
        stack: err.stack,
      });
    }),
  ]).then(results => {
    const [doctorEmailResult, userEmailResult] = results;
    if (doctorEmailResult && doctorEmailResult.success) {
      logger.info('Doctor booking email sent successfully', {
        consultationId: consultation._id,
        doctorEmail: doctorEmail.trim().toLowerCase(),
        messageId: doctorEmailResult.messageId,
      });
    }
    if (userEmailResult && userEmailResult.success) {
      logger.info('User confirmation email sent successfully', {
        consultationId: consultation._id,
        userEmail: email,
        messageId: userEmailResult.messageId,
      });
    }
  }).catch(err => {
    logger.error('Error sending emails', {
      consultationId: consultation._id,
      error: err.message,
      stack: err.stack,
    });
  });

  return consultation;
};

/**
 * Get All Consultations for User
 */
const getConsultations = async (userId) => {
  const consultations = await Consultation.find({ user: userId })
    .sort({ createdAt: -1 })
    .select('-__v');

  return consultations;
};

/**
 * Get Single Consultation by ID
 */
const getConsultationById = async (consultationId, userId) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    user: userId,
  });

  if (!consultation) {
    throw new Error('Consultation not found');
  }

  return consultation;
};

/**
 * Delete Consultation
 */
const deleteConsultation = async (consultationId, userId) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    user: userId,
  });

  if (!consultation) {
    throw new Error('Consultation not found');
  }

  // Only allow deletion if status is pending
  if (consultation.status !== 'pending') {
    throw new Error('Only pending consultations can be deleted');
  }

  await Consultation.findByIdAndDelete(consultationId);
  return consultation;
};

module.exports = {
  createConsultation,
  getConsultations,
  getConsultationById,
  deleteConsultation,
  isProfileComplete,
  getUserProfile,
  calculateAge,
};

