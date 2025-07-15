import fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

// Final comprehensive fixes for all remaining syntax errors
const FINAL_SYNTAX_FIXES = [
  {
    file: 'src/components/CuisineRecommender.tsx',
    patterns: [
      {
        // The JSX error is likely caused by an unclosed function or missing closing brace
        // Let's look for the function that contains the return statement
        pattern: /(\w+)\s*\(\s*\)\s*\{\s*return\s+transformedCuisines/g,
        replacement: '$1() {\n    return transformedCuisines',
        description: 'Fix function structure before return statement'
      }
    ]
  },
  {
    file: 'src/services/IngredientService.ts',
    patterns: [
      {
        // Fix malformed safeSome call at line 479
        pattern: /safeSome\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\], tags\) === 'gluten'\)\) \{/g,
        replacement: 'safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag => tag === \'gluten\')) {',
        description: 'Fix malformed safeSome call for gluten check'
      }
    ]
  },
  {
    file: 'src/services/LocalRecipeService.ts',
    patterns: [
      {
        // Fix missing closing parenthesis in find function
        pattern: /\(Array\.isArray\(normalizedName\) \? normalizedName\.includes\(c\?\.name\?\.toLowerCase\(\)\) : normalizedName === c\?\.name\?\.toLowerCase\(\)\)\s*\n\s*if \(byIdMatch/g,
        replacement: '(Array.isArray(normalizedName) ? normalizedName.includes(c?.name?.toLowerCase()) : normalizedName === c?.name?.toLowerCase())\n        );\n        \n        if (byIdMatch',
        description: 'Fix missing closing parenthesis and semicolon in find function'
      }
    ]
  },
  {
    file: 'src/services/RecipeElementalService.ts',
    patterns: [
      {
        // Fix malformed if condition at line 120
        pattern: /if \(Array\.isArray\(\(method\) \? \(method\.includes\('roast'\) : \(method === 'roast'\) \|\| \(Array\.isArray\(method\) \? method\.includes\('grill'\) : method === 'grill'\) \|\| \(Array\.isArray\(method\) \? method\.includes\('bake'\) : method === 'bake'\)\) \{/g,
        replacement: 'if (method.includes(\'roast\') || method.includes(\'grill\') || method.includes(\'bake\')) {',
        description: 'Fix malformed if condition for cooking methods'
      }
    ]
  },
  {
    file: 'src/services/RecommendationAdapter.ts',
    patterns: [
      {
        // Fix malformed property access at line 225
        pattern: /Object\.entries\(this\.\(tarotElementBoosts\)\?\s+\|\|\s+\[\]\)\.forEach/g,
        replacement: 'Object.entries(this.tarotElementBoosts || {}).forEach',
        description: 'Fix malformed property access in tarot element boosts'
      }
    ]
  }
];

function fixFile(filePath, patterns) {
  let fixesApplied = 0;
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  for (const pattern of patterns) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      console.log(`🔧 ${DRY_RUN ? 'WOULD FIX' : 'FIXING'}: ${pattern.description}`);
      console.log(`   Pattern matches found: ${matches.length}`);
      
      if (!DRY_RUN) {
        content = content.replace(pattern.pattern, pattern.replacement);
        fixesApplied++;
      } else {
        fixesApplied += matches.length;
      }
    }
  }

  if (!DRY_RUN && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Applied ${fixesApplied} fixes to ${filePath}`);
  } else if (DRY_RUN && fixesApplied > 0) {
    console.log(`📋 Would apply ${fixesApplied} fixes to ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }

  return fixesApplied;
}

// Special function to manually fix the CuisineRecommender JSX issue
function fixCuisineRecommenderJSX() {
  const filePath = 'src/components/CuisineRecommender.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Look for the function that contains the return statement around line 722
  for (let i = 700; i < 725; i++) {
    if (lines[i] && lines[i].includes('return (')) {
      // Check if the previous lines have proper function structure
      for (let j = i - 10; j < i; j++) {
        if (lines[j] && lines[j].includes('function ') && !lines[j].includes('{')) {
          // Add missing opening brace
          lines[j] = lines[j] + ' {';
          console.log(`🔧 ${DRY_RUN ? 'WOULD FIX' : 'FIXING'}: Added missing opening brace to function at line ${j + 1}`);
          
          if (!DRY_RUN) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
          }
          return 1;
        }
      }
    }
  }
  
  return 0;
}

function main() {
  console.log(`🔧 ${DRY_RUN ? 'DRY RUN' : 'EXECUTING'}: Final Comprehensive Syntax Fix`);
  console.log('📋 Targeting all remaining build-blocking syntax errors\n');

  let totalFixes = 0;
  
  // First, try to fix the JSX issue manually
  console.log(`\n📁 Special handling: src/components/CuisineRecommender.tsx JSX issue`);
  const jsxFixes = fixCuisineRecommenderJSX();
  totalFixes += jsxFixes;
  
  // Then apply pattern-based fixes
  for (const fileConfig of FINAL_SYNTAX_FIXES) {
    console.log(`\n📁 Processing: ${fileConfig.file}`);
    const fixes = fixFile(fileConfig.file, fileConfig.patterns);
    totalFixes += fixes;
  }

  console.log(`\n🎯 Summary:`);
  console.log(`   Total fixes ${DRY_RUN ? 'identified' : 'applied'}: ${totalFixes}`);
  
  if (DRY_RUN) {
    console.log('\n⚡ Run without --dry-run to apply fixes');
    console.log('   Then test with: yarn build');
  } else {
    console.log('\n✅ Final comprehensive syntax fixes applied!');
    console.log('🔄 Next: Run "yarn build" to verify clean build status');
    console.log('🚀 If successful, we can finally proceed with Phase 2 TypeScript error resolution');
  }
}

main(); 