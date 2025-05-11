const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Authentication middleware to protect routes
 * @async
 * @function authenticate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false, 
        error: 'Authentication failed: No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token has expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error: 'Authentication failed: Token expired'
        });
      }
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ 
          success: false, 
          error: 'Authentication failed: User not found' 
        });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error: 'Authentication failed: Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error: 'Authentication failed: Invalid token'
        });
      }
      
      logger.error(`Auth middleware error: ${error.message}`);
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false, 
        error: 'Authentication failed: ' + error.message
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      error: 'Server error during authentication' 
    });
  }
};

module.exports = authenticate;