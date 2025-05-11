const User = require('../models/User');

/**
 * Service class for handling user-related business logic
 * @class UserService
 */
class UserService {
  /**
   * Create a new user
   * @async
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} Object containing success status and user data or error message
   */
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return {
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new UserService();