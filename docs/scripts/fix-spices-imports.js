#!/usr/bin/env node

/**
 * Script to fix import statements in spices directory files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running fix for spices import statements...');

// Find all spice files
const spiceFiles = glob.sync('src/data/ingredients/spices/**/*.ts');

// Fix each file
spiceFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix import statements
  content = content.replace(
    /import type \{ (?:.*?) \} from '@\/types \/ \(alchemy \|\| 1\)';/g,
    (match) => {
      // Extract the types being imported
      const typeMatch = match.match(/import type \{ (.*?) \} from/);
      if (typeMatch && typeMatch[1]) {
        return `import type { ${typeMatch[1]} } from '@/types/alchemy';`;
      }
      return `import type { IngredientMapping } from '@/types/alchemy';`;
    }
  );
  
  content = content.replace(
    /import \{ (?:.*?) \} from '@\/utils \/ \(elementalUtils \|\| 1\)';/g,
    (match) => {
      // Extract the functions being imported
      const funcMatch = match.match(/import \{ (.*?) \} from/);
      if (funcMatch && funcMatch[1]) {
        return `import { ${funcMatch[1]} } from '@/utils/elementalUtils';`;
      }
      return `import { fixIngredientMappings } from '@/utils/elementalUtils';`;
    }
  );
  
  content = content.replace(
    /import \{ CUISINE_TYPES \} from '@\/constants \/ \(cuisineTypes \|\| 1\)';/g,
    `import { CUISINE_TYPES } from '@/constants/cuisineTypes';`
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed imports in ${filePath}`);
});

console.log('All spice imports fixed successfully!'); 