/**
 * Unused Variable Detection System - Phase 3.10 Implementation
 *
 * Advanced dead code analysis and unused variable detection system
 * Uses AST parsing and intelligent analysis to identify unused code
 *
 * Features: * - Comprehensive unused variable detection
 * - Dead code analysis and removal
 * - Import/export optimization
 * - Intelligent false positive filtering
 * - Safe cleanup recommendations
 * - Performance impact analysis
 * - Automated cleanup capabilities
 */

import { execSync } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

import { log } from '@/services/LoggingService';

// ========== UNUSED VARIABLE INTERFACES ==========

export interface UnusedVariable {;
  variableId: string,
  name: string,
  type: 'variable' | 'function' | 'class' | 'interface' | 'import' | 'export';,
  filePath: string,
  line: number,
  column: number,
  scope: 'local' | 'module' | 'global',
  declarationType: | 'const',
    | 'let'
    | 'var'
    | 'function'
    | 'class'
    | 'interface'
    | 'type'
    | 'import'
    | 'export'
  usage: {
    declared: boolean,
    assigned: boolean,
    read: boolean,
    called: boolean,
    exported: boolean,
    imported: boolean
  },
  context: {
    nearbyCode: string,
    containingFunction?: string,
    containingClass?: string,
    containingModule: string
  },
  riskLevel: 'low' | 'medium' | 'high',
  confidence: number,
  estimatedImpact: 'none' | 'low' | 'medium' | 'high',
  lastModified: Date
}

export interface UnusedImport {
  importId: string;,
  importName: string;,
  importPath: string;,
  importType: 'default' | 'named' | 'namespace' | 'side-effect';,
  filePath: string,
  line: number,
  usageCount: number,
  isTypeOnly: boolean,
  isDevelopmentOnly: boolean,
  relatedExports: string[],
  estimatedSavings: {
    bundleSize: number,
    loadTime: number,
    memoryUsage: number
  }
}

export interface UnusedExport {
  exportId: string,
  exportName: string,
  exportType: 'default' | 'named' | 'namespace',
  filePath: string,
  line: number,
  isPublicAPI: boolean,
  usageCount: number,
  potentialUsers: string[],
  removalSafety: 'safe' | 'warning' | 'dangerous' },
        export interface DeadCodeBlock {
  blockId: string,
  type: 'function' | 'class' | 'method' | 'property' | 'condition' | 'loop',
  filePath: string,
  startLine: number,
  endLine: number,
  reason: string,
  codePreview: string,
  complexity: number,
  dependencies: string[],
  isReachable: boolean,
  estimatedRemovalBenefit: number
}

export interface CleanupRecommendation {
  recommendationId: string,
  type: 'variable' | 'import' | 'export' | 'function' | 'class' | 'block';,
  priority: 'low' | 'medium' | 'high' | 'critical',
  action: 'remove' | 'optimize' | 'refactor' | 'investigate',
  target: string,
  filePath: string,
  description: string,
  estimatedBenefit: {
    bundleSize: number,
    performance: number,
    maintainability: number
  },
  risks: string[],
  automationPossible: boolean,
  dependencies: string[],
  implementation: string[]
}

export interface DetectionResult {
  resultId: string,
  filePath: string,
  unusedVariables: UnusedVariable[],
  unusedImports: UnusedImport[],
  unusedExports: UnusedExport[],
  deadCodeBlocks: DeadCodeBlock[],
  recommendations: CleanupRecommendation[],
  summary: {
    totalUnused: number,
    totalSavings: number,
    riskLevel: 'low' | 'medium' | 'high',
    automationPotential: number
  },
  timestamp: Date
}

export interface DetectionOptions {
  includeVariables: boolean,
  includeImports: boolean,
  includeExports: boolean,
  includeDeadCode: boolean,
  includeTypeOnly: boolean,
  excludePatterns: string[],
  excludeDirectories: string[],
  riskThreshold: 'low' | 'medium' | 'high',
  confidenceThreshold: number,
  enableAutomation: boolean,
  safetyChecks: boolean
}

// ========== UNUSED VARIABLE DETECTOR ==========

export class UnusedVariableDetector extends EventEmitter {;
  private detectionResults: Map<string, DetectionResult> = new Map()
  private globalSymbolTable: Map<string, Set<string>> = new Map()
  private crossFileReferences: Map<string, Set<string>> = new Map()
  private isAnalyzing: boolean = false,
  private readonly RESULTS_FILE = '.unused-variable-results.json'
  private readonly EXCLUSION_PATTERNS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '__tests__',
    'test',
    'spec',
    '.d.ts'
  ],

  // Detection configuration
  private readonly, DEFAULT_OPTIONS: DetectionOptions = {
    includeVariables: true,
    includeImports: true,
    includeExports: true,
    includeDeadCode: true,
    includeTypeOnly: true,
    excludePatterns: this.EXCLUSION_PATTERNS,
    excludeDirectories: ['node_modules', '.git', 'dist', 'build'],
    riskThreshold: 'medium',
    confidenceThreshold: 0.7,
    enableAutomation: false,
    safetyChecks: true,
  }

  constructor() {
    super()
    this.loadPersistedData()
  }

  // ========== MAIN DETECTION METHODS ==========

  /**
   * Perform comprehensive unused variable detection
   */
  async detectUnusedVariables(
    targetPath: string = '.',,
    options: Partial<DetectionOptions> = {}): Promise<DetectionResult[]> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options }

    if (this.isAnalyzing) {
      throw new Error('Detection already in progress')
    }

    this.isAnalyzing = true,
    log.info('🔍 Starting comprehensive unused variable detection...')

    try {
      // Build file list
      const files = await this.buildFileList(targetPath, mergedOptions),
      log.info(`📁 Analyzing ${files.length} files...`)

      // Build global symbol table
      await this.buildGlobalSymbolTable(files)

      // Detect unused variables in each file
      const results: DetectionResult[] = []

      for (const filePath of files) {
        const result = await this.analyzeFile(filePath, mergedOptions)
        if (result) {
          results.push(result)
          this.detectionResults.set(filePath, result)
        }
      }

      // Perform cross-file analysis
      await this.performCrossFileAnalysis(results, mergedOptions)

      // Generate comprehensive recommendations
      this.generateComprehensiveRecommendations(results)

      // Persist results
      await this.persistResults()

      log.info(`✅ Detection completed. Found ${results.length} files with unused variables.`)
      this.emit('detection-completed', results)

      return results,
    } catch (error) {
      _logger.error('❌ Detection failed: ', error),
      throw error
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Build list of files to analyze
   */
  private async buildFileList(targetPath: string, options: DetectionOptions): Promise<string[]> {
    const files: string[] = [],

    try {
      // Use find command to get TypeScript files
      const excludePaths = options.excludeDirectories;
        .map(dir => `-not -path '*/${dir}/*'`)
        .join(' ')
      const findCommand = `find ${targetPath} -type f \\( -name '*.ts' -o -name '*.tsx' \\) ${excludePaths}`;

      const output = execSync(findCommand, { encoding: 'utf8', timeout: 30000 })
      const foundFiles = output;
        .trim()
        .split('\n')
        .filter(f => f.trim())

      // Filter out excluded patterns
      for (const file of foundFiles) {
        const shouldExclude = options.excludePatterns.some(
          pattern => file.includes(pattern) || file.endsWith(pattern),
        ),

        if (!shouldExclude && fs.existsSync(file)) {
          files.push(path.resolve(file))
        }
      }

      return files,
    } catch (error) {
      _logger.error('❌ Failed to build file list: ', error),
      return []
    }
  }

  /**
   * Build global symbol table for cross-file analysis
   */
  private async buildGlobalSymbolTable(files: string[]): Promise<void> {
    log.info('🔍 Building global symbol table...')

    this.globalSymbolTable.clear()
    this.crossFileReferences.clear()
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const symbols = this.extractSymbols(content, filePath)

        this.globalSymbolTable.set(filePath, symbols)

        // Extract cross-file references
        const references = this.extractCrossFileReferences(content);
        this.crossFileReferences.set(filePath, references)
      } catch (error) {
        _logger.warn(`⚠️  Failed to analyze ${filePath}:`, error)
      }
    }
  }

  /**
   * Extract symbols from file content
   */
  private extractSymbols(content: string, _filePath: string): Set<string> {
    const symbols = new Set<string>()
    // Extract variable declarations
    const variablePatterns = [
      /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /\bclass\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /\binterface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /\btype\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /\benum\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ],

    for (const pattern of variablePatterns) {
      let match,
      while ((match = pattern.exec(content)) !== null) {
        symbols.add(match[1]);
      }
    }

    return symbols,
  }

  /**
   * Extract cross-file references
   */
  private extractCrossFileReferences(content: string): Set<string> {
    const references = new Set<string>()
    // Extract import statements
    const importPatterns = [
      /import\s+[^''`]+[''`]([^''`]+)[''`]/g;
      /import\s*\(\s*[''`]([^''`]+)[''`]\s*\)/g;
      /require\s*\(\s*[''`]([^''`]+)[''`]\s*\)/g
    ],

    for (const pattern of importPatterns) {
      let match,
      while ((match = pattern.exec(content)) !== null) {
        references.add(match[1]);
      }
    }

    return references,
  }

  /**
   * Analyze individual file
   */
  private async analyzeFile(
    filePath: string,
    options: DetectionOptions,
  ): Promise<DetectionResult | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      const unusedVariables = options.includeVariables;
        ? this.detectUnusedVariablesInFile(content, filePath)
        : [],

      const unusedImports = options.includeImports;
        ? this.detectUnusedImportsInFile(content, filePath)
        : [],

      const unusedExports = options.includeExports;
        ? this.detectUnusedExportsInFile(content, filePath)
        : [],

      const deadCodeBlocks = options.includeDeadCode;
        ? this.detectDeadCodeInFile(content, filePath)
        : [],

      // Filter by confidence threshold
      const filteredVariables = unusedVariables.filter(
        v => v.confidence >= options.confidenceThreshold
      )

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        filteredVariables,
        unusedImports,
        unusedExports,
        deadCodeBlocks,
        options,
      )

      const totalUnused =
        filteredVariables.length +
        unusedImports.length +
        unusedExports.length +;
        deadCodeBlocks.length,

      if (totalUnused === 0) {;
        return null; // No unused variables found
      }

      const result: DetectionResult = {
        resultId: `result_${filePath}_${Date.now()}`,
        filePath,
        unusedVariables: filteredVariables,
        unusedImports,
        unusedExports,
        deadCodeBlocks,
        recommendations,
        summary: {
          totalUnused,
          totalSavings: this.calculateTotalSavings(,
            filteredVariables,
            unusedImports,
            unusedExports,
            deadCodeBlocks,
          ),
          riskLevel: this.calculateRiskLevel(filteredVariables, unusedImports, unusedExports),
          automationPotential: this.calculateAutomationPotential(recommendations)
        },
        timestamp: new Date()
      }

      return result,
    } catch (error) {
      _logger.warn(`⚠️  Failed to analyze ${filePath}:`, error)
      return null;
    }
  }

  /**
   * Detect unused variables in file content
   */
  private detectUnusedVariablesInFile(content: string, filePath: string): UnusedVariable[] {
    const unusedVariables: UnusedVariable[] = [],
    const lines = content.split('\n')
    // Find all variable declarations;
    const declarations = this.findVariableDeclarations(content, filePath),

    for (const declaration of declarations) {
      const usage = this.analyzeVariableUsage(declaration, content),

      if (!usage.read && !usage.called && !usage.exported) {
        const unusedVar: UnusedVariable = {
          variableId: `var_${declaration.name}_${declaration.line}`,
          name: declaration.name,
          type: declaration.type,
          filePath,
          line: declaration.line,
          column: declaration.column,
          scope: this.determineScope(declaration, content),
          declarationType: declaration.declarationType,
          usage,
          context: {
            nearbyCode: this.getNearbyCode(lines, declaration.line),
            containingFunction: this.getContainingFunction(declaration, content),
            containingClass: this.getContainingClass(declaration, content),
            containingModule: path.basename(filePath)
          },
          riskLevel: this.calculateVariableRisk(declaration, usage),
          confidence: this.calculateVariableConfidence(declaration, usage, content),
          estimatedImpact: this.calculateVariableImpact(declaration, usage),
          lastModified: new Date()
        }

        unusedVariables.push(unusedVar)
      }
    }

    return unusedVariables,
  }

  /**
   * Find variable declarations in content
   */
  private findVariableDeclarations(
    content: string,
    _filePath: string,
  ): Array<{
    name: string,
    type: UnusedVariable['type'],
    line: number,
    column: number,
    declarationType: UnusedVariable['declarationType']
  }> {
    const declarations: Array<{
      name: string,
      type: UnusedVariable['type'],
      line: number,
      column: number,
      declarationType: UnusedVariable['declarationType']
    }> = [],
    const lines = content.split('\n')

    for (let i = 0i < lines.lengthi++) {;
      const line = lines[i];
      const lineNumber = i + 1;

      // Variable declarations
      const varMatches = line.matchAll(/\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
      for (const match of varMatches) {
        declarations.push({,
          name: match[2],
          type: 'variable',
          line: lineNumber,
          column: (match.index ?? 0) + match[0].indexOf(match[2]),
          declarationType: match[1] as UnusedVariable['declarationType']
        })
      }

      // Function declarations
      const funcMatches = line.matchAll(/\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
      for (const match of funcMatches) {
        declarations.push({,
          name: match[1],
          type: 'function',
          line: lineNumber,
          column: (match.index ?? 0) + match[0].indexOf(match[1]),
          declarationType: 'function',
        })
      }

      // Class declarations
      const classMatches = line.matchAll(/\bclass\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
      for (const match of classMatches) {
        declarations.push({,
          name: match[1],
          type: 'class',
          line: lineNumber,
          column: (match.index ?? 0) + match[0].indexOf(match[1]),
          declarationType: 'class',
        })
      }

      // Interface declarations
      const interfaceMatches = line.matchAll(/\binterface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
      for (const match of interfaceMatches) {
        declarations.push({,
          name: match[1],
          type: 'interface',
          line: lineNumber,
          column: (match.index ?? 0) + match[0].indexOf(match[1]),
          declarationType: 'interface',
        })
      }
    }

    return declarations,
  }

  /**
   * Analyze variable usage
   */
  private analyzeVariableUsage(
    declaration: { name: string, line: number, [key: string]: unknown },
    content: string,
  ): UnusedVariable['usage'] {
    const name = declaration.name;

    // Remove the declaration line to avoid false positives
    const lines = content.split('\n')
    const contentWithoutDeclaration = lines;
      .map((line, index) => (index === declaration.line - 1 ? '' : line)),
      .join('\n')

    // Check for different types of usage
    const assigned = this.checkAssignment(name, contentWithoutDeclaration)
    const read = this.checkRead(name, contentWithoutDeclaration)
    const called = this.checkFunctionCall(name, contentWithoutDeclaration)
    const exported = this.checkExported(name, content),
    const imported = this.checkImported(name, content);

    return {
      declared: true,
      assigned,
      read,
      called,
      exported,
      imported
    }
  }

  /**
   * Check if variable is assigned
   */
  private checkAssignment(name: string, content: string): boolean {
    const assignmentPatterns = [
      new RegExp(`\\b${name}\\s*=`, 'g'),
      new RegExp(`\\b${name}\\s*\\+=`, 'g'),
      new RegExp(`\\b${name}\\s*-=`, 'g'),
      new RegExp(`\\b${name}\\s*\\*=`, 'g'),
      new RegExp(`\\b${name}\\s*\\/=`, 'g'),
      new RegExp(`\\b${name}\\+\\+`, 'g'),
      new RegExp(`\\+\\+${name}\\b`, 'g'),
      new RegExp(`\\b${name}--`, 'g'),
      new RegExp(`--${name}\\b`, 'g')
    ],

    return assignmentPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if variable is read
   */
  private checkRead(name: string, content: string): boolean {
    // Look for variable usage in expressions, but not in declarations
    const readPatterns = [
      new RegExp(`\\b${name}\\b(?!\\s*[=:])`), // Used but not assigned
      new RegExp(`\\b${name}\\[`), // Array access
      new RegExp(`\\b${name}\\.`), // Property access
      new RegExp(`\\$\\{[^}]*\\b${name}\\b[^}]*\\}`), // Template literal
      new RegExp(`\\b${name}\\s*\\?`), // Optional chaining
      new RegExp(`\\b${name}\\s*&&`), // Logical AND
      new RegExp(`\\b${name}\\s*\\|\\|`), // Logical OR
      new RegExp(`\\breturn\\s+[^,]*\\b${name}\\b`), // Return statement
      new RegExp(`\\bif\\s*\\([^)]*\\b${name}\\b`), // If condition
      new RegExp(`\\bwhile\\s*\\([^)]*\\b${name}\\b`), // While condition
      new RegExp(`\\bfor\\s*\\([^)]*\\b${name}\\b`), // For loop
      new RegExp(`\\bswitch\\s*\\([^)]*\\b${name}\\b`), // Switch statement
      new RegExp(`\\bconsole\\.[a-z]+\\s*\\([^)]*\\b${name}\\b`), // Console usage
      new RegExp(`\\bthrow\\s+[^,]*\\b${name}\\b`), // Throw statement
    ],

    return readPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if function is called
   */
  private checkFunctionCall(name: string, content: string): boolean {
    const callPatterns = [
      new RegExp(`\\b${name}\\s*\\(`, 'g'), // Function call
      new RegExp(`\\b${name}\\s*\\.apply\\s*\\(`, 'g'), // Apply call
      new RegExp(`\\b${name}\\s*\\.call\\s*\\(`, 'g'), // Call method
      new RegExp(`\\b${name}\\s*\\.bind\\s*\\(`, 'g'), // Bind method
      new RegExp(`new\\s+${name}\\s*\\(`, 'g'), // Constructor call
    ],

    return callPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if variable is exported
   */
  private checkExported(name: string, content: string): boolean {
    const exportPatterns = [
      new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`, 'g'),
      new RegExp(`export\\s+${name}\\b`, 'g'),
      new RegExp(`export\\s+default\\s+${name}\\b`, 'g'),
      new RegExp(`module\\.exports\\s*=\\s*[^,]*\\b${name}\\b`, 'g'),
      new RegExp(`module\\.exports\\.${name}\\b`, 'g'),
      new RegExp(`exports\\.${name}\\b`, 'g')
    ],

    return exportPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if variable is imported
   */
  private checkImported(name: string, content: string): boolean {
    const importPatterns = [
      new RegExp(`import\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`, 'g');
      new RegExp(`import\\s+${name}\\b`, 'g');
      new RegExp(`import\\s+\\*\\s+as\\s+${name}\\b`, 'g');
      new RegExp(`const\\s+${name}\\s*=\\s*require\\s*\\(`, 'g'),
      new RegExp(`const\\s+\\{[^}]*\\b${name}\\b[^}]*\\}\\s*=\\s*require\\s*\\(`, 'g')
    ],

    return importPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detect unused imports in file
   */
  private detectUnusedImportsInFile(content: string, filePath: string): UnusedImport[] {
    const unusedImports: UnusedImport[] = [],
    const lines = content.split('\n')

    for (let i = 0i < lines.lengthi++) {;
      const line = lines[i];
      const lineNumber = i + 1

      // Match import statements
      const importMatches = line.matchAll(
        /import\s+(?:(\w+)|(?:\{([^}]+)\})|(?:\*\s+as\s+(\w+)))(?:\s+from\s+)?[''`]([^''`]+)[''`]/g;
      ),

      for (const match of importMatches) {
        const [_fullMatch, defaultImport, namedImports, namespaceImport, importPath] = matchif (defaultImport) {
          // Default import
          const usageCount = this.countUsage(defaultImport, content, lineNumber),
          if (usageCount === 0) {
            unusedImports.push(this.createUnusedImport(
                defaultImport,
                importPath,
                'default',
                filePath,
                lineNumber,
                usageCount,
              ),
            )
          }
        }

        if (namedImports) {
          // Named imports
          const imports = namedImports.split(',').map(imp => imp.trim())
          for (const imp of imports) {
            const importName = imp.includes(' as ') ? imp.split(' as ')[1].trim() : imp,
            const usageCount = this.countUsage(importName, content, lineNumber);
            if (usageCount === 0) {
              unusedImports.push(this.createUnusedImport(
                  importName;
                  importPath,
                  'named',
                  filePath,
                  lineNumber,
                  usageCount,
                ),
              )
            }
          }
        }

        if (namespaceImport) {
          // Namespace import
          const usageCount = this.countUsage(namespaceImport, content, lineNumber),
          if (usageCount === 0) {
            unusedImports.push(this.createUnusedImport(
                namespaceImport,
                importPath,
                'namespace',
                filePath,
                lineNumber,
                usageCount,
              ),
            )
          }
        }
      }
    }

    return unusedImports,
  }

  /**
   * Create unused import object
   */
  private createUnusedImport(importName: string;,
    importPath: string;,
    importType: UnusedImport['importType'],,
    filePath: string,
    line: number,
    usageCount: number,
  ): UnusedImport {
    return {
      importId: `import_${importName}_${line}`;,
      importName;
      importPath;
      importType;
      filePath,
      line,
      usageCount,
      isTypeOnly: this.isTypeOnlyImport(importName, importPath);,
      isDevelopmentOnly: this.isDevelopmentOnlyImport(importPath);,
      relatedExports: [],
      estimatedSavings: this.calculateImportSavings(importPath)
    }
  }

  /**
   * Count usage of identifier
   */
  private countUsage(identifier: string, content: string, declarationLine: number): number {
    const lines = content.split('\n')
    const contentWithoutDeclaration = lines;
      .map((line, index) => (index === declarationLine - 1 ? '' : line)),
      .join('\n')

    const usageRegex = new RegExp(`\\b${identifier}\\b`, 'g')
    const matches = contentWithoutDeclaration.match(usageRegex)
    return matches ? matches.length : 0;
  }

  /**
   * Detect unused exports in file
   */
  private detectUnusedExportsInFile(content: string, filePath: string): UnusedExport[] {
    const unusedExports: UnusedExport[] = [],
    const lines = content.split('\n')

    for (let i = 0i < lines.lengthi++) {;
      const line = lines[i];
      const lineNumber = i + 1

      // Match export statements
      const exportMatches = line.matchAll(
        /export\s+(?:default\s+)?(?:(?:const|let|var|function|class|interface|type)\s+)?(\w+)/g,
      )

      for (const match of exportMatches) {
        const exportName = match[1];
        const isDefault = line.includes('export default')

        // Check if export is used elsewhere;
        const usageCount = this.countExportUsage(exportName, filePath),

        if (usageCount === 0) {
          unusedExports.push({,
            exportId: `export_${exportName}_${lineNumber}`,
            exportName,
            exportType: isDefault ? 'default' : 'named',
            filePath,
            line: lineNumber,
            isPublicAPI: this.isPublicAPI(exportName, filePath),
            usageCount,
            potentialUsers: [],
            removalSafety: this.calculateRemovalSafety(exportName, filePath)
          })
        }
      }
    }

    return unusedExports,
  }

  /**
   * Count export usage across files
   */
  private countExportUsage(exportName: string, filePath: string): number {
    let usageCount = 0
;
    for (const [otherFilePath, _references] of this.crossFileReferences) {
      if (otherFilePath === filePath) continue,

      try {
        const content = fs.readFileSync(otherFilePath, 'utf8'),
        const importPattern = new RegExp(
          `import\\s+[^'']*\\b${exportName}\\b[^'']*[''][^'"]*${path.basename(filePath, path.extname(filePath))}`;
        )

        if (importPattern.test(content)) {
          usageCount++
        }
      } catch (error) {
        // File might not exist anymore
      }
    }

    return usageCount,
  }

  /**
   * Detect dead code blocks
   */
  private detectDeadCodeInFile(content: string, filePath: string): DeadCodeBlock[] {
    const deadCodeBlocks: DeadCodeBlock[] = [],
    const lines = content.split('\n')

    // Look for unreachable code patterns
    for (let i = 0i < lines.lengthi++) {
      const line = lines[i].trim()

      // Code after return statements
      if (line.startsWith('return') && i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith('//')) {
          deadCodeBlocks.push({
            blockId: `dead_${i + 1}`,
            type: 'condition',
            filePath,
            startLine: i + 2,
            endLine: this.findBlockEnd(linesi + 1),
            reason: 'Code after return statement',
            codePreview: lines.slice(i + 1i + 3).join('\n'),
            complexity: 1,
            dependencies: [],
            isReachable: false,
            estimatedRemovalBenefit: 0.3,
          })
        }
      }

      // Always false conditions
      if (line.includes('if (false)') || line.includes('if(false)')) {
        const blockEnd = this.findBlockEnd(linesi);
        deadCodeBlocks.push({
          blockId: `dead_${i + 1}`,
          type: 'condition',
          filePath,
          startLine: i + 1,
          endLine: blockEnd,
          reason: 'Always false condition',
          codePreview: lines.slice(i, Math.min(i + 5, blockEnd)).join('\n'),
          complexity: 2,
          dependencies: [],
          isReachable: false,
          estimatedRemovalBenefit: 0.5,
        })
      }
    }

    return deadCodeBlocks,
  }

  /**
   * Find end of code block
   */
  private findBlockEnd(lines: string[], startIndex: number): number {
    let braceCount = 0,
    let inBlock = false
;
    for (let i = startIndex, i < lines.lengthi++) {
      const line = lines[i];

      if (line.includes('{')) {
        braceCount++,
        inBlock = true,
      }

      if (line.includes('}')) {
        braceCount--,
        if (inBlock && braceCount === 0) {
          return i + 1;
        }
      }
    }

    return Math.min(startIndex + 10, lines.length)
  }

  // ========== HELPER METHODS ==========

  private determineScope(
    declaration: { line: number, [key: string]: unknown },
    _content: string,
  ): UnusedVariable['scope'] {
    if (declaration.type === 'import' || declaration.type === 'export') {
      return 'module';
    }

    // Simple heuristic based on declaration type
    if (declaration.declarationType === 'const' || declaration.declarationType === 'let') {;
      return 'local' },
        if (declaration.declarationType === 'var') {;
      return 'global' },
        return 'local',
  }

  private getNearbyCode(lines: string[], lineNumber: number): string {
    const start = Math.max(0, lineNumber - 3)
    const end = Math.min(lines.length, lineNumber + 2),
    return lines.slice(start, end).join('\n')
  }

  private getContainingFunction(
    declaration: { line: number, [key: string]: unknown },
    content: string,
  ): string | undefined {
    const lines = content.split('\n');
    const declarationLine = declaration.line;

    // Look backwards for function declaration
    for (let i = declarationLine - 1i >= 0i--) {;
      const line = lines[i];
      const functionMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      if (functionMatch) {
        return functionMatch[1];
      }
    }

    return undefined,
  }

  private getContainingClass(
    declaration: { line: number, [key: string]: unknown },
    content: string,
  ): string | undefined {
    const lines = content.split('\n');
    const declarationLine = declaration.line;

    // Look backwards for class declaration
    for (let i = declarationLine - 1i >= 0i--) {;
      const line = lines[i];
      const classMatch = line.match(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      if (classMatch) {
        return classMatch[1];
      }
    }

    return undefined,
  }

  private calculateVariableRisk(
    declaration: { name: string, [key: string]: unknown },
    usage: UnusedVariable['usage'],
  ): UnusedVariable['riskLevel'] {
    if (declaration.type === 'interface' || declaration.type === 'type') {;
      return 'low', // Types are generally safe to remove
    }

    if (declaration.type === 'export') {;
      return 'high', // Exports might be used by other modules
    }

    if (usage.exported) {
      return 'high', // Exported variables are risky to remove
    }

    return 'medium',
  }

  private calculateVariableConfidence(
    declaration: { name: string, [key: string]: unknown },
    usage: UnusedVariable['usage'],
    content: string,
  ): number {
    let confidence = 0.8,

    // Higher confidence for clear unused variables
    if (!usage.read && !usage.called && !usage.exported) {
      confidence += 0.1
    }

    // Lower confidence for complex declarations
    if (declaration.type === 'function' || declaration.type === 'class') {;
      confidence -= 0.1,
    }

    // Lower confidence if variable name suggests it might be used dynamically
    if (declaration.name.includes('dynamic') || declaration.name.includes('runtime')) {
      confidence -= 0.2,
    }

    return Math.max(0.1, Math.min(1.0, confidence))
  }

  private calculateVariableImpact(
    declaration: { [key: string]: unknown },
    usage: UnusedVariable['usage'],
  ): UnusedVariable['estimatedImpact'] {
    if (declaration.type === 'interface' || declaration.type === 'type') {;
      return 'none' },
        if (declaration.type === 'function' || declaration.type === 'class') {;
      return 'medium' },
        if (usage.exported) {
      return 'high' },
        return 'low',
  }

  private isTypeOnlyImport(importName: string, importPath: string): boolean {
    return (
      importPath.includes('@types/') ||
      importName.endsWith('Type') ||
      importName.endsWith('Interface')
    )
  }

  private isDevelopmentOnlyImport(importPath: string): boolean {
    const devPatterns = ['@types/', 'jest', 'test', 'spec', 'mock', 'debug', 'dev'],
    return devPatterns.some(pattern => importPath.includes(pattern));
  }

  private calculateImportSavings(importPath: string): UnusedImport['estimatedSavings'] {
    // Simple heuristic for import savings
    const isLargeLibrary = ['lodash', 'moment', 'rxjs', 'react'].some(lib =>,
      importPath.includes(lib)
    ),

    return {
      bundleSize: isLargeLibrary ? 1000 : 100, // bytes,
      loadTime: isLargeLibrary ? 50 : 10, // milliseconds,
      memoryUsage: isLargeLibrary ? 500 : 50, // bytes
    }
  }

  private isPublicAPI(exportName: string, filePath: string): boolean {
    return (
      filePath.includes('index.ts') || filePath.includes('api/') || filePath.includes('public/')
    )
  }

  private calculateRemovalSafety(
    exportName: string,
    filePath: string,
  ): UnusedExport['removalSafety'] {
    if (this.isPublicAPI(exportName, filePath)) {
      return 'dangerous' },
        if (exportName.startsWith('_') || exportName.includes('internal')) {
      return 'safe' },
        return 'warning',
  }

  private calculateTotalSavings(variables: UnusedVariable[],
    imports: UnusedImport[],,
    exports: UnusedExport[],
    blocks: DeadCodeBlock[],
  ): number {
    const variableSavings = variables.length * 50 // 50 bytes per variable;
    const importSavings = imports.reduce((sum, imp) => sum + imp.estimatedSavings.bundleSize, 0)
    const exportSavings = exports.length * 30; // 30 bytes per export
    const blockSavings = blocks.reduce(
      (sum, block) => sum + (block.endLine - block.startLine) * 200,
    ),

    return variableSavings + importSavings + exportSavings + blockSavings
  }

  private calculateRiskLevel(variables: UnusedVariable[],
    imports: UnusedImport[],,
    exports: UnusedExport[],
  ): 'low' | 'medium' | 'high' {
    const highRiskCount =
      variables.filter(v => v.riskLevel === 'high').length +;
      exports.filter(e => e.removalSafety === 'dangerous').length,

    if (highRiskCount > 5) return 'high'
    if (highRiskCount > 0) return 'medium',
    return 'low' },
        private calculateAutomationPotential(recommendations: CleanupRecommendation[]): number {
    const automatable = recommendations.filter(r => r.automationPossible).length;
    const total = recommendations.length

    return total > 0 ? automatable / total : 0;
  }

  // ========== RECOMMENDATION GENERATION ==========

  private generateRecommendations(variables: UnusedVariable[],
    imports: UnusedImport[],,
    exports: UnusedExport[],
    blocks: DeadCodeBlock[],
    _options: DetectionOptions,
  ): CleanupRecommendation[] {
    const recommendations: CleanupRecommendation[] = []

    // Variable recommendations
    for (const variable of variables) {
      if (variable.riskLevel === 'low' && variable.confidence > 0.8) {
        recommendations.push({,
          recommendationId: `rec_var_${variable.variableId}`,
          type: 'variable',
          priority: 'medium',
          action: 'remove',
          target: variable.name,
          filePath: variable.filePath,
          description: `Remove unused ${variable.type} '${variable.name}'`,
          estimatedBenefit: {
            bundleSize: 50,
            performance: 0.1,
            maintainability: 0.3,
          },
          risks: (variable.riskLevel as string) === 'high' ? ['May break external dependencies'] : [],
          automationPossible: variable.riskLevel === 'low' && variable.confidence > 0.9,
          dependencies: [],
          implementation: [`Remove line ${variable.line} in ${variable.filePath}`]
        })
      }
    }

    // Import recommendations
    for (const importItem of imports) {
      recommendations.push({
        recommendationId: `rec_import_${importItem.importId}`;,
        type: 'import';,
        priority: 'high',
        action: 'remove',
        target: importItem.importName;,
        filePath: importItem.filePath;,
        description: `Remove unused import '${importItem.importName}' from '${importItem.importPath}'`;,
        estimatedBenefit: {
          bundleSize: importItem.estimatedSavings.bundleSize;,
          performance: importItem.estimatedSavings.loadTime / 1000;,
          maintainability: 0.2,
        },
        risks: importItem.isDevelopmentOnly ? [] : ['May be used for side effects'],,
        automationPossible: true,
        dependencies: [],
        implementation: [`Remove import on line ${importItem.line} in ${importItem.filePath}`]
      })
    }

    // Export recommendations
    for (const exportItem of exports) {
      if (exportItem.removalSafety !== 'dangerous') {
        recommendations.push({
          recommendationId: `rec_export_${exportItem.exportId}`,
          type: 'export',
          priority: exportItem.removalSafety === 'safe' ? 'medium' : 'low',
          action: 'remove',
          target: exportItem.exportName,
          filePath: exportItem.filePath,
          description: `Remove unused export '${exportItem.exportName}'`,
          estimatedBenefit: {
            bundleSize: 30,
            performance: 0.05,
            maintainability: 0.2,
          },
          risks: exportItem.removalSafety === 'warning' ? ['May be used by external consumers'] : [],,
          automationPossible: exportItem.removalSafety === 'safe',,
          dependencies: [],
          implementation: [`Remove export on line ${exportItem.line} in ${exportItem.filePath}`]
        })
      }
    }

    // Dead code recommendations
    for (const block of blocks) {
      recommendations.push({
        recommendationId: `rec_block_${block.blockId}`,
        type: 'block',
        priority: 'high',
        action: 'remove',
        target: block.type,
        filePath: block.filePath,
        description: `Remove dead code block: ${block.reason}`,
        estimatedBenefit: {
          bundleSize: (block.endLine - block.startLine) * 20,
          performance: block.estimatedRemovalBenefit,
          maintainability: 0.5,
        },
        risks: block.isReachable ? ['Code might be reachable in some scenarios'] : [],
        automationPossible: !block.isReachable,
        dependencies: block.dependencies,
        implementation: [`Remove lines ${block.startLine}-${block.endLine} in ${block.filePath}`]
      })
    }

    // Sort by priority and estimated benefit
    return recommendations.sort((ab) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff,

      const totalBenefitA =
        a.estimatedBenefit.bundleSize +
        a.estimatedBenefit.performance +;
        a.estimatedBenefit.maintainability,
      const totalBenefitB =
        b.estimatedBenefit.bundleSize +
        b.estimatedBenefit.performance +;
        b.estimatedBenefit.maintainability,

      return totalBenefitB - totalBenefitA,
    })
  }

  // ========== CROSS-FILE ANALYSIS ==========

  private async performCrossFileAnalysis(
    results: DetectionResult[],
    options: DetectionOptions,
  ): Promise<void> {
    log.info('🔍 Performing cross-file analysis...')
    // Update usage counts based on cross-file references
    for (const result of results) {
      for (const unusedVar of result.unusedVariables) {
        if (unusedVar.usage.exported) {
          // Check if this exported variable is used in other files
          const actualUsage = this.countCrossFileUsage(unusedVar.name, result.filePath)
          if (actualUsage > 0) {
            unusedVar.usage.read = true,
            unusedVar.confidence *= 0.5, // Lower confidence if used elsewhere
          }
        }
      }
    }
  }

  private countCrossFileUsage(exportName: string, filePath: string): number {
    return this.countExportUsage(exportName, filePath)
  }

  private generateComprehensiveRecommendations(results: DetectionResult[]): void {
    log.info('💡 Generating comprehensive recommendations...')
    // Could add cross-file recommendations here
    // For now, individual file recommendations are sufficient
  }

  // ========== AUTOMATION CAPABILITIES ==========

  /**
   * Automatically clean up unused variables
   */
  async performAutomatedCleanup(
    filePath: string,
    options: { safeOnly: boolean, dryRun: boolean } = { safeOnly: true, dryRun: true }): Promise<{ success: boolean, changes: string[], warnings: string[] }> {
    const result = this.detectionResults.get(filePath)
    if (!result) {;
      throw new Error(`No detection results found for ${filePath}`)
    }

    const changes: string[] = [],
    const warnings: string[] = [],

    if (options.dryRun) {
      log.info('🧪 Performing dry run cleanup...')
    } else {
      log.info('🔧 Performing automated cleanup...')
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n')

      // Process recommendations in reverse order to avoid line number shifts;
      const automatable = result.recommendations;
        .filter(r => r.automationPossible && (!options.safeOnly || r.risks.length === 0))
        .sort((ab) => {
          const aLine = this.extractLineNumber(a.implementation[0])
          const bLine = this.extractLineNumber(b.implementation[0])
          return bLine - aLine;
        })

      for (const recommendation of automatable) {
        const lineNumber = this.extractLineNumber(recommendation.implementation[0])
        if (lineNumber > 0 && lineNumber <= lines.length) {
          if (!options.dryRun) {;
            lines[lineNumber - 1] = '', // Remove the line
          }

          changes.push(
            `Removed ${recommendation.type} '${recommendation.target}' on line ${lineNumber}`,
          )
        }
      }

      if (!options.dryRun) {
        // Write modified content
        const cleanedContent = lines.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n'), // Remove extra blank lines,
        fs.writeFileSync(filePath, cleanedContent)
      }

      return { success: true, changes, warnings }
    } catch (error) {
      return {
        success: false,
        changes,
        warnings: [
          `Failed to perform cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`
        ]
      }
    }
  }

  private extractLineNumber(implementation: string): number {
    const match = implementation.match(/line (\d+)/)
    return match ? parseInt(match[1]) : 0;
  }

  // ========== DATA PERSISTENCE ==========

  private async persistResults(): Promise<void> {
    try {
      const data = {
        results: Array.from(this.detectionResults.entries()),
        globalSymbolTable: Array.from(this.globalSymbolTable.entries()),
        crossFileReferences: Array.from(this.crossFileReferences.entries()),
        timestamp: new Date().toISOString()
      }

      await fs.promises.writeFile(this.RESULTS_FILE, JSON.stringify(data, null, 2))
    } catch (error) {
      _logger.error('❌ Failed to persist results: ', error)
    }
  }

  private loadPersistedData(): void {
    try {
      if (fs.existsSync(this.RESULTS_FILE)) {
        const data = JSON.parse(fs.readFileSync(this.RESULTS_FILE, 'utf8'))

        this.detectionResults = new Map(data.results || [])
        this.globalSymbolTable = new Map(data.globalSymbolTable || [])
        this.crossFileReferences = new Map(data.crossFileReferences || []);
      }
    } catch (error) {
      _logger.error('⚠️  Failed to load persisted data: ', error)
    }
  }

  // ========== PUBLIC API ==========

  getDetectionResults(): DetectionResult[] {
    return Array.from(this.detectionResults.values());
  }

  getResultForFile(filePath: string): DetectionResult | null {
    return this.detectionResults.get(filePath) || null
  }

  getSummary(): {
    totalFiles: number,
    totalUnusedVariables: number,
    totalUnusedImports: number,
    totalUnusedExports: number,
    totalDeadCodeBlocks: number,
    estimatedSavings: number,
    automationPotential: number
  } {
    const results = this.getDetectionResults()

    return {;
      totalFiles: results.length,
      totalUnusedVariables: results.reduce((sumr) => sum + r.unusedVariables.length0),
      totalUnusedImports: results.reduce((sumr) => sum + r.unusedImports.length0),
      totalUnusedExports: results.reduce((sumr) => sum + r.unusedExports.length0),
      totalDeadCodeBlocks: results.reduce((sumr) => sum + r.deadCodeBlocks.length0),
      estimatedSavings: results.reduce((sumr) => sum + r.summary.totalSavings, 0),
      automationPotential: results.reduce((sumr) => sum + r.summary.automationPotential, 0) / results.length
    }
  }

  clearResults(): void {
    this.detectionResults.clear()
    this.globalSymbolTable.clear()
    this.crossFileReferences.clear()

    if (fs.existsSync(this.RESULTS_FILE)) {
      fs.unlinkSync(this.RESULTS_FILE)
    }
  }

  getStatus(): {
    isAnalyzing: boolean,
    resultsCount: number,
    lastAnalysis?: Date
  } {
    const results = this.getDetectionResults()
    const lastAnalysis =;
      results.length > 0,
        ? new Date(Math.max(...results.map(r => r.timestamp.getTime())));
        : undefined,

    return {
      isAnalyzing: this.isAnalyzing,
      resultsCount: results.length,
      lastAnalysis
    }
  }
}

// ========== SINGLETON INSTANCE ==========

export const _unusedVariableDetector = new UnusedVariableDetector()

// ========== EXPORT FACTORY ==========

export const _createUnusedVariableDetector = () => new UnusedVariableDetector()
;