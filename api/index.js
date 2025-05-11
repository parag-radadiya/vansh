const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Setup API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);

// Root route for API health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Set port and start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
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

module.exports = app;