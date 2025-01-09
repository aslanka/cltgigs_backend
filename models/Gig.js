const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category_id: { type: Number }, // optional
  zipcode: { type: String },     // optional zipcode field
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gig', gigSchema);
