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

// Extended typo patterns and missing references
const referencePatterns = [
  // Remaining typos with underscores
  { pattern: /\bexpect_\b/g, replacement: 'expect', description: 'expect_ → expect' },
  { pattern: /\bString_\b/g, replacement: 'String', description: 'String_ → String' },
  { pattern: /\bmockExecSync_\b/g, replacement: 'mockExecSync', description: 'mockExecSync_ → mockExecSync' },
  { pattern: /\b_result\b/g, replacement: 'result', description: '_result → result' },
  { pattern: /\bJSON\.parse_\b/g, replacement: 'JSON.parse', description: 'JSON.parse_ → JSON.parse' },
  { pattern: /\.includes_\b/g, replacement: '.includes', description: '.includes_ → .includes' },
  
  // Function name corrections
  { pattern: /\bwithCampaignTestIsolation\b/g, replacement: 'validateCampaignTestIsolation', description: 'withCampaignTestIsolation → validateCampaignTestIsolation' },
  { pattern: /\bformatMethodsForComponent\b/g, replacement: '_formatMethodsForComponent', description: 'formatMethodsForComponent → _formatMethodsForComponent' },
  { pattern: /\bsetIsDaytime\b/g, replacement: '_setIsDaytime', description: 'setIsDaytime → _setIsDaytime' },
  { pattern: /\bonClick_\b/g, replacement: 'onClick', description: 'onClick_ → onClick' },
  
  // Missing function prefixes for unused functions
  { pattern: /^(\s*)drawZodiacWheel\b/gm, replacement: '$1_drawZodiacWheel', description: 'drawZodiacWheel → _drawZodiacWheel (unused)' },
  { pattern: /^(\s*)drawCelestialBody\b/gm, replacement: '$1_drawCelestialBody', description: 'drawCelestialBody → _drawCelestialBody (unused)' },
  { pattern: /^(\s*)drawLunarNode\b/gm, replacement: '$1_drawLunarNode', description: 'drawLunarNode → _drawLunarNode (unused)' }
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
      // Match TS2304 (Cannot find name)
      const match2304 = line.match(/^(.+?)\((\d+),(\d+)\): error TS2304: Cannot find name '(.+?)'/);
      // Match TS2551/TS2552 (Did you mean)
      const matchSuggestion = line.match(/^(.+?)\((\d+),(\d+)\): error TS(2551|2552): .* '(.+?)'.* Did you mean '(.+?)'/);
      
      if (match2304) {
        errors.push({
          file: match2304[1],
          line: parseInt(match2304[2]),
          column: parseInt(match2304[3]),
          type: 'TS2304',
          name: match2304[4],
          suggestion: null
        });
      } else if (matchSuggestion) {
        errors.push({
          file: matchSuggestion[1],
          line: parseInt(matchSuggestion[2]),
          column: parseInt(matchSuggestion[3]),
          type: `TS${matchSuggestion[4]}`,
          name: matchSuggestion[5],
          suggestion: matchSuggestion[6]
        });
      }
    }
    
    return errors;
  }
}

function fixMissingReferences(dryRun = false) {
  log('\n🔍 Scanning for missing references and typos...', 'cyan');
  
  const errors = getTypeScriptErrors();
  const referenceErrors = errors.filter(e => e.type === 'TS2304' || e.type === 'TS2551' || e.type === 'TS2552');
  
  if (referenceErrors.length === 0) {
    log('✅ No missing reference errors found!', 'green');
    return { fixed: 0, total: 0, files: 0 };
  }
  
  log(`Found ${referenceErrors.length} missing reference errors`, 'yellow');
  
  // Get unique files
  const filesWithErrors = [...new Set(referenceErrors.map(e => e.file))];
  
  let totalFixed = 0;
  let filesFixed = 0;
  const manualFixes = [];
  
  for (const filePath of filesWithErrors) {
    const fileErrors = referenceErrors.filter(e => e.file === filePath);
    
    if (!fs.existsSync(filePath)) {
      log(`⚠️  File not found: ${filePath}`, 'yellow');
      continue;
    }
    
    log(`\n📝 Processing ${path.basename(filePath)} (${fileErrors.length} errors)...`, 'blue');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixedInFile = 0;
    
    // Apply pattern-based fixes
    for (const pattern of referencePatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        const count = matches.length;
        content = content.replace(pattern.pattern, pattern.replacement);
        fixedInFile += count;
        log(`    ✓ Fixed ${count} instance(s): ${pattern.description}`, 'green');
      }
    }
    
    // Apply suggestion-based fixes for specific errors
    const lines = content.split('\n');
    for (const error of fileErrors) {
      if (error.suggestion) {
        const lineIndex = error.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];
          
          // Create safe regex for the typo
          const nameRegex = new RegExp(`\\b${error.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
          
          if (line.match(nameRegex)) {
            lines[lineIndex] = line.replace(nameRegex, error.suggestion);
            fixedInFile++;
            log(`    ✓ Fixed: ${error.name} → ${error.suggestion} (line ${error.line})`, 'green');
          }
        }
      } else if (error.name && !error.suggestion) {
        // Track errors without suggestions for manual review
        manualFixes.push({
          file: path.basename(filePath),
          line: error.line,
          name: error.name
        });
      }
    }
    
    // Rebuild content from lines if we made line-specific changes
    if (fileErrors.some(e => e.suggestion)) {
      content = lines.join('\n');
    }
    
    // Special handling for specific patterns
    if (filePath.includes('CelestialDisplay')) {
      // Fix undefined drawing functions by adding them or prefixing with underscore
      const drawingFunctions = ['drawZodiacWheel', 'drawCelestialBody', 'drawLunarNode'];
      for (const func of drawingFunctions) {
        const funcRegex = new RegExp(`\\b${func}\\(`, 'g');
        if (content.match(funcRegex)) {
          // Check if function is defined in the file
          const definitionRegex = new RegExp(`function\\s+${func}\\b|const\\s+${func}\\s*=`);
          if (!content.match(definitionRegex)) {
            // Prefix with underscore to indicate unused/placeholder
            content = content.replace(funcRegex, `_${func}(`);
            fixedInFile++;
            log(`    ✓ Prefixed undefined function: ${func} → _${func}`, 'green');
          }
        }
      }
    }
    
    if (fixedInFile > 0 && !dryRun && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      log(`  💾 Saved ${fixedInFile} fixes to ${path.basename(filePath)}`, 'green');
      totalFixed += fixedInFile;
      filesFixed++;
    } else if (dryRun && fixedInFile > 0) {
      log(`  🔍 Would fix ${fixedInFile} errors (dry run)`, 'cyan');
      totalFixed += fixedInFile;
      filesFixed++;
    }
  }
  
  if (manualFixes.length > 0) {
    log('\n📋 References requiring manual review:', 'yellow');
    const grouped = {};
    for (const fix of manualFixes) {
      if (!grouped[fix.file]) grouped[fix.file] = [];
      grouped[fix.file].push(`Line ${fix.line}: ${fix.name}`);
    }
    for (const [file, issues] of Object.entries(grouped)) {
      log(`  ${file}:`, 'cyan');
      issues.forEach(issue => log(`    • ${issue}`, 'blue'));
    }
  }
  
  return { fixed: totalFixed, total: referenceErrors.length, files: filesFixed };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  log('🚀 Missing References & Typo Fixer', 'bright');
  log('=' .repeat(50), 'cyan');
  
  if (dryRun) {
    log('🔍 Running in DRY RUN mode - no files will be modified', 'yellow');
  }
  
  try {
    // Create backup with git stash
    if (!dryRun) {
      log('\n📦 Creating git stash backup...', 'cyan');
      try {
        execSync('git stash push -m "fix-missing-references-backup"', { stdio: 'pipe' });
        log('✅ Backup created successfully', 'green');
      } catch (e) {
        log('⚠️  Could not create git stash (working directory might be clean)', 'yellow');
      }
    }
    
    // Show patterns being used
    log('\n📋 Reference patterns to fix:', 'cyan');
    for (const pattern of referencePatterns.slice(0, 10)) {
      log(`  • ${pattern.description}`, 'blue');
    }
    if (referencePatterns.length > 10) {
      log(`  ... and ${referencePatterns.length - 10} more patterns`, 'blue');
    }
    
    const result = fixMissingReferences(dryRun);
    
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Summary:', 'bright');
    log(`  Files processed: ${result.files}`, 'blue');
    log(`  Total reference errors found: ${result.total}`, 'blue');
    log(`  Successfully fixed: ${result.fixed}`, 'green');
    log(`  Remaining to fix: ${result.total - result.fixed}`, result.total - result.fixed > 0 ? 'yellow' : 'green');
    
    if (!dryRun && result.fixed > 0) {
      log('\n🔨 Rebuilding to verify fixes...', 'cyan');
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        log('✅ Build successful!', 'green');
      } catch (e) {
        const newErrors = getTypeScriptErrors();
        const remainingRefs = newErrors.filter(e => e.type === 'TS2304' || e.type === 'TS2551' || e.type === 'TS2552');
        log(`⚠️  Build still has ${remainingRefs.length} reference errors`, 'yellow');
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

module.exports = { fixMissingReferences };