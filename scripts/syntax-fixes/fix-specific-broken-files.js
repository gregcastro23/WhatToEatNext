#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Fixing specific broken files...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const specificFixes = [
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // Find the beginning of the broken useMemo and fix the whole structure
      content = content.replace(
        /(\s+)return \{\s+Fire: 25,\s+Water: 25,\s+Earth: 25,\s+Air: 25\s+\};\s+\} catch \(err\) \{\s+console\.error\('Error calculating elemental balance:', err\);\s+return \{ Fire: 25, Earth: 25, Air: 25, Water: 25 \};\s+\}\s+\}, \[planetaryPositions, isDaytime\]\);\s+\/\/ Memoized elemental balance constant\s+const elementalBalance = useMemo\(\(\) => \{[\s\S]*?\}, \[planetaryPositions, isDaytime\]\);\s*\/\/ Calculate alchemical principles/g,
        '$1return {\n        Fire: 25,\n        Water: 25,\n        Earth: 25,\n        Air: 25\n      };\n    } catch (err) {\n      console.error(\'Error calculating elemental balance:\', err);\n      return { Fire: 25, Earth: 25, Air: 25, Water: 25 };\n    }\n  }, [planetaryPositions, isDaytime]);\n\n  // Calculate alchemical principles'
      );
      
      // Remove duplicate elementalBalance and fix component ending
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
      // Fix the conditional that's breaking object structure
      content = content.replace(
        /(\s+)\/\/ Calculate elemental totals across profiles\s+if \(profiles && profiles\.length > 0\) \{\s+\(profiles \|\| \[\]\)\.forEach\(profile => \{/g,
        '$1// Calculate elemental totals across profiles\n  if (profiles && profiles.length > 0) {\n    profiles.forEach(profile => {'
      );
      
      // Fix the ending structure
      content = content.replace(
        /(\s+)\}\);\s+\}/g,
        '$1    });\n  }'
      );
      
      return content;
    }
  },
  {
    file: 'src/hooks/useAlchemicalRecommendations.ts',
    fix: (content) => {
      // Find and fix the broken thermodynamics object
      content = content.replace(
        /(\s+)thermodynamics: \{\s+heat: recs\.heat,\s+entropy: recs\.entropy,\s+reactivity: recs\.reactivity,\s+gregsEnergy: recs\.gregsEnergy\s+\},\s+alchemicalProperties: \{\s+Spirit: 0,\s+Essence: 0,\s+Matter: 0,\s+Substance: 0\s+\}\s+\};/g,
        '$1thermodynamics: {\n              heat: recs.heat,\n              entropy: recs.entropy,\n              reactivity: recs.reactivity,\n              gregsEnergy: recs.gregsEnergy\n            },\n            alchemicalProperties: {\n              Spirit: 0,\n              Essence: 0,\n              Matter: 0,\n              Substance: 0\n            }\n          };'
      );
      
      // Fix the broken try-catch structure
      content = content.replace(
        /(\s+)setEnergeticProfile\(profile\);\s+\} \} catch \(err\) \{/g,
        '$1setEnergeticProfile(profile);\n      } catch (err) {'
      );
      
      return content;
    }
  },
  {
    file: 'src/services/ConsolidatedIngredientService.ts',
    fix: (content) => {
      // Fix the broken return object structure
      content = content.replace(
        /overallHarmony: 0\.5,Water: 0, Earth: 0, Air: 0 \}\),/g,
        'overallHarmony: 0.5,'
      );
      return content;
    }
  },
  {
    file: 'src/services/IngredientService.ts',
    fix: (content) => {
      // Fix the broken result object structure
      content = content.replace(
        /overallHarmony: 0,Water: 0, Earth: 0, Air: 0 \}\),/g,
        'overallHarmony: 0,'
      );
      return content;
    }
  }
];

function applySpecificFix(filePath, fixFunction) {
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

for (const { file, fix } of specificFixes) {
  const fullPath = path.join(projectRoot, file);
  if (applySpecificFix(fullPath, fix)) {
    fixedFiles++;
  }
}

console.log(`\n📊 Summary: ${fixedFiles} files ${isDryRun ? 'would be' : 'were'} fixed`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply fixes');
} else {
  console.log('\n✅ Specific broken file fixes completed!');
} 