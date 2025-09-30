#!/usr/bin/env node

/**
 * Confidence Scoring Summary Generator
 *
 * Generates detailed confidence scoring analysis for unused variable elimination
 */

const fs = require('fs');
const path = require('path');

class ConfidenceScoringAnalyzer {
  constructor() {
    this.reportPath = path.join(process.cwd(), 'unused-variables-analysis-report.json');
  }

  loadAnalysisReport() {
    try {
      const reportData = fs.readFileSync(this.reportPath, 'utf8');
      return JSON.parse(reportData);
    } catch (error) {
      console.error('Error loading analysis report:', error.message);
      return null;
    }
  }

  analyzeConfidenceDistribution(results) {
    const confidenceRanges = {
      'Very High (0.9-1.0)': { min: 0.9, max: 1.0, count: 0, variables: [] },
      'High (0.8-0.89)': { min: 0.8, max: 0.89, count: 0, variables: [] },
      'Medium (0.7-0.79)': { min: 0.7, max: 0.79, count: 0, variables: [] },
      'Low (0.6-0.69)': { min: 0.6, max: 0.69, count: 0, variables: [] },
      'Very Low (0.1-0.59)': { min: 0.1, max: 0.59, count: 0, variables: [] }
    };

    results.forEach(result => {
      const confidence = result.eliminationStrategy.confidence;

      for (const [range, config] of Object.entries(confidenceRanges)) {
        if (confidence >= config.min && confidence <= config.max) {
          config.count++;
          config.variables.push({
            name: result.variableName,
            file: result.relativePath,
            confidence: confidence,
            domain: result.preservation.domain,
            shouldPreserve: result.preservation.shouldPreserve,
            reason: result.preservation.reason
          });
          break;
        }
      }
    });

    return confidenceRanges;
  }

  analyzeEliminationCandidates(results) {
    const eliminationCandidates = results.filter(r => !r.preservation.shouldPreserve);

    return {
      total: eliminationCandidates.length,
      byConfidence: eliminationCandidates.reduce((acc, candidate) => {
        const confidence = candidate.eliminationStrategy.confidence;
        const range = this.getConfidenceRange(confidence);
        if (!acc[range]) acc[range] = [];
        acc[range].push(candidate);
        return acc;
      }, {}),
      highestConfidence: eliminationCandidates.reduce((max, candidate) =>
        candidate.eliminationStrategy.confidence > max ? candidate.eliminationStrategy.confidence : max, 0),
      averageConfidence: eliminationCandidates.length > 0 ?
        eliminationCandidates.reduce((sum, c) => sum + c.eliminationStrategy.confidence, 0) / eliminationCandidates.length : 0
    };
  }

  getConfidenceRange(confidence) {
    if (confidence >= 0.9) return 'Very High (0.9-1.0)';
    if (confidence >= 0.8) return 'High (0.8-0.89)';
    if (confidence >= 0.7) return 'Medium (0.7-0.79)';
    if (confidence >= 0.6) return 'Low (0.6-0.69)';
    return 'Very Low (0.1-0.59)';
  }

  analyzePreservationConfidence(results) {
    const preservedVariables = results.filter(r => r.preservation.shouldPreserve);

    const byDomain = preservedVariables.reduce((acc, variable) => {
      const domain = variable.preservation.domain;
      if (!acc[domain]) {
        acc[domain] = {
          count: 0,
          totalConfidence: 0,
          averageConfidence: 0,
          variables: []
        };
      }

      acc[domain].count++;
      acc[domain].totalConfidence += variable.preservation.confidence;
      acc[domain].variables.push({
        name: variable.variableName,
        file: variable.relativePath,
        confidence: variable.preservation.confidence,
        reason: variable.preservation.reason
      });

      return acc;
    }, {});

    // Calculate averages
    Object.values(byDomain).forEach(domain => {
      domain.averageConfidence = domain.totalConfidence / domain.count;
    });

    return {
      total: preservedVariables.length,
      byDomain,
      overallAverageConfidence: preservedVariables.reduce((sum, v) => sum + v.preservation.confidence, 0) / preservedVariables.length
    };
  }

  generateConfidenceReport(report) {
    const results = report.detailedResults;
    const confidenceDistribution = this.analyzeConfidenceDistribution(results);
    const eliminationAnalysis = this.analyzeEliminationCandidates(results);
    const preservationAnalysis = this.analyzePreservationConfidence(results);

    return {
      metadata: {
        analysisDate: new Date().toISOString(),
        totalVariables: results.length,
        analyzer: 'ConfidenceScoringAnalyzer v1.0'
      },
      confidenceDistribution,
      eliminationAnalysis,
      preservationAnalysis,
      recommendations: this.generateConfidenceRecommendations(confidenceDistribution, eliminationAnalysis, preservationAnalysis)
    };
  }

  generateConfidenceRecommendations(distribution, elimination, preservation) {
    const recommendations = [];

    // High confidence elimination recommendations
    const veryHighConfidence = distribution['Very High (0.9-1.0)'];
    if (veryHighConfidence.count > 0) {
      const eliminationCandidates = veryHighConfidence.variables.filter(v => !v.shouldPreserve);
      if (eliminationCandidates.length > 0) {
        recommendations.push({
          type: 'immediate-elimination',
          priority: 'high',
          count: eliminationCandidates.length,
          description: `${eliminationCandidates.length} variables with very high elimination confidence (0.9+)`,
          action: 'Process immediately with standard safety protocols',
          variables: eliminationCandidates.map(v => `${v.name} in ${v.file}`)
        });
      }
    }

    // Medium confidence review recommendations
    const highConfidence = distribution['High (0.8-0.89)'];
    if (highConfidence.count > 0) {
      const eliminationCandidates = highConfidence.variables.filter(v => !v.shouldPreserve);
      if (eliminationCandidates.length > 0) {
        recommendations.push({
          type: 'careful-elimination',
          priority: 'medium',
          count: eliminationCandidates.length,
          description: `${eliminationCandidates.length} variables with high elimination confidence (0.8-0.89)`,
          action: 'Review manually before processing with enhanced safety protocols',
          variables: eliminationCandidates.map(v => `${v.name} in ${v.file}`)
        });
      }
    }

    // Domain preservation insights
    Object.entries(preservation.byDomain).forEach(([domain, data]) => {
      if (data.count > 10 && data.averageConfidence > 0.8) {
        recommendations.push({
          type: 'domain-transformation',
          priority: 'strategic',
          domain,
          count: data.count,
          averageConfidence: data.averageConfidence.toFixed(3),
          description: `${data.count} ${domain} domain variables with high preservation confidence`,
          action: 'Consider transformation into active features rather than elimination'
        });
      }
    });

    // Low confidence warnings
    const lowConfidenceEliminations = Object.entries(distribution)
      .filter(([range]) => range.includes('Low') || range.includes('Very Low'))
      .reduce((total, [, data]) => total + data.variables.filter(v => !v.shouldPreserve).length, 0);

    if (lowConfidenceEliminations > 0) {
      recommendations.push({
        type: 'low-confidence-warning',
        priority: 'caution',
        count: lowConfidenceEliminations,
        description: `${lowConfidenceEliminations} variables with low elimination confidence`,
        action: 'Avoid elimination - likely contains valuable domain logic'
      });
    }

    return recommendations;
  }

  printConfidenceSummary(confidenceReport) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CONFIDENCE SCORING ANALYSIS SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n📊 Confidence Distribution:`);
    Object.entries(confidenceReport.confidenceDistribution).forEach(([range, data]) => {
      console.log(`   ${range}: ${data.count} variables`);
      if (data.count > 0 && data.count <= 5) {
        data.variables.forEach(v => {
          const status = v.shouldPreserve ? 'PRESERVE' : 'ELIMINATE';
          console.log(`     - ${v.name} (${v.confidence.toFixed(3)}) [${status}] - ${v.domain}`);
        });
      }
    });

    console.log(`\n🎯 Elimination Analysis:`);
    console.log(`   Total Elimination Candidates: ${confidenceReport.eliminationAnalysis.total}`);
    console.log(`   Highest Confidence: ${confidenceReport.eliminationAnalysis.highestConfidence.toFixed(3)}`);
    console.log(`   Average Confidence: ${confidenceReport.eliminationAnalysis.averageConfidence.toFixed(3)}`);

    console.log(`\n🛡️  Preservation Analysis:`);
    console.log(`   Total Preserved Variables: ${confidenceReport.preservationAnalysis.total}`);
    console.log(`   Overall Average Preservation Confidence: ${confidenceReport.preservationAnalysis.overallAverageConfidence.toFixed(3)}`);

    console.log(`\n   By Domain:`);
    Object.entries(confidenceReport.preservationAnalysis.byDomain)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([domain, data]) => {
        console.log(`     ${domain}: ${data.count} variables (avg confidence: ${data.averageConfidence.toFixed(3)})`);
      });

    console.log(`\n💡 Confidence-Based Recommendations:`);
    confidenceReport.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
      console.log(`      Action: ${rec.action}`);
      if (rec.variables && rec.variables.length <= 3) {
        console.log(`      Variables: ${rec.variables.join(', ')}`);
      }
    });

    console.log('\n' + '='.repeat(80));
  }

  async analyze() {
    console.log('🔍 Loading analysis report...');

    const report = this.loadAnalysisReport();
    if (!report) {
      console.error('❌ Could not load analysis report');
      return;
    }

    console.log('📈 Analyzing confidence scores...');
    const confidenceReport = this.generateConfidenceReport(report);

    // Save detailed confidence report
    const outputPath = path.join(process.cwd(), 'confidence-scoring-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(confidenceReport, null, 2));
    console.log(`📄 Confidence analysis saved to: ${outputPath}`);

    // Print summary
    this.printConfidenceSummary(confidenceReport);

    console.log(`\n✅ Confidence scoring analysis complete!`);

    return confidenceReport;
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new ConfidenceScoringAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('Confidence analysis failed:', error);
    process.exit(1);
  });
}

module.exports = ConfidenceScoringAnalyzer;
