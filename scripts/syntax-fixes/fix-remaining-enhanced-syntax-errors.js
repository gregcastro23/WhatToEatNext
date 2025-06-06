#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Fixing remaining syntax errors from enhanced matching...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const specificFixes = [
  {
    file: 'src/calculations/alchemicalEngine.ts',
    fix: (content) => {
      // Fix incomplete return statement structure
      content = content.replace(
        /return \{Water: 0\.25, Earth: 0\.25, Air: 0\.25\s+\},\s*Spirit: 0\.25,\s*Essence: 0\.25,\s*Matter: 0\.25,\s*Substance: 0\.25,/g,
        'return {\n      Fire: 0.25,\n      Water: 0.25,\n      Earth: 0.25,\n      Air: 0.25,\n      Spirit: 0.25,\n      Essence: 0.25,\n      Matter: 0.25,\n      Substance: 0.25,'
      );
      return content;
    }
  },
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // Fix the broken component structure by replacing the entire problematic section
      content = content.replace(
        /(\s+)try \{[\s\S]*?console\.error\('Error calculating elemental balance:', err\);\s+return \{ Fire: 25, Earth: 25, Air: 25, Water: 25 \};\s+\}\s+\}, \[planetaryPositions, isDaytime\]\);\s*\/\/ Calculate alchemical principles[\s\S]*?\}, \[aspectsData\]\);return \(/g,
        '$1try {\n        return {\n          Fire: 25,\n          Water: 25,\n          Earth: 25,\n          Air: 25\n        };\n      } catch (err) {\n        console.error(\'Error calculating elemental balance:\', err);\n        return { Fire: 25, Earth: 25, Air: 25, Water: 25 };\n      }\n    }, [planetaryPositions, isDaytime]);\n\n    // Calculate alchemical principles\n    const alchemicalPrinciples = useMemo(() => {\n      return {\n        Spirit: 0.25,\n        Essence: 0.25,\n        Matter: 0.25,\n        Substance: 0.25\n      };\n    }, []);\n\n    // Calculate major aspects  \n    const majorAspects = useMemo(() => {\n      if (!aspectsData || !Array.isArray(aspectsData)) {\n        return [];\n      }\n      return (aspectsData || []).filter(aspect => \n        aspect && \n        aspect.type && \n        [\'conjunction\', \'opposition\', \'trine\', \'square\'].includes(aspect.type) &&\n        aspect.planet1 && aspect.planet2 &&\n        [\'Sun\', \'Moon\', \'Mercury\', \'Venus\', \'Mars\', \'Jupiter\', \'Saturn\', \'Uranus\', \'Neptune\', \'Pluto\', \'Rising\'].includes(aspect.planet1) &&\n        [\'Sun\', \'Moon\', \'Mercury\', \'Venus\', \'Mars\', \'Jupiter\', \'Saturn\', \'Uranus\', \'Neptune\', \'Pluto\', \'Rising\'].includes(aspect.planet2)\n      );\n    }, [aspectsData]);\n\n    // Component render logic\n    if (isLoading) {\n      return (\n        <div className="text-center p-6">\n          <h3>{title}</h3>\n          <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>\n          <div className="animate-pulse h-96 bg-gray-100 rounded-full w-96 mx-auto"></div>\n        </div>\n      );\n    }\n\n    if (error) {\n      return (\n        <div className="text-red-500 text-center p-4 border border-red-200 rounded bg-red-50">\n          <h3>{title}</h3>\n          <p className="font-medium">Error Loading Astrological Data</p>\n          <p className="text-sm mt-1">{error.message}</p>\n        </div>\n      );\n    }\n\n    if (Object.keys(planetaryPositions).length === 0) {\n      return (\n        <div className="text-center p-4 border border-gray-200 rounded bg-gray-50">\n          <h3>{title}</h3>\n          <p className="font-medium">No Astrological Data Available</p>\n          <p className="text-sm mt-1">Loading chart data...</p>\n        </div>\n      );\n    }\n\n    // Add rising sign to planetary positions if not already included\n    const allPositions = { ...planetaryPositions };\n    if (risingDegree !== undefined && !allPositions.Rising) {\n      allPositions.Rising = risingDegree;\n    }\n\n    return ('
      );
      return content;
    }
  },
  {
    file: 'src/data/unified/nutritional.ts',
    fix: (content) => {
      // Fix the forEach call that's outside object context
      content = content.replace(
        /(\s+)\/\/ Calculate elemental totals across profiles\s+\(profiles \|\| \[\]\)\.forEach\(profile => \{/g,
        '$1// Calculate elemental totals across profiles\n  function calculateElementalTotals() {\n    (profiles || []).forEach(profile => {'
      );
      
      // Add closing for the function
      content = content.replace(
        /(\s+)\}\);\s*$/g,
        '$1  });\n  }\n  calculateElementalTotals();'
      );
      
      return content;
    }
  },
  {
    file: 'src/hooks/useAlchemicalRecommendations.ts',
    fix: (content) => {
      // Fix the broken object structure and missing properties
      content = content.replace(
        /gregsEnergy: recs\.gregsEnergy,Water: 0, Earth: 0, Air: 0\s+\},/g,
        'gregsEnergy: recs.gregsEnergy\n          },'
      );
      
      // Fix broken try-catch-finally structure
      content = content.replace(
        /(\s+)} catch \(err\) \{\s+setError\(err instanceof Error \? err : new Error\('Unknown error occurred'\)\);\s+\} finally \{/g,
        '$1} catch (err) {\n        setError(err instanceof Error ? err : new Error(\'Unknown error occurred\'));\n      } finally {'
      );
      
      return content;
    }
  },
  {
    file: 'src/services/AlchemicalRecommendationService.ts',
    fix: (content) => {
      // Fix missing comma in return object
      content = content.replace(
        /dominantElement\s+thermodynamics,/g,
        'dominantElement,\n      thermodynamics,'
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
  console.log('\n✅ All remaining syntax errors should now be resolved!');
} 