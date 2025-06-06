/**
 * Standardized Casing Conventions Fixer
 * 
 * This script fixes inconsistent casing in the codebase:
 * - Planets: Should be capitalized (Pascal Case): Sun, Moon, Mercury, etc.
 * - Zodiac Signs: Should be lowercase: aries, taurus, gemini, etc.
 * - Elements: Should be capitalized (Pascal Case): Fire, Water, Earth, Air
 * - Alchemical Properties: Already capitalized (Pascal Case): Spirit, Essence, Matter, Substance
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Dry run mode (set to false to actually apply changes)
const DRY_RUN = true;

// Standardized values
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant'];
const ZODIAC_SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const ELEMENTS = ['Fire', 'Water', 'Earth', 'Air'];
const ALCHEMICAL_PROPERTIES = ['Spirit', 'Essence', 'Matter', 'Substance'];

// Generate regex patterns for case-insensitive matches
const planetRegexes = PLANETS.map(planet => ({
  correct: planet,
  pattern: new RegExp(`\\b${planet}\\b`, 'i')
}));

const zodiacRegexes = ZODIAC_SIGNS.map(sign => ({
  correct: sign,
  pattern: new RegExp(`\\b${sign}\\b`, 'i')
}));

const elementRegexes = ELEMENTS.map(element => ({
  correct: element,
  pattern: new RegExp(`\\b${element}\\b`, 'i')
}));

const alchemicalRegexes = ALCHEMICAL_PROPERTIES.map(prop => ({
  correct: prop,
  pattern: new RegExp(`\\b${prop}\\b`, 'i')
}));

// Special cases to avoid
const SPECIAL_CASES = [
  /isDAiryFree/,  // Contains "Air" but should be left as is
  /PAirings/,     // Contains "Air" but should be left as is
  /minAir/,       // Property name that should be left as is
  /maxAir/        // Property name that should be left as is
];

// Get all TypeScript files
const tsFiles = globSync('src/**/*.{ts,tsx}');

// Stats
let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

// Process each file
tsFiles.forEach(filePath => {
  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let originalContent = fileContent;
    let fileModified = false;
    let fileReplacements = 0;

    // Check for special cases first - if any are found, skip the replacement for that line
    const lines = fileContent.split('\n');
    const newLines = lines.map(line => {
      // If line has special case, return it unchanged
      if (SPECIAL_CASES.some(pattern => pattern.test(line))) {
        return line;
      }
      
      let modifiedLine = line;
      
      // Fix planets (all instances should be capitalized)
      planetRegexes.forEach(({ correct, pattern }) => {
        modifiedLine = modifiedLine.replace(pattern, (match) => {
          if (match !== correct) {
            fileReplacements++;
            return correct;
          }
          return match;
        });
      });
      
      // Fix zodiac signs (all instances should be lowercase)
      zodiacRegexes.forEach(({ correct, pattern }) => {
        modifiedLine = modifiedLine.replace(pattern, (match) => {
          if (match !== correct) {
            fileReplacements++;
            return correct;
          }
          return match;
        });
      });
      
      // Fix elements (all instances should be capitalized)
      elementRegexes.forEach(({ correct, pattern }) => {
        modifiedLine = modifiedLine.replace(pattern, (match) => {
          if (match !== correct) {
            fileReplacements++;
            return correct;
          }
          return match;
        });
      });
      
      // Fix alchemical properties (all instances should be capitalized)
      alchemicalRegexes.forEach(({ correct, pattern }) => {
        modifiedLine = modifiedLine.replace(pattern, (match) => {
          if (match !== correct) {
            fileReplacements++;
            return correct;
          }
          return match;
        });
      });
      
      return modifiedLine;
    });
    
    fileContent = newLines.join('\n');
    
    // Check if file was modified
    if (originalContent !== fileContent) {
      fileModified = true;
      modifiedFiles++;
      totalReplacements += fileReplacements;
      
      console.log(`[${fileModified ? 'MODIFIED' : 'UNCHANGED'}] ${filePath} (${fileReplacements} replacements)`);
      
      // Write back the modified content if not in dry run mode
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, fileContent, 'utf8');
      }
    }
    
    totalFiles++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

// Print summary
console.log('\nSummary:');
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no files were modified)' : 'LIVE (files were modified)'}`);

console.log('\nTo apply changes, set DRY_RUN = false at the top of the script.'); 