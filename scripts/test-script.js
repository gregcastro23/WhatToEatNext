#!/usr/bin/env node

console.log('This is a test script');
console.log('Current directory:', process.cwd());

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create test directory if it doesn't exist
const TEST_DIR = path.join(__dirname, 'test-scripts');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

/**
 * Test a fix script on sample files
 * @param {string} scriptPath - Path to the script to test
 * @param {string[]} sampleFiles - Array of paths to sample files
 * @param {boolean} validateSyntax - Whether to validate syntax after fix
 */
function testScript(scriptPath, sampleFiles, validateSyntax = true) {
  console.log(`Testing script: ${scriptPath}`);
  
  // Create copies of sample files in test directory
  const testFiles = sampleFiles.map(file => {
    const filename = path.basename(file);
    const testFilePath = path.join(TEST_DIR, filename);
    
    // Copy the file
    fs.copyFileSync(file, testFilePath);
    console.log(`Created test file: ${testFilePath}`);
    
    return testFilePath;
  });
  
  // Run the script on just these test files
  try {
    console.log(`\nRunning ${scriptPath} on test files...`);
    const result = execSync(`node ${scriptPath} ${testFiles.join(' ')}`, { encoding: 'utf8' });
    console.log(result);
    
    // Validate syntax if requested
    if (validateSyntax) {
      console.log('\nValidating TypeScript syntax...');
      testFiles.forEach(file => {
        try {
          execSync(`npx tsc --noEmit ${file}`, { encoding: 'utf8', stdio: 'pipe' });
          console.log(`✅ ${file}: Syntax valid`);
        } catch (error) {
          console.log(`❌ ${file}: Syntax invalid`);
          console.log(error.message.split('\n').slice(0, 5).join('\n'));
        }
      });
    }
    
    console.log('\nTest complete!');
  } catch (error) {
    console.error(`Error running script: ${error.message}`);
  }
}

// Sample problem files to test on
const SAMPLE_FILES = [
  path.join(__dirname, 'src', 'utils', 'reliableAstronomy.ts'),
  path.join(__dirname, 'src', 'utils', 'safeAccess.ts'),
  path.join(__dirname, 'src', 'utils', 'safeAstrology.ts'),
  path.join(__dirname, 'src', 'utils', 'seasonalCalculations.ts')
];

// Test our scripts
console.log('=== SCRIPT TESTING ===\n');

// Uncomment the script you want to test:
testScript('fix-typescript-safely.js', SAMPLE_FILES);
// testScript('fix-syntax-errors.js', SAMPLE_FILES);
// testScript('fix-cuisine-files.js', [path.join(__dirname, 'src', 'data', 'cuisines', 'italian.ts')]);

// Cleanup test files
console.log('\nCleaning up test files...');
fs.rmSync(TEST_DIR, { recursive: true, force: true });

console.log('Test script completed'); 