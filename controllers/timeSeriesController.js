const TimeSeries = require('../models/TimesSeriesModel');

exports.createTimeSeries = async (req, res) => {
  try {
    const data = new TimeSeries(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTimeSeries = async (req, res) => {
  try {
    const allData = await TimeSeries.find();
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimeSeriesById = async (req, res) => {
  try {
    const data = await TimeSeries.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTimeSeries = async (req, res) => {
  try {
    const data = await TimeSeries.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTimeSeries = async (req, res) => {
  try {
    await TimeSeries.findByIdAndDelete(req.params.id);
    res.json({ message: 'TimeSeries entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimeSeriesByLocationAndPeriod = async (req, res) => {
  const { locationId } = req.params;
  const period = req.query.period || '1h';

  // Définir les périodes en heures
  const periodsMap = {
    '10min': 10 / 60,
    '1h': 1,
    '3h': 3,
    '6h': 6,
    '24h': 24
  };

  const hours = periodsMap[period] || 1; // Par défaut, 1 heure
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  try {
    const collection = req.app.get('mongoose').connection.collection('timeseries');
    const data = await collection.find({
      locationId,
      timestamp: { $gte: since }
    }).sort({ timestamp: 1 }).toArray();

    res.json(data);
  } catch (err) {
    console.error(`Erreur dans getTimeSeriesByLocationAndPeriod pour locationId ${locationId}:`, err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des séries temporelles' });
  }
};

exports.addMeasurement = async (req, res) => {
  try {
    const { value, locationId } = req.body;

    const collection = req.app.get('mongoose').connection.collection('timeseries');

    await collection.insertOne({
      timestamp: new Date(),
      value,
      locationId
    });

    res.status(201).json({ message: 'Mesure ajoutée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};