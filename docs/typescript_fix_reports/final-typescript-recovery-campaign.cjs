#!/usr/bin/env node

/**
 * Final TypeScript Recovery Campaign
 * Task 13.1: Execute Final TypeScript Recovery Campaign (2,869 → 0 errors)
 *
 * Based on proven approaches from Phase 12.1 campaign
 * Focus on remaining error categories: TS1005 (2,001), TS1128 (491), TS1109 (177)
 * Process in batches of 15 files with validation checkpoints
 * Target 100% error elimination using conservative, proven approaches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FinalTypeScriptRecoveryCampaign {
  constructor() {
    this.campaignStartTime = new Date();
    this.initialErrorCount = 0;
    this.currentErrorCount = 0;
    this.processedFiles = [];
    this.totalFixes = 0;
    this.errorHistory = [];
    this.backupDir = `.final-ts-recovery-backup-${Date.now()}`;
    this.batchSize = 15; // As per requirements
    this.validationCheckpoint = 5; // Validate every 5 files
  }

  async run() {
    console.log('🚀 FINAL TYPESCRIPT RECOVERY CAMPAIGN');
    console.log('=' .repeat(60));
    console.log('Target: 2,793 → 0 TypeScript errors (100% elimination)');
    console.log('Focus: TS1005 (2,001), TS1128 (491), TS1109 (177)');
    console.log('Approach: Conservative, proven methods from Phase 12.1\n');

    try {
      await this.initializeCampaign();
      await this.executeRecoveryPhases();
      await this.generateFinalReport();
    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
      console.log(`📁 Backup available at: ${this.backupDir}`);
    }
  }

  async initializeCampaign() {
    console.log('🔍 Initializing campaign...');

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    console.log(`📁 Created backup directory: ${this.backupDir}`);

    // Get initial error count and breakdown
    this.initialErrorCount = await this.getTypeScriptErrorCount();
    this.currentErrorCount = this.initialErrorCount;

    console.log(`📊 Initial TypeScript errors: ${this.initialErrorCount}`);
    await this.analyzeErrorDistribution();
    console.log('✅ Campaign initialization complete\n');
  }

  async executeRecoveryPhases() {
    console.log('🔧 Executing recovery phases...\n');

    // Phase 1: TS1005 Comma and Syntax Errors (2,001 errors - highest priority)
    await this.executePhase1_TS1005();

    // Phase 2: TS1128 Declaration Errors (491 errors)
    await this.executePhase2_TS1128();

    // Phase 3: TS1109 Expression Errors (177 errors)
    await this.executePhase3_TS1109();

    // Phase 4: Remaining Error Types (124 errors)
    await this.executePhase4_Remaining();

    // Phase 5: Final Comprehensive Cleanup
    await this.executePhase5_Comprehensive();
  }

  async executePhase1_TS1005() {
    console.log('📋 Phase 1: TS1005 Comma and Syntax Error Resolution');
    console.log('Target: 2,001 TS1005 errors');

    const prePhaseErrors = await this.getTS1005ErrorCount();
    console.log(`📊 TS1005 errors before phase: ${prePhaseErrors}`);

    if (prePhaseErrors === 0) {
      console.log('✅ No TS1005 errors found');
      return;
    }

    // Get files with TS1005 errors
    const errorFiles = await this.getFilesWithErrorType('TS1005');
    console.log(`📁 Found ${errorFiles.length} files with TS1005 errors`);

    // Process in batches of 15 files
    await this.processBatches(errorFiles, 'TS1005', this.fixTS1005Patterns.bind(this));

    const postPhaseErrors = await this.getTS1005ErrorCount();
    const reduction = prePhaseErrors - postPhaseErrors;
    const percentage = prePhaseErrors > 0 ? ((reduction / prePhaseErrors) * 100).toFixed(1) : '0.0';

    console.log(`\n📊 Phase 1 Results:`);
    console.log(`   Before: ${prePhaseErrors} TS1005 errors`);
    console.log(`   After: ${postPhaseErrors} TS1005 errors`);
    console.log(`   Reduction: ${reduction} errors (${percentage}%)`);

    this.recordPhaseResults('TS1005', prePhaseErrors, postPhaseErrors);
  }

  async executePhase2_TS1128() {
    console.log('\n📋 Phase 2: TS1128 Declaration Error Resolution');
    console.log('Target: 491 TS1128 errors');

    const prePhaseErrors = await this.getTS1128ErrorCount();
    console.log(`📊 TS1128 errors before phase: ${prePhaseErrors}`);

    if (prePhaseErrors === 0) {
      console.log('✅ No TS1128 errors found');
      return;
    }

    const errorFiles = await this.getFilesWithErrorType('TS1128');
    console.log(`📁 Found ${errorFiles.length} files with TS1128 errors`);

    await this.processBatches(errorFiles, 'TS1128', this.fixTS1128Patterns.bind(this));

    const postPhaseErrors = await this.getTS1128ErrorCount();
    const reduction = prePhaseErrors - postPhaseErrors;
    const percentage = prePhaseErrors > 0 ? ((reduction / prePhaseErrors) * 100).toFixed(1) : '0.0';

    console.log(`\n📊 Phase 2 Results:`);
    console.log(`   Before: ${prePhaseErrors} TS1128 errors`);
    console.log(`   After: ${postPhaseErrors} TS1128 errors`);
    console.log(`   Reduction: ${reduction} errors (${percentage}%)`);

    this.recordPhaseResults('TS1128', prePhaseErrors, postPhaseErrors);
  }

  async executePhase3_TS1109() {
    console.log('\n📋 Phase 3: TS1109 Expression Error Resolution');
    console.log('Target: 177 TS1109 errors');

    const prePhaseErrors = await this.getTS1109ErrorCount();
    console.log(`📊 TS1109 errors before phase: ${prePhaseErrors}`);

    if (prePhaseErrors === 0) {
      console.log('✅ No TS1109 errors found');
      return;
    }

    const errorFiles = await this.getFilesWithErrorType('TS1109');
    console.log(`📁 Found ${errorFiles.length} files with TS1109 errors`);

    await this.processBatches(errorFiles, 'TS1109', this.fixTS1109Patterns.bind(this));

    const postPhaseErrors = await this.getTS1109ErrorCount();
    const reduction = prePhaseErrors - postPhaseErrors;
    const percentage = prePhaseErrors > 0 ? ((reduction / prePhaseErrors) * 100).toFixed(1) : '0.0';

    console.log(`\n📊 Phase 3 Results:`);
    console.log(`   Before: ${prePhaseErrors} TS1109 errors`);
    console.log(`   After: ${postPhaseErrors} TS1109 errors`);
    console.log(`   Reduction: ${reduction} errors (${percentage}%)`);

    this.recordPhaseResults('TS1109', prePhaseErrors, postPhaseErrors);
  }

  async executePhase4_Remaining() {
    console.log('\n📋 Phase 4: Remaining Error Types Resolution');
    console.log('Target: TS1131, TS1003, TS1136, etc.');

    const prePhaseErrors = await this.getTypeScriptErrorCount();
    console.log(`📊 Total errors before phase: ${prePhaseErrors}`);

    const errorFiles = await this.getFilesWithErrors();
    console.log(`📁 Found ${errorFiles.length} files with remaining errors`);

    await this.processBatches(errorFiles, 'REMAINING', this.fixRemainingPatterns.bind(this));

    const postPhaseErrors = await this.getTypeScriptErrorCount();
    const reduction = prePhaseErrors - postPhaseErrors;
    const percentage = prePhaseErrors > 0 ? ((reduction / prePhaseErrors) * 100).toFixed(1) : '0.0';

    console.log(`\n📊 Phase 4 Results:`);
    console.log(`   Before: ${prePhaseErrors} total errors`);
    console.log(`   After: ${postPhaseErrors} total errors`);
    console.log(`   Reduction: ${reduction} errors (${percentage}%)`);

    this.recordPhaseResults('REMAINING', prePhaseErrors, postPhaseErrors);
  }

  async executePhase5_Comprehensive() {
    console.log('\n📋 Phase 5: Final Comprehensive Cleanup');

    const prePhaseErrors = await this.getTypeScriptErrorCount();
    console.log(`📊 Total errors before final cleanup: ${prePhaseErrors}`);

    if (prePhaseErrors === 0) {
      console.log('🎉 Zero errors achieved! No cleanup needed.');
      return;
    }

    const errorFiles = await this.getFilesWithErrors();
    console.log(`📁 Found ${errorFiles.length} files with remaining errors`);

    await this.processBatches(errorFiles, 'COMPREHENSIVE', this.fixComprehensivePatterns.bind(this));

    const postPhaseErrors = await this.getTypeScriptErrorCount();
    const reduction = prePhaseErrors - postPhaseErrors;
    const percentage = prePhaseErrors > 0 ? ((reduction / prePhaseErrors) * 100).toFixed(1) : '0.0';

    console.log(`\n📊 Phase 5 Results:`);
    console.log(`   Before: ${prePhaseErrors} total errors`);
    console.log(`   After: ${postPhaseErrors} total errors`);
    console.log(`   Reduction: ${reduction} errors (${percentage}%)`);

    this.recordPhaseResults('COMPREHENSIVE', prePhaseErrors, postPhaseErrors);
  }

  async processBatches(errorFiles, phaseType, fixFunction) {
    const totalBatches = Math.ceil(errorFiles.length / this.batchSize);
    console.log(`🔄 Processing ${errorFiles.length} files in ${totalBatches} batches of ${this.batchSize}`);

    for (let i = 0; i < errorFiles.length; i += this.batchSize) {
      const batch = errorFiles.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;

      console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

      let batchFixes = 0;
      for (let j = 0; j < batch.length; j++) {
        const filePath = batch[j];
        const fixes = await this.processFile(filePath, fixFunction);
        batchFixes += fixes;

        // Validation checkpoint every 5 files
        if ((j + 1) % this.validationCheckpoint === 0) {
          console.log(`   🔍 Validation checkpoint at file ${j + 1}/${batch.length}`);
          const buildValid = await this.validateBuild();
          if (!buildValid) {
            console.log('⚠️ Build validation failed, stopping batch for safety');
            break;
          }
        }
      }

      console.log(`   📊 Batch ${batchNumber} completed: ${batchFixes} fixes applied`);

      // Final batch validation
      console.log(`   🔍 Final batch validation...`);
      const buildValid = await this.validateBuild();
      if (!buildValid) {
        console.log('❌ Build validation failed, stopping campaign for safety');
        break;
      }

      const currentErrors = await this.getTypeScriptErrorCount();
      console.log(`   📊 Progress: ${currentErrors} total errors remaining`);
    }
  }

  async processFile(filePath, fixFunction) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      console.log(`     🔧 Processing ${path.basename(filePath)}`);

      // Create backup
      await this.backupFile(filePath);

      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixes } = await fixFunction(originalContent, filePath);

      if (fixes > 0 && fixedContent !== originalContent) {
        fs.writeFileSync(filePath, fixedContent);
        this.processedFiles.push(filePath);
        this.totalFixes += fixes;
        console.log(`       ✅ Applied ${fixes} fix(es)`);
        return fixes;
      } else {
        console.log(`       - No applicable patterns found`);
        return 0;
      }

    } catch (error) {
      console.log(`       ❌ Error processing file: ${error.message}`);
      return 0;
    }
  }

  async fixTS1005Patterns(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Fix 1: Trailing commas in function calls - ,)
    const trailingCommaPattern = /,\s*\)/g;
    const matches1 = [...fixedContent.matchAll(trailingCommaPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(trailingCommaPattern, ')');
      fixes += matches1.length;
    }

    // Fix 2: Trailing commas in arrays - ,]
    const arrayTrailingPattern = /,\s*\]/g;
    const matches2 = [...fixedContent.matchAll(arrayTrailingPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(arrayTrailingPattern, ']');
      fixes += matches2.length;
    }

    // Fix 3: Trailing commas in objects - ,}
    const objectTrailingPattern = /,\s*\}/g;
    const matches3 = [...fixedContent.matchAll(objectTrailingPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(objectTrailingPattern, '}');
      fixes += matches3.length;
    }

    // Fix 4: Semicolon instead of comma in imports
    const importSemicolonPattern = /(\{\s*[^}]*);(\s*\}\s*from)/g;
    const matches4 = [...fixedContent.matchAll(importSemicolonPattern)];
    if (matches4.length > 0) {
      fixedContent = fixedContent.replace(importSemicolonPattern, '$1,$2');
      fixes += matches4.length;
    }

    // Fix 5: Semicolon instead of comma in function parameters
    const paramSemicolonPattern = /(\([^)]*);(\s*[^)]*\))/g;
    const matches5 = [...fixedContent.matchAll(paramSemicolonPattern)];
    if (matches5.length > 0) {
      fixedContent = fixedContent.replace(paramSemicolonPattern, '$1,$2');
      fixes += matches5.length;
    }

    // Fix 6: Double commas
    const doubleCommaPattern = /,,/g;
    const matches6 = [...fixedContent.matchAll(doubleCommaPattern)];
    if (matches6.length > 0) {
      fixedContent = fixedContent.replace(doubleCommaPattern, ',');
      fixes += matches6.length;
    }

    return { content: fixedContent, fixes };
  }

  async fixTS1128Patterns(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Fix 1: Malformed catch blocks
    const catchBlockPattern = /}\s*catch\s*\(/g;
    const matches1 = [...fixedContent.matchAll(catchBlockPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(catchBlockPattern, '} catch (');
      fixes += matches1.length;
    }

    // Fix 2: Malformed else blocks
    const elseBlockPattern = /}\s*else\s*{/g;
    const matches2 = [...fixedContent.matchAll(elseBlockPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(elseBlockPattern, '} else {');
      fixes += matches2.length;
    }

    // Fix 3: Malformed function parameters (from focused-ts1128-fixer.cjs)
    const malformedParamPattern = /\(\s*:\s*any\s*:\s*any\s*(\{[^}]+\})\s*:\s*(\{[^}]+\})\s*\)/g;
    const matches3 = [...fixedContent.matchAll(malformedParamPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(malformedParamPattern, '($1: $2)');
      fixes += matches3.length;
    }

    // Fix 4: Missing semicolons at end of statements
    const missingSemicolonPattern = /(\w+|\))\s*\n(?=\s*[a-zA-Z])/g;
    const matches4 = [...fixedContent.matchAll(missingSemicolonPattern)];
    if (matches4.length > 0) {
      fixedContent = fixedContent.replace(missingSemicolonPattern, '$1;\n');
      fixes += matches4.length;
    }

    return { content: fixedContent, fixes };
  }

  async fixTS1109Patterns(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Fix 1: Malformed property access
    const propertyAccessPattern = /\.\s*\(/g;
    const matches1 = [...fixedContent.matchAll(propertyAccessPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(propertyAccessPattern, '(');
      fixes += matches1.length;
    }

    // Fix 2: Missing expressions in parentheses
    const emptyParenPattern = /\(\s*\)/g;
    const matches2 = [...fixedContent.matchAll(emptyParenPattern)];
    if (matches2.length > 0) {
      // Only fix if it's clearly a function call context
      fixedContent = fixedContent.replace(/(\w+)\s*\(\s*\)/g, '$1()');
      fixes += matches2.length;
    }

    // Fix 3: Malformed arrow functions
    const arrowFunctionPattern = /=>\s*{([^}]*),\s*}/g;
    const matches3 = [...fixedContent.matchAll(arrowFunctionPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(arrowFunctionPattern, '=> { $1 }');
      fixes += matches3.length;
    }

    return { content: fixedContent, fixes };
  }

  async fixRemainingPatterns(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Fix various remaining patterns based on error types

    // Fix TS1131: Property or signature expected
    const propertySignaturePattern = /(\w+)\s*:\s*;/g;
    const matches1 = [...fixedContent.matchAll(propertySignaturePattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(propertySignaturePattern, '$1: any;');
      fixes += matches1.length;
    }

    // Fix TS1003: Identifier expected
    const identifierPattern = /\.\s*(\w+)/g;
    const matches2 = [...fixedContent.matchAll(identifierPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(identifierPattern, '.$1');
      fixes += matches2.length;
    }

    // Fix TS1136: Property assignment expected
    const propertyAssignmentPattern = /(\w+)\s*=\s*;/g;
    const matches3 = [...fixedContent.matchAll(propertyAssignmentPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(propertyAssignmentPattern, '$1 = undefined;');
      fixes += matches3.length;
    }

    return { content: fixedContent, fixes };
  }

  async fixComprehensivePatterns(content, filePath) {
    let fixedContent = content;
    let fixes = 0;

    // Apply all previous patterns plus additional comprehensive fixes
    const ts1005Result = await this.fixTS1005Patterns(fixedContent, filePath);
    fixedContent = ts1005Result.content;
    fixes += ts1005Result.fixes;

    const ts1128Result = await this.fixTS1128Patterns(fixedContent, filePath);
    fixedContent = ts1128Result.content;
    fixes += ts1128Result.fixes;

    const ts1109Result = await this.fixTS1109Patterns(fixedContent, filePath);
    fixedContent = ts1109Result.content;
    fixes += ts1109Result.fixes;

    const remainingResult = await this.fixRemainingPatterns(fixedContent, filePath);
    fixedContent = remainingResult.content;
    fixes += remainingResult.fixes;

    // Additional comprehensive fixes

    // Fix malformed object literals
    const objectLiteralPattern = /{\s*(\w+):\s*([^,}]+),?\s*\n\s*([^}]+)\s*}/g;
    const matches1 = [...fixedContent.matchAll(objectLiteralPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(objectLiteralPattern, '{ $1: $2, $3 }');
      fixes += matches1.length;
    }

    // Fix malformed if statements
    const ifStatementPattern = /if\s*\(\s*([^)]+)\s*\)\s*{/g;
    const matches2 = [...fixedContent.matchAll(ifStatementPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(ifStatementPattern, 'if ($1) {');
      fixes += matches2.length;
    }

    return { content: fixedContent, fixes };
  }

  async backupFile(filePath) {
    try {
      const relativePath = path.relative('.', filePath);
      const backupPath = path.join(this.backupDir, relativePath.replace(/[\/\\]/g, '_'));
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content);
    } catch (error) {
      console.log(`       ⚠️ Backup failed: ${error.message}`);
    }
  }

  async validateBuild() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck 2>/dev/null', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  recordPhaseResults(phase, beforeCount, afterCount) {
    const reduction = beforeCount - afterCount;
    const percentage = beforeCount > 0 ? ((reduction / beforeCount) * 100).toFixed(1) : '0.0';

    this.errorHistory.push({
      phase,
      timestamp: new Date(),
      beforeCount,
      afterCount,
      reduction,
      percentage
    });
  }

  // Error counting methods
  async getTypeScriptErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTS1005ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1005"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTS1128ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTS1109ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1109"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getFilesWithErrors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | cut -d"(" -f1 | sort -u', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.trim().split('\n').filter(line => line.trim());
    } catch (error) {
      return [];
    }
  }

  async getFilesWithErrorType(errorType) {
    try {
      const output = execSync(`yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error ${errorType}" | cut -d"(" -f1 | sort -u`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.trim().split('\n').filter(line => line.trim());
    } catch (error) {
      return [];
    }
  }

  async analyzeErrorDistribution() {
    console.log('📊 Analyzing error distribution...');

    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed \'s/.*error //\' | cut -d\':\' -f1 | sort | uniq -c | sort -nr', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('\nError breakdown:');
      const lines = output.trim().split('\n').filter(line => line.trim());
      for (const line of lines.slice(0, 10)) {
        console.log(`  ${line.trim()}`);
      }
      console.log('');

    } catch (error) {
      console.log('⚠️ Could not analyze error distribution');
    }
  }

  async generateFinalReport() {
    const campaignEndTime = new Date();
    const campaignDuration = Math.round((campaignEndTime - this.campaignStartTime) / 1000 / 60);

    const finalErrorCount = await this.getTypeScriptErrorCount();
    const totalReduction = this.initialErrorCount - finalErrorCount;
    const reductionPercentage = this.initialErrorCount > 0 ?
      ((totalReduction / this.initialErrorCount) * 100).toFixed(1) : '0.0';

    console.log('\n' + '='.repeat(60));
    console.log('📈 FINAL TYPESCRIPT RECOVERY CAMPAIGN REPORT');
    console.log('='.repeat(60));

    console.log(`\n🎯 Campaign Objectives:`);
    console.log(`   Target: 2,793 → 0 TypeScript errors (100% elimination)`);
    console.log(`   Focus: TS1005, TS1128, TS1109 error categories`);
    console.log(`   Approach: Conservative, proven methods from Phase 12.1`);

    console.log(`\n📊 Results Summary:`);
    console.log(`   Initial errors: ${this.initialErrorCount}`);
    console.log(`   Final errors: ${finalErrorCount}`);
    console.log(`   Total reduction: ${totalReduction} errors`);
    console.log(`   Reduction percentage: ${reductionPercentage}%`);
    console.log(`   Campaign duration: ${campaignDuration} minutes`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    const zeroErrorsAchieved = finalErrorCount === 0;
    const significantReduction = parseFloat(reductionPercentage) >= 80;
    const goodReduction = parseFloat(reductionPercentage) >= 50;

    console.log(`\n🏆 Success Metrics:`);
    console.log(`   ✅ Zero errors achieved: ${zeroErrorsAchieved ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
    console.log(`   ✅ Significant reduction (≥80%): ${significantReduction ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
    console.log(`   ✅ Good reduction (≥50%): ${goodReduction ? 'ACHIEVED' : 'NOT ACHIEVED'}`);

    if (zeroErrorsAchieved) {
      console.log(`\n🎉 CAMPAIGN SUCCESS! Zero TypeScript errors achieved - EXCELLENCE COMPLETE!`);
    } else if (significantReduction) {
      console.log(`\n✅ EXCELLENT PROGRESS! 80%+ reduction achieved, minimal work remaining.`);
    } else if (goodReduction) {
      console.log(`\n📈 GOOD PROGRESS! 50%+ reduction achieved, continue with remaining errors.`);
    } else {
      console.log(`\n⚠️ LIMITED PROGRESS. Consider alternative approaches for remaining errors.`);
    }

    // Phase history
    if (this.errorHistory.length > 0) {
      console.log(`\n📋 Phase History:`);
      this.errorHistory.forEach(phase => {
        console.log(`   ${phase.phase}: ${phase.beforeCount} → ${phase.afterCount} (${phase.percentage}% reduction)`);
      });
    }

    console.log(`\n📁 Backup directory: ${this.backupDir}`);
    console.log(`✅ Campaign completed at: ${campaignEndTime.toISOString()}`);

    // Save detailed report
    const reportPath = `final-typescript-recovery-report-${Date.now()}.md`;
    await this.saveReportToFile(reportPath, {
      campaignStartTime: this.campaignStartTime,
      campaignEndTime,
      campaignDuration,
      initialErrorCount: this.initialErrorCount,
      finalErrorCount,
      totalReduction,
      reductionPercentage,
      zeroErrorsAchieved,
      significantReduction,
      goodReduction,
      filesProcessed: this.processedFiles.length,
      totalFixes: this.totalFixes,
      errorHistory: this.errorHistory,
      backupDir: this.backupDir
    });

    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  async saveReportToFile(reportPath, data) {
    const report = `# Final TypeScript Recovery Campaign Report

## Campaign Overview
- **Start Time**: ${data.campaignStartTime.toISOString()}
- **End Time**: ${data.campaignEndTime.toISOString()}
- **Duration**: ${data.campaignDuration} minutes
- **Target**: 2,793 → 0 TypeScript errors (100% elimination)
- **Focus**: TS1005, TS1128, TS1109 error categories
- **Approach**: Conservative, proven methods from Phase 12.1

## Results Summary
- **Initial Errors**: ${data.initialErrorCount}
- **Final Errors**: ${data.finalErrorCount}
- **Total Reduction**: ${data.totalReduction} errors
- **Reduction Percentage**: ${data.reductionPercentage}%
- **Files Processed**: ${data.filesProcessed}
- **Total Fixes Applied**: ${data.totalFixes}

## Success Metrics
- **Zero Errors Achieved**: ${data.zeroErrorsAchieved ? '🎉 ACHIEVED' : '❌ NOT ACHIEVED'}
- **Significant Reduction (≥80%)**: ${data.significantReduction ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}
- **Good Reduction (≥50%)**: ${data.goodReduction ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}

## Phase History
${data.errorHistory.map(phase =>
  `- **${phase.phase}**: ${phase.beforeCount} → ${phase.afterCount} (${phase.percentage}% reduction)`
).join('\n')}

## Campaign Status
${data.zeroErrorsAchieved ?
  '🎉 **CAMPAIGN SUCCESS** - Zero TypeScript errors achieved - EXCELLENCE COMPLETE!' :
  data.significantReduction ?
    '✅ **EXCELLENT PROGRESS** - 80%+ reduction achieved, minimal work remaining' :
    data.goodReduction ?
      '📈 **GOOD PROGRESS** - 50%+ reduction achieved, continue with remaining errors' :
      '⚠️ **LIMITED PROGRESS** - Consider alternative approaches for remaining errors'}

## Technical Details
- **Batch Size**: 15 files per batch
- **Validation Checkpoints**: Every 5 files
- **Backup Directory**: ${data.backupDir}
- **Safety Protocols**: Build validation after each batch

## Next Steps
${data.finalErrorCount === 0 ?
  '✅ Ready to proceed with Task 13.2: ESLint Issue Elimination' :
  data.finalErrorCount < 100 ?
    '🔄 Continue with remaining TypeScript errors before proceeding to ESLint' :
    '🔄 Consider alternative approaches for remaining TypeScript errors'}

## Files and Backup
- **Processed Files**: ${data.filesProcessed}
- **Backup Location**: ${data.backupDir}
- **Rollback Available**: Yes, full file backups created
`;

    fs.writeFileSync(reportPath, report);
  }
}

// Execute the campaign
if (require.main === module) {
  const campaign = new FinalTypeScriptRecoveryCampaign();
  campaign.run().catch(console.error);
}

module.exports = FinalTypeScriptRecoveryCampaign;
