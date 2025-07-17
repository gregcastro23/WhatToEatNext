/**
 * Global Test Teardown for Campaign Testing Infrastructure
 * Perfect Codebase Campaign - Global Test Cleanup
 */

module.exports = async () => {
  console.log('🧹 Cleaning up Campaign Testing Infrastructure...');
  
  // Restore original console
  if (global.originalConsole) {
    global.console = global.originalConsole;
  }
  
  // Clean up test environment variables
  delete process.env.CAMPAIGN_TEST_MODE;
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  console.log('✅ Campaign Testing Infrastructure cleanup complete');
};