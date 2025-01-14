const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const reviewController = require('../controllers/reviewController');

// Get all reviews for a user
router.get('/user/:userId', reviewController.getReviewsByUser);

// Create a new review for a user (requires authentication)
router.post('/user/:userId', authenticate, reviewController.createReview);

// Update a review by id (optional, if needed)
router.put('/:reviewId', authenticate, reviewController.updateReview);

// Delete a review by id (optional, if needed)
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;
