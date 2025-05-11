const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         username:
 *           type: string
 *           description: User's unique username
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         mobileNumber:
 *           type: string
 *           description: User's Indian mobile number
 *         password:
 *           type: string
 *           format: password
 *           description: User password (hashed)
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email has been verified
 *         isMobileVerified:
 *           type: boolean
 *           description: Whether the user's mobile has been verified
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the user was added
 *       example:
 *         name: John Doe
 *         username: johndoe
 *         email: user@example.com
 *         mobileNumber: "9876543210"
 *         password: password123
 *         isEmailVerified: false
 *         isMobileVerified: false
 *         createdAt: 2025-05-11T12:00:00.000Z
 */

/**
 * User Schema
 * @typedef {Object} User
 * @property {string} name - User's full name
 * @property {string} username - User's unique username
 * @property {string} email - User's email address
 * @property {string} mobileNumber - User's mobile number (Indian format)
 * @property {string} password - User's password
 * @property {boolean} isEmailVerified - Whether the user's email has been verified
 * @property {boolean} isMobileVerified - Whether the user's mobile has been verified
 * @property {Date} createdAt - Date when the user was created
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true,
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  mobileNumber: {
    type: String,
    trim: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Indian mobile number validation
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Hash the password before saving
 * @function pre
 * @memberof UserSchema
 */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Generate access token
 * @function generateAccessToken
 * @memberof UserSchema.methods
 * @returns {string} JWT token
 */
UserSchema.methods.generateAccessToken = function() {
  const accessTokenExpires = moment().add(
    process.env.NODE_ENV === 'development' 
      ? 1 
      : process.env.JWT_ACCESS_EXPIRATION_MINUTES || 30, 
    'minutes'
  );
  
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      exp: accessTokenExpires.unix()
    },
    process.env.JWT_SECRET
  );
};

/**
 * Generate refresh token
 * @function generateRefreshToken
 * @memberof UserSchema.methods
 * @returns {Object} Object containing token and expiry
 */
UserSchema.methods.generateRefreshToken = function() {
  const refreshTokenExpires = moment().add(
    process.env.JWT_REFRESH_EXPIRATION_DAYS || 30, 
    'days'
  );
  
  return {
    token: jwt.sign(
      { 
        id: this._id,
        exp: refreshTokenExpires.unix()
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    ),
    expires: refreshTokenExpires.toDate()
  };
};

/**
 * Compare password for authentication
 * @function comparePassword
 * @memberof UserSchema.methods
 * @param {string} candidatePassword - The password to compare
 * @returns {boolean} True if password matches, false otherwise
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);