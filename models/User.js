// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Personal Information
  name: { type: String, required: true },
  profile_pic_url: { type: String },
  tagline: { type: String },

  // Contact Information
  preferred_communication: { type: String, enum: ['platform', 'email', 'phone'] },
  social_media_links: { type: [String], default: [] },
  location: { type: String },
  service_area: { type: String },

  // Skills and Expertise
  services_offered: { type: [String], default: [] }, // Tags
  specializations: { type: [String], default: [] }, // Tags
  certifications: { type: [String], default: [] }, // File URLs
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  experience: { type: Number, default: 0 },

  // Availability
  working_hours: { type: String },
  calendar_link: { type: String },

  // Portfolio/Work Samples
  portfolio: { type: [String], default: [] }, // File URLs
  testimonials: { type: [String], default: [] }, // Testimonial texts

  // Reviews and Ratings
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  rating: { type: Number, default: 0 },

  // Pricing and Payment Details
  rate_card: { type: String },
  payment_methods: { type: [String], default: [] },

  // About Section
  bio: { type: String },

  // Trust and Safety
  background_check: { type: Boolean, default: false },
  insurance_details: { type: String },

  // Platform-Specific Features
  response_time: { type: String },
  completed_jobs: { type: Number, default: 0 },
  verified_badges: { type: [String], default: [] },

  // Call-to-Action
  request_service_link: { type: String },
  is_favorite: { type: Boolean, default: false },

  // Additional Details
  languages_spoken: { type: [String], default: [] }, // Tags
  faqs: { type: [String], default: [] },
  disclaimers: { type: String },

  // Default Fields
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },

  xp: { type: Number, default: 0 },
  badges: { type: [String], default: [] }, // Ensure default empty array
  rank: { type: Number },
  completed_gigs: { type: Number, default: 0 },

  redeemedRewards: [{ 
    rewardId: mongoose.Schema.Types.ObjectId,
    redeemedAt: Date 
  }],
  unlockedTiers: [String],

  googleId: { type: String, unique: true, sparse: true },
facebookId: { type: String, unique: true, sparse: true },
appleId: { type: String, unique: true, sparse: true },
});

module.exports = mongoose.model('User', userSchema);