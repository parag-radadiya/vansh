const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoanApplication:
 *       type: object
 *       required:
 *         - loanType
 *         - fullName
 *         - email
 *         - pincode
 *         - loanAmount
 *         - phoneNumber
 *         - businessType
 *         - securityType
 *       properties:
 *         loanType:
 *           type: string
 *           description: Type of loan being requested
 *         fullName:
 *           type: string
 *           description: Full name of the applicant
 *         email:
 *           type: string
 *           description: Email address of the applicant
 *         pincode:
 *           type: string
 *           description: Postal/ZIP code of the applicant
 *         loanAmount:
 *           type: number
 *           description: Requested loan amount
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the applicant
 *         businessType:
 *           type: string
 *           description: Type of business or employment
 *         securityType:
 *           type: string
 *           description: Type of security/collateral offered
 *         status:
 *           type: string
 *           enum: [pending, reviewing, approved, rejected]
 *           description: Status of the loan application
 *         notes:
 *           type: string
 *           description: Administrative notes about the application
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the application was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the application was last updated
 *       example:
 *         loanType: "Business Loan"
 *         fullName: "John Doe"
 *         email: "john.doe@example.com"
 *         pincode: "380015"
 *         loanAmount: 500000
 *         phoneNumber: "9876543210"
 *         businessType: "Retail"
 *         securityType: "Property"
 *         status: "pending"
 *         notes: ""
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Loan Application Schema
 * @typedef {Object} LoanApplication
 * @property {string} loanType - Type of loan being requested
 * @property {string} fullName - Full name of the applicant
 * @property {string} email - Email address of the applicant
 * @property {string} pincode - Postal/ZIP code of the applicant
 * @property {number} loanAmount - Requested loan amount
 * @property {string} phoneNumber - Phone number of the applicant
 * @property {string} businessType - Type of business or employment
 * @property {string} securityType - Type of security/collateral offered
 * @property {string} status - Status of the loan application (pending, reviewing, approved, rejected)
 * @property {string} notes - Administrative notes about the application
 * @property {Date} createdAt - Date when the application was created
 * @property {Date} updatedAt - Date when the application was last updated
 */
const LoanApplicationSchema = new mongoose.Schema({
  loanType: {
    type: String,
    required: [true, 'Please specify the loan type'],
    trim: true,
    maxlength: [100, 'Loan type cannot be more than 100 characters']
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  pincode: {
    type: String,
    required: [true, 'Please provide a pincode'],
    trim: true,
    match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
  },
  loanAmount: {
    type: String,
    required: [true, 'Please specify the loan amount'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  businessType: {
    type: String,
    required: [true, 'Please specify your business type'],
    trim: true,
    maxlength: [100, 'Business type cannot be more than 100 characters']
  },
  securityType: {
    type: String,
    required: [true, 'Please specify the security type'],
    trim: true,
    maxlength: [100, 'Security type cannot be more than 100 characters']
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: [150, 'Business name cannot be more than 150 characters']
  },
  businessVintageYear: {
    type: String,
  },
  factoryOwnership: {
    type: String,
    trim: true,

  },
  residentOwnership: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, { timestamps: true });
module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);