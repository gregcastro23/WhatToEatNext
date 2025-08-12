#!/usr/bin/env node

/**
 * Campaign System Variable Detection System
 *
 * This module implements sophisticated pattern matching for campaign system variables
 * to ensure preservation of metrics, progress tracking, safety protocols, campaign orchestration,
 * validation systems, and intelligence features.
 *
 * Requirements: 2.2, 2.3
 */

class CampaignSystemDetector {
  constructor() {
    this.patterns = this.initializeCampaignPatterns();
  }

  /**
   * Initialize comprehensive campaign system patterns
   */
  initializeCampaignPatterns() {
    return {
      // Core campaign orchestration variables
      campaignOrchestration: {
        patterns: [
          // Campaign execution and control
          /\b(campaign|campaigns?|execution|orchestration|controller)\b/i,
          /\b(phase|wave|batch|stage|step|iteration)\b/i,
          /\b(start|stop|pause|resume|abort|complete|finish)\b/i,

          // Campaign configuration and settings
          /\b(campaignConfig|campaignSettings|campaignOptions|campaignParams)\b/i,
          /\b(batchSize|maxFiles|threshold|target|limit)\b/i,
          /\b(automation|automated|schedule|trigger|activation)\b/i,

          // Campaign state and status
          /\b(campaignState|campaignStatus|executionState|phaseStatus)\b/i,
          /\b(running|paused|completed|failed|pending|active|inactive)\b/i,
        ],
        reason: 'Campaign orchestration variable - essential for campaign execution control',
        confidence: 0.9,
        category: 'campaign-orchestration'
      },

      // Metrics collection and analysis
      metricsSystem: {
        patterns: [
          // Core metrics variables
          /\b(metrics?|measurement|statistics|stats|analytics)\b/i,
          /\b(performance|quality|efficiency|effectiveness|productivity)\b/i,
          /\b(count|total|sum|average|mean|median|percentile)\b/i,

          // Specific metric types
          /\b(errorCount|warningCount|buildTime|memoryUsage|bundleSize)\b/i,
          /\b(cacheHitRate|compilationTime|testCoverage|codeQuality)\b/i,
          /\b(reductionRate|improvementRate|successRate|failureRate)\b/i,

          // Metrics collection and reporting
          /\b(metricsCollector|metricsReporter|metricsAnalyzer|metricsDashboard)\b/i,
          /\b(performanceMetrics|qualityMetrics|systemMetrics|campaignMetrics)\b/i,
          /\b(baseline|benchmark|target|goal|objective|kpi)\b/i,
          /\b(trend|pattern|anomaly|outlier|regression|improvement)\b/i,
        ],
        reason: 'Metrics system variable - critical for campaign performance monitoring',
        confidence: 0.85,
        category: 'metrics-system'
      },

      // Progress tracking and reporting
      progressTracking: {
        patterns: [
          // Progress tracking core
          /\b(progress|advancement|completion|achievement|milestone)\b/i,
          /\b(tracker|tracking|monitor|monitoring|observer)\b/i,
          /\b(percentage|percent|ratio|fraction|proportion)\b/i,

          // Progress states and updates
          /\b(progressUpdate|progressReport|progressStatus|progressMetrics)\b/i,
          /\b(currentProgress|totalProgress|remainingProgress|estimatedProgress)\b/i,
          /\b(startTime|endTime|duration|elapsed|remaining|eta)\b/i,

          // Progress visualization and reporting
          /\b(progressBar|progressIndicator|progressChart|progressGraph)\b/i,
          /\b(progressTracker|progressMonitor|progressAnalyzer|progressReporter)\b/i,
          /\b(dashboard|report|summary|overview|snapshot)\b/i,
          /\b(history|timeline|log|journal|record)\b/i,
        ],
        reason: 'Progress tracking variable - essential for campaign monitoring and reporting',
        confidence: 0.85,
        category: 'progress-tracking'
      },

      // Safety protocols and validation
      safetyProtocols: {
        patterns: [
          // Safety system core
          /\b(safety|safe|secure|protection|guard|shield)\b/i,
          /\b(protocol|procedure|policy|rule|guideline|standard)\b/i,
          /\b(validation|verification|check|test|audit|review)\b/i,

          // Safety events and responses
          /\b(safetyEvent|safetyAlert|safetyWarning|safetyError)\b/i,
          /\b(rollback|revert|undo|restore|recover|backup)\b/i,
          /\b(corruption|damage|failure|error|exception|issue)\b/i,

          // Safety mechanisms
          /\b(checkpoint|savepoint|snapshot|stash|backup|archive)\b/i,
          /\b(safetyProtocol|safetySystem|safetyMonitor|safetyValidator)\b/i,
          /\b(integrity|consistency|stability|reliability|robustness)\b/i,
          /\b(emergency|critical|urgent|immediate|priority)\b/i,
        ],
        reason: 'Safety protocol variable - critical for campaign stability and error recovery',
        confidence: 0.9,
        category: 'safety-protocols'
      },

      // Intelligence and analytics
      intelligenceSystem: {
        patterns: [
          // Intelligence core
          /\b(intelligence|intelligent|smart|adaptive|learning)\b/i,
          /\b(analytics|analysis|insight|pattern|trend)\b/i,
          /\b(prediction|forecast|estimation|projection|modeling)\b/i,

          // Intelligence types
          /\b(errorPatternIntelligence|campaignProgressIntelligence|enterpriseIntelligence)\b/i,
          /\b(performanceIntelligence|qualityIntelligence|securityIntelligence)\b/i,
          /\b(behaviorAnalysis|patternRecognition|anomalyDetection)\b/i,

          // Intelligence processing
          /\b(intelligenceEngine|intelligenceProcessor|intelligenceAnalyzer)\b/i,
          /\b(dataScience|machineLearning|artificialIntelligence|ai|ml)\b/i,
          /\b(algorithm|model|classifier|predictor|optimizer)\b/i,
        ],
        reason: 'Intelligence system variable - important for advanced campaign analytics',
        confidence: 0.8,
        category: 'intelligence-system'
      },

      // Monitoring and alerting
      monitoringSystem: {
        patterns: [
          // Monitoring core
          /\b(monitor|monitoring|surveillance|observation|watching)\b/i,
          /\b(alert|alerting|notification|warning|alarm)\b/i,
          /\b(detector|sensor|probe|scanner|checker)\b/i,

          // Monitoring types
          /\b(performanceMonitor|securityMonitor|dependencyMonitor|qualityMonitor)\b/i,
          /\b(buildMonitor|testMonitor|deploymentMonitor|systemMonitor)\b/i,
          /\b(healthCheck|statusCheck|connectivityCheck|availabilityCheck)\b/i,

          // Monitoring data and events
          /\b(monitoringData|monitoringEvent|monitoringAlert|monitoringReport)\b/i,
          /\b(threshold|limit|boundary|range|tolerance|sensitivity)\b/i,
          /\b(frequency|interval|period|schedule|timing|cadence)\b/i,
        ],
        reason: 'Monitoring system variable - essential for real-time campaign oversight',
        confidence: 0.85,
        category: 'monitoring-system'
      },

      // Validation and quality assurance
      validationSystem: {
        patterns: [
          // Validation core
          /\b(validation|validator|validate|verify|check|test)\b/i,
          /\b(quality|assurance|qa|qc|control|standard)\b/i,
          /\b(compliance|conformance|adherence|consistency|correctness)\b/i,

          // Validation types
          /\b(buildValidation|codeValidation|dataValidation|configValidation)\b/i,
          /\b(syntaxValidation|semanticValidation|structuralValidation)\b/i,
          /\b(integrationValidation|systemValidation|acceptanceValidation)\b/i,

          // Validation results and reporting
          /\b(validationResult|validationReport|validationStatus|validationError)\b/i,
          /\b(passed|failed|success|failure|valid|invalid|error|warning)\b/i,
          /\b(criteria|requirement|specification|expectation|constraint)\b/i,
        ],
        reason: 'Validation system variable - critical for campaign quality assurance',
        confidence: 0.85,
        category: 'validation-system'
      },

      // Enterprise transformation features
      enterpriseTransformation: {
        patterns: [
          // Enterprise system core
          /\b(enterprise|business|corporate|organization|company)\b/i,
          /\b(transformation|evolution|modernization|upgrade|migration)\b/i,
          /\b(system|platform|infrastructure|architecture|framework)\b/i,

          // Enterprise intelligence
          /\b(enterpriseIntelligence|businessIntelligence|corporateAnalytics)\b/i,
          /\b(strategicInsight|operationalMetrics|performanceIndicator)\b/i,
          /\b(roi|returnOnInvestment|costBenefit|efficiency|productivity)\b/i,

          // Enterprise integration
          /\b(integration|interoperability|connectivity|compatibility)\b/i,
          /\b(api|service|microservice|endpoint|interface|gateway)\b/i,
          /\b(scalability|reliability|availability|maintainability)\b/i,
        ],
        reason: 'Enterprise transformation variable - valuable for future business intelligence features',
        confidence: 0.75,
        category: 'enterprise-transformation'
      },

      // Future transformation candidates
      futureTransformation: {
        patterns: [
          // Development and evolution
          /\b(future|upcoming|planned|roadmap|evolution|development)\b/i,
          /\b(enhancement|improvement|optimization|refinement|upgrade)\b/i,
          /\b(feature|capability|functionality|service|component)\b/i,

          // Transformation potential
          /\b(candidate|potential|opportunity|possibility|prospect)\b/i,
          /\b(activation|enablement|implementation|deployment|rollout)\b/i,
          /\b(experimental|prototype|pilot|proof|concept|demo)\b/i,

          // Strategic value
          /\b(strategic|tactical|operational|business|technical)\b/i,
          /\b(value|benefit|advantage|impact|outcome|result)\b/i,
          /\b(innovation|creativity|invention|discovery|breakthrough)\b/i,
        ],
        reason: 'Future transformation candidate - high potential for activation into monitoring features',
        confidence: 0.7,
        category: 'future-transformation'
      }
    };
  }

  /**
   * Detect campaign system variables in a given context
   * @param {string} variableName - The variable name to analyze
   * @param {string} filePath - The file path for context
   * @param {string} fileContent - The file content for additional context
   * @returns {Object} Detection result with preservation recommendation
   */
  detectCampaignDomain(variableName, filePath, fileContent = '') {
    const detectionResults = [];

    // Check each pattern category
    for (const [categoryName, categoryConfig] of Object.entries(this.patterns)) {
      const matchResult = this.checkPatternMatch(
        variableName,
        filePath,
        fileContent,
        categoryConfig
      );

      if (matchResult.isMatch) {
        detectionResults.push({
          category: categoryName,
          subcategory: categoryConfig.category,
          confidence: categoryConfig.confidence,
          reason: categoryConfig.reason,
          matchType: matchResult.matchType,
          matchedPattern: matchResult.matchedPattern
        });
      }
    }

    // Return the most specific match
    if (detectionResults.length > 0) {
      // Sort by specificity first, then confidence
      const sortedResults = detectionResults.sort((a, b) => {
        const aSpecific = this.getCategorySpecificity(a.category, variableName);
        const bSpecific = this.getCategorySpecificity(b.category, variableName);

        if (aSpecific !== bSpecific) {
          return bSpecific - aSpecific; // Higher specificity first
        }

        return b.confidence - a.confidence; // Higher confidence first
      });

      const bestMatch = sortedResults[0];

      return {
        shouldPreserve: true,
        domain: 'campaign',
        category: bestMatch.category,
        subcategory: bestMatch.subcategory,
        confidence: bestMatch.confidence,
        reason: bestMatch.reason,
        matchType: bestMatch.matchType,
        matchedPattern: bestMatch.matchedPattern,
        allMatches: detectionResults
      };
    }

    return {
      shouldPreserve: false,
      domain: 'generic',
      confidence: 0.1,
      reason: 'No campaign system patterns matched'
    };
  }

  /**
   * Get category specificity score for better matching
   * @param {string} category - Category name
   * @param {string} variableName - Variable name being matched
   * @returns {number} Specificity score (higher = more specific)
   */
  getCategorySpecificity(category, variableName) {
    const specificityMap = {
      // Most specific categories
      'validationSystem': variableName.toLowerCase().includes('validation') ? 10 : 1,
      'monitoringSystem': variableName.toLowerCase().includes('monitor') ? 10 : 1,
      'intelligenceSystem': variableName.toLowerCase().includes('intelligence') ? 10 : 1,
      'metricsSystem': variableName.toLowerCase().includes('metrics') ? 10 : 1,
      'safetyProtocols': variableName.toLowerCase().includes('safety') ? 10 : 1,
      'progressTracking': variableName.toLowerCase().includes('progress') ? 10 : 1,
      'campaignOrchestration': variableName.toLowerCase().includes('campaign') ? 10 : 1,

      // Less specific categories
      'enterpriseTransformation': 3,
      'futureTransformation': 2
    };

    return specificityMap[category] || 1;
  }

  /**
   * Check if a variable matches a specific pattern category
   * @param {string} variableName - Variable name to check
   * @param {string} filePath - File path for context
   * @param {string} fileContent - File content for context
   * @param {Object} categoryConfig - Pattern configuration
   * @returns {Object} Match result
   */
  checkPatternMatch(variableName, filePath, fileContent, categoryConfig) {
    // Check variable name patterns with exact matching for compound variables
    for (const pattern of categoryConfig.patterns) {
      if (pattern.test(variableName)) {
        return {
          isMatch: true,
          matchType: 'variable-name',
          matchedPattern: pattern.toString()
        };
      }
    }

    // Check file path patterns for campaign context
    const campaignPaths = [
      /\/campaign\//i,
      /\/services\/campaign\//i,
      /campaign.*system/i,
      /progress.*tracker/i,
      /safety.*protocol/i,
      /intelligence.*system/i,
      /monitoring.*system/i,
      /validation.*framework/i
    ];

    const isCampaignFile = campaignPaths.some(pathPattern =>
      pathPattern.test(filePath)
    );

    if (isCampaignFile) {
      // In campaign files, be more lenient with pattern matching
      for (const pattern of categoryConfig.patterns) {
        if (pattern.test(fileContent) && this.isVariableInContext(variableName, fileContent)) {
          return {
            isMatch: true,
            matchType: 'file-context',
            matchedPattern: pattern.toString()
          };
        }
      }
    }

    return {
      isMatch: false,
      matchType: 'none',
      matchedPattern: null
    };
  }

  /**
   * Check if a variable name appears in the context of campaign system operations
   * @param {string} variableName - Variable to check
   * @param {string} fileContent - File content to search
   * @returns {boolean} Whether variable appears in campaign context
   */
  isVariableInContext(variableName, fileContent) {
    // Look for the variable name in lines that contain campaign keywords
    const lines = fileContent.split('\n');
    const campaignKeywords = [
      'campaign', 'metrics', 'progress', 'safety', 'validation', 'intelligence',
      'monitor', 'tracker', 'analyzer', 'reporter', 'dashboard', 'system',
      'performance', 'quality', 'enterprise', 'transformation', 'automation'
    ];

    return lines.some(line => {
      const containsVariable = line.includes(variableName);
      const containsCampaignKeyword = campaignKeywords.some(keyword =>
        line.toLowerCase().includes(keyword)
      );
      return containsVariable && containsCampaignKeyword;
    });
  }

  /**
   * Get file-specific preservation rules based on file path
   * @param {string} filePath - File path to analyze
   * @returns {Object} File-specific preservation configuration
   */
  getFileSpecificRules(filePath) {
    const rules = {
      preservationLevel: 'standard',
      batchSize: 15,
      requiresManualReview: false,
      specialInstructions: []
    };

    // Core campaign infrastructure files (check first for highest precedence)
    const coreCampaignPaths = [
      /CampaignIntelligenceSystem/i,
      /IntelligenceSystem/i,
      /EnterpriseIntelligenceGenerator/i,
      /PerformanceMonitoringSystem/i,
      /DependencySecurityMonitor/i
    ];

    if (coreCampaignPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'maximum';
      rules.batchSize = 5;
      rules.requiresManualReview = true;
      rules.specialInstructions.push('Core campaign infrastructure - preserve all intelligence and monitoring variables');
      return rules; // Return early to prevent override
    }

    // High-preservation campaign system files
    const highPreservationPaths = [
      /\/services\/campaign\//i,
      /CampaignController/i,
      /ProgressTracker/i,
      /SafetyProtocol/i,
      /MonitoringSystem/i,
      /ValidationFramework/i
    ];

    if (highPreservationPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'high';
      rules.batchSize = 8;
      rules.requiresManualReview = true;
      rules.specialInstructions.push('Campaign system file - preserve metrics and monitoring variables');
    }

    // Future transformation candidate files
    const transformationPaths = [
      /transformation/i,
      /enterprise/i,
      /intelligence/i,
      /analytics/i
    ];

    if (transformationPaths.some(pattern => pattern.test(filePath))) {
      rules.preservationLevel = 'high';
      rules.batchSize = 10;
      rules.specialInstructions.push('Transformation candidate file - preserve variables for future activation');
    }

    return rules;
  }

  /**
   * Generate preservation report for campaign system domain
   * @param {Array} variables - Array of variables to analyze
   * @returns {Object} Comprehensive preservation report
   */
  generatePreservationReport(variables) {
    const report = {
      totalVariables: variables.length,
      preservedVariables: 0,
      categoryBreakdown: {},
      fileAnalysis: {},
      transformationCandidates: [],
      recommendations: []
    };

    variables.forEach(variable => {
      const detection = this.detectCampaignDomain(
        variable.variableName,
        variable.filePath,
        variable.fileContent || ''
      );

      if (detection.shouldPreserve) {
        report.preservedVariables++;

        // Category breakdown
        const category = detection.category || 'unknown';
        report.categoryBreakdown[category] = (report.categoryBreakdown[category] || 0) + 1;

        // File analysis
        const fileName = variable.filePath.split('/').pop();
        if (!report.fileAnalysis[fileName]) {
          report.fileAnalysis[fileName] = {
            totalVariables: 0,
            preservedVariables: 0,
            categories: new Set()
          };
        }
        report.fileAnalysis[fileName].totalVariables++;
        report.fileAnalysis[fileName].preservedVariables++;
        report.fileAnalysis[fileName].categories.add(category);

        // Track transformation candidates
        if (detection.category === 'futureTransformation' ||
            detection.subcategory === 'future-transformation') {
          report.transformationCandidates.push({
            variableName: variable.variableName,
            filePath: variable.filePath,
            confidence: detection.confidence,
            reason: detection.reason
          });
        }
      }
    });

    // Generate recommendations
    report.recommendations = this.generateCampaignRecommendations(report);

    return report;
  }

  /**
   * Generate specific recommendations for campaign system preservation
   * @param {Object} report - Analysis report
   * @returns {Array} Array of recommendations
   */
  generateCampaignRecommendations(report) {
    const recommendations = [];

    // High preservation rate recommendation
    const preservationRate = (report.preservedVariables / report.totalVariables) * 100;
    if (preservationRate > 25) {
      recommendations.push({
        type: 'high-preservation-rate',
        message: `${preservationRate.toFixed(1)}% of variables preserved for campaign system`,
        action: 'Consider activating preserved variables into monitoring and intelligence features',
        priority: 'high'
      });
    }

    // Transformation candidates recommendation
    if (report.transformationCandidates.length > 0) {
      recommendations.push({
        type: 'transformation-candidates',
        count: report.transformationCandidates.length,
        message: `${report.transformationCandidates.length} variables identified as transformation candidates`,
        action: 'Review for activation into enterprise intelligence features',
        priority: 'medium'
      });
    }

    // Category-specific recommendations
    Object.entries(report.categoryBreakdown).forEach(([category, count]) => {
      if (category === 'metricsSystem' && count > 5) {
        recommendations.push({
          type: 'metrics-concentration',
          category,
          count,
          message: `High concentration of metrics system variables (${count})`,
          action: 'Consider consolidating into comprehensive metrics dashboard',
          priority: 'medium'
        });
      }

      if (category === 'intelligenceSystem' && count > 3) {
        recommendations.push({
          type: 'intelligence-opportunity',
          category,
          count,
          message: `${count} intelligence system variables available for activation`,
          action: 'Evaluate for enterprise intelligence feature development',
          priority: 'high'
        });
      }
    });

    // File-specific recommendations
    Object.entries(report.fileAnalysis).forEach(([fileName, analysis]) => {
      if (analysis.preservedVariables > 8) {
        recommendations.push({
          type: 'file-concentration',
          fileName,
          count: analysis.preservedVariables,
          message: `File ${fileName} has ${analysis.preservedVariables} preserved campaign variables`,
          action: 'Consider refactoring to activate campaign system features',
          priority: 'medium'
        });
      }
    });

    return recommendations;
  }
}

module.exports = CampaignSystemDetector;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.CampaignSystemDetector = CampaignSystemDetector;
}
