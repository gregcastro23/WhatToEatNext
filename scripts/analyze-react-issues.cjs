#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration for React component analysis
const CONFIG = {
  sourceDir: './src',
  extensions: ['.tsx', '.jsx'],
  excludePatterns: ['node_modules', '.next', 'dist', 'build'],
  outputFile: 'react-issues-analysis.json',
};

// Track analysis metrics
const metrics = {
  filesScanned: 0,
  issuesFound: 0,
  categories: {
    unescapedEntities: 0,
    unknownProperties: 0,
    deprecatedPatterns: 0,
    propTypeIssues: 0,
    react19Compatibility: 0,
  },
};

// Issue types with detection patterns
const ISSUE_PATTERNS = {
  unescapedEntities: {
    patterns: [
      // Only look for actual JSX content, not TypeScript syntax
      /{[^}]*&[^&\s;][^}]*}/g, // Unescaped ampersand in JSX expressions
      />([^<]*&[^&\s;][^<]*)</g, // Unescaped ampersand in JSX text
      />([^<]*'[^<]*)</g, // Unescaped single quote in JSX text
      />([^<]*"[^<]*)</g, // Unescaped double quote in JSX text
    ],
    severity: 'error',
    description: 'Unescaped HTML entities in JSX content',
  },

  unknownProperties: {
    patterns: [
      /<\w+[^>]*\sclass\s*=/g, // Should be className in JSX
      /<\w+[^>]*\sfor\s*=/g, // Should be htmlFor in JSX
      /<\w+[^>]*\sautofocus\s*=/g, // Should be autoFocus in JSX
      /<\w+[^>]*\sreadonly\s*=/g, // Should be readOnly in JSX
      /<\w+[^>]*\stabindex\s*=/g, // Should be tabIndex in JSX
      /<\w+[^>]*\smaxlength\s*=/g, // Should be maxLength in JSX
      /<\w+[^>]*\sminlength\s*=/g, // Should be minLength in JSX
      /<\w+[^>]*\snovalidate\s*=/g, // Should be noValidate in JSX
      /<\w+[^>]*\sformnovalidate\s*=/g, // Should be formNoValidate in JSX
      /<\w+[^>]*\scontenteditable\s*=/g, // Should be contentEditable in JSX
    ],
    severity: 'error',
    description: 'Unknown DOM properties that should be React props',
  },

  deprecatedPatterns: {
    patterns: [
      /componentWillMount/g,
      /componentWillReceiveProps/g,
      /componentWillUpdate/g,
      /React\.createClass/g,
      /React\.PropTypes/g,
      /findDOMNode/g,
      /ReactDOM\.render\(/g, // Should use createRoot in React 18+
    ],
    severity: 'warn',
    description: 'Deprecated React patterns',
  },

  propTypeIssues: {
    patterns: [
      /PropTypes\./g, // Should be using TypeScript instead
      /\.propTypes\s*=/g, // PropTypes definitions
    ],
    severity: 'warn',
    description: 'PropTypes usage (prefer TypeScript)',
  },

  react19Compatibility: {
    patterns: [
      /React\.FC</g, // Prefer explicit function signatures
      /React\.FunctionComponent</g,
      /defaultProps/g, // Not recommended in React 19
      /React\.memo\(\s*\(\s*\{/g, // Potential memo optimization issues
    ],
    severity: 'info',
    description: 'React 19 compatibility concerns',
  },
};

// Common HTML entities that should be escaped
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix =
    {
      info: '✓',
      warn: '⚠',
      error: '✗',
      debug: '→',
    }[type] || '•';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function getAllReactFiles(dir) {
  const files = [];

  function scanDirectory(directory) {
    try {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!CONFIG.excludePatterns.some(pattern => item.includes(pattern))) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          // Check if file has React extension
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

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    metrics.filesScanned++;

    // Check each issue pattern type
    for (const [issueType, config] of Object.entries(ISSUE_PATTERNS)) {
      for (const pattern of config.patterns) {
        let match;
        let lineNumber = 0;

        // Check each line for pattern matches
        for (const line of lines) {
          lineNumber++;
          pattern.lastIndex = 0; // Reset regex state

          while ((match = pattern.exec(line)) !== null) {
            const issue = {
              file: filePath,
              line: lineNumber,
              column: match.index + 1,
              type: issueType,
              severity: config.severity,
              description: config.description,
              matchedText: match[0],
              context: line.trim(),
              suggestion: getSuggestion(issueType, match[0]),
            };

            issues.push(issue);
            metrics.issuesFound++;
            metrics.categories[issueType]++;
          }
        }
      }
    }

    return issues;
  } catch (error) {
    log(`Error analyzing file ${filePath}: ${error.message}`, 'error');
    return [];
  }
}

function getSuggestion(issueType, matchedText) {
  switch (issueType) {
    case 'unescapedEntities':
      // Suggest HTML entity replacement
      for (const [char, entity] of Object.entries(HTML_ENTITIES)) {
        if (matchedText.includes(char)) {
          return `Replace '${char}' with '${entity}'`;
        }
      }
      break;

    case 'unknownProperties':
      const propertyMap = {
        'class=': 'className=',
        'for=': 'htmlFor=',
        'autofocus=': 'autoFocus=',
        'readonly=': 'readOnly=',
        'tabindex=': 'tabIndex=',
        'maxlength=': 'maxLength=',
        'minlength=': 'minLength=',
        'novalidate=': 'noValidate=',
        'formnovalidate=': 'formNoValidate=',
        'contenteditable=': 'contentEditable=',
      };

      for (const [oldProp, newProp] of Object.entries(propertyMap)) {
        if (matchedText.includes(oldProp)) {
          return `Replace '${oldProp}' with '${newProp}'`;
        }
      }
      break;

    case 'deprecatedPatterns':
      const deprecationMap = {
        componentWillMount: 'Use useEffect with empty dependency array',
        componentWillReceiveProps: 'Use useEffect with dependency array',
        componentWillUpdate: 'Use useEffect',
        'React.createClass': 'Use function components or ES6 classes',
        'React.PropTypes': 'Use TypeScript prop types',
        findDOMNode: 'Use refs instead',
        'ReactDOM.render(': 'Use createRoot().render() for React 18+',
      };

      for (const [deprecated, replacement] of Object.entries(deprecationMap)) {
        if (matchedText.includes(deprecated)) {
          return replacement;
        }
      }
      break;

    case 'propTypeIssues':
      return 'Consider using TypeScript interfaces instead of PropTypes';

    case 'react19Compatibility':
      if (matchedText.includes('React.FC')) {
        return 'Consider using explicit function signature instead of React.FC';
      }
      if (matchedText.includes('defaultProps')) {
        return 'Use default parameter values instead of defaultProps';
      }
      break;
  }

  return 'Review and update as needed for React best practices';
}

function generateReport(allIssues) {
  const report = {
    summary: {
      timestamp: new Date().toISOString(),
      filesScanned: metrics.filesScanned,
      totalIssues: metrics.issuesFound,
      categories: metrics.categories,
    },
    issues: allIssues,
    recommendations: generateRecommendations(allIssues),
  };

  // Write detailed JSON report
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));

  return report;
}

function generateRecommendations(allIssues) {
  const recommendations = [];

  // Group issues by file for batch fixing
  const issuesByFile = {};
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });

  // Generate file-specific recommendations
  for (const [file, issues] of Object.entries(issuesByFile)) {
    if (issues.length > 5) {
      recommendations.push({
        type: 'high-priority',
        file,
        message: `File has ${issues.length} React issues - prioritize for fixing`,
        actions: issues.map(i => i.suggestion).slice(0, 3),
      });
    }
  }

  // Generate category-specific recommendations
  if (metrics.categories.unescapedEntities > 0) {
    recommendations.push({
      type: 'automated-fix',
      category: 'unescapedEntities',
      message: 'Unescaped entities can be automatically fixed with string replacement',
      script: 'scripts/fix-unescaped-entities.cjs',
    });
  }

  if (metrics.categories.unknownProperties > 0) {
    recommendations.push({
      type: 'automated-fix',
      category: 'unknownProperties',
      message: 'Unknown properties can be automatically replaced with React equivalents',
      script: 'scripts/fix-unknown-properties.cjs',
    });
  }

  return recommendations;
}

function main() {
  log('Starting React component analysis...');

  // Find all React files
  const reactFiles = getAllReactFiles(CONFIG.sourceDir);
  log(`Found ${reactFiles.length} React component files`);

  if (reactFiles.length === 0) {
    log('No React files found to analyze', 'warn');
    return;
  }

  // Analyze each file
  const allIssues = [];
  let processedFiles = 0;

  for (const file of reactFiles) {
    log(`Analyzing ${path.relative(process.cwd(), file)}...`, 'debug');
    const fileIssues = analyzeFile(file);
    allIssues.push(...fileIssues);

    processedFiles++;
    if (processedFiles % 10 === 0) {
      log(`Progress: ${processedFiles}/${reactFiles.length} files processed`);
    }
  }

  // Generate report
  const report = generateReport(allIssues);

  // Summary output
  log('\n=== React Component Analysis Complete ===');
  log(`Files scanned: ${metrics.filesScanned}`);
  log(`Total issues found: ${metrics.issuesFound}`);
  log('\nIssues by category:');

  for (const [category, count] of Object.entries(metrics.categories)) {
    if (count > 0) {
      log(`  ${category}: ${count} issues`);
    }
  }

  log(`\nDetailed report saved to: ${CONFIG.outputFile}`);

  // Show top issue files
  const fileIssueCount = {};
  allIssues.forEach(issue => {
    fileIssueCount[issue.file] = (fileIssueCount[issue.file] || 0) + 1;
  });

  const topFiles = Object.entries(fileIssueCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (topFiles.length > 0) {
    log('\nTop files needing attention:');
    topFiles.forEach(([file, count]) => {
      log(`  ${path.relative(process.cwd(), file)}: ${count} issues`);
    });
  }

  // Exit with error code if critical issues found
  const criticalIssues = allIssues.filter(i => i.severity === 'error').length;
  if (criticalIssues > 0) {
    log(`\n${criticalIssues} critical issues found that should be fixed`, 'error');
    process.exit(1);
  }
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, getAllReactFiles, ISSUE_PATTERNS };
