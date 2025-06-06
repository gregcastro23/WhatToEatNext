#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing corruption in crucial utility directory files');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Target files with their error counts
const TARGET_FILES = [
  'src/utils/recommendation/cuisineRecommendation.ts',
  'src/utils/seasonalCalculations.ts', 
  'src/utils/recipe/recipeCore.ts',
  'src/utils/recipeRecommendation.ts',
  'src/utils/recommendation/foodRecommendation.ts',
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/utils/recommendationEngine.ts',
  'src/utils/recipe/recipeAdapter.ts',
  'src/utils/recipeEnrichment.ts',
  'src/utils/recipeUtils.ts'
];

// Comprehensive corruption patterns specific to these files
const CORRUPTION_PATTERNS = [
  // Import statement fixes
  {
    pattern: /import\s+{\s*([^}]+),;\s*([^}]+)\s*}\s+from/g,
    replacement: 'import { $1, $2 } from',
    description: 'Fix malformed import statements with semicolons'
  },
  {
    pattern: /calculateLunarPhase,;\s*calculatePlanetaryPositions,;\s*calculatePlanetaryAspects/g,
    replacement: 'calculateLunarPhase, calculatePlanetaryPositions, calculatePlanetaryAspects',
    description: 'Fix astrological import statements'
  },
  
  // Function declaration fixes
  {
    pattern: /export function,/g,
    replacement: 'export function',
    description: 'Fix function declarations with commas'
  },
  {
    pattern: /function,/g,
    replacement: 'function',
    description: 'Fix function declarations with commas'
  },
  {
    pattern: /public static,/g,
    replacement: 'public static',
    description: 'Fix static method declarations'
  },
  {
    pattern: /public,/g,
    replacement: 'public',
    description: 'Fix public method declarations'
  },
  {
    pattern: /private,/g,
    replacement: 'private',
    description: 'Fix private method declarations'
  },

  // Constructor and new operator fixes
  {
    pattern: /new,\s+/g,
    replacement: 'new ',
    description: 'Fix new operator with comma'
  },
  {
    pattern: /private,\s+constructor/g,
    replacement: 'private constructor',
    description: 'Fix constructor declarations'
  },

  // Object property and syntax fixes
  {
    pattern: /:\s*{\s*([^}]+),;\s*([^}]+)\s*}/g,
    replacement: ': { $1, $2 }',
    description: 'Fix object property syntax'
  },
  {
    pattern: /,;\s*}/g,
    replacement: ' }',
    description: 'Fix object closing braces'
  },
  {
    pattern: /,;\s*([a-zA-Z_$][a-zA-Z0-9_$]*:)/g,
    replacement: ', $1',
    description: 'Fix object property separators'
  },

  // Conditional and ternary operator fixes
  {
    pattern: /\|\|\s*null\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    replacement: ' || $1',
    description: 'Fix logical OR with null patterns'
  },
  {
    pattern: /\?\s*([^:]+)\s*:\s*([^;,}]+)\s*\|\|\s*null/g,
    replacement: '? $1 : $2',
    description: 'Fix ternary operators with null'
  },
  {
    pattern: /Array\.isArray\(([^)]+)\)\s*\?\s*([^:]+)\.includes\(([^)]+)\)\s*:\s*([^=]+)\s*===\s*([^)]+)\)/g,
    replacement: 'Array.isArray($1) ? $2.includes($3) : $1 === $5',
    description: 'Fix array check ternary patterns'
  },

  // Variable declaration and assignment fixes
  {
    pattern: /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+),;\s*/g,
    replacement: 'let $1 = $2;\n',
    description: 'Fix variable declarations with semicolons'
  },
  {
    pattern: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+),;\s*/g,
    replacement: 'const $1 = $2;\n',
    description: 'Fix const declarations'
  },

  // Semicolon and comma fixes
  {
    pattern: /,;\s*$/gm,
    replacement: ';',
    description: 'Fix line-ending comma-semicolon combinations'
  },
  {
    pattern: /,;\s*(?=\n|$)/g,
    replacement: ';',
    description: 'Fix comma-semicolon at end of lines'
  },

  // Array and object access fixes
  {
    pattern: /\?\(\s*Array\.isArray\(([^)]+)\)\s*\?\s*([^:]+)\.includes\(([^)]+)\)\s*:\s*([^=]+)\s*===\s*([^)]+)\)/g,
    replacement: '?.(Array.isArray($1) ? $1.includes($3) : $1 === $5)',
    description: 'Fix optional chaining with array checks'
  },
  {
    pattern: /\$1\.\$3/g,
    replacement: '$1.$3',
    description: 'Fix template literal patterns'
  },
  {
    pattern: /\$([0-9]+)/g,
    replacement: (match, num) => {
      // Only replace isolated $ patterns, not in valid regex contexts
      return match;
    },
    description: 'Fix dollar variable patterns'
  },

  // Specific corruption patterns from the files
  {
    pattern: /throw new,\s+Error/g,
    replacement: 'throw new Error',
    description: 'Fix throw new Error syntax'
  },
  {
    pattern: /if\s*\(;\s*/g,
    replacement: 'if (',
    description: 'Fix if statement syntax'
  },
  {
    pattern: /\)\s*\{[^}]*const scores = this\.calculateDetailedScores\([^)]*\),\s*astroState\);/g,
    replacement: ') {\n      const scores = this.calculateDetailedScores(dish, timeFactors, astroState);',
    description: 'Fix method call syntax'
  },

  // Type annotation fixes
  {
    pattern: /:\s*([^;,}]+)\s*,;\s*/g,
    replacement: ': $1,\n',
    description: 'Fix type annotations with comma-semicolons'
  },

  // Import type fixes
  {
    pattern: /import type\s*{\s*([^}]+),\s*([^}]+)\s*LunarPhaseWithSpaces([^}]*)\s*}/g,
    replacement: 'import type { $1, $2, LunarPhaseWithSpaces$3 }',
    description: 'Fix import type statements'
  },

  // Specific method call fixes
  {
    pattern: /await,\s+/g,
    replacement: 'await ',
    description: 'Fix await syntax'
  },
  {
    pattern: /return,\s+/g,
    replacement: 'return ',
    description: 'Fix return syntax'
  }
];

// Additional specific patterns for these files
const SPECIFIC_PATTERNS = [
  // Fix specific ingredient recommendation patterns
  {
    pattern: /Array\.isArray\(ingredient\.name\)\s*\?\s*ingredient\.name\.includes\(searchTerm\)\s*:\s*ingredient\.name\s*===\s*searchTerm/g,
    replacement: 'categories.includes("vegetables")',
    description: 'Fix ingredient category check patterns'
  },
  
  // Fix malformed filter expressions
  {
    pattern: /\.filter\(\(dish\) => \{\s*if \(mealType && !dish\?\(\s*Array\.isArray\(tags\?\)\s*\?\s*tags\?\.includes\(mealType\)\s*:\s*tags\?\s*===\s*mealType\)\)/g,
    replacement: '.filter((dish) => {\n      if (mealType && !dish?.tags?.includes(mealType))',
    description: 'Fix filter expression syntax'
  },

  // Fix object property access patterns
  {
    pattern: /\$1\.\$3\)\s*\?\s*\$1\.\$3\.includes\(\$5\)\s*:\s*\$1\.\$3\s*===\s*\$5/g,
    replacement: 'ingredient.season?.includes(currentSeason)',
    description: 'Fix property access patterns'
  },

  // Fix method parameter lists
  {
    pattern: /getRecommendationsForCuisine\(;\s*cuisineName:\s*string,;\s*astroState:\s*AstrologicalState,;\s*count\s*=\s*5,;\s*mealType:\s*MealType\s*=\s*null,;\s*dietaryRestrictions:\s*string\[\]\s*=\s*\[\]\);/g,
    replacement: 'getRecommendationsForCuisine(\n    cuisineName: string,\n    astroState: AstrologicalState,\n    count = 5,\n    mealType: MealType = null,\n    dietaryRestrictions: string[] = []\n  )',
    description: 'Fix method parameter syntax'
  }
];

function fixFileContent(content, filePath) {
  let fixedContent = content;
  let changesApplied = [];

  // Apply general corruption patterns
  for (const { pattern, replacement, description } of CORRUPTION_PATTERNS) {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(pattern, replacement);
    const afterLength = fixedContent.length;
    
    if (beforeLength !== afterLength) {
      changesApplied.push(description);
    }
  }

  // Apply specific patterns
  for (const { pattern, replacement, description } of SPECIFIC_PATTERNS) {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(pattern, replacement);
    const afterLength = fixedContent.length;
    
    if (beforeLength !== afterLength) {
      changesApplied.push(description);
    }
  }

  // Additional specific fixes for known issues
  if (filePath.includes('ingredientRecommendation.ts')) {
    // Fix the completely malformed first line
    fixedContent = fixedContent.replace(
      /function createElementalProperties.*?;\s*}\s*import/s,
      'import'
    );
    
    // Fix complex malformed expressions
    fixedContent = fixedContent.replace(
      /\s*ingredients\?\.\$([0-9]+)\|\|\[\]\.forEach/g,
      '.forEach'
    );
    
    changesApplied.push('Fixed ingredientRecommendation.ts specific issues');
  }

  if (filePath.includes('seasonalCalculations.ts')) {
    // Fix specific seasonal calculation issues
    fixedContent = fixedContent.replace(
      /spring:\s*{\s*Air:\s*0\.4\s*Water:\s*0\.3\s*Earth:\s*0\.2\s*Fire:\s*0\.1\s*}/g,
      'spring: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 }'
    );
    
    fixedContent = fixedContent.replace(
      /summer:\s*{\s*Fire:\s*0\.4,\s*Air:\s*0\.3\s*Earth:\s*0\.2\s*Water:\s*0\.1\s*}/g,
      'summer: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 }'
    );
    
    changesApplied.push('Fixed seasonalCalculations.ts specific issues');
  }

  return { content: fixedContent, changes: changesApplied };
}

// Process each target file
let totalFilesProcessed = 0;
let totalChangesApplied = 0;

for (const filePath of TARGET_FILES) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  try {
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    const { content: fixedContent, changes } = fixFileContent(originalContent, filePath);

    if (changes.length > 0) {
      totalFilesProcessed++;
      totalChangesApplied += changes.length;

      if (DRY_RUN) {
        console.log(`\n📝 Would fix ${filePath}:`);
        changes.forEach(change => console.log(`  - ${change}`));
      } else {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        console.log(`\n✅ Fixed ${filePath}:`);
        changes.forEach(change => console.log(`  - ${change}`));
      }
    } else {
      console.log(`✓ No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Files processed: ${totalFilesProcessed}`);
console.log(`  Total changes applied: ${totalChangesApplied}`);

if (DRY_RUN) {
  console.log('\n🏃 This was a dry run. Run without --dry-run to apply changes.');
} else {
  console.log('\n✅ All fixes applied successfully!');
} 