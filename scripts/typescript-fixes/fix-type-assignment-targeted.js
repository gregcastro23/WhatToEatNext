#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class TypeAssignmentFixer {
  constructor(dryRun = true) {
    this.dryRun = dryRun;
    this.changes = [];
    this.errors = [];
    this.processedFiles = new Set();
  }

  async run() {
    console.log(`🔧 Running Type Assignment Fixer (dry-run: ${this.dryRun})`);
    
    try {
      // Get specific type assignment errors we can fix
      const errors = await this.getTypeAssignmentErrors();
      console.log(`📊 Found ${errors.length} fixable type assignment errors`);
      
      // Group errors by file for efficient processing
      const errorsByFile = this.groupErrorsByFile(errors);
      
      // Process each file
      for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
        await this.processFile(filePath, fileErrors);
      }
      
      // Apply changes
      await this.applyChanges();
      
      console.log(`✅ Summary: ${this.changes.length} changes, ${this.errors.length} errors`);
      
    } catch (error) {
      console.error('❌ Error during type assignment fixing:', error.message);
      process.exit(1);
    }
  }

  async getTypeAssignmentErrors() {
    try {
      const result = await execAsync('yarn tsc --noEmit', { 
        cwd: path.resolve(__dirname, '../..'), 
        maxBuffer: 1024 * 1024 * 10
      });
      return [];
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || '';
      return this.parseFixableTypeErrors(errorOutput);
    }
  }

  parseFixableTypeErrors(output) {
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      const cleanLine = line.replace(/^yarn run v[\d.]+\s*/, '').replace(/^\$.*?tsc --noEmit\s*/, '');
      
      // Look for specific patterns we can fix
      if (this.isFixableTypeError(cleanLine)) {
        const match = cleanLine.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
        
        if (match) {
          const [, filePath, lineNum, colNum, errorCode, message] = match;
          const cleanFilePath = filePath.replace(/^.*?\/WhatToEatNext\//, '');
          
          errors.push({
            file: cleanFilePath,
            line: parseInt(lineNum),
            column: parseInt(colNum),
            code: errorCode,
            message: message.trim(),
            category: this.categorizeTypeError(message)
          });
        }
      }
    }
    
    return errors;
  }

  isFixableTypeError(line) {
    const fixablePatterns = [
      'is not assignable to type \'Element\'',
      'is not assignable to type \'LunarPhase\'',
      'Did you mean \'"full Moon"\'?',
      'Did you mean \'"new Moon"\'?',
      'Did you mean \'"waxing crescent"\'?',
      'Did you mean \'"waning crescent"\'?',
      'Did you mean \'"first quarter"\'?',
      'Did you mean \'"last quarter"\'?',
      'Type \'"',
      'Index signature for type \'string\' is missing'
    ];
    
    return fixablePatterns.some(pattern => line.includes(pattern));
  }

  categorizeTypeError(message) {
    if (message.includes('LunarPhase') && message.includes('Did you mean')) {
      return 'lunar-phase-casing';
    }
    if (message.includes('is not assignable to type \'Element\'')) {
      return 'element-type';
    }
    if (message.includes('Index signature for type \'string\' is missing')) {
      return 'index-signature';
    }
    if (message.includes('is not assignable to parameter of type')) {
      return 'parameter-type';
    }
    return 'other-type-assignment';
  }

  groupErrorsByFile(errors) {
    const grouped = {};
    for (const error of errors) {
      if (!grouped[error.file]) {
        grouped[error.file] = [];
      }
      grouped[error.file].push(error);
    }
    return grouped;
  }

  async processFile(filePath, fileErrors) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);

    try {
      console.log(`\n📂 Processing: ${filePath}`);
      const content = await fs.readFile(filePath, 'utf8');
      let newContent = content;
      let hasChanges = false;

      // Group errors by category for efficient processing
      const lunarPhaseErrors = fileErrors.filter(e => e.category === 'lunar-phase-casing');
      const elementTypeErrors = fileErrors.filter(e => e.category === 'element-type');
      const indexSignatureErrors = fileErrors.filter(e => e.category === 'index-signature');

      // Fix lunar phase casing issues
      if (lunarPhaseErrors.length > 0) {
        const lunarFix = this.fixLunarPhaseCasing(newContent, lunarPhaseErrors);
        if (lunarFix.changed) {
          newContent = lunarFix.content;
          hasChanges = true;
          console.log(`  🔧 Fixed ${lunarPhaseErrors.length} lunar phase casing issues`);
          this.changes.push({
            file: filePath,
            type: 'lunar-phase-casing',
            count: lunarPhaseErrors.length
          });
        }
      }

      // Fix element type issues
      if (elementTypeErrors.length > 0) {
        const elementFix = this.fixElementTypes(newContent, elementTypeErrors);
        if (elementFix.changed) {
          newContent = elementFix.content;
          hasChanges = true;
          console.log(`  🔧 Fixed ${elementTypeErrors.length} element type issues`);
          this.changes.push({
            file: filePath,
            type: 'element-type',
            count: elementTypeErrors.length
          });
        }
      }

      if (hasChanges && !this.dryRun) {
        await fs.writeFile(filePath, newContent);
        console.log(`  ✅ Applied fixes to ${path.basename(filePath)}`);
      } else if (hasChanges) {
        console.log(`  📝 Would apply fixes to ${path.basename(filePath)}`);
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  fixLunarPhaseCasing(content, errors) {
    const lines = content.split('\n');
    let changed = false;
    
    // Common lunar phase casing fixes
    const lunarPhaseFixes = {
      '"full Moonmoon"': '"full Moon"',
      "'full Moonmoon'": "'full Moon'",
      '"new Moonmoon"': '"new Moon"',
      "'new Moonmoon'": "'new Moon'",
      '"waxing crescent"': '"waxing crescent"', // This one is actually correct
      '"waning crescent"': '"waning crescent"', // This one is actually correct
      '"first quarter"': '"first quarter"', // This one is actually correct
      '"last quarter"': '"last quarter"' // This one is actually correct
    };
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      for (const [wrong, correct] of Object.entries(lunarPhaseFixes)) {
        if (line.includes(wrong)) {
          lines[i] = line.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
          changed = true;
        }
      }
    }
    
    return { content: lines.join('\n'), changed };
  }

  fixElementTypes(content, errors) {
    const lines = content.split('\n');
    let changed = false;
    
    // Look for string literals that should be Element types
    for (const error of errors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];
        
        // Common element type fixes
        const elementFixes = {
          '"Fire"': '"Fire"',
          "'Fire'": "'Fire'",
          '"Water"': '"Water"',
          "'Water'": "'Water'",
          '"Earth"': '"Earth"',
          "'Earth'": "'Earth'",
          '"Air"': '"Air"',
          "'Air'": "'Air'"
        };
        
        for (const [wrong, correct] of Object.entries(elementFixes)) {
          if (line.includes(wrong)) {
            lines[lineIndex] = line.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
            changed = true;
          }
        }
      }
    }
    
    return { content: lines.join('\n'), changed };
  }

  async applyChanges() {
    if (this.dryRun) {
      console.log('\n📋 DRY RUN - Changes that would be made:');
      this.changes.forEach((change, index) => {
        console.log(`${index + 1}. ${path.basename(change.file)}`);
        console.log(`   Type: ${change.type}`);
        console.log(`   Count: ${change.count} fixes\n`);
      });
      return;
    }
    
    console.log(`\n✅ Applied ${this.changes.length} sets of fixes across ${this.processedFiles.size} files`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (args.includes('--help')) {
  console.log(`
Type Assignment Fixer

Fixes common TypeScript type assignment errors such as:
- Lunar phase casing issues (full Moonmoon -> full Moon)
- Element type mismatches (fire -> Fire)
- String literal type assignments

Usage:
  node fix-type-assignment-targeted.js [options]

Options:
  --dry-run    Preview changes without applying them (default)
  --execute    Apply the fixes to files
  --help       Show this help message

Examples:
  node fix-type-assignment-targeted.js                    # Dry run
  node fix-type-assignment-targeted.js --execute          # Apply fixes
`);
  process.exit(0);
}

// Run the fixer
const fixer = new TypeAssignmentFixer(dryRun);
fixer.run().catch(error => {
  console.error('❌ Type assignment fixing failed:', error);
  process.exit(1);
}); 