# Build Quality Monitoring Hook

---

name: "Build Quality Monitor" triggers:

- build_start: "any"
- build_complete: "any"
- build_failure: "any"
- performance_threshold: "exceeded" scope: "build-performance" approval: auto
  rollback: none priority: medium timeout: 120

---

## Overview

This hook automatically monitors build performance, error tracking, and quality
metrics to provide real-time insights into system health and development
workflow efficiency. It tracks build times, memory usage, error patterns, and
provides automated responses to critical performance issues.

## Trigger Conditions

### Build Event Triggers

- **Build Start**: Any build process initiation
  - Records build start time and system state
  - Captures pre-build metrics and resource usage
  - Initializes performance monitoring session
- **Build Complete**: Successful build completion
  - Measures total build duration and resource consumption
  - Analyzes build performance trends and patterns
  - Updates quality metrics and success rates

- **Build Failure**: Build process failures
  - Captures failure context and error details
  - Analyzes failure patterns and root causes
  - Triggers automated recovery recommendations

### Performance Threshold Triggers

- **Build Time Threshold**: >60 seconds for development builds
- **Memory Usage Threshold**: >4GB peak memory consumption
- **Error Rate Threshold**: >10% build failure rate over 24 hours
- **Bundle Size Threshold**: >20% increase in bundle size

## Monitoring Actions

### 1. Build Time Analysis

```typescript
// Monitor and analyze build performance metrics
async function analyzeBuildPerformance(): Promise<BuildPerformanceAnalysis> {
  const buildMetrics = await collectBuildMetrics();

  return {
    currentBuildTime: buildMetrics.duration,
    averageBuildTime: calculateAverageBuildTime(),
    buildTimePercentile: calculatePercentile(buildMetrics.duration),
    performanceTrend: analyzeBuildTimeTrend(),
    bottleneckAnalysis: identifyBuildBottlenecks(buildMetrics),
    optimizationRecommendations:
      generateOptimizationRecommendations(buildMetrics),
  };
}
```

### 2. Memory Usage Monitoring

```typescript
// Track memory consumption during build process
async function monitorMemoryUsage(): Promise<MemoryUsageAnalysis> {
  const memoryMetrics = await collectMemoryMetrics();

  return {
    peakMemoryUsage: memoryMetrics.peak,
    averageMemoryUsage: memoryMetrics.average,
    memoryLeakDetection: detectMemoryLeaks(memoryMetrics),
    garbageCollectionStats: analyzeGCPerformance(memoryMetrics),
    memoryOptimizationSuggestions: generateMemoryOptimizations(memoryMetrics),
  };
}
```

### 3. Quality Metrics Reporting

```typescript
// Generate comprehensive quality metrics reports
async function generateQualityMetricsReport(): Promise<QualityMetricsReport> {
  const metrics = await collectQualityMetrics();

  return {
    buildSuccessRate: calculateBuildSuccessRate(),
    errorFrequency: analyzeErrorFrequency(),
    codeQualityTrends: analyzeCodeQualityTrends(),
    performanceRegression: detectPerformanceRegression(),
    technicalDebtMetrics: calculateTechnicalDebtMetrics(),
    qualityGateStatus: evaluateQualityGates(metrics),
  };
}
```

### 4. Alert System Integration

```typescript
// Trigger alerts for critical performance issues
async function processPerformanceAlerts(
  metrics: BuildMetrics
): Promise<AlertResponse[]> {
  const alerts: AlertResponse[] = [];

  // Build time alerts
  if (metrics.buildTime > BUILD_TIME_THRESHOLD) {
    alerts.push({
      type: 'BUILD_PERFORMANCE',
      severity: 'HIGH',
      message: `Build time ${metrics.buildTime}s exceeds threshold ${BUILD_TIME_THRESHOLD}s`,
      recommendations: generateBuildOptimizationRecommendations(),
      autoResponse: 'ANALYZE_BOTTLENECKS',
    });
  }

  // Memory usage alerts
  if (metrics.memoryUsage > MEMORY_THRESHOLD) {
    alerts.push({
      type: 'MEMORY_USAGE',
      severity: 'MEDIUM',
      message: `Memory usage ${metrics.memoryUsage}MB exceeds threshold ${MEMORY_THRESHOLD}MB`,
      recommendations: generateMemoryOptimizationRecommendations(),
      autoResponse: 'MONITOR_MEMORY_LEAKS',
    });
  }

  return alerts;
}
```

## Implementation Details

### Hook Execution Flow

1. **Event Detection**: Monitor build system events and performance metrics
2. **Metrics Collection**: Gather comprehensive build and performance data
3. **Analysis Processing**: Analyze trends, patterns, and anomalies
4. **Alert Generation**: Create alerts for threshold violations
5. **Automated Responses**: Execute automated responses to critical issues
6. **Report Generation**: Generate detailed performance and quality reports
7. **Trend Analysis**: Update long-term performance trend data

### Performance Metrics Collection

```typescript
interface BuildMetrics {
  buildId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  success: boolean;
  errorCount: number;
  warningCount: number;
  memoryUsage: {
    peak: number;
    average: number;
    gcCount: number;
    gcTime: number;
  };
  bundleSize: {
    total: number;
    javascript: number;
    css: number;
    assets: number;
  };
  cacheHitRate: number;
  parallelization: {
    workers: number;
    efficiency: number;
  };
}
```

### Quality Metrics Tracking

```typescript
interface QualityMetrics {
  codeQuality: {
    typeScriptErrors: number;
    lintingWarnings: number;
    testCoverage: number;
    codeComplexity: number;
  };
  buildQuality: {
    successRate: number;
    averageBuildTime: number;
    failureRate: number;
    recoveryTime: number;
  };
  performanceQuality: {
    bundleSize: number;
    loadTime: number;
    memoryEfficiency: number;
    cacheEfficiency: number;
  };
  technicalDebt: {
    debtRatio: number;
    maintainabilityIndex: number;
    duplicateCodePercentage: number;
    outdatedDependencies: number;
  };
}
```

## Configuration Options

### Performance Thresholds

```yaml
performance_thresholds:
  build_time:
    development: 60 # seconds
    production: 300 # seconds
    critical: 600 # seconds
  memory_usage:
    warning: 2048 # MB
    critical: 4096 # MB
    emergency: 8192 # MB
  bundle_size:
    warning_increase: 10 # percentage
    critical_increase: 20 # percentage
    max_size: 10240 # KB
```

### Alert Settings

```yaml
alerts:
  build_performance:
    enabled: true
    threshold_violations: 3 # consecutive violations before alert
    cooldown_period: 300 # seconds between alerts
  memory_monitoring:
    enabled: true
    leak_detection: true
    gc_analysis: true
  quality_gates:
    enabled: true
    failure_threshold: 3 # consecutive failures
    success_rate_minimum: 90 # percentage
```

### Monitoring Settings

```yaml
monitoring:
  collection_interval: 30 # seconds
  retention_period: 30 # days
  trend_analysis_window: 7 # days
  performance_baseline_days: 14
```

### Automated Response Settings

```yaml
automated_responses:
  build_optimization:
    enabled: true
    cache_cleanup: true
    dependency_analysis: true
  memory_management:
    enabled: true
    gc_tuning_suggestions: true
    memory_leak_detection: true
  quality_improvement:
    enabled: false # Manual approval required
    campaign_trigger: false
```

## Monitoring Dashboards

### Real-Time Performance Dashboard

```typescript
interface PerformanceDashboard {
  currentBuild: {
    status: 'running' | 'completed' | 'failed';
    progress: number; // 0-100%
    elapsedTime: number;
    estimatedCompletion: number;
  };
  recentBuilds: BuildSummary[];
  performanceTrends: {
    buildTime: TrendData;
    memoryUsage: TrendData;
    successRate: TrendData;
    bundleSize: TrendData;
  };
  alerts: ActiveAlert[];
  recommendations: OptimizationRecommendation[];
}
```

### Quality Metrics Dashboard

```typescript
interface QualityDashboard {
  overallScore: number; // 0-100
  qualityTrends: {
    codeQuality: TrendData;
    buildStability: TrendData;
    performance: TrendData;
    technicalDebt: TrendData;
  };
  qualityGates: {
    name: string;
    status: 'passed' | 'failed' | 'warning';
    score: number;
    threshold: number;
  }[];
  improvementSuggestions: QualityImprovement[];
}
```

## Automated Response Actions

### Build Performance Optimization

```typescript
interface BuildOptimizationActions {
  cacheOptimization: {
    clearStaleCache: boolean;
    optimizeCacheStrategy: boolean;
    analyzeCacheHitRate: boolean;
  };
  dependencyAnalysis: {
    analyzeBundleSize: boolean;
    identifyUnusedDependencies: boolean;
    suggestTreeShaking: boolean;
  };
  parallelizationTuning: {
    optimizeWorkerCount: boolean;
    analyzeTaskDistribution: boolean;
    suggestParallelizationImprovements: boolean;
  };
}
```

### Memory Management Actions

```typescript
interface MemoryManagementActions {
  memoryLeakDetection: {
    analyzeHeapSnapshots: boolean;
    identifyMemoryLeaks: boolean;
    suggestMemoryOptimizations: boolean;
  };
  garbageCollectionTuning: {
    analyzeGCPerformance: boolean;
    suggestGCOptimizations: boolean;
    monitorGCPressure: boolean;
  };
  resourceOptimization: {
    optimizeAssetLoading: boolean;
    suggestLazyLoading: boolean;
    analyzeMemoryFootprint: boolean;
  };
}
```

## Integration Points

### Build System Integration

- **Webpack Integration**: Plugin for build performance monitoring
- **Next.js Integration**: Custom build analyzer and performance tracker
- **TypeScript Integration**: Compilation time and error tracking
- **ESLint Integration**: Linting performance and rule effectiveness monitoring

### CI/CD Integration

- **GitHub Actions**: Build performance reporting and quality gates
- **Build Pipeline**: Automated performance regression detection
- **Deployment Gates**: Quality threshold enforcement before deployment
- **Performance Budgets**: Automated bundle size and performance monitoring

### Development Workflow Integration

- **IDE Integration**: Real-time performance feedback during development
- **Hot Reload Monitoring**: Development server performance tracking
- **File Watcher Optimization**: File system monitoring efficiency analysis
- **Developer Productivity**: Build wait time impact on development velocity

## Troubleshooting

### Common Performance Issues

1. **Slow Build Times**: Bundle analysis, dependency optimization, cache tuning
2. **Memory Leaks**: Heap analysis, garbage collection monitoring, resource
   cleanup
3. **Bundle Size Growth**: Tree shaking analysis, dependency auditing, code
   splitting
4. **Cache Inefficiency**: Cache strategy optimization, invalidation pattern
   analysis

### Debug Commands

```bash
# Build performance analysis
npm run build:analyze

# Memory usage profiling
npm run build:profile-memory

# Bundle size analysis
npm run build:bundle-analyzer

# Performance regression detection
npm run build:performance-check
```

### Performance Optimization Recommendations

```typescript
interface OptimizationRecommendation {
  category: 'build' | 'memory' | 'bundle' | 'cache';
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  description: string;
  implementation: string[];
  expectedImprovement: string;
}
```

## Safety Protocols

### Performance Regression Detection

- **Baseline Comparison**: Compare current metrics against established baselines
- **Trend Analysis**: Detect gradual performance degradation over time
- **Anomaly Detection**: Identify sudden performance drops or spikes
- **Rollback Recommendations**: Suggest rollback when performance severely
  degrades

### Quality Gate Enforcement

- **Build Quality Gates**: Enforce minimum quality standards before deployment
- **Performance Budgets**: Prevent deployment of performance regressions
- **Error Rate Limits**: Block deployment when error rates exceed thresholds
- **Technical Debt Limits**: Monitor and limit technical debt accumulation

## References

### Performance Monitoring Files

- `src/services/PerformanceMonitoringService.ts`: Core performance monitoring
  service
- `src/hooks/usePerformanceMetrics.ts`: React hooks for performance data
- `src/components/debug/ConsolidatedDebugInfo.tsx`: Debug information display

### Build System Integration

- `next.config.js`: Next.js build configuration and optimization
- `webpack.config.js`: Webpack performance monitoring plugins
- `package.json`: Build scripts and performance monitoring commands

### Quality Metrics Integration

- `src/services/campaign/MetricsCollectionSystem.ts`: Metrics collection system
- `src/services/campaign/ProgressReportingSystem.ts`: Progress and quality
  reporting
- `.kiro/steering/campaign-integration.md`: Campaign system integration patterns
