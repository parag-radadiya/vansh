const termsService = require('../services/termsService');

/**
 * Controller for terms and conditions operations
 * @module termsController
 */
const termsController = {
  /**
   * Create new terms and conditions
   * @async
   * @function createTerms
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with created terms data or error
   */
  createTerms: async (req, res) => {
    try {
      const { title, content, version, isActive, effectiveDate } = req.body;
      
      if (!title || !content || !version) {
        return res.status(400).json({
          success: false,
          error: 'Title, content and version are required'
        });
      }
      
      const result = await termsService.createOrUpdateTerms(
        {
          title,
          content,
          version,
          isActive: isActive === 'true' || isActive === true,
          effectiveDate
        },
        req.user._id
      );
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Create terms error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Update existing terms and conditions
   * @async
   * @function updateTerms
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with updated terms data or error
   */
  updateTerms: async (req, res) => {
    try {
      const id = req.params.id;
      const { title, content, version, isActive, effectiveDate } = req.body;
      
      // Convert isActive to boolean if provided
      let isActiveBool;
      if (isActive !== undefined) {
        isActiveBool = isActive === 'true' || isActive === true;
      }
      
      const result = await termsService.createOrUpdateTerms(
        {
          title,
          content,
          version,
          isActive: isActiveBool,
          effectiveDate
        },
        req.user._id,
        id
      );
      
      if (!result.success) {
        return res.status(result.error === 'Terms not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Update terms error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get active terms and conditions
   * @async
   * @function getActiveTerms
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with active terms or error
   */
  getActiveTerms: async (req, res) => {
    try {
      const result = await termsService.getActiveTerms();
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Get active terms error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get all terms versions
   * @async
   * @function getAllTermsVersions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with all terms versions or error
   */
  getAllTermsVersions: async (req, res) => {
    try {
      const result = await termsService.getAllTermsVersions();
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Get all terms versions error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Get terms by ID
   * @async
   * @function getTermsById
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with terms data or error
   */
  getTermsById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await termsService.getTermsById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Get terms by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Set terms as active
   * @async
   * @function setTermsActive
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with activated terms or error
   */
  setTermsActive: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await termsService.setTermsActive(id, req.user._id);
      
      if (!result.success) {
        return res.status(result.error === 'Terms not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Set terms active error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  },
  
  /**
   * Delete terms
   * @async
   * @function deleteTerms
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteTerms: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await termsService.deleteTerms(id);
      
      if (!result.success) {
        return res.status(result.error === 'Terms not found' ? 404 : 400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Delete terms error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
};

module.exports = termsController;