import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

/**
 * Fix duplicate properties in object literals
 * This is a common issue in large object literals where the same property is defined multiple times
 */
function fixDuplicateProperties(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  filesScanned++;
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Find object literal sections
  const objLiteralRegex = /({[^{}]*})/g;
  const objLiterals = [...content.matchAll(objLiteralRegex)];

  // Track properties we've seen in each object literal
  for (const match of objLiterals) {
    const objLiteral = match[1];
    
    // Check if this is a simple object literal (not a complex nested one)
    if (objLiteral.includes('{') && objLiteral.indexOf('{') !== 0) {
      continue;
    }
    
    // Parse the object literal to find properties
    const propRegex = /'([^']+)':\s*unifiedIngredients\[['"]([^'"]+)['"]\]/g;
    const props = [...objLiteral.matchAll(propRegex)];
    
    // Create a map to track seen properties
    const seenProps = new Map();
    const duplicateProps = [];
    
    // Find duplicate properties
    for (const propMatch of props) {
      const propName = propMatch[1];
      if (seenProps.has(propName)) {
        duplicateProps.push(propName);
      } else {
        seenProps.set(propName, true);
      }
    }
    
    // If we have duplicates, create a fixed version of the object
    if (duplicateProps.length > 0) {
      // Create a new object with only unique properties
      let newObj = '{';
      const addedProps = new Set();
      
      for (const propMatch of props) {
        const propName = propMatch[1];
        const propValue = propMatch[2];
        
        if (!addedProps.has(propName)) {
          newObj += `\n  '${propName}': unifiedIngredients['${propValue}'],`;
          addedProps.add(propName);
        }
      }
      
      // Close the object and add a newline
      newObj += '\n}';
      
      // Replace the original object with the fixed one
      content = content.replace(objLiteral, newObj);
      errorsFixed += duplicateProps.length;
      
      if (verbose) {
        console.log(`Fixed ${duplicateProps.length} duplicate properties in object literal:`);
        console.log(`  - Removed duplicate properties: ${duplicateProps.join(', ')}`);
      }
    }
  }

  // Write changes if content was modified
  if (content !== originalContent) {
    filesModified++;
    
    if (verbose) {
      console.log(`Modified: ${filePath}`);
    }
    
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
  
  return { errorsFixed };
}

// Main function
function main() {
  console.log(`Running fix-duplicate-properties.js ${dryRun ? '(dry run)' : ''}`);
  
  // Target the specific file with duplicate property issues
  const targetFile = path.join(rootDir, 'backup-unified', 'ingredients.ts');
  
  if (fs.existsSync(targetFile)) {
    const result = fixDuplicateProperties(targetFile);
    if (result && result.errorsFixed > 0) {
      console.log(`Fixed ${result.errorsFixed} duplicate property errors in ${targetFile}`);
    } else {
      console.log(`No duplicate property errors found in ${targetFile}`);
    }
  } else {
    console.log(`Target file not found: ${targetFile}`);
  }
  
  console.log(`\nSummary:`);
  console.log(`Files scanned: ${filesScanned}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Duplicate property errors fixed: ${errorsFixed}`);
  console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`);
}

main(); 