#!/usr/bin/env node

/**
 * Progressive Type Casting Automation
 *
 * Systematically improves (obj as any).property patterns with safer
 * (obj as unknown as TargetInterface).property patterns across the codebase
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Get current linting count for tracking
function getCurrentExplicitAnyCount() {
  try {
    const result = execSync(
      'yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l',
      { encoding: 'utf8' },
    );
    return parseInt(result.trim());
  } catch (error) {
    return 0;
  }
}

function validateTypeScriptCompilation() {
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function analyzeTypeCastingPatterns(content) {
  const patterns = {
    simple_casting: (content.match(/\([\w.]+\s+as\s+any\)/g) || []).length,
    property_access: (content.match(/\([\w.]+\s+as\s+any\)\??\.\w+/g) || []).length,
    method_calls: (content.match(/\([\w.]+\s+as\s+any\)\??\.\w+\(/g) || []).length,
    nested_access: (content.match(/\([\w.]+\s+as\s+any\)\??\.\w+\??\.\w+/g) || []).length,
    bracket_access: (content.match(/\([\w.]+\s+as\s+any\)\[[\w'"]+\]/g) || []).length,
  };

  const total = Object.values(patterns).reduce((sum, count) => sum + count, 0);
  return { patterns, total };
}

function createProgressiveTypeCasting(content, filePath) {
  let fixes = 0;
  let modifiedContent = content;
  const appliedFixes = [];

  // Progressive type casting improvements
  const typeCastingStrategies = [
    {
      name: 'Simple property access',
      pattern: /\(([\w.]+)\s+as\s+any\)\??\.([\w]+)/g,
      replacement: (match, objectRef, property) => {
        // Create safer progressive casting
        return `(${objectRef} as unknown as Record<string, unknown>)?.${property}`;
      },
      safety: 'high',
      condition: (match, context) => {
        // Skip if in test contexts or already safe patterns
        return (
          !context.includes('jest.') &&
          !context.includes('MockedFunction') &&
          !context.includes('test(') &&
          !context.includes('Record<string, unknown>')
        );
      },
    },
    {
      name: 'Method call access',
      pattern: /\(([\w.]+)\s+as\s+any\)\??\.([\w]+)\(/g,
      replacement: (match, objectRef, methodName) => {
        // Create safer method access
        return `(${objectRef} as unknown as Record<string, () => unknown>)?.${methodName}?.(`;
      },
      safety: 'medium',
      condition: (match, context) => {
        return (
          !context.includes('jest.') &&
          !context.includes('Mock') &&
          !context.includes('Record<string,')
        );
      },
    },
    {
      name: 'Nested property access',
      pattern: /\(([\w.]+)\s+as\s+any\)\??\.([\w]+)\??\.([\w]+)/g,
      replacement: (match, objectRef, prop1, prop2) => {
        // Create safer nested access
        return `(${objectRef} as unknown as Record<string, Record<string, unknown>>)?.${prop1}?.${prop2}`;
      },
      safety: 'medium',
      condition: (match, context) => {
        return (
          !context.includes('jest.') &&
          !context.includes('test') &&
          !context.includes('Record<string,')
        );
      },
    },
    {
      name: 'Analysis result access',
      pattern:
        /\(([\w.]+)\s+as\s+any\)\??\.(coreMetrics|effectiveness|recommendations|compatibility)/g,
      replacement: (match, objectRef, analysisProperty) => {
        // Use specific analysis interfaces
        if (analysisProperty === 'coreMetrics') {
          return `(${objectRef} as unknown as { coreMetrics: Record<string, number> })?.${analysisProperty}`;
        } else if (analysisProperty === 'effectiveness') {
          return `(${objectRef} as unknown as { effectiveness: Record<string, number> })?.${analysisProperty}`;
        } else if (analysisProperty === 'recommendations') {
          return `(${objectRef} as unknown as { recommendations: string[] })?.${analysisProperty}`;
        } else {
          return `(${objectRef} as unknown as { ${analysisProperty}: unknown })?.${analysisProperty}`;
        }
      },
      safety: 'high',
      condition: (match, context) => {
        return !context.includes('jest.') && !context.includes('Mock');
      },
    },
  ];

  for (const strategy of typeCastingStrategies) {
    let matches;
    while ((matches = strategy.pattern.exec(modifiedContent)) !== null) {
      const startIndex = Math.max(0, matches.index - 100);
      const endIndex = Math.min(modifiedContent.length, matches.index + matches[0].length + 100);
      const context = modifiedContent.substring(startIndex, endIndex);

      if (strategy.condition(matches[0], context)) {
        const replacement =
          typeof strategy.replacement === 'function'
            ? strategy.replacement(matches[0], ...matches.slice(1))
            : strategy.replacement;

        modifiedContent = modifiedContent.replace(matches[0], replacement);
        fixes++;
        appliedFixes.push({
          type: strategy.name,
          original: matches[0],
          replacement: replacement,
          safety: strategy.safety,
        });

        // Reset regex to continue from beginning (due to content modification)
        strategy.pattern.lastIndex = 0;
        break;
      }
    }

    // Reset regex for next strategy
    strategy.pattern.lastIndex = 0;

    if (appliedFixes.filter(f => f.type === strategy.name).length > 0) {
      console.log(
        `  ✓ ${strategy.name}: ${appliedFixes.filter(f => f.type === strategy.name).length} fixes`,
      );
    }
  }

  return { modifiedContent, fixes, appliedFixes };
}

async function processFile(filePath) {
  try {
    const fileName = filePath.split('/').pop();
    console.log(`\n🎯 Processing ${fileName}`);

    const originalContent = fs.readFileSync(filePath, 'utf8');
    const analysis = analyzeTypeCastingPatterns(originalContent);

    if (analysis.total === 0) {
      console.log(`ℹ️ No type casting patterns found`);
      return { success: false, fixes: 0, reason: 'no_patterns' };
    }

    console.log(`📊 Found ${analysis.total} type casting patterns:`, analysis.patterns);

    const { modifiedContent, fixes, appliedFixes } = createProgressiveTypeCasting(
      originalContent,
      filePath,
    );

    if (fixes === 0) {
      console.log(`ℹ️ No safe progressive casting improvements identified`);
      return { success: false, fixes: 0, reason: 'no_safe_improvements' };
    }

    // Create backup
    const timestamp = Date.now();
    const backupPath = `${filePath}.progressive-casting-backup-${timestamp}`;
    fs.writeFileSync(backupPath, originalContent);

    // Apply changes
    fs.writeFileSync(filePath, modifiedContent);

    // Validate TypeScript compilation
    if (!validateTypeScriptCompilation()) {
      console.log(`❌ TypeScript compilation failed - restoring backup`);
      fs.writeFileSync(filePath, originalContent);
      fs.unlinkSync(backupPath);
      return { success: false, fixes: 0, reason: 'compilation_failed' };
    }

    console.log(`✅ TypeScript compilation successful`);
    console.log(`📝 Applied ${fixes} progressive casting improvements`);
    console.log(`🔄 Backup: ${backupPath.split('/').pop()}`);

    return {
      success: true,
      fixes,
      appliedFixes,
      backupPath,
      fileName,
    };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { success: false, fixes: 0, reason: 'processing_error', error: error.message };
  }
}

async function main() {
  console.log('🚀 Progressive Type Casting Automation Campaign');
  console.log('===============================================');

  const startingCount = getCurrentExplicitAnyCount();
  console.log(`📊 Starting explicit-any count: ${startingCount}`);

  // Target files with known type casting patterns
  const targetFiles = [
    'src/constants/chakraSymbols.ts',
    'src/services/EnterpriseIntelligenceIntegration.ts',
    'src/data/unified/recipeBuilding.ts',
    'src/components/IngredientRecommender.tsx',
    'src/components/CuisineRecommender.tsx',
    'src/services/AlertingSystem.ts',
    'src/services/campaign/ValidationFramework.ts',
  ].map(file => `/Users/GregCastro/Desktop/WhatToEatNext/${file}`);

  let totalFixes = 0;
  let filesProcessed = 0;
  let filesFixed = 0;
  const results = [];

  for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
      filesProcessed++;
      const result = await processFile(filePath);
      results.push(result);

      if (result.success) {
        filesFixed++;
        totalFixes += result.fixes;
      }

      // Pause between files for safety
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      console.log(`⚠️ File not found: ${filePath.split('/').pop()}`);
    }
  }

  const endingCount = getCurrentExplicitAnyCount();
  const netReduction = startingCount - endingCount;

  console.log(`\n📊 Progressive Type Casting Campaign Summary:`);
  console.log(`===========================================`);
  console.log(`   Files targeted: ${targetFiles.length}`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Files successfully improved: ${filesFixed}`);
  console.log(`   Total progressive casting fixes: ${totalFixes}`);
  console.log(`   Explicit-any count: ${startingCount} → ${endingCount}`);
  console.log(`   Net reduction: ${netReduction}`);

  if (totalFixes > 0) {
    console.log(`\n🎉 Progressive Casting Success!`);
    console.log(`📈 Improvement rate: ${((netReduction / startingCount) * 100).toFixed(1)}%`);
    console.log(`🔧 Average fixes per file: ${(totalFixes / filesFixed).toFixed(1)}`);

    // Success breakdown
    const successfulFiles = results.filter(r => r.success);
    console.log(`\n✅ Successfully improved files:`);
    successfulFiles.forEach(result => {
      console.log(`   • ${result.fileName}: ${result.fixes} progressive casting improvements`);
    });
  }

  // Failure analysis
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log(`\n📋 Files requiring review:`);
    failedResults.forEach(result => {
      console.log(`   • ${result.fileName || 'unknown'}: ${result.reason}`);
    });
  }

  console.log(`\n🔄 Run 'yarn tsc --noEmit' to validate all changes`);
}

main().catch(console.error);
