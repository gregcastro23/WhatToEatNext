#!/usr/bin/env node

/**
 * Script to fix import statements in herb files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running fix for herbs import statements...');

// Find all herb files
const herbFiles = glob.sync('src/data/ingredients/herbs/**/*.ts');

// Fix each file
herbFiles.forEach(filePath => {
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

console.log('All herb imports fixed successfully!'); 