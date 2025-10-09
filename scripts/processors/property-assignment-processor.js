#!/usr/bin/env node

/**
 * Property Assignment Processor - Phase 3.5 Pattern Expansion
 * Fixes TS1131: Property assignment expected errors
 */

import fs from 'fs';
import path from 'path';

class PropertyAssignmentProcessor {
  constructor() {
    this.projectRoot = path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '../..');
    this.filesProcessed = 0;
    this.propertiesFixed = 0;
    this.backupDir = path.join(this.projectRoot, 'backups', 'phase3', 'properties');
  }

  async process() {
    console.log('🔧 Processing TS1131: Property assignment expected errors...');

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with property assignment errors
    const filesWithErrors = await this.getFilesWithPropertyErrors();

    console.log(`Found ${filesWithErrors.length} files with property assignment errors`);

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      propertiesFixed: this.propertiesFixed,
      success: true
    };
  }

  async getFilesWithPropertyErrors() {
    // Files with TS1131 Property assignment expected errors
    const errorFiles = [
      'src/utils/testUtils.ts',
      'src/utils/timingUtils.ts',
      'src/utils/withRenderTracking.tsx',
      // Add more from error analysis
    ];

    return errorFiles.filter(file => {
      const fullPath = path.join(this.projectRoot, file);
      return fs.existsSync(fullPath);
    });
  }

  async processFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    console.log(`Processing ${filePath}...`);

    // Backup original
    const backupPath = path.join(this.backupDir, path.basename(filePath) + '.backup');
    fs.copyFileSync(fullPath, backupPath);

    let content = fs.readFileSync(fullPath, 'utf8');
    let localFixes = 0;

    // Fix common property assignment error patterns
    const fixes = [
      // Fix object literal property assignments
      { pattern: /(\w+):\s*([^,\n}]+),\s*}/g, replacement: (match, key, value) => {
        // Check if value looks like a valid property value
        if (!this.isValidPropertyValue(value)) {
          localFixes++;
          return `${key}: ${value.trim()},`;
        }
        return match;
      }},

      // Fix malformed property declarations
      { pattern: /(\w+)\s*:\s*,/g, replacement: (match, key) => {
        localFixes++;
        return `${key}: undefined,`;
      }},

      // Fix incomplete property assignments
      { pattern: /(\w+)\s*:\s*(\w+)\s*}/g, replacement: (match, key, value) => {
        localFixes++;
        return `${key}: ${value},`;
      }}
    ];

    for (const fix of fixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }

    if (localFixes > 0) {
      fs.writeFileSync(fullPath, content);
      this.filesProcessed++;
      this.propertiesFixed += localFixes;
      console.log(`  ✓ Fixed ${localFixes} property assignments`);
    }
  }

  isValidPropertyValue(value) {
    const trimmed = value.trim();
    // Check for common invalid patterns
    return !(
      trimmed === '' ||
      trimmed === ',' ||
      /^\s*}/.test(trimmed) ||
      /^\s*\)/.test(trimmed)
    );
  }
}

export default PropertyAssignmentProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new PropertyAssignmentProcessor();
  processor.process().then(result => {
    console.log('\n✅ Property assignment processing complete:');
    console.log(`Files processed: ${result.filesProcessed}`);
    console.log(`Properties fixed: ${result.propertiesFixed}`);
  }).catch(console.error);
}
