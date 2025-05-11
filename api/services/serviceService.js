const Service = require('../models/Service');
const cloudinaryUploader = require('../config/cloudinary/uploader');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Service for handling service-related operations
 * @class ServiceService
 */
class ServiceService {
  /**
   * Create a new service entry
   * @async
   * @param {Object} serviceData - Service data
   * @param {string} serviceData.title - Service title
   * @param {string} serviceData.description - Service description
   * @param {string} serviceData.category - Service category
   * @param {Array<string>} serviceData.services - List of services offered
   * @param {Object} serviceData.createdBy - User who created the service
   * @param {Object} [files] - Uploaded files
   * @returns {Promise<Object>} Object with success status and service data or error
   */
  async createService(serviceData, files = {}) {
    try {
      const service = new Service({
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        services: serviceData.services || [],
        createdBy: serviceData.createdBy
      });
      
      // Process icon if uploaded
      if (files.icon && files.icon[0]) {
        const iconFile = files.icon[0];
        const iconResult = await cloudinaryUploader.uploadImage(iconFile.path, 'services/icons');
        if (iconResult.success) {
          service.icon = {
            url: iconResult.url,
            publicId: iconResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(iconFile.path);
        }
      }
      
      await service.save();
      
      return {
        success: true,
        data: service
      };
    } catch (error) {
      console.error('Error creating service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all service entries
   * @async
   * @returns {Promise<Object>} Object with success status and array of services or error
   */
  async getAllServices() {
    try {
      const services = await Service.find().populate('createdBy', 'email');
      
      return {
        success: true,
        data: services
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single service entry by ID
   * @async
   * @param {string} serviceId - ID of the service to retrieve
   * @returns {Promise<Object>} Object with success status and service data or error
   */
  async getServiceById(serviceId) {
    try {
      const service = await Service.findById(serviceId).populate('createdBy', 'email');
      
      if (!service) {
        return {
          success: false,
          error: 'Service not found'
        };
      }
      
      return {
        success: true,
        data: service
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a service entry
   * @async
   * @param {string} serviceId - ID of the service to update
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.title] - Updated title
   * @param {string} [updateData.description] - Updated description
   * @param {string} [updateData.category] - Updated category
   * @param {Array<string>} [updateData.services] - Updated list of services
   * @param {Object} [files] - Uploaded files to update
   * @param {string} userId - ID of the user performing the update
   * @returns {Promise<Object>} Object with success status and updated service data or error
   */
  async updateService(serviceId, updateData, files = {}, userId) {
    try {
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return {
          success: false,
          error: 'Service not found'
        };
      }
      
      // Check ownership
      if (service.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to update this service'
        };
      }
      
      // Update text fields if provided
      if (updateData.title) service.title = updateData.title;
      if (updateData.description) service.description = updateData.description;
      if (updateData.category) service.category = updateData.category;
      if (updateData.services) service.services = updateData.services;
      
      // Update icon if uploaded
      if (files.icon && files.icon[0]) {
        // Delete old icon if exists
        if (service.icon && service.icon.publicId) {
          await cloudinaryUploader.deleteResource(service.icon.publicId);
        }
        
        const iconFile = files.icon[0];
        const iconResult = await cloudinaryUploader.uploadImage(iconFile.path, 'services/icons');
        if (iconResult.success) {
          service.icon = {
            url: iconResult.url,
            publicId: iconResult.publicId
          };
          // Clean up uploaded file
          await unlinkAsync(iconFile.path);
        }
      }
      
      await service.save();
      
      return {
        success: true,
        data: service
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a service entry
   * @async
   * @param {string} serviceId - ID of the service to delete
   * @param {string} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} Object with success status or error
   */
  async deleteService(serviceId, userId) {
    try {
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return {
          success: false,
          error: 'Service not found'
        };
      }
      
      // Check ownership
      if (service.createdBy.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to delete this service'
        };
      }
      
      // Delete resources from Cloudinary
      if (service.icon && service.icon.publicId) {
        await cloudinaryUploader.deleteResource(service.icon.publicId);
      }
      
      await Service.findByIdAndDelete(serviceId);
      
      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ServiceService();