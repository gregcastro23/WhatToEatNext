#!/usr/bin/env node

/**
 * Enhanced TypeScript Warning Fixer v1.0
 * 
 * Dedicated script for handling TypeScript and ESLint warnings:
 * - Unused variables and imports
 * - Console statements
 * - Explicit any types
 * - Deprecated APIs
 * - Performance warnings
 * - Code quality improvements
 * 
 * Features:
 * - Safe unused variable prefixing
 * - Intelligent import cleanup
 * - Console statement management
 * - Type safety improvements
 * - Performance optimization suggestions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  maxFiles: parseInt(process.argv.find(arg => arg.startsWith('--max-files='))?.split('=')[1] || '30'),
  dryRun: process.argv.includes('--dry-run'),
  aggressive: process.argv.includes('--aggressive'),
  includeConsole: process.argv.includes('--include-console'),
  
  targetWarnings: [
    'unused-variable',
    'unused-import', 
    'console-statement',
    'explicit-any',
    'deprecated-api',
    'performance-warning'
  ],
  
  safetyThreshold: 0.90,
  buildValidationInterval: 10
};

// Metrics
const METRICS = {
  totalFiles: 0,
  processedFiles: 0,
  warningsFixed: 0,
  warningsSkipped: 0,
  startTime: Date.now(),
  processingTime: 0,
  patternSuccessRates: new Map()
};

// Warning Patterns
const WARNING_PATTERNS = {
  'unused-variable': {
    name: 'Unused Variable',
    priority: 'medium',
    patterns: [
      {
        regex: /'([^']+)' is declared but its value is never read/,
        fix: (content, match, varName) => {
          // Prefix with underscore to mark as intentionally unused
          const varPattern = new RegExp(`\\b${varName}\\b(?=\\s*[=:,)]|$)`, 'g');
          return content.replace(varPattern, `_${varName}`);
        },
        confidence: 0.95
      },
      {
        regex: /Parameter '([^']+)' is declared but its value is never read/,
        fix: (content, match, paramName) => {
          // Prefix parameter with underscore
          const paramPattern = new RegExp(`\\b${paramName}\\b(?=\\s*[,:)]|$)`, 'g');
          return content.replace(paramPattern, `_${paramName}`);
        },
        confidence: 0.95
      }
    ]
  },
  
  'unused-import': {
    name: 'Unused Import',
    priority: 'high',
    patterns: [
      {
        regex: /'([^']+)' is defined but never used/,
        fix: (content, match, importName) => {
          // Remove unused imports intelligently
          const lines = content.split('\n');
          let modified = false;
          
          const newLines = lines.map(line => {
            if (line.includes('import') && line.includes(importName)) {
              // Handle different import patterns
              if (line.includes(`{ ${importName} }`)) {
                // Single import in braces
                return line.replace(`{ ${importName} }`, '{}').replace(/import\s*\{\s*\}\s*from[^;]+;/, '');
              } else if (line.includes(`{`) && line.includes(`}`)) {
                // Multiple imports - remove just this one
                const imports = line.match(/\{([^}]+)\}/)?.[1];
                if (imports) {
                  const importList = imports.split(',')
                    .map(i => i.trim())
                    .filter(i => i !== importName && !i.includes(importName));
                  
                  if (importList.length === 0) {
                    modified = true;
                    return ''; // Remove entire import line
                  } else {
                    modified = true;
                    return line.replace(/\{[^}]+\}/, `{ ${importList.join(', ')} }`);
                  }
                }
              } else if (line.includes(`import ${importName}`)) {
                // Default import
                modified = true;
                return '';
              }
            }
            return line;
          }).filter(line => line !== '');
          
          return modified ? newLines.join('\n') : content;
        },
        confidence: 0.90
      }
    ]
  },
  
  'console-statement': {
    name: 'Console Statement',
    priority: 'low',
    patterns: [
      {
        regex: /console\.(log|warn|error|info|debug)\s*\([^)]*\)/g,
        fix: (content, match) => {
          if (!CONFIG.includeConsole) return content;
          
          // Comment out console statements instead of removing
          return content.replace(match, `// ${match}`);
        },
        confidence: 0.95
      }
    ]
  },
  
  'explicit-any': {
    name: 'Explicit Any Type',
    priority: 'medium',
    patterns: [
      {
        regex: /:\s*any\b/g,
        fix: (content, match) => {
          if (!CONFIG.aggressive) return content;
          
          // Replace with unknown for better type safety
          return content.replace(match, ': unknown');
        },
        confidence: 0.70
      },
      {
        regex: /as\s+any\b/g,
        fix: (content, match) => {
          if (!CONFIG.aggressive) return content;
          
          // Replace with unknown assertion
          return content.replace(match, 'as unknown');
        },
        confidence: 0.75
      }
    ]
  },
  
  'deprecated-api': {
    name: 'Deprecated API',
    priority: 'medium',
    patterns: [
      {
        regex: /componentWillMount|componentWillReceiveProps|componentWillUpdate/g,
        fix: (content, match) => {
          // Comment out deprecated React lifecycle methods
          return content.replace(match, `// DEPRECATED: ${match}`);
        },
        confidence: 0.85
      }
    ]
  },
  
  'performance-warning': {
    name: 'Performance Warning',
    priority: 'low',
    patterns: [
      {
        regex: /React\.createElement/g,
        fix: (content, match) => {
          // Suggest JSX instead of createElement for better performance
          return content; // Keep as is, just flag for review
        },
        confidence: 0.60
      }
    ]
  }
};

/**
 * Utility Functions
 */
async function validateBuild() {
  try {
    execSync('yarn build', { stdio: 'pipe', timeout: 45000 });
    return true;
  } catch (error) {
    return false;
  }
}

function detectProblematicPatterns(content, filePath) {
  const problematicPatterns = [
    /\$1\$2|\$\d+/g,  // Regex replacement artifacts
    /,;,;,;/g,        // Malformed syntax
    /_{3,}/g          // Multiple underscores (potential corruption)
  ];
  
  for (const pattern of problematicPatterns) {
    if (pattern.test(content)) {
      console.warn(`⚠️  Problematic pattern detected in ${filePath}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Main Processing Functions
 */
async function fixTypeScriptWarnings() {
  console.log('⚠️  Enhanced TypeScript Warning Fixer v1.0');
  console.log('============================================');
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log(`Max Files: ${CONFIG.maxFiles} | Aggressive: ${CONFIG.aggressive ? 'ON' : 'OFF'}`);
  console.log(`Include Console: ${CONFIG.includeConsole ? 'YES' : 'NO'}`);
  console.log(`Targets: ${CONFIG.targetWarnings.join(', ')}`);
  console.log('');

  try {
    const warnings = await getTypeScriptWarnings();
    console.log(`📊 Found ${warnings.length} warnings to analyze`);
    
    const fileWarnings = groupAndPrioritizeWarnings(warnings);
    console.log(`📁 Warnings distributed across ${fileWarnings.size} files`);
    
    const processedResults = await processFiles(fileWarnings);
    
    generateReport(processedResults);
    
    if (!CONFIG.dryRun && processedResults.length > 0) {
      console.log('\n🔨 Final build validation...');
      const buildSuccess = await validateBuild();
      console.log(`Build Status: ${buildSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

async function getTypeScriptWarnings() {
  try {
    // Get TypeScript warnings
    const tsOutput = execSync('npx tsc --noEmit', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 60000 
    });
    
    // Get ESLint warnings
    let eslintOutput = '';
    try {
      eslintOutput = execSync('npx eslint src/ --format=compact', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 60000 
      });
    } catch (eslintError) {
      eslintOutput = eslintError.stdout || '';
    }
    
    return parseWarningsFromOutput(tsOutput + '\n' + eslintOutput);
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    return parseWarningsFromOutput(output);
  }
}

function parseWarningsFromOutput(output) {
  const lines = output.split('\n');
  const warnings = [];
  
  for (const line of lines) {
    // TypeScript warnings
    const tsMatch = line.match(/^(.+?)\((\d+),(\d+)\):\s+warning\s+(TS\d+):\s*(.+)$/);
    if (tsMatch) {
      const [, filePath, lineNum, colNum, code, message] = tsMatch;
      warnings.push({
        filePath: path.resolve(filePath),
        line: parseInt(lineNum),
        column: parseInt(colNum),
        type: 'typescript',
        code,
        message,
        priority: calculateWarningPriority(code, filePath, message)
      });
      continue;
    }
    
    // ESLint warnings
    const eslintMatch = line.match(/^(.+?):\s+line\s+(\d+),\s+col\s+(\d+),\s+(Warning|Error)\s+-\s+(.+?)\s+\(([^)]+)\)$/);
    if (eslintMatch) {
      const [, filePath, lineNum, colNum, severity, message, rule] = eslintMatch;
      warnings.push({
        filePath: path.resolve(filePath),
        line: parseInt(lineNum),
        column: parseInt(colNum),
        type: 'eslint',
        code: rule,
        message,
        priority: calculateWarningPriority(rule, filePath, message)
      });
    }
  }
  
  return warnings;
}

function calculateWarningPriority(code, filePath, message) {
  let priority = 0;
  
  // High priority warning types
  const highPriorityWarnings = ['unused-import', '@typescript-eslint/no-unused-vars'];
  if (highPriorityWarnings.some(warning => code.includes(warning))) priority += 10;
  
  // Medium priority
  const mediumPriorityWarnings = ['unused-variable', 'explicit-any'];
  if (mediumPriorityWarnings.some(warning => code.includes(warning))) priority += 5;
  
  // File type priority
  if (filePath.includes('/components/')) priority += 3;
  if (filePath.includes('/services/')) priority += 2;
  if (filePath.includes('/utils/')) priority += 1;
  
  // Message content priority
  if (message.includes('never used')) priority += 5;
  if (message.includes('never read')) priority += 4;
  
  return priority;
}

function groupAndPrioritizeWarnings(warnings) {
  const fileMap = new Map();
  
  for (const warning of warnings) {
    if (!fileMap.has(warning.filePath)) {
      fileMap.set(warning.filePath, []);
    }
    fileMap.get(warning.filePath).push(warning);
  }
  
  const sortedFiles = Array.from(fileMap.entries()).sort((a, b) => {
    const priorityA = a[1].reduce((sum, warning) => sum + warning.priority, 0);
    const priorityB = b[1].reduce((sum, warning) => sum + warning.priority, 0);
    return priorityB - priorityA;
  });
  
  return new Map(sortedFiles.slice(0, CONFIG.maxFiles));
}

async function processFiles(fileWarnings) {
  const results = [];
  const files = Array.from(fileWarnings.keys());
  
  for (const filePath of files) {
    const result = await processFile(filePath, fileWarnings.get(filePath));
    results.push(result);
    
    if (results.length % CONFIG.buildValidationInterval === 0 && !CONFIG.dryRun) {
      const buildSuccess = await validateBuild();
      if (!buildSuccess) {
        console.warn('⚠️  Build validation failed, stopping processing');
        break;
      }
    }
  }
  
  return results;
}

async function processFile(filePath, warnings) {
  const startTime = Date.now();
  
  try {
    if (!fs.existsSync(filePath)) {
      return { filePath, success: false, error: 'File not found' };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    if (detectProblematicPatterns(content, filePath)) {
      return { filePath, success: false, error: 'Problematic patterns detected' };
    }
    
    let fixesApplied = 0;
    const appliedFixes = [];
    
    for (const warning of warnings) {
      const warningType = determineWarningType(warning);
      const patterns = WARNING_PATTERNS[warningType]?.patterns || [];
      
      for (const pattern of patterns) {
        if (pattern.confidence >= CONFIG.safetyThreshold) {
          const matches = Array.from(content.matchAll(new RegExp(pattern.regex.source, 'g')));
          
          for (const match of matches) {
            if (match[0] && warning.message.includes(match[1] || match[0])) {
              try {
                const newContent = pattern.fix(content, ...match);
                if (newContent !== content) {
                  content = newContent;
                  fixesApplied++;
                  appliedFixes.push({
                    pattern: pattern.regex.toString(),
                    confidence: pattern.confidence,
                    warningType
                  });
                  
                  const patternKey = `${warningType}_${pattern.regex.toString()}`;
                  METRICS.patternSuccessRates.set(
                    patternKey,
                    (METRICS.patternSuccessRates.get(patternKey) || 0) + 1
                  );
                  break; // Only apply one fix per warning
                }
              } catch (error) {
                console.warn(`⚠️  Pattern fix failed for ${warningType}: ${error.message}`);
              }
            }
          }
        }
      }
    }
    
    if (!CONFIG.dryRun && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    const processingTime = Date.now() - startTime;
    METRICS.processingTime += processingTime;
    METRICS.processedFiles++;
    METRICS.warningsFixed += fixesApplied;
    
    return {
      filePath,
      success: true,
      fixesApplied,
      appliedFixes,
      processingTime,
      changed: content !== originalContent
    };
    
  } catch (error) {
    return {
      filePath,
      success: false,
      error: error.message
    };
  }
}

function determineWarningType(warning) {
  const message = warning.message.toLowerCase();
  const code = warning.code.toLowerCase();
  
  if (message.includes('never read') || message.includes('never used') || code.includes('unused')) {
    if (message.includes('import') || code.includes('import')) {
      return 'unused-import';
    }
    return 'unused-variable';
  }
  
  if (message.includes('console') || code.includes('console')) {
    return 'console-statement';
  }
  
  if (message.includes('any') || code.includes('any')) {
    return 'explicit-any';
  }
  
  if (message.includes('deprecated') || code.includes('deprecated')) {
    return 'deprecated-api';
  }
  
  return 'performance-warning';
}

function generateReport(results) {
  const totalTime = Date.now() - METRICS.startTime;
  const successfulFiles = results.filter(r => r.success).length;
  const totalFixes = results.reduce((sum, r) => sum + (r.fixesApplied || 0), 0);
  
  console.log('\n📊 WARNING PROCESSING REPORT');
  console.log('=============================');
  console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`📁 Files Processed: ${successfulFiles}/${results.length}`);
  console.log(`🔧 Total Fixes Applied: ${totalFixes}`);
  console.log(`✅ Success Rate: ${((successfulFiles / results.length) * 100).toFixed(1)}%`);
  console.log(`⚠️  Warnings Fixed: ${METRICS.warningsFixed}`);
  console.log(`⏭️  Warnings Skipped: ${METRICS.warningsSkipped}`);
  
  if (METRICS.processedFiles > 0) {
    console.log(`⚡ Average File Time: ${(METRICS.processingTime / METRICS.processedFiles).toFixed(0)}ms`);
  }
  
  if (METRICS.patternSuccessRates.size > 0) {
    console.log('\n🎯 Top Performing Patterns:');
    const sortedPatterns = Array.from(METRICS.patternSuccessRates.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedPatterns.forEach(([pattern, count]) => {
      console.log(`   ${pattern.split('_')[0]}: ${count} successful applications`);
    });
  }
  
  console.log('\n✨ Warning processing complete!');
  
  if (CONFIG.dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

// Main execution
fixTypeScriptWarnings().catch(console.error); 