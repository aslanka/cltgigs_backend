const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  gig_owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bid_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
  blocked_by_owner: { type: Boolean, default: false },
  blocked_by_bidder: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },  // Newly added field
  created_at: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Conversation', conversationSchema);
