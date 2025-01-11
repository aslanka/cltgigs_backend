const Review = require('../models/Review');
const User = require('../models/User');

// Get reviews for a specific user
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user_id: userId })
      .populate('reviewer_id', 'name profile_pic_url')  // populate reviewer fields
      .sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new review for a user
exports.createReview = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviewerId = req.user.userId; // assumes authentication middleware sets req.user

    // Verify user and reviewer exist
    const user = await User.findById(userId);
    const reviewer = await User.findById(reviewerId);
    if (!user || !reviewer) {
      return res.status(404).json({ error: 'User or reviewer not found' });
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    const newReview = new Review({
      user_id: userId,
      reviewer_id: reviewerId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a review by its ID (optional - if reviews are editable)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.user.userId;

    // Only allow the original reviewer to update
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.reviewer_id.toString() !== reviewerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.date = new Date();
    
    await review.save();
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a review (optional)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.user.userId;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.reviewer_id.toString() !== reviewerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
