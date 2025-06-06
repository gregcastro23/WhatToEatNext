import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Service mapping from old to new
const serviceMapping = {
  // AlchemicalService consolidation
  'AlchemicalTransformationService': 'AlchemicalService',
  'ElementalRecommendationService': 'AlchemicalService',
  'FoodAlchemySystem': 'AlchemicalService',
  
  // IngredientService consolidation
  'IngredientFilterService': 'IngredientService',
  'ingredientMappingService': 'IngredientService',
  
  // RecommendationService consolidation
  'RecommendationAdapter': 'RecommendationService',
  'recipeRecommendations': 'RecommendationService',
  
  // NutritionService (standalone, but updated)
  'NutritionService': 'NutritionService'
};

// Import path mapping
const importPathMapping = {
  '@/services/AlchemicalTransformationService': '@/services/AlchemicalService',
  '@/services/ElementalRecommendationService': '@/services/AlchemicalService',
  '@/services/FoodAlchemySystem': '@/services/AlchemicalService',
  '@/services/IngredientFilterService': '@/services/IngredientService',
  '@/services/ingredientMappingService': '@/services/IngredientService',
  '@/services/RecommendationAdapter': '@/services/RecommendationService',
  '@/services/recipeRecommendations': '@/services/RecommendationService',
  '@/services/NutritionService': '@/services/NutritionService',
  '../services/AlchemicalTransformationService': '../services/AlchemicalService',
  '../services/ElementalRecommendationService': '../services/AlchemicalService',
  '../services/FoodAlchemySystem': '../services/AlchemicalService',
  '../services/IngredientFilterService': '../services/IngredientService',
  '../services/ingredientMappingService': '../services/IngredientService',
  '../services/RecommendationAdapter': '../services/RecommendationService',
  '../services/recipeRecommendations': '../services/RecommendationService',
  '../services/NutritionService': '../services/NutritionService',
  './AlchemicalTransformationService': './AlchemicalService',
  './ElementalRecommendationService': './AlchemicalService',
  './FoodAlchemySystem': './AlchemicalService',
  './IngredientFilterService': './IngredientService',
  './ingredientMappingService': './IngredientService',
  './RecommendationAdapter': './RecommendationService',
  './recipeRecommendations': './RecommendationService',
  './NutritionService': './NutritionService'
};

// Check if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');
console.log(`Running in ${isDryRun ? 'dry run' : 'actual change'} mode`);

// Find all TypeScript and JavaScript files in the project
async function findTsAndJsFiles() {
  return glob('**/*.{ts,tsx,js,jsx}', {
    cwd: rootDir,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/scripts/update-service-imports.js',
      '**/services/AlchemicalService.ts',
      '**/services/IngredientService.ts',
      '**/services/RecommendationService.ts',
      '**/services/NutritionService.ts'
    ]
  });
}

// Update imports in a file
async function updateFileImports(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  try {
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    let modified = false;
    
    // Update direct imports from service files
    for (const [oldPath, newPath] of Object.entries(importPathMapping)) {
      // Match import statements for the old path
      const importRegex = new RegExp(`import\\s+([^;]+)\\s+from\\s+['"]${oldPath.replace(/\//g, '\\/')}['"]`, 'g');
      content = content.replace(importRegex, (match, importedItems) => {
        modified = true;
        return `import ${importedItems} from '${newPath}'`;
      });
      
      // Match dynamic imports
      const dynamicImportRegex = new RegExp(`import\\s*\\(\\s*['"]${oldPath.replace(/\//g, '\\/')}['"]\\s*\\)`, 'g');
      content = content.replace(dynamicImportRegex, (match) => {
        modified = true;
        return `import('${newPath}')`;
      });
    }
    
    // Update class and type references
    for (const [oldService, newService] of Object.entries(serviceMapping)) {
      // Match class instantiation
      const classRegex = new RegExp(`new\\s+${oldService}\\s*\\(`, 'g');
      content = content.replace(classRegex, (match) => {
        modified = true;
        return `new ${newService}(`;
      });
      
      // Match static method calls
      const staticMethodRegex = new RegExp(`${oldService}\\.([a-zA-Z0-9_]+)`, 'g');
      content = content.replace(staticMethodRegex, (match, methodName) => {
        modified = true;
        return `${newService}.${methodName}`;
      });
      
      // Match type references
      const typeRegex = new RegExp(`:\\s*${oldService}\\b`, 'g');
      content = content.replace(typeRegex, (match) => {
        modified = true;
        return `: ${newService}`;
      });
      
      // Match type imports
      const typeImportRegex = new RegExp(`import\\s+type\\s*\\{([^}]*)${oldService}([^}]*)\\}\\s+from`, 'g');
      content = content.replace(typeImportRegex, (match, before, after) => {
        modified = true;
        return `import type {${before}${newService}${after}} from`;
      });
    }
    
    // Only write changes if the file was modified
    if (modified) {
      console.log(`${isDryRun ? 'Would update' : 'Updated'}: ${filePath}`);
      
      if (!isDryRun) {
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    const files = await findTsAndJsFiles();
    console.log(`Found ${files.length} files to check`);
    
    let updatedCount = 0;
    
    for (const file of files) {
      const updated = await updateFileImports(file);
      if (updated) {
        updatedCount++;
      }
    }
    
    console.log(`${isDryRun ? 'Would update' : 'Updated'} ${updatedCount} files`);
    
    if (isDryRun) {
      console.log('Run again without --dry-run to apply changes');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 