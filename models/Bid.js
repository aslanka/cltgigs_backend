const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gig_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  message: { type: String }, // initial message
  accepted: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  conversation_id: { type: mongoose.Schema.Types.ObjectId }, // Added field
  created_at: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

bidSchema.index({ gig_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);

