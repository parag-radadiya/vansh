const testimonialService = require('../services/testimonialService');
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
 * Testimonial controller for handling testimonial-related HTTP requests
 * @module testimonialController
 */
const testimonialController = {
  /**
   * Create new testimonial
   * @async
   * @function createTestimonial
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with testimonial data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with new testimonial data or error
   */
  createTestimonial: async (req, res) => {
    try {
      const { name, feedback, stars } = req.body;
      
      if (!name || !feedback) {
        return res.status(400).json({
          success: false,
          error: 'Name and feedback are required'
        });
      }
      
      const testimonialData = {
        name,
        feedback,
        stars: stars ? parseInt(stars, 10) : 5,
        createdBy: req.user._id
      };
      
      const result = await testimonialService.createTestimonial(testimonialData, req.files);
      
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
   * Get all testimonials
   * @async
   * @function getAllTestimonials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of testimonials or error
   */
  getAllTestimonials: async (req, res) => {
    try {
      const result = await testimonialService.getAllTestimonials();
      
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
   * Get a testimonial by ID
   * @async
   * @function getTestimonialById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Testimonial ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with testimonial data or error
   */
  getTestimonialById: async (req, res) => {
    try {
      const result = await testimonialService.getTestimonialById(req.params.id);
      
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
   * Update a testimonial
   * @async
   * @function updateTestimonial
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Testimonial ID
   * @param {Object} req.body - Request body with updated data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated testimonial data or error
   */
  updateTestimonial: async (req, res) => {
    try {
      // Parse stars to integer if provided
      if (req.body.stars) {
        req.body.stars = parseInt(req.body.stars, 10);
      }
      
      const result = await testimonialService.updateTestimonial(
        req.params.id,
        req.body,
        req.files,
        req.user._id
      );
      
      if (!result.success) {
        return res.status(result.error === 'Testimonial not found' ? 404 : 400).json(result);
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
   * Delete a testimonial
   * @async
   * @function deleteTestimonial
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Testimonial ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteTestimonial: async (req, res) => {
    try {
      const result = await testimonialService.deleteTestimonial(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Testimonial not found' ? 404 : 400).json(result);
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

module.exports = { testimonialController, upload };