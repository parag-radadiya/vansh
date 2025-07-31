const LoanApplication = require('../models/LoanApplication');
const httpStatus = require('http-status');
const logger = require('../utils/logger/logger');
const emailService = require('../utils/email/emailService');

/**
 * Service class for handling loan application-related business logic
 * @class LoanApplicationService
 */
class LoanApplicationService {
  /**
   * Get all loan applications
   * @async
   * @param {Object} query - Query parameters for filtering and pagination
   * @param {number} query.page - Page number
   * @param {number} query.limit - Items per page
   * @param {string} query.status - Filter by status
   * @param {string} query.loanType - Filter by loan type
   * @returns {Promise<Object>} Object containing success status and application data or error message
   */
  async getAllApplications(query = {}) {
    try {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      if (query.status && ['pending', 'reviewing', 'approved', 'rejected'].includes(query.status)) {
        filter.status = query.status;
      }
      
      if (query.loanType) {
        filter.loanType = { $regex: new RegExp(query.loanType, 'i') };
      }
      
      // Additional filters if provided
      if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        filter.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { businessType: searchRegex },
          { securityType: searchRegex },
          { pincode: searchRegex }
        ];
      }
      
      // Filter by loan amount range if provided
      if (query.minAmount) {
        filter.loanAmount = { ...filter.loanAmount || {}, $gte: Number(query.minAmount) };
      }
      
      if (query.maxAmount) {
        filter.loanAmount = { ...filter.loanAmount || {}, $lte: Number(query.maxAmount) };
      }
      
      const applications = await LoanApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      const total = await LoanApplication.countDocuments(filter);
      
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
      logger.error(`Error retrieving loan applications: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get loan application by ID
   * @async
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Object containing success status and application data or error message
   */
  async getApplicationById(id) {
    try {
      const application = await LoanApplication.findById(id);
      
      if (!application) {
        return {
          success: false,
          error: 'Loan application not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: application
      };
    } catch (error) {
      logger.error(`Error retrieving loan application: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Create a new loan application
   * @async
   * @param {Object} applicationData - Loan application data
   * @returns {Promise<Object>} Object containing success status and created application or error message
   */
  async createApplication(applicationData) {
    try {
      const application = await LoanApplication.create(applicationData);

      // Format loan amount for display
      const formattedAmount = `₹${Number(application.loanAmount).toLocaleString('en-IN')}`;

      // Send confirmation email to applicant
      try {
        await emailService.sendEmail({
          to: application.email,
          subject: 'Loan Application Received',
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #333;">Thank You for Your Application</h2>
            <p>Dear ${application.fullName},</p>
            <p>Thank you for applying for a <strong>${application.loanType}</strong>. We have received your application and will review it shortly.</p>
            <p>Your application reference number is: <strong>${application._id}</strong></p>
            <p>Best regards,<br>The Loan Team</p>
          </div>
        `
        });
      } catch (emailError) {
        logger.error(`Failed to send confirmation email: ${emailError.message}`);
        // Continue processing even if email fails
      }

      // Send notification email to admin
      try {
        const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #333;">📋 Loan Application Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr><td><strong>Loan Type:</strong></td><td>${application.loanType}</td></tr>
              <tr><td><strong>Full Name:</strong></td><td>${application.fullName}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${application.email}</td></tr>
              <tr><td><strong>Phone Number:</strong></td><td>${application.phoneNumber}</td></tr>
              <tr><td><strong>Pincode:</strong></td><td>${application.pincode}</td></tr>
              <tr><td><strong>Loan Amount:</strong></td><td>${formattedAmount}</td></tr>
              <tr><td><strong>Business Type:</strong></td><td>${application.businessType}</td></tr>
              <tr><td><strong>Security Type:</strong></td><td>${application.securityType}</td></tr>
              <tr><td><strong>Business Name:</strong></td><td>${application.businessName}</td></tr>
              <tr><td><strong>Business Vintage Year:</strong></td><td>${application.businessVintage}</td></tr>
              <tr><td><strong>Factory Ownership:</strong></td><td>${application.factoryOwnership}</td></tr>
              <tr><td><strong>Resident Ownership:</strong></td><td>${application.residentOwnership}</td></tr>
            </tbody>
          </table>
        </div>
      `;

        await emailService.sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: 'New Loan Application',
          html: adminHtml
        });
      } catch (emailError) {
        logger.error(`Failed to send admin notification email: ${emailError.message}`);
        // Continue processing even if email fails
      }

      return {
        success: true,
        data: application
      };
    } catch (error) {
      logger.error(`Error creating loan application: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode:
            error.name === 'ValidationError'
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
      if (!['pending', 'reviewing', 'approved', 'rejected'].includes(status)) {
        return {
          success: false,
          error: 'Invalid status value',
          statusCode: httpStatus.BAD_REQUEST
        };
      }
      
      const application = await LoanApplication.findById(id);
      
      if (!application) {
        return {
          success: false,
          error: 'Loan application not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      const previousStatus = application.status;
      application.status = status;
      
      if (notes) {
        application.notes = notes;
      }
      
      await application.save();
      
      // Send status update email to applicant when status changes to approved or rejected
      if (previousStatus !== status && ['approved', 'rejected'].includes(status)) {
        try {
          let subject, message;
          
          if (status === 'approved') {
            subject = 'Your Loan Application Has Been Approved';
            message = `Dear ${application.fullName},\n\nWe are pleased to inform you that your application for a ${application.loanType} of ₹${application.loanAmount} has been approved. Our representative will contact you shortly to discuss the next steps.\n\nBest regards,\nThe Loan Team`;
          } else if (status === 'rejected') {
            subject = 'Your Loan Application Status';
            message = `Dear ${application.fullName},\n\nThank you for your interest in our ${application.loanType}. After careful consideration of your application, we regret to inform you that we are unable to approve your request at this time. \n\nIf you have any questions or would like to discuss alternative options, please don't hesitate to contact us.\n\nBest regards,\nThe Loan Team`;
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
      logger.error(`Error updating loan application status: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Delete a loan application
   * @async
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Object containing success status and message or error
   */
  async deleteApplication(id) {
    try {
      const application = await LoanApplication.findByIdAndDelete(id);
      
      if (!application) {
        return {
          success: false,
          error: 'Loan application not found',
          statusCode: httpStatus.NOT_FOUND
        };
      }
      
      return {
        success: true,
        message: 'Loan application deleted successfully'
      };
    } catch (error) {
      logger.error(`Error deleting loan application: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}

module.exports = new LoanApplicationService();