#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Fixing ElementalCharacter casing issues...`);

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

    // Fix ElementalCharacter values in Record types and object literals
    // Pattern 1: Record<string, ElementalCharacter> object literals
    const recordPatterns = [
      // 'Sun': 'Fire' -> 'Sun': 'Fire'
      { from: /:\s*'Fire'/g, to: ": 'Fire'" },
      { from: /:\s*'Water'/g, to: ": 'Water'" },
      { from: /:\s*'Earth'/g, to: ": 'Earth'" },
      // Air is already capitalized correctly
      
      // 'Fire' -> "Fire" in string literals when used as ElementalCharacter
      { from: /'Fire'/g, to: '"Fire"' },
      { from: /'Water'/g, to: '"Water"' },
      { from: /'Earth'/g, to: '"Earth"' },
    ];

    recordPatterns.forEach(pattern => {
      const matches = (content.match(pattern.from) || []).length;
      if (matches > 0) {
        newContent = newContent.replace(pattern.from, pattern.to);
        fileChanges += matches;
      }
    });

    // Pattern 2: ElementalCharacter object initialization
    // { Fire: 0, Water: 0, Earth: 0, Air: 0 } -> { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    const elementalCountsPattern = /\{\s*fire:\s*([^,}]+),\s*water:\s*([^,}]+),\s*earth:\s*([^,}]+),\s*Air:\s*([^,}]+)\s*\}/g;
    newContent = newContent.replace(elementalCountsPattern, (match, fire, water, earth, air) => {
      fileChanges++;
      return `{ Fire: ${fire}, Water: ${water}, Earth: ${earth}, Air: ${air} }`;
    });

    // Pattern 3: Switch case statements with ElementalCharacter
    const switchCasePatterns = [
      { from: /case\s+'Fire':/g, to: "case 'Fire':" },
      { from: /case\s+'Water':/g, to: "case 'Water':" },
      { from: /case\s+'Earth':/g, to: "case 'Earth':" },
    ];

    switchCasePatterns.forEach(pattern => {
      const matches = (content.match(pattern.from) || []).length;
      if (matches > 0) {
        newContent = newContent.replace(pattern.from, pattern.to);
        fileChanges += matches;
      }
    });

    // Pattern 4: Array literals with ElementalCharacter values
    const arrayElementPatterns = [
      { from: /'Fire'/g, to: "'Fire'" },
      { from: /'Water'/g, to: "'Water'" },
      { from: /'Earth'/g, to: "'Earth'" },
    ];

    // Only apply to lines that look like ElementalCharacter arrays
    const lines = newContent.split('\n');
    const updatedLines = lines.map(line => {
      // Check if line contains ElementalCharacter-like patterns
      if (line.includes('ElementalCharacter') || 
          (line.includes("'Fire'") && line.includes("'Water'") && line.includes("'Earth'"))) {
        let updatedLine = line;
        arrayElementPatterns.forEach(pattern => {
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