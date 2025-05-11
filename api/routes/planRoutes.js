const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Plan management API endpoints
 */

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
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
 *         name: visibleOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Only return visible plans
 *     responses:
 *       200:
 *         description: Successfully retrieved plans
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
 *                     $ref: '#/components/schemas/Plan'
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
router.get('/', planController.getAllPlans);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Get a plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the plan to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.get('/:id', planController.getPlanById);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *               - features
 *               - description
 *             properties:
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               showHideFlag:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, planController.createPlan);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     summary: Update a plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the plan to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               showHideFlag:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, planController.updatePlan);

/**
 * @swagger
 * /api/plans/{id}/toggle-visibility:
 *   patch:
 *     summary: Toggle plan visibility
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the plan to toggle visibility
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan visibility toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle-visibility', auth, planController.togglePlanVisibility);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Delete a plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the plan to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted successfully
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
 *                   example: Plan deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, planController.deletePlan);

module.exports = router;