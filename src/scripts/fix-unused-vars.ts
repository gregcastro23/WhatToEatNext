/**
 * This script helps fix unused variables by adding a leading underscore
 * to variable names that are reported as unused by ESLint.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Get the list of unused variables from ESLint
function getUnusedVariables() {
  try {
    const output = execSync(
      'npx eslint --ext .js,.jsx,.ts,.tsx src/ --format json'
    ).toString();
    const results = JSON.parse(output);

    const unusedVars: Array<{filePath: string; varName: string; line: number; column: number}> = [];

    for (const result of results) {
      const filePath = result.filePath;

      for (const message of result.messages) {
        if (message.ruleId === '@typescript-eslint/no-unused-vars') {
          // Extract the variable name from the message
          const match = message.message.match(
            /'([^']+)' is defined but never used/
          );
          if (match?.[1]) {
            unusedVars.push({
              filePath,
              varName: match[1],
              line: message.line,
              column: message.column,
            });
          }
        }
      }
    }

    return unusedVars;
  } catch (error) {
    // console.error('Error running ESLint:', error);
    return [];
  }
}

// Fix unused variables by adding an underscore prefix
function fixUnusedVariables(unusedVars) {
  const processedFiles = new Set();

  for (const { filePath, varName, line, column } of unusedVars) {
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Simple fix: replace the variable name with _variableName on that line
    const lineContent = lines[line - 1];
    const newLineContent =
      lineContent.substring(0, column - 1) +
      '_' +
      lineContent.substring(column - 1);

    lines[line - 1] = newLineContent;

    // Write the file back
    fs.writeFileSync(filePath, lines.join('\n'));
    processedFiles.add(filePath);

    // console.log(`Fixed unused variable '${varName}' in ${filePath}`);
  }

  // console.log(`\nProcessed ${processedFiles.size} files`);
}

// Main function
function main() {
  // console.log('Identifying unused variables...');
  const unusedVars = getUnusedVariables();
  // console.log(`Found ${unusedVars.length} unused variables`);

  if (unusedVars.length > 0) {
    // console.log('Fixing unused variables...');
    fixUnusedVariables(unusedVars);
  }
}

main();
