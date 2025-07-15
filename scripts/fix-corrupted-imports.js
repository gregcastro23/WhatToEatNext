#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dryRun = process.argv.includes('--dry-run');

console.log(`🔧 Starting Corrupted Import Fix Script ${dryRun ? '(DRY RUN)' : ''}`);

// Define the corruption patterns and their fixes
const corruptionPatterns = [
  // Pattern: import @/types  from 'recipe ';
  // Fix: import type { Recipe } from '@/types/recipe';
  {
    pattern: /import @\/types\s+from 'recipe '\s*;/g,
    replacement: "import type { Recipe } from '@/types/recipe';"
  },
  {
    pattern: /import @\/types\s+from 'alchemy '\s*;/g,
    replacement: "import type { ElementalProperties, ThermodynamicMetrics } from '@/types/alchemy';"
  },
  {
    pattern: /import @\/types\s+from 'elemental '\s*;/g,
    replacement: "import type { ElementalProperties } from '@/types/alchemy';"
  },
  {
    pattern: /import @\/types\s+from 'time '\s*;/g,
    replacement: "import type { TimeOfDay } from '@/types/time';"
  },
  {
    pattern: /import @\/types\s+from 'cuisine '\s*;/g,
    replacement: "import type { Cuisine } from '@/types/cuisine';"
  },
  
  // Service imports
  {
    pattern: /import @\/services\s+from 'ElementalCalculator '\s*;/g,
    replacement: "import { ElementalCalculator } from '@/services/ElementalCalculator';"
  },
  {
    pattern: /import @\/services\s+from 'errorHandler '\s*;/g,
    replacement: "import { errorHandler } from '@/services/errorHandler';"
  },
  {
    pattern: /import @\/services\s+from 'RecipeElementalService '\s*;/g,
    replacement: "import { RecipeElementalService } from '@/services/RecipeElementalService';"
  },
  
  // Utils imports
  {
    pattern: /import @\/utils\s+from 'logger '\s*;/g,
    replacement: "import { logger } from '@/utils/logger';"
  },
  {
    pattern: /import @\/utils\s+from 'astrologyUtils '\s*;/g,
    replacement: "import { calculatePlanetaryPositions } from '@/utils/astrologyUtils';"
  },
  {
    pattern: /import @\/utils\s+from 'ingredientUtils '\s*;/g,
    replacement: "import { ingredientUtils } from '@/utils/ingredientUtils';"
  },
  {
    pattern: /import @\/utils\s+from 'recipeEnrichment '\s*;/g,
    replacement: "import { enrichRecipeData } from '@/utils/recipeEnrichment';"
  },
  {
    pattern: /import @\/utils\s+from 'recipeFilters '\s*;/g,
    replacement: "import { filterRecipesByIngredientMappings } from '@/utils/recipeFilters';"
  },
  {
    pattern: /import @\/utils\s+from 'seasonalCalculations '\s*;/g,
    replacement: "import { calculateSeasonalAffinity } from '@/utils/seasonalCalculations';"
  },
  {
    pattern: /import @\/utils\s+from 'stateManager '\s*;/g,
    replacement: "import { stateManager } from '@/utils/stateManager';"
  },
  {
    pattern: /import @\/utils\s+from 'foodRecommender '\s*;/g,
    replacement: "import { generateFoodRecommendations } from '@/utils/foodRecommender';"
  },
  {
    pattern: /import @\/utils\s+from 'lunarPhaseUtils '\s*;/g,
    replacement: "import { calculateLunarPhase } from '@/utils/lunarPhaseUtils';"
  },
  
  // Constants imports
  {
    pattern: /import @\/constants\s+from 'cuisineTypes '\s*;/g,
    replacement: "import { CUISINE_TYPES } from '@/constants/cuisineTypes';"
  },
  {
    pattern: /import @\/constants\s+from 'signEnergyStates '\s*;/g,
    replacement: "import { SIGN_ENERGY_STATES } from '@/constants/signEnergyStates';"
  },
  {
    pattern: /import @\/constants\s+from 'chakraMappings '\s*;/g,
    replacement: "import { CHAKRA_MAPPINGS } from '@/constants/chakraMappings';"
  },
  {
    pattern: /import @\/constants\s+from 'elementalConstants '\s*;/g,
    replacement: "import { ELEMENTAL_CONSTANTS } from '@/constants/elementalConstants';"
  },
  {
    pattern: /import @\/constants\s+from 'defaults '\s*;/g,
    replacement: "import { DEFAULT_VALUES } from '@/constants/defaults';"
  },
  
  // Data imports
  {
    pattern: /import @\/data\s+from 'ingredients '\s*;/g,
    replacement: "import { ingredientsMap } from '@/data/ingredients';"
  },
  {
    pattern: /import @\/data\s+from 'cuisines '\s*;/g,
    replacement: "import { cuisinesMap } from '@/data/cuisines';"
  },
  {
    pattern: /import @\/data\s+from 'seasons '\s*;/g,
    replacement: "import { seasonalData } from '@/data/seasons';"
  },
  {
    pattern: /import @\/data\s+from 'zodiacSeasons '\s*;/g,
    replacement: "import { zodiacSeasons } from '@/data/zodiacSeasons';"
  },
  
  // Context imports
  {
    pattern: /import @\/contexts\s+from 'PopupContext '\s*;/g,
    replacement: "import { usePopup } from '@/contexts/PopupContext';"
  },
  {
    pattern: /import @\/contexts\s+from 'AlchemicalContext '\s*;/g,
    replacement: "import { useAlchemical } from '@/contexts/AlchemicalContext';"
  },
  
  // Hooks imports
  {
    pattern: /import @\/hooks\s+from 'useAstrologicalState '\s*;/g,
    replacement: "import { useAstrologicalState } from '@/hooks/useAstrologicalState';"
  },
  
  // Components imports
  {
    pattern: /import @\/components\s+from 'FoodRecommender '\s*;/g,
    replacement: "import { FoodRecommender } from '@/components/FoodRecommender';"
  },
  
  // Calculations imports
  {
    pattern: /import @\/calculations\s+from 'alchemicalEngine '\s*;/g,
    replacement: "import { alchemicalEngine } from '@/calculations/alchemicalEngine';"
  },
  {
    pattern: /import @\/calculations\s+from 'seasonalCalculations '\s*;/g,
    replacement: "import { calculateSeasonalAlignment } from '@/calculations/seasonalCalculations';"
  },
  
  // Lib imports
  {
    pattern: /import @\/lib\s+from 'PlanetaryHourCalculator '\s*;/g,
    replacement: "import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';"
  },
  
  // Next.js specific imports
  {
    pattern: /import next\s+from 'image '\s*;/g,
    replacement: "import Image from 'next/image';"
  }
];

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changeCount = 0;

  for (const { pattern, replacement } of corruptionPatterns) {
    const originalContent = content;
    content = content.replace(pattern, replacement);
    if (content !== originalContent) {
      modified = true;
      const matches = originalContent.match(pattern);
      changeCount += matches ? matches.length : 0;
    }
  }

  if (modified) {
    console.log(`  ✅ Fixed ${changeCount} corrupted imports in: ${filePath}`);
    if (!dryRun) {
      fs.writeFileSync(filePath, content);
    }
    return changeCount;
  }

  return 0;
}

// Find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
        files.push(...findFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

let totalFixed = 0;
let filesModified = 0;

console.log(`\n🔍 Scanning ${files.length} files for corrupted imports...\n`);

for (const file of files) {
  const fixCount = processFile(file);
  if (fixCount > 0) {
    totalFixed += fixCount;
    filesModified++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Files scanned: ${files.length}`);
console.log(`  Files modified: ${filesModified}`);
console.log(`  Total imports fixed: ${totalFixed}`);

if (dryRun) {
  console.log(`\n⚠️  This was a dry run. To apply changes, run without --dry-run flag.`);
} else {
  console.log(`\n✅ All corrupted imports have been fixed!`);
} 