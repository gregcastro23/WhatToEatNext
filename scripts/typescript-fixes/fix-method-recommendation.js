#!/usr/bin/env node

/**
 * fix-method-recommendation.js
 * 
 * This script fixes the missing energy property in methodRecommendation.ts
 * and other issues with method recommendation types
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
const log = (message) => console.log(`${YELLOW}[Method Recommendation Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Method Recommendation Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Method Recommendation Fix SUCCESS]${RESET} ${message}`);

async function fixMethodRecommendation() {
  try {
    const filePath = path.resolve(__dirname, '../../src/utils/recommendation/methodRecommendation.ts');
    let content = await fs.readFile(filePath, 'utf8');
    
    // 1. Fix import from culturalMethodsAggregator
    content = content.replace(
      /_getCulturalVariations/g, 
      'getCulturalVariations'
    );
    
    // 2. Fix imports from @/types/alchemy
    content = content.replace(
      /import {[\s\S]*?} from ['"]@\/types\/alchemy['"];/,
      `import {
  CookingMethod,
  CookingMethodData,
  CookingMethodModifier,
  Element,
  ElementalProperties,
  Season,
  ZodiacSign,
  BasicThermodynamicProperties,
  AstrologicalState
} from '@/types/alchemy';`
    );
    
    // 3. Add MethodRecommendation and MethodRecommendationOptions interfaces
    const interfacePosition = content.indexOf('interface CulturalCookingMethod');
    if (interfacePosition !== -1) {
      const interfaceSection = `
// Method recommendation interfaces
export interface MethodRecommendationOptions {
  elementalFocus?: Element;
  season?: Season;
  timeOfDay?: string;
  astrologicalState?: AstrologicalState;
  ingredients?: any[];
  maxRecommendations?: number;
}

export interface MethodRecommendation {
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  matchScore: number;
  suitableFor: string[];
  astrologicalMatch?: number;
  seasonalMatch?: number;
  timeMatch?: number;
  ingredientMatch?: number;
  benefitsDescription?: string;
}

`;
      content = content.slice(0, interfacePosition) + interfaceSection + content.slice(interfacePosition);
    }
    
    // 4. Fix the missing energy property in thermodynamic return objects
    content = content.replace(
      /return {\s*heat: .*?,\s*entropy: .*?,\s*reactivity: .*?\s*}/g,
      (match) => match.replace('}', ', energy: 0.5 }')
    );
    
    if (!DRY_RUN) {
      await fs.writeFile(filePath, content, 'utf8');
      success(`Updated method recommendation file at ${filePath}`);
    } else {
      log(`DRY RUN: Would update method recommendation file at ${filePath}`);
    }
    
    return true;
  } catch (err) {
    error(`Error updating method recommendation file: ${err.message}`);
    return false;
  }
}

async function main() {
  log(`Starting method recommendation fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  const fileFixed = await fixMethodRecommendation();
  
  if (fileFixed) {
    success('Method recommendation fix completed');
  } else {
    log('No changes were needed or errors occurred');
  }
}

main(); 