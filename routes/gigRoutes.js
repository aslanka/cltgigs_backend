// routes/gigRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');
const {
  getAllGigs,
  createGig,
  getGigDetails,
  getMyGigs,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

// Only change the upload middleware reference
router.post('/', authenticate, uploadMiddleware.single('gigImage'), createGig);
router.put('/:gigId', authenticate, uploadMiddleware.single('gigImage'), updateGig);

// Rest of the file remains exactly the same
router.get('/', getAllGigs);
router.get('/:gigId', getGigDetails);
router.get('/mygigs/owner', authenticate, getMyGigs);
router.delete('/:gigId', authenticate, deleteGig);

module.exports = router;