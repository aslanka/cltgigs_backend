const express = require('express');
const router = express.Router();
const {
  getAllGigs,
  createGig,
  getGigDetails,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

const { authenticate } = require('../middlewares/auth');
const { gigUpload } = require('../middlewares/upload');

// Gigs
router.get('/', getAllGigs);
router.post('/', authenticate, gigUpload.single('gigImage'), createGig);
router.get('/:gigId', getGigDetails);
router.put('/:gigId', authenticate, updateGig);
router.delete('/:gigId', authenticate, deleteGig);

module.exports = router;
