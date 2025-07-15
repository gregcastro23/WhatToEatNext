import fs from 'fs';
import path from 'path';

interface FileFixConfig {
  filePath: string;
  fixes: Array<{
    search: string;
    replace: string;
    description: string;
  }>;
}

// Configuration for fixing each problematic file
const fileConfigs: FileFixConfig[] = [
  {
    filePath: 'src/components/RealtimeAlchemicalCalculator.tsx',
    fixes: [
      {
        search: `(Array.isArray({source?) ? {source?.includes('astrologize') : {source? === 'astrologize') ? '✨ Using Real Astrologize Calculations' : '⚠️ Using Fallback Data'}`,
        replace: `(source?.includes && source.includes('astrologize')) ? '✨ Using Real Astrologize Calculations' : '⚠️ Using Fallback Data'`,
        description: 'Fix malformed conditional syntax for source checking'
      },
      {
        search: `{Object.entries(positions || ({}) || []).map(([planet, position]) => (`,
        replace: `{Object.entries(positions || {}).map(([planet, position]) => (`,
        description: 'Fix malformed object entries mapping'
      }
    ]
  },
  {
    filePath: 'src/components/PlanetaryHours/PlanetaryHoursDisplay.tsx',
    fixes: [
      {
        search: `({associatedChakras || []).length > 0 && (`,
        replace: `(associatedChakras && associatedChakras.length > 0) && (`,
        description: 'Fix malformed array length check'
      },
      {
        search: `({associatedChakras || []).map((chakra, index) => (`,
        replace: `(associatedChakras || []).map((chakra, index) => (`,
        description: 'Fix malformed array mapping'
      },
      {
        search: `{Array.from({ length: 24 }, (_, i) => (i) || []).map((hour) => {`,
        replace: `{Array.from({ length: 24 }, (_, i) => i).map((hour) => {`,
        description: 'Fix malformed Array.from syntax'
      }
    ]
  },
  {
    filePath: 'src/components/PlanetaryHours/PlanetaryHoursDisplay.migrated.tsx',
    fixes: [
      {
        search: `({associatedChakras || []).length > 0 && (`,
        replace: `(associatedChakras && associatedChakras.length > 0) && (`,
        description: 'Fix malformed array length check'
      },
      {
        search: `({associatedChakras || []).map((chakra, index) => (`,
        replace: `(associatedChakras || []).map((chakra, index) => (`,
        description: 'Fix malformed array mapping'
      },
      {
        search: `{Array.from(allHours.(entries()) || []).map(([hour, planet]) => (`,
        replace: `{Array.from(allHours.entries()).map(([hour, planet]) => (`,
        description: 'Fix malformed Map.entries() call'
      }
    ]
  },
  {
    filePath: 'src/lib/cuisineCalculations.ts',
    fixes: [
      {
        search: `alchemicalProperties: tradition.elementalAlignment || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },`,
        replace: `alchemicalProperties: tradition.elementalAlignment || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },`,
        description: 'Fix missing closing brace in object literal'
      },
      {
        search: `elementalProperties: tradition.elementalAlignment || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },`,
        replace: `elementalProperties: tradition.elementalAlignment || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },`,
        description: 'Fix missing closing brace in object literal'
      },
      {
        search: `    if (tradition.astrologicalProfile?.influences && 
        tradition?.astrologicalProfile?.influences || []).length > 0 && 
        !tradition?.astrologicalProfile?.(Array.isArray(influences) ? influences?.includes('Universal')  : influences? === 'Universal')) {`,
        replace: `    if (tradition.astrologicalProfile?.influences && 
        Array.isArray(tradition.astrologicalProfile.influences) && 
        tradition.astrologicalProfile.influences.length > 0 && 
        !tradition.astrologicalProfile.influences.includes('Universal')) {`,
        description: 'Fix malformed conditional logic for astrological influences'
      },
      {
        search: `    if (tradition.astrologicalProfile?.rulingPlanets && 
        tradition?.astrologicalProfile?.rulingPlanets || []).length > 0) {`,
        replace: `    if (tradition.astrologicalProfile?.rulingPlanets && 
        Array.isArray(tradition.astrologicalProfile.rulingPlanets) && 
        tradition.astrologicalProfile.rulingPlanets.length > 0) {`,
        description: 'Fix malformed conditional logic for ruling planets'
      },
      {
        search: `        Object.values((tradition[regionalCuisines]) || []).forEach((region: unknown) => {`,
        replace: `        Object.values(tradition.regionalCuisines || {}).forEach((region: any) => {`,
        description: 'Fix malformed object values access'
      },
      {
        search: `                region.astrologicalInfluences  || [].forEach((influence: string) => {`,
        replace: `                (region.astrologicalInfluences || []).forEach((influence: string) => {`,
        description: 'Fix malformed array forEach call'
      }
    ]
  },
  {
    filePath: 'src/lib/FoodAlchemySystem.ts',
    fixes: [
      {
        search: `                signInfo[planetSign].(Array.isArray(decanEffects[decan]) ? decanEffects[decan].includes(planetaryDay)  : decanEffects[decan] === planetaryDay)) {`,
        replace: `                Array.isArray(signInfo[planetSign].decanEffects[decan]) && 
                signInfo[planetSign].decanEffects[decan].includes(planetaryDay)) {`,
        description: 'Fix malformed decan effects check'
      },
      {
        search: `                signInfo[planetSign].(degreeEffects[planetaryDay] || [])).length === 2) {`,
        replace: `                Array.isArray(signInfo[planetSign].degreeEffects[planetaryDay]) && 
                signInfo[planetSign].degreeEffects[planetaryDay].length === 2) {`,
        description: 'Fix malformed degree effects check'
      },
      {
        search: `            const hourAspects = state?.aspects || [].filter(a => 
                Array.isArray(a.planets) ? planets.includes(planetaryHour)  : planets === planetaryHour));`,
        replace: `            const hourAspects = (state?.aspects || []).filter(a => 
                Array.isArray(a.planets) ? a.planets.includes(planetaryHour) : a.planets === planetaryHour);`,
        description: 'Fix malformed aspect filtering logic'
      }
    ]
  }
];

// Type additions for better TypeScript support
const typeAdditions = {
  'src/components/RealtimeAlchemicalCalculator.tsx': {
    imports: [
      `import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';`,
      `import type { PlanetPosition } from '@/utils/astrologyUtils';`
    ],
    interfaces: []
  },
  'src/components/PlanetaryHours/PlanetaryHoursDisplay.tsx': {
    imports: [
      `import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';`,
      `import { celestialCalculator } from '@/services/celestialCalculations';`
    ],
    interfaces: []
  },
  'src/components/PlanetaryHours/PlanetaryHoursDisplay.migrated.tsx': {
    imports: [
      `import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';`,
      `import { celestialCalculator } from '@/services/celestialCalculations';`
    ],
    interfaces: []
  },
  'src/lib/cuisineCalculations.ts': {
    imports: [
      `import type { CulinaryTradition } from '@/types/cuisine';`
    ],
    interfaces: [
      `interface TraditionWithAstrology extends CulinaryTradition {
  astrologicalProfile?: {
    influences?: string[];
    rulingPlanets?: string[];
  };
  regionalCuisines?: Record<string, any>;
}`
    ]
  },
  'src/lib/FoodAlchemySystem.ts': {
    imports: [
      `import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';`,
      `import type { PlanetPosition } from '@/utils/astrologyUtils';`
    ],
    interfaces: []
  }
};

async function fixFile(config: FileFixConfig): Promise<boolean> {
  const fullPath = path.resolve(config.filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${config.filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    let modified = false;

    // Apply fixes
    for (const fix of config.fixes) {
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        modified = true;
        console.log(`✅ ${fix.description}`);
      } else {
        console.log(`⚠️  Pattern not found: ${fix.description}`);
      }
    }

    // Add type improvements if available
    const typeConfig = typeAdditions[config.filePath as keyof typeof typeAdditions];
    if (typeConfig) {
      // Add imports after existing imports
      const importRegex = /^(import[^;]+;?\n)*/m;
      const existingImports = content.match(importRegex)?.[0] || '';
      
      for (const newImport of typeConfig.imports) {
        if (!content.includes(newImport)) {
          content = content.replace(importRegex, existingImports + newImport + '\n');
          modified = true;
          console.log(`✅ Added import: ${newImport}`);
        }
      }

      // Add interfaces before the main component/class
      for (const newInterface of typeConfig.interfaces) {
        if (!content.includes(newInterface.split('\n')[0])) {
          const insertPoint = content.indexOf('export ');
          if (insertPoint > -1) {
            content = content.slice(0, insertPoint) + newInterface + '\n\n' + content.slice(insertPoint);
            modified = true;
            console.log(`✅ Added interface`);
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`✅ Fixed file: ${config.filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${config.filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error fixing ${config.filePath}:`, error);
    return false;
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN - No files will be modified');
    console.log('Files to be processed:');
    fileConfigs.forEach(config => {
      console.log(`  - ${config.filePath} (${config.fixes.length} fixes)`);
    });
    return;
  }

  console.log('🔧 Fixing problematic TypeScript files with astrologize integration...\n');

  let totalFixed = 0;
  let totalProcessed = 0;

  for (const config of fileConfigs) {
    console.log(`\n📁 Processing: ${config.filePath}`);
    totalProcessed++;
    
    const wasFixed = await fixFile(config);
    if (wasFixed) {
      totalFixed++;
    }
  }

  console.log(`\n🎯 Summary:`);
  console.log(`   Files processed: ${totalProcessed}`);
  console.log(`   Files modified: ${totalFixed}`);
  console.log(`   Files unchanged: ${totalProcessed - totalFixed}`);

  if (totalFixed > 0) {
    console.log('\n✨ TypeScript fixes completed! Run `yarn build` to verify.');
  }
}

// Run if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { fixFile, fileConfigs }; 