const planService = require('../services/planService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Controller for plan management
 * @namespace planController
 */
const planController = {
  /**
   * Get all plans
   * @async
   * @function getAllPlans
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with plans data or error
   */
  getAllPlans: async (req, res) => {
    try {
      const result = await planService.getAllPlans(req.query);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getAllPlans controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve plans'
      });
    }
  },

  /**
   * Get plan by ID
   * @async
   * @function getPlanById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with plan data or error
   */
  getPlanById: async (req, res) => {
    try {
      const result = await planService.getPlanById(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getPlanById controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve plan'
      });
    }
  },

  /**
   * Create a new plan
   * @async
   * @function createPlan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created plan or error
   */
  createPlan: async (req, res) => {
    try {
      const { price, features, description, showHideFlag } = req.body;
      
      // Basic validation
      if (!price || !features || !description) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide price, features and description' 
        });
      }
      
      // Parse features if it's a string (JSON)
      let parsedFeatures = features;
      if (typeof features === 'string') {
        try {
          parsedFeatures = JSON.parse(features);
        } catch (e) {
          // If not a valid JSON array, treat as comma-separated values
          parsedFeatures = features.split(',').map(item => item.trim());
        }
      }
      
      const planData = { 
        price: Number(price),
        features: parsedFeatures,
        description
      };
      
      if (showHideFlag !== undefined) {
        planData.showHideFlag = showHideFlag === 'true' || showHideFlag === true;
      }
      
      const result = await planService.createPlan(planData, req.user.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      logger.error(`Error in createPlan controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create plan'
      });
    }
  },

  /**
   * Update a plan
   * @async
   * @function updatePlan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated plan or error
   */
  updatePlan: async (req, res) => {
    try {
      const { price, features, description, showHideFlag } = req.body;
      const updateData = {};
      
      // Add fields to update data if provided
      if (price !== undefined) updateData.price = Number(price);
      
      if (features) {
        // Parse features if it's a string (JSON)
        let parsedFeatures = features;
        if (typeof features === 'string') {
          try {
            parsedFeatures = JSON.parse(features);
          } catch (e) {
            // If not a valid JSON array, treat as comma-separated values
            parsedFeatures = features.split(',').map(item => item.trim());
          }
        }
        updateData.features = parsedFeatures;
      }
      
      if (description !== undefined) updateData.description = description;
      if (showHideFlag !== undefined) updateData.showHideFlag = showHideFlag === 'true' || showHideFlag === true;
      
      const result = await planService.updatePlan(req.params.id, updateData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updatePlan controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update plan'
      });
    }
  },

  /**
   * Toggle plan visibility
   * @async
   * @function togglePlanVisibility
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated plan or error
   */
  togglePlanVisibility: async (req, res) => {
    try {
      const result = await planService.togglePlanVisibility(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in togglePlanVisibility controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to toggle plan visibility'
      });
    }
  },

  /**
   * Delete a plan
   * @async
   * @function deletePlan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deletePlan: async (req, res) => {
    try {
      const result = await planService.deletePlan(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in deletePlan controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete plan'
      });
    }
  }
};

module.exports = planController;