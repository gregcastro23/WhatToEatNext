import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create test directory if it doesn't exist
const TEST_DIR = path.join(__dirname, 'fixer-comparison');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

// Fixers to compare
const FIXERS = [
  {
    name: 'fix-typescript-safely.js',
    description: 'General TypeScript safe fixer'
  },
  {
    name: 'fix-syntax-errors.js',
    description: 'Syntax error fixer'
  },
  {
    name: 'fix-cuisine-files.js',
    description: 'Cuisine-specific fixer'
  }
];

/**
 * Compares different fixers on the same sample files
 * @param {string[]} sampleFiles - Array of paths to sample files
 */
function compareFixers(sampleFiles) {
  console.log('=== FIXER COMPARISON ===\n');
  console.log(`Testing ${FIXERS.length} fixers on ${sampleFiles.length} sample files`);
  
  // For each sample file
  for (const sampleFile of sampleFiles) {
    const filename = path.basename(sampleFile);
    console.log(`\n== Testing file: ${filename} ==`);
    
    // For each fixer
    for (const fixer of FIXERS) {
      // Create a test copy of the file
      const testDir = path.join(TEST_DIR, fixer.name.replace('.js', ''));
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      const testFile = path.join(testDir, filename);
      fs.copyFileSync(sampleFile, testFile);
      
      // Count TypeScript errors before fixing
      let beforeErrors = 0;
      try {
        execSync(`npx tsc --noEmit ${testFile}`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (error) {
        const errorOutput = error.message;
        const errorLines = errorOutput.split('\n').filter(line => 
          line.includes(filename) && line.includes('error TS')
        );
        beforeErrors = errorLines.length;
      }
      
      // Run the fixer
      console.log(`\n> Testing ${fixer.name} (${fixer.description})`);
      console.log(`  Before: ${beforeErrors} TypeScript errors`);
      
      try {
        // Run the fixer script with the test file as an argument
        execSync(`node ${fixer.name} ${testFile}`, { encoding: 'utf8', stdio: 'pipe' });
        
        // Count TypeScript errors after fixing
        let afterErrors = 0;
        try {
          execSync(`npx tsc --noEmit ${testFile}`, { encoding: 'utf8', stdio: 'pipe' });
        } catch (error) {
          const errorOutput = error.message;
          const errorLines = errorOutput.split('\n').filter(line => 
            line.includes(filename) && line.includes('error TS')
          );
          afterErrors = errorLines.length;
        }
        
        console.log(`  After: ${afterErrors} TypeScript errors`);
        console.log(`  Result: ${beforeErrors - afterErrors} errors fixed (${Math.round((beforeErrors - afterErrors) / beforeErrors * 100)}%)`);
        
        // Compare file sizes
        const originalSize = fs.statSync(sampleFile).size;
        const fixedSize = fs.statSync(testFile).size;
        console.log(`  Size change: ${((fixedSize - originalSize) / originalSize * 100).toFixed(2)}%`);
        
      } catch (error) {
        console.log(`  Error running fixer: ${error.message}`);
      }
    }
  }
  
  console.log('\nFixer comparison complete!');
}

// Sample files for testing
const sampleFiles = [
  path.join(__dirname, 'src', 'utils', 'reliableAstronomy.ts'),
  path.join(__dirname, 'src', 'utils', 'safeAccess.ts'),
  path.join(__dirname, 'src', 'data', 'cuisines', 'italian.ts')
].filter(file => fs.existsSync(file));

// Run the comparison
compareFixers(sampleFiles);

// Cleanup test files
console.log('\nCleaning up test files...');
fs.rmSync(TEST_DIR, { recursive: true, force: true }); 