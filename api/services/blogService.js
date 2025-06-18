const Blog = require('../models/Blog');
const cloudinaryUploader = require('../config/cloudinary/uploader');
const Expert = require("../models/Expert");
const logger = require("../utils/logger/logger");
const httpStatus = require("http-status");

/**
 * Service for blog operations
 * @module blogService
 */
const blogService = {
  /**
   * Create a new blog post
   * @async
   * @function createBlog
   * @param {Object} blogData - Blog post data
   * @param {Object} imageFile - Image file for blog
   * @returns {Promise<Object>} Response with blog or error
   * @param {string} userId
   */
  createBlog: async (blogData, userId) => {
    try {
      const blog = await Blog.create({
        ...blogData,
        createdBy: userId
      });

      return {
        success: true,
        data: blog
      };
    } catch (error) {
      logger.error(`Error creating blog: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.name === 'ValidationError'
            ? httpStatus.BAD_REQUEST
            : httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  },
  
  /**
   * Update an existing blog post
   * @async
   * @function updateBlog
   * @param {string} id - Blog ID
   * @param {Object} blogData - Updated blog data
   * @param {Object} imageFile - New image file (optional)
   * @returns {Promise<Object>} Response with updated blog or error
   */
  async updateBlog(id, updateData) {
    try {
      const blog = await Blog.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      if (!blog) {
        return {
          success: false,
          error: 'Blog not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }

      return {
        success: true,
        data: blog
      };
    } catch (error) {
      logger.error(`Error updating blog: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode:
            error.name === 'ValidationError'
                ? httpStatus.BAD_REQUEST
                : httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  },
  
  /**
   * Get all published blog posts with pagination
   * @async
   * @function getPublishedBlogs
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} category - Category to filter by (optional)
   * @param {string} tag - Tag to filter by (optional)
   * @returns {Promise<Object>} Response with blogs and pagination info
   */
  getPublishedBlogs: async (page = 1, limit = 10, category = null, tag = null) => {
    try {
      const query = { isPublished: true };
      
      // Add category filter if provided
      if (category) {
        query.category = category;
      }
      
      // Add tag filter if provided
      if (tag) {
        query.tags = { $in: [tag] };
      }
      
      // Count total documents matching the query for pagination
      const total = await Blog.countDocuments(query);
      
      // Calculate pagination values
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const skip = (pageInt - 1) * limitInt;
      
      // Get blogs with pagination
      const blogs = await Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitInt)
        .select('-__v');
      
      return {
        success: true,
        data: blogs,
        pagination: {
          total,
          page: pageInt,
          limit: limitInt,
          pages: Math.ceil(total / limitInt)
        }
      };
    } catch (error) {
      console.error('Get published blogs error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch blogs'
      };
    }
  },
  
  /**
   * Get all blogs with pagination (including unpublished)
   * @async
   * @function getAllBlogs
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Response with blogs and pagination info
   */
  getAllBlogs: async (page = 1, limit = 10) => {
    try {
      // Count total documents for pagination
      const total = await Blog.countDocuments();
      
      // Calculate pagination values
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const skip = (pageInt - 1) * limitInt;
      
      // Get blogs with pagination
      const blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitInt)
        .select('-__v');
      
      return {
        success: true,
        data: blogs,
        pagination: {
          total,
          page: pageInt,
          limit: limitInt,
          pages: Math.ceil(total / limitInt)
        }
      };
    } catch (error) {
      console.error('Get all blogs error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch blogs'
      };
    }
  },
  
  /**
   * Get blog by ID
   * @async
   * @function getBlogById
   * @param {string} id - Blog ID
   * @param {boolean} incrementViews - Whether to increment view count
   * @returns {Promise<Object>} Response with blog or error
   */
  getBlogById: async (id, incrementViews = false) => {
    try {
      let blog;
      
      if (incrementViews) {
        // Increment view count and return updated document
        blog = await Blog.findByIdAndUpdate(
          id,
          { $inc: { viewCount: 1 } },
          { new: true }
        ).select('-__v');
      } else {
        blog = await Blog.findById(id).select('-__v');
      }
      
      if (!blog) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }
      
      return {
        success: true,
        data: blog
      };
    } catch (error) {
      console.error('Get blog by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch blog'
      };
    }
  },
  
  /**
   * Delete blog by ID
   * @async
   * @function deleteBlog
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteBlog: async (id) => {
    try {
      const blog = await Blog.findByIdAndDelete(id);
      
      if (!blog) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }
      
      return {
        success: true,
        message: 'Blog deleted successfully'
      };
    } catch (error) {
      console.error('Delete blog error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete blog'
      };
    }
  },
  
  /**
   * Toggle published status of a blog
   * @async
   * @function togglePublishStatus
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Response with updated blog or error
   */
  togglePublishStatus: async (id) => {
    try {
      const blog = await Blog.findById(id);
      
      if (!blog) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }
      
      blog.isPublished = !blog.isPublished;
      await blog.save();
      
      return {
        success: true,
        data: blog,
        message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`
      };
    } catch (error) {
      console.error('Toggle publish status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update blog status'
      };
    }
  },
  
  /**
   * Get blog categories with counts
   * @async
   * @function getBlogCategories
   * @returns {Promise<Object>} Response with categories or error
   */
  getBlogCategories: async () => {
    try {
      const categories = await Blog.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      return {
        success: true,
        data: categories.map(cat => ({
          category: cat._id,
          count: cat.count
        }))
      };
    } catch (error) {
      console.error('Get blog categories error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch blog categories'
      };
    }
  },
  
  /**
   * Get popular blog tags with counts
   * @async
   * @function getBlogTags
   * @param {number} limit - Maximum number of tags to return
   * @returns {Promise<Object>} Response with tags or error
   */
  getBlogTags: async (limit = 20) => {
    try {
      const tags = await Blog.aggregate([
        { $match: { isPublished: true } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);
      
      return {
        success: true,
        data: tags.map(tag => ({
          tag: tag._id,
          count: tag.count
        }))
      };
    } catch (error) {
      console.error('Get blog tags error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch blog tags'
      };
    }
  }
};

module.exports = blogService;