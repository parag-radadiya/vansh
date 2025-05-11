const mongoose = require('mongoose');
const logger = require('../utils/logger/logger');

const connectDB = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    family: 4 // Use IPv4, skip trying IPv6
  };

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Add event listeners for production monitoring
    mongoose.connection.on('error', err => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected, attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
    
  } catch (err) {
    logger.error(`Error connecting to MongoDB: ${err.message}`);
    
    // In production, we might want to retry connection instead of exiting
    if (process.env.NODE_ENV === 'production') {
      logger.info('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;