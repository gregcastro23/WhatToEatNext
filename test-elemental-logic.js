#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temporary test files with problematic code
const TEST_DIR = path.join(__dirname, 'temp-test-elemental');

// Create test directory if it doesn't exist
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR);
}

// Create a temporary fix script specifically for testing
const createTempFixScript = () => {
  const originalFixScript = fs.readFileSync(path.join(__dirname, 'fix-elemental-logic.js'), 'utf8');
  
  // Modify the script to look in the current directory instead of src/lib
  const modifiedFixScript = originalFixScript
    .replace(/const SEARCH_DIRS = \['src', 'lib'\];/, "const SEARCH_DIRS = ['.'];")
    .replace(/const ROOT_DIR = process\.cwd\(\);/, `const ROOT_DIR = process.cwd();`);
  
  // Write the modified script to the test directory
  fs.writeFileSync(path.join(TEST_DIR, 'temp-fix-script.js'), modifiedFixScript);
  console.log('Created temporary fix script for testing');
};

// Test files with problematic code to fix
const TEST_FILES = [
  {
    name: 'opposites.js',
    content: `
// File with "opposites" element mapping
function getOppositeElement(element) {
  const opposites = {
    Fire: 'Water',
    Water: 'Fire', 
    Earth: 'Air',
    Air: 'Earth'
  };
  return opposites[element];
}
`
  },
  {
    name: 'elementComparison.ts',
    content: `
// File with element comparison logic
function getElementalCompatibility(
  element1: string, 
  element2: string
): number {
  // Same element: highest compatibility
  if (element1 === element2) return 1.0;
  
  // Compatible pairs with hierarchical relationships
  if (
    (element1 === 'Fire' && element2 === 'Air') ||
    (element1 === 'Air' && element2 === 'Fire')
  ) {
    return 0.7; // Fire and Air have strong compatibility
  }
  
  // Opposing elements with low compatibility
  if (
    (element1 === 'Fire' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Fire') ||
    (element1 === 'Earth' && element2 === 'Air') ||
    (element1 === 'Air' && element2 === 'Earth')
  ) {
    return 0.2; // Opposing elements have low compatibility
  }
  
  // Fallback
  return 0.3;
}
`
  },
  {
    name: 'balancing.js',
    content: `
// File with balancing element logic
function getBalancingElement(element) {
  // Return the "opposite" element to create balance
  if (element === 'Fire') return 'Water';
  if (element === 'Water') return 'Fire';
  if (element === 'Earth') return 'Air';
  if (element === 'Air') return 'Earth';
  return 'balanced';
}
`
  },
  {
    name: 'elementPairs.js',
    content: `
// File with element pair logic
function calculateElementalBalance(properties) {
  const fireWater = properties.Fire + properties.Water;
  const earthAir = properties.Earth + properties.Air;
  
  if (fireWater > earthAir) {
    return 'Fire and Water dominant';
  } else if (earthAir > fireWater) {
    return 'Earth and Air dominant';
  } else {
    return 'Balanced';
  }
}
`
  }
];

// Create test files
TEST_FILES.forEach(file => {
  fs.writeFileSync(path.join(TEST_DIR, file.name), file.content);
  console.log(`Created test file: ${file.name}`);
});

// Create the temp fix script
createTempFixScript();

// Function to test if a file contains the expected fixed content
function testFixedFile(filename, patterns) {
  const content = fs.readFileSync(path.join(TEST_DIR, filename), 'utf8');
  let passed = true;
  
  for (const pattern of patterns) {
    if (pattern.type === 'contains') {
      if (!content.includes(pattern.value)) {
        console.log(`❌ FAILED: ${filename} should contain: ${pattern.value}`);
        passed = false;
      } else {
        console.log(`✅ PASSED: ${filename} contains: ${pattern.value}`);
      }
    } else if (pattern.type === 'not_contains') {
      if (content.includes(pattern.value)) {
        console.log(`❌ FAILED: ${filename} should NOT contain: ${pattern.value}`);
        passed = false;
      } else {
        console.log(`✅ PASSED: ${filename} does not contain: ${pattern.value}`);
      }
    }
  }
  
  return passed;
}

// Run the fix-elemental-logic.js script on the test directory
console.log('\nRunning fix script on test files...\n');

// Save current working directory
const originalDir = process.cwd();

try {
  // Change to test directory to run the script
  process.chdir(TEST_DIR);
  
  // Run the modified script
  execSync('node temp-fix-script.js', { stdio: 'inherit' });
  
  // Change back to original directory
  process.chdir(originalDir);
  
  // Test the fixed files
  console.log('\nVerifying fixes in test files:');
  
  let testsPass = true;
  
  // Check opposites.js
  const oppositesTests = [
    { type: 'contains', value: "Fire: 'Fire'" },
    { type: 'contains', value: "Water: 'Water'" },
    { type: 'contains', value: "Earth: 'Earth'" },
    { type: 'contains', value: "Air: 'Air'" },
    { type: 'not_contains', value: "Fire: 'Water'" }
  ];
  const oppositesPassed = testFixedFile('opposites.js', oppositesTests);
  testsPass = testsPass && oppositesPassed;
  
  // Check elementComparison.ts
  const comparisonTests = [
    { type: 'not_contains', value: "// Opposing elements with low compatibility" },
    { type: 'not_contains', value: "return 0.2; // Opposing elements have low compatibility" },
    { type: 'contains', value: "All different elements have good compatibility" }
  ];
  const comparisonPassed = testFixedFile('elementComparison.ts', comparisonTests);
  testsPass = testsPass && comparisonPassed;
  
  // Check balancing.js
  const balancingTests = [
    { type: 'contains', value: "return element;" },
    { type: 'contains', value: "Elements work best with themselves" },
    { type: 'not_contains', value: "if (element === 'Fire') return 'Water';" }
  ];
  const balancingPassed = testFixedFile('balancing.js', balancingTests);
  testsPass = testsPass && balancingPassed;
  
  // Check elementPairs.js
  const pairsTests = [
    { type: 'not_contains', value: "const fireWater = properties.Fire + properties.Water;" },
    { type: 'not_contains', value: "const earthAir = properties.Earth + properties.Air;" }
  ];
  const pairsPassed = testFixedFile('elementPairs.js', pairsTests);
  testsPass = testsPass && pairsPassed;
  
  // Output test results
  if (testsPass) {
    console.log('\n✅ All tests PASSED! The fix-elemental-logic.js script is working correctly.');
  } else {
    console.log('\n❌ Some tests FAILED. The fix-elemental-logic.js script may need adjustments.');
  }
  
} catch (error) {
  console.error('Error running tests:', error);
  process.chdir(originalDir); // Ensure we change back to original directory
}

// Clean up test files
console.log('\nCleaning up test files...');
if (fs.existsSync(TEST_DIR)) {
  TEST_FILES.forEach(file => {
    const filePath = path.join(TEST_DIR, file.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  
  // Delete the temporary fix script
  const tempFixScriptPath = path.join(TEST_DIR, 'temp-fix-script.js');
  if (fs.existsSync(tempFixScriptPath)) {
    fs.unlinkSync(tempFixScriptPath);
  }
  
  fs.rmdirSync(TEST_DIR);
}

console.log('Test cleanup complete.'); 