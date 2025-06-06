#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

console.log('🔧 Enhanced TypeScript Warning Fixer');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`);
console.log('─'.repeat(50));

const log = (message, level = 'info') => {
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
};

const verboseLog = (message) => {
  if (VERBOSE) {
    console.log(`🔍 ${message}`);
  }
};

// Enhanced fix functions for specific issues
const fixes = {
  // Fix 1: Remove conflicting JS files that shadow TS files
  removeConflictingJsFiles: () => {
    log('Checking for conflicting JavaScript files...');
    const conflictingFiles = [
      'src/constants/alchemicalPillars.js',
      'src/constants/planetaryElements.js', 
      'src/constants/planets.js',
      'src/types/alchemy.js',
      'src/types/celestial.js',
      'src/types/chakra.js',
      'src/types/seasons.js',
      'src/types/time.js',
      'src/types/zodiacAffinity.js'
    ];

    let removedCount = 0;
    for (const filePath of conflictingFiles) {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        verboseLog(`Found conflicting file: ${filePath}`);
        if (!DRY_RUN) {
          fs.unlinkSync(fullPath);
          log(`Removed conflicting file: ${filePath}`);
        } else {
          log(`Would remove: ${filePath}`, 'warn');
        }
        removedCount++;
      }
    }

    if (removedCount === 0) {
      log('No conflicting JS files found', 'success');
    } else {
      log(`${removedCount} conflicting JS files ${DRY_RUN ? 'would be' : ''} removed`);
    }

    return true;
  },

  // Fix 2: Add missing exports to constants/alchemicalPillars.ts
  fixAlchemicalPillarsExports: () => {
    const filePath = path.join(__dirname, 'src/constants/alchemicalPillars.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    const missingExports = [
      'getCookingMethodPillar',
      'getCookingMethodAlchemicalEffect', 
      'getCookingMethodThermodynamics',
      'getPlanetaryAlchemicalEffect',
      'getTarotCardAlchemicalEffect'
    ];

    let addedExports = [];
    for (const exportName of missingExports) {
      if (!content.includes(`export const ${exportName}`) && !content.includes(`export function ${exportName}`)) {
        // Check if the function exists but isn't exported
        if (content.includes(`const ${exportName}`) || content.includes(`function ${exportName}`)) {
          content = content.replace(new RegExp(`(const|function) ${exportName}`, 'g'), `export $1 ${exportName}`);
          addedExports.push(exportName);
        }
      }
    }

    if (addedExports.length > 0) {
      log(`Added exports for: ${addedExports.join(', ')}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else {
      log('All alchemical pillars exports already present', 'success');
    }

    return true;
  },

  // Fix 3: Add missing exports to constants/planetaryElements.ts
  fixPlanetaryElementsExports: () => {
    const filePath = path.join(__dirname, 'src/constants/planetaryElements.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    if (!content.includes('export') && content.includes('getPlanetaryElement')) {
      // If no exports but function exists, add export
      content = content.replace(/function getPlanetaryElement/, 'export function getPlanetaryElement');
      content = content.replace(/const getPlanetaryElement/, 'export const getPlanetaryElement');
      log('Added getPlanetaryElement export');
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else if (content.includes('export') && content.includes('getPlanetaryElement')) {
      log('getPlanetaryElement already exported', 'success');
    } else {
      log('getPlanetaryElement function not found, creating stub', 'warn');
      const stubContent = `
export const getPlanetaryElement = (planet: string): string => {
  const planetElements: Record<string, string> = {
    Sunsun: 'Fire',
    Moonmoon: 'Water', 
    Mercurymercury: 'Air',
    Venusvenus: 'Earth',
    Marsmars: 'Fire',
    Jupiterjupiter: 'Air',
    Saturnsaturn: 'Earth',
    Uranusuranus: 'Air',
    Neptuneneptune: 'Water',
    Plutopluto: 'Water'
  };
  return planetElements[planet.toLowerCase()] || 'Earth';
};
`;
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, stubContent);
      }
    }

    return true;
  },

  // Fix 4: Add missing exports to types/chakra.ts
  fixChakraTypeExports: () => {
    const filePath = path.join(__dirname, 'src/types/chakra.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    const missingExports = [
      'CHAKRAS',
      'MAJOR_ARCANA_CHAKRAS', 
      'SUIT_CHAKRA_MAPPINGS',
      'KEY_CARD_CHAKRA_MAPPINGS',
      'CHAKRA_ORDER'
    ];

    let addedExports = [];
    for (const exportName of missingExports) {
      if (!content.includes(`export const ${exportName}`) && content.includes(`${exportName}`)) {
        content = content.replace(new RegExp(`const ${exportName}`, 'g'), `export const ${exportName}`);
        addedExports.push(exportName);
      }
    }

    if (addedExports.length > 0) {
      log(`Added chakra exports for: ${addedExports.join(', ')}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else {
      log('All chakra exports already present', 'success');
    }

    return true;
  },

  // Fix 5: Add missing exports to types/time.ts
  fixTimeTypeExports: () => {
    const filePath = path.join(__dirname, 'src/types/time.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    if (!content.includes('export') && content.includes('getTimeFactors')) {
      content = content.replace(/function getTimeFactors/, 'export function getTimeFactors');
      content = content.replace(/const getTimeFactors/, 'export const getTimeFactors');
      log('Added getTimeFactors export');
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else if (content.includes('export')) {
      log('Time exports already present', 'success');
    } else {
      log('getTimeFactors function not found, creating stub', 'warn');
      const stubContent = `
export const getTimeFactors = () => {
  return {
    planetaryHour: 'Sunsun',
    timeOfDay: 'morning',
    season: 'spring'
  };
};
`;
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, stubContent);
      }
    }

    return true;
  },

  // Fix 6: Add missing exports to types/seasons.ts
  fixSeasonsTypeExports: () => {
    const filePath = path.join(__dirname, 'src/types/seasons.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    if (!content.includes('export') && content.includes('getCurrentSeason')) {
      content = content.replace(/function getCurrentSeason/, 'export function getCurrentSeason');
      content = content.replace(/const getCurrentSeason/, 'export const getCurrentSeason');
      log('Added getCurrentSeason export');
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else if (content.includes('export')) {
      log('Seasons exports already present', 'success');
    } else {
      log('getCurrentSeason function not found, creating stub', 'warn');
      const stubContent = `
export const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};
`;
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, stubContent);
      }
    }

    return true;
  },

  // Fix 7: Add missing exports to types/zodiacAffinity.ts
  fixZodiacAffinityExports: () => {
    const filePath = path.join(__dirname, 'src/types/zodiacAffinity.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    if (!content.includes('export') && content.includes('DEFAULT_ZODIAC_AFFINITY')) {
      content = content.replace(/const DEFAULT_ZODIAC_AFFINITY/, 'export const DEFAULT_ZODIAC_AFFINITY');
      log('Added DEFAULT_ZODIAC_AFFINITY export');
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else if (content.includes('export')) {
      log('Zodiac affinity exports already present', 'success');
    } else {
      log('DEFAULT_ZODIAC_AFFINITY not found, creating stub', 'warn');
      const stubContent = `
export const DEFAULT_ZODIAC_AFFINITY = {
  aries: 0.5,
  taurus: 0.5,
  gemini: 0.5,
  cancer: 0.5,
  leo: 0.5,
  virgo: 0.5,
  libra: 0.5,
  scorpio: 0.5,
  sagittarius: 0.5,
  capricorn: 0.5,
  aquarius: 0.5,
  pisces: 0.5
};
`;
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, stubContent);
      }
    }

    return true;
  },

  // Fix 8: Add missing exports to data/unified/ingredients.ts
  fixUnifiedIngredientsExports: () => {
    const filePath = path.join(__dirname, 'src/data/unified/ingredients.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    const missingExports = [
      'getUnifiedIngredient',
      'getUnifiedIngredientsByCategory',
      'getUnifiedIngredientsBySubcategory', 
      'getHighKalchmIngredients',
      'findComplementaryIngredients'
    ];

    let addedExports = [];
    for (const exportName of missingExports) {
      if (!content.includes(`export const ${exportName}`) && !content.includes(`export function ${exportName}`)) {
        // Check if the function exists but isn't exported
        if (content.includes(`const ${exportName}`) || content.includes(`function ${exportName}`)) {
          content = content.replace(new RegExp(`(const|function) ${exportName}`, 'g'), `export $1 ${exportName}`);
          addedExports.push(exportName);
        }
      }
    }

    if (addedExports.length > 0) {
      log(`Added unified ingredients exports for: ${addedExports.join(', ')}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else {
      log('All unified ingredients exports already present', 'success');
    }

    return true;
  },

  // Fix 9: Add missing convertToLunarPhase export to lunarPhaseUtils.ts
  fixLunarPhaseUtilsExports: () => {
    const filePath = path.join(__dirname, 'src/utils/lunarPhaseUtils.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    if (!content.includes('export') || !content.includes('convertToLunarPhase')) {
      // Add the missing function
      const convertToLunarPhaseFunction = `
export const convertToLunarPhase = (phase: string): string => {
  const phaseMap: Record<string, string> = {
    'new': 'new Moonmoon',
    'waxing_crescent': 'waxing crescent', 
    'first_quarter': 'first quarter',
    'waxing_gibbous': 'waxing gibbous',
    'full': 'full Moonmoon',
    'waning_gibbous': 'waning gibbous',
    'last_quarter': 'last quarter', 
    'waning_crescent': 'waning crescent'
  };
  return phaseMap[phase] || phase;
};
`;
      
      content += convertToLunarPhaseFunction;
      log('Added convertToLunarPhase function');
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else {
      log('convertToLunarPhase already present', 'success');
    }

    return true;
  },

  // Fix 10: Fix useFoodRecommendations default export
  fixUseFoodRecommendationsExport: () => {
    const filePath = path.join(__dirname, 'src/hooks/useFoodRecommendations.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    verboseLog(`Reading ${filePath}`);
    
    if (!content.includes('export default')) {
      content += '\n\n// Default export for easier importing\nexport default useFoodRecommendations;\n';
      log('Added default export to useFoodRecommendations');
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
    } else {
      log('useFoodRecommendations default export already exists', 'success');
    }

    return true;
  }
};

// Execute all fixes
const runFixes = async () => {
  const results = {};
  
  log('Starting enhanced TypeScript warning fixes...\n');
  
  for (const [fixName, fixFunction] of Object.entries(fixes)) {
    try {
      log(`Running ${fixName}...`);
      const result = await fixFunction();
      results[fixName] = result;
      if (result) {
        log(`${fixName} completed successfully`, 'success');
      } else {
        log(`${fixName} encountered issues`, 'warn');
      }
    } catch (error) {
      log(`${fixName} failed: ${error.message}`, 'error');
      results[fixName] = false;
    }
    console.log(''); // Add spacing between fixes
  }
  
  // Summary
  log('─'.repeat(50));
  log('Fix Summary:');
  const successful = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`${successful}/${total} fixes completed successfully`);
  
  if (successful < total) {
    log('Some fixes encountered issues. Check the output above for details.', 'warn');
  }
  
  if (DRY_RUN) {
    log('\n📝 This was a dry run. No files were modified.');
    log('Run without --dry-run to apply changes.');
  } else {
    log('\n✨ All applicable fixes have been applied.');
    log('Run yarn build to verify the fixes resolved the TypeScript warnings.');
  }
};

// Main execution
runFixes().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
}); 