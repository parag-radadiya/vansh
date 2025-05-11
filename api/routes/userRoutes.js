const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Create a new user
router.post('/', userController.createUser);

module.exports = router;