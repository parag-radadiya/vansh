const blogService = require('../services/blogService');
const multer = require('multer');
const path = require('path');
const httpStatus = require("http-status");
const cloudinary = require("cloudinary");

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
    fileSize: 10 * 1024 * 1024, // 10MB limit for blog images
  },
  fileFilter: fileFilter
});

/**
 * Blog controller for handling blog-related HTTP requests
 * @module blogController
 */
const blogController = {
  /**
   * Create a new blog post
   * @async
   * @function createBlog
   * @param {Object} req - Express request object
   * @param {Object} req.body - Blog data
   * @param {Object} req.files - Uploaded images
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with blog data or error
   */

  createBlog: async (req, res) => {
    try {
      const { title, category, description, publishFlag, tags } = req.body;

      if (!title || !category || !description) {
        return res.status(400).json({
          success: false,
          error: 'Title, category, and description are required'
        });
      }

      const blogData = {
        title,
        category,
        description,
        publishFlag,
        tags: typeof tags === 'string' ? tags.split(',') : tags,
      };

      // Process multiple image uploads
      blogData.images = [];
      if (req.files && req.files.image && req.files.image.length > 0) {
        for (const file of req.files.image) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'blogs'
          });
          blogData.images.push({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }

      const result = await blogService.createBlog(blogData, req.user.id);

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },


  /**
   * Get all blogs
   * @async
   * @function getAllBlogs
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with blog data or error
   */
  getAllBlogs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await blogService.getAllBlogs(page, limit);
      
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
   * Get published blogs with optional category and tag filters
   * @async
   * @function getPublishedBlogs
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with blog data or error
   */
  getPublishedBlogs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { category, tag } = req.query;
      
      const result = await blogService.getPublishedBlogs(page, limit, category, tag);
      
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
   * Get a blog by ID
   * @async
   * @function getBlogById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Blog ID
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with blog data or error
   */
  getBlogById: async (req, res) => {
    try {
      const incrementViews = req.query.incrementViews === 'true';
      
      const result = await blogService.getBlogById(req.params.id, incrementViews);
      
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
   * Update a blog
   * @async
   * @function updateBlog
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Blog ID
   * @param {Object} req.body - Updated blog data
   * @param {Object} req.files - Uploaded images
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated blog data or error
   */
  updateBlog: async (req, res) => {
    try {
      const { title, category, description, publishFlag, tags } = req.body;
      const updateData = {};

      if (title) updateData.title = title;
      if (category) updateData.category = category;
      if (description) updateData.description = description;
      if (publishFlag !== undefined) updateData.publishFlag = publishFlag;
      if (tags) updateData.tags = typeof tags === 'string' ? tags.split(',') : tags;

      // Handle new image uploads
      if (req.files && req.files.image && req.files.image.length > 0) {
        updateData.images = [];

        for (const file of req.files.image) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'blogs'
          });

          updateData.images.push({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }

      const result = await blogService.updateBlog(req.params.id, updateData);

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`Error in updateBlog: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Server error during blog update'
      });
    }
  },
  
  /**
   * Delete a blog
   * @async
   * @function deleteBlog
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Blog ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteBlog: async (req, res) => {
    try {
      const result = await blogService.deleteBlog(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Blog not found' ? 404 : 400).json(result);
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
   * Toggle publish status of a blog
   * @async
   * @function togglePublishStatus
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Blog ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated blog data or error
   */
  togglePublishStatus: async (req, res) => {
    try {
      const result = await blogService.togglePublishStatus(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Blog not found' ? 404 : 400).json(result);
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
   * Get blog categories with counts
   * @async
   * @function getBlogCategories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with categories data or error
   */
  getBlogCategories: async (req, res) => {
    try {
      const result = await blogService.getBlogCategories();
      
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
   * Get blog tags with counts
   * @async
   * @function getBlogTags
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with tags data or error
   */
  getBlogTags: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await blogService.getBlogTags(limit);
      
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
  }
};

module.exports = { blogController, upload };