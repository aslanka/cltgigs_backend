const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const userController = require('../controllers/userController');


const { uploadPortfolio, uploadCertifications, updateProfile} = require('../controllers/userController');
const { messageUpload } = require('../middlewares/upload');

// Public profile
router.get('/:userId', userController.getPublicProfile);

router.post('/:userId/portfolio', authenticate, messageUpload.array('portfolio'), uploadPortfolio);

// Update user profile
router.put('/:userId', authenticate, userController.updateProfile);

// routes/userRoutes.js
router.post('/:userId/certifications', authenticate, messageUpload.array('certifications'), uploadCertifications);
router.put('/:userId', authenticate, updateProfile);

// In your Express routes:
router.delete('/users/:userId/portfolio', userController.removePortfolioItem);


module.exports = router;
