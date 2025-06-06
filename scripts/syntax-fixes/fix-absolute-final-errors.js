import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');

const fixes = [
  {
    file: 'src/utils/ingredientRecommender.ts',
    patterns: [
      {
        // Fix: if (Array.isArray(name) ? name.includes(food?.toLowerCase() : name === food?.toLowerCase( || food?.toLowerCase()?.includes(name)) {
        search: /if \(Array\.isArray\(name\) \? name\.includes\(food\?\.toLowerCase\(\) : name === food\?\.toLowerCase\(\( \|\| food\?\.toLowerCase\(\)\?\.includes\(name\)\) \{/g,
        replace: 'if (Array.isArray(name) ? name.includes(food?.toLowerCase()) : (name === food?.toLowerCase() || food?.toLowerCase()?.includes(name))) {'
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeUtils.ts',
    patterns: [
      {
        // Fix: return safeSome(Array.isArray(recipe.tags) ? recipe.tags : [recipe.tags], tags) === tag?.toLowerCase());
        search: /return safeSome\(Array\.isArray\(recipe\.tags\) \? recipe\.tags : \[recipe\.tags\], tags\) === tag\?\.toLowerCase\(\)\);/g,
        replace: 'return safeSome(Array.isArray(recipe.tags) ? recipe.tags : [recipe.tags], (t) => t === tag?.toLowerCase());'
      }
    ]
  },
  {
    file: 'src/utils/recipeMatching.ts',
    patterns: [
      {
        // Fix: ingredient.amount / 100 || 1 followed by );
        search: /ingredient\.amount \/ 100 \|\| 1\s*\);/g,
        replace: '(ingredient.amount / 100) || 1\n    );'
      }
    ]
  },
  {
    file: 'src/utils/safeAstrology.ts',
    patterns: [
      {
        // Fix: if (Array.isArray((ZODIAC_SIGNS) ? (ZODIAC_SIGNS.includes(formattedSign as ZodiacSign) : (ZODIAC_SIGNS === formattedSign as ZodiacSign)) {
        search: /if \(Array\.isArray\(\(ZODIAC_SIGNS\) \? \(ZODIAC_SIGNS\.includes\(formattedSign as ZodiacSign\) : \(ZODIAC_SIGNS === formattedSign as ZodiacSign\)\) \{/g,
        replace: 'if (ZODIAC_SIGNS.includes(formattedSign as ZodiacSign)) {'
      }
    ]
  },
  {
    file: 'src/app/planet-test/layout.tsx',
    patterns: [
      {
        // Look for malformed JSX return statement - this might need a different approach
        search: /return \(\s*<div className="min-h-screen bg-gray-50 flex flex-col">/g,
        replace: 'return (\n    <div className="min-h-screen bg-gray-50 flex flex-col">'
      }
    ]
  }
];

function applyFixes() {
  let totalChanges = 0;
  
  for (const fix of fixes) {
    const filePath = path.join(process.cwd(), fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    
    for (const pattern of fix.patterns) {
      const matches = content.match(pattern.search);
      if (matches) {
        content = content.replace(pattern.search, pattern.replace);
        fileChanges += matches.length;
        console.log(`✅ Fixed ${matches.length} pattern(s) in ${fix.file}`);
        if (isDryRun) {
          console.log(`   Pattern: ${pattern.search}`);
          console.log(`   Replace: ${pattern.replace}`);
        }
      }
    }
    
    if (fileChanges > 0) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, content);
        console.log(`📝 Applied ${fileChanges} fixes to ${fix.file}`);
      } else {
        console.log(`🔍 Would apply ${fileChanges} fixes to ${fix.file}`);
      }
      totalChanges += fileChanges;
    } else {
      console.log(`ℹ️  No changes needed in ${fix.file}`);
    }
  }
  
  console.log(`\n${isDryRun ? '🔍 DRY RUN:' : '✅ COMPLETED:'} ${totalChanges} total syntax fixes ${isDryRun ? 'would be' : 'were'} applied`);
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply these fixes');
  } else {
    console.log('\n🚀 Ready for final build test');
  }
}

applyFixes(); 