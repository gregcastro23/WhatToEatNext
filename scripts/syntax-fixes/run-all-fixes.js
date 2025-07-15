import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Helper function to execute commands
function executeCommand(command) {
  console.log(`\n> Executing: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check if a file has TypeScript syntax errors (not type errors)
function checkForSyntaxErrors(filePath) {
  console.log(`\n> Checking for syntax errors in: ${filePath}`);
  try {
    // Use tsc to check for syntax errors only
    execSync(`npx tsc --noEmit --noDiagnostics ${filePath}`, { encoding: 'utf8' });
    console.log('✅ No syntax errors detected');
    return true;
  } catch (error) {
    console.log('❌ Syntax errors detected:');
    console.log(error.message);
    return false;
  }
}

// Main function to run the fix scripts
async function runFixScripts() {
  console.log('🔧 Running syntax fix scripts for alchemicalEngine.ts');
  
  const targetFile = path.resolve(process.cwd(), 'src/calculations/alchemicalEngine.ts');
  
  // Make sure the target file exists
  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Target file does not exist: ${targetFile}`);
    process.exit(1);
  }
  
  // Create a backup of the original file
  const backupFile = `${targetFile}.bak`;
  fs.copyFileSync(targetFile, backupFile);
  console.log(`✅ Created backup file: ${backupFile}`);
  
  // Check for syntax errors before running fixes
  const hadErrorsBefore = !checkForSyntaxErrors(targetFile);
  
  // Run the fix scripts in sequence
  console.log('\n🔧 Step 1: Running fix-final-syntax-errors.js');
  const step1Success = executeCommand('node scripts/syntax-fixes/fix-final-syntax-errors.js --apply');
  
  console.log('\n🔧 Step 2: Running fix-remaining-syntax-errors.js');
  const step2Success = executeCommand('node scripts/syntax-fixes/fix-remaining-syntax-errors.js --apply');
  
  console.log('\n🔧 Step 3: Running fix-specific-syntax-errors.js');
  const step3Success = executeCommand('node scripts/syntax-fixes/fix-specific-syntax-errors.js --apply');
  
  // Check for syntax errors after running fixes
  const hasErrorsAfter = !checkForSyntaxErrors(targetFile);
  
  // Summary
  console.log('\n📋 Summary:');
  console.log(`- Had syntax errors before: ${hadErrorsBefore ? 'Yes ❌' : 'No ✅'}`);
  console.log(`- Has syntax errors after: ${hasErrorsAfter ? 'Yes ❌' : 'No ✅'}`);
  console.log(`- Step 1 executed successfully: ${step1Success ? 'Yes ✅' : 'No ❌'}`);
  console.log(`- Step 2 executed successfully: ${step2Success ? 'Yes ✅' : 'No ❌'}`);
  console.log(`- Step 3 executed successfully: ${step3Success ? 'Yes ✅' : 'No ❌'}`);
  
  if (hadErrorsBefore && !hasErrorsAfter) {
    console.log('\n🎉 Success! All syntax errors have been fixed.');
  } else if (!hadErrorsBefore) {
    console.log('\n⚠️ No syntax errors were detected before running the fix scripts.');
  } else {
    console.log('\n❌ Some syntax errors remain. Check the file manually.');
  }
}

// Run the script
runFixScripts().catch(error => {
  console.error('Error running fix scripts:', error);
  process.exit(1);
}); 