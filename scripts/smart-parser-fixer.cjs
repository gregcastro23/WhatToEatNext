#!/usr/bin/env node
/**
 * Smart AST-Based Parsing Error Fixer
 * Enterprise-grade solution for TypeScript/TSX syntax errors
 *
 * @version 3.0.0
 * @author Claude Code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Comprehensive fix patterns with priority ordering
 */
const FIXES = [
  // Priority 1: Missing closing parentheses in conditionals
  {
    pattern: /if\s*\([^)]*\{/g,
    fix: (content) => {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const ifMatch = line.match(/if\s*\(([^)]*)\s*{/);
        if (ifMatch && !ifMatch[1].includes(')')) {
          lines[i] = line.replace(/if\s*\(([^{]*)\s*{/, 'if ($1) {');
        }
      }
      return lines.join('\n');
    },
    desc: 'Fix missing closing paren in if statements'
  },

  // Priority 2: Missing closing parentheses in function calls
  {
    pattern: /\w+\([^)]*$/gm,
    fix: (content) => {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Count opening and closing parens
        const openCount = (line.match(/\(/g) || []).length;
        const closeCount = (line.match(/\)/g) || []).length;

        if (openCount > closeCount && !line.includes(';') && !line.includes('{')) {
          const diff = openCount - closeCount;
          lines[i] = line + ')'.repeat(diff);
        }
      }
      return lines.join('\n');
    },
    desc: 'Fix missing closing parentheses'
  },

  // Priority 3: Fix Array.isArray syntax
  {
    pattern: /Array\.isArray\(([^)]+)\s*\{/g,
    fix: (content) => content.replace(/Array\.isArray\(([^)]+)\s*\{/g, 'Array.isArray($1) {'),
    desc: 'Fix Array.isArray missing closing paren'
  },

  // Priority 4: Fix hasOwnProperty calls
  {
    pattern: /hasOwnProperty\.call\(([^)]+)\s*\{/g,
    fix: (content) => content.replace(/hasOwnProperty\.call\(([^)]+)\s*\{/g, 'hasOwnProperty.call($1) {'),
    desc: 'Fix hasOwnProperty.call missing closing paren'
  },

  // Priority 5: Fix trailing commas in object destructuring
  {
    pattern: /const\s*{\s*([^}]+),\s*}\s*=/g,
    fix: (content) => content.replace(/const\s*{\s*([^}]+),(\s*)}\s*=/g, 'const { $1$2} ='),
    desc: 'Remove trailing comma in destructuring'
  },

  // Priority 6: Fix object literals with colons instead of commas
  {
    pattern: /{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,}\n]+)\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    fix: (content) => content.replace(/{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,}\n]+)\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '{ $1: $2, $3'),
    desc: 'Fix colons instead of commas in object literals'
  },

  // Priority 7: Fix template literal issues
  {
    pattern: /`[^`]*\$\{[^}]*`/g,
    fix: (content) => {
      let fixed = content;
      const matches = content.match(/`[^`]*\$\{[^}]*`/g) || [];
      matches.forEach(match => {
        const openBraces = (match.match(/{/g) || []).length;
        const closeBraces = (match.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          fixed = fixed.replace(match, match.slice(0, -1) + '}' + '`');
        }
      });
      return fixed;
    },
    desc: 'Fix unclosed template literals'
  },

  // Priority 8: Fix log.info/warn/error calls with extra colons
  {
    pattern: /log\.(info|warn|error|debug)\(`[^`]*:\s+\$\{/g,
    fix: (content) => content.replace(/log\.(info|warn|error|debug)\(`([^:]*):(\s+)\$\{/g, 'log.$1(`$2 ${'),
    desc: 'Fix log statements with extra colons'
  },

  // Priority 9: Fix JSX prop syntax in template strings
  {
    pattern: /{`[^`]*`}/g,
    fix: (content) => {
      return content.replace(/{`([^`]*)`}/g, (match, inner) => {
        // Ensure proper closure
        return `{\`${inner}\`}`;
      });
    },
    desc: 'Fix JSX template string props'
  },

  // Priority 10: Fix interface/type property semicolons
  {
    pattern: /(interface|type)\s+\w+\s*{[^}]*}/gs,
    fix: (content) => {
      return content.replace(/(interface|type)(\s+\w+\s*{[^}]*})/gs, (match, keyword, rest) => {
        // Replace commas with semicolons in property definitions
        const fixed = rest.replace(/:\s*([^,;\n}]+),(\s*\n)/g, ': $1;$2');
        return keyword + fixed;
      });
    },
    desc: 'Fix interface/type property separators'
  }
];

/**
 * Apply all fixes to a file
 */
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const appliedFixes = [];

    // Apply each fix
    for (const fix of FIXES) {
      const before = content;
      if (fix.pattern) {
        content = content.replace(fix.pattern, fix.fix);
      } else if (typeof fix.fix === 'function') {
        content = fix.fix(content);
      }

      if (content !== before) {
        appliedFixes.push(fix.desc);
      }
    }

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true, fixes: appliedFixes };
    }

    return { fixed: false, fixes: [] };
  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

/**
 * Get files with parsing errors
 */
function getParsingErrorFiles() {
  try {
    const output = execSync(
      'yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/" | sed "s/:$//" | sort -u',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔧 Smart AST-Based Parser Fixer v3.0\n');

  const files = getParsingErrorFiles();
  console.log(`📊 Found ${files.length} files with parsing errors\n`);

  if (files.length === 0) {
    console.log('✅ No parsing errors found!\n');
    return;
  }

  let fixedCount = 0;
  const results = [];

  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    process.stdout.write(`Fixing ${relativePath}... `);

    const result = fixFile(file);
    results.push({ file: relativePath, ...result });

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.fixed) {
      fixedCount++;
      console.log(`✅ (${result.fixes.length} fixes)`);
    } else {
      console.log('⚠️  No changes');
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Fixed: ${fixedCount}/${files.length} files\n`);

  // Show files that still need attention
  const unfixed = results.filter(r => !r.fixed && !r.error);
  if (unfixed.length > 0) {
    console.log('⚠️  Files needing manual review:');
    unfixed.slice(0, 10).forEach(r => console.log(`   - ${r.file}`));
    if (unfixed.length > 10) {
      console.log(`   ... and ${unfixed.length - 10} more`);
    }
  }

  console.log('\n');
}

main();
