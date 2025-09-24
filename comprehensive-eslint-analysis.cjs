#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Comprehensive ESLint Error Analysis\n');

try {
  // Get linting output excluding backup files
  console.log('Running ESLint analysis (excluding backup files)...');
  const output = execSync('yarn lint src --ignore-pattern "**/*\\ *" --format=compact 2>&1', {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  const lines = output.split('\n').filter(line => line.trim());

  // Initialize counters
  const errorCounts = {};
  const warningCounts = {};
  const fileStats = {};

  let totalErrors = 0;
  let totalWarnings = 0;
  let filesWithIssues = 0;

  // Process each line
  lines.forEach(line => {
    // Match error/warning pattern: file: line X, col Y, Error/Warning - message (rule)
    const match = line.match(/^(.+?):\s+line\s+\d+,\s+col\s+\d+,\s+(Error|Warning)\s+-\s+(.+?)\s+\(([^)]+)\)$/);

    if (match) {
      const [, filePath, severity, message, rule] = match;
      const shortPath = filePath.replace('/Users/GregCastro/Desktop/WhatToEatNext/', '');

      // Initialize file stats
      if (!fileStats[shortPath]) {
        fileStats[shortPath] = { errors: 0, warnings: 0 };
        filesWithIssues++;
      }

      if (severity === 'Error') {
        totalErrors++;
        errorCounts[rule] = (errorCounts[rule] || 0) + 1;
        fileStats[shortPath].errors++;
      } else {
        totalWarnings++;
        warningCounts[rule] = (warningCounts[rule] || 0) + 1;
        fileStats[shortPath].warnings++;
      }
    }
  });

  console.log('📊 ESLint Analysis Results');
  console.log('===========================\n');

  console.log(`📈 Summary Statistics:`);
  console.log(`   Files with Issues: ${filesWithIssues}`);
  console.log(`   Total Errors: ${totalErrors}`);
  console.log(`   Total Warnings: ${totalWarnings}`);
  console.log(`   Total Issues: ${totalErrors + totalWarnings}\n`);

  // Top error rules
  if (Object.keys(errorCounts).length > 0) {
    console.log('🚨 Top Error Rules:');
    const sortedErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);

    sortedErrors.forEach(([rule, count], index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${rule.padEnd(55)} ${count.toString().padStart(4)} errors`);
    });
    console.log();
  }

  // Top warning rules
  if (Object.keys(warningCounts).length > 0) {
    console.log('⚠️  Top Warning Rules:');
    const sortedWarnings = Object.entries(warningCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);

    sortedWarnings.forEach(([rule, count], index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${rule.padEnd(55)} ${count.toString().padStart(4)} warnings`);
    });
    console.log();
  }

  // High-impact files
  const highImpactFiles = Object.entries(fileStats)
    .filter(([, stats]) => stats.errors > 5 || stats.warnings > 15)
    .sort(([,a], [,b]) => (b.errors + b.warnings) - (a.errors + a.warnings));

  if (highImpactFiles.length > 0) {
    console.log('🎯 High-Impact Files:');
    highImpactFiles.slice(0, 20).forEach(([file, stats], index) => {
      const total = stats.errors + stats.warnings;
      console.log(`   ${(index + 1).toString().padStart(2)}. ${file.padEnd(70)} ${stats.errors.toString().padStart(3)}E ${stats.warnings.toString().padStart(3)}W (${total})`);
    });
    console.log();
  }

  // Error categorization
  console.log('📂 Error Categories:');

  const categories = {
    'TypeScript Floating Promises': ['@typescript-eslint/no-floating-promises'],
    'TypeScript Await Issues': ['@typescript-eslint/await-thenable'],
    'TypeScript Type Issues': ['@typescript-eslint/no-explicit-any', '@typescript-eslint/no-unused-vars'],
    'TypeScript Optional Chains': ['@typescript-eslint/prefer-optional-chain'],
    'React Issues': ['react-hooks/exhaustive-deps', 'react/jsx-no-undef', 'react/no-unescaped-entities'],
    'Code Quality': ['no-console', 'prefer-const', 'eqeqeq', 'no-var', 'no-empty', 'no-constant-condition'],
    'Import/Export': ['import/no-unresolved', 'import/order', 'no-undef']
  };

  Object.entries(categories).forEach(([category, rules]) => {
    const categoryErrors = rules.reduce((sum, rule) => sum + (errorCounts[rule] || 0), 0);
    const categoryWarnings = rules.reduce((sum, rule) => sum + (warningCounts[rule] || 0), 0);

    if (categoryErrors > 0 || categoryWarnings > 0) {
      console.log(`   ${category.padEnd(30)}: ${categoryErrors.toString().padStart(4)} errors, ${categoryWarnings.toString().padStart(4)} warnings`);
    }
  });

  console.log();

  // Key findings
  console.log('💡 Key Findings:');

  const topError = Object.entries(errorCounts).sort(([,a], [,b]) => b - a)[0];
  if (topError) {
    console.log(`   🚨 Most Common Error: "${topError[0]}" (${topError[1]} instances)`);

    if (topError[0] === '@typescript-eslint/no-floating-promises') {
      console.log('      - These are unhandled Promise calls in test files');
      console.log('      - Can be fixed by adding await, .catch(), or void operator');
    }
  }

  const topWarning = Object.entries(warningCounts).sort(([,a], [,b]) => b - a)[0];
  if (topWarning) {
    console.log(`   ⚠️  Most Common Warning: "${topWarning[0]}" (${topWarning[1]} instances)`);

    if (topWarning[0] === '@typescript-eslint/prefer-optional-chain') {
      console.log('      - These can be automatically fixed with ESLint --fix');
      console.log('      - Convert logical AND chains to optional chaining');
    }
  }

  if (highImpactFiles.length > 0) {
    console.log(`   🎯 ${highImpactFiles.length} high-impact files need attention`);
    console.log('      - Focus on test files with many floating promise errors');
  }

  console.log();

  // Recommendations
  console.log('🔧 Recommended Actions:');
  console.log('   1. Fix floating promises in test files (add await/void)');
  console.log('   2. Run ESLint --fix for auto-fixable warnings');
  console.log('   3. Address empty block statements in test files');
  console.log('   4. Focus on high-impact files for maximum reduction');

  console.log();
  console.log('📋 Task Completion Summary:');
  console.log(`   ✅ Analyzed ${filesWithIssues} files with linting issues`);
  console.log(`   ✅ Identified ${Object.keys(errorCounts).length} different error types`);
  console.log(`   ✅ Identified ${Object.keys(warningCounts).length} different warning types`);
  console.log(`   ✅ Found ${totalErrors} errors and ${totalWarnings} warnings`);
  console.log(`   ✅ Categorized issues by type and priority`);

} catch (error) {
  console.error('❌ Analysis failed:', error.message);

  // Fallback: try to get basic counts
  try {
    console.log('\n🔄 Attempting basic error count...');
    const basicCount = execSync('yarn lint src --ignore-pattern "**/*\\ *" 2>&1 | grep -c "Error\\|Warning"', {
      encoding: 'utf8'
    });
    console.log(`Found approximately ${basicCount.trim()} total issues`);
  } catch (fallbackError) {
    console.error('❌ Fallback analysis also failed');
  }

  process.exit(1);
}
