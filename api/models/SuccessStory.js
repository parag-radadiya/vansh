const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessStory:
 *       type: object
 *       required:
 *         - title
 *         - clientName
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the success story
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Image related to the success story
 *         clientName:
 *           type: string
 *           description: Name of the client or company
 *         content:
 *           type: string
 *           description: Detailed content of the success story
 *         showHideFlag:
 *           type: boolean
 *           description: Whether to display the story or not
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this success story
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the success story was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the success story was last updated
 *       example:
 *         title: "Company X Digital Transformation"
 *         image: { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/stories/company-x.jpg", publicId: "stories/company-x" }
 *         clientName: "Company X"
 *         content: "This is the detailed story of how Company X transformed their digital landscape..."
 *         showHideFlag: true
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Success Story Schema
 * @typedef {Object} SuccessStory
 * @property {string} title - Title of the success story
 * @property {Object} image - Image related to the success story
 * @property {string} image.url - URL of the image
 * @property {string} image.publicId - Public ID of the image in Cloudinary
 * @property {string} clientName - Name of the client or company
 * @property {string} content - Detailed content of the success story
 * @property {boolean} showHideFlag - Whether to display the story or not
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this success story
 * @property {Date} createdAt - Date when the success story was created
 * @property {Date} updatedAt - Date when the success story was last updated
 */
const SuccessStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  image: {
    url: String,
    publicId: String
  },
  clientName: {
    type: String,
    required: [true, 'Please provide a client name'],
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true
  },
  showHideFlag: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SuccessStory', SuccessStorySchema);