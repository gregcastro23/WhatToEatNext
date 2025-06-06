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

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  {
    // Fix: intensity: ingredient.intensity || 0.5,
    regex: /(\w+):\s*(\w+)\.(\w+)\s*\|\|\s*([^,}]+)/g,
    check: (content, match) => {
      // Check if this is likely an unknown type issue
      // Look for TypeScript error comments near this line
      const errorComment = /\/\/\s*Type\s*'unknown'/;
      const lines = content.split('\n');
      const matchLine = lines.findIndex(line => line.includes(match[0]));
      
      if (matchLine === -1) return false;
      
      // Check nearby lines for error comments
      const start = Math.max(0, matchLine - 5);
      const end = Math.min(lines.length, matchLine + 5);
      const nearbyLines = lines.slice(start, end).join('\n');
      
      return errorComment.test(nearbyLines);
    },
    fix: (content, match) => {
      // Add type assertion
      return content.replace(
        `${match[1]}: ${match[2]}.${match[3]} || ${match[4]}`,
        `${match[1]}: (${match[2]}.${match[3]} as unknown as number) || ${match[4]}`
      );
    }
  },
  {
    // Fix: culturalOrigins: ingredient.culturalOrigins || [ingredient.category || 'universal'],
    regex: /(\w+):\s*(\w+)\.(\w+)\s*\|\|\s*\[(.*)\]/g,
    check: (content, match) => {
      const errorComment = /\/\/\s*Type\s*'unknown'/;
      const lines = content.split('\n');
      const matchLine = lines.findIndex(line => line.includes(match[0]));
      
      if (matchLine === -1) return false;
      
      const start = Math.max(0, matchLine - 5);
      const end = Math.min(lines.length, matchLine + 5);
      const nearbyLines = lines.slice(start, end).join('\n');
      
      return errorComment.test(nearbyLines);
    },
    fix: (content, match) => {
      // Add type assertion for array types
      return content.replace(
        `${match[1]}: ${match[2]}.${match[3]} || [${match[4]}]`,
        `${match[1]}: (${match[2]}.${match[3]} as unknown as string[]) || [${match[4]}]`
      );
    }
  },
  {
    // Fix Season type issue
    regex: /\(\w+\.\w+\s+as\s+Season\)/g,
    check: (content) => {
      return !content.includes('import { Season }') && 
             !content.includes('import type { Season }');
    },
    fix: (content, match) => {
      // Add Season import if it doesn't exist
      if (!content.includes('import { Season }') && !content.includes('import type { Season }')) {
        // Add import at the top of the file, after other imports
        const importStatement = "import type { Season } from '@/types/alchemy';\n";
        
        // Find a good place to insert the import
        if (content.includes('import ')) {
          // Find the last import statement
          const lastImportIndex = content.lastIndexOf('import ');
          const endOfImport = content.indexOf('\n', lastImportIndex);
          
          if (endOfImport !== -1) {
            return content.substring(0, endOfImport + 1) + 
                  importStatement + 
                  content.substring(endOfImport + 1);
          }
        }
        
        // If no imports found, add at the top
        return importStatement + content;
      }
      
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              console.log(`  - Before: ${match[0]}`);
              console.log(`  - After: ${content.substring(content.indexOf(match[1]), content.indexOf(match[1]) + 50)}...`);
            }
          }
        }
      }
    }
    
    // Add missing Season import if needed
    if (content.includes('as Season') && !content.includes('import type { Season }') && !content.includes('import { Season }')) {
      const importStatement = "import type { Season } from '@/types/alchemy';\n";
      
      // Find a good place to insert the import
      if (content.includes('import ')) {
        // Find the last import statement
        const lastImportIndex = content.lastIndexOf('import ');
        const endOfImport = content.indexOf('\n', lastImportIndex);
        
        if (endOfImport !== -1) {
          content = content.substring(0, endOfImport + 1) + 
                  importStatement + 
                  content.substring(endOfImport + 1);
          errorsFixed++;
          fileFixed = true;
          
          if (verbose) {
            console.log(`Added missing Season import in ${filePath}`);
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-types.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); 