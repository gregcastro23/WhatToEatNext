#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Fixing critical remaining syntax errors...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const criticalFixes = [
  {
    file: 'src/calculations/alchemicalEngine.ts',
    fix: (content) => {
      // Fix extra commas in interface
      content = content.replace(
        /season: string;,/g,
        'season: string;'
      );
      
      content = content.replace(
        /timeOfDay: string;,/g,
        'timeOfDay: string;'
      );
      
      return content;
    }
  },
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // Find the problematic useMemo and fix its structure
      content = content.replace(
        /(\s+)}, \[planetaryPositions, isDaytime\]\);\s+\/\/ Calculate alchemical principles\s+const alchemicalPrinciples = useMemo/g,
        '$1}, [planetaryPositions, isDaytime]);\n\n  // Calculate alchemical principles\n  const alchemicalPrinciples = useMemo'
      );
      
      // Fix the missing const declaration by adding it properly
      content = content.replace(
        /(\s+)try \{\s+return \{\s+Fire: 25,\s+Water: 25,\s+Earth: 25,\s+Air: 25\s+\};\s+\} catch \(err\) \{\s+console\.error\('Error calculating elemental balance:', err\);\s+return \{ Fire: 25, Earth: 25, Air: 25, Water: 25 \};\s+\}\s+\}, \[planetaryPositions, isDaytime\]\);/g,
        '$1const elementalBalance = useMemo(() => {\n    try {\n      return {\n        Fire: 25,\n        Water: 25,\n        Earth: 25,\n        Air: 25\n      };\n    } catch (err) {\n      console.error(\'Error calculating elemental balance:\', err);\n      return { Fire: 25, Earth: 25, Air: 25, Water: 25 };\n    }\n  }, [planetaryPositions, isDaytime]);'
      );
      
      // Fix component ending
      content = content.replace(
        /(\s+)\);\s*\};\s*$/g,
        '$1  );\n};\n'
      );
      
      return content;
    }
  },
  {
    file: 'src/data/unified/nutritional.ts',
    fix: (content) => {
      // Fix the conditional statement that's breaking object syntax
      content = content.replace(
        /(\s+)\/\/ Calculate elemental totals across profiles\s+if \(profiles && profiles\.length > 0\) \{/g,
        '$1// Calculate elemental totals across profiles\n}\n\n// Process profiles if available\nif (profiles && profiles.length > 0) {'
      );
      
      // Fix the ending structure
      content = content.replace(
        /(\s+)profiles\.forEach\(profile => \{/g,
        '$1profiles.forEach(profile => {'
      );
      
      // Add proper closing for the object that was broken
      content = content.replace(
        /(\s+)totalElementalValues\[element\] \+= profile\?\.elementalNutrients\?\.\[element\]\.totalElementalValue;/g,
        '$1if (profile?.elementalNutrients?.[element]?.totalElementalValue) {\n      totalElementalValues[element] += profile.elementalNutrients[element].totalElementalValue;\n    }'
      );
      
      return content;
    }
  },
  {
    file: 'src/hooks/useAlchemicalRecommendations.ts',
    fix: (content) => {
      // Fix the broken object structure in thermodynamics
      content = content.replace(
        /(\s+)thermodynamics: \{\s+heat: recs\.heat,\s+entropy: recs\.entropy,\s+reactivity: recs\.reactivity,\s+gregsEnergy: recs\.gregsEnergy\s+\},\s+alchemicalProperties: \{\s+Spirit: 0,\s+Essence: 0,\s+Matter: 0,\s+Substance: 0\s+\}\s+\};/g,
        '$1const profile = {\n          thermodynamics: {\n            heat: recs.heat,\n            entropy: recs.entropy,\n            reactivity: recs.reactivity,\n            gregsEnergy: recs.gregsEnergy\n          },\n          alchemicalProperties: {\n            Spirit: 0,\n            Essence: 0,\n            Matter: 0,\n            Substance: 0\n          }\n        };'
      );
      
      // Fix the broken try-catch-finally structure
      content = content.replace(
        /(\s+)setEnergeticProfile\(profile\);\s+\} catch \(err\) \{/g,
        '$1setEnergeticProfile(profile);\n      } catch (err) {'
      );
      
      return content;
    }
  },
  {
    file: 'src/services/ConsolidatedIngredientService.ts',
    fix: (content) => {
      // Fix broken const declaration
      content = content.replace(
        /const consolidatedScore: 0\.7;/g,
        'const consolidatedScore = 0.7;'
      );
      
      // Fix broken calculation syntax
      content = content.replace(
        /const overallHarmony = \(avgPAiringScore \* 0\.7\) \+ \(consolidatedScore: 0\.7;/g,
        'const overallHarmony = (avgPAiringScore * 0.7) + (consolidatedScore * 0.3);'
      );
      
      return content;
    }
  }
];

function applyFix(filePath, fixFunction) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${path.relative(projectRoot, filePath)}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixFunction(content);
    
    if (content !== newContent) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
      } else {
        console.log(`🔍 Would fix: ${path.relative(projectRoot, filePath)}`);
      }
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${path.relative(projectRoot, filePath)}`);
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

let fixedFiles = 0;

console.log('\n🎯 Fixing critical syntax errors:');
for (const { file, fix } of criticalFixes) {
  console.log(`📁 Processing: ${file}`);
  const fullPath = path.join(projectRoot, file);
  if (applyFix(fullPath, fix)) {
    fixedFiles++;
  }
}

console.log(`\n📊 Summary: ${fixedFiles} files ${isDryRun ? 'would be' : 'were'} fixed`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply fixes');
} else {
  console.log('\n✅ Critical syntax errors fixed!');
  console.log('\n🚀 Ready for build test!');
} 