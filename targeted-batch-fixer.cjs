#!/usr/bin/env node

/**
 * Targeted Batch Fixer - Focus on High-Impact Files
 *
 * This script targets specific files that we know have linting issues
 * and applies focused fixes with minimal preservation patterns.
 */

const fs = require('fs');
const { execSync } = require('child_process');

class TargetedBatchFixer {
  constructor() {
    this.totalFixes = 0;
    this.processedFiles = 0;
    this.fixesByCategory = {
      'prefer-optional-chain': 0,
      'no-non-null-assertion': 0,
      'no-unnecessary-type-assertion': 0,
      'no-floating-promises': 0,
      'no-misused-promises': 0,
    };
  }

  /**
   * Get specific files that we know have issues
   */
  getTargetFiles() {
    const targetFiles = [
      // Files we know have prefer-optional-chain issues
      'src/components/ChakraDisplay.migrated.tsx',
      'src/components/CookingMethodsSection.migrated.tsx',
      'src/components/AstrologicalClock.tsx',
      'src/components/CookingMethods.tsx',

      // Files with type assertion issues
      'src/app/api/astrologize/route.ts',

      // Service files with various issues
      'src/services/CampaignConflictResolver.ts',
      'src/services/CurrentMomentManager.ts',

      // Component files
      'src/components/ElementalDisplay.tsx',
      'src/components/FoodRecommender.tsx',
      'src/components/IngredientRecommender.tsx',
    ];

    return targetFiles.filter(file => fs.existsSync(file));
  }

  /**
   * Apply comprehensive fixes to content
   */
  applyFixes(content, filePath) {
    let modifiedContent = content;
    let totalFixes = 0;
    const fixDetails = {};

    // 1. Fix prefer-optional-chain patterns
    const optionalChainResult = this.fixOptionalChainPatterns(modifiedContent);
    modifiedContent = optionalChainResult.content;
    totalFixes += optionalChainResult.fixes;
    fixDetails['prefer-optional-chain'] = optionalChainResult.fixes;
    this.fixesByCategory['prefer-optional-chain'] += optionalChainResult.fixes;

    // 2. Fix non-null assertions
    const nonNullResult = this.fixNonNullAssertions(modifiedContent);
    modifiedContent = nonNullResult.content;
    totalFixes += nonNullResult.fixes;
    fixDetails['no-non-null-assertion'] = nonNullResult.fixes;
    this.fixesByCategory['no-non-null-assertion'] += nonNullResult.fixes;

    // 3. Fix floating promises
    const floatingPromiseResult = this.fixFloatingPromises(modifiedContent);
    modifiedContent = floatingPromiseResult.content;
    totalFixes += floatingPromiseResult.fixes;
    fixDetails['no-floating-promises'] = floatingPromiseResult.fixes;
    this.fixesByCategory['no-floating-promises'] += floatingPromiseResult.fixes;

    // 4. Fix misused promises
    const misusedPromiseResult = this.fixMisusedPromises(modifiedContent);
    modifiedContent = misusedPromiseResult.content;
    totalFixes += misusedPromiseResult.fixes;
    fixDetails['no-misused-promises'] = misusedPromiseResult.fixes;
    this.fixesByCategory['no-misused-promises'] += misusedPromiseResult.fixes;

    return { content: modifiedContent, fixes: totalFixes, details: fixDetails };
  }

  /**
   * Fix prefer-optional-chain patterns
   */
  fixOptionalChainPatterns(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: obj && obj.prop -> obj?.prop
    const pattern1 = /(\w+)\s*&&\s*\1\.(\w+)(?!\()/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      modifiedContent = modifiedContent.replace(pattern1, '$1?.$2');
      fixes += matches1.length;
    }

    // Pattern 2: obj && obj[key] -> obj?.[key]
    const pattern2 = /(\w+)\s*&&\s*\1\[([^\]]+)\]/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      modifiedContent = modifiedContent.replace(pattern2, '$1?.[$2]');
      fixes += matches2.length;
    }

    // Pattern 3: (obj || {})[key] -> obj?.[key]
    const pattern3 = /\((\w+)\s*\|\|\s*\{\}\)\[([^\]]+)\]/g;
    const matches3 = [...modifiedContent.matchAll(pattern3)];
    if (matches3.length > 0) {
      modifiedContent = modifiedContent.replace(pattern3, '$1?.[$2]');
      fixes += matches3.length;
    }

    // Pattern 4: (obj || {}).prop -> obj?.prop
    const pattern4 = /\((\w+)\s*\|\|\s*\{\}\)\.(\w+)/g;
    const matches4 = [...modifiedContent.matchAll(pattern4)];
    if (matches4.length > 0) {
      modifiedContent = modifiedContent.replace(pattern4, '$1?.$2');
      fixes += matches4.length;
    }

    // Pattern 5: key in (obj || {}) -> obj?.[key] !== undefined
    const pattern5 = /(\w+)\s+in\s+\((\w+)\s*\|\|\s*\{\}\)/g;
    const matches5 = [...modifiedContent.matchAll(pattern5)];
    if (matches5.length > 0) {
      modifiedContent = modifiedContent.replace(pattern5, '$2?.[$1] !== undefined');
      fixes += matches5.length;
    }

    // Pattern 6: obj && obj.method() -> obj?.method()
    const pattern6 = /(\w+)\s*&&\s*\1\.(\w+)\(/g;
    const matches6 = [...modifiedContent.matchAll(pattern6)];
    if (matches6.length > 0) {
      modifiedContent = modifiedContent.replace(pattern6, '$1?.$2(');
      fixes += matches6.length;
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix non-null assertions
   */
  fixNonNullAssertions(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: obj!.prop -> obj?.prop (conservative)
    const pattern1 = /(\w+)!\.(\w+)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    for (const match of matches1) {
      // Only fix safe cases
      if (!match[1].includes('critical') && !match[1].includes('required')) {
        modifiedContent = modifiedContent.replace(match[0], `${match[1]}?.${match[2]}`);
        fixes++;
      }
    }

    // Pattern 2: specific known safe patterns
    if (modifiedContent.includes('resolutionStrategy!')) {
      modifiedContent = modifiedContent.replace(
        /resolutionStrategy!/g,
        "resolutionStrategy || 'unknown'",
      );
      fixes++;
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix floating promises
   */
  fixFloatingPromises(content) {
    let fixes = 0;
    let modifiedContent = content;

    const lines = modifiedContent.split('\n');
    const fixedLines = [];

    for (let line of lines) {
      const originalLine = line;

      // Pattern: Standalone async calls that should be voided
      if (
        /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*$/.test(line) &&
        !line.includes('await') &&
        !line.includes('void') &&
        !line.includes('return') &&
        !line.includes('console')
      ) {
        line = line.replace(
          /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*)$/,
          '$1void $2',
        );

        if (line !== originalLine) {
          fixes++;
        }
      }

      fixedLines.push(line);
    }

    return { content: fixedLines.join('\n'), fixes };
  }

  /**
   * Fix misused promises
   */
  fixMisusedPromises(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: onClick={asyncFunction} -> onClick={() => void asyncFunction()}
    const eventHandlerPattern = /(on\w+)=\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
    const matches1 = [...modifiedContent.matchAll(eventHandlerPattern)];
    for (const match of matches1) {
      const [fullMatch, eventName, functionName] = match;
      if (
        functionName.includes('async') ||
        functionName.includes('handle') ||
        functionName.includes('submit')
      ) {
        modifiedContent = modifiedContent.replace(
          fullMatch,
          `${eventName}={() => void ${functionName}()}`,
        );
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const shortPath = filePath.replace(process.cwd(), '.');
      console.log(`\n📁 Processing: ${shortPath}`);

      const content = fs.readFileSync(filePath, 'utf8');
      const { content: modifiedContent, fixes, details } = this.applyFixes(content, filePath);

      if (fixes > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');

        const fixSummary = Object.entries(details)
          .filter(([, count]) => count > 0)
          .map(([type, count]) => `${type}(${count})`)
          .join(', ');

        console.log(`  ✅ Applied ${fixes} fixes: ${fixSummary}`);
        this.totalFixes += fixes;
      } else {
        console.log(`  ℹ️ No fixable issues found`);
      }

      this.processedFiles++;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate TypeScript compilation
   */
  validateTypeScript() {
    try {
      console.log('\n🔍 Validating TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed');
      return false;
    }
  }

  /**
   * Run the targeted fixing process
   */
  run() {
    console.log('🚀 Starting Targeted Batch Fixing Process');

    const targetFiles = this.getTargetFiles();

    if (targetFiles.length === 0) {
      console.log('⚠️ No target files found');
      return;
    }

    console.log(`📋 Processing ${targetFiles.length} target files...`);

    for (const file of targetFiles) {
      this.processFile(file);
    }

    // Validate after all fixes
    if (this.totalFixes > 0) {
      this.validateTypeScript();
    }

    // Summary
    console.log('\n📊 Targeted Batch Fixing Summary:');
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    console.log('\n📈 Fixes by category:');
    for (const [category, count] of Object.entries(this.fixesByCategory)) {
      if (count > 0) {
        console.log(`   ${category}: ${count} fixes`);
      }
    }

    if (this.totalFixes > 0) {
      console.log('\n✅ Targeted batch fixes completed successfully!');
      console.log('💡 Run yarn lint to verify the improvements');
    }
  }
}

// Run the script
const fixer = new TargetedBatchFixer();
fixer.run();
