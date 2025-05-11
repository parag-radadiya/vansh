const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Terms and conditions schema
 * @typedef {Object} Terms
 * @property {string} title - Title of the terms
 * @property {string} content - Content of the terms in HTML format
 * @property {string} version - Version number of the terms
 * @property {boolean} isActive - Whether this version is currently active
 * @property {Date} effectiveDate - Date when these terms become effective
 * @property {string} updatedBy - ID of the user who last updated the terms
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Terms:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - version
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the terms
 *         title:
 *           type: string
 *           description: Title of the terms and conditions
 *         content:
 *           type: string
 *           description: Full content of the terms in HTML format
 *         version:
 *           type: string
 *           description: Version number of the terms
 *         isActive:
 *           type: boolean
 *           description: Whether this version is currently active
 *           default: false
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *           description: Date when these terms become effective
 *         updatedBy:
 *           type: string
 *           description: ID of the user who last updated the terms
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the terms were created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the terms were last updated
 *       example:
 *         _id: 60d21b4967d0d8992e610c85
 *         title: Terms of Service
 *         content: <h1>Terms of Service</h1><p>These are the terms and conditions...</p>
 *         version: 1.0
 *         isActive: true
 *         effectiveDate: 2023-01-01T00:00:00.000Z
 *         updatedBy: 60d21b4967d0d8992e610c85
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */
const TermsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
TermsSchema.index({ isActive: 1 });
TermsSchema.index({ version: 1 });

module.exports = mongoose.model('Terms', TermsSchema);