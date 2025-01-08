const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gig', 'message', 'bid', 'profile', 'portfolio'],
    required: true
  },
  foreign_key_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  file_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attachment', attachmentSchema);
