#!/usr/bin/env node

/**
 * TypeScript Error Analyzer
 * 
 * This script analyzes TypeScript error logs to identify patterns and prioritize fixes.
 * 
 * Usage:
 *   node analyze-typescript-errors.js typescript-errors.log
 */

import fs from 'fs';
import path from 'path';

// Check arguments
if (process.argv.length < 3) {
  console.log('Usage: node analyze-typescript-errors.js <error-log-file>');
  process.exit(1);
}

const errorLogFile = process.argv[2];

// Read error log file
try {
  const content = fs.readFileSync(errorLogFile, 'utf8');
  analyzeErrors(content);
} catch (error) {
  console.error(`Error reading file: ${error.message}`);
  process.exit(1);
}

/**
 * Main function to analyze errors
 */
function analyzeErrors(content) {
  console.log('TypeScript Error Analysis');
  console.log('=======================\n');
  
  // Split content into lines
  const lines = content.split('\n');
  
  // Error categories
  const errorsByFile = {};
  const errorsByType = {};
  const syntaxErrors = [];
  const typeErrors = [];
  const propErrors = [];
  const importErrors = [];
  const jsxErrors = [];
  
  // Current file being processed
  let currentFile = null;
  
  // Process each line
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check if line contains a file path (start of a new error)
    const fileMatch = line.match(/^([^(]+\.[t|j]sx?)(\(\d+,\d+\))?:/);
    if (fileMatch) {
      currentFile = fileMatch[1].trim();
      
      // Initialize count for this file
      if (!errorsByFile[currentFile]) {
        errorsByFile[currentFile] = 0;
      }
      
      errorsByFile[currentFile]++;
      
      // Categorize the error
      if (line.includes('Syntax error')) {
        syntaxErrors.push({ file: currentFile, error: line });
        incrementErrorType(errorsByType, 'Syntax error');
      } else if (line.includes('Type ')) {
        typeErrors.push({ file: currentFile, error: line });
        incrementErrorType(errorsByType, 'Type error');
      } else if (line.includes('Property ') || line.includes(' has no property ')) {
        propErrors.push({ file: currentFile, error: line });
        incrementErrorType(errorsByType, 'Property error');
      } else if (line.includes('import') || line.includes('Cannot find module')) {
        importErrors.push({ file: currentFile, error: line });
        incrementErrorType(errorsByType, 'Import error');
      } else if (line.includes('JSX')) {
        jsxErrors.push({ file: currentFile, error: line });
        incrementErrorType(errorsByType, 'JSX error');
      } else {
        incrementErrorType(errorsByType, 'Other error');
      }
    }
  }
  
  // Sort files by error count (descending)
  const sortedFiles = Object.entries(errorsByFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20 files with most errors
  
  // Display results
  console.log('Files with Most Errors:');
  console.log('----------------------');
  sortedFiles.forEach(([file, count], index) => {
    console.log(`${index + 1}. ${file}: ${count} errors`);
  });
  console.log('\n');
  
  console.log('Error Type Distribution:');
  console.log('----------------------');
  Object.entries(errorsByType).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
  console.log('\n');
  
  // Display error samples for each category
  displayErrorSamples('Syntax Errors', syntaxErrors, 5);
  displayErrorSamples('Type Errors', typeErrors, 5);
  displayErrorSamples('Property Errors', propErrors, 5);
  displayErrorSamples('Import Errors', importErrors, 5);
  displayErrorSamples('JSX Errors', jsxErrors, 5);
  
  // Generate recommendations
  generateRecommendations(errorsByFile, errorsByType, syntaxErrors, typeErrors, propErrors);
}

/**
 * Increments the count for an error type
 */
function incrementErrorType(errorsByType, type) {
  if (!errorsByType[type]) {
    errorsByType[type] = 0;
  }
  errorsByType[type]++;
}

/**
 * Displays samples of a specific error category
 */
function displayErrorSamples(title, errors, sampleCount) {
  console.log(`${title} (${errors.length} total):`);
  console.log('----------------------');
  
  // Get a subset of unique errors to show as examples
  const uniqueErrors = {};
  errors.forEach(error => {
    const message = error.error.split(':').slice(1).join(':').trim();
    uniqueErrors[message] = error;
  });
  
  // Display unique error samples
  Object.values(uniqueErrors)
    .slice(0, sampleCount)
    .forEach(error => {
      console.log(`File: ${path.basename(error.file)}`);
      console.log(`Error: ${error.error.split(':').slice(1).join(':').trim()}`);
      console.log('');
    });
  console.log('\n');
}

/**
 * Generates recommendations based on the error analysis
 */
function generateRecommendations(errorsByFile, errorsByType, syntaxErrors, typeErrors, propErrors) {
  console.log('Recommendations:');
  console.log('---------------');
  
  // Create priority groups
  const criticalFiles = [];
  const highPriorityFiles = [];
  const mediumPriorityFiles = [];
  
  // Identify critical files (core engine and many errors)
  Object.entries(errorsByFile).forEach(([file, count]) => {
    if (file.includes('alchemical') || file.includes('Engine') || file.includes('/api/')) {
      criticalFiles.push({ file, count });
    } else if (count > 10) {
      highPriorityFiles.push({ file, count });
    } else if (count > 5) {
      mediumPriorityFiles.push({ file, count });
    }
  });
  
  // Sort each group by error count
  criticalFiles.sort((a, b) => b.count - a.count);
  highPriorityFiles.sort((a, b) => b.count - a.count);
  mediumPriorityFiles.sort((a, b) => b.count - a.count);
  
  // Output critical files to fix first
  console.log('Critical files to fix first:');
  criticalFiles.forEach(({ file, count }) => {
    console.log(`- ${file} (${count} errors)`);
  });
  console.log('');
  
  // Recommend automated fixes if there are many syntax errors
  if (syntaxErrors.length > 50) {
    console.log('Consider running automated syntax fixes:');
    console.log('```');
    console.log('node fix-typescript-safely.js path/to/file.ts --apply');
    console.log('```');
    console.log('');
  }
  
  // Recommend manual fixes for type errors
  if (typeErrors.length > 0) {
    console.log('Address common type errors:');
    
    // Group type errors by pattern
    const typeErrorPatterns = {};
    typeErrors.forEach(error => {
      const message = error.error.split(':').slice(1).join(':').trim();
      const simplePattern = simplifyTypeError(message);
      
      if (!typeErrorPatterns[simplePattern]) {
        typeErrorPatterns[simplePattern] = [];
      }
      typeErrorPatterns[simplePattern].push(error);
    });
    
    // Recommend fixes for common patterns
    Object.entries(typeErrorPatterns)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .forEach(([pattern, errors]) => {
        console.log(`- Fix "${pattern}" (${errors.length} occurrences)`);
      });
    console.log('');
  }
  
  // Output final recommendation summary
  console.log('Recommended approach:');
  console.log('1. Fix critical files first');
  console.log('2. Run automated fixes for syntax errors');
  console.log('3. Address common type errors manually');
  console.log('4. Fix remaining high priority files');
}

/**
 * Simplifies type error messages to group similar errors
 */
function simplifyTypeError(errorMessage) {
  // Extract core pattern from type errors
  if (errorMessage.includes('Type') && errorMessage.includes('is not assignable to type')) {
    return 'Type assignment error';
  } else if (errorMessage.includes('Property') && errorMessage.includes('does not exist on type')) {
    return 'Missing property error';
  } else if (errorMessage.includes('Cannot find name')) {
    return 'Undefined variable error';
  } else {
    return 'Other type error';
  }
} 