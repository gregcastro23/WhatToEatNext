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
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getTypeScriptErrors() {
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout || '';
    const lines = output.split('\n');
    const errors = [];

    for (const line of lines) {
      // Match TS18046 (is of type 'unknown')
      const match18046 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS18046: '(.+?)' is of type 'unknown'/,
      );
      // Match TS18048 (is possibly 'undefined')
      const match18048 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS18048: '(.+?)' is possibly 'undefined'/,
      );
      // Match TS2801 (condition always true)
      const match2801 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS2801: This condition will always return true/,
      );

      if (match18046) {
        errors.push({
          file: match18046[1],
          line: parseInt(match18046[2]),
          column: parseInt(match18046[3]),
          type: 'TS18046',
          expression: match18046[4],
        });
      } else if (match18048) {
        errors.push({
          file: match18048[1],
          line: parseInt(match18048[2]),
          column: parseInt(match18048[3]),
          type: 'TS18048',
          expression: match18048[4],
        });
      } else if (match2801) {
        errors.push({
          file: match2801[1],
          line: parseInt(match2801[2]),
          column: parseInt(match2801[3]),
          type: 'TS2801',
          expression: null,
        });
      }
    }

    return errors;
  }
}

function fixOptionalChainInFile(filePath, errors, dryRun = false) {
  if (!fs.existsSync(filePath)) {
    return { fixed: 0, patterns: [] };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixedCount = 0;
  let fixedPatterns = [];

  // Sort errors by line number in reverse to avoid offset issues
  const fileErrors = errors.filter(e => e.file === filePath).sort((a, b) => b.line - a.line);

  for (const error of fileErrors) {
    const lineIndex = error.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      let line = lines[lineIndex];
      let fixed = false;

      if (error.type === 'TS18046' || error.type === 'TS18048') {
        // Handle property access chains that need optional chaining
        const expression = error.expression;

        // Pattern 1: Simple property chains (a.b.c → a?.b?.c)
        if (expression.includes('.')) {
          const parts = expression.split('.');
          const baseVar = parts[0];

          // Build the optional chain pattern
          let optionalChain = baseVar;
          for (let i = 1; i < parts.length; i++) {
            optionalChain += `?.${parts[i]}`;
          }

          // Replace in the line
          const escapedExpression = expression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedExpression}\\b`, 'g');

          if (line.match(regex)) {
            lines[lineIndex] = line.replace(regex, optionalChain);
            fixed = true;
            fixedPatterns.push(`${expression} → ${optionalChain}`);
          }
        }

        // Pattern 2: Add nullish coalescing for undefined values
        if (!fixed && error.type === 'TS18048') {
          // Look for patterns like: value || defaultValue
          const orPattern = new RegExp(`\\b${error.expression}\\s*\\|\\|\\s*([^\\s;,)]+)`);
          const orMatch = line.match(orPattern);

          if (orMatch) {
            const defaultValue = orMatch[1];
            const replacement = `${error.expression} ?? ${defaultValue}`;
            lines[lineIndex] = line.replace(orMatch[0], replacement);
            fixed = true;
            fixedPatterns.push(`${orMatch[0]} → ${replacement}`);
          }
        }

        // Pattern 3: Add type assertions for unknown types
        if (!fixed && error.type === 'TS18046') {
          // For unknown types, we need to add type assertions
          const parts = expression.split('.');
          if (parts.length > 1) {
            const baseVar = parts[0];
            // Add as Record<string, unknown> assertion
            const assertedExpression = `(${baseVar} as Record<string, unknown>)`;

            const regex = new RegExp(`\\b${baseVar}\\b(?=\\.)`, 'g');
            if (line.match(regex)) {
              lines[lineIndex] = line.replace(regex, assertedExpression);
              fixed = true;
              fixedPatterns.push(`${baseVar} → ${assertedExpression}`);
            }
          }
        }
      } else if (error.type === 'TS2801') {
        // Handle conditions that always return true
        // Look for patterns like: if (promise || defaultValue)
        const ifPattern = /if\s*\(\s*([^)]+)\s*\|\|\s*([^)]+)\s*\)/;
        const ifMatch = line.match(ifPattern);

        if (ifMatch) {
          const condition = ifMatch[1].trim();
          const alternative = ifMatch[2].trim();

          // If it's a Promise, we might need to await it
          if (condition.includes('Promise') || condition.includes('async')) {
            // Just use the condition without the OR
            const replacement = `if (${condition})`;
            lines[lineIndex] = line.replace(ifMatch[0], replacement);
            fixed = true;
            fixedPatterns.push(`Removed redundant OR condition: ${ifMatch[0]} → ${replacement}`);
          }
        }
      }

      if (fixed) {
        fixedCount++;
        log(
          `    ✓ Line ${error.line}: Fixed ${error.type} - ${fixedPatterns[fixedPatterns.length - 1]}`,
          'green',
        );
      }
    }
  }

  if (fixedCount > 0 && !dryRun) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { fixed: fixedCount, patterns: fixedPatterns };
}

function fixOptionalChains(dryRun = false) {
  log('\n🔍 Scanning for optional chaining opportunities...', 'cyan');

  const errors = getTypeScriptErrors();
  const chainErrors = errors.filter(
    e => e.type === 'TS18046' || e.type === 'TS18048' || e.type === 'TS2801',
  );

  if (chainErrors.length === 0) {
    log('✅ No optional chaining errors found!', 'green');
    return { fixed: 0, total: 0, files: 0 };
  }

  log(`Found ${chainErrors.length} optional chaining opportunities`, 'yellow');

  // Group errors by file
  const errorsByFile = {};
  for (const error of chainErrors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  let totalFixed = 0;
  let filesFixed = 0;

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    log(`\n📝 Processing ${path.basename(filePath)} (${fileErrors.length} errors)...`, 'blue');

    const result = fixOptionalChainInFile(filePath, fileErrors, dryRun);

    if (result.fixed > 0) {
      filesFixed++;
      totalFixed += result.fixed;

      if (!dryRun) {
        log(`  💾 Saved ${result.fixed} fixes to ${path.basename(filePath)}`, 'green');
      } else {
        log(`  🔍 Would fix ${result.fixed} errors (dry run)`, 'cyan');
      }
    } else {
      log(`  ⚠️  No auto-fixable patterns found`, 'yellow');
    }
  }

  return { fixed: totalFixed, total: chainErrors.length, files: filesFixed };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  log('🚀 Optional Chaining Fixer', 'bright');
  log('='.repeat(50), 'cyan');

  if (dryRun) {
    log('🔍 Running in DRY RUN mode - no files will be modified', 'yellow');
  }

  log('\n📋 Patterns to fix:', 'cyan');
  log('  • TS18046: Unknown type access → Type assertions', 'blue');
  log('  • TS18048: Possibly undefined → Optional chaining (?.) ', 'blue');
  log('  • TS2801: Redundant OR conditions → Simplified conditions', 'blue');
  log('  • Logical OR (||) → Nullish coalescing (??)', 'blue');

  try {
    // Create backup with git stash
    if (!dryRun) {
      log('\n📦 Creating git stash backup...', 'cyan');
      try {
        execSync('git stash push -m "fix-optional-chains-backup"', { stdio: 'pipe' });
        log('✅ Backup created successfully', 'green');
      } catch (e) {
        log('⚠️  Could not create git stash (working directory might be clean)', 'yellow');
      }
    }

    const result = fixOptionalChains(dryRun);

    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Summary:', 'bright');
    log(`  Files processed: ${result.files}`, 'blue');
    log(`  Total opportunities found: ${result.total}`, 'blue');
    log(`  Successfully fixed: ${result.fixed}`, 'green');
    log(
      `  Remaining to fix manually: ${result.total - result.fixed}`,
      result.total - result.fixed > 0 ? 'yellow' : 'green',
    );

    if (!dryRun && result.fixed > 0) {
      log('\n🔨 Rebuilding to verify fixes...', 'cyan');
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        log('✅ Build successful!', 'green');
      } catch (e) {
        const newErrors = getTypeScriptErrors();
        const remainingChainErrors = newErrors.filter(
          e => e.type === 'TS18046' || e.type === 'TS18048' || e.type === 'TS2801',
        );
        log(
          `⚠️  Build still has ${remainingChainErrors.length} optional chaining errors`,
          'yellow',
        );
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

module.exports = { fixOptionalChains };
