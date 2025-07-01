const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     CareerApplication:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - role
 *         - resume
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the applicant
 *         lastName:
 *           type: string
 *           description: Last name of the applicant
 *         email:
 *           type: string
 *           description: Email address of the applicant
 *         state:
 *           type: string
 *           description: State of residence
 *         city:
 *           type: string
 *           description: City of residence
 *         role:
 *           type: string
 *           description: Job role the applicant is applying for
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the applicant
 *         resume:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *           description: Resume document of the applicant
 *         status:
 *           type: string
 *           enum: [pending, reviewed, shortlisted, rejected]
 *           description: Status of the application
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
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@example.com"
 *         state: "Gujarat"
 *         city: "Ahmedabad"
 *         role: "Full Stack Developer"
 *         phoneNumber: "9876543210"
 *         resume: { url: "https://res.cloudinary.com/demo/raw/upload/v1234567890/resumes/johndoe-resume.pdf", publicId: "resumes/johndoe-resume" }
 *         status: "pending"
 *         createdAt: "2025-05-11T12:00:00.000Z"
 *         updatedAt: "2025-05-11T12:00:00.000Z"
 */

/**
 * Career Application Schema
 * @typedef {Object} CareerApplication
 * @property {string} firstName - First name of the applicant
 * @property {string} lastName - Last name of the applicant
 * @property {string} email - Email address of the applicant
 * @property {string} state - State of residence
 * @property {string} city - City of residence
 * @property {string} role - Job role the applicant is applying for
 * @property {string} phoneNumber - Phone number of the applicant
 * @property {Object} resume - Resume document of the applicant
 * @property {string} resume.url - URL of the resume
 * @property {string} resume.publicId - Public ID of the resume in Cloudinary
 * @property {string} status - Status of the application (pending, reviewed, shortlisted, rejected)
 * @property {string} notes - Administrative notes about the application
 * @property {Date} createdAt - Date when the application was created
 * @property {Date} updatedAt - Date when the application was last updated
 */
const CareerApplicationSchema = new mongoose.Schema({
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
  role: {
    type: String,
    required: [true, 'Please provide the role you are applying for'],
    trim: true,
    maxlength: [100, 'Role cannot be more than 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  resume: {
    url: {
      type: String,
      required: [true, 'Resume URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Resume public ID is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
}, { timestamps: true });

module.exports = mongoose.model('CareerApplication', CareerApplicationSchema);