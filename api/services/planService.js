const Plan = require('../models/Plan');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Service class for handling plan-related business logic
 * @class PlanService
 */
class PlanService {
  /**
   * Get all plans
   * @async
   * @param {Object} query - Query parameters for pagination and filtering
   * @param {number} query.page - Page number
   * @param {number} query.limit - Items per page
   * @param {boolean} query.visibleOnly - Only return visible plans
   * @returns {Promise<Object>} Object containing success status and plans data or error message
   */
  async getAllPlans(query = {}) {
    try {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      if (query.visibleOnly === 'true') {
        filter.showHideFlag = true;
      }
      
      const plans = await Plan.find(filter)
        .sort({ price: 1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');
        
      const total = await Plan.countDocuments(filter);
      
      return {
        success: true,
        data: plans,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error retrieving plans: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get plan by ID
   * @async
   * @param {string} id - Plan ID
   * @returns {Promise<Object>} Object containing success status and plan data or error message
   */
  async getPlanById(id) {
    try {
      const plan = await Plan.findById(id).populate('createdBy', 'name email');
      
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: plan
      };
    } catch (error) {
      logger.error(`Error retrieving plan: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Create a new plan
   * @async
   * @param {Object} planData - Plan data
   * @param {number} planData.price - Plan price
   * @param {Array<string>} planData.features - Plan features
   * @param {string} planData.description - Plan description
   * @param {boolean} [planData.showHideFlag] - Plan visibility
   * @param {string} userId - ID of the user creating the plan
   * @returns {Promise<Object>} Object containing success status and created plan or error message
   */
  async createPlan(planData, userId) {
    try {
      const plan = await Plan.create({
        ...planData,
        createdBy: userId
      });
      
      return {
        success: true,
        data: plan
      };
    } catch (error) {
      logger.error(`Error creating plan: ${error.message}`);
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
   * Update a plan
   * @async
   * @param {string} id - Plan ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Object containing success status and updated plan or error message
   */
  async updatePlan(id, updateData) {
    try {
      const plan = await Plan.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: plan
      };
    } catch (error) {
      logger.error(`Error updating plan: ${error.message}`);
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
   * Toggle plan visibility
   * @async
   * @param {string} id - Plan ID
   * @returns {Promise<Object>} Object containing success status and updated plan or error message
   */
  async togglePlanVisibility(id) {
    try {
      const plan = await Plan.findById(id);
      
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      plan.showHideFlag = !plan.showHideFlag;
      await plan.save();
      
      return {
        success: true,
        data: plan
      };
    } catch (error) {
      logger.error(`Error toggling plan visibility: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Delete a plan
   * @async
   * @param {string} id - Plan ID
   * @returns {Promise<Object>} Object containing success status and message or error
   */
  async deletePlan(id) {
    try {
      const plan = await Plan.findByIdAndDelete(id);
      
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        message: 'Plan deleted successfully'
      };
    } catch (error) {
      logger.error(`Error deleting plan: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}

module.exports = new PlanService();