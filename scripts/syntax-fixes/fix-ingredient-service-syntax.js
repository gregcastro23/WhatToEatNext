#!/usr/bin/env node

/**
 * CRITICAL SYNTAX FIX FOR IngredientService.ts
 * Target: src/services/IngredientService.ts (241 errors)
 * Patterns: 4 specific build-blocking syntax corruptions
 * Methodology: Single-file, limited patterns, immediate verification
 */

import { promises as fs } from 'fs';
import path from 'path';

const TARGET_FILE = 'src/services/IngredientService.ts';
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 3;

// SPECIFIC patterns only - exact matches to avoid corruption
const SPECIFIC_PATTERNS = [
  {
    pattern: /safeSome\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\], tags\) === 'dAiry'\)\)/g,
    replacement: "safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag => tag === 'dAiry'))",
    description: 'Fix malformed dAiry filter conditional',
    maxMatches: 1
  },
  {
    pattern: /safeSome\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\], \(Array\.isArray\(tags\)\?\) \? tags\)\?\.includes\(normalizedQuery\) : tags\)\? === normalizedQuery\)/g,
    replacement: "safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag => tag?.includes(normalizedQuery))",
    description: 'Fix corrupted search filter tags conditional',
    maxMatches: 1
  },
  {
    pattern: /\(Array\.isArray\(!normalizedExclusions\) \? !normalizedExclusions\.includes\(ingredient\.name\?\.toLowerCase\( : !normalizedExclusions === ingredient\.name\?\.toLowerCase\(\)\?\.trim\(\)\)/g,
    replacement: "!normalizedExclusions.includes(ingredient.name?.toLowerCase()?.trim())",
    description: 'Fix corrupted exclusion filter conditional',
    maxMatches: 1
  },
  {
    pattern: /categories\?\.slice\(0, \(categoryCount\)\? \|\| \[\]\)/g,
    replacement: "categories?.slice(0, categoryCount)",
    description: 'Fix corrupted categories slice operation',
    maxMatches: 1
  }
];

async function fixIngredientServiceSyntax() {
  console.log(`🎯 TARGETED FIX: ${TARGET_FILE}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  
  try {
    // Read the target file
    const content = await fs.readFile(TARGET_FILE, 'utf-8');
    let modifiedContent = content;
    let totalFixes = 0;
    
    // Apply each specific pattern
    for (const { pattern, replacement, description, maxMatches } of SPECIFIC_PATTERNS) {
      let matches = 0;
      const beforeContent = modifiedContent;
      
      modifiedContent = modifiedContent.replace(pattern, (match) => {
        if (matches >= maxMatches) return match;
        matches++;
        totalFixes++;
        console.log(`✅ ${description}: ${matches}/${maxMatches}`);
        return replacement;
      });
      
      if (matches > 0) {
        console.log(`   Fixed ${matches} occurrence(s)`);
      } else {
        console.log(`   No matches found for: ${description}`);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total fixes applied: ${totalFixes}`);
    console.log(`   File: ${TARGET_FILE}`);
    
    if (totalFixes === 0) {
      console.log(`⚠️  No patterns matched - file may already be fixed or patterns need adjustment`);
      return;
    }
    
    if (DRY_RUN) {
      console.log(`\n🧪 DRY RUN - Changes not applied`);
      console.log(`Run without --dry-run to apply changes`);
    } else {
      // Write the fixed content
      await fs.writeFile(TARGET_FILE, modifiedContent, 'utf-8');
      console.log(`\n✅ APPLIED - Changes written to ${TARGET_FILE}`);
      console.log(`🔄 Next: Run 'yarn build' to verify fixes`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${TARGET_FILE}:`, error.message);
    process.exit(1);
  }
}

// SAFETY CHECK: Ensure we're targeting only one specific file
if (TARGET_FILE !== 'src/services/IngredientService.ts') {
  console.error('❌ SAFETY CHECK FAILED: Incorrect target file');
  process.exit(1);
}

fixIngredientServiceSyntax(); 