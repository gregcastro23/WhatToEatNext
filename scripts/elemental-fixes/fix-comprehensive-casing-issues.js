#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root (two levels up from scripts/elemental-fixes/)
const projectRoot = path.resolve(__dirname, '../..');
const isDryRun = process.argv.includes('--dry-run');

class ComprehensiveCasingFixer {
  constructor() {
    this.changesApplied = [];
    this.errorsEncountered = [];
  }

  // Define casing rules
  static CASING_RULES = {
    // Planets should be capitalized (Pascal Case)
    planets: {
      'Sun': 'Sun',
      'Moon': 'Moon', 
      'Mercury': 'Mercury',
      'Venus': 'Venus',
      'Mars': 'Mars',
      'Jupiter': 'Jupiter',
      'Saturn': 'Saturn',
      'Uranus': 'Uranus',
      'Neptune': 'Neptune',
      'Pluto': 'Pluto'
    },
    
    // Elements should be capitalized (Pascal Case)
    elements: {
      'Fire': 'Fire',
      'Water': 'Water',
      'Earth': 'Earth',
      'Air': 'Air'
    },
    
    // Zodiac signs should be lowercase
    zodiacSigns: {
      'Aries': 'aries',
      'Taurus': 'taurus', 
      'Gemini': 'gemini',
      'Cancer': 'cancer',
      'Leo': 'leo',
      'Virgo': 'virgo',
      'Libra': 'libra',
      'Scorpio': 'scorpio',
      'Sagittarius': 'sagittarius',
      'Capricorn': 'capricorn',
      'Aquarius': 'aquarius',
      'Pisces': 'pisces'
    }
  };

  // Get files to process
  getFilesToProcess() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
    const files = [];

    const scanDirectory = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
              scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
      }
    };

    scanDirectory(projectRoot);
    return files;
  }

  // Apply fixes to a single file
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let fixedContent = content;
      let fileChanges = [];

      // Fix lowercase planets in object keys, strings, and property access
      Object.entries(ComprehensiveCasingFixer.CASING_RULES.planets).forEach(([incorrect, correct]) => {
        // Fix in string literals with single quotes
        const stringPattern1 = new RegExp(`'${incorrect}'`, 'g');
        if (stringPattern1.test(fixedContent)) {
          fixedContent = fixedContent.replace(stringPattern1, `'${correct}'`);
          fileChanges.push(`Changed '${incorrect}' to '${correct}' in string literals`);
        }

        // Fix in string literals with double quotes
        const stringPattern2 = new RegExp(`"${incorrect}"`, 'g');
        if (stringPattern2.test(fixedContent)) {
          fixedContent = fixedContent.replace(stringPattern2, `"${correct}"`);
          fileChanges.push(`Changed "${incorrect}" to "${correct}" in string literals`);
        }

        // Fix in array access patterns like positions['Sun']
        const arrayAccessPattern = new RegExp(`\\[['"]${incorrect}['"]\\]`, 'g');
        if (arrayAccessPattern.test(fixedContent)) {
          fixedContent = fixedContent.replace(arrayAccessPattern, `['${correct}']`);
          fileChanges.push(`Changed array access [${incorrect}] to [${correct}]`);
        }
      });

      // Fix mixed element casing (ensure all elements are Pascal Case)
      Object.entries(ComprehensiveCasingFixer.CASING_RULES.elements).forEach(([incorrect, correct]) => {
        // Skip if this is already correct
        if (incorrect === correct) return;

        // Fix in object property names and values
        const patterns = [
          // Property names in objects like { Fire: 0.3 }
          new RegExp(`(\\s|^|{|,)${incorrect}(:)`, 'g'),
          // String values like 'Fire'
          new RegExp(`'${incorrect}'`, 'g'),
          new RegExp(`"${incorrect}"`, 'g'),
          // Array access like .Fire
          new RegExp(`\\.${incorrect}\\b`, 'g')
        ];

        patterns.forEach((pattern, index) => {
          if (pattern.test(fixedContent)) {
            switch (index) {
              case 0: // Property names
                fixedContent = fixedContent.replace(pattern, `$1${correct}$2`);
                break;
              case 1: // Single quoted strings
              case 2: // Double quoted strings
                fixedContent = fixedContent.replace(pattern, `'${correct}'`);
                break;
              case 3: // Property access
                fixedContent = fixedContent.replace(pattern, `.${correct}`);
                break;
            }
            fileChanges.push(`Changed element '${incorrect}' to '${correct}'`);
          }
        });
      });

      // Fix specific mixed casing issues we found
      // Fix cases where Air is sometimes capitalized but other elements are not
      const mixedElementFixes = [
        // Fix patterns like { Fire: x, Water: y, Earth: z, Air: w } to be consistent
        {
          pattern: /(\{\s*[^}]*?)(\bfire\b)([^}]*?)(\bwater\b)([^}]*?)(\bearth\b)([^}]*?)(\bAir\b)([^}]*?\})/g,
          replacement: '$1Fire$3Water$5Earth$7Air$9'
        },
        // Fix patterns in object property access
        {
          pattern: /(\.\s*)(fire|water|earth)(\s*[,\s\|\}])/g,
          replacement: (match, prefix, element, suffix) => {
            const corrected = element.charAt(0).toUpperCase() + element.slice(1);
            return `${prefix}${corrected}${suffix}`;
          }
        }
      ];

      mixedElementFixes.forEach(fix => {
        if (fix.pattern.test(fixedContent)) {
          fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
          fileChanges.push('Fixed mixed element casing consistency');
        }
      });

      // Fix lunar phase casing (should be lowercase)
      const lunarPhaseFixes = [
        { pattern: /'new moon'/g, replacement: "'new moon'" },
        { pattern: /'full moon'/g, replacement: "'full moon'" },
        { pattern: /"new moon"/g, replacement: '"new moon"' },
        { pattern: /"full moon"/g, replacement: '"full moon"' }
      ];

      lunarPhaseFixes.forEach(fix => {
        if (fix.pattern.test(fixedContent)) {
          fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
          fileChanges.push('Fixed lunar phase casing');
        }
      });

      // Save changes if any were made
      if (fileChanges.length > 0) {
        if (!isDryRun) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
        }
        
        this.changesApplied.push({
          file: path.relative(projectRoot, filePath),
          changes: fileChanges
        });
      }

    } catch (error) {
      this.errorsEncountered.push({
        file: path.relative(projectRoot, filePath),
        error: error.message
      });
    }
  }

  // Run the comprehensive fix
  async run() {
    console.log('🔍 Starting comprehensive casing fixes...\n');
    
    if (isDryRun) {
      console.log('🧪 DRY RUN MODE - No files will be modified\n');
    }

    const files = this.getFilesToProcess();
    console.log(`📁 Found ${files.length} files to process\n`);

    // Process files
    for (const file of files) {
      this.fixFile(file);
    }

    // Report results
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CASING FIX REPORT');
    console.log('='.repeat(60));

    if (this.changesApplied.length === 0) {
      console.log('✅ No casing issues found - all files already follow conventions!');
    } else {
      console.log(`🔧 Fixed casing issues in ${this.changesApplied.length} files:\n`);
      
      for (const change of this.changesApplied) {
        console.log(`📝 ${change.file}:`);
        for (const changeDesc of change.changes) {
          console.log(`   • ${changeDesc}`);
        }
        console.log('');
      }
    }

    if (this.errorsEncountered.length > 0) {
      console.log(`❌ Errors encountered in ${this.errorsEncountered.length} files:\n`);
      for (const error of this.errorsEncountered) {
        console.log(`   ${error.file}: ${error.error}`);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    
    if (isDryRun && this.changesApplied.length > 0) {
      console.log('\n🔄 To apply these changes, run without --dry-run flag');
    } else if (!isDryRun && this.changesApplied.length > 0) {
      console.log('\n✅ All casing fixes have been applied successfully!');
      console.log('💡 Consider running yarn build to verify everything works correctly');
    }
  }
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComprehensiveCasingFixer();
  fixer.run().catch(console.error);
}

export default ComprehensiveCasingFixer; 