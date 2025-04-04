const mongoose = require('mongoose');
const timeSeriesSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  name: String,
  coordinates: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true }
  }
}, { timeseries: { timeField: "timestamp" } });

module.exports = mongoose.model("TimeSeries", timeSeriesSchema);