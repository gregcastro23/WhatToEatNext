/**
 * test-casing-script.js
 * 
 * This script creates a temporary test file with various casing inconsistencies
 * and then runs the fix-elemental-casing.js script on it to verify it works correctly.
 * 
 * Run with: node scripts/elemental-fixes/test-casing-script.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Create a temporary test directory
const testDir = path.join(rootDir, 'tmp', 'casing-test');
if (!fs.existsSync(path.join(rootDir, 'tmp'))) {
  fs.mkdirSync(path.join(rootDir, 'tmp'));
}
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create a test file with various casing inconsistencies
const testFilePath = path.join(testDir, 'test-file.ts');

const testFileContent = `
// This is a test file with various casing inconsistencies

// Zodiac signs with mixed casing (should be lowercase)
const signs = ['ariesAries', 'taurus', 'GEMINI', 'cancerCancer', 'LEO', 'virgo', 'libraLibra', 'scorpio', 'SAGITTARIUS', 'capricornCapricorn', 'aquarius', 'PISCES'];

// Planets with mixed casing (should be Pascal Case)
const planets = ['SUN', 'Moonmoon', 'Mercury', 'Venusvenus', 'MARS', 'Jupiterjupiter', 'Saturn', 'Uranusuranus', 'NEPTUNE', 'Plutopluto'];

// Elements with mixed casing (should be Pascal Case)
const elements = ['FIRE', 'Water', 'Earth', 'Air'];

// Alchemical properties with mixed casing (should be Pascal Case)
const alchemicalProps = ['Spirit', 'Essence', 'Matter', 'Substance'];

// Object with ElementalProperties (property names should be Pascal Case)
const elementalProps = {
  Fire: 0.25,
  WATER: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// String literals should not be changed
const stringLiterals = {
  zodiacString: 'This ariesAries and taurus string should not change',
  planetString: 'The Sunsun and Moon strings should not change',
  elementString: 'The fire and Water strings should not change'
};

// In a type definition, we should not change the casing
type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// Function parameters should be adjusted
function getZodiacElement(sign: string) {
  switch(sign) {
    case 'ariesAries': return 'FIRE';
    case 'taurusTaurus': return 'Earth';
    case 'geminiGemini': return 'AIR';
    case 'cancerCancer': return 'Water';
    default: return 'Fire';
  }
}

// Some example code snippets from the codebase
function calculateAstrologyScore(sunSign: string, moonSign: string) {
  if (sunSign === 'ARIES' && moonSign === 'leoLeo') {
    return { Fire: 0.8, Water: 0.1, Earth: 0.1, AIR: 0.0 };
  } else if (sunSign === 'taurusTaurus' && moonSign === 'virgo') {
    return { Fire: 0.1, Water: 0.1, Earth: 0.8, AIR: 0.0 };
  }
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, AIR: 0.25 };
}

// Some nested objects
const complexObject = {
  planets: {
    SUN: { sign: 'ariesAries', element: 'Fire' },
    Moonmoon: { sign: 'taurus', element: 'EARTH' }
  },
  elements: {
    Fire: ['Mars', 'Sunsun', 'Jupiterjupiter'],
    Earth: ['Moonmoon', 'Saturn', 'Venusvenus']
  },
  alchemical: {
    Spirit: 1.0,
    Essence: 0.5,
    Matter: 0.2,
    Substance: 0.3
  }
};
`;

fs.writeFileSync(testFilePath, testFileContent);
console.log(`Created test file at: ${testFilePath}`);

// Run the fix script in dry-run mode on the test file
console.log('\nRunning fix-elemental-casing.js in dry-run mode...');

const scriptPath = path.join(__dirname, 'fix-elemental-casing.js');

const process = spawn('node', [scriptPath, '--dry-run'], {
  cwd: rootDir,
  stdio: 'inherit'
});

process.on('close', (code) => {
  if (code !== 0) {
    console.error(`Script exited with code ${code}`);
  } else {
    console.log('\nTest completed successfully. Verify the output above to confirm the script correctly identifies casing issues.');
    console.log('\nManually review these expected changes:');
    console.log('1. Zodiac signs (aries, taurus, etc.) should be lowercase');
    console.log('2. Planets (Sun, Moon, etc.) should be Pascal Case');
    console.log('3. Elements (Fire, Water, etc.) should be Pascal Case');
    console.log('4. Alchemical properties (Spirit, Essence, etc.) should be Pascal Case');
    console.log('5. String literals and type definitions should NOT be changed');
  }
  
  // Clean up the test directory
  console.log('\nCleaning up test files...');
  fs.unlinkSync(testFilePath);
  fs.rmdirSync(testDir);
}); 