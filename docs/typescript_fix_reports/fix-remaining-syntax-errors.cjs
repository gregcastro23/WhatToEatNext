#!/usr/bin/env node

/**
 * Fix Remaining Syntax Errors
 *
 * Comprehensive fix for all remaining TypeScript syntax errors
 * that were introduced during previous cleanup attempts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

class RemainingSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.fixedIssues = 0;
  }

  async execute() {
    console.log('🔧 Fixing remaining syntax errors...');

    // Get all TypeScript/TSX files
    const files = glob.sync('src/**/*.{ts,tsx}', {
      ignore: ['node_modules/**']
    });

    for (const file of files) {
      await this.fixFile(file);
    }

    console.log(`✅ Fixed ${this.fixedIssues} syntax issues in ${this.fixedFiles} files`);
  }

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = content;
      let fileFixCount = 0;

      // Fix malformed JSX attributes (semicolon instead of closing brace)
      const jsxAttrFix = modified.replace(
        /(\w+)=\{([^}]+)\};/g,
        (match, attr, value) => {
          fileFixCount++;
          return `${attr}={${value}}`;
        }
      );
      if (jsxAttrFix !== modified) {
        modified = jsxAttrFix;
      }

      // Fix malformed array property access (.property.[index])
      const arrayAccessFix = modified.replace(
        /(\w+)\.(\w+)\.\[(\d+)\]/g,
        (match, obj, prop, index) => {
          fileFixCount++;
          return `${obj}.${prop}[${index}]`;
        }
      );
      if (arrayAccessFix !== modified) {
        modified = arrayAccessFix;
      }

      // Fix malformed arrow functions (=> without proper syntax)
      const arrowFunctionFix = modified.replace(
        /(\w+)\s*=>\s*;/g,
        (match, param) => {
          fileFixCount++;
          return `${param} =>`;
        }
      );
      if (arrowFunctionFix !== modified) {
        modified = arrowFunctionFix;
      }

      // Fix malformed function parameters (: any : any)
      const parameterFix = modified.replace(
        /\(\s*:\s*any\s*:\s*any\s*\{([^}]+)\}\s*\)/g,
        (match, params) => {
          fileFixCount++;
          return `({${params}})`;
        }
      );
      if (parameterFix !== modified) {
        modified = parameterFix;
      }

      // Fix malformed catch blocks (catch (error): any)
      const catchBlockFix = modified.replace(
        /catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*{/g,
        (match, errorParam) => {
          fileFixCount++;
          return `catch (${errorParam}: any) {`;
        }
      );
      if (catchBlockFix !== modified) {
        modified = catchBlockFix;
      }

      // Fix malformed array literals with type annotations
      const arrayLiteralFix = modified.replace(
        /\[([^[\]]+):\s*any(?:\s*,\s*[^[\]]+:\s*any)*\]/g,
        (match) => {
          fileFixCount++;
          // Extract the values and remove type annotations
          const values = match.replace(/:\s*any/g, '').replace(/[\[\]]/g, '');
          return `[${values}]`;
        }
      );
      if (arrayLiteralFix !== modified) {
        modified = arrayLiteralFix;
      }

      // Fix malformed Object.entries calls
      const objectEntriesFix = modified.replace(
        /Object\.entries\([^)]+\s*\|\|\s*\[\]\s*\)\.forEach\(\(\[\s*([^:]+)\s*:\s*any\s*,\s*([^:]+)\s*\]\s*:\s*any\)\s*=>/g,
        (match, key, value, offset, string) => {
          // Extract the object being iterated
          const beforeMatch = string.substring(0, offset);
          const objectMatch = beforeMatch.match(/Object\.entries\(([^)]+)\s*\|\|\s*\[\]\s*\)$/);
          if (objectMatch) {
            fileFixCount++;
            return `Object.entries(${objectMatch[1]} || {}).forEach(([${key}, ${value}]: [string, any]) =>`;
          }
          return match;
        }
      );
      if (objectEntriesFix !== modified) {
        modified = objectEntriesFix;
      }

      // Fix malformed date strings (T12: 0, 0:00Z)
      const dateStringFix = modified.replace(
        /'(\d{4}-\d{2}-\d{2}T\d{2}):\s*(\d+)\s*,\s*(\d+):(\d{2}Z)'/g,
        (match, datePart, hour, minute, endPart) => {
          fileFixCount++;
          return `'${datePart}:${hour.padStart(2, '0')}:${minute.padStart(2, '0')}${endPart}'`;
        }
      );
      if (dateStringFix !== modified) {
        modified = dateStringFix;
      }

      // Fix malformed regex patterns (replace(/\s+/g '-'))
      const regexFix = modified.replace(
        /replace\(\/\\s\+\/g\s+'-'\)/g,
        (match) => {
          fileFixCount++;
          return "replace(/\\s+/g, '-')";
        }
      );
      if (regexFix !== modified) {
        modified = regexFix;
      }

      // Fix malformed property access with commas (stdou, t)
      const propertyFix = modified.replace(
        /(\w+),\s*(\w+)/g,
        (match, part1, part2, offset, string) => {
          // Only fix if it looks like a malformed property name
          if (part1.length <= 6 && part2.length <= 2) {
            fileFixCount++;
            return `${part1}${part2}`;
          }
          return match;
        }
      );
      if (propertyFix !== modified) {
        modified = propertyFix;
      }

      // Fix void statements that should be return statements
      const voidFix = modified.replace(
        /void\s+(prev\.includes\([^)]+\))/g,
        (match, expression) => {
          fileFixCount++;
          return expression;
        }
      );
      if (voidFix !== modified) {
        modified = voidFix;
      }

      // Fix missing closing braces in JSX
      const jsxBraceFix = modified.replace(
        /data-testid=\{`([^`]+)`$/gm,
        (match, content) => {
          fileFixCount++;
          return `data-testid={\`${content}\`}`;
        }
      );
      if (jsxBraceFix !== modified) {
        modified = jsxBraceFix;
      }

      if (fileFixCount > 0) {
        fs.writeFileSync(filePath, modified);
        this.fixedFiles++;
        this.fixedIssues += fileFixCount;
        console.log(`  Fixed ${fileFixCount} issues in ${filePath}`);
      }

    } catch (error) {
      console.warn(`  Warning: Could not process ${filePath}: ${error.message}`);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new RemainingSyntaxFixer();

  fixer.execute()
    .then(() => {
      console.log('🎉 Remaining syntax fixing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Syntax fixing failed:', error.message);
      process.exit(1);
    });
}

module.exports = RemainingSyntaxFixer;
