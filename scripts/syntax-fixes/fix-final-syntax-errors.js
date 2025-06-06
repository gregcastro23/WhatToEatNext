#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Final syntax error fixes...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const specificFixes = [
  {
    file: 'src/calculations/alchemicalEngine.ts',
    fix: (content) => {
      // Fix incomplete 'Total Effect Value' object property
      content = content.replace(
        /'Total Effect Value':\s*'Alchemy Effects'/g,
        `'Total Effect Value': { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },\n      'Alchemy Effects'`
      );
      return content;
    }
  },
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // We need to properly define the const declaration that's missing
      content = content.replace(
        /(\s+)}, \[planetaryPositions, isDaytime\]\);\s*/g,
        '$1}, [planetaryPositions, isDaytime]);\n\n  // Memoized elemental balance constant\n  const elementalBalance = useMemo(() => {\n    try {\n      return {\n        Fire: 25,\n        Water: 25,\n        Earth: 25,\n        Air: 25\n      };\n    } catch (err) {\n      console.error(\'Error calculating elemental balance:\', err);\n      return { Fire: 25, Earth: 25, Air: 25, Water: 25 };\n    }\n  }, [planetaryPositions, isDaytime]);\n\n'
      );
      
      // Fix the component function ending
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
      // The function declaration is inside an object - move it outside or remove it
      content = content.replace(
        /(\s+)\/\/ Calculate elemental totals across profiles\s+function calculateElementalTotals\(\) \{\s+\(profiles \|\| \[\]\)\.forEach\(profile => \{/g,
        '$1// Calculate elemental totals across profiles\n  if (profiles && profiles.length > 0) {\n    (profiles || []).forEach(profile => {'
      );
      
      // Fix the ending
      content = content.replace(
        /(\s+)\}\);\s+\}\s+calculateElementalTotals\(\);/g,
        '$1    });\n  }'
      );
      
      return content;
    }
  },
  {
    file: 'src/hooks/useAlchemicalRecommendations.ts',
    fix: (content) => {
      // Fix missing property in thermodynamics object
      content = content.replace(
        /gregsEnergy: recs\.gregsEnergy\s+\},/g,
        'gregsEnergy: recs.gregsEnergy\n          },'
      );
      
      // Fix try-catch-finally structure
      content = content.replace(
        /(\s+)catch \(err\) \{\s+setError\(err instanceof Error \? err : new Error\('Unknown error occurred'\)\);\s+\} finally \{/g,
        '$1} catch (err) {\n        setError(err instanceof Error ? err : new Error(\'Unknown error occurred\'));\n      } finally {'
      );
      
      return content;
    }
  },
  {
    file: 'src/services/ConsolidatedIngredientService.ts',
    fix: (content) => {
      // Fix missing comma before flavorProfile
      content = content.replace(
        /overallHarmony\s+flavorProfile,/g,
        'overallHarmony,\n        flavorProfile,'
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
  console.log('\n✅ Final syntax error fixes completed!');
} 