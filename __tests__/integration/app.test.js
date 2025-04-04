const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const locationRoutes = require('../../routes/locationRoutes');
const timeseriesRoutes = require('../../routes/timeseriesRoutes');

const creerAppTest = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/locations', locationRoutes);
  app.use('/api/timeseries', timeseriesRoutes);
  return app;
};

describe('Tests d’intégration complets de l’application', () => {
  let app;

  beforeEach(() => {
    app = creerAppTest();
  });

  describe('Intégration des routes API', () => {
    it('devrait avoir des routes location fonctionnelles', async () => {
      const nouvelleLocation = {
        name: 'Lieu Test Intégration',
        coordinates: {
          type: 'Point',
          coordinates: [12.345, 67.890]
        }
      };

      const reponseCreation = await request(app)
        .post('/api/locations')
        .send(nouvelleLocation)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(reponseCreation.body.name).toBe(nouvelleLocation.name);
      
      const reponseGet = await request(app)
        .get('/api/locations')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(reponseGet.body).toBeInstanceOf(Array);
      expect(reponseGet.body.length).toBeGreaterThan(0);
      
      const locationCreee = reponseGet.body.find(loc => loc._id === reponseCreation.body._id);
      expect(locationCreee).toBeDefined();
      expect(locationCreee.name).toBe(nouvelleLocation.name);
    });

    it('devrait avoir des routes timeseries fonctionnelles', async () => {
      const nouvelleEntree = {
        value: 123.45,
        timestamp: new Date('2023-05-15T10:30:00Z')
      };

      const reponseCreation = await request(app)
        .post('/api/timeseries')
        .send(nouvelleEntree)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(reponseCreation.body.value).toBe(nouvelleEntree.value);
      
      const reponseGet = await request(app)
        .get('/api/timeseries')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(reponseGet.body).toBeInstanceOf(Array);
      expect(reponseGet.body.length).toBeGreaterThan(0);
      
      const entreeCreee = reponseGet.body.find(entry => entry._id === reponseCreation.body._id);
      expect(entreeCreee).toBeDefined();
      expect(entreeCreee.value).toBe(nouvelleEntree.value);
    });

    it('devrait gérer correctement les erreurs', async () => {
      const locationInvalide = {
        name: 'Lieu Invalide'
      };

      await request(app)
        .post('/api/locations')
        .send(locationInvalide)
        .expect('Content-Type', /json/)
        .expect(400);

      const entreeInvalide = {
        timestamp: new Date()
      };

      await request(app)
        .post('/api/timeseries')
        .send(entreeInvalide)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('devrait gérer les routes inexistantes', async () => {
      await request(app)
        .get('/api/locations/nonexistentid')
        .expect('Content-Type', /json/)
        .expect(404);

      await request(app)
        .get('/api/timeseries/nonexistentid')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });
});
