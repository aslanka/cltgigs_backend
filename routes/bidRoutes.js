// routes/bidRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { 
  createBid, 
  getBidsForGig, 
  acceptBid,
  denyBid,
  getMyBids,  // MOVE THIS ROUTE UP
  undenyBid,
  deleteBid,
  updateBidStatus,
} = require('../controllers/bidController');

// Correct order of routes
router.post('/', authenticate, createBid);
router.get('/my', authenticate, getMyBids); // This should come FIRST
router.get('/:gigId', authenticate, getBidsForGig); // This comes AFTER
router.post('/:bidId/accept', authenticate, acceptBid);
router.post('/:bidId/deny', authenticate, denyBid);
router.post('/:bidId/undeny', authenticate, undenyBid);
// Add to bidRoutes.js
router.delete('/:bidId', authenticate, deleteBid);
router.patch('/:bidId/status', authenticate, updateBidStatus);

module.exports = router;