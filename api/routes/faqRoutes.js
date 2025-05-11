const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQ management API endpoints
 */

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Get all FAQs
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: Successfully retrieved FAQs
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
 *                     $ref: '#/components/schemas/Faq'
 *       500:
 *         description: Server error
 */
router.get('/', faqController.getAllFaqs);

/**
 * @swagger
 * /api/faqs/active:
 *   get:
 *     summary: Get active FAQs only
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: Successfully retrieved active FAQs
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
 *                     $ref: '#/components/schemas/Faq'
 *       500:
 *         description: Server error
 */
router.get('/active', faqController.getActiveFaqs);

/**
 * @swagger
 * /api/faqs/{id}:
 *   get:
 *     summary: Get a FAQ by ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the FAQ to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Faq'
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
router.get('/:id', faqController.getFaqById);

/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *               ans:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, faqController.createFaq);

/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     summary: Update a FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the FAQ to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               ans:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, faqController.updateFaq);

/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     summary: Delete a FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the FAQ to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
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
 *                   example: FAQ deleted successfully
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, faqController.deleteFaq);

module.exports = router;