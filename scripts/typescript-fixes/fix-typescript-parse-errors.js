// Fix TypeScript parsing errors
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find files with TypeScript parsing errors
function findFilesWithParseErrors() {
  try {
    // Run ESLint to find parse errors - using the correct format
    const result = execSync('npx next lint --format json').toString();
    const lintResults = JSON.parse(result);
    
    const parseErrors = [];
    
    lintResults.forEach(fileResult => {
      const filePath = fileResult.filePath;
      const errors = fileResult.messages.filter(msg => 
        msg.fatal || // Fatal errors are typically parse errors
        msg.message.includes('Parsing error') || 
        msg.message.includes('Expected')
      );
      
      if (errors.length > 0) {
        parseErrors.push({
          file: filePath,
          errors: errors.map(e => ({
            line: e.line,
            column: e.column,
            message: e.message
          }))
        });
      }
    });
    
    return parseErrors;
  } catch (error) {
    console.error('Error running ESLint:', error.message);
    return [];
  }
}

// Fix common TypeScript issues in a file
async function fixParseErrorsInFile(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  console.log(`\nProcessing ${path.basename(filePath)}`);
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Add missing React imports for JSX files
  if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && 
      !fileContent.includes('import React') && 
      fileContent.includes('JSX')) {
    console.log('Adding missing React import');
    fileContent = `import React from 'react';\n${fileContent}`;
  }
  
  // Fix 2: Replace 'Function' type with more specific function type
  if (fileContent.includes(': Function') || fileContent.includes('as Function')) {
    console.log('Replacing Function type with proper function type');
    fileContent = fileContent.replace(/: Function(\s|[,)])/g, ': () => void$1');
    fileContent = fileContent.replace(/as Function(\s|[,)])/g, 'as () => void$1');
  }
  
  // Fix 3: Replace 'any' with more specific types where possible
  if (fileContent.includes(': any') || fileContent.includes('as any')) {
    console.log('Examining "any" types for potential improvements');
    
    // Pattern to identify common any usages and their potential replacements
    const anyReplacements = [
      // Arrays
      { pattern: /: any\[\]/g, replacement: ': unknown[]' },
      // Event handlers
      { pattern: /: any\)\s*=>\s*void/g, replacement: ': React.SyntheticEvent) => void' },
      // Generic objects
      { pattern: /: Record<string, any>/g, replacement: ': Record<string, unknown>' },
      // Promise returns
      { pattern: /Promise<any>/g, replacement: 'Promise<unknown>' }
    ];
    
    anyReplacements.forEach(({ pattern, replacement }) => {
      fileContent = fileContent.replace(pattern, replacement);
    });
  }
  
  // Fix 4: Fix missing semicolons (common in TypeScript)
  errors.forEach(error => {
    if (error.message.includes("Missing semicolon")) {
      const lines = fileContent.split('\n');
      if (error.line <= lines.length) {
        const line = lines[error.line - 1];
        if (!line.trim().endsWith(';')) {
          lines[error.line - 1] = line + ';';
          console.log(`Added missing semicolon at line ${error.line}`);
        }
      }
      fileContent = lines.join('\n');
    }
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`Updated ${filePath}`);
}

// Main function
async function main() {
  console.log('Finding files with TypeScript parsing errors...');
  const filesWithErrors = findFilesWithParseErrors();
  
  if (filesWithErrors.length === 0) {
    console.log('No TypeScript parsing errors found!');
    return;
  }
  
  console.log(`Found parsing errors in ${filesWithErrors.length} files.`);
  
  // Process each file
  for (const fileWithErrors of filesWithErrors) {
    await fixParseErrorsInFile(fileWithErrors.file, fileWithErrors.errors);
  }
  
  console.log('\nDone! Please verify the changes manually.');
}

main().catch(console.error); 