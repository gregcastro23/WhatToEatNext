#!/usr/bin/env node

// fix-infinite-loops.mjs
// A script to help identify and fix React infinite loops in Next.js projects
//
// Usage:
//   node scripts/fix-infinite-loops.mjs [options]
//
// Options:
//   --dry-run    Analyze issues without making changes (safe mode)
//   --verbose    Show detailed logging
//   --fix        Apply automatic fixes for issues that can be safely fixed
//
// This script analyzes React components for common infinite loop causes
// and suggests or applies fixes to prevent "Maximum update depth exceeded" errors.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify fs functions
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Configuration
const config = {
  srcDir: path.join(process.cwd(), 'src'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  fix: process.argv.includes('--fix'),
  patterns: {
    useEffect: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*(?:,\s*\[\s*\]\s*)?(?:,\s*\[\s*[^]*?\s*\]\s*)?\)/g,
    setStateInEffect: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?set([A-Z]\w+)\([\s\S]*?\)[\s\S]*?}\s*(?:,\s*\[\s*\]\s*)?(?:,\s*\[\s*[^]*?\s*\]\s*)?\)/g,
    missingDependencyArray: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g,
    emptyDependencyArrayWithClosure: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?([a-zA-Z_$][a-zA-Z0-9_$]*)[\s\S]*?}\s*,\s*\[\s*\]\s*\)/g,
    setState: /set([A-Z]\w+)\(/g,
    useCallback: /useCallback\(\s*\([^)]*\)\s*=>\s*{[\s\S]*?}\s*(?:,\s*\[\s*\]\s*)?(?:,\s*\[\s*[^]*?\s*\]\s*)?\)/g,
    useMemo: /useMemo\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*(?:,\s*\[\s*\]\s*)?(?:,\s*\[\s*[^]*?\s*\]\s*)?\)/g,
  }
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Helper function to log messages with colors
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to log errors
function logError(message) {
  log(`ERROR: ${message}`, colors.red);
}

// Helper function to log warnings
function logWarning(message) {
  log(`WARNING: ${message}`, colors.yellow);
}

// Helper function to log information
function logInfo(message) {
  log(`INFO: ${message}`, colors.blue);
}

// Helper function to log success
function logSuccess(message) {
  log(`SUCCESS: ${message}`, colors.green);
}

// Helper function to log verbose messages
function logVerbose(message) {
  if (config.verbose) {
    log(`VERBOSE: ${message}`, colors.cyan);
  }
}

// Helper function to walk a directory recursively
async function walkDirectory(dir, callback) {
  try {
    const files = await readdirAsync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await statAsync(filePath);
      if (stat.isDirectory()) {
        await walkDirectory(filePath, callback);
      } else {
        await callback(filePath);
      }
    }
  } catch (err) {
    logError(`Error walking directory ${dir}: ${err.message}`);
  }
}

// Helper function to analyze a React component file
async function analyzeFile(filePath) {
  try {
    // Only process TypeScript/JavaScript React files
    if (!/\.(tsx|jsx|ts|js)$/.test(filePath)) {
      return null;
    }

    logVerbose(`Analyzing file: ${filePath}`);
    
    // Read the file content
    const content = await readFileAsync(filePath, 'utf8');
    
    // Check for potential issues
    const issues = [];
    
    // Check for useEffect without dependency array
    const missingDependencyMatches = content.match(config.patterns.missingDependencyArray);
    if (missingDependencyMatches) {
      issues.push({
        type: 'missingDependencyArray',
        description: 'useEffect without dependency array - may cause infinite loops',
        matches: missingDependencyMatches.length,
        fix: (code) => code.replace(
          config.patterns.missingDependencyArray, 
          (match) => `${match.substring(0, match.length)}, [])`
        )
      });
    }
    
    // Check for empty dependency array with closures (variables from outside)
    let emptyDependencyArrayWithClosureMatches = [];
    let match;
    const emptyDependencyRegex = new RegExp(config.patterns.emptyDependencyArrayWithClosure.source, 'g');
    while ((match = emptyDependencyRegex.exec(content)) !== null) {
      // Extract the variable name captured in the regex
      const variableName = match[1];
      // Check if this variable is a prop or state defined in the component
      const isDefinedInComponent = new RegExp(`const\\s+\\{\\s*${variableName}\\s*\\}\\s*=\\s*\\w+|const\\s+\\[\\s*${variableName}\\s*,`).test(content);
      
      if (!isDefinedInComponent) {
        emptyDependencyArrayWithClosureMatches.push({
          match: match[0],
          variable: variableName
        });
      }
    }
    
    if (emptyDependencyArrayWithClosureMatches.length > 0) {
      issues.push({
        type: 'emptyDependencyArrayWithClosure',
        description: 'useEffect with empty dependency array using variables from outside',
        matches: emptyDependencyArrayWithClosureMatches,
        // This is a complex fix that would need more context - provide a warning instead
        fix: null
      });
    }
    
    // Check for setState in useEffect with no dependency array
    const setStateInEffectMatches = content.match(config.patterns.setStateInEffect);
    if (setStateInEffectMatches) {
      issues.push({
        type: 'setStateInEffect',
        description: 'setState inside useEffect - check dependency array',
        matches: setStateInEffectMatches.length,
        // This is a complex fix that would need more context - provide a warning instead
        fix: null
      });
    }
    
    return {
      filePath,
      issues,
      content
    };
  } catch (err) {
    logError(`Error analyzing file ${filePath}: ${err.message}`);
    return null;
  }
}

// Helper function to fix issues in a file
async function fixFile(analysis) {
  try {
    if (!analysis || !analysis.issues || analysis.issues.length === 0) {
      return false;
    }
    
    let updatedContent = analysis.content;
    let hasChanges = false;
    
    for (const issue of analysis.issues) {
      if (issue.fix) {
        updatedContent = issue.fix(updatedContent);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      if (config.dryRun) {
        logInfo(`Would fix issues in ${analysis.filePath}`);
      } else {
        await writeFileAsync(analysis.filePath, updatedContent, 'utf8');
        logSuccess(`Fixed issues in ${analysis.filePath}`);
      }
      return true;
    }
    
    return false;
  } catch (err) {
    logError(`Error fixing file ${analysis.filePath}: ${err.message}`);
    return false;
  }
}

// Main function to run the script
async function main() {
  try {
    log(`${colors.bold}React Infinite Loop Detector${colors.reset}`, colors.magenta);
    log(`${colors.bold}------------------------------${colors.reset}`, colors.magenta);
    
    // Check if source directory exists
    if (!await existsAsync(config.srcDir)) {
      logError(`Source directory ${config.srcDir} does not exist`);
      process.exit(1);
    }
    
    // Log script configuration
    logInfo(`Source directory: ${config.srcDir}`);
    logInfo(`Dry run: ${config.dryRun ? 'YES (no changes will be made)' : 'NO (changes will be applied if --fix is used)'}`);
    logInfo(`Fix mode: ${config.fix}`);
    logInfo(`Verbose: ${config.verbose}`);
    
    // Walk the source directory and analyze files
    const analysisResults = [];
    await walkDirectory(config.srcDir, async (filePath) => {
      const analysis = await analyzeFile(filePath);
      if (analysis && analysis.issues.length > 0) {
        analysisResults.push(analysis);
      }
    });
    
    // Log the analysis results
    log(`${colors.bold}Analysis Results${colors.reset}`, colors.magenta);
    log(`${colors.bold}---------------${colors.reset}`, colors.magenta);
    log(`Files with issues: ${analysisResults.length}`);
    
    if (analysisResults.length === 0) {
      logSuccess('No issues found!');
      return;
    }
    
    // Log the issues found
    let totalIssues = 0;
    for (const analysis of analysisResults) {
      log(`${colors.bold}${analysis.filePath}${colors.reset}`, colors.magenta);
      for (const issue of analysis.issues) {
        totalIssues++;
        logWarning(`- ${issue.description} (${issue.matches.length || issue.matches} matches)`);
        
        // Log details of matches if verbose
        if (config.verbose && typeof issue.matches === 'object' && issue.matches.length > 0) {
          for (const match of issue.matches) {
            logVerbose(`  - Variable: ${match.variable}`);
          }
        }
      }
    }
    
    log(`${colors.bold}Total issues found: ${totalIssues}${colors.reset}`, colors.yellow);
    
    // Fix issues if requested
    if (config.fix) {
      log(`${colors.bold}Fixing Issues${colors.reset}`, colors.magenta);
      log(`${colors.bold}------------${colors.reset}`, colors.magenta);
      
      let fixedCount = 0;
      for (const analysis of analysisResults) {
        const fixed = await fixFile(analysis);
        if (fixed) {
          fixedCount++;
        }
      }
      
      if (config.dryRun) {
        logInfo(`Would fix issues in ${fixedCount} files`);
      } else {
        logSuccess(`Fixed issues in ${fixedCount} files`);
      }
    } else {
      logInfo('Run with --fix to automatically fix fixable issues');
    }
    
  } catch (err) {
    logError(`Unexpected error: ${err.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch((err) => {
  logError(`Fatal error: ${err.message}`);
  process.exit(1);
}); 