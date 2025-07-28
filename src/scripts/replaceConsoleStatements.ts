#!/usr/bin/env node

/**
 * Console Statement Replacement Script
 * 
 * Systematically replaces console.log statements with proper logging
 * while preserving console.warn and console.error statements.
 * 
 * Scope:
 * - Production code only (src/ directory)
 * - Excludes scripts/, test files, and development files
 * - Preserves console.warn and console.error
 * - Implements proper logging service integration
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ReplacementResult {
  file: string;
  originalConsoleCount: number;
  replacedCount: number;
  preservedCount: number;
  errors: string[];
}

interface ReplacementSummary {
  totalFiles: number;
  filesModified: number;
  totalReplacements: number;
  totalPreserved: number;
  errors: string[];
}

class ConsoleStatementReplacer {
  private readonly srcDir = path.join(process.cwd(), 'src');
  private readonly excludePatterns = [
    /\/scripts\//,
    /\/test\//,
    /\/__tests__\//,
    /\.test\./,
    /\.spec\./,
    /demo\.js$/,
    /\.config\./,
    /campaign\//  // Campaign system files already allow console
  ];

  private readonly consoleLogPattern = /console\.log\s*\(/g;
  private readonly consoleWarnPattern = /console\.warn\s*\(/g;
  private readonly consoleErrorPattern = /console\.error\s*\(/g;
  private readonly consoleInfoPattern = /console\.info\s*\(/g;
  private readonly consoleDebugPattern = /console\.debug\s*\(/g;

  public async replaceConsoleStatements(): Promise<ReplacementSummary> {
    console.log('🚀 Starting Console Statement Replacement');
    console.log('==========================================');
    
    const results: ReplacementResult[] = [];
    const files = this.getProductionFiles();
    
    console.log(`📁 Found ${files.length} production files to process\n`);

    for (const file of files) {
      try {
        const result = await this.processFile(file);
        results.push(result);
        
        if (result.replacedCount > 0) {
          console.log(`✅ ${file}: ${result.replacedCount} replacements, ${result.preservedCount} preserved`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        results.push({
          file,
          originalConsoleCount: 0,
          replacedCount: 0,
          preservedCount: 0,
          errors: [(error as Error).message]
        });
      }
    }

    return this.generateSummary(results);
  }

  private getProductionFiles(): string[] {
    const files: string[] = [];
    
    const walkDir = (dir: string) => {
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

  private isProductionFile(filePath: string): boolean {
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

  private async processFile(filePath: string): Promise<ReplacementResult> {
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
    modifiedContent = modifiedContent.replace(this.consoleLogPattern, (match, offset) => {
      const context = this.extractContext(filePath, modifiedContent, offset);
      replacedCount++;
      return `log.info(`;
    });
    
    // Replace console.info statements
    modifiedContent = modifiedContent.replace(this.consoleInfoPattern, (match, offset) => {
      replacedCount++;
      return `log.info(`;
    });
    
    // Replace console.debug statements
    modifiedContent = modifiedContent.replace(this.consoleDebugPattern, (match, offset) => {
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

  private countConsoleStatements(content: string): number {
    const logCount = (content.match(this.consoleLogPattern) || []).length;
    const warnCount = (content.match(this.consoleWarnPattern) || []).length;
    const errorCount = (content.match(this.consoleErrorPattern) || []).length;
    const infoCount = (content.match(this.consoleInfoPattern) || []).length;
    const debugCount = (content.match(this.consoleDebugPattern) || []).length;
    
    return logCount + warnCount + errorCount + infoCount + debugCount;
  }

  private addLoggingImport(content: string): string {
    // Find the best place to add the import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Look for existing imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || line.startsWith('const ') && line.includes('require(')) {
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

  private extractContext(filePath: string, content: string, offset: number): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(this.srcDir, filePath);
    
    // Try to determine component or service name
    let contextName = fileName;
    
    // Check if it's a React component
    if (content.includes('export default function') || content.includes('const ') && content.includes('= () =>')) {
      contextName = fileName;
    }
    
    // Check if it's a service
    if (filePath.includes('/services/')) {
      contextName = fileName.replace('Service', '');
    }
    
    return contextName;
  }

  private generateSummary(results: ReplacementResult[]): ReplacementSummary {
    const summary: ReplacementSummary = {
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

  public async validateChanges(): Promise<boolean> {
    console.log('\n🔍 Validating changes...');
    
    try {
      // Run TypeScript compilation check
      console.log('📝 Checking TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
      
      // Run ESLint check
      console.log('🔍 Running ESLint validation...');
      execSync('yarn lint --max-warnings=10000', { stdio: 'pipe' });
      console.log('✅ ESLint validation passed');
      
      // Run build test
      console.log('🏗️  Testing build process...');
      execSync('yarn build', { stdio: 'pipe' });
      console.log('✅ Build process successful');
      
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', (error as Error).message);
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

export { ConsoleStatementReplacer };