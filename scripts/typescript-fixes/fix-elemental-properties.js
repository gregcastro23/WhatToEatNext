#!/usr/bin/env node

/**
 * Fix ElementalProperties type mismatch between celestial.ts and alchemy.ts
 * 
 * This script adds the string index signature to the ElementalProperties interface
 * in celestial.ts to match the definition in alchemy.ts, ensuring consistency
 * across the codebase.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Path to the celestial.ts file
const celestialFilePath = path.join(rootDir, 'src', 'types', 'celestial.ts');

// Read the file content
try {
  console.log(`Reading ${celestialFilePath}...`);
  let fileContent = fs.readFileSync(celestialFilePath, 'utf8');
  
  // Find the ElementalProperties interface
  const elementalPropertiesRegex = /export\s+interface\s+ElementalProperties\s*\{[^}]*\}/;
  const match = fileContent.match(elementalPropertiesRegex);
  
  if (!match) {
    console.error('ElementalProperties interface not found in celestial.ts');
    process.exit(1);
  }
  
  // Check if it already has the index signature
  if (match[0].includes('[key: string]: number')) {
    console.log('ElementalProperties already has the string index signature. No changes needed.');
    process.exit(0);
  }
  
  // Add the string index signature to the interface
  const updatedInterface = match[0].replace(
    /(\s*\})$/,
    '\n  [key: string]: number; // Allow indexing with string$1'
  );
  
  // Replace the old interface with the updated one
  const updatedContent = fileContent.replace(elementalPropertiesRegex, updatedInterface);
  
  // Make sure we actually made a change
  if (fileContent === updatedContent) {
    console.error('Failed to update the ElementalProperties interface.');
    process.exit(1);
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(celestialFilePath, updatedContent, 'utf8');
  console.log('Successfully updated ElementalProperties interface in celestial.ts');

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
} 