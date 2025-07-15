#!/usr/bin/env node

/**
 * TypeScript Error Analysis Tool
 * Analyzes TypeScript errors and categorizes them by type and priority
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Error categorization patterns
const ERROR_CATEGORIES = {
  'Syntax Errors': [
    'TS1005', // Expected token
    'TS1109', // Expression expected
    'TS1128', // Declaration or statement expected
    'TS1144', // '{' or ';' expected
    'TS1472', // 'catch' or 'finally' expected
    'TS1011', // Element access expression should take an argument
    'TS1136', // Property assignment expected
    'TS1434', // Unexpected keyword or identifier
    'TS1003', // Identifier expected
    'TS1131', // Property or signature expected
    'TS1068', // Unexpected token. '}' expected
    'TS1127', // Invalid character
  ],
  'Type Errors': [
    'TS2304', // Cannot find name
    'TS2322', // Type is not assignable
    'TS2339', // Property does not exist
    'TS2345', // Argument of type is not assignable
    'TS2349', // This expression is not callable
    'TS2552', // Cannot find name
    'TS2571', // Object is of type 'unknown'
    'TS2580', // Cannot find name
    'TS2564', // Property has no initializer and is not definitely assigned
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
    'TS2365', // Operator cannot be applied to types
  ],
  'Import/Export Errors': [
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2503', // Cannot find namespace
    'TS2300', // Duplicate identifier
    'TS1192', // Module cannot be imported
    'TS1479', // The current file is a CommonJS module
    'TS1259', // Module can only be default-imported
  ],
  'Function/Method Errors': [
    'TS2554', // Expected arguments but got
    'TS2556', // A spread argument must either have a tuple type
    'TS2559', // Type has no properties in common
    'TS2740', // Type is missing properties
    'TS2341', // Property is private
    'TS2722', // Cannot invoke an object which is possibly undefined
    'TS2769', // No overload matches this call
  ],
  'JSX/React Errors': [
    'TS2686', // React refers to a UMD global
    'TS2583', // Cannot find name 'React'
    'TS2769', // No overload matches this call
    'TS2605', // JSX element type is not a constructor function
    'TS2739', // Type is missing properties required by JSX.IntrinsicElements
    'TS2746', // This JSX tag's children are of type 'ReactNode'
  ],
  'Configuration Errors': [
    'TS2688', // Cannot find type definition file
    'TS2691', // An import path cannot end with a '.ts' extension
    'TS6054', // File is not under 'rootDir'
    'TS6059', // File is not in project source
    'TS18028', // Private identifiers are only available when targeting ECMAScript 2015
  ]
};

// Priority levels for different error types
const PRIORITY_MAPPING = {
  'Syntax Errors': 1, // Highest priority - breaks parsing
  'Import/Export Errors': 2, // High priority - breaks module system
  'Type Errors': 3, // Medium priority - type safety
  'Function/Method Errors': 4, // Medium priority - runtime issues
  'JSX/React Errors': 5, // Lower priority - often configuration
  'Configuration Errors': 6 // Lowest priority - project setup
};

// Directory categorization for targeted fixes
const DIRECTORY_CATEGORIES = {
  'Component Errors': [
    'src/components',
    'src/ui',
    'src/AstrologyChart'
  ],
  'Data Layer Errors': [
    'src/data',
    'src/services',
    'src/context',
    'src/contexts'
  ],
  'API Errors': [
    'src/api',
    'src/app/api',
    'pages/api'
  ],
  'Alchemical Engine Errors': [
    'src/calculations',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings'
  ],
  'Test Errors': [
    'src/__tests__',
    'tests',
    'test-scripts'
  ]
};

class TypeScriptErrorAnalyzer {
  constructor(options = {}) {
    this.options = {
      dryRun: true,
      targetDir: null,
      targetFiles: null,
      excludeDirs: [],
      excludeErrorCodes: [],
      includeErrorCodes: [],
      maxErrorsPerFile: 50,
      ...options
    };
    
    this.errorStats = {
      totalErrors: 0,
      totalFiles: 0,
      errorsByCategory: {},
      errorsByFile: {},
      errorsByDirectory: {},
      topErrorFiles: [],
      criticalFiles: [],
      fixableFiles: []
    };
  }

  log(message) {
    const prefix = this.options.dryRun ? '[ANALYSIS]' : '[FIXING]';
    console.log(`${prefix} ${message}`);
  }

  async analyzeErrors() {
    this.log('Running TypeScript compiler to analyze errors...');
    
    // Create a temporary directory to store specific files for targeted analysis
    if (this.options.targetFiles && Array.isArray(this.options.targetFiles) && this.options.targetFiles.length > 0) {
      try {
        this.log(`Analyzing ${this.options.targetFiles.length} specific files...`);
        
        // Create single string output for errors across all targeted files
        let allErrors = '';
        
        // Process each file individually for more reliable error checking
        for (const targetFile of this.options.targetFiles) {
          try {
            const output = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}" 2>&1 || true`, {
              cwd: ROOT_DIR,
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024
            });
            
            if (output && !output.includes('error TS5083')) { // Skip "Cannot read file" errors
              allErrors += output + '\n';
            }
          } catch (err) {
            if (err.stdout) {
              allErrors += err.stdout + '\n';
            }
          }
        }
        
        return this.parseErrorOutput(allErrors);
      } catch (error) {
        console.error('Error analyzing targeted files:', error.message);
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        }
        throw error;
      }
    } else {
      // Regular full project analysis
      try {
        // Build tsc command with target options
        let tscCommand = 'npx tsc --noEmit --skipLibCheck';
        
        if (this.options.targetDir) {
          // Check specific directory
          tscCommand = `find ${path.join(ROOT_DIR, this.options.targetDir)} -name "*.ts" -o -name "*.tsx" | xargs npx tsc --noEmit --skipLibCheck`;
        }
        
        // Run TypeScript compiler and capture output
        const output = execSync(tscCommand + ' 2>&1 || true', {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer to handle large error output
        });
        
        return this.parseErrorOutput(output);
      } catch (error) {
        // TypeScript errors will cause execSync to throw, but we want the output
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        } else {
          console.error('Error running TypeScript compiler:', error.message);
          throw error;
        }
      }
    }
  }

  parseErrorOutput(output) {
    if (!output || output.trim() === '') {
      console.log('No output from TypeScript compiler to parse.');
      return this.errorStats;
    }
    
    const lines = output.split('\n');
    
    // More flexible error pattern that handles variations in formatting
    const errorPattern = /([^()\s]+\.tsx?):(\d+):(\d+)(?:\s+-\s+|\s+)error\s+(TS\d+)(?::\s+|\s+)(.+)/;
    const summaryPattern = /Found\s+(\d+)\s+errors?\s+in\s+(\d+)\s+files?/;
    
    console.log(`Processing ${lines.length} lines of compiler output...`);
    
    let errorCount = 0;
    let parsedErrors = 0;
    let errorFiles = new Set();
    
    for (const line of lines) {
      const errorMatch = line.match(errorPattern);
      const summaryMatch = line.match(summaryPattern);
      
      if (errorMatch) {
        errorCount++;
        let [, filePath, lineNum, colNum, errorCode, message] = errorMatch;
        
        // Resolve file path if not absolute
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(ROOT_DIR, filePath);
        }
        
        // Apply filters
        if (this.shouldSkipError(filePath, errorCode)) {
          continue;
        }
        
        errorFiles.add(filePath);
        this.addError(filePath, errorCode, message, parseInt(lineNum), parseInt(colNum));
        parsedErrors++;
        
        // Log progress for large error sets
        if (parsedErrors % 1000 === 0) {
          console.log(`Processed ${parsedErrors} errors...`);
        }
      } else if (summaryMatch) {
        this.errorStats.totalErrors = parseInt(summaryMatch[1]);
        this.errorStats.totalFiles = parseInt(summaryMatch[2]);
      }
    }
    
    // If we didn't find a summary pattern, calculate totals from our processing
    if (!this.errorStats.totalErrors) {
      this.errorStats.totalErrors = errorCount;
      this.errorStats.totalFiles = errorFiles.size;
    }
    
    console.log(`Completed parsing. Found ${this.errorStats.totalErrors} errors in ${this.errorStats.totalFiles} files.`);
    
    this.calculateStatistics();
    return this.errorStats;
  }

  shouldSkipError(filePath, errorCode) {
    // Skip if file is in excluded directories
    if (this.options.excludeDirs.some(dir => filePath.includes(dir))) {
      return true;
    }
    
    // Skip if error code is explicitly excluded
    if (this.options.excludeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Skip if we're filtering to specific error codes and this isn't one
    if (this.options.includeErrorCodes.length > 0 && 
        !this.options.includeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  addError(filePath, errorCode, message, line, column) {
    const category = this.categorizeError(errorCode);
    const dirCategory = this.categorizeDirectory(filePath);
    
    // Initialize category if not exists
    if (!this.errorStats.errorsByCategory[category]) {
      this.errorStats.errorsByCategory[category] = {
        count: 0,
        errors: [],
        priority: PRIORITY_MAPPING[category] || 9
      };
    }
    
    // Initialize file if not exists
    if (!this.errorStats.errorsByFile[filePath]) {
      this.errorStats.errorsByFile[filePath] = {
        count: 0,
        errors: [],
        categories: new Set(),
        dirCategory
      };
    }
    
    // Initialize directory category if not exists
    if (dirCategory && !this.errorStats.errorsByDirectory[dirCategory]) {
      this.errorStats.errorsByDirectory[dirCategory] = {
        count: 0,
        files: new Set(),
        categories: {}
      };
    }
    
    const errorInfo = {
      code: errorCode,
      message,
      line,
      column,
      category,
      filePath: path.relative(ROOT_DIR, filePath)
    };
    
    // Enforce max errors per file to prevent memory issues
    if (this.errorStats.errorsByFile[filePath].errors.length < this.options.maxErrorsPerFile) {
      this.errorStats.errorsByCategory[category].count++;
      this.errorStats.errorsByCategory[category].errors.push(errorInfo);
      
      this.errorStats.errorsByFile[filePath].errors.push(errorInfo);
    }
    
    this.errorStats.errorsByFile[filePath].count++;
    this.errorStats.errorsByFile[filePath].categories.add(category);
    
    // Update directory statistics if applicable
    if (dirCategory) {
      this.errorStats.errorsByDirectory[dirCategory].count++;
      this.errorStats.errorsByDirectory[dirCategory].files.add(filePath);
      
      if (!this.errorStats.errorsByDirectory[dirCategory].categories[category]) {
        this.errorStats.errorsByDirectory[dirCategory].categories[category] = 0;
      }
      this.errorStats.errorsByDirectory[dirCategory].categories[category]++;
    }
  }

  categorizeError(errorCode) {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
      if (codes.includes(errorCode)) {
        return category;
      }
    }
    return 'Other Errors';
  }

  categorizeDirectory(filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    for (const [category, patterns] of Object.entries(DIRECTORY_CATEGORIES)) {
      if (patterns.some(pattern => relPath.startsWith(pattern))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  calculateStatistics() {
    // Sort files by error count
    const fileEntries = Object.entries(this.errorStats.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count);
    
    this.errorStats.topErrorFiles = fileEntries.slice(0, 20)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        categories: Array.from(data.categories)
      }));
    
    // Identify critical files (syntax errors that break parsing)
    this.errorStats.criticalFiles = fileEntries
      .filter(([, data]) => data.categories.has('Syntax Errors'))
      .slice(0, 10)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        syntaxErrors: data.errors.filter(e => e.category === 'Syntax Errors').length
      }));
      
    // Identify files with easily fixable errors (certain syntax errors)
    const fixableErrorCodes = ['TS1005', 'TS1136', 'TS1144'];
    this.errorStats.fixableFiles = fileEntries
      .filter(([, data]) => data.errors.some(e => fixableErrorCodes.includes(e.code)))
      .slice(0, 15)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        fixableErrors: data.errors.filter(e => fixableErrorCodes.includes(e.code)).length
      }));
    
    // Process directory statistics
    for (const [category, data] of Object.entries(this.errorStats.errorsByDirectory)) {
      data.fileCount = data.files.size;
      data.files = Array.from(data.files).map(f => path.relative(ROOT_DIR, f));
    }
  }

  generateReport() {
    console.log('\n=== TypeScript Error Analysis Report ===\n');
    
    // Summary
    console.log(`Total Errors: ${this.errorStats.totalErrors}`);
    console.log(`Total Files: ${this.errorStats.totalFiles}`);
    console.log(`Average Errors per File: ${Math.round(this.errorStats.totalErrors / this.errorStats.totalFiles)}\n`);
    
    // Errors by category
    console.log('--- Errors by Category (Priority Order) ---');
    const sortedCategories = Object.entries(this.errorStats.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of sortedCategories) {
      console.log(`${category}: ${data.count} errors (Priority ${data.priority})`);
    }
    
    // Errors by directory
    console.log('\n--- Errors by Directory ---');
    const sortedDirs = Object.entries(this.errorStats.errorsByDirectory)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [dirCategory, data] of sortedDirs) {
      console.log(`${dirCategory}: ${data.count} errors across ${data.fileCount} files`);
      
      // Show top error categories for this directory
      const categoryEntries = Object.entries(data.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
        
      if (categoryEntries.length > 0) {
        console.log(`  Top issues: ${categoryEntries.map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
      }
    }
    
    // Top error files
    console.log('\n--- Top 20 Files with Most Errors ---');
    for (const fileInfo of this.errorStats.topErrorFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.count} errors [${fileInfo.categories.join(', ')}]`);
    }
    
    // Critical files (syntax errors)
    console.log('\n--- Critical Files (Syntax Errors) ---');
    for (const fileInfo of this.errorStats.criticalFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.syntaxErrors} syntax errors out of ${fileInfo.count} total`);
    }
    
    // Easily fixable files
    console.log('\n--- Easily Fixable Files ---');
    for (const fileInfo of this.errorStats.fixableFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.fixableErrors} fixable errors out of ${fileInfo.count} total`);
    }
    
    // Alchemical engine check
    this.checkAlchemicalEngine();
    
    // Recommendations
    console.log('\n--- Recommended Fix Order ---');
    console.log('1. Fix syntax errors first (breaks parsing)');
    console.log('2. Fix import/export errors (breaks module system)');
    console.log('3. Focus on alchemical engine errors (core functionality)');
    console.log('4. Fix component errors that affect rendering');
    console.log('5. Address type and function errors');
    
    console.log('\n--- Available Fix Scripts ---');
    console.log('• scripts/syntax-fixes/ - Fix syntax errors');
    console.log('• scripts/typescript-fixes/ - Fix TypeScript type errors');
    console.log('• scripts/elemental-fixes/ - Fix alchemical/elemental logic errors');
    console.log('• scripts/cuisine-fixes/ - Fix cuisine-specific errors');
    
    console.log('\n--- Advanced Analysis Commands ---');
    console.log('• Analyze specific directory:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-dir=src/components');
    console.log('• Analyze specific files:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-files="src/calculations/alchemize.ts src/utils/elements.ts"');
    console.log('• Filter by error category:');
    console.log('  node scripts/typescript-error-analysis.mjs --include-categories="Syntax Errors,Import/Export Errors"');
  }

  checkAlchemicalEngine() {
    console.log('\n--- Alchemical Engine Status ---');
    
    // Core alchemical files that are critical to the system
    const alchemicalFiles = [
      'src/calculations/alchemize.ts',
      'src/calculations/alchemicalEngine.ts',
      'src/calculations/alchemicalCalculations.ts',
      'src/calculations/alchemicalTransformation.ts',
      'src/utils/astrologyUtils',
      'src/utils/elementalMappings',
      'src/utils/astrologyUtils/index.ts',
      'src/utils/elementalMappings/index.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/elementalUtils.ts',
      'src/utils/elementalCompatibility.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/safeAstrology.ts',
      'src/services/AstrologicalService.ts',
      'src/services/ElementalCalculator.ts',
      'src/lib/alchemicalEngine.ts',
      'src/lib/elementalSystem.ts'
    ];
    
    const coreStructures = [
      'alchemize', 
      'elementalCompatibility',
      'calculateElementalBalance',
      'getElementalBreakdown',
      'calculateSeasonalScores',
      'planetInfo',
      'signInfo',
      'getComplementaryElement'
    ];
    
    // Check 1: File-level errors in alchemical files
    const alchemicalErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => {
        return alchemicalFiles.some(pattern => filePath.includes(pattern));
      })
      .sort(([,a], [,b]) => b.count - a.count);
    
    // Check 2: Look for errors in core structure functions
    const structureErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([_, data]) => {
        return data.errors.some(error => 
          coreStructures.some(structure => error.message.includes(structure))
        );
      });
    
    if (alchemicalErrors.length > 0) {
      console.log(`Found ${alchemicalErrors.length} alchemical engine files with errors:`);
      alchemicalErrors.slice(0, 5).forEach(([filePath, data]) => {
        console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${data.count} errors`);
        
        // Show example errors
        const syntaxErrors = data.errors.filter(e => e.category === 'Syntax Errors');
        if (syntaxErrors.length > 0) {
          console.log(`    First syntax error: ${syntaxErrors[0].message} (line ${syntaxErrors[0].line})`);
        }
      });
      
      console.log(`\nRecommendation: Fix alchemical engine errors as highest priority (after syntax).`);
      
      // Examine core alchemical structures
      if (structureErrors.length > 0) {
        console.log(`\nCRITICAL: Found errors in core alchemical structures:`);
        structureErrors.slice(0, 3).forEach(([filePath, data]) => {
          const structuralIssues = data.errors.filter(error => 
            coreStructures.some(structure => error.message.includes(structure))
          );
          
          console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${structuralIssues.length} structural issues`);
          structuralIssues.slice(0, 2).forEach(error => {
            console.log(`    ${error.message} (line ${error.line})`);
          });
        });
      }
      
      // Generate specific fix commands
      console.log(`\nFix Commands:`);
      console.log(`  1. node scripts/fix-project.mjs --category=elemental --dry-run`);
      console.log(`  2. node scripts/elemental-fixes/fix-alchemical-engine.js --file=${
        path.relative(ROOT_DIR, alchemicalErrors[0]?.[0] || '')
      }`);
    } else {
      console.log('No errors detected in alchemical engine core files.');
      
      // Verify core alchemical structures are present
      try {
        const alchemicalPath = path.join(ROOT_DIR, 'src/calculations/alchemize.ts');
        if (fs.existsSync(alchemicalPath)) {
          const content = fs.readFileSync(alchemicalPath, 'utf-8');
          const hasCoreFunction = content.includes('function alchemize(');
          if (hasCoreFunction) {
            console.log('Core alchemical engine structure verified.');
          } else {
            console.log('WARNING: alchemize() function not found in expected location.');
          }
        } else {
          console.log('WARNING: Core alchemical file not found at expected path.');
        }
      } catch (error) {
        console.log('Could not verify alchemical engine structure:', error.message);
      }
    }
    
    // Check for elemental principles violations
    this.checkElementalPrinciples();
  }

  checkElementalPrinciples() {
    console.log('\n--- Elemental Principles Check ---');
    
    // Rules from elemental-principles-guide.md
    const violationPatterns = [
      { 
        pattern: /(fire.*?oppos.*?22504Water#!/usr/bin/env node

/**
 * TypeScript Error Analysis Tool
 * Analyzes TypeScript errors and categorizes them by type and priority
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Error categorization patterns
const ERROR_CATEGORIES = {
  'Syntax Errors': [
    'TS1005', // Expected token
    'TS1109', // Expression expected
    'TS1128', // Declaration or statement expected
    'TS1144', // '{' or ';' expected
    'TS1472', // 'catch' or 'finally' expected
    'TS1011', // Element access expression should take an argument
    'TS1136', // Property assignment expected
    'TS1434', // Unexpected keyword or identifier
    'TS1003', // Identifier expected
    'TS1131', // Property or signature expected
    'TS1068', // Unexpected token. '}' expected
    'TS1127', // Invalid character
  ],
  'Type Errors': [
    'TS2304', // Cannot find name
    'TS2322', // Type is not assignable
    'TS2339', // Property does not exist
    'TS2345', // Argument of type is not assignable
    'TS2349', // This expression is not callable
    'TS2552', // Cannot find name
    'TS2571', // Object is of type 'unknown'
    'TS2580', // Cannot find name
    'TS2564', // Property has no initializer and is not definitely assigned
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
    'TS2365', // Operator cannot be applied to types
  ],
  'Import/Export Errors': [
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2503', // Cannot find namespace
    'TS2300', // Duplicate identifier
    'TS1192', // Module cannot be imported
    'TS1479', // The current file is a CommonJS module
    'TS1259', // Module can only be default-imported
  ],
  'Function/Method Errors': [
    'TS2554', // Expected arguments but got
    'TS2556', // A spread argument must either have a tuple type
    'TS2559', // Type has no properties in common
    'TS2740', // Type is missing properties
    'TS2341', // Property is private
    'TS2722', // Cannot invoke an object which is possibly undefined
    'TS2769', // No overload matches this call
  ],
  'JSX/React Errors': [
    'TS2686', // React refers to a UMD global
    'TS2583', // Cannot find name 'React'
    'TS2769', // No overload matches this call
    'TS2605', // JSX element type is not a constructor function
    'TS2739', // Type is missing properties required by JSX.IntrinsicElements
    'TS2746', // This JSX tag's children are of type 'ReactNode'
  ],
  'Configuration Errors': [
    'TS2688', // Cannot find type definition file
    'TS2691', // An import path cannot end with a '.ts' extension
    'TS6054', // File is not under 'rootDir'
    'TS6059', // File is not in project source
    'TS18028', // Private identifiers are only available when targeting ECMAScript 2015
  ]
};

// Priority levels for different error types
const PRIORITY_MAPPING = {
  'Syntax Errors': 1, // Highest priority - breaks parsing
  'Import/Export Errors': 2, // High priority - breaks module system
  'Type Errors': 3, // Medium priority - type safety
  'Function/Method Errors': 4, // Medium priority - runtime issues
  'JSX/React Errors': 5, // Lower priority - often configuration
  'Configuration Errors': 6 // Lowest priority - project setup
};

// Directory categorization for targeted fixes
const DIRECTORY_CATEGORIES = {
  'Component Errors': [
    'src/components',
    'src/ui',
    'src/AstrologyChart'
  ],
  'Data Layer Errors': [
    'src/data',
    'src/services',
    'src/context',
    'src/contexts'
  ],
  'API Errors': [
    'src/api',
    'src/app/api',
    'pages/api'
  ],
  'Alchemical Engine Errors': [
    'src/calculations',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings'
  ],
  'Test Errors': [
    'src/__tests__',
    'tests',
    'test-scripts'
  ]
};

class TypeScriptErrorAnalyzer {
  constructor(options = {}) {
    this.options = {
      dryRun: true,
      targetDir: null,
      targetFiles: null,
      excludeDirs: [],
      excludeErrorCodes: [],
      includeErrorCodes: [],
      maxErrorsPerFile: 50,
      ...options
    };
    
    this.errorStats = {
      totalErrors: 0,
      totalFiles: 0,
      errorsByCategory: {},
      errorsByFile: {},
      errorsByDirectory: {},
      topErrorFiles: [],
      criticalFiles: [],
      fixableFiles: []
    };
  }

  log(message) {
    const prefix = this.options.dryRun ? '[ANALYSIS]' : '[FIXING]';
    console.log(`${prefix} ${message}`);
  }

  async analyzeErrors() {
    this.log('Running TypeScript compiler to analyze errors...');
    
    // Create a temporary directory to store specific files for targeted analysis
    if (this.options.targetFiles && Array.isArray(this.options.targetFiles) && this.options.targetFiles.length > 0) {
      try {
        this.log(`Analyzing ${this.options.targetFiles.length} specific files...`);
        
        // Create single string output for errors across all targeted files
        let allErrors = '';
        
        // Process each file individually for more reliable error checking
        for (const targetFile of this.options.targetFiles) {
          try {
            const output = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}" 2>&1 || true`, {
              cwd: ROOT_DIR,
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024
            });
            
            if (output && !output.includes('error TS5083')) { // Skip "Cannot read file" errors
              allErrors += output + '\n';
            }
          } catch (err) {
            if (err.stdout) {
              allErrors += err.stdout + '\n';
            }
          }
        }
        
        return this.parseErrorOutput(allErrors);
      } catch (error) {
        console.error('Error analyzing targeted files:', error.message);
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        }
        throw error;
      }
    } else {
      // Regular full project analysis
      try {
        // Build tsc command with target options
        let tscCommand = 'npx tsc --noEmit --skipLibCheck';
        
        if (this.options.targetDir) {
          // Check specific directory
          tscCommand = `find ${path.join(ROOT_DIR, this.options.targetDir)} -name "*.ts" -o -name "*.tsx" | xargs npx tsc --noEmit --skipLibCheck`;
        }
        
        // Run TypeScript compiler and capture output
        const output = execSync(tscCommand + ' 2>&1 || true', {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer to handle large error output
        });
        
        return this.parseErrorOutput(output);
      } catch (error) {
        // TypeScript errors will cause execSync to throw, but we want the output
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        } else {
          console.error('Error running TypeScript compiler:', error.message);
          throw error;
        }
      }
    }
  }

  parseErrorOutput(output) {
    if (!output || output.trim() === '') {
      console.log('No output from TypeScript compiler to parse.');
      return this.errorStats;
    }
    
    const lines = output.split('\n');
    
    // More flexible error pattern that handles variations in formatting
    const errorPattern = /([^()\s]+\.tsx?):(\d+):(\d+)(?:\s+-\s+|\s+)error\s+(TS\d+)(?::\s+|\s+)(.+)/;
    const summaryPattern = /Found\s+(\d+)\s+errors?\s+in\s+(\d+)\s+files?/;
    
    console.log(`Processing ${lines.length} lines of compiler output...`);
    
    let errorCount = 0;
    let parsedErrors = 0;
    let errorFiles = new Set();
    
    for (const line of lines) {
      const errorMatch = line.match(errorPattern);
      const summaryMatch = line.match(summaryPattern);
      
      if (errorMatch) {
        errorCount++;
        let [, filePath, lineNum, colNum, errorCode, message] = errorMatch;
        
        // Resolve file path if not absolute
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(ROOT_DIR, filePath);
        }
        
        // Apply filters
        if (this.shouldSkipError(filePath, errorCode)) {
          continue;
        }
        
        errorFiles.add(filePath);
        this.addError(filePath, errorCode, message, parseInt(lineNum), parseInt(colNum));
        parsedErrors++;
        
        // Log progress for large error sets
        if (parsedErrors % 1000 === 0) {
          console.log(`Processed ${parsedErrors} errors...`);
        }
      } else if (summaryMatch) {
        this.errorStats.totalErrors = parseInt(summaryMatch[1]);
        this.errorStats.totalFiles = parseInt(summaryMatch[2]);
      }
    }
    
    // If we didn't find a summary pattern, calculate totals from our processing
    if (!this.errorStats.totalErrors) {
      this.errorStats.totalErrors = errorCount;
      this.errorStats.totalFiles = errorFiles.size;
    }
    
    console.log(`Completed parsing. Found ${this.errorStats.totalErrors} errors in ${this.errorStats.totalFiles} files.`);
    
    this.calculateStatistics();
    return this.errorStats;
  }

  shouldSkipError(filePath, errorCode) {
    // Skip if file is in excluded directories
    if (this.options.excludeDirs.some(dir => filePath.includes(dir))) {
      return true;
    }
    
    // Skip if error code is explicitly excluded
    if (this.options.excludeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Skip if we're filtering to specific error codes and this isn't one
    if (this.options.includeErrorCodes.length > 0 && 
        !this.options.includeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  addError(filePath, errorCode, message, line, column) {
    const category = this.categorizeError(errorCode);
    const dirCategory = this.categorizeDirectory(filePath);
    
    // Initialize category if not exists
    if (!this.errorStats.errorsByCategory[category]) {
      this.errorStats.errorsByCategory[category] = {
        count: 0,
        errors: [],
        priority: PRIORITY_MAPPING[category] || 9
      };
    }
    
    // Initialize file if not exists
    if (!this.errorStats.errorsByFile[filePath]) {
      this.errorStats.errorsByFile[filePath] = {
        count: 0,
        errors: [],
        categories: new Set(),
        dirCategory
      };
    }
    
    // Initialize directory category if not exists
    if (dirCategory && !this.errorStats.errorsByDirectory[dirCategory]) {
      this.errorStats.errorsByDirectory[dirCategory] = {
        count: 0,
        files: new Set(),
        categories: {}
      };
    }
    
    const errorInfo = {
      code: errorCode,
      message,
      line,
      column,
      category,
      filePath: path.relative(ROOT_DIR, filePath)
    };
    
    // Enforce max errors per file to prevent memory issues
    if (this.errorStats.errorsByFile[filePath].errors.length < this.options.maxErrorsPerFile) {
      this.errorStats.errorsByCategory[category].count++;
      this.errorStats.errorsByCategory[category].errors.push(errorInfo);
      
      this.errorStats.errorsByFile[filePath].errors.push(errorInfo);
    }
    
    this.errorStats.errorsByFile[filePath].count++;
    this.errorStats.errorsByFile[filePath].categories.add(category);
    
    // Update directory statistics if applicable
    if (dirCategory) {
      this.errorStats.errorsByDirectory[dirCategory].count++;
      this.errorStats.errorsByDirectory[dirCategory].files.add(filePath);
      
      if (!this.errorStats.errorsByDirectory[dirCategory].categories[category]) {
        this.errorStats.errorsByDirectory[dirCategory].categories[category] = 0;
      }
      this.errorStats.errorsByDirectory[dirCategory].categories[category]++;
    }
  }

  categorizeError(errorCode) {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
      if (codes.includes(errorCode)) {
        return category;
      }
    }
    return 'Other Errors';
  }

  categorizeDirectory(filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    for (const [category, patterns] of Object.entries(DIRECTORY_CATEGORIES)) {
      if (patterns.some(pattern => relPath.startsWith(pattern))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  calculateStatistics() {
    // Sort files by error count
    const fileEntries = Object.entries(this.errorStats.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count);
    
    this.errorStats.topErrorFiles = fileEntries.slice(0, 20)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        categories: Array.from(data.categories)
      }));
    
    // Identify critical files (syntax errors that break parsing)
    this.errorStats.criticalFiles = fileEntries
      .filter(([, data]) => data.categories.has('Syntax Errors'))
      .slice(0, 10)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        syntaxErrors: data.errors.filter(e => e.category === 'Syntax Errors').length
      }));
      
    // Identify files with easily fixable errors (certain syntax errors)
    const fixableErrorCodes = ['TS1005', 'TS1136', 'TS1144'];
    this.errorStats.fixableFiles = fileEntries
      .filter(([, data]) => data.errors.some(e => fixableErrorCodes.includes(e.code)))
      .slice(0, 15)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        fixableErrors: data.errors.filter(e => fixableErrorCodes.includes(e.code)).length
      }));
    
    // Process directory statistics
    for (const [category, data] of Object.entries(this.errorStats.errorsByDirectory)) {
      data.fileCount = data.files.size;
      data.files = Array.from(data.files).map(f => path.relative(ROOT_DIR, f));
    }
  }

  generateReport() {
    console.log('\n=== TypeScript Error Analysis Report ===\n');
    
    // Summary
    console.log(`Total Errors: ${this.errorStats.totalErrors}`);
    console.log(`Total Files: ${this.errorStats.totalFiles}`);
    console.log(`Average Errors per File: ${Math.round(this.errorStats.totalErrors / this.errorStats.totalFiles)}\n`);
    
    // Errors by category
    console.log('--- Errors by Category (Priority Order) ---');
    const sortedCategories = Object.entries(this.errorStats.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of sortedCategories) {
      console.log(`${category}: ${data.count} errors (Priority ${data.priority})`);
    }
    
    // Errors by directory
    console.log('\n--- Errors by Directory ---');
    const sortedDirs = Object.entries(this.errorStats.errorsByDirectory)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [dirCategory, data] of sortedDirs) {
      console.log(`${dirCategory}: ${data.count} errors across ${data.fileCount} files`);
      
      // Show top error categories for this directory
      const categoryEntries = Object.entries(data.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
        
      if (categoryEntries.length > 0) {
        console.log(`  Top issues: ${categoryEntries.map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
      }
    }
    
    // Top error files
    console.log('\n--- Top 20 Files with Most Errors ---');
    for (const fileInfo of this.errorStats.topErrorFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.count} errors [${fileInfo.categories.join(', ')}]`);
    }
    
    // Critical files (syntax errors)
    console.log('\n--- Critical Files (Syntax Errors) ---');
    for (const fileInfo of this.errorStats.criticalFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.syntaxErrors} syntax errors out of ${fileInfo.count} total`);
    }
    
    // Easily fixable files
    console.log('\n--- Easily Fixable Files ---');
    for (const fileInfo of this.errorStats.fixableFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.fixableErrors} fixable errors out of ${fileInfo.count} total`);
    }
    
    // Alchemical engine check
    this.checkAlchemicalEngine();
    
    // Recommendations
    console.log('\n--- Recommended Fix Order ---');
    console.log('1. Fix syntax errors first (breaks parsing)');
    console.log('2. Fix import/export errors (breaks module system)');
    console.log('3. Focus on alchemical engine errors (core functionality)');
    console.log('4. Fix component errors that affect rendering');
    console.log('5. Address type and function errors');
    
    console.log('\n--- Available Fix Scripts ---');
    console.log('• scripts/syntax-fixes/ - Fix syntax errors');
    console.log('• scripts/typescript-fixes/ - Fix TypeScript type errors');
    console.log('• scripts/elemental-fixes/ - Fix alchemical/elemental logic errors');
    console.log('• scripts/cuisine-fixes/ - Fix cuisine-specific errors');
    
    console.log('\n--- Advanced Analysis Commands ---');
    console.log('• Analyze specific directory:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-dir=src/components');
    console.log('• Analyze specific files:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-files="src/calculations/alchemize.ts src/utils/elements.ts"');
    console.log('• Filter by error category:');
    console.log('  node scripts/typescript-error-analysis.mjs --include-categories="Syntax Errors,Import/Export Errors"');
  }

  checkAlchemicalEngine() {
    console.log('\n--- Alchemical Engine Status ---');
    
    // Core alchemical files that are critical to the system
    const alchemicalFiles = [
      'src/calculations/alchemize.ts',
      'src/calculations/alchemicalEngine.ts',
      'src/calculations/alchemicalCalculations.ts',
      'src/calculations/alchemicalTransformation.ts',
      'src/utils/astrologyUtils',
      'src/utils/elementalMappings',
      'src/utils/astrologyUtils/index.ts',
      'src/utils/elementalMappings/index.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/elementalUtils.ts',
      'src/utils/elementalCompatibility.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/safeAstrology.ts',
      'src/services/AstrologicalService.ts',
      'src/services/ElementalCalculator.ts',
      'src/lib/alchemicalEngine.ts',
      'src/lib/elementalSystem.ts'
    ];
    
    const coreStructures = [
      'alchemize', 
      'elementalCompatibility',
      'calculateElementalBalance',
      'getElementalBreakdown',
      'calculateSeasonalScores',
      'planetInfo',
      'signInfo',
      'getComplementaryElement'
    ];
    
    // Check 1: File-level errors in alchemical files
    const alchemicalErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => {
        return alchemicalFiles.some(pattern => filePath.includes(pattern));
      })
      .sort(([,a], [,b]) => b.count - a.count);
    
    // Check 2: Look for errors in core structure functions
    const structureErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([_, data]) => {
        return data.errors.some(error => 
          coreStructures.some(structure => error.message.includes(structure))
        );
      });
    
    if (alchemicalErrors.length > 0) {
      console.log(`Found ${alchemicalErrors.length} alchemical engine files with errors:`);
      alchemicalErrors.slice(0, 5).forEach(([filePath, data]) => {
        console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${data.count} errors`);
        
        // Show example errors
        const syntaxErrors = data.errors.filter(e => e.category === 'Syntax Errors');
        if (syntaxErrors.length > 0) {
          console.log(`    First syntax error: ${syntaxErrors[0].message} (line ${syntaxErrors[0].line})`);
        }
      });
      
      console.log(`\nRecommendation: Fix alchemical engine errors as highest priority (after syntax).`);
      
      // Examine core alchemical structures
      if (structureErrors.length > 0) {
        console.log(`\nCRITICAL: Found errors in core alchemical structures:`);
        structureErrors.slice(0, 3).forEach(([filePath, data]) => {
          const structuralIssues = data.errors.filter(error => 
            coreStructures.some(structure => error.message.includes(structure))
          );
          
          console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${structuralIssues.length} structural issues`);
          structuralIssues.slice(0, 2).forEach(error => {
            console.log(`    ${error.message} (line ${error.line})`);
          });
        });
      }
      
      // Generate specific fix commands
      console.log(`\nFix Commands:`);
      console.log(`  1. node scripts/fix-project.mjs --category=elemental --dry-run`);
      console.log(`  2. node scripts/elemental-fixes/fix-alchemical-engine.js --file=${
        path.relative(ROOT_DIR, alchemicalErrors[0]?.[0] || '')
      }`);
    } else {
      console.log('No errors detected in alchemical engine core files.');
      
      // Verify core alchemical structures are present
      try {
        const alchemicalPath = path.join(ROOT_DIR, 'src/calculations/alchemize.ts');
        if (fs.existsSync(alchemicalPath)) {
          const content = fs.readFileSync(alchemicalPath, 'utf-8');
          const hasCoreFunction = content.includes('function alchemize(');
          if (hasCoreFunction) {
            console.log('Core alchemical engine structure verified.');
          } else {
            console.log('WARNING: alchemize() function not found in expected location.');
          }
        } else {
          console.log('WARNING: Core alchemical file not found at expected path.');
        }
      } catch (error) {
        console.log('Could not verify alchemical engine structure:', error.message);
      }
    }
    
    // Check for elemental principles violations
    this.checkElementalPrinciples();
  }

  checkElementalPrinciples() {
    console.log('\n--- Elemental Principles Check ---');
    
    // Rules from elemental-principles-guide.md
    const violationPatterns = [
      { 
        pattern: /(fire.*?oppos.*?water|water.*?oppos.*?22526Fire#!/usr/bin/env node

/**
 * TypeScript Error Analysis Tool
 * Analyzes TypeScript errors and categorizes them by type and priority
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Error categorization patterns
const ERROR_CATEGORIES = {
  'Syntax Errors': [
    'TS1005', // Expected token
    'TS1109', // Expression expected
    'TS1128', // Declaration or statement expected
    'TS1144', // '{' or ';' expected
    'TS1472', // 'catch' or 'finally' expected
    'TS1011', // Element access expression should take an argument
    'TS1136', // Property assignment expected
    'TS1434', // Unexpected keyword or identifier
    'TS1003', // Identifier expected
    'TS1131', // Property or signature expected
    'TS1068', // Unexpected token. '}' expected
    'TS1127', // Invalid character
  ],
  'Type Errors': [
    'TS2304', // Cannot find name
    'TS2322', // Type is not assignable
    'TS2339', // Property does not exist
    'TS2345', // Argument of type is not assignable
    'TS2349', // This expression is not callable
    'TS2552', // Cannot find name
    'TS2571', // Object is of type 'unknown'
    'TS2580', // Cannot find name
    'TS2564', // Property has no initializer and is not definitely assigned
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
    'TS2365', // Operator cannot be applied to types
  ],
  'Import/Export Errors': [
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2503', // Cannot find namespace
    'TS2300', // Duplicate identifier
    'TS1192', // Module cannot be imported
    'TS1479', // The current file is a CommonJS module
    'TS1259', // Module can only be default-imported
  ],
  'Function/Method Errors': [
    'TS2554', // Expected arguments but got
    'TS2556', // A spread argument must either have a tuple type
    'TS2559', // Type has no properties in common
    'TS2740', // Type is missing properties
    'TS2341', // Property is private
    'TS2722', // Cannot invoke an object which is possibly undefined
    'TS2769', // No overload matches this call
  ],
  'JSX/React Errors': [
    'TS2686', // React refers to a UMD global
    'TS2583', // Cannot find name 'React'
    'TS2769', // No overload matches this call
    'TS2605', // JSX element type is not a constructor function
    'TS2739', // Type is missing properties required by JSX.IntrinsicElements
    'TS2746', // This JSX tag's children are of type 'ReactNode'
  ],
  'Configuration Errors': [
    'TS2688', // Cannot find type definition file
    'TS2691', // An import path cannot end with a '.ts' extension
    'TS6054', // File is not under 'rootDir'
    'TS6059', // File is not in project source
    'TS18028', // Private identifiers are only available when targeting ECMAScript 2015
  ]
};

// Priority levels for different error types
const PRIORITY_MAPPING = {
  'Syntax Errors': 1, // Highest priority - breaks parsing
  'Import/Export Errors': 2, // High priority - breaks module system
  'Type Errors': 3, // Medium priority - type safety
  'Function/Method Errors': 4, // Medium priority - runtime issues
  'JSX/React Errors': 5, // Lower priority - often configuration
  'Configuration Errors': 6 // Lowest priority - project setup
};

// Directory categorization for targeted fixes
const DIRECTORY_CATEGORIES = {
  'Component Errors': [
    'src/components',
    'src/ui',
    'src/AstrologyChart'
  ],
  'Data Layer Errors': [
    'src/data',
    'src/services',
    'src/context',
    'src/contexts'
  ],
  'API Errors': [
    'src/api',
    'src/app/api',
    'pages/api'
  ],
  'Alchemical Engine Errors': [
    'src/calculations',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings'
  ],
  'Test Errors': [
    'src/__tests__',
    'tests',
    'test-scripts'
  ]
};

class TypeScriptErrorAnalyzer {
  constructor(options = {}) {
    this.options = {
      dryRun: true,
      targetDir: null,
      targetFiles: null,
      excludeDirs: [],
      excludeErrorCodes: [],
      includeErrorCodes: [],
      maxErrorsPerFile: 50,
      ...options
    };
    
    this.errorStats = {
      totalErrors: 0,
      totalFiles: 0,
      errorsByCategory: {},
      errorsByFile: {},
      errorsByDirectory: {},
      topErrorFiles: [],
      criticalFiles: [],
      fixableFiles: []
    };
  }

  log(message) {
    const prefix = this.options.dryRun ? '[ANALYSIS]' : '[FIXING]';
    console.log(`${prefix} ${message}`);
  }

  async analyzeErrors() {
    this.log('Running TypeScript compiler to analyze errors...');
    
    // Create a temporary directory to store specific files for targeted analysis
    if (this.options.targetFiles && Array.isArray(this.options.targetFiles) && this.options.targetFiles.length > 0) {
      try {
        this.log(`Analyzing ${this.options.targetFiles.length} specific files...`);
        
        // Create single string output for errors across all targeted files
        let allErrors = '';
        
        // Process each file individually for more reliable error checking
        for (const targetFile of this.options.targetFiles) {
          try {
            const output = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}" 2>&1 || true`, {
              cwd: ROOT_DIR,
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024
            });
            
            if (output && !output.includes('error TS5083')) { // Skip "Cannot read file" errors
              allErrors += output + '\n';
            }
          } catch (err) {
            if (err.stdout) {
              allErrors += err.stdout + '\n';
            }
          }
        }
        
        return this.parseErrorOutput(allErrors);
      } catch (error) {
        console.error('Error analyzing targeted files:', error.message);
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        }
        throw error;
      }
    } else {
      // Regular full project analysis
      try {
        // Build tsc command with target options
        let tscCommand = 'npx tsc --noEmit --skipLibCheck';
        
        if (this.options.targetDir) {
          // Check specific directory
          tscCommand = `find ${path.join(ROOT_DIR, this.options.targetDir)} -name "*.ts" -o -name "*.tsx" | xargs npx tsc --noEmit --skipLibCheck`;
        }
        
        // Run TypeScript compiler and capture output
        const output = execSync(tscCommand + ' 2>&1 || true', {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer to handle large error output
        });
        
        return this.parseErrorOutput(output);
      } catch (error) {
        // TypeScript errors will cause execSync to throw, but we want the output
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        } else {
          console.error('Error running TypeScript compiler:', error.message);
          throw error;
        }
      }
    }
  }

  parseErrorOutput(output) {
    if (!output || output.trim() === '') {
      console.log('No output from TypeScript compiler to parse.');
      return this.errorStats;
    }
    
    const lines = output.split('\n');
    
    // More flexible error pattern that handles variations in formatting
    const errorPattern = /([^()\s]+\.tsx?):(\d+):(\d+)(?:\s+-\s+|\s+)error\s+(TS\d+)(?::\s+|\s+)(.+)/;
    const summaryPattern = /Found\s+(\d+)\s+errors?\s+in\s+(\d+)\s+files?/;
    
    console.log(`Processing ${lines.length} lines of compiler output...`);
    
    let errorCount = 0;
    let parsedErrors = 0;
    let errorFiles = new Set();
    
    for (const line of lines) {
      const errorMatch = line.match(errorPattern);
      const summaryMatch = line.match(summaryPattern);
      
      if (errorMatch) {
        errorCount++;
        let [, filePath, lineNum, colNum, errorCode, message] = errorMatch;
        
        // Resolve file path if not absolute
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(ROOT_DIR, filePath);
        }
        
        // Apply filters
        if (this.shouldSkipError(filePath, errorCode)) {
          continue;
        }
        
        errorFiles.add(filePath);
        this.addError(filePath, errorCode, message, parseInt(lineNum), parseInt(colNum));
        parsedErrors++;
        
        // Log progress for large error sets
        if (parsedErrors % 1000 === 0) {
          console.log(`Processed ${parsedErrors} errors...`);
        }
      } else if (summaryMatch) {
        this.errorStats.totalErrors = parseInt(summaryMatch[1]);
        this.errorStats.totalFiles = parseInt(summaryMatch[2]);
      }
    }
    
    // If we didn't find a summary pattern, calculate totals from our processing
    if (!this.errorStats.totalErrors) {
      this.errorStats.totalErrors = errorCount;
      this.errorStats.totalFiles = errorFiles.size;
    }
    
    console.log(`Completed parsing. Found ${this.errorStats.totalErrors} errors in ${this.errorStats.totalFiles} files.`);
    
    this.calculateStatistics();
    return this.errorStats;
  }

  shouldSkipError(filePath, errorCode) {
    // Skip if file is in excluded directories
    if (this.options.excludeDirs.some(dir => filePath.includes(dir))) {
      return true;
    }
    
    // Skip if error code is explicitly excluded
    if (this.options.excludeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Skip if we're filtering to specific error codes and this isn't one
    if (this.options.includeErrorCodes.length > 0 && 
        !this.options.includeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  addError(filePath, errorCode, message, line, column) {
    const category = this.categorizeError(errorCode);
    const dirCategory = this.categorizeDirectory(filePath);
    
    // Initialize category if not exists
    if (!this.errorStats.errorsByCategory[category]) {
      this.errorStats.errorsByCategory[category] = {
        count: 0,
        errors: [],
        priority: PRIORITY_MAPPING[category] || 9
      };
    }
    
    // Initialize file if not exists
    if (!this.errorStats.errorsByFile[filePath]) {
      this.errorStats.errorsByFile[filePath] = {
        count: 0,
        errors: [],
        categories: new Set(),
        dirCategory
      };
    }
    
    // Initialize directory category if not exists
    if (dirCategory && !this.errorStats.errorsByDirectory[dirCategory]) {
      this.errorStats.errorsByDirectory[dirCategory] = {
        count: 0,
        files: new Set(),
        categories: {}
      };
    }
    
    const errorInfo = {
      code: errorCode,
      message,
      line,
      column,
      category,
      filePath: path.relative(ROOT_DIR, filePath)
    };
    
    // Enforce max errors per file to prevent memory issues
    if (this.errorStats.errorsByFile[filePath].errors.length < this.options.maxErrorsPerFile) {
      this.errorStats.errorsByCategory[category].count++;
      this.errorStats.errorsByCategory[category].errors.push(errorInfo);
      
      this.errorStats.errorsByFile[filePath].errors.push(errorInfo);
    }
    
    this.errorStats.errorsByFile[filePath].count++;
    this.errorStats.errorsByFile[filePath].categories.add(category);
    
    // Update directory statistics if applicable
    if (dirCategory) {
      this.errorStats.errorsByDirectory[dirCategory].count++;
      this.errorStats.errorsByDirectory[dirCategory].files.add(filePath);
      
      if (!this.errorStats.errorsByDirectory[dirCategory].categories[category]) {
        this.errorStats.errorsByDirectory[dirCategory].categories[category] = 0;
      }
      this.errorStats.errorsByDirectory[dirCategory].categories[category]++;
    }
  }

  categorizeError(errorCode) {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
      if (codes.includes(errorCode)) {
        return category;
      }
    }
    return 'Other Errors';
  }

  categorizeDirectory(filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    for (const [category, patterns] of Object.entries(DIRECTORY_CATEGORIES)) {
      if (patterns.some(pattern => relPath.startsWith(pattern))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  calculateStatistics() {
    // Sort files by error count
    const fileEntries = Object.entries(this.errorStats.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count);
    
    this.errorStats.topErrorFiles = fileEntries.slice(0, 20)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        categories: Array.from(data.categories)
      }));
    
    // Identify critical files (syntax errors that break parsing)
    this.errorStats.criticalFiles = fileEntries
      .filter(([, data]) => data.categories.has('Syntax Errors'))
      .slice(0, 10)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        syntaxErrors: data.errors.filter(e => e.category === 'Syntax Errors').length
      }));
      
    // Identify files with easily fixable errors (certain syntax errors)
    const fixableErrorCodes = ['TS1005', 'TS1136', 'TS1144'];
    this.errorStats.fixableFiles = fileEntries
      .filter(([, data]) => data.errors.some(e => fixableErrorCodes.includes(e.code)))
      .slice(0, 15)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        fixableErrors: data.errors.filter(e => fixableErrorCodes.includes(e.code)).length
      }));
    
    // Process directory statistics
    for (const [category, data] of Object.entries(this.errorStats.errorsByDirectory)) {
      data.fileCount = data.files.size;
      data.files = Array.from(data.files).map(f => path.relative(ROOT_DIR, f));
    }
  }

  generateReport() {
    console.log('\n=== TypeScript Error Analysis Report ===\n');
    
    // Summary
    console.log(`Total Errors: ${this.errorStats.totalErrors}`);
    console.log(`Total Files: ${this.errorStats.totalFiles}`);
    console.log(`Average Errors per File: ${Math.round(this.errorStats.totalErrors / this.errorStats.totalFiles)}\n`);
    
    // Errors by category
    console.log('--- Errors by Category (Priority Order) ---');
    const sortedCategories = Object.entries(this.errorStats.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of sortedCategories) {
      console.log(`${category}: ${data.count} errors (Priority ${data.priority})`);
    }
    
    // Errors by directory
    console.log('\n--- Errors by Directory ---');
    const sortedDirs = Object.entries(this.errorStats.errorsByDirectory)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [dirCategory, data] of sortedDirs) {
      console.log(`${dirCategory}: ${data.count} errors across ${data.fileCount} files`);
      
      // Show top error categories for this directory
      const categoryEntries = Object.entries(data.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
        
      if (categoryEntries.length > 0) {
        console.log(`  Top issues: ${categoryEntries.map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
      }
    }
    
    // Top error files
    console.log('\n--- Top 20 Files with Most Errors ---');
    for (const fileInfo of this.errorStats.topErrorFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.count} errors [${fileInfo.categories.join(', ')}]`);
    }
    
    // Critical files (syntax errors)
    console.log('\n--- Critical Files (Syntax Errors) ---');
    for (const fileInfo of this.errorStats.criticalFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.syntaxErrors} syntax errors out of ${fileInfo.count} total`);
    }
    
    // Easily fixable files
    console.log('\n--- Easily Fixable Files ---');
    for (const fileInfo of this.errorStats.fixableFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.fixableErrors} fixable errors out of ${fileInfo.count} total`);
    }
    
    // Alchemical engine check
    this.checkAlchemicalEngine();
    
    // Recommendations
    console.log('\n--- Recommended Fix Order ---');
    console.log('1. Fix syntax errors first (breaks parsing)');
    console.log('2. Fix import/export errors (breaks module system)');
    console.log('3. Focus on alchemical engine errors (core functionality)');
    console.log('4. Fix component errors that affect rendering');
    console.log('5. Address type and function errors');
    
    console.log('\n--- Available Fix Scripts ---');
    console.log('• scripts/syntax-fixes/ - Fix syntax errors');
    console.log('• scripts/typescript-fixes/ - Fix TypeScript type errors');
    console.log('• scripts/elemental-fixes/ - Fix alchemical/elemental logic errors');
    console.log('• scripts/cuisine-fixes/ - Fix cuisine-specific errors');
    
    console.log('\n--- Advanced Analysis Commands ---');
    console.log('• Analyze specific directory:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-dir=src/components');
    console.log('• Analyze specific files:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-files="src/calculations/alchemize.ts src/utils/elements.ts"');
    console.log('• Filter by error category:');
    console.log('  node scripts/typescript-error-analysis.mjs --include-categories="Syntax Errors,Import/Export Errors"');
  }

  checkAlchemicalEngine() {
    console.log('\n--- Alchemical Engine Status ---');
    
    // Core alchemical files that are critical to the system
    const alchemicalFiles = [
      'src/calculations/alchemize.ts',
      'src/calculations/alchemicalEngine.ts',
      'src/calculations/alchemicalCalculations.ts',
      'src/calculations/alchemicalTransformation.ts',
      'src/utils/astrologyUtils',
      'src/utils/elementalMappings',
      'src/utils/astrologyUtils/index.ts',
      'src/utils/elementalMappings/index.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/elementalUtils.ts',
      'src/utils/elementalCompatibility.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/safeAstrology.ts',
      'src/services/AstrologicalService.ts',
      'src/services/ElementalCalculator.ts',
      'src/lib/alchemicalEngine.ts',
      'src/lib/elementalSystem.ts'
    ];
    
    const coreStructures = [
      'alchemize', 
      'elementalCompatibility',
      'calculateElementalBalance',
      'getElementalBreakdown',
      'calculateSeasonalScores',
      'planetInfo',
      'signInfo',
      'getComplementaryElement'
    ];
    
    // Check 1: File-level errors in alchemical files
    const alchemicalErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => {
        return alchemicalFiles.some(pattern => filePath.includes(pattern));
      })
      .sort(([,a], [,b]) => b.count - a.count);
    
    // Check 2: Look for errors in core structure functions
    const structureErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([_, data]) => {
        return data.errors.some(error => 
          coreStructures.some(structure => error.message.includes(structure))
        );
      });
    
    if (alchemicalErrors.length > 0) {
      console.log(`Found ${alchemicalErrors.length} alchemical engine files with errors:`);
      alchemicalErrors.slice(0, 5).forEach(([filePath, data]) => {
        console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${data.count} errors`);
        
        // Show example errors
        const syntaxErrors = data.errors.filter(e => e.category === 'Syntax Errors');
        if (syntaxErrors.length > 0) {
          console.log(`    First syntax error: ${syntaxErrors[0].message} (line ${syntaxErrors[0].line})`);
        }
      });
      
      console.log(`\nRecommendation: Fix alchemical engine errors as highest priority (after syntax).`);
      
      // Examine core alchemical structures
      if (structureErrors.length > 0) {
        console.log(`\nCRITICAL: Found errors in core alchemical structures:`);
        structureErrors.slice(0, 3).forEach(([filePath, data]) => {
          const structuralIssues = data.errors.filter(error => 
            coreStructures.some(structure => error.message.includes(structure))
          );
          
          console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${structuralIssues.length} structural issues`);
          structuralIssues.slice(0, 2).forEach(error => {
            console.log(`    ${error.message} (line ${error.line})`);
          });
        });
      }
      
      // Generate specific fix commands
      console.log(`\nFix Commands:`);
      console.log(`  1. node scripts/fix-project.mjs --category=elemental --dry-run`);
      console.log(`  2. node scripts/elemental-fixes/fix-alchemical-engine.js --file=${
        path.relative(ROOT_DIR, alchemicalErrors[0]?.[0] || '')
      }`);
    } else {
      console.log('No errors detected in alchemical engine core files.');
      
      // Verify core alchemical structures are present
      try {
        const alchemicalPath = path.join(ROOT_DIR, 'src/calculations/alchemize.ts');
        if (fs.existsSync(alchemicalPath)) {
          const content = fs.readFileSync(alchemicalPath, 'utf-8');
          const hasCoreFunction = content.includes('function alchemize(');
          if (hasCoreFunction) {
            console.log('Core alchemical engine structure verified.');
          } else {
            console.log('WARNING: alchemize() function not found in expected location.');
          }
        } else {
          console.log('WARNING: Core alchemical file not found at expected path.');
        }
      } catch (error) {
        console.log('Could not verify alchemical engine structure:', error.message);
      }
    }
    
    // Check for elemental principles violations
    this.checkElementalPrinciples();
  }

  checkElementalPrinciples() {
    console.log('\n--- Elemental Principles Check ---');
    
    // Rules from elemental-principles-guide.md
    const violationPatterns = [
      { 
        pattern: /(fire.*?oppos.*?water|water.*?oppos.*?fire|earth.*?oppos.*?Air|Air.*?oppos.*?earth)/i,
        description: 'Treating elements as opposing each other'
      },
      { 
        pattern: /balance.*?element/i,
        description: 'Attempting to balance elements against each other'
      },
      { 
        pattern: /getOpposingElement|oppositeElement|elementOpposites/i,
        description: 'Using the concept of opposing elements'
      }
    ];
    
    const elementalFiles = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => filePath.includes('elemental') || filePath.includes('Element'));
    
    if (elementalFiles.length === 0) {
      console.log('No elemental files found with errors.');
      return;
    }
    
    // Track files with potential violations for manual review
    const potentialViolations = [];
    
    // Process all error messages in elemental files
    elementalFiles.forEach(([filePath, data]) => {
      data.errors.forEach(error => {
        for (const {pattern, description} of violationPatterns) {
          if (pattern.test(error.message)) {
            potentialViolations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: error.line,
              message: error.message,
              violation: description
            });
            break;
          }
        }
      });
    });
    
    if (potentialViolations.length > 0) {
      console.log(`Found ${potentialViolations.length} potential elemental principles violations:`);
      potentialViolations.slice(0, 5).forEach(violation => {
        console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
      });
      
      console.log('\nRecommendation: Run elemental principles check');
      console.log('  node scripts/elemental-fixes/fix-elemental-logic.js --check-only');
    } else {
      console.log('No obvious elemental principles violations found in error messages.');
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(ROOT_DIR, 'typescript-error-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recommendations: {
        priorityOrder: [
          'Syntax Errors',
          'Import/Export Errors', 
          'Alchemical Engine Errors',
          'Component Errors',
          'Type Errors',
          'Function/Method Errors',
          'JSX/React Errors',
          'Configuration Errors'
        ],
        suggestedScripts: {
          'Syntax Errors': 'scripts/syntax-fixes/fix-syntax-errors.js',
          'Type Errors': 'scripts/typescript-fixes/fix-typescript-safely.js',
          'Import/Export Errors': 'scripts/typescript-fixes/fix-typescript-errors.js',
          'Alchemical Engine Errors': 'scripts/elemental-fixes/fix-alchemical-engine.js'
        },
        targetedFixes: [
          {
            pattern: `Fix missing semicolons and commas`,
            errorCodes: ['TS1005'],
            script: 'scripts/syntax-fixes/fix-syntax-errors.js'
          },
          {
            pattern: `Fix property assignment syntax`,
            errorCodes: ['TS1136'],
            script: 'scripts/syntax-fixes/fix-object-literals.js'
          },
          {
            pattern: `Fix JSX syntax errors`,
            errorCodes: ['TS1144'],
            script: 'scripts/syntax-fixes/fix-jsx-syntax.js'
          }
        ]
      },
      filters: {
        directories: Object.keys(DIRECTORY_CATEGORIES),
        errorCategories: Object.keys(ERROR_CATEGORIES),
        priorities: Object.entries(PRIORITY_MAPPING)
          .sort(([,a], [,b]) => a - b)
          .map(([cat]) => cat)
      }
    };
    
    if (!this.options.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      this.log(`Detailed report saved to ${reportPath}`);
    } else {
      this.log(`Would save detailed report to ${reportPath}`);
    }
  }

  // Generate a targeted fix plan for specific directories or error types
  generateFixPlan(targetCategory) {
    console.log(`\n=== Fix Plan for ${targetCategory} ===\n`);
    
    let targetFiles = [];
    let fixStrategy = '';
    
    // If we're targeting a directory category
    if (this.errorStats.errorsByDirectory[targetCategory]) {
      const dirData = this.errorStats.errorsByDirectory[targetCategory];
      targetFiles = dirData.files.slice(0, 10); // Just first 10 files
      
      // Determine most common error type
      const topErrorCategory = Object.entries(dirData.categories)
        .sort(([,a], [,b]) => b - a)
        [0][0];
      
      fixStrategy = `Focus first on ${topErrorCategory} which account for ${dirData.categories[topErrorCategory]} errors`;
    } 
    // If we're targeting an error category
    else if (this.errorStats.errorsByCategory[targetCategory]) {
      const categoryData = this.errorStats.errorsByCategory[targetCategory];
      const filesByCategory = Object.entries(this.errorStats.errorsByFile)
        .filter(([, data]) => data.categories.has(targetCategory))
        .sort(([,a], [,b]) => b.count - a.count);
      
      targetFiles = filesByCategory.slice(0, 10).map(([file]) => file);
      
      fixStrategy = `Use scripts/fix-project.mjs --category=${targetCategory.toLowerCase().split(' ')[0]}`;
    }
    
    console.log(`Top files to fix (${targetFiles.length}):`);
    targetFiles.forEach(file => {
      console.log(`- ${path.relative(ROOT_DIR, file)}`);
    });
    
    console.log(`\nFix strategy: ${fixStrategy}`);
    console.log('\nSequential fix commands:');
    console.log(`1. node scripts/fix-project.mjs --target=${targetFiles[0]} --dry-run`);
    console.log(`2. yarn build --verbose`);
    console.log(`3. node scripts/typescript-error-analysis.mjs --target-files="${targetFiles[0]}"`);
  }

  async analyzeFilesDirectly() {
    this.log('Analyzing files directly for syntax errors...');
    
    let targetFiles = this.options.targetFiles;
    
    // If no specific files are targeted, use critical files
    if (!targetFiles || targetFiles.length === 0) {
      targetFiles = findCriticalFiles();
      this.log(`No files specified, using ${targetFiles.length} known critical files`);
    }
    
    const analyzedFiles = [];
    
    for (const filePath of targetFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          this.log(`File not found: ${filePath}`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileErrors = this.detectSyntaxErrors(content, filePath);
        
        analyzedFiles.push({
          file: filePath,
          errorCount: fileErrors.length
        });
        
        fileErrors.forEach(error => {
          this.addError(
            filePath, 
            error.code || 'TS9999', 
            error.message,
            error.line,
            error.column || 1
          );
        });
      } catch (err) {
        this.log(`Error analyzing file ${filePath}: ${err.message}`);
      }
    }
    
    this.log(`Direct analysis complete. Analyzed ${analyzedFiles.length} files.`);
    this.errorStats.totalFiles = analyzedFiles.length;
    this.errorStats.totalErrors = Object.values(this.errorStats.errorsByFile)
      .reduce((total, file) => total + file.count, 0);
    
    this.calculateStatistics();
    return this.errorStats;
  }
  
  detectSyntaxErrors(content, filePath) {
    const errors = [];
    const lines = content.split('\n');
    
    // Simple patterns to detect common syntax errors
    const errorPatterns = [
      { 
        pattern: /([{,:;]\s*})/g,
        code: 'TS1005',
        message: 'Unexpected token - object or block syntax error' 
      },
      { 
        pattern: /(\w+:.*?:)/g,  
        code: 'TS1005',
        message: 'Multiple colons in parameter/type declaration' 
      },
      { 
        pattern: /(\w+:\s*\w+:)/g,
        code: 'TS1005',
        message: 'Double type annotation' 
      },
      { 
        pattern: /(async.*?=>\s*{\s*\w+\s*})/g,
        code: 'TS1005',
        message: 'Invalid async arrow function' 
      },
      { 
        pattern: /export\s+let.*?=.*?,/g,
        code: 'TS1005',
        message: 'Invalid export with comma' 
      },
      { 
        pattern: /[^{},;\s]\s*}/g,
        code: 'TS1068',
        message: 'Unexpected token before closing bracket' 
      },
      {
        pattern: /catch.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete catch block'
      },
      {
        pattern: /try.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete try block'
      },
      {
        pattern: /[=([]\s*$/gm,
        code: 'TS1005',
        message: 'Expression expected'
      }
    ];
    
    // Check each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const {pattern, code, message} of errorPatterns) {
        if (pattern.test(line)) {
          errors.push({
            line: i + 1,
            column: line.search(pattern) + 1,
            code,
            message,
            category: 'Syntax Errors'
          });
        }
      }
      
      // Specific checks for function parameter patterns
      if (/(function|async|export)\s+\w+\s*\(.*?\w+\s*:\s*\w+\s*:\s*/.test(line)) {
        errors.push({
          line: i + 1,
          column: line.indexOf(':') + 1,
          code: 'TS1005',
          message: 'Invalid parameter type syntax',
          category: 'Syntax Errors'
        });
      }
      
      // Check for missing closing parentheses/curly braces with context
      if (i > 0 && lines[i-1].includes('(') && !lines[i-1].includes(')') && 
          line.trim().startsWith(')') && !line.includes('(')) {
        errors.push({
          line: i,
          column: 1,
          code: 'TS1005',
          message: 'Misplaced closing parenthesis',
          category: 'Syntax Errors'
        });
      }
    }
    
    // Look for function parameter pattern issues across multiple lines
    const content2Line = content.replace(/\n/g, ' ');
    const functionParamPattern = /\(\s*\w+\s*:\s*\w+\s*:\s*[^)]*?\)/g;
    let match;
    
    while ((match = functionParamPattern.exec(content2Line)) !== null) {
      // Find line number for this match
      const upToMatch = content2Line.substring(0, match.index);
      const lineNumber = upToMatch.split(' ').filter(l => l === '\n').length + 1;
      
      errors.push({
        line: lineNumber,
        column: 1,
        code: 'TS1005',
        message: 'Invalid parameter type declaration',
        category: 'Syntax Errors'
      });
    }
    
    return errors;
  }
  
  async showFileWithErrors(filePath) {
    console.log(`\n=== File Content With Errors: ${path.basename(filePath)} ===`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Get errors for this file
      const fileErrors = this.errorStats.errorsByFile[filePath]?.errors || [];
      
      // Sort errors by line number
      const sortedErrors = [...fileErrors].sort((a, b) => a.line - b.line);
      
      // Create map of line numbers to errors
      const errorsByLine = {};
      sortedErrors.forEach(error => {
        if (!errorsByLine[error.line]) {
          errorsByLine[error.line] = [];
        }
        errorsByLine[error.line].push(error);
      });
      
      // Show lines with errors
      const contextLines = 2; // Show this many lines before and after errors
      
      // Find line ranges with errors, including context
      const lineRanges = [];
      let currentRange = null;
      
      for (const lineNum in errorsByLine) {
        const line = parseInt(lineNum);
        const start = Math.max(1, line - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        
        if (!currentRange || start > currentRange.end + 1) {
          if (currentRange) {
            lineRanges.push(currentRange);
          }
          currentRange = { start, end };
        } else {
          currentRange.end = Math.max(currentRange.end, end);
        }
      }
      
      if (currentRange) {
        lineRanges.push(currentRange);
      }
      
      // Display the line ranges with errors
      for (const range of lineRanges) {
        console.log(`\n${'-'.repeat(80)}`);
        for (let i = range.start; i <= range.end; i++) {
          const line = lines[i - 1] || '';
          const hasError = errorsByLine[i];
          
          const lineDisplay = hasError 
            ? `${i.toString().padStart(4, ' ')}* | ${line.slice(0, 120)}`
            : `${i.toString().padStart(4, ' ')}  | ${line.slice(0, 120)}`;
          
          console.log(lineDisplay);
          
          if (hasError) {
            errorsByLine[i].forEach(error => {
              // Add an indicator pointing to the error position
              const pointer = ' '.repeat(8 + error.column) + '^';
              console.log(`${pointer} ${error.message}`);
            });
          }
        }
      }
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Total: ${sortedErrors.length} errors in ${path.basename(filePath)}`);
      
    } catch (err) {
      console.error(`Error displaying file: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--execute'),
    targetDir: null,
    targetFiles: null,
    excludeDirs: [],
    excludeErrorCodes: [],
    includeErrorCodes: [],
    includeCategories: null,
    generateFixPlan: null,
    analysisMode: 'full', // 'full', 'syntax-only', 'alchemical-only'
  };
  
  // Parse complex arguments
  for (const arg of args) {
    if (arg.startsWith('--target-dir=')) {
      options.targetDir = arg.split('=')[1];
    } else if (arg.startsWith('--target-files=')) {
      options.targetFiles = arg.split('=')[1].split(' ');
    } else if (arg.startsWith('--exclude-dirs=')) {
      options.excludeDirs = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--exclude-errors=')) {
      options.excludeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-errors=')) {
      options.includeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-categories=')) {
      options.includeCategories = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--fix-plan=')) {
      options.generateFixPlan = arg.split('=')[1];
    } else if (arg === '--syntax-only') {
      options.analysisMode = 'syntax-only';
      options.includeCategories = ['Syntax Errors'];
    } else if (arg === '--alchemical-only') {
      options.analysisMode = 'alchemical-only';
      options.targetFiles = findAlchemicalFiles();
    } else if (arg === '--critical-files-only') {
      options.targetFiles = findCriticalFiles();
    } else if (arg === '--direct-parse') {
      // This flag skips tsc and directly analyzes files for errors
      options.useDirectParse = true;
    }
  }
  
  console.log('=== TypeScript Error Analysis Tool ===');
  console.log(`Mode: ${options.dryRun ? 'ANALYSIS ONLY' : 'ANALYSIS + SAVE'}`);
  
  if (options.targetDir) {
    console.log(`Target Directory: ${options.targetDir}`);
  }
  
  if (options.targetFiles) {
    console.log(`Target Files: ${Array.isArray(options.targetFiles) ? 
      options.targetFiles.length + ' files targeted' : 
      options.targetFiles}`);
  }
  
  if (options.analysisMode !== 'full') {
    console.log(`Analysis Mode: ${options.analysisMode}`);
  }
  
  if (options.useDirectParse) {
    console.log('Using direct file parsing (bypassing TypeScript compiler)');
  }
  
  console.log('Add --execute flag to save detailed report');
  console.log('');
  
  const analyzer = new TypeScriptErrorAnalyzer(options);
  
  try {
    if (options.useDirectParse) {
      await analyzer.analyzeFilesDirectly();
    } else {
      await analyzer.analyzeErrors();
    }
    
    analyzer.generateReport();
    
    if (options.generateFixPlan) {
      analyzer.generateFixPlan(options.generateFixPlan);
    }
    
    await analyzer.saveDetailedReport();
    
    // For specific target files, also print the original content with errors
    if (options.targetFiles && options.targetFiles.length === 1) {
      const file = options.targetFiles[0];
      if (fs.existsSync(file)) {
        await analyzer.showFileWithErrors(file);
      }
    }
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

// Helper functions for specialized file targeting

function findAlchemicalFiles() {
  const alchemicalPatterns = [
    'src/calculations/alchemize.ts',
    'src/calculations/alchemical*.ts',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings',
    'src/services/AstrologicalService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  alchemicalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}*" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

function findCriticalFiles() {
  // These are files with known critical errors that block parsing
  // We'll start with test scripts that have many syntax errors
  const criticalPatterns = [
    'test-scripts/reliableAstronomy.ts',
    'test-scripts/safeAccess.ts',
    'test-scripts/safeAstrology.ts',
    'test-scripts/seasonalCalculations.ts',
    'src/context/AstrologicalContext.tsx',
    'src/context/ChartContext.tsx',
    'src/data/cuisineFlavorProfiles.ts',
    'src/data/recipes.ts',
    'src/services/RecommendationAdapter.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  criticalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

// Make main async
async function runMain() {
  await main();
}

runMain(); |earth.*?oppos.*?Air|Air.*?oppos.*?earth)/i,
        description: 'Treating elements as opposing each other'
      },
      { 
        pattern: /balance.*?element/i,
        description: 'Attempting to balance elements against each other'
      },
      { 
        pattern: /getOpposingElement|oppositeElement|elementOpposites/i,
        description: 'Using the concept of opposing elements'
      }
    ];
    
    const elementalFiles = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => filePath.includes('elemental') || filePath.includes('Element'));
    
    if (elementalFiles.length === 0) {
      console.log('No elemental files found with errors.');
      return;
    }
    
    // Track files with potential violations for manual review
    const potentialViolations = [];
    
    // Process all error messages in elemental files
    elementalFiles.forEach(([filePath, data]) => {
      data.errors.forEach(error => {
        for (const {pattern, description} of violationPatterns) {
          if (pattern.test(error.message)) {
            potentialViolations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: error.line,
              message: error.message,
              violation: description
            });
            break;
          }
        }
      });
    });
    
    if (potentialViolations.length > 0) {
      console.log(`Found ${potentialViolations.length} potential elemental principles violations:`);
      potentialViolations.slice(0, 5).forEach(violation => {
        console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
      });
      
      console.log('\nRecommendation: Run elemental principles check');
      console.log('  node scripts/elemental-fixes/fix-elemental-logic.js --check-only');
    } else {
      console.log('No obvious elemental principles violations found in error messages.');
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(ROOT_DIR, 'typescript-error-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recommendations: {
        priorityOrder: [
          'Syntax Errors',
          'Import/Export Errors', 
          'Alchemical Engine Errors',
          'Component Errors',
          'Type Errors',
          'Function/Method Errors',
          'JSX/React Errors',
          'Configuration Errors'
        ],
        suggestedScripts: {
          'Syntax Errors': 'scripts/syntax-fixes/fix-syntax-errors.js',
          'Type Errors': 'scripts/typescript-fixes/fix-typescript-safely.js',
          'Import/Export Errors': 'scripts/typescript-fixes/fix-typescript-errors.js',
          'Alchemical Engine Errors': 'scripts/elemental-fixes/fix-alchemical-engine.js'
        },
        targetedFixes: [
          {
            pattern: `Fix missing semicolons and commas`,
            errorCodes: ['TS1005'],
            script: 'scripts/syntax-fixes/fix-syntax-errors.js'
          },
          {
            pattern: `Fix property assignment syntax`,
            errorCodes: ['TS1136'],
            script: 'scripts/syntax-fixes/fix-object-literals.js'
          },
          {
            pattern: `Fix JSX syntax errors`,
            errorCodes: ['TS1144'],
            script: 'scripts/syntax-fixes/fix-jsx-syntax.js'
          }
        ]
      },
      filters: {
        directories: Object.keys(DIRECTORY_CATEGORIES),
        errorCategories: Object.keys(ERROR_CATEGORIES),
        priorities: Object.entries(PRIORITY_MAPPING)
          .sort(([,a], [,b]) => a - b)
          .map(([cat]) => cat)
      }
    };
    
    if (!this.options.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      this.log(`Detailed report saved to ${reportPath}`);
    } else {
      this.log(`Would save detailed report to ${reportPath}`);
    }
  }

  // Generate a targeted fix plan for specific directories or error types
  generateFixPlan(targetCategory) {
    console.log(`\n=== Fix Plan for ${targetCategory} ===\n`);
    
    let targetFiles = [];
    let fixStrategy = '';
    
    // If we're targeting a directory category
    if (this.errorStats.errorsByDirectory[targetCategory]) {
      const dirData = this.errorStats.errorsByDirectory[targetCategory];
      targetFiles = dirData.files.slice(0, 10); // Just first 10 files
      
      // Determine most common error type
      const topErrorCategory = Object.entries(dirData.categories)
        .sort(([,a], [,b]) => b - a)
        [0][0];
      
      fixStrategy = `Focus first on ${topErrorCategory} which account for ${dirData.categories[topErrorCategory]} errors`;
    } 
    // If we're targeting an error category
    else if (this.errorStats.errorsByCategory[targetCategory]) {
      const categoryData = this.errorStats.errorsByCategory[targetCategory];
      const filesByCategory = Object.entries(this.errorStats.errorsByFile)
        .filter(([, data]) => data.categories.has(targetCategory))
        .sort(([,a], [,b]) => b.count - a.count);
      
      targetFiles = filesByCategory.slice(0, 10).map(([file]) => file);
      
      fixStrategy = `Use scripts/fix-project.mjs --category=${targetCategory.toLowerCase().split(' ')[0]}`;
    }
    
    console.log(`Top files to fix (${targetFiles.length}):`);
    targetFiles.forEach(file => {
      console.log(`- ${path.relative(ROOT_DIR, file)}`);
    });
    
    console.log(`\nFix strategy: ${fixStrategy}`);
    console.log('\nSequential fix commands:');
    console.log(`1. node scripts/fix-project.mjs --target=${targetFiles[0]} --dry-run`);
    console.log(`2. yarn build --verbose`);
    console.log(`3. node scripts/typescript-error-analysis.mjs --target-files="${targetFiles[0]}"`);
  }

  async analyzeFilesDirectly() {
    this.log('Analyzing files directly for syntax errors...');
    
    let targetFiles = this.options.targetFiles;
    
    // If no specific files are targeted, use critical files
    if (!targetFiles || targetFiles.length === 0) {
      targetFiles = findCriticalFiles();
      this.log(`No files specified, using ${targetFiles.length} known critical files`);
    }
    
    const analyzedFiles = [];
    
    for (const filePath of targetFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          this.log(`File not found: ${filePath}`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileErrors = this.detectSyntaxErrors(content, filePath);
        
        analyzedFiles.push({
          file: filePath,
          errorCount: fileErrors.length
        });
        
        fileErrors.forEach(error => {
          this.addError(
            filePath, 
            error.code || 'TS9999', 
            error.message,
            error.line,
            error.column || 1
          );
        });
      } catch (err) {
        this.log(`Error analyzing file ${filePath}: ${err.message}`);
      }
    }
    
    this.log(`Direct analysis complete. Analyzed ${analyzedFiles.length} files.`);
    this.errorStats.totalFiles = analyzedFiles.length;
    this.errorStats.totalErrors = Object.values(this.errorStats.errorsByFile)
      .reduce((total, file) => total + file.count, 0);
    
    this.calculateStatistics();
    return this.errorStats;
  }
  
  detectSyntaxErrors(content, filePath) {
    const errors = [];
    const lines = content.split('\n');
    
    // Simple patterns to detect common syntax errors
    const errorPatterns = [
      { 
        pattern: /([{,:;]\s*})/g,
        code: 'TS1005',
        message: 'Unexpected token - object or block syntax error' 
      },
      { 
        pattern: /(\w+:.*?:)/g,  
        code: 'TS1005',
        message: 'Multiple colons in parameter/type declaration' 
      },
      { 
        pattern: /(\w+:\s*\w+:)/g,
        code: 'TS1005',
        message: 'Double type annotation' 
      },
      { 
        pattern: /(async.*?=>\s*{\s*\w+\s*})/g,
        code: 'TS1005',
        message: 'Invalid async arrow function' 
      },
      { 
        pattern: /export\s+let.*?=.*?,/g,
        code: 'TS1005',
        message: 'Invalid export with comma' 
      },
      { 
        pattern: /[^{},;\s]\s*}/g,
        code: 'TS1068',
        message: 'Unexpected token before closing bracket' 
      },
      {
        pattern: /catch.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete catch block'
      },
      {
        pattern: /try.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete try block'
      },
      {
        pattern: /[=([]\s*$/gm,
        code: 'TS1005',
        message: 'Expression expected'
      }
    ];
    
    // Check each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const {pattern, code, message} of errorPatterns) {
        if (pattern.test(line)) {
          errors.push({
            line: i + 1,
            column: line.search(pattern) + 1,
            code,
            message,
            category: 'Syntax Errors'
          });
        }
      }
      
      // Specific checks for function parameter patterns
      if (/(function|async|export)\s+\w+\s*\(.*?\w+\s*:\s*\w+\s*:\s*/.test(line)) {
        errors.push({
          line: i + 1,
          column: line.indexOf(':') + 1,
          code: 'TS1005',
          message: 'Invalid parameter type syntax',
          category: 'Syntax Errors'
        });
      }
      
      // Check for missing closing parentheses/curly braces with context
      if (i > 0 && lines[i-1].includes('(') && !lines[i-1].includes(')') && 
          line.trim().startsWith(')') && !line.includes('(')) {
        errors.push({
          line: i,
          column: 1,
          code: 'TS1005',
          message: 'Misplaced closing parenthesis',
          category: 'Syntax Errors'
        });
      }
    }
    
    // Look for function parameter pattern issues across multiple lines
    const content2Line = content.replace(/\n/g, ' ');
    const functionParamPattern = /\(\s*\w+\s*:\s*\w+\s*:\s*[^)]*?\)/g;
    let match;
    
    while ((match = functionParamPattern.exec(content2Line)) !== null) {
      // Find line number for this match
      const upToMatch = content2Line.substring(0, match.index);
      const lineNumber = upToMatch.split(' ').filter(l => l === '\n').length + 1;
      
      errors.push({
        line: lineNumber,
        column: 1,
        code: 'TS1005',
        message: 'Invalid parameter type declaration',
        category: 'Syntax Errors'
      });
    }
    
    return errors;
  }
  
  async showFileWithErrors(filePath) {
    console.log(`\n=== File Content With Errors: ${path.basename(filePath)} ===`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Get errors for this file
      const fileErrors = this.errorStats.errorsByFile[filePath]?.errors || [];
      
      // Sort errors by line number
      const sortedErrors = [...fileErrors].sort((a, b) => a.line - b.line);
      
      // Create map of line numbers to errors
      const errorsByLine = {};
      sortedErrors.forEach(error => {
        if (!errorsByLine[error.line]) {
          errorsByLine[error.line] = [];
        }
        errorsByLine[error.line].push(error);
      });
      
      // Show lines with errors
      const contextLines = 2; // Show this many lines before and after errors
      
      // Find line ranges with errors, including context
      const lineRanges = [];
      let currentRange = null;
      
      for (const lineNum in errorsByLine) {
        const line = parseInt(lineNum);
        const start = Math.max(1, line - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        
        if (!currentRange || start > currentRange.end + 1) {
          if (currentRange) {
            lineRanges.push(currentRange);
          }
          currentRange = { start, end };
        } else {
          currentRange.end = Math.max(currentRange.end, end);
        }
      }
      
      if (currentRange) {
        lineRanges.push(currentRange);
      }
      
      // Display the line ranges with errors
      for (const range of lineRanges) {
        console.log(`\n${'-'.repeat(80)}`);
        for (let i = range.start; i <= range.end; i++) {
          const line = lines[i - 1] || '';
          const hasError = errorsByLine[i];
          
          const lineDisplay = hasError 
            ? `${i.toString().padStart(4, ' ')}* | ${line.slice(0, 120)}`
            : `${i.toString().padStart(4, ' ')}  | ${line.slice(0, 120)}`;
          
          console.log(lineDisplay);
          
          if (hasError) {
            errorsByLine[i].forEach(error => {
              // Add an indicator pointing to the error position
              const pointer = ' '.repeat(8 + error.column) + '^';
              console.log(`${pointer} ${error.message}`);
            });
          }
        }
      }
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Total: ${sortedErrors.length} errors in ${path.basename(filePath)}`);
      
    } catch (err) {
      console.error(`Error displaying file: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--execute'),
    targetDir: null,
    targetFiles: null,
    excludeDirs: [],
    excludeErrorCodes: [],
    includeErrorCodes: [],
    includeCategories: null,
    generateFixPlan: null,
    analysisMode: 'full', // 'full', 'syntax-only', 'alchemical-only'
  };
  
  // Parse complex arguments
  for (const arg of args) {
    if (arg.startsWith('--target-dir=')) {
      options.targetDir = arg.split('=')[1];
    } else if (arg.startsWith('--target-files=')) {
      options.targetFiles = arg.split('=')[1].split(' ');
    } else if (arg.startsWith('--exclude-dirs=')) {
      options.excludeDirs = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--exclude-errors=')) {
      options.excludeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-errors=')) {
      options.includeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-categories=')) {
      options.includeCategories = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--fix-plan=')) {
      options.generateFixPlan = arg.split('=')[1];
    } else if (arg === '--syntax-only') {
      options.analysisMode = 'syntax-only';
      options.includeCategories = ['Syntax Errors'];
    } else if (arg === '--alchemical-only') {
      options.analysisMode = 'alchemical-only';
      options.targetFiles = findAlchemicalFiles();
    } else if (arg === '--critical-files-only') {
      options.targetFiles = findCriticalFiles();
    } else if (arg === '--direct-parse') {
      // This flag skips tsc and directly analyzes files for errors
      options.useDirectParse = true;
    }
  }
  
  console.log('=== TypeScript Error Analysis Tool ===');
  console.log(`Mode: ${options.dryRun ? 'ANALYSIS ONLY' : 'ANALYSIS + SAVE'}`);
  
  if (options.targetDir) {
    console.log(`Target Directory: ${options.targetDir}`);
  }
  
  if (options.targetFiles) {
    console.log(`Target Files: ${Array.isArray(options.targetFiles) ? 
      options.targetFiles.length + ' files targeted' : 
      options.targetFiles}`);
  }
  
  if (options.analysisMode !== 'full') {
    console.log(`Analysis Mode: ${options.analysisMode}`);
  }
  
  if (options.useDirectParse) {
    console.log('Using direct file parsing (bypassing TypeScript compiler)');
  }
  
  console.log('Add --execute flag to save detailed report');
  console.log('');
  
  const analyzer = new TypeScriptErrorAnalyzer(options);
  
  try {
    if (options.useDirectParse) {
      await analyzer.analyzeFilesDirectly();
    } else {
      await analyzer.analyzeErrors();
    }
    
    analyzer.generateReport();
    
    if (options.generateFixPlan) {
      analyzer.generateFixPlan(options.generateFixPlan);
    }
    
    await analyzer.saveDetailedReport();
    
    // For specific target files, also print the original content with errors
    if (options.targetFiles && options.targetFiles.length === 1) {
      const file = options.targetFiles[0];
      if (fs.existsSync(file)) {
        await analyzer.showFileWithErrors(file);
      }
    }
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

// Helper functions for specialized file targeting

function findAlchemicalFiles() {
  const alchemicalPatterns = [
    'src/calculations/alchemize.ts',
    'src/calculations/alchemical*.ts',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings',
    'src/services/AstrologicalService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  alchemicalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}*" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

function findCriticalFiles() {
  // These are files with known critical errors that block parsing
  // We'll start with test scripts that have many syntax errors
  const criticalPatterns = [
    'test-scripts/reliableAstronomy.ts',
    'test-scripts/safeAccess.ts',
    'test-scripts/safeAstrology.ts',
    'test-scripts/seasonalCalculations.ts',
    'src/context/AstrologicalContext.tsx',
    'src/context/ChartContext.tsx',
    'src/data/cuisineFlavorProfiles.ts',
    'src/data/recipes.ts',
    'src/services/RecommendationAdapter.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  criticalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

// Make main async
async function runMain() {
  await main();
}

runMain(); |water.*?oppos.*?22526Fire#!/usr/bin/env node

/**
 * TypeScript Error Analysis Tool
 * Analyzes TypeScript errors and categorizes them by type and priority
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Error categorization patterns
const ERROR_CATEGORIES = {
  'Syntax Errors': [
    'TS1005', // Expected token
    'TS1109', // Expression expected
    'TS1128', // Declaration or statement expected
    'TS1144', // '{' or ';' expected
    'TS1472', // 'catch' or 'finally' expected
    'TS1011', // Element access expression should take an argument
    'TS1136', // Property assignment expected
    'TS1434', // Unexpected keyword or identifier
    'TS1003', // Identifier expected
    'TS1131', // Property or signature expected
    'TS1068', // Unexpected token. '}' expected
    'TS1127', // Invalid character
  ],
  'Type Errors': [
    'TS2304', // Cannot find name
    'TS2322', // Type is not assignable
    'TS2339', // Property does not exist
    'TS2345', // Argument of type is not assignable
    'TS2349', // This expression is not callable
    'TS2552', // Cannot find name
    'TS2571', // Object is of type 'unknown'
    'TS2580', // Cannot find name
    'TS2564', // Property has no initializer and is not definitely assigned
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
    'TS2365', // Operator cannot be applied to types
  ],
  'Import/Export Errors': [
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2503', // Cannot find namespace
    'TS2300', // Duplicate identifier
    'TS1192', // Module cannot be imported
    'TS1479', // The current file is a CommonJS module
    'TS1259', // Module can only be default-imported
  ],
  'Function/Method Errors': [
    'TS2554', // Expected arguments but got
    'TS2556', // A spread argument must either have a tuple type
    'TS2559', // Type has no properties in common
    'TS2740', // Type is missing properties
    'TS2341', // Property is private
    'TS2722', // Cannot invoke an object which is possibly undefined
    'TS2769', // No overload matches this call
  ],
  'JSX/React Errors': [
    'TS2686', // React refers to a UMD global
    'TS2583', // Cannot find name 'React'
    'TS2769', // No overload matches this call
    'TS2605', // JSX element type is not a constructor function
    'TS2739', // Type is missing properties required by JSX.IntrinsicElements
    'TS2746', // This JSX tag's children are of type 'ReactNode'
  ],
  'Configuration Errors': [
    'TS2688', // Cannot find type definition file
    'TS2691', // An import path cannot end with a '.ts' extension
    'TS6054', // File is not under 'rootDir'
    'TS6059', // File is not in project source
    'TS18028', // Private identifiers are only available when targeting ECMAScript 2015
  ]
};

// Priority levels for different error types
const PRIORITY_MAPPING = {
  'Syntax Errors': 1, // Highest priority - breaks parsing
  'Import/Export Errors': 2, // High priority - breaks module system
  'Type Errors': 3, // Medium priority - type safety
  'Function/Method Errors': 4, // Medium priority - runtime issues
  'JSX/React Errors': 5, // Lower priority - often configuration
  'Configuration Errors': 6 // Lowest priority - project setup
};

// Directory categorization for targeted fixes
const DIRECTORY_CATEGORIES = {
  'Component Errors': [
    'src/components',
    'src/ui',
    'src/AstrologyChart'
  ],
  'Data Layer Errors': [
    'src/data',
    'src/services',
    'src/context',
    'src/contexts'
  ],
  'API Errors': [
    'src/api',
    'src/app/api',
    'pages/api'
  ],
  'Alchemical Engine Errors': [
    'src/calculations',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings'
  ],
  'Test Errors': [
    'src/__tests__',
    'tests',
    'test-scripts'
  ]
};

class TypeScriptErrorAnalyzer {
  constructor(options = {}) {
    this.options = {
      dryRun: true,
      targetDir: null,
      targetFiles: null,
      excludeDirs: [],
      excludeErrorCodes: [],
      includeErrorCodes: [],
      maxErrorsPerFile: 50,
      ...options
    };
    
    this.errorStats = {
      totalErrors: 0,
      totalFiles: 0,
      errorsByCategory: {},
      errorsByFile: {},
      errorsByDirectory: {},
      topErrorFiles: [],
      criticalFiles: [],
      fixableFiles: []
    };
  }

  log(message) {
    const prefix = this.options.dryRun ? '[ANALYSIS]' : '[FIXING]';
    console.log(`${prefix} ${message}`);
  }

  async analyzeErrors() {
    this.log('Running TypeScript compiler to analyze errors...');
    
    // Create a temporary directory to store specific files for targeted analysis
    if (this.options.targetFiles && Array.isArray(this.options.targetFiles) && this.options.targetFiles.length > 0) {
      try {
        this.log(`Analyzing ${this.options.targetFiles.length} specific files...`);
        
        // Create single string output for errors across all targeted files
        let allErrors = '';
        
        // Process each file individually for more reliable error checking
        for (const targetFile of this.options.targetFiles) {
          try {
            const output = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}" 2>&1 || true`, {
              cwd: ROOT_DIR,
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024
            });
            
            if (output && !output.includes('error TS5083')) { // Skip "Cannot read file" errors
              allErrors += output + '\n';
            }
          } catch (err) {
            if (err.stdout) {
              allErrors += err.stdout + '\n';
            }
          }
        }
        
        return this.parseErrorOutput(allErrors);
      } catch (error) {
        console.error('Error analyzing targeted files:', error.message);
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        }
        throw error;
      }
    } else {
      // Regular full project analysis
      try {
        // Build tsc command with target options
        let tscCommand = 'npx tsc --noEmit --skipLibCheck';
        
        if (this.options.targetDir) {
          // Check specific directory
          tscCommand = `find ${path.join(ROOT_DIR, this.options.targetDir)} -name "*.ts" -o -name "*.tsx" | xargs npx tsc --noEmit --skipLibCheck`;
        }
        
        // Run TypeScript compiler and capture output
        const output = execSync(tscCommand + ' 2>&1 || true', {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer to handle large error output
        });
        
        return this.parseErrorOutput(output);
      } catch (error) {
        // TypeScript errors will cause execSync to throw, but we want the output
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        } else {
          console.error('Error running TypeScript compiler:', error.message);
          throw error;
        }
      }
    }
  }

  parseErrorOutput(output) {
    if (!output || output.trim() === '') {
      console.log('No output from TypeScript compiler to parse.');
      return this.errorStats;
    }
    
    const lines = output.split('\n');
    
    // More flexible error pattern that handles variations in formatting
    const errorPattern = /([^()\s]+\.tsx?):(\d+):(\d+)(?:\s+-\s+|\s+)error\s+(TS\d+)(?::\s+|\s+)(.+)/;
    const summaryPattern = /Found\s+(\d+)\s+errors?\s+in\s+(\d+)\s+files?/;
    
    console.log(`Processing ${lines.length} lines of compiler output...`);
    
    let errorCount = 0;
    let parsedErrors = 0;
    let errorFiles = new Set();
    
    for (const line of lines) {
      const errorMatch = line.match(errorPattern);
      const summaryMatch = line.match(summaryPattern);
      
      if (errorMatch) {
        errorCount++;
        let [, filePath, lineNum, colNum, errorCode, message] = errorMatch;
        
        // Resolve file path if not absolute
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(ROOT_DIR, filePath);
        }
        
        // Apply filters
        if (this.shouldSkipError(filePath, errorCode)) {
          continue;
        }
        
        errorFiles.add(filePath);
        this.addError(filePath, errorCode, message, parseInt(lineNum), parseInt(colNum));
        parsedErrors++;
        
        // Log progress for large error sets
        if (parsedErrors % 1000 === 0) {
          console.log(`Processed ${parsedErrors} errors...`);
        }
      } else if (summaryMatch) {
        this.errorStats.totalErrors = parseInt(summaryMatch[1]);
        this.errorStats.totalFiles = parseInt(summaryMatch[2]);
      }
    }
    
    // If we didn't find a summary pattern, calculate totals from our processing
    if (!this.errorStats.totalErrors) {
      this.errorStats.totalErrors = errorCount;
      this.errorStats.totalFiles = errorFiles.size;
    }
    
    console.log(`Completed parsing. Found ${this.errorStats.totalErrors} errors in ${this.errorStats.totalFiles} files.`);
    
    this.calculateStatistics();
    return this.errorStats;
  }

  shouldSkipError(filePath, errorCode) {
    // Skip if file is in excluded directories
    if (this.options.excludeDirs.some(dir => filePath.includes(dir))) {
      return true;
    }
    
    // Skip if error code is explicitly excluded
    if (this.options.excludeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Skip if we're filtering to specific error codes and this isn't one
    if (this.options.includeErrorCodes.length > 0 && 
        !this.options.includeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  addError(filePath, errorCode, message, line, column) {
    const category = this.categorizeError(errorCode);
    const dirCategory = this.categorizeDirectory(filePath);
    
    // Initialize category if not exists
    if (!this.errorStats.errorsByCategory[category]) {
      this.errorStats.errorsByCategory[category] = {
        count: 0,
        errors: [],
        priority: PRIORITY_MAPPING[category] || 9
      };
    }
    
    // Initialize file if not exists
    if (!this.errorStats.errorsByFile[filePath]) {
      this.errorStats.errorsByFile[filePath] = {
        count: 0,
        errors: [],
        categories: new Set(),
        dirCategory
      };
    }
    
    // Initialize directory category if not exists
    if (dirCategory && !this.errorStats.errorsByDirectory[dirCategory]) {
      this.errorStats.errorsByDirectory[dirCategory] = {
        count: 0,
        files: new Set(),
        categories: {}
      };
    }
    
    const errorInfo = {
      code: errorCode,
      message,
      line,
      column,
      category,
      filePath: path.relative(ROOT_DIR, filePath)
    };
    
    // Enforce max errors per file to prevent memory issues
    if (this.errorStats.errorsByFile[filePath].errors.length < this.options.maxErrorsPerFile) {
      this.errorStats.errorsByCategory[category].count++;
      this.errorStats.errorsByCategory[category].errors.push(errorInfo);
      
      this.errorStats.errorsByFile[filePath].errors.push(errorInfo);
    }
    
    this.errorStats.errorsByFile[filePath].count++;
    this.errorStats.errorsByFile[filePath].categories.add(category);
    
    // Update directory statistics if applicable
    if (dirCategory) {
      this.errorStats.errorsByDirectory[dirCategory].count++;
      this.errorStats.errorsByDirectory[dirCategory].files.add(filePath);
      
      if (!this.errorStats.errorsByDirectory[dirCategory].categories[category]) {
        this.errorStats.errorsByDirectory[dirCategory].categories[category] = 0;
      }
      this.errorStats.errorsByDirectory[dirCategory].categories[category]++;
    }
  }

  categorizeError(errorCode) {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
      if (codes.includes(errorCode)) {
        return category;
      }
    }
    return 'Other Errors';
  }

  categorizeDirectory(filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    for (const [category, patterns] of Object.entries(DIRECTORY_CATEGORIES)) {
      if (patterns.some(pattern => relPath.startsWith(pattern))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  calculateStatistics() {
    // Sort files by error count
    const fileEntries = Object.entries(this.errorStats.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count);
    
    this.errorStats.topErrorFiles = fileEntries.slice(0, 20)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        categories: Array.from(data.categories)
      }));
    
    // Identify critical files (syntax errors that break parsing)
    this.errorStats.criticalFiles = fileEntries
      .filter(([, data]) => data.categories.has('Syntax Errors'))
      .slice(0, 10)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        syntaxErrors: data.errors.filter(e => e.category === 'Syntax Errors').length
      }));
      
    // Identify files with easily fixable errors (certain syntax errors)
    const fixableErrorCodes = ['TS1005', 'TS1136', 'TS1144'];
    this.errorStats.fixableFiles = fileEntries
      .filter(([, data]) => data.errors.some(e => fixableErrorCodes.includes(e.code)))
      .slice(0, 15)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        fixableErrors: data.errors.filter(e => fixableErrorCodes.includes(e.code)).length
      }));
    
    // Process directory statistics
    for (const [category, data] of Object.entries(this.errorStats.errorsByDirectory)) {
      data.fileCount = data.files.size;
      data.files = Array.from(data.files).map(f => path.relative(ROOT_DIR, f));
    }
  }

  generateReport() {
    console.log('\n=== TypeScript Error Analysis Report ===\n');
    
    // Summary
    console.log(`Total Errors: ${this.errorStats.totalErrors}`);
    console.log(`Total Files: ${this.errorStats.totalFiles}`);
    console.log(`Average Errors per File: ${Math.round(this.errorStats.totalErrors / this.errorStats.totalFiles)}\n`);
    
    // Errors by category
    console.log('--- Errors by Category (Priority Order) ---');
    const sortedCategories = Object.entries(this.errorStats.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of sortedCategories) {
      console.log(`${category}: ${data.count} errors (Priority ${data.priority})`);
    }
    
    // Errors by directory
    console.log('\n--- Errors by Directory ---');
    const sortedDirs = Object.entries(this.errorStats.errorsByDirectory)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [dirCategory, data] of sortedDirs) {
      console.log(`${dirCategory}: ${data.count} errors across ${data.fileCount} files`);
      
      // Show top error categories for this directory
      const categoryEntries = Object.entries(data.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
        
      if (categoryEntries.length > 0) {
        console.log(`  Top issues: ${categoryEntries.map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
      }
    }
    
    // Top error files
    console.log('\n--- Top 20 Files with Most Errors ---');
    for (const fileInfo of this.errorStats.topErrorFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.count} errors [${fileInfo.categories.join(', ')}]`);
    }
    
    // Critical files (syntax errors)
    console.log('\n--- Critical Files (Syntax Errors) ---');
    for (const fileInfo of this.errorStats.criticalFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.syntaxErrors} syntax errors out of ${fileInfo.count} total`);
    }
    
    // Easily fixable files
    console.log('\n--- Easily Fixable Files ---');
    for (const fileInfo of this.errorStats.fixableFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.fixableErrors} fixable errors out of ${fileInfo.count} total`);
    }
    
    // Alchemical engine check
    this.checkAlchemicalEngine();
    
    // Recommendations
    console.log('\n--- Recommended Fix Order ---');
    console.log('1. Fix syntax errors first (breaks parsing)');
    console.log('2. Fix import/export errors (breaks module system)');
    console.log('3. Focus on alchemical engine errors (core functionality)');
    console.log('4. Fix component errors that affect rendering');
    console.log('5. Address type and function errors');
    
    console.log('\n--- Available Fix Scripts ---');
    console.log('• scripts/syntax-fixes/ - Fix syntax errors');
    console.log('• scripts/typescript-fixes/ - Fix TypeScript type errors');
    console.log('• scripts/elemental-fixes/ - Fix alchemical/elemental logic errors');
    console.log('• scripts/cuisine-fixes/ - Fix cuisine-specific errors');
    
    console.log('\n--- Advanced Analysis Commands ---');
    console.log('• Analyze specific directory:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-dir=src/components');
    console.log('• Analyze specific files:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-files="src/calculations/alchemize.ts src/utils/elements.ts"');
    console.log('• Filter by error category:');
    console.log('  node scripts/typescript-error-analysis.mjs --include-categories="Syntax Errors,Import/Export Errors"');
  }

  checkAlchemicalEngine() {
    console.log('\n--- Alchemical Engine Status ---');
    
    // Core alchemical files that are critical to the system
    const alchemicalFiles = [
      'src/calculations/alchemize.ts',
      'src/calculations/alchemicalEngine.ts',
      'src/calculations/alchemicalCalculations.ts',
      'src/calculations/alchemicalTransformation.ts',
      'src/utils/astrologyUtils',
      'src/utils/elementalMappings',
      'src/utils/astrologyUtils/index.ts',
      'src/utils/elementalMappings/index.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/elementalUtils.ts',
      'src/utils/elementalCompatibility.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/safeAstrology.ts',
      'src/services/AstrologicalService.ts',
      'src/services/ElementalCalculator.ts',
      'src/lib/alchemicalEngine.ts',
      'src/lib/elementalSystem.ts'
    ];
    
    const coreStructures = [
      'alchemize', 
      'elementalCompatibility',
      'calculateElementalBalance',
      'getElementalBreakdown',
      'calculateSeasonalScores',
      'planetInfo',
      'signInfo',
      'getComplementaryElement'
    ];
    
    // Check 1: File-level errors in alchemical files
    const alchemicalErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => {
        return alchemicalFiles.some(pattern => filePath.includes(pattern));
      })
      .sort(([,a], [,b]) => b.count - a.count);
    
    // Check 2: Look for errors in core structure functions
    const structureErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([_, data]) => {
        return data.errors.some(error => 
          coreStructures.some(structure => error.message.includes(structure))
        );
      });
    
    if (alchemicalErrors.length > 0) {
      console.log(`Found ${alchemicalErrors.length} alchemical engine files with errors:`);
      alchemicalErrors.slice(0, 5).forEach(([filePath, data]) => {
        console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${data.count} errors`);
        
        // Show example errors
        const syntaxErrors = data.errors.filter(e => e.category === 'Syntax Errors');
        if (syntaxErrors.length > 0) {
          console.log(`    First syntax error: ${syntaxErrors[0].message} (line ${syntaxErrors[0].line})`);
        }
      });
      
      console.log(`\nRecommendation: Fix alchemical engine errors as highest priority (after syntax).`);
      
      // Examine core alchemical structures
      if (structureErrors.length > 0) {
        console.log(`\nCRITICAL: Found errors in core alchemical structures:`);
        structureErrors.slice(0, 3).forEach(([filePath, data]) => {
          const structuralIssues = data.errors.filter(error => 
            coreStructures.some(structure => error.message.includes(structure))
          );
          
          console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${structuralIssues.length} structural issues`);
          structuralIssues.slice(0, 2).forEach(error => {
            console.log(`    ${error.message} (line ${error.line})`);
          });
        });
      }
      
      // Generate specific fix commands
      console.log(`\nFix Commands:`);
      console.log(`  1. node scripts/fix-project.mjs --category=elemental --dry-run`);
      console.log(`  2. node scripts/elemental-fixes/fix-alchemical-engine.js --file=${
        path.relative(ROOT_DIR, alchemicalErrors[0]?.[0] || '')
      }`);
    } else {
      console.log('No errors detected in alchemical engine core files.');
      
      // Verify core alchemical structures are present
      try {
        const alchemicalPath = path.join(ROOT_DIR, 'src/calculations/alchemize.ts');
        if (fs.existsSync(alchemicalPath)) {
          const content = fs.readFileSync(alchemicalPath, 'utf-8');
          const hasCoreFunction = content.includes('function alchemize(');
          if (hasCoreFunction) {
            console.log('Core alchemical engine structure verified.');
          } else {
            console.log('WARNING: alchemize() function not found in expected location.');
          }
        } else {
          console.log('WARNING: Core alchemical file not found at expected path.');
        }
      } catch (error) {
        console.log('Could not verify alchemical engine structure:', error.message);
      }
    }
    
    // Check for elemental principles violations
    this.checkElementalPrinciples();
  }

  checkElementalPrinciples() {
    console.log('\n--- Elemental Principles Check ---');
    
    // Rules from elemental-principles-guide.md
    const violationPatterns = [
      { 
        pattern: /(fire.*?oppos.*?45039Water#!/usr/bin/env node

/**
 * TypeScript Error Analysis Tool
 * Analyzes TypeScript errors and categorizes them by type and priority
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Error categorization patterns
const ERROR_CATEGORIES = {
  'Syntax Errors': [
    'TS1005', // Expected token
    'TS1109', // Expression expected
    'TS1128', // Declaration or statement expected
    'TS1144', // '{' or ';' expected
    'TS1472', // 'catch' or 'finally' expected
    'TS1011', // Element access expression should take an argument
    'TS1136', // Property assignment expected
    'TS1434', // Unexpected keyword or identifier
    'TS1003', // Identifier expected
    'TS1131', // Property or signature expected
    'TS1068', // Unexpected token. '}' expected
    'TS1127', // Invalid character
  ],
  'Type Errors': [
    'TS2304', // Cannot find name
    'TS2322', // Type is not assignable
    'TS2339', // Property does not exist
    'TS2345', // Argument of type is not assignable
    'TS2349', // This expression is not callable
    'TS2552', // Cannot find name
    'TS2571', // Object is of type 'unknown'
    'TS2580', // Cannot find name
    'TS2564', // Property has no initializer and is not definitely assigned
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
    'TS2365', // Operator cannot be applied to types
  ],
  'Import/Export Errors': [
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2503', // Cannot find namespace
    'TS2300', // Duplicate identifier
    'TS1192', // Module cannot be imported
    'TS1479', // The current file is a CommonJS module
    'TS1259', // Module can only be default-imported
  ],
  'Function/Method Errors': [
    'TS2554', // Expected arguments but got
    'TS2556', // A spread argument must either have a tuple type
    'TS2559', // Type has no properties in common
    'TS2740', // Type is missing properties
    'TS2341', // Property is private
    'TS2722', // Cannot invoke an object which is possibly undefined
    'TS2769', // No overload matches this call
  ],
  'JSX/React Errors': [
    'TS2686', // React refers to a UMD global
    'TS2583', // Cannot find name 'React'
    'TS2769', // No overload matches this call
    'TS2605', // JSX element type is not a constructor function
    'TS2739', // Type is missing properties required by JSX.IntrinsicElements
    'TS2746', // This JSX tag's children are of type 'ReactNode'
  ],
  'Configuration Errors': [
    'TS2688', // Cannot find type definition file
    'TS2691', // An import path cannot end with a '.ts' extension
    'TS6054', // File is not under 'rootDir'
    'TS6059', // File is not in project source
    'TS18028', // Private identifiers are only available when targeting ECMAScript 2015
  ]
};

// Priority levels for different error types
const PRIORITY_MAPPING = {
  'Syntax Errors': 1, // Highest priority - breaks parsing
  'Import/Export Errors': 2, // High priority - breaks module system
  'Type Errors': 3, // Medium priority - type safety
  'Function/Method Errors': 4, // Medium priority - runtime issues
  'JSX/React Errors': 5, // Lower priority - often configuration
  'Configuration Errors': 6 // Lowest priority - project setup
};

// Directory categorization for targeted fixes
const DIRECTORY_CATEGORIES = {
  'Component Errors': [
    'src/components',
    'src/ui',
    'src/AstrologyChart'
  ],
  'Data Layer Errors': [
    'src/data',
    'src/services',
    'src/context',
    'src/contexts'
  ],
  'API Errors': [
    'src/api',
    'src/app/api',
    'pages/api'
  ],
  'Alchemical Engine Errors': [
    'src/calculations',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings'
  ],
  'Test Errors': [
    'src/__tests__',
    'tests',
    'test-scripts'
  ]
};

class TypeScriptErrorAnalyzer {
  constructor(options = {}) {
    this.options = {
      dryRun: true,
      targetDir: null,
      targetFiles: null,
      excludeDirs: [],
      excludeErrorCodes: [],
      includeErrorCodes: [],
      maxErrorsPerFile: 50,
      ...options
    };
    
    this.errorStats = {
      totalErrors: 0,
      totalFiles: 0,
      errorsByCategory: {},
      errorsByFile: {},
      errorsByDirectory: {},
      topErrorFiles: [],
      criticalFiles: [],
      fixableFiles: []
    };
  }

  log(message) {
    const prefix = this.options.dryRun ? '[ANALYSIS]' : '[FIXING]';
    console.log(`${prefix} ${message}`);
  }

  async analyzeErrors() {
    this.log('Running TypeScript compiler to analyze errors...');
    
    // Create a temporary directory to store specific files for targeted analysis
    if (this.options.targetFiles && Array.isArray(this.options.targetFiles) && this.options.targetFiles.length > 0) {
      try {
        this.log(`Analyzing ${this.options.targetFiles.length} specific files...`);
        
        // Create single string output for errors across all targeted files
        let allErrors = '';
        
        // Process each file individually for more reliable error checking
        for (const targetFile of this.options.targetFiles) {
          try {
            const output = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}" 2>&1 || true`, {
              cwd: ROOT_DIR,
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024
            });
            
            if (output && !output.includes('error TS5083')) { // Skip "Cannot read file" errors
              allErrors += output + '\n';
            }
          } catch (err) {
            if (err.stdout) {
              allErrors += err.stdout + '\n';
            }
          }
        }
        
        return this.parseErrorOutput(allErrors);
      } catch (error) {
        console.error('Error analyzing targeted files:', error.message);
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        }
        throw error;
      }
    } else {
      // Regular full project analysis
      try {
        // Build tsc command with target options
        let tscCommand = 'npx tsc --noEmit --skipLibCheck';
        
        if (this.options.targetDir) {
          // Check specific directory
          tscCommand = `find ${path.join(ROOT_DIR, this.options.targetDir)} -name "*.ts" -o -name "*.tsx" | xargs npx tsc --noEmit --skipLibCheck`;
        }
        
        // Run TypeScript compiler and capture output
        const output = execSync(tscCommand + ' 2>&1 || true', {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer to handle large error output
        });
        
        return this.parseErrorOutput(output);
      } catch (error) {
        // TypeScript errors will cause execSync to throw, but we want the output
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        } else {
          console.error('Error running TypeScript compiler:', error.message);
          throw error;
        }
      }
    }
  }

  parseErrorOutput(output) {
    if (!output || output.trim() === '') {
      console.log('No output from TypeScript compiler to parse.');
      return this.errorStats;
    }
    
    const lines = output.split('\n');
    
    // More flexible error pattern that handles variations in formatting
    const errorPattern = /([^()\s]+\.tsx?):(\d+):(\d+)(?:\s+-\s+|\s+)error\s+(TS\d+)(?::\s+|\s+)(.+)/;
    const summaryPattern = /Found\s+(\d+)\s+errors?\s+in\s+(\d+)\s+files?/;
    
    console.log(`Processing ${lines.length} lines of compiler output...`);
    
    let errorCount = 0;
    let parsedErrors = 0;
    let errorFiles = new Set();
    
    for (const line of lines) {
      const errorMatch = line.match(errorPattern);
      const summaryMatch = line.match(summaryPattern);
      
      if (errorMatch) {
        errorCount++;
        let [, filePath, lineNum, colNum, errorCode, message] = errorMatch;
        
        // Resolve file path if not absolute
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(ROOT_DIR, filePath);
        }
        
        // Apply filters
        if (this.shouldSkipError(filePath, errorCode)) {
          continue;
        }
        
        errorFiles.add(filePath);
        this.addError(filePath, errorCode, message, parseInt(lineNum), parseInt(colNum));
        parsedErrors++;
        
        // Log progress for large error sets
        if (parsedErrors % 1000 === 0) {
          console.log(`Processed ${parsedErrors} errors...`);
        }
      } else if (summaryMatch) {
        this.errorStats.totalErrors = parseInt(summaryMatch[1]);
        this.errorStats.totalFiles = parseInt(summaryMatch[2]);
      }
    }
    
    // If we didn't find a summary pattern, calculate totals from our processing
    if (!this.errorStats.totalErrors) {
      this.errorStats.totalErrors = errorCount;
      this.errorStats.totalFiles = errorFiles.size;
    }
    
    console.log(`Completed parsing. Found ${this.errorStats.totalErrors} errors in ${this.errorStats.totalFiles} files.`);
    
    this.calculateStatistics();
    return this.errorStats;
  }

  shouldSkipError(filePath, errorCode) {
    // Skip if file is in excluded directories
    if (this.options.excludeDirs.some(dir => filePath.includes(dir))) {
      return true;
    }
    
    // Skip if error code is explicitly excluded
    if (this.options.excludeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Skip if we're filtering to specific error codes and this isn't one
    if (this.options.includeErrorCodes.length > 0 && 
        !this.options.includeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  addError(filePath, errorCode, message, line, column) {
    const category = this.categorizeError(errorCode);
    const dirCategory = this.categorizeDirectory(filePath);
    
    // Initialize category if not exists
    if (!this.errorStats.errorsByCategory[category]) {
      this.errorStats.errorsByCategory[category] = {
        count: 0,
        errors: [],
        priority: PRIORITY_MAPPING[category] || 9
      };
    }
    
    // Initialize file if not exists
    if (!this.errorStats.errorsByFile[filePath]) {
      this.errorStats.errorsByFile[filePath] = {
        count: 0,
        errors: [],
        categories: new Set(),
        dirCategory
      };
    }
    
    // Initialize directory category if not exists
    if (dirCategory && !this.errorStats.errorsByDirectory[dirCategory]) {
      this.errorStats.errorsByDirectory[dirCategory] = {
        count: 0,
        files: new Set(),
        categories: {}
      };
    }
    
    const errorInfo = {
      code: errorCode,
      message,
      line,
      column,
      category,
      filePath: path.relative(ROOT_DIR, filePath)
    };
    
    // Enforce max errors per file to prevent memory issues
    if (this.errorStats.errorsByFile[filePath].errors.length < this.options.maxErrorsPerFile) {
      this.errorStats.errorsByCategory[category].count++;
      this.errorStats.errorsByCategory[category].errors.push(errorInfo);
      
      this.errorStats.errorsByFile[filePath].errors.push(errorInfo);
    }
    
    this.errorStats.errorsByFile[filePath].count++;
    this.errorStats.errorsByFile[filePath].categories.add(category);
    
    // Update directory statistics if applicable
    if (dirCategory) {
      this.errorStats.errorsByDirectory[dirCategory].count++;
      this.errorStats.errorsByDirectory[dirCategory].files.add(filePath);
      
      if (!this.errorStats.errorsByDirectory[dirCategory].categories[category]) {
        this.errorStats.errorsByDirectory[dirCategory].categories[category] = 0;
      }
      this.errorStats.errorsByDirectory[dirCategory].categories[category]++;
    }
  }

  categorizeError(errorCode) {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
      if (codes.includes(errorCode)) {
        return category;
      }
    }
    return 'Other Errors';
  }

  categorizeDirectory(filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    for (const [category, patterns] of Object.entries(DIRECTORY_CATEGORIES)) {
      if (patterns.some(pattern => relPath.startsWith(pattern))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  calculateStatistics() {
    // Sort files by error count
    const fileEntries = Object.entries(this.errorStats.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count);
    
    this.errorStats.topErrorFiles = fileEntries.slice(0, 20)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        categories: Array.from(data.categories)
      }));
    
    // Identify critical files (syntax errors that break parsing)
    this.errorStats.criticalFiles = fileEntries
      .filter(([, data]) => data.categories.has('Syntax Errors'))
      .slice(0, 10)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        syntaxErrors: data.errors.filter(e => e.category === 'Syntax Errors').length
      }));
      
    // Identify files with easily fixable errors (certain syntax errors)
    const fixableErrorCodes = ['TS1005', 'TS1136', 'TS1144'];
    this.errorStats.fixableFiles = fileEntries
      .filter(([, data]) => data.errors.some(e => fixableErrorCodes.includes(e.code)))
      .slice(0, 15)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        fixableErrors: data.errors.filter(e => fixableErrorCodes.includes(e.code)).length
      }));
    
    // Process directory statistics
    for (const [category, data] of Object.entries(this.errorStats.errorsByDirectory)) {
      data.fileCount = data.files.size;
      data.files = Array.from(data.files).map(f => path.relative(ROOT_DIR, f));
    }
  }

  generateReport() {
    console.log('\n=== TypeScript Error Analysis Report ===\n');
    
    // Summary
    console.log(`Total Errors: ${this.errorStats.totalErrors}`);
    console.log(`Total Files: ${this.errorStats.totalFiles}`);
    console.log(`Average Errors per File: ${Math.round(this.errorStats.totalErrors / this.errorStats.totalFiles)}\n`);
    
    // Errors by category
    console.log('--- Errors by Category (Priority Order) ---');
    const sortedCategories = Object.entries(this.errorStats.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of sortedCategories) {
      console.log(`${category}: ${data.count} errors (Priority ${data.priority})`);
    }
    
    // Errors by directory
    console.log('\n--- Errors by Directory ---');
    const sortedDirs = Object.entries(this.errorStats.errorsByDirectory)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [dirCategory, data] of sortedDirs) {
      console.log(`${dirCategory}: ${data.count} errors across ${data.fileCount} files`);
      
      // Show top error categories for this directory
      const categoryEntries = Object.entries(data.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
        
      if (categoryEntries.length > 0) {
        console.log(`  Top issues: ${categoryEntries.map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
      }
    }
    
    // Top error files
    console.log('\n--- Top 20 Files with Most Errors ---');
    for (const fileInfo of this.errorStats.topErrorFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.count} errors [${fileInfo.categories.join(', ')}]`);
    }
    
    // Critical files (syntax errors)
    console.log('\n--- Critical Files (Syntax Errors) ---');
    for (const fileInfo of this.errorStats.criticalFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.syntaxErrors} syntax errors out of ${fileInfo.count} total`);
    }
    
    // Easily fixable files
    console.log('\n--- Easily Fixable Files ---');
    for (const fileInfo of this.errorStats.fixableFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.fixableErrors} fixable errors out of ${fileInfo.count} total`);
    }
    
    // Alchemical engine check
    this.checkAlchemicalEngine();
    
    // Recommendations
    console.log('\n--- Recommended Fix Order ---');
    console.log('1. Fix syntax errors first (breaks parsing)');
    console.log('2. Fix import/export errors (breaks module system)');
    console.log('3. Focus on alchemical engine errors (core functionality)');
    console.log('4. Fix component errors that affect rendering');
    console.log('5. Address type and function errors');
    
    console.log('\n--- Available Fix Scripts ---');
    console.log('• scripts/syntax-fixes/ - Fix syntax errors');
    console.log('• scripts/typescript-fixes/ - Fix TypeScript type errors');
    console.log('• scripts/elemental-fixes/ - Fix alchemical/elemental logic errors');
    console.log('• scripts/cuisine-fixes/ - Fix cuisine-specific errors');
    
    console.log('\n--- Advanced Analysis Commands ---');
    console.log('• Analyze specific directory:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-dir=src/components');
    console.log('• Analyze specific files:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-files="src/calculations/alchemize.ts src/utils/elements.ts"');
    console.log('• Filter by error category:');
    console.log('  node scripts/typescript-error-analysis.mjs --include-categories="Syntax Errors,Import/Export Errors"');
  }

  checkAlchemicalEngine() {
    console.log('\n--- Alchemical Engine Status ---');
    
    // Core alchemical files that are critical to the system
    const alchemicalFiles = [
      'src/calculations/alchemize.ts',
      'src/calculations/alchemicalEngine.ts',
      'src/calculations/alchemicalCalculations.ts',
      'src/calculations/alchemicalTransformation.ts',
      'src/utils/astrologyUtils',
      'src/utils/elementalMappings',
      'src/utils/astrologyUtils/index.ts',
      'src/utils/elementalMappings/index.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/elementalUtils.ts',
      'src/utils/elementalCompatibility.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/safeAstrology.ts',
      'src/services/AstrologicalService.ts',
      'src/services/ElementalCalculator.ts',
      'src/lib/alchemicalEngine.ts',
      'src/lib/elementalSystem.ts'
    ];
    
    const coreStructures = [
      'alchemize', 
      'elementalCompatibility',
      'calculateElementalBalance',
      'getElementalBreakdown',
      'calculateSeasonalScores',
      'planetInfo',
      'signInfo',
      'getComplementaryElement'
    ];
    
    // Check 1: File-level errors in alchemical files
    const alchemicalErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => {
        return alchemicalFiles.some(pattern => filePath.includes(pattern));
      })
      .sort(([,a], [,b]) => b.count - a.count);
    
    // Check 2: Look for errors in core structure functions
    const structureErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([_, data]) => {
        return data.errors.some(error => 
          coreStructures.some(structure => error.message.includes(structure))
        );
      });
    
    if (alchemicalErrors.length > 0) {
      console.log(`Found ${alchemicalErrors.length} alchemical engine files with errors:`);
      alchemicalErrors.slice(0, 5).forEach(([filePath, data]) => {
        console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${data.count} errors`);
        
        // Show example errors
        const syntaxErrors = data.errors.filter(e => e.category === 'Syntax Errors');
        if (syntaxErrors.length > 0) {
          console.log(`    First syntax error: ${syntaxErrors[0].message} (line ${syntaxErrors[0].line})`);
        }
      });
      
      console.log(`\nRecommendation: Fix alchemical engine errors as highest priority (after syntax).`);
      
      // Examine core alchemical structures
      if (structureErrors.length > 0) {
        console.log(`\nCRITICAL: Found errors in core alchemical structures:`);
        structureErrors.slice(0, 3).forEach(([filePath, data]) => {
          const structuralIssues = data.errors.filter(error => 
            coreStructures.some(structure => error.message.includes(structure))
          );
          
          console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${structuralIssues.length} structural issues`);
          structuralIssues.slice(0, 2).forEach(error => {
            console.log(`    ${error.message} (line ${error.line})`);
          });
        });
      }
      
      // Generate specific fix commands
      console.log(`\nFix Commands:`);
      console.log(`  1. node scripts/fix-project.mjs --category=elemental --dry-run`);
      console.log(`  2. node scripts/elemental-fixes/fix-alchemical-engine.js --file=${
        path.relative(ROOT_DIR, alchemicalErrors[0]?.[0] || '')
      }`);
    } else {
      console.log('No errors detected in alchemical engine core files.');
      
      // Verify core alchemical structures are present
      try {
        const alchemicalPath = path.join(ROOT_DIR, 'src/calculations/alchemize.ts');
        if (fs.existsSync(alchemicalPath)) {
          const content = fs.readFileSync(alchemicalPath, 'utf-8');
          const hasCoreFunction = content.includes('function alchemize(');
          if (hasCoreFunction) {
            console.log('Core alchemical engine structure verified.');
          } else {
            console.log('WARNING: alchemize() function not found in expected location.');
          }
        } else {
          console.log('WARNING: Core alchemical file not found at expected path.');
        }
      } catch (error) {
        console.log('Could not verify alchemical engine structure:', error.message);
      }
    }
    
    // Check for elemental principles violations
    this.checkElementalPrinciples();
  }

  checkElementalPrinciples() {
    console.log('\n--- Elemental Principles Check ---');
    
    // Rules from elemental-principles-guide.md
    const violationPatterns = [
      { 
        pattern: /(fire.*?oppos.*?water|water.*?oppos.*?22526Fire#!/usr/bin/env node

/**
 * TypeScript Error Analysis Tool
 * Analyzes TypeScript errors and categorizes them by type and priority
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Error categorization patterns
const ERROR_CATEGORIES = {
  'Syntax Errors': [
    'TS1005', // Expected token
    'TS1109', // Expression expected
    'TS1128', // Declaration or statement expected
    'TS1144', // '{' or ';' expected
    'TS1472', // 'catch' or 'finally' expected
    'TS1011', // Element access expression should take an argument
    'TS1136', // Property assignment expected
    'TS1434', // Unexpected keyword or identifier
    'TS1003', // Identifier expected
    'TS1131', // Property or signature expected
    'TS1068', // Unexpected token. '}' expected
    'TS1127', // Invalid character
  ],
  'Type Errors': [
    'TS2304', // Cannot find name
    'TS2322', // Type is not assignable
    'TS2339', // Property does not exist
    'TS2345', // Argument of type is not assignable
    'TS2349', // This expression is not callable
    'TS2552', // Cannot find name
    'TS2571', // Object is of type 'unknown'
    'TS2580', // Cannot find name
    'TS2564', // Property has no initializer and is not definitely assigned
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
    'TS2365', // Operator cannot be applied to types
  ],
  'Import/Export Errors': [
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2503', // Cannot find namespace
    'TS2300', // Duplicate identifier
    'TS1192', // Module cannot be imported
    'TS1479', // The current file is a CommonJS module
    'TS1259', // Module can only be default-imported
  ],
  'Function/Method Errors': [
    'TS2554', // Expected arguments but got
    'TS2556', // A spread argument must either have a tuple type
    'TS2559', // Type has no properties in common
    'TS2740', // Type is missing properties
    'TS2341', // Property is private
    'TS2722', // Cannot invoke an object which is possibly undefined
    'TS2769', // No overload matches this call
  ],
  'JSX/React Errors': [
    'TS2686', // React refers to a UMD global
    'TS2583', // Cannot find name 'React'
    'TS2769', // No overload matches this call
    'TS2605', // JSX element type is not a constructor function
    'TS2739', // Type is missing properties required by JSX.IntrinsicElements
    'TS2746', // This JSX tag's children are of type 'ReactNode'
  ],
  'Configuration Errors': [
    'TS2688', // Cannot find type definition file
    'TS2691', // An import path cannot end with a '.ts' extension
    'TS6054', // File is not under 'rootDir'
    'TS6059', // File is not in project source
    'TS18028', // Private identifiers are only available when targeting ECMAScript 2015
  ]
};

// Priority levels for different error types
const PRIORITY_MAPPING = {
  'Syntax Errors': 1, // Highest priority - breaks parsing
  'Import/Export Errors': 2, // High priority - breaks module system
  'Type Errors': 3, // Medium priority - type safety
  'Function/Method Errors': 4, // Medium priority - runtime issues
  'JSX/React Errors': 5, // Lower priority - often configuration
  'Configuration Errors': 6 // Lowest priority - project setup
};

// Directory categorization for targeted fixes
const DIRECTORY_CATEGORIES = {
  'Component Errors': [
    'src/components',
    'src/ui',
    'src/AstrologyChart'
  ],
  'Data Layer Errors': [
    'src/data',
    'src/services',
    'src/context',
    'src/contexts'
  ],
  'API Errors': [
    'src/api',
    'src/app/api',
    'pages/api'
  ],
  'Alchemical Engine Errors': [
    'src/calculations',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings'
  ],
  'Test Errors': [
    'src/__tests__',
    'tests',
    'test-scripts'
  ]
};

class TypeScriptErrorAnalyzer {
  constructor(options = {}) {
    this.options = {
      dryRun: true,
      targetDir: null,
      targetFiles: null,
      excludeDirs: [],
      excludeErrorCodes: [],
      includeErrorCodes: [],
      maxErrorsPerFile: 50,
      ...options
    };
    
    this.errorStats = {
      totalErrors: 0,
      totalFiles: 0,
      errorsByCategory: {},
      errorsByFile: {},
      errorsByDirectory: {},
      topErrorFiles: [],
      criticalFiles: [],
      fixableFiles: []
    };
  }

  log(message) {
    const prefix = this.options.dryRun ? '[ANALYSIS]' : '[FIXING]';
    console.log(`${prefix} ${message}`);
  }

  async analyzeErrors() {
    this.log('Running TypeScript compiler to analyze errors...');
    
    // Create a temporary directory to store specific files for targeted analysis
    if (this.options.targetFiles && Array.isArray(this.options.targetFiles) && this.options.targetFiles.length > 0) {
      try {
        this.log(`Analyzing ${this.options.targetFiles.length} specific files...`);
        
        // Create single string output for errors across all targeted files
        let allErrors = '';
        
        // Process each file individually for more reliable error checking
        for (const targetFile of this.options.targetFiles) {
          try {
            const output = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}" 2>&1 || true`, {
              cwd: ROOT_DIR,
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024
            });
            
            if (output && !output.includes('error TS5083')) { // Skip "Cannot read file" errors
              allErrors += output + '\n';
            }
          } catch (err) {
            if (err.stdout) {
              allErrors += err.stdout + '\n';
            }
          }
        }
        
        return this.parseErrorOutput(allErrors);
      } catch (error) {
        console.error('Error analyzing targeted files:', error.message);
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        }
        throw error;
      }
    } else {
      // Regular full project analysis
      try {
        // Build tsc command with target options
        let tscCommand = 'npx tsc --noEmit --skipLibCheck';
        
        if (this.options.targetDir) {
          // Check specific directory
          tscCommand = `find ${path.join(ROOT_DIR, this.options.targetDir)} -name "*.ts" -o -name "*.tsx" | xargs npx tsc --noEmit --skipLibCheck`;
        }
        
        // Run TypeScript compiler and capture output
        const output = execSync(tscCommand + ' 2>&1 || true', {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer to handle large error output
        });
        
        return this.parseErrorOutput(output);
      } catch (error) {
        // TypeScript errors will cause execSync to throw, but we want the output
        if (error.stdout) {
          return this.parseErrorOutput(error.stdout);
        } else {
          console.error('Error running TypeScript compiler:', error.message);
          throw error;
        }
      }
    }
  }

  parseErrorOutput(output) {
    if (!output || output.trim() === '') {
      console.log('No output from TypeScript compiler to parse.');
      return this.errorStats;
    }
    
    const lines = output.split('\n');
    
    // More flexible error pattern that handles variations in formatting
    const errorPattern = /([^()\s]+\.tsx?):(\d+):(\d+)(?:\s+-\s+|\s+)error\s+(TS\d+)(?::\s+|\s+)(.+)/;
    const summaryPattern = /Found\s+(\d+)\s+errors?\s+in\s+(\d+)\s+files?/;
    
    console.log(`Processing ${lines.length} lines of compiler output...`);
    
    let errorCount = 0;
    let parsedErrors = 0;
    let errorFiles = new Set();
    
    for (const line of lines) {
      const errorMatch = line.match(errorPattern);
      const summaryMatch = line.match(summaryPattern);
      
      if (errorMatch) {
        errorCount++;
        let [, filePath, lineNum, colNum, errorCode, message] = errorMatch;
        
        // Resolve file path if not absolute
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(ROOT_DIR, filePath);
        }
        
        // Apply filters
        if (this.shouldSkipError(filePath, errorCode)) {
          continue;
        }
        
        errorFiles.add(filePath);
        this.addError(filePath, errorCode, message, parseInt(lineNum), parseInt(colNum));
        parsedErrors++;
        
        // Log progress for large error sets
        if (parsedErrors % 1000 === 0) {
          console.log(`Processed ${parsedErrors} errors...`);
        }
      } else if (summaryMatch) {
        this.errorStats.totalErrors = parseInt(summaryMatch[1]);
        this.errorStats.totalFiles = parseInt(summaryMatch[2]);
      }
    }
    
    // If we didn't find a summary pattern, calculate totals from our processing
    if (!this.errorStats.totalErrors) {
      this.errorStats.totalErrors = errorCount;
      this.errorStats.totalFiles = errorFiles.size;
    }
    
    console.log(`Completed parsing. Found ${this.errorStats.totalErrors} errors in ${this.errorStats.totalFiles} files.`);
    
    this.calculateStatistics();
    return this.errorStats;
  }

  shouldSkipError(filePath, errorCode) {
    // Skip if file is in excluded directories
    if (this.options.excludeDirs.some(dir => filePath.includes(dir))) {
      return true;
    }
    
    // Skip if error code is explicitly excluded
    if (this.options.excludeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    // Skip if we're filtering to specific error codes and this isn't one
    if (this.options.includeErrorCodes.length > 0 && 
        !this.options.includeErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  addError(filePath, errorCode, message, line, column) {
    const category = this.categorizeError(errorCode);
    const dirCategory = this.categorizeDirectory(filePath);
    
    // Initialize category if not exists
    if (!this.errorStats.errorsByCategory[category]) {
      this.errorStats.errorsByCategory[category] = {
        count: 0,
        errors: [],
        priority: PRIORITY_MAPPING[category] || 9
      };
    }
    
    // Initialize file if not exists
    if (!this.errorStats.errorsByFile[filePath]) {
      this.errorStats.errorsByFile[filePath] = {
        count: 0,
        errors: [],
        categories: new Set(),
        dirCategory
      };
    }
    
    // Initialize directory category if not exists
    if (dirCategory && !this.errorStats.errorsByDirectory[dirCategory]) {
      this.errorStats.errorsByDirectory[dirCategory] = {
        count: 0,
        files: new Set(),
        categories: {}
      };
    }
    
    const errorInfo = {
      code: errorCode,
      message,
      line,
      column,
      category,
      filePath: path.relative(ROOT_DIR, filePath)
    };
    
    // Enforce max errors per file to prevent memory issues
    if (this.errorStats.errorsByFile[filePath].errors.length < this.options.maxErrorsPerFile) {
      this.errorStats.errorsByCategory[category].count++;
      this.errorStats.errorsByCategory[category].errors.push(errorInfo);
      
      this.errorStats.errorsByFile[filePath].errors.push(errorInfo);
    }
    
    this.errorStats.errorsByFile[filePath].count++;
    this.errorStats.errorsByFile[filePath].categories.add(category);
    
    // Update directory statistics if applicable
    if (dirCategory) {
      this.errorStats.errorsByDirectory[dirCategory].count++;
      this.errorStats.errorsByDirectory[dirCategory].files.add(filePath);
      
      if (!this.errorStats.errorsByDirectory[dirCategory].categories[category]) {
        this.errorStats.errorsByDirectory[dirCategory].categories[category] = 0;
      }
      this.errorStats.errorsByDirectory[dirCategory].categories[category]++;
    }
  }

  categorizeError(errorCode) {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
      if (codes.includes(errorCode)) {
        return category;
      }
    }
    return 'Other Errors';
  }

  categorizeDirectory(filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    for (const [category, patterns] of Object.entries(DIRECTORY_CATEGORIES)) {
      if (patterns.some(pattern => relPath.startsWith(pattern))) {
        return category;
      }
    }
    
    return 'Uncategorized';
  }

  calculateStatistics() {
    // Sort files by error count
    const fileEntries = Object.entries(this.errorStats.errorsByFile)
      .sort(([,a], [,b]) => b.count - a.count);
    
    this.errorStats.topErrorFiles = fileEntries.slice(0, 20)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        categories: Array.from(data.categories)
      }));
    
    // Identify critical files (syntax errors that break parsing)
    this.errorStats.criticalFiles = fileEntries
      .filter(([, data]) => data.categories.has('Syntax Errors'))
      .slice(0, 10)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        syntaxErrors: data.errors.filter(e => e.category === 'Syntax Errors').length
      }));
      
    // Identify files with easily fixable errors (certain syntax errors)
    const fixableErrorCodes = ['TS1005', 'TS1136', 'TS1144'];
    this.errorStats.fixableFiles = fileEntries
      .filter(([, data]) => data.errors.some(e => fixableErrorCodes.includes(e.code)))
      .slice(0, 15)
      .map(([filePath, data]) => ({
        file: path.relative(ROOT_DIR, filePath),
        count: data.count,
        fixableErrors: data.errors.filter(e => fixableErrorCodes.includes(e.code)).length
      }));
    
    // Process directory statistics
    for (const [category, data] of Object.entries(this.errorStats.errorsByDirectory)) {
      data.fileCount = data.files.size;
      data.files = Array.from(data.files).map(f => path.relative(ROOT_DIR, f));
    }
  }

  generateReport() {
    console.log('\n=== TypeScript Error Analysis Report ===\n');
    
    // Summary
    console.log(`Total Errors: ${this.errorStats.totalErrors}`);
    console.log(`Total Files: ${this.errorStats.totalFiles}`);
    console.log(`Average Errors per File: ${Math.round(this.errorStats.totalErrors / this.errorStats.totalFiles)}\n`);
    
    // Errors by category
    console.log('--- Errors by Category (Priority Order) ---');
    const sortedCategories = Object.entries(this.errorStats.errorsByCategory)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [category, data] of sortedCategories) {
      console.log(`${category}: ${data.count} errors (Priority ${data.priority})`);
    }
    
    // Errors by directory
    console.log('\n--- Errors by Directory ---');
    const sortedDirs = Object.entries(this.errorStats.errorsByDirectory)
      .sort(([,a], [,b]) => b.count - a.count);
    
    for (const [dirCategory, data] of sortedDirs) {
      console.log(`${dirCategory}: ${data.count} errors across ${data.fileCount} files`);
      
      // Show top error categories for this directory
      const categoryEntries = Object.entries(data.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
        
      if (categoryEntries.length > 0) {
        console.log(`  Top issues: ${categoryEntries.map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
      }
    }
    
    // Top error files
    console.log('\n--- Top 20 Files with Most Errors ---');
    for (const fileInfo of this.errorStats.topErrorFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.count} errors [${fileInfo.categories.join(', ')}]`);
    }
    
    // Critical files (syntax errors)
    console.log('\n--- Critical Files (Syntax Errors) ---');
    for (const fileInfo of this.errorStats.criticalFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.syntaxErrors} syntax errors out of ${fileInfo.count} total`);
    }
    
    // Easily fixable files
    console.log('\n--- Easily Fixable Files ---');
    for (const fileInfo of this.errorStats.fixableFiles) {
      console.log(`${fileInfo.file}: ${fileInfo.fixableErrors} fixable errors out of ${fileInfo.count} total`);
    }
    
    // Alchemical engine check
    this.checkAlchemicalEngine();
    
    // Recommendations
    console.log('\n--- Recommended Fix Order ---');
    console.log('1. Fix syntax errors first (breaks parsing)');
    console.log('2. Fix import/export errors (breaks module system)');
    console.log('3. Focus on alchemical engine errors (core functionality)');
    console.log('4. Fix component errors that affect rendering');
    console.log('5. Address type and function errors');
    
    console.log('\n--- Available Fix Scripts ---');
    console.log('• scripts/syntax-fixes/ - Fix syntax errors');
    console.log('• scripts/typescript-fixes/ - Fix TypeScript type errors');
    console.log('• scripts/elemental-fixes/ - Fix alchemical/elemental logic errors');
    console.log('• scripts/cuisine-fixes/ - Fix cuisine-specific errors');
    
    console.log('\n--- Advanced Analysis Commands ---');
    console.log('• Analyze specific directory:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-dir=src/components');
    console.log('• Analyze specific files:');
    console.log('  node scripts/typescript-error-analysis.mjs --target-files="src/calculations/alchemize.ts src/utils/elements.ts"');
    console.log('• Filter by error category:');
    console.log('  node scripts/typescript-error-analysis.mjs --include-categories="Syntax Errors,Import/Export Errors"');
  }

  checkAlchemicalEngine() {
    console.log('\n--- Alchemical Engine Status ---');
    
    // Core alchemical files that are critical to the system
    const alchemicalFiles = [
      'src/calculations/alchemize.ts',
      'src/calculations/alchemicalEngine.ts',
      'src/calculations/alchemicalCalculations.ts',
      'src/calculations/alchemicalTransformation.ts',
      'src/utils/astrologyUtils',
      'src/utils/elementalMappings',
      'src/utils/astrologyUtils/index.ts',
      'src/utils/elementalMappings/index.ts',
      'src/utils/astrologyUtils.ts',
      'src/utils/elementalMappings.ts',
      'src/utils/elementalUtils.ts',
      'src/utils/elementalCompatibility.ts',
      'src/utils/reliableAstronomy.ts',
      'src/utils/safeAstrology.ts',
      'src/services/AstrologicalService.ts',
      'src/services/ElementalCalculator.ts',
      'src/lib/alchemicalEngine.ts',
      'src/lib/elementalSystem.ts'
    ];
    
    const coreStructures = [
      'alchemize', 
      'elementalCompatibility',
      'calculateElementalBalance',
      'getElementalBreakdown',
      'calculateSeasonalScores',
      'planetInfo',
      'signInfo',
      'getComplementaryElement'
    ];
    
    // Check 1: File-level errors in alchemical files
    const alchemicalErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => {
        return alchemicalFiles.some(pattern => filePath.includes(pattern));
      })
      .sort(([,a], [,b]) => b.count - a.count);
    
    // Check 2: Look for errors in core structure functions
    const structureErrors = Object.entries(this.errorStats.errorsByFile)
      .filter(([_, data]) => {
        return data.errors.some(error => 
          coreStructures.some(structure => error.message.includes(structure))
        );
      });
    
    if (alchemicalErrors.length > 0) {
      console.log(`Found ${alchemicalErrors.length} alchemical engine files with errors:`);
      alchemicalErrors.slice(0, 5).forEach(([filePath, data]) => {
        console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${data.count} errors`);
        
        // Show example errors
        const syntaxErrors = data.errors.filter(e => e.category === 'Syntax Errors');
        if (syntaxErrors.length > 0) {
          console.log(`    First syntax error: ${syntaxErrors[0].message} (line ${syntaxErrors[0].line})`);
        }
      });
      
      console.log(`\nRecommendation: Fix alchemical engine errors as highest priority (after syntax).`);
      
      // Examine core alchemical structures
      if (structureErrors.length > 0) {
        console.log(`\nCRITICAL: Found errors in core alchemical structures:`);
        structureErrors.slice(0, 3).forEach(([filePath, data]) => {
          const structuralIssues = data.errors.filter(error => 
            coreStructures.some(structure => error.message.includes(structure))
          );
          
          console.log(`  ${path.relative(ROOT_DIR, filePath)}: ${structuralIssues.length} structural issues`);
          structuralIssues.slice(0, 2).forEach(error => {
            console.log(`    ${error.message} (line ${error.line})`);
          });
        });
      }
      
      // Generate specific fix commands
      console.log(`\nFix Commands:`);
      console.log(`  1. node scripts/fix-project.mjs --category=elemental --dry-run`);
      console.log(`  2. node scripts/elemental-fixes/fix-alchemical-engine.js --file=${
        path.relative(ROOT_DIR, alchemicalErrors[0]?.[0] || '')
      }`);
    } else {
      console.log('No errors detected in alchemical engine core files.');
      
      // Verify core alchemical structures are present
      try {
        const alchemicalPath = path.join(ROOT_DIR, 'src/calculations/alchemize.ts');
        if (fs.existsSync(alchemicalPath)) {
          const content = fs.readFileSync(alchemicalPath, 'utf-8');
          const hasCoreFunction = content.includes('function alchemize(');
          if (hasCoreFunction) {
            console.log('Core alchemical engine structure verified.');
          } else {
            console.log('WARNING: alchemize() function not found in expected location.');
          }
        } else {
          console.log('WARNING: Core alchemical file not found at expected path.');
        }
      } catch (error) {
        console.log('Could not verify alchemical engine structure:', error.message);
      }
    }
    
    // Check for elemental principles violations
    this.checkElementalPrinciples();
  }

  checkElementalPrinciples() {
    console.log('\n--- Elemental Principles Check ---');
    
    // Rules from elemental-principles-guide.md
    const violationPatterns = [
      { 
        pattern: /(fire.*?oppos.*?water|water.*?oppos.*?fire|earth.*?oppos.*?Air|Air.*?oppos.*?earth)/i,
        description: 'Treating elements as opposing each other'
      },
      { 
        pattern: /balance.*?element/i,
        description: 'Attempting to balance elements against each other'
      },
      { 
        pattern: /getOpposingElement|oppositeElement|elementOpposites/i,
        description: 'Using the concept of opposing elements'
      }
    ];
    
    const elementalFiles = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => filePath.includes('elemental') || filePath.includes('Element'));
    
    if (elementalFiles.length === 0) {
      console.log('No elemental files found with errors.');
      return;
    }
    
    // Track files with potential violations for manual review
    const potentialViolations = [];
    
    // Process all error messages in elemental files
    elementalFiles.forEach(([filePath, data]) => {
      data.errors.forEach(error => {
        for (const {pattern, description} of violationPatterns) {
          if (pattern.test(error.message)) {
            potentialViolations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: error.line,
              message: error.message,
              violation: description
            });
            break;
          }
        }
      });
    });
    
    if (potentialViolations.length > 0) {
      console.log(`Found ${potentialViolations.length} potential elemental principles violations:`);
      potentialViolations.slice(0, 5).forEach(violation => {
        console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
      });
      
      console.log('\nRecommendation: Run elemental principles check');
      console.log('  node scripts/elemental-fixes/fix-elemental-logic.js --check-only');
    } else {
      console.log('No obvious elemental principles violations found in error messages.');
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(ROOT_DIR, 'typescript-error-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recommendations: {
        priorityOrder: [
          'Syntax Errors',
          'Import/Export Errors', 
          'Alchemical Engine Errors',
          'Component Errors',
          'Type Errors',
          'Function/Method Errors',
          'JSX/React Errors',
          'Configuration Errors'
        ],
        suggestedScripts: {
          'Syntax Errors': 'scripts/syntax-fixes/fix-syntax-errors.js',
          'Type Errors': 'scripts/typescript-fixes/fix-typescript-safely.js',
          'Import/Export Errors': 'scripts/typescript-fixes/fix-typescript-errors.js',
          'Alchemical Engine Errors': 'scripts/elemental-fixes/fix-alchemical-engine.js'
        },
        targetedFixes: [
          {
            pattern: `Fix missing semicolons and commas`,
            errorCodes: ['TS1005'],
            script: 'scripts/syntax-fixes/fix-syntax-errors.js'
          },
          {
            pattern: `Fix property assignment syntax`,
            errorCodes: ['TS1136'],
            script: 'scripts/syntax-fixes/fix-object-literals.js'
          },
          {
            pattern: `Fix JSX syntax errors`,
            errorCodes: ['TS1144'],
            script: 'scripts/syntax-fixes/fix-jsx-syntax.js'
          }
        ]
      },
      filters: {
        directories: Object.keys(DIRECTORY_CATEGORIES),
        errorCategories: Object.keys(ERROR_CATEGORIES),
        priorities: Object.entries(PRIORITY_MAPPING)
          .sort(([,a], [,b]) => a - b)
          .map(([cat]) => cat)
      }
    };
    
    if (!this.options.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      this.log(`Detailed report saved to ${reportPath}`);
    } else {
      this.log(`Would save detailed report to ${reportPath}`);
    }
  }

  // Generate a targeted fix plan for specific directories or error types
  generateFixPlan(targetCategory) {
    console.log(`\n=== Fix Plan for ${targetCategory} ===\n`);
    
    let targetFiles = [];
    let fixStrategy = '';
    
    // If we're targeting a directory category
    if (this.errorStats.errorsByDirectory[targetCategory]) {
      const dirData = this.errorStats.errorsByDirectory[targetCategory];
      targetFiles = dirData.files.slice(0, 10); // Just first 10 files
      
      // Determine most common error type
      const topErrorCategory = Object.entries(dirData.categories)
        .sort(([,a], [,b]) => b - a)
        [0][0];
      
      fixStrategy = `Focus first on ${topErrorCategory} which account for ${dirData.categories[topErrorCategory]} errors`;
    } 
    // If we're targeting an error category
    else if (this.errorStats.errorsByCategory[targetCategory]) {
      const categoryData = this.errorStats.errorsByCategory[targetCategory];
      const filesByCategory = Object.entries(this.errorStats.errorsByFile)
        .filter(([, data]) => data.categories.has(targetCategory))
        .sort(([,a], [,b]) => b.count - a.count);
      
      targetFiles = filesByCategory.slice(0, 10).map(([file]) => file);
      
      fixStrategy = `Use scripts/fix-project.mjs --category=${targetCategory.toLowerCase().split(' ')[0]}`;
    }
    
    console.log(`Top files to fix (${targetFiles.length}):`);
    targetFiles.forEach(file => {
      console.log(`- ${path.relative(ROOT_DIR, file)}`);
    });
    
    console.log(`\nFix strategy: ${fixStrategy}`);
    console.log('\nSequential fix commands:');
    console.log(`1. node scripts/fix-project.mjs --target=${targetFiles[0]} --dry-run`);
    console.log(`2. yarn build --verbose`);
    console.log(`3. node scripts/typescript-error-analysis.mjs --target-files="${targetFiles[0]}"`);
  }

  async analyzeFilesDirectly() {
    this.log('Analyzing files directly for syntax errors...');
    
    let targetFiles = this.options.targetFiles;
    
    // If no specific files are targeted, use critical files
    if (!targetFiles || targetFiles.length === 0) {
      targetFiles = findCriticalFiles();
      this.log(`No files specified, using ${targetFiles.length} known critical files`);
    }
    
    const analyzedFiles = [];
    
    for (const filePath of targetFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          this.log(`File not found: ${filePath}`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileErrors = this.detectSyntaxErrors(content, filePath);
        
        analyzedFiles.push({
          file: filePath,
          errorCount: fileErrors.length
        });
        
        fileErrors.forEach(error => {
          this.addError(
            filePath, 
            error.code || 'TS9999', 
            error.message,
            error.line,
            error.column || 1
          );
        });
      } catch (err) {
        this.log(`Error analyzing file ${filePath}: ${err.message}`);
      }
    }
    
    this.log(`Direct analysis complete. Analyzed ${analyzedFiles.length} files.`);
    this.errorStats.totalFiles = analyzedFiles.length;
    this.errorStats.totalErrors = Object.values(this.errorStats.errorsByFile)
      .reduce((total, file) => total + file.count, 0);
    
    this.calculateStatistics();
    return this.errorStats;
  }
  
  detectSyntaxErrors(content, filePath) {
    const errors = [];
    const lines = content.split('\n');
    
    // Simple patterns to detect common syntax errors
    const errorPatterns = [
      { 
        pattern: /([{,:;]\s*})/g,
        code: 'TS1005',
        message: 'Unexpected token - object or block syntax error' 
      },
      { 
        pattern: /(\w+:.*?:)/g,  
        code: 'TS1005',
        message: 'Multiple colons in parameter/type declaration' 
      },
      { 
        pattern: /(\w+:\s*\w+:)/g,
        code: 'TS1005',
        message: 'Double type annotation' 
      },
      { 
        pattern: /(async.*?=>\s*{\s*\w+\s*})/g,
        code: 'TS1005',
        message: 'Invalid async arrow function' 
      },
      { 
        pattern: /export\s+let.*?=.*?,/g,
        code: 'TS1005',
        message: 'Invalid export with comma' 
      },
      { 
        pattern: /[^{},;\s]\s*}/g,
        code: 'TS1068',
        message: 'Unexpected token before closing bracket' 
      },
      {
        pattern: /catch.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete catch block'
      },
      {
        pattern: /try.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete try block'
      },
      {
        pattern: /[=([]\s*$/gm,
        code: 'TS1005',
        message: 'Expression expected'
      }
    ];
    
    // Check each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const {pattern, code, message} of errorPatterns) {
        if (pattern.test(line)) {
          errors.push({
            line: i + 1,
            column: line.search(pattern) + 1,
            code,
            message,
            category: 'Syntax Errors'
          });
        }
      }
      
      // Specific checks for function parameter patterns
      if (/(function|async|export)\s+\w+\s*\(.*?\w+\s*:\s*\w+\s*:\s*/.test(line)) {
        errors.push({
          line: i + 1,
          column: line.indexOf(':') + 1,
          code: 'TS1005',
          message: 'Invalid parameter type syntax',
          category: 'Syntax Errors'
        });
      }
      
      // Check for missing closing parentheses/curly braces with context
      if (i > 0 && lines[i-1].includes('(') && !lines[i-1].includes(')') && 
          line.trim().startsWith(')') && !line.includes('(')) {
        errors.push({
          line: i,
          column: 1,
          code: 'TS1005',
          message: 'Misplaced closing parenthesis',
          category: 'Syntax Errors'
        });
      }
    }
    
    // Look for function parameter pattern issues across multiple lines
    const content2Line = content.replace(/\n/g, ' ');
    const functionParamPattern = /\(\s*\w+\s*:\s*\w+\s*:\s*[^)]*?\)/g;
    let match;
    
    while ((match = functionParamPattern.exec(content2Line)) !== null) {
      // Find line number for this match
      const upToMatch = content2Line.substring(0, match.index);
      const lineNumber = upToMatch.split(' ').filter(l => l === '\n').length + 1;
      
      errors.push({
        line: lineNumber,
        column: 1,
        code: 'TS1005',
        message: 'Invalid parameter type declaration',
        category: 'Syntax Errors'
      });
    }
    
    return errors;
  }
  
  async showFileWithErrors(filePath) {
    console.log(`\n=== File Content With Errors: ${path.basename(filePath)} ===`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Get errors for this file
      const fileErrors = this.errorStats.errorsByFile[filePath]?.errors || [];
      
      // Sort errors by line number
      const sortedErrors = [...fileErrors].sort((a, b) => a.line - b.line);
      
      // Create map of line numbers to errors
      const errorsByLine = {};
      sortedErrors.forEach(error => {
        if (!errorsByLine[error.line]) {
          errorsByLine[error.line] = [];
        }
        errorsByLine[error.line].push(error);
      });
      
      // Show lines with errors
      const contextLines = 2; // Show this many lines before and after errors
      
      // Find line ranges with errors, including context
      const lineRanges = [];
      let currentRange = null;
      
      for (const lineNum in errorsByLine) {
        const line = parseInt(lineNum);
        const start = Math.max(1, line - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        
        if (!currentRange || start > currentRange.end + 1) {
          if (currentRange) {
            lineRanges.push(currentRange);
          }
          currentRange = { start, end };
        } else {
          currentRange.end = Math.max(currentRange.end, end);
        }
      }
      
      if (currentRange) {
        lineRanges.push(currentRange);
      }
      
      // Display the line ranges with errors
      for (const range of lineRanges) {
        console.log(`\n${'-'.repeat(80)}`);
        for (let i = range.start; i <= range.end; i++) {
          const line = lines[i - 1] || '';
          const hasError = errorsByLine[i];
          
          const lineDisplay = hasError 
            ? `${i.toString().padStart(4, ' ')}* | ${line.slice(0, 120)}`
            : `${i.toString().padStart(4, ' ')}  | ${line.slice(0, 120)}`;
          
          console.log(lineDisplay);
          
          if (hasError) {
            errorsByLine[i].forEach(error => {
              // Add an indicator pointing to the error position
              const pointer = ' '.repeat(8 + error.column) + '^';
              console.log(`${pointer} ${error.message}`);
            });
          }
        }
      }
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Total: ${sortedErrors.length} errors in ${path.basename(filePath)}`);
      
    } catch (err) {
      console.error(`Error displaying file: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--execute'),
    targetDir: null,
    targetFiles: null,
    excludeDirs: [],
    excludeErrorCodes: [],
    includeErrorCodes: [],
    includeCategories: null,
    generateFixPlan: null,
    analysisMode: 'full', // 'full', 'syntax-only', 'alchemical-only'
  };
  
  // Parse complex arguments
  for (const arg of args) {
    if (arg.startsWith('--target-dir=')) {
      options.targetDir = arg.split('=')[1];
    } else if (arg.startsWith('--target-files=')) {
      options.targetFiles = arg.split('=')[1].split(' ');
    } else if (arg.startsWith('--exclude-dirs=')) {
      options.excludeDirs = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--exclude-errors=')) {
      options.excludeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-errors=')) {
      options.includeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-categories=')) {
      options.includeCategories = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--fix-plan=')) {
      options.generateFixPlan = arg.split('=')[1];
    } else if (arg === '--syntax-only') {
      options.analysisMode = 'syntax-only';
      options.includeCategories = ['Syntax Errors'];
    } else if (arg === '--alchemical-only') {
      options.analysisMode = 'alchemical-only';
      options.targetFiles = findAlchemicalFiles();
    } else if (arg === '--critical-files-only') {
      options.targetFiles = findCriticalFiles();
    } else if (arg === '--direct-parse') {
      // This flag skips tsc and directly analyzes files for errors
      options.useDirectParse = true;
    }
  }
  
  console.log('=== TypeScript Error Analysis Tool ===');
  console.log(`Mode: ${options.dryRun ? 'ANALYSIS ONLY' : 'ANALYSIS + SAVE'}`);
  
  if (options.targetDir) {
    console.log(`Target Directory: ${options.targetDir}`);
  }
  
  if (options.targetFiles) {
    console.log(`Target Files: ${Array.isArray(options.targetFiles) ? 
      options.targetFiles.length + ' files targeted' : 
      options.targetFiles}`);
  }
  
  if (options.analysisMode !== 'full') {
    console.log(`Analysis Mode: ${options.analysisMode}`);
  }
  
  if (options.useDirectParse) {
    console.log('Using direct file parsing (bypassing TypeScript compiler)');
  }
  
  console.log('Add --execute flag to save detailed report');
  console.log('');
  
  const analyzer = new TypeScriptErrorAnalyzer(options);
  
  try {
    if (options.useDirectParse) {
      await analyzer.analyzeFilesDirectly();
    } else {
      await analyzer.analyzeErrors();
    }
    
    analyzer.generateReport();
    
    if (options.generateFixPlan) {
      analyzer.generateFixPlan(options.generateFixPlan);
    }
    
    await analyzer.saveDetailedReport();
    
    // For specific target files, also print the original content with errors
    if (options.targetFiles && options.targetFiles.length === 1) {
      const file = options.targetFiles[0];
      if (fs.existsSync(file)) {
        await analyzer.showFileWithErrors(file);
      }
    }
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

// Helper functions for specialized file targeting

function findAlchemicalFiles() {
  const alchemicalPatterns = [
    'src/calculations/alchemize.ts',
    'src/calculations/alchemical*.ts',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings',
    'src/services/AstrologicalService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  alchemicalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}*" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

function findCriticalFiles() {
  // These are files with known critical errors that block parsing
  // We'll start with test scripts that have many syntax errors
  const criticalPatterns = [
    'test-scripts/reliableAstronomy.ts',
    'test-scripts/safeAccess.ts',
    'test-scripts/safeAstrology.ts',
    'test-scripts/seasonalCalculations.ts',
    'src/context/AstrologicalContext.tsx',
    'src/context/ChartContext.tsx',
    'src/data/cuisineFlavorProfiles.ts',
    'src/data/recipes.ts',
    'src/services/RecommendationAdapter.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  criticalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

// Make main async
async function runMain() {
  await main();
}

runMain(); |earth.*?oppos.*?Air|Air.*?oppos.*?earth)/i,
        description: 'Treating elements as opposing each other'
      },
      { 
        pattern: /balance.*?element/i,
        description: 'Attempting to balance elements against each other'
      },
      { 
        pattern: /getOpposingElement|oppositeElement|elementOpposites/i,
        description: 'Using the concept of opposing elements'
      }
    ];
    
    const elementalFiles = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => filePath.includes('elemental') || filePath.includes('Element'));
    
    if (elementalFiles.length === 0) {
      console.log('No elemental files found with errors.');
      return;
    }
    
    // Track files with potential violations for manual review
    const potentialViolations = [];
    
    // Process all error messages in elemental files
    elementalFiles.forEach(([filePath, data]) => {
      data.errors.forEach(error => {
        for (const {pattern, description} of violationPatterns) {
          if (pattern.test(error.message)) {
            potentialViolations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: error.line,
              message: error.message,
              violation: description
            });
            break;
          }
        }
      });
    });
    
    if (potentialViolations.length > 0) {
      console.log(`Found ${potentialViolations.length} potential elemental principles violations:`);
      potentialViolations.slice(0, 5).forEach(violation => {
        console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
      });
      
      console.log('\nRecommendation: Run elemental principles check');
      console.log('  node scripts/elemental-fixes/fix-elemental-logic.js --check-only');
    } else {
      console.log('No obvious elemental principles violations found in error messages.');
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(ROOT_DIR, 'typescript-error-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recommendations: {
        priorityOrder: [
          'Syntax Errors',
          'Import/Export Errors', 
          'Alchemical Engine Errors',
          'Component Errors',
          'Type Errors',
          'Function/Method Errors',
          'JSX/React Errors',
          'Configuration Errors'
        ],
        suggestedScripts: {
          'Syntax Errors': 'scripts/syntax-fixes/fix-syntax-errors.js',
          'Type Errors': 'scripts/typescript-fixes/fix-typescript-safely.js',
          'Import/Export Errors': 'scripts/typescript-fixes/fix-typescript-errors.js',
          'Alchemical Engine Errors': 'scripts/elemental-fixes/fix-alchemical-engine.js'
        },
        targetedFixes: [
          {
            pattern: `Fix missing semicolons and commas`,
            errorCodes: ['TS1005'],
            script: 'scripts/syntax-fixes/fix-syntax-errors.js'
          },
          {
            pattern: `Fix property assignment syntax`,
            errorCodes: ['TS1136'],
            script: 'scripts/syntax-fixes/fix-object-literals.js'
          },
          {
            pattern: `Fix JSX syntax errors`,
            errorCodes: ['TS1144'],
            script: 'scripts/syntax-fixes/fix-jsx-syntax.js'
          }
        ]
      },
      filters: {
        directories: Object.keys(DIRECTORY_CATEGORIES),
        errorCategories: Object.keys(ERROR_CATEGORIES),
        priorities: Object.entries(PRIORITY_MAPPING)
          .sort(([,a], [,b]) => a - b)
          .map(([cat]) => cat)
      }
    };
    
    if (!this.options.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      this.log(`Detailed report saved to ${reportPath}`);
    } else {
      this.log(`Would save detailed report to ${reportPath}`);
    }
  }

  // Generate a targeted fix plan for specific directories or error types
  generateFixPlan(targetCategory) {
    console.log(`\n=== Fix Plan for ${targetCategory} ===\n`);
    
    let targetFiles = [];
    let fixStrategy = '';
    
    // If we're targeting a directory category
    if (this.errorStats.errorsByDirectory[targetCategory]) {
      const dirData = this.errorStats.errorsByDirectory[targetCategory];
      targetFiles = dirData.files.slice(0, 10); // Just first 10 files
      
      // Determine most common error type
      const topErrorCategory = Object.entries(dirData.categories)
        .sort(([,a], [,b]) => b - a)
        [0][0];
      
      fixStrategy = `Focus first on ${topErrorCategory} which account for ${dirData.categories[topErrorCategory]} errors`;
    } 
    // If we're targeting an error category
    else if (this.errorStats.errorsByCategory[targetCategory]) {
      const categoryData = this.errorStats.errorsByCategory[targetCategory];
      const filesByCategory = Object.entries(this.errorStats.errorsByFile)
        .filter(([, data]) => data.categories.has(targetCategory))
        .sort(([,a], [,b]) => b.count - a.count);
      
      targetFiles = filesByCategory.slice(0, 10).map(([file]) => file);
      
      fixStrategy = `Use scripts/fix-project.mjs --category=${targetCategory.toLowerCase().split(' ')[0]}`;
    }
    
    console.log(`Top files to fix (${targetFiles.length}):`);
    targetFiles.forEach(file => {
      console.log(`- ${path.relative(ROOT_DIR, file)}`);
    });
    
    console.log(`\nFix strategy: ${fixStrategy}`);
    console.log('\nSequential fix commands:');
    console.log(`1. node scripts/fix-project.mjs --target=${targetFiles[0]} --dry-run`);
    console.log(`2. yarn build --verbose`);
    console.log(`3. node scripts/typescript-error-analysis.mjs --target-files="${targetFiles[0]}"`);
  }

  async analyzeFilesDirectly() {
    this.log('Analyzing files directly for syntax errors...');
    
    let targetFiles = this.options.targetFiles;
    
    // If no specific files are targeted, use critical files
    if (!targetFiles || targetFiles.length === 0) {
      targetFiles = findCriticalFiles();
      this.log(`No files specified, using ${targetFiles.length} known critical files`);
    }
    
    const analyzedFiles = [];
    
    for (const filePath of targetFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          this.log(`File not found: ${filePath}`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileErrors = this.detectSyntaxErrors(content, filePath);
        
        analyzedFiles.push({
          file: filePath,
          errorCount: fileErrors.length
        });
        
        fileErrors.forEach(error => {
          this.addError(
            filePath, 
            error.code || 'TS9999', 
            error.message,
            error.line,
            error.column || 1
          );
        });
      } catch (err) {
        this.log(`Error analyzing file ${filePath}: ${err.message}`);
      }
    }
    
    this.log(`Direct analysis complete. Analyzed ${analyzedFiles.length} files.`);
    this.errorStats.totalFiles = analyzedFiles.length;
    this.errorStats.totalErrors = Object.values(this.errorStats.errorsByFile)
      .reduce((total, file) => total + file.count, 0);
    
    this.calculateStatistics();
    return this.errorStats;
  }
  
  detectSyntaxErrors(content, filePath) {
    const errors = [];
    const lines = content.split('\n');
    
    // Simple patterns to detect common syntax errors
    const errorPatterns = [
      { 
        pattern: /([{,:;]\s*})/g,
        code: 'TS1005',
        message: 'Unexpected token - object or block syntax error' 
      },
      { 
        pattern: /(\w+:.*?:)/g,  
        code: 'TS1005',
        message: 'Multiple colons in parameter/type declaration' 
      },
      { 
        pattern: /(\w+:\s*\w+:)/g,
        code: 'TS1005',
        message: 'Double type annotation' 
      },
      { 
        pattern: /(async.*?=>\s*{\s*\w+\s*})/g,
        code: 'TS1005',
        message: 'Invalid async arrow function' 
      },
      { 
        pattern: /export\s+let.*?=.*?,/g,
        code: 'TS1005',
        message: 'Invalid export with comma' 
      },
      { 
        pattern: /[^{},;\s]\s*}/g,
        code: 'TS1068',
        message: 'Unexpected token before closing bracket' 
      },
      {
        pattern: /catch.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete catch block'
      },
      {
        pattern: /try.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete try block'
      },
      {
        pattern: /[=([]\s*$/gm,
        code: 'TS1005',
        message: 'Expression expected'
      }
    ];
    
    // Check each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const {pattern, code, message} of errorPatterns) {
        if (pattern.test(line)) {
          errors.push({
            line: i + 1,
            column: line.search(pattern) + 1,
            code,
            message,
            category: 'Syntax Errors'
          });
        }
      }
      
      // Specific checks for function parameter patterns
      if (/(function|async|export)\s+\w+\s*\(.*?\w+\s*:\s*\w+\s*:\s*/.test(line)) {
        errors.push({
          line: i + 1,
          column: line.indexOf(':') + 1,
          code: 'TS1005',
          message: 'Invalid parameter type syntax',
          category: 'Syntax Errors'
        });
      }
      
      // Check for missing closing parentheses/curly braces with context
      if (i > 0 && lines[i-1].includes('(') && !lines[i-1].includes(')') && 
          line.trim().startsWith(')') && !line.includes('(')) {
        errors.push({
          line: i,
          column: 1,
          code: 'TS1005',
          message: 'Misplaced closing parenthesis',
          category: 'Syntax Errors'
        });
      }
    }
    
    // Look for function parameter pattern issues across multiple lines
    const content2Line = content.replace(/\n/g, ' ');
    const functionParamPattern = /\(\s*\w+\s*:\s*\w+\s*:\s*[^)]*?\)/g;
    let match;
    
    while ((match = functionParamPattern.exec(content2Line)) !== null) {
      // Find line number for this match
      const upToMatch = content2Line.substring(0, match.index);
      const lineNumber = upToMatch.split(' ').filter(l => l === '\n').length + 1;
      
      errors.push({
        line: lineNumber,
        column: 1,
        code: 'TS1005',
        message: 'Invalid parameter type declaration',
        category: 'Syntax Errors'
      });
    }
    
    return errors;
  }
  
  async showFileWithErrors(filePath) {
    console.log(`\n=== File Content With Errors: ${path.basename(filePath)} ===`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Get errors for this file
      const fileErrors = this.errorStats.errorsByFile[filePath]?.errors || [];
      
      // Sort errors by line number
      const sortedErrors = [...fileErrors].sort((a, b) => a.line - b.line);
      
      // Create map of line numbers to errors
      const errorsByLine = {};
      sortedErrors.forEach(error => {
        if (!errorsByLine[error.line]) {
          errorsByLine[error.line] = [];
        }
        errorsByLine[error.line].push(error);
      });
      
      // Show lines with errors
      const contextLines = 2; // Show this many lines before and after errors
      
      // Find line ranges with errors, including context
      const lineRanges = [];
      let currentRange = null;
      
      for (const lineNum in errorsByLine) {
        const line = parseInt(lineNum);
        const start = Math.max(1, line - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        
        if (!currentRange || start > currentRange.end + 1) {
          if (currentRange) {
            lineRanges.push(currentRange);
          }
          currentRange = { start, end };
        } else {
          currentRange.end = Math.max(currentRange.end, end);
        }
      }
      
      if (currentRange) {
        lineRanges.push(currentRange);
      }
      
      // Display the line ranges with errors
      for (const range of lineRanges) {
        console.log(`\n${'-'.repeat(80)}`);
        for (let i = range.start; i <= range.end; i++) {
          const line = lines[i - 1] || '';
          const hasError = errorsByLine[i];
          
          const lineDisplay = hasError 
            ? `${i.toString().padStart(4, ' ')}* | ${line.slice(0, 120)}`
            : `${i.toString().padStart(4, ' ')}  | ${line.slice(0, 120)}`;
          
          console.log(lineDisplay);
          
          if (hasError) {
            errorsByLine[i].forEach(error => {
              // Add an indicator pointing to the error position
              const pointer = ' '.repeat(8 + error.column) + '^';
              console.log(`${pointer} ${error.message}`);
            });
          }
        }
      }
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Total: ${sortedErrors.length} errors in ${path.basename(filePath)}`);
      
    } catch (err) {
      console.error(`Error displaying file: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--execute'),
    targetDir: null,
    targetFiles: null,
    excludeDirs: [],
    excludeErrorCodes: [],
    includeErrorCodes: [],
    includeCategories: null,
    generateFixPlan: null,
    analysisMode: 'full', // 'full', 'syntax-only', 'alchemical-only'
  };
  
  // Parse complex arguments
  for (const arg of args) {
    if (arg.startsWith('--target-dir=')) {
      options.targetDir = arg.split('=')[1];
    } else if (arg.startsWith('--target-files=')) {
      options.targetFiles = arg.split('=')[1].split(' ');
    } else if (arg.startsWith('--exclude-dirs=')) {
      options.excludeDirs = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--exclude-errors=')) {
      options.excludeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-errors=')) {
      options.includeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-categories=')) {
      options.includeCategories = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--fix-plan=')) {
      options.generateFixPlan = arg.split('=')[1];
    } else if (arg === '--syntax-only') {
      options.analysisMode = 'syntax-only';
      options.includeCategories = ['Syntax Errors'];
    } else if (arg === '--alchemical-only') {
      options.analysisMode = 'alchemical-only';
      options.targetFiles = findAlchemicalFiles();
    } else if (arg === '--critical-files-only') {
      options.targetFiles = findCriticalFiles();
    } else if (arg === '--direct-parse') {
      // This flag skips tsc and directly analyzes files for errors
      options.useDirectParse = true;
    }
  }
  
  console.log('=== TypeScript Error Analysis Tool ===');
  console.log(`Mode: ${options.dryRun ? 'ANALYSIS ONLY' : 'ANALYSIS + SAVE'}`);
  
  if (options.targetDir) {
    console.log(`Target Directory: ${options.targetDir}`);
  }
  
  if (options.targetFiles) {
    console.log(`Target Files: ${Array.isArray(options.targetFiles) ? 
      options.targetFiles.length + ' files targeted' : 
      options.targetFiles}`);
  }
  
  if (options.analysisMode !== 'full') {
    console.log(`Analysis Mode: ${options.analysisMode}`);
  }
  
  if (options.useDirectParse) {
    console.log('Using direct file parsing (bypassing TypeScript compiler)');
  }
  
  console.log('Add --execute flag to save detailed report');
  console.log('');
  
  const analyzer = new TypeScriptErrorAnalyzer(options);
  
  try {
    if (options.useDirectParse) {
      await analyzer.analyzeFilesDirectly();
    } else {
      await analyzer.analyzeErrors();
    }
    
    analyzer.generateReport();
    
    if (options.generateFixPlan) {
      analyzer.generateFixPlan(options.generateFixPlan);
    }
    
    await analyzer.saveDetailedReport();
    
    // For specific target files, also print the original content with errors
    if (options.targetFiles && options.targetFiles.length === 1) {
      const file = options.targetFiles[0];
      if (fs.existsSync(file)) {
        await analyzer.showFileWithErrors(file);
      }
    }
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

// Helper functions for specialized file targeting

function findAlchemicalFiles() {
  const alchemicalPatterns = [
    'src/calculations/alchemize.ts',
    'src/calculations/alchemical*.ts',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings',
    'src/services/AstrologicalService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  alchemicalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}*" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

function findCriticalFiles() {
  // These are files with known critical errors that block parsing
  // We'll start with test scripts that have many syntax errors
  const criticalPatterns = [
    'test-scripts/reliableAstronomy.ts',
    'test-scripts/safeAccess.ts',
    'test-scripts/safeAstrology.ts',
    'test-scripts/seasonalCalculations.ts',
    'src/context/AstrologicalContext.tsx',
    'src/context/ChartContext.tsx',
    'src/data/cuisineFlavorProfiles.ts',
    'src/data/recipes.ts',
    'src/services/RecommendationAdapter.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  criticalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

// Make main async
async function runMain() {
  await main();
}

runMain(); |water.*?oppos.*?fire|earth.*?oppos.*?Air|Air.*?oppos.*?earth)/i,
        description: 'Treating elements as opposing each other'
      },
      { 
        pattern: /balance.*?element/i,
        description: 'Attempting to balance elements against each other'
      },
      { 
        pattern: /getOpposingElement|oppositeElement|elementOpposites/i,
        description: 'Using the concept of opposing elements'
      }
    ];
    
    const elementalFiles = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => filePath.includes('elemental') || filePath.includes('Element'));
    
    if (elementalFiles.length === 0) {
      console.log('No elemental files found with errors.');
      return;
    }
    
    // Track files with potential violations for manual review
    const potentialViolations = [];
    
    // Process all error messages in elemental files
    elementalFiles.forEach(([filePath, data]) => {
      data.errors.forEach(error => {
        for (const {pattern, description} of violationPatterns) {
          if (pattern.test(error.message)) {
            potentialViolations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: error.line,
              message: error.message,
              violation: description
            });
            break;
          }
        }
      });
    });
    
    if (potentialViolations.length > 0) {
      console.log(`Found ${potentialViolations.length} potential elemental principles violations:`);
      potentialViolations.slice(0, 5).forEach(violation => {
        console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
      });
      
      console.log('\nRecommendation: Run elemental principles check');
      console.log('  node scripts/elemental-fixes/fix-elemental-logic.js --check-only');
    } else {
      console.log('No obvious elemental principles violations found in error messages.');
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(ROOT_DIR, 'typescript-error-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recommendations: {
        priorityOrder: [
          'Syntax Errors',
          'Import/Export Errors', 
          'Alchemical Engine Errors',
          'Component Errors',
          'Type Errors',
          'Function/Method Errors',
          'JSX/React Errors',
          'Configuration Errors'
        ],
        suggestedScripts: {
          'Syntax Errors': 'scripts/syntax-fixes/fix-syntax-errors.js',
          'Type Errors': 'scripts/typescript-fixes/fix-typescript-safely.js',
          'Import/Export Errors': 'scripts/typescript-fixes/fix-typescript-errors.js',
          'Alchemical Engine Errors': 'scripts/elemental-fixes/fix-alchemical-engine.js'
        },
        targetedFixes: [
          {
            pattern: `Fix missing semicolons and commas`,
            errorCodes: ['TS1005'],
            script: 'scripts/syntax-fixes/fix-syntax-errors.js'
          },
          {
            pattern: `Fix property assignment syntax`,
            errorCodes: ['TS1136'],
            script: 'scripts/syntax-fixes/fix-object-literals.js'
          },
          {
            pattern: `Fix JSX syntax errors`,
            errorCodes: ['TS1144'],
            script: 'scripts/syntax-fixes/fix-jsx-syntax.js'
          }
        ]
      },
      filters: {
        directories: Object.keys(DIRECTORY_CATEGORIES),
        errorCategories: Object.keys(ERROR_CATEGORIES),
        priorities: Object.entries(PRIORITY_MAPPING)
          .sort(([,a], [,b]) => a - b)
          .map(([cat]) => cat)
      }
    };
    
    if (!this.options.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      this.log(`Detailed report saved to ${reportPath}`);
    } else {
      this.log(`Would save detailed report to ${reportPath}`);
    }
  }

  // Generate a targeted fix plan for specific directories or error types
  generateFixPlan(targetCategory) {
    console.log(`\n=== Fix Plan for ${targetCategory} ===\n`);
    
    let targetFiles = [];
    let fixStrategy = '';
    
    // If we're targeting a directory category
    if (this.errorStats.errorsByDirectory[targetCategory]) {
      const dirData = this.errorStats.errorsByDirectory[targetCategory];
      targetFiles = dirData.files.slice(0, 10); // Just first 10 files
      
      // Determine most common error type
      const topErrorCategory = Object.entries(dirData.categories)
        .sort(([,a], [,b]) => b - a)
        [0][0];
      
      fixStrategy = `Focus first on ${topErrorCategory} which account for ${dirData.categories[topErrorCategory]} errors`;
    } 
    // If we're targeting an error category
    else if (this.errorStats.errorsByCategory[targetCategory]) {
      const categoryData = this.errorStats.errorsByCategory[targetCategory];
      const filesByCategory = Object.entries(this.errorStats.errorsByFile)
        .filter(([, data]) => data.categories.has(targetCategory))
        .sort(([,a], [,b]) => b.count - a.count);
      
      targetFiles = filesByCategory.slice(0, 10).map(([file]) => file);
      
      fixStrategy = `Use scripts/fix-project.mjs --category=${targetCategory.toLowerCase().split(' ')[0]}`;
    }
    
    console.log(`Top files to fix (${targetFiles.length}):`);
    targetFiles.forEach(file => {
      console.log(`- ${path.relative(ROOT_DIR, file)}`);
    });
    
    console.log(`\nFix strategy: ${fixStrategy}`);
    console.log('\nSequential fix commands:');
    console.log(`1. node scripts/fix-project.mjs --target=${targetFiles[0]} --dry-run`);
    console.log(`2. yarn build --verbose`);
    console.log(`3. node scripts/typescript-error-analysis.mjs --target-files="${targetFiles[0]}"`);
  }

  async analyzeFilesDirectly() {
    this.log('Analyzing files directly for syntax errors...');
    
    let targetFiles = this.options.targetFiles;
    
    // If no specific files are targeted, use critical files
    if (!targetFiles || targetFiles.length === 0) {
      targetFiles = findCriticalFiles();
      this.log(`No files specified, using ${targetFiles.length} known critical files`);
    }
    
    const analyzedFiles = [];
    
    for (const filePath of targetFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          this.log(`File not found: ${filePath}`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileErrors = this.detectSyntaxErrors(content, filePath);
        
        analyzedFiles.push({
          file: filePath,
          errorCount: fileErrors.length
        });
        
        fileErrors.forEach(error => {
          this.addError(
            filePath, 
            error.code || 'TS9999', 
            error.message,
            error.line,
            error.column || 1
          );
        });
      } catch (err) {
        this.log(`Error analyzing file ${filePath}: ${err.message}`);
      }
    }
    
    this.log(`Direct analysis complete. Analyzed ${analyzedFiles.length} files.`);
    this.errorStats.totalFiles = analyzedFiles.length;
    this.errorStats.totalErrors = Object.values(this.errorStats.errorsByFile)
      .reduce((total, file) => total + file.count, 0);
    
    this.calculateStatistics();
    return this.errorStats;
  }
  
  detectSyntaxErrors(content, filePath) {
    const errors = [];
    const lines = content.split('\n');
    
    // Simple patterns to detect common syntax errors
    const errorPatterns = [
      { 
        pattern: /([{,:;]\s*})/g,
        code: 'TS1005',
        message: 'Unexpected token - object or block syntax error' 
      },
      { 
        pattern: /(\w+:.*?:)/g,  
        code: 'TS1005',
        message: 'Multiple colons in parameter/type declaration' 
      },
      { 
        pattern: /(\w+:\s*\w+:)/g,
        code: 'TS1005',
        message: 'Double type annotation' 
      },
      { 
        pattern: /(async.*?=>\s*{\s*\w+\s*})/g,
        code: 'TS1005',
        message: 'Invalid async arrow function' 
      },
      { 
        pattern: /export\s+let.*?=.*?,/g,
        code: 'TS1005',
        message: 'Invalid export with comma' 
      },
      { 
        pattern: /[^{},;\s]\s*}/g,
        code: 'TS1068',
        message: 'Unexpected token before closing bracket' 
      },
      {
        pattern: /catch.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete catch block'
      },
      {
        pattern: /try.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete try block'
      },
      {
        pattern: /[=([]\s*$/gm,
        code: 'TS1005',
        message: 'Expression expected'
      }
    ];
    
    // Check each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const {pattern, code, message} of errorPatterns) {
        if (pattern.test(line)) {
          errors.push({
            line: i + 1,
            column: line.search(pattern) + 1,
            code,
            message,
            category: 'Syntax Errors'
          });
        }
      }
      
      // Specific checks for function parameter patterns
      if (/(function|async|export)\s+\w+\s*\(.*?\w+\s*:\s*\w+\s*:\s*/.test(line)) {
        errors.push({
          line: i + 1,
          column: line.indexOf(':') + 1,
          code: 'TS1005',
          message: 'Invalid parameter type syntax',
          category: 'Syntax Errors'
        });
      }
      
      // Check for missing closing parentheses/curly braces with context
      if (i > 0 && lines[i-1].includes('(') && !lines[i-1].includes(')') && 
          line.trim().startsWith(')') && !line.includes('(')) {
        errors.push({
          line: i,
          column: 1,
          code: 'TS1005',
          message: 'Misplaced closing parenthesis',
          category: 'Syntax Errors'
        });
      }
    }
    
    // Look for function parameter pattern issues across multiple lines
    const content2Line = content.replace(/\n/g, ' ');
    const functionParamPattern = /\(\s*\w+\s*:\s*\w+\s*:\s*[^)]*?\)/g;
    let match;
    
    while ((match = functionParamPattern.exec(content2Line)) !== null) {
      // Find line number for this match
      const upToMatch = content2Line.substring(0, match.index);
      const lineNumber = upToMatch.split(' ').filter(l => l === '\n').length + 1;
      
      errors.push({
        line: lineNumber,
        column: 1,
        code: 'TS1005',
        message: 'Invalid parameter type declaration',
        category: 'Syntax Errors'
      });
    }
    
    return errors;
  }
  
  async showFileWithErrors(filePath) {
    console.log(`\n=== File Content With Errors: ${path.basename(filePath)} ===`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Get errors for this file
      const fileErrors = this.errorStats.errorsByFile[filePath]?.errors || [];
      
      // Sort errors by line number
      const sortedErrors = [...fileErrors].sort((a, b) => a.line - b.line);
      
      // Create map of line numbers to errors
      const errorsByLine = {};
      sortedErrors.forEach(error => {
        if (!errorsByLine[error.line]) {
          errorsByLine[error.line] = [];
        }
        errorsByLine[error.line].push(error);
      });
      
      // Show lines with errors
      const contextLines = 2; // Show this many lines before and after errors
      
      // Find line ranges with errors, including context
      const lineRanges = [];
      let currentRange = null;
      
      for (const lineNum in errorsByLine) {
        const line = parseInt(lineNum);
        const start = Math.max(1, line - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        
        if (!currentRange || start > currentRange.end + 1) {
          if (currentRange) {
            lineRanges.push(currentRange);
          }
          currentRange = { start, end };
        } else {
          currentRange.end = Math.max(currentRange.end, end);
        }
      }
      
      if (currentRange) {
        lineRanges.push(currentRange);
      }
      
      // Display the line ranges with errors
      for (const range of lineRanges) {
        console.log(`\n${'-'.repeat(80)}`);
        for (let i = range.start; i <= range.end; i++) {
          const line = lines[i - 1] || '';
          const hasError = errorsByLine[i];
          
          const lineDisplay = hasError 
            ? `${i.toString().padStart(4, ' ')}* | ${line.slice(0, 120)}`
            : `${i.toString().padStart(4, ' ')}  | ${line.slice(0, 120)}`;
          
          console.log(lineDisplay);
          
          if (hasError) {
            errorsByLine[i].forEach(error => {
              // Add an indicator pointing to the error position
              const pointer = ' '.repeat(8 + error.column) + '^';
              console.log(`${pointer} ${error.message}`);
            });
          }
        }
      }
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Total: ${sortedErrors.length} errors in ${path.basename(filePath)}`);
      
    } catch (err) {
      console.error(`Error displaying file: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--execute'),
    targetDir: null,
    targetFiles: null,
    excludeDirs: [],
    excludeErrorCodes: [],
    includeErrorCodes: [],
    includeCategories: null,
    generateFixPlan: null,
    analysisMode: 'full', // 'full', 'syntax-only', 'alchemical-only'
  };
  
  // Parse complex arguments
  for (const arg of args) {
    if (arg.startsWith('--target-dir=')) {
      options.targetDir = arg.split('=')[1];
    } else if (arg.startsWith('--target-files=')) {
      options.targetFiles = arg.split('=')[1].split(' ');
    } else if (arg.startsWith('--exclude-dirs=')) {
      options.excludeDirs = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--exclude-errors=')) {
      options.excludeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-errors=')) {
      options.includeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-categories=')) {
      options.includeCategories = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--fix-plan=')) {
      options.generateFixPlan = arg.split('=')[1];
    } else if (arg === '--syntax-only') {
      options.analysisMode = 'syntax-only';
      options.includeCategories = ['Syntax Errors'];
    } else if (arg === '--alchemical-only') {
      options.analysisMode = 'alchemical-only';
      options.targetFiles = findAlchemicalFiles();
    } else if (arg === '--critical-files-only') {
      options.targetFiles = findCriticalFiles();
    } else if (arg === '--direct-parse') {
      // This flag skips tsc and directly analyzes files for errors
      options.useDirectParse = true;
    }
  }
  
  console.log('=== TypeScript Error Analysis Tool ===');
  console.log(`Mode: ${options.dryRun ? 'ANALYSIS ONLY' : 'ANALYSIS + SAVE'}`);
  
  if (options.targetDir) {
    console.log(`Target Directory: ${options.targetDir}`);
  }
  
  if (options.targetFiles) {
    console.log(`Target Files: ${Array.isArray(options.targetFiles) ? 
      options.targetFiles.length + ' files targeted' : 
      options.targetFiles}`);
  }
  
  if (options.analysisMode !== 'full') {
    console.log(`Analysis Mode: ${options.analysisMode}`);
  }
  
  if (options.useDirectParse) {
    console.log('Using direct file parsing (bypassing TypeScript compiler)');
  }
  
  console.log('Add --execute flag to save detailed report');
  console.log('');
  
  const analyzer = new TypeScriptErrorAnalyzer(options);
  
  try {
    if (options.useDirectParse) {
      await analyzer.analyzeFilesDirectly();
    } else {
      await analyzer.analyzeErrors();
    }
    
    analyzer.generateReport();
    
    if (options.generateFixPlan) {
      analyzer.generateFixPlan(options.generateFixPlan);
    }
    
    await analyzer.saveDetailedReport();
    
    // For specific target files, also print the original content with errors
    if (options.targetFiles && options.targetFiles.length === 1) {
      const file = options.targetFiles[0];
      if (fs.existsSync(file)) {
        await analyzer.showFileWithErrors(file);
      }
    }
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

// Helper functions for specialized file targeting

function findAlchemicalFiles() {
  const alchemicalPatterns = [
    'src/calculations/alchemize.ts',
    'src/calculations/alchemical*.ts',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings',
    'src/services/AstrologicalService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  alchemicalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}*" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

function findCriticalFiles() {
  // These are files with known critical errors that block parsing
  // We'll start with test scripts that have many syntax errors
  const criticalPatterns = [
    'test-scripts/reliableAstronomy.ts',
    'test-scripts/safeAccess.ts',
    'test-scripts/safeAstrology.ts',
    'test-scripts/seasonalCalculations.ts',
    'src/context/AstrologicalContext.tsx',
    'src/context/ChartContext.tsx',
    'src/data/cuisineFlavorProfiles.ts',
    'src/data/recipes.ts',
    'src/services/RecommendationAdapter.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  criticalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

// Make main async
async function runMain() {
  await main();
}

runMain(); |earth.*?oppos.*?Air|Air.*?oppos.*?earth)/i,
        description: 'Treating elements as opposing each other'
      },
      { 
        pattern: /balance.*?element/i,
        description: 'Attempting to balance elements against each other'
      },
      { 
        pattern: /getOpposingElement|oppositeElement|elementOpposites/i,
        description: 'Using the concept of opposing elements'
      }
    ];
    
    const elementalFiles = Object.entries(this.errorStats.errorsByFile)
      .filter(([filePath]) => filePath.includes('elemental') || filePath.includes('Element'));
    
    if (elementalFiles.length === 0) {
      console.log('No elemental files found with errors.');
      return;
    }
    
    // Track files with potential violations for manual review
    const potentialViolations = [];
    
    // Process all error messages in elemental files
    elementalFiles.forEach(([filePath, data]) => {
      data.errors.forEach(error => {
        for (const {pattern, description} of violationPatterns) {
          if (pattern.test(error.message)) {
            potentialViolations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: error.line,
              message: error.message,
              violation: description
            });
            break;
          }
        }
      });
    });
    
    if (potentialViolations.length > 0) {
      console.log(`Found ${potentialViolations.length} potential elemental principles violations:`);
      potentialViolations.slice(0, 5).forEach(violation => {
        console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
      });
      
      console.log('\nRecommendation: Run elemental principles check');
      console.log('  node scripts/elemental-fixes/fix-elemental-logic.js --check-only');
    } else {
      console.log('No obvious elemental principles violations found in error messages.');
    }
  }

  async saveDetailedReport() {
    const reportPath = path.join(ROOT_DIR, 'typescript-error-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recommendations: {
        priorityOrder: [
          'Syntax Errors',
          'Import/Export Errors', 
          'Alchemical Engine Errors',
          'Component Errors',
          'Type Errors',
          'Function/Method Errors',
          'JSX/React Errors',
          'Configuration Errors'
        ],
        suggestedScripts: {
          'Syntax Errors': 'scripts/syntax-fixes/fix-syntax-errors.js',
          'Type Errors': 'scripts/typescript-fixes/fix-typescript-safely.js',
          'Import/Export Errors': 'scripts/typescript-fixes/fix-typescript-errors.js',
          'Alchemical Engine Errors': 'scripts/elemental-fixes/fix-alchemical-engine.js'
        },
        targetedFixes: [
          {
            pattern: `Fix missing semicolons and commas`,
            errorCodes: ['TS1005'],
            script: 'scripts/syntax-fixes/fix-syntax-errors.js'
          },
          {
            pattern: `Fix property assignment syntax`,
            errorCodes: ['TS1136'],
            script: 'scripts/syntax-fixes/fix-object-literals.js'
          },
          {
            pattern: `Fix JSX syntax errors`,
            errorCodes: ['TS1144'],
            script: 'scripts/syntax-fixes/fix-jsx-syntax.js'
          }
        ]
      },
      filters: {
        directories: Object.keys(DIRECTORY_CATEGORIES),
        errorCategories: Object.keys(ERROR_CATEGORIES),
        priorities: Object.entries(PRIORITY_MAPPING)
          .sort(([,a], [,b]) => a - b)
          .map(([cat]) => cat)
      }
    };
    
    if (!this.options.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      this.log(`Detailed report saved to ${reportPath}`);
    } else {
      this.log(`Would save detailed report to ${reportPath}`);
    }
  }

  // Generate a targeted fix plan for specific directories or error types
  generateFixPlan(targetCategory) {
    console.log(`\n=== Fix Plan for ${targetCategory} ===\n`);
    
    let targetFiles = [];
    let fixStrategy = '';
    
    // If we're targeting a directory category
    if (this.errorStats.errorsByDirectory[targetCategory]) {
      const dirData = this.errorStats.errorsByDirectory[targetCategory];
      targetFiles = dirData.files.slice(0, 10); // Just first 10 files
      
      // Determine most common error type
      const topErrorCategory = Object.entries(dirData.categories)
        .sort(([,a], [,b]) => b - a)
        [0][0];
      
      fixStrategy = `Focus first on ${topErrorCategory} which account for ${dirData.categories[topErrorCategory]} errors`;
    } 
    // If we're targeting an error category
    else if (this.errorStats.errorsByCategory[targetCategory]) {
      const categoryData = this.errorStats.errorsByCategory[targetCategory];
      const filesByCategory = Object.entries(this.errorStats.errorsByFile)
        .filter(([, data]) => data.categories.has(targetCategory))
        .sort(([,a], [,b]) => b.count - a.count);
      
      targetFiles = filesByCategory.slice(0, 10).map(([file]) => file);
      
      fixStrategy = `Use scripts/fix-project.mjs --category=${targetCategory.toLowerCase().split(' ')[0]}`;
    }
    
    console.log(`Top files to fix (${targetFiles.length}):`);
    targetFiles.forEach(file => {
      console.log(`- ${path.relative(ROOT_DIR, file)}`);
    });
    
    console.log(`\nFix strategy: ${fixStrategy}`);
    console.log('\nSequential fix commands:');
    console.log(`1. node scripts/fix-project.mjs --target=${targetFiles[0]} --dry-run`);
    console.log(`2. yarn build --verbose`);
    console.log(`3. node scripts/typescript-error-analysis.mjs --target-files="${targetFiles[0]}"`);
  }

  async analyzeFilesDirectly() {
    this.log('Analyzing files directly for syntax errors...');
    
    let targetFiles = this.options.targetFiles;
    
    // If no specific files are targeted, use critical files
    if (!targetFiles || targetFiles.length === 0) {
      targetFiles = findCriticalFiles();
      this.log(`No files specified, using ${targetFiles.length} known critical files`);
    }
    
    const analyzedFiles = [];
    
    for (const filePath of targetFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          this.log(`File not found: ${filePath}`);
          continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileErrors = this.detectSyntaxErrors(content, filePath);
        
        analyzedFiles.push({
          file: filePath,
          errorCount: fileErrors.length
        });
        
        fileErrors.forEach(error => {
          this.addError(
            filePath, 
            error.code || 'TS9999', 
            error.message,
            error.line,
            error.column || 1
          );
        });
      } catch (err) {
        this.log(`Error analyzing file ${filePath}: ${err.message}`);
      }
    }
    
    this.log(`Direct analysis complete. Analyzed ${analyzedFiles.length} files.`);
    this.errorStats.totalFiles = analyzedFiles.length;
    this.errorStats.totalErrors = Object.values(this.errorStats.errorsByFile)
      .reduce((total, file) => total + file.count, 0);
    
    this.calculateStatistics();
    return this.errorStats;
  }
  
  detectSyntaxErrors(content, filePath) {
    const errors = [];
    const lines = content.split('\n');
    
    // Simple patterns to detect common syntax errors
    const errorPatterns = [
      { 
        pattern: /([{,:;]\s*})/g,
        code: 'TS1005',
        message: 'Unexpected token - object or block syntax error' 
      },
      { 
        pattern: /(\w+:.*?:)/g,  
        code: 'TS1005',
        message: 'Multiple colons in parameter/type declaration' 
      },
      { 
        pattern: /(\w+:\s*\w+:)/g,
        code: 'TS1005',
        message: 'Double type annotation' 
      },
      { 
        pattern: /(async.*?=>\s*{\s*\w+\s*})/g,
        code: 'TS1005',
        message: 'Invalid async arrow function' 
      },
      { 
        pattern: /export\s+let.*?=.*?,/g,
        code: 'TS1005',
        message: 'Invalid export with comma' 
      },
      { 
        pattern: /[^{},;\s]\s*}/g,
        code: 'TS1068',
        message: 'Unexpected token before closing bracket' 
      },
      {
        pattern: /catch.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete catch block'
      },
      {
        pattern: /try.*?[^{]*?\{.*?[^}]*?$/gm,
        code: 'TS1472',
        message: 'Incomplete try block'
      },
      {
        pattern: /[=([]\s*$/gm,
        code: 'TS1005',
        message: 'Expression expected'
      }
    ];
    
    // Check each line for patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const {pattern, code, message} of errorPatterns) {
        if (pattern.test(line)) {
          errors.push({
            line: i + 1,
            column: line.search(pattern) + 1,
            code,
            message,
            category: 'Syntax Errors'
          });
        }
      }
      
      // Specific checks for function parameter patterns
      if (/(function|async|export)\s+\w+\s*\(.*?\w+\s*:\s*\w+\s*:\s*/.test(line)) {
        errors.push({
          line: i + 1,
          column: line.indexOf(':') + 1,
          code: 'TS1005',
          message: 'Invalid parameter type syntax',
          category: 'Syntax Errors'
        });
      }
      
      // Check for missing closing parentheses/curly braces with context
      if (i > 0 && lines[i-1].includes('(') && !lines[i-1].includes(')') && 
          line.trim().startsWith(')') && !line.includes('(')) {
        errors.push({
          line: i,
          column: 1,
          code: 'TS1005',
          message: 'Misplaced closing parenthesis',
          category: 'Syntax Errors'
        });
      }
    }
    
    // Look for function parameter pattern issues across multiple lines
    const content2Line = content.replace(/\n/g, ' ');
    const functionParamPattern = /\(\s*\w+\s*:\s*\w+\s*:\s*[^)]*?\)/g;
    let match;
    
    while ((match = functionParamPattern.exec(content2Line)) !== null) {
      // Find line number for this match
      const upToMatch = content2Line.substring(0, match.index);
      const lineNumber = upToMatch.split(' ').filter(l => l === '\n').length + 1;
      
      errors.push({
        line: lineNumber,
        column: 1,
        code: 'TS1005',
        message: 'Invalid parameter type declaration',
        category: 'Syntax Errors'
      });
    }
    
    return errors;
  }
  
  async showFileWithErrors(filePath) {
    console.log(`\n=== File Content With Errors: ${path.basename(filePath)} ===`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Get errors for this file
      const fileErrors = this.errorStats.errorsByFile[filePath]?.errors || [];
      
      // Sort errors by line number
      const sortedErrors = [...fileErrors].sort((a, b) => a.line - b.line);
      
      // Create map of line numbers to errors
      const errorsByLine = {};
      sortedErrors.forEach(error => {
        if (!errorsByLine[error.line]) {
          errorsByLine[error.line] = [];
        }
        errorsByLine[error.line].push(error);
      });
      
      // Show lines with errors
      const contextLines = 2; // Show this many lines before and after errors
      
      // Find line ranges with errors, including context
      const lineRanges = [];
      let currentRange = null;
      
      for (const lineNum in errorsByLine) {
        const line = parseInt(lineNum);
        const start = Math.max(1, line - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        
        if (!currentRange || start > currentRange.end + 1) {
          if (currentRange) {
            lineRanges.push(currentRange);
          }
          currentRange = { start, end };
        } else {
          currentRange.end = Math.max(currentRange.end, end);
        }
      }
      
      if (currentRange) {
        lineRanges.push(currentRange);
      }
      
      // Display the line ranges with errors
      for (const range of lineRanges) {
        console.log(`\n${'-'.repeat(80)}`);
        for (let i = range.start; i <= range.end; i++) {
          const line = lines[i - 1] || '';
          const hasError = errorsByLine[i];
          
          const lineDisplay = hasError 
            ? `${i.toString().padStart(4, ' ')}* | ${line.slice(0, 120)}`
            : `${i.toString().padStart(4, ' ')}  | ${line.slice(0, 120)}`;
          
          console.log(lineDisplay);
          
          if (hasError) {
            errorsByLine[i].forEach(error => {
              // Add an indicator pointing to the error position
              const pointer = ' '.repeat(8 + error.column) + '^';
              console.log(`${pointer} ${error.message}`);
            });
          }
        }
      }
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Total: ${sortedErrors.length} errors in ${path.basename(filePath)}`);
      
    } catch (err) {
      console.error(`Error displaying file: ${err.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--execute'),
    targetDir: null,
    targetFiles: null,
    excludeDirs: [],
    excludeErrorCodes: [],
    includeErrorCodes: [],
    includeCategories: null,
    generateFixPlan: null,
    analysisMode: 'full', // 'full', 'syntax-only', 'alchemical-only'
  };
  
  // Parse complex arguments
  for (const arg of args) {
    if (arg.startsWith('--target-dir=')) {
      options.targetDir = arg.split('=')[1];
    } else if (arg.startsWith('--target-files=')) {
      options.targetFiles = arg.split('=')[1].split(' ');
    } else if (arg.startsWith('--exclude-dirs=')) {
      options.excludeDirs = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--exclude-errors=')) {
      options.excludeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-errors=')) {
      options.includeErrorCodes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--include-categories=')) {
      options.includeCategories = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--fix-plan=')) {
      options.generateFixPlan = arg.split('=')[1];
    } else if (arg === '--syntax-only') {
      options.analysisMode = 'syntax-only';
      options.includeCategories = ['Syntax Errors'];
    } else if (arg === '--alchemical-only') {
      options.analysisMode = 'alchemical-only';
      options.targetFiles = findAlchemicalFiles();
    } else if (arg === '--critical-files-only') {
      options.targetFiles = findCriticalFiles();
    } else if (arg === '--direct-parse') {
      // This flag skips tsc and directly analyzes files for errors
      options.useDirectParse = true;
    }
  }
  
  console.log('=== TypeScript Error Analysis Tool ===');
  console.log(`Mode: ${options.dryRun ? 'ANALYSIS ONLY' : 'ANALYSIS + SAVE'}`);
  
  if (options.targetDir) {
    console.log(`Target Directory: ${options.targetDir}`);
  }
  
  if (options.targetFiles) {
    console.log(`Target Files: ${Array.isArray(options.targetFiles) ? 
      options.targetFiles.length + ' files targeted' : 
      options.targetFiles}`);
  }
  
  if (options.analysisMode !== 'full') {
    console.log(`Analysis Mode: ${options.analysisMode}`);
  }
  
  if (options.useDirectParse) {
    console.log('Using direct file parsing (bypassing TypeScript compiler)');
  }
  
  console.log('Add --execute flag to save detailed report');
  console.log('');
  
  const analyzer = new TypeScriptErrorAnalyzer(options);
  
  try {
    if (options.useDirectParse) {
      await analyzer.analyzeFilesDirectly();
    } else {
      await analyzer.analyzeErrors();
    }
    
    analyzer.generateReport();
    
    if (options.generateFixPlan) {
      analyzer.generateFixPlan(options.generateFixPlan);
    }
    
    await analyzer.saveDetailedReport();
    
    // For specific target files, also print the original content with errors
    if (options.targetFiles && options.targetFiles.length === 1) {
      const file = options.targetFiles[0];
      if (fs.existsSync(file)) {
        await analyzer.showFileWithErrors(file);
      }
    }
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

// Helper functions for specialized file targeting

function findAlchemicalFiles() {
  const alchemicalPatterns = [
    'src/calculations/alchemize.ts',
    'src/calculations/alchemical*.ts',
    'src/utils/astrologyUtils',
    'src/utils/elementalMappings',
    'src/services/AstrologicalService.ts',
    'src/services/ElementalCalculator.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  alchemicalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}*" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

function findCriticalFiles() {
  // These are files with known critical errors that block parsing
  // We'll start with test scripts that have many syntax errors
  const criticalPatterns = [
    'test-scripts/reliableAstronomy.ts',
    'test-scripts/safeAccess.ts',
    'test-scripts/safeAstrology.ts',
    'test-scripts/seasonalCalculations.ts',
    'src/context/AstrologicalContext.tsx',
    'src/context/ChartContext.tsx',
    'src/data/cuisineFlavorProfiles.ts',
    'src/data/recipes.ts',
    'src/services/RecommendationAdapter.ts'
  ];
  
  // Find files matching patterns
  const matchingFiles = [];
  
  criticalPatterns.forEach(pattern => {
    try {
      // Use glob pattern matching via find command
      const files = execSync(`find ${ROOT_DIR} -path "${ROOT_DIR}/${pattern}" -type f | grep -v "node_modules"`, {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      matchingFiles.push(...files);
    } catch (error) {
      // Ignore errors in file finding
    }
  });
  
  return [...new Set(matchingFiles)]; // Remove duplicates
}

// Make main async
async function runMain() {
  await main();
}

runMain(); 