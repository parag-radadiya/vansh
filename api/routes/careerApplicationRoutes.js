const express = require('express');
const router = express.Router();
const { careerApplicationController, upload } = require('../controllers/careerApplicationController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Career Applications
 *   description: Career application form API endpoints
 */

/**
 * @swagger
 * /api/career-applications:
 *   post:
 *     summary: Submit a career application
 *     tags: [Career Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - role
 *               - resume
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               role:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume document (PDF, DOC, DOCX)
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CareerApplication'
 *       400:
 *         description: Invalid input data or missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('resume'), careerApplicationController.createApplication);

/**
 * @swagger
 * /api/career-applications:
 *   get:
 *     summary: Get all career applications
 *     tags: [Career Applications]
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
 *           enum: [pending, reviewed, shortlisted, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by job role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, etc.
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
 *                     $ref: '#/components/schemas/CareerApplication'
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
router.get('/', auth, careerApplicationController.getAllApplications);

/**
 * @swagger
 * /api/career-applications/{id}:
 *   get:
 *     summary: Get a career application by ID
 *     tags: [Career Applications]
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
 *                   $ref: '#/components/schemas/CareerApplication'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, careerApplicationController.getApplicationById);

/**
 * @swagger
 * /api/career-applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Career Applications]
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
 *                 enum: [pending, reviewed, shortlisted, rejected]
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
 *                   $ref: '#/components/schemas/CareerApplication'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', auth, careerApplicationController.updateApplicationStatus);

/**
 * @swagger
 * /api/career-applications/{id}:
 *   delete:
 *     summary: Delete a career application
 *     tags: [Career Applications]
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
 *                   example: Application deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, careerApplicationController.deleteApplication);

module.exports = router;