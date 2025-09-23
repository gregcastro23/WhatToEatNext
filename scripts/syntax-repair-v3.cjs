#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPAIR_PATTERNS = [
  {
    name: 'for_loop_comma_to_semicolon',
    pattern: /for\s*\(\s*let\s+([a-zA-Z_]\w*)\s*=\s*([^,]+),\s*\1\s*([<>=!]+)\s*([^,]+),\s*\1(\+\+|--)\s*\)/g,
    fix: (match, varName, init, operator, condition, increment) =>
      `for (let ${varName} = ${init.trim()}; ${varName} ${operator} ${condition.trim()}; ${varName}${increment})`,
    description: 'Fix for-loop syntax: commas to semicolons'
  },
  {
    name: 'type_union_trailing_separator',
    pattern: /(\|\s*'[^']+'|\|\s*"[^"]+")\s*[;,]\s*$/gm,
    fix: (match, unionPart) => unionPart,
    description: 'Remove trailing ; or , from type union members'
  },
  {
    name: 'let_declaration_chain',
    pattern: /^(\s*let\s+[a-zA-Z_]\w*\s*=\s*[^,\n]+),\s*\n(\s*)let\s+/gm,
    fix: (match, firstLet, indent) => `${firstLet};\n${indent}let `,
    description: 'Fix let declaration chains: comma to semicolon before new let'
  },
  {
    name: 'interface_property_trailing_comma_before_close',
    pattern: /(\w+:\s*[^,;\n]+),\s*\n\s*\}/g,
    fix: (match, property) => `${property}\n}`,
    description: 'Remove trailing comma from last interface/type property'
  },
  {
    name: 'const_declaration_chain',
    pattern: /^(\s*const\s+[a-zA-Z_]\w*\s*=\s*[^,\n]+),\s*\n(\s*)const\s+/gm,
    fix: (match, firstConst, indent) => `${firstConst};\n${indent}const `,
    description: 'Fix const declaration chains: comma to semicolon before new const'
  },
  {
    name: 'double_separator_after_union',
    pattern: /(\|\s*'[^']+')\s*;\s*,/g,
    fix: (match, unionPart) => unionPart,
    description: 'Remove double separator (;,) after type union'
  },
  {
    name: 'type_union_semicolon_then_pipe',
    pattern: /('|"[^'"]+['"])\s*;\s*\n(\s*)\|/g,
    fix: (match, value, indent) => `${value}\n${indent}|`,
    description: 'Remove semicolon before type union pipe'
  }
];

class SyntaxRepairToolV3 {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      totalFixes: 0,
      fixesByPattern: {},
      errors: []
    };
  }

  repairFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let repairedContent = content;
      let fileFixes = 0;
      const fixDetails = [];

      for (const pattern of REPAIR_PATTERNS) {
        const matches = repairedContent.match(pattern.pattern);
        if (matches) {
          const fixCount = matches.length;

          if (this.verbose) {
            fixDetails.push(`${pattern.name}: ${fixCount}`);
          }

          repairedContent = repairedContent.replace(pattern.pattern, pattern.fix);
          fileFixes += fixCount;
          this.stats.fixesByPattern[pattern.name] = (this.stats.fixesByPattern[pattern.name] || 0) + fixCount;
        }
      }

      if (fileFixes > 0) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, repairedContent, 'utf8');
        }

        this.stats.filesModified++;
        this.stats.totalFixes += fileFixes;

        const prefix = this.dryRun ? '[DRY RUN]' : '✓';
        console.log(`  ${prefix} ${path.basename(filePath)}: ${fileFixes} fixes`);

        if (this.verbose && fixDetails.length > 0) {
          fixDetails.forEach(detail => console.log(`      - ${detail}`));
        }
      }

      this.stats.filesProcessed++;
      return fileFixes;
    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      console.error(`  ✗ Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this.processDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        this.repairFile(fullPath);
      }
    }
  }

  printReport() {
    console.log('\n📊 Syntax Repair V3 Report');
    console.log('===========================');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN (no changes made)' : 'LIVE (changes applied)'}`);
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files modified: ${this.stats.filesModified}`);
    console.log(`Total fixes ${this.dryRun ? 'identified' : 'applied'}: ${this.stats.totalFixes}`);
    console.log(`Errors: ${this.stats.errors.length}`);

    if (Object.keys(this.stats.fixesByPattern).length > 0) {
      console.log('\nFixes by pattern:');
      Object.entries(this.stats.fixesByPattern)
        .sort(([, a], [, b]) => b - a)
        .forEach(([pattern, count]) => {
          const desc = REPAIR_PATTERNS.find(p => p.name === pattern)?.description || pattern;
          console.log(`  ${pattern}: ${count}`);
          console.log(`    └─ ${desc}`);
        });
    }

    if (this.stats.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.stats.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const targetPath = args.find(arg => !arg.startsWith('--')) || './src';
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

console.log(`🔧 TypeScript Syntax Repair Tool V3`);
console.log(`Target: ${targetPath}`);
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

const repairer = new SyntaxRepairToolV3({ dryRun, verbose });

// Check if target is a file or directory
const stats = fs.statSync(targetPath);
if (stats.isFile()) {
  repairer.repairFile(targetPath);
} else {
  repairer.processDirectory(targetPath);
}

repairer.printReport();

console.log(`\n✨ ${dryRun ? 'Analysis' : 'Repair'} complete!`);