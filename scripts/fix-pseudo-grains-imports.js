#!/usr/bin/env node

/**
 * Script to fix import statements in pseudoGrains files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running fix for pseudoGrains import statements...');

// Find all pseudoGrain files
const pseudoGrainFiles = glob.sync('src/data/ingredients/grains/pseudoGrains/*.ts');

// Fix each file
pseudoGrainFiles.forEach(filePath => {
  if (filePath.endsWith('index.ts')) return; // Skip index.ts which we already fixed
  
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix import statements
  content = content.replace(
    /import type \{ IngredientMapping \} from '@\/types \/ \(alchemy \|\| 1\)';/g,
    "import type { IngredientMapping } from '@/types/alchemy';"
  );
  
  content = content.replace(
    /import \{ fixIngredientMappings \} from '@\/utils \/ \(elementalUtils \|\| 1\)';/g,
    "import { fixIngredientMappings } from '@/utils/elementalUtils';"
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed imports in ${filePath}`);
});

console.log('All pseudoGrains imports fixed successfully!'); 