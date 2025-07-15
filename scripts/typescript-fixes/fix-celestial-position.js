#!/usr/bin/env node

/**
 * fix-celestial-position.js
 * 
 * This script updates the CelestialPosition interface to include the exactLongitude property
 * that's being used in various places across the codebase
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
const log = (message) => console.log(`${YELLOW}[Celestial Position Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Celestial Position Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Celestial Position Fix SUCCESS]${RESET} ${message}`);

async function fixCelestialPositionInterface() {
  try {
    const celestialTypesPath = path.resolve(__dirname, '../../src/types/celestial.ts');
    const alchemyTypesPath = path.resolve(__dirname, '../../src/types/alchemy.ts');
    
    // First check if celestial.ts exists, if not we'll need to modify alchemy.ts
    let targetFile = celestialTypesPath;
    let content;
    
    try {
      content = await fs.readFile(celestialTypesPath, 'utf8');
    } catch (err) {
      // If celestial.ts doesn't exist, use alchemy.ts
      log('celestial.ts not found, using alchemy.ts');
      targetFile = alchemyTypesPath;
      content = await fs.readFile(alchemyTypesPath, 'utf8');
    }
    
    // Find the CelestialPosition interface
    const celestialPositionRegex = /export\s+interface\s+CelestialPosition\s+\{[^}]*\}/gs;
    const match = content.match(celestialPositionRegex);
    
    if (!match) {
      error(`Could not find CelestialPosition interface in ${targetFile}`);
      return false;
    }
    
    // Check if the interface already has exactLongitude property
    if (match[0].includes('exactLongitude')) {
      log('exactLongitude property already exists in CelestialPosition interface');
      return false;
    }
    
    // Add the exactLongitude property to the interface
    const updatedInterface = match[0].replace(
      /\}/,
      '  exactLongitude?: number;\n}'
    );
    
    // Replace the old interface with the updated one
    const updatedContent = content.replace(match[0], updatedInterface);
    
    if (!DRY_RUN) {
      await fs.writeFile(targetFile, updatedContent, 'utf8');
      success(`Updated CelestialPosition interface in ${targetFile}`);
    } else {
      log(`DRY RUN: Would update CelestialPosition interface in ${targetFile}`);
    }
    
    return true;
  } catch (err) {
    error(`Error updating CelestialPosition interface: ${err.message}`);
    return false;
  }
}

async function main() {
  log(`Starting celestial position fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  const interfaceFixed = await fixCelestialPositionInterface();
  
  if (interfaceFixed) {
    success('Celestial position fix completed');
  } else {
    log('No changes were needed');
  }
}

main(); 