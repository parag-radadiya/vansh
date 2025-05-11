const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Terms
 *   description: Terms and conditions management endpoints
 */

/**
 * @swagger
 * /api/terms/active:
 *   get:
 *     summary: Get active terms and conditions
 *     tags: [Terms]
 *     responses:
 *       200:
 *         description: Active terms and conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Terms'
 *       404:
 *         description: No active terms found
 *       500:
 *         description: Server error
 */
router.get('/active', termsController.getActiveTerms);

/**
 * @swagger
 * /api/terms:
 *   get:
 *     summary: Get all terms and conditions versions
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all terms versions
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
 *                     $ref: '#/components/schemas/Terms'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', auth, termsController.getAllTermsVersions);

/**
 * @swagger
 * /api/terms/{id}:
 *   get:
 *     summary: Get terms by ID
 *     tags: [Terms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the terms
 *     responses:
 *       200:
 *         description: Terms found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Terms'
 *       404:
 *         description: Terms not found
 *       500:
 *         description: Server error
 */
router.get('/:id', termsController.getTermsById);

/**
 * @swagger
 * /api/terms:
 *   post:
 *     summary: Create new terms and conditions
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - version
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the terms
 *               content:
 *                 type: string
 *                 description: Content of the terms in HTML format
 *               version:
 *                 type: string
 *                 description: Version number of the terms
 *               isActive:
 *                 type: boolean
 *                 description: Whether this version should be active
 *                 default: true
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when these terms become effective
 *     responses:
 *       201:
 *         description: Terms created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Terms'
 *                 message:
 *                   type: string
 *                   example: Terms created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, termsController.createTerms);

/**
 * @swagger
 * /api/terms/{id}:
 *   put:
 *     summary: Update terms and conditions
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the terms to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the terms
 *               content:
 *                 type: string
 *                 description: Content of the terms in HTML format
 *               version:
 *                 type: string
 *                 description: Version number of the terms
 *               isActive:
 *                 type: boolean
 *                 description: Whether this version should be active
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when these terms become effective
 *     responses:
 *       200:
 *         description: Terms updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Terms'
 *                 message:
 *                   type: string
 *                   example: Terms updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Terms not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, termsController.updateTerms);

/**
 * @swagger
 * /api/terms/{id}/activate:
 *   patch:
 *     summary: Set terms as active
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the terms to activate
 *     responses:
 *       200:
 *         description: Terms activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Terms'
 *                 message:
 *                   type: string
 *                   example: Terms activated successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Terms not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/activate', auth, termsController.setTermsActive);

/**
 * @swagger
 * /api/terms/{id}:
 *   delete:
 *     summary: Delete terms version
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the terms to delete
 *     responses:
 *       200:
 *         description: Terms deleted successfully
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
 *                   example: Terms deleted successfully
 *       400:
 *         description: Cannot delete active terms
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Terms not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, termsController.deleteTerms);

module.exports = router;