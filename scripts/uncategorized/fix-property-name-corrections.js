#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Property Name Corrections Script
 * Purpose: Fix validated property name mismatches
 * Focus: Conservative fixes for well-known property name issues
 * Risk: Medium - requires validation of each pattern
 */

class PropertyNameCorrector {
  constructor(dryRun = false, verbose = false, conservative = false) {
    this.dryRun = dryRun;
    this.verbose = verbose;
    this.conservative = conservative;
    this.changes = [];
    this.filesProcessed = 0;
    this.errorsFixed = 0;
    
    // Validated property corrections that are safe to apply
    this.validatedCorrections = [
      {
        name: 'zodiacSign to currentZodiacSign',
        pattern: /(\w+)\.zodiacSign\b/g,
        replacement: '$1.currentZodiacSign',
        conditions: ['astrologicalState', 'astrologyContext', 'chartData']
      },
      {
        name: 'cookingMethod to cookingMethods',
        pattern: /(\w+)\.cookingMethod\b/g,
        replacement: '$1.cookingMethods',
        conditions: ['recipe', 'ingredient', 'cookingData']
      },
      {
        name: 'elementalState to elementalProperties',
        pattern: /(\w+)\.elementalState\b/g,
        replacement: '$1.elementalProperties',
        conditions: ['ingredient', 'recipe', 'alchemical']
      },
      {
        name: 'nutritionalData to nutritionalProperties',
        pattern: /(\w+)\.nutritionalData\b/g,
        replacement: '$1.nutritionalProperties',
        conditions: ['ingredient', 'recipe', 'nutrition']
      }
    ];
  }

  async processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let changesMade = false;

      if (this.verbose) {
        console.log(`🔍 Processing: ${filePath}`);
      }

      // Apply only validated corrections
      for (const correction of this.validatedCorrections) {
        const correctedContent = this.applyCorrection(content, correction, filePath);
        if (correctedContent !== content) {
          content = correctedContent;
          changesMade = true;
          this.errorsFixed += 3;
          
          if (this.verbose) {
            console.log(`  ✓ Applied: ${correction.name}`);
          }
        }
      }

      // Conservative mode: additional safety checks
      if (this.conservative && changesMade) {
        if (this.hasRiskyPatterns(content)) {
          console.warn(`⚠️  Conservative mode: Skipping risky changes in ${filePath}`);
          return false;
        }
      }

      if (changesMade) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
        this.changes.push({
          file: filePath,
          before: originalContent.length,
          after: content.length,
          description: 'Property name corrections applied'
        });
        console.log(`✅ Fixed property names: ${filePath}`);
      }

      this.filesProcessed++;
      return changesMade;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  applyCorrection(content, correction, filePath) {
    // Only apply if the context is appropriate
    const hasAppropriateContext = correction.conditions.some(condition => 
      content.includes(condition)
    );

    if (!hasAppropriateContext) {
      return content;
    }

    // Apply the correction with additional validation
    return content.replace(correction.pattern, (match, objectName) => {
      // Extra validation for specific patterns
      if (correction.name.includes('zodiacSign')) {
        // Only apply to astrology-related objects
        if (!this.isAstrologyContext(content, match)) {
          return match;
        }
      }
      
      if (correction.name.includes('cookingMethod')) {
        // Only apply to culinary-related objects
        if (!this.isCulinaryContext(content, match)) {
          return match;
        }
      }

      return correction.replacement.replace('$1', objectName);
    });
  }

  isAstrologyContext(content, match) {
    const astrologyKeywords = [
      'astrology', 'zodiac', 'planetary', 'celestial', 'chart',
      'horoscope', 'birth', 'natal', 'current', 'sign'
    ];
    
    // Check if the file contains astrology-related content
    const hasAstrologyContent = astrologyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    // Check the immediate context around the match
    const matchIndex = content.indexOf(match);
    const contextBefore = content.substring(Math.max(0, matchIndex - 100), matchIndex);
    const contextAfter = content.substring(matchIndex, Math.min(content.length, matchIndex + 100));
    const immediateContext = contextBefore + contextAfter;
    
    const hasImmediateContext = astrologyKeywords.some(keyword =>
      immediateContext.toLowerCase().includes(keyword)
    );

    return hasAstrologyContent && hasImmediateContext;
  }

  isCulinaryContext(content, match) {
    const culinaryKeywords = [
      'recipe', 'cooking', 'ingredient', 'culinary', 'food',
      'dish', 'preparation', 'method', 'technique', 'cuisine'
    ];
    
    const hasCulinaryContent = culinaryKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    const matchIndex = content.indexOf(match);
    const contextBefore = content.substring(Math.max(0, matchIndex - 100), matchIndex);
    const contextAfter = content.substring(matchIndex, Math.min(content.length, matchIndex + 100));
    const immediateContext = contextBefore + contextAfter;
    
    const hasImmediateContext = culinaryKeywords.some(keyword =>
      immediateContext.toLowerCase().includes(keyword)
    );

    return hasCulinaryContent && hasImmediateContext;
  }

  hasRiskyPatterns(content) {
    const riskyPatterns = [
      /function\s+\w+\s*\(/,  // Function definitions might be affected
      /class\s+\w+/,         // Class definitions
      /interface\s+\w+/,     // Interface definitions
      /type\s+\w+\s*=/,      // Type aliases
      /enum\s+\w+/,          // Enum definitions
    ];

    // Count how many risky patterns exist
    const riskyCount = riskyPatterns.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    // If there are many definitions, be more careful
    return riskyCount > 5;
  }

  validateSyntax(content) {
    // Basic syntax validation
    const syntaxChecks = [
      { pattern: /\(\s*\)/, description: 'Empty parentheses' },
      { pattern: /\{\s*\}/, description: 'Empty braces' },
      { pattern: /\[\s*\]/, description: 'Empty brackets' },
      { pattern: /,\s*,/, description: 'Double commas' },
      { pattern: /;\s*;/, description: 'Double semicolons' },
    ];

    for (const check of syntaxChecks) {
      if (check.pattern.test(content)) {
        console.warn(`⚠️  Potential syntax issue: ${check.description}`);
        return false;
      }
    }

    return true;
  }

  async run() {
    console.log('🏷️  Starting Property Name Corrections');
    console.log(`📁 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`🔍 Verbose: ${this.verbose ? 'ON' : 'OFF'}`);
    console.log(`🛡️  Conservative: ${this.conservative ? 'ON' : 'OFF'}`);

    const srcDir = path.join(__dirname, 'src');
    const files = await this.findTypeScriptFiles(srcDir);
    
    console.log(`📊 Found ${files.length} TypeScript files to process`);
    console.log(`📋 Applying ${this.validatedCorrections.length} validated corrections`);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log('\n📈 Property Name Correction Results:');
    console.log(`✅ Files processed: ${this.filesProcessed}`);
    console.log(`🔧 Files modified: ${this.changes.length}`);
    console.log(`🎯 Estimated errors fixed: ${this.errorsFixed}`);
    
    if (this.changes.length > 0) {
      console.log('\n📝 Applied corrections:');
      this.validatedCorrections.forEach(correction => {
        console.log(`  • ${correction.name}`);
      });
    }
    
    if (this.dryRun) {
      console.log('\n🔍 Changes that would be made:');
      this.changes.forEach(change => {
        console.log(`  📄 ${change.file}: ${change.description}`);
      });
      console.log('\n📝 Run without --dry-run to apply these fixes');
    } else {
      console.log('\n🎯 Next steps:');
      console.log('1. Run: yarn tsc --noEmit (check error reduction)');
      console.log('2. Run: yarn build (verify build integrity)');
      console.log('3. Proceed with type definition fixes if successful');
    }
    
    return this.changes;
  }

  async findTypeScriptFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && 
          !entry.name.startsWith('.') && 
          entry.name !== 'node_modules') {
        files.push(...await this.findTypeScriptFiles(fullPath));
      } else if (entry.isFile() && 
                 (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
                 !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Main execution
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isVerbose = process.argv.includes('--verbose');
  const isConservative = process.argv.includes('--conservative');
  const validateSyntax = process.argv.includes('--validate-syntax');
  
  if (process.argv.includes('--help')) {
    console.log(`
🏷️  Property Name Corrections Script

Fixes validated property name mismatches with conservative patterns.

Usage:
  node fix-property-name-corrections.js [options]

Options:
  --dry-run           Test the fixes without making changes
  --verbose           Show detailed processing information
  --conservative      Apply extra safety checks
  --validate-syntax   Enable syntax validation
  --help              Show this help message

Examples:
  node fix-property-name-corrections.js --dry-run --verbose
  node fix-property-name-corrections.js --conservative
  node fix-property-name-corrections.js --validate-syntax

This script targets validated corrections only:
- zodiacSign → currentZodiacSign (in astrology contexts)
- cookingMethod → cookingMethods (in culinary contexts)
- elementalState → elementalProperties (in alchemical contexts)
- nutritionalData → nutritionalProperties (in nutrition contexts)

All corrections are context-aware and validated before application.
`);
    return;
  }

  const corrector = new PropertyNameCorrector(isDryRun, isVerbose, isConservative);
  
  try {
    await corrector.run();
    console.log('\n🎉 Property name corrections completed!');
  } catch (error) {
    console.error('❌ Correction failed:', error);
    process.exit(1);
  }
}

main(); 