#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.resolve(__dirname, '../..');

console.log('🔧 Fixing systematic syntax errors in utils directory');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Files to fix (from the error report)
const FILES_TO_FIX = [
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/utils/recommendation/cuisineRecommendation.ts', 
  'src/utils/recommendation/foodRecommendation.ts',
  'src/utils/recipe/recipeCore.ts',
  'src/utils/recipeRecommendation.ts',
  'src/utils/recipeEnrichment.ts',
  'src/utils/seasonalCalculations.ts',
  'src/utils/recommendationEngine.ts',
  'src/utils/planetInfoUtils.ts'
];

// Systematic fixes to apply
const FIXES = [
  // Fix malformed function parameters (semicolons to commas)
  {
    pattern: /\(\s*;\s*([^)]+)\s*\)/g,
    replacement: '($1)',
    description: 'Fix malformed function parameters with leading semicolons'
  },
  
  // Fix function parameters with semicolons instead of commas
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,)]+);\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^;,)]+)/g,
    replacement: '$1: $2, $3: $4',
    description: 'Fix semicolons between function parameters'
  },
  
  // Fix malformed conditionals with null comparisons
  {
    pattern: /\|\|\s*null\s*\(/g,
    replacement: ' && (',
    description: 'Fix malformed null conditional operators'
  },
  
  // Fix malformed array/object access patterns
  {
    pattern: /\$(\d+)\.\$(\d+)/g,
    replacement: 'item',
    description: 'Fix malformed array/object access patterns'
  },
  
  // Fix incomplete ternary operators
  {
    pattern: /\?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\?\s*([^:]+)\s*:/g,
    replacement: '? $1 === $3 :',
    description: 'Fix incomplete ternary operators'
  },
  
  // Fix malformed object destructuring with semicolons
  {
    pattern: /{\s*([^}]*?);\s*}/g,
    replacement: (match, content) => {
      const fixed = content.replace(/;\s*/g, ', ').replace(/,\s*$/, '');
      return `{ ${fixed} }`;
    },
    description: 'Fix semicolons in object destructuring'
  },
  
  // Fix malformed array literals with semicolons
  {
    pattern: /\[\s*;\s*([^\]]*?)\s*\]/g,
    replacement: '[$1]',
    description: 'Fix malformed array literals with leading semicolons'
  },
  
  // Fix incomplete expressions ending with semicolons inside parentheses
  {
    pattern: /\(\s*([^)]*?);\s*\)/g,
    replacement: '($1)',
    description: 'Fix expressions with trailing semicolons in parentheses'
  },
  
  // Fix malformed import statements with semicolons
  {
    pattern: /import\s*{\s*([^}]*?);\s*([^}]*?)\s*}/g,
    replacement: 'import { $1, $2 }',
    description: 'Fix semicolons in import statements'
  },
  
  // Fix malformed conditional expressions with Array.isArray patterns
  {
    pattern: /Array\.isArray\(\$(\d+)\) \? \$\1\.includes\(\$(\d+)\) : \$\1 === \$\2/g,
    replacement: 'Array.isArray(items) ? items.includes(item) : items === item',
    description: 'Fix malformed Array.isArray conditionals'
  },
  
  // Fix incomplete function calls ending with semicolon
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\(\s*;\s*([^)]*?)\s*\)/g,
    replacement: '$1($2)',
    description: 'Fix function calls with leading semicolons'
  },
  
  // Fix incomplete object property assignments  
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,;}]+);\s*}/g,
    replacement: '$1: $2 }',
    description: 'Fix object property assignments ending with semicolons'
  },
  
  // Fix malformed return statements
  {
    pattern: /return\s*{\s*([^}]*?);\s*}/g,
    replacement: (match, content) => {
      const fixed = content.replace(/;\s*/g, ', ').replace(/,\s*$/, '');
      return `return { ${fixed} }`;
    },
    description: 'Fix return statements with semicolons in object literals'
  },
  
  // Fix specific pattern issues seen in the files
  {
    pattern: /\)\s*\|\|\s*\[\]\s*\.some\(/g,
    replacement: ') || []).some(',
    description: 'Fix malformed array operations'
  },
  
  // Fix incomplete if conditions
  {
    pattern: /if\s*\(\s*([^)]*?)\s*\|\|\s*\[\]\s*\.\s*length\s*\)/g,
    replacement: 'if (($1 || []).length > 0)',
    description: 'Fix incomplete if conditions with array length checks'
  },

  // Fix malformed variable declarations with semicolons
  {
    pattern: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\[\s*;\s*([^\]]*?)\s*\]/g,
    replacement: 'const $1 = [$2]',
    description: 'Fix const declarations with malformed arrays'
  },

  // Fix more specific patterns found in the error logs
  {
    pattern: /\.filter\(\s*\(\s*\[\s*_\s*,\s*([^)]+)\s*\]\s*\)\s*=>\s*([^)]+)\s*<\s*([^)]+)\s*\)/g,
    replacement: '.filter(([_, $1]) => $2 < $3)',
    description: 'Fix malformed filter operations'
  },

  // Fix spread operator issues
  {
    pattern: /\.\.\?\.\(\(/g,
    replacement: '...(',
    description: 'Fix malformed spread operator with optional chaining'
  },

  // Fix incomplete conditional chains
  {
    pattern: /\s*\|\|\s*\[\]\s*\.\s*some\(\s*([^)]+)\s*=>\s*\)\s*;/g,
    replacement: ' || []).some($1 => true);',
    description: 'Fix incomplete conditional chains'
  }
];

function fixFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  let appliedFixes = [];

  // Apply each fix
  for (const fix of FIXES) {
    const before = content;
    
    if (typeof fix.replacement === 'function') {
      content = content.replace(fix.pattern, fix.replacement);
    } else {
      content = content.replace(fix.pattern, fix.replacement);
    }
    
    if (content !== before) {
      modified = true;
      appliedFixes.push(fix.description);
    }
  }

  // Additional manual fixes for specific patterns found in error logs
  
  // Fix the specific pattern: export async function getIngredientRecommendations(;
  content = content.replace(
    /export\s+async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*;\s*([^)]+)\s*\)/g,
    'export async function $1($2)'
  );

  // Fix the specific pattern: function calculateElementalScore(;
  content = content.replace(
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*;\s*([^)]+)\s*\)/g,
    'function $1($2)'
  );

  // Fix malformed type annotations with semicolons
  content = content.replace(
    /:\s*([A-Z][a-zA-Z0-9_<>]+)\s*;\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    ': $1, $2'
  );

  // Fix incomplete try-catch-finally blocks
  content = content.replace(
    /}\s*catch\s*\([^)]*\)\s*{\s*[^}]*}\s*function/g,
    (match) => match.replace('function', '\n}\n\nfunction')
  );

  // Fix malformed property access chains
  content = content.replace(
    /ingredient\.season\?\.\?\.\?\.\?\.\?\.\?\.\?\./g,
    'ingredient.season'
  );

  // Check if any additional modifications were made
  if (content !== fs.readFileSync(fullPath, 'utf8')) {
    modified = true;
    appliedFixes.push('Additional manual pattern fixes');
  }

  if (modified) {
    if (DRY_RUN) {
      console.log(`✅ Would fix: ${filePath}`);
      if (appliedFixes.length > 0) {
        console.log(`   Applied fixes: ${appliedFixes.join(', ')}`);
      }
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      if (appliedFixes.length > 0) {
        console.log(`   Applied fixes: ${appliedFixes.join(', ')}`);
      }
    }
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

// Fix all files
for (const file of FILES_TO_FIX) {
  fixFile(file);
}

console.log('\n🎉 Syntax fixes completed!');

if (!DRY_RUN) {
  console.log('\n📋 Next steps:');
  console.log('1. Run: yarn build');
  console.log('2. Check for remaining TypeScript errors');
  console.log('3. Run tests to ensure functionality is preserved');
} 