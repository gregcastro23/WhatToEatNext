#!/usr/bin/env node

/**
 * Comprehensive Unused Variable Analysis and Categorization System
 *
 * This script analyzes all unused variables in the codebase and categorizes them
 * by file type, context, and domain-specific patterns for intelligent elimination.
 *
 * Features:
 * - Domain-aware preservation patterns for astrological and campaign variables
 * - File type categorization (components, services, utilities, data, tests)
 * - Confidence scoring for elimination candidates
 * - Detailed reporting with preservation justifications
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AstrologicalDomainDetector = require('./domain-preservation/astrological-domain-detector.cjs');
const CampaignSystemDetector = require('./domain-preservation/campaign-system-detector.cjs');
const TestFileDetector = require('./domain-preservation/test-file-detector.cjs');

class UnusedVariableAnalyzer {
  constructor() {
    this.analysisResults = [];
    this.categoryStats = {};
    this.preservationPatterns = this.initializePreservationPatterns();
    this.fileTypePatterns = this.initializeFileTypePatterns();
    this.astrologicalDetector = new AstrologicalDomainDetector();
    this.campaignDetector = new CampaignSystemDetector();
    this.testFileDetector = new TestFileDetector();
  }

  /**
   * Initialize domain-aware preservation patterns
   */
  initializePreservationPatterns() {
    return {
      // Astrological patterns now handled by AstrologicalDomainDetector
      // Keeping minimal fallback patterns for compatibility
      astrological: {
        patterns: [
          /\b(astrology|astrological|celestial|cosmic)\b/i
        ],
        reason: 'Astrological domain variable - handled by enhanced detector',
        confidence: 0.8
      },
      campaign: {
        patterns: [
          /\b(metrics|progress|safety|campaign|validation|intelligence)\b/i,
          /\b(monitor|tracker|analyzer|reporter|dashboard)\b/i,
          /\b(threshold|target|baseline|achievement|roi)\b/i,
          /\b(batch|phase|wave|execution|rollback)\b/i,
          /\b(typescript|eslint|linting|error|warning)(?:Count|Analysis|Report)\b/i
        ],
        reason: 'Campaign system variable - preserved for monitoring and intelligence features',
        confidence: 0.85
      },
      culinary: {
        patterns: [
          /\b(recipe|ingredient|cuisine|cooking|culinary|flavor)\b/i,
          /\b(spice|herb|vegetable|fruit|protein|grain|dairy)\b/i,
          /\b(preparation|method|technique|temperature|timing)\b/i,
          /\b(nutritional|dietary|allergen|restriction)\b/i,
          /\b(alchemical|elemental|harmony|compatibility)\b/i
        ],
        reason: 'Culinary domain variable - preserved for recipe and ingredient systems',
        confidence: 0.8
      },
      test: {
        patterns: [
          /\b(mock|stub|test|expect|describe|it|should|spec)\b/i,
          /\b(fixture|factory|builder|helper|utility)(?:Test|Mock)?\b/i,
          /\b(setup|teardown|beforeEach|afterEach|beforeAll|afterAll)\b/i,
          /\b(jest|vitest|cypress|playwright|testing)\b/i
        ],
        reason: 'Test infrastructure variable - preserved for testing framework',
        confidence: 0.75
      },
      service: {
        patterns: [
          /\b(service|api|client|adapter|provider|repository)\b/i,
          /\b(request|response|payload|data|result|output)\b/i,
          /\b(config|settings|options|parameters|props)\b/i,
          /\b(cache|storage|database|persistence)\b/i,
          /\b(auth|authentication|authorization|security)\b/i
        ],
        reason: 'Service layer variable - potential business logic value',
        confidence: 0.7
      }
    };
  }

  /**
   * Initialize file type categorization patterns
   */
  initializeFileTypePatterns() {
    return {
      components: {
        patterns: [/\/components\//, /\.tsx$/, /\.jsx$/],
        riskLevel: 'medium',
        description: 'React components and UI elements'
      },
      services: {
        patterns: [/\/services\//, /Service\.ts$/, /Client\.ts$/, /Api\.ts$/],
        riskLevel: 'high',
        description: 'Business logic and API integration services'
      },
      utilities: {
        patterns: [/\/utils\//, /\/helpers\//, /Util\.ts$/, /Helper\.ts$/],
        riskLevel: 'low',
        description: 'Utility functions and helper modules'
      },
      data: {
        patterns: [/\/data\//, /\/constants\//, /\.json$/, /Constants\.ts$/],
        riskLevel: 'medium',
        description: 'Data files and configuration constants'
      },
      tests: {
        patterns: [/\.test\./, /\.spec\./, /\/__tests__\//, /\/tests\//],
        riskLevel: 'low',
        description: 'Test files and testing utilities'
      },
      calculations: {
        patterns: [/\/calculations\//, /Calculator\.ts$/, /Engine\.ts$/],
        riskLevel: 'high',
        description: 'Mathematical and astrological calculations'
      },
      scripts: {
        patterns: [/\/scripts\//, /\.cjs$/, /\.mjs$/],
        riskLevel: 'low',
        description: 'Build scripts and automation tools'
      }
    };
  }

  /**
   * Get all unused variable warnings from ESLint
   */
  getUnusedVariables() {
    try {
      console.log('🔍 Collecting unused variable warnings...');

      const lintOutput = execSync(
        'yarn lint --max-warnings=10000 --format=json 2>/dev/null || true',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      let results;
      try {
        results = JSON.parse(lintOutput);
      } catch (parseError) {
        console.warn('Failed to parse lint JSON output, falling back to text parsing');
        return this.parseTextLintOutput();
      }

      const unusedVars = [];

      if (Array.isArray(results)) {
        results.forEach(fileResult => {
          if (fileResult.messages) {
            fileResult.messages.forEach(message => {
              if (message.ruleId === '@typescript-eslint/no-unused-vars' ||
                  message.ruleId === 'no-unused-vars') {
                unusedVars.push({
                  filePath: fileResult.filePath,
                  line: message.line,
                  column: message.column,
                  message: message.message,
                  ruleId: message.ruleId,
                  severity: message.severity
                });
              }
            });
          }
        });
      }

      console.log(`📊 Found ${unusedVars.length} unused variable warnings`);
      return unusedVars;
    } catch (error) {
      console.error('Error getting unused variables:', error.message);
      return this.parseTextLintOutput();
    }
  }

  /**
   * Fallback method to parse text lint output
   */
  parseTextLintOutput() {
    try {
      // First, generate the raw data file
      console.log('Generating unused variables data file...');
      execSync('./src/scripts/collect-unused-vars.sh', { stdio: 'inherit' });

      // Read the generated file
      const rawDataFile = path.join(process.cwd(), 'unused-vars-raw.txt');
      let lintOutput = '';

      try {
        lintOutput = fs.readFileSync(rawDataFile, 'utf8');
      } catch (readError) {
        console.error('Could not read unused-vars-raw.txt file:', readError.message);
        return [];
      }

      const lines = lintOutput.trim().split('\n').filter(line => line.trim());
      const unusedVars = [];

      lines.forEach(line => {
        // Parse unix format: /path/to/file.ts:line:column: message [Error/@typescript-eslint/no-unused-vars]
        const match = line.match(/^(.+?):(\d+):(\d+):\s+(.+?)\s+\[Error\/@typescript-eslint\/no-unused-vars\]/);
        if (match) {
          const [, filePath, lineNum, column, message] = match;
          unusedVars.push({
            filePath: path.resolve(filePath),
            line: parseInt(lineNum),
            column: parseInt(column),
            message: message.trim(),
            ruleId: '@typescript-eslint/no-unused-vars',
            severity: 2 // Unix format shows errors
          });
        }
      });

      console.log(`📊 Found ${unusedVars.length} unused variable warnings (text parsing)`);
      return unusedVars;
    } catch (error) {
      console.error('Error parsing text lint output:', error.message);
      return [];
    }
  }

  /**
   * Extract variable name from lint message
   */
  extractVariableName(message) {
    // Common patterns in unused variable messages
    const patterns = [
      /'([^']+)' is defined but never used/,
      /'([^']+)' is assigned a value but never used/,
      /Variable '([^']+)' is defined but never used/,
      /Parameter '([^']+)' is defined but never used/,
      /'([^']+)' is declared but its value is never read/
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Fallback: try to extract any quoted string
    const quotedMatch = message.match(/'([^']+)'/);
    return quotedMatch ? quotedMatch[1] : 'unknown';
  }

  /**
   * Categorize file type based on path
   */
  categorizeFileType(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const [type, config] of Object.entries(this.fileTypePatterns)) {
      if (config.patterns.some(pattern => pattern.test(relativePath))) {
        return {
          type,
          riskLevel: config.riskLevel,
          description: config.description
        };
      }
    }

    return {
      type: 'other',
      riskLevel: 'medium',
      description: 'Uncategorized file type'
    };
  }

  /**
   * Check if variable should be preserved based on domain patterns
   */
  checkPreservationPatterns(variableName, filePath, fileContent = '') {
    const relativePath = path.relative(process.cwd(), filePath);

    // First, check with the enhanced astrological domain detector
    const astrologicalResult = this.astrologicalDetector.detectAstrologicalDomain(
      variableName,
      filePath,
      fileContent
    );

    if (astrologicalResult.shouldPreserve) {
      return {
        shouldPreserve: true,
        domain: astrologicalResult.domain,
        category: astrologicalResult.category,
        subcategory: astrologicalResult.subcategory,
        reason: astrologicalResult.reason,
        confidence: astrologicalResult.confidence,
        matchType: astrologicalResult.matchType,
        detector: 'astrological-enhanced'
      };
    }

    // Check with the campaign system detector
    const campaignResult = this.campaignDetector.detectCampaignDomain(
      variableName,
      filePath,
      fileContent
    );

    if (campaignResult.shouldPreserve) {
      return {
        shouldPreserve: true,
        domain: campaignResult.domain,
        category: campaignResult.category,
        subcategory: campaignResult.subcategory,
        reason: campaignResult.reason,
        confidence: campaignResult.confidence,
        matchType: campaignResult.matchType,
        detector: 'campaign-enhanced'
      };
    }

    // Check with the test file detector
    const testResult = this.testFileDetector.detectTestDomain(
      variableName,
      filePath,
      fileContent
    );

    if (testResult.shouldPreserve) {
      return {
        shouldPreserve: true,
        domain: testResult.domain,
        category: testResult.category,
        subcategory: testResult.subcategory,
        reason: testResult.reason,
        confidence: testResult.confidence,
        matchType: testResult.matchType,
        detector: 'test-enhanced'
      };
    }

    // Fall back to original pattern matching for other domains
    for (const [domain, config] of Object.entries(this.preservationPatterns)) {
      // Skip astrological patterns since we handled them above
      if (domain === 'astrological') continue;

      // Check variable name against patterns
      const nameMatch = config.patterns.some(pattern => pattern.test(variableName));

      // Check file path for domain context
      const pathMatch = config.patterns.some(pattern => pattern.test(relativePath));

      // Check file content if available
      const contentMatch = fileContent && config.patterns.some(pattern => pattern.test(fileContent));

      if (nameMatch || pathMatch || contentMatch) {
        return {
          shouldPreserve: true,
          domain,
          reason: config.reason,
          confidence: config.confidence,
          matchType: nameMatch ? 'name' : pathMatch ? 'path' : 'content',
          detector: 'original-patterns'
        };
      }
    }

    return {
      shouldPreserve: false,
      domain: 'generic',
      reason: 'No domain-specific preservation pattern matched',
      confidence: 0.9, // High confidence for elimination
      matchType: 'none',
      detector: 'none'
    };
  }

  /**
   * Calculate elimination confidence score
   */
  calculateEliminationConfidence(variable, fileType, preservation) {
    let baseConfidence = 0.8;

    // Adjust based on preservation patterns
    if (preservation.shouldPreserve) {
      baseConfidence = 1.0 - preservation.confidence; // Invert for elimination confidence
    }

    // Adjust based on file type risk
    const riskAdjustments = {
      'low': 0.1,      // Increase confidence for low-risk files
      'medium': 0.0,   // No adjustment
      'high': -0.2     // Decrease confidence for high-risk files
    };

    baseConfidence += riskAdjustments[fileType.riskLevel] || 0;

    // Adjust based on variable name patterns
    if (variable.variableName.startsWith('_')) {
      baseConfidence += 0.1; // Underscore prefix suggests intentionally unused
    }

    if (/^(args?|options?|params?|props?)$/i.test(variable.variableName)) {
      baseConfidence -= 0.1; // Common parameter names, be more cautious
    }

    if (/^(error|err|e)$/i.test(variable.variableName)) {
      baseConfidence -= 0.1; // Error variables might be needed for debugging
    }

    // Clamp to valid range
    return Math.max(0.1, Math.min(0.9, baseConfidence));
  }

  /**
   * Read file content safely
   */
  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.warn(`Could not read file ${filePath}: ${error.message}`);
      return '';
    }
  }

  /**
   * Analyze a single unused variable
   */
  analyzeVariable(unusedVar) {
    const variableName = this.extractVariableName(unusedVar.message);
    const fileType = this.categorizeFileType(unusedVar.filePath);
    const fileContent = this.readFileContent(unusedVar.filePath);
    const preservation = this.checkPreservationPatterns(variableName, unusedVar.filePath, fileContent);
    const eliminationConfidence = this.calculateEliminationConfidence(
      { variableName },
      fileType,
      preservation
    );

    return {
      id: `${path.relative(process.cwd(), unusedVar.filePath)}:${unusedVar.line}:${variableName}`,
      filePath: unusedVar.filePath,
      relativePath: path.relative(process.cwd(), unusedVar.filePath),
      line: unusedVar.line,
      column: unusedVar.column,
      variableName,
      message: unusedVar.message,
      ruleId: unusedVar.ruleId,
      fileType: fileType.type,
      riskLevel: fileType.riskLevel,
      fileDescription: fileType.description,
      preservation: {
        shouldPreserve: preservation.shouldPreserve,
        domain: preservation.domain,
        reason: preservation.reason,
        confidence: preservation.confidence,
        matchType: preservation.matchType
      },
      eliminationStrategy: {
        method: preservation.shouldPreserve ? 'preserve' : 'remove',
        confidence: eliminationConfidence,
        priority: this.calculatePriority(fileType, preservation, eliminationConfidence),
        batchGroup: this.assignBatchGroup(fileType, preservation)
      }
    };
  }

  /**
   * Calculate processing priority (1 = highest, 5 = lowest)
   */
  calculatePriority(fileType, preservation, confidence) {
    if (preservation.shouldPreserve) return 5; // Lowest priority for preserved variables

    if (fileType.riskLevel === 'low' && confidence > 0.8) return 1;
    if (fileType.riskLevel === 'medium' && confidence > 0.7) return 2;
    if (fileType.riskLevel === 'high' && confidence > 0.6) return 3;

    return 4; // Default priority
  }

  /**
   * Assign batch group for processing
   */
  assignBatchGroup(fileType, preservation) {
    if (preservation.shouldPreserve) return 'preserved';

    const batchGroups = {
      'scripts': 'batch-1-scripts',
      'utilities': 'batch-2-utilities',
      'tests': 'batch-3-tests',
      'data': 'batch-4-data',
      'components': 'batch-5-components',
      'services': 'batch-6-services',
      'calculations': 'batch-7-calculations'
    };

    return batchGroups[fileType.type] || 'batch-8-other';
  }

  /**
   * Generate category statistics
   */
  generateCategoryStats(results) {
    const stats = {
      total: results.length,
      byFileType: {},
      byDomain: {},
      byRiskLevel: {},
      byEliminationStrategy: {},
      byBatchGroup: {},
      preservationSummary: {
        preserved: 0,
        forElimination: 0,
        preservationRate: 0
      }
    };

    results.forEach(result => {
      // File type stats
      stats.byFileType[result.fileType] = (stats.byFileType[result.fileType] || 0) + 1;

      // Domain stats
      stats.byDomain[result.preservation.domain] = (stats.byDomain[result.preservation.domain] || 0) + 1;

      // Risk level stats
      stats.byRiskLevel[result.riskLevel] = (stats.byRiskLevel[result.riskLevel] || 0) + 1;

      // Elimination strategy stats
      stats.byEliminationStrategy[result.eliminationStrategy.method] =
        (stats.byEliminationStrategy[result.eliminationStrategy.method] || 0) + 1;

      // Batch group stats
      stats.byBatchGroup[result.eliminationStrategy.batchGroup] =
        (stats.byBatchGroup[result.eliminationStrategy.batchGroup] || 0) + 1;

      // Preservation summary
      if (result.preservation.shouldPreserve) {
        stats.preservationSummary.preserved++;
      } else {
        stats.preservationSummary.forElimination++;
      }
    });

    stats.preservationSummary.preservationRate =
      (stats.preservationSummary.preserved / stats.total * 100).toFixed(1);

    return stats;
  }

  /**
   * Generate detailed analysis report
   */
  generateReport(results, stats) {
    const timestamp = new Date().toISOString();

    return {
      metadata: {
        analysisDate: timestamp,
        totalVariables: stats.total,
        preservationRate: `${stats.preservationSummary.preservationRate}%`,
        analyzer: 'UnusedVariableAnalyzer v1.0',
        campaign: 'unused-variable-elimination'
      },
      summary: {
        total: stats.total,
        preserved: stats.preservationSummary.preserved,
        forElimination: stats.preservationSummary.forElimination,
        preservationRate: stats.preservationSummary.preservationRate
      },
      categoryBreakdown: {
        fileTypes: stats.byFileType,
        domains: stats.byDomain,
        riskLevels: stats.byRiskLevel,
        eliminationStrategies: stats.byEliminationStrategy,
        batchGroups: stats.byBatchGroup
      },
      detailedResults: results,
      recommendations: this.generateRecommendations(results, stats),
      batchProcessingPlan: this.generateBatchProcessingPlan(results)
    };
  }

  /**
   * Generate processing recommendations
   */
  generateRecommendations(results, stats) {
    const recommendations = [];

    // High-confidence elimination candidates
    const highConfidenceEliminations = results.filter(r =>
      !r.preservation.shouldPreserve && r.eliminationStrategy.confidence > 0.8
    );

    if (highConfidenceEliminations.length > 0) {
      recommendations.push({
        type: 'high-confidence-elimination',
        count: highConfidenceEliminations.length,
        description: `${highConfidenceEliminations.length} variables can be safely eliminated with high confidence`,
        action: 'Process in first elimination wave'
      });
    }

    // Domain preservation insights
    Object.entries(stats.byDomain).forEach(([domain, count]) => {
      if (domain !== 'generic' && count > 5) {
        recommendations.push({
          type: 'domain-preservation',
          domain,
          count,
          description: `${count} variables preserved for ${domain} domain`,
          action: 'Review for potential transformation into active features'
        });
      }
    });

    // High-risk file warnings
    const highRiskVariables = results.filter(r => r.riskLevel === 'high');
    if (highRiskVariables.length > 0) {
      recommendations.push({
        type: 'high-risk-warning',
        count: highRiskVariables.length,
        description: `${highRiskVariables.length} variables in high-risk files require careful review`,
        action: 'Use smaller batch sizes and enhanced safety protocols'
      });
    }

    return recommendations;
  }

  /**
   * Generate batch processing plan
   */
  generateBatchProcessingPlan(results) {
    const eliminationCandidates = results.filter(r => !r.preservation.shouldPreserve);
    const batches = {};

    eliminationCandidates.forEach(result => {
      const batchGroup = result.eliminationStrategy.batchGroup;
      if (!batches[batchGroup]) {
        batches[batchGroup] = {
          name: batchGroup,
          variables: [],
          totalCount: 0,
          averageConfidence: 0,
          riskLevel: result.riskLevel,
          recommendedBatchSize: this.getRecommendedBatchSize(result.riskLevel)
        };
      }

      batches[batchGroup].variables.push(result);
      batches[batchGroup].totalCount++;
    });

    // Calculate average confidence for each batch
    Object.values(batches).forEach(batch => {
      const totalConfidence = batch.variables.reduce((sum, v) => sum + v.eliminationStrategy.confidence, 0);
      batch.averageConfidence = (totalConfidence / batch.variables.length).toFixed(3);
    });

    return {
      totalBatches: Object.keys(batches).length,
      batches: Object.values(batches).sort((a, b) => a.name.localeCompare(b.name)),
      processingOrder: this.getProcessingOrder(batches)
    };
  }

  /**
   * Get recommended batch size based on risk level
   */
  getRecommendedBatchSize(riskLevel) {
    const batchSizes = {
      'low': 15,
      'medium': 10,
      'high': 5
    };
    return batchSizes[riskLevel] || 10;
  }

  /**
   * Get recommended processing order
   */
  getProcessingOrder(batches) {
    return Object.values(batches)
      .sort((a, b) => {
        // Sort by risk level (low risk first) then by confidence (high confidence first)
        const riskOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }
        return parseFloat(b.averageConfidence) - parseFloat(a.averageConfidence);
      })
      .map(batch => batch.name);
  }

  /**
   * Save analysis results to file
   */
  saveResults(report, outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`📄 Analysis report saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Error saving report: ${error.message}`);
    }
  }

  /**
   * Print summary to console
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 UNUSED VARIABLE ANALYSIS SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Total Variables: ${report.summary.total}`);
    console.log(`   For Elimination: ${report.summary.forElimination}`);
    console.log(`   Preserved: ${report.summary.preserved}`);
    console.log(`   Preservation Rate: ${report.summary.preservationRate}%`);

    console.log(`\n📁 File Type Breakdown:`);
    Object.entries(report.categoryBreakdown.fileTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    console.log(`\n🏷️  Domain Breakdown:`);
    Object.entries(report.categoryBreakdown.domains)
      .sort(([,a], [,b]) => b - a)
      .forEach(([domain, count]) => {
        console.log(`   ${domain}: ${count}`);
      });

    console.log(`\n⚡ Processing Recommendations:`);
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.description}`);
      console.log(`      Action: ${rec.action}`);
    });

    console.log(`\n🔄 Batch Processing Plan:`);
    console.log(`   Total Batches: ${report.batchProcessingPlan.totalBatches}`);
    console.log(`   Processing Order:`);
    report.batchProcessingPlan.processingOrder.forEach((batchName, index) => {
      const batch = report.batchProcessingPlan.batches.find(b => b.name === batchName);
      console.log(`     ${index + 1}. ${batchName} (${batch.totalCount} variables, confidence: ${batch.averageConfidence})`);
    });

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Main analysis execution
   */
  async analyze() {
    console.log('🚀 Starting Unused Variable Analysis...\n');

    // Get unused variables
    const unusedVars = this.getUnusedVariables();
    if (unusedVars.length === 0) {
      console.log('✅ No unused variables found!');
      return;
    }

    // Analyze each variable
    console.log('🔬 Analyzing variables...');
    const results = unusedVars.map(unusedVar => this.analyzeVariable(unusedVar));

    // Generate statistics
    const stats = this.generateCategoryStats(results);

    // Generate comprehensive report
    const report = this.generateReport(results, stats);

    // Save results
    const outputPath = path.join(process.cwd(), 'unused-variables-analysis-report.json');
    this.saveResults(report, outputPath);

    // Print summary
    this.printSummary(report);

    console.log(`\n✅ Analysis complete! Report saved to: ${outputPath}`);

    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new UnusedVariableAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = UnusedVariableAnalyzer;
