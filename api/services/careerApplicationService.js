const CareerApplication = require('../models/CareerApplication');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');
const emailService = require('../utils/email/emailService');

/**
 * Service class for handling career application-related business logic
 * @class CareerApplicationService
 */
class CareerApplicationService {
  /**
   * Get all career applications
   * @async
   * @param {Object} query - Query parameters for filtering and pagination
   * @param {number} query.page - Page number
   * @param {number} query.limit - Items per page
   * @param {string} query.status - Filter by status
   * @param {string} query.role - Filter by role
   * @returns {Promise<Object>} Object containing success status and application data or error message
   */
  async getAllApplications(query = {}) {
    try {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      if (query.status && ['pending', 'reviewed', 'shortlisted', 'rejected'].includes(query.status)) {
        filter.status = query.status;
      }
      
      if (query.role) {
        filter.role = { $regex: new RegExp(query.role, 'i') };
      }
      
      // Additional filters
      if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { city: searchRegex },
          { state: searchRegex }
        ];
      }
      
      const applications = await CareerApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      const total = await CareerApplication.countDocuments(filter);
      
      return {
        success: true,
        data: applications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error retrieving applications: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get application by ID
   * @async
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Object containing success status and application data or error message
   */
  async getApplicationById(id) {
    try {
      const application = await CareerApplication.findById(id);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: application
      };
    } catch (error) {
      logger.error(`Error retrieving application: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Create a new application
   * @async
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Object containing success status and created application or error message
   */
  async createApplication(applicationData) {
    try {
      const application = await CareerApplication.create(applicationData);
      
      // Send confirmation email to applicant
      try {
        await emailService.sendEmail({
          to: application.email,
          subject: 'Application Received',
          text: `Dear ${application.firstName} ${application.lastName},\n\nThank you for applying for the position of ${application.role}. We have received your application and will review it shortly.\n\nBest regards,\nThe Recruitment Team`
        });
      } catch (emailError) {
        logger.error(`Failed to send confirmation email: ${emailError.message}`);
        // Continue processing even if email fails
      }
      
      // Send notification to admin (optional)
      try {
        // You may want to notify admins about new applications
        // This would use your existing emailService
        /*
        await emailService.sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: 'New Job Application',
          text: `New job application received for ${application.role} from ${application.firstName} ${application.lastName}. Email: ${application.email}`
        });
        */
      } catch (emailError) {
        logger.error(`Failed to send admin notification email: ${emailError.message}`);
        // Continue processing even if email fails
      }
      
      return {
        success: true,
        data: application
      };
    } catch (error) {
      logger.error(`Error creating application: ${error.message}`);
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
   * Update application status
   * @async
   * @param {string} id - Application ID
   * @param {string} status - New status value
   * @param {string} [notes] - Optional notes about the status update
   * @returns {Promise<Object>} Object containing success status and updated application or error message
   */
  async updateApplicationStatus(id, status, notes) {
    try {
      if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
        return {
          success: false,
          error: 'Invalid status value',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      const application = await CareerApplication.findById(id);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      application.status = status;
      
      if (notes) {
        application.notes = notes;
      }
      
      await application.save();
      
      // Send status update email to applicant
      // Only enabled for shortlisted and rejected statuses
      if (['shortlisted', 'rejected'].includes(status)) {
        try {
          let subject, message;
          
          if (status === 'shortlisted') {
            subject = 'Your Application Has Been Shortlisted';
            message = `Dear ${application.firstName} ${application.lastName},\n\nWe are pleased to inform you that your application for the position of ${application.role} has been shortlisted. We will contact you soon to schedule an interview.\n\nBest regards,\nThe Recruitment Team`;
          } else {
            subject = 'Application Status Update';
            message = `Dear ${application.firstName} ${application.lastName},\n\nThank you for your interest in the position of ${application.role}. After careful consideration, we regret to inform you that we have decided to pursue other candidates whose qualifications more closely match our current needs. We appreciate your interest in our organization and wish you success in your job search.\n\nBest regards,\nThe Recruitment Team`;
          }
          
          await emailService.sendEmail({
            to: application.email,
            subject,
            text: message
          });
        } catch (emailError) {
          logger.error(`Failed to send status update email: ${emailError.message}`);
          // Continue processing even if email fails
        }
      }
      
      return {
        success: true,
        data: application
      };
    } catch (error) {
      logger.error(`Error updating application status: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Delete an application
   * @async
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Object containing success status and message or error
   */
  async deleteApplication(id) {
    try {
      const application = await CareerApplication.findByIdAndDelete(id);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        message: 'Application deleted successfully'
      };
    } catch (error) {
      logger.error(`Error deleting application: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}

module.exports = new CareerApplicationService();