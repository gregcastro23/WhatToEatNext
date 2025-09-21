#!/usr/bin/env node

/**
 * Variable Cluster Analysis System
 *
 * This system implements intelligent detection of related unused variable clusters,
 * transformation suggestions for incomplete features, and semantic value assessment
 * for variables in the WhatToEatNext codebase.
 *
 * Features:
 * - Semantic clustering of related variables
 * - Incomplete feature detection and transformation suggestions
 * - Value assessment based on domain knowledge and usage patterns
 * - Integration with existing domain preservation systems
 */

const fs = require('fs');
const path = require('path');

class VariableClusterAnalyzer {
  constructor() {
    this.clusters = new Map();
    this.semanticPatterns = this.initializeSemanticPatterns();
    this.transformationTemplates = this.initializeTransformationTemplates();
    this.valueAssessmentCriteria = this.initializeValueAssessmentCriteria();
  }

  /**
   * Initialize semantic patterns for clustering related variables
   */
  initializeSemanticPatterns() {
    return {
      // Astrological calculation clusters
      planetaryPositions: {
        patterns: [
          /\b(planet|planetary|position|longitude|latitude|degree|sign)\b/i,
          /\b(mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\b/i,
          /\b(coordinates|location|ephemeris|calculation)\b/i
        ],
        domain: 'astrological',
        category: 'planetary-calculations',
        transformationPotential: 'high',
        description: 'Planetary position calculation variables'
      },

      zodiacSigns: {
        patterns: [
          /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i,
          /\b(zodiac|sign|constellation|house)\b/i,
          /\b(element|quality|polarity|ruler)\b/i
        ],
        domain: 'astrological',
        category: 'zodiac-system',
        transformationPotential: 'high',
        description: 'Zodiac sign and house system variables'
      },

      elementalProperties: {
        patterns: [
          /\b(fire|water|earth|air)(?:Element|Properties|Balance|Harmony)?\b/i,
          /\b(elemental|element|harmony|compatibility|balance)\b/i,
          /\b(energy|flow|stability|movement)\b/i
        ],
        domain: 'astrological',
        category: 'elemental-system',
        transformationPotential: 'very-high',
        description: 'Four-element system variables'
      },

      // Campaign system clusters
      metricsAndMonitoring: {
        patterns: [
          /\b(metrics|monitoring|tracker|progress|dashboard)\b/i,
          /\b(count|total|percentage|rate|score|threshold)\b/i,
          /\b(baseline|target|achievement|improvement)\b/i
        ],
        domain: 'campaign',
        category: 'metrics-monitoring',
        transformationPotential: 'very-high',
        description: 'Metrics and monitoring system variables'
      },

      qualityAnalysis: {
        patterns: [
          /\b(typescript|eslint|linting|error|warning|analysis)\b/i,
          /\b(validation|quality|safety|protocol|check)\b/i,
          /\b(report|summary|breakdown|categorization)\b/i
        ],
        domain: 'campaign',
        category: 'quality-analysis',
        transformationPotential: 'high',
        description: 'Code quality analysis variables'
      },

      batchProcessing: {
        patterns: [
          /\b(batch|phase|wave|execution|processing)\b/i,
          /\b(rollback|safety|validation|checkpoint)\b/i,
          /\b(orchestrator|controller|processor|executor)\b/i
        ],
        domain: 'campaign',
        category: 'batch-processing',
        transformationPotential: 'high',
        description: 'Batch processing and safety variables'
      },

      // Culinary domain clusters
      ingredientSystem: {
        patterns: [
          /\b(ingredient|recipe|cuisine|cooking|culinary)\b/i,
          /\b(spice|herb|vegetable|fruit|protein|grain|dairy)\b/i,
          /\b(nutritional|dietary|allergen|restriction)\b/i
        ],
        domain: 'culinary',
        category: 'ingredient-system',
        transformationPotential: 'high',
        description: 'Ingredient and recipe system variables'
      },

      cookingMethods: {
        patterns: [
          /\b(preparation|method|technique|temperature|timing)\b/i,
          /\b(cooking|baking|roasting|steaming|grilling|frying)\b/i,
          /\b(duration|heat|process|step|instruction)\b/i
        ],
        domain: 'culinary',
        category: 'cooking-methods',
        transformationPotential: 'medium',
        description: 'Cooking method and technique variables'
      },

      // Service layer clusters
      apiIntegration: {
        patterns: [
          /\b(api|service|client|adapter|provider|repository)\b/i,
          /\b(request|response|payload|data|result|output)\b/i,
          /\b(endpoint|url|params|headers|auth)\b/i
        ],
        domain: 'service',
        category: 'api-integration',
        transformationPotential: 'medium',
        description: 'API integration and service variables'
      },

      dataProcessing: {
        patterns: [
          /\b(data|processing|transformation|validation|parsing)\b/i,
          /\b(filter|map|reduce|sort|group|aggregate)\b/i,
          /\b(cache|storage|persistence|database)\b/i
        ],
        domain: 'service',
        category: 'data-processing',
        transformationPotential: 'medium',
        description: 'Data processing and transformation variables'
      },

      // Development and testing clusters
      testInfrastructure: {
        patterns: [
          /\b(test|testing|spec|mock|stub|fixture)\b/i,
          /\b(expect|describe|it|should|assert|verify)\b/i,
          /\b(setup|teardown|beforeEach|afterEach|helper)\b/i
        ],
        domain: 'testing',
        category: 'test-infrastructure',
        transformationPotential: 'low',
        description: 'Testing framework and infrastructure variables'
      },

      developmentTools: {
        patterns: [
          /\b(debug|logging|console|trace|profile)\b/i,
          /\b(config|settings|options|parameters|props)\b/i,
          /\b(utility|helper|tool|script|automation)\b/i
        ],
        domain: 'development',
        category: 'development-tools',
        transformationPotential: 'low',
        description: 'Development tools and utilities variables'
      }
    };
  }

  /**
   * Initialize transformation templates for different cluster types
   */
  initializeTransformationTemplates() {
    return {
      'planetary-calculations': {
        transformationType: 'feature-activation',
        suggestions: [
          {
            name: 'Real-time Planetary Position Display',
            description: 'Transform unused planetary variables into live position displays',
            implementation: 'Create React components that show current planetary positions',
            effort: 'medium',
            value: 'high'
          },
          {
            name: 'Planetary Transit Notifications',
            description: 'Use planetary variables for transit timing alerts',
            implementation: 'Implement notification system for significant planetary events',
            effort: 'high',
            value: 'very-high'
          },
          {
            name: 'Enhanced Calculation Accuracy',
            description: 'Integrate unused variables into existing calculation engines',
            implementation: 'Extend current astronomical calculation functions',
            effort: 'low',
            value: 'high'
          }
        ]
      },

      'elemental-system': {
        transformationType: 'feature-enhancement',
        suggestions: [
          {
            name: 'Advanced Elemental Harmony Calculator',
            description: 'Transform elemental variables into sophisticated compatibility system',
            implementation: 'Create comprehensive elemental matching algorithms',
            effort: 'medium',
            value: 'very-high'
          },
          {
            name: 'Dynamic Elemental Balance Visualization',
            description: 'Use elemental variables for real-time balance displays',
            implementation: 'Build interactive elemental balance charts',
            effort: 'high',
            value: 'high'
          },
          {
            name: 'Seasonal Elemental Adaptation',
            description: 'Integrate elemental variables with seasonal calculations',
            implementation: 'Enhance seasonal recommendation algorithms',
            effort: 'medium',
            value: 'high'
          }
        ]
      },

      'metrics-monitoring': {
        transformationType: 'dashboard-activation',
        suggestions: [
          {
            name: 'Real-time Quality Metrics Dashboard',
            description: 'Transform metrics variables into live monitoring dashboard',
            implementation: 'Create comprehensive quality metrics visualization',
            effort: 'high',
            value: 'very-high'
          },
          {
            name: 'Progress Tracking System',
            description: 'Use progress variables for campaign tracking displays',
            implementation: 'Build progress visualization components',
            effort: 'medium',
            value: 'high'
          },
          {
            name: 'Performance Intelligence Reports',
            description: 'Transform monitoring variables into automated reporting',
            implementation: 'Create intelligent report generation system',
            effort: 'high',
            value: 'high'
          }
        ]
      },

      'quality-analysis': {
        transformationType: 'intelligence-system',
        suggestions: [
          {
            name: 'Automated Quality Intelligence',
            description: 'Transform analysis variables into predictive quality system',
            implementation: 'Build AI-powered quality prediction algorithms',
            effort: 'very-high',
            value: 'very-high'
          },
          {
            name: 'Error Pattern Recognition',
            description: 'Use error analysis variables for pattern detection',
            implementation: 'Create machine learning error classification system',
            effort: 'high',
            value: 'high'
          },
          {
            name: 'Quality Trend Analysis',
            description: 'Transform quality variables into trend analysis system',
            implementation: 'Build historical quality trend visualization',
            effort: 'medium',
            value: 'medium'
          }
        ]
      },

      'ingredient-system': {
        transformationType: 'feature-expansion',
        suggestions: [
          {
            name: 'Advanced Ingredient Compatibility',
            description: 'Transform ingredient variables into sophisticated matching system',
            implementation: 'Create multi-dimensional ingredient compatibility algorithms',
            effort: 'high',
            value: 'high'
          },
          {
            name: 'Cultural Cuisine Integration',
            description: 'Use cuisine variables for authentic cultural recommendations',
            implementation: 'Build culturally-aware recommendation engine',
            effort: 'very-high',
            value: 'very-high'
          },
          {
            name: 'Nutritional Intelligence System',
            description: 'Transform nutritional variables into health optimization features',
            implementation: 'Create personalized nutrition recommendation system',
            effort: 'high',
            value: 'high'
          }
        ]
      },

      'api-integration': {
        transformationType: 'service-enhancement',
        suggestions: [
          {
            name: 'API Performance Monitoring',
            description: 'Transform API variables into performance monitoring system',
            implementation: 'Create API health and performance dashboards',
            effort: 'medium',
            value: 'medium'
          },
          {
            name: 'Service Reliability Intelligence',
            description: 'Use service variables for reliability prediction',
            implementation: 'Build service health prediction algorithms',
            effort: 'high',
            value: 'medium'
          }
        ]
      },

      'data-processing': {
        transformationType: 'validation-system',
        suggestions: [
          {
            name: 'Data Quality Validation',
            description: 'Transform data variables into comprehensive validation system',
            implementation: 'Create automated data quality checking framework',
            effort: 'high',
            value: 'high'
          },
          {
            name: 'Processing Pipeline Optimization',
            description: 'Use processing variables for pipeline performance optimization',
            implementation: 'Build intelligent data processing optimization system',
            effort: 'very-high',
            value: 'medium'
          }
        ]
      }
    };
  }

  /**
   * Initialize value assessment criteria
   */
  initializeValueAssessmentCriteria() {
    return {
      domainRelevance: {
        weight: 0.3,
        scoring: {
          'astrological': 0.9,
          'campaign': 0.85,
          'culinary': 0.8,
          'service': 0.6,
          'testing': 0.4,
          'development': 0.3,
          'generic': 0.1
        }
      },
      transformationPotential: {
        weight: 0.25,
        scoring: {
          'very-high': 0.95,
          'high': 0.8,
          'medium': 0.6,
          'low': 0.3,
          'none': 0.1
        }
      },
      clusterSize: {
        weight: 0.2,
        scoring: (size) => Math.min(0.9, size * 0.1) // Larger clusters have higher value
      },
      semanticCoherence: {
        weight: 0.15,
        scoring: (coherence) => coherence // 0-1 based on pattern matching strength
      },
      businessValue: {
        weight: 0.1,
        scoring: {
          'core-feature': 0.9,
          'enhancement': 0.7,
          'monitoring': 0.6,
          'utility': 0.4,
          'development': 0.2
        }
      }
    };
  }

  /**
   * Analyze variables and detect clusters
   */
  analyzeVariableClusters(variables) {
    console.log('🔍 Analyzing variable clusters...');

    // Group variables by semantic patterns
    const clusters = this.groupVariablesBySemantics(variables);

    // Analyze each cluster for transformation potential
    const clusterAnalysis = this.analyzeClusterTransformationPotential(clusters);

    // Assess semantic value of each cluster
    const valueAssessment = this.assessClusterValues(clusterAnalysis);

    return {
      clusters: clusterAnalysis,
      valueAssessment,
      summary: this.generateClusterSummary(clusterAnalysis, valueAssessment)
    };
  }

  /**
   * Group variables by semantic patterns
   */
  groupVariablesBySemantics(variables) {
    const clusters = new Map();

    // Initialize clusters
    Object.keys(this.semanticPatterns).forEach(patternKey => {
      clusters.set(patternKey, {
        pattern: this.semanticPatterns[patternKey],
        variables: [],
        files: new Set(),
        contexts: new Set()
      });
    });

    // Classify each variable into clusters
    variables.forEach(variable => {
      let bestMatch = null;
      let bestScore = 0;

      Object.entries(this.semanticPatterns).forEach(([patternKey, pattern]) => {
        const score = this.calculateSemanticMatch(variable, pattern);
        if (score > bestScore && score > 0.1) { // Minimum threshold for clustering
          bestMatch = patternKey;
          bestScore = score;
        }
      });

      if (bestMatch) {
        const cluster = clusters.get(bestMatch);
        cluster.variables.push({
          ...variable,
          semanticScore: bestScore
        });
        cluster.files.add(variable.relativePath);
        cluster.contexts.add(this.extractContext(variable));
      }
    });

    // Remove empty clusters
    clusters.forEach((cluster, key) => {
      if (cluster.variables.length === 0) {
        clusters.delete(key);
      }
    });

    return clusters;
  }

  /**
   * Calculate semantic match score between variable and pattern
   */
  calculateSemanticMatch(variable, pattern) {
    let score = 0;
    let matches = 0;

    // Check variable name against patterns
    pattern.patterns.forEach(regex => {
      if (regex.test(variable.variableName)) {
        score += 0.4;
        matches++;
      }

      // Check file path
      if (regex.test(variable.relativePath)) {
        score += 0.3;
        matches++;
      }

      // Check message context
      if (regex.test(variable.message)) {
        score += 0.2;
        matches++;
      }
    });

    // Strong bonus for domain match - this is the most reliable indicator
    if (variable.preservation && variable.preservation.domain === pattern.domain) {
      score += 0.6; // Increased from 0.3 to make domain matching more influential
      matches++;
    }

    // Return raw score if any matches found, otherwise 0
    return matches > 0 ? Math.min(1.0, score) : 0;
  }

  /**
   * Extract context information from variable
   */
  extractContext(variable) {
    const contexts = [];

    // File type context
    contexts.push(`file:${variable.fileType}`);

    // Domain context
    if (variable.preservation && variable.preservation.domain) {
      contexts.push(`domain:${variable.preservation.domain}`);
    }

    // Risk level context
    contexts.push(`risk:${variable.riskLevel}`);

    // Directory context
    const pathParts = variable.relativePath.split('/');
    if (pathParts.length > 1) {
      contexts.push(`dir:${pathParts[0]}`);
    }

    return contexts.join(',');
  }

  /**
   * Analyze transformation potential for each cluster
   */
  analyzeClusterTransformationPotential(clusters) {
    const analysis = new Map();

    clusters.forEach((cluster, clusterKey) => {
      const pattern = cluster.pattern;
      const transformationTemplate = this.transformationTemplates[pattern.category];

      const clusterAnalysis = {
        id: clusterKey,
        name: pattern.description,
        domain: pattern.domain,
        category: pattern.category,
        size: cluster.variables.length,
        files: Array.from(cluster.files),
        contexts: Array.from(cluster.contexts),
        variables: cluster.variables,

        // Transformation analysis
        transformationPotential: pattern.transformationPotential,
        transformationType: transformationTemplate?.transformationType || 'unknown',
        suggestions: transformationTemplate?.suggestions || [],

        // Cluster characteristics
        semanticCoherence: this.calculateSemanticCoherence(cluster),
        fileDistribution: this.analyzeFileDistribution(cluster),
        domainConsistency: this.analyzeDomainConsistency(cluster),

        // Incomplete feature detection
        incompleteFeatures: this.detectIncompleteFeatures(cluster),
        activationOpportunities: this.identifyActivationOpportunities(cluster)
      };

      analysis.set(clusterKey, clusterAnalysis);
    });

    return analysis;
  }

  /**
   * Calculate semantic coherence of a cluster
   */
  calculateSemanticCoherence(cluster) {
    if (cluster.variables.length === 0) return 0;

    const avgSemanticScore = cluster.variables.reduce((sum, v) => sum + v.semanticScore, 0) / cluster.variables.length;
    const fileSpread = cluster.files.size;
    const contextVariety = cluster.contexts.size;

    // Higher coherence for higher semantic scores, but penalize excessive spread
    let coherence = avgSemanticScore;

    // Slight penalty for too much file spread (indicates loose coupling)
    if (fileSpread > 10) {
      coherence *= 0.9;
    }

    // Bonus for moderate context variety (indicates good domain coverage)
    if (contextVariety >= 2 && contextVariety <= 5) {
      coherence *= 1.1;
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Analyze file distribution within cluster
   */
  analyzeFileDistribution(cluster) {
    const fileTypes = {};
    const directories = {};

    cluster.variables.forEach(variable => {
      fileTypes[variable.fileType] = (fileTypes[variable.fileType] || 0) + 1;

      const dir = variable.relativePath.split('/')[0];
      directories[dir] = (directories[dir] || 0) + 1;
    });

    return {
      fileTypes,
      directories,
      concentration: this.calculateConcentration(fileTypes),
      spread: Object.keys(directories).length
    };
  }

  /**
   * Calculate concentration metric (how concentrated variables are in specific file types)
   */
  calculateConcentration(distribution) {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...Object.values(distribution));
    return maxCount / total; // 1.0 = all in one type, 0.x = distributed
  }

  /**
   * Analyze domain consistency within cluster
   */
  analyzeDomainConsistency(cluster) {
    const domains = {};

    cluster.variables.forEach(variable => {
      const domain = variable.preservation?.domain || 'unknown';
      domains[domain] = (domains[domain] || 0) + 1;
    });

    const totalVariables = cluster.variables.length;
    const dominantDomain = Object.entries(domains).reduce((max, [domain, count]) =>
      count > max.count ? { domain, count } : max, { domain: 'none', count: 0 });

    return {
      domains,
      dominantDomain: dominantDomain.domain,
      consistency: dominantDomain.count / totalVariables,
      domainSpread: Object.keys(domains).length
    };
  }

  /**
   * Detect incomplete features within cluster
   */
  detectIncompleteFeatures(cluster) {
    const incompleteFeatures = [];

    // Look for patterns that suggest incomplete implementations
    const variableNames = cluster.variables.map(v => v.variableName);

    // Pattern 1: Variables with similar prefixes/suffixes suggesting a feature set
    const prefixGroups = this.groupByPrefix(variableNames);
    Object.entries(prefixGroups).forEach(([prefix, names]) => {
      if (names.length >= 3) { // At least 3 related variables
        incompleteFeatures.push({
          type: 'feature-set',
          pattern: `${prefix}*`,
          variables: names,
          description: `Incomplete feature set with prefix '${prefix}'`,
          completionSuggestion: `Consider implementing complete ${prefix} functionality`
        });
      }
    });

    // Pattern 2: Variables in same file suggesting incomplete feature
    const fileGroups = {};
    cluster.variables.forEach(variable => {
      const file = variable.relativePath;
      if (!fileGroups[file]) fileGroups[file] = [];
      fileGroups[file].push(variable.variableName);
    });

    Object.entries(fileGroups).forEach(([file, names]) => {
      if (names.length >= 4) { // At least 4 unused variables in same file
        incompleteFeatures.push({
          type: 'file-feature',
          pattern: file,
          variables: names,
          description: `Multiple unused variables in ${file} suggest incomplete feature`,
          completionSuggestion: `Review ${file} for incomplete feature implementation`
        });
      }
    });

    // Pattern 3: Sequential or related naming patterns
    const sequentialPatterns = this.detectSequentialPatterns(variableNames);
    sequentialPatterns.forEach(pattern => {
      incompleteFeatures.push({
        type: 'sequential-feature',
        pattern: pattern.pattern,
        variables: pattern.variables,
        description: `Sequential naming pattern suggests incomplete feature: ${pattern.pattern}`,
        completionSuggestion: `Complete the sequence or implement the full feature set`
      });
    });

    return incompleteFeatures;
  }

  /**
   * Group variable names by common prefixes
   */
  groupByPrefix(names) {
    const groups = {};

    names.forEach(name => {
      // Extract potential prefixes (camelCase or underscore separated)
      const prefixes = this.extractPrefixes(name);

      prefixes.forEach(prefix => {
        if (prefix.length >= 3) { // Minimum meaningful prefix length
          if (!groups[prefix]) groups[prefix] = [];
          groups[prefix].push(name);
        }
      });
    });

    // Filter to only meaningful groups
    Object.keys(groups).forEach(prefix => {
      if (groups[prefix].length < 2) {
        delete groups[prefix];
      }
    });

    return groups;
  }

  /**
   * Extract potential prefixes from variable name
   */
  extractPrefixes(name) {
    const prefixes = [];

    // CamelCase prefixes
    const camelMatches = name.match(/^([a-z]+)([A-Z]|$)/);
    if (camelMatches) {
      prefixes.push(camelMatches[1]);
    }

    // Underscore prefixes
    const underscoreMatch = name.match(/^([^_]+)_/);
    if (underscoreMatch) {
      prefixes.push(underscoreMatch[1]);
    }

    // Common word prefixes
    const commonPrefixes = ['get', 'set', 'is', 'has', 'can', 'should', 'will', 'handle', 'process', 'calculate', 'validate', 'create', 'update', 'delete'];
    commonPrefixes.forEach(prefix => {
      if (name.toLowerCase().startsWith(prefix)) {
        prefixes.push(prefix);
      }
    });

    return prefixes;
  }

  /**
   * Detect sequential naming patterns
   */
  detectSequentialPatterns(names) {
    const patterns = [];

    // Look for numbered sequences
    const numberedGroups = {};
    names.forEach(name => {
      const match = name.match(/^(.+?)(\d+)(.*)$/);
      if (match) {
        const [, prefix, number, suffix] = match;
        const key = `${prefix}#${suffix}`;
        if (!numberedGroups[key]) numberedGroups[key] = [];
        numberedGroups[key].push({ name, number: parseInt(number) });
      }
    });

    Object.entries(numberedGroups).forEach(([key, items]) => {
      if (items.length >= 2) {
        const [prefix, suffix] = key.split('#');
        const numbers = items.map(item => item.number).sort((a, b) => a - b);

        // Check for gaps in sequence
        const hasGaps = numbers.some((num, index) =>
          index > 0 && num !== numbers[index - 1] + 1
        );

        if (hasGaps || numbers.length >= 3) {
          patterns.push({
            pattern: `${prefix}[${numbers[0]}-${numbers[numbers.length - 1]}]${suffix}`,
            variables: items.map(item => item.name),
            type: hasGaps ? 'incomplete-sequence' : 'complete-sequence'
          });
        }
      }
    });

    return patterns;
  }

  /**
   * Identify activation opportunities for cluster variables
   */
  identifyActivationOpportunities(cluster) {
    const opportunities = [];

    // Opportunity 1: Dashboard integration for monitoring variables
    if (cluster.pattern.domain === 'campaign' && cluster.size >= 5) {
      opportunities.push({
        type: 'dashboard-integration',
        priority: 'high',
        description: 'Transform monitoring variables into real-time dashboard',
        implementation: 'Create React dashboard components using these variables',
        estimatedEffort: 'medium',
        businessValue: 'high'
      });
    }

    // Opportunity 2: Feature completion for astrological variables
    if (cluster.pattern.domain === 'astrological' && cluster.size >= 3) {
      opportunities.push({
        type: 'feature-completion',
        priority: 'very-high',
        description: 'Complete astrological calculation features',
        implementation: 'Integrate variables into existing calculation engines',
        estimatedEffort: 'low-medium',
        businessValue: 'very-high'
      });
    }

    // Opportunity 3: Service enhancement for API variables
    if (cluster.pattern.domain === 'service' && cluster.fileDistribution && cluster.fileDistribution.concentration > 0.7) {
      opportunities.push({
        type: 'service-enhancement',
        priority: 'medium',
        description: 'Enhance service layer with unused variables',
        implementation: 'Integrate variables into service monitoring and optimization',
        estimatedEffort: 'medium',
        businessValue: 'medium'
      });
    }

    // Opportunity 4: Validation system for data processing variables
    if (cluster.pattern.category === 'data-processing' && cluster.size >= 4) {
      opportunities.push({
        type: 'validation-system',
        priority: 'medium',
        description: 'Create comprehensive data validation system',
        implementation: 'Build validation framework using processing variables',
        estimatedEffort: 'high',
        businessValue: 'medium-high'
      });
    }

    return opportunities;
  }

  /**
   * Assess semantic value of clusters
   */
  assessClusterValues(clusterAnalysis) {
    const valueAssessment = new Map();

    clusterAnalysis.forEach((cluster, clusterId) => {
      const criteria = this.valueAssessmentCriteria;
      let totalScore = 0;

      // Domain relevance score
      const domainScore = criteria.domainRelevance.scoring[cluster.domain] || 0.1;
      totalScore += domainScore * criteria.domainRelevance.weight;

      // Transformation potential score
      const transformationScore = criteria.transformationPotential.scoring[cluster.transformationPotential] || 0.1;
      totalScore += transformationScore * criteria.transformationPotential.weight;

      // Cluster size score
      const sizeScore = criteria.clusterSize.scoring(cluster.size);
      totalScore += sizeScore * criteria.clusterSize.weight;

      // Semantic coherence score
      const coherenceScore = cluster.semanticCoherence;
      totalScore += coherenceScore * criteria.semanticCoherence.weight;

      // Business value score (based on transformation opportunities)
      const businessScore = this.calculateBusinessValue(cluster);
      totalScore += businessScore * criteria.businessValue.weight;

      valueAssessment.set(clusterId, {
        totalScore,
        breakdown: {
          domainRelevance: domainScore,
          transformationPotential: transformationScore,
          clusterSize: sizeScore,
          semanticCoherence: coherenceScore,
          businessValue: businessScore
        },
        grade: this.scoreToGrade(totalScore),
        recommendation: this.generateValueRecommendation(totalScore, cluster)
      });
    });

    return valueAssessment;
  }

  /**
   * Calculate business value score for cluster
   */
  calculateBusinessValue(cluster) {
    let score = 0.5; // Base score

    // High value for core domain features
    if (cluster.domain === 'astrological' || cluster.domain === 'culinary') {
      score = 0.9;
    } else if (cluster.domain === 'campaign') {
      score = 0.7;
    }

    // Bonus for activation opportunities
    if (cluster.activationOpportunities.length > 0) {
      const highPriorityOps = cluster.activationOpportunities.filter(op =>
        op.priority === 'high' || op.priority === 'very-high'
      ).length;
      score += highPriorityOps * 0.1;
    }

    // Bonus for incomplete features (transformation potential)
    if (cluster.incompleteFeatures.length > 0) {
      score += cluster.incompleteFeatures.length * 0.05;
    }

    return Math.min(0.9, score);
  }

  /**
   * Convert numeric score to letter grade
   */
  scoreToGrade(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B+';
    if (score >= 0.6) return 'B';
    if (score >= 0.5) return 'C+';
    if (score >= 0.4) return 'C';
    if (score >= 0.3) return 'D';
    return 'F';
  }

  /**
   * Generate value-based recommendation
   */
  generateValueRecommendation(score, cluster) {
    if (score >= 0.8) {
      return {
        action: 'transform',
        priority: 'high',
        description: `High-value cluster with excellent transformation potential. Prioritize for feature development.`
      };
    } else if (score >= 0.6) {
      return {
        action: 'transform',
        priority: 'medium',
        description: `Good transformation candidate. Consider for next development cycle.`
      };
    } else if (score >= 0.4) {
      return {
        action: 'review',
        priority: 'low',
        description: `Moderate value. Review for potential prefixing or selective transformation.`
      };
    } else {
      return {
        action: 'eliminate',
        priority: 'low',
        description: `Low value cluster. Consider for elimination with appropriate safety protocols.`
      };
    }
  }

  /**
   * Generate comprehensive cluster summary
   */
  generateClusterSummary(clusterAnalysis, valueAssessment) {
    const totalVariables = Array.from(clusterAnalysis.values())
      .reduce((sum, cluster) => sum + cluster.size, 0);

    const domainDistribution = {};
    const transformationPotentialDistribution = {};
    const valueGradeDistribution = {};

    clusterAnalysis.forEach((cluster, clusterId) => {
      // Domain distribution
      domainDistribution[cluster.domain] = (domainDistribution[cluster.domain] || 0) + cluster.size;

      // Transformation potential distribution
      transformationPotentialDistribution[cluster.transformationPotential] =
        (transformationPotentialDistribution[cluster.transformationPotential] || 0) + cluster.size;

      // Value grade distribution
      const grade = valueAssessment.get(clusterId).grade;
      valueGradeDistribution[grade] = (valueGradeDistribution[grade] || 0) + cluster.size;
    });

    // Calculate high-value transformation candidates
    const highValueClusters = Array.from(valueAssessment.entries())
      .filter(([, assessment]) => assessment.totalScore >= 0.7)
      .map(([clusterId]) => clusterId);

    // Calculate incomplete features count
    const totalIncompleteFeatures = Array.from(clusterAnalysis.values())
      .reduce((sum, cluster) => sum + cluster.incompleteFeatures.length, 0);

    // Calculate activation opportunities
    const totalActivationOpportunities = Array.from(clusterAnalysis.values())
      .reduce((sum, cluster) => sum + cluster.activationOpportunities.length, 0);

    return {
      totalClusters: clusterAnalysis.size,
      totalVariables,
      averageClusterSize: totalVariables / clusterAnalysis.size,

      distributions: {
        domains: domainDistribution,
        transformationPotential: transformationPotentialDistribution,
        valueGrades: valueGradeDistribution
      },

      transformationInsights: {
        highValueClusters: highValueClusters.length,
        totalIncompleteFeatures,
        totalActivationOpportunities,
        transformationReadiness: this.calculateTransformationReadiness(clusterAnalysis, valueAssessment)
      },

      recommendations: {
        priorityClusters: highValueClusters,
        quickWins: this.identifyQuickWins(clusterAnalysis, valueAssessment),
        strategicOpportunities: this.identifyStrategicOpportunities(clusterAnalysis, valueAssessment)
      }
    };
  }

  /**
   * Calculate overall transformation readiness score
   */
  calculateTransformationReadiness(clusterAnalysis, valueAssessment) {
    let totalScore = 0;
    let totalWeight = 0;

    valueAssessment.forEach((assessment, clusterId) => {
      const cluster = clusterAnalysis.get(clusterId);
      const weight = cluster.size; // Weight by cluster size

      totalScore += assessment.totalScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? (totalScore / totalWeight) : 0;
  }

  /**
   * Identify quick win transformation opportunities
   */
  identifyQuickWins(clusterAnalysis, valueAssessment) {
    const quickWins = [];

    clusterAnalysis.forEach((cluster, clusterId) => {
      const assessment = valueAssessment.get(clusterId);

      // Quick wins: high value, low effort
      if (assessment.totalScore >= 0.7 && cluster.size <= 10) {
        const lowEffortOpportunities = cluster.activationOpportunities.filter(op =>
          op.estimatedEffort === 'low' || op.estimatedEffort === 'low-medium'
        );

        if (lowEffortOpportunities.length > 0) {
          quickWins.push({
            clusterId,
            clusterName: cluster.name,
            score: assessment.totalScore,
            size: cluster.size,
            opportunities: lowEffortOpportunities
          });
        }
      }
    });

    return quickWins.sort((a, b) => b.score - a.score);
  }

  /**
   * Identify strategic transformation opportunities
   */
  identifyStrategicOpportunities(clusterAnalysis, valueAssessment) {
    const strategic = [];

    clusterAnalysis.forEach((cluster, clusterId) => {
      const assessment = valueAssessment.get(clusterId);

      // Strategic opportunities: very high value, any effort
      if (assessment.totalScore >= 0.8) {
        const highValueOpportunities = cluster.activationOpportunities.filter(op =>
          op.businessValue === 'high' || op.businessValue === 'very-high'
        );

        if (highValueOpportunities.length > 0 || cluster.incompleteFeatures.length > 0) {
          strategic.push({
            clusterId,
            clusterName: cluster.name,
            score: assessment.totalScore,
            size: cluster.size,
            domain: cluster.domain,
            opportunities: highValueOpportunities,
            incompleteFeatures: cluster.incompleteFeatures.length
          });
        }
      }
    });

    return strategic.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate detailed cluster analysis report
   */
  generateDetailedReport(analysisResults) {
    const { clusters, valueAssessment, summary } = analysisResults;

    return {
      metadata: {
        analysisDate: new Date().toISOString(),
        analyzer: 'VariableClusterAnalyzer v1.0',
        totalClusters: summary.totalClusters,
        totalVariables: summary.totalVariables
      },

      executiveSummary: {
        clusterCount: summary.totalClusters,
        variableCount: summary.totalVariables,
        averageClusterSize: Math.round(summary.averageClusterSize * 10) / 10,
        transformationReadiness: Math.round(summary.transformationInsights.transformationReadiness * 100),
        highValueClusters: summary.transformationInsights.highValueClusters,
        quickWinOpportunities: summary.recommendations.quickWins.length,
        strategicOpportunities: summary.recommendations.strategicOpportunities.length
      },

      clusterAnalysis: Array.from(clusters.entries()).map(([clusterId, cluster]) => ({
        id: clusterId,
        name: cluster.name,
        domain: cluster.domain,
        category: cluster.category,
        size: cluster.size,
        files: cluster.files.length,
        semanticCoherence: Math.round(cluster.semanticCoherence * 100),
        transformationPotential: cluster.transformationPotential,
        valueAssessment: {
          score: Math.round(valueAssessment.get(clusterId).totalScore * 100),
          grade: valueAssessment.get(clusterId).grade,
          recommendation: valueAssessment.get(clusterId).recommendation
        },
        incompleteFeatures: cluster.incompleteFeatures.length,
        activationOpportunities: cluster.activationOpportunities.length,
        topSuggestions: cluster.suggestions.slice(0, 2)
      })),

      transformationOpportunities: {
        quickWins: summary.recommendations.quickWins,
        strategic: summary.recommendations.strategicOpportunities,
        totalOpportunities: summary.transformationInsights.totalActivationOpportunities
      },

      detailedClusters: Object.fromEntries(clusters),
      valueAssessments: Object.fromEntries(valueAssessment)
    };
  }
}

module.exports = VariableClusterAnalyzer;
