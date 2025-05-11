const Address = require('../models/Address');
const mongoose = require('mongoose');
const logger = require('../utils/logger/logger');

/**
 * Service class for address-related operations
 */
class AddressService {
  /**
   * Get all addresses for a user
   * @param {string} userId - ID of the user
   * @returns {Promise<Array>} - List of addresses
   */
  async getUserAddresses(userId) {
    try {
      return await Address.find({ userId }).sort({ isDefault: -1, updatedAt: -1 });
    } catch (error) {
      logger.error(`Error fetching user addresses: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get default address for a user
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} - Default address or null
   */
  async getDefaultAddress(userId) {
    try {
      return await Address.findOne({ userId, isDefault: true });
    } catch (error) {
      logger.error(`Error fetching default address: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get an address by ID and user ID for security
   * @param {string} addressId - ID of the address
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} - Found address
   */
  async getAddressById(addressId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new Error('Invalid address ID');
      }
      
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      return address;
    } catch (error) {
      logger.error(`Error fetching address by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new address
   * @param {Object} addressData - Address data to create
   * @param {string} userId - ID of the user creating the address
   * @returns {Promise<Object>} - Created address
   */
  async createAddress(addressData, userId) {
    try {
      // Add the userId to the address data
      const newAddressData = {
        ...addressData,
        userId
      };
      
      // If this is the first address for the user, make it default
      const addressCount = await Address.countDocuments({ userId });
      if (addressCount === 0) {
        newAddressData.isDefault = true;
      }
      
      // Create the new address
      const newAddress = new Address(newAddressData);
      await newAddress.save();
      
      return newAddress;
    } catch (error) {
      logger.error(`Error creating address: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing address
   * @param {string} addressId - ID of the address to update
   * @param {Object} addressData - New address data
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} - Updated address
   */
  async updateAddress(addressId, addressData, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new Error('Invalid address ID');
      }
      
      // Find the address by ID and user ID (ensures user owns the address)
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      // Update the address fields
      Object.keys(addressData).forEach(key => {
        if (addressData[key] !== undefined) {
          address[key] = addressData[key];
        }
      });
      
      // Save the updated address
      await address.save();
      
      return address;
    } catch (error) {
      logger.error(`Error updating address: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set an address as the default
   * @param {string} addressId - ID of the address to set as default
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} - Updated address
   */
  async setDefaultAddress(addressId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new Error('Invalid address ID');
      }
      
      // Find the address by ID and user ID
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      // Set the address as default
      address.isDefault = true;
      await address.save(); // The pre-save hook will handle updating other addresses
      
      return address;
    } catch (error) {
      logger.error(`Error setting default address: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an address
   * @param {string} addressId - ID of the address to delete
   * @param {string} userId - ID of the user
   * @returns {Promise<boolean>} - True if deleted
   */
  async deleteAddress(addressId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new Error('Invalid address ID');
      }
      
      // Find the address by ID and user ID
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      // Check if this is the default address
      const isDefault = address.isDefault;
      
      // Delete the address
      await address.deleteOne();
      
      // If the deleted address was the default, set another one as default
      if (isDefault) {
        const firstAddress = await Address.findOne({ userId }).sort({ updatedAt: -1 });
        if (firstAddress) {
          firstAddress.isDefault = true;
          await firstAddress.save();
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Error deleting address: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search addresses by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} - Found addresses
   */
  async searchAddresses(criteria) {
    try {
      const query = {};
      
      // Add search criteria to the query
      if (criteria.pincode) {
        query.pincode = criteria.pincode;
      }
      
      if (criteria.city) {
        query.city = new RegExp(criteria.city, 'i');
      }
      
      if (criteria.state) {
        query.state = new RegExp(criteria.state, 'i');
      }
      
      // Find addresses matching the criteria
      return await Address.find(query).limit(20).sort({ updatedAt: -1 });
    } catch (error) {
      logger.error(`Error searching addresses: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AddressService();