#!/usr/bin/env node

/**
 * Targeted Consolidation Campaign with Enhanced Safety Protocols
 *
 * Processes high-confidence patterns with proven infrastructure,
 * applies contextual analysis, and targets 30-50 warnings for elimination.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TargetedConsolidationCampaign {
  constructor() {
    this.campaignResults = {
      startTime: new Date(),
      totalProcessed: 0,
      successfulFixes: 0,
      failedAttempts: 0,
      rollbacks: 0,
      filesModified: [],
      safetyEvents: [],
      patternResults: new Map(),
      buildStability: true
    };

    this.safetyProtocols = {
      maxFilesPerBatch: 5,
      maxAttemptsPerFile: 3,
      buildValidationFrequency: 3,
      backupRetentionHours: 24,
      rollbackOnFirstFailure: true
    };

    this.highConfidencePatterns = [
      {
        name: 'arrayTypes',
        pattern: /:\s*any\[\]/g,
        replacement: ': unknown[]',
        safetyLevel: 'high',
        priority: 1
      },
      {
        name: 'recordTypes',
        pattern: /Record<([^,>]+),\s*any>/g,
        replacement: 'Record<$1, unknown>',
        safetyLevel: 'high',
        priority: 1
      },
      {
        name: 'variableDeclarations',
        pattern: /:\s*any\s*=/g,
        replacement: ': unknown =',
        safetyLevel: 'medium',
        priority: 2
      },
      {
        name: 'simpleTypeAssertions',
        pattern: /as\s+any(?!\[|\.|<)/g,
        replacement: 'as unknown',
        safetyLevel: 'medium',
        priority: 3
      }
    ];
  }

  async executeConsolidationCampaign() {
    console.log('🎯 Starting Targeted Consolidation Campaign...');
    console.log(`📋 Target: 30-50 warnings elimination with enhanced safety protocols`);

    try {
      // Load analysis data
      const analysisData = await this.loadAnalysisData();

      // Create enhanced backup
      await this.createEnhancedBackup();

      // Process high-confidence patterns
      await this.processHighConfidencePatterns(analysisData);

      // Apply contextual analysis
      await this.applyContextualAnalysis(analysisData);

      // Process domain-specific files
      await this.processDomainSpecificFiles(analysisData);

      // Final validation and reporting
      await this.performFinalValidation();

      console.log('✅ Targeted consolidation campaign completed successfully!');

    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
      await this.performEmergencyRollback();
      throw error;
    }
  }

  async loadAnalysisData() {
    const analysisPath = '.kiro/specs/unintentional-any-elimination/final-consolidation-analysis-data.json';

    if (!fs.existsSync(analysisPath)) {
      throw new Error('Analysis data not found. Please run the analyzer first.');
    }

    const data = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    console.log(`📊 Loaded analysis data: ${data.totalWarnings} warnings in ${data.fileAnalysis.length} files`);

    return data;
  }

  async createEnhancedBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `.consolidation-backups-${timestamp}`;

    console.log('💾 Creating enhanced backup system...');

    try {
      // Create git stash
      execSync('git add -A && git stash push -m "Pre-consolidation-campaign backup"', {
        stdio: 'pipe'
      });

      // Create file system backup
      execSync(`mkdir -p ${backupDir}`, { stdio: 'pipe' });
      execSync(`cp -r src ${backupDir}/`, { stdio: 'pipe' });

      this.backupDir = backupDir;
      console.log(`✅ Enhanced backup created: ${backupDir}`);

    } catch (error) {
      console.warn('⚠️ Backup creation failed, proceeding with caution');
    }
  }

  async processHighConfidencePatterns(analysisData) {
    console.log('🔧 Processing high-confidence patterns...');

    // Sort patterns by priority and safety level
    const sortedPatterns = this.highConfidencePatterns
      .sort((a, b) => a.priority - b.priority);

    for (const pattern of sortedPatterns) {
      console.log(`\n🎯 Processing ${pattern.name} pattern...`);

      const targetFiles = this.getTargetFilesForPattern(analysisData, pattern);
      let processedInBatch = 0;

      for (const fileInfo of targetFiles) {
        if (this.campaignResults.successfulFixes >= 50) {
          console.log('🎯 Target of 50 fixes reached, stopping pattern processing');
          break;
        }

        if (processedInBatch >= this.safetyProtocols.maxFilesPerBatch) {
          console.log('⏸️ Batch limit reached, validating build...');
          await this.validateBuildStability();
          processedInBatch = 0;
        }

        const success = await this.processFileWithPattern(fileInfo, pattern);
        if (success) {
          processedInBatch++;
          this.campaignResults.successfulFixes++;
        }
      }

      // Update pattern results
      this.campaignResults.patternResults.set(pattern.name, {
        processed: processedInBatch,
        success: true
      });
    }
  }

  getTargetFilesForPattern(analysisData, pattern) {
    const targetFiles = [];

    for (const fileAnalysis of analysisData.fileAnalysis) {
      // Skip high-risk files for automated processing
      if (fileAnalysis.safetyLevel === 'risky') {
        continue;
      }

      // Check if file has the target pattern
      if (fileAnalysis.patterns.includes(pattern.name)) {
        targetFiles.push({
          path: fileAnalysis.path,
          warningCount: fileAnalysis.warnings.length,
          safetyLevel: fileAnalysis.safetyLevel,
          domain: fileAnalysis.domain,
          consolidationPotential: fileAnalysis.consolidationPotential || 0
        });
      }
    }

    // Sort by consolidation potential and safety level
    return targetFiles.sort((a, b) => {
      const scoreA = a.consolidationPotential * (a.safetyLevel === 'safe' ? 2 : 1);
      const scoreB = b.consolidationPotential * (b.safetyLevel === 'safe' ? 2 : 1);
      return scoreB - scoreA;
    });
  }

  async processFileWithPattern(fileInfo, pattern) {
    console.log(`  📝 Processing ${fileInfo.path}...`);

    try {
      const filePath = fileInfo.path;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`    ⏭️ File not found: ${filePath}`);
        return false;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');

      // Apply pattern replacement
      let modifiedContent = originalContent;
      let replacementCount = 0;

      modifiedContent = modifiedContent.replace(pattern.pattern, (match, ...args) => {
        // Apply contextual validation
        if (this.validateReplacement(match, filePath, fileInfo.domain)) {
          replacementCount++;
          return pattern.replacement.replace(/\$(\d+)/g, (_, num) => args[parseInt(num) - 1] || '');
        }
        return match;
      });

      if (replacementCount === 0) {
        console.log(`    ⏭️ No valid replacements found`);
        return false;
      }

      // Write modified content
      fs.writeFileSync(filePath, modifiedContent, 'utf8');

      // Validate TypeScript compilation
      const compilationValid = await this.validateTypeScriptCompilation(filePath);

      if (!compilationValid) {
        console.log(`    ❌ TypeScript compilation failed, rolling back`);
        fs.writeFileSync(filePath, originalContent, 'utf8');
        this.campaignResults.rollbacks++;
        return false;
      }

      console.log(`    ✅ Successfully processed ${replacementCount} replacements`);
      this.campaignResults.filesModified.push({
        path: filePath,
        pattern: pattern.name,
        replacements: replacementCount,
        timestamp: new Date()
      });

      return true;

    } catch (error) {
      console.log(`    ❌ Error processing file: ${error.message}`);
      this.campaignResults.failedAttempts++;
      return false;
    }
  }

  validateReplacement(match, filePath, domain) {
    // Skip replacements in comments
    if (match.includes('//') || match.includes('/*')) {
      return false;
    }

    // Skip replacements in strings
    if (match.includes('"') || match.includes("'") || match.includes('`')) {
      return false;
    }

    // Domain-specific validation
    if (domain === 'astrological') {
      // Be more conservative with astrological calculations
      if (match.includes('planetary') || match.includes('zodiac') || match.includes('lunar')) {
        return false;
      }
    }

    if (domain === 'campaign') {
      // Be careful with campaign system dynamics
      if (match.includes('metrics') || match.includes('intelligence')) {
        return false;
      }
    }

    return true;
  }

  async validateTypeScriptCompilation(filePath) {
    try {
      const result = execSync(
        `yarn tsc --noEmit --skipLibCheck ${filePath} 2>&1`,
        { encoding: 'utf8', stdio: 'pipe' }
      );

      return !result.includes('error TS');
    } catch (error) {
      return false;
    }
  }

  async applyContextualAnalysis(analysisData) {
    console.log('\n🧠 Applying contextual analysis for function parameters and return types...');

    const contextualTargets = analysisData.fileAnalysis.filter(file =>
      file.safetyLevel === 'safe' &&
      (file.patterns.includes('functionParams') || file.patterns.includes('returnTypes'))
    ).slice(0, 10); // Limit to 10 files for safety

    for (const fileInfo of contextualTargets) {
      if (this.campaignResults.successfulFixes >= 50) break;

      await this.processFileWithContextualAnalysis(fileInfo);
    }
  }

  async processFileWithContextualAnalysis(fileInfo) {
    console.log(`  🔍 Contextual analysis for ${fileInfo.path}...`);

    try {
      const filePath = fileInfo.path;

      if (!fs.existsSync(filePath)) {
        console.log(`    ⏭️ File not found: ${filePath}`);
        return false;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      let modified = false;
      const modifiedLines = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Simple function parameter analysis
        if (line.includes(': any') && (line.includes('function') || line.includes('=>'))) {
          const contextualReplacement = this.analyzeParameterContext(line, fileInfo.domain);
          if (contextualReplacement && contextualReplacement !== line) {
            line = contextualReplacement;
            modified = true;
          }
        }

        modifiedLines.push(line);
      }

      if (modified) {
        const newContent = modifiedLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');

        const compilationValid = await this.validateTypeScriptCompilation(filePath);

        if (compilationValid) {
          console.log(`    ✅ Contextual analysis successful`);
          this.campaignResults.successfulFixes++;
          return true;
        } else {
          console.log(`    ❌ Contextual analysis failed compilation, rolling back`);
          fs.writeFileSync(filePath, content, 'utf8');
          this.campaignResults.rollbacks++;
        }
      }

      return false;

    } catch (error) {
      console.log(`    ❌ Contextual analysis error: ${error.message}`);
      return false;
    }
  }

  analyzeParameterContext(line, domain) {
    // Simple heuristic-based parameter type inference
    if (line.includes('event') && line.includes(': any')) {
      return line.replace(': any', ': Event');
    }

    if (line.includes('error') && line.includes(': any')) {
      return line.replace(': any', ': Error');
    }

    if (line.includes('data') && line.includes(': any')) {
      return line.replace(': any', ': Record<string, unknown>');
    }

    if (line.includes('config') && line.includes(': any')) {
      return line.replace(': any', ': Record<string, unknown>');
    }

    return null;
  }

  async processDomainSpecificFiles(analysisData) {
    console.log('\n🏗️ Processing domain-specific files...');

    const domainFiles = {
      astrological: analysisData.fileAnalysis.filter(f => f.domain === 'astrological' && f.safetyLevel !== 'risky').slice(0, 3),
      campaign: analysisData.fileAnalysis.filter(f => f.domain === 'campaign' && f.safetyLevel !== 'risky').slice(0, 3),
      recipe: analysisData.fileAnalysis.filter(f => f.domain === 'recipe' && f.safetyLevel !== 'risky').slice(0, 2)
    };

    for (const [domain, files] of Object.entries(domainFiles)) {
      if (this.campaignResults.successfulFixes >= 50) break;

      console.log(`  🎯 Processing ${domain} domain files...`);

      for (const fileInfo of files) {
        if (this.campaignResults.successfulFixes >= 50) break;

        await this.processDomainFile(fileInfo, domain);
      }
    }
  }

  async processDomainFile(fileInfo, domain) {
    console.log(`    🔧 Processing ${domain} file: ${fileInfo.path}...`);

    try {
      if (!fs.existsSync(fileInfo.path)) {
        console.log(`      ⏭️ File not found: ${fileInfo.path}`);
        return false;
      }

      const content = fs.readFileSync(fileInfo.path, 'utf8');

      // Conservative replacements for domain files
      let modified = content;
      let changeCount = 0;

      // Only replace very safe patterns
      const beforeCount = (modified.match(/:\s*any\[\]/g) || []).length;
      modified = modified.replace(/:\s*any\[\]/g, ': unknown[]');
      const afterCount = (modified.match(/:\s*any\[\]/g) || []).length;
      changeCount = beforeCount - afterCount;

      if (changeCount > 0) {
        fs.writeFileSync(fileInfo.path, modified, 'utf8');

        const valid = await this.validateTypeScriptCompilation(fileInfo.path);
        if (valid) {
          console.log(`      ✅ ${domain} file processed: ${changeCount} changes`);
          this.campaignResults.successfulFixes += changeCount;
          return true;
        } else {
          fs.writeFileSync(fileInfo.path, content, 'utf8');
          this.campaignResults.rollbacks++;
        }
      }

      return false;
    } catch (error) {
      console.log(`      ❌ ${domain} analysis error: ${error.message}`);
      return false;
    }
  }

  async validateBuildStability() {
    console.log('🔍 Validating build stability...');

    try {
      const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      });

      if (result.includes('error') || result.includes('Error')) {
        console.log('❌ Build validation failed');
        this.campaignResults.buildStability = false;
        await this.performEmergencyRollback();
        return false;
      }

      console.log('✅ Build stability confirmed');
      return true;

    } catch (error) {
      console.log('❌ Build validation error:', error.message);
      this.campaignResults.buildStability = false;
      await this.performEmergencyRollback();
      return false;
    }
  }

  async performFinalValidation() {
    console.log('\n🏁 Performing final validation...');

    // Final build check
    const buildValid = await this.validateBuildStability();

    if (!buildValid) {
      throw new Error('Final build validation failed');
    }

    // Count remaining warnings
    const finalWarningCount = await this.getCurrentWarningCount();

    // Generate results summary
    await this.generateCampaignReport(finalWarningCount);

    console.log(`\n📊 Campaign Results Summary:`);
    console.log(`   ✅ Successful fixes: ${this.campaignResults.successfulFixes}`);
    console.log(`   📁 Files modified: ${this.campaignResults.filesModified.length}`);
    console.log(`   🔄 Rollbacks performed: ${this.campaignResults.rollbacks}`);
    console.log(`   🏗️ Build stability: ${this.campaignResults.buildStability ? 'Maintained' : 'Compromised'}`);
  }

  async getCurrentWarningCount() {
    try {
      const output = execSync('yarn eslint src --format compact | grep "no-explicit-any" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return parseInt(output.trim()) || 0;
    } catch (error) {
      return -1;
    }
  }

  async performEmergencyRollback() {
    console.log('🚨 Performing emergency rollback...');

    try {
      // Restore from git stash
      execSync('git stash pop', { stdio: 'pipe' });
      console.log('✅ Git stash rollback completed');

      // Also restore from file system backup if available
      if (this.backupDir && fs.existsSync(this.backupDir)) {
        execSync(`cp -r ${this.backupDir}/src/* src/`, { stdio: 'pipe' });
        console.log('✅ File system rollback completed');
      }

    } catch (error) {
      console.error('❌ Emergency rollback failed:', error.message);
    }
  }

  async generateCampaignReport(finalWarningCount) {
    const reportPath = '.kiro/specs/unintentional-any-elimination/targeted-consolidation-report.md';

    const report = `# Targeted Consolidation Campaign Report

## Campaign Summary

- **Start Time**: ${this.campaignResults.startTime.toISOString()}
- **End Time**: ${new Date().toISOString()}
- **Duration**: ${Math.round((Date.now() - this.campaignResults.startTime.getTime()) / 1000)} seconds

## Results

- **Successful Fixes**: ${this.campaignResults.successfulFixes}
- **Files Modified**: ${this.campaignResults.filesModified.length}
- **Failed Attempts**: ${this.campaignResults.failedAttempts}
- **Rollbacks Performed**: ${this.campaignResults.rollbacks}
- **Build Stability**: ${this.campaignResults.buildStability ? 'Maintained' : 'Compromised'}

## Pattern Processing Results

${Array.from(this.campaignResults.patternResults.entries())
  .map(([pattern, result]) => `- **${pattern}**: ${result.processed} processed, ${result.success ? 'Success' : 'Failed'}`)
  .join('\n')}

## Modified Files

${this.campaignResults.filesModified
  .map(file => `- ${file.path} (${file.replacements} replacements, ${file.pattern} pattern)`)
  .join('\n')}

## Safety Events

${this.campaignResults.safetyEvents.length > 0
  ? this.campaignResults.safetyEvents.map(event => `- ${event.type}: ${event.description}`).join('\n')
  : 'No safety events recorded'}

## Final Warning Count

- **Final Count**: ${finalWarningCount >= 0 ? finalWarningCount : 'Unable to determine'}
- **Estimated Reduction**: ${this.campaignResults.successfulFixes} warnings eliminated

## Recommendations

### Immediate Actions
1. **Verify Build Stability**: Ensure all tests pass and application functions correctly
2. **Review Modified Files**: Check that all changes maintain intended functionality
3. **Update Documentation**: Document any intentional any types that remain

### Next Steps
1. **Continue with Remaining Safe Patterns**: Process additional low-risk patterns
2. **Manual Review**: Address moderate and high-risk files manually
3. **Establish Prevention**: Implement pre-commit hooks to prevent regression

Generated on: ${new Date().toISOString()}
`;

    await fs.promises.writeFile(reportPath, report, 'utf8');
    console.log(`📄 Campaign report saved to: ${reportPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const campaign = new TargetedConsolidationCampaign();

  campaign.executeConsolidationCampaign()
    .then(() => {
      console.log('✅ Targeted consolidation campaign completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Campaign failed:', error);
      process.exit(1);
    });
}

module.exports = { TargetedConsolidationCampaign };
