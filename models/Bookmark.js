const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gig_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Add compound index to ensure unique bookmarks
bookmarkSchema.index({ user_id: 1, gig_id: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);