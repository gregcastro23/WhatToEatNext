import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');

const files = [
  path.resolve(process.cwd(), 'src/services/LocalRecipeService.ts'),
  path.resolve(process.cwd(), 'src/services/unifiedRecipeService.ts'),
  path.resolve(process.cwd(), 'src/services/RecipeElementalService.ts')
];

function fixRecipeServices() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing RecipeService implementations...`);

  // Process each file
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`);
      return;
    }

    console.log(`Processing ${path.basename(filePath)}...`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // LocalRecipeService specific fixes
    if (filePath.includes('LocalRecipeService.ts')) {
      fixLocalRecipeService(filePath, content);
    } 
    // unifiedRecipeService specific fixes
    else if (filePath.includes('unifiedRecipeService.ts')) {
      fixUnifiedRecipeService(filePath, content);
    }
    // RecipeElementalService specific fixes
    else if (filePath.includes('RecipeElementalService.ts')) {
      fixRecipeElementalService(filePath, content);
    }
  });
}

function fixLocalRecipeService(filePath, content) {
  console.log('Fixing LocalRecipeService typing issues...');
  
  // 1. Fix import for Recipe type if needed
  if (!content.includes('import type { Recipe }')) {
    content = content.replace(
      /import \{ Recipe \}/,
      'import type { Recipe }'
    );
  }
  
  // 2. Ensure proper types for class methods
  // Map of method names to their expected return types
  const methodReturnTypes = {
    'getAllRecipes': 'Promise<Recipe[]>',
    'getRecipesByCuisine': 'Promise<Recipe[]>',
    'getRecipesFromCuisine': 'Promise<Recipe[]>',
    'standardizeRecipe': 'Recipe',
    'searchRecipes': 'Promise<Recipe[]>',
    'getRecipesByMealType': 'Promise<Recipe[]>',
    'getRecipesBySeason': 'Promise<Recipe[]>',
    'clearCache': 'void'
  };
  
  // Fix method return types
  for (const [method, returnType] of Object.entries(methodReturnTypes)) {
    const methodRegex = new RegExp(`(static|private static)\\s+${method}\\s*\\([^)]*\\)\\s*(:)?\\s*([^{]*)?\\s*\\{`, 'g');
    
    content = content.replace(methodRegex, (match, access, hasReturnType, existingReturnType) => {
      // If method already has the correct return type, don't change it
      if (hasReturnType && existingReturnType && existingReturnType.trim() === returnType) {
        return match;
      }
      
      // Extract the parameters part
      const paramsMatch = match.match(/\(([^)]*)\)/);
      const params = paramsMatch ? paramsMatch[1] : '';
      
      // Replace with properly typed method
      return `${access} ${method}(${params}): ${returnType} {`;
    });
  }
  
  // 3. Fix standardizeRecipe method parameter types
  const standardizeRecipeRegex = /(private static standardizeRecipe\s*\()([^)]*?)(\)\s*:\s*Recipe\s*\{)/;
  const standardizeRecipeParams = `
    dish: RawDish, 
    cuisineName: string, 
    seasons: string[] = ['all'],
    mealTypes: string[] = ['any']
  `;
  
  content = content.replace(standardizeRecipeRegex, `$1${standardizeRecipeParams}$3`);
  
  // Write the changes if not a dry run
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed LocalRecipeService');
  } else {
    console.log('[DRY RUN] Would fix LocalRecipeService');
  }
}

function fixUnifiedRecipeService(filePath, content) {
  console.log('Fixing unifiedRecipeService typing issues...');
  
  // Add necessary imports if missing
  const imports = [
    'import type { Recipe } from \'@/types/recipe\';',
    'import type { ElementalProperties } from \'@/types/elemental\';'
  ];
  
  // Add missing imports
  for (const importStatement of imports) {
    if (!content.includes(importStatement.replace(/'/g, '"')) && !content.includes(importStatement)) {
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf('import');
      const lastImportEndIndex = lastImportIndex !== -1 ? 
        content.indexOf('\n', content.indexOf(';', lastImportIndex)) + 1 : 0;
      
      content = content.slice(0, lastImportEndIndex) + 
                importStatement + '\n' + 
                content.slice(lastImportEndIndex);
    }
  }
  
  // Fix method return types
  const methodReturnTypes = {
    'getRecipesByElement': 'Recipe[]',
    'getRecipesBySeason': 'Recipe[]',
    'getRecipesByMealType': 'Recipe[]',
    'getRecipeById': 'Recipe | undefined',
    'getAllRecipes': 'Recipe[]'
  };
  
  for (const [method, returnType] of Object.entries(methodReturnTypes)) {
    const methodRegex = new RegExp(`(export function|function)\\s+${method}\\s*\\([^)]*\\)\\s*(:)?\\s*([^{]*)?\\s*\\{`, 'g');
    
    content = content.replace(methodRegex, (match, declaration, hasReturnType, existingReturnType) => {
      // If method already has the correct return type, don't change it
      if (hasReturnType && existingReturnType && existingReturnType.trim() === returnType) {
        return match;
      }
      
      // Extract the parameters part
      const paramsMatch = match.match(/\(([^)]*)\)/);
      const params = paramsMatch ? paramsMatch[1] : '';
      
      // Replace with properly typed method
      return `${declaration} ${method}(${params}): ${returnType} {`;
    });
  }
  
  // Write the changes if not a dry run
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed unifiedRecipeService');
  } else {
    console.log('[DRY RUN] Would fix unifiedRecipeService');
  }
}

function fixRecipeElementalService(filePath, content) {
  console.log('Fixing RecipeElementalService typing issues...');
  
  // 1. Fix constructor visibility if needed (should be protected, not private)
  content = content.replace(
    /private constructor\(/,
    'protected constructor('
  );
  
  // 2. Fix method return types
  const methodReturnTypes = {
    'getInstance': 'RecipeElementalService',
    'getRecipesMatchingElementalState': 'Recipe[]',
    'filterRecipesByElementalMatch': 'Recipe[]',
    'calculateElementalMatch': 'number',
    'getElementalState': 'ElementalProperties'
  };
  
  for (const [method, returnType] of Object.entries(methodReturnTypes)) {
    const methodRegex = new RegExp(`(public|private|protected|static)\\s+(${method})\\s*\\([^)]*\\)\\s*(:)?\\s*([^{]*)?\\s*\\{`, 'g');
    
    content = content.replace(methodRegex, (match, access, methodName, hasReturnType, existingReturnType) => {
      // If method already has the correct return type, don't change it
      if (hasReturnType && existingReturnType && existingReturnType.trim() === returnType) {
        return match;
      }
      
      // Extract the parameters part
      const paramsMatch = match.match(/\(([^)]*)\)/);
      const params = paramsMatch ? paramsMatch[1] : '';
      
      // Replace with properly typed method
      return `${access} ${methodName}(${params}): ${returnType} {`;
    });
  }
  
  // Write the changes if not a dry run
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed RecipeElementalService');
  } else {
    console.log('[DRY RUN] Would fix RecipeElementalService');
  }
}

// Run the fix function
try {
  fixRecipeServices();
} catch (error) {
  console.error('Error fixing RecipeServices:', error);
  process.exit(1);
} 