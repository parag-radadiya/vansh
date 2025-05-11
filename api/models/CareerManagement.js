const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     CareerManagement:
 *       type: object
 *       required:
 *         - category
 *         - role
 *         - description
 *       properties:
 *         category:
 *           type: string
 *           description: Category of the career opportunity
 *         role:
 *           type: string
 *           description: Job role or position title
 *         description:
 *           type: string
 *           description: Detailed description of the job opportunity
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Image for the career opportunity
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this career opportunity
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the career opportunity was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the career opportunity was last updated
 *       example:
 *         category: "Engineering"
 *         role: "Senior Software Developer"
 *         description: "We are looking for an experienced software developer with expertise in React and Node.js."
 *         image: { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/careers/images/developer.jpg", publicId: "careers/images/developer" }
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * CareerManagement Schema
 * @typedef {Object} CareerManagement
 * @property {string} category - Category of the career opportunity
 * @property {string} role - Job role or position title
 * @property {string} description - Detailed description of the job opportunity
 * @property {Object} image - Image for the career opportunity
 * @property {string} image.url - URL of the image
 * @property {string} image.publicId - Public ID of the image in Cloudinary
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this career opportunity
 * @property {Date} createdAt - Date when the career opportunity was created
 * @property {Date} updatedAt - Date when the career opportunity was last updated
 */
const CareerManagementSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Please provide a role'],
    trim: true,
    maxlength: [100, 'Role cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  image: {
    url: String,
    publicId: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CareerManagement', CareerManagementSchema);