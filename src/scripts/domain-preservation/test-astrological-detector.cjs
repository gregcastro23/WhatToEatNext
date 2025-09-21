#!/usr/bin/env node

/**
 * Simple test runner for Astrological Domain Variable Detection System
 */

const AstrologicalDomainDetector = require('./astrological-domain-detector.cjs');

console.log('🧪 Testing Astrological Domain Detector...\n');

const detector = new AstrologicalDomainDetector();
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

console.log('Testing planetary position variables...');
const planetResult = detector.detectAstrologicalDomain('mercury', '/src/calculations/planetary.ts');
test('Mercury should be preserved', planetResult.shouldPreserve, true);
test('Mercury should be astrological domain', planetResult.domain, 'astrological');
test('Mercury should be planets category', planetResult.category, 'planets');

console.log('\nTesting elemental variables...');
const elementResult = detector.detectAstrologicalDomain('fireElement', '/src/calculations/elemental.ts');
test('Fire element should be preserved', elementResult.shouldPreserve, true);
test('Fire element should be astrological domain', elementResult.domain, 'astrological');
test('Fire element should be elemental category', elementResult.category, 'elementalSystem');

console.log('\nTesting zodiac signs...');
const signResult = detector.detectAstrologicalDomain('aries', '/src/calculations/zodiac.ts');
test('Aries should be preserved', signResult.shouldPreserve, true);
test('Aries should be zodiac category', signResult.category, 'zodiacSigns');

console.log('\nTesting astronomical calculations...');
const transitResult = detector.detectAstrologicalDomain('retrograde', '/src/calculations/aspects.ts');
test('Retrograde should be preserved', transitResult.shouldPreserve, true);
test('Retrograde should be astronomical category', transitResult.category, 'astronomicalCalculations');

console.log('\nTesting generic variables...');
const genericResult = detector.detectAstrologicalDomain('data', '/src/utils/generic.ts');
test('Generic data should not be preserved', genericResult.shouldPreserve, false);
test('Generic data should be generic domain', genericResult.domain, 'generic');

console.log('\nTesting file-specific rules...');
const criticalRules = detector.getFileSpecificRules('/src/utils/reliableAstronomy.ts');
test('Critical file should have maximum preservation', criticalRules.preservationLevel, 'maximum');
test('Critical file should require manual review', criticalRules.requiresManualReview, true);

console.log('\nTesting preservation report...');
const testVariables = [
  { variableName: 'mercury', filePath: '/src/calculations/planetary.ts' },
  { variableName: 'fireElement', filePath: '/src/calculations/elemental.ts' },
  { variableName: 'data', filePath: '/src/utils/generic.ts' }
];
const report = detector.generatePreservationReport(testVariables);
test('Report should have correct total', report.totalVariables, 3);
test('Report should preserve 2 variables', report.preservedVariables, 2);

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
