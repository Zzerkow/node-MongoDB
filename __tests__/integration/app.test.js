const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const locationRoutes = require('../../routes/locationRoutes');
const timeseriesRoutes = require('../../routes/timeseriesRoutes');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/locations', locationRoutes);
  app.use('/api/timeseries', timeseriesRoutes);
  return app;
};

describe('Full App Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should have working location and timeseries routes', async () => {
    const newLocation = {
      name: 'Integration Test Location',
      coordinates: {
        type: 'Point',
        coordinates: [12.345, 67.890]
      }
    };

    const locationResponse = await request(app)
      .post('/api/locations')
      .send(newLocation)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(locationResponse.body.name).toBe(newLocation.name);
    
    const newTimeseries = {
      value: 123.45,
      timestamp: new Date('2023-05-15T10:30:00Z')
    };

    const timeseriesResponse = await request(app)
      .post('/api/timeseries')
      .send(newTimeseries)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(timeseriesResponse.body.value).toBe(newTimeseries.value);
    
    const locationsGetResponse = await request(app)
      .get('/api/locations')
      .expect('Content-Type', /json/)
      .expect(200);

    const timeseriesGetResponse = await request(app)
      .get('/api/timeseries')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(locationsGetResponse.body).toBeInstanceOf(Array);
    expect(locationsGetResponse.body.length).toBeGreaterThan(0);
    
    expect(timeseriesGetResponse.body).toBeInstanceOf(Array);
    expect(timeseriesGetResponse.body.length).toBeGreaterThan(0);
  });
});