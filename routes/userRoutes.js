// routes/userRoutes.js (Corrected)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth'); // Corrected path
const userController = require('../controllers/userController');
const User = require('../models/User'); // <---  IMPORT THE USER MODEL.  THIS WAS MISSING!

const { uploadPortfolio, uploadCertifications, updateProfile} = require('../controllers/userController');
const { uploadMiddleware } = require('../middlewares/upload');

router.get('/me', authenticate, async (req, res) => {
    try {
      console.log("req.user:", req.user); // <--- ADD THIS for 

      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Public profile
router.get('/:userId', userController.getPublicProfile);

router.post('/:userId/portfolio', authenticate, uploadMiddleware.array('portfolio'), uploadPortfolio);
router.put('/:userId/portfolio', authenticate, uploadMiddleware.array('portfolio'), uploadPortfolio);

// Update user profile
router.put('/:userId', authenticate, userController.updateProfile);

// routes/userRoutes.js
router.post('/:userId/certifications', authenticate, uploadMiddleware.array('certifications'), uploadCertifications);
router.put('/:userId', authenticate, updateProfile);

// In your Express routes:
router.delete('/:userId/portfolio', userController.removePortfolioItem);

router.get('/:userId/block-status', authenticate, userController.checkBlockStatus);

router.delete('/:userId/profile-pic', authenticate, userController.deleteProfilePicture);

// Social links routes
router.post('/:userId/social-links', authenticate, userController.addSocialLink);
router.delete('/:userId/social-links/:index', authenticate, userController.deleteSocialLink);



module.exports = router;