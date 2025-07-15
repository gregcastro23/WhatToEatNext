#!/usr/bin/env node

/**
 * Enhanced fix for syntax errors from Phase 12 Tier 2
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

function fixCuisineFlavorProfiles() {
  const filePath = 'src/data/cuisineFlavorProfiles.ts';
  if (!existsSync(filePath)) return;

  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Fix the specific issues in this file
    content = content.replace(
      /elementalProperties:\s*\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\}/g,
      'elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }'
    );

    writeFileSync(filePath, content, 'utf8');
    console.log('Fixed cuisineFlavorProfiles.ts');
  } catch (error) {
    console.error('Error fixing cuisineFlavorProfiles.ts:', error.message);
  }
}

function fixIngredientMappings() {
  const filePath = 'src/scripts/fixIngredientMappings.ts';
  if (!existsSync(filePath)) return;

  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Fix spread operator issues
    content = content.replace(
      /files\s*=\s*\[\.\.\.\s*files,\s*\.\.\.\s*getAllTypeScriptFiles\(fullPath\)\]/g,
      'files = [...files, ...getAllTypeScriptFiles(fullPath)]'
    );
    
    // Fix other potential spread issues
    content = content.replace(
      /importPaths\s*=\s*\[\.\.\.\s*importPaths,\s*([^\]]+)\]/g,
      'importPaths = [...importPaths, $1]'
    );

    writeFileSync(filePath, content, 'utf8');
    console.log('Fixed fixIngredientMappings.ts');
  } catch (error) {
    console.error('Error fixing fixIngredientMappings.ts:', error.message);
  }
}

function fixAllConstAssignmentReversal() {
  // Some of the const->let conversions may have been too aggressive
  // Let's check for common variable patterns that should remain const
  const filesToCheck = [
    'src/calculations/alchemicalEngine.ts',
    'src/calculations/elementalcalculations.ts',
    'src/calculations/enhancedCuisineRecommender.ts'
  ];

  for (const filePath of filesToCheck) {
    if (!existsSync(filePath)) continue;

    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;

      // Revert specific patterns that should remain const
      const revertPatterns = [
        { pattern: /let\s+(default\w*)/g, replacement: 'const $1', description: 'Revert default to const' },
        { pattern: /let\s+(DEFAULTS?)/g, replacement: 'const $1', description: 'Revert DEFAULTS to const' },
        { pattern: /let\s+(CONFIG)/g, replacement: 'const $1', description: 'Revert CONFIG to const' }
      ];

      for (const revert of revertPatterns) {
        const matches = content.match(revert.pattern);
        if (matches) {
          content = content.replace(revert.pattern, revert.replacement);
          modified = true;
          console.log(`Reverted ${matches.length} ${revert.description} in ${filePath}`);
        }
      }

      if (modified) {
        writeFileSync(filePath, content, 'utf8');
      }
    } catch (error) {
      console.error(`Error checking ${filePath}:`, error.message);
    }
  }
}

function main() {
  console.log('🔧 Enhanced syntax error fixing...\n');

  fixCuisineFlavorProfiles();
  fixIngredientMappings();
  fixAllConstAssignmentReversal();

  console.log('\n✅ Enhanced syntax errors fixed!');
}

main(); 