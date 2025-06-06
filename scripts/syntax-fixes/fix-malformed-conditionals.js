#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

// Patterns for malformed conditionals
const malformedPatterns = [
  // Fix missing closing parentheses in ternary operators
  {
    pattern: /Array\.isArray\(([^)]+)\)\s*\?\s*([^:]+?)\.includes\(([^)]+)\s*:\s*([^)]+)\s*===\s*([^)]+)\(/g,
    replacement: 'Array.isArray($1) ? $2.includes($3) : ($4 === $5)'
  },
  
  // Fix malformed optional chaining in conditionals
  {
    pattern: /\(\!([^?]+)\?\s*\|\|\s*\[\]\)/g,
    replacement: '(!$1 || []).length === 0'
  },
  
  // Fix malformed Array.isArray conditionals
  {
    pattern: /Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^:]+):\s*\(([^)]+)\s*\|\|/g,
    replacement: 'Array.isArray($1) ? $2 : ($3 ||'
  },
  
  // Fix missing closing parenthesis in method calls
  {
    pattern: /\.toLowerCase\(\s*:\s*/g,
    replacement: '.toLowerCase()) : '
  },
  
  // Fix malformed ternary with missing closing paren
  {
    pattern: /Array\.isArray\(([^)]+)\)\s*\?\s*([^)]+)\.includes\(([^)]+):\s*([^)]+)\s*===/g,
    replacement: 'Array.isArray($1) ? $2.includes($3) : $4 ==='
  }
];

// Files to fix based on the build errors
const filesToFix = [
  'src/utils/ingredientRecommender.ts',
  'src/utils/recipe/recipeMatching.ts',
  'src/utils/recipeFilters.ts',
  'src/utils/recipeMatching.ts',
  'src/utils/recommendation/methodRecommendation.ts'
];

function fixMalformedConditionals(content, filename) {
  let fixed = content;
  let changes = 0;
  
  // Apply each pattern fix
  for (const { pattern, replacement } of malformedPatterns) {
    const matches = fixed.match(pattern);
    if (matches) {
      console.log(`  Found ${matches.length} malformed conditional(s) to fix with pattern: ${pattern.source}`);
      fixed = fixed.replace(pattern, replacement);
      changes += matches.length;
    }
  }
  
  // Additional specific fixes for known problematic lines
  
  // Fix the specific problematic line in ingredientRecommender.ts
  if (filename.includes('ingredientRecommender.ts')) {
    // Fix line 798 pattern
    fixed = fixed.replace(
      /normalizedName\.includes\(ingredient\?\.toLowerCase\(\s*:\s*normalizedName\s*===\s*ingredient\?\.toLowerCase\(\s*\|\|\s*ingredient/g,
      'normalizedName.includes(ingredient?.toLowerCase()) : (normalizedName === ingredient?.toLowerCase() || ingredient'
    );
    
    // Fix other similar patterns
    fixed = fixed.replace(
      /i\.includes\(ingredient\.name\?\.toLowerCase\(\s*:\s*i\s*===\s*ingredient\.name\?\.toLowerCase\(\)\)\)/g,
      'i.includes(ingredient.name?.toLowerCase()) : i === ingredient.name?.toLowerCase())'
    );
  }
  
  // Fix recipeMatching.ts
  if (filename.includes('recipeMatching.ts')) {
    fixed = fixed.replace(
      /normalizedQuality\.includes\('stable'\)\s*:\s*\(normalizedQuality\s*===\s*'stable'\)\s*\|\|/g,
      'normalizedQuality.includes(\'stable\') : (normalizedQuality === \'stable\')) ||'
    );
  }
  
  // Fix recipeFilters.ts
  if (filename.includes('recipeFilters.ts')) {
    fixed = fixed.replace(
      /\(\!cuisineTypes\?\s*\|\|\s*\[\]\)\.length\)/g,
      '(!cuisineTypes || []).length === 0'
    );
  }
  
  // Fix methodRecommendation.ts
  if (filename.includes('methodRecommendation.ts')) {
    fixed = fixed.replace(
      /methodNameLower\.includes\('grill'\)\s*:\s*\(methodNameLower\s*===\s*'grill'\)\s*\|\|/g,
      'methodNameLower.includes(\'grill\') : (methodNameLower === \'grill\')) ||'
    );
  }
  
  return { content: fixed, changes };
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixMalformedConditionals(content, filePath);
    
    if (result.changes > 0) {
      console.log(`  ✅ Fixed ${result.changes} malformed conditional(s)`);
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, result.content, 'utf8');
        console.log(`  💾 Saved changes to ${filePath}`);
      } else {
        console.log(`  🔍 [DRY RUN] Would save changes to ${filePath}`);
      }
      
      return true;
    } else {
      console.log(`  ✅ No malformed conditionals found`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log(isDryRun ? '[DRY RUN] Fixing malformed conditionals...' : 'Fixing malformed conditionals...');
  
  let totalFilesFixed = 0;
  
  for (const file of filesToFix) {
    const filePath = path.resolve(process.cwd(), file);
    const wasFixed = processFile(filePath);
    if (wasFixed) totalFilesFixed++;
  }
  
  console.log(`\n🎯 Summary: Fixed malformed conditionals in ${totalFilesFixed} file(s)`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a dry run. Use without --dry-run to apply changes.');
  }
}

main(); 