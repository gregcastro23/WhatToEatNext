#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const ANALYZE_ONLY = process.argv.includes('--analyze-only');

console.log('🤖 AI-Assisted Pattern Detection Tool v1.0');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLYING FIXES'}`);
console.log(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}`);
console.log(`Analyze Only: ${ANALYZE_ONLY ? 'ON' : 'OFF'}`);

/**
 * AI Pattern Detection: Analyze TypeScript errors to identify fixable patterns
 */
class AIPatternDetector {
  constructor() {
    this.patterns = new Map();
    this.errorAnalysis = {
      ts2339: [], // Property does not exist
      ts2304: [], // Cannot find name
      ts2345: [], // Argument type issues
      ts2724: [], // Export member issues
      ts2322: [], // Type assignment issues
      ts2352: [], // Conversion issues
      ts2551: [], // Property errors
      ts2349: [], // Cannot invoke
      ts2739: [], // Missing properties
      ts2740: [], // Missing properties
      ts2305: [], // Module issues
      ts2365: [], // Operator issues
      ts2678: [], // Type issues
      ts2552: [], // Cannot find name
      ts18004: [], // Import issues
      ts2538: [], // Type issues
      ts2363: [], // Operator issues
    };
  }

  /**
   * Analyze TypeScript errors to identify patterns
   */
  analyzeTypeScriptErrors() {
    try {
      const tsOutput = execSync('./node_modules/.bin/tsc --noEmit --skipLibCheck', { 
        cwd: ROOT_DIR, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message || '';
      const errorLines = errorOutput.split('\n');
      
      console.log(`  Processing ${errorLines.length} output lines...`);
      let errorCount = 0;
      
      errorLines.forEach(line => {
        if (line.includes('error TS')) {
          errorCount++;
          const match = line.match(/(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s*(.+)/);
          if (match) {
            const [, filePath, lineNum, colNum, errorCode, message] = match;
            const errorType = errorCode.toLowerCase();
            
            if (this.errorAnalysis[errorType]) {
              this.errorAnalysis[errorType].push({
                file: filePath,
                line: parseInt(lineNum),
                column: parseInt(colNum),
                message: message.trim(),
                fullLine: line
              });
            } else {
              // Add unknown error types dynamically
              if (!this.errorAnalysis[errorType]) {
                this.errorAnalysis[errorType] = [];
              }
              this.errorAnalysis[errorType].push({
                file: filePath,
                line: parseInt(lineNum),
                column: parseInt(colNum),
                message: message.trim(),
                fullLine: line
              });
            }
          }
        }
      });
      
      console.log(`  Found ${errorCount} TypeScript errors`);
      
      // Debug: Show how many errors were categorized
      let categorizedCount = 0;
      Object.entries(this.errorAnalysis).forEach(([type, errors]) => {
        if (errors.length > 0) {
          console.log(`    ${type}: ${errors.length} errors`);
          categorizedCount += errors.length;
        }
      });
      console.log(`  Categorized: ${categorizedCount} errors`);
    }
  }

  /**
   * Detect patterns in TS2339 errors (Property does not exist)
   */
  detectTS2339Patterns() {
    const patterns = new Map();
    
    this.errorAnalysis.ts2339.forEach(error => {
      // Extract property name from error message
      const propertyMatch = error.message.match(/Property '([^']+)' does not exist on type/);
      if (propertyMatch) {
        const property = propertyMatch[1];
        
        // Categorize common patterns
        if (property === 'NODE_ENV') {
          patterns.set('env-access', (patterns.get('env-access') || []).concat([error]));
        } else if (['id', 'name', 'length', 'value'].includes(property)) {
          patterns.set('optional-chaining', (patterns.get('optional-chaining') || []).concat([error]));
        } else if (property.startsWith('_')) {
          patterns.set('underscore-prefix', (patterns.get('underscore-prefix') || []).concat([error]));
        } else {
          patterns.set('unknown-property', (patterns.get('unknown-property') || []).concat([error]));
        }
      }
    });
    
    return patterns;
  }

  /**
   * Detect patterns in TS2304 errors (Cannot find name)
   */
  detectTS2304Patterns() {
    const patterns = new Map();
    
    this.errorAnalysis.ts2304.forEach(error => {
      // Extract name from error message
      const nameMatch = error.message.match(/Cannot find name '([^']+)'/);
      if (nameMatch) {
        const name = nameMatch[1];
        
        // Categorize common patterns
        if (name.startsWith('_')) {
          patterns.set('underscore-types', (patterns.get('underscore-types') || []).concat([error]));
        } else if (name.match(/^[A-Z][a-zA-Z0-9_]*$/)) {
          patterns.set('missing-types', (patterns.get('missing-types') || []).concat([error]));
        } else {
          patterns.set('unknown-name', (patterns.get('unknown-name') || []).concat([error]));
        }
      }
    });
    
    return patterns;
  }

  /**
   * Detect patterns in TS2724 errors (Export member issues)
   */
  detectTS2724Patterns() {
    const patterns = new Map();
    
    this.errorAnalysis.ts2724.forEach(error => {
      // Extract export name from error message
      const exportMatch = error.message.match(/has no exported member named '([^']+)'/);
      if (exportMatch) {
        const exportName = exportMatch[1];
        
        // Categorize common patterns
        if (exportName.startsWith('_')) {
          patterns.set('underscore-exports', (patterns.get('underscore-exports') || []).concat([error]));
        } else {
          patterns.set('missing-exports', (patterns.get('missing-exports') || []).concat([error]));
        }
      }
    });
    
    return patterns;
  }

  /**
   * Generate smart fix suggestions based on detected patterns
   */
  generateSmartFixes() {
    const fixes = [];
    
    // Analyze each error type
    const ts2339Patterns = this.detectTS2339Patterns();
    const ts2304Patterns = this.detectTS2304Patterns();
    const ts2724Patterns = this.detectTS2724Patterns();
    
    // Generate fixes for underscore prefix issues
    const underscoreIssues = [
      ...ts2304Patterns.get('underscore-types') || [],
      ...ts2724Patterns.get('underscore-exports') || []
    ];
    
    if (underscoreIssues.length > 0) {
      fixes.push({
        pattern: 'remove-underscore-prefixes',
        description: `Remove incorrect underscore prefixes from ${underscoreIssues.length} imports/types`,
        files: [...new Set(underscoreIssues.map(e => e.file))],
        fixes: underscoreIssues.length,
        priority: 'high'
      });
    }
    
    // Generate fixes for property access issues
    const propertyIssues = ts2339Patterns.get('optional-chaining') || [];
    if (propertyIssues.length > 0) {
      fixes.push({
        pattern: 'add-optional-chaining',
        description: `Add optional chaining to ${propertyIssues.length} property accesses`,
        files: [...new Set(propertyIssues.map(e => e.file))],
        fixes: propertyIssues.length,
        priority: 'medium'
      });
    }
    
    // Generate fixes for environment access
    const envIssues = ts2339Patterns.get('env-access') || [];
    if (envIssues.length > 0) {
      fixes.push({
        pattern: 'fix-env-access',
        description: `Fix NODE_ENV access in ${envIssues.length} locations`,
        files: [...new Set(envIssues.map(e => e.file))],
        fixes: envIssues.length,
        priority: 'medium'
      });
    }
    
    return fixes;
  }

  /**
   * Apply smart fixes to identified patterns
   */
  applySmartFixes(fixes) {
    let totalChanges = 0;
    
    fixes.forEach(fix => {
      console.log(`\n🔧 Applying fix: ${fix.description}`);
      
      fix.files.forEach(filePath => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          let newContent = content;
          let changes = 0;
          
          switch (fix.pattern) {
            case 'remove-underscore-prefixes':
              ({ content: newContent, changes } = this.removeUnderscorePrefixes(content, filePath));
              break;
            case 'add-optional-chaining':
              ({ content: newContent, changes } = this.addOptionalChaining(content, filePath));
              break;
            case 'fix-env-access':
              ({ content: newContent, changes } = this.fixEnvAccess(content, filePath));
              break;
          }
          
          if (changes > 0) {
            console.log(`  📁 ${path.relative(ROOT_DIR, filePath)}: ${changes} fixes`);
            totalChanges += changes;
            
            if (!DRY_RUN) {
              fs.writeFileSync(filePath, newContent, 'utf8');
            }
          }
        } catch (error) {
          console.error(`  ❌ Error processing ${filePath}:`, error.message);
        }
      });
    });
    
    return totalChanges;
  }

  /**
   * Remove underscore prefixes from imports and types
   */
  removeUnderscorePrefixes(content, filePath) {
    let changes = 0;
    let newContent = content;
    
    // Common underscore prefixes to fix
    const underscoreTypes = [
      '_Recipe', '_ElementalProperties', '_ZodiacSign', '_logger', '_Element',
      '_LunarPhase', '_AlchemicalProperties', '_Season', '_ErrorHandler',
      '_PlanetaryPosition', '_PlanetName', '_ChakraEnergies'
    ];
    
    underscoreTypes.forEach(prefixedType => {
      const correctType = prefixedType.substring(1);
      
      // Fix imports
      const importPattern = new RegExp(`(import\\s*{[^}]*?)\\b${prefixedType}\\b([^}]*})`, 'g');
      if (importPattern.test(content)) {
        newContent = newContent.replace(importPattern, `$1${correctType}$2`);
        changes++;
      }
      
      // Fix type usage
      const typePattern = new RegExp(`\\b${prefixedType}\\b(?![\\w_])`, 'g');
      const matches = [...content.matchAll(typePattern)];
      if (matches.length > 0) {
        newContent = newContent.replace(typePattern, correctType);
        changes += matches.length;
      }
    });
    
    return { content: newContent, changes };
  }

  /**
   * Add optional chaining for property access
   */
  addOptionalChaining(content, filePath) {
    let changes = 0;
    let newContent = content;
    
    // Common property access patterns
    const propertyPatterns = [
      { pattern: /(\w+)\.length(?=\s*[><=])/g, replacement: '$1?.length' },
      { pattern: /(\w+)\.id(?=\s*[;,)])/g, replacement: '$1?.id' },
      { pattern: /(\w+)\.name(?=\s*[;,)])/g, replacement: '$1?.name' },
    ];
    
    propertyPatterns.forEach(({ pattern, replacement }) => {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        newContent = newContent.replace(pattern, replacement);
        changes += matches.length;
      }
    });
    
    return { content: newContent, changes };
  }

  /**
   * Fix environment variable access
   */
  fixEnvAccess(content, filePath) {
    let changes = 0;
    let newContent = content;
    
    // Fix NODE_ENV access
    const envPattern = /process\.env\.NODE_ENV/g;
    const matches = [...content.matchAll(envPattern)];
    if (matches.length > 0) {
      newContent = newContent.replace(envPattern, '(process.env.NODE_ENV as string)');
      changes += matches.length;
    }
    
    return { content: newContent, changes };
  }

  /**
   * Generate comprehensive analysis report
   */
  generateAnalysisReport() {
    console.log('\n🔍 AI Pattern Analysis Report:');
    
    Object.entries(this.errorAnalysis).forEach(([errorType, errors]) => {
      if (errors.length > 0) {
        console.log(`\n📊 ${errorType.toUpperCase()}: ${errors.length} errors`);
        
        // Show top 5 files with most errors
        const fileCount = {};
        errors.forEach(error => {
          const relativePath = path.relative(ROOT_DIR, error.file);
          fileCount[relativePath] = (fileCount[relativePath] || 0) + 1;
        });
        
        const topFiles = Object.entries(fileCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);
        
        topFiles.forEach(([file, count]) => {
          console.log(`  📁 ${file}: ${count} errors`);
        });
      }
    });
    
    const smartFixes = this.generateSmartFixes();
    console.log('\n🤖 Smart Fix Suggestions:');
    smartFixes.forEach(fix => {
      console.log(`  ✅ ${fix.description} (${fix.priority} priority)`);
      console.log(`     Files affected: ${fix.files.length}`);
      console.log(`     Potential fixes: ${fix.fixes}`);
    });
    
    return smartFixes;
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('\n🔍 Analyzing TypeScript errors...');
    this.analyzeTypeScriptErrors();
    
    const smartFixes = this.generateAnalysisReport();
    
    if (ANALYZE_ONLY) {
      console.log('\n📋 Analysis complete. Use --apply to execute fixes.');
      return;
    }
    
    if (smartFixes.length > 0) {
      console.log('\n🚀 Applying smart fixes...');
      const totalChanges = this.applySmartFixes(smartFixes);
      
      console.log(`\n📊 Summary:`);
      console.log(`Total fixes applied: ${totalChanges}`);
      console.log(`Patterns addressed: ${smartFixes.length}`);
      
      if (DRY_RUN) {
        console.log('\n⚠️  This was a dry run. Remove --dry-run to apply changes.');
      } else {
        console.log('\n✅ Smart fixes applied successfully!');
      }
    } else {
      console.log('\n💡 No fixable patterns detected.');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const detector = new AIPatternDetector();
  await detector.run();
}

main().catch(console.error);