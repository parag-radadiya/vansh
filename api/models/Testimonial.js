const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonial:
 *       type: object
 *       required:
 *         - name
 *         - feedback
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the person giving the testimonial
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Image of the person
 *         feedback:
 *           type: string
 *           description: Testimonial feedback text
 *         stars:
 *           type: number
 *           description: Optional rating (1-5 stars)
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this testimonial
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the testimonial was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the testimonial was last updated
 *       example:
 *         name: "John Doe"
 *         image: { url: "https://res.cloudinary.com/demo/image/upload/v1234567890/testimonials/john.jpg", publicId: "testimonials/john" }
 *         feedback: "Great service! Highly recommended."
 *         stars: 5
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Testimonial Schema
 * @typedef {Object} Testimonial
 * @property {string} name - Name of the person giving the testimonial
 * @property {Object} image - Image of the person
 * @property {string} image.url - URL of the image
 * @property {string} image.publicId - Public ID of the image in Cloudinary
 * @property {string} feedback - Testimonial feedback text
 * @property {number} stars - Optional rating (1-5 stars)
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this testimonial
 * @property {Date} createdAt - Date when the testimonial was created
 * @property {Date} updatedAt - Date when the testimonial was last updated
 */
const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  image: {
    url: String,
    publicId: String
  },
  feedback: {
    type: String,
    required: [true, 'Please provide feedback'],
    trim: true,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  stars: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 5
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);