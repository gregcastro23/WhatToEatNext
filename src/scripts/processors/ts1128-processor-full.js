#!/usr/bin/env node

/**
 * TS1128 Processor - Declaration or Statement Expected
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class TS1128Processor {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async process(dryRun = true) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔧 TS1128 Processor - Declaration/Statement Expected`);
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log('='.repeat(60));

    const errors = await this.getErrors();
    if (errors.length === 0) {
      console.log('✅ No TS1128 errors found!');
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1128 errors`);
    const errorsByFile = this.groupByFile(errors);
    console.log(`📁 Files affected: ${Object.keys(errorsByFile).length}`);

    let filesProcessed = 0;
    let errorsFixed = 0;

    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      console.log(`\n📄 Processing: ${path.relative(this.projectRoot, filePath)}`);
      console.log(`   Errors: ${fileErrors.length}`);

      try {
        const fixed = await this.fixFileErrors(filePath, fileErrors, dryRun);
        errorsFixed += fixed;
        filesProcessed++;
        console.log(`   ✅ Fixed ${fixed} errors`);
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Summary:`);
    console.log(`   Files processed: ${filesProcessed}`);
    console.log(`   Errors fixed: ${errorsFixed}`);
    console.log('='.repeat(60));

    return { filesProcessed, errorsFixed };
  }

  async getErrors() {
    const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
      cwd: this.projectRoot,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024
    });

    const errors = [];
    for (const line of tscOutput.split('\n')) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1128:/);
      if (match) {
        errors.push({
          filePath: path.resolve(this.projectRoot, match[1]),
          line: parseInt(match[2]),
          column: parseInt(match[3])
        });
      }
    }
    return errors;
  }

  groupByFile(errors) {
    const grouped = {};
    for (const error of errors) {
      if (!grouped[error.filePath]) grouped[error.filePath] = [];
      grouped[error.filePath].push(error);
    }
    return grouped;
  }

  async fixFileErrors(filePath, errors, dryRun) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixedCount = 0;

    // Sort descending
    errors.sort((a, b) => b.line - a.line || b.column - a.column);

    for (const error of errors) {
      const lineIdx = error.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) continue;

      const currentLine = lines[lineIdx];
      const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : '';
      const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : '';

      const fixed = this.fixLine(currentLine, prevLine, nextLine, error);

      if (fixed !== currentLine) {
        lines[lineIdx] = fixed;
        fixedCount++;
      }
    }

    if (!dryRun && fixedCount > 0) {
      fs.writeFileSync(filePath, lines.join('\n'));
    }

    return fixedCount;
  }

  fixLine(line, prevLine, nextLine, error) {
    // Pattern 1: Orphaned closing brace with semicolon
    // "return 'spring' };"  should be just "return 'spring';"
    if (/}\s*;\s*$/.test(line)) {
      return line.replace(/}\s*;\s*$/, ';');
    }

    // Pattern 2: Orphaned closing brace at start
    // "    else if (x) {" on prev line, then "};" on current line
    // Should remove the orphaned "}"
    if (/^\s*}\s*;\s*$/.test(line) && /else\s+if\s*\(/.test(prevLine)) {
      return line.replace(/^\s*}\s*;/, '');
    }

    // Pattern 3: Orphaned else if without opening brace
    // "        else if (...)" following a close-brace line
    // The issue is the orphaned closing brace before it
    if (/^\s*else\s+if\s*\(/.test(line) && /}\s*;\s*$/.test(prevLine)) {
      // This is handled by Pattern 2 on the previous line
      return line;
    }

    // Pattern 4: Random orphaned closing brace/bracket/paren
    if (/^\s*[}\])][\s;,]*$/.test(line)) {
      // Check context - if surrounded by code, likely orphaned
      if (prevLine.trim() && nextLine.trim() && !prevLine.includes('{') && !nextLine.includes('{')) {
        return ''; // Remove the line
      }
    }

    // Pattern 5: Double closing punctuation
    line = line.replace(/}}\s*;/g, '};');
    line = line.replace(/;\s*;\s*/g, ';');

    return line;
  }

  async getFilesWithErrors() {
    const errors = await this.getErrors();
    return [...new Set(errors.map(e => e.filePath))];
  }
}

export default TS1128Processor;

if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TS1128Processor();
  await processor.process(!process.argv.includes('--confirm'));
}
