#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: './src',
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludePatterns: ['node_modules', '.next', 'dist', 'build'],
  preservePatterns: {
    // Astrological and astronomical patterns
    astrological: [
      /^(planet|degree|sign|longitude|position|transit|elemental)/i,
      /^(zodiac|lunar|solar|celestial|astronomical|aspect)/i,
      /^(retrograde|direct|stationary|conjunction|opposition)/i,
      /^(ascendant|descendant|midheaven|nadir|house|cusp)/i,
      /^(decan|triplicity|quadruplicity|modality|polarity)/i
    ],
    // Campaign and enterprise intelligence patterns
    campaign: [
      /^(campaign|progress|metrics|safety|intelligence|enterprise)/i,
      /^(ml|predictive|analytics|monitoring|tracking|reporting)/i,
      /^(service|integration|pattern|protocol|validation)/i,
      /^(score|status|data|analysis|engine|model)/i
    ],
    // Test patterns
    test: [
      /^(mock|stub|test|expect|jest|describe|it|before|after)/i,
      /^(spy|fixture|snapshot|setup|teardown|helper)/i,
      /^(dummy|fake|sample|example|demo)/i
    ]
  },
  maxFilesPerRun: 20,
  dryRun: false
};

// Track metrics
const metrics = {
  filesScanned: 0,
  filesModified: 0,
  variablesFixed: 0,
  variablesPreserved: 0,
  errors: []
};

/**
 * Check if a variable should be preserved
 */
function shouldPreserveVariable(name) {
  // Check all preservation patterns
  for (const [domain, patterns] of Object.entries(CONFIG.preservePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(name)) {
        return domain;
      }
    }
  }
  return null;
}

/**
 * Get unused variables from ESLint output for a specific file
 */
function getUnusedVariablesFromESLint(filePath) {
  try {
    const output = execSync(`npx eslint "${filePath}" --format json`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const results = JSON.parse(output);
    const unusedVars = [];

    if (results.length > 0) {
      const messages = results[0].messages || [];
      messages.forEach(msg => {
        if (msg.ruleId === '@typescript-eslint/no-unused-vars' ||
            msg.ruleId === 'no-unused-vars') {
          // Extract variable name from message
          const match = msg.message.match(/'([^']+)' is (defined but never used|assigned a value but never used)/);
          if (match) {
            unusedVars.push({
              name: match[1],
              line: msg.line,
              column: msg.column,
              message: msg.message
            });
          }
        }
      });
    }

    return unusedVars;
  } catch (error) {
    // ESLint might fail on files with syntax errors, that's okay
    return [];
  }
}

/**
 * Process unused variables in a file using ESLint guidance
 */
function processUnusedVariables(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    const unusedVars = getUnusedVariablesFromESLint(filePath);
    const fixedVariables = [];

    if (unusedVars.length === 0) {
      return; // No unused variables found
    }

    console.log(`  Found ${unusedVars.length} unused variables in ${filePath}`);

    unusedVars.forEach(({ name, line, message }) => {
      const preserveDomain = shouldPreserveVariable(name);

      if (preserveDomain) {
        // For preserved variables, prefix with UNUSED_ or _
        const prefix = preserveDomain === 'test' ? '_' : 'UNUSED_';
        const newName = prefix + name;

        // Only replace if not already prefixed
        if (!name.startsWith('_') && !name.startsWith('UNUSED_')) {
          // Use word boundary regex for safe replacement
          const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
          const beforeCount = (modifiedContent.match(regex) || []).length;

          if (beforeCount > 0) {
            modifiedContent = modifiedContent.replace(regex, newName);
            const afterCount = (modifiedContent.match(new RegExp(`\\b${newName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length;

            if (afterCount > 0) {
              fixedVariables.push(`Preserved ${preserveDomain} variable: ${name} → ${newName}`);
              metrics.variablesPreserved++;
            }
          }
        }
      } else {
        // For function parameters, prefix with underscore
        if (message.includes('parameter') && !name.startsWith('_')) {
          const newName = '_' + name;

          // More targeted replacement for parameters
          const paramRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?=\\s*[,:)])`, 'g');
          const beforeCount = (modifiedContent.match(paramRegex) || []).length;

          if (beforeCount > 0) {
            modifiedContent = modifiedContent.replace(paramRegex, newName);
            fixedVariables.push(`Prefixed parameter: ${name} → ${newName}`);
            metrics.variablesFixed++;
          }
        }
      }
    });

    // Write the file if modified and validate
    if (modifiedContent !== content) {
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');

        // Quick syntax validation
        try {
          execSync(`npx tsc --noEmit "${filePath}"`, { stdio: 'pipe' });
          metrics.filesModified++;
          console.log(`✅ Fixed ${fixedVariables.length} unused variables in ${filePath}`);
          fixedVariables.forEach(fix => console.log(`    ${fix}`));
        } catch (syntaxError) {
          // Rollback if syntax error
          fs.writeFileSync(filePath, content, 'utf8');
          console.error(`❌ Syntax error after fix, rolled back: ${filePath}`);
          metrics.errors.push({ file: filePath, error: 'Syntax error after fix' });
        }
      } else {
        console.log(`Would fix ${fixedVariables.length} unused variables in ${filePath}`);
        fixedVariables.forEach(fix => console.log(`    ${fix}`));
      }
    }

  } catch (error) {
    metrics.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Get all files to process
 */
function getFilesToProcess() {
  const files = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!CONFIG.excludePatterns.some(pattern => fullPath.includes(pattern))) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (CONFIG.extensions.some(ext => fullPath.endsWith(ext)) &&
            !CONFIG.excludePatterns.some(pattern => fullPath.includes(pattern))) {
          files.push(fullPath);
        }
      }
    }
  }

  scanDirectory(CONFIG.sourceDir);
  return files;
}

/**
 * Validate TypeScript compilation after fixes
 */
function validateBuildAfterFix() {
  console.log('\n📋 Validating TypeScript compilation...');
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.error('❌ Build failed after fixes');
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 WhatToEatNext - Safe Unused Variables Cleanup');
  console.log('================================================');

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    CONFIG.dryRun = true;
    console.log('🔍 Running in DRY RUN mode - no files will be modified');
  }

  if (args.includes('--max-files')) {
    const maxIndex = args.indexOf('--max-files');
    CONFIG.maxFilesPerRun = parseInt(args[maxIndex + 1]) || CONFIG.maxFilesPerRun;
  }

  // Get files to process
  const files = getFilesToProcess();
  console.log(`\n📁 Found ${files.length} files to analyze`);

  // Process files with limit
  const filesToProcess = files.slice(0, CONFIG.maxFilesPerRun);
  console.log(`\n🔧 Processing ${filesToProcess.length} files...\n`);

  filesToProcess.forEach(file => {
    metrics.filesScanned++;
    processUnusedVariables(file);
  });

  // Report results
  console.log('\n📊 Fix Summary:');
  console.log('================');
  console.log(`Files scanned: ${metrics.filesScanned}`);
  console.log(`Files modified: ${metrics.filesModified}`);
  console.log(`Variables fixed: ${metrics.variablesFixed}`);
  console.log(`Variables preserved: ${metrics.variablesPreserved}`);

  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${metrics.errors.length}`);
    metrics.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }

  // Validate build if changes were made
  if (metrics.filesModified > 0 && !CONFIG.dryRun) {
    validateBuildAfterFix();
  }

  // Suggest next steps
  console.log('\n📌 Next Steps:');
  if (CONFIG.dryRun) {
    console.log('1. Review the changes that would be made');
    console.log('2. Run without --dry-run to apply fixes');
  } else if (metrics.filesModified > 0) {
    console.log('1. Run yarn lint to see updated issue count');
    console.log('2. Review changes with git diff');
    console.log('3. Run tests to ensure functionality preserved');
  }

  if (files.length > filesToProcess.length) {
    console.log(`\n📝 Note: ${files.length - filesToProcess.length} files remaining. Run again to process more.`);
  }
}

// Execute
main();
