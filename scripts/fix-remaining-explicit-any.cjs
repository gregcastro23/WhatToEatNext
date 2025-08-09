#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: './src',
  extensions: ['.ts', '.tsx'],
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '*.test.ts',
    '*.test.tsx',
    '*.spec.ts',
  ],
  preservePatterns: {
    // Astronomical library integrations
    astronomical: [
      /astronomy-engine/i,
      /astronomia/i,
      /suncalc/i,
      /ephemeris/i,
      /planetary.*calculation/i,
      /celestial.*computation/i,
      /orbital.*mechanics/i,
    ],
    // External API patterns
    external: [
      /third.*party.*api/i,
      /external.*service/i,
      /legacy.*interface/i,
      /vendor.*types/i,
      /\bwindow\./,
      /\bglobal\./,
      /require\(/,
    ],
    // Complex type scenarios
    complex: [
      /generic.*constraint/i,
      /complex.*type.*manipulation/i,
      /recursive.*type/i,
      /conditional.*type/i,
      /mapped.*type/i,
      /infer\s+\w+/,
    ],
  },
  typeDefinitionFile: './src/types/enterprise-intelligence.d.ts',
  maxFilesPerRun: 30,
  dryRun: false,
};

// Track metrics
const metrics = {
  filesScanned: 0,
  filesModified: 0,
  anyFixed: 0,
  anyPreserved: 0,
  typesGenerated: 0,
  errors: [],
  patterns: {
    apiResponse: 0,
    functionParam: 0,
    arrayType: 0,
    recordType: 0,
    returnType: 0,
    propertyType: 0,
    genericType: 0,
  },
};

// Collected type definitions for generation
const collectedTypes = {
  apiResponses: new Set(),
  enterprisePatterns: new Set(),
  serviceInterfaces: new Set(),
  dataModels: new Set(),
};

// Explicit any replacement patterns
const ANY_PATTERNS = [
  // Pattern 1: API Response handling
  {
    name: 'apiResponse',
    pattern: /(\w+)\s*:\s*any(\s*=\s*await\s+fetch|\s*=\s*.*api\.)/g,
    replacement: (match, variable) => {
      collectedTypes.apiResponses.add(variable);
      return `${variable}: unknown`;
    },
    description: 'Replace any with unknown for API responses',
  },

  // Pattern 2: Function parameters
  {
    name: 'functionParam',
    pattern: /\(([^)]*?)(\w+)\s*:\s*any([,)])/g,
    replacement: (match, prefix, param, suffix) => {
      // Check context for better type inference
      if (param.toLowerCase().includes('data')) {
        return `${prefix}${param}: Record<string, unknown>${suffix}`;
      } else if (param.toLowerCase().includes('error')) {
        return `${prefix}${param}: Error | unknown${suffix}`;
      } else if (param.toLowerCase().includes('config')) {
        return `${prefix}${param}: Record<string, unknown>${suffix}`;
      }
      return `${prefix}${param}: unknown${suffix}`;
    },
    description: 'Replace function parameter any types',
  },

  // Pattern 3: Array types
  {
    name: 'arrayType',
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]',
    description: 'Replace any[] with unknown[]',
  },

  // Pattern 4: Record types
  {
    name: 'recordType',
    pattern: /Record<(\w+),\s*any>/g,
    replacement: 'Record<$1, unknown>',
    description: 'Replace Record<string, any> with Record<string, unknown>',
  },

  // Pattern 5: Return types
  {
    name: 'returnType',
    pattern: /\)\s*:\s*any\s*{/g,
    replacement: '): unknown {',
    description: 'Replace function return type any',
  },

  // Pattern 6: Property types in interfaces/types
  {
    name: 'propertyType',
    pattern: /(\w+)\s*:\s*any;/g,
    replacement: (match, property) => {
      // Infer better types based on property names
      if (property.toLowerCase().includes('id')) {
        return `${property}: string | number;`;
      } else if (
        property.toLowerCase().includes('name') ||
        property.toLowerCase().includes('title')
      ) {
        return `${property}: string;`;
      } else if (
        property.toLowerCase().includes('count') ||
        property.toLowerCase().includes('amount')
      ) {
        return `${property}: number;`;
      } else if (property.toLowerCase().includes('is') || property.toLowerCase().includes('has')) {
        return `${property}: boolean;`;
      } else if (
        property.toLowerCase().includes('date') ||
        property.toLowerCase().includes('time')
      ) {
        return `${property}: Date | string;`;
      } else if (
        property.toLowerCase().includes('data') ||
        property.toLowerCase().includes('config')
      ) {
        return `${property}: Record<string, unknown>;`;
      }
      return `${property}: unknown;`;
    },
    description: 'Replace property type any with inferred types',
  },

  // Pattern 7: Generic type constraints
  {
    name: 'genericType',
    pattern: /<T\s+extends\s+any>/g,
    replacement: '<T extends unknown>',
    description: 'Replace generic constraint any',
  },
];

// Enterprise intelligence type patterns
const ENTERPRISE_PATTERNS = [
  {
    pattern: /interface\s+(\w*Intelligence\w*)\s*{[^}]*}/g,
    category: 'enterprisePatterns',
  },
  {
    pattern: /type\s+(\w*Service\w*)\s*=\s*{[^}]*}/g,
    category: 'serviceInterfaces',
  },
  {
    pattern: /interface\s+(\w*Data\w*)\s*{[^}]*}/g,
    category: 'dataModels',
  },
];

/**
 * Check if any usage should be preserved
 */
function shouldPreserveAny(line, context) {
  // Check all preservation patterns
  for (const [domain, patterns] of Object.entries(CONFIG.preservePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(line) || pattern.test(context)) {
        metrics.anyPreserved++;
        return true;
      }
    }
  }
  return false;
}

/**
 * Extract and collect type definitions from content
 */
function collectTypeDefinitions(content, filePath) {
  ENTERPRISE_PATTERNS.forEach(({ pattern, category }) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      collectedTypes[category].add(match[0]);
      metrics.typesGenerated++;
    }
  });
}

/**
 * Process a single file to fix explicit any
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let modified = false;

    // First, collect type definitions
    collectTypeDefinitions(content, filePath);

    // Apply each any replacement pattern
    ANY_PATTERNS.forEach(patternConfig => {
      const pattern = new RegExp(patternConfig.pattern.source, 'gm');
      let match;
      const replacements = [];

      while ((match = pattern.exec(content)) !== null) {
        const matchedText = match[0];
        const lineStart = content.lastIndexOf('\n', match.index) + 1;
        const lineEnd = content.indexOf('\n', match.index);
        const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);

        // Check if this any should be preserved
        if (shouldPreserveAny(line, matchedText)) {
          continue;
        }

        // Store replacement for later application
        const replacement =
          typeof patternConfig.replacement === 'function'
            ? patternConfig.replacement(...match)
            : matchedText.replace(patternConfig.pattern, patternConfig.replacement);

        replacements.push({ matchedText, replacement, index: match.index });
        metrics.patterns[patternConfig.name]++;
        metrics.anyFixed++;
        modified = true;
      }

      // Apply replacements in reverse order to maintain indices
      replacements.reverse().forEach(({ matchedText, replacement, index }) => {
        modifiedContent =
          modifiedContent.substring(0, index) +
          replacement +
          modifiedContent.substring(index + matchedText.length);

        if (!CONFIG.dryRun) {
          console.log(`  Fixed ${patternConfig.name}: ${matchedText} → ${replacement}`);
        }
      });
    });

    // Write the modified content if changes were made
    if (modified && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      metrics.filesModified++;
      console.log(`✅ Fixed ${metrics.anyFixed} explicit any usages in ${filePath}`);
    } else if (modified && CONFIG.dryRun) {
      console.log(`Would fix explicit any in ${filePath}`);
    }
  } catch (error) {
    metrics.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Generate type definition file for collected types
 */
function generateTypeDefinitions() {
  if (
    collectedTypes.apiResponses.size === 0 &&
    collectedTypes.enterprisePatterns.size === 0 &&
    collectedTypes.serviceInterfaces.size === 0 &&
    collectedTypes.dataModels.size === 0
  ) {
    return;
  }

  console.log('\n📝 Generating type definitions...');

  let typeContent = `// Auto-generated enterprise intelligence type definitions
// Generated by fix-remaining-explicit-any.cjs
// ${new Date().toISOString()}

`;

  // API Response types
  if (collectedTypes.apiResponses.size > 0) {
    typeContent += '// API Response Types\n';
    collectedTypes.apiResponses.forEach(name => {
      const interfaceName = name.charAt(0).toUpperCase() + name.slice(1) + 'Response';
      typeContent += `export interface ${interfaceName} {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  statusCode?: number;
}\n\n`;
    });
  }

  // Enterprise patterns
  if (collectedTypes.enterprisePatterns.size > 0) {
    typeContent += '// Enterprise Intelligence Patterns\n';
    typeContent += Array.from(collectedTypes.enterprisePatterns).join('\n\n') + '\n\n';
  }

  // Service interfaces
  if (collectedTypes.serviceInterfaces.size > 0) {
    typeContent += '// Service Layer Interfaces\n';
    typeContent += Array.from(collectedTypes.serviceInterfaces).join('\n\n') + '\n\n';
  }

  // Data models
  if (collectedTypes.dataModels.size > 0) {
    typeContent += '// Data Model Types\n';
    typeContent += Array.from(collectedTypes.dataModels).join('\n\n') + '\n\n';
  }

  // Common utility types
  typeContent += `// Common Utility Types
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;
export type ConfigObject = Record<string, unknown>;
export type DataObject = Record<string, unknown>;
export type ErrorResponse = {
  error: true;
  message: string;
  code?: string;
  details?: unknown;
};
export type SuccessResponse<T = unknown> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
`;

  if (!CONFIG.dryRun) {
    // Ensure directory exists
    const dir = path.dirname(CONFIG.typeDefinitionFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.typeDefinitionFile, typeContent, 'utf8');
    console.log(`✅ Generated type definitions at ${CONFIG.typeDefinitionFile}`);
  } else {
    console.log('Would generate type definitions with:');
    console.log(`  API Response types: ${collectedTypes.apiResponses.size}`);
    console.log(`  Enterprise patterns: ${collectedTypes.enterprisePatterns.size}`);
    console.log(`  Service interfaces: ${collectedTypes.serviceInterfaces.size}`);
    console.log(`  Data models: ${collectedTypes.dataModels.size}`);
  }
}

/**
 * Validate TypeScript compilation after fixes
 */
function validateBuildAfterFix() {
  console.log('\n📋 Validating TypeScript compilation...');
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.error('❌ Build failed after fixes - consider rolling back');
    console.error(error.toString());
    return false;
  }
}

/**
 * Create git stash for safety
 */
function createSafetyStash() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    execSync(`git stash push -m "explicit-any-fix-${timestamp}"`, { stdio: 'pipe' });
    console.log('✅ Created safety stash');
    return timestamp;
  } catch (error) {
    console.error('⚠️  Could not create git stash:', error.message);
    return null;
  }
}

/**
 * Get all TypeScript files to process
 */
function getFilesToProcess() {
  const files = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!CONFIG.excludePatterns.some(pattern => fullPath.includes(pattern))) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (
          CONFIG.extensions.some(ext => fullPath.endsWith(ext)) &&
          !CONFIG.excludePatterns.some(pattern => fullPath.includes(pattern))
        ) {
          files.push(fullPath);
        }
      }
    }
  }

  scanDirectory(CONFIG.sourceDir);
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 WhatToEatNext - Explicit Any Elimination');
  console.log('===========================================');

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    CONFIG.dryRun = true;
    console.log('🔍 Running in DRY RUN mode - no files will be modified');
  }

  if (args.includes('--max-files')) {
    const maxIndex = args.indexOf('--max-files');
    CONFIG.maxFilesPerRun = parseInt(args[maxIndex + 1]) || CONFIG.maxFilesPerRun;
  }

  // Create safety stash if not in dry run
  let stashTimestamp = null;
  if (!CONFIG.dryRun) {
    stashTimestamp = createSafetyStash();
  }

  // Get files to process
  const files = getFilesToProcess();
  console.log(`\n📁 Found ${files.length} TypeScript files to analyze`);

  // Process files with limit
  const filesToProcess = files.slice(0, CONFIG.maxFilesPerRun);
  console.log(`\n🔧 Processing ${filesToProcess.length} files...\n`);

  filesToProcess.forEach(file => {
    metrics.filesScanned++;
    processFile(file);
  });

  // Generate type definitions
  generateTypeDefinitions();

  // Report results
  console.log('\n📊 Fix Summary:');
  console.log('================');
  console.log(`Files scanned: ${metrics.filesScanned}`);
  console.log(`Files modified: ${metrics.filesModified}`);
  console.log(`Explicit any fixed: ${metrics.anyFixed}`);
  console.log(`Explicit any preserved: ${metrics.anyPreserved}`);
  console.log(`Type definitions generated: ${metrics.typesGenerated}`);
  console.log('\nPattern breakdown:');
  Object.entries(metrics.patterns).forEach(([pattern, count]) => {
    if (count > 0) {
      console.log(`  ${pattern}: ${count}`);
    }
  });

  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${metrics.errors.length}`);
    metrics.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }

  // Validate build if changes were made
  if (metrics.filesModified > 0 && !CONFIG.dryRun) {
    const buildValid = validateBuildAfterFix();
    if (!buildValid && stashTimestamp) {
      console.log('\n⚠️  Build failed - you can restore with:');
      console.log(`git stash apply stash^{/explicit-any-fix-${stashTimestamp}}`);
    }
  }

  // Suggest next steps
  console.log('\n📌 Next Steps:');
  if (CONFIG.dryRun) {
    console.log('1. Review the changes that would be made');
    console.log('2. Run without --dry-run to apply fixes');
  } else if (metrics.filesModified > 0) {
    console.log('1. Review generated type definitions');
    console.log('2. Run yarn lint to see updated issue count');
    console.log('3. Review changes with git diff');
    console.log('4. Run tests to ensure functionality preserved');
    console.log('5. Commit changes if all tests pass');
  }

  if (files.length > filesToProcess.length) {
    console.log(
      `\n📝 Note: ${files.length - filesToProcess.length} files remaining. Run again to process more.`,
    );
  }
}

// Execute
main();
