// Fix empty elemental properties in cuisine files
// Replaces {} with proper ElementalProperties objects

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const CUISINES_DIR = path.join(__dirname, '../src/data/cuisines');

// Get all cuisine TypeScript files
const cuisineFiles = globSync(path.join(CUISINES_DIR, '**/*.ts'));

// Pattern to find empty elemental properties
const emptyElementalPropertiesPattern = /elementalProperties:\s*{}/g;
const defaultElementalProperties = `elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }`;

// Counter for statistics
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  propertiesFixed: 0
};

// Process a single file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  stats.filesProcessed++;
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace empty elemental properties with default values
  const newContent = content.replace(emptyElementalPropertiesPattern, (match) => {
    stats.propertiesFixed++;
    return defaultElementalProperties;
  });
  
  // Check if any changes were made
  if (content !== newContent) {
    stats.filesModified++;
    
    if (DRY_RUN) {
      console.log(`Would update ${filePath} (${stats.propertiesFixed} properties)`);
    } else {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath} (${stats.propertiesFixed} properties)`);
    }
    
    // Reset the properties fixed count for the next file
    stats.propertiesFixed = 0;
  }
}

// Main function
function main() {
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fixing empty elemental properties in cuisine files...`);
  
  cuisineFiles.forEach(processFile);
  
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Total properties fixed: ${stats.propertiesFixed}`);
  
  if (DRY_RUN) {
    console.log('\nThis was a dry run. No files were actually modified.');
    console.log('Run without --dry-run to apply changes.');
  }
}

main(); 