const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const timeseriesRoutes = require('../../routes/timeseriesRoutes');
const TimeSeries = require('../../models/TimesSeriesModel');

const app = express();
app.use(express.json());
app.use('/api/timeseries', timeseriesRoutes);

describe('Routes API de TimeSeries', () => {
  describe('GET /api/timeseries', () => {
    it('devrait retourner toutes les entrées de la série temporelle', async () => {
      const date1 = new Date('2023-01-01T12:00:00Z');
      const date2 = new Date('2023-01-02T12:00:00Z');
      
      await TimeSeries.create([
        {
          timestamp: date1,
          value: 42.5
        },
        {
          timestamp: date2,
          value: 37.8
        }
      ]);

      const response = await request(app)
        .get('/api/timeseries')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);

      const values = response.body.map(entry => entry.value);
      expect(values).toContain(42.5);
      expect(values).toContain(37.8);

      const timestamps = response.body.map(entry => new Date(entry.timestamp).toISOString());
      expect(timestamps).toContain(date1.toISOString());
      expect(timestamps).toContain(date2.toISOString());
    });

    it('devrait retourner un tableau vide s’il n’y a aucune entrée', async () => {
      const response = await request(app)
        .get('/api/timeseries')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/timeseries', () => {
    it('devrait créer une nouvelle entrée', async () => {
      const timestamp = new Date('2023-01-03T15:30:00Z');
      const newEntry = {
        timestamp: timestamp,
        value: 56.7
      };

      const response = await request(app)
        .post('/api/timeseries')
        .send(newEntry)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.value).toBe(newEntry.value);
      expect(new Date(response.body.timestamp).toISOString()).toBe(timestamp.toISOString());

      const savedEntry = await TimeSeries.findById(response.body._id);
      expect(savedEntry).not.toBeNull();
      expect(savedEntry.value).toBe(newEntry.value);
      expect(savedEntry.timestamp.toISOString()).toBe(timestamp.toISOString());
    });

    it('devrait créer une nouvelle entrée avec l’horodatage actuel si aucun n’est fourni', async () => {
      const newEntry = {
        value: 78.9
      };

      const response = await request(app)
        .post('/api/timeseries')
        .send(newEntry)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.value).toBe(newEntry.value);
      expect(response.body).toHaveProperty('timestamp');

      const savedEntry = await TimeSeries.findById(response.body._id);
      expect(savedEntry).not.toBeNull();
      expect(savedEntry.value).toBe(newEntry.value);
      expect(savedEntry).toHaveProperty('timestamp');
    });

    it('devrait retourner une erreur 400 pour des données invalides', async () => {
      const invalidEntry = {
        timestamp: new Date()
      };

      const response = await request(app)
        .post('/api/timeseries')
        .send(invalidEntry)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('devrait retourner une erreur 400 pour un type de valeur invalide', async () => {
      const invalidEntry = {
        timestamp: new Date(),
        value: 'pas-un-nombre'
      };

      const response = await request(app)
        .post('/api/timeseries')
        .send(invalidEntry)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
