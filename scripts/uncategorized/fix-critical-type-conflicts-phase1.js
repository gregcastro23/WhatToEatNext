#!/usr/bin/env node

/**
 * Phase 1: Fix Critical Type Conflicts
 * - Resolve ElementalProperties conflicts between alchemy.ts and celestial.ts
 * - Fix duplicate identifier issues
 * - Resolve critical import/export conflicts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

class TypeConflictFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  log(message) {
    console.log(`[TypeConflictFixer] ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
    this.errors.push(message);
  }

  async fixFile(filePath, fixes) {
    try {
      const fullPath = path.resolve(__dirname, filePath);
      
      if (!fs.existsSync(fullPath)) {
        this.error(`File not found: ${fullPath}`);
        return false;
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const fix of fixes) {
        const result = fix(content);
        if (result !== content) {
          content = result;
          modified = true;
        }
      }

      if (modified) {
        if (!DRY_RUN) {
          fs.writeFileSync(fullPath, content, 'utf8');
          this.log(`✅ Fixed: ${filePath}`);
        } else {
          this.log(`[DRY RUN] Would fix: ${filePath}`);
        }
        this.fixedFiles.push(filePath);
      }

      return true;
    } catch (error) {
      this.error(`Failed to fix ${filePath}: ${error.message}`);
      return false;
    }
  }

  // Fix 1: Standardize ElementalProperties definition
  standardizeElementalProperties(content) {
    // Remove conflicting ElementalProperties imports from alchemy.ts
    if (content.includes('import { ElementalProperties } from "@/types/alchemy";')) {
      content = content.replace(/import { ElementalProperties } from "@\/types\/alchemy";\s*/g, '');
    }

    // Update celestial.ts ElementalProperties to include string index signature
    if (content.includes('export interface ElementalProperties {')) {
      content = content.replace(
        /export interface ElementalProperties \{\s*Fire: number;\s*Water: number;\s*Earth: number;\s*Air: number;\s*\}/g,
        `export interface ElementalProperties { 
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}`
      );
    }

    return content;
  }

  // Fix 2: Remove duplicate identifier issues
  removeDuplicateIdentifiers(content) {
    // Fix duplicate ElementalProperties declarations
    const elementalPropsRegex = /export\s+(type|interface)\s+ElementalProperties\s*\{[^}]*\}\s*;?/g;
    const matches = content.match(elementalPropsRegex);
    
    if (matches && matches.length > 1) {
      // Keep only the first declaration
      let firstFound = false;
      content = content.replace(elementalPropsRegex, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        }
        return ''; // Remove duplicate
      });
    }

    // Fix duplicate AstrologicalState imports
    content = content.replace(
      /import\s*\{\s*AstrologicalState[^}]*\}\s*from[^;]*;\s*\n.*import\s*\{\s*AstrologicalState[^}]*\}\s*from[^;]*;/g,
      (match) => {
        const lines = match.split('\n');
        return lines[0]; // Keep only first import
      }
    );

    return content;
  }

  // Fix 3: Resolve import conflicts
  resolveImportConflicts(content) {
    // Fix conflicting Element imports
    if (content.includes('import { Element } from "@/types/alchemy";') && 
        content.includes('export type Element =')) {
      content = content.replace(/import\s*\{\s*Element\s*\}\s*from\s*"@\/types\/alchemy";\s*/g, '');
    }

    // Fix conflicting AlchemicalProperties imports
    if (content.includes('import { AlchemicalProperties } from "@/types/alchemy";') && 
        content.includes('export interface AlchemicalProperties')) {
      content = content.replace(/import\s*\{\s*AlchemicalProperties\s*\}\s*from\s*"@\/types\/alchemy";\s*/g, '');
    }

    return content;
  }

  // Fix 4: Standardize zodiac sign casing
  standardizeZodiacCasing(content) {
    // Fix inconsistent zodiac sign casing - ensure lowercase in type definitions
    const zodiacMap = {
      'ariesAries': 'aries', 'taurusTaurus': 'taurus', 'geminiGemini': 'gemini', 'cancerCancer': 'cancer',
      'leoLeo': 'leo', 'virgoVirgo': 'virgo', 'libraLibra': 'libra', 'scorpioScorpio': 'scorpio',
      'sagittariusSagittarius': 'sagittarius', 'capricornCapricorn': 'capricorn', 'aquariusAquarius': 'aquarius', 'piscesPisces': 'pisces'
    };

    // Only replace in type definitions and interfaces
    Object.entries(zodiacMap).forEach(([upper, lower]) => {
      // Replace in type union definitions
      content = content.replace(
        new RegExp(`'${upper}'(?=\\s*\\||\\s*;|\\s*\\])`, 'g'),
        `'${lower}'`
      );
    });

    return content;
  }

  // Fix 5: Fix case-sensitive property access
  fixPropertyCasing(content) {
    // Fix Fire/fire, Water/water, etc. inconsistencies
    const elementMap = {
      'Fire': 'Fire',
      'Water': 'Water', 
      'Earth': 'Earth',
      'Air': 'Air'
    };

    // Fix in object property access patterns
    Object.entries(elementMap).forEach(([lower, upper]) => {
      // Fix property access like obj.Fire -> obj.Fire
      content = content.replace(
        new RegExp(`\\.${lower}(?=\\s*[\\[\\]\\)\\}\\,\\;\\=\\s])`, 'g'),
        `.${upper}`
      );
      
      // Fix object key references like { Fire: -> { Fire:
      content = content.replace(
        new RegExp(`\\{\\s*${lower}\\s*:`, 'g'),
        `{ ${upper}:`
      );
    });

    return content;
  }

  async run() {
    this.log('Starting Phase 1: Critical Type Conflicts Fix');
    this.log(DRY_RUN ? 'DRY RUN MODE - No files will be modified' : 'LIVE MODE - Files will be modified');

    const criticalFiles = [
      // Core type files first
      'src/types/alchemy.ts',
      'src/types/celestial.ts',
      
      // Files with most severe conflicts
      'src/calculations/elementalcalculations.ts',
      'src/utils/seasonalCalculations.ts',
      'src/utils/stateValidator.ts',
      'src/utils/recommendation/methodRecommendation.ts',
      
      // High-error files
      'src/components/RecipeList.tsx',
      'src/data/unified/cuisineIntegrations.ts',
      'src/data/recipes.ts',
      'src/lib/PlanetaryHourCalculator.ts',
      'src/utils/astrologyUtils.ts',
      'src/services/AstrologicalService.ts'
    ];

    for (const filePath of criticalFiles) {
      await this.fixFile(filePath, [
        this.standardizeElementalProperties.bind(this),
        this.removeDuplicateIdentifiers.bind(this),
        this.resolveImportConflicts.bind(this),
        this.standardizeZodiacCasing.bind(this),
        this.fixPropertyCasing.bind(this)
      ]);
    }

    // Summary
    this.log(`\n=== Phase 1 Summary ===`);
    this.log(`Files processed: ${criticalFiles.length}`);
    this.log(`Files modified: ${this.fixedFiles.length}`);
    
    if (this.errors.length > 0) {
      this.log(`Errors encountered: ${this.errors.length}`);
      this.errors.forEach(err => this.error(err));
    }

    this.log('Phase 1 complete. Run yarn tsc --noEmit to check progress.');
    
    return this.errors.length === 0;
  }
}

// Run the fixer
const fixer = new TypeConflictFixer();
fixer.run().catch(console.error); 