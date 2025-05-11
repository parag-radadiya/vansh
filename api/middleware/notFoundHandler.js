const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Middleware for handling 404 Not Found errors
 */
const notFoundHandler = (req, res, next) => {
  const errorMessage = `API Not Found: ${req.method} ${req.originalUrl}`;
  logger.error(errorMessage);
  
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    error: 'Not Found',
    message: `The requested endpoint (${req.originalUrl}) was not found on this server`
  });
};

module.exports = notFoundHandler;