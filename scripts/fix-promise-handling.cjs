#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: './src',
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludePatterns: ['node_modules', '.next', 'dist', 'build', '*.test.ts', '*.test.tsx', '*.spec.ts'],
  preservePatterns: {
    // Fire-and-forget logging patterns
    logging: [
      /console\.(log|info|warn|error|debug)/,
      /logger\.(log|info|warn|error|debug)/,
      /tracking\.(track|event|metric)/,
      /analytics\.(track|page|identify)/,
      /monitoring\.(record|report|metric)/,
      /telemetry\.(send|record|track)/
    ],
    // Astronomical calculation patterns
    astronomical: [
      /astronomical.*calculation/i,
      /planetary.*computation/i,
      /celestial.*position/i,
      /orbital.*mechanics/i,
      /ephemeris.*update/i,
      /transit.*calculation/i
    ],
    // Background operations
    background: [
      /background.*task/i,
      /queue\.(add|push|enqueue)/,
      /worker\.(post|send)/,
      /cache\.(set|update|invalidate)/,
      /indexedDB\.(put|add|delete)/,
      /localStorage\.setItem/
    ]
  },
  maxFilesPerRun: 30,
  dryRun: false
};

// Track metrics
const metrics = {
  filesScanned: 0,
  filesModified: 0,
  floatingPromisesFixed: 0,
  misusedPromisesFixed: 0,
  promisesPreserved: 0,
  errors: [],
  patterns: {
    missingAwait: 0,
    voidReturn: 0,
    thenWithoutCatch: 0,
    asyncInLoop: 0,
    promiseAll: 0,
    errorHandling: 0
  }
};

// Promise-related patterns
const PROMISE_PATTERNS = [
  // Pattern 1: Floating promises - function calls that return promises without await
  {
    name: 'missingAwait',
    pattern: /^(\s*)((?!await|return)\S.*?)\b(\w+)\s*\([^)]*\)\s*;?\s*$/gm,
    isPromiseCall: (line, functionName) => {
      // Common async function patterns
      const asyncPatterns = [
        /fetch|axios|request|api/i,
        /save|update|delete|create|remove/i,
        /load|get|find|query|search/i,
        /send|post|put|patch/i,
        /process|handle|execute|run/i,
        /wait|delay|timeout|sleep/i,
        /connect|disconnect|sync/i
      ];
      
      return asyncPatterns.some(pattern => pattern.test(functionName)) ||
             functionName.startsWith('async') ||
             line.includes('.then(') ||
             line.includes('.catch(');
    },
    fix: (match, indent, prefix, functionName) => {
      return `${indent}await ${prefix}${functionName}`;
    },
    description: 'Add missing await to promise-returning functions'
  },
  
  // Pattern 2: Void returns in async functions
  {
    name: 'voidReturn',
    pattern: /^(\s*)return\s+(\w+)\s*\([^)]*\)\s*;?\s*$/gm,
    isPromiseCall: (line) => {
      return !line.includes('await');
    },
    fix: (match, indent, functionCall) => {
      return `${indent}return await ${functionCall}`;
    },
    description: 'Add await to returned promise calls'
  },
  
  // Pattern 3: .then() without .catch()
  {
    name: 'thenWithoutCatch',
    pattern: /(\S+)\.then\s*\([^)]+\)\s*(?!\.catch|\.finally);?\s*$/gm,
    fix: (match, promiseChain) => {
      return `${match.trimEnd()}\n    .catch(error => console.error('Promise error:', error));`;
    },
    description: 'Add error handling to promise chains'
  },
  
  // Pattern 4: Async operations in loops without proper handling
  {
    name: 'asyncInLoop',
    pattern: /for\s*\([^)]+\)\s*{[^}]*?(\w+)\s*\([^)]*\)[^}]*?}/gs,
    isAsyncLoop: (block) => {
      return /\b(fetch|api|save|load|update|delete)\b/.test(block) && 
             !block.includes('await') && 
             !block.includes('Promise.all');
    },
    fix: (match) => {
      // This is complex - just mark for manual review
      return match;
    },
    description: 'Async operations in loops need proper handling'
  },
  
  // Pattern 5: Array of promises that should use Promise.all
  {
    name: 'promiseAll',
    pattern: /(\w+)\s*=\s*(\w+)\.map\s*\([^)]+\)\s*;(?!\s*await)/gm,
    isPromiseMap: (line) => {
      return /\b(async|fetch|api|Promise)\b/.test(line);
    },
    fix: (match, variable, array) => {
      return `${variable} = await Promise.all(${array}.map`;
    },
    description: 'Use Promise.all for arrays of promises'
  }
];

// TypeScript-specific misused promise patterns
const MISUSED_PROMISE_PATTERNS = [
  // Pattern 1: Conditional expressions with promises
  {
    name: 'conditionalPromise',
    pattern: /if\s*\(\s*(\w+(?:\.\w+)*(?:\([^)]*\))?)\s*\)/g,
    isPromise: (expression) => {
      return /\.(then|catch|finally)\s*\(/.test(expression) ||
             /Promise\s*</.test(expression);
    },
    fix: (match, expression) => {
      return `if (await ${expression})`;
    },
    description: 'Await promises in conditionals'
  },
  
  // Pattern 2: Property access on promises
  {
    name: 'promiseProperty',
    pattern: /(\w+(?:\.\w+)*\([^)]*\))\.(\w+)(?!\s*\()/g,
    isPromiseCall: (call) => {
      return /\b(fetch|api|get|load|find)\b/.test(call);
    },
    fix: (match, call, property) => {
      return `(await ${call}).${property}`;
    },
    description: 'Await promise before property access'
  }
];

/**
 * Check if a promise operation should be preserved (fire-and-forget)
 */
function shouldPreservePromise(line, context) {
  // Check all preservation patterns
  for (const [type, patterns] of Object.entries(CONFIG.preservePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(line) || pattern.test(context)) {
        metrics.promisesPreserved++;
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if we're inside an async function
 */
function isInAsyncContext(content, index) {
  // Look backwards for function declaration
  const before = content.substring(Math.max(0, index - 500), index);
  
  // Check for async function patterns
  const asyncPatterns = [
    /async\s+function/,
    /async\s+\(/,
    /async\s+\w+\s*\(/,
    /=\s*async/,
    /:\s*async/
  ];
  
  return asyncPatterns.some(pattern => pattern.test(before));
}

/**
 * Process floating promises in a file
 */
function processFloatingPromises(content, filePath) {
  let modifiedContent = content;
  const fixes = [];
  
  PROMISE_PATTERNS.forEach(patternConfig => {
    const pattern = new RegExp(patternConfig.pattern.source, patternConfig.pattern.flags);
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
      
      // Skip if should be preserved
      if (shouldPreservePromise(line, fullMatch)) {
        continue;
      }
      
      // Check if this is actually a promise call
      let isPromise = false;
      if (patternConfig.isPromiseCall) {
        isPromise = patternConfig.isPromiseCall(line, match[3] || '');
      } else if (patternConfig.isPromiseMap) {
        isPromise = patternConfig.isPromiseMap(line);
      } else if (patternConfig.isAsyncLoop) {
        isPromise = patternConfig.isAsyncLoop(fullMatch);
      } else {
        isPromise = true; // Default for patterns like .then without .catch
      }
      
      if (!isPromise) continue;
      
      // Check if we're in async context for await fixes
      if (patternConfig.name === 'missingAwait' || patternConfig.name === 'voidReturn') {
        if (!isInAsyncContext(content, match.index)) {
          continue; // Can't use await outside async function
        }
      }
      
      // Apply the fix
      const fixed = patternConfig.fix(...match);
      if (fixed !== fullMatch) {
        fixes.push({
          original: fullMatch,
          fixed: fixed,
          index: match.index,
          pattern: patternConfig.name
        });
        metrics.patterns[patternConfig.name]++;
        metrics.floatingPromisesFixed++;
      }
    }
  });
  
  // Apply fixes in reverse order to maintain indices
  fixes.reverse().forEach(({ original, fixed, index }) => {
    modifiedContent = modifiedContent.substring(0, index) + 
                     fixed + 
                     modifiedContent.substring(index + original.length);
  });
  
  if (fixes.length > 0 && !CONFIG.dryRun) {
    console.log(`  Fixed ${fixes.length} floating promises`);
    fixes.forEach(fix => console.log(`    ${fix.pattern}: ${fix.original.trim()} → ${fix.fixed.trim()}`));
  }
  
  return modifiedContent;
}

/**
 * Process misused promises in a file
 */
function processMisusedPromises(content, filePath) {
  let modifiedContent = content;
  const fixes = [];
  
  MISUSED_PROMISE_PATTERNS.forEach(patternConfig => {
    const pattern = new RegExp(patternConfig.pattern.source, patternConfig.pattern.flags);
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      
      // Check if this is actually a promise
      if (patternConfig.isPromise && !patternConfig.isPromise(match[1])) {
        continue;
      }
      if (patternConfig.isPromiseCall && !patternConfig.isPromiseCall(match[1])) {
        continue;
      }
      
      // Skip if should be preserved
      if (shouldPreservePromise(fullMatch, fullMatch)) {
        continue;
      }
      
      // Check if we're in async context
      if (!isInAsyncContext(content, match.index)) {
        continue;
      }
      
      // Apply the fix
      const fixed = patternConfig.fix(...match);
      if (fixed !== fullMatch) {
        fixes.push({
          original: fullMatch,
          fixed: fixed,
          index: match.index,
          pattern: patternConfig.name
        });
        metrics.misusedPromisesFixed++;
      }
    }
  });
  
  // Apply fixes in reverse order
  fixes.reverse().forEach(({ original, fixed, index }) => {
    modifiedContent = modifiedContent.substring(0, index) + 
                     fixed + 
                     modifiedContent.substring(index + original.length);
  });
  
  if (fixes.length > 0 && !CONFIG.dryRun) {
    console.log(`  Fixed ${fixes.length} misused promises`);
    fixes.forEach(fix => console.log(`    ${fix.pattern}: ${fix.original} → ${fix.fixed}`));
  }
  
  return modifiedContent;
}

/**
 * Add proper error handling to async functions
 */
function addErrorHandling(content) {
  let modifiedContent = content;
  
  // Pattern: async functions without try-catch
  const asyncFunctionPattern = /async\s+(?:function\s+)?(\w+)?\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{([^}]+)}/gs;
  let match;
  
  while ((match = asyncFunctionPattern.exec(content)) !== null) {
    const functionBody = match[2];
    
    // Check if it already has try-catch
    if (functionBody.includes('try') && functionBody.includes('catch')) {
      continue;
    }
    
    // Check if it's a simple one-liner or logging function
    if (functionBody.trim().split('\n').length <= 2 || 
        shouldPreservePromise(functionBody, functionBody)) {
      continue;
    }
    
    // Add try-catch wrapper
    const lines = functionBody.split('\n');
    const indentMatch = lines[1]?.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '  ';
    
    const wrappedBody = `
${indent}try {${functionBody}
${indent}} catch (error) {
${indent}  console.error('Error in async function:', error);
${indent}  throw error;
${indent}}`;
    
    const newFunction = match[0].replace(functionBody, wrappedBody);
    modifiedContent = modifiedContent.replace(match[0], newFunction);
    metrics.patterns.errorHandling++;
  }
  
  return modifiedContent;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    
    // Process floating promises
    modifiedContent = processFloatingPromises(modifiedContent, filePath);
    
    // Process misused promises
    modifiedContent = processMisusedPromises(modifiedContent, filePath);
    
    // Add error handling (optional - can be aggressive)
    // modifiedContent = addErrorHandling(modifiedContent);
    
    // Write the file if modified
    if (modifiedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      metrics.filesModified++;
      console.log(`✅ Fixed promise handling in ${filePath}`);
    } else if (modifiedContent !== content && CONFIG.dryRun) {
      console.log(`Would fix promise handling in ${filePath}`);
    }
    
  } catch (error) {
    metrics.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
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
    console.error('❌ Build failed after fixes - consider rolling back');
    console.error(error.toString());
    return false;
  }
}

/**
 * Create git stash for safety
 */
function createSafetyStash() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    execSync(`git stash push -m "promise-handling-fix-${timestamp}"`, { stdio: 'pipe' });
    console.log('✅ Created safety stash');
    return timestamp;
  } catch (error) {
    console.error('⚠️  Could not create git stash:', error.message);
    return null;
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
 * Main execution
 */
function main() {
  console.log('🚀 WhatToEatNext - Promise Handling Fixer');
  console.log('=========================================');
  
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
  
  // Create safety stash if not in dry run
  let stashTimestamp = null;
  if (!CONFIG.dryRun) {
    stashTimestamp = createSafetyStash();
  }
  
  // Get files to process
  const files = getFilesToProcess();
  console.log(`\n📁 Found ${files.length} files to analyze`);
  
  // Process files with limit
  const filesToProcess = files.slice(0, CONFIG.maxFilesPerRun);
  console.log(`\n🔧 Processing ${filesToProcess.length} files...\n`);
  
  filesToProcess.forEach(file => {
    metrics.filesScanned++;
    processFile(file);
  });
  
  // Report results
  console.log('\n📊 Fix Summary:');
  console.log('================');
  console.log(`Files scanned: ${metrics.filesScanned}`);
  console.log(`Files modified: ${metrics.filesModified}`);
  console.log(`Floating promises fixed: ${metrics.floatingPromisesFixed}`);
  console.log(`Misused promises fixed: ${metrics.misusedPromisesFixed}`);
  console.log(`Promises preserved (fire-and-forget): ${metrics.promisesPreserved}`);
  console.log('\nPattern breakdown:');
  Object.entries(metrics.patterns).forEach(([pattern, count]) => {
    if (count > 0) {
      console.log(`  ${pattern}: ${count}`);
    }
  });
  
  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${metrics.errors.length}`);
    metrics.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }
  
  // Validate build if changes were made
  if (metrics.filesModified > 0 && !CONFIG.dryRun) {
    const buildValid = validateBuildAfterFix();
    if (!buildValid && stashTimestamp) {
      console.log('\n⚠️  Build failed - you can restore with:');
      console.log(`git stash apply stash^{/promise-handling-fix-${stashTimestamp}}`);
    }
  }
  
  // Suggest next steps
  console.log('\n📌 Next Steps:');
  if (CONFIG.dryRun) {
    console.log('1. Review the changes that would be made');
    console.log('2. Run without --dry-run to apply fixes');
  } else if (metrics.filesModified > 0) {
    console.log('1. Run yarn lint to see updated issue count');
    console.log('2. Review changes with git diff');
    console.log('3. Run tests to ensure async behavior preserved');
    console.log('4. Commit changes if all tests pass');
  }
  
  if (files.length > filesToProcess.length) {
    console.log(`\n📝 Note: ${files.length - filesToProcess.length} files remaining. Run again to process more.`);
  }
}

// Execute
main();