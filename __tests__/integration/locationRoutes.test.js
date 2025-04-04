const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const locationRoutes = require('../../routes/locationRoutes');
const Location = require('../../models/LocationModel');

const app = express();
app.use(express.json());
app.use('/api/locations', locationRoutes);

describe('Location API Routes', () => {
  describe('GET /api/locations', () => {
    it('should return all locations', async () => {
      await Location.create([
        {
          name: 'Test Location 1',
          coordinates: {
            type: 'Point',
            coordinates: [10.123, 20.456]
          }
        },
        {
          name: 'Test Location 2',
          coordinates: {
            type: 'Point',
            coordinates: [30.789, 40.123]
          }
        }
      ]);

      const response = await request(app)
        .get('/api/locations')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Test Location 1');
      expect(response.body[1].name).toBe('Test Location 2');
      expect(response.body[0].coordinates.coordinates).toEqual([10.123, 20.456]);
      expect(response.body[1].coordinates.coordinates).toEqual([30.789, 40.123]);
    });
  });

  describe('POST /api/locations', () => {
    it('should create a new location', async () => {
      const newLocation = {
        name: 'New Test Location',
        coordinates: {
          type: 'Point',
          coordinates: [15.678, 25.987]
        }
      };

      const response = await request(app)
        .post('/api/locations')
        .send(newLocation)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.name).toBe(newLocation.name);
      expect(response.body.coordinates.coordinates).toEqual(newLocation.coordinates.coordinates);
      
      const savedLocation = await Location.findById(response.body._id);
      expect(savedLocation).not.toBeNull();
      expect(savedLocation.name).toBe(newLocation.name);
      expect(savedLocation.coordinates.coordinates).toEqual(newLocation.coordinates.coordinates);
    });

    it('should return 400 for invalid location data', async () => {
      const invalidLocation = {
        name: 'Invalid Location'
      };

      const response = await request(app)
        .post('/api/locations')
        .send(invalidLocation)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});