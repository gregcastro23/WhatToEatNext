#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Common typo patterns to fix
const typoPatterns = [
  // Underscore typos
  { pattern: /\bexpect_\b/g, replacement: 'expect', description: 'expect_ → expect' },
  { pattern: /\bString_\b/g, replacement: 'String', description: 'String_ → String' },
  { pattern: /\bmockExecSync_\b/g, replacement: 'mockExecSync', description: 'mockExecSync_ → mockExecSync' },
  { pattern: /\b_result\b/g, replacement: 'result', description: '_result → result' },
  
  // Method typos
  { pattern: /\.parse_\(/g, replacement: '.parse(', description: '.parse_ → .parse' },
  { pattern: /\.includes_\(/g, replacement: '.includes(', description: '.includes_ → .includes' },
  
  // Import typos
  { pattern: /withCampaignTestIsolation/g, replacement: 'validateCampaignTestIsolation', description: 'withCampaignTestIsolation → validateCampaignTestIsolation' }
];

function getTypeScriptErrors() {
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout || '';
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      // Match TS2304 (Cannot find name) and TS2551 (Did you mean) errors
      const match2304 = line.match(/^(.+?)\((\d+),(\d+)\): error TS2304: Cannot find name '(.+?)'/);
      const match2551 = line.match(/^(.+?)\((\d+),(\d+)\): error TS2551: Property '(.+?)' does not exist .* Did you mean '(.+?)'/);
      const match2552 = line.match(/^(.+?)\((\d+),(\d+)\): error TS2552: Cannot find name '(.+?)'\. Did you mean '(.+?)'/);
      
      if (match2304) {
        errors.push({
          file: match2304[1],
          line: parseInt(match2304[2]),
          column: parseInt(match2304[3]),
          type: 'TS2304',
          name: match2304[4],
          suggestion: null
        });
      } else if (match2551) {
        errors.push({
          file: match2551[1],
          line: parseInt(match2551[2]),
          column: parseInt(match2551[3]),
          type: 'TS2551',
          name: match2551[4],
          suggestion: match2551[5]
        });
      } else if (match2552) {
        errors.push({
          file: match2552[1],
          line: parseInt(match2552[2]),
          column: parseInt(match2552[3]),
          type: 'TS2552',
          name: match2552[4],
          suggestion: match2552[5]
        });
      }
    }
    
    return errors;
  }
}

function fixTyposInFile(filePath, patterns, dryRun = false) {
  if (!fs.existsSync(filePath)) {
    return { fixed: 0, patterns: [] };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixedPatterns = [];
  let totalFixes = 0;
  
  for (const pattern of patterns) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      const count = matches.length;
      content = content.replace(pattern.pattern, pattern.replacement);
      fixedPatterns.push({ ...pattern, count });
      totalFixes += count;
      log(`    ✓ Fixed ${count} instance(s): ${pattern.description}`, 'green');
    }
  }
  
  if (totalFixes > 0 && !dryRun && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return { fixed: totalFixes, patterns: fixedPatterns };
}

function fixTypoErrors(dryRun = false) {
  log('\n🔍 Scanning for typo-related errors...', 'cyan');
  
  const errors = getTypeScriptErrors();
  const typoErrors = errors.filter(e => e.type === 'TS2304' || e.type === 'TS2551' || e.type === 'TS2552');
  
  if (typoErrors.length === 0) {
    log('✅ No typo-related errors found!', 'green');
    return { fixed: 0, total: 0, files: 0 };
  }
  
  log(`Found ${typoErrors.length} typo-related errors`, 'yellow');
  
  // Get unique files with typos
  const filesWithTypos = [...new Set(typoErrors.map(e => e.file))];
  
  let totalFixed = 0;
  let filesFixed = 0;
  
  for (const filePath of filesWithTypos) {
    const fileErrors = typoErrors.filter(e => e.file === filePath);
    log(`\n📝 Processing ${path.basename(filePath)} (${fileErrors.length} errors)...`, 'blue');
    
    // Apply pattern-based fixes
    const result = fixTyposInFile(filePath, typoPatterns, dryRun);
    
    // Apply suggestion-based fixes for TS2551 and TS2552 errors
    if (fileErrors.some(e => e.suggestion)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let suggestionFixes = 0;
      
      for (const error of fileErrors.filter(e => e.suggestion)) {
        const lineIndex = error.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];
          
          // Create a pattern to replace the typo with the suggestion
          const typoRegex = new RegExp(`\\b${error.name}\\b`, 'g');
          if (line.match(typoRegex)) {
            lines[lineIndex] = line.replace(typoRegex, error.suggestion);
            suggestionFixes++;
            log(`    ✓ Fixed: ${error.name} → ${error.suggestion} (line ${error.line})`, 'green');
          }
        }
      }
      
      if (suggestionFixes > 0 && !dryRun) {
        content = lines.join('\n');
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixed += suggestionFixes;
      } else if (dryRun) {
        totalFixed += suggestionFixes;
      }
    }
    
    if (result.fixed > 0) {
      filesFixed++;
      totalFixed += result.fixed;
    }
    
    if (!dryRun && (result.fixed > 0 || fileErrors.some(e => e.suggestion))) {
      log(`  💾 Saved fixes to ${path.basename(filePath)}`, 'green');
    }
  }
  
  return { fixed: totalFixed, total: typoErrors.length, files: filesFixed };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  log('🚀 TypeScript Typo Fixer', 'bright');
  log('=' .repeat(50), 'cyan');
  
  if (dryRun) {
    log('🔍 Running in DRY RUN mode - no files will be modified', 'yellow');
  }
  
  try {
    // Create backup with git stash
    if (!dryRun) {
      log('\n📦 Creating git stash backup...', 'cyan');
      try {
        execSync('git stash push -m "fix-typos-backup"', { stdio: 'pipe' });
        log('✅ Backup created successfully', 'green');
      } catch (e) {
        log('⚠️  Could not create git stash (working directory might be clean)', 'yellow');
      }
    }
    
    // Show patterns being used
    log('\n📋 Typo patterns to fix:', 'cyan');
    for (const pattern of typoPatterns) {
      log(`  • ${pattern.description}`, 'blue');
    }
    
    const result = fixTypoErrors(dryRun);
    
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Summary:', 'bright');
    log(`  Files processed: ${result.files}`, 'blue');
    log(`  Total typo errors found: ${result.total}`, 'blue');
    log(`  Successfully fixed: ${result.fixed}`, 'green');
    log(`  Remaining to fix: ${result.total - result.fixed}`, result.total - result.fixed > 0 ? 'yellow' : 'green');
    
    if (!dryRun && result.fixed > 0) {
      log('\n🔨 Rebuilding to verify fixes...', 'cyan');
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        log('✅ Build successful!', 'green');
      } catch (e) {
        const newErrors = getTypeScriptErrors();
        const remainingTypos = newErrors.filter(e => e.type === 'TS2304' || e.type === 'TS2551' || e.type === 'TS2552');
        log(`⚠️  Build still has ${remainingTypos.length} typo-related errors`, 'yellow');
      }
    }
    
    if (dryRun && result.fixed > 0) {
      log('\n💡 Run without --dry-run to apply these fixes', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixTypoErrors };