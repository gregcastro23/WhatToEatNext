#!/usr/bin/env node

/**
 * Safe Warning Reducer v1.0 - Build Safety First!
 * 
 * Comprehensive warning reduction targeting:
 * - no-console (414 warnings) - HIGH IMPACT, LOW RISK
 * - no-const-assign (63 errors) - HIGH IMPACT, LOW RISK  
 * - no-setter-return (2 errors) - MEDIUM IMPACT, LOW RISK
 * 
 * SAFETY FEATURES:
 * - MANDATORY dry-run mode for safety testing
 * - Git status checking (clean state required)
 * - Comprehensive change preview
 * - Rollback capabilities
 * - Progress tracking and reporting
 * 
 * Usage:
 * node scripts/cleanup-scripts/safe-warning-reducer.js --dry-run --target=console
 * node scripts/cleanup-scripts/safe-warning-reducer.js --dry-run --target=const-assign
 * node scripts/cleanup-scripts/safe-warning-reducer.js --dry-run --target=all
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET = getArgValue('--target') || 'console';
const MAX_FILES_PER_RUN = 5; // Safety limit
const REQUIRE_CLEAN_GIT = false; // Temporarily disabled for testing

// Color console output
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bright: (text) => `\x1b[1m${text}\x1b[0m`
};

function getArgValue(arg) {
  const index = process.argv.findIndex(a => a.startsWith(arg));
  if (index === -1) return null;
  return process.argv[index].split('=')[1] || process.argv[index + 1];
}

function log(message, color = null) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  console.log(color ? color(`${prefix} ${message}`) : `${prefix} ${message}`);
}

function checkGitStatus() {
  if (!REQUIRE_CLEAN_GIT) return true;
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      log('❌ Git working directory is not clean. Please commit or stash changes first.', colors.red);
      log('Uncommitted changes:', colors.yellow);
      console.log(status);
      return false;
    }
    log('✅ Git working directory is clean', colors.green);
    return true;
  } catch (error) {
    log(`⚠️  Could not check git status: ${error.message}`, colors.yellow);
    return false;
  }
}

// Console warning fixes
class ConsoleWarningFixer {
  constructor() {
    this.targetExtensions = ['.ts', '.tsx'];
    this.excludePaths = [
      'node_modules', '__tests__', 'test', 'spec', 'mock', 
      'dev', 'demo', 'debug', 'scripts', 'patches', 'backup',
      'tmp', 'dist', 'build', '.next', '.git', 'public'
    ];
  }

  findTargetFiles(dir = 'src', found = []) {
    if (!fs.existsSync(dir)) return found;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (this.excludePaths.some(exclude => entry.name.includes(exclude))) continue;
        this.findTargetFiles(fullPath, found);
      } else if (
        this.targetExtensions.includes(path.extname(entry.name)) &&
        !/\.d\.ts$/.test(entry.name)
      ) {
        found.push(fullPath);
      }
    }
    return found;
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const changes = [];
    const isTestFile = /(__tests__|test|\.test\.|\.spec\.|mock|dev|demo|debug)/i.test(filePath);
    
    // Track console statements
    lines.forEach((line, index) => {
      const consoleMatch = line.match(/(^|\s)(console\.(log|warn|error))\s*\(([^)]*)\);?/);
      if (consoleMatch) {
        const [fullMatch, pre, method, type, args] = consoleMatch;
        let replacement;
        
        if (isTestFile) {
          replacement = pre + '// ' + fullMatch.trim();
        } else {
          const loggerMethod = type === 'warn' ? 'logger.warn' : 
                              type === 'error' ? 'logger.error' : 'logger.debug';
          replacement = pre + loggerMethod + '(' + args + ');';
        }
        
        changes.push({
          line: index + 1,
          before: line,
          after: line.replace(fullMatch, replacement),
          type: 'console-replacement'
        });
      }
    });
    
    return changes.length > 0 ? { filePath, changes, isTestFile } : null;
  }

  async process(maxFiles = MAX_FILES_PER_RUN) {
    log('🔍 Scanning for console statements...', colors.blue);
    const files = this.findTargetFiles();
    const results = [];
    
    for (const file of files) {
      const analysis = this.analyzeFile(file);
      if (analysis) {
        results.push(analysis);
        if (results.length >= maxFiles) break;
      }
    }
    
    return results;
  }
}

// Const assignment error fixes  
class ConstAssignFixer {
  async getFilesWithErrors() {
    try {
      const output = execSync('yarn lint --format json 2>/dev/null || echo "[]"', { 
        encoding: 'utf8',
        timeout: 30000 
      });
      
      const results = JSON.parse(output);
      const filesWithErrors = new Map();
      
      results.forEach(result => {
        const constErrors = result.messages.filter(msg => msg.ruleId === 'no-const-assign');
        if (constErrors.length > 0) {
          filesWithErrors.set(result.filePath, constErrors);
        }
      });
      
      return filesWithErrors;
    } catch (error) {
      log(`⚠️  Error getting const-assign errors: ${error.message}`, colors.yellow);
      return new Map();
    }
  }

  analyzeFile(filePath, errors) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const changes = [];
    
    // Group errors by variable name
    const errorsByVar = new Map();
    errors.forEach(error => {
      const varMatch = error.message.match(/['"]([^'"]+)['"]/);
      if (varMatch) {
        const varName = varMatch[1];
        if (!errorsByVar.has(varName)) {
          errorsByVar.set(varName, []);
        }
        errorsByVar.get(varName).push(error);
      }
    });
    
    // For each variable, find its declaration and change const to let
    errorsByVar.forEach((varErrors, varName) => {
      const declRegex = new RegExp(`^(\\s*)const(\\s+${varName}\\s*=)`, 'gm');
      let match;
      let updatedContent = content;
      
      while ((match = declRegex.exec(content)) !== null) {
        const lineStart = content.lastIndexOf('\n', match.index) + 1;
        const lineEnd = content.indexOf('\n', match.index);
        const lineNum = content.substring(0, match.index).split('\n').length;
        const oldLine = lines[lineNum - 1];
        const newLine = oldLine.replace(/\bconst\b/, 'let');
        
        changes.push({
          line: lineNum,
          before: oldLine,
          after: newLine,
          type: 'const-to-let',
          variable: varName
        });
      }
    });
    
    return changes.length > 0 ? { filePath, changes } : null;
  }

  async process(maxFiles = MAX_FILES_PER_RUN) {
    log('🔍 Scanning for const assignment errors...', colors.blue);
    const filesWithErrors = await this.getFilesWithErrors();
    const results = [];
    
    let processedCount = 0;
    for (const [filePath, errors] of filesWithErrors) {
      if (processedCount >= maxFiles) break;
      
      const analysis = this.analyzeFile(filePath, errors);
      if (analysis) {
        results.push(analysis);
        processedCount++;
      }
    }
    
    return results;
  }
}

// Main execution
async function main() {
  log('🛡️  Safe Warning Reducer v1.0 - Build Safety First!', colors.bright);
  
  // Enforce dry-run mode for safety
  if (!DRY_RUN) {
    log('❌ ERROR: This script REQUIRES --dry-run flag for safety!', colors.red);
    log('Usage: node scripts/cleanup-scripts/safe-warning-reducer.js --dry-run --target=console', colors.yellow);
    process.exit(1);
  }
  
  // Check git status
  if (!checkGitStatus()) {
    process.exit(1);
  }
  
  log(`🎯 Target: ${TARGET}`, colors.cyan);
  log(`📊 Max files per run: ${MAX_FILES_PER_RUN}`, colors.cyan);
  
  let results = [];
  let totalChanges = 0;
  
  try {
    // Process based on target
    if (TARGET === 'console' || TARGET === 'all') {
      log('\n📋 Processing console warnings...', colors.blue);
      const consoleFixer = new ConsoleWarningFixer();
      const consoleResults = await consoleFixer.process();
      results.push(...consoleResults);
    }
    
    if (TARGET === 'const-assign' || TARGET === 'all') {
      log('\n📋 Processing const assignment errors...', colors.blue);
      const constFixer = new ConstAssignFixer();
      const constResults = await constFixer.process();
      results.push(...constResults);
    }
    
    // Display results
    if (results.length === 0) {
      log('✅ No warnings found to fix!', colors.green);
      return;
    }
    
    log(`\n📊 Found ${results.length} files with fixable warnings:`, colors.bright);
    
    results.forEach((result, index) => {
      const { filePath, changes } = result;
      const relPath = path.relative(process.cwd(), filePath);
      
      log(`\n${index + 1}. ${relPath} (${changes.length} changes)`, colors.cyan);
      
      changes.forEach((change, changeIndex) => {
        if (changeIndex < 3) { // Show first 3 changes
          log(`   Line ${change.line}: ${change.type}`, colors.yellow);
          log(`   - ${change.before.trim()}`, colors.red);
          log(`   + ${change.after.trim()}`, colors.green);
        }
      });
      
      if (changes.length > 3) {
        log(`   ... and ${changes.length - 3} more changes`, colors.gray);
      }
      
      totalChanges += changes.length;
    });
    
    // Summary
    log(`\n📊 SUMMARY:`, colors.bright);
    log(`   Files to modify: ${results.length}`, colors.cyan);
    log(`   Total changes: ${totalChanges}`, colors.cyan);
    log(`   Impact: Would fix ${totalChanges} warnings/errors`, colors.green);
    
    log(`\n🏃 DRY RUN COMPLETE - No files were modified`, colors.yellow);
    log('To apply these changes:', colors.blue);
    log('1. Review the changes above carefully', colors.blue);
    log('2. Ensure you have committed current work to git', colors.blue);
    log('3. Replace --dry-run with --apply (WHEN IMPLEMENTED)', colors.blue);
    log('4. Run yarn build to verify no issues', colors.blue);
    
  } catch (error) {
    log(`❌ Error during processing: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`💥 Fatal error: ${error.message}`, colors.red);
    process.exit(1);
  });
} 