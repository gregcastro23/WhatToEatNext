#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../..');

console.log('🔧 Fixing Casing Conventions Across Codebase');
console.log('📋 Applying standardized rules:');
console.log('   • Planets: Sun, Moon, Mercury, etc. (Pascal Case)');
console.log('   • Zodiac Signs: aries, taurus, gemini, etc. (lowercase)');
console.log('   • Elements: Fire, Water, Earth, Air (Pascal Case)');
console.log('   • Alchemical Properties: Spirit, Essence, Matter, Substance (Pascal Case)');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Mapping objects for transformations
const planetCasing = {
  // Lowercase to correct casing
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto'
};

const zodiacCasing = {
  // Uppercase to correct casing
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

const elementCasing = {
  // Lowercase to correct casing
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalCasing = {
  // These should already be correct, but checking for any lowercase variants
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'backup',
  'backups',
  '.astro',
  '.swc',
  'patches',
  'tmp'
];

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
  const dirName = path.basename(dirPath);
  return EXCLUDE_DIRS.some(excluded => 
    dirName === excluded || dirPath.includes(`/${excluded}/`) || dirPath.includes(`\\${excluded}\\`)
  );
}

/**
 * Get all files to process
 */
function getAllFiles(dir, files = []) {
  if (shouldExcludeDir(dir)) {
    return files;
  }

  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        getAllFiles(fullPath, files);
      } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

/**
 * Apply casing fixes to content
 */
function applyCasingFixes(content, filePath) {
  let fixedContent = content;
  const fixes = [];

  // Fix planet names (excluding common words that might conflict)
  Object.entries(planetCasing).forEach(([incorrect, correct]) => {
    // Use word boundaries and look for object properties or standalone usage
    const patterns = [
      // Property keys and values in objects
      new RegExp(`(\\b|['"])(${incorrect})(\\b|['"])`, 'g'),
      // In type definitions 
      new RegExp(`\\b${incorrect}\\b(?=\\s*[:|,}])`, 'g'),
      // Standalone usage with word boundaries
      new RegExp(`\\b${incorrect}\\b(?![a-z])`, 'g')
    ];

    patterns.forEach(pattern => {
      if (pattern.test(fixedContent)) {
        const matches = fixedContent.match(pattern) || [];
        if (matches.length > 0) {
          fixes.push(`${incorrect} → ${correct} (${matches.length} occurrences)`);
          fixedContent = fixedContent.replace(pattern, (match, ...groups) => {
            // Handle different capture group patterns
            if (groups.length >= 2) {
              return `${groups[0]}${correct}${groups[1]}`;
            }
            return match.replace(incorrect, correct);
          });
        }
      }
    });
  });

  // Fix zodiac signs
  Object.entries(zodiacCasing).forEach(([incorrect, correct]) => {
    const patterns = [
      // Property keys and values
      new RegExp(`(\\b|['"])(${incorrect})(\\b|['"])`, 'g'),
      // Type definitions
      new RegExp(`\\b${incorrect}\\b(?=\\s*[:|,}])`, 'g'),
      // Standalone usage
      new RegExp(`\\b${incorrect}\\b`, 'g')
    ];

    patterns.forEach(pattern => {
      if (pattern.test(fixedContent)) {
        const matches = fixedContent.match(pattern) || [];
        if (matches.length > 0) {
          fixes.push(`${incorrect} → ${correct} (${matches.length} occurrences)`);
          fixedContent = fixedContent.replace(pattern, (match, ...groups) => {
            if (groups.length >= 2) {
              return `${groups[0]}${correct}${groups[1]}`;
            }
            return match.replace(incorrect, correct);
          });
        }
      }
    });
  });

  // Fix element names (be careful with common words)
  Object.entries(elementCasing).forEach(([incorrect, correct]) => {
    // Be more selective with elements to avoid false positives
    const patterns = [
      // Property names in ElementalProperties
      new RegExp(`(\\b|['"])(${incorrect})(\\b|['"])(?=\\s*:)`, 'g'),
      // Array or object values
      new RegExp(`(['"])(${incorrect})(['"])`, 'g'),
      // Type annotations
      new RegExp(`\\b${incorrect}\\b(?=\\s*[|&])`, 'g')
    ];

    patterns.forEach(pattern => {
      if (pattern.test(fixedContent)) {
        const matches = fixedContent.match(pattern) || [];
        if (matches.length > 0) {
          fixes.push(`${incorrect} → ${correct} (${matches.length} occurrences)`);
          fixedContent = fixedContent.replace(pattern, (match, ...groups) => {
            if (groups.length >= 2) {
              return `${groups[0]}${correct}${groups[1]}`;
            }
            return match.replace(incorrect, correct);
          });
        }
      }
    });
  });

  // Fix alchemical properties
  Object.entries(alchemicalCasing).forEach(([incorrect, correct]) => {
    const pattern = new RegExp(`\\b${incorrect}\\b`, 'gi');
    if (pattern.test(fixedContent)) {
      const matches = fixedContent.match(pattern) || [];
      if (matches.length > 0) {
        fixes.push(`${incorrect} → ${correct} (${matches.length} occurrences)`);
        fixedContent = fixedContent.replace(pattern, correct);
      }
    }
  });

  return { content: fixedContent, fixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const { content: fixedContent, fixes } = applyCasingFixes(content, filePath);
    
    if (fixes.length > 0) {
      console.log(`\n📁 ${relativePath}`);
      fixes.forEach(fix => console.log(`   ✓ ${fix}`));
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`\n🔍 Scanning files in: ${ROOT_DIR}`);
  
  const files = getAllFiles(ROOT_DIR);
  console.log(`📊 Found ${files.length} files to process`);
  
  let processedCount = 0;
  let fixedCount = 0;
  
  for (const file of files) {
    processedCount++;
    if (processFile(file)) {
      fixedCount++;
    }
    
    // Progress indicator for large number of files
    if (processedCount % 100 === 0) {
      console.log(`📈 Progress: ${processedCount}/${files.length} files processed`);
    }
  }
  
  console.log(`\n✅ Processing complete!`);
  console.log(`📊 Files processed: ${processedCount}`);
  console.log(`🔧 Files with fixes: ${fixedCount}`);
  
  if (DRY_RUN) {
    console.log(`\n🏃 This was a dry run. Run without --dry-run to apply changes.`);
  } else {
    console.log(`\n💾 All fixes have been applied.`);
  }
}

// Run the script
main(); 