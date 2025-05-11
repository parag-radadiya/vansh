const addressService = require('../services/addressService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Controller for addresses
 * @namespace addressController
 */
const addressController = {
  /**
   * Get all addresses for the authenticated user
   * @async
   * @function getUserAddresses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with addresses data or error
   */
  getUserAddresses: async (req, res) => {
    try {
      const userId = req.user._id;
      const result = await addressService.getUserAddresses(userId);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getUserAddresses controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve addresses'
      });
    }
  },

  /**
   * Get address by ID
   * @async
   * @function getAddressById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with address data or error
   */
  getAddressById: async (req, res) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;
      
      const result = await addressService.getAddressById(addressId, userId);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getAddressById controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve address'
      });
    }
  },

  /**
   * Get default address for the authenticated user
   * @async
   * @function getDefaultAddress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with default address data or error
   */
  getDefaultAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const result = await addressService.getDefaultAddress(userId);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getDefaultAddress controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve default address'
      });
    }
  },

  /**
   * Create a new address
   * @async
   * @function createAddress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created address or error
   */
  createAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const { 
        addressType,
        addressLine1,
        addressLine2,
        landmark,
        city,
        district,
        state,
        pincode,
        country,
        isDefault,
        latitude,
        longitude
      } = req.body;
      
      // Basic validation
      if (!addressLine1 || !city || !state || !pincode) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide all required fields' 
        });
      }
      
      const addressData = {
        userId,
        addressType,
        addressLine1,
        addressLine2,
        landmark,
        city,
        district,
        state,
        pincode,
        country,
        isDefault,
        latitude,
        longitude
      };
      
      const result = await addressService.createAddress(addressData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      logger.error(`Error in createAddress controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create address'
      });
    }
  },

  /**
   * Update an address
   * @async
   * @function updateAddress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated address or error
   */
  updateAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;
      const addressData = req.body;
      
      // Remove unnecessary fields that shouldn't be updated directly
      delete addressData.userId;
      
      const result = await addressService.updateAddress(addressId, addressData, userId);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updateAddress controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update address'
      });
    }
  },

  /**
   * Set an address as default
   * @async
   * @function setDefaultAddress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated address or error
   */
  setDefaultAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;
      
      const result = await addressService.setDefaultAddress(addressId, userId);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in setDefaultAddress controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to set default address'
      });
    }
  },

  /**
   * Delete an address
   * @async
   * @function deleteAddress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;
      
      const result = await addressService.deleteAddress(addressId, userId);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in deleteAddress controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete address'
      });
    }
  },

  /**
   * Search addresses
   * @async
   * @function searchAddresses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with search results or error
   */
  searchAddresses: async (req, res) => {
    try {
      const result = await addressService.searchAddresses(req.query);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in searchAddresses controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to search addresses'
      });
    }
  }
};

module.exports = addressController;