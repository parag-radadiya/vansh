const serviceService = require('../services/serviceService');
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
 * Service controller for handling service-related HTTP requests
 * @module serviceController
 */
const serviceController = {
  /**
   * Create new service
   * @async
   * @function createService
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with service data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with new service data or error
   */
  createService: async (req, res) => {
    try {
      const { title, description, category, services } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          error: 'Title, description, and category are required'
        });
      }
      
      const serviceData = {
        title,
        description,
        category,
        services: services ? 
          (Array.isArray(services) ? services : [services]) : 
          [],
        createdBy: req.user._id
      };
      
      const result = await serviceService.createService(serviceData, req.files);
      
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
   * Get all services
   * @async
   * @function getAllServices
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of services or error
   */
  getAllServices: async (req, res) => {
    try {
      const result = await serviceService.getAllServices();
      
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
   * Get a service by ID
   * @async
   * @function getServiceById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Service ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with service data or error
   */
  getServiceById: async (req, res) => {
    try {
      const result = await serviceService.getServiceById(req.params.id);
      
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
   * Update a service
   * @async
   * @function updateService
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Service ID
   * @param {Object} req.body - Request body with updated data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated service data or error
   */
  updateService: async (req, res) => {
    try {
      // Process services array if provided
      if (req.body.services && !Array.isArray(req.body.services)) {
        req.body.services = [req.body.services];
      }
      
      const result = await serviceService.updateService(
        req.params.id,
        req.body,
        req.files,
        req.user._id
      );
      
      if (!result.success) {
        return res.status(result.error === 'Service not found' ? 404 : 400).json(result);
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
   * Delete a service
   * @async
   * @function deleteService
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Service ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteService: async (req, res) => {
    try {
      const result = await serviceService.deleteService(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Service not found' ? 404 : 400).json(result);
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

module.exports = { serviceController, upload };