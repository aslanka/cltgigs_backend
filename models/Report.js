// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, required: true }, // "gig" or "profile"
  reportReason: { type: String, required: true }, // Dropdown value
  reportDetails: { type: String, required: true }, // User's detailed description
  additionalInfo: { type: String }, // Optional field for extra details
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
