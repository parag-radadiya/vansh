const express = require('express');
const router = express.Router();
const loanApplicationController = require('../controllers/loanApplicationController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Loan Applications
 *   description: Loan application form API endpoints
 */

/**
 * @swagger
 * /api/loan-applications:
 *   post:
 *     summary: Submit a loan application
 *     tags: [Loan Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loanType
 *               - fullName
 *               - email
 *               - pincode
 *               - loanAmount
 *               - phoneNumber
 *               - businessType
 *               - securityType
 *             properties:
 *               loanType:
 *                 type: string
 *                 example: "Business Loan"
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               pincode:
 *                 type: string
 *                 example: "380015"
 *               loanAmount:
 *                 type: number
 *                 example: 500000
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               businessType:
 *                 type: string
 *                 example: "Retail"
 *               securityType:
 *                 type: string
 *                 example: "Property"
 *     responses:
 *       201:
 *         description: Loan application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LoanApplication'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', loanApplicationController.createApplication);

/**
 * @swagger
 * /api/loan-applications:
 *   get:
 *     summary: Get all loan applications
 *     tags: [Loan Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewing, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: loanType
 *         schema:
 *           type: string
 *         description: Filter by loan type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, etc.
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum loan amount filter
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum loan amount filter
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoanApplication'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', auth, loanApplicationController.getAllApplications);

/**
 * @swagger
 * /api/loan-applications/{id}:
 *   get:
 *     summary: Get a loan application by ID
 *     tags: [Loan Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the application to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LoanApplication'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, loanApplicationController.getApplicationById);

/**
 * @swagger
 * /api/loan-applications/{id}/status:
 *   patch:
 *     summary: Update loan application status
 *     tags: [Loan Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the application
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewing, approved, rejected]
 *               notes:
 *                 type: string
 *                 description: Optional notes about the status change
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LoanApplication'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', auth, loanApplicationController.updateApplicationStatus);

/**
 * @swagger
 * /api/loan-applications/{id}:
 *   delete:
 *     summary: Delete a loan application
 *     tags: [Loan Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the application to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Loan application deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, loanApplicationController.deleteApplication);

module.exports = router;