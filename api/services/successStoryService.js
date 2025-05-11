const SuccessStory = require('../models/SuccessStory');
const cloudinaryUploader = require('../config/cloudinary/uploader');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Service for handling success story-related operations
 * @class SuccessStoryService
 */
class SuccessStoryService {
  /**
   * Create a new success story
   * @async
   * @param {Object} storyData - Success story data
   * @param {string} storyData.title - Title of the success story
   * @param {string} storyData.clientName - Name of the client
   * @param {string} storyData.content - Content of the success story
   * @param {boolean} storyData.showHideFlag - Visibility flag
   * @param {Object} storyData.createdBy - User who created this success story
   * @param {Object} [files] - Uploaded files
   * @returns {Promise<Object>} Object with success status and story data or error
   */
  async createSuccessStory(storyData, files = {}) {
    try {
      const story = new SuccessStory({
        title: storyData.title,
        clientName: storyData.clientName,
        content: storyData.content,
        showHideFlag: storyData.showHideFlag !== undefined ? storyData.showHideFlag : true,
        createdBy: storyData.createdBy
      });
      
      // Process image if uploaded
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'stories/images');
        if (imageResult.success) {
          story.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      await story.save();
      
      return {
        success: true,
        data: story
      };
    } catch (error) {
      console.error('Error creating success story:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all success stories
   * @async
   * @returns {Promise<Object>} Object with success status and array of success stories or error
   */
  async getAllSuccessStories() {
    try {
      const stories = await SuccessStory.find().populate('createdBy', 'email');
      
      return {
        success: true,
        data: stories
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get visible success stories only
   * @async
   * @returns {Promise<Object>} Object with success status and array of visible success stories or error
   */
  async getVisibleSuccessStories() {
    try {
      const stories = await SuccessStory.find({ showHideFlag: true }).populate('createdBy', 'email');
      
      return {
        success: true,
        data: stories
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single success story by ID
   * @async
   * @param {string} storyId - ID of the success story to retrieve
   * @returns {Promise<Object>} Object with success status and success story data or error
   */
  async getSuccessStoryById(storyId) {
    try {
      const story = await SuccessStory.findById(storyId).populate('createdBy', 'email');
      
      if (!story) {
        return {
          success: false,
          error: 'Success story not found'
        };
      }
      
      return {
        success: true,
        data: story
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a success story
   * @async
   * @param {string} storyId - ID of the success story to update
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.title] - Updated title
   * @param {string} [updateData.clientName] - Updated client name
   * @param {string} [updateData.content] - Updated content
   * @param {boolean} [updateData.showHideFlag] - Updated visibility flag
   * @param {Object} [files] - Uploaded files to update
   * @param {string} userId - ID of the user performing the update
   * @returns {Promise<Object>} Object with success status and updated success story data or error
   */
  async updateSuccessStory(storyId, updateData, files = {}, userId) {
    try {
      const story = await SuccessStory.findById(storyId);
      
      if (!story) {
        return {
          success: false,
          error: 'Success story not found'
        };
      }
      
      // Check ownership
      if (story.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to update this success story'
        };
      }
      
      // Update fields if provided
      if (updateData.title !== undefined) story.title = updateData.title;
      if (updateData.clientName !== undefined) story.clientName = updateData.clientName;
      if (updateData.content !== undefined) story.content = updateData.content;
      if (updateData.showHideFlag !== undefined) story.showHideFlag = updateData.showHideFlag;
      
      // Update image if uploaded
      if (files.image && files.image[0]) {
        // Delete old image if exists
        if (story.image && story.image.publicId) {
          await cloudinaryUploader.deleteResource(story.image.publicId);
        }
        
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'stories/images');
        if (imageResult.success) {
          story.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      await story.save();
      
      return {
        success: true,
        data: story
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a success story
   * @async
   * @param {string} storyId - ID of the success story to delete
   * @param {string} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} Object with success status or error
   */
  async deleteSuccessStory(storyId, userId) {
    try {
      const story = await SuccessStory.findById(storyId);
      
      if (!story) {
        return {
          success: false,
          error: 'Success story not found'
        };
      }
      
      // Check ownership
      if (story.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to delete this success story'
        };
      }
      
      // Delete resources from Cloudinary
      if (story.image && story.image.publicId) {
        await cloudinaryUploader.deleteResource(story.image.publicId);
      }
      
      await SuccessStory.findByIdAndDelete(storyId);
      
      return {
        success: true,
        message: 'Success story deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SuccessStoryService();