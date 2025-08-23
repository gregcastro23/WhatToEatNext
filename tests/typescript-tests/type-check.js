#!/usr/bin/env node
/**
 * type-check.js
 * A utility to run TypeScript type checking with the correct configuration
 * based on whether you're checking test files or regular source files.
 * 
 * Usage:
 *   node type-check.js [--tests] [filepath]
 * 
 * Options:
 *   --tests    Check test files (uses tsconfig.jest.json)
 *   filepath   Optional specific file to check
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname);

// Parse arguments
const args = process.argv.slice(2);
const isTestMode = args.includes('--tests');
const fileToCheck = args.find(arg => !arg.startsWith('--'));

// Determine which tsconfig to use
const tsconfigPath = isTestMode 
  ? path.join(rootDir, 'tsconfig.jest.json')
  : path.join(rootDir, 'tsconfig.dev.json');

console.log(`🔍 Running TypeScript check with ${isTestMode ? 'test' : 'development'} configuration`);
if (fileToCheck) {
  console.log(`🔍 Checking file: ${fileToCheck}`);
}

// Build the command arguments
const tscArgs = [
  '--noEmit',
  '--skipLibCheck'
];

// If we're checking a specific file, we need a different approach
if (fileToCheck) {
  // Create a temporary tsconfig that includes only the file we want to check
  const tempConfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Explicitly include the file to check
  tempConfig.include = [fileToCheck];
  
  // Write temporary config
  const tempConfigPath = path.join(rootDir, 'temp-tsconfig.json');
  fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));
  
  // Use the temporary config
  tscArgs.push('--project', tempConfigPath);
  
  // Clean up function
  const cleanup = () => {
    try {
      fs.unlinkSync(tempConfigPath);
    } catch (error) {
      console.warn('⚠️ Could not remove temporary config file:', error);
    }
  };
  
  // Set up cleanup on exit
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(2);
  });
} else {
  // Check the entire project
  tscArgs.push('--project', tsconfigPath);
}

// Run TypeScript compiler
const tsc = spawn('npx', ['tsc', ...tscArgs], { stdio: 'inherit' });

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript check passed!');
  } else {
    console.error(`❌ TypeScript check failed with code ${code}`);
  }
  process.exit(code);
});
