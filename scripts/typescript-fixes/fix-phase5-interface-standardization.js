#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Phase 5: Interface Standardization & Import Conflicts');
console.log('Target: ~400-500 errors | Priority: HIGH');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Import declaration conflicts to resolve
const IMPORT_CONFLICTS = [
  {
    files: [
      'src/calculations/elementalcalculations.ts',
      'src/hooks/useElementalState.ts',
      'src/types/alchemy.ts',
      'src/types/cuisine.ts',
      'src/types/elemental.ts',
      'src/types/recipe.ts',
      'src/types/zodiac.ts',
      'src/utils/astrology/core.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/stateValidator.ts'
    ],
    conflict: 'ElementalProperties',
    solution: 'import { ElementalProperties } from \'@/types\';'
  },
  {
    files: [
      'src/components/PlanetaryDisplay.tsx',
      'src/constants/signEnergyStates.ts',
      'src/scripts/testGasGiantInfluences.ts',
      'src/services/celestialCalculations.ts',
      'src/types/alchemy.ts',
      'src/utils/alchemicalCalculations.ts',
      'src/utils/astrology/calculations.ts',
      'src/utils/astrologyValidation.ts'
    ],
    conflict: 'PlanetaryPosition',
    solution: 'import { PlanetaryPosition } from \'@/types/celestial\';'
  },
  {
    files: [
      'src/context/AstrologicalContext.tsx',
      'src/services/AstrologicalService.ts',
      'src/types/alchemy.ts',
      'src/utils/astrology/index.ts',
      'src/utils/cuisineRecommender.ts',
      'src/utils/recommendation/cuisineRecommendation.ts'
    ],
    conflict: 'AstrologicalState',
    solution: 'import { AstrologicalState } from \'@/types/celestial\';'
  },
  {
    files: [
      'src/types/alchemy.ts',
      'src/data/ingredients/types.ts',
      'src/data/unified/alchemicalCalculations.ts',
      'src/data/unified/ingredients.ts'
    ],
    conflict: 'AlchemicalProperties',
    solution: 'import { AlchemicalProperties } from \'@/types\';'
  },
  {
    files: [
      'src/constants/lunar.ts',
      'src/constants/lunarPhases.ts',
      'src/types/lunar.ts',
      'src/utils/constants/lunar.ts',
      'src/utils/lunarPhaseUtils.ts'
    ],
    conflict: 'LUNAR_PHASES',
    solution: 'import { LUNAR_PHASES } from \'@/constants/lunar\';'
  },
  {
    files: [
      'src/services/astrologyApi.ts',
      'src/services/celestialCalculations.ts',
      'src/types/alchemy.ts',
      'src/types/zodiac.ts',
      'src/utils/astrology/validation.ts'
    ],
    conflict: 'CelestialPosition',
    solution: 'import { CelestialPosition } from \'@/types/celestial\';'
  },
  {
    files: [
      'src/lib/FoodAlchemySystem.ts',
      'src/utils/elemental/elementCompatibility.ts',
      'src/utils/seasonalCalculations.ts'
    ],
    conflict: 'Element',
    solution: 'import { Element } from \'@/types\';'
  }
];

// Files with missing exports that need to be resolved
const MISSING_EXPORTS = [
  {
    file: 'src/types/index.ts',
    exports: [
      'ElementalProperties',
      'AlchemicalProperties', 
      'Element',
      'ThermodynamicProperties'
    ]
  },
  {
    file: 'src/types/celestial.ts',
    exports: [
      'AstrologicalState',
      'PlanetaryPosition',
      'CelestialPosition',
      'PlanetaryAlignment'
    ]
  },
  {
    file: 'src/constants/lunar.ts',
    exports: [
      'LUNAR_PHASES'
    ]
  }
];

// Function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
    return null;
  }
}

// Function to write file content
function writeFile(filePath, content) {
  if (DRY_RUN) {
    console.log(`Would write: ${filePath}`);
    return;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing ${filePath}:`, error.message);
  }
}

// Function to resolve import conflicts
function resolveImportConflicts() {
  console.log('\n📋 Resolving Import Declaration Conflicts...');
  
  let fixedCount = 0;
  
  for (const conflict of IMPORT_CONFLICTS) {
    console.log(`\n🔍 Processing ${conflict.conflict} conflicts...`);
    
    for (const file of conflict.files) {
      const fullPath = path.join(ROOT_DIR, file);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${file}`);
        continue;
      }
      
      const content = readFile(fullPath);
      if (!content) continue;
      
      // Check if this file has the import conflict
      const hasLocalDeclaration = content.includes(`const ${conflict.conflict}`) ||
                                  content.includes(`let ${conflict.conflict}`) ||
                                  content.includes(`var ${conflict.conflict}`) ||
                                  content.includes(`interface ${conflict.conflict}`) ||
                                  content.includes(`type ${conflict.conflict}`);
      
      const hasImport = content.includes(`import`) && content.includes(conflict.conflict);
      
      if (hasLocalDeclaration && hasImport) {
        console.log(`🔧 Fixing conflict in: ${file}`);
        
        // Remove conflicting local declarations and replace with proper import
        let newContent = content;
        
        // Remove local interface/type declarations
        newContent = newContent.replace(
          new RegExp(`^\\s*(export\\s+)?(interface|type)\\s+${conflict.conflict}[^{]*{[^}]*}\\s*`, 'gm'),
          ''
        );
        
        // Remove local const/let/var declarations
        newContent = newContent.replace(
          new RegExp(`^\\s*(export\\s+)?(const|let|var)\\s+${conflict.conflict}\\s*=.*?;\\s*`, 'gm'),
          ''
        );
        
        // Ensure proper import exists at the top
        const lines = newContent.split('\n');
        const importIndex = lines.findIndex(line => line.includes('import') && line.includes(conflict.conflict));
        
        if (importIndex === -1) {
          // Add import at top after existing imports or at beginning
          let insertIndex = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import')) {
              insertIndex = i + 1;
            } else if (lines[i].trim() === '' && insertIndex > 0) {
              insertIndex = i;
              break;
            } else if (!lines[i].startsWith('import') && !lines[i].startsWith('//') && lines[i].trim() !== '') {
              break;
            }
          }
          lines.splice(insertIndex, 0, conflict.solution);
        } else {
          // Replace existing problematic import
          lines[importIndex] = conflict.solution;
        }
        
        newContent = lines.join('\n');
        
        // Clean up multiple empty lines
        newContent = newContent.replace(/\n{3,}/g, '\n\n');
        
        if (newContent !== content) {
          writeFile(fullPath, newContent);
          fixedCount++;
        }
      }
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} import declaration conflicts`);
  return fixedCount;
}

// Function to ensure required exports exist
function ensureExports() {
  console.log('\n📋 Ensuring Required Exports...');
  
  let fixedCount = 0;
  
  for (const exportInfo of MISSING_EXPORTS) {
    const fullPath = path.join(ROOT_DIR, exportInfo.file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Creating missing file: ${exportInfo.file}`);
      
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      let content = '';
      
      if (exportInfo.file.includes('types/index.ts')) {
        content = `// Unified type exports
export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface AlchemicalProperties {
  hot: number;
  dry: number;
  cold: number;
  wet: number;
}

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}
`;
      } else if (exportInfo.file.includes('types/celestial.ts')) {
        content = `// Celestial and astrological type definitions
export interface PlanetaryPosition {
  sign: string;
  degree: number;
  minutes?: number;
}

export interface CelestialPosition {
  sign: string;
  degree: number;
  minutes: number;
  phase?: string;
}

export interface PlanetaryAlignment {
  [planet: string]: PlanetaryPosition;
}

export interface AstrologicalState {
  sign: string;
  lunarPhase: string;
  planetaryAlignment: PlanetaryAlignment;
  activePlanets: string[];
  planetaryHour: string;
  currentZodiacSign: string;
  dominantElement: string;
  seasonalInfluence: string;
}
`;
      } else if (exportInfo.file.includes('constants/lunar.ts')) {
        content = `// Lunar phase constants
export const LUNAR_PHASES = {
  'new moon': 'new moon',
  'waxing crescent': 'waxing crescent',
  'first quarter': 'first quarter',
  'waxing gibbous': 'waxing gibbous',
  'full moon': 'full moon',
  'waning gibbous': 'waning gibbous',
  'third quarter': 'third quarter',
  'waning crescent': 'waning crescent'
} as const;

export type LunarPhase = keyof typeof LUNAR_PHASES;
`;
      }
      
      writeFile(fullPath, content);
      fixedCount++;
      continue;
    }
    
    const content = readFile(fullPath);
    if (!content) continue;
    
    let needsUpdate = false;
    let newContent = content;
    
    for (const exportName of exportInfo.exports) {
      const hasExport = content.includes(`export`) && 
                       (content.includes(`interface ${exportName}`) ||
                        content.includes(`type ${exportName}`) ||
                        content.includes(`const ${exportName}`) ||
                        content.includes(`{ ${exportName}`) ||
                        content.includes(`${exportName},`));
      
      if (!hasExport) {
        console.log(`📝 Adding missing export: ${exportName} to ${exportInfo.file}`);
        needsUpdate = true;
        
        // Add export at the end if not found
        if (exportInfo.file.includes('index.ts')) {
          newContent += `\nexport type { ${exportName} } from './types';`;
        }
      }
    }
    
    if (needsUpdate) {
      writeFile(fullPath, newContent);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Ensured ${fixedCount} export definitions`);
  return fixedCount;
}

// Function to fix case sensitivity issues in imports
function fixCaseSensitivityIssues() {
  console.log('\n📋 Fixing Case Sensitivity Issues...');
  
  const caseFixes = [
    {
      pattern: /from\s+['"]['"`]@\/services\/nutritionService['"]['"`]/g,
      replacement: "from '@/services/NutritionService'"
    },
    {
      pattern: /Moon:/g,
      replacement: "moon:"
    },
    {
      pattern: /\.Moon\b/g,
      replacement: ".moon"
    }
  ];
  
  let fixedCount = 0;
  
  function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.includes('node_modules')) {
        processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = readFile(fullPath);
        if (!content) continue;
        
        let newContent = content;
        let changed = false;
        
        for (const fix of caseFixes) {
          const updated = newContent.replace(fix.pattern, fix.replacement);
          if (updated !== newContent) {
            changed = true;
            newContent = updated;
          }
        }
        
        if (changed) {
          const relativePath = path.relative(ROOT_DIR, fullPath);
          console.log(`🔧 Fixed case sensitivity: ${relativePath}`);
          writeFile(fullPath, newContent);
          fixedCount++;
        }
      }
    }
  }
  
  processDirectory(SRC_DIR);
  
  console.log(`\n✅ Fixed ${fixedCount} case sensitivity issues`);
  return fixedCount;
}

// Main execution
async function main() {
  console.log('🚀 Starting Phase 5: Interface Standardization');
  
  const startTime = Date.now();
  let totalFixes = 0;
  
  try {
    // Step 1: Resolve import declaration conflicts
    totalFixes += resolveImportConflicts();
    
    // Step 2: Ensure required exports exist
    totalFixes += ensureExports();
    
    // Step 3: Fix case sensitivity issues
    totalFixes += fixCaseSensitivityIssues();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 Phase 5 Completed!');
    console.log(`📊 Total fixes applied: ${totalFixes}`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    
    if (!DRY_RUN) {
      console.log('\n🔍 Recommended next steps:');
      console.log('1. Run: yarn build');
      console.log('2. Check remaining TypeScript errors');
      console.log('3. Proceed to Phase 6 if build succeeds');
    }
    
  } catch (error) {
    console.error('❌ Error during Phase 5 execution:', error);
    process.exit(1);
  }
}

main(); 