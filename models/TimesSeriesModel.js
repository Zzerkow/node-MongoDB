const timeSeriesSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  value: Number
}, { timeseries: { timeField: "timestamp" } });

module.exports = mongoose.model("TimeSeries", timeSeriesSchema);