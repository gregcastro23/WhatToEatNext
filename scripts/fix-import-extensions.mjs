#!/usr/bin/env node

/**
 * Fix Import Extensions Script
 * Changes all .ts import extensions to .js for ES module compatibility
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Fixing import extensions (.ts → .js)');
console.log(`📋 Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);

// Find all TypeScript files
const files = glob.sync('src/**/*.ts', { ignore: ['**/*.d.ts'] });

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    
    // Replace .ts extensions in import statements
    const newContent = content.replace(
      /from\s+['"]([^'"]+)\.ts['"]/g,
      "from '$1.js'"
    );
    
    if (content !== newContent) {
      const replacements = (content.match(/from\s+['"]([^'"]+)\.ts['"]/g) || []).length;
      totalReplacements += replacements;
      modifiedFiles++;
      
      console.log(`✅ ${file}: ${replacements} import(s) fixed`);
      
      if (!DRY_RUN) {
        writeFileSync(file, newContent, 'utf8');
      }
    }
    
    totalFiles++;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log('\n📊 Summary:');
console.log(`📁 Files processed: ${totalFiles}`);
console.log(`📝 Files modified: ${modifiedFiles}`);
console.log(`🔄 Total replacements: ${totalReplacements}`);

if (DRY_RUN) {
  console.log('\n⚠️ This was a dry run. Use without --dry-run to apply changes.');
} else {
  console.log('\n✅ Import extensions fixed successfully!');
} 