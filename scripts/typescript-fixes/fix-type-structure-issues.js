#!/usr/bin/env node

/**
 * Fix Remaining Type Structure Issues
 * 
 * This script addresses various TypeScript structural issues like:
 * - Missing imports
 * - Duplicate identifiers
 * - Interface property mismatches
 * - Module export issues
 */

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

console.log(`🔧 Fixing type structure issues ${DRY_RUN ? '(DRY RUN)' : ''}`);

// Helper functions
function log(message) {
  console.log(`📝 ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function error(message) {
  console.log(`❌ ${message}`);
}

function verbose(message) {
  if (VERBOSE) {
    console.log(`🔍 ${message}`);
  }
}

// Main fix function
async function fixTypeStructureIssues() {
  try {
    let fixesApplied = 0;

    // 1. Fix duplicate Recipe identifier in seasonalCalculations.ts
    const seasonalCalculationsPath = 'src/utils/seasonalCalculations.ts';
    if (fs.existsSync(seasonalCalculationsPath)) {
      let content = fs.readFileSync(seasonalCalculationsPath, 'utf8');
      const originalContent = content;

      // Remove duplicate Recipe import by fixing import statement
      const lines = content.split('\n');
      const processedLines = [];
      const importedNames = new Set();

      for (const line of lines) {
        if (line.includes('import') && line.includes('Recipe')) {
          // Parse import line to avoid duplicates
          const importMatches = line.match(/import\s*\{([^}]+)\}/);
          if (importMatches) {
            const importList = importMatches[1]
              .split(',')
              .map(item => item.trim())
              .filter(item => item && !importedNames.has(item));
            
            importList.forEach(item => importedNames.add(item));
            
            if (importList.length > 0) {
              const newImportLine = line.replace(/\{[^}]+\}/, `{${importList.join(', ')}}`);
              processedLines.push(newImportLine);
            }
          } else {
            processedLines.push(line);
          }
        } else {
          processedLines.push(line);
        }
      }

      content = processedLines.join('\n');

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(seasonalCalculationsPath, content, 'utf8');
          success('Fixed duplicate Recipe imports in seasonalCalculations.ts');
          fixesApplied++;
        } else {
          log('Would fix duplicate Recipe imports in seasonalCalculations.ts');
        }
      }
    }

    // 2. Fix LunarPhase type mismatch in safeAstrology.ts
    const safeAstrologyPath = 'src/utils/safeAstrology.ts';
    if (fs.existsSync(safeAstrologyPath)) {
      let content = fs.readFileSync(safeAstrologyPath, 'utf8');
      const originalContent = content;

      // Fix lunarPhase type mismatch by ensuring it's a proper LunarPhase type
      content = content.replace(
        /lunarPhase:\s*phaseName,/g,
        'lunarPhase: phaseName as LunarPhase,'
      );

      // Fix dominantPlanets type mismatch
      content = content.replace(
        /dominantPlanets:\s*activePlanets\.map\(([^)]+)\)/g,
        'dominantPlanets: activePlanets'
      );

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(safeAstrologyPath, content, 'utf8');
          success('Fixed type mismatches in safeAstrology.ts');
          fixesApplied++;
        } else {
          log('Would fix type mismatches in safeAstrology.ts');
        }
      }
    }

    // 3. Fix RecipeIngredient duplicate import in validateIngredients.ts
    const validateIngredientsPath = 'src/utils/validateIngredients.ts';
    if (fs.existsSync(validateIngredientsPath)) {
      let content = fs.readFileSync(validateIngredientsPath, 'utf8');
      const originalContent = content;

      // Remove duplicate RecipeIngredient import
      const lines = content.split('\n');
      const seenImports = new Set();
      const filteredLines = lines.filter(line => {
        if (line.includes('import') && line.includes('RecipeIngredient')) {
          const importKey = line.trim();
          if (seenImports.has(importKey)) {
            return false; // Skip duplicate
          }
          seenImports.add(importKey);
        }
        return true;
      });

      content = filteredLines.join('\n');

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(validateIngredientsPath, content, 'utf8');
          success('Fixed duplicate RecipeIngredient import in validateIngredients.ts');
          fixesApplied++;
        } else {
          log('Would fix duplicate RecipeIngredient import in validateIngredients.ts');
        }
      }
    }

    // 4. Fix Chrome API interface mismatches in scriptReplacer.ts
    const scriptReplacerPath = 'src/utils/scriptReplacer.ts';
    if (fs.existsSync(scriptReplacerPath)) {
      let content = fs.readFileSync(scriptReplacerPath, 'utf8');
      const originalContent = content;

      // Update Chrome API functions to match expected interface
      content = content.replace(
        /create:\s*function\(\)\s*\{[\s\S]*?\}/g,
        `create: function(options) {
        return {
          show: () => ({}),
          hide: () => ({}),
          update: () => ({}),
          on: (event, callback) => ({ off: () => {} }),
          trigger: (event) => ({})
        };
      }`
      );

      content = content.replace(
        /query:\s*function\(\)\s*\{[\s\S]*?\}/g,
        `query: function(queryInfo, callback) {
        const result = Promise.resolve([{ id: 1, active: true }]);
        if (callback) callback([{ id: 1, active: true }]);
        return true;
      }`
      );

      content = content.replace(
        /update:\s*function\(\)\s*\{[\s\S]*?\}/g,
        `update: function(tabId, properties, callback) {
        const result = Promise.resolve({});
        if (callback) callback({});
        return true;
      }`
      );

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(scriptReplacerPath, content, 'utf8');
          success('Fixed Chrome API interface mismatches in scriptReplacer.ts');
          fixesApplied++;
        } else {
          log('Would fix Chrome API interface mismatches in scriptReplacer.ts');
        }
      }
    }

    // 5. Fix missing exports in validatePlanetaryPositions.ts
    const validatePlanetaryPositionsPath = 'src/utils/validatePlanetaryPositions.ts';
    if (fs.existsSync(validatePlanetaryPositionsPath)) {
      let content = fs.readFileSync(validatePlanetaryPositionsPath, 'utf8');
      const originalContent = content;

      // Add export to getBaseSignLongitude function
      content = content.replace(
        /function getBaseSignLongitude/g,
        'export function getBaseSignLongitude'
      );

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(validatePlanetaryPositionsPath, content, 'utf8');
          success('Fixed missing exports in validatePlanetaryPositions.ts');
          fixesApplied++;
        } else {
          log('Would fix missing exports in validatePlanetaryPositions.ts');
        }
      }
    }

    // 6. Fix missing export in data/recipes.ts
    const recipesDataPath = 'src/data/recipes.ts';
    if (fs.existsSync(recipesDataPath)) {
      let content = fs.readFileSync(recipesDataPath, 'utf8');
      const originalContent = content;

      // Add allRecipes export alias for compatibility
      if (!content.includes('export const allRecipes')) {
        content += '\n// Compatibility alias\nexport const allRecipes = getAllRecipes;\n';
      }

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(recipesDataPath, content, 'utf8');
          success('Added allRecipes export alias in recipes.ts');
          fixesApplied++;
        } else {
          log('Would add allRecipes export alias in recipes.ts');
        }
      }
    }

    // 7. Fix getCurrentElementalState export in elementalUtils.ts
    const elementalUtilsPath = 'src/utils/elementalUtils.ts';
    if (fs.existsExists(elementalUtilsPath)) {
      let content = fs.readFileSync(elementalUtilsPath, 'utf8');
      const originalContent = content;

      // Add named export for getCurrentElementalState if it exists as default
      if (content.includes('export default') && content.includes('getCurrentElementalState')) {
        const functionMatch = content.match(/function getCurrentElementalState[^}]*\}/);
        if (functionMatch && !content.includes('export const getCurrentElementalState')) {
          content += '\n// Named export for compatibility\nexport const getCurrentElementalState = defaultExport.getCurrentElementalState;\n';
        }
      }

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(elementalUtilsPath, content, 'utf8');
          success('Fixed getCurrentElementalState export in elementalUtils.ts');
          fixesApplied++;
        } else {
          log('Would fix getCurrentElementalState export in elementalUtils.ts');
        }
      }
    }

    return fixesApplied;
  } catch (err) {
    error(`Error fixing type structure issues: ${err.message}`);
    return 0;
  }
}

// Run the fix
(async () => {
  try {
    const fixes = await fixTypeStructureIssues();
    
    if (fixes > 0) {
      success(`Applied ${fixes} type structure fixes`);
    } else {
      log('No type structure fixes needed or all issues already resolved');
    }
    
    log('✨ Type structure fixing complete!');
  } catch (err) {
    error(`Script failed: ${err.message}`);
    process.exit(1);
  }
})(); 