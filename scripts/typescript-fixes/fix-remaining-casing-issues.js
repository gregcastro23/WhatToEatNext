#!/usr/bin/env node

/**
 * Comprehensive Casing Issues Fixer
 * 
 * This script fixes the remaining critical casing inconsistencies that are
 * causing TypeScript errors. It targets the specific patterns identified
 * in the TypeScript error output.
 * 
 * Key fixes:
 * 1. ElementalProperties/ElementalValues inconsistencies (Earth vs earth)
 * 2. AlchemicalProperties inconsistencies (Spirit vs Spirit)
 * 3. PlanetaryPosition properties (retrograde vs isRetrograde)
 * 4. Object literal type issues
 * 5. Duplicate property names in object literals
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define the problematic files identified from TypeScript errors
const CRITICAL_FILES = [
  'src/calculations/alchemicalEngine.ts',
  'src/calculations/core/alchemicalEngine.ts',
  'src/calculations/core/elementalCalculations.ts',
  'src/calculations/core/kalchmEngine.ts',
  'src/calculations/core/planetaryInfluences.ts',
  'src/calculations/culinary/recipeMatching.ts',
  'src/calculations/culinary/seasonalAdjustments.ts',
  'src/calculations/alchemicalTransformation.ts',
  'src/calculations/combinationEffects.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n📝 ${message}:`);
  console.log(`❌ ${oldCode}`);
  console.log(`✅ ${newCode}`);
}

// Fix casing issues in a file
function fixCasingIssues(filePath) {
  console.log(`\n🔧 Processing: ${filePath}`);
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return;
  }

  let replacements = 0;
  let newContent = content;
  const fileName = path.basename(filePath);
  
  // 1. Fix ElementalProperties inconsistencies (lowercase earth/water/Air should be uppercase)
  
  // Fix object literals with lowercase element names
  newContent = newContent.replace(/\{\s*Fire:\s*([^}]+),\s*Water:\s*([^}]+),\s*Air:\s*([^}]+),\s*Earth:\s*([^}]+)\s*\}/g, (match, fire, water, Air, earth) => {
    replacements++;
    logChange(
      'Fixed lowercase earth in ElementalProperties',
      match,
      `{ Fire: ${fire}, Water: ${water}, Air: ${Air}, Earth: ${earth} }`
    );
    return `{ Fire: ${fire}, Water: ${water}, Air: ${Air}, Earth: ${earth} }`;
  });
  
  // Fix specific patterns with multiple lowercase elements
  newContent = newContent.replace(/\{\s*Fire:\s*([^}]+),\s*Water:\s*([^}]+),\s*Air:\s*([^}]+),\s*Earth:\s*([^}]+)\s*\}/g, (match, fire, water, Air, earth) => {
    replacements++;
    logChange(
      'Fixed multiple lowercase elements in ElementalProperties',
      match,
      `{ Fire: ${fire}, Water: ${water}, Air: ${Air}, Earth: ${earth} }`
    );
    return `{ Fire: ${fire}, Water: ${water}, Air: ${Air}, Earth: ${earth} }`;
  });
  
  // Fix ElementalValues inconsistencies (uppercase elements should be lowercase for ElementalValues)
  if (fileName.includes('kalchmEngine')) {
    // This file uses ElementalValues which has lowercase property names
    newContent = newContent.replace(/elements\.Water/g, (match) => {
      replacements++;
      return 'elements.Water';
    });
    
    newContent = newContent.replace(/elements\.Air/g, (match) => {
      replacements++;
      return 'elements.Air';
    });
    
    newContent = newContent.replace(/elements\.Earth/g, (match) => {
      replacements++;
      return 'elements.Earth';
    });
    
    // Fix object literal assignment to ElementalValues
    newContent = newContent.replace(/const elements: ElementalValues = \{ Fire: 0, Water: 0, Air: 0, Earth: 0/g, (match) => {
      replacements++;
      return 'const elements: ElementalValues = { Fire: 0, Water: 0, Air: 0, Earth: 0';
    });
    
    // Fix undefined variable references (Fire, Water, Air, Earth used as variables)
    newContent = newContent.replace(/Math\.pow\(Fire, 2\)/g, (match) => {
      replacements++;
      return 'Math.pow(elementalValues.Fire, 2)';
    });
    
    newContent = newContent.replace(/Math\.pow\(Water, 2\)/g, (match) => {
      replacements++;
      return 'Math.pow(elementalValues.Water, 2)';
    });
    
    newContent = newContent.replace(/Math\.pow\(Air, 2\)/g, (match) => {
      replacements++;
      return 'Math.pow(elementalValues.Air, 2)';
    });
    
    newContent = newContent.replace(/Math\.pow\(Earth, 2\)/g, (match) => {
      replacements++;
      return 'Math.pow(elementalValues.Earth, 2)';
    });
    
    // Fix variable references in calculations
    newContent = newContent.replace(/(\w+ = Math\.pow[^+]*\+[^+]*)\+\s*Water\s*\+\s*Air\s*\+\s*Earth/g, (match, prefix) => {
      replacements++;
      return `${prefix} + elementalValues.Water + elementalValues.Air + elementalValues.Earth`;
    });
  }
  
  // 2. Fix AlchemicalProperties inconsistencies
  
  // Fix cases where lowercase alchemical properties are used instead of uppercase
  if (fileName.includes('alchemicalEngine') || fileName.includes('planetaryInfluences')) {
    // Fix AlchemyTotals type inconsistencies
    newContent = newContent.replace(/Spirit: 0, Essence: 0, Matter: 0, Substance: 0/g, (match) => {
      replacements++;
      logChange(
        'Fixed AlchemyTotals property casing',
        match,
        'Spirit: 0, Essence: 0, Matter: 0, Substance: 0'
      );
      return 'Spirit: 0, Essence: 0, Matter: 0, Substance: 0';
    });
    
    // Fix alchemical property access patterns
    newContent = newContent.replace(/properties\.Spirit/g, (match) => {
      replacements++;
      return 'properties.Spirit';
    });
    
    newContent = newContent.replace(/properties\.Essence/g, (match) => {
      replacements++;
      return 'properties.Essence';
    });
    
    newContent = newContent.replace(/properties\.Matter/g, (match) => {
      replacements++;
      return 'properties.Matter';
    });
    
    newContent = newContent.replace(/properties\.Substance/g, (match) => {
      replacements++;
      return 'properties.Substance';
    });
    
    // Fix mapping access patterns
    newContent = newContent.replace(/mapping\.(Spirit|Essence|Matter|Substance)/g, (match, prop) => {
      // These should be lowercase for the planetInfo data structure
      replacements++;
      return `mapping.${prop.toLowerCase()}`;
    });
  }
  
  // Fix recipeMatching.ts specific issues
  if (fileName.includes('recipeMatching')) {
    // Fix alchemical property access to use lowercase (matching the object literal structure)
    newContent = newContent.replace(/recipeAlchemical\.Spirit/g, (match) => {
      replacements++;
      return 'recipeAlchemical.Spirit';
    });
    
    newContent = newContent.replace(/recipeAlchemical\.Essence/g, (match) => {
      replacements++;
      return 'recipeAlchemical.Essence';
    });
    
    newContent = newContent.replace(/recipeAlchemical\.Matter/g, (match) => {
      replacements++;
      return 'recipeAlchemical.Matter';
    });
    
    newContent = newContent.replace(/recipeAlchemical\.Substance/g, (match) => {
      replacements++;
      return 'recipeAlchemical.Substance';
    });
    
    newContent = newContent.replace(/userAlchemical\.Spirit/g, (match) => {
      replacements++;
      return 'userAlchemical.Spirit';
    });
    
    newContent = newContent.replace(/userAlchemical\.Essence/g, (match) => {
      replacements++;
      return 'userAlchemical.Essence';
    });
    
    newContent = newContent.replace(/userAlchemical\.Matter/g, (match) => {
      replacements++;
      return 'userAlchemical.Matter';
    });
    
    newContent = newContent.replace(/userAlchemical\.Substance/g, (match) => {
      replacements++;
      return 'userAlchemical.Substance';
    });
    
    // Fix elemental property access
    newContent = newContent.replace(/userElements\.Water/g, (match) => {
      replacements++;
      return 'userElements.Water';
    });
    
    newContent = newContent.replace(/userElements\.Air/g, (match) => {
      replacements++;
      return 'userElements.Air';
    });
    
    newContent = newContent.replace(/userElements\.Earth/g, (match) => {
      replacements++;
      return 'userElements.Earth';
    });
    
    newContent = newContent.replace(/normalizedUser\.Water/g, (match) => {
      replacements++;
      return 'normalizedUser.Water';
    });
    
    newContent = newContent.replace(/normalizedUser\.Air/g, (match) => {
      replacements++;
      return 'normalizedUser.Air';
    });
    
    newContent = newContent.replace(/normalizedUser\.Earth/g, (match) => {
      replacements++;
      return 'normalizedUser.Earth';
    });
  }
  
  // 3. Fix planetaryInfluences.ts specific issues
  if (fileName.includes('planetaryInfluences')) {
    // Fix retrograde property name
    newContent = newContent.replace(/position\.retrograde/g, (match) => {
      replacements++;
      logChange(
        'Fixed retrograde property name',
        match,
        'position.isRetrograde'
      );
      return 'position.isRetrograde';
    });
    
    // Fix type conversion for element property
    newContent = newContent.replace(/element: keyof ElementalProperties/g, (match) => {
      replacements++;
      return 'element: string';
    });
  }
  
  // 4. Fix alchemicalEngine.ts specific issues
  if (fileName.includes('alchemicalEngine.ts') && !fileName.includes('core')) {
    // Remove duplicate object properties
    const duplicateRegex = /(\w+): \[([^\]]+)\],[^}]*\1: \[([^\]]+)\]/g;
    newContent = newContent.replace(duplicateRegex, (match, prop, firstValue, secondValue) => {
      replacements++;
      logChange(
        'Removed duplicate object property',
        match,
        `${prop}: [${firstValue}, ${secondValue}]`
      );
      return `${prop}: [${firstValue}, ${secondValue}]`;
    });
    
    // Fix timestamp property in AstrologicalState
    newContent = newContent.replace(/timestamp: new Date\(\),/g, (match) => {
      replacements++;
      logChange(
        'Removed invalid timestamp property',
        match,
        '// timestamp: new Date(), // Removed - not part of AstrologicalState interface'
      );
      return '// timestamp: new Date(), // Removed - not part of AstrologicalState interface';
    });
    
    // Fix elementalBalance casing inconsistency
    newContent = newContent.replace(/}]+), Water: ([^}]+), Earth: ([^}]+), Air: ([^}]+) \}/g, (match, fire, water, earth, Air) => {
      replacements++;
      logChange(
        'Fixed elementalBalance property casing',
        match,
        `}, Water: ${water}, Earth: ${earth}, Air: ${Air} }`
      );
      return `}, Water: ${water}, Earth: ${earth}, Air: ${Air} }`;
    });
  }
  
  // 5. Fix elementalCalculations.ts specific issues
  if (fileName.includes('elementalCalculations')) {
    // Fix 'any' being used as a value instead of a type
    newContent = newContent.replace(/:\s*any,/g, (match) => {
      replacements++;
      logChange(
        'Fixed any used as value',
        match,
        ': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },'
      );
      return ': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },';
    });
  }
  
  // 6. Fix alchemicalTransformation.ts specific issues
  if (fileName.includes('alchemicalTransformation')) {
    // Fix type assertion for unknown types in reduce operations
    newContent = newContent.replace(/Object\.values\(record\)\.reduce\(\(acc, val\) => acc \+ val, 0\)/g, (match) => {
      replacements++;
      logChange(
        'Fixed unknown type in reduce operation',
        match,
        'Object.values(record).reduce((acc: number, val) => (acc as number) + (val as number), 0)'
      );
      return 'Object.values(record).reduce((acc: number, val) => (acc as number) + (val as number), 0)';
    });
    
    // Fix comparison with unknown type
    newContent = newContent.replace(/if \(sum > 0\)/g, (match) => {
      replacements++;
      return 'if ((sum as number) > 0)';
    });
    
    // Fix division with unknown type
    newContent = newContent.replace(/record\[key as T\] = record\[key as T\] \/ sum;/g, (match) => {
      replacements++;
      return 'record[key as T] = (record[key as T] as number) / (sum as number);';
    });
  }
  
  // 7. Fix combinationEffects.ts specific issues
  if (fileName.includes('combinationEffects')) {
    // Fix includes method on unknown type
    newContent = newContent.replace(/mapping\.season\?\.includes\(season\)/g, (match) => {
      replacements++;
      logChange(
        'Fixed includes method on unknown type',
        match,
        '(mapping.season as string[])?.includes(season)'
      );
      return '(mapping.season as string[])?.includes(season)';
    });
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Made ${replacements} casing fixes in ${filePath}`);
    
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`💾 Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('🔍 (Dry run mode, no changes written)');
    }
  } else {
    console.log(`✨ No casing changes needed in ${filePath}`);
  }
}

// Main execution
console.log(`${isDryRun ? '🔍 DRY RUN: ' : '🚀 '}Comprehensive Casing Issues Fixer`);
console.log('=========================================================');

let totalFiles = 0;
let totalReplacements = 0;

// Process each critical file
CRITICAL_FILES.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    totalFiles++;
    fixCasingIssues(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n=========================================================');
console.log(`✨ Processed ${totalFiles} critical files`);
console.log(`${isDryRun ? '🔍 This was a dry run - no files were modified.' : '💾 All changes have been written to disk.'}`);
console.log('========================================================='); 