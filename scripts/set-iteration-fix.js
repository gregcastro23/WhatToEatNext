import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Files to process
const files = [
  'src/data/nutritional.ts',
  'src/data/cuisineFlavorProfiles.ts'
];

// Flag to run in dry mode (no changes)
const DRY_RUN = process.argv.includes('--dry-run');

console.log(`Running in ${DRY_RUN ? 'dry run' : 'write'} mode`);

// Process each file
for (const filePath of files) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read the file
    const fullPath = path.resolve(process.cwd(), filePath);
    const content = readFileSync(fullPath, 'utf8');
    
    // Make replacements
    let newContent = content;
    
    // 1. Replace [...setVar] with Array.from(setVar)
    newContent = newContent.replace(/\[\.\.\.(new Set\([^)]+\)|[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\]/g, 
      (match, setExpr) => `Array.from(${setExpr})`);
    
    // 2. Replace new Set([...set1, ...set2]) with new Set([...Array.from(set1), ...Array.from(set2)])
    newContent = newContent.replace(/new Set\(\[\.\.\.(new Set\([^)]+\)|[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*), \.\.\.(new Set\([^)]+\)|[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\]\)/g,
      (match, set1, set2) => `new Set([...Array.from(${set1}), ...Array.from(${set2})])`);
    
    // Count the number of replacements
    const replacementCount = (newContent.match(/Array\.from/g) || []).length - 
                            (content.match(/Array\.from/g) || []).length;
    
    // Report changes
    if (newContent === content) {
      console.log(`No changes needed in ${filePath}`);
    } else {
      console.log(`Found ${replacementCount} replacements in ${filePath}`);
      
      if (!DRY_RUN) {
        // Write the updated file
        writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
      } else {
        console.log('Changes would be made (dry run mode)');
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

console.log('Done.'); 