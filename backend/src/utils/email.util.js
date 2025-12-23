const nodemailer = require('nodemailer');
const appConfig = require('../config/appConfig');

/**
 * Create Email Transporter
 */
const createTransporter = () => {
  // Validate email configuration
  if (!appConfig.EMAIL_HOST || !appConfig.EMAIL_USER || !appConfig.EMAIL_PASS) {
    throw new Error('Email configuration is incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env file');
  }

  // For Gmail, use service configuration
  if (appConfig.EMAIL_HOST.includes('gmail.com') || appConfig.EMAIL_USER.includes('@gmail.com')) {
    const config = {
      service: 'gmail',
      auth: {
        user: appConfig.EMAIL_USER,
        pass: appConfig.EMAIL_PASS.trim(), // Remove any whitespace
      },
    };
    
    // Verify App Password format (Gmail App Passwords are 16 characters)
    if (appConfig.EMAIL_PASS.trim().length !== 16 && appConfig.EMAIL_PASS.trim().length !== 20) {
      console.warn('⚠️  Warning: Gmail App Password should be 16 characters. Make sure you\'re using an App Password, not your regular password.');
    }
    
    return nodemailer.createTransport(config);
  }

  // For other email providers
  const config = {
    host: appConfig.EMAIL_HOST,
    port: appConfig.EMAIL_PORT,
    secure: appConfig.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: appConfig.EMAIL_USER,
      pass: appConfig.EMAIL_PASS.trim(),
    },
  };

  return nodemailer.createTransport(config);
};

/**
 * Send Email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Eczema Care App" <${appConfig.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      throw new Error(`Email authentication failed. Please check:
1. Your email and password are correct
2. If using Gmail, you need an "App Password" (not your regular password)
3. Enable 2-Step Verification and generate an App Password at: https://myaccount.google.com/apppasswords
4. Make sure you're using the App Password in EMAIL_PASS, not your regular password`);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Format Date for Email
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format Time for Email
 */
const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Calculate Age from Date of Birth
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
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
 * Send Consultation Booking Email to Doctor
 */
const sendDoctorBookingEmail = async (consultation, doctorEmail, doctorName, doctorSpecialty, price) => {
  const consultationTypeMap = {
    video: 'Video Consultation',
    phone: 'Phone Consultation',
    chat: 'Text/Chat Consultation',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6A9FB5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .info-section { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #6A9FB5; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .reason-box { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Consultation Booking</h1>
        </div>
        <div class="content">
          <p>Dear ${doctorName},</p>
          <p>You have received a new consultation booking request. Please find the details below:</p>
          
          <div class="info-section">
            <h2 style="color: #6A9FB5; margin-top: 0;">Patient Information</h2>
            <div class="info-row">
              <span class="label">Full Name:</span>
              <span class="value">${consultation.fullName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${consultation.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone Number:</span>
              <span class="value">${consultation.phoneNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Date of Birth:</span>
              <span class="value">${formatDate(consultation.dateOfBirth)}</span>
            </div>
            <div class="info-row">
              <span class="label">Age:</span>
              <span class="value">${calculateAge(consultation.dateOfBirth)} years</span>
            </div>
          </div>

          <div class="info-section">
            <h2 style="color: #6A9FB5; margin-top: 0;">Consultation Details</h2>
            <div class="info-row">
              <span class="label">Consultation Type:</span>
              <span class="value">${consultationTypeMap[consultation.consultationType] || consultation.consultationType}</span>
            </div>
            <div class="info-row">
              <span class="label">Preferred Date:</span>
              <span class="value">${formatDate(consultation.preferredDate)}</span>
            </div>
            <div class="info-row">
              <span class="label">Preferred Time:</span>
              <span class="value">${formatTime(consultation.preferredTime)}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value" style="text-transform: capitalize; font-weight: bold;">${consultation.status}</span>
            </div>
          </div>

          <div class="reason-box">
            <h3 style="margin-top: 0; color: #6A9FB5;">Reason for Consultation</h3>
            <p style="white-space: pre-wrap;">${consultation.reason}</p>
          </div>

          <p style="margin-top: 20px;">
            <strong>Booking Reference ID:</strong> ${consultation._id}
          </p>
          <p style="margin-top: 20px;">
            Please review this booking and confirm with the patient at your earliest convenience.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated email from Eczema Care Application.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Consultation Booking

Dear ${doctorName},

You have received a new consultation booking request.

PATIENT INFORMATION:
- Full Name: ${consultation.fullName}
- Email: ${consultation.email}
- Phone Number: ${consultation.phoneNumber}
- Date of Birth: ${formatDate(consultation.dateOfBirth)}
- Age: ${calculateAge(consultation.dateOfBirth)} years

CONSULTATION DETAILS:
- Consultation Type: ${consultationTypeMap[consultation.consultationType] || consultation.consultationType}
- Preferred Date: ${formatDate(consultation.preferredDate)}
- Preferred Time: ${formatTime(consultation.preferredTime)}
- Price: $${price.toFixed(2)}
- Status: ${consultation.status}

REASON FOR CONSULTATION:
${consultation.reason}

Booking Reference ID: ${consultation._id}

Please review this booking and confirm with the patient at your earliest convenience.

---
This is an automated email from Eczema Care Application.
Please do not reply to this email.
  `;

  return sendEmail({
    to: doctorEmail,
    subject: `New Consultation Booking - ${consultation.fullName}`,
    html,
    text,
  });
};

/**
 * Send Consultation Confirmation Email to User
 */
const sendUserConfirmationEmail = async (consultation, doctorName, doctorSpecialty, doctorEmail, doctorPhone, price) => {
  const consultationTypeMap = {
    video: 'Video Consultation',
    phone: 'Phone Consultation',
    chat: 'Text/Chat Consultation',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28A745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .info-section { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #28A745; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .success-box { background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28A745; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Consultation Booking Confirmed</h1>
        </div>
        <div class="content">
          <p>Dear ${consultation.fullName},</p>
          
          <div class="success-box">
            <h2 style="margin-top: 0; color: #28A745;">Your consultation booking has been confirmed!</h2>
            <p>We have received your booking request and will contact you soon.</p>
          </div>

          <div class="info-section">
            <h2 style="color: #6A9FB5; margin-top: 0;">Doctor Information</h2>
            <div class="info-row">
              <span class="label">Doctor Name:</span>
              <span class="value">${doctorName}</span>
            </div>
            <div class="info-row">
              <span class="label">Specialty:</span>
              <span class="value">${doctorSpecialty}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${doctorEmail}</span>
            </div>
            ${doctorPhone ? `<div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${doctorPhone}</span>
            </div>` : ''}
          </div>

          <div class="info-section">
            <h2 style="color: #6A9FB5; margin-top: 0;">Consultation Details</h2>
            <div class="info-row">
              <span class="label">Consultation Type:</span>
              <span class="value">${consultationTypeMap[consultation.consultationType] || consultation.consultationType}</span>
            </div>
            <div class="info-row">
              <span class="label">Preferred Date:</span>
              <span class="value">${formatDate(consultation.preferredDate)}</span>
            </div>
            <div class="info-row">
              <span class="label">Preferred Time:</span>
              <span class="value">${formatTime(consultation.preferredTime)}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value" style="text-transform: capitalize; font-weight: bold;">${consultation.status}</span>
            </div>
          </div>

          <div class="info-section">
            <h2 style="color: #6A9FB5; margin-top: 0;">Your Information</h2>
            <div class="info-row">
              <span class="label">Full Name:</span>
              <span class="value">${consultation.fullName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${consultation.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone Number:</span>
              <span class="value">${consultation.phoneNumber}</span>
            </div>
          </div>

          <p style="margin-top: 20px;">
            <strong>Booking Reference ID:</strong> ${consultation._id}
          </p>
          <p style="margin-top: 20px;">
            <strong>Next Steps:</strong>
          </p>
          <ul>
            <li>Please wait for confirmation from the doctor</li>
            <li>You will receive updates about your consultation via email</li>
            <li>If you need to cancel or reschedule, please contact us</li>
          </ul>
        </div>
        <div class="footer">
          <p>This is an automated email from Eczema Care Application.</p>
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Consultation Booking Confirmed

Dear ${consultation.fullName},

Your consultation booking has been confirmed!

DOCTOR INFORMATION:
- Doctor Name: ${doctorName}
- Specialty: ${doctorSpecialty}
- Email: ${doctorEmail}
${doctorPhone ? `- Phone: ${doctorPhone}` : ''}

CONSULTATION DETAILS:
- Consultation Type: ${consultationTypeMap[consultation.consultationType] || consultation.consultationType}
- Preferred Date: ${formatDate(consultation.preferredDate)}
- Preferred Time: ${formatTime(consultation.preferredTime)}
- Price: $${price.toFixed(2)}
- Status: ${consultation.status}

YOUR INFORMATION:
- Full Name: ${consultation.fullName}
- Email: ${consultation.email}
- Phone Number: ${consultation.phoneNumber}

Booking Reference ID: ${consultation._id}

NEXT STEPS:
- Please wait for confirmation from the doctor
- You will receive updates about your consultation via email
- If you need to cancel or reschedule, please contact us

---
This is an automated email from Eczema Care Application.
If you have any questions, please contact us.
  `;

  return sendEmail({
    to: consultation.email,
    subject: `Consultation Booking Confirmed - ${doctorName}`,
    html,
    text,
  });
};

module.exports = {
  sendEmail,
  sendDoctorBookingEmail,
  sendUserConfirmationEmail,
};

