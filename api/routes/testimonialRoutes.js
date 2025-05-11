const express = require('express');
const router = express.Router();
const { testimonialController, upload } = require('../controllers/testimonialController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Testimonial management API endpoints
 */

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Get all testimonials
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: Successfully retrieved testimonials
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
 *                     $ref: '#/components/schemas/Testimonial'
 *       500:
 *         description: Server error
 */
router.get('/', testimonialController.getAllTestimonials);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   get:
 *     summary: Get a testimonial by ID
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the testimonial to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Testimonial'
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
router.get('/:id', testimonialController.getTestimonialById);

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Testimonials]
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
 *               - feedback
 *             properties:
 *               name:
 *                 type: string
 *               feedback:
 *                 type: string
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Testimonial'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), testimonialController.createTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   put:
 *     summary: Update a testimonial
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the testimonial to update
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
 *               feedback:
 *                 type: string
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Testimonial'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 }
]), testimonialController.updateTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the testimonial to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial deleted successfully
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
 *                   example: Testimonial deleted successfully
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, testimonialController.deleteTestimonial);

module.exports = router;