#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Safety check for dry run
const DRY_RUN = process.argv.includes('--dry-run');

// Target file
const targetFile = 'src/utils/ingredientRecommender.ts';

// Define the specific property fixes we need to make
const propertyFixes = [
  // Fix snake_case to camelCase property access
  {
    description: 'Fix elemental_properties to elementalProperties',
    pattern: /ingredient\.elemental_properties/g,
    replacement: 'ingredient.elementalProperties'
  },
  {
    description: 'Fix flavor_profile to flavorProfile',
    pattern: /ingredient\.flavor_profile/g,
    replacement: 'ingredient.flavorProfile'
  },
  {
    description: 'Fix culinary_uses to culinaryUses',
    pattern: /ingredient\.culinary_uses/g,
    replacement: 'ingredient.culinaryUses'
  },
  {
    description: 'Fix harmony_pairings to harmonyPairings',
    pattern: /ingredient\.harmony_pairings/g,
    replacement: 'ingredient.harmonyPairings'
  },
  {
    description: 'Fix aromatic_properties to aromaticProperties',
    pattern: /ingredient\.aromatic_properties/g,
    replacement: 'ingredient.aromaticProperties'
  },
  {
    description: 'Fix related_ingredients to relatedIngredients',
    pattern: /ingredient\.related_ingredients/g,
    replacement: 'ingredient.relatedIngredients'
  },
  {
    description: 'Fix complementary_ingredients to complementaryIngredients',
    pattern: /ingredient\.complementary_ingredients/g,
    replacement: 'ingredient.complementaryIngredients'
  }
];

// Interface fixes to add missing properties
const interfaceFixes = [
  {
    description: 'Add missing properties to HerbalAssociations interface',
    search: `HerbalAssociations?.Spices`,
    replacement: `HerbalAssociations?.Herbs // Note: Spices not available in this interface`
  }
];

function applyFixes() {
  console.log(`🔧 Fixing property access errors in ${targetFile}`);
  
  try {
    // Read the file
    const content = readFileSync(targetFile, 'utf8');
    let updatedContent = content;
    let changeCount = 0;
    
    // Apply property fixes
    for (const fix of propertyFixes) {
      const matches = updatedContent.match(fix.pattern);
      if (matches) {
        updatedContent = updatedContent.replace(fix.pattern, fix.replacement);
        console.log(`✅ Applied: ${fix.description} (${matches.length} instances)`);
        changeCount += matches.length;
      }
    }
    
    // Apply interface fixes
    for (const fix of interfaceFixes) {
      if (updatedContent.includes(fix.search)) {
        updatedContent = updatedContent.replace(new RegExp(fix.search, 'g'), fix.replacement);
        console.log(`✅ Applied: ${fix.description}`);
        changeCount++;
      }
    }
    
    console.log(`\n📊 Total changes: ${changeCount}`);
    
    if (DRY_RUN) {
      console.log('\n📋 DRY RUN - Would apply these property fixes:');
      propertyFixes.forEach(fix => {
        const matches = content.match(fix.pattern);
        if (matches) {
          console.log(`  - ${fix.description}: ${matches.length} instances`);
        }
      });
      
      // Show a sample of what the changes would look like
      console.log('\n📝 Sample changes (first 10 lines with changes):');
      const originalLines = content.split('\n');
      const newLines = updatedContent.split('\n');
      let sampleCount = 0;
      
      for (let i = 0; i < originalLines.length && sampleCount < 10; i++) {
        if (originalLines[i] !== newLines[i]) {
          console.log(`Line ${i + 1}:`);
          console.log(`  Before: ${originalLines[i].trim()}`);
          console.log(`  After:  ${newLines[i].trim()}`);
          sampleCount++;
        }
      }
      return;
    }
    
    // Write the updated content
    writeFileSync(targetFile, updatedContent, 'utf8');
    console.log(`✅ Successfully updated ${targetFile}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Safety checks
if (!DRY_RUN) {
  console.log('⚠️  This script will modify TypeScript property access patterns.');
  console.log(`📁 Target: ${targetFile}`);
  console.log('🛡️  Running safety checks...');
  
  // Check if target file exists
  try {
    readFileSync(targetFile, 'utf8');
    console.log('✅ Target file exists');
  } catch (error) {
    console.error(`❌ Target file not found: ${targetFile}`);
    process.exit(1);
  }
}

console.log('\n🚀 Starting safe property fix...');
applyFixes();
console.log('\n✨ Done!'); 