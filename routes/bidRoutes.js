const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { createBid, getBidsForGig, acceptBid, // Ensure this is imported
    denyBid,   // Ensure this is imported
    getMyBids, undenyBid} = require('../controllers/bidController');

// Place a bid (must be logged in)
router.post('/', authenticate, createBid);

// Get bids for a gig (the gig owner sees all, non-owner sees only their own)
router.get('/:gigId', authenticate, getBidsForGig);

router.post('/:bidId/accept', authenticate, acceptBid);
router.post('/:bidId/deny', authenticate, denyBid);
router.get('/my', authenticate, getMyBids);
router.post('/:bidId/undeny', authenticate, undenyBid);


module.exports = router;
