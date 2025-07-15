#!/usr/bin/env node

/**
 * FOLLOW-UP SYNTAX FIX FOR REMAINING CORRUPTION PATTERNS
 * Target: Specific corruption patterns still blocking build
 * Patterns: Missing conditions, malformed property access, incomplete expressions
 * Methodology: Targeted patterns identified from build output
 */

import { promises as fs } from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Files identified from build errors
const PROBLEM_FILES = [
  'src/services/UnifiedIngredientService.ts',
  'src/services/UnifiedRecommendationService.ts',
  'src/utils/recommendationEngine.ts',
  'src/utils/retryChunkLoad.ts',
  'src/utils/safeAstrology.ts',
  'src/utils/scriptReplacer.ts',
  'src/utils/seasonalCalculations.ts',
  'src/utils/testIngredientMapping.ts',
  'src/utils/timingUtils.ts',
  'src/utils/typeGuards.ts',
  'src/utils/zodiacUtils.ts'
];

// Additional corruption patterns from build output
const CORRUPTION_PATTERNS = [
  {
    // Fix ingredient.tags? || [].some patterns
    pattern: /(\w+)\.(\w+)\?\s*\|\|\s*\[\]\.some\(/g,
    replacement: "($1.$2 || []).some(",
    description: 'Fix property? || [].some corruption',
    maxMatches: 10
  },
  {
    // Fix object.(identifier) patterns
    pattern: /(\w+)\.(\()(\w+)(\))/g,
    replacement: "$1.$3",
    description: 'Fix object.(identifier) corruption',
    maxMatches: 15
  },
  {
    // Fix object.Array.isArray(value)? || [] patterns  
    pattern: /(\w+)\.Array\.isArray\(([^)]+)\)\?\s*\|\|\s*\[\]/g,
    replacement: "Array.isArray($1.$2) ? $1.$2 : []",
    description: 'Fix object.Array.isArray corruption',
    maxMatches: 10
  },
  {
    // Fix message? || [] patterns in template literals and expressions
    pattern: /(\w+)\?\s*\|\|\s*\[\]/g,
    replacement: "$1 || []",
    description: 'Fix variable? || [] corruption',
    maxMatches: 20
  },
  {
    // Fix event.(Array.isArray(...)) patterns
    pattern: /(\w+)\.(\()Array\.isArray\(([^)]+)\)\s*\?\s*([^:]+):\s*([^)]+)(\))/g,
    replacement: "Array.isArray($1.$3) ? $4 : $5",
    description: 'Fix event.(Array.isArray...) corruption',
    maxMatches: 10
  },
  {
    // Fix Object.(entries(...)) patterns
    pattern: /Object\.(\()([^)]+)(\))/g,
    replacement: "Object.$2",
    description: 'Fix Object.(method) corruption',
    maxMatches: 10
  },
  {
    // Fix incomplete expression patterns like ");   " at line end
    pattern: /;\s*\n\s*\);/g,
    replacement: ";\n",
    description: 'Fix incomplete expression with dangling );',
    maxMatches: 10
  },
  {
    // Fix value?.(trim()? || []) patterns
    pattern: /(\w+)\?\.\(\s*(\w+)\(\)\?\s*\|\|\s*\[\]\)/g,
    replacement: "$1?.$2() || []",
    description: 'Fix value?.(method()? || []) corruption',
    maxMatches: 10
  },
  {
    // Fix if (Array.isArray((variable) ? (...) return statements
    pattern: /if\s*\(Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^)]+)\.includes\(([^)]+)\)\s*:\s*\(([^)]+)\s*===\s*([^)]+)\)\)\s*return\s*([^;]+);/g,
    replacement: "if (Array.isArray($1) ? $1.includes($3) : $1 === $3) return $6;",
    description: 'Fix Array.isArray if statement with return',
    maxMatches: 15
  },
  {
    // Fix Object.values(...)(? || []) patterns
    pattern: /Object\.values\(([^)]+)\)\(\?\s*\|\|\s*\[\]\)/g,
    replacement: "Object.values($1) || []",
    description: 'Fix Object.values(...)(?  || []) corruption',
    maxMatches: 10
  },
  {
    // Fix Object.values(object.(property)? || []) patterns
    pattern: /Object\.values\((\w+)\.(\()([^)]+)(\))\?\s*\|\|\s*\[\]\)/g,
    replacement: "Object.values($1.$3 || {})",
    description: 'Fix Object.values(object.(property)? || []) corruption',
    maxMatches: 10
  }
];

async function fixFile(filePath) {
  console.log(`\n🎯 FIXING: ${filePath}`);
  
  try {
    // Check if file exists first
    await fs.access(filePath);
    
    const content = await fs.readFile(filePath, 'utf-8');
    let modifiedContent = content;
    let totalFixes = 0;
    
    for (const { pattern, replacement, description, maxMatches } of CORRUPTION_PATTERNS) {
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
    
    console.log(`📊 SUMMARY: ${totalFixes} fixes applied to ${filePath}`);
    
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

async function fixAllFiles() {
  console.log(`🔧 FOLLOW-UP SYNTAX FIX FOR REMAINING PATTERNS`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Files to process: ${PROBLEM_FILES.length}`);
  
  let totalFixesAll = 0;
  let processedFiles = 0;
  
  for (const filePath of PROBLEM_FILES) {
    const fixes = await fixFile(filePath);
    if (fixes >= 0) {
      totalFixesAll += fixes;
      processedFiles++;
    }
  }
  
  console.log(`\n📈 OVERALL SUMMARY:`);
  console.log(`Files processed: ${processedFiles}/${PROBLEM_FILES.length}`);
  console.log(`Total fixes applied: ${totalFixesAll}`);
  
  if (DRY_RUN) {
    console.log(`\n🧪 DRY RUN COMPLETE - Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ FIXES APPLIED - Run 'yarn build' to verify`);
  }
}

fixAllFiles(); 