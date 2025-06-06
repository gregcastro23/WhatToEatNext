#!/usr/bin/env node

/**
 * TARGETED SYNTAX FIX FOR PLANETARY FLAVOR PROFILES
 * Target: src/data/planetaryFlavorProfiles.ts (3 errors)
 * Patterns: Malformed property access expressions in three locations
 * Methodology: Single-file, limited patterns, immediate verification
 */

import { promises as fs } from 'fs';

const TARGET_FILE = 'src/data/planetaryFlavorProfiles.ts'; // NEVER multiple files
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 3;

// SPECIFIC patterns only - exact matches to avoid corruption
const SPECIFIC_PATTERNS = [
  {
    pattern: /planetaryFlavorProfiles\[planet\]\.\(flavorProfiles\)\?\s+\|\|\s+\[\]/g,
    replacement: "planetaryFlavorProfiles[planet].flavorProfiles || []",
    description: 'Fix malformed property access with flavorProfiles',
    maxMatches: 1
  },
  {
    pattern: /planetaryFlavorProfiles\[planet\]\.\(culinaryAffinity\s+\|\|\s+\[\]\)/g,
    replacement: "planetaryFlavorProfiles[planet].culinaryAffinity || []",
    description: 'Fix malformed property access with culinaryAffinity',
    maxMatches: 1
  },
  {
    pattern: /planetData\.\(elementalInfluence\)\?\s+\|\|\s+\[\]/g,
    replacement: "planetData.elementalInfluence || []",
    description: 'Fix malformed property access with elementalInfluence',
    maxMatches: 1
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