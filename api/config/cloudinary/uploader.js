const cloudinaryConfig = require('./index');

/**
 * Cloudinary upload utilities
 * @module cloudinaryUploader
 */
const cloudinaryUploader = {
  /**
   * Upload an image to Cloudinary
   * @async
   * @function uploadImage
   * @param {string} imageBuffer - Base64 encoded image or file path
   * @param {string} [folder='images'] - Folder to store the image in Cloudinary
   * @returns {Promise<Object>} Cloudinary upload response
   */
  uploadImage: async (imageBuffer, folder = 'images') => {
    try {
      const cloudinary = cloudinaryConfig();
      const result = await cloudinary.uploader.upload(imageBuffer, {
        resource_type: 'image',
        folder
      });

      console.log("Cloudinary upload result:", result);
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Upload a video to Cloudinary
   * @async
   * @function uploadVideo
   * @param {string} videoPath - Path to video file
   * @param {string} [folder='videos'] - Folder to store the video in Cloudinary
   * @returns {Promise<Object>} Cloudinary upload response
   */
  uploadVideo: async (videoPath, folder = 'videos') => {
    try {
      const cloudinary = cloudinaryConfig();
      const result = await cloudinary.uploader.upload(videoPath, {
        resource_type: 'video',
        folder
      });
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Delete a resource from Cloudinary
   * @async
   * @function deleteResource
   * @param {string} publicId - Public ID of the resource to delete
   * @param {string} [resourceType='image'] - Type of resource ('image' or 'video')
   * @returns {Promise<Object>} Cloudinary delete response
   */
  deleteResource: async (publicId, resourceType = 'image') => {
    try {
      const cloudinary = cloudinaryConfig();
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return {
        success: result.result === 'ok',
        result: result.result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = cloudinaryUploader;