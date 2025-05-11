const express = require('express');
const router = express.Router();
const { careerManagementController, upload } = require('../controllers/careerManagementController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Career management API endpoints
 */

/**
 * @swagger
 * /api/careers:
 *   get:
 *     summary: Get all career opportunities
 *     tags: [Careers]
 *     responses:
 *       200:
 *         description: Successfully retrieved career opportunities
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
 *                     $ref: '#/components/schemas/CareerManagement'
 *       500:
 *         description: Server error
 */
router.get('/', careerManagementController.getAllCareerOpportunities);

/**
 * @swagger
 * /api/careers/{id}:
 *   get:
 *     summary: Get a career opportunity by ID
 *     tags: [Careers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the career opportunity to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Career opportunity found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CareerManagement'
 *       404:
 *         description: Career opportunity not found
 *       500:
 *         description: Server error
 */
router.get('/:id', careerManagementController.getCareerOpportunityById);

/**
 * @swagger
 * /api/careers:
 *   post:
 *     summary: Create a new career opportunity
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - role
 *               - description
 *             properties:
 *               category:
 *                 type: string
 *               role:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Career opportunity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CareerManagement'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), careerManagementController.createCareerOpportunity);

/**
 * @swagger
 * /api/careers/{id}:
 *   put:
 *     summary: Update a career opportunity
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the career opportunity to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               role:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Career opportunity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CareerManagement'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Career opportunity not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), careerManagementController.updateCareerOpportunity);

/**
 * @swagger
 * /api/careers/{id}:
 *   delete:
 *     summary: Delete a career opportunity
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the career opportunity to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Career opportunity deleted successfully
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
 *                   example: Career opportunity deleted successfully
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Career opportunity not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, careerManagementController.deleteCareerOpportunity);

module.exports = router;