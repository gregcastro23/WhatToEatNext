#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing critical service and utility syntax errors');
if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Priority files based on error counts and functionality importance
const priorityFiles = [
  'src/services/celestialCalculations.ts',
  'src/services/DirectRecipeService.ts', 
  'src/lib/FoodAlchemySystem.ts',
  'src/utils/fixAssignmentError.js',
  'src/lib/recipeFilter.ts',
  'src/contexts/PopupContext/provider.tsx',
  'src/lib/recipeEngine.ts',
  'src/hooks/useRealtimePlanetaryPositions.ts',
  'src/utils/enhancedCuisineRecommender.ts',
  'src/services/EnhancedRecommendationService.ts',
  'src/services/initializationService.ts',
  'src/services/SpoonacularElementalMapper.ts',
  'src/services/SpoonacularService.ts',
  'src/services/unifiedNutritionalService.ts',
  'src/types/ExtendedRecipe.ts',
  'src/types/validators.ts',
  'src/utils/cookingMethodRecommender.ts',
  'src/utils/seasonalCalculations.ts',
  'src/lib/alchemicalEngine.ts',
  'src/lib/chakraRecipeEnhancer.ts',
  'src/lib/cuisineCalculations.ts',
  'src/constants/seasonalCore.ts'
];

// Common syntax error patterns and their fixes
const syntaxFixes = [
  // Fix corrupted array access patterns
  {
    pattern: /(\w+)\?\s+\|\|\s+\[\]/g,
    replacement: '($1 || [])',
    description: 'Fix corrupted array access patterns'
  },
  
  // Fix malformed conditional access
  {
    pattern: /\(\s*([^)]+)\s+\|\|\s+\[\]/g,
    replacement: '($1 || [])',
    description: 'Fix malformed conditional array access'
  },
  
  // Fix property access syntax errors like "criteria.(Array.isArray..."
  {
    pattern: /(\w+)\.\(Array\.isArray\(/g,
    replacement: 'Array.isArray($1.',
    description: 'Fix malformed property access with Array.isArray'
  },
  
  // Fix missing closing parentheses in includes calls
  {
    pattern: /\.includes\(([^)]+)\s+\{/g,
    replacement: '.includes($1) {',
    description: 'Fix missing closing parentheses in includes calls'
  },
  
  // Fix malformed object property access
  {
    pattern: /(\w+)\.\(([^)]+)\)\?/g,
    replacement: '($1[$2])',
    description: 'Fix malformed object property access'
  },
  
  // Fix corrupted optional chaining
  {
    pattern: /\?\s+\|\|\s+\[\]/g,
    replacement: ' || []',
    description: 'Fix corrupted optional chaining patterns'
  },
  
  // Fix double optional chaining
  {
    pattern: /\?\?\s+\|\|\s+\[\]/g,
    replacement: ' || []',
    description: 'Fix double optional chaining'
  },
  
  // Fix expression syntax errors
  {
    pattern: /(\w+)\?\s+(\|\||&&)/g,
    replacement: '$1 $2',
    description: 'Fix expression syntax with optional chaining'
  },
  
  // Fix malformed conditional expressions
  {
    pattern: /\(\s*\{\s*([^}]+)\s*\}\s*\|\|\s*\[\]\s*\)/g,
    replacement: '($1 || [])',
    description: 'Fix malformed conditional expressions'
  },
  
  // Fix incomplete ternary operations
  {
    pattern: /\?\s+([^:]+)\s+:/g,
    replacement: '? $1 :',
    description: 'Fix incomplete ternary operations'
  }
];

// More complex fixes for specific patterns
const complexFixes = [
  // Fix incomplete try-catch blocks
  {
    pattern: /(\s+)}\s*catch\s*\(\s*error\s*\)\s*\{/g,
    replacement: '$1} catch (error) {',
    description: 'Fix incomplete try-catch blocks'
  },
  
  // Fix malformed function parameters with optional chaining
  {
    pattern: /\(([^)]+)\?\s*\)/g,
    replacement: '($1)',
    description: 'Fix malformed function parameters'
  },
  
  // Fix missing return type separators
  {
    pattern: /\):\s*([A-Z][^{]+)\s*\{/g,
    replacement: '): $1 {',
    description: 'Fix missing return type separators'
  }
];

// Special fixes for celestialCalculations.ts
const celestialCalculationsFixes = [
  // Fix method definitions
  {
    pattern: /private\s+(\w+)\(([^)]+)\):\s*([^{]+)\s*\{/g,
    replacement: 'private $1($2): $3 {',
    description: 'Fix private method definitions'
  },
  
  // Fix class method syntax
  {
    pattern: /^\s*(\w+)\(([^)]*)\):\s*([^{]+)\s*\{/gm,
    replacement: '  $1($2): $3 {',
    description: 'Fix class method syntax'
  }
];

// Apply a fix to content
function applyFix(content, fix) {
  const original = content;
  content = content.replace(fix.pattern, fix.replacement);
  
  if (content !== original) {
    console.log(`  ✓ Applied: ${fix.description}`);
  }
  
  return content;
}

// Apply all fixes to a file
function fixFileContent(filePath, content) {
  console.log(`\n📝 Processing: ${filePath}`);
  
  let fixedContent = content;
  
  // Apply common syntax fixes
  syntaxFixes.forEach(fix => {
    fixedContent = applyFix(fixedContent, fix);
  });
  
  // Apply complex fixes
  complexFixes.forEach(fix => {
    fixedContent = applyFix(fixedContent, fix);
  });
  
  // Apply special fixes for celestialCalculations
  if (filePath.includes('celestialCalculations.ts')) {
    celestialCalculationsFixes.forEach(fix => {
      fixedContent = applyFix(fixedContent, fix);
    });
  }
  
  // Additional file-specific fixes
  if (filePath.includes('fixAssignmentError.js')) {
    // Fix the malformed object syntax
    fixedContent = fixedContent.replace(
      /elementalProperties:\s*{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*}\s*},/g,
      'elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },'
    );
    
    // Fix the malformed try-catch structure
    fixedContent = fixedContent.replace(
      /}\s*}\s*catch\s*\(\s*error\s*\)\s*\{/g,
      '  }\n} catch (error) {'
    );
  }
  
  if (filePath.includes('DirectRecipeService.ts')) {
    // Fix specific malformed conditionals
    fixedContent = fixedContent.replace(
      /return recipe\.zodiacInfluences\?\s+\|\|\s+\[\]\.some\(sign => sign\?\.toLowerCase\(\) === normalizedZodiacSign\s+\);/g,
      'return (recipe.zodiacInfluences || []).some(sign => sign?.toLowerCase() === normalizedZodiacSign);'
    );
    
    // Fix criteria property access
    fixedContent = fixedContent.replace(
      /criteria\.\(Array\.isArray\(([^)]+)\?\s*\)\s*\?\s*([^:]+):\s*([^)]+)\?\s*===\s*([^)]+)\)/g,
      'Array.isArray($1) ? $2 : $3 === $4'
    );
  }
  
  return fixedContent;
}

// Process each priority file
async function processFiles() {
  let totalFixed = 0;
  let totalErrors = 0;
  
  for (const relativePath of priorityFiles) {
    const filePath = path.join(ROOT_DIR, relativePath);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${relativePath}`);
        continue;
      }
      
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const fixedContent = fixFileContent(relativePath, originalContent);
      
      if (fixedContent !== originalContent) {
        totalFixed++;
        
        if (DRY_RUN) {
          console.log(`  📋 Would fix: ${relativePath}`);
        } else {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`  ✅ Fixed: ${relativePath}`);
        }
      } else {
        console.log(`  ℹ️  No changes needed: ${relativePath}`);
      }
      
    } catch (error) {
      totalErrors++;
      console.error(`  ❌ Error processing ${relativePath}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${priorityFiles.length}`);
  console.log(`  Files ${DRY_RUN ? 'that would be ' : ''}fixed: ${totalFixed}`);
  console.log(`  Errors encountered: ${totalErrors}`);
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply these fixes');
  } else {
    console.log('\n✨ Syntax fixes applied! Run yarn build to verify.');
  }
}

// Main execution
processFiles().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 