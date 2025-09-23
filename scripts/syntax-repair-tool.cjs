#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPAIR_PATTERNS = [
  {
    name: 'concatenated_numeric_properties',
    pattern: /:\s*(\d+\.?\d*)\s*([A-Z][A-Za-z0-9_]+)\s*:/g,
    fix: (match, num, prop) => `: ${num},\n    ${prop}:`,
    description: 'Fix concatenated numeric properties (e.g., "niacin: 0.5B6: 0.38")'
  },
  {
    name: 'missing_comma_rda_comment',
    pattern: /:\s*(\d+\.?\d*),?\s*\/\/\s*([^,\n]+),?\s*\n\s*([A-Z][a-z_]+):/g,
    fix: (match, num, comment, nextProp) => `: ${num}, // ${comment}\n    ${nextProp}:`,
    description: 'Fix missing commas after RDA comments'
  },
  {
    name: 'missing_comma_before_brace',
    pattern: /:\s*([0-9.]+|"[^"]*"|'[^']*'|true|false)\s*\n(\s+)\}/g,
    fix: (match, value, indent) => `: ${value},\n${indent}}`,
    description: 'Add missing comma before closing brace'
  },
  {
    name: 'object_literal_semicolon',
    pattern: /=\s*\{;/g,
    fix: () => '= {',
    description: 'Fix object literal with semicolon (= {;)'
  },
  {
    name: 'array_literal_semicolon',
    pattern: /=\s*\[;/g,
    fix: () => '= [',
    description: 'Fix array literal with semicolon (= [;)'
  },
  {
    name: 'function_param_semicolon',
    pattern: /\(\s*;/g,
    fix: () => '(',
    description: 'Fix function parameter with leading semicolon ((;)'
  },
  {
    name: 'missing_object_property_comma',
    pattern: /:\s*(\{[^}]+\})\s*\n(\s+)([a-zA-Z_][a-zA-Z0-9_]*):/g,
    fix: (match, obj, indent, nextProp) => `: ${obj},\n${indent}${nextProp}:`,
    description: 'Add missing comma after object property value'
  },
  {
    name: 'missing_array_property_comma',
    pattern: /:\s*(\[[^\]]+\])\s*\n(\s+)([a-zA-Z_][a-zA-Z0-9_]*):/g,
    fix: (match, arr, indent, nextProp) => `: ${arr},\n${indent}${nextProp}:`,
    description: 'Add missing comma after array property value'
  }
];

class SyntaxRepairTool {
  constructor(dryRun = false, verbose = false) {
    this.dryRun = dryRun;
    this.verbose = verbose;
  }

  repairFile(filePath) {
    const result = {
      file: filePath,
      patterns: [],
      fixCount: 0,
      success: false
    };

    try {
      if (!fs.existsSync(filePath)) {
        result.error = 'File not found';
        return result;
      }

      let content = fs.readFileSync(filePath, 'utf-8');
      let totalFixes = 0;

      for (const pattern of REPAIR_PATTERNS) {
        const matches = content.match(pattern.pattern);
        if (matches && matches.length > 0) {
          content = content.replace(pattern.pattern, pattern.fix);
          const fixCount = matches.length;
          totalFixes += fixCount;
          result.patterns.push(`${pattern.name} (${fixCount} fixes)`);

          if (this.verbose) {
            console.log(`  ✓ ${pattern.description}: ${fixCount} fixes`);
          }
        }
      }

      result.fixCount = totalFixes;

      if (totalFixes > 0 && !this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        result.success = true;
      } else if (totalFixes > 0) {
        result.success = true;
      } else {
        result.success = true;
      }

      return result;
    } catch (error) {
      result.error = error.message;
      return result;
    }
  }

  repairDirectory(dirPath, filePattern = /\.(ts|tsx)$/) {
    const results = [];

    const processDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          processDirectory(fullPath);
        } else if (entry.isFile() && filePattern.test(entry.name)) {
          const result = this.repairFile(fullPath);
          if (result.fixCount > 0 || result.error) {
            results.push(result);
          }
        }
      }
    };

    processDirectory(dirPath);
    return results;
  }

  repairFileList(filePaths) {
    return filePaths.map(filePath => this.repairFile(filePath));
  }

  printSummary(results) {
    const successful = results.filter(r => r.success && r.fixCount > 0);
    const failed = results.filter(r => r.error);
    const totalFixes = results.reduce((sum, r) => sum + r.fixCount, 0);

    console.log('\n' + '='.repeat(60));
    console.log('SYNTAX REPAIR SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files processed: ${results.length}`);
    console.log(`Files with fixes: ${successful.length}`);
    console.log(`Total fixes applied: ${totalFixes}`);
    console.log(`Failed: ${failed.length}`);

    if (this.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No files were modified');
    } else {
      console.log('\n✅ Files have been updated');
    }

    if (successful.length > 0) {
      console.log('\n📊 Top files by fix count:');
      successful
        .sort((a, b) => b.fixCount - a.fixCount)
        .slice(0, 10)
        .forEach(r => {
          console.log(`  ${r.fixCount.toString().padStart(4)} fixes - ${r.file}`);
        });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed files:');
      failed.forEach(r => {
        console.log(`  ${r.file}: ${r.error}`);
      });
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const targetPath = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-')) || 'src';

  const tool = new SyntaxRepairTool(dryRun, verbose);

  console.log('🔧 TypeScript Syntax Repair Tool');
  console.log(`Target: ${targetPath}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  let results;

  if (fs.statSync(targetPath).isDirectory()) {
    results = tool.repairDirectory(targetPath);
  } else {
    results = tool.repairFileList([targetPath]);
  }

  tool.printSummary(results);

  const failed = results.filter(r => r.error);
  process.exit(failed.length > 0 ? 1 : 0);
}

module.exports = { SyntaxRepairTool };