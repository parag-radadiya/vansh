const Contact = require('../models/Contact');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');
const emailService = require('../utils/email/emailService');

/**
 * Service class for handling contact-related business logic
 * @class ContactService
 */
class ContactService {
  /**
   * Get all contact submissions
   * @async
   * @param {Object} query - Query parameters for filtering and pagination
   * @param {number} query.page - Page number
   * @param {number} query.limit - Items per page
   * @param {string} query.status - Filter by status (pending, inProgress, resolved)
   * @returns {Promise<Object>} Object containing success status and contact data or error message
   */
  async getAllContacts(query = {}) {
    try {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      if (query.status && ['pending', 'inProgress', 'resolved'].includes(query.status)) {
        filter.status = query.status;
      }
      
      // Additional filters if provided
      if (query.email) {
        filter.email = { $regex: new RegExp(query.email, 'i') };
      }
      
      if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { city: searchRegex },
          { state: searchRegex }
        ];
      }
      
      const contacts = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      const total = await Contact.countDocuments(filter);
      
      return {
        success: true,
        data: contacts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error retrieving contacts: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get contact by ID
   * @async
   * @param {string} id - Contact ID
   * @returns {Promise<Object>} Object containing success status and contact data or error message
   */
  async getContactById(id) {
    try {
      const contact = await Contact.findById(id);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: contact
      };
    } catch (error) {
      logger.error(`Error retrieving contact: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Create a new contact submission
   * @async
   * @param {Object} contactData - Contact submission data
   * @returns {Promise<Object>} Object containing success status and created contact or error message
   */
  async createContact(contactData) {
    try {
      const contact = await Contact.create(contactData);
      
      // Send notification email to admin (if configured)
      try {
        // You may want to add email notification to administrators
        // This would use your existing emailService
        await emailService.sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: 'New Contact Form Submission',
          text: `New contact form submission from ${contact.firstName} ${contact.lastName}. Email: ${contact.email}, Phone: ${contact.phoneNumber}`
        });

      } catch (emailError) {
        logger.error(`Failed to send contact notification email: ${emailError.message}`);
        // Continue processing even if email fails
      }
      
      return {
        success: true,
        data: contact
      };
    } catch (error) {
      logger.error(`Error creating contact: ${error.message}`);
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
   * Update a contact
   * @async
   * @param {string} id - Contact ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Object containing success status and updated contact or error message
   */
  async updateContact(id, updateData) {
    try {
      const contact = await Contact.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: contact
      };
    } catch (error) {
      logger.error(`Error updating contact: ${error.message}`);
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
   * Update contact status
   * @async
   * @param {string} id - Contact ID
   * @param {string} status - New status value
   * @returns {Promise<Object>} Object containing success status and updated contact or error message
   */
  async updateContactStatus(id, status) {
    try {
      if (!['pending', 'inProgress', 'resolved'].includes(status)) {
        return {
          success: false,
          error: 'Invalid status value',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      const contact = await Contact.findById(id);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      contact.status = status;
      await contact.save();
      
      return {
        success: true,
        data: contact
      };
    } catch (error) {
      logger.error(`Error updating contact status: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Delete a contact
   * @async
   * @param {string} id - Contact ID
   * @returns {Promise<Object>} Object containing success status and message or error
   */
  async deleteContact(id) {
    try {
      const contact = await Contact.findByIdAndDelete(id);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        message: 'Contact deleted successfully'
      };
    } catch (error) {
      logger.error(`Error deleting contact: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}

module.exports = new ContactService();