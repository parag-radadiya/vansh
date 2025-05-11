const User = require('../models/User');

class UserService {
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