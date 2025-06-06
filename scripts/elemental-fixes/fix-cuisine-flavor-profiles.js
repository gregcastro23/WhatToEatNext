#!/usr/bin/env node

/**
 * TARGETED SYNTAX FIX FOR cuisineFlavorProfiles.ts
 * Target: src/data/cuisineFlavorProfiles.ts (179 errors)
 * Patterns: Malformed property access, const reassignment, array operation syntax
 * Methodology: Single-file, limited patterns, immediate verification
 */

import { promises as fs } from 'fs';

const TARGET_FILE = 'src/data/cuisineFlavorProfiles.ts';
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 10;

// SPECIFIC patterns only - exact matches to avoid corruption
const SPECIFIC_PATTERNS = [
  {
    pattern: /profile1\.\(flavorProfiles\)\?\s*\|\|\s*\[\]/g,
    replacement: "profile1.flavorProfiles || {}",
    description: 'Fix malformed property access profile1.(flavorProfiles)',
    maxMatches: 3
  },
  {
    pattern: /profile2\.\(Array\.isArray\(planetaryResonance\)\s*\?\s*planetaryResonance\.includes\(planet\)\s*:\s*planetaryResonance\s*===\s*planet\)/g,
    replacement: "Array.isArray(profile2.planetaryResonance) ? profile2.planetaryResonance.includes(planet) : profile2.planetaryResonance === planet",
    description: 'Fix malformed array access in planetary resonance check',
    maxMatches: 2
  },
  {
    pattern: /const flavorSimilarity = 0;[\s\S]*?flavorSimilarity \+=/g,
    replacement: "let flavorSimilarity = 0;\n  Object.entries(profile1.flavorProfiles || {}).forEach(([flavor, value1]) => {\n    const value2 =\n      profile2.flavorProfiles[flavor as keyof typeof profile2.flavorProfiles];\n    flavorSimilarity +=",
    description: 'Fix const reassignment for flavorSimilarity variable',
    maxMatches: 2
  },
  {
    pattern: /const similarityScore = 0;[\s\S]*?similarityScore \+=/g,
    replacement: "let similarityScore = 0;\n  let totalWeight = 0;\n\n  // Compare elemental properties (most important)\n  if (profile1.elementalAlignment && profile2.elementalAlignment) {\n    const elements = ['Fire', 'Water', 'Earth', 'Air'];\n    let elementalSimilarity = 0;\n\n    elements.forEach((element) => {\n      const val1 = profile1.elementalAlignment?.[element] || 0;\n      const val2 = profile2.elementalAlignment?.[element] || 0;\n\n      // Calculate similarity (1 minus the absolute difference)\n      elementalSimilarity += 1 - Math.abs(val1 - val2);\n    });\n\n    // Normalize and weight elemental similarity (60%)\n    similarityScore +=",
    description: 'Fix const reassignment for similarityScore variable',
    maxMatches: 1
  },
  {
    pattern: /const elementalSimilarity = 0;[\s\S]*?elementalSimilarity \+=/g,
    replacement: "let elementalSimilarity = 0;\n\n    elements.forEach((element) => {\n      const val1 = profile1.elementalAlignment?.[element] || 0;\n      const val2 = profile2.elementalAlignment?.[element] || 0;\n\n      // Calculate similarity (1 minus the absolute difference)\n      elementalSimilarity +=",
    description: 'Fix const reassignment for elementalSimilarity variable',
    maxMatches: 1
  },
  {
    pattern: /const flavorSimilarity = 0;[\s\S]*?flavors\s*\|\|\s*\[\]\.forEach/g,
    replacement: "let flavorSimilarity = 0;\n\n    flavors.forEach",
    description: 'Fix const reassignment for flavorSimilarity in flavor comparison',
    maxMatches: 1
  },
  {
    pattern: /regionalResults = \[\.\.\.regionalResults,/g,
    replacement: "regionalResults.push(",
    description: 'Fix array assignment to use push instead of spread reassignment',
    maxMatches: 1
  },
  {
    pattern: /\]\];/g,
    replacement: ");",
    description: 'Fix closing bracket for push method',
    maxMatches: 1
  },
  {
    pattern: /\?\?\s*\|\|\s*\[\]\.length/g,
    replacement: "?.length || 0",
    description: 'Fix malformed optional chaining with array length',
    maxMatches: 5
  },
  {
    pattern: /recipes\?\s*\|\|\s*\[\]\.length\s*\|\|\s*0/g,
    replacement: "recipes?.length || 0",
    description: 'Fix malformed recipes array length check',
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