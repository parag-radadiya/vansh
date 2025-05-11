const nodemailer = require('nodemailer');
const logger = require('../logger/logger');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const OTP = require('../../models/Otp');

/**
 * Email service for sending various email types, including OTPs
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter
   * @private
   */
  async initializeTransporter() {
    // For development, use Ethereal for testing
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      // Create a test account on Ethereal
      try {
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        logger.info(`Ethereal email test account created: ${testAccount.user}`);
        logger.info(`Ethereal email password: ${testAccount.pass}`);
        logger.info(`View emails at: https://ethereal.email`);
      } catch (error) {
        logger.error(`Failed to create test email account: ${error.message}`);
      }
    } else {
      // Use configured SMTP server
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * Generate a numeric OTP code
   * @returns {string} 6-digit OTP code
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Save OTP to the database
   * @param {string} email - User's email address
   * @param {string} otpCode - Generated OTP code
   * @param {string} purpose - Purpose of the OTP ('verification' or 'passwordReset')
   * @returns {Promise<Object>} The saved OTP document
   */
  async saveOTP(email, otpCode, purpose = 'verification') {
    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose });
    
    // Create a new OTP document
    const otp = new OTP({
      email,
      otp: otpCode,
      purpose,
      expires: moment().add(10, 'minutes').toDate(), // OTP expires in 10 minutes
    });
    
    await otp.save();
    return otp;
  }

  /**
   * Send an OTP verification email
   * @param {string} email - Recipient's email address
   * @returns {Promise<Object>} Object containing the message ID and preview URL
   */
  async sendVerificationOTP(email) {
    try {
      // Ensure transporter is initialized
      if (!this.transporter) {
        await this.initializeTransporter();
      }
      
      // Generate OTP code
      const otpCode = this.generateOTP();
      
      // Save OTP to database
      await this.saveOTP(email, otpCode, 'verification');
      
      // Send email with OTP
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Vercel Node App" <noreply@example.com>',
        to: email,
        subject: 'Email Verification Code',
        text: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Thank you for registering! Please use the following code to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
              ${otpCode}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, you can safely ignore this email.</p>
          </div>
        `,
      });
      
      logger.info(`Verification email sent to ${email}: ${info.messageId}`);
      
      // Return message ID and preview URL (for Ethereal)
      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      logger.error(`Error sending verification email to ${email}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify OTP code
   * @param {string} email - User's email address
   * @param {string} otpCode - OTP code to verify
   * @param {string} purpose - Purpose of the OTP
   * @returns {Promise<boolean>} True if OTP is valid, false otherwise
   */
  async verifyOTP(email, otpCode, purpose = 'verification') {
    // Find the latest OTP for this email and purpose
    const otp = await OTP.findOne({
      email,
      purpose,
      isUsed: false,
      expires: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!otp || otp.otp !== otpCode) {
      return false;
    }
    
    // Mark the OTP as used
    otp.isUsed = true;
    await otp.save();
    
    return true;
  }
}

module.exports = new EmailService();