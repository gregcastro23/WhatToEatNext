#!/usr/bin/env node
// fix-infinite-loops-checker.mjs
// A script to help identify potential React infinite loops that cause "Maximum update depth exceeded" errors
// This script only analyzes the codebase and does not make any changes

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  srcDir: path.join(process.cwd(), 'src'),
  patterns: {
    // Find useEffect without dependency array
    missingDependencies: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g,
    
    // Find useEffect with empty dependency array that uses closure variables
    closureWithEmptyDeps: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?([a-zA-Z_$][a-zA-Z0-9_$]*)[\s\S]*?}\s*,\s*\[\s*\]\s*\)/g,
    
    // Find setState in useEffect
    setStateInEffect: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?set([A-Z]\w+)\([\s\S]*?\)[\s\S]*?}\s*(?:,\s*\[\s*\]\s*)?(?:,\s*\[\s*[^]*?\s*\]\s*)?\)/g,
    
    // Find setState inside conditional in useEffect without that state in deps
    conditionalSetStateInEffect: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?if\s*\(.*?\)\s*{[\s\S]*?set([A-Z]\w+)\([\s\S]*?\)[\s\S]*?}\s*(?:,\s*\[\s*(?!.*?\1).*?\]\s*)/g,
    
    // Find deps array that includes state updated in the effect
    circularDeps: /const\s+\[\s*(\w+)\s*,\s*set\1\s*\]\s*=\s*useState[\s\S]*?useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?set\1\([\s\S]*?\)[\s\S]*?}\s*,\s*\[\s*(?=.*?\b\1\b).*?\]\s*\)/gs
  },
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  skipDirectories: ['node_modules', '.next', 'backup']
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions
const log = (message, color = colors.reset) => console.log(`${color}${message}${colors.reset}`);
const error = (message) => log(`ERROR: ${message}`, colors.red);
const warning = (message) => log(`WARNING: ${message}`, colors.yellow);
const info = (message) => log(`INFO: ${message}`, colors.blue);
const success = (message) => log(`SUCCESS: ${message}`, colors.green);

// Walk directory recursively
async function walkDirectory(dir) {
  let results = [];
  
  try {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      
      // Skip directories we don't want to process
      if (config.skipDirectories.some(skip => fullPath.includes(skip))) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        results = results.concat(await walkDirectory(fullPath));
      } else if (config.fileExtensions.includes(path.extname(fullPath))) {
        // Only process files with specified extensions
        results.push(fullPath);
      }
    }
  } catch (err) {
    error(`Failed to read directory ${dir}: ${err.message}`);
  }
  
  return results;
}

// Analyze a file for potential infinite loop issues
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for useEffect without dependency array
    const missingDepsMatches = content.match(config.patterns.missingDependencies) || [];
    if (missingDepsMatches.length > 0) {
      issues.push({
        type: 'missingDependencies',
        count: missingDepsMatches.length,
        message: `Found ${missingDepsMatches.length} useEffect(s) without dependency array - will run on every render`
      });
    }
    
    // Check for useEffect with empty array that uses variables from outside
    const closureMatches = [];
    let match;
    const closureRegex = new RegExp(config.patterns.closureWithEmptyDeps.source, 'g');
    
    while ((match = closureRegex.exec(content)) !== null) {
      // Check if this is a variable from outside the hook
      const variableName = match[1];
      closureMatches.push(variableName);
    }
    
    if (closureMatches.length > 0) {
      issues.push({
        type: 'closureWithEmptyDeps',
        count: closureMatches.length,
        message: `Found useEffect with empty dependency array using outside variables: ${closureMatches.join(', ')}`
      });
    }
    
    // Check for setState in useEffect
    const setStateMatches = content.match(config.patterns.setStateInEffect) || [];
    if (setStateMatches.length > 0) {
      issues.push({
        type: 'setStateInEffect',
        count: setStateMatches.length,
        message: `Found ${setStateMatches.length} setState call(s) inside useEffect - check dependency arrays`
      });
    }
    
    // Check for conditional setState in useEffect without proper deps
    const conditionalSetStateMatches = content.match(config.patterns.conditionalSetStateInEffect) || [];
    if (conditionalSetStateMatches.length > 0) {
      issues.push({
        type: 'conditionalSetStateInEffect',
        count: conditionalSetStateMatches.length,
        message: `Found ${conditionalSetStateMatches.length} conditional setState call(s) inside useEffect with missing dependencies`
      });
    }
    
    // Check for circular dependencies (state updated in effect and used in deps)
    const circularDepsMatches = content.match(config.patterns.circularDeps) || [];
    if (circularDepsMatches.length > 0) {
      issues.push({
        type: 'circularDeps',
        count: circularDepsMatches.length,
        message: `Found ${circularDepsMatches.length} potential circular dependency between state and useEffect`
      });
    }
    
    return {
      filePath,
      issues,
      hasIssues: issues.length > 0
    };
  } catch (err) {
    error(`Failed to analyze file ${filePath}: ${err.message}`);
    return {
      filePath,
      issues: [],
      hasIssues: false,
      error: err.message
    };
  }
}

// Main function
async function main() {
  log('============================================', colors.cyan);
  log('REACT INFINITE LOOP DETECTOR', colors.cyan);
  log('============================================', colors.cyan);
  log('Finding potential causes of "Maximum update depth exceeded" errors...\n');
  
  // Get all files to analyze
  const files = await walkDirectory(config.srcDir);
  info(`Found ${files.length} files to analyze`);
  
  // Analyze each file
  const results = files.map(analyzeFile);
  const filesWithIssues = results.filter(result => result.hasIssues);
  
  // Show results
  if (filesWithIssues.length === 0) {
    success('\nNo potential infinite loop issues found! 🎉');
  } else {
    warning(`\nFound potential issues in ${filesWithIssues.length} files:`);
    
    // Group by issue type
    const issueTypes = new Map();
    
    for (const result of filesWithIssues) {
      log(`\n${result.filePath}`, colors.magenta);
      
      for (const issue of result.issues) {
        log(`  • ${issue.message}`, colors.yellow);
        
        // Count issues by type
        if (!issueTypes.has(issue.type)) {
          issueTypes.set(issue.type, 0);
        }
        issueTypes.set(issue.type, issueTypes.get(issue.type) + issue.count);
      }
    }
    
    // Show summary
    log('\n============================================', colors.cyan);
    log('SUMMARY OF POTENTIAL ISSUES:', colors.cyan);
    log('============================================', colors.cyan);
    
    for (const [type, count] of issueTypes.entries()) {
      log(`${type}: ${count} issue(s)`, colors.yellow);
    }
    
    log('\nTips to fix these issues:', colors.green);
    log('  1. Add proper dependency arrays to useEffect hooks', colors.green);
    log('  2. Use useRef for values you don\'t want to trigger re-renders', colors.green);
    log('  3. Move state updates outside useEffect when possible', colors.green);
    log('  4. Check state variables used in useEffect are not also updated in the same effect', colors.green);
  }
}

// Run the script
main().catch(err => {
  error(`Script failed: ${err.message}`);
  process.exit(1);
}); 