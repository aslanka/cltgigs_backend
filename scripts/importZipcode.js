// scripts/importZipcodes.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Zipcode = require('../models/Zipcode'); // path to your Zipcode model

// Connect to your MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const filePath = path.join(__dirname, 'zipcodes.txt'); 
fs.readFile(filePath, 'utf8', async (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const lines = data.trim().split('\n');
  // Skip header
  lines.shift();

  const zipDocs = lines.map(line => {
    const [zip, lat, lng] = line.split(',').map(item => item.trim());
    return {
      zip,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
    };
  });

  try {
    await Zipcode.insertMany(zipDocs, { ordered: false });
    console.log('Zipcodes imported successfully');
  } catch (e) {
    console.error('Error importing zipcodes:', e);
  } finally {
    mongoose.disconnect();
  }
});
