const express = require('express');
const { contentController, upload } = require('../controllers/contentController');
const authenticate = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const uploadDir = '/tmp/uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management API
 */

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create a new content entry
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Content title
 *               description:
 *                 type: string
 *                 description: Content description
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Main image file
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file
 *             required:
 *               - title
 *               - description
 *     responses:
 *       201:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  contentController.createContent
);

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content entries
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of all content entries
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
 *                     $ref: '#/components/schemas/Content'
 */
router.get('/', contentController.getAllContent);

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get a content entry by ID
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the content to get
 *     responses:
 *       200:
 *         description: Content entry found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Content'
 *       404:
 *         description: Content not found
 */
router.get('/:id', contentController.getContentById);

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update a content entry
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the content to update
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title
 *               description:
 *                 type: string
 *                 description: Updated description
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Updated banner image file
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Updated main image file
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Updated video file
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.put(
  '/:id',
  authenticate,
  upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  contentController.updateContent
);

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete a content entry
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the content to delete
 *     responses:
 *       200:
 *         description: Content deleted successfully
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
 *                   example: Content deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.delete('/:id', authenticate, contentController.deleteContent);

module.exports = router;