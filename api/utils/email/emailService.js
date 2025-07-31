const nodemailer = require('nodemailer');
const logger = require('../logger/logger');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const OTP = require('../../models/Otp');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmail = async ({ to, subject, text ,html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  };

  await transporter.sendMail(mailOptions);
};

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializing = this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
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

        logger.info(`Using Ethereal SMTP: ${testAccount.user}`);
        logger.info(`Preview emails at: https://ethereal.email`);
      } else {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        logger.info(`Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}, secure=${process.env.SMTP_SECURE}`);
      }
    } catch (error) {
      logger.error(`Failed to initialize transporter: ${error.message}`);
      throw error;
    }
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveOTP(email, otpCode, purpose = 'verification') {
    await OTP.deleteMany({ email, purpose });

    const otp = new OTP({
      email,
      otp: otpCode,
      purpose,
      expires: moment().add(10, 'minutes').toDate(),
    });

    await otp.save();
    return otp;
  }

  async sendVerificationOTP(email) {
    try {
      if (!this.transporter) {
        await this.initializing;
      }

      const otpCode = this.generateOTP();
      await this.saveOTP(email, otpCode, 'verification');

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Vansh App" <noreply@example.com>',
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
      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      logger.error(`Error sending verification email to ${email}: ${error.message}`);
      throw error;
    }
  }

  async verifyOTP(email, otpCode, purpose = 'verification') {
    const otp = await OTP.findOne({
      email,
      purpose,
      isUsed: false,
      expires: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp || otp.otp !== otpCode) {
      return false;
    }

    otp.isUsed = true;
    await otp.save();

    return true;
  }
}

module.exports = {
  sendEmail,
  emailService: new EmailService()
};
