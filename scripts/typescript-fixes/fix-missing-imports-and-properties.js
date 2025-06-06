import fs from 'fs';
import path from 'path';

// Common missing imports and their sources
const missingImports = {
  'IngredientService': "import { IngredientService } from '../IngredientService';",
  'IngredientFilterService': "import { IngredientFilterService } from '../IngredientFilterService';",
  'logger': "import { logger } from '../utils/logger';",
  'cache': "import { cache } from '../utils/cache';",
  'themeManager': "import { themeManager } from '../utils/theme';",
  'createLogger': "import { createLogger } from '../utils/logger';",
  'getCurrentTransitSign': "import { getCurrentTransitSign } from '../utils/astrology';",
  'validatePlanetaryPositions': "import { validatePlanetaryPositions } from '../utils/validatePlanetaryPositions';",
  'PlanetPosition': "import type { PlanetPosition } from '../types/celestial';",
  'getCurrentTransitPositions': "import { getCurrentTransitPositions } from '../utils/validatePlanetaryPositions';",
  'connectIngredientsToMappings': "import { connectIngredientsToMappings } from '../utils/ingredientMapping';",
  'filterRecipesByIngredientMappings': "import { filterRecipesByIngredientMappings } from '../utils/recipeFiltering';",
  'getHolisticCookingRecommendations': "import { getHolisticCookingRecommendations } from '../utils/recommendation/methodRecommendation';",
  'getRecommendedCookingMethodsForIngredient': "import { getRecommendedCookingMethodsForIngredient } from '../utils/recommendation/methodRecommendation';",
  'elementalUtils': "import { elementalUtils } from '../utils/elemental';"
};

// Property fixes for common missing properties
const propertyFixes = [
  {
    name: 'elementalState property access',
    pattern: /\.elementalState(\?)?/g,
    replacement: '.elementalProperties$1',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'elementalPropertiesState property access',
    pattern: /\.elementalPropertiesState(\?)?/g,
    replacement: '.elementalProperties$1',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'casing fixes for elemental properties',
    pattern: /\{\s*Fire:/g,
    replacement: '{ Fire:',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'casing fixes for elemental properties - water',
    pattern: /,\s*Water:/g,
    replacement: ', Water:',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'casing fixes for elemental properties - earth',
    pattern: /,\s*Earth:/g,
    replacement: ', Earth:',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'casing fixes for elemental properties - Air',
    pattern: /,\s*Air:/g,
    replacement: ', Air:',
    filePattern: /\.(ts|tsx)$/
  }
];

// Function to process a single file
function processFile(filePath, isDryRun = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    const changes = [];

    // Check for missing imports
    for (const [missingName, importStatement] of Object.entries(missingImports)) {
      // Look for usage of the missing name
      const usagePattern = new RegExp(`\\b${missingName}\\b`, 'g');
      const hasUsage = usagePattern.test(content);
      
      if (hasUsage) {
        // Check if already imported
        const importPattern = new RegExp(`import.*${missingName}`, 'i');
        const alreadyImported = importPattern.test(content);
        
        if (!alreadyImported) {
          // Add import at the top
          const importSection = modifiedContent.split('\n').slice(0, 20).join('\n');
          const lastImportMatch = importSection.match(/^import.*$/gm);
          
          if (lastImportMatch) {
            const insertIndex = modifiedContent.indexOf(lastImportMatch[lastImportMatch.length - 1]) + 
                               lastImportMatch[lastImportMatch.length - 1].length;
            modifiedContent = modifiedContent.slice(0, insertIndex) + '\n' + importStatement + 
                            modifiedContent.slice(insertIndex);
          } else {
            modifiedContent = importStatement + '\n' + modifiedContent;
          }
          
          hasChanges = true;
          changes.push(`Added missing import: ${missingName}`);
        }
      }
    }

    // Apply property fixes
    for (const fix of propertyFixes) {
      if (fix.filePattern.test(filePath)) {
        const matches = [...modifiedContent.matchAll(fix.pattern)];
        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
          hasChanges = true;
          changes.push(`${fix.name}: ${matches.length} replacements`);
        }
      }
    }

    // Fix specific method access patterns
    if (modifiedContent.includes('?.elementalProperties?.[element]')) {
      modifiedContent = modifiedContent.replace(
        /\?\.(elementalProperties)\?\.\[(\w+)\]/g,
        '?.$1?.[$2]'
      );
      hasChanges = true;
      changes.push('Fixed optional property access patterns');
    }

    // Fix assignment to optional property access
    if (modifiedContent.includes('ingredient?.elementalProperties?.[element] = 0;')) {
      modifiedContent = modifiedContent.replace(
        /ingredient\?\.(elementalProperties)\?\.\[(\w+)\]\s*=/g,
        'if (ingredient.$1) { ingredient.$1[$2] ='
      );
      modifiedContent = modifiedContent.replace(
        /if \(ingredient\.elementalProperties\) \{ ingredient\.elementalProperties\[(\w+)\] = 0;/g,
        'if (ingredient.elementalProperties) { ingredient.elementalProperties[$1] = 0; }'
      );
      hasChanges = true;
      changes.push('Fixed assignment to optional property access');
    }

    if (hasChanges && !isDryRun) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
    }

    return { hasChanges, changes, filePath };
  } catch (error) {
    return { hasChanges: false, changes: [], filePath, error: error.message };
  }
}

// Function to find relevant TypeScript files (focus on high-error files)
function findRelevantFiles(dir) {
  const highErrorFiles = [
    'src/services/ConsolidatedIngredientService.ts',
    'src/data/unified/cuisineIntegrations.ts',
    'src/components/RecipeList.tsx',
    'src/app/cooking-methods/[method]/page.tsx',
    'src/data/recipes.ts',
    'src/utils/cookingMethodRecommender.ts',
    'src/utils/ingredientRecommender.ts',
    'src/calculations/core/kalchmEngine.ts',
    'src/lib/PlanetaryHourCalculator.ts',
    'src/calculations/alchemicalEngine.ts',
    'src/data/unified/seasonal.ts',
    'src/components/IngredientRecommender.tsx',
    'src/utils/astrologyUtils.ts',
    'src/utils/astrology/core.ts',
    'src/utils/validateIngredients.ts',
    'src/utils/stateManager.ts',
    'src/utils/security.ts',
    'src/utils/streamlinedPlanetaryPositions.ts',
    'src/utils/testIngredientMapping.ts',
    'src/utils/testRecommendations.ts',
    'src/utils/validatePlanetaryPositions.ts'
  ];

  const files = [];
  
  for (const filePath of highErrorFiles) {
    const fullPath = path.join(dir, filePath);
    if (fs.existsSync(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const workspaceRoot = process.cwd();
  
  console.log(`🔍 ${isDryRun ? 'DRY RUN' : 'APPLYING'}: Fix Missing Imports and Properties`);
  console.log(`📁 Workspace: ${workspaceRoot}`);
  
  const files = findRelevantFiles(workspaceRoot);
  console.log(`📄 Found ${files.length} high-error TypeScript files`);
  
  let totalChanges = 0;
  let filesModified = 0;
  const results = [];
  
  for (const file of files) {
    const result = processFile(file, isDryRun);
    
    if (result.hasChanges) {
      filesModified++;
      totalChanges += result.changes.length;
      results.push(result);
      
      if (isDryRun) {
        console.log(`📝 Would fix: ${path.relative(workspaceRoot, file)}`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      } else {
        console.log(`✅ Fixed: ${path.relative(workspaceRoot, file)}`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      }
    }
    
    if (result.error) {
      console.error(`❌ Error processing ${path.relative(workspaceRoot, file)}: ${result.error}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files ${isDryRun ? 'would be modified' : 'modified'}: ${filesModified}`);
  console.log(`   Total changes ${isDryRun ? 'would be applied' : 'applied'}: ${totalChanges}`);
  
  if (isDryRun) {
    console.log(`\n🚀 To apply these changes, run: node fix-missing-imports-and-properties.js`);
  } else {
    console.log(`\n✅ All missing imports and property fixes applied successfully!`);
  }
}

// Run the script
main(); 