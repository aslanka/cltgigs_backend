const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  gig_owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
