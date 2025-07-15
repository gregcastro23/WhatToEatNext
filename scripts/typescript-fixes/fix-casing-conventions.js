/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|water|15453Earth/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|22530Earth/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |29601Earth/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|water|44407Earth/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|51484Earth/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |58555Earth/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(fire|7711Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |14788Water/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(3845Fire/**
 * Script to standardize casing conventions for planets, zodiac signs, and elements
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../src');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
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

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Patterns to match in type definitions
const planetTypePattern = /export\s+type\s+Planet\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const zodiacTypePattern = /export\s+type\s+ZodiacSign\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;
const elementTypePattern = /export\s+type\s+Element\s*=\s*(['"].*?['"](\s*\|\s*['"].*?['"])*)/g;

// Patterns for object property access
const planetObjPattern = /(["'])([a-z]+)\1\s*:\s*CelestialPosition/g;
const elementObjPattern = /(["'])([a-z]+)\1\s*:\s*number/g;

// Helper function to standardize planet casing in type definitions
function standardizePlanetType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const planetName = t.replace(/['"]/g, '');
    return planetName.toLowerCase() in planetMap ? 
      t.replace(planetName, planetMap[planetName.toLowerCase()]) : t;
  });
  return `export type Planet = ${typeValues.join(' | ')}`;
}

// Helper function to standardize zodiac sign casing in type definitions
function standardizeZodiacType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const signName = t.replace(/['"]/g, '');
    return signName.charAt(0).toUpperCase() + signName.slice(1) in zodiacMap ? 
      t.replace(signName, zodiacMap[signName.charAt(0).toUpperCase() + signName.slice(1)]) : t;
  });
  return `export type ZodiacSign = ${typeValues.join(' | ')}`;
}

// Helper function to standardize element casing in type definitions
function standardizeElementType(match, types) {
  const typeValues = types.split('|').map(t => {
    t = t.trim();
    const elementName = t.replace(/['"]/g, '');
    return elementName.toLowerCase() in elementMap ? 
      t.replace(elementName, elementMap[elementName.toLowerCase()]) : t;
  });
  return `export type Element = ${typeValues.join(' | ')}`;
}

// Function to standardize casing in interface properties
function standardizeInterfaceProperties(content) {
  // Standardize ElementalProperties interface
  let updatedContent = content.replace(
    /export\s+interface\s+ElementalProperties\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Fire|Water|Earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |water|earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |earth|Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; |Air)(\s*):(\s*)/gi,
        (_, space1, element, space2, colon) => 
          `${space1}${elementMap[element.toLowerCase()]}${space2}:${colon}`
      );
      return `export interface ElementalProperties {${standardizedProps}}`;
    }
  );

  // Standardize PlanetaryAlignment interface
  updatedContent = updatedContent.replace(
    /export\s+interface\s+PlanetaryAlignment\s*{([^}]*)}/g,
    (match, props) => {
      const standardizedProps = props.replace(
        /(\s*)(Sunsun|Moonmoon|Mercurymercury|Venusvenus|Marsmars|Jupiterjupiter|Saturnsaturn|Uranusuranus|Neptuneneptune|Plutopluto|northnode|southnode|chiron|ascendant)(\s*)\??\s*:(\s*)/gi,
        (_, space1, planet, space2, colon) => 
          `${space1}${planetMap[planet.toLowerCase()]}${space2}?:${colon}`
      );
      return `export interface PlanetaryAlignment {${standardizedProps}}`;
    }
  );

  return updatedContent;
}

// Helper function to standardize casing in object literals
function standardizeObjectLiterals(content) {
  // Standardize elemental properties in object literals
  let updatedContent = content.replace(
    /{\s*fire\s*:\s*([^,}]+)(?:,\s*water\s*:\s*([^,}]+))?(?:,\s*earth\s*:\s*([^,}]+))?(?:,\s*Air\s*:\s*([^,}]+))?/gi,
    (match, fireVal, waterVal, earthVal, AirVal) => {
      return `{ Fire: ${fireVal}${waterVal ? `, Water: ${waterVal}` : ''}${earthVal ? `, Earth: ${earthVal}` : ''}${AirVal ? `, Air: ${AirVal}` : ''}`;
    }
  );

  // Standardize planet properties in object literals
  for (const [planet, standardized] of Object.entries(planetMap)) {
    const planetRegex = new RegExp(`([{,]\\s*)${planet}(\\s*:)`, 'gi');
    updatedContent = updatedContent.replace(planetRegex, `$1${standardized}$2`);
  }

  // Standardize zodiac sign properties in object literals
  for (const [sign, standardized] of Object.entries(zodiacMap)) {
    // Only replace zodiac signs in object keys or specific contexts
    const signRegex = new RegExp(`([{,]\\s*)${sign}(\\s*:)`, 'g');
    updatedContent = updatedContent.replace(signRegex, `$1${standardized}$2`);
    
    // Also replace zodiac signs in string literals but carefully
    const signStringRegex = new RegExp(`(['"])${sign}\\1`, 'g');
    updatedContent = updatedContent.replace(signStringRegex, `$1${standardized}$1`);
  }

  return updatedContent;
}

// Main function to process a single file
async function processFile(filePath) {
  try {
    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return false;

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;

    // Skip binary files or empty files
    if (!content || content.includes('\u0000')) return false;

    // Standardize type definitions
    updatedContent = updatedContent
      .replace(planetTypePattern, standardizePlanetType)
      .replace(zodiacTypePattern, standardizeZodiacType)
      .replace(elementTypePattern, standardizeElementType);

    // Standardize interface properties
    updatedContent = standardizeInterfaceProperties(updatedContent);

    // Standardize object literals
    updatedContent = standardizeObjectLiterals(updatedContent);

    // Fix imports/exports that reference the types
    updatedContent = updatedContent.replace(
      /(import|export)(\s+type)?\s+{([^}]*)}/g,
      (match, statement, typeKeyword, imports) => {
        // Standardize planet names in imports/exports
        for (const [key, value] of Object.entries(planetMap)) {
          const planetRegex = new RegExp(`\\b${key}\\b`, 'g');
          imports = imports.replace(planetRegex, value);
        }
        
        // Don't touch zodiac signs in imports/exports since they should be lowercase
        
        // Standardize element names in imports/exports
        for (const [key, value] of Object.entries(elementMap)) {
          const elementRegex = new RegExp(`\\b${key}\\b`, 'i');
          imports = imports.replace(elementRegex, value);
        }
        
        return `${statement}${typeKeyword || ''} {${imports}}`;
      }
    );

    // Only write if changes were made
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursive function to process all files in a directory
async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main execution
async function main() {
  console.log('🔄 Standardizing casing conventions...');
  const startTime = Date.now();
  
  try {
    // Focus on key directories first
    const typeDirs = [
      path.join(rootDir, 'types'),
      path.join(rootDir, 'constants'),
      path.join(rootDir, 'data')
    ];
    
    for (const dir of typeDirs) {
      try {
        await processDirectory(dir);
      } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
      }
    }
    
    // Then process the rest of the codebase
    await processDirectory(rootDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Casing standardization completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Error during casing standardization:', error.message);
    process.exit(1);
  }
}

// Add a dry run mode
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 Running in dry-run mode - no files will be modified');
  // Modify processFile to just log changes without writing
  const originalProcessFile = processFile;
  processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip binary files or empty files
      if (!content || content.includes('\u0000')) return false;
      
      // Make all the same modifications but don't write
      let updatedContent = content;
      updatedContent = updatedContent
        .replace(planetTypePattern, standardizePlanetType)
        .replace(zodiacTypePattern, standardizeZodiacType)
        .replace(elementTypePattern, standardizeElementType);
      
      updatedContent = standardizeInterfaceProperties(updatedContent);
      updatedContent = standardizeObjectLiterals(updatedContent);
      
      if (updatedContent !== content) {
        console.log(`Would update: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return false;
    }
  };
}

main();

export default main; 