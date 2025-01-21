// gigRoutes.js (updated)
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { gigUpload } = require('../middlewares/upload');
const {
  getAllGigs,
  createGig,
  getGigDetails,
  getMyGigs,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

// Public can see all gigs
router.get('/', getAllGigs);

// Auth user can create a gig
router.post('/', authenticate, gigUpload.single('gigImage'), createGig);

// Public can see gig details
router.get('/:gigId', getGigDetails);

// Auth user can see their own gigs
router.get('/mygigs/owner', authenticate, getMyGigs);

// Auth user can edit gig
router.put('/:gigId', authenticate, gigUpload.single('gigImage'), updateGig);

// Auth user can delete gig
router.delete('/:gigId', authenticate, deleteGig);

module.exports = router;
