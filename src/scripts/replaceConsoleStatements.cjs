#!/usr/bin/env node

/**
 * Console Statement Replacement Script
 * 
 * Systematically replaces console.log statements with proper logging
 * while preserving console.warn and console.error statements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConsoleStatementReplacer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.excludePatterns = [
      /\/scripts\//,
      /\/test\//,
      /\/__tests__\//,
      /\.test\./,
      /\.spec\./,
      /demo\.js$/,
      /\.config\./,
      /campaign\//  // Campaign system files already allow console
    ];

    this.consoleLogPattern = /console\.log\s*\(/g;
    this.consoleWarnPattern = /console\.warn\s*\(/g;
    this.consoleErrorPattern = /console\.error\s*\(/g;
    this.consoleInfoPattern = /console\.info\s*\(/g;
    this.consoleDebugPattern = /console\.debug\s*\(/g;
  }

  async replaceConsoleStatements() {
    console.log('🚀 Starting Console Statement Replacement');
    console.log('==========================================');
    
    const results = [];
    const files = this.getProductionFiles();
    
    console.log(`📁 Found ${files.length} production files to process\n`);

    for (const file of files) {
      try {
        const result = await this.processFile(file);
        results.push(result);
        
        if (result.replacedCount > 0) {
          console.log(`✅ ${result.file}: ${result.replacedCount} replacements, ${result.preservedCount} preserved`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        results.push({
          file,
          originalConsoleCount: 0,
          replacedCount: 0,
          preservedCount: 0,
          errors: [error.message]
        });
      }
    }

    return this.generateSummary(results);
  }

  getProductionFiles() {
    const files = [];
    
    const walkDir = (dir) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (this.isProductionFile(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(this.srcDir);
    return files;
  }

  isProductionFile(filePath) {
    // Only process TypeScript and JavaScript files
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      return false;
    }
    
    // Exclude patterns
    for (const pattern of this.excludePatterns) {
      if (pattern.test(filePath)) {
        return false;
      }
    }
    
    return true;
  }

  async processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Count original console statements
    const originalConsoleCount = this.countConsoleStatements(content);
    
    // Determine if this file needs logging import
    const needsLoggingImport = this.consoleLogPattern.test(content) || 
                              this.consoleInfoPattern.test(content) || 
                              this.consoleDebugPattern.test(content);
    
    let modifiedContent = content;
    let replacedCount = 0;
    
    // Add logging import if needed
    if (needsLoggingImport && !content.includes('from \'@/services/LoggingService\'')) {
      modifiedContent = this.addLoggingImport(modifiedContent);
    }
    
    // Replace console.log statements
    modifiedContent = modifiedContent.replace(this.consoleLogPattern, (match) => {
      replacedCount++;
      return `log.info(`;
    });
    
    // Replace console.info statements
    modifiedContent = modifiedContent.replace(this.consoleInfoPattern, (match) => {
      replacedCount++;
      return `log.info(`;
    });
    
    // Replace console.debug statements
    modifiedContent = modifiedContent.replace(this.consoleDebugPattern, (match) => {
      replacedCount++;
      return `log.debug(`;
    });
    
    // Count preserved statements (warn, error)
    const preservedCount = (content.match(this.consoleWarnPattern) || []).length +
                          (content.match(this.consoleErrorPattern) || []).length;
    
    // Write modified content if changes were made
    if (modifiedContent !== originalContent) {
      fs.writeFileSync(filePath, modifiedContent);
    }
    
    return {
      file: path.relative(process.cwd(), filePath),
      originalConsoleCount,
      replacedCount,
      preservedCount,
      errors: []
    };
  }

  countConsoleStatements(content) {
    const logCount = (content.match(this.consoleLogPattern) || []).length;
    const warnCount = (content.match(this.consoleWarnPattern) || []).length;
    const errorCount = (content.match(this.consoleErrorPattern) || []).length;
    const infoCount = (content.match(this.consoleInfoPattern) || []).length;
    const debugCount = (content.match(this.consoleDebugPattern) || []).length;
    
    return logCount + warnCount + errorCount + infoCount + debugCount;
  }

  addLoggingImport(content) {
    // Find the best place to add the import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Look for existing imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || (line.startsWith('const ') && line.includes('require('))) {
        insertIndex = i + 1;
      } else if (line === '' && insertIndex > 0) {
        // Found empty line after imports
        break;
      } else if (line && !line.startsWith('//') && !line.startsWith('/*') && insertIndex > 0) {
        // Found non-import, non-comment line
        break;
      }
    }
    
    const importStatement = "import { log } from '@/services/LoggingService';";
    
    // Insert the import
    lines.splice(insertIndex, 0, importStatement);
    
    return lines.join('\n');
  }

  generateSummary(results) {
    const summary = {
      totalFiles: results.length,
      filesModified: results.filter(r => r.replacedCount > 0).length,
      totalReplacements: results.reduce((sum, r) => sum + r.replacedCount, 0),
      totalPreserved: results.reduce((sum, r) => sum + r.preservedCount, 0),
      errors: results.flatMap(r => r.errors)
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('CONSOLE STATEMENT REPLACEMENT SUMMARY');
    console.log('='.repeat(50));
    console.log(`📁 Total files processed: ${summary.totalFiles}`);
    console.log(`✏️  Files modified: ${summary.filesModified}`);
    console.log(`🔄 Total replacements: ${summary.totalReplacements}`);
    console.log(`🛡️  Statements preserved: ${summary.totalPreserved}`);
    console.log(`❌ Errors: ${summary.errors.length}`);
    
    if (summary.errors.length > 0) {
      console.log('\nErrors:');
      summary.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return summary;
  }

  async validateChanges() {
    console.log('\n🔍 Validating changes...');
    
    try {
      // Run TypeScript compilation check
      console.log('📝 Checking TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
      
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }
}

async function main() {
  const replacer = new ConsoleStatementReplacer();
  
  try {
    const summary = await replacer.replaceConsoleStatements();
    
    if (summary.totalReplacements > 0) {
      console.log('\n🔍 Validating changes...');
      const isValid = await replacer.validateChanges();
      
      if (isValid) {
        console.log('\n🎉 Console statement replacement completed successfully!');
        console.log('✅ All validations passed');
        console.log('✅ Production code now uses proper logging service');
        console.log('✅ console.warn and console.error statements preserved');
      } else {
        console.log('\n⚠️  Replacement completed but validation failed');
        console.log('Please review the changes manually');
        process.exit(1);
      }
    } else {
      console.log('\n✨ No console.log statements found in production code');
      console.log('Console statement handling is already compliant');
    }
  } catch (error) {
    console.error('❌ Console statement replacement failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ConsoleStatementReplacer };