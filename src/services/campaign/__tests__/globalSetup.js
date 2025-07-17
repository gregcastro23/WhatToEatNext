/**
 * Global Test Setup for Campaign Testing Infrastructure
 * Perfect Codebase Campaign - Global Test Configuration
 */

module.exports = async () => {
  console.log('🚀 Starting Campaign Testing Infrastructure...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.CAMPAIGN_TEST_MODE = 'true';
  
  // Configure test timeouts
  jest.setTimeout(30000);
  
  // Mock console methods to reduce noise during tests
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
  
  // Store original console for restoration
  global.originalConsole = originalConsole;
  
  console.log('✅ Campaign Testing Infrastructure initialized');
};