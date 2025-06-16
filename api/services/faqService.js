const Faq = require('../models/Faq');

/**
 * Service for handling FAQ-related operations
 * @class FaqService
 */
class FaqService {
  /**
   * Create a new FAQ
   * @async
   * @param {Object} faqData - FAQ data
   * @param {string} faqData.question - FAQ question
   * @param {string} faqData.ans - FAQ answer
   * @param {boolean} faqData.status - FAQ status
   * @param {Object} faqData.createdBy - User who created the FAQ
   * @returns {Promise<Object>} Object with success status and FAQ data or error
   */
  async createFaq(faqData) {
    try {
      const faq = new Faq({
        question: faqData.question,
        ans: faqData.ans,
        status: faqData.status !== undefined ? faqData.status : true,
        createdBy: faqData.createdBy,
        category:faqData.category
      });
      
      await faq.save();
      
      return {
        success: true,
        data: faq
      };
    } catch (error) {
      console.error('Error creating FAQ:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all FAQs
   * @async
   * @returns {Promise<Object>} Object with success status and array of FAQs or error
   */
  async getAllFaqs() {
    try {
      const faqs = await Faq.find().populate('createdBy', 'email');
      
      return {
        success: true,
        data: faqs
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get active FAQs only
   * @async
   * @returns {Promise<Object>} Object with success status and array of active FAQs or error
   */
  async getActiveFaqs() {
    try {
      const faqs = await Faq.find({ status: true }).populate('createdBy', 'email');
      
      return {
        success: true,
        data: faqs
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a single FAQ by ID
   * @async
   * @param {string} faqId - ID of the FAQ to retrieve
   * @returns {Promise<Object>} Object with success status and FAQ data or error
   */
  async getFaqById(faqId) {
    try {
      const faq = await Faq.findById(faqId).populate('createdBy', 'email');
      
      if (!faq) {
        return {
          success: false,
          error: 'FAQ not found'
        };
      }
      
      return {
        success: true,
        data: faq
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a FAQ
   * @async
   * @param {string} faqId - ID of the FAQ to update
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.question] - Updated question
   * @param {string} [updateData.ans] - Updated answer
   * @param {boolean} [updateData.status] - Updated status
   * @param {string} userId - ID of the user performing the update
   * @returns {Promise<Object>} Object with success status and updated FAQ data or error
   */
  async updateFaq(faqId, updateData, userId) {
    try {
      const faq = await Faq.findById(faqId);
      
      if (!faq) {
        return {
          success: false,
          error: 'FAQ not found'
        };
      }
      
      // Check ownership or admin privileges can be added here
      if (faq.createdBy.toString() !== userId.toString()) {
        return {
          success: false,
          error: 'Not authorized to update this FAQ'
        };
      }
      
      // Update fields if provided
      if (updateData.question !== undefined) faq.question = updateData.question;
      if (updateData.ans !== undefined) faq.ans = updateData.ans;
      if (updateData.status !== undefined) faq.status = updateData.status;
      if (updateData.category !== undefined) faq.category = updateData.category;

      await faq.save();
      
      return {
        success: true,
        data: faq
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a FAQ
   * @async
   * @param {string} faqId - ID of the FAQ to delete
   * @param {string} userId - ID of the user performing the deletion
   * @returns {Promise<Object>} Object with success status or error
   */
  async deleteFaq(faqId, userId) {
    try {
      const faq = await Faq.findById(faqId);
      
      if (!faq) {
        return {
          success: false,
          error: 'FAQ not found'
        };
      }
      
      // Check ownership or admin privileges can be added here
      if (faq.createdBy.toString() !== userId.toString()) {
        return {
          success: false,
          error: 'Not authorized to delete this FAQ'
        };
      }
      
      await Faq.findByIdAndDelete(faqId);
      
      return {
        success: true,
        message: 'FAQ deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new FaqService();