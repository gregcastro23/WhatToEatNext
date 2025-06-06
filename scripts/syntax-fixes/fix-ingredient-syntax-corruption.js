#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = false; // Set to false to apply changes

console.log('🔧 Ingredient Syntax Corruption Fix Script');
console.log('==========================================');
console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE RUN (changes will be applied)'}`);
console.log('');

// Files with syntax corruption in ingredient directories
const targetFiles = [
  'src/data/ingredients/fruits/index.ts',
  'src/data/ingredients/proteins/index.ts',
  'src/data/ingredients/seasonings/index.ts',
  'src/data/ingredients/spices/index.ts'
];

const fixes = [];

// Fix patterns for ingredient files
const syntaxPatterns = [
  // Object.(entries(fruits)? || []) pattern
  {
    pattern: /Object\.\(entries\(([^)]+)\)\?\s*\|\|\s*\[\]\)/g,
    replacement: (match, p1) => `Object.entries(${p1})`,
    description: 'Fix Object.entries with corrupted syntax'
  },
  // Object.values(value.(culinaryApplications)? || []) pattern
  {
    pattern: /Object\.values\(([^.]+)\.\(([^)]+)\)\?\s*\|\|\s*\[\]\)/g,
    replacement: (match, p1, p2) => `Object.values(${p1}.${p2} || {})`,
    description: 'Fix Object.values with corrupted property access'
  },
  // value.(affinities? || []) pattern
  {
    pattern: /(\w+)\.\(([^)]+)\?\s*\|\|\s*\[\]\)/g,
    replacement: (match, p1, p2) => `(${p1}.${p2} || [])`,
    description: 'Fix property access with corrupted syntax'
  },
  // protein.(Array.isArray(affinities?) ? affinities?.includes(affinity) : affinities? === affinity) pattern
  {
    pattern: /(\w+)\.\(Array\.isArray\(([^)]+)\?\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: (match, p1, p2, p3, p4) => `Array.isArray(${p1}.${p2}) ? ${p1}.${p3} : ${p1}.${p4}`,
    description: 'Fix corrupted ternary with Array.isArray'
  },
  // value.(Array.isArray(origin) ? origin.includes(origin) : origin === origin) pattern - fix the logic error too
  {
    pattern: /value\.\(Array\.isArray\(origin\)\s*\?\s*origin\.includes\(origin\)\s*:\s*origin\s*===\s*origin\)/g,
    replacement: 'Array.isArray(value.origin) ? value.origin.includes(origin) : value.origin === origin',
    description: 'Fix corrupted origin comparison logic'
  }
];

console.log(`📁 Target files: ${targetFiles.length}`);
targetFiles.forEach(file => console.log(`   - ${file}`));
console.log('');

for (const targetFile of targetFiles) {
  const filePath = path.join(__dirname, targetFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${targetFile}`);
    continue;
  }
  
  console.log(`🔍 Processing: ${targetFile}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    let fileHasFixes = false;
    
    // Apply each pattern
    syntaxPatterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches && matches.length > 0) {
        console.log(`   Found ${matches.length} instances of: ${pattern.description}`);
        fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
        fileHasFixes = true;
        
        fixes.push({
          file: targetFile,
          type: pattern.description,
          matches: matches.length,
          examples: matches.slice(0, 2)
        });
      }
    });
    
    if (fileHasFixes && !DRY_RUN) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`   ✅ Applied fixes to ${targetFile}`);
    } else if (!fileHasFixes) {
      console.log(`   ✅ No syntax corruption found in ${targetFile}`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error processing ${targetFile}:`, error.message);
  }
  
  console.log('');
}

console.log(`📝 Total fixes identified: ${fixes.length}`);
fixes.forEach((fix, index) => {
  console.log(`   ${index + 1}. ${fix.file}: ${fix.type} (${fix.matches} instances)`);
  if (fix.examples.length > 0) {
    fix.examples.forEach(example => {
      console.log(`      Example: "${example.substring(0, 60)}..."`);
    });
  }
});

if (DRY_RUN && fixes.length > 0) {
  console.log('\n🔍 DRY RUN COMPLETE - No changes made');
  console.log('💡 To apply fixes, set DRY_RUN = false in the script');
} else if (!DRY_RUN && fixes.length > 0) {
  console.log('\n✅ All fixes applied successfully!');
} else {
  console.log('\nℹ️  No syntax corruption issues found');
}

console.log('\n🎯 Next steps:');
console.log('1. Review the fixes shown above');
if (DRY_RUN && fixes.length > 0) {
  console.log('2. Set DRY_RUN = false and run again to apply fixes');
}
console.log('3. Test with: yarn build');
console.log('4. If build succeeds, address the CuisineRecommender JSX issue'); 