const mongoose = require('mongoose');
const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config(); // Load .env file

// ✅ Replace this with your actual DB name
mongoose.connect('mongodb://127.0.0.1:27017/yourDatabaseName')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error", err));

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function updateOldListingsWithGeo() {
  const listings = await Listing.find({ 
    $or: [ 
      { geometry: { $exists: false } }, 
      { "geometry.coordinates": [0, 0] } 
    ] 
  });

  console.log(`🔍 Found ${listings.length} listings to update...\n`);

  for (let listing of listings) {
    try {
      const response = await geocodingClient.forwardGeocode({
        query: listing.location,
        limit: 1
      }).send();

      const features = response.body.features;

      console.log(`📍 ${listing.title} (${listing.location})`);

      if (features.length === 0) {
        // 🛠️ Default to Noida if location not found
        listing.geometry = {
          type: "Point",
          coordinates: [77.3910, 28.5355] // [lng, lat] → Noida
        };
        console.log("⚠️ Location not found. Set default Noida coordinates.\n");
      } else {
        listing.geometry = features[0].geometry;
        console.log("✅ Coordinates updated:", features[0].geometry.coordinates, "\n");
      }

      await listing.save();

    } catch (err) {
      console.error(`❌ Error for: ${listing.title} - ${err.message}\n`);
    }
  }

  mongoose.connection.close();
}

updateOldListingsWithGeo();
