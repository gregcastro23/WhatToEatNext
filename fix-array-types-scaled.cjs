#!/usr/bin/env node

/**
 * Scaled Array Type Improvements
 * 
 * Enhanced script for systematic array type improvements across broader file set
 * with advanced safety checks and rollback capabilities
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Get current linting count for tracking
function getCurrentExplicitAnyCount() {
  try {
    const result = execSync('yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l', { encoding: 'utf8' });
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

function validateBuild() {
  try {
    execSync('yarn build', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function createBackup(filePath) {
  const timestamp = Date.now();
  const backupPath = `${filePath}.scaled-backup-${timestamp}`;
  const originalContent = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, originalContent);
  return { backupPath, originalContent };
}

function restoreBackup(filePath, originalContent) {
  fs.writeFileSync(filePath, originalContent);
}

function analyzeArrayPatterns(content) {
  const patterns = {
    'simple_arrays': (content.match(/\bany\[\]/g) || []).length,
    'generic_arrays': (content.match(/Array<any>/g) || []).length,
    'rest_parameters': (content.match(/\.\.\.\w+:\s*any\[\]/g) || []).length,
    'function_returns': (content.match(/\):\s*any\[\]/g) || []).length,
    'type_annotations': (content.match(/:\s*any\[\]/g) || []).length
  };
  
  const total = Object.values(patterns).reduce((sum, count) => sum + count, 0);
  return { patterns, total };
}

function applyArrayTypeFixes(content, filePath) {
  let fixes = 0;
  let modifiedContent = content;
  const appliedFixes = [];

  // Progressive enhancement patterns - safest to riskiest
  const replacementStrategies = [
    {
      name: 'Type annotation arrays',
      pattern: /:\s*any\[\]/g,
      replacement: ': unknown[]',
      safety: 'high',
      condition: (match, context) => {
        // Skip if it's in a Jest mock or test context
        return !context.includes('jest.') && !context.includes('MockedFunction') && !context.includes('test(');
      }
    },
    {
      name: 'Simple array declarations',
      pattern: /\bany\[\]/g,
      replacement: 'unknown[]',
      safety: 'high',
      condition: (match, context) => {
        // Skip if in sensitive contexts
        return !context.includes('jest.') && !context.includes('Mock') && !context.includes('as any');
      }
    },
    {
      name: 'Generic Array types',
      pattern: /Array<any>/g,
      replacement: 'Array<unknown>',
      safety: 'medium',
      condition: (match, context) => {
        return !context.includes('jest.') && !context.includes('Mock');
      }
    },
    {
      name: 'Function return types',
      pattern: /\):\s*any\[\]/g,
      replacement: '): unknown[]',
      safety: 'medium',
      condition: (match, context) => {
        // Only if it's a utility function, not a mock or test function
        return !context.includes('jest.') && !context.includes('Mock') && 
               (context.includes('function') || context.includes('async'));
      }
    }
  ];

  for (const strategy of replacementStrategies) {
    const matches = [...modifiedContent.matchAll(strategy.pattern)];
    
    for (const match of matches) {
      const startIndex = Math.max(0, match.index - 100);
      const endIndex = Math.min(modifiedContent.length, match.index + match[0].length + 100);
      const context = modifiedContent.substring(startIndex, endIndex);
      
      if (strategy.condition(match[0], context)) {
        modifiedContent = modifiedContent.replace(match[0], strategy.replacement);
        fixes++;
        appliedFixes.push({
          type: strategy.name,
          original: match[0],
          replacement: strategy.replacement,
          safety: strategy.safety
        });
      }
    }
    
    if (appliedFixes.length > 0) {
      console.log(`  ✓ ${strategy.name}: ${appliedFixes.filter(f => f.type === strategy.name).length} fixes`);
    }
  }

  return { modifiedContent, fixes, appliedFixes };
}

async function processFile(filePath) {
  try {
    const fileName = filePath.split('/').pop();
    console.log(`\n🎯 Processing ${fileName}`);
    
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const analysis = analyzeArrayPatterns(originalContent);
    
    if (analysis.total === 0) {
      console.log(`ℹ️ No array type patterns found`);
      return { success: false, fixes: 0, reason: 'no_patterns' };
    }

    console.log(`📊 Found ${analysis.total} array patterns:`, analysis.patterns);

    const { modifiedContent, fixes, appliedFixes } = applyArrayTypeFixes(originalContent, filePath);
    
    if (fixes === 0) {
      console.log(`ℹ️ No safe fixes identified`);
      return { success: false, fixes: 0, reason: 'no_safe_fixes' };
    }

    // Create backup
    const { backupPath } = createBackup(filePath);
    
    // Apply changes
    fs.writeFileSync(filePath, modifiedContent);
    
    // Validate TypeScript compilation
    if (!validateTypeScriptCompilation()) {
      console.log(`❌ TypeScript compilation failed - restoring backup`);
      restoreBackup(filePath, originalContent);
      fs.unlinkSync(backupPath);
      return { success: false, fixes: 0, reason: 'compilation_failed' };
    }

    console.log(`✅ TypeScript compilation successful`);
    console.log(`📝 Applied ${fixes} fixes (backup: ${backupPath.split('/').pop()})`);
    
    return { 
      success: true, 
      fixes, 
      appliedFixes, 
      backupPath,
      fileName 
    };

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { success: false, fixes: 0, reason: 'processing_error', error: error.message };
  }
}

async function main() {
  console.log('🚀 Scaled Array Type Improvements Campaign');
  console.log('===========================================');

  const startingCount = getCurrentExplicitAnyCount();
  console.log(`📊 Starting explicit-any count: ${startingCount}`);

  // Target non-test files with array patterns for scaling
  const targetFiles = [
    'src/hooks/useEnterpriseIntelligence.ts',
    'src/components/IngredientRecommender.tsx', 
    'src/components/CuisineRecommender.tsx',
    'src/constants/chakraSymbols.ts',
    'src/services/AlertingSystem.ts',
    'src/types/advancedIntelligence.ts',
    'src/utils/naturalLanguageProcessor.ts',
    'src/utils/logger.ts',
    'src/components/FoodRecommender/utils.ts',
    'src/components/recommendations/AlchemicalRecommendations.migrated.tsx'
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
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`⚠️ File not found: ${filePath.split('/').pop()}`);
    }
  }

  const endingCount = getCurrentExplicitAnyCount();
  const netReduction = startingCount - endingCount;

  console.log(`\n📊 Scaled Campaign Summary:`);
  console.log(`========================`);
  console.log(`   Files targeted: ${targetFiles.length}`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Files successfully improved: ${filesFixed}`);
  console.log(`   Total array type fixes applied: ${totalFixes}`);
  console.log(`   Explicit-any count: ${startingCount} → ${endingCount}`);
  console.log(`   Net reduction: ${netReduction}`);

  if (totalFixes > 0) {
    console.log(`\n🎉 Scaled Success!`);
    console.log(`📈 Improvement rate: ${((netReduction / startingCount) * 100).toFixed(1)}%`);
    console.log(`🔧 Average fixes per file: ${(totalFixes / filesFixed).toFixed(1)}`);
    
    // Success breakdown
    const successfulFiles = results.filter(r => r.success);
    console.log(`\n✅ Successfully improved files:`);
    successfulFiles.forEach(result => {
      console.log(`   • ${result.fileName}: ${result.fixes} fixes`);
    });
  }

  // Failure analysis
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log(`\n📋 Files requiring manual review:`);
    failedResults.forEach(result => {
      console.log(`   • ${result.fileName || 'unknown'}: ${result.reason}`);
    });
  }

  console.log(`\n🔄 Run 'make build' to validate full system integrity`);
}

main().catch(console.error);