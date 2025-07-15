#!/usr/bin/env node

/**
 * TARGETED SYNTAX FIX FOR LocalRecipeService.ts
 * Target: src/services/LocalRecipeService.ts (multiple template literal and object literal errors)
 * Patterns: 5 specific build-blocking syntax corruptions
 * Methodology: Single-file, limited patterns, immediate verification
 */

import { promises as fs } from 'fs';

const TARGET_FILE = 'src/services/LocalRecipeService.ts';
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 3;

// SPECIFIC patterns only - exact matches to avoid corruption
const SPECIFIC_PATTERNS = [
  {
    pattern: /console\.log\(`Found \$\{\(\(cuisine\?\.\w+\?\.\[\w+\]\?\.\w+ \|\| \[\]\)\.length\} \$\{\w+\} recipes \nin 'all' season for \$\{cuisine\.name\}`\);/g,
    replacement: "console.log(`Found ${((cuisine?.dishes?.[mealType]?.all || []).length} ${mealType} recipes in 'all' season for ${cuisine.name}`);",
    description: 'Fix broken template literal in console.log statement (line 329)',
    maxMatches: 1
  },
  {
    pattern: /console\.log\(`Found \(\$\{\(seasonRecipes\s+\|\| \[\]\)\.length\} dishes for \$\{season\} in \$\{mealType\}`\);/g,
    replacement: "console.log(`Found (${(seasonRecipes || []).length} dishes for ${season} in ${mealType}`);",
    description: 'Fix broken template literal with missing closing backtick (around line 367)',
    maxMatches: 1
  },
  {
    pattern: /let elementalProperties = dish\.elementalState \|\| dish\.elementalState \|\| \{ Fire: 0\.25, Water: 0\.25, Earth: 0\.25, Air: 0\.25$/m,
    replacement: "let elementalProperties = dish.elementalState || dish.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };",
    description: 'Fix missing closing brace in elementalProperties object literal',
    maxMatches: 1
  },
  {
    pattern: /elementalProperties = \{ Fire: typeof elementalProperties\.Fire === 'number' \? elementalProperties\.Fire : 0\.25, Water: typeof elementalProperties\.Water === 'number' \? elementalProperties\.Water : 0\.25, Earth: typeof elementalProperties\.Earth === 'number' \? elementalProperties\.Earth : 0\.25, Air: typeof elementalProperties\.Air === 'number' \? elementalProperties\.Air : 0\.25$/m,
    replacement: "elementalProperties = { Fire: typeof elementalProperties.Fire === 'number' ? elementalProperties.Fire : 0.25, Water: typeof elementalProperties.Water === 'number' ? elementalProperties.Water : 0.25, Earth: typeof elementalProperties.Earth === 'number' ? elementalProperties.Earth : 0.25, Air: typeof elementalProperties.Air === 'number' ? elementalProperties.Air : 0.25 };",
    description: 'Fix missing closing brace in elementalProperties assignment',
    maxMatches: 1
  },
  {
    pattern: /Object\.entries\(dish\.\(substitutions\)\?\s+\|\| \[\]\)/g,
    replacement: "Object.entries(dish.substitutions || [])",
    description: 'Fix malformed property access dish.(substitutions)',
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
      const beforeLength = modifiedContent.length;
      
      modifiedContent = modifiedContent.replace(pattern, (match) => {
        if (matches >= maxMatches) return match;
        matches++;
        totalFixes++;
        console.log(`✅ ${description}: ${matches}/${maxMatches}`);
        return replacement;
      });
      
      const afterLength = modifiedContent.length;
      
      if (matches === 0 && description.includes('line 329')) {
        // Special handling for the missing backtick issue
        const brokenPattern = /console\.log\(`Found \$\{[^`]*recipes[^`]*cuisine\.name\}`?\);/g;
        modifiedContent = modifiedContent.replace(brokenPattern, (match) => {
          if (!match.endsWith('`);')) {
            matches++;
            totalFixes++;
            console.log(`✅ ${description} (fallback pattern): ${matches}/${maxMatches}`);
            return match.replace(/`\);$/, '') + '`);';
          }
          return match;
        });
      }
      
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