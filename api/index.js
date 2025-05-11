const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const { swaggerUi, specs } = require('./config/swagger');
const logger = require('./utils/logger/logger');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Express app
const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"]
      }
    }
  })
);

// Enable CORS with appropriate options
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Compress responses
app.use(compression());

// Rate limiting for API endpoints (production only)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', limiter);
}

// Connect to the database
connectDB();

// Body parser middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use(requestLogger);

// Secure API docs in production with a simple API key
const secureSwaggerInProduction = (req, res, next) => {
  // Only apply this check in production environment
  if (process.env.NODE_ENV === 'production' && process.env.DOCS_API_KEY) {
    const apiKey = req.query.apiKey || req.headers['x-api-key'];
    if (apiKey !== process.env.DOCS_API_KEY) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or missing API key for documentation access' 
      });
    }
  }
  next();
};

// API documentation (disable in production if not needed)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      displayRequestDuration: true,
      docExpansion: 'none',
      persistAuthorization: true,
    }
  };
  app.use('/api-docs', secureSwaggerInProduction, swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
}

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);

// Root route for API health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root route redirect to docs in development or when docs are enabled
app.get('/', (req, res) => {
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
    res.redirect('/api-docs');
  } else {
    res.status(200).json({ 
      success: true, 
      message: 'Welcome to the API',
      timestamp: new Date().toISOString()
    });
  }
});

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Check if running in a Vercel environment
const isVercel = process.env.VERCEL === '1' || 
                process.env.VERCEL_ENV !== undefined || 
                process.env.NODE_ENV === 'production';

// Only start server if not running on Vercel
if (!isVercel) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    }
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    logger.error(err.stack);
    
    // Proper server shutdown
    server.close(() => {
      logger.info('Server closed due to unhandled promise rejection');
      process.exit(1);
    });
  });
}

module.exports = app;