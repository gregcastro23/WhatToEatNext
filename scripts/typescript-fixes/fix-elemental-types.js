#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Target file
const targetFile = path.resolve(__dirname, '../../src/utils/recommendation/ingredientRecommendation.ts');

// Type definitions to add at the top of the file
const elementalTypesDefinition = `
// ElementalProperties interface for type safety
interface ElementalProperties {
  Fire?: number;
  Water?: number;
  Earth?: number;
  Air?: number;
  [key: string]: number | undefined;
}

// FlavorProperties interface for type safety
interface FlavorProperties {
  bitter?: number;
  sweet?: number;
  sour?: number;
  salty?: number;
  umami?: number;
  [key: string]: number | undefined;
}

// Type guard for ElementalProperties
function hasElementalProperties(obj: any): obj is ElementalProperties {
  return obj && (
    typeof obj.Fire === 'number' || 
    typeof obj.Water === 'number' || 
    typeof obj.Earth === 'number' || 
    typeof obj.Air === 'number'
  );
}

// Type guard for FlavorProperties
function hasFlavorProperties(obj: any): obj is FlavorProperties {
  return obj && (
    typeof obj.bitter === 'number' || 
    typeof obj.sweet === 'number' || 
    typeof obj.sour === 'number' || 
    typeof obj.salty === 'number' || 
    typeof obj.umami === 'number'
  );
}

// Safe access to elemental properties
function getElementalProperty(obj: any, property: keyof ElementalProperties): number {
  if (hasElementalProperties(obj) && typeof obj[property] === 'number') {
    return obj[property] as number;
  }
  return 0;
}

// Safe access to flavor properties
function getFlavorProperty(obj: any, property: keyof FlavorProperties): number {
  if (hasFlavorProperties(obj) && typeof obj[property] === 'number') {
    return obj[property] as number;
  }
  return 0;
}
`;

// Function to fix a file by adding type definitions
function fixFile(filePath, isDryRun) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the type definitions already exist
    if (content.includes('interface ElementalProperties')) {
      console.log('  ElementalProperties interface already exists, skipping');
      return;
    }
    
    // Find the appropriate insertion point after imports
    const importRegex = /^import .+?;(\r?\n)/gm;
    let lastImportMatch;
    let lastIndex = 0;
    
    // Find the last import statement
    while ((lastImportMatch = importRegex.exec(content)) !== null) {
      lastIndex = lastImportMatch.index + lastImportMatch[0].length;
    }
    
    // If no imports found, just add at the beginning
    const insertionPoint = lastIndex > 0 ? lastIndex : 0;
    
    // Insert the type definitions after the last import
    const updatedContent = 
      content.slice(0, insertionPoint) + 
      elementalTypesDefinition + 
      content.slice(insertionPoint);
    
    if (isDryRun) {
      console.log('  Would add ElementalProperties interface and type guards (dry run)');
    } else {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log('  Added ElementalProperties interface and type guards');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main execution function
function main() {
  console.log(`Running in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode`);
  
  if (fs.existsSync(targetFile)) {
    fixFile(targetFile, isDryRun);
  } else {
    console.error(`File not found: ${targetFile}`);
  }
}

// Run the script
main(); 