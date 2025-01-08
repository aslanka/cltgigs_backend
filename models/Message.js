const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String }, // can be empty if message is just an attachment
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
