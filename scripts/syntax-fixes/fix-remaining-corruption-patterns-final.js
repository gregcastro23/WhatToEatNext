#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing remaining syntax corruption patterns');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Define all corruption patterns and their fixes
const corruptionPatterns = [
  // Pattern 1: Object? || [] syntax issues
  {
    pattern: /\(\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\?\s*\|\|\s*\[\]\s*\)/g,
    replacement: '($1 || [])',
    description: 'Fix (obj? || []) syntax'
  },
  
  // Pattern 2: Array.isArray malformed expressions
  {
    pattern: /Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^:]+):\s*\(([^)]+)\)\s*\)/g,
    replacement: '($1.includes($2))',
    description: 'Fix malformed Array.isArray expressions'
  },
  
  // Pattern 3: Object.(method) syntax issues
  {
    pattern: /Object\.\(Array\.isArray\(keys\(([^)]+)\)\s*\?\s*\)\s*\?\s*keys\(([^)]+)\)\?\.includes\(([^)]+)\)\s*:\s*keys\(([^)]+)\)\?\s*===\s*([^)]+)\)/g,
    replacement: 'Object.keys($1).includes($3)',
    description: 'Fix Object.keys corruption'
  },
  
  // Pattern 4: recipe.(property) syntax
  {
    pattern: /recipe\.\(Array\.isArray\(([^?]+)\?\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: '(recipe.$1 && recipe.$1.includes($2))',
    description: 'Fix recipe property access corruption'
  },
  
  // Pattern 5: Simple ? || [] patterns
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$.]*)\?\s*\|\|\s*\[\]\.length/g,
    replacement: '($1 && $1.length > 0)',
    description: 'Fix property? || [].length patterns'
  },
  
  // Pattern 6: Method calls with || [] at end
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$.]*)\s*\|\|\s*\[\]\.some\(/g,
    replacement: '($1 || []).some(',
    description: 'Fix method || [].some patterns'
  },
  
  // Pattern 7: Property access with || [] at end
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$.]*)\s*\|\|\s*\[\]\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    replacement: '($1 || []).$2',
    description: 'Fix property || [].method patterns'
  }
];

// Files to process
const filesToProcess = [
  'src/utils/foodRecommender.ts',
  'src/utils/ingredientRecommender.ts', 
  'src/utils/lunarPhaseUtils.ts',
  'src/utils/recipe/recipeFiltering.ts',
  'src/utils/recipe/recipeMatching.ts',
  'src/utils/recipeFilters.ts'
];

let totalFixesApplied = 0;

function processFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return 0;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixesApplied = 0;
  
  // Apply each corruption pattern fix
  for (const { pattern, replacement, description } of corruptionPatterns) {
    const originalContent = content;
    content = content.replace(pattern, replacement);
    
    if (content !== originalContent) {
      const matches = originalContent.match(pattern);
      const matchCount = matches ? matches.length : 0;
      fileFixesApplied += matchCount;
      console.log(`   ✅ ${description}: ${matchCount} fixes in ${filePath}`);
    }
  }
  
  // Apply file-specific fixes
  if (filePath.includes('ingredientRecommender.ts')) {
    // Fix specific Mars ingredient scoring corruption
    content = content.replace(
      /for \(const food of marsData\.FoodAssociations\) \{\s*if \(Array\.isArray\(normalizedName\)[^}]+\{\s*score \+= 1\.5;\s*break;\s*\}\s*\}/g,
      `for (const food of marsData.FoodAssociations) {
        if (normalizedName.includes(food?.toLowerCase()) || food?.toLowerCase()?.includes(normalizedName)) {
          return true;
        }
      }`
    );
    
    content = content.replace(
      /for \(const herb of marsData\?\.HerbalAssociations\?\.Herbs\) \{\s*if \(Array\.isArray\(normalizedName\)[^}]+\{\s*score \+= 2\.0;\s*break;\s*\}\s*\}/g,
      `for (const herb of marsData?.HerbalAssociations?.Herbs) {
        if (normalizedName.includes(herb?.toLowerCase()) || herb?.toLowerCase()?.includes(normalizedName)) {
          return true;
        }
      }`
    );
  }
  
  if (filePath.includes('recipeFilters.ts')) {
    // Fix the specific corrupted season filter
    content = content.replace(
      /!recipe\.\(Array\.isArray\(currentSeason\?\)[^)]+\)/g,
      '!(recipe.currentSeason?.includes(options.currentSeason) || recipe.currentSeason === options.currentSeason)'
    );
  }
  
  if (fileFixesApplied > 0) {
    if (DRY_RUN) {
      console.log(`Would fix ${fileFixesApplied} issues in: ${filePath}`);
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed ${fileFixesApplied} issues in: ${filePath}`);
    }
  }
  
  return fileFixesApplied;
}

// Process all files
console.log(`\n📁 Processing ${filesToProcess.length} files...\n`);

for (const filePath of filesToProcess) {
  const fixes = processFile(filePath);
  totalFixesApplied += fixes;
}

console.log(`\n🎯 Summary:`);
console.log(`   Total corruption patterns fixed: ${totalFixesApplied}`);
console.log(`   Files processed: ${filesToProcess.length}`);

if (DRY_RUN) {
  console.log(`\n⚡ Run without --dry-run to apply these fixes`);
} else {
  console.log(`\n✅ All fixes applied successfully!`);
  console.log(`\n🔍 Run 'yarn build' to verify the fixes`);
} 