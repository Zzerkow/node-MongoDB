const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: String,
  coordinates: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
});

locationSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Location", locationSchema);
