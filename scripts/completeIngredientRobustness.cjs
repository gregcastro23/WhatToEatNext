#!/usr/bin/env node

/**
 * Complete Ingredient Robustness Script
 *
 * This script adds missing recommended fields to all ingredients to ensure
 * complete robustness for downstream calculations.
 *
 * Usage: node scripts/completeIngredientRobustness.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files and their missing ingredients (from validation report)
const FIXES_NEEDED = [
  {
    file: 'src/data/ingredients/fruits/stoneFruit.ts',
    ingredients: ['cherry', 'nectarine', 'greengage', 'damson'],
    missingField: 'astrologicalProfile',
    profile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  {
    file: 'src/data/ingredients/grains/wholeGrains.ts',
    ingredients: ['einkorn', 'rye_berries', 'wild_rice', 'triticale'],
    missingField: 'astrologicalProfile',
    profile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    }
  },
  {
    file: 'src/data/ingredients/herbs/aromatic.ts',
    ingredients: ['thyme', 'rosemary', 'oregano', 'basil', 'parsley', 'cilantro', 'dill', 'tarragon', 'marjoram', 'sage', 'mint', 'chives', 'bay_leaf', 'fennel', 'lavender', 'lemon_balm'],
    missingField: 'qualities',
    addQualities: true // Special handling
  }
];

/**
 * Add astrologicalProfile to an ingredient in file
 */
function addAstrologicalProfile(filePath, ingredientKey, profile) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the ingredient
  const ingredientPattern = new RegExp(`(\\s{2}${ingredientKey}:\\s*{[\\s\\S]*?elementalProperties:\\s*{[^}]+})(,?)([\\s\\S]*?)(\\n\\s{2}\\w+:|\\n};)`, 'm');
  const match = content.match(ingredientPattern);

  if (!match) {
    console.log(`  ⚠ Could not find ${ingredientKey} in ${path.basename(filePath)}`);
    return false;
  }

  // Check if already has astrologicalProfile
  const beforeNext = match[3];
  if (beforeNext.includes('astrologicalProfile:')) {
    console.log(`  ℹ ${ingredientKey} already has astrologicalProfile`);
    return false;
  }

  // Format the profile
  const profileCode = `
    astrologicalProfile: {
      rulingPlanets: [${profile.rulingPlanets.map(p => `'${p}'`).join(', ')}],
      favorableZodiac: [${profile.favorableZodiac.map(z => `'${z}'`).join(', ')}]${profile.seasonalAffinity ? `,
      seasonalAffinity: [${profile.seasonalAffinity.map(s => `'${s}'`).join(', ')}]` : ''}
    },`;

  // Insert after elementalProperties
  const replacement = match[1] + ',' + profileCode + match[3] + match[4];
  content = content.replace(ingredientPattern, replacement);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ Added astrologicalProfile to ${ingredientKey}`);
  return true;
}

/**
 * Add qualities to an ingredient in file
 */
function addQualities(filePath, ingredientKey) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the ingredient
  const ingredientPattern = new RegExp(`(\\s{2}${ingredientKey}:\\s*{[\\s\\S]*?elementalProperties:\\s*{[^}]+})(,?)([\\s\\S]*?)(\\n\\s{2}\\w+:|\\n};)`, 'm');
  const match = content.match(ingredientPattern);

  if (!match) {
    console.log(`  ⚠ Could not find ${ingredientKey} in ${path.basename(filePath)}`);
    return false;
  }

  // Check if already has qualities
  const beforeNext = match[3];
  if (beforeNext.includes('qualities:')) {
    return false; // Already has it
  }

  // Default herb qualities
  const qualitiesCode = `
    qualities: ['aromatic', 'fresh', 'culinary'],`;

  // Insert after elementalProperties
  const replacement = match[1] + ',' + qualitiesCode + match[3] + match[4];
  content = content.replace(ingredientPattern, replacement);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ Added qualities to ${ingredientKey}`);
  return true;
}

/**
 * Process all fixes
 */
function processFixes() {
  let totalFixed = 0;
  let totalAttempted = 0;

  for (const fix of FIXES_NEEDED) {
    const filePath = path.join(__dirname, '..', fix.file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }

    console.log(`\n📝 Processing ${path.basename(fix.file)}...`);

    for (const ingredient of fix.ingredients) {
      totalAttempted++;

      if (fix.addQualities) {
        const added = addQualities(filePath, ingredient);
        if (added) totalFixed++;
      } else if (fix.missingField === 'astrologicalProfile') {
        const added = addAstrologicalProfile(filePath, ingredient, fix.profile);
        if (added) totalFixed++;
      }
    }
  }

  return { totalFixed, totalAttempted };
}

// Run script
console.log('🔧 Completing ingredient robustness...\n');
console.log('='.repeat(80));

const { totalFixed, totalAttempted } = processFixes();

console.log('\n' + '='.repeat(80));
console.log('COMPLETION SUMMARY');
console.log('='.repeat(80));
console.log(`Ingredients Attempted: ${totalAttempted}`);
console.log(`Fields Added:          ${totalFixed}`);
console.log('='.repeat(80) + '\n');

if (totalFixed > 0) {
  console.log('✅ Successfully completed ingredient robustness improvements.');
  console.log('   Run validation script to verify.\n');
}

process.exit(0);
