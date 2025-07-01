const CareerManagement = require('../models/CareerManagement');
const cloudinaryUploader = require('../config/cloudinary/uploader');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Service for handling career-related operations
 * @class CareerManagementService
 */
class CareerManagementService {
  /**
   * Create a new career opportunity
   * @async
   * @param {Object} careerData - Career data
   * @param {string} careerData.category - Career category
   * @param {string} careerData.role - Job role
   * @param {string} careerData.description - Detailed job description
   * @param {Object} careerData.createdBy - User who created this career opportunity
   * @param {Object} [files] - Uploaded files
   * @returns {Promise<Object>} Object with success status and career data or error
   */
  async createCareerOpportunity(careerData, files = {}) {
    try {
      const career = new CareerManagement({
        ...careerData
      });
      
      // Process image if uploaded
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'careers/images');
        if (imageResult.success) {
          career.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      await career.save();
      
      return {
        success: true,
        data: career
      };
    } catch (error) {
      console.error('Error creating career opportunity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all career opportunities
   * @async
   * @returns {Promise<Object>} Object with success status and array of career opportunities or error
   */
  async getAllCareerOpportunities() {
    try {
      const careers = await CareerManagement.find().populate('createdBy', 'email');
      
      return {
        success: true,
        data: careers
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single career opportunity by ID
   * @async
   * @param {string} careerId - ID of the career opportunity to retrieve
   * @returns {Promise<Object>} Object with success status and career data or error
   */
  async getCareerOpportunityById(careerId) {
    try {
      const career = await CareerManagement.findById(careerId).populate('createdBy', 'email');
      
      if (!career) {
        return {
          success: false,
          error: 'Career opportunity not found'
        };
      }
      
      return {
        success: true,
        data: career
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a career opportunity
   * @async
   * @param {string} careerId - ID of the career opportunity to update
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.category] - Updated category
   * @param {string} [updateData.role] - Updated role
   * @param {string} [updateData.description] - Updated description
   * @param {Object} [files] - Uploaded files to update
   * @param {string} userId - ID of the user performing the update
   * @returns {Promise<Object>} Object with success status and updated career data or error
   */
  async updateCareerOpportunity(careerId, updateData, files = {}, userId) {
    try {
      const career = await CareerManagement.findById(careerId);
      
      if (!career) {
        return {
          success: false,
          error: 'Career opportunity not found'
        };
      }
      
      // Check ownership
      if (career.createdBy.toString() !== userId.toString()) {
        return {
          success: false,
          error: 'Not authorized to update this career opportunity'
        };
      }
      
      // Update text fields if provided
      if (updateData.category) career.category = updateData.category;
      if (updateData.role) career.role = updateData.role;
      if (updateData.description) career.description = updateData.description;
      
      // Update image if uploaded
      if (files.image && files.image[0]) {
        // Delete old image if exists
        if (career.image && career.image.publicId) {
          await cloudinaryUploader.deleteResource(career.image.publicId);
        }
        
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'careers/images');
        if (imageResult.success) {
          career.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      await career.save();
      
      return {
        success: true,
        data: career
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a career opportunity
   * @async
   * @param {string} careerId - ID of the career opportunity to delete
   * @param {string} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} Object with success status or error
   */
  async deleteCareerOpportunity(careerId, userId) {
    try {
      const career = await CareerManagement.findById(careerId);
      
      if (!career) {
        return {
          success: false,
          error: 'Career opportunity not found'
        };
      }
      
      // Check ownership
      if (career.createdBy.toString() !== userId.toString()) {
        return {
          success: false,
          error: 'Not authorized to delete this career opportunity'
        };
      }
      
      // Delete resources from Cloudinary
      if (career.image && career.image.publicId) {
        await cloudinaryUploader.deleteResource(career.image.publicId);
      }
      
      await CareerManagement.findByIdAndDelete(careerId);
      
      return {
        success: true,
        message: 'Career opportunity deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CareerManagementService();