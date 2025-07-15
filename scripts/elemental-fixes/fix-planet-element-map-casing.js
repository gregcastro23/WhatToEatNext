#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Fixing planetElementMap casing issues...`);

// Find all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**']
});

let totalChanges = 0;
let filesChanged = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Fix ElementalCharacter values in planetElementMap function
    // All values should be Pascal case: 'Fire', 'Water', 'Earth', 'Air'
    
    // Pattern 1: Fix lowercase element values in object literals that return ElementalCharacter
    const elementValuePatterns = [
      // In Record<string, ElementalCharacter> contexts
      { from: /:\s*'Fire'/g, to: ": 'Fire'" },
      { from: /:\s*'Water'/g, to: ": 'Water'" },
      { from: /:\s*'Earth'/g, to: ": 'Earth'" },
      // Air should already be correct
    ];

    // Only apply these patterns to lines that look like they're in ElementalCharacter contexts
    const lines = newContent.split('\n');
    const updatedLines = lines.map((line, index) => {
      // Check if this line is in a planetElementMap or similar ElementalCharacter context
      const isElementalCharacterContext = 
        line.includes('ElementalCharacter') ||
        line.includes('planetElementMap') ||
        (line.includes("'Sun':") || line.includes("'Moon':") || line.includes("'Mercury':")) ||
        // Look at surrounding lines for context
        (index > 0 && lines[index - 1].includes('ElementalCharacter')) ||
        (index > 1 && lines[index - 2].includes('ElementalCharacter')) ||
        (index > 2 && lines[index - 3].includes('ElementalCharacter'));

      if (isElementalCharacterContext) {
        let updatedLine = line;
        elementValuePatterns.forEach(pattern => {
          const matches = (line.match(pattern.from) || []).length;
          if (matches > 0) {
            updatedLine = updatedLine.replace(pattern.from, pattern.to);
            fileChanges += matches;
          }
        });
        return updatedLine;
      }
      return line;
    });
    newContent = updatedLines.join('\n');

    if (fileChanges > 0) {
      console.log(`  📝 ${file}: ${fileChanges} changes`);
      
      if (!isDryRun) {
        writeFileSync(file, newContent, 'utf8');
      }
      
      totalChanges += fileChanges;
      filesChanged++;
    }

  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✅ ${isDryRun ? '[DRY RUN] ' : ''}Complete!`);
console.log(`📊 Files processed: ${files.length}`);
console.log(`📝 Files changed: ${filesChanged}`);
console.log(`🔧 Total changes: ${totalChanges}`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply changes');
} else {
  console.log('\n🎉 Changes applied successfully!');
  console.log('💡 Run "yarn build" to verify the fixes');
} 