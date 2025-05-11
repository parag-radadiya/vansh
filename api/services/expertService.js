const Expert = require('../models/Expert');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Service class for handling expert-related business logic
 * @class ExpertService
 */
class ExpertService {
  /**
   * Get all experts
   * @async
   * @param {Object} query - Query parameters for pagination
   * @param {number} query.page - Page number
   * @param {number} query.limit - Items per page
   * @returns {Promise<Object>} Object containing success status and experts data or error message
   */
  async getAllExperts(query = {}) {
    try {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      const experts = await Expert.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');
        
      const total = await Expert.countDocuments();
      
      return {
        success: true,
        data: experts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error retrieving experts: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get expert by ID
   * @async
   * @param {string} id - Expert ID
   * @returns {Promise<Object>} Object containing success status and expert data or error message
   */
  async getExpertById(id) {
    try {
      const expert = await Expert.findById(id).populate('createdBy', 'name email');
      
      if (!expert) {
        return {
          success: false,
          error: 'Expert not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: expert
      };
    } catch (error) {
      logger.error(`Error retrieving expert: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Create a new expert
   * @async
   * @param {Object} expertData - Expert data
   * @param {string} expertData.name - Expert name
   * @param {string} expertData.role - Expert role
   * @param {string} expertData.description - Expert description
   * @param {Object} [expertData.image] - Expert image
   * @param {string} userId - ID of the user creating the expert
   * @returns {Promise<Object>} Object containing success status and created expert or error message
   */
  async createExpert(expertData, userId) {
    try {
      const expert = await Expert.create({
        ...expertData,
        createdBy: userId
      });
      
      return {
        success: true,
        data: expert
      };
    } catch (error) {
      logger.error(`Error creating expert: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.name === 'ValidationError' 
          ? httpStatus.BAD_REQUEST 
          : httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Update an expert
   * @async
   * @param {string} id - Expert ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Object containing success status and updated expert or error message
   */
  async updateExpert(id, updateData) {
    try {
      const expert = await Expert.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!expert) {
        return {
          success: false,
          error: 'Expert not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: expert
      };
    } catch (error) {
      logger.error(`Error updating expert: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.name === 'ValidationError' 
          ? httpStatus.BAD_REQUEST 
          : httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Delete an expert
   * @async
   * @param {string} id - Expert ID
   * @returns {Promise<Object>} Object containing success status and message or error
   */
  async deleteExpert(id) {
    try {
      const expert = await Expert.findByIdAndDelete(id);
      
      if (!expert) {
        return {
          success: false,
          error: 'Expert not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        message: 'Expert deleted successfully'
      };
    } catch (error) {
      logger.error(`Error deleting expert: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}

module.exports = new ExpertService();