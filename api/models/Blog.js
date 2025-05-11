const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the blog post
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               publicId:
 *                 type: string
 *           description: Array of images for the blog post
 *         category:
 *           type: string
 *           description: Category of the blog post
 *         description:
 *           type: string
 *           description: Content of the blog post
 *         publishFlag:
 *           type: boolean
 *           description: Whether the blog post is published or draft
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the blog post
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this blog post
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the blog post was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the blog post was last updated
 *       example:
 *         title: "Introduction to Modern Web Development"
 *         images: [
 *           { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/blogs/web-dev1.jpg", publicId: "blogs/web-dev1" },
 *           { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/blogs/web-dev2.jpg", publicId: "blogs/web-dev2" }
 *         ]
 *         category: "Technology"
 *         description: "This article discusses modern web development techniques and best practices..."
 *         publishFlag: true
 *         tags: ["web development", "javascript", "react"]
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Blog Schema
 * @typedef {Object} Blog
 * @property {string} title - Title of the blog post
 * @property {Array<Object>} images - Array of images for the blog post
 * @property {string} images.url - URL of the image
 * @property {string} images.publicId - Public ID of the image in Cloudinary
 * @property {string} category - Category of the blog post
 * @property {string} description - Content of the blog post
 * @property {boolean} publishFlag - Whether the blog post is published or draft
 * @property {Array<string>} tags - Tags associated with the blog post
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this blog post
 * @property {Date} createdAt - Date when the blog post was created
 * @property {Date} updatedAt - Date when the blog post was last updated
 */
const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  publishFlag: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);