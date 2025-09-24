#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Analyzing TypeScript Syntax Errors...\n');

try {
  // Get all TypeScript errors
  let tscOutput;
  try {
    tscOutput = execSync('yarn tsc --noEmit --skipLibCheck', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error) {
    // TypeScript errors cause non-zero exit code, but we want the output
    tscOutput = error.stdout + error.stderr;
  }

  const lines = tscOutput.split('\n').filter(line => line.includes('error TS'));

  console.log(`📊 Total TypeScript errors found: ${lines.length}\n`);

  // Categorize errors by type
  const errorCategories = {
    'TS1005': { name: 'Expected token', count: 0, examples: [] },
    'TS1109': { name: 'Expression expected', count: 0, examples: [] },
    'TS1128': { name: 'Declaration or statement expected', count: 0, examples: [] },
    'TS1161': { name: 'Unterminated regular expression', count: 0, examples: [] },
    'TS1434': { name: 'Unexpected keyword or identifier', count: 0, examples: [] },
    'TS2304': { name: 'Cannot find name', count: 0, examples: [] },
    'TS2339': { name: 'Property does not exist', count: 0, examples: [] },
    'TS2345': { name: 'Argument type mismatch', count: 0, examples: [] },
    'TS2571': { name: 'Object is of type unknown', count: 0, examples: [] },
    'TS2322': { name: 'Type assignment error', count: 0, examples: [] },
    'TS18046': { name: 'Variable is of type unknown', count: 0, examples: [] },
    'Other': { name: 'Other errors', count: 0, examples: [] }
  };

  // Analyze each error
  lines.forEach(line => {
    let categorized = false;

    for (const [errorCode, category] of Object.entries(errorCategories)) {
      if (errorCode !== 'Other' && line.includes(`error ${errorCode}`)) {
        category.count++;
        if (category.examples.length < 3) {
          category.examples.push(line.trim());
        }
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      errorCategories.Other.count++;
      if (errorCategories.Other.examples.length < 3) {
        errorCategories.Other.examples.push(line.trim());
      }
    }
  });

  // Report findings
  console.log('📋 Error Category Breakdown:\n');

  Object.entries(errorCategories).forEach(([code, category]) => {
    if (category.count > 0) {
      console.log(`${code}: ${category.name}`);
      console.log(`  Count: ${category.count}`);
      console.log(`  Examples:`);
      category.examples.forEach(example => {
        console.log(`    ${example.substring(0, 120)}...`);
      });
      console.log('');
    }
  });

  // Focus on syntax errors specifically
  const syntaxErrors = [
    errorCategories['TS1005'],
    errorCategories['TS1109'],
    errorCategories['TS1128'],
    errorCategories['TS1161'],
    errorCategories['TS1434']
  ];

  const totalSyntaxErrors = syntaxErrors.reduce((sum, cat) => sum + cat.count, 0);

  console.log('🚨 SYNTAX ERROR SUMMARY:');
  console.log(`Total Syntax Errors (TS1xxx): ${totalSyntaxErrors}`);

  if (totalSyntaxErrors === 0) {
    console.log('✅ No syntax errors found! All TS1xxx errors have been resolved.');
  } else {
    console.log('❌ Syntax errors still present:');
    syntaxErrors.forEach(category => {
      if (category.count > 0) {
        console.log(`  - ${category.name}: ${category.count} errors`);
      }
    });
  }

  // Check for malformed patterns that might cause issues
  console.log('\n🔍 Checking for malformed patterns...');

  const malformedPatterns = [
    'as unknown as',
    'as any',
    '} as {',
    'unknown)',
    'unknown;',
    'unknown,',
    'Record<string, unknown>',
    'object is of type \'unknown\''
  ];

  malformedPatterns.forEach(pattern => {
    const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
    if (matches.length > 0) {
      console.log(`  Pattern "${pattern}": ${matches.length} occurrences`);
    }
  });

  // Generate report file
  const report = {
    timestamp: new Date().toISOString(),
    totalErrors: lines.length,
    syntaxErrors: totalSyntaxErrors,
    categories: errorCategories,
    analysis: {
      hasSyntaxErrors: totalSyntaxErrors > 0,
      majorIssues: Object.entries(errorCategories)
        .filter(([code, cat]) => cat.count > 50)
        .map(([code, cat]) => ({ code, count: cat.count, name: cat.name })),
      recommendations: []
    }
  };

  if (totalSyntaxErrors === 0) {
    report.analysis.recommendations.push('✅ All syntax errors resolved - focus on type errors');
  } else {
    report.analysis.recommendations.push('🚨 Address remaining syntax errors first');
  }

  if (errorCategories['TS2571'].count > 100) {
    report.analysis.recommendations.push('🔧 High number of "unknown" type errors - consider type assertion fixes');
  }

  if (errorCategories['TS2339'].count > 100) {
    report.analysis.recommendations.push('🔧 High number of property access errors - check interface definitions');
  }

  fs.writeFileSync('syntax-error-analysis.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: syntax-error-analysis.json');

} catch (error) {
  console.error('❌ Error analyzing TypeScript errors:', error.message);
  process.exit(1);
}
