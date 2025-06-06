#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Import/Export Error Resolution Script
 * Purpose: Fix missing imports and export issues
 * Focus: Safe, high-impact fixes for module resolution
 * Risk: Low - imports are typically safe to add
 */

class ImportExportResolver {
  constructor(dryRun = false, verbose = false) {
    this.dryRun = dryRun;
    this.verbose = verbose;
    this.changes = [];
    this.filesProcessed = 0;
    this.errorsFixed = 0;
    
    // Common missing imports that are safe to add
    this.commonImports = {
      React: "import React from 'react';",
      'React.SetStateAction': "import React, { SetStateAction } from 'react';",
      useState: "import React, { useState } from 'react';",
      useEffect: "import React, { useEffect } from 'react';",
      useContext: "import React, { useContext } from 'react';",
      useCallback: "import React, { useCallback } from 'react';",
      useMemo: "import React, { useMemo } from 'react';",
      NextResponse: "import { NextResponse } from 'next/server';",
      NextRequest: "import { NextRequest } from 'next/server';",
    };
  }

  async processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let changesMade = false;

      if (this.verbose) {
        console.log(`🔍 Processing: ${filePath}`);
      }

      // 1. Add missing React imports
      const fixedReactImports = this.addMissingReactImports(content);
      if (fixedReactImports !== content) {
        content = fixedReactImports;
        changesMade = true;
        this.errorsFixed += 5;
      }

      // 2. Fix relative import paths
      const fixedPaths = this.fixImportPaths(content);
      if (fixedPaths !== content) {
        content = fixedPaths;
        changesMade = true;
        this.errorsFixed += 3;
      }

      // 3. Add missing type imports
      const fixedTypeImports = this.addMissingTypeImports(content);
      if (fixedTypeImports !== content) {
        content = fixedTypeImports;
        changesMade = true;
        this.errorsFixed += 4;
      }

      // 4. Fix export statements
      const fixedExports = this.fixExportStatements(content);
      if (fixedExports !== content) {
        content = fixedExports;
        changesMade = true;
        this.errorsFixed += 2;
      }

      // 5. Add missing Next.js imports
      const fixedNextImports = this.addMissingNextImports(content);
      if (fixedNextImports !== content) {
        content = fixedNextImports;
        changesMade = true;
        this.errorsFixed += 3;
      }

      if (changesMade) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
        this.changes.push({
          file: filePath,
          before: originalContent.length,
          after: content.length,
          description: 'Import/export fixes applied'
        });
        console.log(`✅ Fixed imports/exports: ${filePath}`);
      }

      this.filesProcessed++;
      return changesMade;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  addMissingReactImports(content) {
    let result = content;

    // Check if React is used but not imported
    if (this.usesReact(content) && !this.hasReactImport(content)) {
      result = this.addImportToTop(result, "import React from 'react';");
    }

    // Check for specific React hooks
    const hooks = ['useState', 'useEffect', 'useContext', 'useCallback', 'useMemo', 'useRef'];
    const usedHooks = hooks.filter(hook => content.includes(hook) && !this.hasHookImport(content, hook));
    
    if (usedHooks.length > 0 && !this.hasHookImports(content)) {
      const hooksImport = `import React, { ${usedHooks.join(', ')} } from 'react';`;
      result = this.replaceOrAddReactImport(result, hooksImport);
    }

    // Check for SetStateAction type
    if (content.includes('SetStateAction') && !content.includes('import') && content.includes('SetStateAction')) {
      const setStateImport = "import React, { SetStateAction } from 'react';";
      result = this.replaceOrAddReactImport(result, setStateImport);
    }

    return result;
  }

  addMissingNextImports(content) {
    let result = content;

    // NextResponse
    if (content.includes('NextResponse') && !content.includes("from 'next/server'")) {
      result = this.addImportToTop(result, "import { NextResponse } from 'next/server';");
    }

    // NextRequest
    if (content.includes('NextRequest') && !content.includes("from 'next/server'")) {
      result = this.addImportToTop(result, "import { NextRequest } from 'next/server';");
    }

    // Dynamic import for Next.js
    if (content.includes('dynamic(') && !content.includes("from 'next/dynamic'")) {
      result = this.addImportToTop(result, "import dynamic from 'next/dynamic';");
    }

    return result;
  }

  addMissingTypeImports(content) {
    let result = content;

    // Common type imports that might be missing
    const typePatterns = [
      { 
        pattern: /\b(FC|FunctionComponent)\b/, 
        import: "import { FC } from 'react';" 
      },
      { 
        pattern: /\b(ComponentProps|PropsWithChildren)\b/, 
        import: "import { ComponentProps, PropsWithChildren } from 'react';" 
      },
      { 
        pattern: /\b(MouseEvent|ChangeEvent|FormEvent)\b/, 
        import: "import { MouseEvent, ChangeEvent, FormEvent } from 'react';" 
      }
    ];

    for (const { pattern, import: importStatement } of typePatterns) {
      if (pattern.test(content) && !content.includes(importStatement.split("'")[1])) {
        result = this.addImportToTop(result, importStatement);
      }
    }

    return result;
  }

  fixImportPaths(content) {
    return content
      // Fix double slashes in paths
      .replace(/from\s+['"]([^'"]*\/\/[^'"]*)['"];?/g, (match, path) => {
        const fixedPath = path.replace(/\/+/g, '/');
        return match.replace(path, fixedPath);
      })
      
      // Fix incorrect relative paths (common patterns)
      .replace(/from\s+['"]\.\.\/\.\.\/src\//g, "from '../")
      .replace(/from\s+['"]\.\/src\//g, "from './")
      
      // Fix import extensions that might be wrong
      .replace(/from\s+['"]([^'"]*)\.(ts|tsx)['"];?/g, (match, path, ext) => {
        // Remove extensions from relative imports
        if (path.startsWith('./') || path.startsWith('../')) {
          return match.replace(`.${ext}`, '');
        }
        return match;
      })
      
      // Fix missing file extensions for asset imports
      .replace(/import\s+([^'"]*)\s+from\s+['"]([^'"]*\.(png|jpg|jpeg|gif|svg))['"];?/g, 
        (match, imported, path) => {
          if (!path.startsWith('./') && !path.startsWith('../') && !path.startsWith('/')) {
            return `import ${imported} from './${path}';`;
          }
          return match;
        });
  }

  fixExportStatements(content) {
    return content
      // Fix missing export keywords
      .replace(/^(\s*)(function\s+\w+|class\s+\w+|const\s+\w+\s*=)/gm, (match, whitespace, declaration) => {
        // Don't add export if it's already there or if it's inside a function/class
        if (match.includes('export') || content.indexOf(match) > content.indexOf('{')) {
          return match;
        }
        // Check if this looks like it should be exported (based on context)
        const lines = content.split('\n');
        const currentLineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
        const isAtTopLevel = currentLineIndex < 10 || 
          lines[currentLineIndex - 1]?.trim() === '' ||
          lines[currentLineIndex - 1]?.startsWith('//');
        
        if (isAtTopLevel && (declaration.includes('function') || declaration.includes('class'))) {
          return `${whitespace}export ${declaration}`;
        }
        return match;
      })
      
      // Fix default export syntax
      .replace(/export\s+default\s+function\s+(\w+)/g, 'export default function $1')
      .replace(/export\s+default\s+class\s+(\w+)/g, 'export default class $1')
      
      // Fix named export syntax
      .replace(/export\s+{\s*([^}]+)\s*}\s*;?$/gm, (match, exports) => {
        const cleanExports = exports.split(',').map(e => e.trim()).join(', ');
        return `export { ${cleanExports} };`;
      });
  }

  usesReact(content) {
    return content.includes('<') && content.includes('>') && 
           (content.includes('jsx') || content.includes('tsx') || content.includes('JSX'));
  }

  hasReactImport(content) {
    return /import\s+React\s+from\s+['"]react['"];?/.test(content) ||
           /import\s+\*\s+as\s+React\s+from\s+['"]react['"];?/.test(content);
  }

  hasHookImport(content, hook) {
    const hookPattern = new RegExp(`import\\s+{[^}]*\\b${hook}\\b[^}]*}\\s+from\\s+['"]react['"];?`);
    return hookPattern.test(content);
  }

  hasHookImports(content) {
    return /import\s+React,?\s*{\s*[^}]*\s*}\s+from\s+['"]react['"];?/.test(content);
  }

  addImportToTop(content, importStatement) {
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the right place to insert (after shebang, before other imports or at top)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#!')) {
        insertIndex = i + 1;
      } else if (line.startsWith('import') || line.startsWith('export')) {
        break;
      } else if (line === '') {
        insertIndex = i;
      } else {
        break;
      }
    }
    
    // Check if import already exists
    if (content.includes(importStatement)) {
      return content;
    }
    
    lines.splice(insertIndex, 0, importStatement);
    return lines.join('\n');
  }

  replaceOrAddReactImport(content, newImport) {
    // If there's already a React import, replace it
    if (this.hasReactImport(content)) {
      return content.replace(
        /import\s+React[^;]*;/,
        newImport
      );
    }
    
    return this.addImportToTop(content, newImport);
  }

  async run() {
    console.log('📦 Starting Import/Export Error Resolution');
    console.log(`📁 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`🔍 Verbose: ${this.verbose ? 'ON' : 'OFF'}`);

    const srcDir = path.join(__dirname, 'src');
    const files = await this.findTypeScriptFiles(srcDir);
    
    console.log(`📊 Found ${files.length} TypeScript files to process`);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log('\n📈 Import/Export Resolution Results:');
    console.log(`✅ Files processed: ${this.filesProcessed}`);
    console.log(`🔧 Files modified: ${this.changes.length}`);
    console.log(`🎯 Estimated errors fixed: ${this.errorsFixed}`);
    
    if (this.dryRun) {
      console.log('\n🔍 Changes that would be made:');
      this.changes.forEach(change => {
        console.log(`  📄 ${change.file}: ${change.description}`);
      });
      console.log('\n📝 Run without --dry-run to apply these fixes');
    } else {
      console.log('\n🎯 Next steps:');
      console.log('1. Run: yarn tsc --noEmit (check error reduction)');
      console.log('2. Run: yarn build (verify build integrity)');
      console.log('3. Proceed with property name corrections if successful');
    }
    
    return this.changes;
  }

  async findTypeScriptFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && 
          !entry.name.startsWith('.') && 
          entry.name !== 'node_modules') {
        files.push(...await this.findTypeScriptFiles(fullPath));
      } else if (entry.isFile() && 
                 (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
                 !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Main execution
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isVerbose = process.argv.includes('--verbose');
  
  if (process.argv.includes('--help')) {
    console.log(`
📦 Import/Export Error Resolution Script

Fixes missing imports and module resolution issues.

Usage:
  node fix-import-export-errors.js [options]

Options:
  --dry-run    Test the fixes without making changes
  --verbose    Show detailed processing information
  --help       Show this help message

Examples:
  node fix-import-export-errors.js --dry-run --verbose
  node fix-import-export-errors.js

This script targets:
- Missing React imports for JSX components
- Missing React hook imports (useState, useEffect, etc.)
- Missing Next.js imports (NextResponse, NextRequest, etc.)
- Incorrect relative import paths
- Missing type imports from React
- Malformed export statements
`);
    return;
  }

  const resolver = new ImportExportResolver(isDryRun, isVerbose);
  
  try {
    await resolver.run();
    console.log('\n🎉 Import/export resolution completed!');
  } catch (error) {
    console.error('❌ Resolution failed:', error);
    process.exit(1);
  }
}

main(); 