const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Content:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         banner:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Banner image for the content
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Main image for the content
 *         video:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Video for the content
 *         title:
 *           type: string
 *           description: Title of the content
 *         description:
 *           type: string
 *           description: Detailed description of the content
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this content
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the content was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the content was last updated
 *       example:
 *         title: Sample Content
 *         description: This is a detailed description of the sample content
 *         banner: { url: "https://res.cloudinary.com/parag_demo/image/upload/v1234567890/content/banners/banner.jpg", publicId: "content/banners/banner" }
 *         image: { url: "https://res.cloudinary.com/parag_demo/image/upload/v1234567890/content/images/image.jpg", publicId: "content/images/image" }
 *         video: { url: "https://res.cloudinary.com/parag_demo/video/upload/v1234567890/content/videos/video.mp4", publicId: "content/videos/video" }
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Content Schema
 * @typedef {Object} Content
 * @property {Object} banner - Banner image for the content
 * @property {string} banner.url - URL of the banner image
 * @property {string} banner.publicId - Public ID of the banner in Cloudinary
 * @property {Object} image - Main image for the content
 * @property {string} image.url - URL of the main image
 * @property {string} image.publicId - Public ID of the image in Cloudinary
 * @property {Object} video - Video for the content
 * @property {string} video.url - URL of the video
 * @property {string} video.publicId - Public ID of the video in Cloudinary
 * @property {string} title - Title of the content
 * @property {string} description - Detailed description of the content
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this content
 * @property {Date} createdAt - Date when the content was created
 * @property {Date} updatedAt - Date when the content was last updated
 */
const ContentSchema = new mongoose.Schema({
  banner: {
    url: String,
    publicId: String
  },
  image: {
    url: String,
    publicId: String
  },
  video: {
    url: String,
    publicId: String
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);