const cloudinary = require('cloudinary').v2;
const path = require('path');

// Make sure dotenv loads the .env file from the root directory
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Configure Cloudinary with credentials from environment variables
 * @function configureCloudinary
 * @returns {Object} Configured Cloudinary instance
 */
const configureCloudinary = () => {
  // Log environment variables for debugging (don't include this in production)
  console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'undefined',
    api_key: process.env.CLOUDINARY_API_KEY ? '[PRESENT]' : 'undefined',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '[PRESENT]' : 'undefined'
  });
  
  // Hardcoded values as fallback - use these if env vars are not available
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || 'parag_demo';
  const api_key = process.env.CLOUDINARY_API_KEY || '152593426133714';
  const api_secret = process.env.CLOUDINARY_API_SECRET || 'bLy72TZCS2HpHsr-3GYfI4M10rQ';
  
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret
  });
  
  return cloudinary;
};

module.exports = configureCloudinary;