#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Utils Recommendation Files - Comprehensive Syntax Repair');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Target files with their estimated complexity
const TARGET_FILES = [
  'src/utils/recommendation/cuisineRecommendation.ts',
  'src/utils/recipeRecommendation.ts', 
  'src/utils/recipe/recipeCore.ts',
  'src/utils/recommendation/foodRecommendation.ts',
  'src/utils/seasonalCalculations.ts',
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/utils/recipeEnrichment.ts',
  'src/utils/planetInfoUtils.ts',
  'src/utils/recommendationEngine.ts',
  'src/utils/timingUtils.ts'
];

// Common syntax corruption patterns found in these files
const SYNTAX_PATTERNS = [
  // Fix malformed class declarations
  {
    pattern: /export class (\w+)\s*{\s*private static instance:\s*\w+,\s*private constructor\(\)\s*{/g,
    replacement: 'export class $1 {\n  private static instance: $1;\n  \n  private constructor() {'
  },
  
  // Fix broken method declarations with semicolons and invalid syntax
  {
    pattern: /public (\w+)\([^)]*\);[\s\n]*\): [^{]*{/g,
    replacement: (match, methodName) => {
      const cleanMatch = match.replace(/;[\s\n]*\):/, '):');
      return cleanMatch;
    }
  },
  
  // Fix malformed if statements with Array.isArray patterns
  {
    pattern: /if \((\w+)\?\.\(Array\.isArray\(([^)]+)\) \? [^:]+: [^)]+\) \{/g,
    replacement: 'if (Array.isArray($1) && $1.includes($2)) {'
  },
  
  // Fix broken conditional operators and semicolons
  {
    pattern: /(\w+) \+= ([^,;]+), (\w+)\?\.\w+\(`[^`]+`\) \}/g,
    replacement: '$1 += $2;\n    $3.push(`$4`);'
  },
  
  // Fix malformed function parameters with trailing semicolons
  {
    pattern: /function (\w+)\([^)]*\);[\s\n]*\): [^{]*{/g,
    replacement: (match, funcName) => {
      const cleanMatch = match.replace(/;[\s\n]*\):/, '):');
      return cleanMatch;
    }
  },
  
  // Fix broken array access and conditional chains
  {
    pattern: /\(\$(\d+)\$(\d+) \|\| \[\]\)\.length === 0\)/g,
    replacement: '($1 || []).length === 0'
  },
  
  // Fix malformed import statements with syntax errors
  {
    pattern: /import \{ ([^}]+);\s*([^}]+);\s*([^}]+) \} from/g,
    replacement: 'import { $1, $2, $3 } from'
  },
  
  // Fix broken conditional expressions with invalid operators
  {
    pattern: /\?\?\s*([^:]+):\s*\[([^\]]+)\]/g,
    replacement: '? $1 : [$2]'
  },
  
  // Fix malformed object property access
  {
    pattern: /(\w+)\?\.\(Array\.isArray\(([^)]+)\) \?/g,
    replacement: '(Array.isArray($1) ?'
  },
  
  // Fix broken method calls with invalid syntax
  {
    pattern: /\.(\w+)\s*\|\|\s*\[\]\.(\w+)\(/g,
    replacement: ' || []).$2('
  },
  
  // Fix incomplete conditional statements
  {
    pattern: /if \(([^)]+)\) \{\s*([^}]+)\s*\} else if \(\s*([^)]+)\s*\) \{/g,
    replacement: 'if ($1) {\n    $2\n  } else if ($3) {'
  },
  
  // Fix malformed for loops and forEach calls
  {
    pattern: /(\w+) \|\| \[\]\.forEach\(/g,
    replacement: '($1 || []).forEach('
  },
  
  // Fix broken return statements with invalid syntax
  {
    pattern: /return \{([^}]+);[\s\n]*([^}]+);[\s\n]*([^}]+) \}/g,
    replacement: 'return {\n    $1,\n    $2,\n    $3\n  }'
  },
  
  // Fix malformed variable declarations with broken syntax
  {
    pattern: /const (\w+) = ([^,;]+), const (\w+) = ([^,;]+), const (\w+) = ([^,;]+),/g,
    replacement: 'const $1 = $2;\n  const $3 = $4;\n  const $5 = $6;'
  },
  
  // Fix broken ternary operators
  {
    pattern: /\? ([^:]+)\s*: \[([^\]]+)\]\s*:/g,
    replacement: '? [$1] : [$2]'
  },
  
  // Fix malformed array spread operations
  {
    pattern: /\(\$(\d+) \|\| \[\]\)\.(\w+)\(/g,
    replacement: '($1 || []).$2('
  },
  
  // Fix broken object destructuring
  {
    pattern: /\{ ([^}]+), ([^}]+), ([^}]+) \}/g,
    replacement: '{ $1, $2, $3 }'
  },

  // Fix malformed type annotations
  {
    pattern: /: ([^{;]+);[\s\n]*\): ([^{]+) \{/g,
    replacement: ': $1): $2 {'
  },

  // Fix broken switch statements
  {
    pattern: /case '([^']+)':,/g,
    replacement: "case '$1':"
  },

  // Fix malformed template literals
  {
    pattern: /`([^`]+)`\) \}/g,
    replacement: '`$1`);'
  },

  // Fix broken logical operators
  {
    pattern: /\|\|\s*\[\]\.(\w+)\s*===\s*([^)]+)\)/g,
    replacement: ' || []).$1 === $2'
  },

  // Fix malformed async/await patterns
  {
    pattern: /async (\w+)\([^)]*\);[\s\n]*\): [^{]*{/g,
    replacement: (match, funcName) => {
      return match.replace(/;[\s\n]*\):/, '):');
    }
  }
];

// Additional specific patterns for these utility files
const UTILS_SPECIFIC_PATTERNS = [
  // Fix getTimeFactors function corruption
  {
    pattern: /function getTimeFactors\(\): TimeFactors \{ const now = new Date\(\), const hour = now\.getHours\(\), let timeOfDay = 'morning',/g,
    replacement: 'function getTimeFactors(): TimeFactors {\n  const now = new Date();\n  const hour = now.getHours();\n  let timeOfDay = \'morning\';'
  },

  // Fix scoreRecipe function corruption
  {
    pattern: /function scoreRecipe\([^)]+\);[\s\n]*\): \{ score: number, reasons: string\[\] \} \{/g,
    replacement: 'function scoreRecipe(recipe: Recipe, astrologicalState: AstrologicalState, timeFactors: TimeFactors): { score: number, reasons: string[] } {'
  },

  // Fix ElementalProperties type issues
  {
    pattern: /\[element as "Fire" \| "Water" \| "Earth" \| "Air"\]/g,
    replacement: '[element as keyof ElementalProperties]'
  },

  // Fix malformed season checking
  {
    pattern: /recipe\?\.\(Array\.isArray\(currentSeason\?\) \? currentSeason\?\.includes\([^)]+\) : currentSeason\? === [^)]+\)/g,
    replacement: 'recipe.currentSeason && (Array.isArray(recipe.currentSeason) ? recipe.currentSeason.includes(timeFactors.currentSeason) : recipe.currentSeason === timeFactors.currentSeason)'
  },

  // Fix broken planetary influences
  {
    pattern: /calculatePlanetaryDayInfluence\(recipe,\);\s*\(typeof planetaryDay === "string" \? planetaryDay : \(planetaryDay as Record<string, any>\)\?\.planet\)/g,
    replacement: 'calculatePlanetaryDayInfluence(recipe, typeof planetaryDay === "string" ? planetaryDay : (planetaryDay as any)?.planet)'
  },

  // Fix malformed class method declarations
  {
    pattern: /private calculateDetailedScores\(dish, timeFactors: TimeFactors, astroState: AstrologicalState\);[\s\n]*\): DetailedScores \{/g,
    replacement: 'private calculateDetailedScores(dish: any, timeFactors: TimeFactors, astroState: AstrologicalState): DetailedScores {'
  }
];

function applyFix(filePath, content) {
  let fixedContent = content;
  let changesCount = 0;

  // Apply general syntax patterns
  SYNTAX_PATTERNS.forEach((pattern, index) => {
    const before = fixedContent;
    if (typeof pattern.replacement === 'function') {
      fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
    } else {
      fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
    }
    if (before !== fixedContent) {
      changesCount++;
      console.log(`  Applied general pattern ${index + 1}`);
    }
  });

  // Apply utils-specific patterns
  UTILS_SPECIFIC_PATTERNS.forEach((pattern, index) => {
    const before = fixedContent;
    if (typeof pattern.replacement === 'function') {
      fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
    } else {
      fixedContent = fixedContent.replace(pattern.pattern, pattern.replacement);
    }
    if (before !== fixedContent) {
      changesCount++;
      console.log(`  Applied utils-specific pattern ${index + 1}`);
    }
  });

  // Additional cleanup for common issues
  fixedContent = fixedContent
    // Fix trailing commas in wrong places
    .replace(/,(\s*[})\]])/g, '$1')
    // Fix missing semicolons after statements
    .replace(/(\w+\+\+)(?=\s*\n\s*[a-zA-Z])/g, '$1;')
    // Fix malformed if statement bodies
    .replace(/if \(([^)]+)\) \{([^}]+)\} else if \(/g, 'if ($1) {\n    $2\n  } else if (')
    // Fix broken method calls
    .replace(/\.(\w+)\?\?\(([^)]*)\)/g, '?.$1?.($2)')
    // Fix incomplete expressions
    .replace(/\?\.\w+\(`[^`]*`\) \}/g, '.push(reasons); }');

  return { content: fixedContent, changes: changesCount };
}

// Process each target file
let totalFiles = 0;
let totalChanges = 0;

for (const filePath of TARGET_FILES) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const result = applyFix(fullPath, content);
    
    if (result.changes > 0) {
      console.log(`🔧 ${filePath}: ${result.changes} fixes applied`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(fullPath, result.content, 'utf8');
      }
      
      totalChanges += result.changes;
      totalFiles++;
    } else {
      console.log(`✅ ${filePath}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${TARGET_FILES.length}`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total fixes applied: ${totalChanges}`);

if (DRY_RUN) {
  console.log('\n🏃 DRY RUN COMPLETED - No files were actually modified');
  console.log('Run without --dry-run to apply these changes');
} 