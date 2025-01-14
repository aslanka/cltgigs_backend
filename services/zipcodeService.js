// services/zipcodeService.js
const Zipcode = require('../models/Zipcode');

async function findZipcodesWithin(zip, radiusInMiles) {
  // Find the starting point coordinates for the input ZIP code
  const origin = await Zipcode.findOne({ zip });
  if (!origin) throw new Error('Origin zip code not found');

  // Convert miles to meters (required by MongoDB geospatial queries)
  const radiusInMeters = radiusInMiles * 1609.34;

  // Find ZIP codes within the radius
  const nearbyZips = await Zipcode.find({
    location: {
      $nearSphere: {
        $geometry: origin.location,
        $maxDistance: radiusInMeters
      }
    }
  }).select('zip -_id'); // select only zip field

  // Return array of zip codes
  return nearbyZips.map(doc => doc.zip);
}

module.exports = { findZipcodesWithin };

async function findZipcodesWithinWithDistance(zip, radiusInMiles) {
    const origin = await Zipcode.findOne({ zip });
    if (!origin) throw new Error('Origin zip code not found');
  
    const radiusInMeters = radiusInMiles * 1609.34;
  
    const nearbyZips = await Zipcode.aggregate([
      {
        $geoNear: {
          near: origin.location,
          distanceField: "distance", // distance in meters
          spherical: true,
          maxDistance: radiusInMeters,
          query: {}
        }
      },
      {
        $project: {
          zip: 1,
          // convert distance to miles
          distance: { $divide: ["$distance", 1609.34] }
        }
      }
    ]);
  
    return nearbyZips; // Array of objects: { zip, distance }
  }
  
  module.exports = { findZipcodesWithinWithDistance };
