#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Safety configuration
const SAFETY_CONFIG = {
  maxFilesPerBatch: 10,
  createBackup: true,
  validateBuild: true,
  dryRun: process.argv.includes('--dry-run')
};

// Common patterns for fixing exhaustive-deps
const FIX_PATTERNS = {
  // Pattern to detect missing dependencies
  missingDependency: /React Hook \w+ has a missing dependency: '([^']+)'/,
  // Pattern to detect complex expressions
  complexExpression: /React Hook \w+ has a complex expression in the dependency array/,
  // Pattern to detect unnecessary dependencies
  unnecessaryDependency: /React Hook \w+ has an unnecessary dependency: '([^']+)'/,
  // Pattern to detect multiple missing dependencies
  multipleMissing: /React Hook \w+ has missing dependencies: (.+)\. Either include them or remove the dependency array/
};

// Track metrics
const metrics = {
  filesProcessed: 0,
  warningsFixed: 0,
  warningsSkipped: 0,
  errors: []
};

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

function createBackup(filePath) {
  const backupPath = `${filePath}.backup-${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function getExhaustiveDepsWarnings() {
  try {
    // Check if lint-results.json exists, otherwise run eslint
    const lintResultsPath = path.join(process.cwd(), 'lint-results.json');
    let results;
    
    if (fs.existsSync(lintResultsPath)) {
      log('Reading from existing lint-results.json...');
      const content = fs.readFileSync(lintResultsPath, 'utf8');
      results = JSON.parse(content);
    } else {
      log('Running ESLint to get exhaustive-deps warnings...');
      // Run ESLint with specific rule filter to reduce output
      execSync('yarn eslint --config eslint.config.cjs src --format=json --rule "react-hooks/exhaustive-deps: warn" > lint-results-deps.json', { 
        encoding: 'utf8',
        stdio: 'inherit'
      });
      const output = fs.readFileSync('lint-results-deps.json', 'utf8');
      results = JSON.parse(output);
    }
    
    const warnings = [];
    
    results.forEach(fileResult => {
      fileResult.messages.forEach(message => {
        if (message.ruleId === 'react-hooks/exhaustive-deps') {
          warnings.push({
            file: fileResult.filePath,
            line: message.line,
            column: message.column,
            message: message.message,
            endLine: message.endLine,
            endColumn: message.endColumn,
            suggestions: message.suggestions || []
          });
        }
      });
    });
    
    return warnings;
  } catch (error) {
    log(`Error getting ESLint results: ${error.message}`, 'error');
    return [];
  }
}

function parseWarningType(message) {
  if (FIX_PATTERNS.missingDependency.test(message)) {
    const match = message.match(FIX_PATTERNS.missingDependency);
    return { type: 'missing', dependencies: [match[1]] };
  }
  
  if (FIX_PATTERNS.multipleMissing.test(message)) {
    const match = message.match(FIX_PATTERNS.multipleMissing);
    const deps = match[1].split(/,\s*and\s*|,\s*/)
      .map(dep => dep.replace(/^'|'$/g, '').trim());
    return { type: 'missing', dependencies: deps };
  }
  
  if (FIX_PATTERNS.unnecessaryDependency.test(message)) {
    const match = message.match(FIX_PATTERNS.unnecessaryDependency);
    return { type: 'unnecessary', dependency: match[1] };
  }
  
  if (FIX_PATTERNS.complexExpression.test(message)) {
    return { type: 'complex' };
  }
  
  return { type: 'unknown' };
}

function findHookCall(lines, warningLine) {
  // Search backwards from the warning line to find the hook call
  for (let i = warningLine - 1; i >= 0; i--) {
    if (lines[i].match(/use(Effect|Callback|Memo|LayoutEffect)\s*\(/)) {
      return i;
    }
  }
  return -1;
}

function findDependencyArray(lines, startLine) {
  // Find the dependency array starting from the hook call
  let braceCount = 0;
  let inArray = false;
  let arrayStart = -1;
  let arrayEnd = -1;
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '(') braceCount++;
      if (char === ')') braceCount--;
      
      if (char === '[' && !inArray) {
        inArray = true;
        arrayStart = { line: i, column: j };
      }
      
      if (char === ']' && inArray) {
        arrayEnd = { line: i, column: j };
        return { start: arrayStart, end: arrayEnd };
      }
    }
    
    // Stop if we've closed all parentheses
    if (braceCount === 0 && i > startLine) {
      break;
    }
  }
  
  return null;
}

function extractCurrentDependencies(lines, depArray) {
  if (!depArray) return [];
  
  // Extract the content between [ and ]
  let content = '';
  
  if (depArray.start.line === depArray.end.line) {
    content = lines[depArray.start.line].substring(
      depArray.start.column + 1,
      depArray.end.column
    );
  } else {
    // Multi-line array
    content = lines[depArray.start.line].substring(depArray.start.column + 1);
    for (let i = depArray.start.line + 1; i < depArray.end.line; i++) {
      content += '\n' + lines[i];
    }
    content += '\n' + lines[depArray.end.line].substring(0, depArray.end.column);
  }
  
  // Parse dependencies (simple parsing, might need improvement for complex cases)
  return content
    .split(',')
    .map(dep => dep.trim())
    .filter(dep => dep.length > 0);
}

function applyMissingDependencyFix(lines, warning) {
  const hookLine = findHookCall(lines, warning.line - 1);
  if (hookLine === -1) {
    log(`Could not find hook call for warning at line ${warning.line}`, 'warn');
    return false;
  }
  
  const depArray = findDependencyArray(lines, hookLine);
  if (!depArray) {
    log(`Could not find dependency array for hook at line ${hookLine + 1}`, 'warn');
    return false;
  }
  
  const currentDeps = extractCurrentDependencies(lines, depArray);
  const { dependencies } = parseWarningType(warning.message);
  
  // Add missing dependencies
  const newDeps = [...currentDeps];
  dependencies.forEach(dep => {
    if (!currentDeps.includes(dep)) {
      newDeps.push(dep);
    }
  });
  
  // Reconstruct the dependency array
  const newDepString = newDeps.join(', ');
  
  if (depArray.start.line === depArray.end.line) {
    // Single line array
    const line = lines[depArray.start.line];
    lines[depArray.start.line] = 
      line.substring(0, depArray.start.column + 1) +
      newDepString +
      line.substring(depArray.end.column);
  } else {
    // Multi-line array - convert to single line for simplicity
    const startLine = lines[depArray.start.line];
    const endLine = lines[depArray.end.line];
    
    lines[depArray.start.line] = 
      startLine.substring(0, depArray.start.column + 1) +
      newDepString +
      endLine.substring(depArray.end.column);
    
    // Remove the lines in between
    lines.splice(depArray.start.line + 1, depArray.end.line - depArray.start.line);
  }
  
  return true;
}

function applyUnnecessaryDependencyFix(lines, warning) {
  const hookLine = findHookCall(lines, warning.line - 1);
  if (hookLine === -1) return false;
  
  const depArray = findDependencyArray(lines, hookLine);
  if (!depArray) return false;
  
  const currentDeps = extractCurrentDependencies(lines, depArray);
  const { dependency } = parseWarningType(warning.message);
  
  // Remove the unnecessary dependency
  const newDeps = currentDeps.filter(dep => dep !== dependency);
  
  // Reconstruct the dependency array
  const newDepString = newDeps.join(', ');
  
  if (depArray.start.line === depArray.end.line) {
    const line = lines[depArray.start.line];
    lines[depArray.start.line] = 
      line.substring(0, depArray.start.column + 1) +
      newDepString +
      line.substring(depArray.end.column);
  }
  
  return true;
}

function processFile(filePath, warnings) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'error');
    return;
  }
  
  log(`Processing ${path.basename(filePath)} (${warnings.length} warnings)`);
  
  if (SAFETY_CONFIG.createBackup && !SAFETY_CONFIG.dryRun) {
    const backupPath = createBackup(filePath);
    log(`Created backup: ${path.basename(backupPath)}`, 'debug');
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixed = 0;
  
  // Sort warnings by line number in reverse order to avoid line number shifts
  warnings.sort((a, b) => b.line - a.line);
  
  warnings.forEach(warning => {
    const warningType = parseWarningType(warning.message);
    
    if (SAFETY_CONFIG.dryRun) {
      log(`[DRY RUN] Would fix ${warningType.type} dependency at line ${warning.line}`, 'debug');
      if (warningType.type === 'missing') {
        log(`  Dependencies to add: ${warningType.dependencies.join(', ')}`, 'debug');
      }
      fixed++;
      return;
    }
    
    let success = false;
    
    switch (warningType.type) {
      case 'missing':
        success = applyMissingDependencyFix(lines, warning);
        break;
      case 'unnecessary':
        success = applyUnnecessaryDependencyFix(lines, warning);
        break;
      case 'complex':
        log(`Skipping complex expression at line ${warning.line} (requires manual fix)`, 'warn');
        metrics.warningsSkipped++;
        return;
      default:
        log(`Unknown warning type at line ${warning.line}`, 'warn');
        metrics.warningsSkipped++;
        return;
    }
    
    if (success) {
      fixed++;
      metrics.warningsFixed++;
    } else {
      metrics.warningsSkipped++;
    }
  });
  
  if (!SAFETY_CONFIG.dryRun && fixed > 0) {
    fs.writeFileSync(filePath, lines.join('\n'));
    log(`Fixed ${fixed} warnings in ${path.basename(filePath)}`, 'info');
  }
  
  metrics.filesProcessed++;
}

function validateBuild() {
  if (!SAFETY_CONFIG.validateBuild || SAFETY_CONFIG.dryRun) return true;
  
  try {
    log('Validating build...');
    execSync('yarn build', { stdio: 'ignore' });
    log('Build validation passed', 'info');
    return true;
  } catch (error) {
    log('Build validation failed', 'error');
    return false;
  }
}

function groupWarningsByFile(warnings) {
  const grouped = {};
  
  warnings.forEach(warning => {
    if (!grouped[warning.file]) {
      grouped[warning.file] = [];
    }
    grouped[warning.file].push(warning);
  });
  
  return grouped;
}

function main() {
  log('Starting React Hooks exhaustive-deps fixer');
  log(`Mode: ${SAFETY_CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  // Get all warnings
  const warnings = getExhaustiveDepsWarnings();
  
  if (warnings.length === 0) {
    log('No exhaustive-deps warnings found!', 'info');
    return;
  }
  
  log(`Found ${warnings.length} exhaustive-deps warnings`);
  
  // Group by file
  const warningsByFile = groupWarningsByFile(warnings);
  const files = Object.keys(warningsByFile);
  
  log(`Warnings span ${files.length} files`);
  
  // Process files in batches
  const batches = [];
  for (let i = 0; i < files.length; i += SAFETY_CONFIG.maxFilesPerBatch) {
    batches.push(files.slice(i, i + SAFETY_CONFIG.maxFilesPerBatch));
  }
  
  batches.forEach((batch, batchIndex) => {
    log(`\nProcessing batch ${batchIndex + 1}/${batches.length}`);
    
    batch.forEach(file => {
      processFile(file, warningsByFile[file]);
    });
    
    // Validate build after each batch
    if (batchIndex < batches.length - 1) {
      if (!validateBuild()) {
        log('Build validation failed, stopping', 'error');
        process.exit(1);
      }
    }
  });
  
  // Final summary
  log('\n=== Summary ===');
  log(`Files processed: ${metrics.filesProcessed}`);
  log(`Warnings fixed: ${metrics.warningsFixed}`);
  log(`Warnings skipped: ${metrics.warningsSkipped}`);
  
  if (metrics.errors.length > 0) {
    log(`Errors encountered: ${metrics.errors.length}`, 'error');
    metrics.errors.forEach(err => log(`  - ${err}`, 'error'));
  }
  
  // Final build validation
  if (!SAFETY_CONFIG.dryRun) {
    validateBuild();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getExhaustiveDepsWarnings, parseWarningType };