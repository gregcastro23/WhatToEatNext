import fs from 'fs';
import path from 'path';

import { buildPerformanceMonitor } from './BuildPerformanceMonitor';
import { errorTrackingSystem } from './ErrorTrackingSystem';

export interface QualityInsight {
  type: 'trend' | 'prediction' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  confidence: number; // 0-1
  timeframe: string;
  actionable: boolean;
  suggestedActions: string[];
  metrics: Record<string, number>;
}

export interface TechnicalDebtItem {
  category: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  files: string[];
  estimatedHours: number;
  priority: number;
  automatable: boolean;
}

export interface QualityPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: '1w' | '1m' | '3m';
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface QualityGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  progress: number; // 0-100
  onTrack: boolean;
  milestones: QualityMilestone[];
}

export interface QualityMilestone {
  id: string;
  name: string;
  targetValue: number;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface QualityReport {
  period: string;
  summary: {
    overallScore: number;
    improvement: number;
    keyAchievements: string[];
    majorIssues: string[];
  };
  metrics: {
    codeQuality: number;
    performance: number;
    maintainability: number;
    technicalDebt: number;
  };
  trends: {
    errorReduction: number;
    performanceImprovement: number;
    debtReduction: number;
  };
  insights: QualityInsight[];
  predictions: QualityPrediction[];
  recommendations: string[];
}

class QualityMetricsService {
  private insights: QualityInsight[] = [];
  private technicalDebt: TechnicalDebtItem[] = [];
  private predictions: QualityPrediction[] = [];
  private goals: QualityGoal[] = [];
  private reports: QualityReport[] = [];
  private subscribers: Set<(data: QualityInsight | QualityReport | TechnicalDebtItem) => void> = new Set();

  constructor() {
    this.loadHistoricalData();
    this.startPeriodicAnalysis();
    this.initializeDefaultGoals();
  }

  private loadHistoricalData() {
    try {
      const dataPath = path.join(process.cwd(), '.kiro', 'metrics', 'quality-insights.json');
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        this.insights = data.insights || [];
        this.technicalDebt = data.technicalDebt || [];
        this.predictions = data.predictions || [];
        this.goals = data.goals || [];
        this.reports = data.reports || [];
      }
    } catch (error) {
      console.warn('[Quality Metrics Service] Failed to load historical data:', error);
    }
  }

  private saveHistoricalData() {
    try {
      const metricsDir = path.join(process.cwd(), '.kiro', 'metrics');
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }

      const dataPath = path.join(metricsDir, 'quality-insights.json');
      const data = {
        insights: this.insights.slice(-100),
        technicalDebt: this.technicalDebt.slice(-50),
        predictions: this.predictions.slice(-20),
        goals: this.goals,
        reports: this.reports.slice(-12) // Keep last 12 reports
      };

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[Quality Metrics Service] Failed to save historical data:', error);
    }
  }

  private startPeriodicAnalysis() {
    // Generate insights every 15 minutes
    setInterval(() => {
      this.generateInsights();
      this.updatePredictions();
      this.analyzeTechnicalDebt();
      this.updateGoalProgress();
      this.saveHistoricalData();
      this.notifySubscribers();
    }, 15 * 60 * 1000);

    // Generate weekly reports
    setInterval(() => {
      this.generateWeeklyReport();
    }, 7 * 24 * 60 * 60 * 1000);
  }

  private initializeDefaultGoals() {
    if (this.goals.length === 0) {
      const defaultGoals: QualityGoal[] = [
        {
          id: 'typescript-errors',
          name: 'Zero TypeScript Errors',
          description: 'Eliminate all TypeScript compilation errors',
          targetValue: 0,
          currentValue: 0,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          progress: 0,
          onTrack: true,
          milestones: [
            {
              id: 'ts-milestone-1',
              name: 'Reduce to under 500 errors',
              targetValue: 500,
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              completed: false
            },
            {
              id: 'ts-milestone-2',
              name: 'Reduce to under 100 errors',
              targetValue: 100,
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              completed: false
            }
          ]
        },
        {
          id: 'code-quality-score',
          name: 'Achieve 90% Code Quality Score',
          description: 'Maintain consistently high code quality',
          targetValue: 90,
          currentValue: 0,
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
          progress: 0,
          onTrack: true,
          milestones: [
            {
              id: 'quality-milestone-1',
              name: 'Achieve 70% quality score',
              targetValue: 70,
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              completed: false
            },
            {
              id: 'quality-milestone-2',
              name: 'Achieve 80% quality score',
              targetValue: 80,
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              completed: false
            }
          ]
        },
        {
          id: 'build-performance',
          name: 'Sub-30s Build Times',
          description: 'Optimize build performance for developer productivity',
          targetValue: 30,
          currentValue: 0,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          progress: 0,
          onTrack: true,
          milestones: [
            {
              id: 'build-milestone-1',
              name: 'Achieve sub-60s builds',
              targetValue: 60,
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              completed: false
            }
          ]
        }
      ];

      this.goals = defaultGoals;
    }
  }

  private generateInsights() {
    const buildSummary = buildPerformanceMonitor.getPerformanceSummary();
    const errorSummary = errorTrackingSystem.getErrorSummary();
    const qualityMetrics = errorTrackingSystem.getCurrentQualityMetrics();

    const newInsights: QualityInsight[] = [];

    // Performance insights
    if (buildSummary.averageBuildTime > 60000) {
      newInsights.push({
        type: 'alert',
        title: 'Slow Build Performance',
        description: `Build times averaging ${Math.round(buildSummary.averageBuildTime / 1000)}s, exceeding 60s threshold`,
        severity: 'warning',
        confidence: 0.9,
        timeframe: 'current',
        actionable: true,
        suggestedActions: [
          'Enable TypeScript incremental compilation',
          'Optimize webpack configuration',
          'Implement build caching',
          'Analyze bundle composition'
        ],
        metrics: {
          currentBuildTime: buildSummary.averageBuildTime,
          targetBuildTime: 30000,
          regressionPercentage: ((buildSummary.averageBuildTime - 30000) / 30000) * 100
        }
      });
    }

    // Error trend insights
    if (errorSummary.totalActiveErrors > 1000) {
      newInsights.push({
        type: 'trend',
        title: 'High Error Count',
        description: `${errorSummary.totalActiveErrors} active errors detected, indicating code quality issues`,
        severity: errorSummary.totalActiveErrors > 2000 ? 'error' : 'warning',
        confidence: 0.95,
        timeframe: 'current',
        actionable: true,
        suggestedActions: [
          'Prioritize fixing high-frequency error patterns',
          'Implement automated error fixing campaigns',
          'Focus on files with multiple errors',
          'Add stricter TypeScript configuration'
        ],
        metrics: {
          totalErrors: errorSummary.totalActiveErrors,
          criticalErrors: errorSummary.criticalIssues,
          automationOpportunities: errorSummary.automationOpportunities
        }
      });
    }

    // Quality score insights
    if (qualityMetrics && qualityMetrics.codeQualityScore < 70) {
      newInsights.push({
        type: 'recommendation',
        title: 'Code Quality Below Target',
        description: `Code quality score of ${qualityMetrics.codeQualityScore}% is below the 70% threshold`,
        severity: qualityMetrics.codeQualityScore < 50 ? 'error' : 'warning',
        confidence: 0.85,
        timeframe: 'current',
        actionable: true,
        suggestedActions: [
          'Address high-priority error patterns',
          'Implement code review guidelines',
          'Add automated quality checks',
          'Refactor complex components'
        ],
        metrics: {
          currentScore: qualityMetrics.codeQualityScore,
          targetScore: 70,
          technicalDebt: qualityMetrics.technicalDebtScore
        }
      });
    }

    // Technical debt insights
    if (qualityMetrics && qualityMetrics.technicalDebtScore > 60) {
      newInsights.push({
        type: 'alert',
        title: 'High Technical Debt',
        description: `Technical debt score of ${qualityMetrics.technicalDebtScore}% requires immediate attention`,
        severity: 'error',
        confidence: 0.8,
        timeframe: 'current',
        actionable: true,
        suggestedActions: [
          'Schedule technical debt reduction sprints',
          'Prioritize refactoring high-impact areas',
          'Implement automated code cleanup',
          'Establish debt prevention guidelines'
        ],
        metrics: {
          debtScore: qualityMetrics.technicalDebtScore,
          maintainabilityIndex: qualityMetrics.maintainabilityIndex
        }
      });
    }

    // Automation opportunity insights
    if (errorSummary.automationOpportunities > 5) {
      newInsights.push({
        type: 'recommendation',
        title: 'Automation Opportunities Available',
        description: `${errorSummary.automationOpportunities} error patterns can be automatically fixed`,
        severity: 'info',
        confidence: 0.9,
        timeframe: 'current',
        actionable: true,
        suggestedActions: [
          'Run automated error fixing campaigns',
          'Schedule batch processing for automatable errors',
          'Implement continuous automation',
          'Monitor automation success rates'
        ],
        metrics: {
          automatableErrors: errorSummary.automationOpportunities,
          totalErrors: errorSummary.totalActiveErrors,
          automationPotential: (errorSummary.automationOpportunities / errorSummary.totalActiveErrors) * 100
        }
      });
    }

    // Add new insights
    this.insights.push(...newInsights);

    // Keep only recent insights
    this.insights = this.insights.slice(-100);
  }

  private updatePredictions() {
    const buildHistory = buildPerformanceMonitor.getBuildHistory(20);
    const qualityHistory = errorTrackingSystem.getQualityHistory(20);
    const errorSummary = errorTrackingSystem.getErrorSummary();

    const newPredictions: QualityPrediction[] = [];

    // Build time prediction
    if (buildHistory.length >= 5) {
      const recentTimes = buildHistory.slice(-5).map(b => b.totalBuildTime);
      const trend = this.calculateTrend(recentTimes);
      const currentAvg = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
      const predictedTime = Math.max(0, currentAvg + (trend * 7)); // 1 week prediction

      newPredictions.push({
        metric: 'Build Time',
        currentValue: Math.round(currentAvg / 1000),
        predictedValue: Math.round(predictedTime / 1000),
        timeframe: '1w',
        confidence: this.calculateConfidence(recentTimes),
        factors: [
          'Recent build performance trends',
          'Code complexity changes',
          'Dependency updates',
          'Cache efficiency'
        ],
        recommendations: predictedTime > currentAvg * 1.2 ? [
          'Investigate performance regressions',
          'Optimize build configuration',
          'Review recent code changes'
        ] : []
      });
    }

    // Quality score prediction
    if (qualityHistory.length >= 5) {
      const recentScores = qualityHistory.slice(-5).map(q => q.codeQualityScore);
      const trend = this.calculateTrend(recentScores);
      const currentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const predictedScore = Math.max(0, Math.min(100, currentAvg + (trend * 7)));

      newPredictions.push({
        metric: 'Code Quality Score',
        currentValue: Math.round(currentAvg),
        predictedValue: Math.round(predictedScore),
        timeframe: '1w',
        confidence: this.calculateConfidence(recentScores),
        factors: [
          'Error resolution rate',
          'New error introduction rate',
          'Code review effectiveness',
          'Automated fixing success'
        ],
        recommendations: predictedScore < currentAvg * 0.9 ? [
          'Increase error fixing efforts',
          'Implement stricter code review',
          'Run quality improvement campaigns'
        ] : []
      });
    }

    // Error count prediction
    const currentErrors = errorSummary.totalActiveErrors;
    const errorReductionRate = this.estimateErrorReductionRate();
    const predictedErrors = Math.max(0, currentErrors - (errorReductionRate * 7));

    newPredictions.push({
      metric: 'Active Errors',
      currentValue: currentErrors,
      predictedValue: Math.round(predictedErrors),
      timeframe: '1w',
      confidence: 0.7,
      factors: [
        'Historical error resolution rate',
        'Automation effectiveness',
        'Development team capacity',
        'Error complexity distribution'
      ],
      recommendations: predictedErrors > currentErrors * 0.8 ? [
        'Increase error fixing capacity',
        'Focus on high-impact errors',
        'Implement more automation'
      ] : []
    });

    this.predictions = newPredictions;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateConfidence(values: number[]): number {
    if (values.length < 3) return 0.5;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    // Lower coefficient of variation = higher confidence
    return Math.max(0.1, Math.min(0.95, 1 - coefficientOfVariation));
  }

  private estimateErrorReductionRate(): number {
    const errorHistory = errorTrackingSystem.getQualityHistory(10);
    if (errorHistory.length < 2) return 0;

    const recent = errorHistory.slice(-3);
    const older = errorHistory.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, h) => sum + h.totalErrors, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.totalErrors, 0) / older.length;

    return Math.max(0, (olderAvg - recentAvg) / 7); // Errors reduced per day
  }

  private analyzeTechnicalDebt() {
    const errorPatterns = errorTrackingSystem.getErrorPatterns();
    const buildBottlenecks = buildPerformanceMonitor.getBottlenecks();

    const debtItems: TechnicalDebtItem[] = [];

    // Analyze error patterns for technical debt
    for (const pattern of errorPatterns) {
      if (pattern.frequency > 5 && pattern.priority !== 'low') {
        debtItems.push({
          category: 'Error Pattern',
          description: `${pattern.pattern} occurs ${pattern.frequency} times across ${pattern.files.length} files`,
          impact: pattern.priority as 'low' | 'medium' | 'high' | 'critical',
          effort: pattern.automatable ? 'low' : pattern.frequency > 20 ? 'high' : 'medium',
          files: pattern.files,
          estimatedHours: this.estimateEffort(pattern),
          priority: this.calculateDebtPriority(pattern.priority, pattern.frequency),
          automatable: pattern.automatable
        });
      }
    }

    // Analyze build bottlenecks for technical debt
    for (const bottleneck of buildBottlenecks.slice(0, 10)) {
      if (bottleneck.errorCount > 5 || bottleneck.complexity > 100) {
        debtItems.push({
          category: 'Build Bottleneck',
          description: `${bottleneck.file} has ${bottleneck.errorCount} errors and complexity score of ${bottleneck.complexity}`,
          impact: bottleneck.errorCount > 10 ? 'high' : 'medium',
          effort: bottleneck.complexity > 200 ? 'high' : 'medium',
          files: [bottleneck.file],
          estimatedHours: Math.min(40, Math.max(2, bottleneck.errorCount * 0.5 + bottleneck.complexity * 0.1)),
          priority: bottleneck.errorCount * 2 + bottleneck.complexity * 0.1,
          automatable: false
        });
      }
    }

    // Sort by priority
    debtItems.sort((a, b) => b.priority - a.priority);

    this.technicalDebt = debtItems.slice(0, 50);
  }

  private estimateEffort(pattern: { type?: string; priority?: string; frequency?: number; automatable?: boolean }): number {
    if (pattern.automatable) {
      return Math.min(8, pattern?.frequency * 0.1); // 0.1 hours per occurrence for automatable
    }

    const baseEffort = {
      'critical': 2,
      'high': 1.5,
      'medium': 1,
      'low': 0.5
    }[pattern.priority] || 1;

    return Math.min(40, pattern?.frequency * baseEffort);
  }

  private calculateDebtPriority(priority: string, frequency: number): number {
    const priorityWeight = {
      'critical': 100,
      'high': 75,
      'medium': 50,
      'low': 25
    }[priority] || 50;

    return priorityWeight + (frequency * 2);
  }

  private updateGoalProgress() {
    const errorSummary = errorTrackingSystem.getErrorSummary();
    const qualityMetrics = errorTrackingSystem.getCurrentQualityMetrics();
    const buildSummary = buildPerformanceMonitor.getPerformanceSummary();

    for (const goal of this.goals) {
      let currentValue = 0;

      switch (goal.id) {
        case 'typescript-errors':
          currentValue = errorSummary.totalActiveErrors;
          break;
        case 'code-quality-score':
          currentValue = qualityMetrics?.codeQualityScore || 0;
          break;
        case 'build-performance':
          currentValue = buildSummary.averageBuildTime / 1000; // Convert to seconds
          break;
      }

      goal.currentValue = currentValue;

      // Calculate progress
      if (goal.id === 'typescript-errors' || goal.id === 'build-performance') {
        // For metrics where lower is better
        const initialValue = goal.targetValue === 0 ? 5000 : goal.targetValue * 3; // Estimate initial value
        goal.progress = Math.max(0, Math.min(100, ((initialValue - currentValue) / initialValue) * 100));
      } else {
        // For metrics where higher is better
        goal.progress = Math.max(0, Math.min(100, (currentValue / goal.targetValue) * 100));
      }

      // Check if on track
      const timeElapsed = Date.now() - (goal.deadline.getTime() - 90 * 24 * 60 * 60 * 1000); // Assuming 90-day goals
      const timeTotal = 90 * 24 * 60 * 60 * 1000;
      const expectedProgress = (timeElapsed / timeTotal) * 100;
      goal.onTrack = goal.progress >= expectedProgress * 0.8; // Allow 20% buffer

      // Update milestones
      for (const milestone of goal.milestones) {
        if (!milestone.completed) {
          const milestoneReached = goal.id === 'typescript-errors' || goal.id === 'build-performance'
            ? currentValue <= milestone.targetValue
            : currentValue >= milestone.targetValue;

          if (milestoneReached) {
            milestone.completed = true;
            milestone.completedDate = new Date();
          }
        }
      }
    }
  }

  private generateWeeklyReport() {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const buildSummary = buildPerformanceMonitor.getPerformanceSummary();
    const errorSummary = errorTrackingSystem.getErrorSummary();
    const qualityMetrics = errorTrackingSystem.getCurrentQualityMetrics();

    const report: QualityReport = {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      summary: {
        overallScore: this.calculateOverallScore(buildSummary, errorSummary, qualityMetrics),
        improvement: this.calculateWeeklyImprovement(),
        keyAchievements: this.getKeyAchievements(),
        majorIssues: this.getMajorIssues()
      },
      metrics: {
        codeQuality: qualityMetrics?.codeQualityScore || 0,
        performance: buildSummary.performanceScore,
        maintainability: qualityMetrics?.maintainabilityIndex || 0,
        technicalDebt: qualityMetrics?.technicalDebtScore || 0
      },
      trends: {
        errorReduction: this.calculateErrorReductionTrend(),
        performanceImprovement: this.calculatePerformanceImprovementTrend(),
        debtReduction: this.calculateDebtReductionTrend()
      },
      insights: this.insights.slice(-10),
      predictions: this.predictions,
      recommendations: this.generateWeeklyRecommendations()
    };

    this.reports.push(report);
  }

  private calculateOverallScore(buildSummary: Record<string, unknown>, errorSummary: Record<string, unknown>, qualityMetrics: Record<string, unknown>): number {
    const weights = {
      codeQuality: 0.3,
      performance: 0.25,
      maintainability: 0.25,
      technicalDebt: 0.2
    };

    const scores: { codeQuality: number; performance: number; maintainability: number; technicalDebt: number } = {
      codeQuality: (qualityMetrics as Record<string, number>)?.codeQualityScore || 0,
      performance: (buildSummary as Record<string, number>).performanceScore || 0,
      maintainability: (qualityMetrics as Record<string, number>)?.maintainabilityIndex || 0,
      technicalDebt: Math.max(0, 100 - ((qualityMetrics as Record<string, number>)?.technicalDebtScore || 0))
    };

    return (Object.entries(weights) as Array<[keyof typeof weights, number]>).reduce((total, [key, weight]) => {
      const value = (scores as Record<string, number>)[key as keyof typeof scores] || 0;
      return total + (value * weight);
    }, 0);
  }

  private calculateWeeklyImprovement(): number {
    const recentReports = this.reports.slice(-2);
    if (recentReports.length < 2) return 0;

    const current = recentReports[1].summary.overallScore;
    const previous = recentReports[0].summary.overallScore;

    return Number(current) - Number(previous);
  }

  private getKeyAchievements(): string[] {
    const achievements: string[] = [];

    // Check completed milestones
    for (const goal of this.goals) {
      for (const milestone of goal.milestones) {
        if (milestone.completed && milestone.completedDate &&
            (Date.now() - milestone.completedDate.getTime()) < 7 * 24 * 60 * 60 * 1000) {
          achievements.push(`Completed milestone: ${milestone.name}`);
        }
      }
    }

    // Check significant improvements
    const recentInsights = this.insights.filter(i =>
      (Date.now() - new Date(i.timeframe).getTime()) < 7 * 24 * 60 * 60 * 1000 &&
      i.type === 'trend' && i.severity === 'info'
    );

    achievements.push(...recentInsights.map(i => i.title));

    return achievements.slice(0, 5);
  }

  private getMajorIssues(): string[] {
    return this.insights
      .filter(i => i.severity === 'error' || i.severity === 'critical')
      .slice(0, 5)
      .map(i => i.title);
  }

  private calculateErrorReductionTrend(): number {
    const qualityHistory = errorTrackingSystem.getQualityHistory(14);
    if (qualityHistory.length < 2) return 0;

    const recent = qualityHistory.slice(-7);
    const previous = qualityHistory.slice(-14, -7);

    if (recent.length === 0 || previous.length === 0) return 0;

    const recentAvg = recent.reduce((sum, h) => sum + h.totalErrors, 0) / recent.length;
    const previousAvg = previous.reduce((sum, h) => sum + h.totalErrors, 0) / previous.length;

    return previousAvg > 0 ? ((previousAvg - recentAvg) / previousAvg) * 100 : 0;
  }

  private calculatePerformanceImprovementTrend(): number {
    const buildHistory = buildPerformanceMonitor.getBuildHistory(14);
    if (buildHistory.length < 2) return 0;

    const recent = buildHistory.slice(-7);
    const previous = buildHistory.slice(-14, -7);

    if (recent.length === 0 || previous.length === 0) return 0;

    const recentAvg = recent.reduce((sum, b) => sum + b.totalBuildTime, 0) / recent.length;
    const previousAvg = previous.reduce((sum, b) => sum + b.totalBuildTime, 0) / previous.length;

    return previousAvg > 0 ? ((previousAvg - recentAvg) / previousAvg) * 100 : 0;
  }

  private calculateDebtReductionTrend(): number {
    const qualityHistory = errorTrackingSystem.getQualityHistory(14);
    if (qualityHistory.length < 2) return 0;

    const recent = qualityHistory.slice(-7);
    const previous = qualityHistory.slice(-14, -7);

    if (recent.length === 0 || previous.length === 0) return 0;

    const recentAvg = recent.reduce((sum, h) => sum + h.technicalDebtScore, 0) / recent.length;
    const previousAvg = previous.reduce((sum, h) => sum + h.technicalDebtScore, 0) / previous.length;

    return previousAvg > 0 ? ((previousAvg - recentAvg) / previousAvg) * 100 : 0;
  }

  private generateWeeklyRecommendations(): string[] {
    const recommendations: string[] = [];

    // Add recommendations from high-priority insights
    const actionableInsights = this.insights
      .filter(i => i.actionable && (i.severity === 'error' || i.severity === 'warning'))
      .slice(0, 3);

    for (const insight of actionableInsights) {
      recommendations.push(...insight.suggestedActions.slice(0, 2));
    }

    // Add recommendations from predictions
    for (const prediction of this.predictions) {
      if (prediction.recommendations.length > 0) {
        recommendations.push(...prediction.recommendations.slice(0, 1));
      }
    }

    // Add goal-based recommendations
    const offTrackGoals = this.goals.filter(g => !g.onTrack);
    for (const goal of offTrackGoals.slice(0, 2)) {
      recommendations.push(`Focus on ${goal.name} - currently ${Math.round(goal.progress)}% complete`);
    }

    return [...new Set(recommendations)].slice(0, 8); // Remove duplicates and limit
  }

  private notifySubscribers() {
    const data = {
      insights: this.insights.slice(-20),
      technicalDebt: this.technicalDebt.slice(0, 20),
      predictions: this.predictions,
      goals: this.goals,
      latestReport: this.reports.slice(-1)[0],
      summary: {
        totalInsights: this.insights.length,
        criticalInsights: this.insights.filter(i => i.severity === 'critical').length,
        totalDebtItems: this.technicalDebt.length,
        automatableDebt: this.technicalDebt.filter(d => d.automatable).length,
        goalsOnTrack: this.goals.filter(g => g.onTrack).length,
        totalGoals: this.goals.length
      }
    };

    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[Quality Metrics Service] Subscriber error:', error);
      }
    });
  }

  // Public API methods
  public subscribe(callback: (data: QualityInsight | QualityReport | TechnicalDebtItem) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public getInsights(type?: string, severity?: string): QualityInsight[] {
    let filtered = this.insights;

    if (type) {
      filtered = filtered.filter(i => i.type === type);
    }

    if (severity) {
      filtered = filtered.filter(i => i.severity === severity);
    }

    return filtered.slice(-50);
  }

  public getTechnicalDebt(): TechnicalDebtItem[] {
    return this.technicalDebt;
  }

  public getPredictions(): QualityPrediction[] {
    return this.predictions;
  }

  public getGoals(): QualityGoal[] {
    return this.goals;
  }

  public getReports(limit = 5): QualityReport[] {
    return this.reports.slice(-limit);
  }

  public addGoal(goal: Omit<QualityGoal, 'id' | 'progress' | 'onTrack'>): string {
    const id = `goal-${Date.now()}`;
    const newGoal: QualityGoal = {
      ...goal,
      id,
      progress: 0,
      onTrack: true
    };

    this.goals.push(newGoal);
    this.saveHistoricalData();

    return id;
  }

  public updateGoal(id: string, updates: Partial<QualityGoal>): boolean {
    const goalIndex = this.goals.findIndex(g => g.id === id);
    if (goalIndex === -1) return false;

    this.goals[goalIndex] = { ...this.goals[goalIndex], ...updates };
    this.saveHistoricalData();

    return true;
  }

  public deleteGoal(id: string): boolean {
    const goalIndex = this.goals.findIndex(g => g.id === id);
    if (goalIndex === -1) return false;

    this.goals.splice(goalIndex, 1);
    this.saveHistoricalData();

    return true;
  }

  public generateCustomReport(startDate: Date, endDate: Date): QualityReport {
    // This would generate a custom report for the specified date range
    // For now, return the latest report as a placeholder
    return this.reports.slice(-1)[0] || {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      summary: { overallScore: 0, improvement: 0, keyAchievements: [], majorIssues: [] },
      metrics: { codeQuality: 0, performance: 0, maintainability: 0, technicalDebt: 0 },
      trends: { errorReduction: 0, performanceImprovement: 0, debtReduction: 0 },
      insights: [],
      predictions: [],
      recommendations: []
    };
  }

  public reset() {
    this.insights = [];
    this.technicalDebt = [];
    this.predictions = [];
    this.goals = [];
    this.reports = [];
    this.initializeDefaultGoals();
    this.saveHistoricalData();
  }
}

export const qualityMetricsService = new QualityMetricsService();
export default QualityMetricsService;
