#!/usr/bin/env node

/**
 * Regex Corruption and Duplication Fixer
 *
 * This script identifies and fixes:
 * - Duplicated import statements and code lines
 * - Corrupted regex patterns in campaign system files
 * - Redundant type definitions and interface duplications
 * - Validates all regex patterns for proper syntax and escaping
 *
 * Requirements: 3.2, 4.1, 5.1
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class RegexCorruptionFixer {
  constructor() {
    this.fixedFiles = [];
    this.duplicatesRemoved = 0;
    this.regexPatternsFixed = 0;
    this.errors = [];
    this.warnings = [];

    // Critical files that need special handling
    this.criticalFiles = [
      'src/calculations/',
      'src/data/planets/',
      'src/utils/reliableAstronomy',
      'src/utils/astrologyUtils',
      'src/services/campaign/',
      'src/services/AdvancedAnalyticsIntelligenceService',
      'src/services/MLIntelligenceService',
      'src/services/PredictiveIntelligenceService',
    ];
  }

  /**
   * Main execution method
   */
  async fixRegexCorruption(dryRun = true, batchSize = 50) {
    console.log('🔧 Starting Regex Corruption and Duplication Fix...\n');

    if (dryRun) {
      console.log('🔍 Running in DRY RUN mode. Use --execute to apply fixes.\n');
    }

    try {
      // Step 1: Find all TypeScript/JavaScript files
      const files = this.getAllSourceFiles();
      console.log(`📁 Found ${files.length} source files to analyze\n`);

      // Step 2: Process files in batches for safety
      const batches = this.createBatches(files, batchSize);
      console.log(`📦 Processing ${batches.length} batches of ${batchSize} files each\n`);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} files)...`);

        // Analyze each file in the batch
        for (const file of batch) {
          await this.analyzeFile(file, dryRun);
        }

        // Validate after each batch if not dry run
        if (!dryRun && this.fixedFiles.length > 0) {
          const isValid = await this.validateChanges();
          if (!isValid) {
            console.error(`❌ Validation failed after batch ${i + 1}. Stopping execution.`);
            break;
          }
        }

        // Small delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Step 3: Report results
      this.generateReport();
    } catch (error) {
      console.error('❌ Error during regex corruption fix:', error);
      this.errors.push(`Main execution error: ${error.message}`);
    }
  }

  /**
   * Create batches of files for processing
   */
  createBatches(files, batchSize) {
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Get all source files to analyze
   */
  getAllSourceFiles() {
    try {
      const output = execSync(
        'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"',
        {
          encoding: 'utf8',
        },
      );
      return output
        .trim()
        .split('\n')
        .filter(file => file.trim());
    } catch (error) {
      console.error('Error finding source files:', error);
      return [];
    }
  }

  /**
   * Analyze a single file for corruption and duplication issues
   */
  async analyzeFile(filePath, dryRun) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      let hasChanges = false;
      const issues = {
        duplicatedLines: [],
        duplicatedImports: [],
        corruptedRegex: [],
        redundantTypes: [],
      };

      // Check for duplicated lines
      const duplicates = this.findDuplicatedLines(lines);
      if (duplicates.length > 0) {
        issues.duplicatedLines = duplicates;
        hasChanges = true;
      }

      // Check for duplicated imports
      const duplicatedImports = this.findDuplicatedImports(lines);
      if (duplicatedImports.length > 0) {
        issues.duplicatedImports = duplicatedImports;
        hasChanges = true;
      }

      // Check for corrupted regex patterns
      const corruptedRegex = this.findCorruptedRegex(lines);
      if (corruptedRegex.length > 0) {
        issues.corruptedRegex = corruptedRegex;
        hasChanges = true;
      }

      // Check for redundant type definitions
      const redundantTypes = this.findRedundantTypes(lines);
      if (redundantTypes.length > 0) {
        issues.redundantTypes = redundantTypes;
        hasChanges = true;
      }

      if (hasChanges) {
        console.log(`🔍 Issues found in ${filePath}:`);
        if (issues.duplicatedLines.length > 0) {
          console.log(`  - ${issues.duplicatedLines.length} duplicated lines`);
        }
        if (issues.duplicatedImports.length > 0) {
          console.log(`  - ${issues.duplicatedImports.length} duplicated imports`);
        }
        if (issues.corruptedRegex.length > 0) {
          console.log(`  - ${issues.corruptedRegex.length} corrupted regex patterns`);
        }
        if (issues.redundantTypes.length > 0) {
          console.log(`  - ${issues.redundantTypes.length} redundant type definitions`);
        }

        if (!dryRun) {
          await this.fixFileIssues(filePath, content, issues);
        }
      }
    } catch (error) {
      this.errors.push(`Error analyzing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Find duplicated lines in file content
   */
  findDuplicatedLines(lines) {
    const duplicates = [];
    const lineCount = new Map();

    // Count occurrences of each non-empty line
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('*')) {
        if (!lineCount.has(trimmedLine)) {
          lineCount.set(trimmedLine, []);
        }
        lineCount.get(trimmedLine).push(index);
      }
    });

    // Find lines that appear more than once
    for (const [line, indices] of lineCount.entries()) {
      if (indices.length > 1) {
        duplicates.push({
          line,
          indices,
          count: indices.length,
        });
      }
    }

    return duplicates;
  }

  /**
   * Find duplicated import statements
   */
  findDuplicatedImports(lines) {
    const duplicates = [];
    const importLines = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('import ') && !trimmedLine.includes('//')) {
        importLines.push({ line: trimmedLine, index });
      }
    });

    // Group by import source
    const importGroups = new Map();
    importLines.forEach(({ line, index }) => {
      const fromMatch = line.match(/from\s+['"]([^'"]+)['"]/);
      if (fromMatch) {
        const source = fromMatch[1];
        if (!importGroups.has(source)) {
          importGroups.set(source, []);
        }
        importGroups.get(source).push({ line, index });
      }
    });

    // Find duplicated imports from same source
    for (const [source, imports] of importGroups.entries()) {
      if (imports.length > 1) {
        duplicates.push({
          source,
          imports,
          count: imports.length,
        });
      }
    }

    return duplicates;
  }

  /**
   * Find corrupted regex patterns
   */
  findCorruptedRegex(lines) {
    const corrupted = [];

    lines.forEach((line, index) => {
      // Look for regex patterns
      const regexPatterns = [
        /\/[^\/\n]*\/[gimuy]*/g, // Literal regex
        /new RegExp\([^)]*\)/g, // RegExp constructor
        /\.match\([^)]*\)/g, // String.match()
        /\.replace\([^)]*\)/g, // String.replace()
        /\.test\([^)]*\)/g, // RegExp.test()
      ];

      regexPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Check for common corruption patterns
            if (this.isCorruptedRegex(match)) {
              corrupted.push({
                line: index + 1,
                content: line.trim(),
                pattern: match,
                issue: this.getRegexIssue(match),
              });
            }
          });
        }
      });
    });

    return corrupted;
  }

  /**
   * Check if a regex pattern is corrupted
   */
  isCorruptedRegex(pattern) {
    // Check for common corruption patterns
    const corruptionPatterns = [
      /\\[^nrtbfv\\\/]/, // Invalid escape sequences
      /\/[^\/]*[^\\]\/[gimuy]*$/, // Unescaped forward slashes
      /\[[^\]]*$/, // Unclosed character classes
      /\([^)]*$/, // Unclosed groups
      /\{[^}]*$/, // Unclosed quantifiers
    ];

    return corruptionPatterns.some(corruptPattern => corruptPattern.test(pattern));
  }

  /**
   * Get specific issue with regex pattern
   */
  getRegexIssue(pattern) {
    if (/\\[^nrtbfv\\\/]/.test(pattern)) {
      return 'Invalid escape sequence';
    }
    if (/\[[^\]]*$/.test(pattern)) {
      return 'Unclosed character class';
    }
    if (/\([^)]*$/.test(pattern)) {
      return 'Unclosed group';
    }
    if (/\{[^}]*$/.test(pattern)) {
      return 'Unclosed quantifier';
    }
    return 'Unknown regex issue';
  }

  /**
   * Find redundant type definitions
   */
  findRedundantTypes(lines) {
    const redundant = [];
    const typeDefinitions = new Map();

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Look for type definitions
      const typePatterns = [
        /^(export\s+)?interface\s+(\w+)/,
        /^(export\s+)?type\s+(\w+)/,
        /^(export\s+)?enum\s+(\w+)/,
      ];

      typePatterns.forEach(pattern => {
        const match = trimmedLine.match(pattern);
        if (match) {
          const typeName = match[2];
          if (!typeDefinitions.has(typeName)) {
            typeDefinitions.set(typeName, []);
          }
          typeDefinitions.get(typeName).push({
            line: index + 1,
            content: trimmedLine,
            isExported: !!match[1],
          });
        }
      });
    });

    // Find types defined multiple times
    for (const [typeName, definitions] of typeDefinitions.entries()) {
      if (definitions.length > 1) {
        redundant.push({
          typeName,
          definitions,
          count: definitions.length,
        });
      }
    }

    return redundant;
  }

  /**
   * Fix issues in a specific file
   */
  async fixFileIssues(filePath, content, issues) {
    const lines = content.split('\n');
    let changesMade = false;

    try {
      // Fix duplicated lines (remove duplicates, keep first occurrence)
      if (issues.duplicatedLines.length > 0) {
        const linesToRemove = new Set();

        issues.duplicatedLines.forEach(duplicate => {
          // Keep first occurrence, mark others for removal
          duplicate.indices.slice(1).forEach(index => {
            linesToRemove.add(index);
          });
        });

        // Remove lines in reverse order to maintain indices
        const sortedIndices = Array.from(linesToRemove).sort((a, b) => b - a);
        sortedIndices.forEach(index => {
          lines.splice(index, 1);
          this.duplicatesRemoved++;
        });

        changesMade = true;
      }

      // Fix duplicated imports (merge imports from same source)
      if (issues.duplicatedImports.length > 0) {
        issues.duplicatedImports.forEach(duplicate => {
          const mergedImport = this.mergeImports(duplicate.imports);
          if (mergedImport) {
            // Replace first import with merged version
            const firstImportIndex = duplicate.imports[0].index;
            lines[firstImportIndex] = mergedImport;

            // Remove other imports
            duplicate.imports.slice(1).forEach(imp => {
              const lineIndex = lines.findIndex(line => line.trim() === imp.line);
              if (lineIndex !== -1) {
                lines.splice(lineIndex, 1);
              }
            });

            changesMade = true;
          }
        });
      }

      // Fix corrupted regex patterns
      if (issues.corruptedRegex.length > 0) {
        issues.corruptedRegex.forEach(regex => {
          const lineIndex = regex.line - 1;
          const fixedLine = this.fixRegexPattern(lines[lineIndex], regex.pattern);
          if (fixedLine !== lines[lineIndex]) {
            lines[lineIndex] = fixedLine;
            this.regexPatternsFixed++;
            changesMade = true;
          }
        });
      }

      // Fix redundant type definitions (remove duplicates)
      if (issues.redundantTypes.length > 0) {
        const linesToRemove = new Set();

        issues.redundantTypes.forEach(redundant => {
          // Keep the exported version if available, otherwise keep first
          const exportedDef = redundant.definitions.find(def => def.isExported);
          const keepDef = exportedDef || redundant.definitions[0];

          redundant.definitions.forEach(def => {
            if (def !== keepDef) {
              linesToRemove.add(def.line - 1);
            }
          });
        });

        // Remove lines in reverse order
        const sortedIndices = Array.from(linesToRemove).sort((a, b) => b - a);
        sortedIndices.forEach(index => {
          lines.splice(index, 1);
        });

        changesMade = true;
      }

      if (changesMade) {
        // Write fixed content back to file
        const fixedContent = lines.join('\n');
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        this.fixedFiles.push(filePath);
        console.log(`✅ Fixed issues in ${filePath}`);
      }
    } catch (error) {
      this.errors.push(`Error fixing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Merge duplicate imports from the same source
   */
  mergeImports(imports) {
    try {
      const source = imports[0].line.match(/from\s+['"]([^'"]+)['"]/)[1];
      const allImports = new Set();
      let hasDefaultImport = false;
      let defaultImportName = '';
      let hasNamespaceImport = false;
      let namespaceImportName = '';

      imports.forEach(imp => {
        const line = imp.line;

        // Check for default import
        const defaultMatch = line.match(/import\s+(\w+)\s*,?\s*(?:\{[^}]*\})?\s*from/);
        if (defaultMatch && !line.includes('{')) {
          hasDefaultImport = true;
          defaultImportName = defaultMatch[1];
        }

        // Check for namespace import
        const namespaceMatch = line.match(/import\s+\*\s+as\s+(\w+)\s+from/);
        if (namespaceMatch) {
          hasNamespaceImport = true;
          namespaceImportName = namespaceMatch[1];
        }

        // Extract named imports
        const namedMatch = line.match(/\{([^}]+)\}/);
        if (namedMatch) {
          const namedImports = namedMatch[1].split(',').map(imp => imp.trim());
          namedImports.forEach(imp => allImports.add(imp));
        }
      });

      // Build merged import statement
      let mergedImport = 'import ';
      const parts = [];

      if (hasDefaultImport) {
        parts.push(defaultImportName);
      }

      if (hasNamespaceImport) {
        parts.push(`* as ${namespaceImportName}`);
      }

      if (allImports.size > 0) {
        const namedImports = Array.from(allImports).sort().join(', ');
        parts.push(`{ ${namedImports} }`);
      }

      mergedImport += parts.join(', ') + ` from '${source}';`;
      return mergedImport;
    } catch (error) {
      this.warnings.push(`Could not merge imports: ${error.message}`);
      return null;
    }
  }

  /**
   * Fix a corrupted regex pattern
   */
  fixRegexPattern(line, corruptedPattern) {
    try {
      // Simple fixes for common regex corruption
      let fixedPattern = corruptedPattern;

      // Fix unescaped forward slashes
      fixedPattern = fixedPattern.replace(/([^\\])\//g, '$1\\/');

      // Fix invalid escape sequences (basic ones)
      fixedPattern = fixedPattern.replace(/\\([^nrtbfv\\\/])/g, '\\\\$1');

      // Replace the corrupted pattern in the line
      return line.replace(corruptedPattern, fixedPattern);
    } catch (error) {
      this.warnings.push(`Could not fix regex pattern: ${corruptedPattern}`);
      return line;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 Regex Corruption Fix Results:');
    console.log('=====================================');
    console.log(`Files analyzed: ${this.getAllSourceFiles().length}`);
    console.log(`Files fixed: ${this.fixedFiles.length}`);
    console.log(`Duplicated lines removed: ${this.duplicatesRemoved}`);
    console.log(`Regex patterns fixed: ${this.regexPatternsFixed}`);
    console.log(`Errors encountered: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);

    if (this.fixedFiles.length > 0) {
      console.log('\n📁 Fixed Files:');
      this.fixedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
  }

  /**
   * Validate changes by running TypeScript check
   */
  async validateChanges() {
    console.log('\n🔍 Validating changes...');

    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      console.log('✅ TypeScript validation passed');
      return true;
    } catch (error) {
      console.error('❌ TypeScript validation failed');
      console.error('Some fixes may have introduced errors. Please review manually.');
      return false;
    }
  }
}

// CLI interface
const fixer = new RegexCorruptionFixer();

const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (dryRun) {
  console.log('🔍 Running in DRY RUN mode. Use --execute to apply fixes.\n');
}

fixer.fixRegexCorruption(dryRun).catch(console.error);
