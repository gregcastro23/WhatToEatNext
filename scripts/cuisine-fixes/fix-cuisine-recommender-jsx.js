#!/usr/bin/env node

/**
 * TARGETED SYNTAX FIX FOR CuisineRecommender.tsx
 * Target: src/components/CuisineRecommender.tsx (JSX syntax error)
 * Patterns: Specific JSX and object literal syntax corruptions
 * Methodology: Single-file, limited patterns, immediate verification
 */

import { promises as fs } from 'fs';

const TARGET_FILE = 'src/components/CuisineRecommender.tsx';
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 3;

// SPECIFIC patterns only - exact matches to avoid corruption
const SPECIFIC_PATTERNS = [
  {
    pattern: /dish\.isVegetarian \|\| dish\.\(Array\.isArray\(dietaryInfo\?\) \? dietaryInfo\?\.includes\('vegetarian'\)\s+: dietaryInfo\? === 'vegetarian'\) \|\| false/g,
    replacement: "dish.isVegetarian || (Array.isArray(dish.dietaryInfo) ? dish.dietaryInfo?.includes('vegetarian') : dish.dietaryInfo === 'vegetarian') || false",
    description: 'Fix malformed property access in isVegetarian check',
    maxMatches: 1
  },
  {
    pattern: /dish\.isVegan \|\| dish\.\(Array\.isArray\(dietaryInfo\?\) \? dietaryInfo\?\.includes\('vegan'\)\s+: dietaryInfo\? === 'vegan'\) \|\| false/g,
    replacement: "dish.isVegan || (Array.isArray(dish.dietaryInfo) ? dish.dietaryInfo?.includes('vegan') : dish.dietaryInfo === 'vegan') || false",
    description: 'Fix malformed property access in isVegan check',
    maxMatches: 1
  },
  {
    pattern: /dish\.isGlutenFree \|\| dish\.\(Array\.isArray\(dietaryInfo\?\) \? dietaryInfo\?\.includes\('gluten-free'\)\s+: dietaryInfo\? === 'gluten-free'\) \|\| false/g,
    replacement: "dish.isGlutenFree || (Array.isArray(dish.dietaryInfo) ? dish.dietaryInfo?.includes('gluten-free') : dish.dietaryInfo === 'gluten-free') || false",
    description: 'Fix malformed property access in isGlutenFree check',
    maxMatches: 1
  },
  {
    pattern: /dish\.isDAiryFree \|\| dish\.\(Array\.isArray\(dietaryInfo\?\) \? dietaryInfo\?\.includes\('dAiry-free'\)\s+: dietaryInfo\? === 'dAiry-free'\) \|\| false/g,
    replacement: "dish.isDAiryFree || (Array.isArray(dish.dietaryInfo) ? dish.dietaryInfo?.includes('dairy-free') : dish.dietaryInfo === 'dairy-free') || false",
    description: 'Fix malformed property access in isDAiryFree check',
    maxMatches: 1
  },
  {
    pattern: /elementalProperties: \{ Fire: 0\.25, Water: 0\.25, Earth: 0\.25, Air: 0\.25\s*\}/g,
    replacement: "elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }",
    description: 'Fix incomplete elementalProperties object literal',
    maxMatches: 3
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
      
      modifiedContent = modifiedContent.replace(pattern, (match) => {
        if (matches >= maxMatches) return match;
        matches++;
        totalFixes++;
        console.log(`✅ ${description}: ${matches}/${maxMatches}`);
        return replacement;
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