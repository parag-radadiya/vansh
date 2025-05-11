const expertService = require('../services/expertService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');
const multer = require('multer');
const configureCloudinary = require('../config/cloudinary/index');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Initialize Cloudinary
const cloudinary = configureCloudinary();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'experts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
  },
});

// Initialize multer upload middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size
});

/**
 * Controller for expert management
 * @namespace expertController
 */
const expertController = {
  /**
   * Get all experts
   * @async
   * @function getAllExperts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with experts data or error
   */
  getAllExperts: async (req, res) => {
    try {
      const result = await expertService.getAllExperts(req.query);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getAllExperts controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve experts'
      });
    }
  },

  /**
   * Get expert by ID
   * @async
   * @function getExpertById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with expert data or error
   */
  getExpertById: async (req, res) => {
    try {
      const result = await expertService.getExpertById(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getExpertById controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve expert'
      });
    }
  },

  /**
   * Create a new expert
   * @async
   * @function createExpert
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created expert or error
   */
  createExpert: async (req, res) => {
    try {
      const { name, role, description } = req.body;
      
      // Basic validation
      if (!name || !role || !description) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide name, role and description' 
        });
      }
      
      // Handle image uploads if available
      const expertData = { name, role, description };
      
      if (req.files && req.files.image && req.files.image.length > 0) {
        expertData.image = {
          url: req.files.image[0].path,
          publicId: req.files.image[0].filename
        };
      }
      
      const result = await expertService.createExpert(expertData, req.user.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      logger.error(`Error in createExpert controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create expert'
      });
    }
  },

  /**
   * Update an expert
   * @async
   * @function updateExpert
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated expert or error
   */
  updateExpert: async (req, res) => {
    try {
      const { name, role, description } = req.body;
      const updateData = {};
      
      // Add fields to update data if provided
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (description) updateData.description = description;
      
      // Handle image uploads if available
      if (req.files && req.files.image && req.files.image.length > 0) {
        updateData.image = {
          url: req.files.image[0].path,
          publicId: req.files.image[0].filename
        };
      }
      
      const result = await expertService.updateExpert(req.params.id, updateData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updateExpert controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update expert'
      });
    }
  },

  /**
   * Delete an expert
   * @async
   * @function deleteExpert
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteExpert: async (req, res) => {
    try {
      const result = await expertService.deleteExpert(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in deleteExpert controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete expert'
      });
    }
  }
};

module.exports = { expertController, upload };