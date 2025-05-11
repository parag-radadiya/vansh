const Content = require('../models/Content');
const cloudinaryUploader = require('../config/cloudinary/uploader');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Service for handling content-related operations
 * @class ContentService
 */
class ContentService {
  /**
   * Create a new content entry
   * @async
   * @param {Object} contentData - Content data
   * @param {string} contentData.title - Content title
   * @param {string} contentData.description - Content description
   * @param {Object} contentData.createdBy - User who created the content
   * @param {Object} [files] - Uploaded files
   * @returns {Promise<Object>} Object with success status and content data or error
   */
  async createContent(contentData, files = {}) {
    try {
      const content = new Content({
        title: contentData.title,
        description: contentData.description,
        createdBy: contentData.createdBy
      });
      
      // Process banner if uploaded
      if (files.banner && files.banner[0]) {
        const bannerFile = files.banner[0];
        const bannerResult = await cloudinaryUploader.uploadImage(bannerFile.path, 'content/banners');
        if (bannerResult.success) {
          content.banner = {
            url: bannerResult.url,
            publicId: bannerResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(bannerFile.path);
        }
      }
      
      // Process image if uploaded
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'content/images');
        if (imageResult.success) {
          content.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      // Process video if uploaded - check mimetype to determine upload method
      if (files.video && files.video[0]) {
        const videoFile = files.video[0];
        let videoResult;
        
        // Check if the file is actually a video or an image
        if (videoFile.mimetype.startsWith('video/')) {
          videoResult = await cloudinaryUploader.uploadVideo(videoFile.path, 'content/videos');
        } else if (videoFile.mimetype.startsWith('image/')) {
          // If it's actually an image, upload it as an image
          videoResult = await cloudinaryUploader.uploadImage(videoFile.path, 'content/videos');
        }
        
        if (videoResult && videoResult.success) {
          content.video = {
            url: videoResult.url,
            publicId: videoResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(videoFile.path);
        }
      }
      
      await content.save();
      
      return {
        success: true,
        data: content
      };
    } catch (error) {
      console.error('Error creating content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all content entries
   * @async
   * @returns {Promise<Object>} Object with success status and array of content or error
   */
  async getAllContent() {
    try {
      const contents = await Content.find().populate('createdBy', 'email');
      
      return {
        success: true,
        data: contents
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single content entry by ID
   * @async
   * @param {string} contentId - ID of the content to retrieve
   * @returns {Promise<Object>} Object with success status and content data or error
   */
  async getContentById(contentId) {
    try {
      const content = await Content.findById(contentId).populate('createdBy', 'email');
      
      if (!content) {
        return {
          success: false,
          error: 'Content not found'
        };
      }
      
      return {
        success: true,
        data: content
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a content entry
   * @async
   * @param {string} contentId - ID of the content to update
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.title] - Updated title
   * @param {string} [updateData.description] - Updated description
   * @param {Object} [files] - Uploaded files to update
   * @param {string} userId - ID of the user performing the update
   * @returns {Promise<Object>} Object with success status and updated content data or error
   */
  async updateContent(contentId, updateData, files = {}, userId) {
    try {
      const content = await Content.findById(contentId);
      
      if (!content) {
        return {
          success: false,
          error: 'Content not found'
        };
      }
      
      // Check ownership
      if (content.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to update this content'
        };
      }
      
      // Update text fields if provided
      if (updateData.title) content.title = updateData.title;
      if (updateData.description) content.description = updateData.description;
      
      // Update banner if uploaded
      if (files.banner) {
        // Delete old banner if exists
        if (content.banner && content.banner.publicId) {
          await cloudinaryUploader.deleteResource(content.banner.publicId);
        }
        
        const bannerResult = await cloudinaryUploader.uploadImage(files.banner.path, 'content/banners');
        if (bannerResult.success) {
          content.banner = {
            url: bannerResult.url,
            publicId: bannerResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(files.banner.path);
        }
      }
      
      // Update image if uploaded
      if (files.image) {
        // Delete old image if exists
        if (content.image && content.image.publicId) {
          await cloudinaryUploader.deleteResource(content.image.publicId);
        }
        
        const imageResult = await cloudinaryUploader.uploadImage(files.image.path, 'content/images');
        if (imageResult.success) {
          content.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(files.image.path);
        }
      }
      
      // Update video if uploaded
      if (files.video) {
        // Delete old video if exists
        if (content.video && content.video.publicId) {
          await cloudinaryUploader.deleteResource(content.video.publicId, 'video');
        }
        
        const videoResult = await cloudinaryUploader.uploadVideo(files.video.path, 'content/videos');
        if (videoResult.success) {
          content.video = {
            url: videoResult.url,
            publicId: videoResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(files.video.path);
        }
      }
      
      await content.save();
      
      return {
        success: true,
        data: content
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a content entry
   * @async
   * @param {string} contentId - ID of the content to delete
   * @param {string} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} Object with success status or error
   */
  async deleteContent(contentId, userId) {
    try {
      const content = await Content.findById(contentId);
      
      if (!content) {
        return {
          success: false,
          error: 'Content not found'
        };
      }
      
      // Check ownership
      if (content.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to delete this content'
        };
      }
      
      // Delete resources from Cloudinary
      if (content.banner && content.banner.publicId) {
        await cloudinaryUploader.deleteResource(content.banner.publicId);
      }
      
      if (content.image && content.image.publicId) {
        await cloudinaryUploader.deleteResource(content.image.publicId);
      }
      
      if (content.video && content.video.publicId) {
        await cloudinaryUploader.deleteResource(content.video.publicId, 'video');
      }
      
      await Content.findByIdAndDelete(contentId);
      
      return {
        success: true,
        message: 'Content deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ContentService();