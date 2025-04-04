const mongoose = require('mongoose');
const Location = require('../../models/LocationModel');

describe('Location Model - Unit Tests', () => {
  it('should save location and assign an _id', async () => {
    const data = {
      name: 'Saved Location',
      coordinates: {
        coordinates: [7.89, 1.23]
      }
    };

    const loc = new Location(data);
    const saved = await loc.save();

    expect(saved._id).toBeDefined();
    expect(saved.name).toBe(data.name);
    expect(saved.coordinates.coordinates).toEqual(data.coordinates.coordinates);
    expect(saved.coordinates.type).toBe('Point');
  });

  it('should return empty array on find()', async () => {
    const results = await Location.find().sort().exec();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
  });

  it('should return null on findById()', async () => {
    const fakeId = new mongoose.Types.ObjectId(); // ID au bon format mais inexistant
    const result = await Location.findById(fakeId).exec();
    expect(result).toBeNull();
  });
});
