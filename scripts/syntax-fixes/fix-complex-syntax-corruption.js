#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Complex Syntax Corruption Fix Script`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Complex corruption patterns that need manual fixes
const COMPLEX_PATTERNS = [
  {
    name: 'Malformed Array.isArray with missing parts',
    pattern: /(\w+)\.\(Array\.isArray\((\w+)\)\s*\?\s*\)\s*\?\s*\2\)\?\.\w+\(([^)]+)\)\s*:\s*\2\)\?\s*===\s*(\w+)\)/g,
    replacement: '(Array.isArray($2) ? $2.includes($4) : $2 === $4)',
    description: 'Fix severely malformed Array.isArray ternary expressions'
  },
  {
    name: 'Malformed property access with Array.isArray',
    pattern: /(\w+)\.\(Array\.isArray\((\w+)\?\)\s*\?\s*\2\?\.\w+\(([^)]+)\)\s*:\s*\2\?\s*===\s*(\w+)\)/g,
    replacement: '(Array.isArray($2) ? $2?.includes($4) : $2 === $4)',
    description: 'Fix property access with malformed Array.isArray'
  },
  {
    name: 'Complex function call corruption',
    pattern: /(\w+)\s*\(\)\s*\|\|\s*\[\]\)\.length\s*\/\s*\(Object\s*\|\|\s*1\)\.keys\(/g,
    replacement: '($1 || []).length / Object.keys(',
    description: 'Fix complex function call with Object.keys corruption'
  },
  {
    name: 'Malformed culinaryApplications pattern',
    pattern: /Object\.keys\((\w+)\.\(Array\.isArray\(culinaryApplications\)\s*\?\s*\)\s*\?\s*culinaryApplications\)\?\.\w+\(([^)]+)\)\s*:\s*culinaryApplications\)\?\s*===\s*(\w+)\)/g,
    replacement: 'Object.keys($1.culinaryApplications || {}).includes($3)',
    description: 'Fix specific culinaryApplications corruption'
  },
  {
    name: 'Simple Array.isArray fix',
    pattern: /(\w+)\.\(Array\.isArray\((\w+)\?\)\s*\?\s*\2\?\.\w+\(([^)]+)\)\s*:\s*\2\?\s*===\s*(\w+)\)/g,
    replacement: '(Array.isArray($2) ? $2?.includes($4) : $2 === $4)',
    description: 'Fix simple Array.isArray with optional chaining'
  },
  {
    name: 'cookingMethods property corruption',
    pattern: /(\w+)\.culinaryProperties\?\.\(Array\.isArray\(cookingMethods\)\s*\?\s*cookingMethods\?\.\w+\(([^)]+)\)\s*:\s*cookingMethods\?\s*===\s*(\w+)\)/g,
    replacement: '$1.culinaryProperties?.cookingMethods?.includes($3)',
    description: 'Fix cookingMethods property access corruption'
  },
  {
    name: 'affinities property corruption',
    pattern: /(\w+)\.affinities\?\s*\|\|\s*\[\]\.some\(/g,
    replacement: '($1.affinities || []).some(',
    description: 'Fix affinities property array corruption'
  },
  {
    name: 'traditionalCombinations corruption', 
    pattern: /(\w+)\.\(Array\.isArray\(traditionalCombinations\)\s*\?\s*traditionalCombinations\.\w+\(([^)]+)\)\s*:\s*traditionalCombinations\s*===\s*(\w+)\)/g,
    replacement: '(Array.isArray($1.traditionalCombinations) ? $1.traditionalCombinations.includes($3) : $1.traditionalCombinations === $3)',
    description: 'Fix traditionalCombinations Array.isArray corruption'
  }
];

// File-specific manual fixes
const MANUAL_FIXES = [
  {
    file: 'src/data/ingredients/proteins/index.ts',
    line: 113,
    search: /Object\.keys\(protein\.\(Array\.isArray\(culinaryApplications\)\s*\?\s*\)\s*\?\s*culinaryApplications\)\?\.\w+\([^)]+\)\s*:\s*culinaryApplications\)\?\s*===\s*\w+\)/,
    replace: 'Object.keys(protein.culinaryApplications || {}).includes(method)',
    description: 'Fix line 113 culinaryApplications corruption'
  },
  {
    file: 'src/data/ingredients/proteins/index.ts', 
    line: 114,
    search: /\(\)\s*\|\|\s*\[\]\)\.length\s*\/\s*\(Object\s*\|\|\s*1\)\.keys\(/,
    replace: '|| []).length / Object.keys(',
    description: 'Fix line 114 Object.keys corruption'
  },
  {
    file: 'src/data/ingredients/seasonings/index.ts',
    line: 110,
    search: /value\.\(Array\.isArray\(traditionalCombinations\)\s*\?\s*traditionalCombinations\.\w+\([^)]+\)\s*:\s*traditionalCombinations\s*===\s*\w+\)/,
    replace: '(Array.isArray(value.traditionalCombinations) ? value.traditionalCombinations.includes(cuisine) : value.traditionalCombinations === cuisine)',
    description: 'Fix traditionalCombinations corruption'
  },
  {
    file: 'src/data/ingredients/spices/index.ts',
    line: 395,
    search: /value\.affinities\?\s*\|\|\s*\[\]\.some/,
    replace: '(value.affinities || []).some',
    description: 'Fix affinities array corruption'
  },
  {
    file: 'src/data/ingredients/spices/index.ts',
    line: 396,
    search: /spice\.\(Array\.isArray\(affinities\?\)\s*\?\s*affinities\?\.\w+\([^)]+\)\s*:\s*affinities\?\s*===\s*\w+\)/,
    replace: '(Array.isArray(spice.affinities) ? spice.affinities?.includes(affinity) : spice.affinities === affinity)',
    description: 'Fix spice affinities corruption'
  },
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 295,
    search: /ingredient\.culinaryProperties\?\.\(Array\.isArray\(cookingMethods\)\s*\?\s*cookingMethods\?\.\w+\([^)]+\)\s*:\s*cookingMethods\?\s*===\s*\w+\)/,
    replace: '(Array.isArray(ingredient.culinaryProperties?.cookingMethods) ? ingredient.culinaryProperties?.cookingMethods?.includes(method) : ingredient.culinaryProperties?.cookingMethods === method)',
    description: 'Fix cookingMethods property corruption'
  }
];

let filesProcessed = 0;
let totalFixesApplied = 0;
const fixedFiles = [];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileFixCount = 0;
    const appliedFixes = [];
    
    // Apply general pattern fixes
    for (const pattern of COMPLEX_PATTERNS) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        const beforeLength = content.length;
        content = content.replace(pattern.pattern, pattern.replacement);
        const afterLength = content.length;
        
        if (beforeLength !== afterLength || matches.length > 0) {
          fileFixCount += matches.length;
          appliedFixes.push(`${pattern.name}: ${matches.length} fixes`);
          console.log(`  ✓ ${pattern.name}: ${matches.length} fixes`);
        }
      }
    }
    
    // Apply manual fixes for specific files
    const relativePath = path.relative('.', filePath);
    const manualFix = MANUAL_FIXES.find(fix => fix.file === relativePath);
    if (manualFix) {
      if (content.match(manualFix.search)) {
        content = content.replace(manualFix.search, manualFix.replace);
        fileFixCount++;
        appliedFixes.push(`Manual fix: ${manualFix.description}`);
        console.log(`  ✓ Manual fix: ${manualFix.description}`);
      }
    }
    
    if (fileFixCount > 0) {
      console.log(`📝 ${relativePath} (${fileFixCount} fixes)`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      totalFixesApplied += fileFixCount;
      fixedFiles.push({
        path: relativePath,
        fixes: fileFixCount,
        appliedFixes
      });
    }
    
    filesProcessed++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
function main() {
  console.log('🔍 Processing specific files with complex syntax corruption...');
  
  // Process the specific files mentioned in the errors
  const problematicFiles = [
    'src/components/CuisineRecommender.tsx',
    'src/data/ingredients/proteins/index.ts',
    'src/data/ingredients/seasonings/index.ts', 
    'src/data/ingredients/spices/index.ts',
    'src/data/unified/enhancedIngredients.ts'
  ];
  
  for (const file of problematicFiles) {
    if (fs.existsSync(file)) {
      processFile(file);
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${fixedFiles.length}`);
  console.log(`Total fixes applied: ${totalFixesApplied}`);
  
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
    console.log('Remove --dry-run flag to apply these changes');
  } else {
    console.log('\n✅ FIXES APPLIED SUCCESSFULLY');
  }
  
  if (fixedFiles.length > 0) {
    console.log('\n📋 Fixed Files:');
    fixedFiles.forEach(file => {
      console.log(`  ${file.path}: ${file.fixes} fixes`);
      file.appliedFixes.forEach(fix => console.log(`    - ${fix}`));
    });
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Run: yarn build');
  console.log('2. Check for any remaining syntax errors');
  
  process.exit(0);
}

main(); 