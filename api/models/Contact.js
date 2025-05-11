const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - message
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the person
 *         lastName:
 *           type: string
 *           description: Last name of the person
 *         email:
 *           type: string
 *           description: Email address of the person
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the person
 *         requestMessage:
 *           type: string
 *           description: Type of request or subject
 *         pinCode:
 *           type: string
 *           description: PIN code / ZIP code
 *         state:
 *           type: string
 *           description: State
 *         city:
 *           type: string
 *           description: City
 *         message:
 *           type: string
 *           description: Detailed message from the person
 *         status:
 *           type: string
 *           enum: [pending, inProgress, resolved]
 *           description: Status of the contact request
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the contact request was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the contact request was last updated
 *       example:
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@example.com"
 *         phoneNumber: "9876543210"
 *         requestMessage: "Product Inquiry"
 *         pinCode: "380015"
 *         state: "Gujarat"
 *         city: "Ahmedabad"
 *         message: "I would like to know more about your services."
 *         status: "pending"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Contact Schema
 * @typedef {Object} Contact
 * @property {string} firstName - First name of the person
 * @property {string} lastName - Last name of the person
 * @property {string} email - Email address of the person
 * @property {string} phoneNumber - Phone number of the person
 * @property {string} requestMessage - Type of request or subject
 * @property {string} pinCode - PIN code / ZIP code
 * @property {string} state - State
 * @property {string} city - City
 * @property {string} message - Detailed message from the person
 * @property {string} status - Status of the contact request (pending, inProgress, resolved)
 * @property {Date} createdAt - Date when the contact request was created
 * @property {Date} updatedAt - Date when the contact request was last updated
 */
const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  requestMessage: {
    type: String,
    trim: true,
    maxlength: [100, 'Request message cannot be more than 100 characters']
  },
  pinCode: {
    type: String,
    trim: true,
    maxlength: [10, 'PIN code cannot be more than 10 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State cannot be more than 50 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City cannot be more than 50 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);