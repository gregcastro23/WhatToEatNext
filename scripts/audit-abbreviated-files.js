#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audit script to identify files that may have been abbreviated or replaced with placeholders
 * during TypeScript syntax fixes
 */

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Red flags that indicate a file may have been over-simplified
const RED_FLAGS = {
  // Size-based indicators
  SUSPICIOUSLY_SMALL: {
    threshold: 500, // bytes
    importance: 'medium',
    description: 'File is suspiciously small for its apparent purpose'
  },
  
  // Content-based indicators
  PLACEHOLDER_CONTENT: [
    /TODO.*implementation/i,
    /placeholder/i,
    /add actual/i,
    /implement this/i,
    /fix.*later/i,
    /temporary/i,
    /stub/i
  ],
  
  SYNTAX_ERRORS: [
    /any:/g,      // TypeScript any: syntax errors
    /let\s+[^=]*=[^=]/g,  // Malformed let declarations
    /\s+},\s*$/m,  // Trailing comma-brace syntax
    /\s+\[\]/g,    // Empty array literals that look wrong
    /\{\s*\}/g,    // Empty objects where rich data should be
  ],
  
  EMPTY_STRUCTURES: [
    /export\s+const\s+\w+\s*=\s*\{\s*\}/,  // Empty exported objects
    /export\s+const\s+\w+\s*=\s*\[\s*\]/,  // Empty exported arrays
    /function\s+\w+\([^)]*\)\s*\{\s*\}/,    // Empty functions
  ],
  
  ABBREVIATED_IMPLEMENTATIONS: [
    /return\s*\{\s*\}/,  // Functions returning empty objects
    /return\s*\[\s*\]/,  // Functions returning empty arrays
    /return\s*null/,     // Functions returning null
    /return\s*undefined/, // Functions returning undefined
  ]
};

// Critical directories and file patterns to audit
const AUDIT_TARGETS = [
  { 
    path: 'src/data/cuisines', 
    expectedRichness: 'high',
    description: 'Cuisine data files should contain rich cultural information'
  },
  { 
    path: 'src/data/ingredients', 
    expectedRichness: 'high',
    description: 'Ingredient data should have detailed properties and mappings'
  },
  { 
    path: 'src/data/recipes', 
    expectedRichness: 'high',
    description: 'Recipe data should contain detailed instructions and ingredients'
  },
  { 
    path: 'src/utils', 
    expectedRichness: 'medium',
    description: 'Utility functions should contain actual logic, not stubs'
  },
  { 
    path: 'src/types', 
    expectedRichness: 'medium',
    description: 'Type definitions should be comprehensive'
  },
  { 
    path: 'src/components', 
    expectedRichness: 'medium',
    description: 'Components should have actual implementation'
  },
  { 
    path: 'src/calculations', 
    expectedRichness: 'high',
    description: 'Calculation functions should contain complex logic'
  },
  { 
    path: 'src/lib', 
    expectedRichness: 'medium',
    description: 'Library functions should be fully implemented'
  }
];

// File patterns that should be ignored
const IGNORE_PATTERNS = [
  /\.backup/,
  /\.bak/,
  /\.tmp/,
  /\.test\./,
  /\.spec\./,
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /__mocks__/
];

class FileAuditor {
  constructor() {
    this.results = {
      abbreviatedFiles: [],
      syntaxErrorFiles: [],
      emptyFiles: [],
      suspiciousFiles: [],
      totalScanned: 0,
      backupFiles: new Map()
    };
  }

  async scanDirectory(dirPath, options = {}) {
    const fullPath = path.join(__dirname, dirPath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);
        const relativePath = path.relative(__dirname, entryPath);
        
        // Skip ignored patterns
        if (IGNORE_PATTERNS.some(pattern => pattern.test(relativePath))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.scanDirectory(relativePath, options);
        } else if (entry.isFile() && this.shouldAuditFile(entry.name)) {
          await this.auditFile(entryPath, relativePath, options);
        }
      }
    } catch (error) {
      if (VERBOSE) {
        console.log(`⚠️  Cannot access directory ${dirPath}: ${error.message}`);
      }
    }
  }

  shouldAuditFile(filename) {
    return /\.(ts|tsx|js|jsx)$/.test(filename) && 
           !IGNORE_PATTERNS.some(pattern => pattern.test(filename));
  }

  async auditFile(filePath, relativePath, options) {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      this.results.totalScanned++;
      
      const issues = this.analyzeFile(content, stats, relativePath);
      
      if (issues.length > 0) {
        const fileReport = {
          path: relativePath,
          size: stats.size,
          issues: issues,
          severity: this.calculateSeverity(issues),
          hasBackup: await this.checkForBackups(filePath)
        };
        
        // Categorize the file based on its issues
        if (issues.some(i => i.type === 'abbreviated')) {
          this.results.abbreviatedFiles.push(fileReport);
        }
        if (issues.some(i => i.type === 'syntax_error')) {
          this.results.syntaxErrorFiles.push(fileReport);
        }
        if (issues.some(i => i.type === 'empty')) {
          this.results.emptyFiles.push(fileReport);
        }
        if (issues.some(i => i.type === 'suspicious')) {
          this.results.suspiciousFiles.push(fileReport);
        }
        
        if (VERBOSE) {
          console.log(`🔍 ${relativePath}: ${issues.length} issues found`);
          issues.forEach(issue => {
            console.log(`   - ${issue.description}`);
          });
        }
      }
      
    } catch (error) {
      if (VERBOSE) {
        console.log(`⚠️  Cannot read file ${relativePath}: ${error.message}`);
      }
    }
  }

  analyzeFile(content, stats, filepath) {
    const issues = [];
    
    // Check file size for expected rich files
    const expectedRichness = this.getExpectedRichness(filepath);
    if (expectedRichness === 'high' && stats.size < RED_FLAGS.SUSPICIOUSLY_SMALL.threshold) {
      issues.push({
        type: 'suspicious',
        severity: 'high',
        description: `File is only ${stats.size} bytes but should contain rich data`
      });
    }
    
    // Check for placeholder content
    RED_FLAGS.PLACEHOLDER_CONTENT.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push({
          type: 'abbreviated',
          severity: 'high',
          description: 'Contains placeholder content suggesting incomplete implementation'
        });
      }
    });
    
    // Check for syntax errors
    RED_FLAGS.SYNTAX_ERRORS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 2) { // More than a few instances suggests systematic errors
        issues.push({
          type: 'syntax_error',
          severity: 'high',
          description: `Contains repeated syntax errors: ${matches.length} instances of ${pattern.source}`
        });
      }
    });
    
    // Check for empty structures
    RED_FLAGS.EMPTY_STRUCTURES.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push({
          type: 'empty',
          severity: 'medium',
          description: 'Contains empty exported structures where content expected'
        });
      }
    });
    
    // Check for abbreviated implementations
    RED_FLAGS.ABBREVIATED_IMPLEMENTATIONS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 1) {
        issues.push({
          type: 'abbreviated',
          severity: 'medium',
          description: `Multiple functions return empty/null values: ${matches.length} instances`
        });
      }
    });
    
    // Special checks for specific file types
    if (filepath.includes('/cuisines/') && !filepath.includes('index.ts')) {
      issues.push(...this.auditCuisineFile(content, filepath));
    }
    
    if (filepath.includes('/ingredients/')) {
      issues.push(...this.auditIngredientFile(content, filepath));
    }
    
    if (filepath.includes('/utils/') && filepath.endsWith('.ts')) {
      issues.push(...this.auditUtilityFile(content, filepath));
    }
    
    return issues;
  }

  auditCuisineFile(content, filepath) {
    const issues = [];
    
    // Cuisine files should have rich dish descriptions
    if (!content.includes('dishes:') || !content.includes('traditional')) {
      issues.push({
        type: 'abbreviated',
        severity: 'high',
        description: 'Cuisine file missing traditional dishes or detailed structure'
      });
    }
    
    // Should have multiple varieties/regional info
    if (content.split('description:').length < 3) {
      issues.push({
        type: 'abbreviated',
        severity: 'medium',
        description: 'Cuisine file appears to lack detailed descriptions'
      });
    }
    
    return issues;
  }

  auditIngredientFile(content, filepath) {
    const issues = [];
    
    // Ingredient files should have elemental properties
    if (content.includes('elementalProperties') && content.includes('{ }')) {
      issues.push({
        type: 'empty',
        severity: 'high',
        description: 'Ingredient has empty elemental properties'
      });
    }
    
    return issues;
  }

  auditUtilityFile(content, filepath) {
    const issues = [];
    
    // Utility files shouldn't have mostly empty functions
    const functionMatches = content.match(/function\s+\w+/g) || [];
    const emptyFunctionMatches = content.match(/function\s+\w+[^{]*\{\s*\}/g) || [];
    
    if (functionMatches.length > 0 && emptyFunctionMatches.length / functionMatches.length > 0.5) {
      issues.push({
        type: 'abbreviated',
        severity: 'high',
        description: 'More than half of functions are empty stubs'
      });
    }
    
    return issues;
  }

  getExpectedRichness(filepath) {
    for (const target of AUDIT_TARGETS) {
      if (filepath.includes(target.path)) {
        return target.expectedRichness;
      }
    }
    return 'low';
  }

  calculateSeverity(issues) {
    const severityScores = { low: 1, medium: 2, high: 3 };
    const maxSeverity = Math.max(...issues.map(i => severityScores[i.severity] || 1));
    
    if (maxSeverity >= 3) return 'high';
    if (maxSeverity >= 2) return 'medium';
    return 'low';
  }

  async checkForBackups(filePath) {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);
    
    try {
      const entries = await fs.readdir(dir);
      const backups = entries.filter(entry => 
        entry.startsWith(filename) && 
        (entry.includes('.backup') || entry.includes('.bak'))
      );
      
      if (backups.length > 0) {
        this.results.backupFiles.set(filePath, backups);
        return true;
      }
    } catch (error) {
      // Ignore errors
    }
    
    return false;
  }

  generateReport() {
    console.log('\n🔍 FILE ABBREVIATION AUDIT REPORT\n');
    console.log('='.repeat(50));
    
    console.log(`📊 SUMMARY:`);
    console.log(`   Total files scanned: ${this.results.totalScanned}`);
    console.log(`   Files with abbreviation issues: ${this.results.abbreviatedFiles.length}`);
    console.log(`   Files with syntax errors: ${this.results.syntaxErrorFiles.length}`);
    console.log(`   Files with empty structures: ${this.results.emptyFiles.length}`);
    console.log(`   Files flagged as suspicious: ${this.results.suspiciousFiles.length}`);
    
    // High priority issues
    const highPriorityFiles = [
      ...this.results.abbreviatedFiles,
      ...this.results.syntaxErrorFiles,
      ...this.results.emptyFiles,
      ...this.results.suspiciousFiles
    ].filter(f => f.severity === 'high');
    
    if (highPriorityFiles.length > 0) {
      console.log(`\n🚨 HIGH PRIORITY ISSUES (${highPriorityFiles.length} files):`);
      console.log('-'.repeat(40));
      
      highPriorityFiles.forEach(file => {
        console.log(`\n📁 ${file.path} (${file.size} bytes)`);
        file.issues.forEach(issue => {
          if (issue.severity === 'high') {
            console.log(`   🔴 ${issue.description}`);
          }
        });
        if (file.hasBackup) {
          console.log(`   💾 Backup files available for restoration`);
        }
      });
    }
    
    // Files with backups available
    if (this.results.backupFiles.size > 0) {
      console.log(`\n💾 FILES WITH BACKUPS AVAILABLE (${this.results.backupFiles.size}):`);
      console.log('-'.repeat(40));
      
      for (const [filePath, backups] of this.results.backupFiles) {
        const relativePath = path.relative(__dirname, filePath);
        console.log(`📁 ${relativePath}`);
        backups.forEach(backup => {
          console.log(`   📂 ${backup}`);
        });
      }
    }
    
    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    console.log('-'.repeat(40));
    
    if (highPriorityFiles.length > 0) {
      console.log(`1. Restore ${highPriorityFiles.filter(f => f.hasBackup).length} high-priority files from backups`);
      console.log(`2. Review ${highPriorityFiles.filter(f => !f.hasBackup).length} high-priority files without backups`);
    }
    
    if (this.results.syntaxErrorFiles.length > 0) {
      console.log(`3. Fix syntax errors in ${this.results.syntaxErrorFiles.length} files`);
    }
    
    if (this.results.abbreviatedFiles.length > 0) {
      console.log(`4. Restore functionality in ${this.results.abbreviatedFiles.length} abbreviated files`);
    }
    
    // Priority restoration order
    console.log(`\n🎯 SUGGESTED RESTORATION ORDER:`);
    console.log('-'.repeat(40));
    console.log(`1. Cuisine data files (critical for app functionality)`);
    console.log(`2. Core alchemical engine files`);
    console.log(`3. Ingredient data files`);
    console.log(`4. Utility functions`);
    console.log(`5. Component logic`);
    console.log(`6. Type definitions`);
  }
}

async function main() {
  console.log('🔍 Starting file abbreviation audit...');
  if (DRY_RUN) {
    console.log('🧪 Running in DRY RUN mode');
  }
  
  const auditor = new FileAuditor();
  
  // Scan all target directories
  for (const target of AUDIT_TARGETS) {
    if (VERBOSE) {
      console.log(`📂 Scanning ${target.path}...`);
    }
    await auditor.scanDirectory(target.path, { expectedRichness: target.expectedRichness });
  }
  
  // Generate and display report
  auditor.generateReport();
  
  console.log('\n✅ Audit complete');
}

// Run the audit
main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
}); 