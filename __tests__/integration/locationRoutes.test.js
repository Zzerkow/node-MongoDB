const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const locationRoutes = require('../../routes/locationRoutes');
const Location = require('../../models/LocationModel');

const app = express();
app.use(express.json());
app.use('/api/locations', locationRoutes);

describe('Routes API de Location', () => {
  describe('GET /api/locations', () => {
    it('devrait retourner toutes les locations', async () => {
      await Location.create([
        {
          name: 'Lieu Test 1',
          coordinates: {
            type: 'Point',
            coordinates: [10.123, 20.456]
          }
        },
        {
          name: 'Lieu Test 2',
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
      expect(response.body[0].name).toBe('Lieu Test 1');
      expect(response.body[1].name).toBe('Lieu Test 2');
      expect(response.body[0].coordinates.coordinates).toEqual([10.123, 20.456]);
      expect(response.body[1].coordinates.coordinates).toEqual([30.789, 40.123]);
    });

    it('devrait retourner un tableau vide s’il n’existe aucune location', async () => {
      const response = await request(app)
        .get('/api/locations')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/locations', () => {
    it('devrait créer une nouvelle location', async () => {
      const nouvelleLocation = {
        name: 'Nouvelle Location Test',
        coordinates: {
          type: 'Point',
          coordinates: [15.678, 25.987]
        }
      };

      const response = await request(app)
        .post('/api/locations')
        .send(nouvelleLocation)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.name).toBe(nouvelleLocation.name);
      expect(response.body.coordinates.coordinates).toEqual(nouvelleLocation.coordinates.coordinates);
      
      const locationSauvegardee = await Location.findById(response.body._id);
      expect(locationSauvegardee).not.toBeNull();
      expect(locationSauvegardee.name).toBe(nouvelleLocation.name);
      expect(locationSauvegardee.coordinates.coordinates).toEqual(nouvelleLocation.coordinates.coordinates);
    });

    it('devrait retourner une erreur 400 pour des données invalides', async () => {
      const locationInvalide = {
        name: 'Location Invalide'
      };

      const response = await request(app)
        .post('/api/locations')
        .send(locationInvalide)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('devrait retourner une erreur 400 pour un format de coordonnées invalide', async () => {
      const locationInvalide = {
        name: 'Coordonnées Invalides',
        coordinates: {
          type: 'Point',
          coordinates: 'pas-un-tableau'
        }
      };

      const response = await request(app)
        .post('/api/locations')
        .send(locationInvalide)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
