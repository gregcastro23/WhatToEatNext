#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Check for dry run mode
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 Fixing remaining utils directory syntax errors${isDryRun ? ' (DRY RUN)' : ''}...`);

const fixes = [
  // cookingMethodRecommender.ts fixes
  {
    file: 'src/utils/cookingMethodRecommender.ts',
    fixes: [
      {
        description: 'Fix malformed conditional in line 36',
        pattern: /\|\|\s*\[\]\.map\(/g,
        replacement: '|| []).map('
      },
      {
        description: 'Fix missing closing parenthesis in normalizeMethodName',
        pattern: /\.trim\(\s*$/gm,
        replacement: '.trim()'
      },
      {
        description: 'Fix incomplete variable declarations',
        pattern: /const normalized1 = normalizeMethodName\(method1\s*$/gm,
        replacement: 'const normalized1 = normalizeMethodName(method1);'
      },
      {
        description: 'Fix incomplete variable declarations',
        pattern: /const normalized2 = normalizeMethodName\(method2\s*$/gm,
        replacement: 'const normalized2 = normalizeMethodName(method2);'
      },
      {
        description: 'Fix malformed array checks',
        pattern: /Array\.isArray\(\$1\.\$3\) \? \$1\.\$3\.includes\(\$5\) : \$1\.\$3 === \$5/g,
        replacement: 'method.astrologicalInfluences?.favorableZodiac?.includes(currentZodiac)'
      },
      {
        description: 'Fix malformed planetary influence checks',
        pattern: /method\.astrologicalInfluences\?\.dominantPlanets\?\.includes\(18042\)/g,
        replacement: 'method.astrologicalInfluences?.dominantPlanets?.includes(planetaryDay)'
      },
      {
        description: 'Fix malformed planetary influence checks',
        pattern: /method\.astrologicalInfluences\?\.dominantPlanets\?\.includes\(19576\)/g,
        replacement: 'method.astrologicalInfluences?.dominantPlanets?.includes(planetaryHour)'
      },
      {
        description: 'Fix incomplete function calls',
        pattern: /const hour = date\.getHours\(\s*$/gm,
        replacement: 'const hour = date.getHours();'
      },
      {
        description: 'Fix incomplete function calls',
        pattern: /const lowerSign = currentZodiac\?\.toLowerCase\(\s*$/gm,
        replacement: 'const lowerSign = currentZodiac?.toLowerCase();'
      }
    ]
  },
  
  // enhancedCuisineRecommender.ts fixes
  {
    file: 'src/utils/enhancedCuisineRecommender.ts',
    fixes: [
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(astrologicalAffinities\?\) \? astrologicalAffinities\?\.includes\(rulingPlanet\)\s+: astrologicalAffinities\? === rulingPlanet\)\)/g,
        replacement: 'dish.astrologicalAffinities?.includes(rulingPlanet)'
      },
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(astrologicalAffinities\?\) \? astrologicalAffinities\?\.includes\(planetaryHour\)\s+: astrologicalAffinities\? === planetaryHour\)\)/g,
        replacement: 'dish.astrologicalAffinities?.includes(planetaryHour)'
      },
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(zodiacInfluences\?\) \? zodiacInfluences\?\.includes\(astroState\.sunSign\)\s+: zodiacInfluences\? === astroState\.sunSign\)\)/g,
        replacement: 'dish.zodiacInfluences?.includes(astroState.sunSign)'
      },
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(lunarPhaseInfluences\?\) \? lunarPhaseInfluences\?\.includes\(astroState\.lunarPhase\)\s+: lunarPhaseInfluences\? === astroState\.lunarPhase\)\)/g,
        replacement: 'dish.lunarPhaseInfluences?.includes(astroState.lunarPhase)'
      },
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(astrologicalAffinities\?\) \? astrologicalAffinities\?\.includes\(planet\.name\)\s+: astrologicalAffinities\? === planet\.name\)\)/g,
        replacement: 'dish.astrologicalAffinities?.includes(planet.name)'
      },
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(tags\) \? tags\.includes\(meal\)\s+: tags === meal\)\)/g,
        replacement: 'dish.tags?.includes(meal)'
      },
      {
        description: 'Fix malformed property access patterns',
        pattern: /dish\.\(Array\.isArray\(tags\) \? tags\.includes\(mealType\)\s+: tags === mealType\)\)/g,
        replacement: 'dish.tags?.includes(mealType)'
      },
      {
        description: 'Fix malformed object property access',
        pattern: /Fire: 'Fire', Earth: 'Earth', Air: 'Air',\s*Water: 'Water',\s*Aether: 'aether'/g,
        replacement: 'Fire: \'Fire\', Earth: \'Earth\', Air: \'Air\', Water: \'Water\''
      }
    ]
  },
  
  // fixAssignmentError.js fixes
  {
    file: 'src/utils/fixAssignmentError.js',
    fixes: [
      {
        description: 'Fix malformed object property',
        pattern: /dominantElement: 'Fire',\s*elementalProperties: \{ Fire: 0\.25, Water: 0\.25, Earth: 0\.25, Air: 0\.25 \}\s*\},/g,
        replacement: 'dominantElement: \'Fire\', elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 } },'
      },
      {
        description: 'Fix malformed object property',
        pattern: /Fire: 0, Water: 0, Air: 0,\s*Earth: 0/g,
        replacement: 'Fire: 0, Water: 0, Air: 0, Earth: 0'
      },
      {
        description: 'Fix malformed conditional expression',
        pattern: /\/ \(undefined \|\| 1\)/g,
        replacement: ''
      }
    ]
  },
  
  // seasonalCalculations.ts fixes
  {
    file: 'src/utils/seasonalCalculations.ts',
    fixes: [
      {
        description: 'Fix malformed variable declaration',
        pattern: /const seasonElements = SEASONAL_ELEMENTS\[season\],\s*lunarElements = LUNAR_PHASE_ELEMENTS\[lunarPhase\],\s*lunarScore = 0;/g,
        replacement: 'const seasonElements = SEASONAL_ELEMENTS[season]; const lunarElements = LUNAR_PHASE_ELEMENTS[lunarPhase]; let lunarScore = 0;'
      },
      {
        description: 'Fix malformed array access',
        pattern: /Object\.entries\(seasonElements\) \|\| \[\]\.forEach/g,
        replacement: '(Object.entries(seasonElements) || []).forEach'
      },
      {
        description: 'Fix malformed array declaration',
        pattern: /const complementaryPAirs: \[Element, Element\]\[\] = \[\['Fire', 'Air'\],\s*\['Water', 'Earth'\]\s*\];/g,
        replacement: 'const complementaryPAirs: [Element, Element][] = [[\'Fire\', \'Air\'], [\'Water\', \'Earth\']];'
      },
      {
        description: 'Fix malformed array access',
        pattern: /Array\.isArray\(\(\(recipe as any\)\.mealType\) \? \(\(recipe as any\)\.mealType\) : \[\(\(recipe as any\)\.mealType\)\],/g,
        replacement: 'const recipeMealTypes = Array.isArray((recipe as any).mealType) ? (recipe as any).mealType : [(recipe as any).mealType];'
      },
      {
        description: 'Fix malformed conditional check',
        pattern: /\(\(\(recipe as any\)\.lunarPhaseInfluences\.includes\(lunarPhaseWithSpaces\) \|\| \(recipe as any\)\.lunarPhaseInfluences === lunarPhaseWithSpaces\)\)/g,
        replacement: '((recipe as any).lunarPhaseInfluences.includes(lunarPhaseWithSpaces))'
      }
    ]
  }
];

let totalChanges = 0;

// Apply fixes to each file
for (const fileConfig of fixes) {
  const filePath = fileConfig.file;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;
  
  console.log(`\n📁 Processing ${filePath}:`);
  
  for (const fix of fileConfig.fixes) {
    const beforeCount = (content.match(fix.pattern) || []).length;
    if (beforeCount > 0) {
      content = content.replace(fix.pattern, fix.replacement);
      const afterCount = (content.match(fix.pattern) || []).length;
      const changesApplied = beforeCount - afterCount;
      
      if (changesApplied > 0) {
        console.log(`  ✅ ${fix.description} (${changesApplied} changes)`);
        fileChanges += changesApplied;
      }
    }
  }
  
  if (fileChanges > 0) {
    if (!isDryRun) {
      fs.writeFileSync(filePath, content);
      console.log(`  💾 Applied ${fileChanges} fixes to ${filePath}`);
    } else {
      console.log(`  🔍 Would apply ${fileChanges} fixes to ${filePath}`);
    }
    totalChanges += fileChanges;
  } else {
    console.log(`  ℹ️ No changes needed for ${filePath}`);
  }
}

console.log(`\n${isDryRun ? '🔍 DRY RUN SUMMARY' : '✅ FIX SUMMARY'}:`);
console.log(`Total changes: ${totalChanges}`);
console.log(`Files processed: ${fixes.length}`);

if (totalChanges > 0 && !isDryRun) {
  console.log('\n🎉 All syntax errors in utils directory have been fixed!');
  console.log('💡 Run "yarn build" to verify the fixes.');
} else if (isDryRun && totalChanges > 0) {
  console.log('\n🔍 Run without --dry-run to apply these fixes.');
} else {
  console.log('\n✨ No syntax errors found in utils directory.');
}

console.log(`${isDryRun ? 'DRY RUN' : 'FIX'} completed.`); 