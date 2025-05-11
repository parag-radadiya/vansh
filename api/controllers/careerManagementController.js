const careerManagementService = require('../services/careerManagementService');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/tmp/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Career Management controller for handling career-related HTTP requests
 * @module careerManagementController
 */
const careerManagementController = {
  /**
   * Create new career opportunity
   * @async
   * @function createCareerOpportunity
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with career data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with new career data or error
   */
  createCareerOpportunity: async (req, res) => {
    try {
      const { category, role, description } = req.body;
      
      if (!category || !role || !description) {
        return res.status(400).json({
          success: false,
          error: 'Category, role, and description are required'
        });
      }
      
      const careerData = {
        category,
        role,
        description,
        createdBy: req.user._id
      };
      
      const result = await careerManagementService.createCareerOpportunity(careerData, req.files);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get all career opportunities
   * @async
   * @function getAllCareerOpportunities
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of career opportunities or error
   */
  getAllCareerOpportunities: async (req, res) => {
    try {
      const result = await careerManagementService.getAllCareerOpportunities();
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get a career opportunity by ID
   * @async
   * @function getCareerOpportunityById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Career opportunity ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with career opportunity data or error
   */
  getCareerOpportunityById: async (req, res) => {
    try {
      const result = await careerManagementService.getCareerOpportunityById(req.params.id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Update a career opportunity
   * @async
   * @function updateCareerOpportunity
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Career opportunity ID
   * @param {Object} req.body - Request body with updated data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated career opportunity data or error
   */
  updateCareerOpportunity: async (req, res) => {
    try {
      const result = await careerManagementService.updateCareerOpportunity(
        req.params.id,
        req.body,
        req.files,
        req.user._id
      );
      
      if (!result.success) {
        return res.status(result.error === 'Career opportunity not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Delete a career opportunity
   * @async
   * @function deleteCareerOpportunity
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Career opportunity ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteCareerOpportunity: async (req, res) => {
    try {
      const result = await careerManagementService.deleteCareerOpportunity(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Career opportunity not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
};

module.exports = { careerManagementController, upload };