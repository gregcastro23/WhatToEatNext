import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');

const files = [
  path.resolve(process.cwd(), 'src/utils/recommendation/cuisineRecommendation.ts'),
  path.resolve(process.cwd(), 'src/utils/recommendation/ingredientRecommendation.ts'),
  path.resolve(process.cwd(), 'src/utils/recommendation/methodRecommendation.ts'),
  path.resolve(process.cwd(), 'src/utils/recommendation/foodRecommendation.ts'),
  path.resolve(process.cwd(), 'src/utils/recommendationEngine.ts')
];

function fixRecommendationUtils() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing recommendation utilities...`);

  // Process each file
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`);
      return;
    }

    console.log(`Processing ${path.basename(filePath)}...`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix import statements for types
    content = fixImportStatements(content);
    
    // Fix async/await patterns
    content = fixAsyncAwaitPatterns(content);
    
    // Fix missing return types
    content = fixMissingReturnTypes(content);
    
    // Write the changes if not a dry run
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${path.basename(filePath)}`);
    } else {
      console.log(`[DRY RUN] Would fix ${path.basename(filePath)}`);
    }
  });
}

function fixImportStatements(content) {
  // Convert non-type imports to type imports where appropriate
  const typeImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  
  return content.replace(typeImportRegex, (match, imports, source) => {
    // Only convert imports that likely contain types
    if (imports.includes('type ')) {
      return match; // Already has type imports
    }
    
    const typeWords = ['Interface', 'Type', 'Enum', 'Props', 'State', 'Config', 'Options'];
    const hasTypeWords = typeWords.some(word => imports.includes(word));
    
    // Check if the imports are for type definitions
    if (hasTypeWords || (source.includes('/types/') && !source.includes('/components/'))) {
      // Convert to type import by adding 'type' before each import item
      const typeImports = imports
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => `type ${item}`)
        .join(', ');
      
      return `import { ${typeImports} } from '${source}'`;
    }
    
    return match;
  });
}

function fixAsyncAwaitPatterns(content) {
  // Look for Promise-returning functions that don't use async keyword
  const promiseReturnRegex = /function\s+(\w+)\s*\([^)]*\)\s*:\s*Promise<[^>]+>/g;
  content = content.replace(promiseReturnRegex, (match, funcName) => {
    if (!match.includes('async function')) {
      return match.replace('function', 'async function');
    }
    return match;
  });
  
  // Look for arrow functions that return Promises but don't use async
  const arrowPromiseRegex = /const\s+(\w+)\s*=\s*(\([^)]*\))\s*:\s*Promise<[^>]+>\s*=>/g;
  content = content.replace(arrowPromiseRegex, (match, funcName, params) => {
    if (!match.includes('async')) {
      return `const ${funcName} = async ${params} =>`;
    }
    return match;
  });
  
  // Look for calls to async functions without await
  const asyncCallsRegex = /(calculateLunarPhase|calculatePlanetaryPositions|calculatePlanetaryAspects|getAstrologicalState|getPlanetaryPositions|getIngredientData)\(/g;
  
  content = content.replace(asyncCallsRegex, (match, funcName) => {
    // Check if it's already awaited
    const prevText = content.substring(Math.max(0, content.indexOf(match) - 20), content.indexOf(match));
    if (!prevText.includes('await ') && !prevText.includes('Promise.all(')) {
      return `await ${funcName}(`;
    }
    return match;
  });
  
  return content;
}

function fixMissingReturnTypes(content) {
  // Map of function names to their expected return types
  const functionReturnTypes = {
    'generateTopSauceRecommendations': 'any[]',
    'recommendCuisines': 'CuisineRecommendation[]',
    'meetsAllDietaryRequirements': 'boolean',
    'findRecommendedDishes': 'string[]',
    'getQuickCuisineRecommendation': 'string[]',
    'calculateElementalMatch': 'number',
    'getMatchScoreClass': 'string',
    'renderScoreBadge': 'string',
    'calculateElementalProfileFromZodiac': 'ElementalProperties',
    'calculateElementalContributionsFromPlanets': 'ElementalProperties',
    'calculateBaseScore': 'number',
    'calculateCuisineScore': 'number',
    'getCuisineRecommendations': 'CuisineRecommendation[]',
    'getIngredientRecommendations': 'GroupedIngredientRecommendations',
    'getRecommendedCookingMethodsForIngredient': 'any[]',
    'generateCookingMethodRecommendations': 'any[]',
    'getFoodRecommendationsFromCurrentState': 'any[]'
  };
  
  // Fix missing return types for functions
  for (const [funcName, returnType] of Object.entries(functionReturnTypes)) {
    // Match function declarations without return types
    const funcRegex = new RegExp(`(export\\s+)?(function|const)\\s+${funcName}\\s*(\\([^)]*\\))\\s*(:|=>)`, 'g');
    
    content = content.replace(funcRegex, (match, exportKeyword, funcType, params, separator) => {
      // Check if it's already has a return type
      if (match.includes(`: ${returnType}`) || match.includes(`: Promise<${returnType}>`)) {
        return match;
      }
      
      const exportPrefix = exportKeyword || '';
      
      if (funcType === 'function') {
        return `${exportPrefix}function ${funcName}${params}: ${returnType} `;
      } else {
        // It's a const function
        return `${exportPrefix}const ${funcName} = ${params}: ${returnType} `;
      }
    });
  }
  
  return content;
}

// Run the fix function
try {
  fixRecommendationUtils();
} catch (error) {
  console.error('Error fixing recommendation utilities:', error);
  process.exit(1);
} 