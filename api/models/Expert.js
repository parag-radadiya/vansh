const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expert:
 *       type: object
 *       required:
 *         - name
 *         - role
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the expert
 *         role:
 *           type: string
 *           description: Role or position of the expert
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Image of the expert
 *         description:
 *           type: string
 *           description: Detailed description of the expert
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this expert
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the expert was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the expert was last updated
 *       example:
 *         name: "John Smith"
 *         role: "Senior Technology Advisor"
 *         image: { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/experts/john.jpg", publicId: "experts/john" }
 *         description: "John is a technology expert with over 15 years of experience in software development and consulting."
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Expert Schema
 * @typedef {Object} Expert
 * @property {string} name - Name of the expert
 * @property {string} role - Role or position of the expert
 * @property {Object} image - Image of the expert
 * @property {string} image.url - URL of the image
 * @property {string} image.publicId - Public ID of the image in Cloudinary
 * @property {string} description - Detailed description of the expert
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this expert
 * @property {Date} createdAt - Date when the expert was created
 * @property {Date} updatedAt - Date when the expert was last updated
 */
const ExpertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Please provide a role'],
    trim: true,
    maxlength: [100, 'Role cannot be more than 100 characters']
  },
  image: {
    url: String,
    publicId: String
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

module.exports = mongoose.model('Expert', ExpertSchema);