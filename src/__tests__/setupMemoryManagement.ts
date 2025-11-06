// Memory management for Jest tests

// Force garbage collection after each test suite
afterAll(() => {
  if (global.gc) {
    global.gc();
  }
});

// Clear all mocks and timers after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
