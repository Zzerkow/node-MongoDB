const express = require('express');
const router = express.Router();
const timeSeriesController = require('../controllers/timeSeriesController');

router.post('/', timeSeriesController.createTimeSeries);
router.get('/', timeSeriesController.getAllTimeSeries);
router.get('/:id', timeSeriesController.getTimeSeriesById);
router.put('/:id', timeSeriesController.updateTimeSeries);
router.delete('/:id', timeSeriesController.deleteTimeSeries);
router.get('/:locationId', timeSeriesController.getTimeSeriesByLocationAndPeriod);
router.post('/add-measurement', timeSeriesController.addMeasurement);

module.exports = router;