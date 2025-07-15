#!/usr/bin/env node

/**
 * Fix enum definitions in constant files
 * 
 * This script converts object-like enum definitions to proper TypeScript enums.
 * It specifically targets constants like ErrorType and ErrorSeverity in service files
 * that should be proper enums to fix TypeScript errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// List of files to check and fix
const filesToFix = [
  path.join(rootDir, 'src', 'services', 'errorHandler.ts'),
  path.join(rootDir, 'src', 'constants', 'systemDefaults.ts'),
  path.join(rootDir, 'src', 'constants', 'elementalCore.ts')
];

// Regular expression to find object-like enum definitions
const objectEnumRegex = /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\{\s*([^}]+)\}\s*as\s*const\s*;/g;

// Process each file
filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Track imports we need to add
  const importsToAdd = new Set();
  
  // Find and replace object-like enum definitions
  const newContent = content.replace(objectEnumRegex, (match, enumName, enumValues) => {
    modified = true;
    console.log(`Converting ${enumName} to proper enum`);
    
    // Parse the enum values
    const valueLines = enumValues.split('\n').map(line => line.trim()).filter(line => line);
    
    // Create the new enum definition
    let enumDefinition = `export enum ${enumName} {\n`;
    
    // Process each enum value
    valueLines.forEach(line => {
      // Handle different formats of enum value definitions
      if (line.includes(':')) {
        // Format: KEY: 'VALUE', or KEY: VALUE,
        const [key, valueWithComma] = line.split(':').map(part => part.trim());
        const value = valueWithComma.replace(/,\s*$/, '').trim(); // Remove trailing comma
        
        // If it's a string value (has quotes)
        if (value.startsWith("'") || value.startsWith('"')) {
          // Remove quotes for enum value name
          enumDefinition += `  ${key} = ${value},\n`;
        } else {
          // Numeric or other value
          enumDefinition += `  ${key} = ${value},\n`;
        }
      } else {
        // Simple format without values, just use the key as is
        const key = line.replace(/,\s*$/, '').trim();
        enumDefinition += `  ${key},\n`;
      }
    });
    
    enumDefinition += `}\n`;
    return enumDefinition;
  });
  
  // Update the file if changes were made
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated enum definitions in ${filePath}`);
  } else {
    console.log(`No enum definitions to fix in ${filePath}`);
  }
});

console.log('Enum definition fix completed'); 