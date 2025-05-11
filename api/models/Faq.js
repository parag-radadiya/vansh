const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Faq:
 *       type: object
 *       required:
 *         - question
 *       properties:
 *         question:
 *           type: string
 *           description: Question text
 *         ans:
 *           type: string
 *           description: Answer text
 *         status:
 *           type: boolean
 *           description: Active status of the FAQ
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this FAQ
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the FAQ was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the FAQ was last updated
 *       example:
 *         question: "How do I reset my password?"
 *         ans: "You can reset your password by clicking on the 'Forgot Password' link on the login page."
 *         status: true
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * FAQ Schema
 * @typedef {Object} Faq
 * @property {string} question - Question text
 * @property {string} ans - Answer text
 * @property {boolean} status - Active status of the FAQ
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this FAQ
 * @property {Date} createdAt - Date when the FAQ was created
 * @property {Date} updatedAt - Date when the FAQ was last updated
 */
const FaqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
    maxlength: [300, 'Question cannot be more than 300 characters']
  },
  ans: {
    type: String,
    trim: true,
    maxlength: [1000, 'Answer cannot be more than 1000 characters']
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Faq', FaqSchema);