const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *                 description: Indian mobile number (10 digits starting with 6-9)
 *     responses:
 *       201:
 *         description: User registered successfully and OTP sent to email
 *       400:
 *         description: Bad request - Invalid input or email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /api/users/verify-email:
 *   post:
 *     summary: Verify email with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     tokens:
 *                       type: object
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-email', userController.verifyEmail);

/**
 * @swagger
 * /api/users/resend-verification:
 *   post:
 *     summary: Resend verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification OTP sent successfully
 *       400:
 *         description: Email already verified or bad request
 *       404:
 *         description: User not found
 */
router.post('/resend-verification', userController.resendVerificationOTP);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         access:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                             expires:
 *                               type: string
 *                               format: date-time
 *                         refresh:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                             expires:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /api/users/refresh-tokens:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh-tokens', userController.refreshTokens);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Invalid refresh token
 */
router.post('/logout', userController.logout);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or expired token
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *                 description: Indian mobile number (10 digits starting with 6-9)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Invalid or expired token
 */
router.patch('/profile', authenticate, userController.updateProfile);

module.exports = router;