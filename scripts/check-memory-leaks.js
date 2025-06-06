#!/usr/bin/env node

/**
 * Memory Leak Detection Script for WhatToEatNext
 * 
 * This script analyzes the codebase for potential memory leak patterns
 * and provides recommendations for fixing them.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

// Common patterns that might indicate memory issues
const MEMORY_LEAK_PATTERNS = {
  missingUseEffectCleanup: {
    pattern: /useEffect\(\s*\(\s*\)\s*=>\s*\{(?!\s*return)/g,
    description: "useEffect hook without cleanup function",
    severity: "medium"
  },
  infiniteRenderLoop: {
    pattern: /setInterval\(\s*\(\s*\)\s*=>\s*\{(?!\s*\/\/)/g, 
    description: "setInterval without clear mechanism",
    severity: "high"
  },
  largeObjectCreation: {
    pattern: /(const|let|var)\s+\w+\s*=\s*\{\s*(\w+\s*:\s*[^,]+,\s*){10,}/g,
    description: "Creation of very large object literals",
    severity: "medium"
  },
  noMemoization: {
    pattern: /const\s+(\w+)\s*=\s*\{[^}]{200,}\}/g,
    description: "Large object created without useMemo",
    severity: "low"
  },
  circularReferences: {
    pattern: /\w+\.\w+\s*=\s*\w+/g,
    description: "Potential circular reference",
    severity: "medium"
  },
  memoryIntensiveOps: {
    pattern: /\.concat\(|\.map\(|\.filter\(|\.reduce\(/g,
    description: "Memory intensive array operation in loop",
    severity: "low"
  },
  recursiveWithoutTermination: {
    pattern: /function\s+(\w+)[^{]*\{[^}]*\1\s*\(/g,
    description: "Recursive function without clear termination",
    severity: "high"
  }
};

// Key files to check from the codebase
const TARGET_PATHS = [
  "src/utils/optimizedAlchemyEngine.ts",
  "src/utils/ingredientRecommender.ts",
  "src/utils/cuisineRecommender.ts",
  "src/utils/recipeMatching.ts",
  "src/calculations/alchemicalEngine.ts",
  "src/utils/elementalUtils.ts",
  "src/components",
  "src/contexts"
];

// Statistics
let totalIssues = 0;
let filesWithIssues = 0;
let totalFilesChecked = 0;
const issuesBySeverity = { high: 0, medium: 0, low: 0 };

console.log(`${colors.blue}=====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.blue} WhatToEatNext Memory Leak Detection Tool ${colors.reset}`);
console.log(`${colors.blue}=====================================================${colors.reset}\n`);

/**
 * Check a single file for memory leak patterns
 */
function checkFile(filePath) {
  try {
    totalFilesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasIssues = false;
    let fileIssues = [];

    // Check each pattern
    Object.entries(MEMORY_LEAK_PATTERNS).forEach(([name, { pattern, description, severity }]) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        fileHasIssues = true;
        totalIssues += matches.length;
        issuesBySeverity[severity] += matches.length;
        
        fileIssues.push({
          type: name,
          count: matches.length,
          description,
          severity
        });
      }
    });

    if (fileHasIssues) {
      filesWithIssues++;
      console.log(`${colors.yellow}File: ${colors.reset}${filePath}`);
      
      fileIssues.forEach(issue => {
        const severityColor = issue.severity === 'high' ? colors.red : 
                             (issue.severity === 'medium' ? colors.yellow : colors.cyan);
        
        console.log(`  ${severityColor}[${issue.severity.toUpperCase()}]${colors.reset} ${issue.count} instances of ${issue.description}`);
      });
      
      console.log('');
    }
  } catch (error) {
    console.error(`${colors.red}Error checking file ${filePath}:${colors.reset}`, error.message);
  }
}

/**
 * Recursively process a directory
 */
function processPath(targetPath) {
  const resolvedPath = path.resolve(targetPath);
  const stats = fs.statSync(resolvedPath);
  
  if (stats.isFile() && (resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx') || resolvedPath.endsWith('.js') || resolvedPath.endsWith('.jsx'))) {
    checkFile(resolvedPath);
  } else if (stats.isDirectory()) {
    fs.readdirSync(resolvedPath).forEach(item => {
      const itemPath = path.join(resolvedPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        processPath(itemPath);
      } else if (itemPath.endsWith('.ts') || itemPath.endsWith('.tsx') || itemPath.endsWith('.js') || itemPath.endsWith('.jsx')) {
        checkFile(itemPath);
      }
    });
  }
}

// Execute search in workspace
try {
  // Process each target path
  TARGET_PATHS.forEach(targetPath => {
    try {
      processPath(targetPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`${colors.yellow}Warning: Path not found: ${targetPath}${colors.reset}`);
      } else {
        console.error(`${colors.red}Error processing ${targetPath}:${colors.reset}`, error.message);
      }
    }
  });

  // Print summary
  console.log(`${colors.blue}=====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue} Summary ${colors.reset}`);
  console.log(`${colors.blue}=====================================================${colors.reset}`);
  console.log(`Total files checked: ${totalFilesChecked}`);
  console.log(`Files with potential issues: ${filesWithIssues}`);
  console.log(`Total potential issues: ${totalIssues}`);
  console.log(`  ${colors.red}High severity: ${issuesBySeverity.high}${colors.reset}`);
  console.log(`  ${colors.yellow}Medium severity: ${issuesBySeverity.medium}${colors.reset}`);
  console.log(`  ${colors.cyan}Low severity: ${issuesBySeverity.low}${colors.reset}`);
  
  // Display heap info
  console.log(`\n${colors.blue}=====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue} Node.js Memory Usage ${colors.reset}`);
  console.log(`${colors.blue}=====================================================${colors.reset}`);
  const memoryUsage = process.memoryUsage();
  console.log(`Heap total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`Heap used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
  console.log(`RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  
  // Recommendations
  console.log(`\n${colors.blue}=====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue} Recommendations ${colors.reset}`);
  console.log(`${colors.blue}=====================================================${colors.reset}`);
  
  if (issuesBySeverity.high > 0) {
    console.log(`${colors.red}✖ Prioritize fixing the ${issuesBySeverity.high} high severity issues${colors.reset}`);
  }
  
  if (issuesBySeverity.medium > 0 || issuesBySeverity.high > 0) {
    console.log(`${colors.yellow}⚠ Consider implementing memory profiling during development${colors.reset}`);
  }
  
  console.log(`${colors.green}✓ Run builds with ${colors.bold}NODE_OPTIONS="--max-old-space-size=6144"${colors.reset}`);
  console.log(`${colors.green}✓ Add cleanup functions to all useEffect hooks that create subscriptions${colors.reset}`);
  console.log(`${colors.green}✓ Use useMemo for expensive calculations${colors.reset}`);
  console.log(`${colors.green}✓ Use React.lazy for component code splitting${colors.reset}`);
  console.log(`${colors.green}✓ Consider implementing virtualization for long lists${colors.reset}`);
  
} catch (error) {
  console.error(`${colors.red}Script execution error:${colors.reset}`, error);
} 