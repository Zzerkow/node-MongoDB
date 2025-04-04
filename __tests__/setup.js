const mongoose = require('mongoose');

// Setup before all tests
beforeAll(async () => {
  const mongoUri = 'mongodb://localhost:27017/challenge2025';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});