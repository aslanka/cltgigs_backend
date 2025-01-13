// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who receives the notification
  type: { type: String, required: true, enum: ['message', 'bid'] }, // Type of notification
  message: { type: String, required: true }, // Notification message
  read: { type: Boolean, default: false }, // Whether the notification has been read
  link: { type: String }, // Optional link to redirect the user (e.g., to a message or gig)
  created_at: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model('Notification', notificationSchema);