#!/usr/bin/env node

/**
 * TypeScript Casing Fixer for Core Type Definitions
 * 
 * This script fixes casing mismatches in core type definitions, particularly
 * in calculation files where property names are accessed inconsistently.
 * 
 * It focuses on:
 * 1. AlchemicalProperties - standardize to lowercase (Spirit, Essence, Matter, Substance)
 * 2. ElementalProperties/ElementalValues - standardize to uppercase (Fire, Water, Earth, Air)
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the core files to fix
const FILES_TO_FIX = [
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/core/planetaryInfluences.ts',
  'src/calculations/culinary/cuisineRecommendations.ts',
  'src/calculations/culinary/recipeMatching.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix casing in a file
function fixCasingInFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // 1. Fix AlchemicalProperties inconsistencies
  // Properties should be lowercase (Spirit, Essence, Matter, Substance)
  
  // First, check if we're accessing the properties with capitalized names
  const alchemicalCapitalizedRegex = /properties\.(Spirit|Essence|Matter|Substance)/g;
  const alchemicalMatches = [...content.matchAll(alchemicalCapitalizedRegex)];
  
  if (alchemicalMatches.length > 0) {
    console.log(`Found ${alchemicalMatches.length} capitalized AlchemicalProperties references`);
    
    // Fix properties.Spirit -> properties.Spirit
    newContent = newContent.replace(/properties\.Spirit/g, (match) => {
      replacements++;
      return 'properties.Spirit';
    });
    
    // Fix properties.Essence -> properties.Essence
    newContent = newContent.replace(/properties\.Essence/g, (match) => {
      replacements++;
      return 'properties.Essence';
    });
    
    // Fix properties.Matter -> properties.Matter
    newContent = newContent.replace(/properties\.Matter/g, (match) => {
      replacements++;
      return 'properties.Matter';
    });
    
    // Fix properties.Substance -> properties.Substance
    newContent = newContent.replace(/properties\.Substance/g, (match) => {
      replacements++;
      return 'properties.Substance';
    });
    
    // Also fix direct variable references
    newContent = newContent.replace(/\bSpirit\b(?!:)/g, (match) => {
      replacements++;
      return 'Spirit';
    });
    
    newContent = newContent.replace(/\bEssence\b(?!:)/g, (match) => {
      replacements++;
      return 'Essence';
    });
    
    newContent = newContent.replace(/\bMatter\b(?!:)/g, (match) => {
      replacements++;
      return 'Matter';
    });
    
    newContent = newContent.replace(/\bSubstance\b(?!:)/g, (match) => {
      replacements++;
      return 'Substance';
    });
    
    // Fix mapping.Spirit, mapping.Essence, etc.
    newContent = newContent.replace(/mapping\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `mapping.${p1.toLowerCase()}`;
    });
    
    // Fix alchemicalProperties.Spirit, alchemicalProperties.Essence, etc.
    newContent = newContent.replace(/alchemicalProperties\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `alchemicalProperties.${p1.toLowerCase()}`;
    });
    
    // Fix recipeAlchemical.Spirit, userAlchemical.Spirit, etc.
    newContent = newContent.replace(/(recipeAlchemical|userAlchemical)\.(Spirit|Essence|Matter|Substance)/g, (match, p1, p2) => {
      replacements++;
      return `${p1}.${p2.toLowerCase()}`;
    });
  }
  
  // 2. Fix ElementalValues inconsistencies
  // Properties should be capitalized (Fire, Water, Earth, Air)
  
  // Check ElementalValues inconsistencies
  const elementalLowercaseRegex = /elements\.(4239Water#!/usr/bin/env node

/**
 * TypeScript Casing Fixer for Core Type Definitions
 * 
 * This script fixes casing mismatches in core type definitions, particularly
 * in calculation files where property names are accessed inconsistently.
 * 
 * It focuses on:
 * 1. AlchemicalProperties - standardize to lowercase (Spirit, Essence, Matter, Substance)
 * 2. ElementalProperties/ElementalValues - standardize to uppercase (Fire, Water, Earth, Air)
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the core files to fix
const FILES_TO_FIX = [
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/core/planetaryInfluences.ts',
  'src/calculations/culinary/cuisineRecommendations.ts',
  'src/calculations/culinary/recipeMatching.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix casing in a file
function fixCasingInFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // 1. Fix AlchemicalProperties inconsistencies
  // Properties should be lowercase (Spirit, Essence, Matter, Substance)
  
  // First, check if we're accessing the properties with capitalized names
  const alchemicalCapitalizedRegex = /properties\.(Spirit|Essence|Matter|Substance)/g;
  const alchemicalMatches = [...content.matchAll(alchemicalCapitalizedRegex)];
  
  if (alchemicalMatches.length > 0) {
    console.log(`Found ${alchemicalMatches.length} capitalized AlchemicalProperties references`);
    
    // Fix properties.Spirit -> properties.Spirit
    newContent = newContent.replace(/properties\.Spirit/g, (match) => {
      replacements++;
      return 'properties.Spirit';
    });
    
    // Fix properties.Essence -> properties.Essence
    newContent = newContent.replace(/properties\.Essence/g, (match) => {
      replacements++;
      return 'properties.Essence';
    });
    
    // Fix properties.Matter -> properties.Matter
    newContent = newContent.replace(/properties\.Matter/g, (match) => {
      replacements++;
      return 'properties.Matter';
    });
    
    // Fix properties.Substance -> properties.Substance
    newContent = newContent.replace(/properties\.Substance/g, (match) => {
      replacements++;
      return 'properties.Substance';
    });
    
    // Also fix direct variable references
    newContent = newContent.replace(/\bSpirit\b(?!:)/g, (match) => {
      replacements++;
      return 'Spirit';
    });
    
    newContent = newContent.replace(/\bEssence\b(?!:)/g, (match) => {
      replacements++;
      return 'Essence';
    });
    
    newContent = newContent.replace(/\bMatter\b(?!:)/g, (match) => {
      replacements++;
      return 'Matter';
    });
    
    newContent = newContent.replace(/\bSubstance\b(?!:)/g, (match) => {
      replacements++;
      return 'Substance';
    });
    
    // Fix mapping.Spirit, mapping.Essence, etc.
    newContent = newContent.replace(/mapping\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `mapping.${p1.toLowerCase()}`;
    });
    
    // Fix alchemicalProperties.Spirit, alchemicalProperties.Essence, etc.
    newContent = newContent.replace(/alchemicalProperties\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `alchemicalProperties.${p1.toLowerCase()}`;
    });
    
    // Fix recipeAlchemical.Spirit, userAlchemical.Spirit, etc.
    newContent = newContent.replace(/(recipeAlchemical|userAlchemical)\.(Spirit|Essence|Matter|Substance)/g, (match, p1, p2) => {
      replacements++;
      return `${p1}.${p2.toLowerCase()}`;
    });
  }
  
  // 2. Fix ElementalValues inconsistencies
  // Properties should be capitalized (Fire, Water, Earth, Air)
  
  // Check ElementalValues inconsistencies
  const elementalLowercaseRegex = /elements\.(water|Air|earth)(?!\s*=)/g;
  const elementalMatches = [...content.matchAll(elementalLowercaseRegex)];
  
  if (elementalMatches.length > 0) {
    console.log(`Found ${elementalMatches.length} lowercase ElementalValues references`);
    
    // Fix elements.Water -> elements.Water
    newContent = newContent.replace(/elements\.Water/g, (match) => {
      replacements++;
      return 'elements.Water';
    });
    
    // Fix elements.Air -> elements.Air
    newContent = newContent.replace(/elements\.Air/g, (match) => {
      replacements++;
      return 'elements.Air';
    });
    
    // Fix elements.Earth -> elements.Earth
    newContent = newContent.replace(/elements\.Earth/g, (match) => {
      replacements++;
      return 'elements.Earth';
    });
    
    // Fix elementalValues.Water -> elementalValues.Water
    newContent = newContent.replace(/elementalValues\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `elementalValues.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix userElements.Water -> userElements.Water
    newContent = newContent.replace(/userElements\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `userElements.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix normalizedUser.Water -> normalizedUser.Water
    newContent = newContent.replace(/normalizedUser\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `normalizedUser.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
  }
  
  // 3. Fix ElementalProperties object literals
  
  // Fix object literals like { Fire: 0, Water: 0, Air: 0, Earth: 0 }
  newContent = newContent.replace(/\{\s*Fire\s*:\s*([^,}]+),\s*Water\s*:\s*([^,}]+),\s*Air\s*:\s*([^,}]+),\s*earth\s*:\s*([^,}]+)\s*\}/g, (match, fireval, waterval, Airval, earthval) => {
    replacements++;
    return `{ Fire: ${fireval}, Water: ${waterval}, Air: ${Airval}, Earth: ${earthval} }`;
  });
  
  // 4. Fix Zodiac sign reference types (should be lowercase)
  
  // Fix type mismatches with zodiac signs
  newContent = newContent.replace(/aries:\s*'Fire'/g, (match) => {
    replacements++;
    return "aries: 'Fire'";
  });
  
  newContent = newContent.replace(/leo:\s*'Fire'/g, (match) => {
    replacements++;
    return "leo: 'Fire'";
  });
  
  newContent = newContent.replace(/sagittarius:\s*'Fire'/g, (match) => {
    replacements++;
    return "sagittarius: 'Fire'";
  });
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing core type definitions casing issues...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixCasingInFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air|earth)(?!\s*=)/g;
  const elementalMatches = [...content.matchAll(elementalLowercaseRegex)];
  
  if (elementalMatches.length > 0) {
    console.log(`Found ${elementalMatches.length} lowercase ElementalValues references`);
    
    // Fix elements.Water -> elements.Water
    newContent = newContent.replace(/elements\.Water/g, (match) => {
      replacements++;
      return 'elements.Water';
    });
    
    // Fix elements.Air -> elements.Air
    newContent = newContent.replace(/elements\.Air/g, (match) => {
      replacements++;
      return 'elements.Air';
    });
    
    // Fix elements.Earth -> elements.Earth
    newContent = newContent.replace(/elements\.Earth/g, (match) => {
      replacements++;
      return 'elements.Earth';
    });
    
    // Fix elementalValues.Water -> elementalValues.Water
    newContent = newContent.replace(/elementalValues\.(5119Water#!/usr/bin/env node

/**
 * TypeScript Casing Fixer for Core Type Definitions
 * 
 * This script fixes casing mismatches in core type definitions, particularly
 * in calculation files where property names are accessed inconsistently.
 * 
 * It focuses on:
 * 1. AlchemicalProperties - standardize to lowercase (Spirit, Essence, Matter, Substance)
 * 2. ElementalProperties/ElementalValues - standardize to uppercase (Fire, Water, Earth, Air)
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the core files to fix
const FILES_TO_FIX = [
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/core/planetaryInfluences.ts',
  'src/calculations/culinary/cuisineRecommendations.ts',
  'src/calculations/culinary/recipeMatching.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix casing in a file
function fixCasingInFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // 1. Fix AlchemicalProperties inconsistencies
  // Properties should be lowercase (Spirit, Essence, Matter, Substance)
  
  // First, check if we're accessing the properties with capitalized names
  const alchemicalCapitalizedRegex = /properties\.(Spirit|Essence|Matter|Substance)/g;
  const alchemicalMatches = [...content.matchAll(alchemicalCapitalizedRegex)];
  
  if (alchemicalMatches.length > 0) {
    console.log(`Found ${alchemicalMatches.length} capitalized AlchemicalProperties references`);
    
    // Fix properties.Spirit -> properties.Spirit
    newContent = newContent.replace(/properties\.Spirit/g, (match) => {
      replacements++;
      return 'properties.Spirit';
    });
    
    // Fix properties.Essence -> properties.Essence
    newContent = newContent.replace(/properties\.Essence/g, (match) => {
      replacements++;
      return 'properties.Essence';
    });
    
    // Fix properties.Matter -> properties.Matter
    newContent = newContent.replace(/properties\.Matter/g, (match) => {
      replacements++;
      return 'properties.Matter';
    });
    
    // Fix properties.Substance -> properties.Substance
    newContent = newContent.replace(/properties\.Substance/g, (match) => {
      replacements++;
      return 'properties.Substance';
    });
    
    // Also fix direct variable references
    newContent = newContent.replace(/\bSpirit\b(?!:)/g, (match) => {
      replacements++;
      return 'Spirit';
    });
    
    newContent = newContent.replace(/\bEssence\b(?!:)/g, (match) => {
      replacements++;
      return 'Essence';
    });
    
    newContent = newContent.replace(/\bMatter\b(?!:)/g, (match) => {
      replacements++;
      return 'Matter';
    });
    
    newContent = newContent.replace(/\bSubstance\b(?!:)/g, (match) => {
      replacements++;
      return 'Substance';
    });
    
    // Fix mapping.Spirit, mapping.Essence, etc.
    newContent = newContent.replace(/mapping\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `mapping.${p1.toLowerCase()}`;
    });
    
    // Fix alchemicalProperties.Spirit, alchemicalProperties.Essence, etc.
    newContent = newContent.replace(/alchemicalProperties\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `alchemicalProperties.${p1.toLowerCase()}`;
    });
    
    // Fix recipeAlchemical.Spirit, userAlchemical.Spirit, etc.
    newContent = newContent.replace(/(recipeAlchemical|userAlchemical)\.(Spirit|Essence|Matter|Substance)/g, (match, p1, p2) => {
      replacements++;
      return `${p1}.${p2.toLowerCase()}`;
    });
  }
  
  // 2. Fix ElementalValues inconsistencies
  // Properties should be capitalized (Fire, Water, Earth, Air)
  
  // Check ElementalValues inconsistencies
  const elementalLowercaseRegex = /elements\.(water|Air|earth)(?!\s*=)/g;
  const elementalMatches = [...content.matchAll(elementalLowercaseRegex)];
  
  if (elementalMatches.length > 0) {
    console.log(`Found ${elementalMatches.length} lowercase ElementalValues references`);
    
    // Fix elements.Water -> elements.Water
    newContent = newContent.replace(/elements\.Water/g, (match) => {
      replacements++;
      return 'elements.Water';
    });
    
    // Fix elements.Air -> elements.Air
    newContent = newContent.replace(/elements\.Air/g, (match) => {
      replacements++;
      return 'elements.Air';
    });
    
    // Fix elements.Earth -> elements.Earth
    newContent = newContent.replace(/elements\.Earth/g, (match) => {
      replacements++;
      return 'elements.Earth';
    });
    
    // Fix elementalValues.Water -> elementalValues.Water
    newContent = newContent.replace(/elementalValues\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `elementalValues.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix userElements.Water -> userElements.Water
    newContent = newContent.replace(/userElements\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `userElements.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix normalizedUser.Water -> normalizedUser.Water
    newContent = newContent.replace(/normalizedUser\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `normalizedUser.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
  }
  
  // 3. Fix ElementalProperties object literals
  
  // Fix object literals like { Fire: 0, Water: 0, Air: 0, Earth: 0 }
  newContent = newContent.replace(/\{\s*Fire\s*:\s*([^,}]+),\s*Water\s*:\s*([^,}]+),\s*Air\s*:\s*([^,}]+),\s*earth\s*:\s*([^,}]+)\s*\}/g, (match, fireval, waterval, Airval, earthval) => {
    replacements++;
    return `{ Fire: ${fireval}, Water: ${waterval}, Air: ${Airval}, Earth: ${earthval} }`;
  });
  
  // 4. Fix Zodiac sign reference types (should be lowercase)
  
  // Fix type mismatches with zodiac signs
  newContent = newContent.replace(/aries:\s*'Fire'/g, (match) => {
    replacements++;
    return "aries: 'Fire'";
  });
  
  newContent = newContent.replace(/leo:\s*'Fire'/g, (match) => {
    replacements++;
    return "leo: 'Fire'";
  });
  
  newContent = newContent.replace(/sagittarius:\s*'Fire'/g, (match) => {
    replacements++;
    return "sagittarius: 'Fire'";
  });
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing core type definitions casing issues...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixCasingInFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air|earth)/g, (match, p1) => {
      replacements++;
      return `elementalValues.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix userElements.Water -> userElements.Water
    newContent = newContent.replace(/userElements\.(5371Water#!/usr/bin/env node

/**
 * TypeScript Casing Fixer for Core Type Definitions
 * 
 * This script fixes casing mismatches in core type definitions, particularly
 * in calculation files where property names are accessed inconsistently.
 * 
 * It focuses on:
 * 1. AlchemicalProperties - standardize to lowercase (Spirit, Essence, Matter, Substance)
 * 2. ElementalProperties/ElementalValues - standardize to uppercase (Fire, Water, Earth, Air)
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the core files to fix
const FILES_TO_FIX = [
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/core/planetaryInfluences.ts',
  'src/calculations/culinary/cuisineRecommendations.ts',
  'src/calculations/culinary/recipeMatching.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix casing in a file
function fixCasingInFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // 1. Fix AlchemicalProperties inconsistencies
  // Properties should be lowercase (Spirit, Essence, Matter, Substance)
  
  // First, check if we're accessing the properties with capitalized names
  const alchemicalCapitalizedRegex = /properties\.(Spirit|Essence|Matter|Substance)/g;
  const alchemicalMatches = [...content.matchAll(alchemicalCapitalizedRegex)];
  
  if (alchemicalMatches.length > 0) {
    console.log(`Found ${alchemicalMatches.length} capitalized AlchemicalProperties references`);
    
    // Fix properties.Spirit -> properties.Spirit
    newContent = newContent.replace(/properties\.Spirit/g, (match) => {
      replacements++;
      return 'properties.Spirit';
    });
    
    // Fix properties.Essence -> properties.Essence
    newContent = newContent.replace(/properties\.Essence/g, (match) => {
      replacements++;
      return 'properties.Essence';
    });
    
    // Fix properties.Matter -> properties.Matter
    newContent = newContent.replace(/properties\.Matter/g, (match) => {
      replacements++;
      return 'properties.Matter';
    });
    
    // Fix properties.Substance -> properties.Substance
    newContent = newContent.replace(/properties\.Substance/g, (match) => {
      replacements++;
      return 'properties.Substance';
    });
    
    // Also fix direct variable references
    newContent = newContent.replace(/\bSpirit\b(?!:)/g, (match) => {
      replacements++;
      return 'Spirit';
    });
    
    newContent = newContent.replace(/\bEssence\b(?!:)/g, (match) => {
      replacements++;
      return 'Essence';
    });
    
    newContent = newContent.replace(/\bMatter\b(?!:)/g, (match) => {
      replacements++;
      return 'Matter';
    });
    
    newContent = newContent.replace(/\bSubstance\b(?!:)/g, (match) => {
      replacements++;
      return 'Substance';
    });
    
    // Fix mapping.Spirit, mapping.Essence, etc.
    newContent = newContent.replace(/mapping\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `mapping.${p1.toLowerCase()}`;
    });
    
    // Fix alchemicalProperties.Spirit, alchemicalProperties.Essence, etc.
    newContent = newContent.replace(/alchemicalProperties\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `alchemicalProperties.${p1.toLowerCase()}`;
    });
    
    // Fix recipeAlchemical.Spirit, userAlchemical.Spirit, etc.
    newContent = newContent.replace(/(recipeAlchemical|userAlchemical)\.(Spirit|Essence|Matter|Substance)/g, (match, p1, p2) => {
      replacements++;
      return `${p1}.${p2.toLowerCase()}`;
    });
  }
  
  // 2. Fix ElementalValues inconsistencies
  // Properties should be capitalized (Fire, Water, Earth, Air)
  
  // Check ElementalValues inconsistencies
  const elementalLowercaseRegex = /elements\.(water|Air|earth)(?!\s*=)/g;
  const elementalMatches = [...content.matchAll(elementalLowercaseRegex)];
  
  if (elementalMatches.length > 0) {
    console.log(`Found ${elementalMatches.length} lowercase ElementalValues references`);
    
    // Fix elements.Water -> elements.Water
    newContent = newContent.replace(/elements\.Water/g, (match) => {
      replacements++;
      return 'elements.Water';
    });
    
    // Fix elements.Air -> elements.Air
    newContent = newContent.replace(/elements\.Air/g, (match) => {
      replacements++;
      return 'elements.Air';
    });
    
    // Fix elements.Earth -> elements.Earth
    newContent = newContent.replace(/elements\.Earth/g, (match) => {
      replacements++;
      return 'elements.Earth';
    });
    
    // Fix elementalValues.Water -> elementalValues.Water
    newContent = newContent.replace(/elementalValues\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `elementalValues.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix userElements.Water -> userElements.Water
    newContent = newContent.replace(/userElements\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `userElements.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix normalizedUser.Water -> normalizedUser.Water
    newContent = newContent.replace(/normalizedUser\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `normalizedUser.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
  }
  
  // 3. Fix ElementalProperties object literals
  
  // Fix object literals like { Fire: 0, Water: 0, Air: 0, Earth: 0 }
  newContent = newContent.replace(/\{\s*Fire\s*:\s*([^,}]+),\s*Water\s*:\s*([^,}]+),\s*Air\s*:\s*([^,}]+),\s*earth\s*:\s*([^,}]+)\s*\}/g, (match, fireval, waterval, Airval, earthval) => {
    replacements++;
    return `{ Fire: ${fireval}, Water: ${waterval}, Air: ${Airval}, Earth: ${earthval} }`;
  });
  
  // 4. Fix Zodiac sign reference types (should be lowercase)
  
  // Fix type mismatches with zodiac signs
  newContent = newContent.replace(/aries:\s*'Fire'/g, (match) => {
    replacements++;
    return "aries: 'Fire'";
  });
  
  newContent = newContent.replace(/leo:\s*'Fire'/g, (match) => {
    replacements++;
    return "leo: 'Fire'";
  });
  
  newContent = newContent.replace(/sagittarius:\s*'Fire'/g, (match) => {
    replacements++;
    return "sagittarius: 'Fire'";
  });
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing core type definitions casing issues...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixCasingInFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air|earth)/g, (match, p1) => {
      replacements++;
      return `userElements.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix normalizedUser.Water -> normalizedUser.Water
    newContent = newContent.replace(/normalizedUser\.(5626Water#!/usr/bin/env node

/**
 * TypeScript Casing Fixer for Core Type Definitions
 * 
 * This script fixes casing mismatches in core type definitions, particularly
 * in calculation files where property names are accessed inconsistently.
 * 
 * It focuses on:
 * 1. AlchemicalProperties - standardize to lowercase (Spirit, Essence, Matter, Substance)
 * 2. ElementalProperties/ElementalValues - standardize to uppercase (Fire, Water, Earth, Air)
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the core files to fix
const FILES_TO_FIX = [
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/core/planetaryInfluences.ts',
  'src/calculations/culinary/cuisineRecommendations.ts',
  'src/calculations/culinary/recipeMatching.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n${message}:`);
  console.log(`- ${oldCode}`);
  console.log(`+ ${newCode}`);
}

// Main function to fix casing in a file
function fixCasingInFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  // Track number of replacements
  let replacements = 0;
  let newContent = content;
  
  // 1. Fix AlchemicalProperties inconsistencies
  // Properties should be lowercase (Spirit, Essence, Matter, Substance)
  
  // First, check if we're accessing the properties with capitalized names
  const alchemicalCapitalizedRegex = /properties\.(Spirit|Essence|Matter|Substance)/g;
  const alchemicalMatches = [...content.matchAll(alchemicalCapitalizedRegex)];
  
  if (alchemicalMatches.length > 0) {
    console.log(`Found ${alchemicalMatches.length} capitalized AlchemicalProperties references`);
    
    // Fix properties.Spirit -> properties.Spirit
    newContent = newContent.replace(/properties\.Spirit/g, (match) => {
      replacements++;
      return 'properties.Spirit';
    });
    
    // Fix properties.Essence -> properties.Essence
    newContent = newContent.replace(/properties\.Essence/g, (match) => {
      replacements++;
      return 'properties.Essence';
    });
    
    // Fix properties.Matter -> properties.Matter
    newContent = newContent.replace(/properties\.Matter/g, (match) => {
      replacements++;
      return 'properties.Matter';
    });
    
    // Fix properties.Substance -> properties.Substance
    newContent = newContent.replace(/properties\.Substance/g, (match) => {
      replacements++;
      return 'properties.Substance';
    });
    
    // Also fix direct variable references
    newContent = newContent.replace(/\bSpirit\b(?!:)/g, (match) => {
      replacements++;
      return 'Spirit';
    });
    
    newContent = newContent.replace(/\bEssence\b(?!:)/g, (match) => {
      replacements++;
      return 'Essence';
    });
    
    newContent = newContent.replace(/\bMatter\b(?!:)/g, (match) => {
      replacements++;
      return 'Matter';
    });
    
    newContent = newContent.replace(/\bSubstance\b(?!:)/g, (match) => {
      replacements++;
      return 'Substance';
    });
    
    // Fix mapping.Spirit, mapping.Essence, etc.
    newContent = newContent.replace(/mapping\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `mapping.${p1.toLowerCase()}`;
    });
    
    // Fix alchemicalProperties.Spirit, alchemicalProperties.Essence, etc.
    newContent = newContent.replace(/alchemicalProperties\.(Spirit|Essence|Matter|Substance)/g, (match, p1) => {
      replacements++;
      return `alchemicalProperties.${p1.toLowerCase()}`;
    });
    
    // Fix recipeAlchemical.Spirit, userAlchemical.Spirit, etc.
    newContent = newContent.replace(/(recipeAlchemical|userAlchemical)\.(Spirit|Essence|Matter|Substance)/g, (match, p1, p2) => {
      replacements++;
      return `${p1}.${p2.toLowerCase()}`;
    });
  }
  
  // 2. Fix ElementalValues inconsistencies
  // Properties should be capitalized (Fire, Water, Earth, Air)
  
  // Check ElementalValues inconsistencies
  const elementalLowercaseRegex = /elements\.(water|Air|earth)(?!\s*=)/g;
  const elementalMatches = [...content.matchAll(elementalLowercaseRegex)];
  
  if (elementalMatches.length > 0) {
    console.log(`Found ${elementalMatches.length} lowercase ElementalValues references`);
    
    // Fix elements.Water -> elements.Water
    newContent = newContent.replace(/elements\.Water/g, (match) => {
      replacements++;
      return 'elements.Water';
    });
    
    // Fix elements.Air -> elements.Air
    newContent = newContent.replace(/elements\.Air/g, (match) => {
      replacements++;
      return 'elements.Air';
    });
    
    // Fix elements.Earth -> elements.Earth
    newContent = newContent.replace(/elements\.Earth/g, (match) => {
      replacements++;
      return 'elements.Earth';
    });
    
    // Fix elementalValues.Water -> elementalValues.Water
    newContent = newContent.replace(/elementalValues\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `elementalValues.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix userElements.Water -> userElements.Water
    newContent = newContent.replace(/userElements\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `userElements.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
    
    // Fix normalizedUser.Water -> normalizedUser.Water
    newContent = newContent.replace(/normalizedUser\.(water|Air|earth)/g, (match, p1) => {
      replacements++;
      return `normalizedUser.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
  }
  
  // 3. Fix ElementalProperties object literals
  
  // Fix object literals like { Fire: 0, Water: 0, Air: 0, Earth: 0 }
  newContent = newContent.replace(/\{\s*Fire\s*:\s*([^,}]+),\s*Water\s*:\s*([^,}]+),\s*Air\s*:\s*([^,}]+),\s*earth\s*:\s*([^,}]+)\s*\}/g, (match, fireval, waterval, Airval, earthval) => {
    replacements++;
    return `{ Fire: ${fireval}, Water: ${waterval}, Air: ${Airval}, Earth: ${earthval} }`;
  });
  
  // 4. Fix Zodiac sign reference types (should be lowercase)
  
  // Fix type mismatches with zodiac signs
  newContent = newContent.replace(/aries:\s*'Fire'/g, (match) => {
    replacements++;
    return "aries: 'Fire'";
  });
  
  newContent = newContent.replace(/leo:\s*'Fire'/g, (match) => {
    replacements++;
    return "leo: 'Fire'";
  });
  
  newContent = newContent.replace(/sagittarius:\s*'Fire'/g, (match) => {
    replacements++;
    return "sagittarius: 'Fire'";
  });
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing core type definitions casing issues...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixCasingInFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); |Air|earth)/g, (match, p1) => {
      replacements++;
      return `normalizedUser.${p1.charAt(0).toUpperCase() + p1.slice(1)}`;
    });
  }
  
  // 3. Fix ElementalProperties object literals
  
  // Fix object literals like { Fire: 0, Water: 0, Air: 0, Earth: 0 }
  newContent = newContent.replace(/\{\s*Fire\s*:\s*([^,}]+),\s*Water\s*:\s*([^,}]+),\s*Air\s*:\s*([^,}]+),\s*earth\s*:\s*([^,}]+)\s*\}/g, (match, fireval, waterval, Airval, earthval) => {
    replacements++;
    return `{ Fire: ${fireval}, Water: ${waterval}, Air: ${Airval}, Earth: ${earthval} }`;
  });
  
  // 4. Fix Zodiac sign reference types (should be lowercase)
  
  // Fix type mismatches with zodiac signs
  newContent = newContent.replace(/aries:\s*'Fire'/g, (match) => {
    replacements++;
    return "aries: 'Fire'";
  });
  
  newContent = newContent.replace(/leo:\s*'Fire'/g, (match) => {
    replacements++;
    return "leo: 'Fire'";
  });
  
  newContent = newContent.replace(/sagittarius:\s*'Fire'/g, (match) => {
    replacements++;
    return "sagittarius: 'Fire'";
  });
  
  // Log changes
  if (replacements > 0) {
    console.log(`Made ${replacements} replacements in ${filePath}`);
    
    // Write changes if not in dry run mode
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('(Dry run mode, no changes written)');
    }
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all files
console.log(`${isDryRun ? 'DRY RUN: ' : ''}Fixing core type definitions casing issues...`);

// Process each file
FILES_TO_FIX.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixCasingInFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
});

console.log('\nDone!'); 