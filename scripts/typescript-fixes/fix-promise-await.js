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

// Promise usage patterns that need fixing
const promisePatterns = [
  {
    // filteredIngredients.filter(ing => ...)
    regex: /(\w+)\.filter\(/g,
    check: (file, match) => {
      // Check if the line or previous line contains an await, but the match doesn't
      const lines = file.split('\n');
      const matchLine = lines.findIndex(line => line.includes(match[0]));
      if (matchLine === -1) return false;
      
      // Check if the variable is declared as a Promise
      const varDeclaration = new RegExp(`const\\s+${match[1]}\\s*=\\s*await`);
      const varDeclarationPromise = new RegExp(`const\\s+${match[1]}\\s*:\\s*Promise`);
      const prevLines = lines.slice(0, matchLine).join('\n');
      
      return (prevLines.match(varDeclarationPromise) && !prevLines.match(varDeclaration)) ||
             lines[matchLine].includes(`${match[1]}.filter`) && !lines[matchLine].includes('await');
    },
    fix: (content, match) => {
      // Only add await if it's not already there
      if (!content.includes(`await ${match[1]}.filter`)) {
        return content.replace(`${match[1]}.filter`, `await ${match[1]}.filter`);
      }
      return content;
    }
  },
  {
    // filteredIngredients.map(ingredient => ...)
    regex: /(\w+)\.map\(/g,
    check: (file, match) => {
      const lines = file.split('\n');
      const matchLine = lines.findIndex(line => line.includes(match[0]));
      if (matchLine === -1) return false;
      
      // Check if the variable is declared as a Promise
      const varDeclaration = new RegExp(`const\\s+${match[1]}\\s*=\\s*await`);
      const varDeclarationPromise = new RegExp(`const\\s+${match[1]}\\s*:\\s*Promise`);
      const prevLines = lines.slice(0, matchLine).join('\n');
      
      return (prevLines.match(varDeclarationPromise) && !prevLines.match(varDeclaration)) ||
             lines[matchLine].includes(`${match[1]}.map`) && !lines[matchLine].includes('await');
    },
    fix: (content, match) => {
      if (!content.includes(`await ${match[1]}.map`)) {
        return content.replace(`${match[1]}.map`, `await ${match[1]}.map`);
      }
      return content;
    }
  },
  {
    // filteredIngredients.forEach(ingredient => ...)
    regex: /(\w+)\.forEach\(/g,
    check: (file, match) => {
      const lines = file.split('\n');
      const matchLine = lines.findIndex(line => line.includes(match[0]));
      if (matchLine === -1) return false;
      
      // Check if the variable is declared as a Promise
      const varDeclaration = new RegExp(`const\\s+${match[1]}\\s*=\\s*await`);
      const varDeclarationPromise = new RegExp(`const\\s+${match[1]}\\s*:\\s*Promise`);
      const prevLines = lines.slice(0, matchLine).join('\n');
      
      return (prevLines.match(varDeclarationPromise) && !prevLines.match(varDeclaration)) ||
             lines[matchLine].includes(`${match[1]}.forEach`) && !lines[matchLine].includes('await');
    },
    fix: (content, match) => {
      if (!content.includes(`await ${match[1]}.forEach`)) {
        return content.replace(`${match[1]}.forEach`, `await ${match[1]}.forEach`);
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
    
    // Apply promise pattern fixes
    let fileFixed = false;
    
    for (const pattern of promisePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match)) {
          content = pattern.fix(content, match);
          errorsFixed++;
          fileFixed = true;
          
          if (verbose) {
            console.log(`Fixed promise issue in ${filePath}:`);
            console.log(`  - Added await to ${match[0]}`);
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

console.log(`Running fix-promise-await.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Promise-related errors fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); 