const successStoryService = require('../services/successStoryService');
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
 * Success Story controller for handling success story-related HTTP requests
 * @module successStoryController
 */
const successStoryController = {
  /**
   * Create new success story
   * @async
   * @function createSuccessStory
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with success story data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with new success story data or error
   */
  createSuccessStory: async (req, res) => {
    try {
      const { title, clientName, content, showHideFlag } = req.body;
      
      if (!title || !clientName || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title, client name, and content are required'
        });
      }
      
      const storyData = {
        title,
        clientName,
        content,
        showHideFlag: showHideFlag === 'true' || showHideFlag === true,
        createdBy: req.user._id
      };
      
      const result = await successStoryService.createSuccessStory(storyData, req.files);
      
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
   * Get all success stories
   * @async
   * @function getAllSuccessStories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of success stories or error
   */
  getAllSuccessStories: async (req, res) => {
    try {
      const result = await successStoryService.getAllSuccessStories();
      
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
   * Get visible success stories only
   * @async
   * @function getVisibleSuccessStories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of visible success stories or error
   */
  getVisibleSuccessStories: async (req, res) => {
    try {
      const result = await successStoryService.getVisibleSuccessStories();
      
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
   * Get a success story by ID
   * @async
   * @function getSuccessStoryById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Success story ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success story data or error
   */
  getSuccessStoryById: async (req, res) => {
    try {
      const result = await successStoryService.getSuccessStoryById(req.params.id);
      
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
   * Update a success story
   * @async
   * @function updateSuccessStory
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Success story ID
   * @param {Object} req.body - Request body with updated data
   * @param {Object} req.files - Uploaded files
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated success story data or error
   */
  updateSuccessStory: async (req, res) => {
    try {
      // Convert showHideFlag string to boolean if provided
      if (req.body.showHideFlag !== undefined) {
        req.body.showHideFlag = req.body.showHideFlag === 'true' || req.body.showHideFlag === true;
      }
      
      const result = await successStoryService.updateSuccessStory(
        req.params.id,
        req.body,
        req.files,
        req.user._id
      );
      
      if (!result.success) {
        return res.status(result.error === 'Success story not found' ? 404 : 400).json(result);
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
   * Delete a success story
   * @async
   * @function deleteSuccessStory
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Success story ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteSuccessStory: async (req, res) => {
    try {
      const result = await successStoryService.deleteSuccessStory(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Success story not found' ? 404 : 400).json(result);
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

module.exports = { successStoryController, upload };