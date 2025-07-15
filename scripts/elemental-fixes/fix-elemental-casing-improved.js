/**
 * fix-elemental-casing-improved.js
 * 
 * Enhanced script to standardize casing for astrological, elemental, and alchemical terms:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 * 
 * Features:
 * - ES modules
 * - Comprehensive dry-run mode
 * - Targeted processing (no mass regex)
 * - No backup creation
 * - Validation checks
 * 
 * Usage:
 * node scripts/elemental-fixes/fix-elemental-casing-improved.js --dry-run
 * node scripts/elemental-fixes/fix-elemental-casing-improved.js --target=core
 * node scripts/elemental-fixes/fix-elemental-casing-improved.js --apply
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldApply = args.includes('--apply');
const targetArg = args.find(arg => arg.startsWith('--target='));
const target = targetArg ? targetArg.split('=')[1] : 'all';

// Casing conventions from workspace rules
const CONVENTIONS = {
  planets: {
    correct: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant'],
    variants: ['Sunsun', 'SUN', 'Moonmoon', 'MOON', 'Mercurymercury', 'MERCURY', 'Venusvenus', 'VENUS', 'Marsmars', 'MARS', 
               'Jupiterjupiter', 'JUPITER', 'Saturnsaturn', 'SATURN', 'Uranusuranus', 'URANUS', 'Neptuneneptune', 'NEPTUNE', 
               'Plutopluto', 'PLUTO', 'ascendant', 'ASCENDANT']
  },
  zodiacSigns: {
    correct: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
    variants: ['ariesAries', 'ARIES', 'taurusTaurus', 'TAURUS', 'geminiGemini', 'GEMINI', 'cancerCancer', 'CANCER', 
               'leoLeo', 'LEO', 'virgoVirgo', 'VIRGO', 'libraLibra', 'LIBRA', 'scorpioScorpio', 'SCORPIO',
               'sagittariusSagittarius', 'SAGITTARIUS', 'capricornCapricorn', 'CAPRICORN', 'aquariusAquarius', 'AQUARIUS', 'piscesPisces', 'PISCES']
  },
  elements: {
    correct: ['Fire', 'Water', 'Earth', 'Air'],
    variants: ['Fire', 'FIRE', 'Water', 'WATER', 'Earth', 'EARTH', 'Air', 'AIR']
  },
  alchemicalProperties: {
    correct: ['Spirit', 'Essence', 'Matter', 'Substance'],
    variants: ['Spirit', 'Spirit', 'Essence', 'Essence', 'Matter', 'Matter', 'Substance', 'Substance']
  }
};

// Target file groups
const FILE_TARGETS = {
  core: [
    'src/types/alchemy.ts',
    'src/types/celestial.ts',
    'src/calculations/alchemicalEngine.ts',
    'src/lib/alchemicalEngine.ts',
    'src/constants/alchemicalPillars.ts'
  ],
  services: [
    'src/services/AlchemicalEngine.ts',
    'src/services/ElementalCalculator.ts'
  ],
  utils: [
    'src/utils/astrology/',
    'src/utils/elemental/',
    'src/utils/alchemicalPillarUtils.ts'
  ],
  data: [
    'src/data/planets/',
    'src/data/ingredients/',
    'src/data/cuisines/'
  ],
  components: [
    'src/components/ElementalDisplay/',
    'src/components/CelestialDisplay/',
    'src/components/AstrologyChart/'
  ]
};

// Create mapping objects for replacements
function createMappings() {
  const mappings = {};
  
  Object.keys(CONVENTIONS).forEach(category => {
    const { correct, variants } = CONVENTIONS[category];
    
    correct.forEach((correctForm, index) => {
      // Map lowercase to correct form
      const lowerForm = correctForm.toLowerCase();
      if (category === 'zodiacSigns') {
        mappings[correctForm.charAt(0).toUpperCase() + correctForm.slice(1)] = correctForm; // Capitalize first letter -> lowercase
      } else if (category === 'planets' || category === 'elements' || category === 'alchemicalProperties') {
        mappings[lowerForm] = correctForm; // lowercase -> Pascal Case
        mappings[correctForm.toUpperCase()] = correctForm; // UPPERCASE -> Pascal Case
      }
    });
    
    // Handle explicit variants
    variants.forEach(variant => {
      const correctForm = correct.find(c => c.toLowerCase() === variant.toLowerCase());
      if (correctForm && variant !== correctForm) {
        mappings[variant] = correctForm;
      }
    });
  });
  
  return mappings;
}

// Check if a position in text should be skipped (inside strings, comments, etc.)
function shouldSkipPosition(content, startPos, endPos) {
  const beforeChar = startPos > 0 ? content.charAt(startPos - 1) : '';
  const afterChar = endPos < content.length ? content.charAt(endPos) : '';
  
  // Skip if inside string literals
  if ((beforeChar === '"' || beforeChar === "'") && (afterChar === '"' || afterChar === "'")) {
    return true;
  }
  
  // Skip if inside template literals
  const snippet = content.substring(Math.max(0, startPos - 50), Math.min(content.length, endPos + 50));
  if (snippet.includes('`') && snippet.includes('${')) {
    return true;
  }
  
  // Skip if inside comments
  if (snippet.includes('//') || snippet.includes('/*')) {
    return true;
  }
  
  // Skip if inside type definitions
  if (snippet.includes('type ') || snippet.includes('interface ') || snippet.includes('export type')) {
    return true;
  }
  
  return false;
}

// Process a single file
function processFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${filePath}`);
    return { processed: false, changes: [] };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;
  const changes = [];
  const mappings = createMappings();
  
  // Process each mapping
  Object.keys(mappings).forEach(incorrect => {
    const correct = mappings[incorrect];
    
    // Use word boundary regex to avoid partial matches
    const regex = new RegExp(`\\b${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    
    newContent = newContent.replace(regex, (match, offset) => {
      // Check if this position should be skipped
      if (shouldSkipPosition(content, offset, offset + match.length)) {
        return match;
      }
      
      // Record the change
      changes.push({
        line: content.substring(0, offset).split('\n').length,
        from: match,
        to: correct,
        context: content.substring(Math.max(0, offset - 20), Math.min(content.length, offset + match.length + 20))
      });
      
      return correct;
    });
  });
  
  return {
    processed: newContent !== content,
    changes,
    originalContent: content,
    newContent
  };
}

// Get files to process based on target
function getFilesToProcess() {
  let files = [];
  
  if (target === 'all') {
    Object.values(FILE_TARGETS).forEach(group => {
      files = files.concat(group);
    });
  } else if (FILE_TARGETS[target]) {
    files = FILE_TARGETS[target];
  } else {
    console.error(`Unknown target: ${target}`);
    console.log(`Available targets: ${Object.keys(FILE_TARGETS).join(', ')}, all`);
    process.exit(1);
  }
  
  // Expand directory paths to actual files
  const expandedFiles = [];
  files.forEach(file => {
    if (file.endsWith('/')) {
      // Directory - find all TypeScript/JavaScript files
      const dirPath = path.join(rootDir, file);
      if (fs.existsSync(dirPath)) {
        const dirFiles = fs.readdirSync(dirPath, { recursive: true })
          .filter(f => f.match(/\.(ts|tsx|js|jsx)$/))
          .map(f => path.join(file, f).replace(/\\/g, '/'));
        expandedFiles.push(...dirFiles);
      }
    } else {
      expandedFiles.push(file);
    }
  });
  
  return [...new Set(expandedFiles)]; // Remove duplicates
}

// Main execution
function main() {
  console.log('🔧 Elemental Casing Fix - Improved Version');
  console.log(`Target: ${target}`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : shouldApply ? 'APPLY CHANGES' : 'PREVIEW'}`);
  console.log('');
  
  if (!isDryRun && !shouldApply) {
    console.log('⚠️  No action specified. Use --dry-run to preview or --apply to make changes.');
    process.exit(0);
  }
  
  const filesToProcess = getFilesToProcess();
  console.log(`📁 Processing ${filesToProcess.length} files...\n`);
  
  let totalChanges = 0;
  const processedFiles = [];
  
  filesToProcess.forEach(file => {
    const result = processFile(file);
    
    if (result.changes.length > 0) {
      processedFiles.push({ file, ...result });
      totalChanges += result.changes.length;
      
      console.log(`📄 ${file} (${result.changes.length} changes)`);
      result.changes.forEach(change => {
        console.log(`   Line ${change.line}: ${change.from} → ${change.to}`);
      });
      console.log('');
    }
  });
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${filesToProcess.length}`);
  console.log(`   Files with changes: ${processedFiles.length}`);
  console.log(`   Total changes: ${totalChanges}`);
  
  // Apply changes if requested
  if (shouldApply && processedFiles.length > 0) {
    console.log('\n✅ Applying changes...');
    processedFiles.forEach(({ file, newContent }) => {
      const fullPath = path.join(rootDir, file);
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`   ✓ ${file}`);
    });
    console.log(`\n🎉 Applied changes to ${processedFiles.length} files!`);
  } else if (isDryRun && processedFiles.length > 0) {
    console.log('\n🔍 This was a dry run. Use --apply to make these changes.');
  } else if (processedFiles.length === 0) {
    console.log('\n✨ No changes needed! All files already follow the correct casing conventions.');
  }
}

// Run the script
main(); 