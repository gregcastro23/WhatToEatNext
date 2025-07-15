/**
 * Script to fix unused variables in TypeScript/JavaScript files
 * This script prefixes unused variables with an underscore (_) to follow the project convention
 * 
 * Run with: node src/scripts/fix-unused-vars.js <filepath>
 * Example: node src/scripts/fix-unused-vars.js src/utils/foodRecommender.ts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a file path');
  process.exit(1);
}

const filePath = args[0];
const absolutePath = path.resolve(process.cwd(), filePath);

// Check if file exists
if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

// Create backup
const backupPath = `${absolutePath}.bak`;
try {
  fs.copyFileSync(absolutePath, backupPath);
  console.log(`Created backup at ${backupPath}`);
} catch (error) {
  console.error(`Failed to create backup: ${error.message}`);
  process.exit(1);
}

// Get list of unused variables
try {
  // Run ESLint to find unused variables
  const eslintOutput = execSync(`npx eslint "${absolutePath}" --format json`, { encoding: 'utf8' });
  const eslintResult = JSON.parse(eslintOutput);
  
  // Extract unused variables
  const unusedVars = [];
  if (eslintResult.length > 0 && eslintResult[0].messages) {
    eslintResult[0].messages.forEach(message => {
      if (message.ruleId === '@typescript-eslint/no-unused-vars') {
        let varName = '';
        try {
          // Different error message formats exist based on version
          const regex1 = /'([^']+)'/;
          const regex2 = /['"]([^'"]+)['"]/;
          
          if (message.message.includes("'")) {
            varName = message.message.match(regex1)[1];
          } else if (message.message.includes('"')) {
            varName = message.message.match(regex2)[1];
          }
          
          if (varName && !varName.startsWith('_')) {
            unusedVars.push({
              line: message.line,
              column: message.column,
              varName: varName
            });
          }
        } catch (e) {
          console.warn(`Could not extract variable name from message: ${message.message}`);
        }
      }
    });
  }
  
  if (unusedVars.length === 0) {
    console.log('No unused variables found, or all unused variables already start with underscore');
    // Clean up backup
    fs.unlinkSync(backupPath);
    process.exit(0);
  }
  
  console.log(`Found ${unusedVars.length} unused variables to fix`);
  
  // Read the file content
  let fileContent = fs.readFileSync(absolutePath, 'utf8');
  
  // Process each unused variable
  unusedVars.forEach(unusedVar => {
    const { varName } = unusedVar;
    
    // Common patterns for variable declarations
    const declarationPatterns = [
      new RegExp(`(const|let|var)\\s+${varName}\\s*=`, 'g'),   // Regular variable declaration
      new RegExp(`function\\s+${varName}\\s*\\(`, 'g'),         // Function declaration
      new RegExp(`(\\(|,\\s*)${varName}(\\)|\\s*:|,)`, 'g'),    // Function parameters
      new RegExp(`(\\{|,\\s*)${varName}(\\s*\\}|\\s*:|,)`, 'g') // Destructuring
    ];
    
    // Replace each pattern
    declarationPatterns.forEach(pattern => {
      fileContent = fileContent.replace(pattern, (match) => {
        if (match.includes('const ')) {
          return match.replace(`const ${varName}`, `const _${varName}`);
        } else if (match.includes('let ')) {
          return match.replace(`let ${varName}`, `let _${varName}`);
        } else if (match.includes('var ')) {
          return match.replace(`var ${varName}`, `var _${varName}`);
        } else if (match.includes('function ')) {
          return match.replace(`function ${varName}`, `function _${varName}`);
        } else if (match.startsWith('(') || match.startsWith(',')) {
          return match.replace(varName, `_${varName}`);
        } else if (match.startsWith('{') || match.startsWith(',')) {
          return match.replace(varName, `_${varName}`);
        }
        return match;
      });
    });
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(absolutePath, fileContent, 'utf8');
  console.log(`Updated ${absolutePath}`);
  
  // Run prettier to format the file
  try {
    execSync(`npx prettier --write "${absolutePath}"`, { stdio: 'ignore' });
    console.log('Formatted file with prettier');
  } catch (error) {
    console.log(`Note: Could not format file with prettier: ${error.message}`);
  }
  
  // Verify the fix worked
  try {
    const verifyOutput = execSync(`npx eslint "${absolutePath}" --format json`, { encoding: 'utf8' });
    const verifyResult = JSON.parse(verifyOutput);
    
    const remainingErrors = verifyResult[0].messages.filter(m => 
      m.ruleId === '@typescript-eslint/no-unused-vars' && 
      // Only count errors for variables not already starting with underscore
      !m.message.includes("'_")
    ).length;
    
    if (remainingErrors === 0) {
      console.log('Successfully fixed all unused variable errors!');
      // Clean up backup if everything went well
      fs.unlinkSync(backupPath);
    } else {
      console.log(`There are still ${remainingErrors} unused variable errors remaining.`);
      console.log('You may need to run the script again or fix them manually.');
    }
  } catch (error) {
    console.error(`Error verifying fix: ${error.message}`);
  }
  
} catch (error) {
  console.error(`Error: ${error.message}`);
  // Restore from backup
  try {
    fs.copyFileSync(backupPath, absolutePath);
    console.log(`Restored from backup due to error`);
  } catch (restoreError) {
    console.error(`Failed to restore from backup: ${restoreError.message}`);
  }
  process.exit(1);
} 