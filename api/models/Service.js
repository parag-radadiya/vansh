const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the service
 *         description:
 *           type: string
 *           description: Detailed description of the service
 *         icon:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: SVG icon for the service
 *         category:
 *           type: string
 *           description: Category of the service
 *         services:
 *           type: array
 *           items:
 *             type: string
 *           description: List of services offered
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this service
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the service was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the service was last updated
 *       example:
 *         title: Web Development
 *         description: Professional web development services for businesses
 *         icon: { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/services/icons/web.svg", publicId: "services/icons/web" }
 *         category: "IT Services"
 *         services: ["Frontend Development", "Backend Development", "Full-stack Solutions"]
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Service Schema
 * @typedef {Object} Service
 * @property {string} title - Title of the service
 * @property {string} description - Detailed description of the service
 * @property {Object} icon - SVG icon for the service
 * @property {string} icon.url - URL of the SVG icon
 * @property {string} icon.publicId - Public ID of the icon in Cloudinary
 * @property {string} category - Category of the service
 * @property {Array<string>} services - List of services offered
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this service
 * @property {Date} createdAt - Date when the service was created
 * @property {Date} updatedAt - Date when the service was last updated
 */
const ServiceSchema = new mongoose.Schema({
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
  icon: {
    url: String,
    publicId: String
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  services: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);