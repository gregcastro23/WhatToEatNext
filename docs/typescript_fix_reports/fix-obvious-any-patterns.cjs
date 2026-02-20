#!/usr/bin/env node

/**
 * Fix Obvious Any Patterns
 *
 * Only fixes patterns that are obviously safe and won't break functionality
 */

const fs = require('fs');
const { execSync } = require('child_process');

function fixObviousPatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    const originalContent = content;

    // Only fix patterns that are clearly safe
    const replacements = [
      // Function parameters that are clearly meant to be unknown
      {
        pattern: /\(([^)]*?):\s*any\s*\)/g,
        replacement: (match, param) => {
          // Only replace if it's a simple parameter name (not complex destructuring)
          if (param.includes('{') || param.includes('[') || param.includes('=')) {
            return match; // Don't change complex parameters
          }
          return `(${param}: unknown)`;
        },
        description: 'simple function parameters',
      },
    ];

    for (const { pattern, replacement, description } of replacements) {
      if (typeof replacement === 'function') {
        const newContent = content.replace(pattern, replacement);
        const changeCount =
          (content.match(pattern) || []).length - (newContent.match(pattern) || []).length;
        if (changeCount > 0) {
          content = newContent;
          fixes += changeCount;
          console.log(`  ✓ ${description}: ${changeCount} fixes`);
        }
      } else {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, replacement);
          fixes += matches.length;
          console.log(`  ✓ ${description}: ${matches.length} fixes`);
        }
      }
    }

    if (fixes > 0) {
      // Create backup
      const backupPath = `${filePath}.obvious-any-backup-${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`📝 Applied ${fixes} fixes to ${filePath.split('/').pop()}`);

      // Test TypeScript compilation immediately
      try {
        execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
        return fixes;
      } catch (error) {
        console.log('❌ TypeScript compilation failed - restoring backup');
        fs.writeFileSync(filePath, originalContent);
        return 0;
      }
    }

    return fixes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Instead of trying to fix everything, let's create a summary report
function generateExplicitAnyReport() {
  try {
    const output = execSync(
      'yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any"',
      { encoding: 'utf8' },
    );
    const lines = output
      .trim()
      .split('\n')
      .filter(line => line);

    const fileStats = {};
    const patternStats = {};

    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        const filePath = match[1];
        const fileName = filePath.split('/').pop();
        fileStats[fileName] = (fileStats[fileName] || 0) + 1;

        // Analyze patterns
        if (line.includes('jest.MockedFunction')) {
          patternStats['Jest Mock Functions'] = (patternStats['Jest Mock Functions'] || 0) + 1;
        } else if (line.includes('Record<string, any>')) {
          patternStats['Record Types'] = (patternStats['Record Types'] || 0) + 1;
        } else if (line.includes('any[]')) {
          patternStats['Array Types'] = (patternStats['Array Types'] || 0) + 1;
        } else if (line.includes(': any =')) {
          patternStats['Variable Assignments'] = (patternStats['Variable Assignments'] || 0) + 1;
        } else if (line.includes(': any)')) {
          patternStats['Function Parameters'] = (patternStats['Function Parameters'] || 0) + 1;
        } else {
          patternStats['Other'] = (patternStats['Other'] || 0) + 1;
        }
      }
    });

    console.log('\n📊 Explicit-Any Analysis Report');
    console.log('================================');
    console.log(`Total explicit-any issues: ${lines.length}`);

    console.log('\n🏆 Top Files with Issues:');
    Object.entries(fileStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([file, count]) => {
        console.log(`  ${file}: ${count} issues`);
      });

    console.log('\n🔍 Pattern Breakdown:');
    Object.entries(patternStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([pattern, count]) => {
        console.log(`  ${pattern}: ${count} issues`);
      });

    console.log('\n💡 Recommendations:');
    console.log('  - Many issues are in test files where any types may be appropriate');
    console.log('  - Jest mock functions could use more specific typing');
    console.log('  - Record<string, any> types are often correct for dynamic data');
    console.log('  - Focus on non-test files for the biggest impact');
  } catch (error) {
    console.log('Error generating report:', error.message);
  }
}

console.log('🔧 Explicit-Any Analysis and Targeted Fixes');
console.log('=============================================');

// Generate analysis report
generateExplicitAnyReport();

// Try to make a few safe fixes
console.log('\n🎯 Attempting Safe Fixes...');

const testFiles = [
  'src/components/IngredientRecommender.tsx',
  'src/components/CuisineRecommender.tsx',
  'src/hooks/useEnterpriseIntelligence.ts',
];

let totalFixes = 0;
for (const filePath of testFiles) {
  if (fs.existsSync(filePath)) {
    console.log(`\n🎯 Processing ${filePath.split('/').pop()}`);
    const fixes = fixObviousPatterns(filePath);
    totalFixes += fixes;
  }
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Total fixes applied: ${totalFixes}`);

if (totalFixes > 0) {
  // Final check
  try {
    const lintOutput = execSync(
      'yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l',
      { encoding: 'utf8' },
    );
    const remainingIssues = parseInt(lintOutput.trim());
    console.log(`📊 Remaining explicit-any issues: ${remainingIssues}`);
    console.log(`🎉 Reduced explicit-any issues by ${totalFixes}!`);
  } catch (error) {
    console.log('Could not count remaining issues');
  }
}
