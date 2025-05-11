const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT refresh token
 *         user:
 *           type: string
 *           description: ID of the user this token belongs to
 *         type:
 *           type: string
 *           enum: [refresh]
 *           description: Type of token
 *         expires:
 *           type: string
 *           format: date-time
 *           description: Token expiration date
 *         blacklisted:
 *           type: boolean
 *           description: Whether the token has been blacklisted
 */

/**
 * Token Schema
 * @typedef {Object} Token
 * @property {string} token - JWT token
 * @property {mongoose.Schema.Types.ObjectId} user - User associated with this token
 * @property {string} type - Type of token (refresh)
 * @property {Date} expires - Expiry date of token
 * @property {boolean} blacklisted - Whether the token has been blacklisted
 */
const tokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['refresh'],
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  blacklisted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;