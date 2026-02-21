#!/usr/bin/env node

/**
 * Merge Cuisine Ingredients into Existing Database
 *
 * This script:
 * 1. Reads the newly generated category files
 * 2. Merges ingredients into existing category files
 * 3. Preserves existing ingredient definitions
 * 4. Adds new ingredients from cuisine files
 *
 * Usage: node mergeCuisineIngredients.cjs
 */

const fs = require('fs');
const path = require('path');

// Directories
const INGREDIENTS_DIR = path.join(__dirname, 'src', 'data', 'ingredients');

// Category file mappings (generated -> existing)
const CATEGORY_MAPPING = {
  'grains/grains.ts': 'grains/wholeGrains.ts', // Merge grains into wholeGrains
  'misc/misc.ts': 'misc/misc.ts', // Keep as is
  'vegetables/vegetables.ts': 'vegetables/otherVegetables.ts', // Merge into otherVegetables
  'spices/spices.ts': 'spices/wholespices.ts', // Merge into wholespices
  'dairy/dairy.ts': 'proteins/dairy.ts', // Merge into existing dairy
  'proteins/proteins.ts': 'proteins/plantBased.ts', // Merge into plantBased
  'fruits/fruits.ts': 'fruits/berries.ts', // Merge into berries (generic fruits)
  'herbs/herbs.ts': 'herbs/freshHerbs.ts', // Merge into freshHerbs
  'beverages/beverages.ts': 'beverages/beverages.ts', // Keep as is
  'oils/oils.ts': 'oils/oils.ts' // Keep as is (merge into existing)
};

/**
 * Parse generated ingredient file
 */
function parseGeneratedFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ingredients = {};

  // Extract ingredient objects
  const ingredientPattern = /(\w+):\s*\{([\s\S]*?)\n\s{2}\},?/g;

  let match;
  while ((match = ingredientPattern.exec(content)) !== null) {
    const key = match[1];
    const objContent = match[2];

    // Extract basic properties
    const nameMatch = objContent.match(/name:\s*['"](.*?)['"]/);
    const elementalMatch = objContent.match(/elementalProperties:\s*\{([^}]+)\}/);
    const qualitiesMatch = objContent.match(/qualities:\s*\[([^\]]+)\]/);
    const categoryMatch = objContent.match(/category:\s*['"](.*?)['"]/);
    const astrologyMatch = objContent.match(/astrologicalProfile:\s*\{([\s\S]*?)\}/);

    if (nameMatch) {
      ingredients[key] = {
        name: nameMatch[1],
        elementalProperties: elementalMatch ? parseElementalProperties(elementalMatch[1]) : null,
        qualities: qualitiesMatch ? parseQualities(qualitiesMatch[1]) : [],
        category: categoryMatch ? categoryMatch[1] : 'misc',
        astrologicalProfile: astrologyMatch ? parseAstrologicalProfile(astrologyMatch[1]) : null
      };
    }
  }

  return ingredients;
}

/**
 * Parse elemental properties
 */
function parseElementalProperties(str) {
  const match = str.match(/Fire:\s*([\d.]+),\s*Water:\s*([\d.]+),\s*Earth:\s*([\d.]+),\s*Air:\s*([\d.]+)/);
  if (!match) return null;

  return {
    Fire: parseFloat(match[1]),
    Water: parseFloat(match[2]),
    Earth: parseFloat(match[3]),
    Air: parseFloat(match[4])
  };
}

/**
 * Parse qualities array
 */
function parseQualities(str) {
  return str.split(',').map(s => s.trim().replace(/['"]/g, '')).filter(s => s);
}

/**
 * Parse astrological profile
 */
function parseAstrologicalProfile(str) {
  const rulingMatch = str.match(/rulingPlanets:\s*\[([^\]]+)\]/);
  const zodiacMatch = str.match(/favorableZodiac:\s*\[([^\]]+)\]/);
  const seasonMatch = str.match(/seasonalAffinity:\s*\[([^\]]+)\]/);

  return {
    rulingPlanets: rulingMatch ? rulingMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : [],
    favorableZodiac: zodiacMatch ? zodiacMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : [],
    seasonalAffinity: seasonMatch ? seasonMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : []
  };
}

/**
 * Merge ingredients into existing file
 */
function mergeIntoExistingFile(existingFilePath, newIngredients) {
  if (!fs.existsSync(existingFilePath)) {
    console.log(`⚠️  Target file not found: ${existingFilePath}`);
    return 0;
  }

  let content = fs.readFileSync(existingFilePath, 'utf-8');
  let added = 0;

  // Find the raw* object
  const rawPattern = /(const\s+raw\w+\s*=\s*\{)([\s\S]*?)(\n};)/;
  const match = content.match(rawPattern);

  if (!match) {
    console.log(`⚠️  Could not find raw object in ${existingFilePath}`);
    return 0;
  }

  const beforeObj = match[1];
  const objContent = match[2];
  const afterObj = match[3];

  // Check which ingredients are already present
  const existingKeys = new Set();
  const keyPattern = /^\s{2}(\w+):\s*\{/gm;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(objContent)) !== null) {
    existingKeys.add(keyMatch[1]);
  }

  // Add new ingredients
  let newContent = objContent;
  for (const [key, ingredient] of Object.entries(newIngredients)) {
    if (!existingKeys.has(key)) {
      const ingredientStr = formatIngredient(key, ingredient);
      newContent += ingredientStr;
      added++;
      console.log(`  ✓ Added ${key} to ${path.basename(existingFilePath)}`);
    }
  }

  // Update file
  content = content.replace(rawPattern, beforeObj + newContent + afterObj);
  fs.writeFileSync(existingFilePath, content, 'utf-8');

  return added;
}

/**
 * Format ingredient for insertion
 */
function formatIngredient(key, ingredient) {
  return `
  ${key}: {
    name: '${ingredient.name}',
    elementalProperties: { Fire: ${ingredient.elementalProperties.Fire}, Water: ${ingredient.elementalProperties.Water}, Earth: ${ingredient.elementalProperties.Earth}, Air: ${ingredient.elementalProperties.Air} },
    qualities: [${ingredient.qualities.map(q => `'${q}'`).join(', ')}],
    category: '${ingredient.category}',
    astrologicalProfile: {
      rulingPlanets: [${ingredient.astrologicalProfile.rulingPlanets.map(p => `'${p}'`).join(', ')}],
      favorableZodiac: [${ingredient.astrologicalProfile.favorableZodiac.map(z => `'${z}'`).join(', ')}],
      seasonalAffinity: [${ingredient.astrologicalProfile.seasonalAffinity.map(s => `'${s}'`).join(', ')}]
    }
  },`;
}

/**
 * Main execution
 */
function main() {
  console.log('🔀 Merging cuisine ingredients into existing database...\n');

  let totalMerged = 0;
  let totalSkipped = 0;

  for (const [generatedPath, targetPath] of Object.entries(CATEGORY_MAPPING)) {
    const generatedFile = path.join(INGREDIENTS_DIR, generatedPath);
    const targetFile = path.join(INGREDIENTS_DIR, targetPath);

    if (!fs.existsSync(generatedFile)) {
      console.log(`⚠️  Generated file not found: ${generatedFile}`);
      continue;
    }

    console.log(`📝 Processing ${generatedPath} → ${targetPath}`);

    // Parse generated ingredients
    const newIngredients = parseGeneratedFile(generatedFile);
    console.log(`  Found ${Object.keys(newIngredients).length} ingredients to merge`);

    // Merge into existing file
    const added = mergeIntoExistingFile(targetFile, newIngredients);
    totalMerged += added;
    totalSkipped += Object.keys(newIngredients).length - added;

    console.log(`  Added ${added} new ingredients\n`);
  }

  // Summary
  console.log('='.repeat(80));
  console.log('MERGE COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total ingredients merged: ${totalMerged}`);
  console.log(`Ingredients already existed: ${totalSkipped}`);
  console.log(`Category files updated: ${Object.keys(CATEGORY_MAPPING).length}`);
  console.log('='.repeat(80));

  console.log('\n✅ Cuisine ingredients successfully integrated!');
  console.log('   Run validation to verify the expanded database.');
}

// Run merge
main();
