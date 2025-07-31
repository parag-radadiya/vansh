const loanApplicationService = require('../services/loanApplicationService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Controller for loan applications
 * @namespace loanApplicationController
 */
const loanApplicationController = {
  /**
   * Get all loan applications
   * @async
   * @function getAllApplications
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with applications data or error
   */
  getAllApplications: async (req, res) => {
    try {
      const result = await loanApplicationService.getAllApplications(req.query);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getAllApplications controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve loan applications'
      });
    }
  },

  /**
   * Get loan application by ID
   * @async
   * @function getApplicationById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with application data or error
   */
  getApplicationById: async (req, res) => {
    try {
      const result = await loanApplicationService.getApplicationById(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getApplicationById controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve loan application'
      });
    }
  },

  /**
   * Create a new loan application
   * @async
   * @function createApplication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created application or error
   */
  createApplication: async (req, res) => {
    try {
      const { 
        loanType,
        fullName,
        email,
        pincode,
        loanAmount,
        phoneNumber,
        businessType,
        securityType,
        businessName,
        businessVintageYear,
        factoryOwnership,
        residentOwnership,
        service
      } = req.body;
      
      // Basic validation
      if (!loanType || !fullName || !email || !pincode || !loanAmount || !phoneNumber || !businessType || !securityType) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide all required fields' 
        });
      }
      
      // Additional validation for loan amount
      if (isNaN(loanAmount) || Number(loanAmount) <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Loan amount must be a positive number' 
        });
      }
      
      const applicationData = {
        loanType,
        fullName,
        email,
        pincode,
        loanAmount: Number(loanAmount),
        phoneNumber,
        businessType,
        securityType,
        businessName,
        businessVintageYear,
        factoryOwnership,
        residentOwnership,
        service
      };
      
      const result = await loanApplicationService.createApplication(applicationData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      logger.error(`Error in createApplication controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create loan application'
      });
    }
  },

  /**
   * Update application status
   * @async
   * @function updateApplicationStatus
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated application or error
   */
  updateApplicationStatus: async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide a status' 
        });
      }
      
      const result = await loanApplicationService.updateApplicationStatus(
        req.params.id,
        status,
        notes
      );
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updateApplicationStatus controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update application status'
      });
    }
  },

  /**
   * Delete an application
   * @async
   * @function deleteApplication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteApplication: async (req, res) => {
    try {
      const result = await loanApplicationService.deleteApplication(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in deleteApplication controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete application'
      });
    }
  }
};

module.exports = loanApplicationController;