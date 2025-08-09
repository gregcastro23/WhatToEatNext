/**
 * Intelligent Pattern Recognition System - Phase 3.10 Implementation
 *
 * Advanced pattern recognition system for TypeScript errors using ML-inspired algorithms
 * Provides predictive analytics, pattern clustering, and intelligent classification
 *
 * Features:
 * - Multi-dimensional pattern analysis
 * - Predictive error modeling
 * - Pattern clustering and classification
 * - Behavioral pattern learning
 * - Context-aware pattern matching
 * - Evolutionary pattern adaptation
 */

import { TypeScriptError, ErrorCategory, ErrorSeverity } from './campaign/TypeScriptErrorAnalyzer';
import { ErrorPattern, ErrorTrend } from './ErrorTrackingEnterpriseSystem';

// ========== PATTERN RECOGNITION INTERFACES ==========

export interface PatternFeature {
  featureId: string;
  name: string;
  value: number;
  weight: number;
  category: 'syntax' | 'semantic' | 'structural' | 'contextual';
  stability: number; // How stable this feature is over time
}

export interface PatternSignature {
  signatureId: string;
  features: PatternFeature[];
  confidence: number;
  errorCode: string;
  category: ErrorCategory;
  occurrences: number;
  lastSeen: Date;
  evolutionScore: number; // How much this pattern has changed
}

export interface PatternCluster {
  clusterId: string;
  centerSignature: PatternSignature;
  signatures: PatternSignature[];
  density: number;
  stability: number;
  predictiveValue: number;
  fixStrategy: string;
  automationReadiness: number;
}

export interface PatternPrediction {
  predictionId: string;
  targetCategory: ErrorCategory;
  probability: number;
  confidence: number;
  timeframe: number; // minutes
  triggerConditions: string[];
  recommendedActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PatternEvolution {
  evolutionId: string;
  patternId: string;
  changeVector: number[];
  changeRate: number;
  adaptationScore: number;
  stabilityTrend: 'increasing' | 'decreasing' | 'stable';
  lastEvolution: Date;
}

export interface PatternInsight {
  insightId: string;
  type: 'clustering' | 'prediction' | 'evolution' | 'anomaly';
  significance: number;
  description: string;
  actionable: boolean;
  evidence: string[];
  recommendations: string[];
}

// ========== INTELLIGENT PATTERN RECOGNITION SYSTEM ==========

export class IntelligentPatternRecognition {
  private signatures: Map<string, PatternSignature> = new Map();
  private clusters: PatternCluster[] = [];
  private predictions: PatternPrediction[] = [];
  private evolutions: Map<string, PatternEvolution> = new Map();
  private learningRate: number = 0.1;
  private clusteringThreshold: number = 0.7;
  private predictionHorizon: number = 60; // minutes
  private readonly FEATURE_WEIGHTS = {
    syntax: 0.25,
    semantic: 0.35,
    structural: 0.25,
    contextual: 0.15,
  };

  // ========== PATTERN FEATURE EXTRACTION ==========

  /**
   * Extract comprehensive features from TypeScript errors
   */
  extractPatternFeatures(error: TypeScriptError): PatternFeature[] {
    const features: PatternFeature[] = [];

    // Syntax features
    features.push(...this.extractSyntaxFeatures(error));

    // Semantic features
    features.push(...this.extractSemanticFeatures(error));

    // Structural features
    features.push(...this.extractStructuralFeatures(error));

    // Contextual features
    features.push(...this.extractContextualFeatures(error));

    return features;
  }

  /**
   * Extract syntax-related features
   */
  private extractSyntaxFeatures(error: TypeScriptError): PatternFeature[] {
    const features: PatternFeature[] = [];

    // Error code feature
    features.push({
      featureId: 'syntax_error_code',
      name: 'Error Code',
      value: parseInt(error.code.replace('TS', '')) / 10000, // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.syntax,
      category: 'syntax',
      stability: 0.95, // Error codes are very stable
    });

    // Message length feature
    features.push({
      featureId: 'syntax_message_length',
      name: 'Message Length',
      value: Math.min(error.message.length / 200, 1), // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.syntax * 0.3,
      category: 'syntax',
      stability: 0.8,
    });

    // Special character density
    const specialChars = error.message.match(/[^\w\s]/g) || [];
    features.push({
      featureId: 'syntax_special_chars',
      name: 'Special Character Density',
      value: specialChars.length / error.message.length,
      weight: this.FEATURE_WEIGHTS.syntax * 0.2,
      category: 'syntax',
      stability: 0.75,
    });

    return features;
  }

  /**
   * Extract semantic features
   */
  private extractSemanticFeatures(error: TypeScriptError): PatternFeature[] {
    const features: PatternFeature[] = [];

    // Type-related keywords
    const typeKeywords = ['type', 'interface', 'class', 'function', 'method'];
    const typeKeywordCount = typeKeywords.reduce(
      (count, keyword) => count + (error.message.toLowerCase().includes(keyword) ? 1 : 0),
      0,
    );

    features.push({
      featureId: 'semantic_type_keywords',
      name: 'Type Keywords',
      value: typeKeywordCount / typeKeywords.length,
      weight: this.FEATURE_WEIGHTS.semantic * 0.4,
      category: 'semantic',
      stability: 0.9,
    });

    // Assignment-related keywords
    const assignmentKeywords = ['assignable', 'assign', 'conversion', 'cast'];
    const assignmentKeywordCount = assignmentKeywords.reduce(
      (count, keyword) => count + (error.message.toLowerCase().includes(keyword) ? 1 : 0),
      0,
    );

    features.push({
      featureId: 'semantic_assignment_keywords',
      name: 'Assignment Keywords',
      value: assignmentKeywordCount / assignmentKeywords.length,
      weight: this.FEATURE_WEIGHTS.semantic * 0.3,
      category: 'semantic',
      stability: 0.85,
    });

    // Generic type complexity
    const genericMatches = error.message.match(/<[^>]+>/g) || [];
    features.push({
      featureId: 'semantic_generic_complexity',
      name: 'Generic Type Complexity',
      value: Math.min(genericMatches.length / 5, 1), // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.semantic * 0.3,
      category: 'semantic',
      stability: 0.7,
    });

    return features;
  }

  /**
   * Extract structural features
   */
  private extractStructuralFeatures(error: TypeScriptError): PatternFeature[] {
    const features: PatternFeature[] = [];

    // File path depth
    const pathDepth = error.filePath.split('/').length;
    features.push({
      featureId: 'structural_path_depth',
      name: 'File Path Depth',
      value: Math.min(pathDepth / 10, 1), // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.structural * 0.2,
      category: 'structural',
      stability: 0.9,
    });

    // File type feature
    const fileExtension = error.filePath.split('.').pop() || '';
    const fileTypeScore = this.getFileTypeScore(fileExtension);
    features.push({
      featureId: 'structural_file_type',
      name: 'File Type',
      value: fileTypeScore,
      weight: this.FEATURE_WEIGHTS.structural * 0.3,
      category: 'structural',
      stability: 0.95,
    });

    // Line position feature
    features.push({
      featureId: 'structural_line_position',
      name: 'Line Position',
      value: Math.min(error.line / 1000, 1), // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.structural * 0.1,
      category: 'structural',
      stability: 0.6,
    });

    // Column position feature
    features.push({
      featureId: 'structural_column_position',
      name: 'Column Position',
      value: Math.min(error.column / 100, 1), // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.structural * 0.1,
      category: 'structural',
      stability: 0.5,
    });

    // Directory type feature
    const directoryType = this.getDirectoryType(error.filePath);
    features.push({
      featureId: 'structural_directory_type',
      name: 'Directory Type',
      value: directoryType,
      weight: this.FEATURE_WEIGHTS.structural * 0.3,
      category: 'structural',
      stability: 0.9,
    });

    return features;
  }

  /**
   * Extract contextual features
   */
  private extractContextualFeatures(error: TypeScriptError): PatternFeature[] {
    const features: PatternFeature[] = [];

    // Error priority feature
    features.push({
      featureId: 'contextual_priority',
      name: 'Error Priority',
      value: error.priority / 30, // Normalize to 0-1 (assuming max priority is 30)
      weight: this.FEATURE_WEIGHTS.contextual * 0.4,
      category: 'contextual',
      stability: 0.8,
    });

    // Severity feature
    const severityScore =
      error.severity === ErrorSeverity.HIGH
        ? 1
        : error.severity === ErrorSeverity.MEDIUM
          ? 0.6
          : 0.3;
    features.push({
      featureId: 'contextual_severity',
      name: 'Error Severity',
      value: severityScore,
      weight: this.FEATURE_WEIGHTS.contextual * 0.4,
      category: 'contextual',
      stability: 0.85,
    });

    // Time-based feature (hour of day when error was detected)
    const currentHour = new Date().getHours();
    features.push({
      featureId: 'contextual_time_of_day',
      name: 'Time of Day',
      value: currentHour / 24, // Normalize to 0-1
      weight: this.FEATURE_WEIGHTS.contextual * 0.2,
      category: 'contextual',
      stability: 0.3,
    });

    return features;
  }

  /**
   * Get file type score based on extension
   */
  private getFileTypeScore(extension: string): number {
    const scores: Record<string, number> = {
      ts: 1.0,
      tsx: 0.9,
      js: 0.7,
      jsx: 0.6,
      vue: 0.5,
      svelte: 0.4,
      json: 0.3,
      md: 0.1,
    };

    return scores[extension] || 0.2;
  }

  /**
   * Get directory type score based on path
   */
  private getDirectoryType(filePath: string): number {
    const path = filePath.toLowerCase();

    if (path.includes('/types/')) return 1.0;
    if (path.includes('/services/')) return 0.9;
    if (path.includes('/components/')) return 0.8;
    if (path.includes('/utils/')) return 0.7;
    if (path.includes('/data/')) return 0.6;
    if (path.includes('/test/')) return 0.3;
    if (path.includes('/docs/')) return 0.1;

    return 0.5;
  }

  // ========== PATTERN SIGNATURE CREATION ==========

  /**
   * Create pattern signature from error features
   */
  createPatternSignature(error: TypeScriptError): PatternSignature {
    const features = this.extractPatternFeatures(error);
    const signatureId = this.generateSignatureId(error, features);

    const signature: PatternSignature = {
      signatureId,
      features,
      confidence: this.calculateSignatureConfidence(features),
      errorCode: error.code,
      category: error.category,
      occurrences: 1,
      lastSeen: new Date(),
      evolutionScore: 0,
    };

    return signature;
  }

  /**
   * Generate unique signature ID
   */
  private generateSignatureId(error: TypeScriptError, features: PatternFeature[]): string {
    const featureHash = features.map(f => `${f.featureId}:${f.value.toFixed(2)}`).join('|');

    return `sig_${error.code}_${this.simpleHash(featureHash)}`;
  }

  /**
   * Simple hash function for signature generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate signature confidence based on feature stability
   */
  private calculateSignatureConfidence(features: PatternFeature[]): number {
    const avgStability = features.reduce((sum, f) => sum + f.stability, 0) / features.length;
    const featureCount = features.length;
    const completeness = Math.min(featureCount / 10, 1); // Ideal feature count is 10

    return avgStability * 0.7 + completeness * 0.3;
  }

  // ========== PATTERN CLUSTERING ==========

  /**
   * Perform intelligent pattern clustering
   */
  performPatternClustering(): PatternCluster[] {
    const signatures = Array.from(this.signatures.values());
    const clusters: PatternCluster[] = [];
    const processed = new Set<string>();

    for (const signature of signatures) {
      if (processed.has(signature.signatureId)) continue;

      const cluster = this.createCluster(signature, signatures, processed);
      if (cluster.signatures.length > 1) {
        clusters.push(cluster);
      }
    }

    this.clusters = clusters;
    return clusters;
  }

  /**
   * Create cluster around a center signature
   */
  private createCluster(
    centerSignature: PatternSignature,
    allSignatures: PatternSignature[],
    processed: Set<string>,
  ): PatternCluster {
    const clusterSignatures = [centerSignature];
    processed.add(centerSignature.signatureId);

    for (const signature of allSignatures) {
      if (processed.has(signature.signatureId)) continue;

      const similarity = this.calculateSignatureSimilarity(centerSignature, signature);
      if (similarity >= this.clusteringThreshold) {
        clusterSignatures.push(signature);
        processed.add(signature.signatureId);
      }
    }

    const clusterId = `cluster_${centerSignature.errorCode}_${Date.now()}`;
    const density = this.calculateClusterDensity(clusterSignatures);
    const stability = this.calculateClusterStability(clusterSignatures);
    const predictiveValue = this.calculatePredictiveValue(clusterSignatures);
    const fixStrategy = this.determineFixStrategy(clusterSignatures);
    const automationReadiness = this.calculateAutomationReadiness(clusterSignatures);

    return {
      clusterId,
      centerSignature,
      signatures: clusterSignatures,
      density,
      stability,
      predictiveValue,
      fixStrategy,
      automationReadiness,
    };
  }

  /**
   * Calculate similarity between two signatures
   */
  private calculateSignatureSimilarity(sig1: PatternSignature, sig2: PatternSignature): number {
    if (sig1.errorCode !== sig2.errorCode) return 0;

    let similarity = 0;
    let totalWeight = 0;

    // Compare features
    for (const feature1 of sig1.features) {
      const feature2 = sig2.features.find(f => f.featureId === feature1.featureId);
      if (feature2) {
        const diff = Math.abs(feature1.value - feature2.value);
        const featureSimilarity = 1 - diff;
        similarity += featureSimilarity * feature1.weight;
        totalWeight += feature1.weight;
      }
    }

    return totalWeight > 0 ? similarity / totalWeight : 0;
  }

  /**
   * Calculate cluster density
   */
  private calculateClusterDensity(signatures: PatternSignature[]): number {
    if (signatures.length < 2) return 0;

    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < signatures.length; i++) {
      for (let j = i + 1; j < signatures.length; j++) {
        totalSimilarity += this.calculateSignatureSimilarity(signatures[i], signatures[j]);
        pairCount++;
      }
    }

    return pairCount > 0 ? totalSimilarity / pairCount : 0;
  }

  /**
   * Calculate cluster stability
   */
  private calculateClusterStability(signatures: PatternSignature[]): number {
    const avgConfidence =
      signatures.reduce((sum, sig) => sum + sig.confidence, 0) / signatures.length;
    const occurrenceStability = Math.min(
      signatures.reduce((sum, sig) => sum + sig.occurrences, 0) / 100,
      1,
    );

    return avgConfidence * 0.6 + occurrenceStability * 0.4;
  }

  /**
   * Calculate predictive value of cluster
   */
  private calculatePredictiveValue(signatures: PatternSignature[]): number {
    const totalOccurrences = signatures.reduce((sum, sig) => sum + sig.occurrences, 0);
    const recency =
      signatures.reduce((sum, sig) => {
        const age = Date.now() - sig.lastSeen.getTime();
        return sum + 1 / (1 + age / (1000 * 60 * 60 * 24)); // Decay over days
      }, 0) / signatures.length;

    const frequency = Math.min(totalOccurrences / 50, 1); // Normalize to 0-1
    return frequency * 0.7 + recency * 0.3;
  }

  /**
   * Determine fix strategy for cluster
   */
  private determineFixStrategy(signatures: PatternSignature[]): string {
    const errorCode = signatures[0].errorCode;
    const totalOccurrences = signatures.reduce((sum, sig) => sum + sig.occurrences, 0);

    const strategies: Record<string, string> = {
      TS2352: 'Type assertion and conversion safety',
      TS2345: 'Parameter type alignment',
      TS2304: 'Import resolution and module fixes',
      TS2698: 'Spread operator type refinement',
      TS2362: 'Numeric type enforcement',
      TS2322: 'Type compatibility resolution',
      TS2339: 'Property access validation',
    };

    const baseStrategy = strategies[errorCode] || 'General type safety improvement';

    if (totalOccurrences > 20) {
      return `Batch ${baseStrategy.toLowerCase()}`;
    } else if (totalOccurrences > 5) {
      return `Targeted ${baseStrategy.toLowerCase()}`;
    }

    return `Individual ${baseStrategy.toLowerCase()}`;
  }

  /**
   * Calculate automation readiness
   */
  private calculateAutomationReadiness(signatures: PatternSignature[]): number {
    const avgConfidence =
      signatures.reduce((sum, sig) => sum + sig.confidence, 0) / signatures.length;
    const errorCode = signatures[0].errorCode;

    // Base automation potential by error type
    const baseAutomation: Record<string, number> = {
      TS2352: 0.85,
      TS2345: 0.7,
      TS2304: 0.95,
      TS2698: 0.6,
      TS2362: 0.9,
      TS2322: 0.65,
      TS2339: 0.75,
    };

    const base = baseAutomation[errorCode] || 0.7;
    return Math.min(0.98, base * avgConfidence);
  }

  // ========== PATTERN PREDICTION ==========

  /**
   * Generate pattern predictions
   */
  generatePatternPredictions(): PatternPrediction[] {
    const predictions: PatternPrediction[] = [];

    // Cluster-based predictions
    for (const cluster of this.clusters) {
      if (cluster.predictiveValue > 0.7) {
        const prediction = this.createClusterPrediction(cluster);
        predictions.push(prediction);
      }
    }

    // Trend-based predictions
    const trendPredictions = this.createTrendPredictions();
    predictions.push(...trendPredictions);

    // Anomaly-based predictions
    const anomalyPredictions = this.createAnomalyPredictions();
    predictions.push(...anomalyPredictions);

    this.predictions = predictions;
    return predictions;
  }

  /**
   * Create prediction from cluster
   */
  private createClusterPrediction(cluster: PatternCluster): PatternPrediction {
    const totalOccurrences = cluster.signatures.reduce((sum, sig) => sum + sig.occurrences, 0);
    const avgRecency =
      cluster.signatures.reduce((sum, sig) => {
        const age = Date.now() - sig.lastSeen.getTime();
        return sum + age;
      }, 0) / cluster.signatures.length;

    const probability = Math.min(0.95, cluster.predictiveValue * (totalOccurrences / 10));
    const confidence = cluster.stability * cluster.density;

    // Predict timeframe based on historical patterns
    const timeframe = Math.max(15, Math.min(this.predictionHorizon, avgRecency / (1000 * 60)));

    return {
      predictionId: `pred_${cluster.clusterId}_${Date.now()}`,
      targetCategory: cluster.centerSignature.category,
      probability,
      confidence,
      timeframe,
      triggerConditions: this.identifyTriggerConditions(cluster),
      recommendedActions: this.generateRecommendedActions(cluster),
      riskLevel: this.assessPredictionRisk(probability, confidence),
    };
  }

  /**
   * Create trend-based predictions
   */
  private createTrendPredictions(): PatternPrediction[] {
    const predictions: PatternPrediction[] = [];

    // Simple trend analysis based on signature occurrences
    const categoryTrends = new Map<ErrorCategory, number>();

    for (const signature of this.signatures.values()) {
      const current = categoryTrends.get(signature.category) || 0;
      categoryTrends.set(signature.category, current + signature.occurrences);
    }

    categoryTrends.forEach((count, category) => {
      if (count > 5) {
        predictions.push({
          predictionId: `trend_${category}_${Date.now()}`,
          targetCategory: category,
          probability: Math.min(0.8, count / 20),
          confidence: Math.min(0.9, count / 15),
          timeframe: 30,
          triggerConditions: [`${category} error frequency increase`],
          recommendedActions: [`Monitor ${category} patterns`, `Prepare targeted fixes`],
          riskLevel: count > 15 ? 'high' : count > 8 ? 'medium' : 'low',
        });
      }
    });

    return predictions;
  }

  /**
   * Create anomaly-based predictions
   */
  private createAnomalyPredictions(): PatternPrediction[] {
    const predictions: PatternPrediction[] = [];

    // Detect unusual patterns
    const avgOccurrences =
      Array.from(this.signatures.values()).reduce((sum, sig) => sum + sig.occurrences, 0) /
      this.signatures.size;

    for (const signature of this.signatures.values()) {
      if (signature.occurrences > avgOccurrences * 2) {
        predictions.push({
          predictionId: `anomaly_${signature.signatureId}_${Date.now()}`,
          targetCategory: signature.category,
          probability: 0.6,
          confidence: 0.7,
          timeframe: 15,
          triggerConditions: [`Unusual spike in ${signature.errorCode} errors`],
          recommendedActions: [
            `Investigate ${signature.errorCode} anomaly`,
            'Check for systematic issues',
          ],
          riskLevel: 'medium',
        });
      }
    }

    return predictions;
  }

  /**
   * Identify trigger conditions for cluster
   */
  private identifyTriggerConditions(cluster: PatternCluster): string[] {
    const conditions: string[] = [];

    conditions.push(`${cluster.centerSignature.errorCode} error frequency increase`);

    if (cluster.signatures.length > 5) {
      conditions.push('Multiple similar error patterns detected');
    }

    if (cluster.automationReadiness > 0.8) {
      conditions.push('High automation potential reached');
    }

    return conditions;
  }

  /**
   * Generate recommended actions for cluster
   */
  private generateRecommendedActions(cluster: PatternCluster): string[] {
    const actions: string[] = [];

    if (cluster.automationReadiness > 0.8) {
      actions.push(`Implement automated fix for ${cluster.centerSignature.errorCode}`);
    }

    actions.push(`Apply ${cluster.fixStrategy}`);

    if (cluster.signatures.length > 3) {
      actions.push('Consider batch processing approach');
    }

    return actions;
  }

  /**
   * Assess prediction risk level
   */
  private assessPredictionRisk(
    probability: number,
    confidence: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = probability * confidence;

    if (riskScore > 0.8) return 'critical';
    if (riskScore > 0.6) return 'high';
    if (riskScore > 0.4) return 'medium';
    return 'low';
  }

  // ========== PATTERN EVOLUTION ==========

  /**
   * Update pattern signature with new error data
   */
  updatePatternSignature(error: TypeScriptError): void {
    const newSignature = this.createPatternSignature(error);
    const existingSignature = this.signatures.get(newSignature.signatureId);

    if (existingSignature) {
      // Update existing signature
      existingSignature.occurrences++;
      existingSignature.lastSeen = new Date();

      // Calculate evolution
      const evolution = this.calculatePatternEvolution(existingSignature, newSignature);
      this.evolutions.set(existingSignature.signatureId, evolution);

      // Update signature confidence based on evolution
      existingSignature.confidence = this.updateConfidenceWithEvolution(
        existingSignature.confidence,
        evolution.adaptationScore,
      );

      existingSignature.evolutionScore = evolution.changeRate;
    } else {
      // Store new signature
      this.signatures.set(newSignature.signatureId, newSignature);
    }
  }

  /**
   * Calculate pattern evolution
   */
  private calculatePatternEvolution(
    oldSignature: PatternSignature,
    newSignature: PatternSignature,
  ): PatternEvolution {
    const changeVector: number[] = [];

    // Calculate feature changes
    for (const oldFeature of oldSignature.features) {
      const newFeature = newSignature.features.find(f => f.featureId === oldFeature.featureId);
      if (newFeature) {
        changeVector.push(newFeature.value - oldFeature.value);
      }
    }

    const changeRate =
      changeVector.reduce((sum, change) => sum + Math.abs(change), 0) / changeVector.length;
    const adaptationScore = Math.exp(-changeRate * 2); // Exponential decay for large changes

    const stabilityTrend =
      changeRate < 0.1 ? 'stable' : changeRate < 0.3 ? 'decreasing' : 'increasing';

    return {
      evolutionId: `evo_${oldSignature.signatureId}_${Date.now()}`,
      patternId: oldSignature.signatureId,
      changeVector,
      changeRate,
      adaptationScore,
      stabilityTrend,
      lastEvolution: new Date(),
    };
  }

  /**
   * Update confidence with evolution data
   */
  private updateConfidenceWithEvolution(
    currentConfidence: number,
    adaptationScore: number,
  ): number {
    return currentConfidence * (1 - this.learningRate) + adaptationScore * this.learningRate;
  }

  // ========== PATTERN INSIGHTS ==========

  /**
   * Generate intelligent insights from patterns
   */
  generatePatternInsights(): PatternInsight[] {
    const insights: PatternInsight[] = [];

    // Clustering insights
    insights.push(...this.generateClusteringInsights());

    // Prediction insights
    insights.push(...this.generatePredictionInsights());

    // Evolution insights
    insights.push(...this.generateEvolutionInsights());

    // Anomaly insights
    insights.push(...this.generateAnomalyInsights());

    return insights.sort((a, b) => b.significance - a.significance);
  }

  /**
   * Generate clustering insights
   */
  private generateClusteringInsights(): PatternInsight[] {
    const insights: PatternInsight[] = [];

    const largeClusters = this.clusters.filter(c => c.signatures.length > 3);

    for (const cluster of largeClusters) {
      insights.push({
        insightId: `cluster_insight_${cluster.clusterId}`,
        type: 'clustering',
        significance: cluster.density * cluster.signatures.length,
        description: `Cluster of ${cluster.signatures.length} similar ${cluster.centerSignature.errorCode} errors detected`,
        actionable: cluster.automationReadiness > 0.7,
        evidence: [
          `${cluster.signatures.length} similar patterns`,
          `${(cluster.density * 100).toFixed(1)}% density`,
          `${(cluster.automationReadiness * 100).toFixed(1)}% automation ready`,
        ],
        recommendations: [
          cluster.fixStrategy,
          cluster.automationReadiness > 0.8 ? 'Consider automated fixing' : 'Manual fix required',
        ],
      });
    }

    return insights;
  }

  /**
   * Generate prediction insights
   */
  private generatePredictionInsights(): PatternInsight[] {
    const insights: PatternInsight[] = [];

    const highProbabilityPredictions = this.predictions.filter(p => p.probability > 0.7);

    for (const prediction of highProbabilityPredictions) {
      insights.push({
        insightId: `prediction_insight_${prediction.predictionId}`,
        type: 'prediction',
        significance: prediction.probability * prediction.confidence,
        description: `High probability (${(prediction.probability * 100).toFixed(1)}%) of ${prediction.targetCategory} errors in ${prediction.timeframe} minutes`,
        actionable: true,
        evidence: [
          `${(prediction.probability * 100).toFixed(1)}% probability`,
          `${(prediction.confidence * 100).toFixed(1)}% confidence`,
          `${prediction.timeframe} minute timeframe`,
        ],
        recommendations: prediction.recommendedActions,
      });
    }

    return insights;
  }

  /**
   * Generate evolution insights
   */
  private generateEvolutionInsights(): PatternInsight[] {
    const insights: PatternInsight[] = [];

    const rapidEvolutions = Array.from(this.evolutions.values()).filter(e => e.changeRate > 0.3);

    for (const evolution of rapidEvolutions) {
      insights.push({
        insightId: `evolution_insight_${evolution.evolutionId}`,
        type: 'evolution',
        significance: evolution.changeRate,
        description: `Rapid pattern evolution detected in ${evolution.patternId}`,
        actionable: evolution.adaptationScore < 0.5,
        evidence: [
          `${(evolution.changeRate * 100).toFixed(1)}% change rate`,
          `${evolution.stabilityTrend} stability trend`,
          `${(evolution.adaptationScore * 100).toFixed(1)}% adaptation score`,
        ],
        recommendations: [
          'Monitor pattern stability',
          'Consider pattern re-classification',
          'Update prediction models',
        ],
      });
    }

    return insights;
  }

  /**
   * Generate anomaly insights
   */
  private generateAnomalyInsights(): PatternInsight[] {
    const insights: PatternInsight[] = [];

    const avgOccurrences =
      Array.from(this.signatures.values()).reduce((sum, sig) => sum + sig.occurrences, 0) /
      this.signatures.size;

    const anomalies = Array.from(this.signatures.values()).filter(
      sig => sig.occurrences > avgOccurrences * 3,
    );

    for (const anomaly of anomalies) {
      insights.push({
        insightId: `anomaly_insight_${anomaly.signatureId}`,
        type: 'anomaly',
        significance: anomaly.occurrences / avgOccurrences,
        description: `Anomalous spike in ${anomaly.errorCode} errors (${anomaly.occurrences} occurrences)`,
        actionable: true,
        evidence: [
          `${anomaly.occurrences} occurrences`,
          `${(anomaly.occurrences / avgOccurrences).toFixed(1)}x average`,
          `Last seen: ${anomaly.lastSeen.toLocaleString()}`,
        ],
        recommendations: [
          'Investigate root cause',
          'Check for systematic issues',
          'Implement immediate fixes',
        ],
      });
    }

    return insights;
  }

  // ========== PUBLIC API ==========

  /**
   * Process new error for pattern recognition
   */
  processError(error: TypeScriptError): void {
    this.updatePatternSignature(error);
  }

  /**
   * Get pattern recognition summary
   */
  getPatternSummary(): {
    totalSignatures: number;
    totalClusters: number;
    totalPredictions: number;
    avgConfidence: number;
    topPatterns: PatternSignature[];
    topClusters: PatternCluster[];
    recentInsights: PatternInsight[];
  } {
    const signatures = Array.from(this.signatures.values());
    const avgConfidence =
      signatures.reduce((sum, sig) => sum + sig.confidence, 0) / signatures.length;

    return {
      totalSignatures: signatures.length,
      totalClusters: this.clusters.length,
      totalPredictions: this.predictions.length,
      avgConfidence,
      topPatterns: signatures.sort((a, b) => b.occurrences - a.occurrences).slice(0, 5),
      topClusters: this.clusters.sort((a, b) => b.predictiveValue - a.predictiveValue).slice(0, 3),
      recentInsights: this.generatePatternInsights().slice(0, 5),
    };
  }

  /**
   * Get configuration
   */
  getConfiguration(): {
    learningRate: number;
    clusteringThreshold: number;
    predictionHorizon: number;
    featureWeights: typeof this.FEATURE_WEIGHTS;
  } {
    return {
      learningRate: this.learningRate,
      clusteringThreshold: this.clusteringThreshold,
      predictionHorizon: this.predictionHorizon,
      featureWeights: this.FEATURE_WEIGHTS,
    };
  }

  /**
   * Update configuration
   */
  updateConfiguration(
    config: Partial<{
      learningRate: number;
      clusteringThreshold: number;
      predictionHorizon: number;
    }>,
  ): void {
    if (config.learningRate !== undefined) {
      this.learningRate = Math.max(0.01, Math.min(0.5, config.learningRate));
    }

    if (config.clusteringThreshold !== undefined) {
      this.clusteringThreshold = Math.max(0.3, Math.min(0.9, config.clusteringThreshold));
    }

    if (config.predictionHorizon !== undefined) {
      this.predictionHorizon = Math.max(15, Math.min(240, config.predictionHorizon));
    }
  }

  /**
   * Reset pattern recognition system
   */
  resetPatterns(): void {
    this.signatures.clear();
    this.clusters = [];
    this.predictions = [];
    this.evolutions.clear();
  }
}

// ========== SINGLETON INSTANCE ==========

export const intelligentPatternRecognition = new IntelligentPatternRecognition();

// ========== EXPORT FACTORY ==========

export const createPatternRecognition = () => new IntelligentPatternRecognition();
