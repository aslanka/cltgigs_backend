// models/Attachment.js
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gig', 'message', 'bid', 'profile', 'portfolio'],
    required: true,
    index: true
  },
  foreign_key_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  file_url: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^\/uploads\/[a-f0-9-]+\.\w+$/.test(v),
      message: 'Invalid file URL format'
    }
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mime_type: {
    type: String,
    required: true,
    match: /^[a-z]+\/[a-z0-9-+.]+$/i
  },
  file_size: {
    type: Number,
    min: 1,
    max: 5 * 1024 * 1024 // 5MB
  },
  uploaded_at: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
});

// Sanitize inputs before saving
attachmentSchema.pre('save', function(next) {
  this.type = sanitize(this.type);
  this.file_url = sanitize(this.file_url);
  next();
});

module.exports = mongoose.model('Attachment', attachmentSchema);