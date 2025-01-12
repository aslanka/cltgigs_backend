// models/Zipcode.js
const mongoose = require('mongoose');

const zipcodeSchema = new mongoose.Schema({
  zip: { type: String, required: true, unique: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
});

// Create a 2dsphere index for geospatial queries
zipcodeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Zipcode', zipcodeSchema);
