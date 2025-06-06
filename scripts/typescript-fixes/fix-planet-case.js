#!/usr/bin/env node

/**
 * fix-planet-case.js
 * 
 * This script fixes the case mismatch in PlanetaryHarmony keys and other planet-related constants
 * by ensuring all instances use the proper capitalized PlanetName keys (Sun, Moonmoon, etc.)
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
const log = (message) => console.log(`${YELLOW}[Planet Case Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Planet Case Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Planet Case Fix SUCCESS]${RESET} ${message}`);

// Mapping of lowercase to correct capitalized planet names
const PLANET_CASE_MAP = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moonmoon',
  'Mercurymercury': 'Mercurymercury',
  'Venusvenus': 'Venusvenus',
  'Marsmars': 'Marsmars',
  'Jupiterjupiter': 'Jupiterjupiter',
  'Saturnsaturn': 'Saturnsaturn',
  'Uranusuranus': 'Uranusuranus',
  'Neptuneneptune': 'Neptuneneptune',
  'Plutopluto': 'Plutopluto'
};

async function fixPlanetaryHarmony() {
  try {
    const alchemyTypesPath = path.resolve(__dirname, '../../src/types/alchemy.ts');
    let content = await fs.readFile(alchemyTypesPath, 'utf8');
    
    // Find the PLANETARY_HARMONY_MATRIX declaration
    const harmonyMatrixRegex = /export const PLANETARY_HARMONY_MATRIX: PlanetaryHarmony = \{[\s\S]*?\};/;
    const harmonyMatrixMatch = content.match(harmonyMatrixRegex);
    
    if (harmonyMatrixMatch) {
      let harmonyMatrix = harmonyMatrixMatch[0];
      let updated = false;
      
      // Replace lowercase planet names with capitalized ones
      for (const [lowercase, capitalized] of Object.entries(PLANET_CASE_MAP)) {
        // First, fix property names
        const propNameRegex = new RegExp(`\\b${lowercase}\\s*:`, 'g');
        if (propNameRegex.test(harmonyMatrix)) {
          harmonyMatrix = harmonyMatrix.replace(propNameRegex, `${capitalized}: `);
          updated = true;
        }
        
        // Then, fix property values within objects
        const propValueRegex = new RegExp(`\\b${lowercase}\\s*:`, 'g');
        if (propValueRegex.test(harmonyMatrix)) {
          harmonyMatrix = harmonyMatrix.replace(propValueRegex, `${capitalized}: `);
          updated = true;
        }
      }
      
      if (updated) {
        content = content.replace(harmonyMatrixRegex, harmonyMatrix);
        log('Updated PLANETARY_HARMONY_MATRIX with correct case');
      }
    } else {
      log('PLANETARY_HARMONY_MATRIX not found');
    }
    
    // Fix PLANET_ELEMENT_MAPPING
    const planetElementRegex = /export const PLANET_ELEMENT_MAPPING: Record<PlanetName, Element> = \{[\s\S]*?\};/;
    const planetElementMatch = content.match(planetElementRegex);
    
    if (planetElementMatch) {
      let planetElement = planetElementMatch[0];
      let updated = false;
      
      for (const [lowercase, capitalized] of Object.entries(PLANET_CASE_MAP)) {
        const propNameRegex = new RegExp(`\\b${lowercase}\\s*:`, 'g');
        if (propNameRegex.test(planetElement)) {
          planetElement = planetElement.replace(propNameRegex, `${capitalized}: `);
          updated = true;
        }
      }
      
      if (updated) {
        content = content.replace(planetElementRegex, planetElement);
        log('Updated PLANET_ELEMENT_MAPPING with correct case');
      }
    } else {
      log('PLANET_ELEMENT_MAPPING not found');
    }
    
    // Fix PlanetaryHarmony interface
    const planetaryHarmonyRegex = /export interface PlanetaryHarmony \{[\s\S]*?\}/;
    const planetaryHarmonyMatch = content.match(planetaryHarmonyRegex);
    
    if (planetaryHarmonyMatch) {
      let planetaryHarmony = planetaryHarmonyMatch[0];
      let updated = false;
      
      for (const [lowercase, capitalized] of Object.entries(PLANET_CASE_MAP)) {
        const propNameRegex = new RegExp(`\\b${lowercase}\\s*:`, 'g');
        if (propNameRegex.test(planetaryHarmony)) {
          planetaryHarmony = planetaryHarmony.replace(propNameRegex, `${capitalized}: `);
          updated = true;
        }
      }
      
      if (updated) {
        content = content.replace(planetaryHarmonyRegex, planetaryHarmony);
        log('Updated PlanetaryHarmony interface with correct case');
      }
    } else {
      log('PlanetaryHarmony interface not found');
    }
    
    // Save the updated file
    if (!DRY_RUN) {
      await fs.writeFile(alchemyTypesPath, content, 'utf8');
      success(`Updated planet case in ${alchemyTypesPath}`);
    } else {
      log(`DRY RUN: Would update planet case in ${alchemyTypesPath}`);
    }
    
    return true;
  } catch (err) {
    error(`Error updating planet case: ${err.message}`);
    return false;
  }
}

async function main() {
  log(`Starting planet case fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  const planetaryHarmonyFixed = await fixPlanetaryHarmony();
  
  if (planetaryHarmonyFixed) {
    success('Planet case fix completed');
  } else {
    log('No changes were needed');
  }
}

main(); 