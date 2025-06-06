#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

function log(message) {
  console.log(`[${DRY_RUN ? 'DRY-RUN' : 'FIXING'}] ${message}`);
}

function writeFileIfNotDryRun(filePath, content) {
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Fix 1: Ensure types/celestial.ts exports PlanetaryAlignment
function fixCelestialTypes() {
  const filePath = 'src/types/celestial.ts';
  
  if (!fs.existsSync(filePath)) {
    log(`Creating ${filePath} with PlanetaryAlignment export`);
    const content = `// Celestial types for astrological calculations

export interface PlanetaryAlignment {
  Sun?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Moon?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Mercury?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Venus?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Mars?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Jupiter?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Saturn?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Uranus?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Neptune?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Pluto?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  [key: string]: any;
}

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';
export type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';
`;
    writeFileIfNotDryRun(filePath, content);
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('export interface PlanetaryAlignment')) {
      log(`Adding PlanetaryAlignment export to ${filePath}`);
      const updatedContent = content + `
export interface PlanetaryAlignment {
  Sun?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Moon?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Mercury?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Venus?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Mars?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Jupiter?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Saturn?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Uranus?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Neptune?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  Pluto?: {
    sign: string;
    degree: number;
    minute?: number;
  };
  [key: string]: any;
}
`;
      writeFileIfNotDryRun(filePath, updatedContent);
    }
  }
}

// Fix 2: Update import paths that are using relative paths instead of absolute
function fixImportPaths() {
  const filesToFix = [
    'src/utils/alchemicalPillarUtils.ts'
  ];
  
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix relative import to absolute import
      if (content.includes("from '../constants/alchemicalPillars'")) {
        log(`Fixing import path in ${filePath}`);
        content = content.replace(
          "from '../constants/alchemicalPillars'",
          "from '@/constants/alchemicalPillars'"
        );
        modified = true;
      }
      
      if (modified) {
        writeFileIfNotDryRun(filePath, content);
      }
    }
  });
}

// Fix 3: Ensure all exports are properly re-exported from index files
function fixIndexExports() {
  // Fix data/unified/index.ts to properly export ingredients functions
  const unifiedIndexPath = 'src/data/unified/index.ts';
  if (fs.existsSync(unifiedIndexPath)) {
    let content = fs.readFileSync(unifiedIndexPath, 'utf8');
    
    // Check if ingredients functions are exported
    if (!content.includes('getUnifiedIngredient')) {
      log(`Adding ingredient function exports to ${unifiedIndexPath}`);
      content += `
// Export ingredient utility functions
export {
  getUnifiedIngredient,
  getUnifiedIngredientsByCategory,
  getUnifiedIngredientsBySubcategory,
  getHighKalchmIngredients,
  findComplementaryIngredients
} from './ingredients';
`;
      writeFileIfNotDryRun(unifiedIndexPath, content);
    }
  }
}

// Fix 4: Check and fix any missing function implementations
function fixMissingFunctions() {
  // Check if convertToLunarPhase is properly implemented
  const lunarPhaseUtilsPath = 'src/utils/lunarPhaseUtils.ts';
  if (fs.existsSync(lunarPhaseUtilsPath)) {
    let content = fs.readFileSync(lunarPhaseUtilsPath, 'utf8');
    
    if (!content.includes('export function convertToLunarPhase')) {
      log(`Adding convertToLunarPhase function to ${lunarPhaseUtilsPath}`);
      content += `
/**
 * Convert lunar phase value to standard lunar phase name
 */
export function convertToLunarPhase(phaseValue: number): string {
  // Normalize phase value to 0-1 range
  const normalizedPhase = ((phaseValue % 1) + 1) % 1;
  
  if (normalizedPhase < 0.125) return 'new Moonmoon';
  if (normalizedPhase < 0.25) return 'waxing crescent';
  if (normalizedPhase < 0.375) return 'first quarter';
  if (normalizedPhase < 0.5) return 'waxing gibbous';
  if (normalizedPhase < 0.625) return 'full Moonmoon';
  if (normalizedPhase < 0.75) return 'waning gibbous';
  if (normalizedPhase < 0.875) return 'last quarter';
  return 'waning crescent';
}
`;
      writeFileIfNotDryRun(lunarPhaseUtilsPath, content);
    }
  }
}

// Fix 5: Ensure proper export format for hooks
function fixHooksExports() {
  const hooksIndexPath = 'src/hooks/index.ts';
  if (fs.existsSync(hooksIndexPath)) {
    let content = fs.readFileSync(hooksIndexPath, 'utf8');
    
    // Ensure useFoodRecommendations is exported as named export
    if (content.includes('export { default as useFoodRecommendations }')) {
      log(`Fixing useFoodRecommendations export in ${hooksIndexPath}`);
      content = content.replace(
        'export { default as useFoodRecommendations }',
        'export { useFoodRecommendations }'
      );
      writeFileIfNotDryRun(hooksIndexPath, content);
    }
  }
}

// Fix 6: Add any missing type definitions
function fixMissingTypes() {
  // Ensure ThermodynamicMetrics is properly defined
  const alchemyTypesPath = 'src/types/alchemy.ts';
  if (fs.existsSync(alchemyTypesPath)) {
    let content = fs.readFileSync(alchemyTypesPath, 'utf8');
    
    if (!content.includes('export interface ThermodynamicMetrics')) {
      log(`Adding ThermodynamicMetrics interface to ${alchemyTypesPath}`);
      content += `
export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  energy?: number;
  gregsEnergy?: number;
}
`;
      writeFileIfNotDryRun(alchemyTypesPath, content);
    }
  }
}

// Main execution
function main() {
  log('Starting import error fixes...');
  
  try {
    fixCelestialTypes();
    fixImportPaths();
    fixIndexExports();
    fixMissingFunctions();
    fixHooksExports();
    fixMissingTypes();
    
    log('Import error fixes completed successfully!');
    
    if (DRY_RUN) {
      console.log('\n🔍 This was a dry run. To apply changes, run:');
      console.log('node fix-remaining-import-errors.js');
    } else {
      console.log('\n✅ All import errors have been fixed!');
      console.log('Run "yarn build" to verify the fixes.');
    }
    
  } catch (error) {
    console.error('❌ Error during import fixes:', error.message);
    process.exit(1);
  }
}

main(); 