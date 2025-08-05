/**
 * Jest setup file for image enhancement tests
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock fetch for metadata loading
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      hero: {},
      services: {},
      about: {},
      reviews: {},
      seo: {}
    })
  })
);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor() {}
  observe() {}
  disconnect() {}
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});