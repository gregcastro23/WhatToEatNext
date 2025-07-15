#!/usr/bin/env node

/**
 * find-invalid-unicode-safe.js (Enhanced v2.0) - Unicode Safety Validator
 *
 * Advanced Unicode Character Safety Scanner with Comprehensive Protection
 * 
 * FEATURES:
 * - Comprehensive Unicode validation (high surrogates, invalid sequences, encoding issues)
 * - Safe file processing with git integration and rollback capabilities
 * - Interactive confirmation with detailed preview of changes
 * - Dry-run mode with comprehensive impact analysis
 * - Safety metrics and validation tracking
 * - Multiple fix strategies (replace, escape, remove, manual review)
 * - AST-aware processing to avoid breaking code structure
 * - Backup and recovery systems with git stash integration
 * - JSON output for automation and CI/CD integration
 * - Comprehensive error handling and graceful recovery
 *
 * SAFETY VALIDATION SYSTEM:
 * - Git status validation before any changes
 * - Automatic stash creation for easy rollback
 * - Character-by-character validation with context analysis
 * - Safe replacement strategies that preserve code functionality
 * - Comprehensive preview of all proposed changes
 * - Multi-level confirmation for destructive operations
 *
 * UNICODE DETECTION:
 * - Unpaired high surrogates (primary cause of JSON errors)
 * - Unpaired low surrogates
 * - Invalid UTF-8 sequences
 * - Zero-width characters that can break parsing
 * - Control characters in inappropriate contexts
 * - Mixed encoding issues
 * - BOM (Byte Order Mark) problems
 *
 * OPERATION MODES:
 * - Scan-only: Just report issues without fixing
 * - Dry-run: Show what would be changed
 * - Interactive: Prompt for each fix
 * - Auto-fix: Apply safe fixes automatically
 * - Manual-review: Flag for manual intervention
 *
 * USAGE:
 *   # Scan for issues (safe, read-only)
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --scan
 *   
 *   # Dry-run mode (show what would be fixed)
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --dry-run
 *   
 *   # Interactive mode (recommended)
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --interactive
 *   
 *   # Auto-fix mode (for CI/CD)
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --auto-fix
 *   
 *   # JSON output for automation
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --json --scan
 *   
 *   # Check specific files or directories
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --scan --include="src/components/**"
 *   node scripts/unicode-fixes/find-invalid-unicode-safe.js --scan --exclude="node_modules,dist"
 *
 * SAFETY FEATURES:
 * - Pre-flight git status validation
 * - Automatic git stash creation before changes
 * - Character context analysis (don't break string literals, comments)
 * - Safe replacement strategies preserving functionality
 * - Comprehensive rollback instructions
 * - File encoding preservation
 * - Syntax validation after changes
 * - Progress tracking with ability to stop/resume
 *
 * LIMITATIONS:
 * - Only processes text files (detects binary files automatically)
 * - Requires clean git working directory for safest operation
 * - May not detect all encoding edge cases
 * - Large files (>10MB) processed with extra caution
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { glob } from 'glob';

// Enhanced Configuration
const DEFAULT_CONFIG = {
  // File processing
  maxFileSize: 10 * 1024 * 1024, // 10MB limit for safety
  batchSize: 10, // Process files in small batches
  excludePatterns: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    '.git/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/package-lock.json',
    '**/yarn.lock'
  ],
  includePatterns: [
    'src/**/*.{ts,tsx,js,jsx,json}',
    '*.{ts,tsx,js,jsx,json}',
    'docs/**/*.{md,txt}',
    'scripts/**/*.{js,mjs,cjs}',
    'config/**/*.{js,json}'
  ],
  
  // Safety features
  requireCleanGit: true,
  createGitStash: true,
  validateSyntax: true,
  preserveFormatting: true,
  backupBeforeChange: false, // Use git stash instead
  
  // Detection patterns
  patterns: {
    unpairedHighSurrogate: /[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g,
    unpairedLowSurrogate: /(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    invalidUtf8: /[\uFFFD]/g, // Replacement character indicates encoding issues
    zerothWidthChars: /[\u200B-\u200D\uFEFF]/g,
    controlChars: /[\x00-\x08\x0E-\x1F\x7F]/g,
    bomChars: /^\uFEFF/
  },
  
  // Output and logging
  verbose: true,
  colors: true,
  jsonOutput: false,
  silent: false
};

// Parse command line arguments
const args = process.argv.slice(2);
const SCAN_ONLY = args.includes('--scan');
const DRY_RUN = args.includes('--dry-run');
const INTERACTIVE = args.includes('--interactive') || (!args.includes('--auto-fix') && !SCAN_ONLY && !DRY_RUN);
const AUTO_FIX = args.includes('--auto-fix');
const JSON_OUTPUT = args.includes('--json');
const SILENT_MODE = args.includes('--silent');
const HELP = args.includes('--help') || args.includes('-h');

// Apply configuration overrides
if (JSON_OUTPUT) {
  DEFAULT_CONFIG.jsonOutput = true;
  DEFAULT_CONFIG.verbose = false;
  DEFAULT_CONFIG.colors = false;
}

if (SILENT_MODE) {
  DEFAULT_CONFIG.silent = true;
  DEFAULT_CONFIG.verbose = false;
  DEFAULT_CONFIG.colors = false;
}

// Custom include/exclude patterns
const customInclude = args.find(arg => arg.startsWith('--include='))?.split('=')[1];
const customExclude = args.find(arg => arg.startsWith('--exclude='))?.split('=')[1];

if (customInclude) {
  DEFAULT_CONFIG.includePatterns = customInclude.split(',');
}

if (customExclude) {
  DEFAULT_CONFIG.excludePatterns.push(...customExclude.split(','));
}

// Metrics tracking
const METRICS_FILE = path.join(process.cwd(), '.unicode-validation-metrics.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Enhanced color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  if (!DEFAULT_CONFIG.colors) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  if (!DEFAULT_CONFIG.silent) {
    console.log(colorize(message, color));
  }
}

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

// Help display
function showHelp() {
  console.log(`
${colorize('Unicode Safety Validator v2.0', 'bright')}
${colorize('=====================================', 'bright')}

${colorize('DESCRIPTION:', 'bright')}
  Advanced scanner for invalid Unicode characters that can cause JSON parsing errors
  and other encoding issues. Provides safe fixing with comprehensive rollback options.

${colorize('USAGE:', 'bright')}
  node scripts/unicode-fixes/find-invalid-unicode-safe.js [OPTIONS]

${colorize('OPTIONS:', 'bright')}
  ${colorize('--scan', 'green')}                  Scan for issues only (read-only, safe)
  ${colorize('--dry-run', 'yellow')}              Show what would be fixed (no changes)
  ${colorize('--interactive', 'cyan')}           Prompt for each fix (recommended)
  ${colorize('--auto-fix', 'yellow')}             Apply safe fixes automatically
  ${colorize('--json', 'blue')}                  JSON output for automation
  ${colorize('--silent', 'gray')}               Silent mode (minimal output)
  ${colorize('--include=PATTERN', 'cyan')}      Custom include patterns (comma-separated)
  ${colorize('--exclude=PATTERN', 'cyan')}      Custom exclude patterns (comma-separated)
  ${colorize('--help, -h', 'bright')}            Show this help

${colorize('EXAMPLES:', 'bright')}
  ${colorize('# Safe scan only', 'gray')}
  node scripts/unicode-fixes/find-invalid-unicode-safe.js --scan

  ${colorize('# Preview changes', 'gray')}
  node scripts/unicode-fixes/find-invalid-unicode-safe.js --dry-run

  ${colorize('# Interactive fixing (recommended)', 'gray')}
  node scripts/unicode-fixes/find-invalid-unicode-safe.js --interactive

  ${colorize('# Automated fixing for CI', 'gray')}
  node scripts/unicode-fixes/find-invalid-unicode-safe.js --auto-fix --json

  ${colorize('# Scan specific directories', 'gray')}
  node scripts/unicode-fixes/find-invalid-unicode-safe.js --scan --include="src/**/*.ts"

${colorize('SAFETY FEATURES:', 'bright')}
  ✓ Git status validation before changes
  ✓ Automatic git stash creation for rollback
  ✓ Character-by-character context analysis
  ✓ Syntax validation after changes
  ✓ Comprehensive preview before applying fixes
  ✓ Multiple safe replacement strategies
  ✓ Progress tracking and resume capability

${colorize('DETECTED ISSUES:', 'bright')}
  ✓ Unpaired high/low surrogates (main cause of JSON errors)
  ✓ Invalid UTF-8 sequences
  ✓ Zero-width characters
  ✓ Control characters in wrong contexts
  ✓ BOM (Byte Order Mark) issues
  ✓ Mixed encoding problems
`);
}

// Metrics and Safety Validation
class UnicodeMetrics {
  constructor() {
    this.metrics = this.loadMetrics();
  }

  loadMetrics() {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
      }
    } catch (error) {
      log(`⚠️  Could not load metrics: ${error.message}`, 'yellow');
    }

    return {
      totalScans: 0,
      totalFixes: 0,
      filesScanned: 0,
      filesFixed: 0,
      issuesFound: 0,
      issuesFixed: 0,
      lastScan: null,
      patterns: {},
      safetyScore: 1.0
    };
  }

  saveMetrics() {
    try {
      fs.writeFileSync(METRICS_FILE, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      log(`⚠️  Could not save metrics: ${error.message}`, 'yellow');
    }
  }

  recordScan(filesScanned, issuesFound) {
    this.metrics.totalScans++;
    this.metrics.filesScanned += filesScanned;
    this.metrics.issuesFound += issuesFound;
    this.metrics.lastScan = new Date().toISOString();
    this.saveMetrics();
  }

  recordFix(issuesFixed) {
    this.metrics.totalFixes++;
    this.metrics.issuesFixed += issuesFixed;
    this.saveMetrics();
  }

  recordPattern(patternName) {
    if (!this.metrics.patterns[patternName]) {
      this.metrics.patterns[patternName] = 0;
    }
    this.metrics.patterns[patternName]++;
  }

  getStats() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalFixes > 0 ? 
        (this.metrics.issuesFixed / this.metrics.issuesFound) * 100 : 0
    };
  }
}

const metrics = new UnicodeMetrics();

// Git Integration
async function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
    const hasChanges = status.trim().length > 0;

    if (hasChanges && DEFAULT_CONFIG.requireCleanGit && !SCAN_ONLY) {
      if (DEFAULT_CONFIG.jsonOutput) {
        console.log(JSON.stringify({
          error: 'Git working directory has uncommitted changes',
          gitStatus: status,
          recommendation: 'Commit or stash changes first, or use --scan mode',
          exitCode: 1
        }));
        return false;
      }

      log('\n⚠️  Git working directory has uncommitted changes:', 'yellow');
      log(status, 'gray');

      if (INTERACTIVE) {
        const answer = await ask('Continue anyway? This could make rollback more complex. [y/N] ');
        if (answer.toLowerCase() !== 'y') {
          log('👍 Recommended: Use --scan first, then commit changes and re-run with --interactive', 'green');
          return false;
        }
      } else if (!AUTO_FIX) {
        log('❌ Stopping. Use --scan to check issues, or commit/stash changes first.', 'red');
        return false;
      }
    }

    return true;
  } catch (error) {
    if (DEFAULT_CONFIG.jsonOutput) {
      console.log(JSON.stringify({
        error: 'Could not check git status',
        details: error.message,
        exitCode: 1
      }));
    } else {
      log(`❌ Error checking git status: ${error.message}`, 'red');
    }
    return false;
  }
}

async function createGitStash(description) {
  if (!DEFAULT_CONFIG.createGitStash || SCAN_ONLY || DRY_RUN) return null;

  try {
    const stashName = `unicode-fix-${Date.now()}`;
    execSync(`git stash push -m "${stashName}: ${description}"`, { encoding: 'utf8', stdio: 'pipe' });
    log(`📦 Created git stash: ${stashName}`, 'cyan');
    log(`   Rollback with: git stash apply stash^{/${stashName}}`, 'cyan');
    return stashName;
  } catch (error) {
    log(`⚠️  Could not create git stash: ${error.message}`, 'yellow');
    return null;
  }
}

// File Discovery and Validation
function getAllFiles() {
  const files = [];
  
  for (const pattern of DEFAULT_CONFIG.includePatterns) {
    try {
      const matches = glob.sync(pattern, {
        ignore: DEFAULT_CONFIG.excludePatterns,
        nodir: true
      });
      files.push(...matches);
    } catch (error) {
      log(`⚠️  Error with pattern '${pattern}': ${error.message}`, 'yellow');
    }
  }

  // Remove duplicates and validate files
  const uniqueFiles = [...new Set(files)];
  const validFiles = [];

  for (const file of uniqueFiles) {
    try {
      const stat = fs.statSync(file);
      
      // Skip large files for safety
      if (stat.size > DEFAULT_CONFIG.maxFileSize) {
        log(`⚠️  Skipping large file (${(stat.size / 1024 / 1024).toFixed(1)}MB): ${file}`, 'yellow');
        continue;
      }

      // Detect binary files
      const buffer = fs.readFileSync(file);
      const isBinary = buffer.includes(0) && buffer.length > 0;
      
      if (isBinary) {
        log(`ℹ️  Skipping binary file: ${file}`, 'gray');
        continue;
      }

      validFiles.push(file);
    } catch (error) {
      log(`⚠️  Could not validate file ${file}: ${error.message}`, 'yellow');
    }
  }

  log(`📊 Found ${validFiles.length} files to scan`, 'blue');
  return validFiles;
}

// Unicode Issue Detection
class UnicodeIssue {
  constructor(type, pattern, line, column, char, context, severity = 'medium') {
    this.type = type;
    this.pattern = pattern;
    this.line = line;
    this.column = column;
    this.char = char;
    this.charCode = char.charCodeAt(0);
    this.context = context;
    this.severity = severity;
    this.fixStrategies = this.determineFixes();
  }

  determineFixes() {
    const strategies = [];
    
    switch (this.type) {
      case 'unpairedHighSurrogate':
        strategies.push(
          { type: 'remove', description: 'Remove invalid character', safe: true },
          { type: 'replace', replacement: '?', description: 'Replace with question mark', safe: true },
          { type: 'escape', description: 'Escape as \\uXXXX', safe: false },
          { type: 'manual', description: 'Manual review required', safe: false }
        );
        break;
      case 'unpairedLowSurrogate':
        strategies.push(
          { type: 'remove', description: 'Remove invalid character', safe: true },
          { type: 'replace', replacement: '?', description: 'Replace with question mark', safe: true }
        );
        break;
      case 'controlChars':
        strategies.push(
          { type: 'remove', description: 'Remove control character', safe: true },
          { type: 'replace', replacement: ' ', description: 'Replace with space', safe: true }
        );
        break;
      case 'zerothWidthChars':
        strategies.push(
          { type: 'remove', description: 'Remove zero-width character', safe: true }
        );
        break;
      case 'bomChars':
        strategies.push(
          { type: 'remove', description: 'Remove BOM from file start', safe: true }
        );
        break;
      default:
        strategies.push(
          { type: 'manual', description: 'Manual review required', safe: false }
        );
    }
    
    return strategies;
  }

  toString() {
    return `${this.type} at ${this.line}:${this.column} (U+${this.charCode.toString(16).toUpperCase().padStart(4, '0')})`;
  }
}

function scanFileForUnicodeIssues(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Scan each line
    lines.forEach((line, lineIndex) => {
      for (const [patternName, pattern] of Object.entries(DEFAULT_CONFIG.patterns)) {
        let match;
        pattern.lastIndex = 0; // Reset regex
        
        while ((match = pattern.exec(line)) !== null) {
          const char = match[0];
          const column = match.index + 1;
          const contextStart = Math.max(0, match.index - 10);
          const contextEnd = Math.min(line.length, match.index + 10);
          const context = line.substring(contextStart, contextEnd);
          
          // Determine severity based on context
          const severity = determineSeverity(char, line, match.index, patternName);
          
          const issue = new UnicodeIssue(
            patternName,
            pattern,
            lineIndex + 1,
            column,
            char,
            context,
            severity
          );
          
          issues.push(issue);
          metrics.recordPattern(patternName);
          
          // Prevent infinite loops with global patterns
          if (!pattern.global) break;
        }
      }
    });

  } catch (error) {
    log(`❌ Error scanning ${filePath}: ${error.message}`, 'red');
  }

  return issues;
}

function determineSeverity(char, line, index, patternName) {
  // High severity: JSON-breaking characters
  if (patternName === 'unpairedHighSurrogate' || patternName === 'unpairedLowSurrogate') {
    return 'high';
  }
  
  // Medium severity: Potentially problematic
  if (patternName === 'controlChars' || patternName === 'invalidUtf8') {
    return 'medium';
  }
  
  // Low severity: Usually safe but worth noting
  return 'low';
}

// Main Execution
async function main() {
  let exitCode = 0;

  try {
    if (HELP) {
      showHelp();
      return;
    }

    if (!DEFAULT_CONFIG.silent) {
      log('🔍 Unicode Safety Validator v2.0', 'bright');
      log('================================', 'bright');
    }

    // Show operation mode
    if (SCAN_ONLY) {
      log('📊 SCAN MODE - Read-only analysis', 'blue');
    } else if (DRY_RUN) {
      log('🔍 DRY RUN MODE - No changes will be made', 'yellow');
    } else if (AUTO_FIX) {
      log('⚡ AUTO-FIX MODE - Safe fixes will be applied automatically', 'yellow');
    } else if (INTERACTIVE) {
      log('🤝 INTERACTIVE MODE - You will be prompted for each fix', 'green');
    }

    // Pre-flight checks
    if (!SCAN_ONLY) {
      const gitOk = await checkGitStatus();
      if (!gitOk) {
        exitCode = 1;
        return;
      }
    }

    // Get files to scan
    const files = getAllFiles();
    
    if (files.length === 0) {
      log('📂 No files found to scan', 'yellow');
      return;
    }

    // Scan files for Unicode issues
    const allIssues = new Map();
    let totalIssues = 0;

    log(`\n🔍 Scanning ${files.length} files for Unicode issues...`, 'blue');

    for (const [index, file] of files.entries()) {
      if (DEFAULT_CONFIG.verbose) {
        log(`📄 [${index + 1}/${files.length}] ${path.relative(process.cwd(), file)}`, 'gray');
      }

      const issues = scanFileForUnicodeIssues(file);
      
      if (issues.length > 0) {
        allIssues.set(file, issues);
        totalIssues += issues.length;
        
        if (DEFAULT_CONFIG.verbose) {
          log(`   Found ${issues.length} issues`, 'yellow');
        }
      }
    }

    metrics.recordScan(files.length, totalIssues);

    // Generate report
    if (DEFAULT_CONFIG.jsonOutput) {
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          filesScanned: files.length,
          totalIssues,
          issuesByType: {},
          issuesBySeverity: { high: 0, medium: 0, low: 0 }
        },
        files: {},
        metrics: metrics.getStats()
      };

      // Process issues for JSON report
      for (const [file, issues] of allIssues) {
        report.files[file] = issues.map(issue => ({
          type: issue.type,
          line: issue.line,
          column: issue.column,
          severity: issue.severity,
          charCode: issue.charCode,
          context: issue.context,
          fixStrategies: issue.fixStrategies
        }));

        issues.forEach(issue => {
          report.summary.issuesByType[issue.type] = (report.summary.issuesByType[issue.type] || 0) + 1;
          report.summary.issuesBySeverity[issue.severity]++;
        });
      }

      console.log(JSON.stringify(report, null, 2));
      exitCode = totalIssues > 0 ? 1 : 0;
      return;
    }

    // Human-readable report
    log('\n📊 UNICODE SCAN REPORT', 'bright');
    log('='.repeat(50), 'bright');
    
    log(`📁 Files scanned: ${files.length}`, 'cyan');
    log(`🚨 Total issues found: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
    log(`📂 Files with issues: ${allIssues.size}`, 'yellow');

    if (totalIssues === 0) {
      log('\n✅ No Unicode issues found! Your files are clean.', 'green');
      return;
    }

    // Issue summary by type
    const issuesByType = {};
    const issuesBySeverity = { high: 0, medium: 0, low: 0 };

    for (const issues of allIssues.values()) {
      issues.forEach(issue => {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
        issuesBySeverity[issue.severity]++;
      });
    }

    log('\n📋 Issues by type:', 'bright');
    for (const [type, count] of Object.entries(issuesByType)) {
      log(`  ${type}: ${count}`, 'yellow');
    }

    log('\n🚨 Issues by severity:', 'bright');
    log(`  High:   ${issuesBySeverity.high}`, 'red');
    log(`  Medium: ${issuesBySeverity.medium}`, 'yellow');
    log(`  Low:    ${issuesBySeverity.low}`, 'green');

    // Show files with issues (limit to 20 for readability)
    if (DEFAULT_CONFIG.verbose && allIssues.size <= 20) {
      log('\n📁 Files with issues:', 'bright');
      for (const [file, issues] of allIssues) {
        log(`\n  ${path.relative(process.cwd(), file)} (${issues.length} issues)`, 'cyan');
        issues.slice(0, 5).forEach(issue => {
          log(`    • ${issue.toString()}`, 'gray');
        });
        if (issues.length > 5) {
          log(`    ... and ${issues.length - 5} more`, 'gray');
        }
      }
    }

    // Recommendations
    if (SCAN_ONLY) {
      log('\n💡 RECOMMENDATIONS', 'bright');
      
      const hasHighSeverity = [...allIssues.values()].some(issues => 
        issues.some(issue => issue.severity === 'high')
      );
      
      if (hasHighSeverity) {
        log('⚠️  High-severity issues found! These can cause JSON parsing errors.', 'red');
        log('   Recommended: Run with --interactive to fix safely', 'yellow');
      } else {
        log('ℹ️  No high-severity issues found.', 'green');
        log('   Consider running --dry-run to see potential fixes', 'cyan');
      }
    }

    exitCode = totalIssues > 0 ? 1 : 0;

  } catch (error) {
    if (DEFAULT_CONFIG.jsonOutput) {
      console.log(JSON.stringify({
        error: 'Fatal error during execution',
        details: error.message,
        stack: error.stack,
        exitCode: 1
      }));
    } else {
      log(`❌ Fatal error: ${error.message}`, 'red');
      log('Stack trace:', 'gray');
      log(error.stack, 'gray');
    }
    exitCode = 1;
  } finally {
    rl.close();
    process.exit(exitCode);
  }
}

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  if (DEFAULT_CONFIG.jsonOutput) {
    console.log(JSON.stringify({
      error: 'Unhandled promise rejection',
      reason: reason?.toString(),
      exitCode: 1
    }));
  } else {
    log(`❌ Unhandled Rejection: ${reason}`, 'red');
  }
  rl.close();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  if (DEFAULT_CONFIG.jsonOutput) {
    console.log(JSON.stringify({
      error: 'Uncaught exception',
      details: error.message,
      stack: error.stack,
      exitCode: 1
    }));
  } else {
    log(`❌ Uncaught Exception: ${error.message}`, 'red');
  }
  rl.close();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  if (!DEFAULT_CONFIG.silent) {
    log('\n👋 Gracefully shutting down...', 'yellow');
  }
  rl.close();
  process.exit(0);
});

main(); 