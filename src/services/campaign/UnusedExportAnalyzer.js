/**
 * Unused Export Analyzer
 * Perfect Codebase Campaign - Phase 3 Implementation
 *
 * Analyzes unused exports across the codebase and provides prioritization
 * for transformation into enterprise intelligence systems.
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
export var FilePriority;
(function (FilePriority) {
  FilePriority['HIGH'] = 'HIGH';
  FilePriority['MEDIUM'] = 'MEDIUM';
  FilePriority['LOW'] = 'LOW'; // External/test files
})(FilePriority || (FilePriority = {}));
export var FileCategory;
(function (FileCategory) {
  FileCategory['RECIPE'] = 'RECIPE';
  FileCategory['CORE'] = 'CORE';
  FileCategory['EXTERNAL'] = 'EXTERNAL';
  FileCategory['TEST'] = 'TEST';
  FileCategory['UTILITY'] = 'UTILITY';
})(FileCategory || (FileCategory = {}));
export var TransformationComplexity;
(function (TransformationComplexity) {
  TransformationComplexity['SIMPLE'] = 'SIMPLE';
  TransformationComplexity['MODERATE'] = 'MODERATE';
  TransformationComplexity['COMPLEX'] = 'COMPLEX';
  TransformationComplexity['VERY_COMPLEX'] = 'VERY_COMPLEX';
})(TransformationComplexity || (TransformationComplexity = {}));
export class UnusedExportAnalyzer {
  constructor(srcPath = 'src') {
    this.srcPath = srcPath;
    this.excludePatterns = [
      '**/node_modules/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
    ];
    this.priorityPatterns = {
      [FilePriority.HIGH]: [
        '**/data/recipes/**',
        '**/components/recipe/**',
        '**/services/recipe/**',
        '**/utils/recipe/**',
        '**/hooks/recipe/**',
      ],
      [FilePriority.MEDIUM]: [
        '**/components/**',
        '**/services/**',
        '**/utils/**',
        '**/hooks/**',
        '**/contexts/**',
        '**/providers/**',
      ],
      [FilePriority.LOW]: ['**/types/**', '**/constants/**', '**/config/**', '**/lib/**'],
    };
  }
  /**
   * Analyze unused exports across the codebase
   */
  async analyzeUnusedExports() {
    console.log('🔍 Starting unused export analysis...');
    const files = await this.getAllSourceFiles();
    const fileAnalyses = [];
    for (const filePath of files) {
      try {
        const analysis = await this.analyzeFile(filePath);
        if (analysis.unusedExports.length > 0) {
          fileAnalyses.push(analysis);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to analyze ${filePath}:`, error);
      }
    }
    return this.categorizeAndSummarize(fileAnalyses);
  }
  /**
   * Get all source files for analysis
   */
  async getAllSourceFiles() {
    const patterns = [
      `${this.srcPath}/**/*.ts`,
      `${this.srcPath}/**/*.tsx`,
      `${this.srcPath}/**/*.js`,
      `${this.srcPath}/**/*.jsx`,
    ];
    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: this.excludePatterns,
        absolute: true,
      });
      files.push(...matches);
    }
    return [...new Set(files)]; // Remove duplicates
  }
  /**
   * Analyze a single file for unused exports
   */
  async analyzeFile(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const unusedExports = await this.findUnusedExports(filePath, content);
    const priority = this.determinePriority(filePath);
    const category = this.determineCategory(filePath);
    const safetyScore = this.calculateSafetyScore(filePath, content, unusedExports);
    const transformationCandidates = this.identifyTransformationCandidates(unusedExports);
    return {
      filePath,
      priority,
      unusedExports,
      safetyScore,
      transformationCandidates,
      category,
    };
  }
  /**
   * Find unused exports in a file
   */
  async findUnusedExports(filePath, content) {
    const exports = this.extractExports(content);
    const unusedExports = [];
    for (const exportInfo of exports) {
      const usageCount = await this.countUsages(exportInfo.exportName, filePath);
      if (usageCount === 0) {
        unusedExports.push({
          ...exportInfo,
          usageCount,
          complexity: this.calculateComplexity(content, exportInfo),
        });
      }
    }
    return unusedExports;
  }
  /**
   * Extract export information from file content
   */
  extractExports(content) {
    const exports = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Named exports
      const namedExportMatch = line.match(
        /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/,
      );
      if (namedExportMatch) {
        exports.push({
          filePath: '',
          exportName: namedExportMatch[1],
          exportType: this.determineExportType(line),
          lineNumber: index + 1,
          isDefault: false,
        });
      }
      // Default exports
      const defaultExportMatch = line.match(
        /export\s+default\s+(?:(?:const|let|var|function|class)\s+)?(\w+)/,
      );
      if (defaultExportMatch) {
        exports.push({
          filePath: '',
          exportName: defaultExportMatch[1] || 'default',
          exportType: this.determineExportType(line),
          lineNumber: index + 1,
          isDefault: true,
        });
      }
      // Export destructuring
      const destructuringMatch = line.match(/export\s*\{\s*([^}]+)\s*\}/);
      if (destructuringMatch) {
        const exportNames = destructuringMatch[1].split(',').map(name => name.trim());
        exportNames.forEach(name => {
          const cleanName = name.split(' as ')[0].trim();
          exports.push({
            filePath: '',
            exportName: cleanName,
            exportType: 'variable',
            lineNumber: index + 1,
            isDefault: false,
          });
        });
      }
    });
    return exports;
  }
  /**
   * Determine export type from line content
   */
  determineExportType(line) {
    if (line.includes('function')) return 'function';
    if (line.includes('class')) return 'class';
    if (line.includes('interface')) return 'interface';
    if (line.includes('type')) return 'type';
    if (line.includes('const')) return 'const';
    return 'variable';
  }
  /**
   * Count usages of an export across the codebase
   */
  async countUsages(exportName, excludeFilePath) {
    const files = await this.getAllSourceFiles();
    let usageCount = 0;
    for (const filePath of files) {
      if (filePath === excludeFilePath) continue;
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        // Check for import statements
        const importRegex = new RegExp(`import.*\\b${exportName}\\b.*from`, 'g');
        const importMatches = content.match(importRegex) || [];
        usageCount += importMatches.length;
        // Check for direct usage (more complex analysis would be needed for complete accuracy)
        const usageRegex = new RegExp(`\\b${exportName}\\b`, 'g');
        const usageMatches = content.match(usageRegex) || [];
        // Subtract import matches to avoid double counting
        usageCount += Math.max(0, usageMatches.length - importMatches.length);
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
    return usageCount;
  }
  /**
   * Calculate complexity score for an export
   */
  calculateComplexity(content, exportInfo) {
    const lines = content.split('\n');
    const startLine = exportInfo.lineNumber - 1;
    // Simple heuristic: count lines of the export definition
    let complexity = 1;
    let braceCount = 0;
    let inExport = false;
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (!inExport && line.includes('export')) {
        inExport = true;
      }
      if (inExport) {
        complexity++;
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        if (braceCount === 0 && line.includes('}')) {
          break;
        }
        if (line.includes(';') && braceCount === 0) {
          break;
        }
      }
    }
    return Math.min(complexity, 100); // Cap at 100
  }
  /**
   * Determine file priority based on path patterns
   */
  determinePriority(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    for (const [priority, patterns] of Object.entries(this.priorityPatterns)) {
      for (const pattern of patterns) {
        if (this.matchesPattern(relativePath, pattern)) {
          return priority;
        }
      }
    }
    return FilePriority.LOW;
  }
  /**
   * Determine file category
   */
  determineCategory(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    if (relativePath.includes('/recipe')) return FileCategory.RECIPE;
    if (
      relativePath.includes('/test') ||
      relativePath.includes('.test.') ||
      relativePath.includes('.spec.')
    ) {
      return FileCategory.TEST;
    }
    if (
      relativePath.includes('/components') ||
      relativePath.includes('/services') ||
      relativePath.includes('/hooks')
    ) {
      return FileCategory.CORE;
    }
    if (
      relativePath.includes('/types') ||
      relativePath.includes('/constants') ||
      relativePath.includes('/config')
    ) {
      return FileCategory.EXTERNAL;
    }
    return FileCategory.UTILITY;
  }
  /**
   * Calculate safety score for transformation
   */
  calculateSafetyScore(filePath, content, unusedExports) {
    let score = 100; // Start with perfect score
    // Reduce score based on file complexity
    const lines = content.split('\n').length;
    if (lines > 500) score -= 20;
    else if (lines > 200) score -= 10;
    // Reduce score based on number of unused exports
    if (unusedExports.length > 10) score -= 20;
    else if (unusedExports.length > 5) score -= 10;
    // Reduce score for critical files
    if (filePath.includes('/core/') || filePath.includes('/critical/')) {
      score -= 15;
    }
    // Increase score for test files (safer to transform)
    if (filePath.includes('/test/') || filePath.includes('.test.')) {
      score += 10;
    }
    return Math.max(0, Math.min(100, score));
  }
  /**
   * Identify transformation candidates
   */
  identifyTransformationCandidates(unusedExports) {
    return unusedExports.map(exportInfo => {
      const intelligenceSystemName = this.generateIntelligenceSystemName(exportInfo);
      const transformationComplexity = this.assessTransformationComplexity(exportInfo);
      const safetyScore = this.calculateTransformationSafetyScore(exportInfo);
      const estimatedBenefit = this.calculateEstimatedBenefit(exportInfo);
      return {
        export: exportInfo,
        intelligenceSystemName,
        transformationComplexity,
        safetyScore,
        estimatedBenefit,
      };
    });
  }
  /**
   * Generate intelligence system name
   */
  generateIntelligenceSystemName(exportInfo) {
    const baseName = exportInfo.exportName.replace(/([A-Z])/g, '_$1').toUpperCase();
    return `${baseName}_INTELLIGENCE_SYSTEM`;
  }
  /**
   * Assess transformation complexity
   */
  assessTransformationComplexity(exportInfo) {
    if (exportInfo.complexity < 5) return TransformationComplexity.SIMPLE;
    if (exportInfo.complexity < 15) return TransformationComplexity.MODERATE;
    if (exportInfo.complexity < 30) return TransformationComplexity.COMPLEX;
    return TransformationComplexity.VERY_COMPLEX;
  }
  /**
   * Calculate transformation safety score
   */
  calculateTransformationSafetyScore(exportInfo) {
    let score = 90; // Start high for unused exports
    // Reduce for complex exports
    if (exportInfo.complexity > 20) score -= 20;
    else if (exportInfo.complexity > 10) score -= 10;
    // Increase for simple types
    if (exportInfo.exportType === 'interface' || exportInfo.exportType === 'type') {
      score += 10;
    }
    return Math.max(0, Math.min(100, score));
  }
  /**
   * Calculate estimated benefit of transformation
   */
  calculateEstimatedBenefit(exportInfo) {
    let benefit = 50; // Base benefit
    // Higher benefit for functions and classes (more transformable)
    if (exportInfo.exportType === 'function' || exportInfo.exportType === 'class') {
      benefit += 30;
    }
    // Higher benefit for complex exports (more intelligence potential)
    benefit += Math.min(20, exportInfo.complexity);
    return Math.min(100, benefit);
  }
  /**
   * Categorize and summarize analysis results
   */
  categorizeAndSummarize(fileAnalyses) {
    const highPriorityFiles = fileAnalyses.filter(f => f.priority === FilePriority.HIGH);
    const mediumPriorityFiles = fileAnalyses.filter(f => f.priority === FilePriority.MEDIUM);
    const lowPriorityFiles = fileAnalyses.filter(f => f.priority === FilePriority.LOW);
    const totalUnusedExports = fileAnalyses.reduce((sum, f) => sum + f.unusedExports.length, 0);
    const totalTransformationCandidates = fileAnalyses.reduce(
      (sum, f) => sum + f.transformationCandidates.length,
      0,
    );
    const recipeFiles = fileAnalyses.filter(f => f.category === FileCategory.RECIPE).length;
    const coreFiles = fileAnalyses.filter(f => f.category === FileCategory.CORE).length;
    const externalFiles = fileAnalyses.filter(f => f.category === FileCategory.EXTERNAL).length;
    const averageSafetyScore =
      fileAnalyses.reduce((sum, f) => sum + f.safetyScore, 0) / fileAnalyses.length;
    return {
      totalFiles: fileAnalyses.length,
      totalUnusedExports,
      highPriorityFiles,
      mediumPriorityFiles,
      lowPriorityFiles,
      summary: {
        recipeFiles,
        coreFiles,
        externalFiles,
        totalTransformationCandidates,
        averageSafetyScore,
        estimatedIntelligenceSystems: totalTransformationCandidates,
      },
    };
  }
  /**
   * Check if path matches pattern
   */
  matchesPattern(filePath, pattern) {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  }
  /**
   * Generate detailed report
   */
  generateReport(analysis) {
    const report = [
      '# Unused Export Analysis Report',
      '',
      '## Summary',
      `- Total files analyzed: ${analysis.totalFiles}`,
      `- Total unused exports: ${analysis.totalUnusedExports}`,
      `- Recipe files: ${analysis.summary.recipeFiles}`,
      `- Core files: ${analysis.summary.coreFiles}`,
      `- External files: ${analysis.summary.externalFiles}`,
      `- Transformation candidates: ${analysis.summary.totalTransformationCandidates}`,
      `- Average safety score: ${analysis.summary.averageSafetyScore.toFixed(1)}`,
      '',
      '## Priority Breakdown',
      `- High priority files: ${analysis.highPriorityFiles.length}`,
      `- Medium priority files: ${analysis.mediumPriorityFiles.length}`,
      `- Low priority files: ${analysis.lowPriorityFiles.length}`,
      '',
      '## Top Transformation Candidates',
      '',
    ];
    // Add top candidates from each priority level
    const topCandidates = [
      ...analysis.highPriorityFiles.slice(0, 5),
      ...analysis.mediumPriorityFiles.slice(0, 5),
      ...analysis.lowPriorityFiles.slice(0, 5),
    ];
    topCandidates.forEach(file => {
      report.push(`### ${file.filePath}`);
      report.push(`- Priority: ${file.priority}`);
      report.push(`- Safety Score: ${file.safetyScore}`);
      report.push(`- Unused Exports: ${file.unusedExports.length}`);
      report.push(`- Transformation Candidates: ${file.transformationCandidates.length}`);
      report.push('');
    });
    return report.join('\n');
  }
}
