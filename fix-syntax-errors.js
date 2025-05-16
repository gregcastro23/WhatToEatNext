const fs = require('fs');
const path = require('path');

console.log('🔧 Starting targeted syntax error fixes...');

// Fix IngredientRecommender.tsx syntax errors
function fixIngredientRecommender() {
  console.log('Fixing IngredientRecommender.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/IngredientRecommender.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('IngredientRecommender.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix broken properties with || {}
  content = content.replace(/(\w+)\?\.\w+ \|\| \{\}(\w+)/g, '$1?.$2');
  
  // Fix regex patterns
  content = content.replace(/\/_ \/ \(g \|\| 1\), ' '\//g, "/_/g, ' '/");
  content = content.replace(/\/\b\w \/ \(g \|\| 1\), /g, "/\\b\\w/g, ");
  
  // Fix optional chaining with decimals
  content = content.replace(/(\d+)\?\.\d+ \|\| \{\}/g, match => {
    return match.replace('?', '').replace(' || {}', '');
  });
  
  // Fix method calls with || {}
  content = content.replace(/\.toUpperCase \|\| \{\}\(\)/g, '.toUpperCase()');
  
  // Fix property access on objects with || {}
  content = content.replace(/(\w+)\?\.(\w+) \|\| \{\}/g, '$1?.$2');
  
  // Fix element access and conditions
  content = content.replace(/categories\?\.oil \|\| \{\}s/g, "categories?.oils");
  content = content.replace(/categories\.oils \|\| \{\}/g, "categories.oils || []");
  
  // Fix property access in objects
  content = content.replace(/elementalPropertie \|\| \{\}s/g, "elementalProperties");
  content = content.replace(/culinaryApplication \|\| \{\}s/g, "culinaryApplications");
  content = content.replace(/thermodynamicPropertie \|\| \{\}s/g, "thermodynamicProperties");
  content = content.replace(/sensoryProfil \|\| \{\}e/g, "sensoryProfile");
  content = content.replace(/descriptio \|\| \{\}n/g, "description");
  content = content.replace(/smokePoin \|\| \{\}t/g, "smokePoint");
  content = content.replace(/qualitie \|\| \{\}s/g, "qualities");
  content = content.replace(/nam \|\| \{\}e/g, "name");
  
  // Write changes back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed IngredientRecommender.tsx');
  return true;
}

// Fix import path errors
function fixImportPaths() {
  console.log('Fixing import path errors...');
  const filesToCheck = [
    'src/utils/astrologyUtils.ts',
    'src/utils/alchemicalPillarUtils.ts',
    'src/utils/alchemicalTransformationUtils.ts',
    'src/utils/accurateAstronomy.ts'
  ];
  
  let fixedCount = 0;
  
  filesToCheck.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`${relPath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix broken import paths
    content = content.replace(/from ['"]([^'"]+) \/ \([^)]+\)['"];?/g, 'from "$1";');
    content = content.replace(/import \.\.\/([\w\/]+) from ['"]([^'"]+)['"];?/g, 'import { $1 } from "$2";');
    content = content.replace(/import @\/([\w\/]+) from ['"]([^'"]+)['"];?/g, 'import { $1 } from "@/$2";');
    
    // Fix lunar cycle division issues
    content = content.replace(/(\w+) \/ \((\d+) \|\| 1\)(\.?\d*)/g, '$1 / $2$3');
    
    // Write changes if the file was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`✅ Fixed ${relPath}`);
    }
  });
  
  console.log(`Fixed import paths in ${fixedCount} files`);
  return fixedCount > 0;
}

// Fix division operator issues in general
function fixDivisionOperators() {
  console.log('Fixing division operator issues...');
  const directoriesToSearch = [
    'src/components',
    'src/utils',
    'src/services'
  ];
  
  const keyFiles = [
    'src/components/IngredientRecommender.tsx',
    'src/utils/elementalUtils.ts',
    'src/services/AlchemicalTransformationService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  const fixedCount = 0;
  
  keyFiles.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`${relPath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix division syntax that causes parse errors
    content = content.replace(/\/ \((\d+) \|\| 1\)/g, '/$1');
    content = content.replace(/\/ \((\w+) \|\| 1\)/g, '/$1');
    
    // Write changes if the file was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`✅ Fixed division operators in ${relPath}`);
    }
  });
  
  console.log(`Fixed division operators in ${fixedCount} files`);
  return fixedCount > 0;
}

// Run all fixes
try {
  const ingredientFixed = fixIngredientRecommender();
  const importsFixed = fixImportPaths();
  const divisionsFixed = fixDivisionOperators();
  
  if (ingredientFixed || importsFixed || divisionsFixed) {
    console.log('\n🎉 Syntax errors fixed! Run "yarn build" to check the results.');
  } else {
    console.log('\n⚠️ No changes made. Issues may require manual inspection.');
  }
} catch (error) {
  console.error(`❌ Error fixing syntax: ${error.message}`);
} 