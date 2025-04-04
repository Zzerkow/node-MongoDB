const mongoose = require('mongoose');
const Location = require('../../models/LocationModel');

describe('Location Model', () => {
  describe('Schema validation', () => {
    it('should create a valid location', async () => {
      const validLocation = {
        name: 'Test Location',
        coordinates: {
          type: 'Point',
          coordinates: [10.123, 20.456]
        }
      };

      const location = new Location(validLocation);
      const savedLocation = await location.save();
      
      expect(savedLocation._id).toBeDefined();
      expect(savedLocation.name).toBe(validLocation.name);
      expect(savedLocation.coordinates.type).toBe(validLocation.coordinates.type);
      expect(savedLocation.coordinates.coordinates).toEqual(validLocation.coordinates.coordinates);
    });
  });

  describe('Geospatial functionality', () => {
    beforeEach(async () => {
      await Location.create([
        {
          name: 'Location A',
          coordinates: {
            type: 'Point',
            coordinates: [10.0, 10.0]
          }
        },
        {
          name: 'Location B',
          coordinates: {
            type: 'Point',
            coordinates: [10.1, 10.1]
          }
        },
        {
          name: 'Location C',
          coordinates: {
            type: 'Point',
            coordinates: [20.0, 20.0]
          }
        }
      ]);
    });

    it('should support geospatial queries', async () => {
      const nearPoint = [10.05, 10.05];
      const maxDistance = 10000;
      
      const nearbyLocations = await Location.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: nearPoint
            },
            $maxDistance: maxDistance
          }
        }
      });
      
      expect(nearbyLocations.length).toBe(2);
      expect(nearbyLocations.some(loc => loc.name === 'Location A')).toBe(true);
      expect(nearbyLocations.some(loc => loc.name === 'Location B')).toBe(true);
      expect(nearbyLocations.some(loc => loc.name === 'Location C')).toBe(false);
    });
  });
});