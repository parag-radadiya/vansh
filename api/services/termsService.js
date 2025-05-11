const Terms = require('../models/Terms');

/**
 * Service for terms and conditions operations
 * @module termsService
 */
const termsService = {
  /**
   * Create a new terms and conditions document
   * @async
   * @function createTerms
   * @param {Object} termsData - Terms data
   * @returns {Promise<Object>} Response with terms or error
   */
  createTerms: async (termsData) => {
    try {
      // If this is set as active, deactivate all other terms
      if (termsData.isActive) {
        await Terms.updateMany({}, { isActive: false });
      }
      
      const terms = new Terms(termsData);
      await terms.save();
      
      return {
        success: true,
        data: terms,
        message: 'Terms created successfully'
      };
    } catch (error) {
      console.error('Terms creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create terms'
      };
    }
  },
  
  /**
   * Update existing terms and conditions
   * @async
   * @function updateTerms
   * @param {string} id - Terms ID
   * @param {Object} termsData - Updated terms data
   * @returns {Promise<Object>} Response with updated terms or error
   */
  updateTerms: async (id, termsData) => {
    try {
      // Check if terms exists
      const terms = await Terms.findById(id);
      
      if (!terms) {
        return {
          success: false,
          error: 'Terms not found'
        };
      }
      
      // If this is being set as active, deactivate all other terms
      if (termsData.isActive) {
        await Terms.updateMany({ _id: { $ne: id } }, { isActive: false });
      }
      
      // Update terms
      const updatedTerms = await Terms.findByIdAndUpdate(
        id,
        { $set: termsData },
        { new: true, runValidators: true }
      );
      
      return {
        success: true,
        data: updatedTerms,
        message: 'Terms updated successfully'
      };
    } catch (error) {
      console.error('Terms update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update terms'
      };
    }
  },
  
  /**
   * Get all terms and conditions with pagination
   * @async
   * @function getAllTerms
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Response with terms and pagination info
   */
  getAllTerms: async (page = 1, limit = 10) => {
    try {
      // Count total documents for pagination
      const total = await Terms.countDocuments();
      
      // Calculate pagination values
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const skip = (pageInt - 1) * limitInt;
      
      // Get terms with pagination
      const terms = await Terms.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitInt)
        .select('-__v');
      
      return {
        success: true,
        data: terms,
        pagination: {
          total,
          page: pageInt,
          limit: limitInt,
          pages: Math.ceil(total / limitInt)
        }
      };
    } catch (error) {
      console.error('Get all terms error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch terms'
      };
    }
  },
  
  /**
   * Get terms by ID
   * @async
   * @function getTermsById
   * @param {string} id - Terms ID
   * @returns {Promise<Object>} Response with terms or error
   */
  getTermsById: async (id) => {
    try {
      const terms = await Terms.findById(id).select('-__v');
      
      if (!terms) {
        return {
          success: false,
          error: 'Terms not found'
        };
      }
      
      return {
        success: true,
        data: terms
      };
    } catch (error) {
      console.error('Get terms by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch terms'
      };
    }
  },
  
  /**
   * Get the current active terms
   * @async
   * @function getActiveTerms
   * @returns {Promise<Object>} Response with active terms or error
   */
  getActiveTerms: async () => {
    try {
      const terms = await Terms.findOne({ isActive: true }).select('-__v');
      
      if (!terms) {
        return {
          success: false,
          error: 'No active terms found'
        };
      }
      
      return {
        success: true,
        data: terms
      };
    } catch (error) {
      console.error('Get active terms error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active terms'
      };
    }
  },
  
  /**
   * Delete terms by ID
   * @async
   * @function deleteTerms
   * @param {string} id - Terms ID
   * @returns {Promise<Object>} Response with success message or error
   */
  deleteTerms: async (id) => {
    try {
      const terms = await Terms.findById(id);
      
      if (!terms) {
        return {
          success: false,
          error: 'Terms not found'
        };
      }
      
      // Don't allow deletion of active terms
      if (terms.isActive) {
        return {
          success: false,
          error: 'Cannot delete currently active terms'
        };
      }
      
      await Terms.findByIdAndDelete(id);
      
      return {
        success: true,
        message: 'Terms deleted successfully'
      };
    } catch (error) {
      console.error('Delete terms error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete terms'
      };
    }
  },
  
  /**
   * Set terms as active
   * @async
   * @function setTermsActive
   * @param {string} id - Terms ID
   * @returns {Promise<Object>} Response with updated terms or error
   */
  setTermsActive: async (id) => {
    try {
      const terms = await Terms.findById(id);
      
      if (!terms) {
        return {
          success: false,
          error: 'Terms not found'
        };
      }
      
      // Deactivate all terms
      await Terms.updateMany({}, { isActive: false });
      
      // Set the specified terms as active
      terms.isActive = true;
      await terms.save();
      
      return {
        success: true,
        data: terms,
        message: 'Terms set as active successfully'
      };
    } catch (error) {
      console.error('Set terms active error:', error);
      return {
        success: false,
        error: error.message || 'Failed to set terms as active'
      };
    }
  }
};

module.exports = termsService;