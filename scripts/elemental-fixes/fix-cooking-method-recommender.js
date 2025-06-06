#!/usr/bin/env node

/**
 * TARGETED SYNTAX FIX FOR cookingMethodRecommender.ts
 * Target: src/utils/cookingMethodRecommender.ts (165 errors)
 * Patterns: Malformed property access, array operations
 * Methodology: Single-file, limited patterns, immediate verification
 */

import { promises as fs } from 'fs';

const TARGET_FILE = 'src/utils/cookingMethodRecommender.ts';
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 15;

// SPECIFIC patterns only - exact matches to avoid corruption
const SPECIFIC_PATTERNS = [
  {
    pattern: /normalized1\?\.\s*split\s*\('\s*\('\)\?\s*\|\|\s*\[\]\)\.filter/g,
    replacement: "normalized1?.split(' ')?.filter",
    description: 'Fix malformed string split operation',
    maxMatches: 3
  },
  {
    pattern: /method\.astrologicalInfluences\?\.\(Array\.isArray\(dominantPlanets\?\)\s*\?\s*dominantPlanets\?\.includes\([^)]+\)\s*:\s*dominantPlanets\?\s*===\s*[^)]+\)/g,
    replacement: "method.astrologicalInfluences?.dominantPlanets?.includes($1)",
    description: 'Fix malformed astrologicalInfluences property access',
    maxMatches: 5
  },
  {
    pattern: /method\.\(variations\s*\|\|\s*\[\]\)\.some/g,
    replacement: "method.variations?.some",
    description: 'Fix malformed variations property access',
    maxMatches: 2
  },
  {
    pattern: /\(Array\.isArray\(planets\?\)\s*\?\s*planets\?\.includes\('([^']+)'\)\s*:\s*planets\?\s*===\s*'([^']+)'\)/g,
    replacement: "planets?.includes('$1')",
    description: 'Fix malformed planets array includes check',
    maxMatches: 20
  },
  {
    pattern: /Array\.isArray\(([^)]+)\)\s*\?\s*\1\.includes\(([^)]+)\)\s*:\s*\1\s*===\s*\2/g,
    replacement: "$1?.includes($2)",
    description: 'Fix malformed Array.isArray ternary operations',
    maxMatches: 15
  },
  {
    pattern: /\(word\s*\|\|\s*\[\]\)\.length\s*>\s*3/g,
    replacement: "(word?.length || 0) > 3",
    description: 'Fix malformed word length check',
    maxMatches: 2
  },
  {
    pattern: /\(\s*Number\(\d+\)\s*\|\|\s*\d+\s*\)\s*-\s*\(Number\(both\)\s*\|\|\s*\d+\)/g,
    replacement: "// Both",
    description: 'Fix malformed Number calculation comment',
    maxMatches: 2
  }
];

async function fixTargetFile() {
  console.log(`🎯 TARGETED FIX: ${TARGET_FILE}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  
  try {
    const content = await fs.readFile(TARGET_FILE, 'utf-8');
    let modifiedContent = content;
    let totalFixes = 0;
    
    for (const { pattern, replacement, description, maxMatches } of SPECIFIC_PATTERNS) {
      let matches = 0;
      
      modifiedContent = modifiedContent.replace(pattern, (match, ...groups) => {
        if (matches >= maxMatches) return match;
        matches++;
        totalFixes++;
        console.log(`✅ ${description}: ${matches}/${maxMatches}`);
        
        // Handle dynamic replacements with captured groups
        let finalReplacement = replacement;
        groups.forEach((group, index) => {
          if (group !== undefined) {
            finalReplacement = finalReplacement.replace(new RegExp(`\\$${index + 1}`, 'g'), group);
          }
        });
        
        return finalReplacement;
      });
      
      if (matches === 0) {
        console.log(`   No matches found for: ${description}`);
      }
    }
    
    console.log(`\n📊 SUMMARY: ${totalFixes} fixes applied to ${TARGET_FILE}`);
    
    if (DRY_RUN) {
      console.log(`\n🧪 DRY RUN - Changes not applied`);
      if (totalFixes > 0) {
        console.log(`Preview of changes would be applied to the file`);
      }
    } else {
      await fs.writeFile(TARGET_FILE, modifiedContent, 'utf-8');
      console.log(`\n✅ APPLIED - Run 'yarn build' to verify`);
    }
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
}

fixTargetFile(); 