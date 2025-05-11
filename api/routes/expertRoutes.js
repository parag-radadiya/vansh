const express = require('express');
const router = express.Router();
const { expertController, upload } = require('../controllers/expertController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Experts
 *   description: Expert management API endpoints
 */

/**
 * @swagger
 * /api/experts:
 *   get:
 *     summary: Get all experts
 *     tags: [Experts]
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
 *     responses:
 *       200:
 *         description: Successfully retrieved experts
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
 *                     $ref: '#/components/schemas/Expert'
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
 *       500:
 *         description: Server error
 */
router.get('/', expertController.getAllExperts);

/**
 * @swagger
 * /api/experts/{id}:
 *   get:
 *     summary: Get an expert by ID
 *     tags: [Experts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the expert to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expert found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Expert'
 *       404:
 *         description: Expert not found
 *       500:
 *         description: Server error
 */
router.get('/:id', expertController.getExpertById);

/**
 * @swagger
 * /api/experts:
 *   post:
 *     summary: Create a new expert
 *     tags: [Experts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - role
 *               - description
 *             properties:
 *               name:
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
 *         description: Expert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Expert'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), expertController.createExpert);

/**
 * @swagger
 * /api/experts/{id}:
 *   put:
 *     summary: Update an expert
 *     tags: [Experts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the expert to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
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
 *         description: Expert updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Expert'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Expert not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), expertController.updateExpert);

/**
 * @swagger
 * /api/experts/{id}:
 *   delete:
 *     summary: Delete an expert
 *     tags: [Experts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the expert to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expert deleted successfully
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
 *                   example: Expert deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Expert not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, expertController.deleteExpert);

module.exports = router;