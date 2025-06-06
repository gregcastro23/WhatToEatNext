#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fix Array Operations`);
console.log('='.repeat(50));

const fixes = [];

// Fix 1: Fix safeSome calls with string vs string[] mismatches
async function fixSafeSomeArrayMismatches() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Pattern: safeSome(recipe.mealType, callback) where mealType could be string or string[]
      updatedContent = updatedContent.replace(
        /safeSome\s*\(\s*([^,]+\.mealType),\s*([^)]+)\)/g,
        (match, mealTypeAccess, callback) => {
          return `safeSome(Array.isArray(${mealTypeAccess}) ? ${mealTypeAccess} : [${mealTypeAccess}], ${callback})`;
        }
      );
      
      // Similar pattern for other properties that might be string or string[]
      const propertiesPattern = /(cuisine|tags|categories|influences)/;
      updatedContent = updatedContent.replace(
        new RegExp(`safeSome\\s*\\(\\s*([^,]+\\.(${propertiesPattern.source})),\\s*([^)]+)\\)`, 'g'),
        (match, propertyAccess, property, callback) => {
          return `safeSome(Array.isArray(${propertyAccess}) ? ${propertyAccess} : [${propertyAccess}], ${callback})`;
        }
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Fixed safeSome calls to handle string/string[] type mismatches',
          preview: 'Added Array.isArray checks for safeSome operations'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 2: Fix array/string confusion in recipe filtering
async function fixRecipeFilteringArrays() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Fix includes() calls on potentially non-array values
      updatedContent = updatedContent.replace(
        /([^.\s]+)\.includes\s*\(\s*([^)]+)\)/g,
        (match, arrayRef, searchValue) => {
          // Skip if it's clearly a string method call
          if (arrayRef.includes('toLowerCase') || arrayRef.includes('String') || arrayRef.includes('"') || arrayRef.includes("'")) {
            return match;
          }
          return `(Array.isArray(${arrayRef}) ? ${arrayRef}.includes(${searchValue}) : ${arrayRef} === ${searchValue})`;
        }
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Fixed array includes() calls to handle string/array type flexibility',
          preview: 'Added Array.isArray checks for includes() operations'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 3: Fix some() calls on potentially undefined arrays
async function fixSomeOperations() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Fix .some() calls that might be on undefined
      updatedContent = updatedContent.replace(
        /([^.\s]+)\.some\s*\(\s*([^)]+)\)/g,
        (match, arrayRef, callback) => {
          // Skip if it's clearly an array literal
          if (arrayRef.startsWith('[') || arrayRef.includes('Array')) {
            return match;
          }
          return `(${arrayRef} || []).some(${callback})`;
        }
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Added null safety to array.some() operations',
          preview: 'Added (array || []).some() pattern for safety'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 4: Fix forEach and map operations on potentially undefined arrays
async function fixArrayIterationMethods() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Fix .forEach() calls
      updatedContent = updatedContent.replace(
        /([^.\s]+)\.forEach\s*\(\s*([^)]+)\)/g,
        (match, arrayRef, callback) => {
          if (arrayRef.startsWith('[') || arrayRef.includes('Array')) {
            return match;
          }
          return `(${arrayRef} || []).forEach(${callback})`;
        }
      );
      
      // Fix .map() calls
      updatedContent = updatedContent.replace(
        /([^.\s]+)\.map\s*\(\s*([^)]+)\)/g,
        (match, arrayRef, callback) => {
          if (arrayRef.startsWith('[') || arrayRef.includes('Array') || arrayRef.includes('map')) {
            return match;
          }
          return `(${arrayRef} || []).map(${callback})`;
        }
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Added null safety to array iteration methods (forEach, map)',
          preview: 'Added (array || []) pattern for array methods'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 5: Fix filter operations and array length checks
async function fixFilterAndLengthOperations() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Fix .filter() calls
      updatedContent = updatedContent.replace(
        /([^.\s]+)\.filter\s*\(\s*([^)]+)\)/g,
        (match, arrayRef, callback) => {
          if (arrayRef.startsWith('[') || arrayRef.includes('Array') || arrayRef.includes('filter')) {
            return match;
          }
          return `(${arrayRef} || []).filter(${callback})`;
        }
      );
      
      // Fix .length access on potentially undefined arrays
      updatedContent = updatedContent.replace(
        /([^.\s]+)\.length(?!\w)/g,
        (match, arrayRef) => {
          // Skip string literals and obvious arrays
          if (arrayRef.includes('"') || arrayRef.includes("'") || arrayRef.startsWith('[') || arrayRef.includes('Array')) {
            return match;
          }
          // Skip common safe patterns
          if (arrayRef.includes('length') || arrayRef.includes('String') || arrayRef.includes('Object')) {
            return match;
          }
          return `(${arrayRef} || []).length`;
        }
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Added null safety to filter operations and length access',
          preview: 'Added (array || []) pattern for filter and length'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Execute all fixes
async function runAllFixes() {
  await fixSafeSomeArrayMismatches();
  await fixRecipeFilteringArrays();
  await fixSomeOperations();
  await fixArrayIterationMethods();
  await fixFilterAndLengthOperations();
}

// Main execution
runAllFixes().then(() => {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Results:`);
  console.log(`Found ${fixes.length} fixes`);
  
  if (fixes.length > 0) {
    console.log('\nFixes applied:');
    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.file}`);
      console.log(`   ${fix.description}`);
      console.log(`   Preview: ${fix.preview}`);
      console.log('');
    });
  }
  
  if (DRY_RUN) {
    console.log('\nRun without --dry-run to apply these fixes.');
  } else {
    console.log('\nFixes applied successfully!');
    console.log('Next: Continue with property access safety fixes.');
  }
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 