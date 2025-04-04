const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const locationRoutes = require('../../routes/locationRoutes');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/locations', locationRoutes);
  return app;
};

describe('Location Routes Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should create and retrieve locations correctly', async () => {
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

    const locationsGetResponse = await request(app)
      .get('/api/locations')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(locationsGetResponse.body).toBeInstanceOf(Array);
    expect(locationsGetResponse.body.length).toBeGreaterThan(0);
  });
});
