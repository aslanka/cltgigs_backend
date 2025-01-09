const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { createBid, getBidsForGig } = require('../controllers/bidController');

// Place a bid (must be logged in)
router.post('/', authenticate, createBid);

// Get bids for a gig (the gig owner sees all, non-owner sees only their own)
router.get('/:gigId', authenticate, getBidsForGig);

module.exports = router;
