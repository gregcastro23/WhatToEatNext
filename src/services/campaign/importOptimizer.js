#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Import Optimizer
 * Automatically removes unused imports and organizes import statements
 */

class ImportOptimizer {
  constructor(options = {}) {
    this.preserveTypeImports = options.preserveTypeImports !== false;
    this.organizeImports = options.organizeImports !== false;
    this.removeUnused = options.removeUnused !== false;
    this.safeMode = options.safeMode !== false;
  }

  async optimizeFile(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
      console.log('⚠️ Invalid file path provided');
      return false;
    }

    console.log(`🔧 Optimizing imports in: ${path.relative(process.cwd(), filePath)}`);

    try {
      // Create backup
      await this.createBackup(filePath);

      // Read file content
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let optimizedContent = originalContent;

      // Parse imports and usage
      const analysis = this.analyzeImports(originalContent);

      // Remove unused imports
      if (this.removeUnused) {
        optimizedContent = this.removeUnusedImports(optimizedContent, analysis);
      }

      // Organize imports
      if (this.organizeImports) {
        optimizedContent = this.organizeImportStatements(optimizedContent);
      }

      // Validate changes
      const isValid = await this.validateChanges(filePath, optimizedContent);

      if (isValid && optimizedContent !== originalContent) {
        fs.writeFileSync(filePath, optimizedContent, 'utf8');
        console.log('✅ Import optimization completed');
        await this.logOptimization(filePath, analysis);
        return true;
      } else if (!isValid) {
        console.log('❌ Validation failed, restoring backup');
        await this.restoreBackup(filePath);
        return false;
      } else {
        console.log('ℹ️ No optimization needed');
        await this.cleanupBackup(filePath);
        return true;
      }
    } catch (error) {
      console.error('❌ Error optimizing imports:', error.message);
      await this.restoreBackup(filePath);
      return false;
    }
  }

  analyzeImports(content) {
    const analysis = {
      imports: [],
      usage: new Set(),
      typeUsage: new Set(),
      preservedImports: new Set(),
    };

    // Extract all import statements
    const importRegex =
      /^import\s+(?:(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*)\s+from\s+)?['"`]([^'"`]+)['"`];?$/gm;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importStatement = match[0];
      const modulePath = match[1];

      analysis.imports.push({
        statement: importStatement,
        module: modulePath,
        line: content.substring(0, match.index).split('\n').length,
        isTypeOnly: importStatement.includes('import type'),
        namedImports: this.extractNamedImports(importStatement),
        defaultImport: this.extractDefaultImport(importStatement),
        namespaceImport: this.extractNamespaceImport(importStatement),
      });
    }

    // Find usage patterns in the code (excluding import statements)
    const codeWithoutImports = content.replace(importRegex, '');

    // Find all identifiers used in the code
    const identifierRegex = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g;
    let identifierMatch;
    while ((identifierMatch = identifierRegex.exec(codeWithoutImports)) !== null) {
      const identifier = identifierMatch[1];

      // Skip common keywords and built-ins
      if (!this.isReservedWord(identifier)) {
        analysis.usage.add(identifier);
      }
    }

    // Find type usage patterns
    const typeRegex = /:\s*([A-Za-z_$][A-Za-z0-9_$]*(?:<[^>]*>)?)/g;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(codeWithoutImports)) !== null) {
      analysis.typeUsage.add(typeMatch[1].split('<')[0]); // Remove generics
    }

    // Mark imports that should be preserved (side effects, etc.)
    analysis.imports.forEach(imp => {
      if (this.shouldPreserveImport(imp)) {
        analysis.preservedImports.add(imp.statement);
      }
    });

    return analysis;
  }

  extractNamedImports(importStatement) {
    const namedMatch = importStatement.match(/\{([^}]+)\}/);
    if (!namedMatch) return [];

    return namedMatch[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => {
        // Handle "as" aliases
        const parts = item.split(/\s+as\s+/);
        return {
          imported: parts[0].trim(),
          local: parts[1] ? parts[1].trim() : parts[0].trim(),
        };
      });
  }

  extractDefaultImport(importStatement) {
    const defaultMatch = importStatement.match(
      /import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,|\s+from)/,
    );
    return defaultMatch ? defaultMatch[1] : null;
  }

  extractNamespaceImport(importStatement) {
    const namespaceMatch = importStatement.match(/import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
    return namespaceMatch ? namespaceMatch[1] : null;
  }

  shouldPreserveImport(importInfo) {
    // Preserve side-effect imports (no named imports)
    if (
      !importInfo.namedImports.length &&
      !importInfo.defaultImport &&
      !importInfo.namespaceImport
    ) {
      return true;
    }

    // Preserve CSS/style imports
    if (importInfo.module.match(/\.(css|scss|sass|less|styl)$/)) {
      return true;
    }

    // Preserve certain critical modules
    const criticalModules = ['react', 'next', '@testing-library', 'jest'];

    return criticalModules.some(module => importInfo.module.includes(module));
  }

  removeUnusedImports(content, analysis) {
    let optimizedContent = content;

    analysis.imports.forEach(importInfo => {
      // Skip preserved imports
      if (analysis.preservedImports.has(importInfo.statement)) {
        return;
      }

      let shouldRemove = true;
      let modifiedImport = importInfo.statement;

      // Check default import usage
      if (importInfo.defaultImport) {
        if (analysis.usage.has(importInfo.defaultImport)) {
          shouldRemove = false;
        }
      }

      // Check namespace import usage
      if (importInfo.namespaceImport) {
        if (analysis.usage.has(importInfo.namespaceImport)) {
          shouldRemove = false;
        }
      }

      // Check named imports usage
      if (importInfo.namedImports.length > 0) {
        const usedNamedImports = importInfo.namedImports.filter(namedImport => {
          const isUsed =
            analysis.usage.has(namedImport.local) || analysis.typeUsage.has(namedImport.local);
          return isUsed;
        });

        if (usedNamedImports.length > 0) {
          shouldRemove = false;

          // If only some named imports are used, modify the import
          if (usedNamedImports.length < importInfo.namedImports.length) {
            const usedImportsStr = usedNamedImports
              .map(imp =>
                imp.imported === imp.local ? imp.imported : `${imp.imported} as ${imp.local}`,
              )
              .join(', ');

            modifiedImport = importInfo.statement.replace(/\{[^}]+\}/, `{ ${usedImportsStr} }`);
          }
        }
      }

      // Apply changes
      if (shouldRemove) {
        console.log(`  🗑️ Removing unused import: ${importInfo.module}`);
        optimizedContent = optimizedContent.replace(importInfo.statement, '');
      } else if (modifiedImport !== importInfo.statement) {
        console.log(`  ✂️ Trimming import: ${importInfo.module}`);
        optimizedContent = optimizedContent.replace(importInfo.statement, modifiedImport);
      }
    });

    // Clean up empty lines left by removed imports
    optimizedContent = optimizedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    return optimizedContent;
  }

  organizeImportStatements(content) {
    // Extract all imports
    const importRegex = /^import\s+.*?;?$/gm;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        index: match.index,
        module: this.extractModulePath(match[0]),
      });
    }

    if (imports.length === 0) return content;

    // Remove all imports from content
    let contentWithoutImports = content;
    imports.reverse().forEach(imp => {
      contentWithoutImports =
        contentWithoutImports.substring(0, imp.index) +
        contentWithoutImports.substring(imp.index + imp.statement.length);
    });

    // Categorize imports
    const categorizedImports = this.categorizeImports(imports);

    // Build organized import section
    const organizedImports = [];

    // External libraries
    if (categorizedImports.external.length > 0) {
      organizedImports.push(...categorizedImports.external.map(imp => imp.statement));
      organizedImports.push('');
    }

    // Internal imports
    if (categorizedImports.internal.length > 0) {
      organizedImports.push(...categorizedImports.internal.map(imp => imp.statement));
      organizedImports.push('');
    }

    // Relative imports
    if (categorizedImports.relative.length > 0) {
      organizedImports.push(...categorizedImports.relative.map(imp => imp.statement));
      organizedImports.push('');
    }

    // Remove trailing empty line
    if (organizedImports[organizedImports.length - 1] === '') {
      organizedImports.pop();
    }

    // Combine organized imports with the rest of the content
    const firstNonImportLine = contentWithoutImports.search(/\S/);
    const beforeContent =
      firstNonImportLine > 0 ? contentWithoutImports.substring(0, firstNonImportLine) : '';
    const afterContent =
      firstNonImportLine > 0
        ? contentWithoutImports.substring(firstNonImportLine)
        : contentWithoutImports;

    return beforeContent + organizedImports.join('\n') + '\n\n' + afterContent.trim() + '\n';
  }

  categorizeImports(imports) {
    const categorized = {
      external: [],
      internal: [],
      relative: [],
    };

    imports.forEach(imp => {
      if (imp.module.startsWith('.')) {
        categorized.relative.push(imp);
      } else if (imp.module.startsWith('@/') || imp.module.startsWith('~/')) {
        categorized.internal.push(imp);
      } else {
        categorized.external.push(imp);
      }
    });

    // Sort each category
    Object.keys(categorized).forEach(category => {
      categorized[category].sort((a, b) => a.module.localeCompare(b.module));
    });

    return categorized;
  }

  extractModulePath(importStatement) {
    const match = importStatement.match(/from\s+['"`]([^'"`]+)['"`]/);
    return match ? match[1] : '';
  }

  isReservedWord(word) {
    const reserved = [
      'break',
      'case',
      'catch',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'else',
      'export',
      'extends',
      'finally',
      'for',
      'function',
      'if',
      'import',
      'in',
      'instanceof',
      'new',
      'return',
      'super',
      'switch',
      'this',
      'throw',
      'try',
      'typeof',
      'var',
      'void',
      'while',
      'with',
      'yield',
      'let',
      'static',
      'enum',
      'implements',
      'interface',
      'package',
      'private',
      'protected',
      'public',
      'abstract',
      'boolean',
      'byte',
      'char',
      'double',
      'final',
      'float',
      'goto',
      'int',
      'long',
      'native',
      'short',
      'synchronized',
      'throws',
      'transient',
      'volatile',
      'true',
      'false',
      'null',
      'undefined',
      'console',
      'window',
      'document',
      'process',
      'global',
      'require',
      'module',
      'exports',
      '__dirname',
      '__filename',
    ];

    return reserved.includes(word);
  }

  async createBackup(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    process.env.KIRO_BACKUP_PATH = backupPath;
  }

  async restoreBackup(filePath) {
    const backupPath = process.env.KIRO_BACKUP_PATH;
    if (backupPath && fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      console.log('🔄 Backup restored');
    }
  }

  async cleanupBackup(filePath) {
    const backupPath = process.env.KIRO_BACKUP_PATH;
    if (backupPath && fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  }

  async validateChanges(filePath, newContent) {
    try {
      // Basic syntax validation
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        // Write temporary file for validation
        const tempPath = `${filePath}.temp`;
        fs.writeFileSync(tempPath, newContent);

        try {
          const { execSync } = require('child_process');
          execSync(`yarn tsc --noEmit --skipLibCheck "${tempPath}"`, {
            stdio: 'pipe',
          });
          fs.unlinkSync(tempPath);
          return true;
        } catch (error) {
          fs.unlinkSync(tempPath);
          console.log('⚠️ TypeScript validation failed');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.log('⚠️ Validation error:', error.message);
      return false;
    }
  }

  async logOptimization(filePath, analysis) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      filePath: path.relative(process.cwd(), filePath),
      totalImports: analysis.imports.length,
      preservedImports: analysis.preservedImports.size,
      action: 'import-optimization',
    };

    const logPath = path.join(process.cwd(), 'logs', 'import-optimizations.log');
    const logsDir = path.dirname(logPath);

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  }
}

// Main execution function
async function optimizeImports() {
  const filePath = process.env.KIRO_FILE_PATH;

  if (!filePath) {
    console.log('⚠️ No file path provided');
    return false;
  }

  const optimizer = new ImportOptimizer({
    preserveTypeImports: true,
    organizeImports: true,
    removeUnused: true,
    safeMode: true,
  });

  return await optimizer.optimizeFile(filePath);
}

// Run if called directly
if (require.main === module) {
  optimizeImports().catch(console.error);
}

module.exports = { ImportOptimizer, optimizeImports };
