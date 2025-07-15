#!/usr/bin/env node

/**
 * fix-enum-types.js
 * 
 * This script standardizes ZodiacSign and Season enum-like types across the codebase
 * to ensure consistent capitalization and usage.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set this to true to see what would change without actually changing files
const DRY_RUN = process.argv.includes('--dry-run');

// Configure console colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Custom logger
const log = (message) => console.log(`${YELLOW}[Enum Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Enum Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Enum Fix SUCCESS]${RESET} ${message}`);

// Standard forms
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Map of incorrect capitalization to correct forms
const ZODIAC_CAPITALIZATION_MAP = {
  'ariesAries': 'aries',
  'taurusTaurus': 'taurus',
  'geminiGemini': 'gemini',
  'cancerCancer': 'cancer',
  'leoLeo': 'leo',
  'virgoVirgo': 'virgo',
  'libraLibra': 'libra',
  'scorpioScorpio': 'scorpio',
  'sagittariusSagittarius': 'sagittarius',
  'capricornCapricorn': 'capricorn',
  'aquariusAquarius': 'aquarius',
  'piscesPisces': 'pisces'
};

// Standard forms for seasons
const SEASONS = ['spring', 'summer', 'autumn', 'fall', 'winter'];

// Map of incorrect to correct season forms
const SEASON_CAPITALIZATION_MAP = {
  'Spring': 'spring',
  'Summer': 'summer',
  'Autumn': 'autumn',
  'Fall': 'fall',
  'Winter': 'winter'
};

// Find files with ZodiacSign or Season types
async function findAffectedFiles() {
  try {
    // Use grep to find files with ZodiacSign or Season
    const grepCommand = `grep -r --include="*.ts" --include="*.tsx" "ZodiacSign\\|Season" src`;
    const output = execSync(grepCommand, { encoding: 'utf8' });
    
    // Extract file paths from grep output
    const files = output.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.split(':')[0])
      .filter((value, index, self) => self.indexOf(value) === index); // Unique files
    
    log(`Found ${files.length} files referencing ZodiacSign or Season types`);
    return files;
  } catch (err) {
    error(`Error finding affected files: ${err.message}`);
    return [];
  }
}

// Fix incorrect ZodiacSign usage
async function fixZodiacSignUsage(files) {
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      const filePath = path.resolve(__dirname, '../../', file);
      let content = await fs.readFile(filePath, 'utf8');
      let updated = false;
      
      // Fix object literals with incorrect capitalization
      for (const [incorrect, correct] of Object.entries(ZODIAC_CAPITALIZATION_MAP)) {
        // Look for object literals like { sign: 'ariesAries' } or { zodiacSign: 'ariesAries' }
        const objectLiteralRegex = new RegExp(`(sign|zodiacSign|sunSign|moonSign|risingSign):\\s*['"]${incorrect}['"]`, 'g');
        if (objectLiteralRegex.test(content)) {
          content = content.replace(objectLiteralRegex, (match, prop) => {
            updated = true;
            return `${prop}: '${correct}'`;
          });
          log(`Fixed ${incorrect} to ${correct} in object literals in ${file}`);
        }
        
        // Fix string comparisons like zodiacSign === 'ariesAries'
        const comparisonRegex = new RegExp(`(===|==|!==|!=)\\s*['"]${incorrect}['"]`, 'g');
        if (comparisonRegex.test(content)) {
          content = content.replace(comparisonRegex, (match, operator) => {
            updated = true;
            return `${operator} '${correct}'`;
          });
          log(`Fixed ${incorrect} to ${correct} in comparisons in ${file}`);
        }
        
        // Fix switch cases like case 'ariesAries':
        const switchCaseRegex = new RegExp(`case\\s+['"]${incorrect}['"]`, 'g');
        if (switchCaseRegex.test(content)) {
          content = content.replace(switchCaseRegex, (match) => {
            updated = true;
            return `case '${correct}'`;
          });
          log(`Fixed ${incorrect} to ${correct} in switch cases in ${file}`);
        }
      }
      
      // Fix string unions in type definitions 
      const zodiacUnionTypeRegex = /(export\s+type\s+\w+\s*=\s*)(['"]ariesAries['"](\s*\|)?(\s*['"][A-Z][a-z]+['"](\s*\|)?)*)/g;
      if (zodiacUnionTypeRegex.test(content)) {
        content = content.replace(zodiacUnionTypeRegex, (match, typePrefix, unionTypes) => {
          // Replace each capitalized sign with lowercase
          let newUnionTypes = unionTypes;
          for (const [incorrect, correct] of Object.entries(ZODIAC_CAPITALIZATION_MAP)) {
            const zodiacRegex = new RegExp(`['"]${incorrect}['"]`, 'g');
            newUnionTypes = newUnionTypes.replace(zodiacRegex, `'${correct}'`);
          }
          
          updated = true;
          return `${typePrefix}${newUnionTypes}`;
        });
        log(`Fixed zodiac sign string union in ${file}`);
      }
      
      if (updated) {
        if (!DRY_RUN) {
          await fs.writeFile(filePath, content, 'utf8');
          success(`Updated ${file}`);
          fixedFiles++;
        } else {
          log(`DRY RUN: Would update ${file}`);
          fixedFiles++;
        }
      }
    } catch (err) {
      error(`Error processing ${file}: ${err.message}`);
    }
  }
  
  return fixedFiles;
}

// Fix incorrect Season usage
async function fixSeasonUsage(files) {
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      const filePath = path.resolve(__dirname, '../../', file);
      let content = await fs.readFile(filePath, 'utf8');
      let updated = false;
      
      // Fix object literals with incorrect capitalization
      for (const [incorrect, correct] of Object.entries(SEASON_CAPITALIZATION_MAP)) {
        // Look for object literals like { season: 'Spring' }
        const objectLiteralRegex = new RegExp(`season:\\s*['"]${incorrect}['"]`, 'g');
        if (objectLiteralRegex.test(content)) {
          content = content.replace(objectLiteralRegex, (match) => {
            updated = true;
            return `season: '${correct}'`;
          });
          log(`Fixed ${incorrect} to ${correct} in object literals in ${file}`);
        }
        
        // Fix arrays with incorrect capitalization like ['Spring', 'Summer']
        const arrayRegex = new RegExp(`['"]${incorrect}['"]`, 'g');
        
        // We only want to replace in specific contexts, so we need to be more careful
        // First, check if the file mentions seasons array or season type
        if (content.includes('Season') || content.includes('season:') || content.includes('seasonality')) {
          content = content.replace(arrayRegex, (match) => {
            // Only replace if it's in an array or object context
            const prevChar = content.charAt(content.indexOf(match) - 1);
            const nextChar = content.charAt(content.indexOf(match) + match.length);
            if ([',', '[', '{', ' '].includes(prevChar) || [',', ']', '}', ' '].includes(nextChar)) {
              updated = true;
              return `'${correct}'`;
            }
            return match;
          });
          
          if (updated) {
            log(`Fixed ${incorrect} to ${correct} in arrays in ${file}`);
          }
        }
        
        // Fix string comparisons like season === 'Spring'
        const comparisonRegex = new RegExp(`(===|==|!==|!=)\\s*['"]${incorrect}['"]`, 'g');
        if (comparisonRegex.test(content)) {
          content = content.replace(comparisonRegex, (match, operator) => {
            updated = true;
            return `${operator} '${correct}'`;
          });
          log(`Fixed ${incorrect} to ${correct} in comparisons in ${file}`);
        }
        
        // Fix switch cases like case 'Spring':
        const switchCaseRegex = new RegExp(`case\\s+['"]${incorrect}['"]`, 'g');
        if (switchCaseRegex.test(content)) {
          content = content.replace(switchCaseRegex, (match) => {
            updated = true;
            return `case '${correct}'`;
          });
          log(`Fixed ${incorrect} to ${correct} in switch cases in ${file}`);
        }
      }
      
      // Fix string unions in type definitions
      const seasonUnionTypeRegex = /(export\s+type\s+\w+\s*=\s*)(['"]Spring['"](\s*\|)?(\s*['"][A-Z][a-z]+['"](\s*\|)?)*)/g;
      if (seasonUnionTypeRegex.test(content)) {
        content = content.replace(seasonUnionTypeRegex, (match, typePrefix, unionTypes) => {
          // Replace each capitalized season with lowercase
          let newUnionTypes = unionTypes;
          for (const [incorrect, correct] of Object.entries(SEASON_CAPITALIZATION_MAP)) {
            const seasonRegex = new RegExp(`['"]${incorrect}['"]`, 'g');
            newUnionTypes = newUnionTypes.replace(seasonRegex, `'${correct}'`);
          }
          
          updated = true;
          return `${typePrefix}${newUnionTypes}`;
        });
        log(`Fixed season string union in ${file}`);
      }
      
      if (updated) {
        if (!DRY_RUN) {
          await fs.writeFile(filePath, content, 'utf8');
          success(`Updated ${file}`);
          fixedFiles++;
        } else {
          log(`DRY RUN: Would update ${file}`);
          fixedFiles++;
        }
      }
    } catch (err) {
      error(`Error processing ${file}: ${err.message}`);
    }
  }
  
  return fixedFiles;
}

// Ensure consistent ZodiacSign definition in types files
async function standardizeZodiacSignType() {
  try {
    const zodiacTypePath = path.resolve(__dirname, '../../src/types/zodiac.ts');
    const alchemyTypePath = path.resolve(__dirname, '../../src/types/alchemy.ts');
    
    // Check if the zodiac.ts file exists
    let zodiacContent;
    try {
      zodiacContent = await fs.readFile(zodiacTypePath, 'utf8');
    } catch (err) {
      // Create zodiac.ts if it doesn't exist
      zodiacContent = `/**
 * Standardized Zodiac Sign Types
 */

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio' 
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export const zodiacSigns: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export const zodiacElementMap: Record<ZodiacSign, string> = {
  'aries': 'Fire',
  'taurus': 'Earth',
  'gemini': 'Air',
  'cancer': 'Water',
  'leo': 'Fire',
  'virgo': 'Earth',
  'libra': 'Air',
  'scorpio': 'Water',
  'sagittarius': 'Fire',
  'capricorn': 'Earth',
  'aquarius': 'Air',
  'pisces': 'Water'
};

export const zodiacModalityMap: Record<ZodiacSign, string> = {
  'aries': 'Cardinal',
  'taurus': 'Fixed',
  'gemini': 'Mutable',
  'cancer': 'Cardinal',
  'leo': 'Fixed',
  'virgo': 'Mutable',
  'libra': 'Cardinal',
  'scorpio': 'Fixed',
  'sagittarius': 'Mutable',
  'capricorn': 'Cardinal',
  'aquarius': 'Fixed',
  'pisces': 'Mutable'
};
`;
      
      if (!DRY_RUN) {
        await fs.writeFile(zodiacTypePath, zodiacContent, 'utf8');
        success(`Created ${zodiacTypePath} with standardized ZodiacSign type`);
      } else {
        log(`DRY RUN: Would create ${zodiacTypePath}`);
      }
    }
    
    // Update ZodiacSign type in alchemy.ts to import from zodiac.ts
    const alchemyContent = await fs.readFile(alchemyTypePath, 'utf8');
    
    // Check if ZodiacSign is defined in alchemy.ts
    const zodiacSignDefRegex = /export\s+type\s+ZodiacSign\s*=[\s\S]*?;/;
    const zodiacSignMatch = alchemyContent.match(zodiacSignDefRegex);
    
    if (zodiacSignMatch) {
      // Add import and remove definition
      const newAlchemyContent = alchemyContent
        .replace(zodiacSignMatch[0], '// ZodiacSign type imported from @/types/zodiac')
        .replace(/^(import[^;]*;\n)*/, (imports) => {
          if (!imports.includes('@/types/zodiac')) {
            return imports + `import type { ZodiacSign } from '@/types/zodiac';\n`;
          }
          return imports;
        });
      
      if (!DRY_RUN) {
        await fs.writeFile(alchemyTypePath, newAlchemyContent, 'utf8');
        success(`Updated ${alchemyTypePath} to import ZodiacSign from zodiac.ts`);
      } else {
        log(`DRY RUN: Would update ${alchemyTypePath}`);
      }
    }
    
    return true;
  } catch (err) {
    error(`Error standardizing ZodiacSign type: ${err.message}`);
    return false;
  }
}

// Ensure consistent Season type definition
async function standardizeSeasonType() {
  try {
    const alchemyTypePath = path.resolve(__dirname, '../../src/types/alchemy.ts');
    const seasonTypePath = path.resolve(__dirname, '../../src/types/seasons.ts');
    
    // Check if the seasons.ts file exists
    let seasonContent;
    try {
      seasonContent = await fs.readFile(seasonTypePath, 'utf8');
    } catch (err) {
      // Create seasons.ts if it doesn't exist
      seasonContent = `/**
 * Standardized Season Types
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';

export const seasons: Season[] = ['spring', 'summer', 'autumn', 'fall', 'winter'];

export const seasonElementMap: Record<Exclude<Season, 'all'>, string> = {
  'spring': 'Air',
  'summer': 'Fire',
  'autumn': 'Earth',
  'fall': 'Earth',
  'winter': 'Water'
};

export const seasonMonthMap: Record<number, Season> = {
  0: 'winter',  // January
  1: 'winter',  // February
  2: 'spring',  // March
  3: 'spring',  // April
  4: 'spring',  // May
  5: 'summer',  // June
  6: 'summer',  // July
  7: 'summer',  // August
  8: 'autumn',  // September
  9: 'autumn',  // October
  10: 'autumn', // November
  11: 'winter'  // December
};
`;
      
      if (!DRY_RUN) {
        await fs.writeFile(seasonTypePath, seasonContent, 'utf8');
        success(`Created ${seasonTypePath} with standardized Season type`);
      } else {
        log(`DRY RUN: Would create ${seasonTypePath}`);
      }
    }
    
    // Update Season type in alchemy.ts to import from seasons.ts
    const alchemyContent = await fs.readFile(alchemyTypePath, 'utf8');
    
    // Check if Season is defined in alchemy.ts
    const seasonDefRegex = /export\s+type\s+Season\s*=[\s\S]*?;/;
    const seasonMatch = alchemyContent.match(seasonDefRegex);
    
    if (seasonMatch) {
      // Add import and remove definition
      const newAlchemyContent = alchemyContent
        .replace(seasonMatch[0], '// Season type imported from @/types/seasons')
        .replace(/^(import[^;]*;\n)*/, (imports) => {
          if (!imports.includes('@/types/seasons')) {
            return imports + `import type { Season } from '@/types/seasons';\n`;
          }
          return imports;
        });
      
      if (!DRY_RUN) {
        await fs.writeFile(alchemyTypePath, newAlchemyContent, 'utf8');
        success(`Updated ${alchemyTypePath} to import Season from seasons.ts`);
      } else {
        log(`DRY RUN: Would update ${alchemyTypePath}`);
      }
    }
    
    return true;
  } catch (err) {
    error(`Error standardizing Season type: ${err.message}`);
    return false;
  }
}

async function main() {
  log(`Starting enum types fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  // Step 1: Standardize type definitions
  const zodiacStandardized = await standardizeZodiacSignType();
  const seasonStandardized = await standardizeSeasonType();
  
  // Step 2: Find and fix affected files
  const files = await findAffectedFiles();
  
  // Step 3: Fix incorrect usages
  const zodiacFixedCount = await fixZodiacSignUsage(files);
  const seasonFixedCount = await fixSeasonUsage(files);
  
  success(`Enum types fix completed: ${zodiacStandardized ? 'standardized ZodiacSign, ' : ''}${seasonStandardized ? 'standardized Season, ' : ''}fixed ${zodiacFixedCount + seasonFixedCount} files`);
}

main(); 