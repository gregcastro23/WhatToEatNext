// scripts/typescript-fixes/fix-tsconfig.js
// Script to add downlevelIteration to tsconfig.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// File to fix
const tsconfigPath = path.join(rootDir, 'tsconfig.json');

// Function to fix tsconfig.json
function fixTsConfig() {
  if (!fs.existsSync(tsconfigPath)) {
    console.error(`File not found: ${tsconfigPath}`);
    return false;
  }

  // Read current tsconfig.json
  let tsconfig;
  try {
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    tsconfig = JSON.parse(content);
  } catch (error) {
    console.error(`Error parsing tsconfig.json: ${error.message}`);
    return false;
  }

  // Check if downlevelIteration is already set
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.downlevelIteration === true) {
    console.log('downlevelIteration is already enabled in tsconfig.json');
    return false;
  }

  // Add downlevelIteration option
  if (!tsconfig.compilerOptions) {
    tsconfig.compilerOptions = {};
  }
  
  tsconfig.compilerOptions.downlevelIteration = true;
  
  // Write updated tsconfig.json
  try {
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2), 'utf8');
    console.log('Added downlevelIteration to tsconfig.json');
    return true;
  } catch (error) {
    console.error(`Error writing tsconfig.json: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Fixing TypeScript configuration...');
  
  if (fixTsConfig()) {
    console.log('Successfully updated tsconfig.json');
  } else {
    console.log('No changes made to tsconfig.json');
  }
}

// Run the script
main(); 