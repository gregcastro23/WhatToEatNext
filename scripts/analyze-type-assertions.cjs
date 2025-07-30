#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: './src',
  extensions: ['.ts', '.tsx'],
  excludePatterns: ['node_modules', '.next', 'dist', 'build'],
  outputFile: 'type-assertions-analysis.json'
};

// Track analysis metrics
const metrics = {
  filesScanned: 0,
  assertionsFound: 0,
  categories: {
    unnecessary: 0,
    redundant: 0,
    chainedUnknown: 0,
    preserveExternal: 0,
    potentialImprovement: 0
  }
};

// Type assertion patterns
const ASSERTION_PATTERNS = {
  asType: {
    pattern: /(\w+)\s+as\s+([a-zA-Z_$][\w$<>\[\],\s|&{}]*)/g,
    description: 'Standard type assertion (value as Type)'
  },
  angleType: {
    pattern: /<([a-zA-Z_$][\w$<>\[\],\s|&{}]*)>(\w+)/g,
    description: 'Angle bracket type assertion (<Type>value) - deprecated'
  },
  chainedUnknown: {
    pattern: /(\w+)\s+as\s+unknown\s+as\s+([a-zA-Z_$][\w$<>\[\],\s|&{}]*)/g,
    description: 'Chained unknown assertion (value as unknown as Type)'
  },
  anyAssertion: {
    pattern: /(\w+)\s+as\s+any/g,
    description: 'Any type assertion (value as any)'
  }
};

// Common unnecessary assertion patterns
const UNNECESSARY_PATTERNS = [
  {
    pattern: /(\w+)\s+as\s+string\s*\|\s*undefined/g,
    reason: 'TypeScript can infer string | undefined',
    improvement: 'Remove assertion, use optional chaining'
  },
  {
    pattern: /(\w+)\s+as\s+any\[\]/g,
    reason: 'Use proper array type instead of any[]',
    improvement: 'Define specific array type'
  },
  {
    pattern: /Object\.keys\([^)]+\)\s+as\s+\(keyof\s+\w+\)\[\]/g,
    reason: 'Object.keys() type assertion often unnecessary',
    improvement: 'Use type-safe alternatives or type guard'
  },
  {
    pattern: /JSON\.parse\([^)]+\)\s+as\s+\w+/g,
    reason: 'JSON.parse assertions can be unsafe',
    improvement: 'Use runtime validation or type guard'
  }
];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    debug: '→'
  }[type] || '•';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function getAllTypeScriptFiles(dir) {
  const files = [];
  
  function scanDirectory(directory) {
    try {
      const items = fs.readdirSync(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!CONFIG.excludePatterns.some(pattern => item.includes(pattern))) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          if (CONFIG.extensions.some(ext => fullPath.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      log(`Error scanning directory ${directory}: ${error.message}`, 'error');
    }
  }
  
  scanDirectory(dir);
  return files;
}

function categorizeAssertion(assertion, context) {
  const { expression, originalType, targetType, line, file } = assertion;
  
  // Check for chained unknown assertions
  if (assertion.isChainedUnknown) {
    return {
      category: 'chainedUnknown',
      severity: 'info',
      reason: 'Chained unknown assertion - consider if this is necessary',
      suggestion: 'Review if direct type assertion is possible'
    };
  }
  
  // Check for any assertions
  if (targetType === 'any') {
    return {
      category: 'unnecessary',
      severity: 'warn',
      reason: 'Assertion to any defeats type safety',
      suggestion: 'Use specific type or unknown instead'
    };
  }
  
  // Check for angle bracket syntax (deprecated in TSX)
  if (assertion.isAngleBracket) {
    return {
      category: 'redundant',
      severity: 'error',
      reason: 'Angle bracket assertions deprecated in TSX files',
      suggestion: 'Use "as Type" syntax instead'
    };
  }
  
  // Check for unnecessary patterns
  for (const pattern of UNNECESSARY_PATTERNS) {
    const fullAssertion = `${expression} as ${targetType}`;
    if (pattern.pattern.test(fullAssertion)) {
      return {
        category: 'unnecessary',
        severity: 'warn',
        reason: pattern.reason,
        suggestion: pattern.improvement
      };
    }
  }
  
  // Check if assertion is in external library context
  if (context.includes('import') || 
      context.includes('@types') || 
      context.includes('external') ||
      file.includes('node_modules')) {
    return {
      category: 'preserveExternal',
      severity: 'info',
      reason: 'Likely necessary for external library compatibility',
      suggestion: 'Preserve this assertion'
    };
  }
  
  // Check for common redundant patterns
  if (originalType && targetType && originalType.includes(targetType)) {
    return {
      category: 'redundant',
      severity: 'warn',
      reason: 'Type is already compatible',
      suggestion: 'Remove assertion - TypeScript can infer'
    };
  }
  
  // Default categorization
  return {
    category: 'potentialImprovement',
    severity: 'info',
    reason: 'Review if type assertion is necessary',
    suggestion: 'Consider improving type inference instead'
  };
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const assertions = [];
    
    metrics.filesScanned++;
    
    // Find all type assertions
    for (const [patternName, patternConfig] of Object.entries(ASSERTION_PATTERNS)) {
      let match;
      let lineNumber = 0;
      
      for (const line of lines) {
        lineNumber++;
        patternConfig.pattern.lastIndex = 0; // Reset regex state
        
        while ((match = patternConfig.pattern.exec(line)) !== null) {
          let assertion;
          
          if (patternName === 'angleType') {
            assertion = {
              file: filePath,
              line: lineNumber,
              column: match.index + 1,
              expression: match[2],
              targetType: match[1],
              originalType: null,
              context: line.trim(),
              patternType: patternName,
              isAngleBracket: true,
              fullMatch: match[0]
            };
          } else if (patternName === 'chainedUnknown') {
            assertion = {
              file: filePath,
              line: lineNumber,
              column: match.index + 1,
              expression: match[1],
              targetType: match[2],
              originalType: null,
              context: line.trim(),
              patternType: patternName,
              isChainedUnknown: true,
              fullMatch: match[0]
            };
          } else {
            assertion = {
              file: filePath,
              line: lineNumber,
              column: match.index + 1,
              expression: match[1],
              targetType: match[2],
              originalType: null,
              context: line.trim(),
              patternType: patternName,
              fullMatch: match[0]
            };
          }
          
          // Categorize the assertion
          const analysis = categorizeAssertion(assertion, assertion.context);
          assertion.analysis = analysis;
          
          assertions.push(assertion);
          metrics.assertionsFound++;
          metrics.categories[analysis.category]++;
        }
      }
    }
    
    return assertions;
  } catch (error) {
    log(`Error analyzing file ${filePath}: ${error.message}`, 'error');
    return [];
  }
}

function generateFixSuggestions(assertions) {
  const suggestions = [];
  
  // Group by category for batch suggestions
  const byCategory = {};
  assertions.forEach(assertion => {
    const category = assertion.analysis.category;
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(assertion);
  });
  
  // Generate category-specific suggestions
  if (byCategory.unnecessary?.length > 0) {
    suggestions.push({
      category: 'unnecessary',
      priority: 'high',
      count: byCategory.unnecessary.length,
      action: 'Remove unnecessary type assertions',
      script: 'scripts/fix-unnecessary-assertions.cjs',
      examples: byCategory.unnecessary.slice(0, 3).map(a => ({
        file: path.basename(a.file),
        line: a.line,
        assertion: a.fullMatch,
        suggestion: a.analysis.suggestion
      }))
    });
  }
  
  if (byCategory.redundant?.length > 0) {
    suggestions.push({
      category: 'redundant',
      priority: 'medium',
      count: byCategory.redundant.length,
      action: 'Remove redundant type assertions',
      script: 'scripts/fix-redundant-assertions.cjs',
      examples: byCategory.redundant.slice(0, 3).map(a => ({
        file: path.basename(a.file),
        line: a.line,
        assertion: a.fullMatch,
        suggestion: a.analysis.suggestion
      }))
    });
  }
  
  if (byCategory.chainedUnknown?.length > 0) {
    suggestions.push({
      category: 'chainedUnknown',
      priority: 'low',
      count: byCategory.chainedUnknown.length,
      action: 'Review chained unknown assertions',
      manual: true,
      note: 'These may be necessary for complex type conversions'
    });
  }
  
  return suggestions;
}

function generateReport(allAssertions) {
  const report = {
    summary: {
      timestamp: new Date().toISOString(),
      filesScanned: metrics.filesScanned,
      totalAssertions: metrics.assertionsFound,
      categories: metrics.categories
    },
    assertions: allAssertions,
    suggestions: generateFixSuggestions(allAssertions),
    topFiles: getTopFiles(allAssertions)
  };
  
  // Write detailed JSON report
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
  
  return report;
}

function getTopFiles(assertions) {
  const fileCount = {};
  assertions.forEach(assertion => {
    fileCount[assertion.file] = (fileCount[assertion.file] || 0) + 1;
  });
  
  return Object.entries(fileCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([file, count]) => ({
      file: path.relative(process.cwd(), file),
      assertions: count
    }));
}

function main() {
  log('Starting type assertion analysis...');
  
  // Find all TypeScript files
  const tsFiles = getAllTypeScriptFiles(CONFIG.sourceDir);
  log(`Found ${tsFiles.length} TypeScript files`);
  
  if (tsFiles.length === 0) {
    log('No TypeScript files found to analyze', 'warn');
    return;
  }
  
  // Analyze each file
  const allAssertions = [];
  let processedFiles = 0;
  
  for (const file of tsFiles) {
    log(`Analyzing ${path.relative(process.cwd(), file)}...`, 'debug');
    const fileAssertions = analyzeFile(file);
    allAssertions.push(...fileAssertions);
    
    processedFiles++;
    if (processedFiles % 20 === 0) {
      log(`Progress: ${processedFiles}/${tsFiles.length} files processed`);
    }
  }
  
  // Generate report
  const report = generateReport(allAssertions);
  
  // Summary output
  log('\n=== Type Assertion Analysis Complete ===');
  log(`Files scanned: ${metrics.filesScanned}`);
  log(`Total assertions found: ${metrics.assertionsFound}`);
  log('\nAssertions by category:');
  
  for (const [category, count] of Object.entries(metrics.categories)) {
    if (count > 0) {
      log(`  ${category}: ${count} assertions`);
    }
  }
  
  log(`\nDetailed report saved to: ${CONFIG.outputFile}`);
  
  // Show fix suggestions
  if (report.suggestions.length > 0) {
    log('\nRecommended actions:');
    report.suggestions.forEach(suggestion => {
      log(`  ${suggestion.action}: ${suggestion.count} cases (${suggestion.priority} priority)`);
      if (suggestion.script) {
        log(`    Script: ${suggestion.script}`);
      }
    });
  }
  
  // Show top files
  if (report.topFiles.length > 0) {
    log('\nTop files with type assertions:');
    report.topFiles.forEach(fileInfo => {
      log(`  ${fileInfo.file}: ${fileInfo.assertions} assertions`);
    });
  }
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, categorizeAssertion, ASSERTION_PATTERNS };