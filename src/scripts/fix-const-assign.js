/**
 * Script to fix 'no-const-assign' linting errors
 * This script replaces 'const' with 'let' for variables that are reassigned
 *
 * Run with: node src/scripts/fix-const-assign.js <filepath>
 * Example: node src/scripts/fix-const-assign.js src/utils/foodRecommender.ts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  // console.error('Please provide a file path');
  process.exit(1);
}

const filePath = args[0];
const absolutePath = path.resolve(process.cwd(), filePath);

// Check if file exists
if (!fs.existsSync(absolutePath)) {
  // console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

// Create backup
const backupPath = `${absolutePath}.bak`;
try {
  fs.copyFileSync(absolutePath, backupPath);
  // console.log(`Created backup at ${backupPath}`);
} catch (error) {
  // console.error(`Failed to create backup: ${error.message}`);
  process.exit(1);
}

// Get list of const variables that are reassigned
try {
  // Run ESLint to find const-assign errors
  const eslintOutput = execSync(`npx eslint "${absolutePath}" --format json`, { encoding: 'utf8' });
  const eslintResult = JSON.parse(eslintOutput);

  // Extract variables with 'no-const-assign' errors
  const constAssignErrors = [];
  if (eslintResult.length > 0 && eslintResult[0].messages) {
    eslintResult[0].messages.forEach(message => {
      if (message.ruleId === 'no-const-assign') {
        constAssignErrors.push({
          line: message.line,
          column: message.column,
          varName: message.message.match(/['"]([^'"]+)['"]/)[1],
        });
      }
    });
  }

  if (constAssignErrors.length === 0) {
    // console.log('No no-const-assign errors found');
    // Clean up backup
    fs.unlinkSync(backupPath);
    process.exit(0);
  }

  // console.log(`Found ${constAssignErrors.length} no-const-assign errors`);

  // Read the file content
  const fileContent = fs.readFileSync(absolutePath, 'utf8');
  const lines = fileContent.split('\n');

  // Track which lines have been modified to avoid duplicate changes
  const modifiedLines = new Set();

  // For each error, find the declaration line and replace 'const' with 'let'
  let updatedContent = fileContent;
  constAssignErrors.forEach(error => {
    const varName = error.varName;
    // Look for the declaration in the file
    const declarationRegex = new RegExp(`const\\s+${varName}\\s*=`, 'g');

    // Replace all occurrences
    updatedContent = updatedContent.replace(declarationRegex, `let ${varName} =`);
  });

  // Write the updated content back to the file
  fs.writeFileSync(absolutePath, updatedContent, 'utf8');
  // console.log(`Updated ${absolutePath}`);

  // Run prettier to format the file
  try {
    execSync(`npx prettier --write "${absolutePath}"`, { stdio: 'ignore' });
    // console.log('Formatted file with prettier');
  } catch (error) {
    // console.log(`Note: Could not format file with prettier: ${error.message}`);
  }

  // Verify the fix worked
  try {
    const verifyOutput = execSync(`npx eslint "${absolutePath}" --format json`, {
      encoding: 'utf8',
    });
    const verifyResult = JSON.parse(verifyOutput);

    const remainingErrors = verifyResult[0].messages.filter(
      m => m.ruleId === 'no-const-assign',
    ).length;

    if (remainingErrors === 0) {
      // console.log('Successfully fixed all no-const-assign errors!');
      // Clean up backup
      fs.unlinkSync(backupPath);
    } else {
      // console.log(`There are still ${remainingErrors} no-const-assign errors remaining.`);
      // console.log('You may need to run the script again or fix them manually.');
    }
  } catch (error) {
    // console.error(`Error verifying fix: ${error.message}`);
  }
} catch (error) {
  // console.error(`Error: ${error.message}`);
  // Restore from backup
  try {
    fs.copyFileSync(backupPath, absolutePath);
    // console.log(`Restored from backup due to error`);
  } catch (restoreError) {
    // console.error(`Failed to restore from backup: ${restoreError.message}`);
  }
  process.exit(1);
}
