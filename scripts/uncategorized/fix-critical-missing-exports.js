#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Dry run mode
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 Fix Critical Missing Exports ${isDryRun ? '(DRY RUN)' : ''}`);
console.log('========================================');

// Track changes to be made
const changes = [];

function addExportToFile(filePath, exportStatement, description) {
  try {
    const fullPath = resolve(filePath);
    const content = readFileSync(fullPath, 'utf8');
    
    // Check if export already exists
    if (content.includes(exportStatement.split(' ')[2])) {
      console.log(`✓ ${description} already exists in ${filePath}`);
      return;
    }
    
    const newContent = content + '\n' + exportStatement;
    
    if (isDryRun) {
      console.log(`📝 Would add to ${filePath}:`);
      console.log(`   ${exportStatement}`);
      changes.push({ file: filePath, change: exportStatement });
    } else {
      writeFileSync(fullPath, newContent);
      console.log(`✅ Added ${description} to ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}: ${error.message}`);
  }
}

// Fix 1: Add CHAKRA_ORDER to chakraSymbols.ts
addExportToFile(
  'src/constants/chakraSymbols.ts',
  "export const CHAKRA_ORDER = ['crown', 'brow', 'throat', 'heart', 'solarPlexus', 'sacral', 'root'];",
  'CHAKRA_ORDER constant'
);

// Fix 2: Check if types/time.ts exists and add getTimeFactors if needed
try {
  const timeTypesPath = 'src/types/time.ts';
  const timeContent = readFileSync(resolve(timeTypesPath), 'utf8');
  
  if (!timeContent.includes('getTimeFactors')) {
    addExportToFile(
      timeTypesPath,
      `export function getTimeFactors(date: Date = new Date()) {
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isDaytime = hour >= 6 && hour < 18;
  
  return {
    hour,
    dayOfWeek,
    isWeekend,
    isDaytime,
    planetaryHour: Math.floor(hour / 3) % 7, // Simplified planetary hour calculation
  };
}`,
      'getTimeFactors function'
    );
  }
} catch (error) {
  console.log(`⚠️ types/time.ts not found, creating...`);
  if (!isDryRun) {
    writeFileSync(resolve('src/types/time.ts'), `export interface TimeFactors {
  hour: number;
  dayOfWeek: number;
  isWeekend: boolean;
  isDaytime: boolean;
  planetaryHour: number;
}

export function getTimeFactors(date: Date = new Date()): TimeFactors {
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isDaytime = hour >= 6 && hour < 18;
  
  return {
    hour,
    dayOfWeek,
    isWeekend,
    isDaytime,
    planetaryHour: Math.floor(hour / 3) % 7, // Simplified planetary hour calculation
  };
}
`);
    console.log('✅ Created src/types/time.ts with getTimeFactors');
  }
}

// Fix 3: Add missing chakra exports to types/chakra.ts
try {
  const chakraTypesPath = 'src/types/chakra.ts';
  const chakraContent = readFileSync(resolve(chakraTypesPath), 'utf8');
  
  const missingExports = [
    "export const MAJOR_ARCANA_CHAKRAS: Record<string, string> = { 'The Fool': 'crown', 'The Magician': 'throat', 'The High Priestess': 'brow', 'The Empress': 'heart', 'The Emperor': 'solarPlexus', 'The Hierophant': 'throat', 'The Lovers': 'heart', 'The Chariot': 'solarPlexus', 'Strength': 'heart', 'The Hermit': 'brow', 'Wheel of Fortune': 'crown', 'Justice': 'heart', 'The Hanged Man': 'crown', 'Death': 'root', 'Temperance': 'heart', 'The Devil': 'root', 'The Tower': 'solarPlexus', 'The Star': 'brow', 'The Moon': 'brow', 'The Sun': 'solarPlexus', 'Judgement': 'throat', 'The World': 'crown' };",
    "export const SUIT_CHAKRA_MAPPINGS: Record<string, string> = { 'Wands': 'solarPlexus', 'Cups': 'heart', 'Swords': 'throat', 'Pentacles': 'root' };",
    "export const KEY_CARD_CHAKRA_MAPPINGS: Record<string, string> = { 'Ace': 'crown', 'King': 'brow', 'Queen': 'heart', 'Knight': 'solarPlexus', 'Page': 'throat' };",
    "export const CHAKRAS = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'brow', 'crown'] as const;"
  ];
  
  missingExports.forEach(exportStatement => {
    const exportName = exportStatement.match(/export const (\w+)/)?.[1];
    if (exportName && !chakraContent.includes(exportName)) {
      addExportToFile(chakraTypesPath, exportStatement, `${exportName} constant`);
    }
  });
  
} catch (error) {
  console.log(`⚠️ types/chakra.ts not found, creating...`);
  if (!isDryRun) {
    writeFileSync(resolve('src/types/chakra.ts'), `export interface ChakraEnergy {
  name: string;
  level: number;
  balance: number;
}

export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  brow: number;
  crown: number;
}

export const MAJOR_ARCANA_CHAKRAS: Record<string, string> = {
  'The Fool': 'crown',
  'The Magician': 'throat',
  'The High Priestess': 'brow',
  'The Empress': 'heart',
  'The Emperor': 'solarPlexus',
  'The Hierophant': 'throat',
  'The Lovers': 'heart',
  'The Chariot': 'solarPlexus',
  'Strength': 'heart',
  'The Hermit': 'brow',
  'Wheel of Fortune': 'crown',
  'Justice': 'heart',
  'The Hanged Man': 'crown',
  'Death': 'root',
  'Temperance': 'heart',
  'The Devil': 'root',
  'The Tower': 'solarPlexus',
  'The Star': 'brow',
  'The Moon': 'brow',
  'The Sun': 'solarPlexus',
  'Judgement': 'throat',
  'The World': 'crown'
};

export const SUIT_CHAKRA_MAPPINGS: Record<string, string> = {
  'Wands': 'solarPlexus',
  'Cups': 'heart',
  'Swords': 'throat',
  'Pentacles': 'root'
};

export const KEY_CARD_CHAKRA_MAPPINGS: Record<string, string> = {
  'Ace': 'crown',
  'King': 'brow',
  'Queen': 'heart',
  'Knight': 'solarPlexus',
  'Page': 'throat'
};

export const CHAKRAS = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'brow', 'crown'] as const;

export type Chakra = typeof CHAKRAS[number];
`);
    console.log('✅ Created src/types/chakra.ts with all missing chakra exports');
  }
}

// Fix 4: Add getCurrentSeason to types/seasons.ts
try {
  const seasonsTypesPath = 'src/types/seasons.ts';
  const seasonsContent = readFileSync(resolve(seasonsTypesPath), 'utf8');
  
  if (!seasonsContent.includes('getCurrentSeason')) {
    addExportToFile(
      seasonsTypesPath,
      `export function getCurrentSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}`,
      'getCurrentSeason function'
    );
  }
} catch (error) {
  console.log(`⚠️ types/seasons.ts not found, creating...`);
  if (!isDryRun) {
    writeFileSync(resolve('src/types/seasons.ts'), `export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export const SEASON_PROPERTIES = {
  spring: { element: 'Air', energy: 'renewal' },
  summer: { element: 'Fire', energy: 'expansion' },
  autumn: { element: 'Earth', energy: 'harvest' },
  winter: { element: 'Water', energy: 'reflection' }
} as const;
`);
    console.log('✅ Created src/types/seasons.ts with getCurrentSeason');
  }
}

// Summary
console.log('\n📊 Summary:');
if (isDryRun) {
  console.log(`Would make ${changes.length} changes:`);
  changes.forEach(change => {
    console.log(`  - ${change.file}: ${change.change.split('\n')[0]}...`);
  });
  console.log('\nRun without --dry-run to apply changes.');
} else {
  console.log('✅ All critical missing exports have been addressed!');
  console.log('\n🔧 Next steps:');
  console.log('1. Run yarn build to check remaining errors');
  console.log('2. Fix any remaining import/export mismatches');
} 