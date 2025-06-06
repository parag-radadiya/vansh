const faqService = require('../services/faqService');

/**
 * FAQ controller for handling FAQ-related HTTP requests
 * @module faqController
 */
const faqController = {
  /**
   * Create new FAQ
   * @async
   * @function createFaq
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with FAQ data
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with new FAQ data or error
   */
  createFaq: async (req, res) => {
    try {
      const faqs = Array.isArray(req.body) ? req.body : [req.body];

      // Validate input
      for (const faq of faqs) {
        if (!faq.question) {
          return res.status(400).json({
            success: false,
            error: 'Each FAQ must have a question'
          });
        }
      }

      // Build FAQ data with user ID
      const faqDataArray = faqs.map(faq => ({
        question: faq.question,
        ans: faq.ans || '',
        category: faq.category || '',
        status: faq.status !== undefined ? faq.status : true,
        createdBy: req.user._id
      }));

      // Save all FAQs
      const createdFaqs = [];
      for (const faqData of faqDataArray) {
        const result = await faqService.createFaq(faqData);
        if (result.success) {
          createdFaqs.push(result.data);
        } else {
          return res.status(400).json(result); // Fail early if one fails
        }
      }

      res.status(201).json({
        success: true,
        data: createdFaqs
      });
    } catch (error) {
      console.error('FAQ creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },


  /**
   * Get all FAQs
   * @async
   * @function getAllFaqs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of FAQs or error
   */
  getAllFaqs: async (req, res) => {
    try {
      const result = await faqService.getAllFaqs();
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get active FAQs only
   * @async
   * @function getActiveFaqs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with array of active FAQs or error
   */
  getActiveFaqs: async (req, res) => {
    try {
      const result = await faqService.getActiveFaqs();
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get a FAQ by ID
   * @async
   * @function getFaqById
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - FAQ ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with FAQ data or error
   */
  getFaqById: async (req, res) => {
    try {
      const result = await faqService.getFaqById(req.params.id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Update a FAQ
   * @async
   * @function updateFaq
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - FAQ ID
   * @param {Object} req.body - Request body with updated data
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated FAQ data or error
   */
  updateFaq: async (req, res) => {
    try {
      const result = await faqService.updateFaq(
        req.params.id,
        req.body,
        req.user._id
      );
      
      if (!result.success) {
        return res.status(result.error === 'FAQ not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Delete a FAQ
   * @async
   * @function deleteFaq
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - FAQ ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteFaq: async (req, res) => {
    try {
      const result = await faqService.deleteFaq(req.params.id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'FAQ not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
};

module.exports = faqController;