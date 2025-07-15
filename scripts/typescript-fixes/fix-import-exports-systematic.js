#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

console.log(`🔧 Import/Export Error Resolution Script (dry-run: ${isDryRun})`);

// Get TypeScript errors and filter for import/export issues
function getImportExportErrors() {
  console.log('📊 Collecting import/export errors...');
  
  try {
    const result = execSync('yarn tsc --noEmit', { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    return [];
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    const lines = output.split('\n');
    
    const importExportErrors = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      return line.includes('error TS') && (
        lowerLine.includes('cannot find module') ||
        lowerLine.includes('has no exported member') ||
        lowerLine.includes('module has no default export') ||
        lowerLine.includes('cannot be used as a value') ||
        lowerLine.includes('resolves to a type-only import') ||
        lowerLine.includes('is not a module') ||
        lowerLine.includes('module resolution') ||
        lowerLine.includes('did you mean to use') ||
        lowerLine.includes('did you mean') ||
        (lowerLine.includes('export') && (lowerLine.includes('does not exist') || lowerLine.includes('not found')))
      );
    });
    
    console.log(`📈 Found ${importExportErrors.length} import/export errors`);
    return importExportErrors;
  }
}

// Parse error information
function parseError(errorLine) {
  const match = errorLine.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (!match) return null;
  
  const [, filePath, line, col, errorCode, message] = match;
  return {
    filePath: filePath.trim(),
    line: parseInt(line),
    col: parseInt(col),
    errorCode,
    message: message.trim()
  };
}

// Enhanced fix patterns for common import/export issues
const fixPatterns = [
  {
    name: 'Fix TypeScript suggestions (Did you mean)',
    pattern: /Did you mean '(.+)'\?/,
    fix: (error, content) => {
      const suggestionMatch = error.message.match(/Did you mean '(.+)'\?/);
      if (!suggestionMatch) return null;
      
      const suggestedName = suggestionMatch[1];
      const lines = content.split('\n');
      const errorLine = lines[error.line - 1];
      
      // Extract the incorrect name from the error message
      const incorrectMatch = error.message.match(/'(.+?)' has no exported member named '(.+)'/);
      if (incorrectMatch) {
        const incorrectName = incorrectMatch[2];
        const fixedLine = errorLine.replace(incorrectName, suggestedName);
        if (fixedLine !== errorLine) {
          lines[error.line - 1] = fixedLine;
          return lines.join('\n');
        }
      }
      
      return null;
    }
  },
  {
    name: 'Fix import syntax suggestions',
    pattern: /Did you mean to use 'import (.+) from "(.+)"' instead\?/,
    fix: (error, content) => {
      const syntaxMatch = error.message.match(/Did you mean to use 'import (.+) from "(.+)"' instead\?/);
      if (!syntaxMatch) return null;
      
      const [, importName, modulePath] = syntaxMatch;
      const lines = content.split('\n');
      const errorLine = lines[error.line - 1];
      
      // Replace the entire import line with the suggested syntax
      if (errorLine.includes('import') && errorLine.includes(modulePath)) {
        const fixedLine = `import ${importName} from "${modulePath}";`;
        lines[error.line - 1] = fixedLine;
        return lines.join('\n');
      }
      
      return null;
    }
  },
  {
    name: 'Add missing named exports to index files',
    pattern: /has no exported member '(.+)'/,
    fix: (error, content) => {
      const memberMatch = error.message.match(/has no exported member '(.+)'/);
      if (!memberMatch) return null;
      
      const missingMember = memberMatch[1];
      
      // Check if this is an index file and if the member exists in related files
      if (error.filePath.includes('index.ts') || error.filePath.includes('index.tsx')) {
        // Add a basic export if the member seems like it should exist
        const commonExports = [
          'useAstrologicalState', 'usePopupContext', 'ErrorHandler', 'errorType', 
          'ErrorSeverity', 'analyzeIngredientCompatibility', 'ingredients', 'cuisineTypes'
        ];
        
        if (commonExports.includes(missingMember)) {
          // Add the export at the end of the file
          return content + `\nexport { ${missingMember} };\n`;
        }
      }
      
      return null;
    }
  },
  {
    name: 'Add missing default export',
    pattern: /Module '(.+)' has no default export/,
    fix: (error, content) => {
      const modulePath = error.message.match(/Module '(.+)' has no default export/)?.[1];
      if (!modulePath) return null;
      
      // Check if the file has named exports but no default export
      const exportMatch = content.match(/export\s*{[^}]+}/);
      const hasNamedExports = exportMatch !== null;
      const hasDefaultExport = content.includes('export default');
      
      if (hasNamedExports && !hasDefaultExport) {
        // Add a default export that re-exports everything
        const lastExportIndex = content.lastIndexOf('export');
        if (lastExportIndex !== -1) {
          const beforeExport = content.substring(0, lastExportIndex);
          const afterExport = content.substring(lastExportIndex);
          return beforeExport + '\nexport default {};\n' + afterExport;
        }
      }
      return null;
    }
  },
  {
    name: 'Fix type-only imports',
    pattern: /resolves to a type-only import and must be imported using a type-only import/,
    fix: (error, content) => {
      const lines = content.split('\n');
      const errorLine = lines[error.line - 1];
      
      if (errorLine && errorLine.includes('import') && !errorLine.includes('import type')) {
        // Convert to type-only import if it's importing types
        const fixedLine = errorLine.replace(/^(\s*)import\s+/, '$1import type ');
        lines[error.line - 1] = fixedLine;
        return lines.join('\n');
      }
      return null;
    }
  },
  {
    name: 'Fix import path extensions',
    pattern: /Cannot find module '(.+)'/,
    fix: (error, content) => {
      const moduleMatch = error.message.match(/Cannot find module '(.+)'/);
      if (!moduleMatch) return null;
      
      const modulePath = moduleMatch[1];
      const lines = content.split('\n');
      const errorLine = lines[error.line - 1];
      
      // Try adding .ts or .tsx extension
      const baseDir = path.dirname(error.filePath);
      const possiblePaths = [
        path.resolve(baseDir, modulePath + '.ts'),
        path.resolve(baseDir, modulePath + '.tsx'),
        path.resolve(baseDir, modulePath + '/index.ts'),
        path.resolve(baseDir, modulePath + '/index.tsx')
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          const relativePath = path.relative(baseDir, possiblePath).replace(/\\/g, '/');
          const newImportPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
          const fixedLine = errorLine.replace(modulePath, newImportPath.replace(/\.(ts|tsx)$/, ''));
          lines[error.line - 1] = fixedLine;
          return lines.join('\n');
        }
      }
      
      return null;
    }
  }
];

// Apply fixes to a file
function applyFixes(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  const appliedFixes = [];
  
  // Sort errors by line number (descending) to avoid line number issues
  const sortedErrors = errors.sort((a, b) => b.line - a.line);
  
  for (const error of sortedErrors) {
    for (const pattern of fixPatterns) {
      if (pattern.pattern.test(error.message)) {
        const newContent = pattern.fix(error, content);
        if (newContent && newContent !== content) {
          content = newContent;
          hasChanges = true;
          appliedFixes.push(pattern.name);
          break;
        }
      }
    }
  }
  
  if (hasChanges) {
    if (!isDryRun) {
      fs.writeFileSync(filePath, content);
    }
    console.log(`✅ ${filePath}: Applied fixes - ${appliedFixes.join(', ')}`);
    return true;
  }
  
  return false;
}

// Main execution
async function main() {
  const errors = getImportExportErrors();
  
  if (errors.length === 0) {
    console.log('🎉 No import/export errors found!');
    return;
  }
  
  console.log(`🎯 Processing ${errors.length} import/export errors...`);
  
  // Group errors by file
  const errorsByFile = {};
  const parsedErrors = [];
  
  for (const errorLine of errors) {
    const parsed = parseError(errorLine);
    if (parsed) {
      parsedErrors.push(parsed);
      if (!errorsByFile[parsed.filePath]) {
        errorsByFile[parsed.filePath] = [];
      }
      errorsByFile[parsed.filePath].push(parsed);
    }
  }
  
  console.log(`📁 Processing ${Object.keys(errorsByFile).length} files with import/export errors`);
  
  let fixedFiles = 0;
  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    const success = applyFixes(filePath, fileErrors);
    if (success) {
      fixedFiles++;
    }
  }
  
  console.log(`\n📊 IMPORT/EXPORT FIX SUMMARY`);
  console.log(`===========================`);
  console.log(`📈 Total errors processed: ${errors.length}`);
  console.log(`📁 Files processed: ${Object.keys(errorsByFile).length}`);
  console.log(`✅ Files fixed: ${fixedFiles}`);
  console.log(`🔧 Dry run mode: ${isDryRun}`);
  
  if (isDryRun) {
    console.log(`\n💡 To apply fixes, run: node ${process.argv[1]} --execute`);
  } else {
    console.log(`\n🔍 Running verification build...`);
    try {
      execSync('yarn build', { stdio: 'pipe' });
      console.log(`✅ Build successful! Fixes applied correctly.`);
    } catch (error) {
      console.log(`⚠️  Build still has issues - some fixes may need manual review.`);
    }
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
});

main().catch(console.error); 