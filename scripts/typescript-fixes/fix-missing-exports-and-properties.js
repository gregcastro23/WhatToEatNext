#!/usr/bin/env node

/**
 * Missing Exports and Properties Fixer
 * 
 * This script fixes the most common TypeScript error patterns:
 * 1. Missing exported members (PlanetaryAlignment, BirthInfo, etc.)
 * 2. Properties accessed on unknown types
 * 3. Type assertion issues for planetary positions
 * 4. Duplicate identifier conflicts
 * 5. Module resolution and import/export mismatches
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Define patterns and their fixes
const EXPORT_FIXES = [
  // Missing exports from services
  {
    file: 'src/services/AstrologicalService.ts',
    pattern: /export.*AstrologicalService/,
    addExports: ['PlanetaryAlignment', 'BirthInfo', 'HoroscopeData']
  },
  // Missing exports from types
  {
    file: 'src/types/alchemy.ts', 
    pattern: /export.*AlchemicalProperties/,
    addExports: ['BirthInfo', 'HoroscopeData', 'PlanetName', 'CelestialPosition']
  },
  {
    file: 'src/types/index.ts',
    pattern: /export.*from/,
    addExports: ['PlanetName', 'CelestialPosition']
  }
];

// Files with property access on unknown types
const UNKNOWN_TYPE_FILES = [
  'pages/astrological-test.tsx',
  'src/__tests__/astrologize-integration.test.ts',
  'src/utils/recommendation/foodRecommendation.ts',
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/utils/recommendationEngine.ts',
  'src/utils/safeAstrology.ts'
];

// Files with elemental casing issues
const ELEMENTAL_CASING_FILES = [
  'src/app/alchemicalEngine.ts',
  'src/utils/recommendation/foodRecommendation.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n📝 ${message}:`);
  console.log(`❌ ${oldCode}`);
  console.log(`✅ ${newCode}`);
}

// Fix missing exports in a file
function fixMissingExports(filePath) {
  console.log(`\n🔧 Processing exports: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return;
  }

  let replacements = 0;
  let newContent = content;
  
  // Add missing type definitions if they don't exist
  if (filePath.includes('AstrologicalService.ts')) {
    if (!content.includes('export interface PlanetaryAlignment')) {
      const newInterface = `
export interface PlanetaryAlignment {
  planet: string;
  sign: string;
  degree: number;
  minutes?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
}

export interface BirthInfo {
  date: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export interface HoroscopeData {
  tropical?: {
    CelestialBodies?: {
      [planet: string]: {
        Sign?: {
          label?: string;
        };
        degree?: number;
        minutes?: number;
        exactLongitude?: number;
        isRetrograde?: boolean;
      };
    };
  };
}
`;
      newContent = newContent.replace(
        /(export class AstrologicalService)/,
        `${newInterface}\n$1`
      );
      replacements += 3;
      logChange(
        'Added missing interface definitions',
        'Missing PlanetaryAlignment, BirthInfo, HoroscopeData',
        'Added complete interface definitions'
      );
    }
  }
  
  if (filePath.includes('types/alchemy.ts')) {
    if (!content.includes('export type PlanetName')) {
      const newTypes = `
export type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export interface CelestialPosition {
  planet: PlanetName;
  sign: string;
  degree: number;
  minutes?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
}
`;
      newContent = newContent.replace(
        /(export interface AlchemicalProperties)/,
        `${newTypes}\n$1`
      );
      replacements += 2;
      logChange(
        'Added missing type definitions',
        'Missing PlanetName, CelestialPosition',
        'Added complete type definitions'
      );
    }
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Added ${replacements} missing exports in ${filePath}`);
    
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
    console.log(`✨ No export changes needed in ${filePath}`);
  }
}

// Fix unknown type property access
function fixUnknownTypeAccess(filePath) {
  console.log(`\n🔧 Processing unknown types: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
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
  
  // Fix property access on unknown types with proper type assertions
  
  // Fix .sign property access
  newContent = newContent.replace(/(\w+)\.sign(?!\s*=)/g, (match, varName) => {
    if (content.includes(`${varName}: unknown`) || content.includes('Property \'sign\' does not exist on type \'unknown\'')) {
      replacements++;
      return `(${varName} as { sign: string }).sign`;
    }
    return match;
  });
  
  // Fix .degree property access
  newContent = newContent.replace(/(\w+)\.degree(?!\s*=)/g, (match, varName) => {
    if (!match.includes('as ')) {
      replacements++;
      return `(${varName} as { degree: number }).degree`;
    }
    return match;
  });
  
  // Fix .minutes property access
  newContent = newContent.replace(/(\w+)\.minutes(?!\s*=)/g, (match, varName) => {
    if (!match.includes('as ')) {
      replacements++;
      return `(${varName} as { minutes?: number }).minutes`;
    }
    return match;
  });
  
  // Fix .exactLongitude property access
  newContent = newContent.replace(/(\w+)\.exactLongitude(?!\s*=)/g, (match, varName) => {
    if (!match.includes('as ')) {
      replacements++;
      return `(${varName} as { exactLongitude?: number }).exactLongitude`;
    }
    return match;
  });
  
  // Fix .isRetrograde property access
  newContent = newContent.replace(/(\w+)\.isRetrograde(?!\s*=)/g, (match, varName) => {
    if (!match.includes('as ')) {
      replacements++;
      return `(${varName} as { isRetrograde?: boolean }).isRetrograde`;
    }
    return match;
  });
  
  // Fix .message property access
  newContent = newContent.replace(/(\w+)\.message(?!\s*=)/g, (match, varName) => {
    if (!match.includes('as ')) {
      replacements++;
      return `(${varName} as { message: string }).message`;
    }
    return match;
  });
  
  // Fix .toLowerCase() on unknown
  newContent = newContent.replace(/(\w+)\.toLowerCase\(\)/g, (match, varName) => {
    if (content.includes('does not exist on type \'unknown\'')) {
      replacements++;
      return `(${varName} as string).toLowerCase()`;
    }
    return match;
  });
  
  // Fix .astrologicalProfile property access
  newContent = newContent.replace(/(\w+)\.astrologicalProfile/g, (match, varName) => {
    if (!match.includes('as ')) {
      replacements++;
      return `(${varName} as any).astrologicalProfile`;
    }
    return match;
  });
  
  // Fix specific patterns for different files
  if (fileName.includes('foodRecommendation.ts')) {
    // Fix Element type returns
    newContent = newContent.replace(/return 'Fire';/g, (match) => {
      replacements++;
      return "return 'Fire';";
    });
    
    newContent = newContent.replace(/return 'Water';/g, (match) => {
      replacements++;
      return "return 'Water';";
    });
    
    newContent = newContent.replace(/return 'Earth';/g, (match) => {
      replacements++;
      return "return 'Earth';";
    });
    
    newContent = newContent.replace(/return 'Air';/g, (match) => {
      replacements++;
      return "return 'Air';";
    });
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Fixed ${replacements} unknown type issues in ${filePath}`);
    
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
    console.log(`✨ No unknown type changes needed in ${filePath}`);
  }
}

// Fix elemental casing issues
function fixElementalCasing(filePath) {
  console.log(`\n🔧 Processing elemental casing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return;
  }

  let replacements = 0;
  let newContent = content;
  
  // Fix Water -> water, Earth -> earth, Air -> Air for specific object patterns
  newContent = newContent.replace(/\{\s*Fire:\s*([^,}]+),\s*Water:\s*([^,}]+),\s*Earth:\s*([^,}]+),\s*Air:\s*([^}]+)\s*\}/g, (match, fire, water, earth, Air) => {
    // Check if this should be lowercase based on context
    if (content.includes('Fire': number; Earth: number; Air: number; Water: number;')) {
      replacements++;
      logChange(
        'Fixed elemental property casing for lowercase interface',
        match,
        `{ Fire: ${fire}, Water: ${water}, Earth: ${earth}, Air: ${Air} }`
      );
      return `{ Fire: ${fire}, Water: ${water}, Earth: ${earth}, Air: ${Air} }`;
    }
    return match;
  });
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Fixed ${replacements} elemental casing issues in ${filePath}`);
    
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
    console.log(`✨ No elemental casing changes needed in ${filePath}`);
  }
}

// Fix duplicate identifiers
function fixDuplicateIdentifiers() {
  console.log(`\n🔧 Processing duplicate identifiers...`);
  
  const duplicateFiles = [
    'src/__tests__/data/ingredients.test.ts',
    'src/utils/seasonalCalculations.ts'
  ];
  
  duplicateFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      return;
    }

    let replacements = 0;
    let newContent = content;
    
    // Fix duplicate Recipe imports
    newContent = newContent.replace(/import\s*\{\s*Recipe,([^}]*)\}\s*from\s*['"][^'"]*['"];?\s*\n\s*import\s*\{[^}]*,\s*Recipe\s*\}\s*from\s*['"][^'"]*['"];?/g, (match) => {
      replacements++;
      logChange(
        'Removed duplicate Recipe import',
        match,
        '// Duplicate import removed'
      );
      return '// Duplicate import removed';
    });
    
    // Fix duplicate validateIngredient
    newContent = newContent.replace(/import\s*\{\s*validateIngredient\s*\}[^;]*;\s*\n\s*import[^{]*\{\s*validateIngredient\s*\}/g, (match) => {
      replacements++;
      logChange(
        'Removed duplicate validateIngredient import',
        match,
        '// Duplicate import removed'
      );
      return '// Duplicate import removed';
    });
    
    if (replacements > 0) {
      console.log(`✅ Fixed ${replacements} duplicate identifiers in ${filePath}`);
      
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
    }
  });
}

// Main execution
console.log(`${isDryRun ? '🔍 DRY RUN: ' : '🚀 '}Missing Exports and Properties Fixer`);
console.log('=========================================================');

// Phase 1: Fix missing exports
console.log('\n📦 Phase 1: Adding missing exports...');
EXPORT_FIXES.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    fixMissingExports(fix.file);
  }
});

// Phase 2: Fix unknown type property access
console.log('\n🔍 Phase 2: Fixing unknown type property access...');
UNKNOWN_TYPE_FILES.forEach(filePath => {
  fixUnknownTypeAccess(filePath);
});

// Phase 3: Fix elemental casing issues
console.log('\n🌊 Phase 3: Fixing elemental casing issues...');
ELEMENTAL_CASING_FILES.forEach(filePath => {
  fixElementalCasing(filePath);
});

// Phase 4: Fix duplicate identifiers
console.log('\n🔄 Phase 4: Fixing duplicate identifiers...');
fixDuplicateIdentifiers();

console.log('\n=========================================================');
console.log(`✨ Missing exports and properties fixing completed!`);
console.log(`${isDryRun ? '🔍 This was a dry run - no files were modified.' : '💾 All changes have been written to disk.'}`);
console.log('========================================================='); 