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
    // Use grep to extract unused variable errors from the ESLint output
    const result = execSync('yarn eslint . --ext .js,.jsx,.ts,.tsx --quiet | grep "no-unused-vars\\|@typescript-eslint/no-unused-vars"').toString();
    
    const unusedVars = [];
    
    // Parse the ESLint output line by line
    const lines = result.split('\n').filter(Boolean);
    for (const line of lines) {
      // Example line: src/file.ts:10:7 error 'varName' is defined but never used @typescript-eslint/no-unused-vars
      const match = line.match(/([^:]+):(\d+):(\d+).*['"]([^'"]+)['"]/);
      if (match) {
        const [_, file, lineNum, colNum, varName] = match;
        unusedVars.push({
          file: path.resolve(file),
          line: parseInt(lineNum, 10),
          column: parseInt(colNum, 10),
          varName,
          messageType: line.includes('assigned a value but never used') ? 'assigned' : 'defined'
        });
      }
    }
    
    return unusedVars;
  } catch (error) {
    // If the grep command fails because there are no unused vars, that's OK
    if (error.status === 1 && error.stderr.toString().trim() === '') {
      return [];
    }
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
        // Add an underscore prefix to the import
        const updatedLine = line.replace(
          `{ ${lineVars[0].varName} }`, 
          `{ ${lineVars[0].varName} as _${lineVars[0].varName} }`
        );
        console.log(`Prefixed unused import: ${updatedLine.trim()}`);
        lines[lineNum - 1] = updatedLine;
      } else {
        // Prefix specific variables in an import with multiple items
        let updatedLine = line;
        lineVars.forEach(v => {
          // Add "as _varName" to the import
          const regex = new RegExp(`\\b${v.varName}\\b(?!\\s+as)`, 'g');
          updatedLine = updatedLine.replace(regex, `${v.varName} as _${v.varName}`);
        });
        console.log(`Updated import: ${updatedLine.trim()}`);
        lines[lineNum - 1] = updatedLine;
      }
    } else if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
      // Handle variable declarations
      // Add underscore prefix to unused variables
      let updatedLine = line;
      lineVars.forEach(v => {
        const regex = new RegExp(`\\b(const|let|var)\\s+${v.varName}\\b`, 'g');
        updatedLine = updatedLine.replace(regex, `$1 _${v.varName}`);
      });
      console.log(`Prefixed variable: ${updatedLine.trim()}`);
      lines[lineNum - 1] = updatedLine;
    } else if (line.includes('function ') || line.match(/\([^)]*\)\s*{/)) {
      // Handle function parameters
      let updatedLine = line;
      lineVars.forEach(v => {
        // Match the variable in the parameter list
        const paramRegex = new RegExp(`\\b${v.varName}\\b(?=\\s*[,:)])`, 'g');
        updatedLine = updatedLine.replace(paramRegex, `_${v.varName}`);
      });
      console.log(`Prefixed parameter: ${updatedLine.trim()}`);
      lines[lineNum - 1] = updatedLine;
    } else {
      // For other cases, try to prefix the variable
      let updatedLine = line;
      lineVars.forEach(v => {
        const regex = new RegExp(`\\b${v.varName}\\b`, 'g');
        updatedLine = updatedLine.replace(regex, `_${v.varName}`);
      });
      console.log(`Prefixed variable: ${updatedLine.trim()}`);
      lines[lineNum - 1] = updatedLine;
    }
  }
  
  // Write the updated content back to the file
  const updatedContent = lines.join('\n');
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`\nUpdated ${filePath}`);
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

console.log('Ready to process unused variables in codebase...');

// Ask user confirmation
rl.question('Do you want to prefix all unused variables with an underscore? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    main().catch(err => console.error('Error:', err));
  } else {
    console.log('Operation cancelled.');
  }
  rl.close();
}); 