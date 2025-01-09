const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  message: { type: String }, // we store the initial message for the bid
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', bidSchema);
