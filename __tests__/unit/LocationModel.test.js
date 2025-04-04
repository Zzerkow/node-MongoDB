const mongoose = require('mongoose');
const Location = require('../../models/LocationModel');

describe('Modèle Location', () => {
  describe('Validation du schéma', () => {
    it('devrait créer un emplacement valide', async () => {
      const locationValide = {
        name: 'Emplacement Test',
        coordinates: {
          type: 'Point',
          coordinates: [10.123, 20.456]
        }
      };

      const location = new Location(locationValide);
      const savedLocation = await location.save();
      
      expect(savedLocation._id).toBeDefined();
      expect(savedLocation.name).toBe(locationValide.name);
      expect(savedLocation.coordinates.type).toBe(locationValide.coordinates.type);
      expect(savedLocation.coordinates.coordinates).toEqual(locationValide.coordinates.coordinates);
    });

    it('devrait échouer si les coordonnées sont absentes', async () => {
      const locationInvalide = {
        name: 'Emplacement Invalide'
      };

      const location = new Location(locationInvalide);
      await expect(location.save()).rejects.toThrow();
    });

    it('devrait échouer si les coordonnées ne sont pas un tableau', async () => {
      const locationInvalide = {
        name: 'Coordonnées Invalides',
        coordinates: {
          type: 'Point',
          coordinates: 'pas-un-tableau'
        }
      };

      const location = new Location(locationInvalide);
      await expect(location.save()).rejects.toThrow();
    });

    it('devrait utiliser le type "Point" par défaut si non fourni', async () => {
      const locationSansType = {
        name: 'Emplacement Sans Type',
        coordinates: {
          coordinates: [30.789, 40.123]
        }
      };

      const location = new Location(locationSansType);
      const savedLocation = await location.save();
      
      expect(savedLocation.coordinates.type).toBe('Point');
    });
  });

  describe('Fonctionnalité géospatiale', () => {
    beforeEach(async () => {
      await Location.create([
        {
          name: 'Emplacement A',
          coordinates: {
            type: 'Point',
            coordinates: [10.0, 10.0]
          }
        },
        {
          name: 'Emplacement B',
          coordinates: {
            type: 'Point',
            coordinates: [10.1, 10.1]
          }
        },
        {
          name: 'Emplacement C',
          coordinates: {
            type: 'Point',
            coordinates: [20.0, 20.0]
          }
        }
      ]);
    });

    it('devrait permettre les requêtes géospatiales', async () => {
      const pointProche = [10.05, 10.05];
      const distanceMax = 10000;

      const emplacementsProches = await Location.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: pointProche
            },
            $maxDistance: distanceMax
          }
        }
      });

      expect(emplacementsProches.length).toBe(2);
      expect(emplacementsProches.some(loc => loc.name === 'Emplacement A')).toBe(true);
      expect(emplacementsProches.some(loc => loc.name === 'Emplacement B')).toBe(true);
      expect(emplacementsProches.some(loc => loc.name === 'Emplacement C')).toBe(false);
    });
  });
});
