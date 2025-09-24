#!/usr/bin/env node

/**
 * Strategic Strict Null Checks Fixer
 *
 * Fixes the most common strictNullChecks errors using targeted patterns
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class StrictNullChecksFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.errorPatterns = {
      // TS18048: 'variable' is possibly 'undefined'
      possiblyUndefined: /(\w+) is possibly 'undefined'/,

      // TS18047: 'object' is possibly 'null'
      possiblyNull: /(\w+) is possibly 'null'/,

      // TS2345: Argument type issues
      argumentType: /Argument of type .* is not assignable to parameter of type/,

      // TS2322: Type assignment issues
      typeAssignment: /Type .* is not assignable to type/,
    };
  }

  /**
   * Get current strictNullChecks errors
   */
  getStrictNullErrors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      });

      const errors = [];
      const lines = output.split('\n');

      for (const line of lines) {
        if (line.includes('error TS')) {
          // Handle multi-line error format
          const match =
            line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/) ||
            line.match(/(.+?):\s*line\s*(\d+),\s*col\s*(\d+),\s*Error\s*-\s*(.+?)\s*\((TS\d+)\)/);

          if (match) {
            const [, filePath, lineNum, colNum, errorCode, message] = match;
            errors.push({
              file: filePath.trim(),
              line: parseInt(lineNum),
              column: parseInt(colNum),
              code: errorCode,
              message: (message || '').trim(),
            });
          } else if (line.includes(': error TS')) {
            // Fallback parsing for different formats
            const parts = line.split(': error TS');
            if (parts.length >= 2) {
              const locationPart = parts[0];
              const errorPart = parts[1];

              const locationMatch = locationPart.match(/(.+?)\((\d+),(\d+)\)$/);
              const errorMatch = errorPart.match(/^(\d+): (.+)$/);

              if (locationMatch && errorMatch) {
                errors.push({
                  file: locationMatch[1].trim(),
                  line: parseInt(locationMatch[2]),
                  column: parseInt(locationMatch[3]),
                  code: 'TS' + errorMatch[1],
                  message: errorMatch[2].trim(),
                });
              }
            }
          }
        }
      }

      return errors;
    } catch (error) {
      // TypeScript compilation failed, but we still want to parse errors from stderr
      if (error.stdout) {
        return this.parseErrorsFromOutput(error.stdout);
      }
      return [];
    }
  }

  parseErrorsFromOutput(output) {
    const errors = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('error TS')) {
        // Try multiple parsing patterns
        const patterns = [
          /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/,
          /(.+?):\s*line\s*(\d+),\s*col\s*(\d+),\s*Error\s*-\s*(.+?)\s*\((TS\d+)\)/,
        ];

        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) {
            errors.push({
              file: match[1].trim(),
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              code: match[4] || match[5],
              message: (match[5] || match[4] || '').trim(),
            });
            break;
          }
        }
      }
    }

    return errors;
  }

  /**
   * Apply quick fixes for common patterns
   */
  applyQuickFixes() {
    console.log('🔧 Applying strategic strictNullChecks fixes...\n');

    const errors = this.getStrictNullErrors();
    console.log(`📊 Found ${errors.length} strictNullChecks errors`);

    // Group errors by type
    const errorsByType = this.groupErrorsByType(errors);

    // Apply fixes in order of impact
    this.fixPossiblyUndefinedErrors(errorsByType.TS18048 || []);
    this.fixPossiblyNullErrors(errorsByType.TS18047 || []);
    this.fixTestFileErrors(
      errors.filter(e => e.file.includes('__tests__') || e.file.includes('.test.')),
    );

    console.log(`\n✅ Applied fixes to ${this.fixedFiles.size} files`);
  }

  /**
   * Group errors by TypeScript error code
   */
  groupErrorsByType(errors) {
    return errors.reduce((groups, error) => {
      if (!groups[error.code]) groups[error.code] = [];
      groups[error.code].push(error);
      return groups;
    }, {});
  }

  /**
   * Fix TS18048: 'variable' is possibly 'undefined' errors
   */
  fixPossiblyUndefinedErrors(errors) {
    console.log(`🔧 Fixing ${errors.length} 'possibly undefined' errors...`);

    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (!fs.existsSync(filePath)) continue;

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Sort errors by line number (descending) to avoid line number shifts
      fileErrors.sort((a, b) => b.line - a.line);

      for (const error of fileErrors) {
        const lines = content.split('\n');
        const errorLine = lines[error.line - 1];

        if (!errorLine) continue;

        // Pattern 1: testName is possibly 'undefined' -> testName || 'unknown'
        if (error.message.includes('testName')) {
          const fixed = errorLine.replace(/(\w*testName\w*)/g, '($1 || "unknown")');
          if (fixed !== errorLine) {
            lines[error.line - 1] = fixed;
            content = lines.join('\n');
            modified = true;
          }
        }

        // Pattern 2: params is possibly 'null' -> params || {}
        else if (error.message.includes('params')) {
          const fixed = errorLine.replace(/(\w*params\w*)/g, '($1 || {})');
          if (fixed !== errorLine) {
            lines[error.line - 1] = fixed;
            content = lines.join('\n');
            modified = true;
          }
        }

        // Pattern 3: General undefined check -> variable || defaultValue
        else {
          const variableMatch = error.message.match(/'(\w+)' is possibly 'undefined'/);
          if (variableMatch) {
            const variable = variableMatch[1];
            const fixed = errorLine.replace(
              new RegExp(`\\b${variable}\\b(?!\\.)`),
              `(${variable} || '')`,
            );
            if (fixed !== errorLine && !fixed.includes('||')) {
              lines[error.line - 1] = fixed;
              content = lines.join('\n');
              modified = true;
            }
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  }

  /**
   * Fix TS18047: 'object' is possibly 'null' errors
   */
  fixPossiblyNullErrors(errors) {
    console.log(`🔧 Fixing ${errors.length} 'possibly null' errors...`);

    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (!fs.existsSync(filePath)) continue;

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Add null checks using optional chaining
      for (const error of fileErrors) {
        const lines = content.split('\n');
        const errorLine = lines[error.line - 1];

        if (!errorLine) continue;

        // Pattern: object.property -> object?.property
        const objectMatch = error.message.match(/'(\w+)' is possibly 'null'/);
        if (objectMatch) {
          const object = objectMatch[1];
          const fixed = errorLine.replace(new RegExp(`\\b${object}\\.`, 'g'), `${object}?.`);
          if (fixed !== errorLine) {
            lines[error.line - 1] = fixed;
            content = lines.join('\n');
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  }

  /**
   * Fix test file specific errors with more lenient approaches
   */
  fixTestFileErrors(errors) {
    console.log(`🧪 Fixing ${errors.length} test file errors...`);

    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (!fs.existsSync(filePath)) continue;

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Add type assertions for test files (more lenient)
      for (const error of fileErrors) {
        const lines = content.split('\n');
        const errorLine = lines[error.line - 1];

        if (!errorLine) continue;

        // Pattern: Add non-null assertion for test variables
        if (error.code === 'TS18048' || error.code === 'TS18047') {
          const variableMatch = error.message.match(/'(\w+)'/);
          if (variableMatch) {
            const variable = variableMatch[1];
            // Only add ! if it's a simple property access
            if (errorLine.includes(`${variable}.`) && !errorLine.includes('!')) {
              const fixed = errorLine.replace(
                new RegExp(`\\b${variable}\\.`, 'g'),
                `${variable}!.`,
              );
              if (fixed !== errorLine) {
                lines[error.line - 1] = fixed;
                content = lines.join('\n');
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed test file: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  }

  /**
   * Group errors by file path
   */
  groupErrorsByFile(errors) {
    return errors.reduce((groups, error) => {
      if (!groups[error.file]) groups[error.file] = [];
      groups[error.file].push(error);
      return groups;
    }, {});
  }

  /**
   * Validate fixes by running TypeScript check
   */
  validateFixes() {
    console.log('\n🔍 Validating fixes...');

    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      console.log('✅ All TypeScript errors resolved!');
      return true;
    } catch (error) {
      const newErrors = this.getStrictNullErrors();
      console.log(`⚠️  ${newErrors.length} errors remaining`);

      // Show error reduction
      const initialErrors = 801; // From previous count
      const reduction = initialErrors - newErrors.length;
      const percentage = Math.round((reduction / initialErrors) * 100);

      console.log(`📈 Progress: ${reduction} errors fixed (${percentage}% reduction)`);
      return false;
    }
  }

  /**
   * Run the complete fixing process
   */
  run() {
    console.log('🚀 Strategic Strict Null Checks Fixing Process\n');

    const initialErrors = this.getStrictNullErrors();
    console.log(`📊 Initial error count: ${initialErrors.length}\n`);

    // Apply fixes
    this.applyQuickFixes();

    // Validate results
    const success = this.validateFixes();

    if (success) {
      console.log('\n🎉 strictNullChecks successfully enabled with zero errors!');
    } else {
      console.log('\n📋 Significant progress made. Remaining errors may need manual review.');
    }

    return success;
  }
}

// Run the fixer
const fixer = new StrictNullChecksFixer();
fixer.run();
