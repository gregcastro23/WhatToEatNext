/**
 * Dependency Validation Utilities
 *
 * Provides utilities to validate import paths, detect circular dependencies,
 * and ensure barrel exports are properly defined.
 */

import { logger } from './logger';

/**
 * Validate that an import path exists and is accessible
 */
export async function validateImportPath(importPath: string, fromFile: string): Promise<boolean> {
  try {
    // Try to dynamically import the module
    await import(importPath);
    return true;
  } catch (error) {
    logger.error(`Invalid import path "${importPath}" in ${fromFile}:`, error);
    return false;
  }
}

/**
 * Check for circular dependencies in a module graph
 */
export function detectCircularDependencies(
  moduleGraph: Record<string, string[]>
): string[][] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    recursionStack.add(node);

    const dependencies = moduleGraph[node] || [];
    for (const dep of dependencies) {
      dfs(dep, [...path, node]);
    }

    recursionStack.delete(node);
  }

  for (const node of Object.keys(moduleGraph)) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

/**
 * Validate barrel exports to ensure all exported items exist
 */
export async function validateBarrelExports(
  barrelPath: string,
  exports: string[]
): Promise<{ valid: string[]; invalid: string[] }> {
  const valid: string[] = [];
  const invalid: string[] = [];

  try {
    const module = await import(barrelPath);

    for (const exportName of exports) {
      if (exportName in module) {
        valid.push(exportName);
      } else {
        invalid.push(exportName);
        logger.warn(`Export "${exportName}" not found in ${barrelPath}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to load barrel module ${barrelPath}:`, error);
    invalid.push(...exports);
  }

  return { valid, invalid };
}

/**
 * Common problematic import patterns to avoid
 */
export const PROBLEMATIC_PATTERNS = [
  {
    pattern: /import.*from.*['"]\.\/.*index['"]/,
    message: 'Avoid importing from index files in the same directory - import directly from source files'
  },
  {
    pattern: /import.*from.*['"]\.\.\/\.\.\/.*index['"]/,
    message: 'Deep relative imports to index files can create circular dependencies'
  },
  {
    pattern: /export \* from.*['"]\.\/.*index['"]/,
    message: 'Re-exporting from index files can create circular dependencies'
  }
];

/**
 * Validate import statement against problematic patterns
 */
export function validateImportStatement(importStatement: string, filePath: string): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isValid = true;

  for (const { pattern, message } of PROBLEMATIC_PATTERNS) {
    if (pattern.test(importStatement)) {
      warnings.push(`${filePath}: ${message}`);
      isValid = false;
    }
  }

  return { isValid, warnings };
}

/**
 * Extract import statements from TypeScript/JavaScript file content
 */
export function extractImportStatements(fileContent: string): string[] {
  const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?$/gm;
  return fileContent.match(importRegex) || [];
}

/**
 * Validate all imports in a file
 */
export async function validateFileImports(filePath: string, fileContent: string): Promise<{
  validImports: string[];
  invalidImports: string[];
  warnings: string[];
}> {
  const imports = extractImportStatements(fileContent);
  const validImports: string[] = [];
  const invalidImports: string[] = [];
  const warnings: string[] = [];

  for (const importStatement of imports) {
    // Extract the import path
    const pathMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
    if (!pathMatch) continue;

    const importPath = pathMatch[1];

    // Skip external packages (don't start with . or /)
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      continue;
    }

    // Validate the import statement pattern
    const patternValidation = validateImportStatement(importStatement, filePath);
    warnings.push(...patternValidation.warnings);

    // Try to validate the actual import path
    try {
      const isValid = await validateImportPath(importPath, filePath);
      if (isValid) {
        validImports.push(importStatement);
      } else {
        invalidImports.push(importStatement);
      }
    } catch (error) {
      invalidImports.push(importStatement);
      warnings.push(`Failed to validate import "${importPath}" in ${filePath}`);
    }
  }

  return { validImports, invalidImports, warnings };
}

/**
 * Common dependency resolution fixes
 */
export const DEPENDENCY_FIXES = {
  /**
   * Fix relative import paths
   */
  fixRelativeImports: (importPath: string, fromDir: string, toDir: string): string => {
    // Calculate the relative path from fromDir to toDir
    const relativePath = require('path').relative(fromDir, toDir);
    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  },

  /**
   * Convert barrel import to direct import
   */
  convertBarrelImport: (importStatement: string): string => {
    // Convert "import { X } from './index'" to "import { X } from './X'"
    return importStatement.replace(/from\s+['"](.*)\/index['"]/, "from '$1'");
  },

  /**
   * Add missing file extension
   */
  addFileExtension: (importPath: string, extension: string = '.ts'): string => {
    if (!importPath.endsWith('.ts') && !importPath.endsWith('.tsx') && !importPath.endsWith('.js')) {
      return `${importPath}${extension}`;
    }
    return importPath;
  }
};

/**
 * Generate a dependency validation report
 */
export async function generateDependencyReport(
  projectRoot: string
): Promise<{
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  circularDependencies: string[][];
  warnings: string[];
}> {
  const fs = require('fs');
  const path = require('path');
  const glob = require('glob');

  const tsFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**']
  });

  let validFiles = 0;
  let invalidFiles = 0;
  const allWarnings: string[] = [];
  const moduleGraph: Record<string, string[]> = {};

  for (const file of tsFiles) {
    const filePath = path.join(projectRoot, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const validation = await validateFileImports(filePath, content);

      if (validation.invalidImports.length === 0) {
        validFiles++;
      } else {
        invalidFiles++;
      }

      allWarnings.push(...validation.warnings);

      // Build module graph for circular dependency detection
      const imports = extractImportStatements(content);
      const dependencies: string[] = [];

      for (const importStatement of imports) {
        const pathMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
        if (pathMatch && (pathMatch[1].startsWith('.') || pathMatch[1].startsWith('/'))) {
          dependencies.push(pathMatch[1]);
        }
      }

      moduleGraph[file] = dependencies;
    } catch (error) {
      invalidFiles++;
      allWarnings.push(`Failed to process file ${file}: ${error}`);
    }
  }

  const circularDependencies = detectCircularDependencies(moduleGraph);

  return {
    totalFiles: tsFiles.length,
    validFiles,
    invalidFiles,
    circularDependencies,
    warnings: allWarnings
  };
}

/**
 * Auto-fix common dependency issues
 */
export function autoFixDependencyIssues(fileContent: string, filePath: string): {
  fixedContent: string;
  appliedFixes: string[];
} {
  let fixedContent = fileContent;
  const appliedFixes: string[] = [];

  // Fix 1: Convert barrel imports to direct imports where possible
  const barrelImportRegex = /import\s+{([^}]+)}\s+from\s+['"](.*)\/index['"]/g;
  fixedContent = fixedContent.replace(barrelImportRegex, (match, imports, basePath) => {
    appliedFixes.push(`Converted barrel import: ${match}`);
    return `import {${imports}} from '${basePath}'`;
  });

  // Fix 2: Add missing file extensions for relative imports
  const relativeImportRegex = /from\s+['"](\.[^'"]*)['"]/g;
  fixedContent = fixedContent.replace(relativeImportRegex, (match, importPath) => {
    if (!importPath.endsWith('.ts') && !importPath.endsWith('.tsx') && !importPath.endsWith('.js')) {
      appliedFixes.push(`Added file extension: ${match}`);
      return match.replace(importPath, `${importPath}.ts`);
    }
    return match;
  });

  return { fixedContent, appliedFixes };
}

export default {
  validateImportPath,
  detectCircularDependencies,
  validateBarrelExports,
  validateImportStatement,
  validateFileImports,
  generateDependencyReport,
  autoFixDependencyIssues,
  PROBLEMATIC_PATTERNS,
  DEPENDENCY_FIXES
};
