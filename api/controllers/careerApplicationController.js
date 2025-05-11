const careerApplicationService = require('../services/careerApplicationService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');
const multer = require('multer');
const configureCloudinary = require('../config/cloudinary/index');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Initialize Cloudinary
const cloudinary = configureCloudinary();

// Configure Cloudinary storage for resume uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'raw', // For handling PDF and DOC files
    format: async (req, file) => {
      // Get file extension from original filename
      const extension = file.originalname.split('.').pop().toLowerCase();
      return extension;
    },
    public_id: (req, file) => {
      // Create a unique name for the file using timestamp and original name
      const timestamp = new Date().getTime();
      const nameWithoutExt = file.originalname.split('.')[0];
      return `${nameWithoutExt}-${timestamp}`;
    },
  },
});

// Define file filter to allow only document file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size
});

/**
 * Controller for career applications
 * @namespace careerApplicationController
 */
const careerApplicationController = {
  /**
   * Get all applications
   * @async
   * @function getAllApplications
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with applications data or error
   */
  getAllApplications: async (req, res) => {
    try {
      const result = await careerApplicationService.getAllApplications(req.query);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getAllApplications controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve applications'
      });
    }
  },

  /**
   * Get application by ID
   * @async
   * @function getApplicationById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with application data or error
   */
  getApplicationById: async (req, res) => {
    try {
      const result = await careerApplicationService.getApplicationById(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getApplicationById controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve application'
      });
    }
  },

  /**
   * Create a new application
   * @async
   * @function createApplication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created application or error
   */
  createApplication: async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        state, 
        city, 
        role, 
        phoneNumber 
      } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !phoneNumber || !role) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide all required fields' 
        });
      }

      // Check if resume file was uploaded
      if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please upload your resume' 
        });
      }
      
      const applicationData = { 
        firstName, 
        lastName, 
        email, 
        state, 
        city, 
        role, 
        phoneNumber,
        resume: {
          url: req.file.path,
          publicId: req.file.filename
        }
      };
      
      const result = await careerApplicationService.createApplication(applicationData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      logger.error(`Error in createApplication controller: ${error.message}`);
      
      // If there was an error and a file was uploaded, attempt to clean up
      if (req.file && req.file.publicId) {
        try {
          await cloudinary.uploader.destroy(req.file.publicId, { resource_type: 'raw' });
        } catch (cleanupError) {
          logger.error(`Failed to clean up uploaded file: ${cleanupError.message}`);
        }
      }
      
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to create application'
      });
    }
  },

  /**
   * Update application status
   * @async
   * @function updateApplicationStatus
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated application or error
   */
  updateApplicationStatus: async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide a status' 
        });
      }
      
      const result = await careerApplicationService.updateApplicationStatus(
        req.params.id,
        status,
        notes
      );
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updateApplicationStatus controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update application status'
      });
    }
  },

  /**
   * Delete an application
   * @async
   * @function deleteApplication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteApplication: async (req, res) => {
    try {
      // First get the application to get the resume publicId
      const getResult = await careerApplicationService.getApplicationById(req.params.id);
      
      if (!getResult.success) {
        return res.status(getResult.statusCode || httpStatus.BAD_REQUEST).json(getResult);
      }
      
      const application = getResult.data;
      
      // Delete the application from the database
      const result = await careerApplicationService.deleteApplication(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      // Delete the resume file from Cloudinary
      if (application.resume && application.resume.publicId) {
        try {
          await cloudinary.uploader.destroy(
            application.resume.publicId, 
            { resource_type: 'raw' }
          );
        } catch (cloudinaryError) {
          logger.error(`Failed to delete resume file from Cloudinary: ${cloudinaryError.message}`);
          // Continue with the response even if Cloudinary deletion fails
        }
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in deleteApplication controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete application'
      });
    }
  }
};

module.exports = { careerApplicationController, upload };