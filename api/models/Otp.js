const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     OTP:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Email address associated with this OTP
 *         otp:
 *           type: string
 *           description: One-time password code
 *         purpose:
 *           type: string
 *           description: Purpose of the OTP (verification, password reset)
 *         expires:
 *           type: string
 *           format: date-time
 *           description: OTP expiration timestamp
 */

/**
 * OTP Schema
 * @typedef {Object} OTP
 * @property {string} email - Email address associated with this OTP
 * @property {string} otp - OTP code
 * @property {string} purpose - Purpose of the OTP
 * @property {Date} expires - Expiration time of the OTP
 */
const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['verification', 'passwordReset'],
    default: 'verification',
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Create index for quick lookup and auto-expire
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;