import fs from 'fs';
import path from 'path';

const isDryRun = process.argv.includes('--dry-run');

const fixes = [
  {
    file: 'src/utils/ingredientRecommender.ts',
    patterns: [
      {
        // Fix: const retroKeywords = retroFocus?.(split(/[\s;]+/)? || []).filter(k => (k || []).length > 3);
        search: /const retroKeywords = retroFocus\?\.\(split\(\/\[\\s;\]\+\/\)\? \|\| \[\]\)\.filter\(k => \(k \|\| \[\]\)\.length > 3\);/g,
        replace: 'const retroKeywords = (retroFocus?.split(/[\\s;]+/) || []).filter(k => (k || "").length > 3);'
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeMatching.ts',
    patterns: [
      {
        // Fix: if (Array.isArray((normalizedStr1) ? (normalizedStr1.includes(normalizedStr2) : (normalizedStr1 === normalizedStr2) || (Array.isArray(normalizedStr2) ? normalizedStr2.includes(normalizedStr1) : normalizedStr2 === normalizedStr1)) return 0.8;
        search: /if \(Array\.isArray\(\(normalizedStr1\) \? \(normalizedStr1\.includes\(normalizedStr2\) : \(normalizedStr1 === normalizedStr2\) \|\| \(Array\.isArray\(normalizedStr2\) \? normalizedStr2\.includes\(normalizedStr1\) : normalizedStr2 === normalizedStr1\)\) return 0\.8;/g,
        replace: 'if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1)) return 0.8;'
      }
    ]
  },
  {
    file: 'src/utils/recipeFilters.ts',
    patterns: [
      {
        // Fix: const mappedCount = (mappedIngredients || []).filter((m) => m.(matchedTo) || []).length;
        search: /const mappedCount = \(mappedIngredients \|\| \[\]\)\.filter\(\(m\) => m\.\(matchedTo\) \|\| \[\]\)\.length;/g,
        replace: 'const mappedCount = (mappedIngredients || []).filter((m) => m.matchedTo).length;'
      }
    ]
  },
  {
    file: 'src/utils/recipeMatching.ts',
    patterns: [
      {
        // Fix: ingredient.amount / (100 || 1) followed by );
        search: /ingredient\.amount \/ \(100 \|\| 1\)\s*\);/g,
        replace: 'ingredient.amount / 100 || 1\n    );'
      }
    ]
  },
  {
    file: 'src/utils/recommendation/methodRecommendation.ts',
    patterns: [
      {
        // Fix: if (Array.isArray((fireSigns) ? (fireSigns.includes(signLower) : (fireSigns === signLower)) return 'Fire';
        search: /if \(Array\.isArray\(\(fireSigns\) \? \(fireSigns\.includes\(signLower\) : \(fireSigns === signLower\)\) return 'Fire';/g,
        replace: 'if (fireSigns.includes(signLower)) return \'Fire\';'
      },
      {
        // Fix: if (Array.isArray((earthSigns) ? (earthSigns.includes(signLower) : (earthSigns === signLower)) return 'Earth';
        search: /if \(Array\.isArray\(\(earthSigns\) \? \(earthSigns\.includes\(signLower\) : \(earthSigns === signLower\)\) return 'Earth';/g,
        replace: 'if (earthSigns.includes(signLower)) return \'Earth\';'
      },
      {
        // Fix: if (Array.isArray((AirSigns) ? (AirSigns.includes(signLower) : (AirSigns === signLower)) return 'Air';
        search: /if \(Array\.isArray\(\(AirSigns\) \? \(AirSigns\.includes\(signLower\) : \(AirSigns === signLower\)\) return 'Air';/g,
        replace: 'if (airSigns.includes(signLower)) return \'Air\';'
      },
      {
        // Fix: if (Array.isArray((waterSigns) ? (waterSigns.includes(signLower) : (waterSigns === signLower)) return 'Water';
        search: /if \(Array\.isArray\(\(waterSigns\) \? \(waterSigns\.includes\(signLower\) : \(waterSigns === signLower\)\) return 'Water';/g,
        replace: 'if (waterSigns.includes(signLower)) return \'Water\';'
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
    console.log('\n🚀 Ready to test with: yarn build');
  }
}

applyFixes(); 