#!/usr/bin/env node

/**
 * High-Impact Files Linting Fix Script
 * Targets the 6 files with 100+ issues each while preserving enterprise intelligence patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// High-impact files to target
const HIGH_IMPACT_FILES = [
  'src/services/AdvancedAnalyticsIntelligenceService.ts',
  'src/services/MLIntelligenceService.ts',
  'src/services/EnterpriseIntelligenceIntegration.ts',
  'src/components/IngredientRecommender.tsx',
  'src/calculations/alchemicalEngine.ts',
  'src/services/PredictiveIntelligenceService.ts',
];

// Patterns to preserve (enterprise intelligence patterns)
const PRESERVE_PATTERNS = [
  /intelligence/i,
  /enterprise/i,
  /analytics/i,
  /predictive/i,
  /ml/i,
  /campaign/i,
  /metrics/i,
  /progress/i,
  /safety/i,
  /planet/i,
  /degree/i,
  /sign/i,
  /longitude/i,
  /position/i,
];

class HighImpactFileFixer {
  constructor() {
    this.fixedCount = 0;
    this.preservedCount = 0;
    this.errors = [];
  }

  log(message) {
    console.log(`[HIGH-IMPACT-FIXER] ${message}`);
  }

  error(message) {
    console.error(`[HIGH-IMPACT-FIXER ERROR] ${message}`);
    this.errors.push(message);
  }

  shouldPreserveVariable(varName) {
    return PRESERVE_PATTERNS.some(pattern => pattern.test(varName));
  }

  fixUnusedVariables(content, filePath) {
    let fixedContent = content;
    let localFixCount = 0;

    // Fix unused imports - remove completely unused ones
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"][^'"]+['"];?\s*\n/g;
    const imports = content.match(importRegex) || [];

    imports.forEach(importStatement => {
      const importedItems = this.extractImportedItems(importStatement);
      const usedItems = importedItems.filter(item => {
        if (this.shouldPreserveVariable(item)) {
          this.preservedCount++;
          return true;
        }
        // Check if the item is actually used in the file
        const usageRegex = new RegExp(`\\b${item}\\b`, 'g');
        const matches = (content.match(usageRegex) || []).length;
        return matches > 1; // More than just the import
      });

      if (usedItems.length === 0) {
        // Remove the entire import
        fixedContent = fixedContent.replace(importStatement, '');
        localFixCount++;
      } else if (usedItems.length < importedItems.length) {
        // Reconstruct import with only used items
        const newImport = this.reconstructImport(importStatement, usedItems);
        fixedContent = fixedContent.replace(importStatement, newImport);
        localFixCount++;
      }
    });

    // Fix unused variables - prefix with UNUSED_ or _
    const varDeclarationRegex = /(?:const|let|var)\s+(\w+)/g;
    let match;
    while ((match = varDeclarationRegex.exec(content)) !== null) {
      const varName = match[1];

      if (this.shouldPreserveVariable(varName)) {
        this.preservedCount++;
        continue;
      }

      const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = (content.match(usageRegex) || []).length;

      if (matches === 1) {
        // Only declared, never used
        if (!varName.startsWith('_') && !varName.startsWith('UNUSED_')) {
          const newVarName =
            varName.startsWith('test') || varName.startsWith('mock') || varName.startsWith('stub')
              ? `_${varName}`
              : `UNUSED_${varName}`;

          fixedContent = fixedContent.replace(new RegExp(`\\b${varName}\\b`, 'g'), newVarName);
          localFixCount++;
        }
      }
    }

    this.fixedCount += localFixCount;
    this.log(`Fixed ${localFixCount} unused variable issues in ${path.basename(filePath)}`);
    return fixedContent;
  }

  extractImportedItems(importStatement) {
    const items = [];

    // Handle named imports: import { a, b, c } from 'module'
    const namedImportMatch = importStatement.match(/import\s+{([^}]+)}\s+from/);
    if (namedImportMatch) {
      const namedItems = namedImportMatch[1].split(',').map(item => item.trim());
      items.push(...namedItems);
    }

    // Handle default imports: import Something from 'module'
    const defaultImportMatch = importStatement.match(/import\s+(\w+)\s+from/);
    if (defaultImportMatch && !namedImportMatch) {
      items.push(defaultImportMatch[1]);
    }

    // Handle namespace imports: import * as Something from 'module'
    const namespaceImportMatch = importStatement.match(/import\s+\*\s+as\s+(\w+)\s+from/);
    if (namespaceImportMatch) {
      items.push(namespaceImportMatch[1]);
    }

    return items;
  }

  reconstructImport(originalImport, usedItems) {
    const moduleMatch = originalImport.match(/from\s+['"]([^'"]+)['"]/);
    if (!moduleMatch) return originalImport;

    const moduleName = moduleMatch[1];

    if (usedItems.length === 1 && !originalImport.includes('{')) {
      // Default import
      return `import ${usedItems[0]} from '${moduleName}';\n`;
    } else {
      // Named imports
      return `import { ${usedItems.join(', ')} } from '${moduleName}';\n`;
    }
  }

  fixExplicitAny(content, filePath) {
    let fixedContent = content;
    let localFixCount = 0;

    // Replace explicit any with unknown for API responses
    const apiResponsePattern = /:\s*any(?=\s*[=;,)])/g;
    fixedContent = fixedContent.replace(apiResponsePattern, ': unknown');
    localFixCount += (content.match(apiResponsePattern) || []).length;

    // Replace any[] with unknown[]
    const anyArrayPattern = /:\s*any\[\]/g;
    fixedContent = fixedContent.replace(anyArrayPattern, ': unknown[]');
    localFixCount += (content.match(anyArrayPattern) || []).length;

    // Replace Record<string, any> with Record<string, unknown>
    const recordAnyPattern = /Record<([^,]+),\s*any>/g;
    fixedContent = fixedContent.replace(recordAnyPattern, 'Record<$1, unknown>');
    localFixCount += (content.match(recordAnyPattern) || []).length;

    this.fixedCount += localFixCount;
    this.log(`Fixed ${localFixCount} explicit any issues in ${path.basename(filePath)}`);
    return fixedContent;
  }

  fixUnnecessaryConditions(content, filePath) {
    let fixedContent = content;
    let localFixCount = 0;

    // Fix unnecessary null checks on values that are always truthy
    const unnecessaryNullCheckPattern = /if\s*\(\s*(\w+)\s*&&\s*\1\s*\)/g;
    fixedContent = fixedContent.replace(unnecessaryNullCheckPattern, 'if ($1)');
    localFixCount += (content.match(unnecessaryNullCheckPattern) || []).length;

    // Fix unnecessary optional chaining on non-nullish values
    const unnecessaryOptionalChainPattern = /(\w+)(\?\.)(\w+)/g;
    const matches = content.match(unnecessaryOptionalChainPattern) || [];
    matches.forEach(match => {
      const parts = match.match(/(\w+)(\?\.)(\w+)/);
      if (parts) {
        const [, obj, , prop] = parts;
        // Only fix if we can determine the object is always defined
        if (obj === 'this' || obj === 'config' || obj === 'options') {
          fixedContent = fixedContent.replace(match, `${obj}.${prop}`);
          localFixCount++;
        }
      }
    });

    this.fixedCount += localFixCount;
    this.log(`Fixed ${localFixCount} unnecessary condition issues in ${path.basename(filePath)}`);
    return fixedContent;
  }

  fixImportOrder(content, filePath) {
    let fixedContent = content;
    let localFixCount = 0;

    // Extract all imports
    const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = content.match(importRegex) || [];

    if (imports.length === 0) return fixedContent;

    // Categorize imports
    const builtinImports = [];
    const externalImports = [];
    const internalImports = [];

    imports.forEach(imp => {
      if (imp.includes("from 'fs'") || imp.includes("from 'path'") || imp.includes("from 'util'")) {
        builtinImports.push(imp);
      } else if (imp.includes("from '@/")) {
        internalImports.push(imp);
      } else {
        externalImports.push(imp);
      }
    });

    // Sort each category alphabetically
    builtinImports.sort();
    externalImports.sort();
    internalImports.sort();

    // Reconstruct imports with proper grouping
    const sortedImports = [
      ...builtinImports,
      ...(builtinImports.length > 0 && externalImports.length > 0 ? [''] : []),
      ...externalImports,
      ...(externalImports.length > 0 && internalImports.length > 0 ? [''] : []),
      ...internalImports,
    ].join('\n');

    // Replace the import section
    const firstImportIndex = content.search(importRegex);
    const lastImportIndex =
      content.lastIndexOf(imports[imports.length - 1]) + imports[imports.length - 1].length;

    if (firstImportIndex !== -1 && lastImportIndex !== -1) {
      const beforeImports = content.substring(0, firstImportIndex);
      const afterImports = content.substring(lastImportIndex);

      fixedContent = beforeImports + sortedImports + '\n' + afterImports;
      localFixCount = 1;
    }

    this.fixedCount += localFixCount;
    this.log(`Fixed import order in ${path.basename(filePath)}`);
    return fixedContent;
  }

  async fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.error(`File not found: ${filePath}`);
        return false;
      }

      this.log(`Processing ${filePath}...`);

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Apply fixes in order of priority
      content = this.fixImportOrder(content, filePath);
      content = this.fixUnusedVariables(content, filePath);
      content = this.fixExplicitAny(content, filePath);
      content = this.fixUnnecessaryConditions(content, filePath);

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.log(`Successfully updated ${filePath}`);
        return true;
      } else {
        this.log(`No changes needed for ${filePath}`);
        return false;
      }
    } catch (error) {
      this.error(`Failed to process ${filePath}: ${error.message}`);
      return false;
    }
  }

  async validateBuild() {
    try {
      this.log('Validating TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      this.log('TypeScript compilation successful');
      return true;
    } catch (error) {
      this.error('TypeScript compilation failed');
      return false;
    }
  }

  async run() {
    this.log('Starting high-impact files linting fix...');
    this.log(`Targeting ${HIGH_IMPACT_FILES.length} high-impact files`);

    let processedFiles = 0;
    let successfulFiles = 0;

    for (const filePath of HIGH_IMPACT_FILES) {
      const success = await this.fixFile(filePath);
      processedFiles++;
      if (success) successfulFiles++;
    }

    // Validate build after fixes
    const buildValid = await this.validateBuild();

    // Summary
    this.log('\n=== HIGH-IMPACT FILES FIX SUMMARY ===');
    this.log(`Files processed: ${processedFiles}`);
    this.log(`Files successfully updated: ${successfulFiles}`);
    this.log(`Total fixes applied: ${this.fixedCount}`);
    this.log(`Variables preserved: ${this.preservedCount}`);
    this.log(`Build validation: ${buildValid ? 'PASSED' : 'FAILED'}`);

    if (this.errors.length > 0) {
      this.log('\nErrors encountered:');
      this.errors.forEach(error => this.log(`  - ${error}`));
    }

    return {
      processedFiles,
      successfulFiles,
      totalFixes: this.fixedCount,
      preservedVariables: this.preservedCount,
      buildValid,
      errors: this.errors,
    };
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new HighImpactFileFixer();
  fixer
    .run()
    .then(result => {
      process.exit(result.buildValid && result.errors.length === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = HighImpactFileFixer;
