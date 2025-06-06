#!/usr/bin/env node

/**
 * FINAL SYNTAX FIX FOR MISSING PARENTHESES AND MALFORMED EXPRESSIONS
 * Target: Specific syntax errors preventing build
 * Patterns: Missing closing parentheses, malformed Array.isArray expressions
 * Methodology: Precise fixes for build-blocking errors
 */

import { promises as fs } from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

// Files that have critical build errors
const CRITICAL_FILES = [
  'src/services/UnifiedIngredientService.ts',
  'src/services/UnifiedRecommendationService.ts',
  'src/services/adapters/IngredientServiceAdapter.ts'
];

// Precise fixes for the specific build errors
const CRITICAL_PATTERNS = [
  {
    // Fix Array.isArray(!normalizedExclusions) ? !normalizedExclusions.includes(ingredient.name?.toLowerCase() : !normalizedExclusions === ingredient.name?.toLowerCase())
    pattern: /Array\.isArray\(([^)]+)\)\s*\?\s*([^:]+)\.includes\(([^)]+)\s*:\s*([^)]+)\s*===\s*([^)]+)\)/g,
    replacement: "Array.isArray($1) ? $2.includes($3) : $4 === $5",
    description: 'Fix malformed Array.isArray expression with missing closing parenthesis',
    maxMatches: 10
  },
  {
    // Fix recipe.$1 || [].map patterns  
    pattern: /(\w+)\.\$1\s*\|\|\s*\[\]/g,
    replacement: "$1.ingredients || []",
    description: 'Fix recipe.$1 || [] corruption',
    maxMatches: 5
  },
  {
    // Fix ingredients || [].filter(condition()  missing closing parenthesis
    pattern: /(\w+)\s*\|\|\s*\[\]\.filter\(([^)]+)\(\)\s*\|\|\s*\[\]/g,
    replacement: "($1 || []).filter($2)",
    description: 'Fix filter expression with missing parenthesis',
    maxMatches: 5
  },
  {
    // Fix criteria.includeIngredients || [].length patterns
    pattern: /(\w+\.\w+)\s*\|\|\s*\[\]\.length/g,
    replacement: "($1 || []).length",
    description: 'Fix property || [].length corruption',
    maxMatches: 5
  },
  {
    // Fix overlappingSeasons = ing1?.seasonality || [].filter(season => Array.isArray($1.$3) ? $4 : $5)
    pattern: /(\w+)\.(\w+)\s*\|\|\s*\[\]\.filter\([^)]+\s*=>\s*Array\.isArray\(\$1\.\$3\)\s*\?\s*\$4\s*:\s*\$5\)/g,
    replacement: "($1.$2 || []).filter(season => (ing2.seasonality || []).includes(season))",
    description: 'Fix complex filter expression with variable substitution',
    maxMatches: 3
  },
  {
    // Fix incomplete elemental properties object declaration
    pattern: /{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\n\s*};/g,
    replacement: "{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };",
    description: 'Fix incomplete elemental properties object',
    maxMatches: 3
  },
  {
    // Fix Fire: Fire / count, Water: Water / count, Earth: Earth / count, Air: Air / count \n };
    pattern: /{\s*Fire:\s*Fire\s*\/\s*count,\s*Water:\s*Water\s*\/\s*count,\s*Earth:\s*Earth\s*\/\s*count,\s*Air:\s*Air\s*\/\s*count\s*\n\s*};/g,
    replacement: "{ Fire: Fire / count, Water: Water / count, Earth: Earth / count, Air: Air / count };",
    description: 'Fix incomplete return object with calculation',
    maxMatches: 3
  },
  {
    // Fix ingredient.elementalPropertiesState.Fire (should be elementalProperties)
    pattern: /(\w+)\.elementalPropertiesState\.(\w+)/g,
    replacement: "$1.elementalProperties.$2",
    description: 'Fix elementalPropertiesState to elementalProperties',
    maxMatches: 10
  },
  {
    // Fix ingredient.astrologicalPropertiesProperties (should be astrologicalProperties)  
    pattern: /(\w+)\.astrologicalPropertiesProperties/g,
    replacement: "$1.astrologicalProperties",
    description: 'Fix astrologicalPropertiesProperties to astrologicalProperties',
    maxMatches: 10
  },
  {
    // Fix options.categories && options.categories || [].length > 0 patterns
    pattern: /(\w+\.\w+)\s*&&\s*\1\s*\|\|\s*\[\]\.length\s*>\s*0/g,
    replacement: "$1 && ($1 || []).length > 0",
    description: 'Fix redundant property check with || [].length',
    maxMatches: 5
  }
];

async function fixCriticalFile(filePath) {
  console.log(`\n🚨 CRITICAL FIX: ${filePath}`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let modifiedContent = content;
    let totalFixes = 0;
    
    for (const { pattern, replacement, description, maxMatches } of CRITICAL_PATTERNS) {
      let matches = 0;
      
      modifiedContent = modifiedContent.replace(pattern, (match, ...args) => {
        if (matches >= maxMatches) return match;
        matches++;
        totalFixes++;
        console.log(`  ✅ ${description}: ${matches}/${maxMatches}`);
        return replacement;
      });
      
      if (matches === 0) {
        console.log(`     No matches for: ${description}`);
      }
    }
    
    console.log(`📊 SUMMARY: ${totalFixes} critical fixes applied to ${filePath}`);
    
    if (DRY_RUN) {
      console.log(`🧪 DRY RUN - Changes not applied`);
      return totalFixes;
    } else {
      await fs.writeFile(filePath, modifiedContent, 'utf-8');
      console.log(`✅ APPLIED`);
      return totalFixes;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

async function fixCriticalErrors() {
  console.log(`🚨 CRITICAL SYNTAX FIX FOR BUILD-BLOCKING ERRORS`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Critical files to process: ${CRITICAL_FILES.length}`);
  
  let totalFixesAll = 0;
  let processedFiles = 0;
  
  for (const filePath of CRITICAL_FILES) {
    try {
      await fs.access(filePath);
      const fixes = await fixCriticalFile(filePath);
      totalFixesAll += fixes;
      processedFiles++;
    } catch (error) {
      console.error(`❌ File not found: ${filePath}`);
    }
  }
  
  console.log(`\n📈 CRITICAL FIXES SUMMARY:`);
  console.log(`Files processed: ${processedFiles}/${CRITICAL_FILES.length}`);
  console.log(`Total critical fixes applied: ${totalFixesAll}`);
  
  if (DRY_RUN) {
    console.log(`\n🧪 DRY RUN COMPLETE - Run without --dry-run to apply critical fixes`);
  } else {
    console.log(`\n✅ CRITICAL FIXES APPLIED - Run 'yarn build' to verify`);
  }
}

fixCriticalErrors(); 