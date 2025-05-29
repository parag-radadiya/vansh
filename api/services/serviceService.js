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
// service.service.js
  async createService(serviceData, files = {}) {
    try {
      const service = new Service({
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        services: serviceData.services || [],
        createdBy: serviceData.createdBy,
        subservices: [] // populate below
      });

      // Process main icon
      if (files.icon && files.icon[0]) {
        const iconFile = files.icon[0];
        const iconResult = await cloudinaryUploader.uploadImage(iconFile.path, 'services/icons');
        if (iconResult.success) {
          service.icon = {
            url: iconResult.url,
            publicId: iconResult.publicId
          };
          await unlinkAsync(iconFile.path);
        }
      }

      // Handle subservices if any
      if (Array.isArray(serviceData.subservices)) {
        for (let i = 0; i < serviceData.subservices.length; i++) {
          const sub = serviceData.subservices[i];

          let imgUrl = '', imgPublicId = '';
          const subFile = files[`subservices[${i}][img]`] && files[`subservices[${i}][img]`][0];

          if (subFile) {
            const uploadResult = await cloudinaryUploader.uploadImage(subFile.path, 'services/subservices');
            if (uploadResult.success) {
              imgUrl = uploadResult.url;
              imgPublicId = uploadResult.publicId;
              await unlinkAsync(subFile.path);
            }
          }

          service.subservices.push({
            title: sub.title,
            des: sub.des,
            img: imgUrl,
            servicefaq: sub.servicefaq || []
          });
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

  async getSubserviceById(subserviceId) {
    try {
      // Find the service document that contains this subservice by subservice _id
      const service = await Service.findOne({ 'subservices._id': subserviceId }, { 'subservices.$': 1 });

      if (!service || !service.subservices || service.subservices.length === 0) {
        return {
          success: false,
          error: 'Subservice not found'
        };
      }

      // service.subservices[0] will contain the matched subservice
      return {
        success: true,
        data: service.subservices[0]
      };
    } catch (error) {
      console.error('Error fetching subservice:', error);
      return {
        success: false,
        error: 'Invalid subservice ID or server error'
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
  async updateService(serviceId, serviceData, files = {}) {
    try {
      const service = await Service.findById(serviceId);
      if (!service) {
        return { success: false, error: 'Service not found' };
      }

      // Update base fields if provided
      if (serviceData.title) service.title = serviceData.title;
      if (serviceData.description) service.description = serviceData.description;
      if (serviceData.category) service.category = serviceData.category;
      if (serviceData.services) {
        service.services = Array.isArray(serviceData.services)
            ? serviceData.services
            : [serviceData.services];
      }

      // Handle main icon update
      if (files.icon && files.icon[0]) {
        const iconFile = files.icon[0];
        // Optional: delete old icon from Cloudinary here if needed
        const iconResult = await cloudinaryUploader.uploadImage(iconFile.path, 'services/icons');
        if (iconResult.success) {
          service.icon = {
            url: iconResult.url,
            publicId: iconResult.publicId
          };
          await unlinkAsync(iconFile.path);
        }
      }

      // Replace subservices entirely if provided
      if (Array.isArray(serviceData.subservices)) {
        service.subservices = []; // clear old subservices

        for (let i = 0; i < serviceData.subservices.length; i++) {
          const sub = serviceData.subservices[i];

          let imgUrl = '';
          const subFile = files[`subservices[${i}][img]`] && files[`subservices[${i}][img]`][0];

          if (subFile) {
            const uploadResult = await cloudinaryUploader.uploadImage(subFile.path, 'services/subservices');
            if (uploadResult.success) {
              imgUrl = uploadResult.url;
              await unlinkAsync(subFile.path);
            }
          }

          service.subservices.push({
            title: sub.title,
            des: sub.des,
            overview: sub.overview,
            documentsRequired: sub.documentsRequired,
            eligibility: sub.eligibility,
            interestRates: sub.interestRates,
            img: imgUrl,
            servicefaq: sub.servicefaq || []
          });
        }
      }

      await service.save();

      return {
        success: true,
        data: service
      };
    } catch (error) {
      console.error('Error updating service:', error);
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