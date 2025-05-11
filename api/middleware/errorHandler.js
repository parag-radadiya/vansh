const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Global Error Handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // Set default status code and message if not provided
  statusCode = statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  message = message || 'Internal Server Error';
  
  // If in development, include the stack trace
  const response = {
    success: false,
    error: httpStatus[statusCode] || 'Internal Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  
  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);
    logger.error(err.stack);
  } else {
    logger.warn(`${err.message} - ${req.method} ${req.originalUrl}`);
  }
  
  res.status(statusCode).json(response);
};

module.exports = errorHandler;