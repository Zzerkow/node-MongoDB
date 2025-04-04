# Testing Documentation

This directory contains tests for the Node.js + Express + MongoDB application. The tests are organized into unit tests and integration tests, with a focus on the most critical functionality.

## Test Structure

- `__tests__/setup.js`: Common setup for all tests, including MongoDB memory server configuration
- `__tests__/unit/`: Unit tests for individual components
  - `LocationModel.test.js`: Tests for the Location model (2 tests)
  - `TimesSeriesModel.test.js`: Tests for the TimeSeries model (2 tests)
- `__tests__/integration/`: Integration tests for API endpoints
  - `locationRoutes.test.js`: Tests for location API endpoints (3 tests)
  - `timeseriesRoutes.test.js`: Tests for timeseries API endpoints (3 tests)
  - `app.test.js`: Test for the entire application (1 test)

## Testing Approach

### Focused Testing

The test suite has been streamlined to focus on the most critical functionality, with a total of 10 tests:

1. **Unit Tests (4 tests)**:
   - Basic model functionality (creation and validation)
   - Specialized functionality (geospatial for locations, time-based for timeseries)

2. **Integration Tests (6 tests)**:
   - GET and POST routes for both APIs
   - Error handling for invalid data
   - Full application integration

### MongoDB Memory Server

All tests use an in-memory MongoDB server to avoid affecting the real database. This is set up in `setup.js` and provides:
- Isolated test environment with realistic MongoDB behavior
- Fast test execution
- No need to clean up the real database after tests

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

1. **Test Isolation**: Each test is independent and doesn't rely on the state from other tests.
2. **Clean Up**: The `afterEach` hook in `setup.js` cleans up the database after each test.
3. **Realistic Data**: Tests use realistic data that mimics production data.
4. **Critical Path Testing**: Tests focus on the most critical functionality rather than exhaustive testing.
5. **Assertions**: Tests make specific assertions about the response structure and content.