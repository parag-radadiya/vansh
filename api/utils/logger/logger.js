const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1' || 
                 process.env.VERCEL_ENV !== undefined || 
                 process.env.NODE_ENV === 'production';

// Custom format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define which transports to use based on environment
const transports = [];

// Always use console transport
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: !isVercel }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  })
);

// Only use file transports in non-Vercel environments
if (!isVercel) {
  try {
    // Check if logs directory exists
    const fs = require('fs');
    const logsDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Add file transports for error and combined logs
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
      })
    );
  } catch (err) {
    console.error('Error setting up file logging:', err.message);
    // Continue without file transports if there's an error
  }
}

// Create and export the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

module.exports = logger;