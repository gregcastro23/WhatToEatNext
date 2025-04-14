#!/usr/bin/env node

/**
 * This script helps fix common TypeScript issues in the codebase
 * - Adds React imports where missing for JSX
 * - Replaces 'any' types with more specific types
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = process.cwd();
const SEARCH_DIRS = ['src'];
const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', 'build'];
const FILE_EXTENSIONS = ['.ts', '.tsx'];

// Patterns to fix
const PATTERNS = [
  // Fix missing React import in JSX files
  {
    description: 'Add React import for JSX files',
    test: (content) => content.includes('JSX') && !content.includes("import React"),
    apply: (content) => {
      // Add React import if not present
      if (!content.includes("import React")) {
        return "import React from 'react';\n\n" + content;
      }
      return content;
    }
  },
  // Replace common any[] with proper types
  {
    description: 'Replace any[] with proper array types',
    test: (content) => content.includes(': any[]'),
    apply: (content) => {
      // Try to infer array type from context
      const lines = content.split('\n');
      const updatedLines = lines.map(line => {
        if (line.includes(': any[]')) {
          // Check if we can determine the type from assignment
          const assignmentMatch = line.match(/:\s*any\[\]\s*=\s*(\[.*?\])/);
          if (assignmentMatch) {
            const arrayContent = assignmentMatch[1];
            // Check what's in the array to determine type
            if (arrayContent.includes("'") || arrayContent.includes('"')) {
              return line.replace(': any[]', ': string[]');
            }
            if (arrayContent.includes('true') || arrayContent.includes('false')) {
              return line.replace(': any[]', ': boolean[]');
            }
            if (/\d+/.test(arrayContent) && !arrayContent.includes('{')) {
              return line.replace(': any[]', ': number[]');
            }
            if (arrayContent.includes('{')) {
              return line.replace(': any[]', ': Record<string, unknown>[]');
            }
          }
          
          // Use unknown if we can't determine the type
          return line.replace(': any[]', ': unknown[]');
        }
        return line;
      });
      return updatedLines.join('\n');
    }
  },
  // Replace Record<string, any> with safer types
  {
    description: 'Replace Record<string, any> with safer types',
    test: (content) => content.includes('Record<string, any>'),
    apply: (content) => {
      return content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
    }
  },
  // Replace standalone any type with unknown
  {
    description: 'Replace any with unknown for safer type checking',
    test: (content) => /:\s*any\b/.test(content) || /as\s+any\b/.test(content),
    apply: (content) => {
      // Replace ': any' with ': unknown', but avoid replacing "as any" type assertions
      const lines = content.split('\n');
      const updatedLines = lines.map(line => {
        // Replace type annotations but not type assertions
        if (line.includes(': any')) {
          return line.replace(/:\s*any\b/g, ': unknown');
        }
        return line;
      });
      return updatedLines.join('\n');
    }
  },
  // Add explicit types to functions
  {
    description: 'Add return types to functions',
    test: (content) => {
      const functionWithoutReturnType = /function\s+\w+\([^)]*\)\s*{/;
      const arrowFunctionWithoutReturnType = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/;
      return functionWithoutReturnType.test(content) || arrowFunctionWithoutReturnType.test(content);
    },
    apply: (content) => {
      // We'll only analyze and log here rather than automatically fixing
      // as correct return types need careful consideration
      const lines = content.split('\n');
      console.log("Found functions without explicit return types - consider adding return types");
      return content;
    }
  }
];

// Find all target files
function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        results = results.concat(findFiles(fullPath));
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

// Process a file
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent = originalContent;
    let changes = 0;
    
    for (const pattern of PATTERNS) {
      if (pattern.test(updatedContent)) {
        const newContent = pattern.apply(updatedContent);
        if (newContent !== updatedContent) {
          console.log(`  Applied: ${pattern.description}`);
          updatedContent = newContent;
          changes++;
        }
      }
    }
    
    if (changes > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  Updated file with ${changes} fixes`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  let targetDirs = [];
  
  for (const dir of SEARCH_DIRS) {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      targetDirs.push(fullPath);
    }
  }
  
  // Find all files
  let allFiles = [];
  for (const dir of targetDirs) {
    allFiles = allFiles.concat(findFiles(dir));
  }
  
  console.log(`Scanning ${allFiles.length} TypeScript files for issues...`);
  
  // Process files
  let fixedFiles = 0;
  for (const file of allFiles) {
    console.log(`\nChecking ${path.relative(ROOT_DIR, file)}...`);
    const wasFixed = processFile(file);
    if (wasFixed) {
      fixedFiles++;
    }
  }
  
  console.log(`\nDone! Fixed issues in ${fixedFiles} files.`);
}

// Run the script
main(); 