#!/usr/bin/env node

/**
 * Script to fix import statements in all ingredient files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running fix for all ingredient import statements...');

// Find all ingredient files
const ingredientFiles = glob.sync('src/data/ingredients/**/*.ts');

// Fix each file
const fixedCount = 0;
ingredientFiles.forEach(filePath => {
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
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
    /import \{ (?:.*?) \} from '@\/data \/ \((.*?) \|\| 1\)';/g,
    (match, dataPath) => {
      // Extract the imports and data path
      const importMatch = match.match(/import \{ (.*?) \} from/);
      if (importMatch && importMatch[1]) {
        return `import { ${importMatch[1]} } from '@/data/${dataPath}';`;
      }
      return match;
    }
  );
  
  content = content.replace(
    /import \{ (?:.*?) \} from '\.\/([^\/]*?) \/ \(index \|\| 1\)';/g,
    (match, folder) => {
      // Extract the imports
      const importMatch = match.match(/import \{ (.*?) \} from/);
      if (importMatch && importMatch[1]) {
        return `import { ${importMatch[1]} } from './${folder}';`;
      }
      return match;
    }
  );
  
  // Only write back if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✓ Fixed imports in ${filePath}`);
  }
});

console.log(`Fixed imports in ${fixedCount} files successfully!`); 