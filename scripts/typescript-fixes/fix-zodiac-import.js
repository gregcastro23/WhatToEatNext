#!/usr/bin/env node

/**
 * fix-zodiac-import.js
 * 
 * This script fixes the ZodiacSign import in zodiacSeasons.ts
 * by updating it to import from @/types/zodiac instead of @/types/alchemy
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
const log = (message) => console.log(`${YELLOW}[Zodiac Import Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Zodiac Import Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Zodiac Import Fix SUCCESS]${RESET} ${message}`);

async function fixZodiacImport() {
  try {
    const zodiacSeasonsPath = path.resolve(__dirname, '../../src/data/zodiacSeasons.ts');
    let content = await fs.readFile(zodiacSeasonsPath, 'utf8');
    
    // Replace the import statement to use @/types/zodiac instead of @/types/alchemy
    const oldImport = "import { ZodiacSign, Element } from '@/types/alchemy';";
    const newImport = "import { ZodiacSign } from '@/types/zodiac';\nimport { Element } from '@/types/alchemy';";
    
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      
      if (!DRY_RUN) {
        await fs.writeFile(zodiacSeasonsPath, content, 'utf8');
        success(`Updated ZodiacSign import in ${zodiacSeasonsPath}`);
      } else {
        log(`DRY RUN: Would update ZodiacSign import in ${zodiacSeasonsPath}`);
      }
      return true;
    } else {
      log('Import statement not found or already updated');
      return false;
    }
  } catch (err) {
    error(`Error updating ZodiacSign import: ${err.message}`);
    return false;
  }
}

async function main() {
  log(`Starting zodiac import fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  const importFixed = await fixZodiacImport();
  
  if (importFixed) {
    success('Zodiac import fix completed');
  } else {
    log('No changes were needed');
  }
}

main(); 