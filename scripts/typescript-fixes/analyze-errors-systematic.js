#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class TypeScriptErrorAnalyzer {
  constructor(dryRun = true) {
    this.dryRun = dryRun;
    this.analysis = {
      totalErrors: 0,
      errorsByCategory: {},
      errorsByFile: {},
      highImpactFiles: [],
      duplicateIdentifiers: [],
      importExportErrors: [],
      typeErrors: [],
      recommendations: []
    };
  }

  async run() {
    console.log(`🔍 Analyzing TypeScript errors (dry-run: ${this.dryRun})`);
    
    try {
      // Get TypeScript errors
      const errors = await this.getTypeScriptErrors();
      
      // Categorize errors
      await this.categorizeErrors(errors);
      
      // Analyze file impact
      await this.analyzeFileImpact();
      
      // Generate recommendations
      await this.generateRecommendations();
      
      // Display results
      this.displayResults();
      
      // Save analysis if not dry run
      if (!this.dryRun) {
        await this.saveAnalysis();
      }
      
    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      process.exit(1);
    }
  }

  async getTypeScriptErrors() {
    console.log('📊 Running TypeScript compiler to get errors...');
    
    try {
      const result = await execAsync('yarn tsc --noEmit', { 
        cwd: path.resolve(__dirname, '../..'), 
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      // If TypeScript succeeds, check if there are still errors in stdout
      const output = result.stdout || result.stderr || '';
      if (output.includes('error TS')) {
        return this.parseTypeScriptErrors(output);
      }
      
      console.log('✅ No TypeScript errors found!');
      return [];
    } catch (error) {
      // TypeScript errors can be in either stderr or stdout
      const errorOutput = error.stderr || error.stdout || '';
      
      // Check if this is actually a TypeScript compilation with errors
      if (errorOutput.includes('error TS') || errorOutput.includes('Found ')) {
        return this.parseTypeScriptErrors(errorOutput);
      }
      
      // Check if yarn failed but we can still get the TypeScript output
      if (error.message && error.message.includes('Command failed: yarn tsc --noEmit')) {
        // Try to extract the TypeScript output even if yarn failed
        try {
          const directResult = await execAsync('npx tsc --noEmit', { 
            cwd: path.resolve(__dirname, '../..'), 
            maxBuffer: 1024 * 1024 * 10 
          });
          const output = directResult.stdout || directResult.stderr || '';
          if (output.includes('error TS')) {
            return this.parseTypeScriptErrors(output);
          }
          console.log('✅ No TypeScript errors found!');
          return [];
        } catch (directError) {
          const directOutput = directError.stderr || directError.stdout || '';
          if (directOutput.includes('error TS')) {
            return this.parseTypeScriptErrors(directOutput);
          }
        }
      }
      
      // If it's a different kind of error, throw it
      throw new Error(`Failed to get TypeScript errors: ${error.message}`);
    }
  }

  parseTypeScriptErrors(output) {
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      // Parse TypeScript error format: file(line,col): error TS#### message
      // Also handle the case where yarn adds its own prefix
      const cleanLine = line.replace(/^yarn run v[\d.]+\s*/, '').replace(/^\$.*?tsc --noEmit\s*/, '');
      const match = cleanLine.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      
      if (match) {
        const [, filePath, lineNum, colNum, errorCode, message] = match;
        
        // Clean up file path to be relative
        const cleanFilePath = filePath.replace(/^.*?\/WhatToEatNext\//, '');
        
        errors.push({
          file: cleanFilePath,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message: message.trim(),
          category: this.categorizeErrorMessage(message, errorCode),
          severity: this.determineSeverity(errorCode, message)
        });
      }
    }
    
    console.log(`📈 Found ${errors.length} TypeScript errors`);
    return errors;
  }

  categorizeErrorMessage(message, code) {
    // Import/Export errors
    if (message.includes('has no exported member') || 
        message.includes('Cannot find module') ||
        message.includes('Module not found') ||
        message.includes('Relative import paths need explicit file extensions')) {
      return 'import-export';
    }
    
    // Duplicate identifier errors
    if (message.includes('Duplicate identifier') ||
        message.includes('Cannot redeclare') ||
        message.includes('already declared')) {
      return 'duplicate-identifier';
    }
    
    // Type assignment errors
    if (message.includes('is not assignable to') ||
        message.includes('Type \'') ||
        message.includes('Property \'') ||
        message.includes('does not exist on type')) {
      return 'type-assignment';
    }
    
    // Async/Promise errors
    if (message.includes('Promise') ||
        message.includes('await') ||
        message.includes('async')) {
      return 'async-promise';
    }
    
    // Interface/Type definition errors
    if (message.includes('interface') ||
        message.includes('type alias') ||
        message.includes('generic type')) {
      return 'interface-type';
    }
    
    // Component/React errors
    if (message.includes('JSX') ||
        message.includes('React') ||
        message.includes('props') ||
        message.includes('useState') ||
        message.includes('useEffect')) {
      return 'react-component';
    }
    
    return 'other';
  }

  determineSeverity(code, message) {
    // High severity - breaks builds
    const highSeverityCodes = ['TS2307', 'TS2339', 'TS2345', 'TS2322'];
    if (highSeverityCodes.includes(code)) {
      return 'high';
    }
    
    // Medium severity - type safety issues
    const mediumSeverityCodes = ['TS2300', 'TS2304', 'TS2552'];
    if (mediumSeverityCodes.includes(code)) {
      return 'medium';
    }
    
    return 'low';
  }

  async categorizeErrors(errors) {
    console.log('🏷️  Categorizing errors...');
    
    this.analysis.totalErrors = errors.length;
    
    // Group by category
    for (const error of errors) {
      if (!this.analysis.errorsByCategory[error.category]) {
        this.analysis.errorsByCategory[error.category] = [];
      }
      this.analysis.errorsByCategory[error.category].push(error);
      
      // Group by file
      if (!this.analysis.errorsByFile[error.file]) {
        this.analysis.errorsByFile[error.file] = [];
      }
      this.analysis.errorsByFile[error.file].push(error);
      
      // Collect specific error types
      switch (error.category) {
        case 'duplicate-identifier':
          this.analysis.duplicateIdentifiers.push(error);
          break;
        case 'import-export':
          this.analysis.importExportErrors.push(error);
          break;
        case 'type-assignment':
          this.analysis.typeErrors.push(error);
          break;
      }
    }
  }

  async analyzeFileImpact() {
    console.log('📁 Analyzing file impact...');
    
    // Find high-impact files (>50 errors)
    for (const [file, errors] of Object.entries(this.analysis.errorsByFile)) {
      if (errors.length > 50) {
        this.analysis.highImpactFiles.push({
          file,
          errorCount: errors.length,
          categories: [...new Set(errors.map(e => e.category))],
          severity: errors.filter(e => e.severity === 'high').length
        });
      }
    }
    
    // Sort by error count
    this.analysis.highImpactFiles.sort((a, b) => b.errorCount - a.errorCount);
  }

  async generateRecommendations() {
    console.log('💡 Generating fix recommendations...');
    
    const categories = this.analysis.errorsByCategory;
    
    // Import/Export fixes (usually highest impact)
    if (categories['import-export']?.length > 0) {
      this.analysis.recommendations.push({
        priority: 1,
        category: 'import-export',
        errorCount: categories['import-export'].length,
        script: 'fix-import-exports-targeted.js',
        description: 'Fix import/export errors - usually resolves many dependent errors',
        estimatedReduction: categories['import-export'].length * 1.5 // Often fixes cascading errors
      });
    }
    
    // Duplicate identifier fixes
    if (categories['duplicate-identifier']?.length > 0) {
      this.analysis.recommendations.push({
        priority: 2,
        category: 'duplicate-identifier',
        errorCount: categories['duplicate-identifier'].length,
        script: 'fix-duplicate-identifiers-systematic.js',
        description: 'Resolve duplicate type/interface declarations',
        estimatedReduction: categories['duplicate-identifier'].length
      });
    }
    
    // Type assignment fixes
    if (categories['type-assignment']?.length > 0) {
      this.analysis.recommendations.push({
        priority: 3,
        category: 'type-assignment',
        errorCount: categories['type-assignment'].length,
        script: 'fix-type-compatibility-enhanced.js',
        description: 'Fix type compatibility and assignment issues',
        estimatedReduction: categories['type-assignment'].length * 0.8
      });
    }
    
    // High-impact file recommendations
    if (this.analysis.highImpactFiles.length > 0) {
      this.analysis.recommendations.push({
        priority: 4,
        category: 'high-impact-files',
        errorCount: this.analysis.highImpactFiles.reduce((sum, f) => sum + f.errorCount, 0),
        script: 'fix-high-impact-files.js',
        description: 'Focus on files with >50 errors each',
        files: this.analysis.highImpactFiles.slice(0, 10),
        estimatedReduction: this.analysis.highImpactFiles.reduce((sum, f) => sum + f.errorCount, 0) * 0.6
      });
    }
  }

  displayResults() {
    console.log('\n📊 TYPESCRIPT ERROR ANALYSIS RESULTS');
    console.log('=====================================');
    
    console.log(`\n📈 Total Errors: ${this.analysis.totalErrors}`);
    
    console.log('\n🏷️  Errors by Category:');
    for (const [category, errors] of Object.entries(this.analysis.errorsByCategory)) {
      console.log(`  ${category}: ${errors.length} errors`);
    }
    
    console.log('\n🔥 High-Impact Files (>50 errors):');
    this.analysis.highImpactFiles.slice(0, 10).forEach(file => {
      console.log(`  ${file.file}: ${file.errorCount} errors (${file.categories.join(', ')})`);
    });
    
    console.log('\n💡 Recommended Fix Order:');
    this.analysis.recommendations.forEach(rec => {
      console.log(`  ${rec.priority}. ${rec.category}: ${rec.errorCount} errors`);
      console.log(`     Script: ${rec.script}`);
      console.log(`     Expected reduction: ~${Math.round(rec.estimatedReduction)} errors`);
      console.log(`     ${rec.description}\n`);
    });
    
    const totalEstimatedReduction = this.analysis.recommendations
      .reduce((sum, rec) => sum + (rec.estimatedReduction || 0), 0);
    
    console.log(`📉 Estimated total error reduction: ${Math.round(totalEstimatedReduction)} errors`);
    console.log(`📊 Estimated remaining errors: ${this.analysis.totalErrors - Math.round(totalEstimatedReduction)}`);
  }

  async saveAnalysis() {
    const outputPath = path.resolve(__dirname, '../../typescript-error-analysis.json');
    
    const analysisData = {
      timestamp: new Date().toISOString(),
      ...this.analysis,
      summary: {
        totalErrors: this.analysis.totalErrors,
        categoryCounts: Object.fromEntries(
          Object.entries(this.analysis.errorsByCategory).map(([cat, errors]) => [cat, errors.length])
        ),
        highImpactFileCount: this.analysis.highImpactFiles.length,
        recommendationCount: this.analysis.recommendations.length
      }
    };
    
    await fs.writeFile(outputPath, JSON.stringify(analysisData, null, 2));
    console.log(`\n💾 Analysis saved to: ${outputPath}`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (args.includes('--help')) {
  console.log(`
TypeScript Error Analyzer

Usage:
  node analyze-errors-systematic.js [options]

Options:
  --dry-run    Preview analysis without saving (default)
  --execute    Save analysis results to file
  --help       Show this help message

Examples:
  node analyze-errors-systematic.js                    # Dry run
  node analyze-errors-systematic.js --execute          # Save results
`);
  process.exit(0);
}

// Run the analyzer
const analyzer = new TypeScriptErrorAnalyzer(dryRun);
analyzer.run().catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
}); 