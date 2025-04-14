#!/usr/bin/env node

/**
 * This script helps fix unused variables by adding a leading underscore
 * to variable names that are reported as unused by ESLint.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the list of unused variables from ESLint
function getUnusedVariables() {
  try {
    // Use the correct command format for this project
    const result = execSync('npx next lint --format json').toString();
    const lintResults = JSON.parse(result);
    
    const unusedVars = [];
    
    lintResults.forEach(fileResult => {
      const filePath = fileResult.filePath;
      const unusedInFile = fileResult.messages
        .filter(msg => msg.ruleId === '@typescript-eslint/no-unused-vars')
        .map(msg => ({
          file: filePath,
          line: msg.line,
          column: msg.column,
          varName: msg.message.match(/'([^']+)'/)?.[1] || 'unknown',
          messageType: msg.message.includes('assigned a value but never used') ? 'assigned' : 'defined'
        }));
      
      if (unusedInFile.length > 0) {
        unusedVars.push(...unusedInFile);
      }
    });
    
    return unusedVars;
  } catch (error) {
    console.error('Error running ESLint:', error.message);
    return [];
  }
}

// Fix unused variables in a file
async function fixUnusedVarsInFile(filePath, unusedVars) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  console.log(`\nProcessing ${path.basename(filePath)}`);
  
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Group the unused vars by line number
  const varsByLine = {};
  unusedVars.forEach(v => {
    if (!varsByLine[v.line]) {
      varsByLine[v.line] = [];
    }
    varsByLine[v.line].push(v);
  });
  
  // Process lines in reverse order (to avoid line number changes)
  const lineNumbers = Object.keys(varsByLine).map(Number).sort((a, b) => b - a);
  
  for (const lineNum of lineNumbers) {
    const lineVars = varsByLine[lineNum];
    const line = lines[lineNum - 1]; // Line numbers are 1-based
    
    console.log(`\nLine ${lineNum}: ${line.trim()}`);
    console.log(`Unused variables: ${lineVars.map(v => v.varName).join(', ')}`);
    
    if (line.includes('import ')) {
      // Handle import statements
      if (lineVars.length === 1 && line.includes(`{ ${lineVars[0].varName} }`)) {
        // If it's the only import in curly braces, remove the whole import
        console.log(`Removing unused import: ${line.trim()}`);
        lines[lineNum - 1] = ''; // Remove the line
      } else {
        // Remove the specific variables from an import with multiple items
        const updatedLine = removeFromImport(line, lineVars.map(v => v.varName));
        console.log(`Updated import: ${updatedLine.trim()}`);
        lines[lineNum - 1] = updatedLine;
      }
    } else {
      // For other variable declarations, let's just comment out the line for now
      console.log(`Commenting out: ${line.trim()}`);
      lines[lineNum - 1] = `// UNUSED: ${line.trim()}`;
    }
  }
  
  // Write the updated content back to the file
  const updatedContent = lines.join('\n');
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`\nUpdated ${filePath}`);
}

// Helper to remove variables from an import statement
function removeFromImport(importLine, varsToRemove) {
  // For default imports, we don't do anything
  if (!importLine.includes('{')) {
    return importLine;
  }
  
  // Extract the parts before and after the curly braces
  const beforeCurly = importLine.split('{')[0];
  const afterCurly = importLine.split('}')[1];
  
  // Extract the variables inside the curly braces
  const importVarsMatch = importLine.match(/{([^}]*)}/);
  if (!importVarsMatch) return importLine;
  
  const importVarsString = importVarsMatch[1];
  const importVars = importVarsString.split(',').map(v => v.trim());
  
  // Filter out the variables to remove
  const updatedImportVars = importVars.filter(v => !varsToRemove.includes(v));
  
  // If no imports remain, remove the entire import statement
  if (updatedImportVars.length === 0) {
    return '';
  }
  
  // Reconstruct the import statement
  return `${beforeCurly}{ ${updatedImportVars.join(', ')} }${afterCurly}`;
}

// Main function
async function main() {
  console.log('Finding unused variables...');
  const unusedVars = getUnusedVariables();
  
  if (unusedVars.length === 0) {
    console.log('No unused variables found!');
    return;
  }
  
  console.log(`Found ${unusedVars.length} unused variables in ${new Set(unusedVars.map(v => v.file)).size} files.`);
  
  // Group by file
  const fileGroups = {};
  unusedVars.forEach(v => {
    if (!fileGroups[v.file]) {
      fileGroups[v.file] = [];
    }
    fileGroups[v.file].push(v);
  });
  
  // Process each file
  for (const [filePath, vars] of Object.entries(fileGroups)) {
    await fixUnusedVarsInFile(filePath, vars);
  }
  
  console.log('\nDone! Please review the changes.');
}

// Main execution
const directories = [
  'src/components',
  'src/constants',
  'src/contexts',
  'src/data',
  'src/hooks',
  'src/lib',
  'src/pages',
  'src/scripts',
  'src/services',
  'src/types',
  'src/utils'
];

console.log('Processing directories in batches...');

// Ask user confirmation
rl.question('Do you want to prefix all unused variables with an underscore? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    directories.forEach(dir => {
      main();
    });
    console.log('Done! You may need to run eslint again to check if all issues are fixed.');
  } else {
    console.log('Operation cancelled.');
  }
  rl.close();
}); 