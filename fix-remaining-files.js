const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining files with import issues...');

// Fix alchemicalPillarUtils.ts properly
function fixAlchemicalPillarUtils() {
  console.log('Fixing alchemicalPillarUtils.ts...');
  const filePath = path.join(process.cwd(), 'src/utils/alchemicalPillarUtils.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('alchemicalPillarUtils.ts not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the problematic import with a proper one
  content = content.replace(
    /from ['"]\.\.\/constants \/ \(alchemicalPillars \|\| 1\)['"]/g,
    "from '../constants/alchemicalPillars'"
  );
  
  // Make sure we don't have any more broken imports
  content = content.replace(/from ['"]([^'"]*)\s+\/\s+([^'"]*)['"]/g, 'from "$1/$2"');
  
  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed alchemicalPillarUtils.ts');
  return true;
}

// Fix more recipe-related imports
function fixMoreRecipeRelatedImports() {
  console.log('Fixing more recipe-related imports...');
  const filesToFix = [
    'src/utils/recipeFilters.ts',
    'src/utils/recipeMatching.ts',
    'src/utils/testRecommendations.ts',
    'src/utils/validation.ts'
  ];
  
  const fixedCount = 0;
  
  filesToFix.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`${relPath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix import from "@/types/(alchemy || 1)"
    content = content.replace(
      /from ["']@\/types\/\(alchemy \|\| 1\)["']/g, 
      'from "@/types/alchemy"'
    );
    
    // Fix very specific types of import errors
    if (relPath.includes('recipeFilters.ts')) {
      content = content.replace(
        /import @\/data\s+from\s+['"]cuisines\s+['"];/g,
        "import { availableCuisines } from '@/data/cuisines';"
      );
      
      content = content.replace(
        /import @\/types\s+from\s+['"]cuisine\s+['"];/g,
        "import { CuisineType } from '@/types/cuisine';"
      );
    }
    
    if (relPath.includes('recipeMatching.ts')) {
      content = content.replace(
        /import @\/data\s+from\s+['"]ingredients\s+['"];/g,
        "import { ingredients } from '@/data/ingredients';"
      );
      
      content = content.replace(
        /import @\/services\s+from\s+['"]LocalRecipeService\s+['"];/g,
        "import { getRecipes } from '@/services/LocalRecipeService';"
      );
    }
    
    if (relPath.includes('testRecommendations.ts')) {
      content = content.replace(
        /import \.\.\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g,
        "import { transformAlchemically } from '../calculations/alchemicalTransformation'"
      );
    }
    
    if (relPath.includes('validation.ts')) {
      content = content.replace(
        /import @\/types\s+from\s+['"]recipe\s+['"];/g,
        "import { Recipe } from '@/types/recipe';"
      );
    }
    
    // Write back to file
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${relPath}`);
    fixedCount++;
  });
  
  console.log(`Fixed more recipe-related imports in ${fixedCount} files`);
  return fixedCount > 0;
}

// Run the fixes
try {
  fixAlchemicalPillarUtils();
  fixMoreRecipeRelatedImports();
  
  console.log('\n🎉 All remaining import issues fixed! Run "yarn build" to check.');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
} 