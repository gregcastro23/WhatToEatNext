#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 ESLint Error Pattern Analysis\n');

try {
  // Get all linting output
  const output = execSync('yarn lint 2>&1', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  const lines = output.split('\n');

  // Initialize counters
  const errorCounts = {};
  const warningCounts = {};
  const parsingErrors = [];
  const fileErrors = {};

  let currentFile = '';
  let totalErrors = 0;
  let totalWarnings = 0;
  let parsingErrorCount = 0;

  // Process each line
  lines.forEach(line => {
    // Track current file
    if (line.startsWith('/Users/') && line.includes('.tsx') || line.includes('.ts')) {
      currentFile = line.replace('/Users/GregCastro/Desktop/WhatToEatNext/', '');
    }

    // Parse error/warning lines
    const errorMatch = line.match(/^\s*\d+:\d+\s+(error|warning)\s+(.+?)\s+([a-zA-Z@/-]+)$/);
    if (errorMatch) {
      const [, severity, message, rule] = errorMatch;

      if (severity === 'error') {
        totalErrors++;
        errorCounts[rule] = (errorCounts[rule] || 0) + 1;

        if (!fileErrors[currentFile]) fileErrors[currentFile] = { errors: 0, warnings: 0 };
        fileErrors[currentFile].errors++;
      } else {
        totalWarnings++;
        warningCounts[rule] = (warningCounts[rule] || 0) + 1;

        if (!fileErrors[currentFile]) fileErrors[currentFile] = { errors: 0, warnings: 0 };
        fileErrors[currentFile].warnings++;
      }
    }

    // Track parsing errors
    if (line.includes('Parsing error:')) {
      parsingErrorCount++;
      parsingErrors.push(currentFile);
    }
  });

  console.log('📊 ESLint Analysis Summary');
  console.log('==========================\n');

  console.log(`📈 Overall Statistics:`);
  console.log(`   Parsing Errors: ${parsingErrorCount}`);
  console.log(`   Linting Errors: ${totalErrors}`);
  console.log(`   Linting Warnings: ${totalWarnings}`);
  console.log(`   Total Issues: ${parsingErrorCount + totalErrors + totalWarnings}\n`);

  // Top error rules
  if (Object.keys(errorCounts).length > 0) {
    console.log('🚨 Top Error Rules:');
    Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([rule, count], index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}. ${rule.padEnd(50)} ${count.toString().padStart(4)} errors`);
      });
    console.log();
  }

  // Top warning rules
  if (Object.keys(warningCounts).length > 0) {
    console.log('⚠️  Top Warning Rules:');
    Object.entries(warningCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([rule, count], index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}. ${rule.padEnd(50)} ${count.toString().padStart(4)} warnings`);
      });
    console.log();
  }

  // High-impact files
  const highImpactFiles = Object.entries(fileErrors)
    .filter(([, counts]) => counts.errors > 5 || counts.warnings > 20)
    .sort(([,a], [,b]) => (b.errors + b.warnings) - (a.errors + a.warnings));

  if (highImpactFiles.length > 0) {
    console.log('🎯 High-Impact Files:');
    highImpactFiles.slice(0, 15).forEach(([file, counts], index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${file.padEnd(60)} ${counts.errors.toString().padStart(3)}E ${counts.warnings.toString().padStart(3)}W`);
    });
    console.log();
  }

  // Error categorization
  console.log('📂 Error Categories:');

  const categories = {
    'TypeScript Type Issues': ['@typescript-eslint/no-floating-promises', '@typescript-eslint/no-explicit-any', '@typescript-eslint/no-unused-vars'],
    'React Issues': ['react-hooks/exhaustive-deps', 'react/jsx-no-undef', 'react/no-unescaped-entities'],
    'Import/Export Issues': ['import/no-unresolved', 'import/order', 'no-undef'],
    'Code Quality': ['no-console', 'prefer-const', 'eqeqeq', 'no-var'],
    'Parsing Errors': ['parsing-error']
  };

  Object.entries(categories).forEach(([category, rules]) => {
    const categoryErrors = rules.reduce((sum, rule) => sum + (errorCounts[rule] || 0), 0);
    const categoryWarnings = rules.reduce((sum, rule) => sum + (warningCounts[rule] || 0), 0);

    if (category === 'Parsing Errors') {
      console.log(`   ${category.padEnd(25)}: ${parsingErrorCount.toString().padStart(4)} errors`);
    } else if (categoryErrors > 0 || categoryWarnings > 0) {
      console.log(`   ${category.padEnd(25)}: ${categoryErrors.toString().padStart(4)} errors, ${categoryWarnings.toString().padStart(4)} warnings`);
    }
  });

  console.log();

  // Recommendations
  console.log('💡 Key Findings & Recommendations:');

  if (parsingErrorCount > 0) {
    console.log('   🚨 CRITICAL: Fix parsing errors first');
    console.log('      - Many files are not included in tsconfig.json');
    console.log('      - Backup files (with " 3", " 4" suffixes) should be excluded');
    console.log(`      - ${parsingErrorCount} files have parsing errors`);
  }

  const topError = Object.entries(errorCounts).sort(([,a], [,b]) => b - a)[0];
  if (topError && topError[1] > 50) {
    console.log(`   📊 HIGH IMPACT: "${topError[0]}" rule has ${topError[1]} violations`);
    console.log('      - Consider automated fixing for this rule');
  }

  const topWarning = Object.entries(warningCounts).sort(([,a], [,b]) => b - a)[0];
  if (topWarning && topWarning[1] > 100) {
    console.log(`   ⚠️  SYSTEMATIC: "${topWarning[0]}" warning has ${topWarning[1]} instances`);
    console.log('      - Consider batch processing or rule adjustment');
  }

  if (highImpactFiles.length > 0) {
    console.log(`   🎯 FOCUS: ${highImpactFiles.length} high-impact files need attention`);
    console.log('      - Target these files for maximum error reduction');
  }

  console.log();

  // Summary for task completion
  console.log('📋 Task Summary:');
  console.log(`   Total ESLint Issues: ${totalErrors + totalWarnings} (${totalErrors} errors, ${totalWarnings} warnings)`);
  console.log(`   Parsing Issues: ${parsingErrorCount}`);
  console.log(`   Files Needing Attention: ${Object.keys(fileErrors).length}`);
  console.log(`   High-Impact Files: ${highImpactFiles.length}`);

} catch (error) {
  console.error('❌ Analysis failed:', error.message);
  process.exit(1);
}
