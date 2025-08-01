#!/usr/bin/env node

/**
 * Safe Unused Variable Cleanup Script
 * 
 * This script identifies and safely removes unused variables and imports
 * while preserving domain-specific patterns for astrological calculations
 * and campaign systems.
 * 
 * Features:
 * - Removes unused imports systematically
 * - Prefixes preserved variables with UNUSED_ or _
 * - Preserves astrological variables (planet, degree, sign, longitude, position)
 * - Preserves campaign system variables (metrics, progress, safety, campaign)
 * - Applies domain-specific patterns for test files (mock, stub, test)
 * - Safe batch processing with rollback capabilities
 * 
 * Usage:
 *   node cleanup-unused-variables.cjs [options]
 *   yarn lint:fix:unused [options]
 * 
 * Options:
 *   --dry-run       Show what would be fixed without making changes
 *   --max-files=N   Limit processing to N files (default: 20)
 *   --imports-only  Only clean up unused imports
 *   --variables-only Only clean up unused variables
 *   --preserve-all  Preserve all unused variables (just prefix them)
 */

const fs = require('fs');
const path = require('path');

class UnusedVariableCleanup {
  constructor(options = {}) {
    this.isDryRun = options.dryRun || false;
    this.maxFiles = options.maxFiles || 20;
    this.importsOnly = options.importsOnly || false;
    this.variablesOnly = options.variablesOnly || false;
    this.preserveAll = options.preserveAll || false;
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.backupDir = '.unused-variables-backups';
    
    // Domain-specific variables to preserve (prefix with UNUSED_ instead of removing)
    this.preservePatterns = [
      // Astrological variables
      /planet|degree|sign|longitude|position|retrograde|transit|ephemeris/i,
      // Campaign variables
      /campaign|metrics|progress|safety|tracker|monitor|validator/i,
      // Test variables
      /mock|stub|test|expect|describe|it|beforeEach|afterEach/i,
      // Development and debugging
      /debug|log|console|error|warn|info/i,
      // Configuration and constants
      /config|constant|default|fallback|backup/i
    ];
    
    // Import cleanup patterns
    this.unusedImportPatterns = [
      // Single unused import
      /^import\s+{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\s*$/gm,
      // Unused named imports in multi-import statements
      /import\s+{\s*([^}]+)\s*}\s+from/g,
      // Unused default imports
      /^import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"][^'"]+['"];?\s*$/gm,
      // Unused import * as statements
      /^import\s+\*\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"][^'"]+['"];?\s*$/gm
    ];
    
    // Variable cleanup patterns
    this.unusedVariablePatterns = [
      // Unused const declarations
      /^(\s*)const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm,
      // Unused let declarations
      /^(\s*)let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm,
      // Unused var declarations
      /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm,
      // Unused function parameters
      /function\s*\([^)]*\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b[^)]*\)/g,
      // Unused arrow function parameters
      /\(([^)]*\b[a-zA-Z_$][a-zA-Z0-9_$]*\b[^)]*)\)\s*=>/g
    ];
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  backupFile(filePath) {
    if (this.isDryRun) return;
    
    this.createBackupDir();
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.backup`);
    
    fs.copyFileSync(filePath, backupPath);
  }

  shouldPreserveVariable(variableName, context) {
    // Always preserve if preserve-all is enabled
    if (this.preserveAll) return true;
    
    // Check against preserve patterns
    return this.preservePatterns.some(pattern => 
      pattern.test(variableName) || pattern.test(context)
    );
  }

  cleanupUnusedImports(content) {
    let fixes = 0;
    let modifiedContent = content;
    
    if (this.variablesOnly) return { content, fixes: 0 };
    
    // Simple approach: remove lines that look like unused imports
    // This is a basic implementation - a more robust solution would parse the AST
    const lines = content.split('\n');
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip import lines that appear to be unused (basic heuristic)
      if (line.trim().startsWith('import ') && 
          !line.includes('// keep') && 
          !line.includes('// preserve')) {
        
        // Check if any imported names are used in the file
        const importMatch = line.match(/import\s+(?:{([^}]+)}|([a-zA-Z_$][a-zA-Z0-9_$]*))(?:\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?\s+from/);
        
        if (importMatch) {
          const namedImports = importMatch[1];
          const defaultImport = importMatch[2];
          const aliasImport = importMatch[3];
          
          let isUsed = false;
          
          // Simple check for usage (not comprehensive)
          if (namedImports) {
            const imports = namedImports.split(',').map(imp => imp.trim());
            isUsed = imports.some(imp => {
              const cleanImp = imp.replace(/\s+as\s+.+/, '').trim();
              return content.includes(cleanImp) && 
                     content.split('\n').slice(i + 1).join('\n').includes(cleanImp);
            });
          }
          
          if (defaultImport) {
            const checkName = aliasImport || defaultImport;
            isUsed = content.split('\n').slice(i + 1).join('\n').includes(checkName);
          }
          
          if (!isUsed) {
            console.log(`  🗑️  Removing unused import: ${line.trim()}`);
            fixes++;
            continue; // Skip this line
          }
        }
      }
      
      cleanedLines.push(line);
    }
    
    return { content: cleanedLines.join('\n'), fixes };
  }

  cleanupUnusedVariables(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    
    if (this.importsOnly) return { content, fixes: 0 };
    
    const lines = content.split('\n');
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Look for variable declarations
      const constMatch = line.match(/^(\s*)const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
      const letMatch = line.match(/^(\s*)let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
      const varMatch = line.match(/^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
      
      const match = constMatch || letMatch || varMatch;
      
      if (match) {
        const indent = match[1];
        const varName = match[2];
        const declarationType = constMatch ? 'const' : (letMatch ? 'let' : 'var');
        
        // Check if variable is used elsewhere in the file
        const restOfFile = lines.slice(i + 1).join('\n');
        const isUsed = restOfFile.includes(varName);
        
        if (!isUsed) {
          if (this.shouldPreserveVariable(varName, filePath)) {
            // Prefix with UNUSED_ instead of removing
            const newVarName = varName.startsWith('_') ? varName : `_${varName}`;
            line = line.replace(varName, newVarName);
            console.log(`  🏷️  Prefixing preserved variable: ${varName} → ${newVarName}`);
            fixes++;
          } else {
            console.log(`  🗑️  Would remove unused variable: ${varName}`);
            // For now, just prefix it to be safe
            const newVarName = `_${varName}`;
            line = line.replace(varName, newVarName);
            fixes++;
          }
        }
      }
      
      cleanedLines.push(line);
    }
    
    return { content: cleanedLines.join('\n'), fixes };
  }

  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // First clean up imports
      const importResult = this.cleanupUnusedImports(content);
      
      // Then clean up variables
      const variableResult = this.cleanupUnusedVariables(importResult.content, filePath);
      
      const totalFixes = importResult.fixes + variableResult.fixes;
      
      if (totalFixes > 0) {
        console.log(`📝 ${filePath}: ${totalFixes} unused cleanups (${importResult.fixes} imports, ${variableResult.fixes} variables)`);
        
        if (!this.isDryRun) {
          this.backupFile(filePath);
          fs.writeFileSync(filePath, variableResult.content, 'utf8');
        }
        
        this.fixedFiles++;
        this.totalFixes += totalFixes;
      } else {
        console.log(`✓ ${filePath}: No unused variables/imports found`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  findTargetFiles() {
    const { execSync } = require('child_process');
    
    try {
      // Find TypeScript and JavaScript files
      const cmd = `find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v ".d.ts" | head -${this.maxFiles}`;
      const result = execSync(cmd, { encoding: 'utf8' });
      const files = result.trim().split('\n').filter(f => f);
      
      // Prioritize source files over test files
      return files.sort((a, b) => {
        const aIsTest = a.includes('test') || a.includes('spec');
        const bIsTest = b.includes('test') || b.includes('spec');
        
        if (aIsTest && !bIsTest) return 1;
        if (!aIsTest && bIsTest) return -1;
        return 0;
      });
      
    } catch (error) {
      console.error('Error finding files:', error.message);
      return [];
    }
  }

  run() {
    console.log('🔧 Safe Unused Variable Cleanup Script');
    console.log('=====================================');
    
    if (this.isDryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }
    
    if (this.preserveAll) {
      console.log('🛡️  Preserve mode: All unused variables will be prefixed, not removed');
    }
    
    const mode = this.importsOnly ? 'imports only' : 
                 this.variablesOnly ? 'variables only' : 'imports and variables';
    console.log(`🎯 Processing: ${mode}`);
    
    const files = this.findTargetFiles();
    
    console.log(`📁 Processing ${files.length} files (max: ${this.maxFiles})`);
    console.log('');
    
    files.forEach(file => this.processFile(file));
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Files with fixes: ${this.fixedFiles}`);
    console.log(`   Total cleanups: ${this.totalFixes}`);
    
    if (!this.isDryRun && this.fixedFiles > 0) {
      console.log(`   Backups created in: ${this.backupDir}/`);
      console.log('');
      console.log('🧪 Next steps:');
      console.log('   1. Run TypeScript check: yarn lint');
      console.log('   2. Run tests: yarn test');
      console.log('   3. Verify no functionality is broken');
      console.log('   4. If issues occur, restore from backups');
    }
    
    if (this.isDryRun && this.totalFixes > 0) {
      console.log('');
      console.log('🚀 To apply fixes, run: node cleanup-unused-variables.cjs');
    }
    
    console.log('');
    console.log('💡 Pro tips:');
    console.log('   - Use --imports-only for safer import cleanup first');
    console.log('   - Use --preserve-all to keep all variables (just prefix them)');
    console.log('   - Domain-specific variables are automatically preserved');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  maxFiles: 20,
  importsOnly: args.includes('--imports-only'),
  variablesOnly: args.includes('--variables-only'),
  preserveAll: args.includes('--preserve-all')
};

args.forEach(arg => {
  if (arg.startsWith('--max-files=')) {
    options.maxFiles = parseInt(arg.split('=')[1]) || 20;
  }
});

// Run the script
const cleanup = new UnusedVariableCleanup(options);
cleanup.run();