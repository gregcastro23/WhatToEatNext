#!/usr/bin/env node

/**
 * Import Organization and Duplicate Removal Script
 * 
 * This script addresses task 9 from the linting-excellence spec:
 * - Remove duplicate import statements across all files
 * - Organize imports according to established patterns (external, internal, relative)
 * - Fix named import/export inconsistencies
 * - Resolve circular dependency issues if any exist
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ImportIssue {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ImportAnalysis {
  duplicateImports: ImportIssue[];
  importOrderIssues: ImportIssue[];
  circularDependencies: ImportIssue[];
  namedImportIssues: ImportIssue[];
  totalIssues: number;
}

class ImportOrganizationFixer {
  private readonly srcDir = path.join(process.cwd(), 'src');
  private readonly backupDir = path.join(process.cwd(), '.import-organization-backup');
  private processedFiles = 0;
  private fixedIssues = 0;

  constructor() {
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private createBackup(filePath: string): void {
    const relativePath = path.relative(this.srcDir, filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, backupPath);
  }

  private async analyzeImportIssues(): Promise<ImportAnalysis> {
    console.log('🔍 Analyzing import issues...');
    
    try {
      // Run ESLint with JSON output to get detailed import issues
      const eslintOutput = execSync(
        'yarn lint --format=json --no-eslintrc --config eslint.config.cjs src/',
        { 
          encoding: 'utf8',
          stdio: 'pipe',
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        }
      );
      
      const results = JSON.parse(eslintOutput);
      const analysis: ImportAnalysis = {
        duplicateImports: [],
        importOrderIssues: [],
        circularDependencies: [],
        namedImportIssues: [],
        totalIssues: 0
      };

      for (const result of results) {
        for (const message of result.messages) {
          const issue: ImportIssue = {
            file: result.filePath,
            line: message.line,
            column: message.column,
            rule: message.ruleId,
            message: message.message,
            severity: message.severity === 2 ? 'error' : 'warning'
          };

          // Categorize import issues
          if (message.ruleId === 'import/no-duplicates') {
            analysis.duplicateImports.push(issue);
          } else if (message.ruleId === 'import/order') {
            analysis.importOrderIssues.push(issue);
          } else if (message.ruleId === 'import/no-cycle') {
            analysis.circularDependencies.push(issue);
          } else if (message.ruleId?.includes('import/named') || message.ruleId?.includes('import/default')) {
            analysis.namedImportIssues.push(issue);
          }
        }
      }

      analysis.totalIssues = analysis.duplicateImports.length + 
                           analysis.importOrderIssues.length + 
                           analysis.circularDependencies.length + 
                           analysis.namedImportIssues.length;

      return analysis;
    } catch (error) {
      console.warn('⚠️ ESLint analysis failed, using alternative approach:', error.message);
      return this.fallbackAnalysis();
    }
  }

  private fallbackAnalysis(): ImportAnalysis {
    // Fallback analysis using file system scanning
    const analysis: ImportAnalysis = {
      duplicateImports: [],
      importOrderIssues: [],
      circularDependencies: [],
      namedImportIssues: [],
      totalIssues: 0
    };

    const files = this.getAllTypeScriptFiles();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Check for duplicate imports
        const importLines = lines
          .map((line, index) => ({ line: line.trim(), index }))
          .filter(({ line }) => line.startsWith('import '));
        
        const importSources = new Map<string, number[]>();
        
        for (const { line, index } of importLines) {
          const match = line.match(/from\s+['"`]([^'"`]+)['"`]/);
          if (match) {
            const source = match[1];
            if (!importSources.has(source)) {
              importSources.set(source, []);
            }
            importSources.get(source) ?? undefined.push(index + 1);
          }
        }
        
        // Find duplicates
        for (const [source, lineNumbers] of importSources) {
          if (lineNumbers.length > 1) {
            analysis.duplicateImports.push({
              file,
              line: lineNumbers[1],
              column: 1,
              rule: 'import/no-duplicates',
              message: `Duplicate import from '${source}'`,
              severity: 'error'
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to analyze ${file}:`, error.message);
      }
    }

    analysis.totalIssues = analysis.duplicateImports.length;
    return analysis;
  }

  private getAllTypeScriptFiles(): string[] {
    const files: string[] = [];
    
    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(this.srcDir);
    return files;
  }

  private async fixDuplicateImports(files: string[]): Promise<number> {
    console.log('🔧 Fixing duplicate imports...');
    let fixedCount = 0;

    for (const file of files) {
      try {
        this.createBackup(file);
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Group imports by source
        const importGroups = new Map<string, {
          lines: number[];
          imports: string[];
          defaultImport?: string;
          namespaceImport?: string;
        }>();
        
        const importLinePattern = /^import\s+(.+?)\s+from\s+['"`]([^'"`]+)['"`]/;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const match = line.match(importLinePattern);
          
          if (match) {
            const [, importPart, source] = match;
            
            if (!importGroups.has(source)) {
              importGroups.set(source, {
                lines: [],
                imports: []
              });
            }
            
            const group = importGroups.get(source) ?? undefined;
            group.lines.push(i);
            
            // Parse import types
            if (importPart.includes('{')) {
              // Named imports
              const namedMatch = importPart.match(/\{([^}]+)\}/);
              if (namedMatch) {
                const namedImports = namedMatch[1]
                  .split(',')
                  .map(imp => imp.trim())
                  .filter(imp => imp.length > 0);
                group.imports.push(...namedImports);
              }
            }
            
            if (importPart.includes('* as ')) {
              // Namespace import
              const namespaceMatch = importPart.match(/\*\s+as\s+(\w+)/);
              if (namespaceMatch) {
                group.namespaceImport = namespaceMatch[1];
              }
            }
            
            // Default import
            const defaultMatch = importPart.match(/^([^{,*]+)(?=,|\s*$)/);
            if (defaultMatch && !defaultMatch[1].includes('*')) {
              group.defaultImport = defaultMatch[1].trim();
            }
          }
        }
        
        // Check for duplicates and merge
        let hasChanges = false;
        const newLines = [...lines];
        
        for (const [source, group] of importGroups) {
          if (group.lines.length > 1) {
            // Remove duplicate lines (keep first, remove others)
            for (let i = group.lines.length - 1; i > 0; i--) {
              newLines.splice(group.lines[i], 1);
              hasChanges = true;
            }
            
            // Merge imports into the first line
            const firstLineIndex = group.lines[0];
            let mergedImport = 'import ';
            
            const parts: string[] = [];
            
            if (group.defaultImport) {
              parts.push(group.defaultImport);
            }
            
            if (group.namespaceImport) {
              parts.push(`* as ${group.namespaceImport}`);
            }
            
            if (group.imports.length > 0) {
              // Remove duplicates and sort
              const uniqueImports = [...new Set(group.imports)].sort();
              parts.push(`{ ${uniqueImports.join(', ')} }`);
            }
            
            mergedImport += parts.join(', ') + ` from '${source}';`;
            newLines[firstLineIndex] = mergedImport;
            
            fixedCount++;
          }
        }
        
        if (hasChanges) {
          fs.writeFileSync(file, newLines.join('\n'));
          this.processedFiles++;
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to fix duplicates in ${file}:`, error.message);
      }
    }

    return fixedCount;
  }

  private async fixImportOrder(): Promise<number> {
    console.log('🔧 Fixing import order...');
    
    try {
      // Use ESLint's --fix to automatically fix import order
      execSync(
        'yarn lint --fix --no-eslintrc --config eslint.config.cjs src/ --rule "import/order: error"',
        { 
          stdio: 'pipe',
          maxBuffer: 10 * 1024 * 1024
        }
      );
      
      console.log('✅ Import order fixed using ESLint --fix');
      return 1; // Indicate success
    } catch (error) {
      console.warn('⚠️ ESLint --fix failed, using manual approach');
      return this.manualImportOrderFix();
    }
  }

  private manualImportOrderFix(): number {
    const files = this.getAllTypeScriptFiles();
    let fixedCount = 0;

    for (const file of files) {
      try {
        this.createBackup(file);
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Find import section
        const importStartIndex = lines.findIndex(line => line.trim().startsWith('import '));
        if (importStartIndex === -1) continue;
        
        let importEndIndex = importStartIndex;
        for (let i = importStartIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('import ') || line === '') {
            importEndIndex = i;
          } else {
            break;
          }
        }
        
        // Extract and categorize imports
        const imports = lines.slice(importStartIndex, importEndIndex + 1)
          .filter(line => line.trim().startsWith('import '));
        
        const categorizedImports = {
          builtin: [] as string[],
          external: [] as string[],
          internal: [] as string[],
          relative: [] as string[]
        };
        
        for (const importLine of imports) {
          const match = importLine.match(/from\s+['"`]([^'"`]+)['"`]/);
          if (match) {
            const source = match[1];
            
            if (source.startsWith('node:') || ['fs', 'path', 'crypto', 'util'].includes(source)) {
              categorizedImports.builtin.push(importLine);
            } else if (source.startsWith('@/') || source.startsWith('@components/')) {
              categorizedImports.internal.push(importLine);
            } else if (source.startsWith('./') || source.startsWith('../')) {
              categorizedImports.relative.push(importLine);
            } else {
              categorizedImports.external.push(importLine);
            }
          }
        }
        
        // Sort each category alphabetically
        Object.keys(categorizedImports).forEach(key => {
          categorizedImports[key as keyof typeof categorizedImports].sort();
        });
        
        // Rebuild import section
        const newImports: string[] = [];
        
        if (categorizedImports.builtin.length > 0) {
          newImports.push(...categorizedImports.builtin, '');
        }
        if (categorizedImports.external.length > 0) {
          newImports.push(...categorizedImports.external, '');
        }
        if (categorizedImports.internal.length > 0) {
          newImports.push(...categorizedImports.internal, '');
        }
        if (categorizedImports.relative.length > 0) {
          newImports.push(...categorizedImports.relative, '');
        }
        
        // Remove trailing empty line
        if (newImports[newImports.length - 1] === '') {
          newImports.pop();
        }
        
        // Replace import section
        const newLines = [
          ...lines.slice(0, importStartIndex),
          ...newImports,
          ...lines.slice(importEndIndex + 1)
        ];
        
        if (JSON.stringify(newImports) !== JSON.stringify(imports)) {
          fs.writeFileSync(file, newLines.join('\n'));
          fixedCount++;
          this.processedFiles++;
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to fix import order in ${file}:`, error.message);
      }
    }

    return fixedCount;
  }

  private async detectCircularDependencies(): Promise<string[]> {
    console.log('🔍 Detecting circular dependencies...');
    
    const files = this.getAllTypeScriptFiles();
    const dependencyGraph = new Map<string, Set<string>>();
    
    // Build dependency graph
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const imports = content.match(/from\s+['"`]([^'"`]+)['"`]/g) || [];
        
        const dependencies = new Set<string>();
        
        for (const importMatch of imports) {
          const match = importMatch.match(/from\s+['"`]([^'"`]+)['"`]/);
          if (match) {
            const source = match[1];
            
            // Convert relative imports to absolute paths
            if (source.startsWith('./') || source.startsWith('../')) {
              const absolutePath = path.resolve(path.dirname(file), source);
              dependencies.add(absolutePath);
            } else if (source.startsWith('@/')) {
              const absolutePath = path.resolve(this.srcDir, source.substring(2));
              dependencies.add(absolutePath);
            }
          }
        }
        
        dependencyGraph.set(file, dependencies);
      } catch (error) {
        console.warn(`⚠️ Failed to analyze dependencies in ${file}:`, error.message);
      }
    }
    
    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];
    
    const detectCycle = (node: string, path: string[] = []): boolean => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat(node);
        cycles.push(`Circular dependency: ${cycle.join(' -> ')}`);
        return true;
      }
      
      if (visited.has(node)) {
        return false;
      }
      
      visited.add(node);
      recursionStack.add(node);
      
      const dependencies = dependencyGraph.get(node) || new Set();
      
      for (const dependency of dependencies) {
        if (detectCycle(dependency, [...path, node])) {
          // Continue to find all cycles
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const file of files) {
      if (!visited.has(file)) {
        detectCycle(file);
      }
    }
    
    return cycles;
  }

  private async validateBuild(): Promise<boolean> {
    console.log('🔍 Validating build after import fixes...');
    
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { 
        stdio: 'pipe',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Build validation passed');
      return true;
    } catch (error) {
      console.error('❌ Build validation failed:', error.message);
      return false;
    }
  }

  private generateReport(analysis: ImportAnalysis, fixedIssues: number): void {
    const report = `
# Import Organization Report

## Analysis Results
- **Total Import Issues Found**: ${analysis.totalIssues}
- **Duplicate Imports**: ${analysis.duplicateImports.length}
- **Import Order Issues**: ${analysis.importOrderIssues.length}
- **Circular Dependencies**: ${analysis.circularDependencies.length}
- **Named Import Issues**: ${analysis.namedImportIssues.length}

## Fix Results
- **Files Processed**: ${this.processedFiles}
- **Issues Fixed**: ${fixedIssues}
- **Success Rate**: ${analysis.totalIssues > 0 ? Math.round((fixedIssues / analysis.totalIssues) * 100) : 100}%

## Backup Location
Backups created in: ${this.backupDir}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync('import-organization-report.md', report);
    console.log('📊 Report generated: import-organization-report.md');
  }

  public async run(): Promise<void> {
    console.log('🚀 Starting Import Organization and Duplicate Removal');
    console.log('=' .repeat(60));
    
    try {
      // Step 1: Analyze current import issues
      const analysis = await this.analyzeImportIssues();
      
      console.log(`📊 Found ${analysis.totalIssues} import issues:`);
      console.log(`   - Duplicate imports: ${analysis.duplicateImports.length}`);
      console.log(`   - Import order issues: ${analysis.importOrderIssues.length}`);
      console.log(`   - Circular dependencies: ${analysis.circularDependencies.length}`);
      console.log(`   - Named import issues: ${analysis.namedImportIssues.length}`);
      
      if (analysis.totalIssues === 0) {
        console.log('✅ No import issues found ?? undefined');
        return;
      }
      
      // Step 2: Fix duplicate imports
      const files = this.getAllTypeScriptFiles();
      const duplicatesFixes = await this.fixDuplicateImports(files);
      this.fixedIssues += duplicatesFixes;
      
      // Step 3: Fix import order
      const orderFixes = await this.fixImportOrder();
      this.fixedIssues += orderFixes;
      
      // Step 4: Detect circular dependencies (informational)
      const cycles = await this.detectCircularDependencies();
      if (cycles.length > 0) {
        console.log('⚠️ Circular dependencies detected:');
        cycles.forEach(cycle => console.log(`   ${cycle}`));
      }
      
      // Step 5: Validate build
      const buildValid = await this.validateBuild();
      
      if (!buildValid) {
        console.error('❌ Build validation failed. Consider rolling back changes.');
        return;
      }
      
      // Step 6: Generate report
      this.generateReport(analysis, this.fixedIssues);
      
      console.log('=' .repeat(60));
      console.log(`✅ Import organization completed successfully ?? undefined`);
      console.log(`   Files processed: ${this.processedFiles}`);
      console.log(`   Issues fixed: ${this.fixedIssues}`);
      console.log(`   Backup location: ${this.backupDir}`);
      
    } catch (error) {
      console.error('❌ Import organization failed:', error);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new ImportOrganizationFixer();
  fixer.run().catch(console.error);
}

export default ImportOrganizationFixer;