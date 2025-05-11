const contentService = require('../services/contentService');
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
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

/**
 * Content controller for handling content-related HTTP requests
 * @module contentController
 */
const contentController = {
  /**
   * Create new content with optional media files
   * @async
   * @function createContent
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with content data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with new content data or error
   */
  createContent: async (req, res) => {
    try {
      const { title, description } = req.body;
      
      console.log("Request body:", req.body);
      console.log("Uploaded files:", req.files);
      
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Title and description are required'
        });
      }
      
      const contentData = {
        title,
        description,
        createdBy: req.user._id
      };
      
      const result = await contentService.createContent(contentData, req.files);
      
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
   * Get all content entries
   * @async
   * @function getAllContent
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of content or error
   */
  getAllContent: async (req, res) => {
    try {
      const result = await contentService.getAllContent();
      
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
   * Get a content entry by ID
   * @async
   * @function getContentById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Content ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with content data or error
   */
  getContentById: async (req, res) => {
    try {
      const result = await contentService.getContentById(req.params.id);
      
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
   * Update a content entry
   * @async
   * @function updateContent
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Content ID
   * @param {Object} req.body - Request body with updated data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated content data or error
   */
  updateContent: async (req, res) => {
    try {
      const result = await contentService.updateContent(
        req.params.id,
        req.body,
        req.files,
        req.user._id
      );
      
      if (!result.success) {
        return res.status(result.error === 'Content not found' ? 404 : 400).json(result);
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
   * Delete a content entry
   * @async
   * @function deleteContent
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Content ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteContent: async (req, res) => {
    try {
      const result = await contentService.deleteContent(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Content not found' ? 404 : 400).json(result);
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

module.exports = { contentController, upload };