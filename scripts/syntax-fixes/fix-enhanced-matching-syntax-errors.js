#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔧 Fixing syntax errors from enhanced matching implementation...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const specificFixes = [
  {
    file: 'src/calculations/alchemicalEngine.ts',
    fix: (content) => {
      // Fix missing comma before dominantElement
      content = content.replace(
        /Substance: 0\.25\s*dominantElement:/g,
        'Substance: 0.25,\n        dominantElement:'
      );
      return content;
    }
  },
  {
    file: 'src/components/AstrologyChart/AstrologyChart.migrated.tsx',
    fix: (content) => {
      // Fix incomplete useMemo function - missing const declaration start
      content = content.replace(
        /(\s+)}, \[planetaryPositions, isDaytime\]\);\s*/g,
        '$1  }, [planetaryPositions, isDaytime]);\n\n  // Calculate alchemical principles\n  const alchemicalPrinciples = useMemo(() => {\n    return {\n      Spirit: 0.25,\n      Essence: 0.25,\n      Matter: 0.25,\n      Substance: 0.25\n    };\n  }, []);\n\n  // Component render function\n  if (isLoading) {\n    return (\n      <div className="text-center p-6">\n        <h3>{title}</h3>\n        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>\n        <div className="animate-pulse h-96 bg-gray-100 rounded-full w-96 mx-auto"></div>\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <div className="text-red-500 text-center p-4 border border-red-200 rounded bg-red-50">\n        <h3>{title}</h3>\n        <p className="font-medium">Error Loading Astrological Data</p>\n        <p className="text-sm mt-1">{error.message}</p>\n      </div>\n    );\n  }\n\n  if (Object.keys(planetaryPositions).length === 0) {\n    return (\n      <div className="text-center p-4 border border-gray-200 rounded bg-gray-50">\n        <h3>{title}</h3>\n        <p className="font-medium">No Astrological Data Available</p>\n        <p className="text-sm mt-1">Loading chart data...</p>\n      </div>\n    );\n  }\n\n  // Add rising sign to planetary positions if not already included\n  const allPositions = { ...planetaryPositions };\n  if (risingDegree !== undefined && !allPositions.Rising) {\n    allPositions.Rising = risingDegree;\n  }\n\n'
      );
      
      // Remove invalid return statements that are not in function context
      content = content.replace(
        /(\s+)\/\/ Show loading state\s+if \(isLoading\) \{\s+return \([\s\S]*?\);\s+\}\s+\/\/ Show error state[\s\S]*?return \([\s\S]*?\);\s+\}\s+\/\/ Show loading state if no planetary positions[\s\S]*?return \([\s\S]*?\);\s+\}\s+\/\/ Add rising sign to planetary positions if not already included[\s\S]*?allPositions\.Rising = risingDegree;\s+\}\s+/g,
        ''
      );
      
      return content;
    }
  },
  {
    file: 'src/data/unified/nutritional.ts',
    fix: (content) => {
      // Fix invalid object property syntax - the forEach call should be outside of object
      content = content.replace(
        /\/\*\*\s+\* Calculate elemental totals across profiles\s+\*\/\s+\(profiles \|\| \[\]\)\.forEach/g,
        '// Calculate elemental totals across profiles\n  (profiles || []).forEach'
      );
      return content;
    }
  },
  {
    file: 'src/hooks/useAlchemicalRecommendations.ts',
    fix: (content) => {
      // Fix double semicolon
      content = content.replace(
        /elementalProperties: Record<ElementalCharacter, number>;;/g,
        'elementalProperties: Record<ElementalCharacter, number>;'
      );
      return content;
    }
  },
  {
    file: 'src/services/AlchemicalRecommendationService.ts',
    fix: (content) => {
      // Fix missing comma in function call
      content = content.replace(
        /const compatibleMethods = this\.findCompatibleCookingMethods\(\s*cookingMethods\s*thermodynamics\s*\);/g,
        'const compatibleMethods = this.findCompatibleCookingMethods(\n      cookingMethods,\n      thermodynamics\n    );'
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
  console.log('\n✅ Enhanced matching syntax error fixes completed!');
} 