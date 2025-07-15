#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.resolve(__dirname, '../..');

console.log('🔧 Fixing TODO import statements');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Common import patterns and their fixes
const IMPORT_FIXES = {
  // Logger imports
  './logger': "import { logger } from './logger';",
  './logger.ts': "import { logger } from './logger';",
  
  // Cache imports
  './cache': "import { cache } from './cache';",
  './cache.ts': "import { cache } from './cache';",
  
  // Theme imports
  './theme': "import { ThemeManager } from './theme';",
  './theme.ts': "import { ThemeManager } from './theme';",
  
  // Elemental utils imports
  './// elementalUtils.ts': "import { calculateElementalCompatibility } from './elemental/elementalUtils';",
  './elementalUtils.ts': "import { calculateElementalCompatibility } from './elemental/elementalUtils';",
  
  // Calculation utils
  './calculationUtils.ts': "import { calculateTemperatureEffect } from './calculationUtils';",
  
  // Global error handler
  './globalErrorHandler.ts': "import { setupGlobalErrorHandlers } from './globalErrorHandler';",
  
  // Environment
  './env.ts': "import { validateEnv } from './env';",
  
  // Database cleanup
  './databaseCleanup.ts': "import { cleanupIngredientsDatabase } from './databaseCleanup';",
  
  // Astrology utils
  './astrologyUtils.ts': "import { calculatePlanetaryPositions } from './astrologyUtils';",
  './astrologyUtils': "import { calculatePlanetaryPositions } from './astrologyUtils';",
  
  // Accurate astronomy
  './accurateAstronomy.ts': "import { getAccuratePlanetaryPositions } from './accurateAstronomy';",
  
  // House effects
  './houseEffects.ts': "import { calculateHouseEffect } from './houseEffects';",
  
  // Aspect calculator
  './aspectCalculator.ts': "import { calculateComprehensiveAspects } from './aspectCalculator';",
  
  // Zodiac utils
  './zodiacUtils.ts': "import { getZodiacElement } from './zodiacUtils';",
  
  // Moon times
  './moonTimes.ts': "import { calculateMoonTimes } from './moonTimes';",
  
  // Sun times
  './sunTimes.ts': "import { calculateSunTimes } from './sunTimes';",
  
  // Planetary cycles
  './planetaryCycles.ts': "import { calculateTokenizedValues } from './planetaryCycles';",
  
  // Validate planetary positions
  './validatePlanetaryPositions.ts': "import { validatePlanetaryPositions } from './validatePlanetaryPositions';",
  
  // Recipe matching
  './recipeMatching.ts': "import { calculateMatchScore } from './recipeMatching';",
  
  // Recipe filters
  './recipeFilters.ts': "import { filterRecipesByElements } from './recipeFilters';",
  
  // Elemental Calculator
  './ElementalCalculator.ts': "import { ElementalCalculator } from '../services/ElementalCalculator';",
  
  // Alchemical transformation utils
  './alchemicalTransformationUtils.ts': "import { transformIngredients } from './alchemicalTransformationUtils';",
  
  // Alchemical pillar utils
  './alchemicalPillarUtils.ts': "import { calculateCookingMethodCompatibility } from './alchemicalPillarUtils';",
  
  // Recipe data (services)
  './recipeData.ts': "// Recipe data service not yet implemented",
  
  // Celestial calculations (services)
  './celestialCalculations.ts': "// Celestial calculations service not yet implemented",
  
  // Error handler (services)
  './errorHandler.ts': "// Using local error handler implementation",
  
  // Ingredient service
  './IngredientService.ts': "// Using ConsolidatedIngredientService instead",
  
  // Ingredient filter service
  './IngredientFilterService.ts': "// Using ConsolidatedIngredientService instead"
};

function findFilesWithTodoImports() {
  const files = [];
  const searchDirs = ['src/utils', 'src/services'];
  
  for (const dir of searchDirs) {
    const fullDir = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullDir)) {
      findFilesRecursively(fullDir, files);
    }
  }
  
  return files.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
}

function findFilesRecursively(directory, files) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findFilesRecursively(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
}

function fixTodoImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const appliedFixes = [];

  // Find all TODO import lines
  const todoLines = content.split('\n').filter(line => 
    line.includes('TODO') && line.includes('Fix import')
  );

  if (todoLines.length === 0) {
    return;
  }

  console.log(`\n📁 Processing: ${path.relative(ROOT_DIR, filePath)}`);
  console.log(`   Found ${todoLines.length} TODO import(s)`);

  // Process each TODO import line
  for (const line of todoLines) {
    // Extract the import path from the TODO comment
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      const importPath = match[1];
      const fix = IMPORT_FIXES[importPath];
      
      if (fix) {
        if (fix.startsWith('//')) {
          // Replace with comment
          content = content.replace(line, fix);
        } else {
          // Replace with actual import
          content = content.replace(line, fix);
        }
        modified = true;
        appliedFixes.push(`Fixed import: ${importPath}`);
      } else {
        // Remove the TODO line if we don't have a specific fix
        content = content.replace(line + '\n', '');
        modified = true;
        appliedFixes.push(`Removed TODO: ${importPath}`);
      }
    }
  }

  if (modified) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    console.log(`   ✅ Applied ${appliedFixes.length} fixes`);
    appliedFixes.forEach(fix => console.log(`      - ${fix}`));
  }
}

// Main execution
function main() {
  console.log('🔍 Searching for files with TODO imports...');
  
  const files = findFilesWithTodoImports();
  console.log(`Found ${files.length} TypeScript files to check`);
  
  let totalFixed = 0;
  
  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    fixTodoImports(file);
    const after = fs.readFileSync(file, 'utf8');
    
    if (before !== after) {
      totalFixed++;
    }
  }
  
  console.log(`\n🎯 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files modified: ${totalFixed}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN - No files were actually modified');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ All TODO imports have been processed');
  }
}

main(); 