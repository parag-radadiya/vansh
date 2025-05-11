const userService = require('../services/userService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Controller for user registration
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with user data
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with user data or error
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, username, mobileNumber } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }
    
    const result = await userService.createUser({ 
      email, 
      password, 
      name, 
      username, 
      mobileNumber 
    });
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
    }
    
    res.status(httpStatus.CREATED).json(result);
  } catch (error) {
    logger.error(`Error in register controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

/**
 * Controller for email verification
 * @async
 * @function verifyEmail
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with email and OTP
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with verification status
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Basic validation
    if (!email || !otp) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }
    
    const result = await userService.verifyEmail(email, otp);
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
    }
    
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    logger.error(`Error in verifyEmail controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error during email verification'
    });
  }
};

/**
 * Controller to resend verification OTP
 * @async
 * @function resendVerificationOTP
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with email
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with OTP sending status
 */
exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }
    
    const result = await userService.resendVerificationOTP(email);
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
    }
    
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    logger.error(`Error in resendVerificationOTP controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error while sending OTP'
    });
  }
};

/**
 * Controller for user login
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with login credentials
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with user data and tokens
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }
    
    const result = await userService.loginUser(email, password);
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.UNAUTHORIZED).json(result);
    }
    
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    logger.error(`Error in login controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

/**
 * Controller to refresh authentication tokens
 * @async
 * @function refreshTokens
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with refresh token
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with new token pair
 */
exports.refreshTokens = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Refresh token is required'
      });
    }
    
    const result = await userService.refreshTokens(refreshToken);
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.UNAUTHORIZED).json(result);
    }
    
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    logger.error(`Error in refreshTokens controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error while refreshing tokens'
    });
  }
};

/**
 * Controller for user logout
 * @async
 * @function logout
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with refresh token
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with logout status
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Refresh token is required'
      });
    }
    
    const result = await userService.logoutUser(refreshToken);
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
    }
    
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    logger.error(`Error in logout controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

/**
 * Controller to get current user profile
 * @async
 * @function getProfile
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with user profile data
 */
exports.getProfile = async (req, res) => {
  try {
    res.status(httpStatus.OK).json({
      success: true,
      data: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        username: req.user.username,
        mobileNumber: req.user.mobileNumber,
        isEmailVerified: req.user.isEmailVerified,
        isMobileVerified: req.user.isMobileVerified
      }
    });
  } catch (error) {
    logger.error(`Error in getProfile controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error while retrieving profile'
    });
  }
};

/**
 * Controller to update user profile
 * @async
 * @function updateProfile
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {Object} req.body - Request body with profile updates
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Response with updated profile data
 */
exports.updateProfile = async (req, res) => {
  try {
    const result = await userService.updateUserProfile(req.user._id, req.body);
    
    if (!result.success) {
      return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
    }
    
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    logger.error(`Error in updateProfile controller: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};