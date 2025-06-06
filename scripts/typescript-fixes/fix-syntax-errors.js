import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Files with specific syntax errors
const filesToFix = [
  {
    path: 'src/lib/ChakraAlchemyService.ts',
    fix: (content) => {
      // Fix syntax errors in ChakraAlchemyService.ts
      // Look for functions with syntax errors
      let fixed = content;
      
      // Remove unexpected comma or other syntax issues
      fixed = fixed.replace(/export\s+class\s+ChakraAlchemyService\s*{([^}]+)}/gs, (match, classBody) => {
        // Fix method declarations
        let fixedBody = classBody.replace(/private\s+([a-zA-Z0-9_]+)\s*\([^)]*\):\s*[^{]*{/g, (methodMatch) => {
          return methodMatch.trim();
        });
        
        return `export class ChakraAlchemyService {${fixedBody}}`;
      });
      
      return fixed;
    }
  },
  {
    path: 'src/lib/FoodAlchemySystem.ts',
    fix: (content) => {
      // Fix syntax errors in FoodAlchemySystem.ts
      // Look for unexpected commas or other syntax issues
      let fixed = content;
      
      // Fix the broken object declaration with energy property
      fixed = fixed.replace(
        /energyValues:\s*{\s*heat:\s*([^,]+),\s*entropy:\s*([^,]+),\s*reactivity:\s*([^,]+)\s*}([\s\S]*?),\s*energy:/g,
        (match, heat, entropy, reactivity, rest) => {
          return `energyValues: { heat: ${heat}, entropy: ${entropy}, reactivity: ${reactivity}, energy: (${heat} * ${entropy}) / ${reactivity} }`;
        }
      );
      
      return fixed;
    }
  },
  {
    path: 'src/services/FoodAlchemySystem.ts',
    fix: (content) => {
      // Fix syntax errors in services/FoodAlchemySystem.ts (same issues as lib/FoodAlchemySystem.ts)
      let fixed = content;
      
      // Fix the broken object declaration with energy property
      fixed = fixed.replace(
        /energyValues:\s*{\s*heat:\s*([^,]+),\s*entropy:\s*([^,]+),\s*reactivity:\s*([^,]+)\s*}([\s\S]*?),\s*energy:/g,
        (match, heat, entropy, reactivity, rest) => {
          return `energyValues: { heat: ${heat}, entropy: ${entropy}, reactivity: ${reactivity}, energy: (${heat} * ${entropy}) / ${reactivity} }`;
        }
      );
      
      return fixed;
    }
  },
  {
    path: 'src/types/alchemy.ts',
    fix: (content) => {
      // Fix syntax errors in alchemy.ts
      let fixed = content;
      
      // Fix the broken object with energy property at the end
      fixed = fixed.replace(
        /([^\s])\s*,\s*energy:\s*\(([^)]+)\)\s*\/\s*([^}]+)\s*}/g,
        (match, prefix, numerator, denominator) => {
          return `${prefix}, energy: (${numerator})/${denominator} }`;
        }
      );
      
      // Remove any standalone comma property expressions
      fixed = fixed.replace(/^\s*,\s*energy:.*$/gm, '');
      
      return fixed;
    }
  }
];

// Process the files with known syntax errors
function processFiles() {
  for (const fileInfo of filesToFix) {
    const filePath = path.join(rootDir, fileInfo.path);
    
    if (fs.existsSync(filePath)) {
      filesScanned++;
      
      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Apply file-specific fixes
      content = fileInfo.fix(content);
      
      // Check if content was modified
      if (content !== originalContent) {
        filesModified++;
        errorsFixed++;
        
        if (verbose) {
          console.log(`Fixed syntax errors in ${filePath}`);
        }
        
        if (!dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    } else {
      if (verbose) {
        console.log(`File not found: ${filePath}`);
      }
    }
  }
}

console.log(`Running fix-syntax-errors.js ${dryRun ? '(dry run)' : ''}`);

// Process files
processFiles();

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Syntax errors fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); 