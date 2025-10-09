#!/usr/bin/env node

/**
 * Mass Syntax Fixer - Phase 4
 * Fixes common mechanical syntax errors across the codebase
 * Focuses on safe, high-confidence replacements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MassSyntaxFixer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      patternsFixed: 0
    };
  }

  // Safe replacement patterns with high confidence
  getSafePatterns() {
    return [
      // Pattern 1: Malformed function signatures - missing param before colon
      {
        name: 'Function signature - missing param',
        regex: /export function (\w+)\(\s*([A-Z][\w<>\[\]|,\s]*)\s*\{\)/g,
        replace: (match, funcName, returnType) => {
          // Check if it looks like a return type (starts with uppercase)
          if (returnType && returnType[0] === returnType[0].toUpperCase()) {
            return `export function ${funcName}(): ${returnType} {`;
          }
          return match;
        }
      },

      // Pattern 2: Semicolon after statement in wrong place
      {
        name: 'Misplaced semicolons in object literals',
        regex: /^(\s+)(\w+):\s*([^,;\n]+);\s*$/gm,
        replace: (match, indent, key, value) => {
          // Don't change if it's actually a statement
          if (value.includes('return') || value.includes('if') || value.includes('const')) {
            return match;
          }
          return `${indent}${key}: ${value},`;
        }
      },

      // Pattern 3: Comma instead of semicolon after const/let
      {
        name: 'Comma after variable declarations',
        regex: /^(\s*)(const|let|var)\s+(\w+)[^,;\n]*,\s*$/gm,
        replace: (match, indent, keyword, varName) => {
          return match.replace(/,\s*$/, ';');
        }
      },

      // Pattern 4: Missing semicolon at end of statements
      {
        name: 'Missing semicolons',
        regex: /^(\s*)(const|let|var|return)\s+([^;\n]+)$/gm,
        replace: (match, indent, keyword, rest) => {
          // Don't add if it already has one or ends with {
          if (rest.trim().endsWith(';') || rest.trim().endsWith('{') || rest.trim().endsWith(',')) {
            return match;
          }
          return `${indent}${keyword} ${rest};`;
        }
      },

      // Pattern 5: Orphaned closing braces
      {
        name: 'Orphaned closing brace after comment',
        regex: /^(\s*)\/\/[^\n]*\n\s*\}\s*$/gm,
        replace: (match, indent) => {
          return match.replace(/\s*\}\s*$/, '');
        }
      },

      // Pattern 6: Return type colon with void wrapped in parens
      {
        name: 'Fix void return type',
        regex: /\):\s*\(void\)/g,
        replace: '): void'
      },

      // Pattern 7: Import statement with colon instead of from
      {
        name: 'Fix import statement',
        regex: /^import:\s*\{/gm,
        replace: 'import {'
      },

      // Pattern 8: Semicolon after filter end paren
      {
        name: 'Remove semicolon after closing paren in chains',
        regex: /\);\s*$/gm,
        replace: (match, offset, string) => {
          // Check if next non-whitespace char is a dot (method chaining)
          const afterMatch = string.slice(offset + match.length);
          if (afterMatch.match(/^\s*\./)) {
            return ')';
          }
          return match;
        }
      }
    ];
  }

  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fileModified = false;
      let patternsApplied = 0;

      const patterns = this.getSafePatterns();

      for (const pattern of patterns) {
        const beforeLength = content.length;

        if (typeof pattern.replace === 'function') {
          content = content.replace(pattern.regex, pattern.replace);
        } else {
          content = content.replace(pattern.regex, pattern.replace);
        }

        if (content !== originalContent) {
          patternsApplied++;
          fileModified = true;
        }
      }

      if (fileModified && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.stats.filesModified++;
        this.stats.patternsFixed += patternsApplied;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  getAllTypeScriptFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.getAllTypeScriptFiles(filePath, fileList);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  async execute(options = {}) {
    const { dryRun = false, verbose = false } = options;

    console.log('🔧 Mass Syntax Fixer - Phase 4');
    console.log('='.repeat(60));
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log('');

    // Get all TypeScript files
    const files = this.getAllTypeScriptFiles(this.srcDir);
    console.log(`Found ${files.length} TypeScript files`);
    console.log('');

    // Process each file
    for (const file of files) {
      this.stats.filesProcessed++;

      if (dryRun) {
        // Just read and check
        const content = fs.readFileSync(file, 'utf8');
        let wouldModify = false;

        for (const pattern of this.getSafePatterns()) {
          if (pattern.regex.test(content)) {
            wouldModify = true;
            break;
          }
        }

        if (wouldModify && verbose) {
          console.log(`Would modify: ${path.relative(this.projectRoot, file)}`);
        }
      } else {
        const modified = this.processFile(file);
        if (modified && verbose) {
          console.log(`Modified: ${path.relative(this.projectRoot, file)}`);
        }
      }

      if (this.stats.filesProcessed % 50 === 0) {
        console.log(`Progress: ${this.stats.filesProcessed}/${files.length} files...`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('Summary:');
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Files modified: ${this.stats.filesModified}`);
    console.log(`  Patterns applied: ${this.stats.patternsFixed}`);
    console.log('='.repeat(60));

    return this.stats;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Mass Syntax Fixer - Phase 4

Usage: node scripts/mass-syntax-fixer.js [options]

Options:
  --dry-run    Run without making changes
  --verbose    Show detailed output
  --help       Show this help
`);
    process.exit(0);
  }

  const fixer = new MassSyntaxFixer();
  fixer.execute({ dryRun, verbose })
    .then(stats => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = MassSyntaxFixer;
