#!/usr/bin/env node

/**
 * Create missing chakraMappings.ts file
 * 
 * This script creates the missing chakraMappings.ts file in the constants directory,
 * which is referenced by multiple files but doesn't exist. It uses the types defined
 * in the chakra.ts file to ensure consistency.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Path to the chakraMappings.ts file
const chakraMappingsFilePath = path.join(rootDir, 'src', 'constants', 'chakraMappings.ts');

// Check if the file already exists
if (fs.existsSync(chakraMappingsFilePath)) {
  console.log('chakraMappings.ts already exists. Checking if it needs to be updated...');
  
  // Read the file to check if it has the required exports
  const fileContent = fs.readFileSync(chakraMappingsFilePath, 'utf8');
  
  // Check if all required exports are present
  const requiredExports = [
    'Chakra', 
    'CHAKRA_MAPPINGS', 
    'CHAKRA_BALANCING_FOODS', 
    'calculateChakraEnergies'
  ];
  
  const missingExports = requiredExports.filter(exp => !fileContent.includes(`export const ${exp}`));
  
  if (missingExports.length === 0) {
    console.log('All required exports are present in chakraMappings.ts. No changes needed.');
    process.exit(0);
  }
  
  console.log(`Missing exports: ${missingExports.join(', ')}. Updating file...`);
}

// Create the chakraMappings.ts file content
const chakraMappingsContent = `// src/constants/chakraMappings.ts
import { 
  ChakraPosition, 
  ChakraEnergies, 
  ZodiacSign, 
  ChakraBalancingFoods 
} from '@/types/chakra';

// Define chakra enum
export enum Chakra {
  ROOT = 'root',
  SACRAL = 'sacral',
  SOLAR_PLEXUS = 'solarPlexus',
  HEART = 'heart',
  THROAT = 'throat',
  THIRD_EYE = 'brow',
  CROWN = 'crown'
}

// Zodiac sign to chakra mappings
export const CHAKRA_MAPPINGS: Record<ZodiacSign, ChakraPosition[]> = {
  'aries': ['root', 'solarPlexus'],
  'taurus': ['root', 'sacral'],
  'gemini': ['throat', 'brow'],
  'cancer': ['heart', 'sacral'],
  'leo': ['heart', 'solarPlexus'],
  'virgo': ['solarPlexus', 'throat'],
  'libra': ['heart', 'throat'],
  'scorpio': ['root', 'sacral'],
  'sagittarius': ['solarPlexus', 'brow'],
  'capricorn': ['root', 'throat'],
  'aquarius': ['throat', 'crown'],
  'pisces': ['sacral', 'crown']
};

// Foods that balance each chakra
export const CHAKRA_BALANCING_FOODS: ChakraBalancingFoods = {
  root: [
    'root vegetables', 'potatoes', 'carrots', 'beets', 'onions', 
    'garlic', 'protein-rich foods', 'red foods', 'meat'
  ],
  sacral: [
    'sweet fruits', 'honey', 'nuts', 'seeds', 'orange foods', 
    'warming spices', 'cinnamon', 'vanilla', 'sweet potatoes'
  ],
  solarPlexus: [
    'grains', 'yellow foods', 'corn', 'yellow peppers', 'bananas',
    'ginger', 'turmeric', 'chamomile', 'lemon', 'pineapple'
  ],
  heart: [
    'green foods', 'leafy greens', 'broccoli', 'kale', 'spinach',
    'green tea', 'avocado', 'green apples', 'green grapes', 'lime'
  ],
  throat: [
    'blue foods', 'blueberries', 'plums', 'eggplant', 'purple grapes',
    'herbal teas', 'fruit juices', 'coconut water', 'sea vegetables'
  ],
  brow: [
    'purple foods', 'blackberries', 'purple grapes', 'eggplant',
    'purple cabbage', 'cocoa', 'grape juice', 'wine', 'purple kale'
  ],
  crown: [
    'fasting', 'pure water', 'detoxifying foods', 'violet foods',
    'lavender tea', 'pure foods', 'clean diet', 'white foods'
  ]
};

/**
 * Calculate chakra energy levels based on planetary positions
 * @param planetaryPositions Current planetary positions
 * @returns Record of chakra energy levels
 */
export function calculateChakraEnergies(
  planetaryPositions: Record<string, { sign: string }>
): ChakraEnergies {
  // Initialize chakra energies with baseline values
  const chakraEnergies: ChakraEnergies = {
    root: 0.5,
    sacral: 0.5,
    solarPlexus: 0.5,
    heart: 0.5,
    throat: 0.5,
    brow: 0.5,
    crown: 0.5
  };
  
  // Planet to chakra mappings
  const planetToChakra: Record<string, ChakraPosition> = {
    'Sunsun': 'crown',
    'Moonmoon': 'brow',
    'Mercurymercury': 'throat',
    'Venusvenus': 'heart',
    'Marsmars': 'solarPlexus',
    'Jupiterjupiter': 'sacral',
    'Saturnsaturn': 'root',
    'Uranusuranus': 'brow',
    'Neptuneneptune': 'crown',
    'Plutopluto': 'root'
  };
  
  // Increment chakra energies based on planetary positions
  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    if (!position?.sign) return;
    
    // Add influence from planet's direct chakra connection
    const planetChakra = planetToChakra[planet.toLowerCase()];
    if (planetChakra) {
      chakraEnergies[planetChakra] += 0.1;
    }
    
    // Add influence from zodiac sign
    const sign = position.sign.toLowerCase();
    const signChakras = CHAKRA_MAPPINGS[sign as ZodiacSign];
    
    if (signChakras) {
      signChakras.forEach(chakra => {
        chakraEnergies[chakra] += 0.1;
      });
    }
  });
  
  // Normalize values to be between 0 and 1
  Object.keys(chakraEnergies).forEach(chakra => {
    const key = chakra as ChakraPosition;
    chakraEnergies[key] = Math.min(1, Math.max(0, chakraEnergies[key]));
  });
  
  return chakraEnergies;
}
`;

// Write the file
try {
  fs.writeFileSync(chakraMappingsFilePath, chakraMappingsContent, 'utf8');
  console.log(`Successfully created/updated ${chakraMappingsFilePath}`);
} catch (error) {
  console.error(`Error creating chakraMappings.ts: ${error.message}`);
  process.exit(1);
} 