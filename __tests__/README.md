# Testing Documentation

This directory contains tests for the Node.js + Express + MongoDB application. The tests are organized into unit tests and integration tests.

## Test Structure

- `__tests__/setup.js`: Common setup for all tests, including MongoDB memory server configuration
- `__tests__/unit/`: Unit tests for individual components
  - `LocationModel.test.js`: Tests for the Location model
  - `TimesSeriesModel.test.js`: Tests for the TimeSeries model
- `__tests__/integration/`: Integration tests for API endpoints
  - `locationRoutes.test.js`: Tests for location API endpoints
  - `timeseriesRoutes.test.js`: Tests for timeseries API endpoints
  - `app.test.js`: Tests for the entire application

## Testing Approach

### Unit Tests

Unit tests focus on testing individual components in isolation. For models, they test:
- Schema validation
- Default values
- Special functionality (geospatial queries for locations, time-based queries for timeseries)

### Integration Tests

Integration tests focus on testing the API endpoints and their interaction with the database. They test:
- GET and POST routes
- Error handling for invalid data
- Complete request-response cycles

### Database Testing Options

#### MongoDB Memory Server (Default)

By default, tests use an in-memory MongoDB server to avoid affecting the real database. This is set up in `setup.js` and provides:
- Isolated test environment
- Fast test execution
- No need to clean up the real database after tests

#### Mock Database (Alternative)

An alternative mock implementation is provided in `setup-mock.js` for environments where MongoDB Memory Server is not compatible (e.g., CPUs without AVX support). To use the mock implementation:

1. Update the Jest configuration in `jest.config.js`:
   ```js
   setupFilesAfterEnv: ['<rootDir>/__tests__/setup-mock.js'],
   ```

The mock implementation:
- Doesn't require a real MongoDB or MongoDB Memory Server
- Mocks all database operations
- Allows tests to run in any environment
- Is useful for quick tests that don't need actual database validation

## Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- __tests__/integration/locationRoutes.test.js
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Clean Up**: The `afterEach` hook in `setup.js` cleans up the database after each test.
3. **Realistic Data**: Use realistic test data that mimics production data.
4. **Error Cases**: Always test error cases and edge cases, not just the happy path.
5. **Assertions**: Make specific assertions about the response structure and content.