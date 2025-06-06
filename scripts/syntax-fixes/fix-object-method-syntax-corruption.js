#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_ENABLED = false; // As per workspace rules - no backups

console.log(`🔧 Object Method Syntax Corruption Fix Script`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log(`Backup: ${BACKUP_ENABLED ? 'Enabled' : 'Disabled'}`);
console.log('=' .repeat(50));

// File patterns to include
const INCLUDE_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'out/**',
  'build/**',
  'dist/**',
  '**/*.d.ts',
  'scripts/**',
  '**/*test*',
  '**/*spec*'
];

// Syntax corruption patterns to fix
const CORRUPTION_PATTERNS = [
  // Object method corruption patterns
  {
    name: 'Object.keys corruption',
    pattern: /Object\.\(keys\(([^)]+)\)\?\s*\|\|\s*\[\]\)/g,
    replacement: 'Object.keys($1 || {})',
    description: 'Fix Object.(keys(...)? || []) to Object.keys(... || {})'
  },
  {
    name: 'Object.entries corruption',
    pattern: /Object\.\(entries\(([^)]+)\)\?\s*\|\|\s*\[\]\)/g,
    replacement: 'Object.entries($1 || {})',
    description: 'Fix Object.(entries(...)? || []) to Object.entries(... || {})'
  },
  {
    name: 'Object.values corruption',
    pattern: /Object\.\(values\(([^)]+)\)\?\s*\|\|\s*\[\]\)/g,
    replacement: 'Object.values($1 || {})',
    description: 'Fix Object.(values(...)? || []) to Object.values(... || {})'
  },
  
  // Property access corruption patterns
  {
    name: 'Property access with parentheses',
    pattern: /(\w+)\.\(([^)]+)\s*\|\|\s*\[\]\)/g,
    replacement: '$1.$2 || []',
    description: 'Fix obj.(prop || []) to obj.prop || []'
  },
  {
    name: 'Complex property access corruption',
    pattern: /(\w+)\.\(([^)]+)\?\s*\|\|\s*\[\]\)/g,
    replacement: '$1.$2 || []',
    description: 'Fix obj.(prop? || []) to obj.prop || []'
  },
  
  // Array.isArray corruption patterns
  {
    name: 'Array.isArray ternary corruption',
    pattern: /\.\(Array\.isArray\(([^)]+)\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: '.(Array.isArray($1) ? $2 : $3)',
    description: 'Fix malformed Array.isArray ternary expressions'
  },
  
  // Function call corruption patterns
  {
    name: 'Function call with question mark',
    pattern: /(\w+)\?\.\(([^)]+)\?\s*\|\|\s*\[\]\)/g,
    replacement: '$1?.$2 || []',
    description: 'Fix func?.(prop? || []) to func?.prop || []'
  },
  
  // Object.entries with function call corruption
  {
    name: 'Object.entries function call corruption',
    pattern: /Object\.entries\(([^)]+)\)\(\?\s*\|\|\s*\[\]\)/g,
    replacement: 'Object.entries($1) || []',
    description: 'Fix Object.entries(...)?(|| []) to Object.entries(...) || []'
  },
  
  // Method chaining corruption
  {
    name: 'Method chaining corruption',
    pattern: /(\w+)\.\(([^)]+)\?\s*\|\|\s*\[\]\)\.(\w+)/g,
    replacement: '($1.$2 || []).$3',
    description: 'Fix obj.(prop? || []).method to (obj.prop || []).method'
  }
];

// Additional specific patterns found in the error log
const SPECIFIC_PATTERNS = [
  {
    name: 'Malformed function call before map',
    pattern: /\(\)\s*\|\|\s*\[\]\)\.map/g,
    replacement: ' || []).map',
    description: 'Fix () || []).map to || []).map'
  },
  {
    name: 'Template literal with property access',
    pattern: /\$\{([^}]+)\s*\|\|\s*\[\]\)\.length\}/g,
    replacement: '${($1 || []).length}',
    description: 'Fix ${...|| []).length} in template literals'
  },
  {
    name: 'Console.warn template corruption',
    pattern: /console\.(warn|log|error)\(`[^`]*\$\{([^}]+)\s*\|\|\s*\[\]\)\.length\}[^`]*`/g,
    replacement: (match, method, expr) => {
      return match.replace(`\${${expr} || []).length}`, `\${(${expr} || []).length}`);
    },
    description: 'Fix template literals in console methods'
  }
];

let filesProcessed = 0;
let totalFixesApplied = 0;
const fixedFiles = [];

function getAllFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      const relativePath = path.relative('.', fullPath);
      if (!EXCLUDE_PATTERNS.some(pattern => 
        relativePath.includes(pattern.replace('/**', '')) || 
        relativePath.includes('node_modules') ||
        relativePath.includes('.next')
      )) {
        getAllFiles(fullPath, allFiles);
      }
    } else {
      // Include TypeScript and JavaScript files
      if (file.match(/\.(ts|tsx|js|jsx)$/) && !file.endsWith('.d.ts')) {
        const relativePath = path.relative('.', fullPath);
        if (!EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern.replace('/**', '')))) {
          allFiles.push(fullPath);
        }
      }
    }
  }
  
  return allFiles;
}

function applyFixes(content, filePath) {
  let modifiedContent = content;
  let fileFixCount = 0;
  const appliedFixes = [];
  
  // Apply corruption pattern fixes
  for (const pattern of CORRUPTION_PATTERNS) {
    const matches = modifiedContent.match(pattern.pattern);
    if (matches) {
      const beforeLength = modifiedContent.length;
      modifiedContent = modifiedContent.replace(pattern.pattern, pattern.replacement);
      const afterLength = modifiedContent.length;
      
      if (beforeLength !== afterLength || matches.length > 0) {
        fileFixCount += matches.length;
        appliedFixes.push(`${pattern.name}: ${matches.length} fixes`);
        console.log(`  ✓ ${pattern.name}: ${matches.length} fixes`);
      }
    }
  }
  
  // Apply specific pattern fixes
  for (const pattern of SPECIFIC_PATTERNS) {
    const matches = modifiedContent.match(pattern.pattern);
    if (matches) {
      const beforeLength = modifiedContent.length;
      
      if (typeof pattern.replacement === 'function') {
        modifiedContent = modifiedContent.replace(pattern.pattern, pattern.replacement);
      } else {
        modifiedContent = modifiedContent.replace(pattern.pattern, pattern.replacement);
      }
      
      const afterLength = modifiedContent.length;
      
      if (beforeLength !== afterLength || matches.length > 0) {
        fileFixCount += matches.length;
        appliedFixes.push(`${pattern.name}: ${matches.length} fixes`);
        console.log(`  ✓ ${pattern.name}: ${matches.length} fixes`);
      }
    }
  }
  
  return { modifiedContent, fileFixCount, appliedFixes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { modifiedContent, fileFixCount, appliedFixes } = applyFixes(content, filePath);
    
    if (fileFixCount > 0) {
      const relativePath = path.relative('.', filePath);
      console.log(`📝 ${relativePath} (${fileFixCount} fixes)`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
      }
      
      totalFixesApplied += fileFixCount;
      fixedFiles.push({
        path: relativePath,
        fixes: fileFixCount,
        appliedFixes
      });
    }
    
    filesProcessed++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
function main() {
  console.log('🔍 Scanning for files...');
  
  const srcFiles = getAllFiles('./src');
  console.log(`Found ${srcFiles.length} TypeScript/JavaScript files in src/`);
  
  if (srcFiles.length === 0) {
    console.log('No files found to process.');
    return;
  }
  
  console.log('\n🔧 Processing files...');
  
  for (const file of srcFiles) {
    processFile(file);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${fixedFiles.length}`);
  console.log(`Total fixes applied: ${totalFixesApplied}`);
  
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
    console.log('Remove --dry-run flag to apply these changes');
  } else {
    console.log('\n✅ FIXES APPLIED SUCCESSFULLY');
  }
  
  if (fixedFiles.length > 0) {
    console.log('\n📋 Fixed Files:');
    fixedFiles.forEach(file => {
      console.log(`  ${file.path}: ${file.fixes} fixes`);
      file.appliedFixes.forEach(fix => console.log(`    - ${fix}`));
    });
  }
  
  // Provide next steps
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Run: yarn build');
  console.log('2. Check for remaining syntax errors');
  console.log('3. Run: yarn tsc --noEmit to verify TypeScript compilation');
  
  process.exit(0);
}

main(); 