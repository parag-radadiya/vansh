const Testimonial = require('../models/Testimonial');
const cloudinaryUploader = require('../config/cloudinary/uploader');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Service for handling testimonial-related operations
 * @class TestimonialService
 */
class TestimonialService {
  /**
   * Create a new testimonial
   * @async
   * @param {Object} testimonialData - Testimonial data
   * @param {string} testimonialData.name - Name of the person
   * @param {string} testimonialData.feedback - Testimonial feedback
   * @param {number} testimonialData.stars - Star rating (1-5)
   * @param {Object} testimonialData.createdBy - User who created this testimonial
   * @param {Object} [files] - Uploaded files
   * @returns {Promise<Object>} Object with success status and testimonial data or error
   */
  async createTestimonial(testimonialData, files = {}) {
    try {
      const testimonial = new Testimonial({
        name: testimonialData.name,
        feedback: testimonialData.feedback,
        stars: testimonialData.stars,
        createdBy: testimonialData.createdBy
      });
      
      // Process image if uploaded
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'testimonials/images');
        if (imageResult.success) {
          testimonial.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      await testimonial.save();
      
      return {
        success: true,
        data: testimonial
      };
    } catch (error) {
      console.error('Error creating testimonial:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all testimonials
   * @async
   * @returns {Promise<Object>} Object with success status and array of testimonials or error
   */
  async getAllTestimonials() {
    try {
      const testimonials = await Testimonial.find().populate('createdBy', 'email');
      
      return {
        success: true,
        data: testimonials
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single testimonial by ID
   * @async
   * @param {string} testimonialId - ID of the testimonial to retrieve
   * @returns {Promise<Object>} Object with success status and testimonial data or error
   */
  async getTestimonialById(testimonialId) {
    try {
      const testimonial = await Testimonial.findById(testimonialId).populate('createdBy', 'email');
      
      if (!testimonial) {
        return {
          success: false,
          error: 'Testimonial not found'
        };
      }
      
      return {
        success: true,
        data: testimonial
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a testimonial
   * @async
   * @param {string} testimonialId - ID of the testimonial to update
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.name] - Updated name
   * @param {string} [updateData.feedback] - Updated feedback
   * @param {number} [updateData.stars] - Updated star rating
   * @param {Object} [files] - Uploaded files to update
   * @param {string} userId - ID of the user performing the update
   * @returns {Promise<Object>} Object with success status and updated testimonial data or error
   */
  async updateTestimonial(testimonialId, updateData, files = {}, userId) {
    try {
      const testimonial = await Testimonial.findById(testimonialId);
      
      if (!testimonial) {
        return {
          success: false,
          error: 'Testimonial not found'
        };
      }
      
      // Check ownership
      if (testimonial.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to update this testimonial'
        };
      }
      
      // Update fields if provided
      if (updateData.name !== undefined) testimonial.name = updateData.name;
      if (updateData.feedback !== undefined) testimonial.feedback = updateData.feedback;
      if (updateData.stars !== undefined) testimonial.stars = updateData.stars;
      
      // Update image if uploaded
      if (files.image && files.image[0]) {
        // Delete old image if exists
        if (testimonial.image && testimonial.image.publicId) {
          await cloudinaryUploader.deleteResource(testimonial.image.publicId);
        }
        
        const imageFile = files.image[0];
        const imageResult = await cloudinaryUploader.uploadImage(imageFile.path, 'testimonials/images');
        if (imageResult.success) {
          testimonial.image = {
            url: imageResult.url,
            publicId: imageResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(imageFile.path);
        }
      }
      
      await testimonial.save();
      
      return {
        success: true,
        data: testimonial
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a testimonial
   * @async
   * @param {string} testimonialId - ID of the testimonial to delete
   * @param {string} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} Object with success status or error
   */
  async deleteTestimonial(testimonialId, userId) {
    try {
      const testimonial = await Testimonial.findById(testimonialId);
      
      if (!testimonial) {
        return {
          success: false,
          error: 'Testimonial not found'
        };
      }
      
      // Check ownership
      if (testimonial.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to delete this testimonial'
        };
      }
      
      // Delete resources from Cloudinary
      if (testimonial.image && testimonial.image.publicId) {
        await cloudinaryUploader.deleteResource(testimonial.image.publicId);
      }
      
      await Testimonial.findByIdAndDelete(testimonialId);
      
      return {
        success: true,
        message: 'Testimonial deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new TestimonialService();