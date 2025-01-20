const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Updated to string for flexibility
  zipcode: { type: String, required: true }, // Required zipcode
  start_date: { type: Date }, // Optional start date
  completion_date: { type: Date }, // Optional completion date
  created_at: { type: Date, default: Date.now }, // Automatically set
  team_size: { type: Number, default: 1 }, // Default team size is 1
  gig_tasks: { type: [String], default: [] }, // Array of tasks
  budget_range_min: { type: Number }, // Required if not volunteer
  budget_range_max: { type: Number }, // Required if not volunteer
  calculated_average_budget: { type: Number }, // Required if not volunteer
  is_volunteer: { type: Boolean, default: false }, // Default to false
  tags: { type: [String], default: [] }, // Array of tags
});

// Index for zipcode and created_at for faster queries
gigSchema.index({ zipcode: 1 });
gigSchema.index({ created_at: -1 });

module.exports = mongoose.model('Gig', gigSchema);