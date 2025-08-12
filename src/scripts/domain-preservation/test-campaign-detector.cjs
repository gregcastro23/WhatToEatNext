#!/usr/bin/env node

/**
 * Simple test runner for Campaign System Variable Detection System
 */

const CampaignSystemDetector = require('./campaign-system-detector.cjs');

console.log('🧪 Testing Campaign System Detector...\n');

const detector = new CampaignSystemDetector();
let passed = 0;
let failed = 0;

const test = (description, assertion, expected) => {
  try {
    if (assertion === expected) {
      console.log(`✓ ${description}`);
      passed++;
    } else {
      console.log(`✗ ${description}: Expected ${expected}, got ${assertion}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${description}: ${error.message}`);
    failed++;
  }
};

console.log('Testing campaign orchestration variables...');
const campaignResult = detector.detectCampaignDomain('campaign', '/src/services/campaign/controller.ts');
test('Campaign should be preserved', campaignResult.shouldPreserve, true);
test('Campaign should be campaign domain', campaignResult.domain, 'campaign');
test('Campaign should be orchestration category', campaignResult.category, 'campaignOrchestration');

console.log('\nTesting metrics system variables...');
const metricsResult = detector.detectCampaignDomain('metrics', '/src/services/campaign/tracker.ts');
test('Metrics should be preserved', metricsResult.shouldPreserve, true);
test('Metrics should be campaign domain', metricsResult.domain, 'campaign');
test('Metrics should be metrics category', metricsResult.category, 'metricsSystem');

console.log('\nTesting progress tracking variables...');
const progressResult = detector.detectCampaignDomain('progress', '/src/services/campaign/progress.ts');
test('Progress should be preserved', progressResult.shouldPreserve, true);
test('Progress should be progress category', progressResult.category, 'progressTracking');

console.log('\nTesting safety protocol variables...');
const safetyResult = detector.detectCampaignDomain('safety', '/src/services/campaign/safety.ts');
test('Safety should be preserved', safetyResult.shouldPreserve, true);
test('Safety should be safety category', safetyResult.category, 'safetyProtocols');

console.log('\nTesting intelligence system variables...');
const intelligenceResult = detector.detectCampaignDomain('intelligence', '/src/services/campaign/intelligence.ts');
test('Intelligence should be preserved', intelligenceResult.shouldPreserve, true);
test('Intelligence should be intelligence category', intelligenceResult.category, 'intelligenceSystem');

console.log('\nTesting validation system variables...');
const validationResult = detector.detectCampaignDomain('validation', '/src/services/campaign/validation.ts');
test('Validation should be preserved', validationResult.shouldPreserve, true);
test('Validation should be validation category', validationResult.category, 'validationSystem');

console.log('\nTesting monitoring system variables...');
const monitorResult = detector.detectCampaignDomain('monitor', '/src/services/campaign/monitoring.ts');
test('Monitor should be preserved', monitorResult.shouldPreserve, true);
test('Monitor should be monitoring category', monitorResult.category, 'monitoringSystem');

console.log('\nTesting specific campaign variables...');
const performanceMetricsResult = detector.detectCampaignDomain('performanceMetrics', '/src/services/campaign/performance.ts');
test('Performance metrics should be preserved', performanceMetricsResult.shouldPreserve, true);

const progressTrackerResult = detector.detectCampaignDomain('progressTracker', '/src/services/campaign/tracker.ts');
test('Progress tracker should be preserved', progressTrackerResult.shouldPreserve, true);

const safetyProtocolResult = detector.detectCampaignDomain('safetyProtocol', '/src/services/campaign/safety.ts');
test('Safety protocol should be preserved', safetyProtocolResult.shouldPreserve, true);

console.log('\nTesting generic variables...');
const genericResult = detector.detectCampaignDomain('data', '/src/utils/generic.ts');
test('Generic data should not be preserved', genericResult.shouldPreserve, false);
test('Generic data should be generic domain', genericResult.domain, 'generic');

console.log('\nTesting file-specific rules...');
const campaignRules = detector.getFileSpecificRules('/src/services/campaign/CampaignController.ts');
test('Campaign controller should have high preservation', campaignRules.preservationLevel, 'high');
test('Campaign controller should require manual review', campaignRules.requiresManualReview, true);

const intelligenceRules = detector.getFileSpecificRules('/src/services/campaign/CampaignIntelligenceSystem.ts');
console.log('Intelligence rules:', intelligenceRules);
test('Intelligence system should have maximum preservation', intelligenceRules.preservationLevel, 'maximum');

console.log('\nTesting preservation report...');
const testVariables = [
  { variableName: 'campaign', filePath: '/src/services/campaign/controller.ts' },
  { variableName: 'metrics', filePath: '/src/services/campaign/metrics.ts' },
  { variableName: 'progress', filePath: '/src/services/campaign/progress.ts' },
  { variableName: 'data', filePath: '/src/utils/generic.ts' }
];
const report = detector.generatePreservationReport(testVariables);
test('Report should have correct total', report.totalVariables, 4);
test('Report should preserve 3 variables', report.preservedVariables, 3);

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
