#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log(`🔧 Targeted Fix for Top Error Files`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Top 10 most problematic files identified
const TARGET_FILES = [
  'src/utils/recipe/recipeEnrichment.ts',
  'src/scripts/updateCookingMethodTypes.ts',
  'src/components/recipes/RecipeGrid.tsx',
  'src/utils/recommendationEngine.ts',
  'src/services/SpoonacularService.ts',
  'src/utils/cookingMethodRecommender.ts',
  'src/components/IngredientRecommender/index.tsx',
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/services/SpoonacularElementalMapper.ts',
  'src/components/SauceRecommender.tsx'
];

// Corruption patterns identified from manual inspection
const CORRUPTION_PATTERNS = [
  {
    name: 'Function declaration comma corruption',
    pattern: /function,\s+/g,
    replacement: 'function ',
    description: 'Fix function, -> function'
  },
  {
    name: 'Parameter list corruption',
    pattern: /(\w+):\s*(\w+),\s*;\s*$/gm,
    replacement: '$1: $2',
    description: 'Fix parameter list corruption with trailing comma-semicolon'
  },
  {
    name: 'Complex malformed Array.isArray ternary',
    pattern: /\(recipe\.tags as \(Array\.isArray\(string\[\]\?\)\s*\?\s*string\[\]\)\?\.\w+\([^)]+\)\s*:\s*string\[\]\)\?\s*===\s*\w+\)\)\)/g,
    replacement: '(Array.isArray(recipe.tags) ? recipe.tags.includes(tag) : recipe.tags === tag)',
    description: 'Fix severely malformed Array.isArray ternary in recipe.tags'
  },
  {
    name: 'Simple malformed Array.isArray ternary',
    pattern: /\(Array\.isArray\((\w+)\[\]\?\)\s*\?\s*\1\[\]\)\?\.\w+\(([^)]+)\)\s*:\s*\1\[\]\)\s*===\s*(\w+)\)/g,
    replacement: '(Array.isArray($1) ? $1.includes($3) : $1 === $3)',
    description: 'Fix simple malformed Array.isArray patterns'
  },
  {
    name: 'Template variable corruption $1, $3',
    pattern: /if \(Array\.isArray\(\$1\) \? \$1\.includes\(\$3\) : \$1 === \$3 \{/g,
    replacement: 'if (Array.isArray(ingredient.name) ? ingredient.name.includes(searchTerm) : ingredient.name === searchTerm) {',
    description: 'Fix template variable corruption with $1, $3'
  },
  {
    name: 'Malformed count parameter ternary',
    pattern: /\(count\)\?\s*\|\|\s*\[\]/g,
    replacement: 'count || 10',
    description: 'Fix malformed count parameter with array fallback'
  },
  {
    name: 'Property access with dot corruption',
    pattern: /\(\((\w+) as unknown as Record<string, any>\)\)\.\(/g,
    replacement: '(($1 as unknown as Record<string, any>)).',
    description: 'Fix property access corruption with extra parentheses'
  },
  {
    name: 'Missing closing braces with extra text',
    pattern: /(\w+)\[\]\)\s*===\s*\w+\)\s*\{$/gm,
    replacement: '$1) {',
    description: 'Fix missing closing parentheses before opening braces'
  },
  {
    name: 'Malformed forEach arrow function',
    pattern: /\.forEach\((\w+) => \{\)/g,
    replacement: '.forEach($1 => {',
    description: 'Fix malformed forEach arrow function syntax'
  },
  {
    name: 'Malformed object literal',
    pattern: /\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25;/g,
    replacement: '{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25',
    description: 'Fix malformed object literal with semicolon instead of comma'
  },
  {
    name: 'New Set constructor corruption',
    pattern: /\[\.\.\.new,\s*Set\(/g,
    replacement: '[...new Set(',
    description: 'Fix corrupted new Set constructor'
  },
  {
    name: 'Malformed export function',
    pattern: /export function,\s+/g,
    replacement: 'export function ',
    description: 'Fix export function, -> export function'
  },
  {
    name: 'Malformed function parameters with semicolons',
    pattern: /(\w+):\s*(\w+),;\s*$/gm,
    replacement: '$1: $2',
    description: 'Fix function parameters ending with comma-semicolon'
  },
  {
    name: 'Complex property access corruption',
    pattern: /\(\(\w+ as unknown as Record<string, any>\)\)\.\$1/g,
    replacement: 'ingredient.properties',
    description: 'Fix complex property access with $1 template corruption'
  },
  {
    name: 'Identifier expected errors',
    pattern: /\)\.\(/g,
    replacement: ').',
    description: 'Fix property access with extra parentheses causing identifier errors'
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
    
    // Apply corruption pattern fixes
    for (const pattern of CORRUPTION_PATTERNS) {
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
    
    // Additional specific fixes for known problematic patterns
    
    // Fix malformed function signatures
    content = content.replace(/function,\s*(\w+)\([^)]*\),\s*;\s*$/gm, 'function $1(');
    
    // Fix missing closing parentheses in conditionals
    content = content.replace(/if \([^)]*\{$/gm, match => {
      const openParens = (match.match(/\(/g) || []).length;
      const closeParens = (match.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return match.replace('{', ') {');
      }
      return match;
    });
    
    // Fix object property access corruption
    content = content.replace(/(\w+)\.\(([^)]+)\)/g, '$1.$2');
    
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
  console.log('🔍 Processing top 10 most problematic files...');
  
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
  console.log('2. Check for any remaining syntax errors');
  console.log('3. Use manual fixes for complex remaining issues');
}

main(); 