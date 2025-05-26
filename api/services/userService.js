const User = require('../models/User');
const Token = require('../models/Token');
const {emailService} = require('../utils/email/emailService');
const httpStatus = require('http-status');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger/logger');

/**
 * Service class for handling user-related business logic
 * @class UserService
 */
class UserService {
  /**
   * Create a new user during signup
   * @async
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} [userData.name] - User name
   * @param {string} [userData.username] - User username
   * @param {string} [userData.mobileNumber] - User mobile number
   * @returns {Promise<Object>} Object containing success status and user data or error message
   */
  async createUser(userData) {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      // Check if username exists if provided
      if (userData.username) {
        const userWithUsername = await User.findOne({ username: userData.username });
        if (userWithUsername) {
          return {
            success: false,
            error: 'Username already taken',
            statusCode: httpStatus.BAD_REQUEST
          };
        }
      }
      
      // Create user
      const user = await User.create(userData);
      
      // Send verification OTP
      try {
        const emailResult = await emailService.sendVerificationOTP(user.email);
        
        // If in development and using Ethereal, include preview URL
        const emailPreview = process.env.NODE_ENV === 'development' ? 
          { emailPreviewUrl: emailResult.previewUrl } : {};
        
        return {
          success: true,
          message: 'User created successfully. Verification OTP sent to email.',
          data: {
            _id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            mobileNumber: user.mobileNumber,
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified,
            createdAt: user.createdAt
          },
          ...emailPreview
        };
      } catch (emailError) {
        logger.error(`Failed to send verification email: ${emailError.message}`);
        return {
          success: true,
          message: 'User created successfully but failed to send verification email.',
          data: {
            _id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            mobileNumber: user.mobileNumber,
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified,
            createdAt: user.createdAt
          }
        };
      }
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Verify user email with OTP
   * @async
   * @param {string} email - User email
   * @param {string} otp - Verification OTP
   * @returns {Promise<Object>} Object containing success status and tokens or error message
   */
  async verifyEmail(email, otp) {
    try {
      // Verify OTP
      const isValid = await emailService.verifyOTP(email, otp, 'verification');
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid or expired OTP',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      // Find user and update isEmailVerified status
      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      user.isEmailVerified = true;
      await user.save();
      
      // Generate auth tokens
      const tokens = await this.generateAuthTokens(user);
      
      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified
          },
          tokens
        }
      };
    } catch (error) {
      logger.error(`Error verifying email: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Resend verification OTP
   * @async
   * @param {string} email - User email
   * @returns {Promise<Object>} Object containing success status and message or error
   */
  async resendVerificationOTP(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      if (user.isEmailVerified) {
        return {
          success: false,
          error: 'Email already verified',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      const emailResult = await emailService.sendVerificationOTP(email);
      
      // If in development and using Ethereal, include preview URL
      const emailPreview = process.env.NODE_ENV === 'development' ? 
        { emailPreviewUrl: emailResult.previewUrl } : {};
      
      return {
        success: true,
        message: 'Verification OTP sent successfully',
        ...emailPreview
      };
    } catch (error) {
      logger.error(`Error resending OTP: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Login user
   * @async
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Object containing success status, user data and tokens or error message
   */
  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
          statusCode: httpStatus.UNAUTHORIZED
        };
      }
      
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return {
          success: false,
          error: 'Invalid credentials',
          statusCode: httpStatus.UNAUTHORIZED
        };
      }
      
      // If email is not verified, send verification OTP
      if (!user.isEmailVerified) {
        await emailService.sendVerificationOTP(email);
        return {
          success: false,
          error: 'Email not verified',
          message: 'Verification OTP has been sent to your email',
          statusCode: httpStatus.FORBIDDEN
        };
      }
      
      // Generate auth tokens
      const tokens = await this.generateAuthTokens(user);
      
      return {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified
          },
          tokens
        }
      };
    } catch (error) {
      logger.error(`Error logging in: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Generate both access and refresh tokens
   * @async
   * @param {Object} user - User document
   * @returns {Promise<Object>} Object containing access and refresh tokens
   */
  async generateAuthTokens(user) {
    try {
      const accessToken = user.generateAccessToken();
      const refreshTokenObj = user.generateRefreshToken();
      
      await this.saveRefreshToken(refreshTokenObj.token, user._id, refreshTokenObj.expires);
      
      return {
        access: {
          token: accessToken,
          expires: moment().add(
            process.env.NODE_ENV === 'development' ? 1 : 
            process.env.JWT_ACCESS_EXPIRATION_MINUTES || 30, 
            'minutes'
          ).toDate()
        },
        refresh: {
          token: refreshTokenObj.token,
          expires: refreshTokenObj.expires
        }
      };
    } catch (error) {
      logger.error(`Error generating auth tokens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save refresh token to database
   * @async
   * @param {string} token - Refresh token
   * @param {string} userId - User ID
   * @param {Date} expires - Token expiry date
   * @returns {Promise<Object>} Saved token document
   */
  async saveRefreshToken(token, userId, expires) {
    const tokenDoc = await Token.create({
      token,
      user: userId,
      type: 'refresh',
      expires,
      blacklisted: false
    });
    return tokenDoc;
  }

  /**
   * Refresh auth tokens with refresh token
   * @async
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Object containing new access and refresh tokens or error message
   */
  async refreshTokens(refreshToken) {
    try {
      // Verify the refresh token exists and is not blacklisted
      const tokenDoc = await Token.findOne({
        token: refreshToken,
        type: 'refresh',
        blacklisted: false,
        expires: { $gt: new Date() }
      });
      
      if (!tokenDoc) {
        return {
          success: false,
          error: 'Invalid refresh token',
          statusCode: httpStatus.UNAUTHORIZED
        };
      }
      
      // Find the user
      const user = await User.findById(tokenDoc.user);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: httpStatus.UNAUTHORIZED
        };
      }
      
      // Blacklist the current refresh token
      await Token.findByIdAndUpdate(tokenDoc._id, { blacklisted: true });
      
      // Generate new tokens
      const tokens = await this.generateAuthTokens(user);
      
      return {
        success: true,
        data: { tokens }
      };
    } catch (error) {
      logger.error(`Error refreshing tokens: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Logout user (blacklist the refresh token)
   * @async
   * @param {string} refreshToken - Refresh token to blacklist
   * @returns {Promise<Object>} Success message or error
   */
  async logoutUser(refreshToken) {
    try {
      const tokenDoc = await Token.findOne({
        token: refreshToken,
        type: 'refresh',
        blacklisted: false
      });
      
      if (!tokenDoc) {
        return {
          success: false,
          error: 'Invalid refresh token',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      // Blacklist the token
      await Token.findByIdAndUpdate(tokenDoc._id, { blacklisted: true });
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error(`Error logging out: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Update user profile
   * @async
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data or error message
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Check if username exists if provided
      if (updateData.username) {
        const existingUser = await User.findOne({ 
          username: updateData.username,
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          return {
            success: false,
            error: 'Username already taken',
            statusCode: httpStatus.BAD_REQUEST
          };
        }
      }
      
      // Update user profile
      const allowedUpdates = ['name', 'username', 'mobileNumber'];
      const filteredUpdates = Object.keys(updateData)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
      
      const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          username: user.username,
          mobileNumber: user.mobileNumber,
          isEmailVerified: user.isEmailVerified,
          isMobileVerified: user.isMobileVerified
        }
      };
    } catch (error) {
      logger.error(`Error updating user profile: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}

module.exports = new UserService();