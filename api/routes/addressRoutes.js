const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address management API endpoints
 */

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses for the authenticated user
 *     tags: [Addresses]
 *     responses:
 *       200:
 *         description: Successfully retrieved addresses
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
 *                     $ref: '#/components/schemas/Address'
 *       500:
 *         description: Server error
 */
router.get('/', addressController.getUserAddresses);

/**
 * @swagger
 * /api/addresses/default:
 *   get:
 *     summary: Get default address for the authenticated user
 *     tags: [Addresses]
 *     responses:
 *       200:
 *         description: Successfully retrieved default address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: No address found
 *       500:
 *         description: Server error
 */
router.get('/default', addressController.getDefaultAddress);

/**
 * @swagger
 * /api/addresses/search:
 *   get:
 *     summary: Search addresses by criteria
 *     tags: [Addresses]
 *     parameters:
 *       - in: query
 *         name: pincode
 *         schema:
 *           type: string
 *         description: Filter by pincode
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *     responses:
 *       200:
 *         description: Successfully retrieved addresses
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
 *                     $ref: '#/components/schemas/Address'
 *       500:
 *         description: Server error
 */
router.get('/search', addressController.searchAddresses);

/**
 * @swagger
 * /api/addresses/{id}:
 *   get:
 *     summary: Get an address by ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Successfully retrieved address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.get('/:id', addressController.getAddressById);

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressLine1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               addressType:
 *                 type: string
 *                 enum: [home, office, business, other]
 *                 example: "home"
 *               addressLine1:
 *                 type: string
 *                 example: "123 Main Street"
 *               addressLine2:
 *                 type: string
 *                 example: "Apartment 4B"
 *               landmark:
 *                 type: string
 *                 example: "Near City Park"
 *               city:
 *                 type: string
 *                 example: "Ahmedabad"
 *               district:
 *                 type: string
 *                 example: "Ahmedabad"
 *               state:
 *                 type: string
 *                 example: "Gujarat"
 *               pincode:
 *                 type: string
 *                 example: "380015"
 *               country:
 *                 type: string
 *                 example: "India"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *               latitude:
 *                 type: number
 *                 example: 23.0225
 *               longitude:
 *                 type: number
 *                 example: 72.5714
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth, addressController.createAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressType:
 *                 type: string
 *                 enum: [home, office, business, other]
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               landmark:
 *                 type: string
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, addressController.updateAddress);

/**
 * @swagger
 * /api/addresses/{id}/default:
 *   patch:
 *     summary: Set an address as default
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address set as default successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/default', auth, addressController.setDefaultAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, addressController.deleteAddress);

module.exports = router;