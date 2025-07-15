import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates a TypeScript file and reports any errors
 * @param {string} filePath - Path to the TypeScript file
 * @returns {object} - Object containing error information
 */
function validateTypeScriptFile(filePath) {
  console.log(`Validating ${filePath}...`);
  
  try {
    // Run TypeScript compiler on the file
    execSync(`npx tsc --noEmit ${filePath}`, { encoding: 'utf8', stdio: 'pipe' });
    
    console.log(`✅ ${filePath}: No TypeScript errors`);
    return {
      file: filePath,
      hasErrors: false,
      errors: []
    };
  } catch (error) {
    // Extract error messages from the TypeScript output
    const errorOutput = error.message;
    const errorLines = errorOutput.split('\n').filter(line => 
      line.includes(path.basename(filePath)) && line.includes('error TS')
    );
    
    const parsedErrors = errorLines.map(line => {
      // Extract error code and message
      const match = line.match(/error TS(\d+): (.+)$/);
      return match ? {
        code: `TS${match[1]}`,
        message: match[2]
      } : { raw: line };
    });
    
    console.log(`❌ ${filePath}: ${parsedErrors.length} TypeScript errors`);
    parsedErrors.forEach((err, i) => {
      if (i < 5) { // Only show first 5 errors
        console.log(`   ${err.code || 'Error'}: ${err.message || err.raw}`);
      } else if (i === 5) {
        console.log(`   ... and ${parsedErrors.length - 5} more errors`);
      }
    });
    
    return {
      file: filePath,
      hasErrors: true,
      errors: parsedErrors
    };
  }
}

/**
 * Validates all files in a directory or specific files
 * @param {string[]} paths - Array of file or directory paths
 * @returns {object[]} - Array of validation results
 */
function validateTypeScript(paths) {
  const results = [];
  
  for (const inputPath of paths) {
    if (fs.statSync(inputPath).isDirectory()) {
      // Process all TypeScript files in directory
      const files = fs.readdirSync(inputPath)
        .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
        .map(file => path.join(inputPath, file));
      
      for (const file of files) {
        results.push(validateTypeScriptFile(file));
      }
    } else {
      // Process single file
      results.push(validateTypeScriptFile(inputPath));
    }
  }
  
  // Print summary
  const errorCount = results.filter(r => r.hasErrors).length;
  const fileCount = results.length;
  
  console.log(`\nValidation complete: ${errorCount}/${fileCount} files have errors`);
  
  return results;
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node validate-ts-file.js <file_or_directory_paths>');
  console.log('Example: node validate-ts-file.js src/utils/reliableAstronomy.ts');
  process.exit(1);
}

// Run validation
validateTypeScript(args); 