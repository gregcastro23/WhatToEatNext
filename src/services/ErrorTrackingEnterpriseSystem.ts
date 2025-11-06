/**
 * Enterprise Error Tracking System
 */

import { execSync } from "child_process";
import fs from "fs";
import { log } from "@/services/LoggingService";
import {
  ErrorCategory,
  TypeScriptErrorAnalyzer,
} from "./campaign/TypeScriptErrorAnalyzer";
import type { TypeScriptError } from "./campaign/TypeScriptErrorAnalyzer";

// ========== ENTERPRISE ERROR TRACKING INTERFACES ==========

export interface ErrorTrackingMetrics {
  totalErrors: number;
  errorVelocity: number; // errors per minute
  errorReductionRate: number; // percentage reduction (0..1)
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
  complexity: "low" | "medium" | "high";
  automationPotential: number;
  lastSeen: Date;
}

export interface ErrorTrend {
  category: ErrorCategory;
  trendDirection: "increasing" | "decreasing" | "stable";
  changeRate: number;
  predictedCount: number;
  confidence: number;
  timeframe: "1h" | "6h" | "24h" | "7d";
}

export interface IntelligentRecommendation {
  recommendationId: string;
  priority: "critical" | "high" | "medium" | "low";
  category: ErrorCategory;
  description: string;
  estimatedImpact: number;
  automationPossible: boolean;
  timeEstimate: number; // minutes
  dependencies: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface ErrorTrackingSnapshot {
  timestamp: Date;
  metrics: ErrorTrackingMetrics;
  patterns: ErrorPattern[];
  trends: ErrorTrend[];
  recommendations: IntelligentRecommendation[];
  qualityGateStatus: "passing" | "failing" | "warning";
  systemHealth: "excellent" | "good" | "fair" | "poor";
}

interface UnknownAnalysis {
  errors?: TypeScriptError[];
  distribution?: { priorityRanking?: TypeScriptError[] };
}

// ========== ENTERPRISE ERROR TRACKING SYSTEM ==========

export class ErrorTrackingEnterpriseSystem {
  private readonly analyzer: TypeScriptErrorAnalyzer;
  private metricsHistory: ErrorTrackingSnapshot[] = [];
  private patterns: Map<string, ErrorPattern> = new Map();
  private isMonitoring = false;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private readonly METRICS_FILE = ".enterprise-error-metrics.json";
  private readonly PATTERNS_FILE = ".enterprise-error-patterns.json";

  constructor() {
    this.analyzer = new TypeScriptErrorAnalyzer();
    this.loadPersistedData();
  }

  // ========== REAL-TIME ERROR MONITORING ==========

  startRealTimeMonitoring(intervalMinutes = 5): void {
    if (this.isMonitoring) {
      log.info("Error monitoring already active");
      return;
    }

    this.isMonitoring = true;
    log.info(
      `Starting real-time error monitoring (${intervalMinutes}min intervals)`,
    );

    this.monitoringInterval = setInterval(
      () => {
        void (async () => {
          try {
            await this.performAutomatedAnalysis();
          } catch (error) {
            log.error("Error during automated analysis: ", error);
          }
        })();
      },
      intervalMinutes * 60 * 1000,
    );

    void this.performAutomatedAnalysis();
  }

  stopRealTimeMonitoring(): void {
    if (!this.isMonitoring) {
      log.info("Error monitoring not active");
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    log.info("Real-time error monitoring stopped");
  }

  async performAutomatedAnalysis(): Promise<ErrorTrackingSnapshot> {
    const startTime = Date.now();
    log.info("Performing automated error analysis...");

    const analysisResult =
      (await this.analyzer.analyzeErrors()) as unknown as UnknownAnalysis;
    const currentErrorCount = await this.analyzer.getCurrentErrorCount();

    const rankedErrors =
      analysisResult.distribution?.priorityRanking ||
      analysisResult.errors ||
      [];
    this.updateErrorPatterns(rankedErrors);

    const metrics = this.calculateMetrics(analysisResult, currentErrorCount);
    const trends = this.analyzeTrends();
    const recommendations = this.generateIntelligentRecommendations(
      metrics,
      trends,
    );
    const qualityGateStatus = this.assessQualityGates(metrics);
    const systemHealth = this.assessSystemHealth(metrics, qualityGateStatus);

    const snapshot: ErrorTrackingSnapshot = {
      timestamp: new Date(),
      metrics,
      patterns: Array.from(this.patterns.values()),
      trends,
      recommendations,
      qualityGateStatus,
      systemHealth,
    };

    this.metricsHistory.push(snapshot);
    if (this.metricsHistory.length > 100) this.metricsHistory.shift();

    await this.persistData();

    const ms = Date.now() - startTime;
    log.info(`Automated analysis completed in ${ms}ms`);
    log.info(
      `Current state: ${currentErrorCount} errors, ${systemHealth} health`,
    );

    return snapshot;
  }

  // ========== PATTERN RECOGNITION ==========

  private updateErrorPatterns(errors: TypeScriptError[]): void {
    const patternMap = new Map<
      string,
      { count: number; errors: TypeScriptError[] }
    >();

    for (const error of errors) {
      const patternKey = `${error.code}_${error.category}`;
      if (!patternMap.has(patternKey))
        patternMap.set(patternKey, { count: 0, errors: [] });
      const entry = patternMap.get(patternKey)!;
      entry.count += 1;
      entry.errors.push(error);
    }

    patternMap.forEach((data, patternKey) => {
      const existing = this.patterns.get(patternKey);
      if (existing) {
        existing.lastSeen = new Date();
        // Success rate nudged based on relative change
        const previous = existing.frequency;
        existing.frequency = data.count;
        if (data.count < previous)
          existing.successRate = Math.min(0.98, existing.successRate + 0.02);
        if (data.count > previous)
          existing.successRate = Math.max(0.5, existing.successRate - 0.01);
      } else {
        const first = data.errors[0];
        const newPattern: ErrorPattern = {
          patternId: patternKey,
          errorCode: first.code,
          frequency: data.count,
          successRate: this.calculateInitialSuccessRate(first.code),
          averageFixTime: this.estimateFixTime(first.code),
          complexity: this.assessComplexity(first.code, first.message),
          automationPotential: this.calculateAutomationPotential(first.code),
          lastSeen: new Date(),
        };
        this.patterns.set(patternKey, newPattern);
      }
    });
  }

  private calculateInitialSuccessRate(errorCode: string): number {
    const successRates: Record<string, number> = {
      TS2352: 0.92,
      TS2345: 0.87,
      TS2304: 0.95,
      TS2698: 0.83,
      TS2362: 0.91,
      TS2322: 0.78,
      TS2339: 0.85,
    };
    return successRates[errorCode] ?? 0.75;
  }

  private estimateFixTime(errorCode: string): number {
    const fixTimes: Record<string, number> = {
      TS2352: 2.5,
      TS2345: 3.0,
      TS2304: 1.5,
      TS2698: 4.0,
      TS2362: 2.0,
      TS2322: 3.5,
      TS2339: 2.8,
    };
    return fixTimes[errorCode] ?? 3.0;
  }

  private assessComplexity(
    errorCode: string,
    message: string,
  ): "low" | "medium" | "high" {
    if (errorCode === "TS2304") return "low";
    if (errorCode === "TS2362") return "low";
    if (errorCode === "TS2698") return "high";
    if (message.toLowerCase().includes("complex")) return "high";
    if (message.toLowerCase().includes("generic")) return "medium";
    return "medium";
  }

  private calculateAutomationPotential(errorCode: string): number {
    const table: Record<string, number> = {
      TS2352: 0.85,
      TS2345: 0.7,
      TS2304: 0.95,
      TS2698: 0.6,
      TS2362: 0.9,
      TS2322: 0.65,
      TS2339: 0.75,
    };
    return table[errorCode] ?? 0.7;
  }

  // ========== TREND ANALYSIS ==========

  private analyzeTrends(): ErrorTrend[] {
    if (this.metricsHistory.length < 2) return [];
    const currentSnapshot = this.metricsHistory[this.metricsHistory.length - 1];
    const previousSnapshot =
      this.metricsHistory[this.metricsHistory.length - 2];

    const categories = Object.values(ErrorCategory);
    const trends: ErrorTrend[] = [];
    for (const category of categories) {
      const currentCount = this.getErrorCountByCategory(
        currentSnapshot,
        category,
      );
      const previousCount = this.getErrorCountByCategory(
        previousSnapshot,
        category,
      );
      if (currentCount === 0 && previousCount === 0) continue;
      const changeRate =
        previousCount > 0 ? (currentCount - previousCount) / previousCount : 0;
      const trendDirection: ErrorTrend["trendDirection"] =
        changeRate > 0.1
          ? "increasing"
          : changeRate < -0.1
            ? "decreasing"
            : "stable";
      const predictedCount = Math.max(
        0,
        Math.round(currentCount * (1 + changeRate)),
      );
      const confidence = Math.min(0.95, 0.5 + Math.abs(changeRate) * 0.5);
      trends.push({
        category,
        trendDirection,
        changeRate,
        predictedCount,
        confidence,
        timeframe: "1h",
      });
    }
    return trends;
  }

  private getErrorCountByCategory(
    snapshot: ErrorTrackingSnapshot,
    category: ErrorCategory,
  ): number {
    return snapshot.patterns
      .filter((p) => p.patternId.includes(String(category)))
      .reduce((sum, p) => sum + p.frequency, 0);
  }

  // ========== RECOMMENDATIONS ==========

  private generateIntelligentRecommendations(
    metrics: ErrorTrackingMetrics,
    trends: ErrorTrend[],
  ): IntelligentRecommendation[] {
    const recommendations: IntelligentRecommendation[] = [];

    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    topPatterns.forEach((pattern, index) => {
      recommendations.push({
        recommendationId: `pattern_${pattern.patternId}_${Date.now()}`,
        priority: index === 0 ? "critical" : index === 1 ? "high" : "medium",
        category: pattern.patternId.split("_")[1] as ErrorCategory,
        description: `Address ${pattern.frequency} ${pattern.errorCode} errors with ${(pattern.successRate * 100).toFixed(1)}% success rate`,
        estimatedImpact: Math.round(pattern.frequency * pattern.successRate),
        automationPossible: pattern.automationPotential > 0.8,
        timeEstimate: Math.round(pattern.averageFixTime * pattern.frequency),
        dependencies: this.getPatternDependencies(pattern),
        riskLevel:
          pattern.complexity === "high"
            ? "high"
            : pattern.complexity === "medium"
              ? "medium"
              : "low",
      });
    });

    const increasingTrends = trends.filter(
      (t) => t.trendDirection === "increasing",
    );
    increasingTrends.forEach((trend) => {
      recommendations.push({
        recommendationId: `trend_${trend.category}_${Date.now()}`,
        priority: trend.changeRate > 0.5 ? "high" : "medium",
        category: trend.category,
        description: `Urgent: ${trend.category} errors trending upward (+${(trend.changeRate * 100).toFixed(1)}%)`,
        estimatedImpact: Math.round(trend.predictedCount * 0.2),
        automationPossible:
          this.calculateAutomationPotential(String(trend.category)) > 0.7,
        timeEstimate: trend.predictedCount * 2,
        dependencies: [],
        riskLevel: trend.changeRate > 0.3 ? "high" : "medium",
      });
    });

    if (metrics.buildStabilityScore < 0.8) {
      recommendations.push({
        recommendationId: `stability_${Date.now()}`,
        priority: "critical",
        category: ErrorCategory.OTHER,
        description:
          "Critical: Build stability below threshold - implement immediate fixes",
        estimatedImpact: Math.round(metrics.totalErrors * 0.2),
        automationPossible: false,
        timeEstimate: 60,
        dependencies: ["build_validation", "error_analysis"],
        riskLevel: "high",
      });
    }

    if (metrics.errorVelocity < 0.5) {
      recommendations.push({
        recommendationId: `performance_${Date.now()}`,
        priority: "medium",
        category: ErrorCategory.OTHER,
        description:
          "Optimize error fixing velocity - consider batch processing",
        estimatedImpact: Math.round(metrics.totalErrors * 0.2),
        automationPossible: true,
        timeEstimate: 30,
        dependencies: ["batch_processing", "automation_tools"],
        riskLevel: "low",
      });
    }

    return recommendations.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return order[a.priority] - order[b.priority];
    });
  }

  private getPatternDependencies(pattern: ErrorPattern): string[] {
    const deps: string[] = [];
    if (pattern.errorCode === "TS2304")
      deps.push("import_analysis", "module_resolution");
    if (pattern.errorCode === "TS2352")
      deps.push("type_analysis", "conversion_safety");
    if (pattern.complexity === "high")
      deps.push("manual_review", "expert_analysis");
    return deps;
  }

  // ========== METRICS ==========

  private calculateMetrics(
    _analysisResult: UnknownAnalysis,
    currentErrorCount: number,
  ): ErrorTrackingMetrics {
    const previousSnapshot =
      this.metricsHistory[this.metricsHistory.length - 1];
    const minutesElapsed = previousSnapshot
      ? (Date.now() - previousSnapshot.timestamp.getTime()) / (1000 * 60)
      : 1;

    const prevTotal = previousSnapshot.metrics.totalErrors ?? currentErrorCount;
    const errorVelocity =
      Math.abs(prevTotal - currentErrorCount) / Math.max(minutesElapsed, 1);

    const initialCount =
      this.metricsHistory.length > 0
        ? this.metricsHistory[0].metrics.totalErrors
        : currentErrorCount;
    const errorReductionRate =
      initialCount > 0 ? (initialCount - currentErrorCount) / initialCount : 0;

    return {
      totalErrors: currentErrorCount,
      errorVelocity,
      errorReductionRate,
      patternRecognitionAccuracy: this.calculatePatternAccuracy(),
      automationEfficiency: this.calculateAutomationEfficiency(),
      buildStabilityScore: this.calculateBuildStabilityScore(),
      predictiveAccuracy: this.calculatePredictiveAccuracy(),
      lastUpdated: new Date(),
    };
  }

  private calculatePatternAccuracy(): number {
    const patterns = Array.from(this.patterns.values());
    if (patterns.length === 0) return 0.8;
    const avg =
      patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
    return Math.min(0.98, avg);
  }

  private calculateAutomationEfficiency(): number {
    const patterns = Array.from(this.patterns.values());
    if (patterns.length === 0) return 0.7;
    const weighted = patterns.reduce(
      (sum, p) => sum + p.automationPotential * p.frequency,
      0,
    );
    const total = patterns.reduce((sum, p) => sum + p.frequency, 0);
    return total > 0 ? weighted / total : 0.7;
  }

  private calculateBuildStabilityScore(): number {
    try {
      execSync("yarn tsc --noEmit --skipLibCheck", {
        stdio: "pipe",
        timeout: 30000,
      });
      return 0.95;
    } catch {
      const last = this.metricsHistory[this.metricsHistory.length - 1];
      const count = last.metrics.totalErrors ?? 1000;
      return Math.max(0.3, 1 - count / 5000);
    }
  }

  private calculatePredictiveAccuracy(): number {
    if (this.metricsHistory.length < 3) return 0.75;
    const twoAgo = this.metricsHistory[this.metricsHistory.length - 3];
    const current = this.metricsHistory[this.metricsHistory.length - 1];
    let sum = 0;
    let cnt = 0;
    for (const pred of twoAgo.trends) {
      const actual = this.getErrorCountByCategory(current, pred.category);
      if (pred.predictedCount > 0) {
        const acc =
          1 - Math.abs(actual - pred.predictedCount) / pred.predictedCount;
        sum += Math.max(0, acc);
        cnt += 1;
      }
    }
    return cnt > 0 ? sum / cnt : 0.75;
  }

  // ========== QUALITY GATES ==========

  private assessQualityGates(
    metrics: ErrorTrackingMetrics,
  ): "passing" | "failing" | "warning" {
    const critical = {
      totalErrors: 100,
      errorReductionRate: 0.1,
      buildStabilityScore: 0.7,
      automationEfficiency: 0.5,
    };
    const warning = {
      totalErrors: 500,
      errorReductionRate: 0.05,
      buildStabilityScore: 0.8,
      automationEfficiency: 0.7,
    };

    if (
      metrics.totalErrors > critical.totalErrors ||
      metrics.errorReductionRate < critical.errorReductionRate ||
      metrics.buildStabilityScore < critical.buildStabilityScore ||
      metrics.automationEfficiency < critical.automationEfficiency
    ) {
      return "failing";
    }

    if (
      metrics.totalErrors > warning.totalErrors ||
      metrics.errorReductionRate < warning.errorReductionRate ||
      metrics.buildStabilityScore < warning.buildStabilityScore ||
      metrics.automationEfficiency < warning.automationEfficiency
    ) {
      return "warning";
    }
    return "passing";
  }

  private assessSystemHealth(
    metrics: ErrorTrackingMetrics,
    qualityGateStatus: "passing" | "failing" | "warning",
  ): "excellent" | "good" | "fair" | "poor" {
    if (qualityGateStatus === "failing") return "poor";
    const score =
      metrics.errorReductionRate * 0.2 +
      metrics.buildStabilityScore * 0.2 +
      metrics.automationEfficiency * 0.2 +
      metrics.patternRecognitionAccuracy * 0.2 +
      metrics.predictiveAccuracy * 0.2;
    if (score >= 0.9) return "excellent";
    if (score >= 0.75) return "good";
    if (score >= 0.6) return "fair";
    return "poor";
  }

  // ========== DATA PERSISTENCE ==========

  private async persistData(): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.METRICS_FILE,
        JSON.stringify(this.metricsHistory, null, 2),
      );
      const patternsData = Array.from(this.patterns.entries());
      await fs.promises.writeFile(
        this.PATTERNS_FILE,
        JSON.stringify(patternsData, null, 2),
      );
    } catch (error) {
      log.error("Failed to persist data: ", error);
    }
  }

  private loadPersistedData(): void {
    try {
      if (fs.existsSync(this.METRICS_FILE)) {
        const metricsData = JSON.parse(
          fs.readFileSync(this.METRICS_FILE, "utf8"),
        ) as ErrorTrackingSnapshot[];
        this.metricsHistory = metricsData.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
      if (fs.existsSync(this.PATTERNS_FILE)) {
        const patternsData = JSON.parse(
          fs.readFileSync(this.PATTERNS_FILE, "utf8"),
        ) as Array<[string, ErrorPattern]>;
        this.patterns = new Map(
          patternsData.map(([k, v]) => [
            k,
            { ...v, lastSeen: new Date(v.lastSeen) },
          ]),
        );
      }
    } catch (error) {
      log.error("Failed to load persisted data: ", error);
    }
  }

  // ========== PUBLIC API ==========

  getSystemStatus(): {
    isMonitoring: boolean;
    latestSnapshot: ErrorTrackingSnapshot | null;
    totalPatterns: number;
    historyLength: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      latestSnapshot:
        this.metricsHistory[this.metricsHistory.length - 1] || null,
      totalPatterns: this.patterns.size,
      historyLength: this.metricsHistory.length,
    };
  }

  getMetricsReport(): string {
    const status = this.getSystemStatus();
    const snapshot = status.latestSnapshot;
    if (!snapshot) return "No metrics available. Run analysis first.";

    const lines: string[] = [
      "ENTERPRISE ERROR TRACKING SYSTEM REPORT",
      "========================================",
      `Monitoring Status: ${status.isMonitoring ? "ACTIVE" : "INACTIVE"}`,
      `Total Errors: ${snapshot.metrics.totalErrors}`,
      `Error Velocity: ${snapshot.metrics.errorVelocity.toFixed(2)} errors/min`,
      `Reduction Rate: ${(snapshot.metrics.errorReductionRate * 100).toFixed(1)}%`,
      `Pattern Accuracy: ${(snapshot.metrics.patternRecognitionAccuracy * 100).toFixed(1)}%`,
      `Automation Efficiency: ${(snapshot.metrics.automationEfficiency * 100).toFixed(1)}%`,
      `Build Stability: ${(snapshot.metrics.buildStabilityScore * 100).toFixed(1)}%`,
      `Predictive Accuracy: ${(snapshot.metrics.predictiveAccuracy * 100).toFixed(1)}%`,
      `Quality Gates: ${snapshot.qualityGateStatus.toUpperCase()}`,
      `System Health: ${snapshot.systemHealth.toUpperCase()}`,
      "",
      "Top Error Patterns:",
    ];

    lines.push(
      ...snapshot.patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(
          (p) =>
            `  ${p.errorCode}: ${p.frequency} errors (${(p.successRate * 100).toFixed(1)}% success)`,
        ),
    );

    lines.push(
      "",
      "Active Trends:",
      ...snapshot.trends
        .filter((t) => t.trendDirection !== "stable")
        .slice(0, 3)
        .map(
          (t) =>
            `  ${t.category}: ${t.trendDirection} (${(t.changeRate * 100).toFixed(1)}%)`,
        ),
      "",
      "Top Recommendations:",
      ...snapshot.recommendations
        .slice(0, 3)
        .map((r) => `  ${r.priority.toUpperCase()}: ${r.description}`),
      "",
      `Last Updated: ${snapshot.timestamp.toLocaleString()}`,
      `History Length: ${status.historyLength} snapshots`,
      `Pattern Library: ${status.totalPatterns} patterns`,
    );

    return lines.join("\n");
  }

  async forceAnalysis(): Promise<ErrorTrackingSnapshot> {
    log.info("Forcing immediate error analysis...");
    return await this.performAutomatedAnalysis();
  }

  resetTrackingData(): void {
    this.metricsHistory = [];
    this.patterns.clear();
    try {
      if (fs.existsSync(this.METRICS_FILE)) fs.unlinkSync(this.METRICS_FILE);
      if (fs.existsSync(this.PATTERNS_FILE)) fs.unlinkSync(this.PATTERNS_FILE);
    } catch (error) {
      log.error("Failed to delete persisted files: ", error);
    }
    log.info("All tracking data reset");
  }
}

// ========== SINGLETON INSTANCE ==========

export const _enterpriseErrorTracker = new ErrorTrackingEnterpriseSystem();

// ========== EXPORT FACTORY ==========

export const _createErrorTrackingSystem = () =>
  new ErrorTrackingEnterpriseSystem();
