#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Fixing elementalBalance casing issues...`);

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

    // Fix elementalBalance object properties to match type definition
    // Type expects: { Fire: number; Earth: number; Air: number; Water: number; ... }
    
    // Pattern 1:Water: ..., Earth: ..., Air: ... }
    const elementalBalancePattern = /}]+),\s*Water:\s*([^}]+),\s*Earth:\s*([^}]+),\s*Air:\s*([^}]+)\s*\}/g;
    newContent = newContent.replace(elementalBalancePattern, (match, fire, water, earth, air) => {
      fileChanges++;
      return `}, Water: ${water}, Earth: ${earth}, Air: ${air} }`;
    });

    // Pattern 2: More complex elementalBalance objects with additional properties
    const complexElementalBalancePattern = /}]+),\s*Water:\s*([^}]+),\s*Earth:\s*([^}]+),\s*Air:\s*([^}]+)([^}]*)\}/g;
    newContent = newContent.replace(complexElementalBalancePattern, (match, fire, water, earth, air, rest) => {
      fileChanges++;
      return `}, Water: ${water}, Earth: ${earth}, Air: ${air}${rest} }`;
    });

    // Pattern 3: Individual property assignments within elementalBalance
    newContent = newContent.replace(/elementalBalance\.Fire/g, 'elementalBalance.Fire');
    newContent = newContent.replace(/elementalBalance\.Water/g, 'elementalBalance.Water');
    newContent = newContent.replace(/elementalBalance\.Earth/g, 'elementalBalance.Earth');
    // Note: Air stays capitalized as per type definition

    // Count changes for this pattern
    const fireMatches = (content.match(/elementalBalance\.Fire/g) || []).length;
    const waterMatches = (content.match(/elementalBalance\.Water/g) || []).length;
    const earthMatches = (content.match(/elementalBalance\.Earth/g) || []).length;
    fileChanges += fireMatches + waterMatches + earthMatches;

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