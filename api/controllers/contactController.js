const contactService = require('../services/contactService');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');

/**
 * Controller for contact us functionality
 * @namespace contactController
 */
const contactController = {
  /**
   * Get all contacts
   * @async
   * @function getAllContacts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with contacts data or error
   */
  getAllContacts: async (req, res) => {
    try {
      const result = await contactService.getAllContacts(req.query);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getAllContacts controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve contacts'
      });
    }
  },

  /**
   * Get contact by ID
   * @async
   * @function getContactById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with contact data or error
   */
  getContactById: async (req, res) => {
    try {
      const result = await contactService.getContactById(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in getContactById controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve contact'
      });
    }
  },

  /**
   * Create a new contact
   * @async
   * @function createContact
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created contact or error
   */
  createContact: async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        requestMessage, 
        pinCode, 
        state, 
        city, 
        message 
      } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !phoneNumber || !message) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide all required fields' 
        });
      }
      
      const contactData = { 
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        requestMessage, 
        pinCode, 
        state, 
        city, 
        message 
      };
      
      const result = await contactService.createContact(contactData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      logger.error(`Error in createContact controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create contact'
      });
    }
  },

  /**
   * Update a contact
   * @async
   * @function updateContact
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated contact or error
   */
  updateContact: async (req, res) => {
    try {
      const updateData = {};
      const allowedFields = [
        'firstName', 
        'lastName', 
        'email', 
        'phoneNumber', 
        'requestMessage', 
        'pinCode', 
        'state', 
        'city', 
        'message',
        'status'
      ];
      
      // Add fields to update data if provided
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      const result = await contactService.updateContact(req.params.id, updateData);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updateContact controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update contact'
      });
    }
  },

  /**
   * Update contact status
   * @async
   * @function updateContactStatus
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated contact or error
   */
  updateContactStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Please provide a status' 
        });
      }
      
      const result = await contactService.updateContactStatus(req.params.id, status);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in updateContactStatus controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update contact status'
      });
    }
  },

  /**
   * Delete a contact
   * @async
   * @function deleteContact
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteContact: async (req, res) => {
    try {
      const result = await contactService.deleteContact(req.params.id);
      
      if (!result.success) {
        return res.status(result.statusCode || httpStatus.BAD_REQUEST).json(result);
      }
      
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      logger.error(`Error in deleteContact controller: ${error.message}`);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete contact'
      });
    }
  }
};

module.exports = contactController;