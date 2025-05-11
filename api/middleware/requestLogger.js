const morgan = require('morgan');
const logger = require('../utils/logger/logger');

// Create a custom Morgan token for request body
morgan.token('body', (req) => JSON.stringify(req.body));

// Create a stream object for Morgan that writes to our Winston logger
const stream = {
  write: (message) => {
    // Remove all newline chars
    const logMessage = message.replace(/\n$/, '');
    logger.info(logMessage);
  },
};

// Custom request logging format
const morganFormat = ':method :url :status :res[content-length] - :response-time ms - :body';

module.exports = morgan(morganFormat, { stream });