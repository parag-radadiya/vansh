const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       required:
 *         - price
 *         - description
 *         - features
 *       properties:
 *         price:
 *           type: number
 *           description: Price of the plan
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of features included in the plan
 *         description:
 *           type: string
 *           description: Detailed description of the plan
 *         showHideFlag:
 *           type: boolean
 *           description: Whether the plan should be visible
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created this plan
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the plan was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the plan was last updated
 *       example:
 *         price: 99.99
 *         features: ["Feature 1", "Feature 2", "Feature 3"]
 *         description: "Premium plan with all the features you need"
 *         showHideFlag: true
 *         createdBy: "60d0fe4f5311236168a109ca"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Plan Schema
 * @typedef {Object} Plan
 * @property {number} price - Price of the plan
 * @property {Array<string>} features - Features included in the plan
 * @property {string} description - Detailed description of the plan
 * @property {boolean} showHideFlag - Whether the plan should be visible
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the user who created this plan
 * @property {Date} createdAt - Date when the plan was created
 * @property {Date} updatedAt - Date when the plan was last updated
 */
const PlanSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  features: {
    type: [String],
    required: [true, 'Please provide at least one feature'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Please add at least one feature'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
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

module.exports = mongoose.model('Plan', PlanSchema);