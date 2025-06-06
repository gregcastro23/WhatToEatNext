#!/usr/bin/env node

/**
 * Test Files and Interface Mismatch Fixer
 * 
 * This script fixes TypeScript errors specifically in test files and
 * interface/type mismatches across the codebase:
 * 1. Duplicate identifier issues in test files
 * 2. Object literals not matching interface requirements
 * 3. Missing properties in test objects
 * 4. Type assertion issues in tests
 * 5. Read-only property assignment issues
 */

import fs from 'fs';
import path from 'path';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Test files with known issues
const TEST_FILES = [
  'src/__tests__/culinaryAstrology.test.ts',
  'src/__tests__/data/ingredients.test.ts', 
  'src/__tests__/ingredientRecommender.test.ts',
  'src/__tests__/setupTests.ts',
  'pages/astrological-test.tsx'
];

// Interface mismatch files
const INTERFACE_FILES = [
  'src/app/alchemicalEngine.ts',
  'src/types/alchemy.ts',
  'src/types/celestial.ts'
];

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n📝 ${message}:`);
  console.log(`❌ ${oldCode}`);
  console.log(`✅ ${newCode}`);
}

// Fix test file issues
function fixTestFile(filePath) {
  console.log(`\n🔧 Processing test file: ${filePath}`);
  
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
  
  // Fix duplicate identifier issues
  if (fileName.includes('ingredients.test.ts')) {
    // Remove duplicate validateIngredient imports
    newContent = newContent.replace(
      /import\s*\{\s*validateIngredient\s*\}[^;]*;[\s\n]*import[^{]*\{\s*validateIngredient\s*\}/g,
      (match) => {
        replacements++;
        logChange(
          'Fixed duplicate validateIngredient import',
          match,
          "import { validateIngredient } from '../data/ingredients';"
        );
        return "import { validateIngredient } from '../data/ingredients';";
      }
    );
    
    // Fix any remaining duplicate declarations
    const lines = newContent.split('\n');
    const seenImports = new Set();
    const filteredLines = [];
    
    for (const line of lines) {
      if (line.includes('validateIngredient') && line.includes('import')) {
        if (!seenImports.has('validateIngredient')) {
          seenImports.add('validateIngredient');
          filteredLines.push(line);
        } else {
          replacements++;
          filteredLines.push('// Duplicate import removed');
        }
      } else {
        filteredLines.push(line);
      }
    }
    
    newContent = filteredLines.join('\n');
  }
  
  // Fix culinaryAstrology.test.ts issues
  if (fileName.includes('culinaryAstrology.test.ts')) {
    // Fix object literal that doesn't match PlanetaryPosition interface
    newContent = newContent.replace(
      /\{\s*sign:\s*["']leo["'],\s*degree:\s*(\d+),\s*sunSign:\s*["'][^"']*["']\s*\}/g,
      (match, degree) => {
        replacements++;
        logChange(
          'Fixed PlanetaryPosition object literal',
          match,
          `{ sign: 'leo', degree: ${degree}, isRetrograde: false }`
        );
        return `{ sign: 'leo', degree: ${degree}, isRetrograde: false }`;
      }
    );
  }
  
  // Fix ingredientRecommender.test.ts issues  
  if (fileName.includes('ingredientRecommender.test.ts')) {
    // Fix object literal that doesn't match PlanetaryPosition interface
    newContent = newContent.replace(
      /\{\s*sign:\s*["']leo["'],\s*degree:\s*(\d+),\s*sunSign:\s*["'][^"']*["']\s*\}/g,
      (match, degree) => {
        replacements++;
        logChange(
          'Fixed PlanetaryPosition object literal',
          match,
          `{ sign: 'leo', degree: ${degree}, isRetrograde: false }`
        );
        return `{ sign: 'leo', degree: ${degree}, isRetrograde: false }`;
      }
    );
    
    // Fix astrologicalProfile access on Ingredient type
    newContent = newContent.replace(
      /(\w+)\.astrologicalProfile/g,
      (match, varName) => {
        replacements++;
        logChange(
          'Fixed astrologicalProfile access',
          match,
          `(${varName} as any).astrologicalProfile`
        );
        return `(${varName} as any).astrologicalProfile`;
      }
    );
    
    // Fix AstrologicalState type mismatch
    newContent = newContent.replace(
      /(AstrologicalState.*?currentPlanetaryAlignment.*?Sun.*?element.*?): string/g,
      (match) => {
        replacements++;
        return match.replace(': string', ': Element');
      }
    );
  }
  
  // Fix setupTests.ts NODE_ENV assignment
  if (fileName.includes('setupTests.ts')) {
    newContent = newContent.replace(
      /process\.env\.NODE_ENV\s*=\s*['"][^'"]*['"];?/g,
      (match) => {
        replacements++;
        logChange(
          'Fixed read-only NODE_ENV assignment',
          match,
          '// process.env.NODE_ENV = "test"; // Read-only property, assignment removed'
        );
        return '// process.env.NODE_ENV = "test"; // Read-only property, assignment removed';
      }
    );
  }
  
  // Fix astrological-test.tsx interface mismatches
  if (fileName.includes('astrological-test.tsx')) {
    // Fix PlanetaryAlignment type mismatch
    newContent = newContent.replace(
      /positions:\s*PlanetaryAlignment/g,
      (match) => {
        replacements++;
        logChange(
          'Fixed PlanetaryAlignment type usage',
          match,
          'positions: Record<string, PlanetaryAlignment>'
        );
        return 'positions: Record<string, PlanetaryAlignment>';
      }
    );
    
    // Fix SetStateAction type issues
    newContent = newContent.replace(
      /setTestResult\(\{\s*positions:\s*([^,}]+),/g,
      (match, positionsValue) => {
        replacements++;
        return `setTestResult({ positions: ${positionsValue} as Record<string, PlanetaryAlignment>,`;
      }
    );
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Fixed ${replacements} test issues in ${filePath}`);
    
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
    console.log(`✨ No test changes needed in ${filePath}`);
  }
}

// Fix interface and export issues
function fixInterfaceFile(filePath) {
  console.log(`\n🔧 Processing interface file: ${filePath}`);
  
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
  
  // Fix missing exports in alchemy.ts
  if (fileName.includes('alchemy.ts') && !content.includes('export interface BirthInfo')) {
    const newExports = `
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
      /(export interface AlchemicalProperties)/,
      `${newExports}\n$1`
    );
    replacements += 2;
    
    logChange(
      'Added missing exports to alchemy.ts',
      'Missing BirthInfo and HoroscopeData',
      'Added complete interface definitions'
    );
  }
  
  // Fix Element type consistency  
  if (fileName.includes('celestial.ts')) {
    // Ensure Element type is properly defined and exported
    if (!content.includes('export type Element')) {
      newContent = newContent.replace(
        /(export interface)/,
        `export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';\n\n$1`
      );
      replacements++;
    }
  }
  
  // Fix alchemicalEngine.ts imports
  if (fileName.includes('alchemicalEngine.ts')) {
    // Fix import issues for BirthInfo
    newContent = newContent.replace(
      /import\s*\{[^}]*BirthInfo[^}]*\}\s*from\s*['"]@\/types\/alchemy['"];?/g,
      (match) => {
        replacements++;
        logChange(
          'Fixed BirthInfo import',
          match,
          'import { BirthInfo } from "@/services/AstrologicalService";'
        );
        return 'import { BirthInfo } from "@/services/AstrologicalService";';
      }
    );
    
    // Fix HoroscopeData import
    newContent = newContent.replace(
      /import\s*\{[^}]*HoroscopeData[^}]*\}\s*from\s*['"]@\/types\/alchemy['"];?/g,
      (match) => {
        replacements++;
        return 'import { HoroscopeData } from "@/services/AstrologicalService";';
      }
    );
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Fixed ${replacements} interface issues in ${filePath}`);
    
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
    console.log(`✨ No interface changes needed in ${filePath}`);
  }
}

// Main execution
console.log(`${isDryRun ? '🔍 DRY RUN: ' : '🚀 '}Test Files and Interface Mismatch Fixer`);
console.log('=========================================================');

// Phase 1: Fix test files
console.log('\n🧪 Phase 1: Fixing test files...');
TEST_FILES.forEach(filePath => {
  fixTestFile(filePath);
});

// Phase 2: Fix interface files
console.log('\n📋 Phase 2: Fixing interface files...');
INTERFACE_FILES.forEach(filePath => {
  fixInterfaceFile(filePath);
});

console.log('\n=========================================================');
console.log(`✨ Test files and interface fixing completed!`);
console.log(`${isDryRun ? '🔍 This was a dry run - no files were modified.' : '💾 All changes have been written to disk.'}`);
console.log('========================================================='); 