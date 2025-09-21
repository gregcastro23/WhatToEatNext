#!/usr/bin/env node

/**
 * Simple test runner for Test File Variable Detection System
 */

const TestFileDetector = require('./test-file-detector.cjs');

console.log('🧪 Testing Test File Detector...\n');

const detector = new TestFileDetector();
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

console.log('Testing test file detection...');
test('Should detect .test.ts files', detector.isTestFile('/src/components/Button.test.ts'), true);
test('Should detect .spec.js files', detector.isTestFile('/src/utils/helper.spec.js'), true);
test('Should detect __tests__ directory', detector.isTestFile('/src/services/__tests__/api.ts'), true);
test('Should not detect regular files', detector.isTestFile('/src/components/Button.ts'), false);

console.log('\nTesting testing framework variables...');
const testFrameworkResult = detector.detectTestDomain('describe', '/src/components/Button.test.ts');
test('Describe should be preserved', testFrameworkResult.shouldPreserve, true);
test('Describe should be test domain', testFrameworkResult.domain, 'test');
test('Describe should be testing framework category', testFrameworkResult.category, 'testingFramework');

const expectResult = detector.detectTestDomain('expect', '/src/utils/helper.spec.ts');
test('Expect should be preserved', expectResult.shouldPreserve, true);
test('Expect should be testing framework category', expectResult.category, 'testingFramework');

const itResult = detector.detectTestDomain('it', '/src/services/__tests__/api.ts');
test('It should be preserved', itResult.shouldPreserve, true);
test('It should be testing framework category', itResult.category, 'testingFramework');

console.log('\nTesting mocking system variables...');
const mockResult = detector.detectTestDomain('mock', '/src/components/Button.test.ts');
test('Mock should be preserved', mockResult.shouldPreserve, true);
test('Mock should be mocking category', mockResult.category, 'mockingSystem');

const stubResult = detector.detectTestDomain('stub', '/src/services/__tests__/api.ts');
test('Stub should be preserved', stubResult.shouldPreserve, true);
test('Stub should be mocking category', stubResult.category, 'mockingSystem');

const spyResult = detector.detectTestDomain('spy', '/src/utils/helper.spec.ts');
test('Spy should be preserved', spyResult.shouldPreserve, true);
test('Spy should be mocking category', spyResult.category, 'mockingSystem');

console.log('\nTesting culinary domain variables...');
const recipeResult = detector.detectTestDomain('recipe', '/src/data/__tests__/recipes.test.ts');
test('Recipe should be preserved', recipeResult.shouldPreserve, true);
test('Recipe should be culinary category', recipeResult.category, 'culinaryDomain');

const ingredientResult = detector.detectTestDomain('ingredient', '/src/data/__tests__/ingredients.test.ts');
test('Ingredient should be preserved', ingredientResult.shouldPreserve, true);
test('Ingredient should be culinary category', ingredientResult.category, 'culinaryDomain');

const cuisineResult = detector.detectTestDomain('cuisine', '/src/services/__tests__/culinary.test.ts');
test('Cuisine should be preserved', cuisineResult.shouldPreserve, true);
test('Cuisine should be culinary category', cuisineResult.category, 'culinaryDomain');

console.log('\nTesting astrological culinary variables...');
const astrologicalCookingResult = detector.detectTestDomain('astrologicalCooking', '/src/calculations/__tests__/culinary.test.ts');
test('Astrological cooking should be preserved', astrologicalCookingResult.shouldPreserve, true);
test('Astrological cooking should be astrological culinary category', astrologicalCookingResult.category, 'astrologicalCulinary');

const elementalIngredientResult = detector.detectTestDomain('elementalIngredient', '/src/data/__tests__/elemental.test.ts');
test('Elemental ingredient should be preserved', elementalIngredientResult.shouldPreserve, true);
test('Elemental ingredient should be astrological culinary category', elementalIngredientResult.category, 'astrologicalCulinary');

console.log('\nTesting React testing variables...');
const renderResult = detector.detectTestDomain('render', '/src/components/__tests__/Button.test.tsx');
test('Render should be preserved', renderResult.shouldPreserve, true);
test('Render should be React testing category', renderResult.category, 'reactTesting');

const componentResult = detector.detectTestDomain('component', '/src/components/__tests__/Form.test.tsx');
test('Component should be preserved', componentResult.shouldPreserve, true);
test('Component should be React testing category', componentResult.category, 'reactTesting');

console.log('\nTesting test fixtures...');
const fixtureResult = detector.detectTestDomain('fixture', '/src/__tests__/fixtures/data.ts');
test('Fixture should be preserved', fixtureResult.shouldPreserve, true);
test('Fixture should be test fixtures category', fixtureResult.category, 'testFixtures');

const factoryResult = detector.detectTestDomain('factory', '/src/__tests__/factories/user.ts');
test('Factory should be preserved', factoryResult.shouldPreserve, true);
test('Factory should be test fixtures category', factoryResult.category, 'testFixtures');

console.log('\nTesting non-test files...');
const nonTestResult = detector.detectTestDomain('data', '/src/utils/helper.ts');
test('Non-test file variable should not be preserved', nonTestResult.shouldPreserve, false);
test('Non-test file should be generic domain', nonTestResult.domain, 'generic');

console.log('\nTesting generic test file variables...');
const genericTestResult = detector.detectTestDomain('someVariable', '/src/components/Button.test.ts');
test('Generic test variable should be preserved', genericTestResult.shouldPreserve, true);
test('Generic test variable should be test domain', genericTestResult.domain, 'test');
test('Generic test variable should be generic-test category', genericTestResult.category, 'generic-test');

console.log('\nTesting file-specific rules...');
const criticalTestRules = detector.getFileSpecificRules('/src/jest.setup.ts');
test('Critical test file should have maximum preservation', criticalTestRules.preservationLevel, 'maximum');
test('Critical test file should require manual review', criticalTestRules.requiresManualReview, true);

const integrationRules = detector.getFileSpecificRules('/src/__tests__/integration/api.test.ts');
test('Integration test should have high preservation', integrationRules.preservationLevel, 'high');

const culinaryTestRules = detector.getFileSpecificRules('/src/data/__tests__/recipe.test.ts');
test('Culinary test should have high preservation', culinaryTestRules.preservationLevel, 'high');

console.log('\nTesting preservation report...');
const testVariables = [
  { variableName: 'describe', filePath: '/src/components/Button.test.ts' },
  { variableName: 'mock', filePath: '/src/services/__tests__/api.ts' },
  { variableName: 'recipe', filePath: '/src/data/__tests__/recipes.test.ts' },
  { variableName: 'data', filePath: '/src/utils/helper.ts' }
];
const report = detector.generatePreservationReport(testVariables);
test('Report should have correct total', report.totalVariables, 4);
test('Report should have 3 test files', report.testFiles, 3);
test('Report should have 1 non-test file', report.nonTestFiles, 1);
test('Report should preserve 3 variables', report.preservedVariables, 3);

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
