/**
 * Enterprise Error Tracking System - Phase 3.10 Implementation
 * 
 * Advanced automated error tracking and intelligence system integrating with Campaign Intelligence
 * Provides real-time monitoring, pattern recognition, and intelligent error resolution
 * 
 * Features:
 * - Real-time TypeScript error monitoring
 * - Automated error pattern recognition
 * - Performance metrics and analytics
 * - Intelligent batch processing
 * - Quality gates and validation hooks
 * - Predictive error analysis
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { log } from '@/services/LoggingService';

import { CAMPAIGN_ENTERPRISE_INTELLIGENCE } from './campaign/CampaignIntelligenceSystem';
import { TypeScriptErrorAnalyzer, ErrorCategory, ErrorSeverity, TypeScriptError } from './campaign/TypeScriptErrorAnalyzer';

// ========== ENTERPRISE ERROR TRACKING INTERFACES ==========

export interface ErrorTrackingMetrics {
  totalErrors: number;
  errorVelocity: number; // errors per minute
  errorReductionRate: number; // percentage reduction
  patternRecognitionAccuracy: number;
  automationEfficiency: number;
  buildStabilityScore: number;
  predictiveAccuracy: number;
  lastUpdated: Date;
}

export interface ErrorPattern {
  patternId: string;
  errorCode: string;
  frequency: number;
  successRate: number;
  averageFixTime: number;
  complexity: 'low' | 'medium' | 'high';
  automationPotential: number;
  lastSeen: Date;
}

export interface ErrorTrend {
  category: ErrorCategory;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  predictedCount: number;
  confidence: number;
  timeframe: '1h' | '6h' | '24h' | '7d';
}

export interface IntelligentRecommendation {
  recommendationId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: ErrorCategory;
  description: string;
  estimatedImpact: number;
  automationPossible: boolean;
  timeEstimate: number; // minutes
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ErrorTrackingSnapshot {
  timestamp: Date;
  metrics: ErrorTrackingMetrics;
  patterns: ErrorPattern[];
  trends: ErrorTrend[];
  recommendations: IntelligentRecommendation[];
  qualityGateStatus: 'passing' | 'failing' | 'warning';
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

// ========== ENTERPRISE ERROR TRACKING SYSTEM ==========

export class ErrorTrackingEnterpriseSystem {
  private analyzer: TypeScriptErrorAnalyzer;
  private metricsHistory: ErrorTrackingSnapshot[] = [];
  private patterns: Map<string, ErrorPattern> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timer | null = null;
  private readonly METRICS_FILE = '.enterprise-error-metrics.json';
  private readonly PATTERNS_FILE = '.enterprise-error-patterns.json';

  constructor() {
    this.analyzer = new TypeScriptErrorAnalyzer();
    this.loadPersistedData();
  }

  // ========== REAL-TIME ERROR MONITORING ==========

  /**
   * Start automated error monitoring with configurable intervals
   */
  startRealTimeMonitoring(intervalMinutes: number = 5): void {
    if (this.isMonitoring) {
      log.info('⚠️  Error monitoring already active');
      return;
    }

    this.isMonitoring = true;
    log.info(`🔄 Starting real-time error monitoring (${intervalMinutes}min intervals)`);

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performAutomatedAnalysis();
      } catch (error) {
        console.error('❌ Error during automated analysis:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // Perform initial analysis
    this.performAutomatedAnalysis();
  }

  /**
   * Stop automated error monitoring
   */
  stopRealTimeMonitoring(): void {
    if (!this.isMonitoring) {
      log.info('⚠️  Error monitoring not active');
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    log.info('🛑 Real-time error monitoring stopped');
  }

  /**
   * Perform comprehensive automated error analysis
   */
  async performAutomatedAnalysis(): Promise<ErrorTrackingSnapshot> {
    const startTime = Date.now();
    log.info('🔍 Performing automated error analysis...');

    // Get current error state
    const analysisResult = await this.analyzer.analyzeErrors();
    const currentErrorCount = await this.analyzer.getCurrentErrorCount();
    
    // Calculate metrics
    const metrics = this.calculateMetrics(analysisResult, currentErrorCount);
    
    // Update patterns
    this.updateErrorPatterns(analysisResult.distribution.priorityRanking);
    
    // Analyze trends
    const trends = this.analyzeTrends();
    
    // Generate intelligent recommendations
    const recommendations = this.generateIntelligentRecommendations(
      analysisResult, 
      metrics, 
      trends
    );

    // Assess quality gates
    const qualityGateStatus = this.assessQualityGates(metrics);
    const systemHealth = this.assessSystemHealth(metrics, qualityGateStatus);

    // Create snapshot
    const snapshot: ErrorTrackingSnapshot = {
      timestamp: new Date(),
      metrics,
      patterns: Array.from(this.patterns.values()),
      trends,
      recommendations,
      qualityGateStatus,
      systemHealth
    };

    // Store in history
    this.metricsHistory.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }

    // Persist data
    await this.persistData();

    const executionTime = Date.now() - startTime;
    log.info(`✅ Automated analysis completed in ${executionTime}ms`);
    log.info(`📊 Current state: ${currentErrorCount} errors, ${systemHealth} health`);

    return snapshot;
  }

  // ========== PATTERN RECOGNITION SYSTEM ==========

  /**
   * Update error patterns based on current error state
   */
  private updateErrorPatterns(errors: TypeScriptError[]): void {
    const patternMap = new Map<string, { count: number; errors: TypeScriptError[] }>();

    // Group errors by pattern
    errors.forEach(error => {
      const patternKey = `${error.code}_${error.category}`;
      if (!patternMap.has(patternKey)) {
        patternMap.set(patternKey, { count: 0, errors: [] });
      }
      const pattern = patternMap.get(patternKey)!;
      pattern.count++;
      pattern.errors.push(error);
    });

    // Update pattern records
    patternMap.forEach((data, patternKey) => {
      const existingPattern = this.patterns.get(patternKey);
      
      if (existingPattern) {
        // Update existing pattern
        existingPattern.frequency = data.count;
        existingPattern.lastSeen = new Date();
        
        // Update success rate based on trend
        if (data.count < existingPattern.frequency) {
          existingPattern.successRate = Math.min(0.98, existingPattern.successRate + 0.02);
        } else if (data.count > existingPattern.frequency) {
          existingPattern.successRate = Math.max(0.5, existingPattern.successRate - 0.01);
        }
      } else {
        // Create new pattern
        const newPattern: ErrorPattern = {
          patternId: patternKey,
          errorCode: data.errors[0].code,
          frequency: data.count,
          successRate: this.calculateInitialSuccessRate(data.errors[0].code),
          averageFixTime: this.estimateFixTime(data.errors[0].code),
          complexity: this.assessComplexity(data.errors[0].code, data.errors[0].message),
          automationPotential: this.calculateAutomationPotential(data.errors[0].code),
          lastSeen: new Date()
        };
        
        this.patterns.set(patternKey, newPattern);
      }
    });
  }

  /**
   * Calculate initial success rate for error codes
   */
  private calculateInitialSuccessRate(errorCode: string): number {
    const successRates: Record<string, number> = {
      'TS2352': 0.92, // Type conversion - high success rate
      'TS2345': 0.87, // Argument mismatch - good success rate
      'TS2304': 0.95, // Cannot find name - very high success rate
      'TS2698': 0.83, // Spread type - moderate success rate
      'TS2362': 0.91, // Arithmetic operation - high success rate
      'TS2322': 0.78, // Type assignment - moderate success rate
      'TS2339': 0.85, // Property access - good success rate
    };
    
    return successRates[errorCode] || 0.75;
  }

  /**
   * Estimate fix time based on error complexity
   */
  private estimateFixTime(errorCode: string): number {
    const fixTimes: Record<string, number> = {
      'TS2352': 2.5, // Type conversion - moderate time
      'TS2345': 3.0, // Argument mismatch - more time needed
      'TS2304': 1.5, // Cannot find name - quick fix
      'TS2698': 4.0, // Spread type - complex fix
      'TS2362': 2.0, // Arithmetic operation - quick fix
      'TS2322': 3.5, // Type assignment - moderate time
      'TS2339': 2.8, // Property access - moderate time
    };
    
    return fixTimes[errorCode] || 3.0;
  }

  /**
   * Assess error complexity for automation potential
   */
  private assessComplexity(errorCode: string, message: string): 'low' | 'medium' | 'high' {
    if (errorCode === 'TS2304') return 'low'; // Import fixes are straightforward
    if (errorCode === 'TS2362') return 'low'; // Arithmetic fixes are simple
    if (errorCode === 'TS2698') return 'high'; // Spread type issues are complex
    if (message.includes('complex')) return 'high';
    if (message.includes('generic')) return 'medium';
    return 'medium';
  }

  /**
   * Calculate automation potential (0-1) for error patterns
   */
  private calculateAutomationPotential(errorCode: string): number {
    const automationPotential: Record<string, number> = {
      'TS2352': 0.85, // Type conversion - good automation potential
      'TS2345': 0.70, // Argument mismatch - moderate automation potential
      'TS2304': 0.95, // Cannot find name - excellent automation potential
      'TS2698': 0.60, // Spread type - lower automation potential
      'TS2362': 0.90, // Arithmetic operation - excellent automation potential
      'TS2322': 0.65, // Type assignment - moderate automation potential
      'TS2339': 0.75, // Property access - good automation potential
    };
    
    return automationPotential[errorCode] || 0.70;
  }

  // ========== TREND ANALYSIS ==========

  /**
   * Analyze error trends over time
   */
  private analyzeTrends(): ErrorTrend[] {
    if (this.metricsHistory.length < 2) {
      return [];
    }

    const trends: ErrorTrend[] = [];
    const currentSnapshot = this.metricsHistory[this.metricsHistory.length - 1];
    const previousSnapshot = this.metricsHistory[this.metricsHistory.length - 2];

    // Analyze each error category
    Object.values(ErrorCategory).forEach(category => {
      const currentCount = this.getErrorCountByCategory(currentSnapshot, category);
      const previousCount = this.getErrorCountByCategory(previousSnapshot, category);
      
      if (currentCount === 0 && previousCount === 0) return;
      
      const changeRate = previousCount > 0 ? (currentCount - previousCount) / previousCount : 0;
      const trendDirection = changeRate > 0.1 ? 'increasing' : 
                           changeRate < -0.1 ? 'decreasing' : 'stable';
      
      // Predict future count based on trend
      const predictedCount = Math.max(0, Math.round(currentCount * (1 + changeRate)));
      
      // Calculate confidence based on consistency
      const confidence = Math.min(0.95, 0.5 + Math.abs(changeRate) * 0.5);
      
      trends.push({
        category,
        trendDirection,
        changeRate,
        predictedCount,
        confidence,
        timeframe: '1h' // Based on current monitoring interval
      });
    });

    return trends;
  }

  /**
   * Get error count by category from snapshot
   */
  private getErrorCountByCategory(snapshot: ErrorTrackingSnapshot, category: ErrorCategory): number {
    return snapshot.patterns
      .filter(p => p.patternId.includes(category))
      .reduce((sum, p) => sum + p.frequency, 0);
  }

  // ========== INTELLIGENT RECOMMENDATIONS ==========

  /**
   * Generate intelligent recommendations based on analysis
   */
  private generateIntelligentRecommendations(
    analysisResult: Record<string, unknown>,
    metrics: ErrorTrackingMetrics,
    trends: ErrorTrend[]
  ): IntelligentRecommendation[] {
    const recommendations: IntelligentRecommendation[] = [];

    // High-frequency pattern recommendations
    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    topPatterns.forEach((pattern, index) => {
      recommendations.push({
        recommendationId: `pattern_${pattern.patternId}_${Date.now()}`,
        priority: index === 0 ? 'critical' : index === 1 ? 'high' : 'medium',
        category: pattern.patternId.split('_')[1] as ErrorCategory,
        description: `Address ${pattern.frequency} ${pattern.errorCode} errors with ${(pattern.successRate * 100).toFixed(1)}% success rate`,
        estimatedImpact: Math.round(pattern.frequency * pattern.successRate),
        automationPossible: pattern.automationPotential > 0.8,
        timeEstimate: pattern.averageFixTime * pattern.frequency,
        dependencies: this.getPatternDependencies(pattern),
        riskLevel: pattern.complexity === 'high' ? 'high' : 
                  pattern.complexity === 'medium' ? 'medium' : 'low'
      });
    });

    // Trend-based recommendations
    const increasingTrends = trends.filter(t => t.trendDirection === 'increasing');
    increasingTrends.forEach(trend => {
      recommendations.push({
        recommendationId: `trend_${trend.category}_${Date.now()}`,
        priority: trend.changeRate > 0.5 ? 'high' : 'medium',
        category: trend.category,
        description: `Urgent: ${trend.category} errors trending upward (+${(trend.changeRate * 100).toFixed(1)}%)`,
        estimatedImpact: Math.round(trend.predictedCount * 0.8),
        automationPossible: this.calculateAutomationPotential(trend.category) > 0.7,
        timeEstimate: trend.predictedCount * 2,
        dependencies: [],
        riskLevel: trend.changeRate > 0.3 ? 'high' : 'medium'
      });
    });

    // System health recommendations
    if (metrics.buildStabilityScore < 0.8) {
      recommendations.push({
        recommendationId: `stability_${Date.now()}`,
        priority: 'critical',
        category: ErrorCategory.OTHER,
        description: 'Critical: Build stability below threshold - implement immediate fixes',
        estimatedImpact: Math.round(metrics.totalErrors * 0.3),
        automationPossible: false,
        timeEstimate: 60,
        dependencies: ['build_validation', 'error_analysis'],
        riskLevel: 'high'
      });
    }

    // Performance recommendations
    if (metrics.errorVelocity < 0.5) {
      recommendations.push({
        recommendationId: `performance_${Date.now()}`,
        priority: 'medium',
        category: ErrorCategory.OTHER,
        description: 'Optimize error fixing velocity - consider batch processing',
        estimatedImpact: Math.round(metrics.totalErrors * 0.2),
        automationPossible: true,
        timeEstimate: 30,
        dependencies: ['batch_processing', 'automation_tools'],
        riskLevel: 'low'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get dependencies for error pattern
   */
  private getPatternDependencies(pattern: ErrorPattern): string[] {
    const dependencies: string[] = [];
    
    if (pattern.errorCode === 'TS2304') {
      dependencies.push('import_analysis', 'module_resolution');
    }
    
    if (pattern.errorCode === 'TS2352') {
      dependencies.push('type_analysis', 'conversion_safety');
    }
    
    if (pattern.complexity === 'high') {
      dependencies.push('manual_review', 'expert_analysis');
    }
    
    return dependencies;
  }

  // ========== METRICS CALCULATION ==========

  /**
   * Calculate comprehensive tracking metrics
   */
  private calculateMetrics(analysisResult: Record<string, unknown>, currentErrorCount: number): ErrorTrackingMetrics {
    const previousSnapshot = this.metricsHistory[this.metricsHistory.length - 1];
    const timeElapsed = previousSnapshot ? 
      (Date.now() - previousSnapshot.timestamp.getTime()) / (1000 * 60) : 1; // minutes
    
    // Calculate error velocity
    const errorVelocity = previousSnapshot ? 
      Math.abs(previousSnapshot.metrics.totalErrors - currentErrorCount) / timeElapsed : 0;
    
    // Calculate error reduction rate
    const initialErrorCount = this.metricsHistory.length > 0 ? 
      this.metricsHistory[0].metrics.totalErrors : currentErrorCount;
    const errorReductionRate = initialErrorCount > 0 ? 
      (initialErrorCount - currentErrorCount) / initialErrorCount : 0;
    
    // Calculate pattern recognition accuracy
    const patternAccuracy = this.calculatePatternAccuracy();
    
    // Calculate automation efficiency
    const automationEfficiency = this.calculateAutomationEfficiency();
    
    // Calculate build stability score
    const buildStabilityScore = this.calculateBuildStabilityScore();
    
    // Calculate predictive accuracy
    const predictiveAccuracy = this.calculatePredictiveAccuracy();

    return {
      totalErrors: currentErrorCount,
      errorVelocity,
      errorReductionRate,
      patternRecognitionAccuracy: patternAccuracy,
      automationEfficiency,
      buildStabilityScore,
      predictiveAccuracy,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate pattern recognition accuracy
   */
  private calculatePatternAccuracy(): number {
    const patterns = Array.from(this.patterns.values());
    if (patterns.length === 0) return 0.8;
    
    const avgSuccessRate = patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
    return Math.min(0.98, avgSuccessRate);
  }

  /**
   * Calculate automation efficiency
   */
  private calculateAutomationEfficiency(): number {
    const patterns = Array.from(this.patterns.values());
    if (patterns.length === 0) return 0.7;
    
    const weightedAutomation = patterns.reduce((sum, p) => 
      sum + (p.automationPotential * p.frequency), 0);
    const totalFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0);
    
    return totalFrequency > 0 ? weightedAutomation / totalFrequency : 0.7;
  }

  /**
   * Calculate build stability score
   */
  private calculateBuildStabilityScore(): number {
    try {
      // Try to run a quick build check
      execSync('yarn tsc --noEmit --skipLibCheck', { 
        stdio: 'pipe', 
        timeout: 30000 
      });
      return 0.95; // Build succeeds
    } catch (error) {
      // Build fails, calculate based on error count
      const errorCount = this.metricsHistory.length > 0 ? 
        this.metricsHistory[this.metricsHistory.length - 1].metrics.totalErrors : 1000;
      return Math.max(0.3, 1 - (errorCount / 5000));
    }
  }

  /**
   * Calculate predictive accuracy
   */
  private calculatePredictiveAccuracy(): number {
    if (this.metricsHistory.length < 3) return 0.75;
    
    // Compare predictions from 2 snapshots ago with current reality
    const twoSnapshotsAgo = this.metricsHistory[this.metricsHistory.length - 3];
    const currentSnapshot = this.metricsHistory[this.metricsHistory.length - 1];
    
    // Simple accuracy calculation based on trend predictions
    const predictions = twoSnapshotsAgo.trends;
    let accuracySum = 0;
    let accuracyCount = 0;
    
    predictions.forEach(prediction => {
      const actualCount = this.getErrorCountByCategory(currentSnapshot, prediction.category);
      const predictedCount = prediction.predictedCount;
      
      if (predictedCount > 0) {
        const accuracy = 1 - Math.abs(actualCount - predictedCount) / predictedCount;
        accuracySum += Math.max(0, accuracy);
        accuracyCount++;
      }
    });
    
    return accuracyCount > 0 ? accuracySum / accuracyCount : 0.75;
  }

  // ========== QUALITY GATES ==========

  /**
   * Assess quality gates status
   */
  private assessQualityGates(metrics: ErrorTrackingMetrics): 'passing' | 'failing' | 'warning' {
    const criticalThresholds = {
      totalErrors: 100,
      errorReductionRate: 0.1,
      buildStabilityScore: 0.7,
      automationEfficiency: 0.5
    };

    const warningThresholds = {
      totalErrors: 500,
      errorReductionRate: 0.05,
      buildStabilityScore: 0.8,
      automationEfficiency: 0.7
    };

    // Check critical failures
    if (metrics.totalErrors > criticalThresholds.totalErrors ||
        metrics.errorReductionRate < criticalThresholds.errorReductionRate ||
        metrics.buildStabilityScore < criticalThresholds.buildStabilityScore ||
        metrics.automationEfficiency < criticalThresholds.automationEfficiency) {
      return 'failing';
    }

    // Check warnings
    if (metrics.totalErrors > warningThresholds.totalErrors ||
        metrics.errorReductionRate < warningThresholds.errorReductionRate ||
        metrics.buildStabilityScore < warningThresholds.buildStabilityScore ||
        metrics.automationEfficiency < warningThresholds.automationEfficiency) {
      return 'warning';
    }

    return 'passing';
  }

  /**
   * Assess overall system health
   */
  private assessSystemHealth(
    metrics: ErrorTrackingMetrics, 
    qualityGateStatus: 'passing' | 'failing' | 'warning'
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const healthScore = (
      (metrics.errorReductionRate * 0.3) +
      (metrics.buildStabilityScore * 0.3) +
      (metrics.automationEfficiency * 0.2) +
      (metrics.patternRecognitionAccuracy * 0.2)
    );

    if (qualityGateStatus === 'failing') return 'poor';
    if (healthScore >= 0.9) return 'excellent';
    if (healthScore >= 0.75) return 'good';
    if (healthScore >= 0.6) return 'fair';
    return 'poor';
  }

  // ========== DATA PERSISTENCE ==========

  /**
   * Persist metrics and patterns to disk
   */
  private async persistData(): Promise<void> {
    try {
      // Save metrics history
      await fs.promises.writeFile(
        this.METRICS_FILE,
        JSON.stringify(this.metricsHistory, null, 2)
      );

      // Save patterns
      const patternsData = Array.from(this.patterns.entries());
      await fs.promises.writeFile(
        this.PATTERNS_FILE,
        JSON.stringify(patternsData, null, 2)
      );
    } catch (error) {
      console.error('❌ Failed to persist data:', error);
    }
  }

  /**
   * Load persisted metrics and patterns
   */
  private loadPersistedData(): void {
    try {
      // Load metrics history
      if (fs.existsSync(this.METRICS_FILE)) {
        const metricsData = JSON.parse(fs.readFileSync(this.METRICS_FILE, 'utf8'));
        this.metricsHistory = metricsData.map((item: Record<string, unknown>) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }

      // Load patterns
      if (fs.existsSync(this.PATTERNS_FILE)) {
        const patternsData = JSON.parse(fs.readFileSync(this.PATTERNS_FILE, 'utf8'));
        this.patterns = new Map(patternsData.map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            lastSeen: new Date(value.lastSeen)
          }
        ]));
      }
    } catch (error) {
      console.error('⚠️  Failed to load persisted data:', error);
    }
  }

  // ========== PUBLIC API ==========

  /**
   * Get current system status
   */
  getSystemStatus(): {
    isMonitoring: boolean;
    latestSnapshot: ErrorTrackingSnapshot | null;
    totalPatterns: number;
    historyLength: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      latestSnapshot: this.metricsHistory[this.metricsHistory.length - 1] || null,
      totalPatterns: this.patterns.size,
      historyLength: this.metricsHistory.length
    };
  }

  /**
   * Get detailed metrics report
   */
  getMetricsReport(): string {
    const status = this.getSystemStatus();
    const snapshot = status.latestSnapshot;
    
    if (!snapshot) {
      return 'No metrics available. Run analysis first.';
    }

    const report = [
      '📊 ENTERPRISE ERROR TRACKING SYSTEM REPORT',
      '==========================================',
      '',
      `🔍 Monitoring Status: ${status.isMonitoring ? 'ACTIVE' : 'INACTIVE'}`,
      `📈 Total Errors: ${snapshot.metrics.totalErrors}`,
      `⚡ Error Velocity: ${snapshot.metrics.errorVelocity.toFixed(2)} errors/min`,
      `📉 Reduction Rate: ${(snapshot.metrics.errorReductionRate * 100).toFixed(1)}%`,
      `🎯 Pattern Accuracy: ${(snapshot.metrics.patternRecognitionAccuracy * 100).toFixed(1)}%`,
      `🤖 Automation Efficiency: ${(snapshot.metrics.automationEfficiency * 100).toFixed(1)}%`,
      `🏗️  Build Stability: ${(snapshot.metrics.buildStabilityScore * 100).toFixed(1)}%`,
      `🔮 Predictive Accuracy: ${(snapshot.metrics.predictiveAccuracy * 100).toFixed(1)}%`,
      `🚦 Quality Gates: ${snapshot.qualityGateStatus.toUpperCase()}`,
      `💚 System Health: ${snapshot.systemHealth.toUpperCase()}`,
      '',
      '🔥 Top Error Patterns:',
      ...snapshot.patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(p => `   ${p.errorCode}: ${p.frequency} errors (${(p.successRate * 100).toFixed(1)}% success rate)`),
      '',
      '📈 Active Trends:',
      ...snapshot.trends
        .filter(t => t.trendDirection !== 'stable')
        .slice(0, 3)
        .map(t => `   ${t.category}: ${t.trendDirection} (${(t.changeRate * 100).toFixed(1)}%)`),
      '',
      '💡 Top Recommendations:',
      ...snapshot.recommendations
        .slice(0, 3)
        .map(r => `   ${r.priority.toUpperCase()}: ${r.description}`),
      '',
      `⏰ Last Updated: ${snapshot.timestamp.toLocaleString()}`,
      `📚 History Length: ${status.historyLength} snapshots`,
      `🧠 Pattern Library: ${status.totalPatterns} patterns`
    ];

    return report.join('\n');
  }

  /**
   * Force immediate analysis
   */
  async forceAnalysis(): Promise<ErrorTrackingSnapshot> {
    log.info('🔄 Forcing immediate error analysis...');
    return await this.performAutomatedAnalysis();
  }

  /**
   * Reset all tracking data
   */
  resetTrackingData(): void {
    this.metricsHistory = [];
    this.patterns.clear();
    
    // Delete persisted files
    try {
      if (fs.existsSync(this.METRICS_FILE)) {
        fs.unlinkSync(this.METRICS_FILE);
      }
      if (fs.existsSync(this.PATTERNS_FILE)) {
        fs.unlinkSync(this.PATTERNS_FILE);
      }
    } catch (error) {
      console.error('⚠️  Failed to delete persisted files:', error);
    }
    
    log.info('🔄 All tracking data reset');
  }
}

// ========== SINGLETON INSTANCE ==========

export const enterpriseErrorTracker = new ErrorTrackingEnterpriseSystem();

// ========== EXPORT FACTORY ==========

export const createErrorTrackingSystem = () => new ErrorTrackingEnterpriseSystem();