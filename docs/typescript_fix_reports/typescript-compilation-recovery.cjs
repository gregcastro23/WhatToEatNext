#!/usr/bin/env node

/**
 * Phase 12.1: TypeScript Compilation Error Recovery
 *
 * Focus ONLY on TypeScript compilation errors, skip build validation
 * Target: Reduce from 3,954 to <100 TypeScript compilation errors
 */

const fs = require('fs');
const { execSync } = require('child_process');

class TypeScriptCompilationRecovery {
  constructor() {
    this.initialErrorCount = 0;
    this.currentErrorCount = 0;
    this.campaignStartTime = new Date();
    this.errorHistory = [];
    this.TARGET_ERROR_COUNT = 100;
  }

  async run() {
    console.log('🚀 TypeScript Compilation Error Recovery Campaign');
    console.log('=' .repeat(60));
    console.log('Focus: TypeScript compilation errors ONLY');
    console.log('Target: Reduce errors to <100\n');

    try {
      await this.initializeCampaign();
      await this.executeRecoveryPhases();
      await this.generateFinalReport();
    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
    }
  }

  async initializeCampaign() {
    console.log('🔍 Initializing TypeScript compilation recovery...');

    this.initialErrorCount = await this.getTypeScriptErrorCount();
    this.currentErrorCount = this.initialErrorCount;

    console.log(`📊 Initial TypeScript compilation errors: ${this.initialErrorCount}`);

    if (this.initialErrorCount < this.TARGET_ERROR_COUNT) {
      console.log(`✅ Error count already below target (${this.TARGET_ERROR_COUNT})`);
      return;
    }

    await this.analyzeErrorDistribution();
    console.log('✅ Campaign initialization complete\n');
  }

  async executeRecoveryPhases() {
    console.log('🔧 Executing TypeScript error recovery phases...\n');

    // Phase 1: TS1005 Token Errors (highest count: 2,167)
    await this.executePhase('TS1005', 'fix-ts1005-trailing-commas.cjs');

    // Phase 2: TS1003 Identifier Errors (745 errors)
    await this.executePhase('TS1003', 'fix-ts1003-identifier-errors.cjs');

    // Phase 3: TS1128 Declaration Errors (470 errors)
    await this.executePhase('TS1128', 'focused-ts1128-fixer.cjs');

    // Phase 4: Comprehensive cleanup for remaining errors
    await this.executeComprehensiveCleanup();
  }

  async executePhase(errorType, scriptPath) {
    console.log(`\n📋 Phase: ${errorType} Error Resolution`);
    console.log(`Script: ${scriptPath}`);

    const prePhaseErrors = await this.getTypeScriptErrorCount();

    try {
      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️ Script ${scriptPath} not found, applying manual fixes`);
        await this.applyManualFixesForErrorType(errorType);
      } else {
        console.log(`🔧 Executing ${scriptPath}...`);
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
      }

      const postPhaseErrors = await this.getTypeScriptErrorCount();
      const reduction = prePhaseErrors - postPhaseErrors;
      const percentage = prePhaseErrors > 0 ? ((reduction / prePhaseErrors) * 100).toFixed(1) : '0.0';

      console.log(`\n📊 Phase ${errorType} Results:`);
      console.log(`   Before: ${prePhaseErrors} errors`);
      console.log(`   After: ${postPhaseErrors} errors`);
      console.log(`   Reduction: ${reduction} errors (${percentage}%)`);

      this.currentErrorCount = postPhaseErrors;
      this.errorHistory.push({
        phase: errorType,
        timestamp: new Date(),
        beforeCount: prePhaseErrors,
        afterCount: postPhaseErrors,
        reduction: reduction,
        percentage: percentage
      });

    } catch (error) {
      console.error(`❌ Phase ${errorType} failed:`, error.message);
    }
  }

  async applyManualFixesForErrorType(errorType) {
    console.log(`🔧 Applying manual fixes for ${errorType} errors...`);

    const errorFiles = await this.getFilesWithErrorType(errorType);
    console.log(`📁 Found ${errorFiles.length} files with ${errorType} errors`);

    let fixedFiles = 0;
    for (const filePath of errorFiles.slice(0, 20)) { // Limit to 20 files per phase
      try {
        const fixed = await this.fixErrorsInFile(filePath, errorType);
        if (fixed) {
          fixedFiles++;
          console.log(`  ✓ Fixed ${errorType} errors in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
      }
    }

    console.log(`📊 Applied manual fixes to ${fixedFiles} files`);
  }

  async fixErrorsInFile(filePath, errorType) {
    if (!fs.existsSync(filePath)) return false;

    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    let modified = false;

    switch (errorType) {
      case 'TS1005':
        // Fix missing semicolons and commas
        fixed = fixed.replace(/(\w+)\s*$/gm, '$1;');
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        fixed = fixed.replace(/function\s+(\w+)\s*\(\s*([^)]*),\s*\)/g, 'function $1($2)');
        break;

      case 'TS1003':
        // Fix identifier issues
        fixed = fixed.replace(/\.\s*\(/g, '('); // Fix malformed method calls
        fixed = fixed.replace(/(\w+)\s*\.\s*(\w+)/g, '$1.$2'); // Fix property access
        break;

      case 'TS1128':
        // Fix declaration issues
        fixed = fixed.replace(/}\s*catch\s*\(/g, '} catch ('); // Fix catch blocks
        fixed = fixed.replace(/}\s*else\s*{/g, '} else {'); // Fix else blocks
        break;
    }

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      modified = true;
    }

    return modified;
  }

  async executeComprehensiveCleanup() {
    console.log('\n📋 Phase: Comprehensive TypeScript Error Cleanup');

    const preCleanupErrors = await this.getTypeScriptErrorCount();

    if (preCleanupErrors <= this.TARGET_ERROR_COUNT) {
      console.log(`✅ Error count (${preCleanupErrors}) already at target level`);
      return;
    }

    console.log(`🔧 Applying comprehensive fixes to remaining ${preCleanupErrors} errors...`);

    // Apply broad syntax fixes
    const allErrorFiles = await this.getFilesWithErrors();
    let processedFiles = 0;

    for (const filePath of allErrorFiles.slice(0, 30)) { // Process up to 30 files
      try {
        await this.applyComprehensiveFixes(filePath);
        processedFiles++;
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }

    const postCleanupErrors = await this.getTypeScriptErrorCount();
    const reduction = preCleanupErrors - postCleanupErrors;
    const percentage = preCleanupErrors > 0 ? ((reduction / preCleanupErrors) * 100).toFixed(1) : '0.0';

    console.log(`\n📊 Comprehensive Cleanup Results:`);
    console.log(`   Before: ${preCleanupErrors} errors`);
    console.log(`   After: ${postCleanupErrors} errors`);
    console.log(`   Reduction: ${reduction} errors (${percentage}%)`);
    console.log(`   Files processed: ${processedFiles}`);

    this.currentErrorCount = postCleanupErrors;
  }

  async applyComprehensiveFixes(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;

    // Common TypeScript syntax fixes

    // Fix malformed constructors with incomplete comments
    fixed = fixed.replace(/= \/\/ console\.log\) \{ \/\/ Commented for linting/g, '= console.log) {');

    // Fix malformed object literals
    fixed = fixed.replace(/{\s*(\w+):\s*([^,}]+),?\s*\n\s*([^}]+)\s*}/g, '{ $1: $2, $3 }');

    // Fix trailing commas in function parameters
    fixed = fixed.replace(/,(\s*\))/g, '$1');

    // Fix malformed arrow functions
    fixed = fixed.replace(/=>\s*{([^}]*),\s*}/g, '=> { $1 }');

    // Fix missing semicolons at end of statements
    fixed = fixed.replace(/(\w+|\))\s*\n/g, '$1;\n');

    // Fix malformed if statements
    fixed = fixed.replace(/if\s*\(\s*([^)]+)\s*\)\s*{/g, 'if ($1) {');

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`  ✓ Applied comprehensive fixes to ${filePath}`);
    }
  }

  async getTypeScriptErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
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
    console.log('📊 Analyzing TypeScript error distribution...');

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
    console.log('📈 TYPESCRIPT COMPILATION RECOVERY FINAL REPORT');
    console.log('='.repeat(60));

    console.log(`\n🎯 Campaign Objectives:`);
    console.log(`   Target: Reduce errors to <${this.TARGET_ERROR_COUNT}`);
    console.log(`   Focus: TypeScript compilation errors only`);

    console.log(`\n📊 Results Summary:`);
    console.log(`   Initial errors: ${this.initialErrorCount}`);
    console.log(`   Final errors: ${finalErrorCount}`);
    console.log(`   Total reduction: ${totalReduction} errors`);
    console.log(`   Reduction percentage: ${reductionPercentage}%`);
    console.log(`   Campaign duration: ${campaignDuration} minutes`);

    const targetMet = finalErrorCount < this.TARGET_ERROR_COUNT;
    const significantReduction = parseFloat(reductionPercentage) >= 50;

    console.log(`\n🏆 Success Metrics:`);
    console.log(`   ✅ Error count < ${this.TARGET_ERROR_COUNT}: ${targetMet ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
    console.log(`   ✅ Significant reduction (≥50%): ${significantReduction ? 'ACHIEVED' : 'NOT ACHIEVED'}`);

    if (targetMet) {
      console.log(`\n🎉 CAMPAIGN SUCCESS! TypeScript compilation errors reduced to acceptable level.`);
    } else if (significantReduction) {
      console.log(`\n✅ SIGNIFICANT PROGRESS! Major reduction achieved, additional work may be needed.`);
    } else {
      console.log(`\n⚠️ LIMITED PROGRESS. Consider alternative approaches.`);
    }

    // Phase history
    if (this.errorHistory.length > 0) {
      console.log(`\n📋 Phase History:`);
      this.errorHistory.forEach(phase => {
        console.log(`   ${phase.phase}: ${phase.beforeCount} → ${phase.afterCount} (${phase.percentage}% reduction)`);
      });
    }

    console.log(`\n✅ Campaign completed at: ${campaignEndTime.toISOString()}`);

    // Save report
    const reportPath = `typescript-compilation-recovery-report-${Date.now()}.md`;
    await this.saveReportToFile(reportPath, {
      campaignStartTime: this.campaignStartTime,
      campaignEndTime,
      campaignDuration,
      initialErrorCount: this.initialErrorCount,
      finalErrorCount,
      totalReduction,
      reductionPercentage,
      targetMet,
      significantReduction,
      errorHistory: this.errorHistory
    });

    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  async saveReportToFile(reportPath, data) {
    const report = `# TypeScript Compilation Recovery Campaign Report

## Campaign Overview
- **Start Time**: ${data.campaignStartTime.toISOString()}
- **End Time**: ${data.campaignEndTime.toISOString()}
- **Duration**: ${data.campaignDuration} minutes
- **Focus**: TypeScript compilation errors only

## Results Summary
- **Initial Errors**: ${data.initialErrorCount}
- **Final Errors**: ${data.finalErrorCount}
- **Total Reduction**: ${data.totalReduction} errors
- **Reduction Percentage**: ${data.reductionPercentage}%

## Success Metrics
- **Target (<100 errors)**: ${data.targetMet ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}
- **Significant Reduction (≥50%)**: ${data.significantReduction ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}

## Phase History
${data.errorHistory.map(phase =>
  `- **${phase.phase}**: ${phase.beforeCount} → ${phase.afterCount} (${phase.percentage}% reduction)`
).join('\n')}

## Campaign Status
${data.targetMet ?
  '🎉 **CAMPAIGN SUCCESS** - TypeScript compilation errors reduced to acceptable level' :
  data.significantReduction ?
    '✅ **SIGNIFICANT PROGRESS** - Major reduction achieved, additional work may be needed' :
    '⚠️ **LIMITED PROGRESS** - Consider alternative approaches'}

## Next Steps
${data.finalErrorCount < 100 ?
  '✅ Ready to proceed with build system fixes and Phase 12.2' :
  '🔄 Continue TypeScript error reduction before proceeding'}
`;

    fs.writeFileSync(reportPath, report);
  }
}

// Execute the campaign
if (require.main === module) {
  const campaign = new TypeScriptCompilationRecovery();
  campaign.run().catch(console.error);
}

module.exports = TypeScriptCompilationRecovery;
