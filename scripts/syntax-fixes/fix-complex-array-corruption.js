#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log(`🔧 Complex Array.isArray Corruption Fix`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Files that still have complex corruption
const TARGET_FILES = [
  'src/utils/recommendationEngine.ts',
  'src/utils/recipe/recipeEnrichment.ts',
  'src/utils/seasonalCalculations.ts',
  'src/utils/timingUtils.ts',
  'src/components/recipes/RecipeGrid.tsx',
  'src/services/SpoonacularService.ts',
  'src/utils/cookingMethodRecommender.ts',
  'src/components/IngredientRecommender/index.tsx',
  'src/services/SpoonacularElementalMapper.ts',
  'src/components/SauceRecommender.tsx'
];

// Complex patterns that need specific fixes
const COMPLEX_ARRAY_PATTERNS = [
  {
    name: 'Complex malformed Array.isArray with type cast',
    pattern: /\(recipe\.tags as \(Array\.isArray\(string\[\]\?\)\s*\?\s*string\[\]\)\?\.\w+\([^)]*\)\s*:\s*string\[\]\)\?\s*===\s*(\w+)\)\)\)/g,
    replacement: '(Array.isArray(recipe.tags) ? recipe.tags.includes($1) : recipe.tags === $1)',
    description: 'Fix complex recipe.tags Array.isArray corruption'
  },
  {
    name: 'Missing closing parentheses in Array.isArray',
    pattern: /\(Array\.isArray\(string\[\]\)\s*\?\s*string\[\]\)\.includes\((\w+)\)\s*:\s*string\[\]\)\s*===\s*(\w+)\)\)/g,
    replacement: '(Array.isArray(recipe.tags) ? recipe.tags.includes($1) : recipe.tags === $1)',
    description: 'Fix missing closing parentheses in Array.isArray'
  },
  {
    name: 'Malformed function signature with semicolon and parentheses',
    pattern: /export function (\w+)\(;\s*([^)]+)\s*;\s*\):/g,
    replacement: 'export function $1($2):',
    description: 'Fix export function signatures with semicolons'
  },
  {
    name: 'Function parameters with semicolons',
    pattern: /(\w+):\s*(\w+)\s*;\s*\)/g,
    replacement: '$1: $2)',
    description: 'Fix function parameters ending with semicolons'
  },
  {
    name: 'Complex property access with extra parentheses',
    pattern: /\(\((\w+ as unknown as Record<string, any>)\)\)\.\(/g,
    replacement: '($1).',
    description: 'Fix property access with doubled parentheses'
  },
  {
    name: 'Property access dot corruption with extra parentheses',
    pattern: /\)\.\(/g,
    replacement: ').',
    description: 'Fix property access corruption causing identifier errors'
  },
  {
    name: 'Malformed object property access in conditionals',
    pattern: /if \(\(\((\w+) as unknown as Record<string, any>\)\)\.\(([^)]+)\)\)/g,
    replacement: 'if (($1 as unknown as Record<string, any>).$2)',
    description: 'Fix malformed object property access in conditionals'
  },
  {
    name: 'Template variable corruption patterns',
    pattern: /\(\(\((\w+) as unknown as Record<string, any>\)\)\.\(\$1 \|\| \[\]\)/g,
    replacement: '($1.ingredients || [])',
    description: 'Fix template variable corruption with $1'
  },
  {
    name: 'Complex number comparison corruption',
    pattern: /\(Number\(0\) \|\| 0\) \/ \(Number\((\w+)\) \|\| 0\)/g,
    replacement: 'score / (factors || 1)',
    description: 'Fix malformed number comparison with Number() corruption'
  },
  {
    name: 'Malformed forEach with extra braces',
    pattern: /\.forEach\((\w+) => \{\)/g,
    replacement: '.forEach($1 => {',
    description: 'Fix forEach with extra closing braces'
  },
  {
    name: 'Corrupted array access with logical OR',
    pattern: /(\w+)\s*\|\|\s*\[\]\.length\s*>\s*0/g,
    replacement: '($1 || []).length > 0',
    description: 'Fix corrupted array access with logical OR'
  },
  {
    name: 'Complex comma corruption in function calls',
    pattern: /(\w+),\s*;\s*$/gm,
    replacement: '$1',
    description: 'Fix trailing comma-semicolon corruption'
  },
  {
    name: 'Missing comma between function parameters',
    pattern: /(\w+:\s*\w+)\s+(\w+:\s*\w+)/g,
    replacement: '$1, $2',
    description: 'Fix missing commas between function parameters'
  }
];

let filesProcessed = 0;
let totalFixesApplied = 0;
const fixedFiles = [];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileFixCount = 0;
    const appliedFixes = [];
    
    // Apply complex pattern fixes
    for (const pattern of COMPLEX_ARRAY_PATTERNS) {
      const beforeContent = content;
      content = content.replace(pattern.pattern, pattern.replacement);
      
      if (content !== beforeContent) {
        const matches = beforeContent.match(pattern.pattern);
        const fixCount = matches ? matches.length : 1;
        fileFixCount += fixCount;
        appliedFixes.push(`${pattern.name}: ${fixCount} fixes`);
        console.log(`  ✓ ${pattern.name}: ${fixCount} fixes`);
      }
    }
    
    // Manual surgical fixes for specific problematic patterns
    
    // Fix the specific dominantPlanets corruption
    content = content.replace(
      /astrologicalState\.dominantPlanets\s*&&\s*astrologicalState\.dominantPlanets\s*\|\|\s*\[\]\.length\s*>\s*0/g,
      'astrologicalState.dominantPlanets && (astrologicalState.dominantPlanets || []).length > 0'
    );
    
    // Fix the specific recipe mapping corruption
    content = content.replace(
      /recipe,\)/g,
      'recipe'
    );
    
    // Fix specific count parameter corruption
    content = content.replace(
      /count = 3,\)/g,
      'count = 3'
    );
    
    // Fix specific malformed ternary patterns in seasonal calculations
    content = content.replace(
      /if \(\(\(recipe as unknown as Record<string, any>\)\)\.([^)]+)\)/g,
      'if ((recipe as unknown as Record<string, any>).$1)'
    );
    
    // Fix expression expected errors
    content = content.replace(
      /\s*\);\s*$/gm,
      ''
    );
    
    if (content !== originalContent) {
      console.log(`📝 ${path.relative(ROOT_DIR, filePath)} (${fileFixCount} fixes)`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      totalFixesApplied += fileFixCount;
      fixedFiles.push({
        path: path.relative(ROOT_DIR, filePath),
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
  console.log('🔍 Processing files with complex Array.isArray corruption...');
  
  for (const file of TARGET_FILES) {
    const filePath = path.join(ROOT_DIR, file);
    processFile(filePath);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${fixedFiles.length}`);
  console.log(`Total fixes applied: ${totalFixesApplied}`);
  
  if (fixedFiles.length > 0) {
    console.log('\n📋 Files modified:');
    fixedFiles.forEach(file => {
      console.log(`  • ${file.path} (${file.fixes} fixes)`);
      file.appliedFixes.forEach(fix => console.log(`    - ${fix}`));
    });
  }
  
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
    console.log('Remove --dry-run flag to apply these changes');
  } else {
    console.log('\n✅ Changes applied successfully!');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Run: yarn build');
  console.log('2. Check for remaining syntax errors');
  console.log('3. Manual fixes for remaining complex issues');
}

main(); 