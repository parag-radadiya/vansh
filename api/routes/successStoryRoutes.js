const express = require('express');
const router = express.Router();
const { successStoryController, upload } = require('../controllers/successStoryController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: SuccessStories
 *   description: Success story management API endpoints
 */

/**
 * @swagger
 * /api/success-stories:
 *   get:
 *     summary: Get all success stories
 *     tags: [SuccessStories]
 *     responses:
 *       200:
 *         description: Successfully retrieved success stories
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
 *                     $ref: '#/components/schemas/SuccessStory'
 *       500:
 *         description: Server error
 */
router.get('/', successStoryController.getAllSuccessStories);

/**
 * @swagger
 * /api/success-stories/visible:
 *   get:
 *     summary: Get visible success stories only
 *     tags: [SuccessStories]
 *     responses:
 *       200:
 *         description: Successfully retrieved visible success stories
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
 *                     $ref: '#/components/schemas/SuccessStory'
 *       500:
 *         description: Server error
 */
router.get('/visible', successStoryController.getVisibleSuccessStories);

/**
 * @swagger
 * /api/success-stories/{id}:
 *   get:
 *     summary: Get a success story by ID
 *     tags: [SuccessStories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the success story to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success story found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SuccessStory'
 *       404:
 *         description: Success story not found
 *       500:
 *         description: Server error
 */
router.get('/:id', successStoryController.getSuccessStoryById);

/**
 * @swagger
 * /api/success-stories:
 *   post:
 *     summary: Create a new success story
 *     tags: [SuccessStories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - clientName
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               clientName:
 *                 type: string
 *               content:
 *                 type: string
 *               showHideFlag:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Success story created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SuccessStory'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), successStoryController.createSuccessStory);

/**
 * @swagger
 * /api/success-stories/{id}:
 *   put:
 *     summary: Update a success story
 *     tags: [SuccessStories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the success story to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               clientName:
 *                 type: string
 *               content:
 *                 type: string
 *               showHideFlag:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success story updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SuccessStory'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Success story not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), successStoryController.updateSuccessStory);

/**
 * @swagger
 * /api/success-stories/{id}:
 *   delete:
 *     summary: Delete a success story
 *     tags: [SuccessStories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the success story to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success story deleted successfully
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
 *                   example: Success story deleted successfully
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Success story not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, successStoryController.deleteSuccessStory);

module.exports = router;