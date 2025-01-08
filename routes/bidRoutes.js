const express = require('express');
const router = express.Router();
const {
  getAllBidsForGig,
  createBid,
  getBidDetails
} = require('../controllers/bidController');

const { authenticate } = require('../middlewares/auth');
const { messageUpload } = require('../middlewares/upload');

router.get('/:gigId', getAllBidsForGig);
router.post('/', authenticate, messageUpload.single('bidAttachment'), createBid);
router.get('/details/:bidId', authenticate, getBidDetails);

module.exports = router;
