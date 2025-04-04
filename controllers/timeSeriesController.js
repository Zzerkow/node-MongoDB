const TimesSeriesModel = require('../models/TimesSeriesModel');

exports.createTimeSeries = async (req, res) => {
    try {
      const location = new TimesSeriesModel(req.body);
      await timeSerie.save();
      res.status(201).json(location);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };