const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  // The user who posted the gig
  gig_owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // The user who placed the bid
  bidder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
