import fs from 'fs';
import path from 'path';

/**
 * Fix Import/Export Script
 * 
 * This script fixes common import/export issues in the codebase:
 * 1. Adds missing exports for constants like LUNAR_PHASE_MAPPING
 * 2. Ensures proper re-exports from index files
 * 3. Fixes default export confusion in hooks
 * 
 * Run with:
 *   node scripts/fix-import-exports.js [--dry-run]
 */

// Set dry run mode based on command line args
const isDryRun = process.argv.includes('--dry-run');
console.log(`Running in ${isDryRun ? 'DRY RUN' : 'NORMAL'} mode`);

// Helper function to read a file
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Helper function to write a file if not in dry run mode
function writeFile(filePath, content) {
  if (isDryRun) {
    console.log(`[DRY RUN] Would write to ${filePath}`);
    return true;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// Fix missing lunar phase exports
function fixLunarPhaseUtils() {
  const filePath = path.resolve(process.cwd(), 'src/utils/lunarPhaseUtils.ts');
  console.log(`Processing ${filePath}`);
  
  const content = readFile(filePath);
  if (!content) return false;
  
  // Check if exports already exist
  if (content.includes('export { LUNAR_PHASE_MAPPING, LUNAR_PHASE_REVERSE_MAPPING }')) {
    console.log('Lunar phase exports already fixed');
    return true;
  }
  
  // Add export and fallback definitions
  const updatedContent = content.replace(
    /import type \{ ElementalProperties, LunarPhase, LunarPhaseWithSpaces, LunarPhaseWithUnderscores \} from '\.\.\/types\/alchemy';\nimport \{ LUNAR_PHASE_MAPPING, LUNAR_PHASE_REVERSE_MAPPING \} from '\.\.\/types\/alchemy';/,
    `import type { ElementalProperties, LunarPhase, LunarPhaseWithSpaces, LunarPhaseWithUnderscores } from '../types/alchemy';
import { LUNAR_PHASE_MAPPING, LUNAR_PHASE_REVERSE_MAPPING } from '../types/alchemy';

// Export lunar phase mappings for files that can't access them directly from types/alchemy
export { LUNAR_PHASE_MAPPING, LUNAR_PHASE_REVERSE_MAPPING };

// Fallback definitions if not provided by imports (for backward compatibility)
export const LOCAL_LUNAR_PHASE_MAPPING: Record<LunarPhaseWithSpaces, LunarPhaseWithUnderscores> = {
  'new Moonmoon': 'new_moon',
  'waxing crescent': 'waxing_crescent',
  'first quarter': 'first_quarter',
  'waxing gibbous': 'waxing_gibbous',
  'full Moonmoon': 'full_moon',
  'waning gibbous': 'waning_gibbous',
  'last quarter': 'last_quarter',
  'waning crescent': 'waning_crescent'
};

export const LOCAL_LUNAR_PHASE_REVERSE_MAPPING: Record<LunarPhaseWithUnderscores, LunarPhaseWithSpaces> = {
  'new_moon': 'new Moonmoon',
  'waxing_crescent': 'waxing crescent',
  'first_quarter': 'first quarter',
  'waxing_gibbous': 'waxing gibbous',
  'full_moon': 'full Moonmoon',
  'waning_gibbous': 'waning gibbous',
  'last_quarter': 'last quarter',
  'waning_crescent': 'waning crescent'
};`
  );
  
  return writeFile(filePath, updatedContent);
}

// Fix hooks index.ts file for default export confusion
function fixHooksIndex() {
  const filePath = path.resolve(process.cwd(), 'src/hooks/index.ts');
  console.log(`Processing ${filePath}`);
  
  const content = readFile(filePath);
  if (!content) return false;
  
  // Check if already fixed
  if (content.includes('useAstrologicalStateDefault')) {
    console.log('Hooks index already fixed');
    return true;
  }
  
  // Update content with proper exports
  const updatedContent = content.replace(
    /export \{ default as useAstrologicalState \} from '\.\/useAstrologicalState';/,
    `// Export useAstrologicalState with both default and named exports for compatibility
import useAstrologicalStateDefault from './useAstrologicalState';
export { useAstrologicalState } from './useAstrologicalState';`
  ).replace(
    /export \{ default as useAlchemicalRecommendations \} from '\.\/useAlchemicalRecommendations';/,
    `// Export useAlchemicalRecommendations
import { useAlchemicalRecommendations as useAlchemicalRecommendationsNamed } from './useAlchemicalRecommendations';
export { useAlchemicalRecommendations } from './useAlchemicalRecommendations';
export const useAlchemicalRecommendationsDefault = useAlchemicalRecommendationsNamed;

// Export a single default
export default useAstrologicalStateDefault;`
  );
  
  return writeFile(filePath, updatedContent);
}

// Fix AstrologyService to add DEFAULT_PLANETARY_ALIGNMENT
function fixAstrologyService() {
  const filePath = path.resolve(process.cwd(), 'src/services/AstrologyService.ts');
  console.log(`Processing ${filePath}`);
  
  const content = readFile(filePath);
  if (!content) return false;
  
  // Check if already fixed
  if (content.includes('export const DEFAULT_PLANETARY_ALIGNMENT')) {
    console.log('AstrologyService already fixed');
    return true;
  }
  
  // Update content to define and export DEFAULT_PLANETARY_ALIGNMENT
  const updatedContent = content.replace(
    /import \{\s*PlanetaryAlignment,\s*CelestialPosition,\s*ZodiacSign,\s*Planet,\s*LunarPhase,\s*AstrologicalState,\s*DEFAULT_PLANETARY_ALIGNMENT\s*\} from '\.\.\/types';/,
    `import { 
  PlanetaryAlignment, 
  CelestialPosition, 
  ZodiacSign, 
  Planet, 
  LunarPhase,
  AstrologicalState
} from '../types';

// Define and export the DEFAULT_PLANETARY_ALIGNMENT constant
export const DEFAULT_PLANETARY_ALIGNMENT: PlanetaryAlignment = {
  Sun: { sign: 'aries', degree: 0 },
  Moon: { sign: 'taurus', degree: 0 },
  Mercury: { sign: 'gemini', degree: 0 },
  Venus: { sign: 'libra', degree: 0 },
  Mars: { sign: 'aries', degree: 0 },
  Jupiter: { sign: 'sagittarius', degree: 0 },
  Saturn: { sign: 'capricorn', degree: 0 },
  Uranus: { sign: 'aquarius', degree: 0 },
  Neptune: { sign: 'pisces', degree: 0 },
  Pluto: { sign: 'scorpio', degree: 0 }
};`
  );
  
  return writeFile(filePath, updatedContent);
}

// Fix planetInfo export in planets.ts
function fixPlanetInfo() {
  const filePath = path.resolve(process.cwd(), 'src/data/planets.ts');
  console.log(`Processing ${filePath}`);
  
  const content = readFile(filePath);
  if (!content) return false;
  
  // Check if already fixed
  if (content.includes('export const planetInfo')) {
    console.log('planetInfo export already fixed');
    return true;
  }
  
  // Add planetInfo export
  const updatedContent = content.replace(
    /export default planetaryData;/,
    `// Core Alchemizer Engine data structure needed by alchemicalEngine and other modules
export const planetInfo = {
  Sun: {
    'Dignity Effect': { leoLeo: 1, ariesAries: 2, aquariusAquarius: -1, libraLibra: -2 },
    Elements: ['Fire', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire'
  },
  Moon: {
    'Dignity Effect': { cancerCancer: 1, taurusTaurus: 2, capricornCapricorn: -1, scorpioScorpio: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Mercury: {
    'Dignity Effect': { geminiGemini: 1, virgoVirgo: 3, sagittariusSagittarius: 1, piscesPisces: -3 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  Venus: {
    'Dignity Effect': { libraLibra: 1, taurusTaurus: 1, piscesPisces: 2, ariesAries: -1, scorpioScorpio: -1, virgoVirgo: -2 },
    Elements: ['Water', 'Earth'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Earth'
  },
  Mars: {
    'Dignity Effect': { ariesAries: 1, scorpioScorpio: 1, capricornCapricorn: 2, taurusTaurus: -1, libraLibra: -1, cancerCancer: -2 },
    Elements: ['Fire', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Water'
  },
  Jupiter: {
    'Dignity Effect': { piscesPisces: 1, sagittariusSagittarius: 1, cancerCancer: 2, geminiGemini: -1, virgoVirgo: -1, capricornCapricorn: -2 },
    Elements: ['Air', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Fire'
  },
  Saturn: {
    'Dignity Effect': { aquariusAquarius: 1, capricornCapricorn: 1, libraLibra: 2, cancerCancer: -1, leoLeo: -1, ariesAries: -2 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  Uranus: {
    'Dignity Effect': { aquariusAquarius: 1, scorpioScorpio: 2, taurusTaurus: -3 },
    Elements: ['Water', 'Air'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Air'
  },
  Neptune: {
    'Dignity Effect': { piscesPisces: 1, cancerCancer: 2, virgoVirgo: -1, capricornCapricorn: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Pluto: {
    'Dignity Effect': { scorpioScorpio: 1, leoLeo: 2, taurusTaurus: -1, aquariusAquarius: -2 },
    Elements: ['Earth', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Water'
  },
  Ascendant: {
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Earth'
  }
};

export default planetaryData;`
  );
  
  return writeFile(filePath, updatedContent);
}

// Run all fixes
async function runFixes() {
  console.log('Running import/export fixes...');
  
  const results = [
    fixLunarPhaseUtils(),
    fixHooksIndex(),
    fixAstrologyService(),
    fixPlanetInfo(),
  ];
  
  // Check results
  const allSuccessful = results.every(result => result);
  
  if (allSuccessful) {
    console.log('\nAll fixes completed successfully!');
    if (isDryRun) {
      console.log('This was a dry run. No files were modified.');
      console.log('Run without --dry-run to apply changes.');
    }
  } else {
    console.error('\nSome fixes failed. See errors above.');
    process.exit(1);
  }
}

// Run the script
runFixes().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 