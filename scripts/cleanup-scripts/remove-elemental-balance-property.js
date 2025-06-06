#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🧹 Starting elementalBalance property removal...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.astro'];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.astro',
  '.swc',
  'backup-unified',
  'tmp'
];

let totalFiles = 0;
let modifiedFiles = 0;

function shouldExcludeFile(filePath) {
  return excludeDirs.some(dir => filePath.includes(dir));
}

function hasValidExtension(filePath) {
  return extensions.some(ext => filePath.endsWith(ext));
}

function removeElementalBalanceFromContent(content, filePath) {
  let modified = false;
  let newContent = content;
  
  console.log(`🔍 Processing: ${path.relative(projectRoot, filePath)}`);
  
  // 1. Remove optional elementalBalance properties from interfaces/types
  const optionalPropertyPattern = /\s*elementalBalance\?\s*:\s*[^;,}]+[;,]?\s*/g;
  if (optionalPropertyPattern.test(newContent)) {
    newContent = newContent.replace(optionalPropertyPattern, '');
    modified = true;
    console.log('  ✓ Removed optional elementalBalance property declarations');
  }
  
  // 2. Remove required elementalBalance properties from interfaces/types
  const requiredPropertyPattern = /\s*elementalBalance\s*:\s*[^;,}]+[;,]?\s*/g;
  if (requiredPropertyPattern.test(newContent)) {
    newContent = newContent.replace(requiredPropertyPattern, '');
    modified = true;
    console.log('  ✓ Removed required elementalBalance property declarations');
  }
  
  // 3. Remove elementalBalance from object literals (simple case)
  const objectPropertyPattern = /,?\s*elementalBalance\s*:\s*[^,}]+,?/g;
  if (objectPropertyPattern.test(newContent)) {
    newContent = newContent.replace(objectPropertyPattern, (match) => {
      // If it starts with comma, keep nothing
      // If it ends with comma, keep nothing
      // Handle trailing commas properly
      if (match.startsWith(',')) return '';
      if (match.endsWith(',')) return '';
      return '';
    });
    modified = true;
    console.log('  ✓ Removed elementalBalance from object literals');
  }
  
  // 4. Remove elementalBalance function parameters
  const parameterPattern = /,?\s*elementalBalance\s*:\s*[^,)]+,?/g;
  if (parameterPattern.test(newContent)) {
    newContent = newContent.replace(parameterPattern, (match) => {
      // Handle comma placement for parameters
      if (match.startsWith(',')) return '';
      if (match.endsWith(',')) return '';
      return '';
    });
    modified = true;
    console.log('  ✓ Removed elementalBalance function parameters');
  }
  
  // 5. Remove variable assignments with elementalBalance
  const assignmentPattern = /\s*const\s+elementalBalance\s*=\s*[^;]+;?\s*/g;
  if (assignmentPattern.test(newContent)) {
    newContent = newContent.replace(assignmentPattern, '');
    modified = true;
    console.log('  ✓ Removed elementalBalance variable assignments');
  }
  
  // 6. Remove elementalBalance from destructuring
  const destructuringPattern = /,?\s*elementalBalance[,}]/g;
  if (destructuringPattern.test(newContent)) {
    newContent = newContent.replace(destructuringPattern, (match) => {
      if (match.endsWith(',')) return '';
      if (match.endsWith('}')) return '}';
      return '';
    });
    modified = true;
    console.log('  ✓ Removed elementalBalance from destructuring');
  }
  
  // 7. Remove function calls that calculate elementalBalance
  const calculateElementalBalancePattern = /\s*const\s+elementalBalance\s*=\s*[^;]*calculateElementalBalance[^;]*;?\s*/g;
  if (calculateElementalBalancePattern.test(newContent)) {
    newContent = newContent.replace(calculateElementalBalancePattern, '');
    modified = true;
    console.log('  ✓ Removed calculateElementalBalance function calls');
  }
  
  // 8. Remove references to elementalBalance in return statements and object properties
  const returnPropertyPattern = /,?\s*elementalBalance[,}]/g;
  if (returnPropertyPattern.test(newContent)) {
    newContent = newContent.replace(returnPropertyPattern, (match) => {
      if (match.endsWith(',')) return '';
      if (match.endsWith('}')) return '}';
      return '';
    });
    modified = true;
    console.log('  ✓ Removed elementalBalance from return statements');
  }
  
  // 9. Remove method definitions that calculate elementalBalance
  const methodPattern = /\s*private\s+calculateElementalBalance\([^)]*\)[^{]*\{[^}]*\}\s*/g;
  if (methodPattern.test(newContent)) {
    newContent = newContent.replace(methodPattern, '');
    modified = true;
    console.log('  ✓ Removed calculateElementalBalance method definitions');
  }
  
  // 10. Clean up trailing commas and empty lines
  newContent = newContent.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive blank lines
  
  return { content: newContent, modified };
}

function processFile(filePath) {
  if (!hasValidExtension(filePath) || shouldExcludeFile(filePath)) {
    return;
  }
  
  totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = removeElementalBalanceFromContent(content, filePath);
    
    if (modified) {
      modifiedFiles++;
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Modified: ${path.relative(projectRoot, filePath)}`);
      } else {
        console.log(`🔍 Would modify: ${path.relative(projectRoot, filePath)}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !shouldExcludeFile(fullPath)) {
        walkDirectory(fullPath);
      } else if (stat.isFile()) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
  }
}

// Start processing
console.log(`🚀 Scanning for elementalBalance properties in: ${projectRoot}`);
walkDirectory(projectRoot);

console.log('\n📊 Summary:');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files ${isDryRun ? 'that would be modified' : 'modified'}: ${modifiedFiles}`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ elementalBalance property removal completed!');
  
  if (modifiedFiles > 0) {
    console.log('\n⚠️  Remember to:');
    console.log('1. Run yarn build to check for any compilation errors');
    console.log('2. Test your application to ensure everything works correctly');
    console.log('3. Commit your changes if everything looks good');
  }
} 