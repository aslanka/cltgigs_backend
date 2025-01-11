const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Public profile
router.get('/:userId', userController.getPublicProfile);

// Update user profile
router.put('/:userId', authenticate, userController.updateProfile);

module.exports = router;
