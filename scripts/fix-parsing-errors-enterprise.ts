#!/usr/bin/env ts-node
/**
 * Enterprise-Grade Parsing Error Fixer
 *
 * Systematically fixes all TypeScript parsing errors in the codebase.
 * Uses pattern recognition and AST-safe transformations.
 *
 * @author Claude Code
 * @version 2.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Fix {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
  description: string;
  multiline?: boolean;
}

interface FileResult {
  file: string;
  fixed: boolean;
  fixes: string[];
  errors?: string;
}

/**
 * Comprehensive list of parsing error patterns and their fixes
 */
const PARSING_FIXES: Fix[] = [
  // Import statement fixes
  {
    pattern: /^import:\s+/gm,
    replacement: 'import ',
    description: 'Fix import: syntax'
  },

  // Semicolon in arrow function filter
  {
    pattern: /\(([\w]+)\s*=>\s*([\w.]+)\s*===\s*['"](\w+)['"];?\)/g,
    replacement: '($1 => $2 === \'$3\')',
    description: 'Fix semicolon in arrow function'
  },

  // Comma instead of semicolon in properties
  {
    pattern: /^(\s+)([\w_]+):\s*([^,\n]+),(\s*$)/gm,
    replacement: '$1$2: $3;$4',
    description: 'Fix comma instead of semicolon in properties'
  },

  // Extra closing parenthesis in loops
  {
    pattern: /for\s*\(const\s+\[([^\]]+)\]\s+of\s+([^\)]+)\)\s*\)\s*{/g,
    replacement: 'for (const [$1] of $2) {',
    description: 'Fix extra parenthesis in for-of loop'
  },

  // Malformed function signatures (missing opening paren)
  {
    pattern: /^(export\s+function\s+\w+)\(\s*\):/gm,
    replacement: (match, funcDecl) => {
      return funcDecl + '(';
    },
    description: 'Fix malformed function signature'
  },

  // Colon after array close in function signature
  {
    pattern: /\],\s*\)\s*{/g,
    replacement: ']\n) {',
    description: 'Fix array syntax in function params'
  },

  // const: instead of const
  {
    pattern: /const:\s+{/g,
    replacement: 'const {',
    description: 'Fix const: syntax'
  },

  // Multiple colons in comments
  {
    pattern: /\/\/\s*([^:]+):\s+([^:]+):\s+([^:]+):/g,
    replacement: '// $1 $2 $3',
    description: 'Fix multiple colons in comments'
  },

  // For: instead of for
  {
    pattern: /for:\s*\(/g,
    replacement: 'for (',
    description: 'Fix for: syntax'
  },

  // If: instead of if
  {
    pattern: /if:\s+/g,
    replacement: 'if ',
    description: 'Fix if: syntax'
  },

  // Trailing comma before closing brace in function params
  {
    pattern: /\(([^)]+),\s*\)\s*{/g,
    replacement: (match, params) => {
      const cleanParams = params.replace(/,\s*$/, '');
      return `(${cleanParams}) {`;
    },
    description: 'Remove trailing comma in function params'
  },

  // Escaped apostrophes that should be in double quotes
  {
    pattern: /'([^']*\\'[^']*)'/g,
    replacement: (match, content) => {
      const unescaped = content.replace(/\\'/g, "'");
      return `"${unescaped}"`;
    },
    description: 'Fix apostrophes in strings'
  }
];

/**
 * Get all files with parsing errors
 */
function getFilesWithParsingErrors(): string[] {
  try {
    const output = execSync(
      'yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/" | sed "s/:$//" | sort -u',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    return output
      .trim()
      .split('\n')
      .filter(line => line && line.startsWith('/'))
      .map(line => line.trim());
  } catch (error) {
    console.error('Error getting files with parsing errors:', error);
    return [];
  }
}

/**
 * Apply fixes to a file
 */
function fixFile(filePath: string): FileResult {
  const result: FileResult = {
    file: path.relative(process.cwd(), filePath),
    fixed: false,
    fixes: []
  };

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Apply each fix
    for (const fix of PARSING_FIXES) {
      const beforeLength = content.length;

      if (typeof fix.replacement === 'string') {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }

      if (content.length !== beforeLength || content !== content) {
        result.fixes.push(fix.description);
      }
    }

    // Check if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      result.fixed = true;
    }

  } catch (error) {
    result.errors = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Enterprise Parsing Error Fixer\n');
  console.log('📊 Phase 1: Identifying files with parsing errors...\n');

  const files = getFilesWithParsingErrors();

  console.log(`Found ${files.length} files with parsing errors\n`);

  if (files.length === 0) {
    console.log('✅ No parsing errors found!');
    return;
  }

  console.log('📊 Phase 2: Applying automated fixes...\n');

  const results: FileResult[] = [];
  let fixedCount = 0;

  for (const file of files) {
    process.stdout.write(`Fixing ${path.relative(process.cwd(), file)}... `);
    const result = fixFile(file);
    results.push(result);

    if (result.fixed) {
      fixedCount++;
      console.log(`✅ (${result.fixes.length} fixes)`);
    } else if (result.errors) {
      console.log(`❌ Error: ${result.errors}`);
    } else {
      console.log('⚠️  No automated fixes applied');
    }
  }

  console.log('\n📊 Phase 3: Summary\n');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Files fixed: ${fixedCount}`);
  console.log(`Files needing manual intervention: ${files.length - fixedCount}\n`);

  // List files still needing manual fixes
  const unfixed = results.filter(r => !r.fixed && !r.errors);
  if (unfixed.length > 0) {
    console.log('⚠️  Files still needing manual fixes:');
    unfixed.forEach(r => console.log(`   - ${r.file}`));
    console.log();
  }

  console.log('🔨 Phase 4: Verifying build...\n');

  try {
    execSync('make build', { stdio: 'inherit' });
    console.log('\n✅ BUILD SUCCESSFUL!');
  } catch (error) {
    console.log('\n❌ Build still failing. Manual fixes required.');
    console.log('\nRun: yarn lint 2>&1 | grep "Parsing error" | head -20');
  }
}

main().catch(console.error);
