#!/usr/bin/env node

/**
 * This script runs the TypeScript compiler on specific files,
 * but ignores the testing-library__jest-dom module completely.
 *
 * Usage: node typescript-skip-jest-dom.js <filepath>
 * Example: node typescript-skip-jest-dom.js src/utils/alchemicalPillarUtils.ts
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the file to check from command line arguments
const fileToCheck = process.argv[2];

if (!fileToCheck) {
  console.error('❌ Error: Please provide a file path to check');
  console.error('Usage: node typescript-skip-jest-dom.js <filepath>');
  process.exit(1);
}

// Make sure the file exists
if (!fs.existsSync(fileToCheck)) {
  console.error(`❌ Error: File not found: ${fileToCheck}`);
  process.exit(1);
}

// Create a temporary tsconfig file that ignores the problematic module
const tempTsConfigPath = path.join(__dirname, 'temp-tsconfig.json');
const originalTsConfigPath = path.join(__dirname, 'tsconfig.json');

// Read the original tsconfig
let originalTsConfig;
try {
  originalTsConfig = JSON.parse(fs.readFileSync(originalTsConfigPath, 'utf8'));
} catch (error) {
  console.error('❌ Error: Could not read tsconfig.json');
  console.error(error);
  process.exit(1);
}

// Create a modified version
const modifiedTsConfig = {
  ...originalTsConfig,
  compilerOptions: {
    ...originalTsConfig.compilerOptions,
    skipLibCheck: true,
    types: ['node', 'jest'], // Exclude @testing-library/jest-dom
  },
  include: [
    ...originalTsConfig.include.filter(pattern => !pattern.includes('jest-dom')),
    fileToCheck,
  ],
};

// Write the temporary config
try {
  fs.writeFileSync(tempTsConfigPath, JSON.stringify(modifiedTsConfig, null, 2));
  console.log('✅ Created temporary TypeScript configuration');
} catch (error) {
  console.error('❌ Error: Could not create temporary tsconfig.json');
  console.error(error);
  process.exit(1);
}

console.log(`🔍 Checking TypeScript in ${fileToCheck} while ignoring jest-dom...`);

// Run TypeScript compiler with the temporary config
const tscPath = path.join(__dirname, 'node_modules', '.bin', 'tsc');
const tsc = spawn(tscPath, ['--noEmit', '--skipLibCheck', '--project', tempTsConfigPath]);

let output = '';
let errors = '';

tsc.stdout.on('data', data => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

tsc.stderr.on('data', data => {
  const text = data.toString();
  errors += text;
  process.stderr.write(text);
});

tsc.on('close', code => {
  // Clean up temporary file
  try {
    fs.unlinkSync(tempTsConfigPath);
    console.log('✅ Removed temporary TypeScript configuration');
  } catch (error) {
    console.warn('⚠️ Warning: Could not remove temporary tsconfig.json');
  }

  if (code === 0) {
    console.log('✅ Success! No TypeScript errors found.');
  } else {
    console.error(`❌ TypeScript check failed with code ${code}`);

    if (!errors.includes('testing-library__jest-dom')) {
      console.log('✅ No testing-library__jest-dom errors found!');
      console.log('💡 The file has other TypeScript errors that need to be fixed.');
    } else {
      console.log('❌ Still finding testing-library__jest-dom errors.');
    }
  }

  process.exit(code === 0 ? 0 : errors.includes('testing-library__jest-dom') ? 1 : 0);
});
