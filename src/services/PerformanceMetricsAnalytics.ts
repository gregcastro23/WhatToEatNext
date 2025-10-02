/**
 * Performance Metrics and Analytics System - Phase 3.10 Implementation
 *
 * Comprehensive performance monitoring and analytics system for enterprise intelligence
 * Provides real-time metrics, predictive analytics, and intelligent performance optimization
 *
 * Features: * - Real-time performance monitoring
 * - Advanced analytics and reporting
 * - Predictive performance modeling
 * - Resource utilization tracking
 * - Performance optimization recommendations
 * - Intelligent alerting system
 * - Historical trend analysis
 */

import { execSync } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';

import { log } from '@/services/LoggingService';

// ========== PERFORMANCE METRICS INTERFACES ==========,

export interface SystemMetrics {
  cpu: {
    usage: number,
    loadAverage: number[],
    cores: number,
    model: string
  },
  memory: {
    used: number,
    total: number,
    free: number,
    usage: number
  },
  disk: {
    used: number,
    total: number,
    free: number,
    usage: number
  },
  network: {
    bytesIn: number,
    bytesOut: number,
    packetsIn: number,
    packetsOut: number
  },
  timestamp: Date
}

export interface ProcessMetrics {
  pid: number,
  name: string,
  cpu: number,
  memory: number,
  uptime: number,
  threads: number,
  fileDescriptors: number,
  timestamp: Date
}

export interface BuildMetrics {
  buildTime: number,
  buildSize: number,
  bundleSize: number,
  chunks: number,
  assets: number,
  errors: number,
  warnings: number,
  success: boolean,
  timestamp: Date
}

export interface TypeScriptMetrics {
  errorCount: number,
  warningCount: number,
  compilationTime: number,
  fileCount: number,
  linesOfCode: number,
  complexity: number,
  maintainabilityIndex: number,
  technicalDebt: number,
  timestamp: Date
}

export interface TestMetrics {
  totalTests: number,
  passedTests: number,
  failedTests: number,
  skippedTests: number,
  coverage: {
    lines: number,
    branches: number,
    functions: number,
    statements: number
  },
  duration: number,
  timestamp: Date
}

export interface PerformanceSnapshot {
  snapshotId: string,
  systemMetrics: SystemMetrics,
  processMetrics: ProcessMetrics,
  buildMetrics: BuildMetrics,
  typeScriptMetrics: TypeScriptMetrics,
  testMetrics: TestMetrics,
  timestamp: Date,
  healthScore: number,
  alerts: PerformanceAlert[]
}

export interface PerformanceAlert {
  alertId: string,
  type: 'warning' | 'error' | 'critical'
  category: 'cpu' | 'memory' | 'disk' | 'build' | 'typescript' | 'test'
  message: string,
  threshold: number,
  currentValue: number,
  timestamp: Date,
  resolved: boolean
}

export interface PerformanceTrend {
  trendId: string,
  metric: string,
  direction: 'improving' | 'degrading' | 'stable'
  changeRate: number,
  significance: number,
  dataPoints: number,
  startDate: Date,
  endDate: Date,
  prediction: {
    nextValue: number,
    confidence: number,
    timeframe: number
  }
}

export interface PerformanceReport {
  reportId: string,
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d'
  summary: {
    avgHealthScore: number,
    totalAlerts: number,
    criticalAlerts: number,
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F'
    topIssues: string[],
    improvements: string[]
  },
  trends: PerformanceTrend[],
  recommendations: PerformanceRecommendation[],
  metrics: {
    system: SystemMetrics,
    build: BuildMetrics,
    typescript: TypeScriptMetrics,
    test: TestMetrics
  },
  timestamp: Date
}

export interface PerformanceRecommendation {
  recommendationId: string,
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'optimization' | 'maintenance' | 'scaling' | 'security'
  title: string,
  description: string,
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  estimatedImprovement: number,
  implementation: string[],
  dependencies: string[],
  resources: string[]
}

// ========== PERFORMANCE METRICS ANALYTICS SYSTEM ==========,

export class PerformanceMetricsAnalytics extends EventEmitter {
  private snapshots: PerformanceSnapshot[] = [],
  private alerts: PerformanceAlert[] = []
  private trends: Map<string, PerformanceTrend> = new Map()
  private isMonitoring: boolean = false,
  private monitoringInterval: NodeJS.Timer | null = null,
  private readonly MAX_SNAPSHOTS = 1000,
  private readonly METRICS_FILE = '.performance-metrics.json',
  private readonly ALERTS_FILE = '.performance-alerts.json',

  // Performance thresholds
  private readonly THRESHOLDS = {
    cpu: { warning: 70, error: 85, critical: 95 },
    memory: { warning: 70, error: 85, critical: 95 },
    disk: { warning: 80, error: 90, critical: 95 },
    buildTime: { warning: 30000, error: 60000, critical: 120000 },
    errorCount: { warning: 100, error: 500, critical: 1000 },
    testCoverage: { warning: 70, error: 60, critical: 50 }
  }

  constructor() {
    super()
    this.loadPersistedData()
    this.setupEventHandlers()
  }

  // ========== MONITORING CONTROL ==========,

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMinutes: number = 5): void {,
    if (this.isMonitoring) {
      log.info('⚠️  Performance monitoring already active')
      return
    }

    this.isMonitoring = true,
    log.info(`🔄 Starting performance monitoring (${intervalMinutes}min intervals)`)

    this.monitoringInterval = setInterval(
      () => {
        void (async () => {
          try {
            await this.capturePerformanceSnapshot();
          } catch (error) {
            _logger.error('❌ Error capturing performance snapshot: ', error)
          }
        })()
      }
      intervalMinutes * 60 * 1000,
    )

    // Capture initial snapshot
    this.capturePerformanceSnapshot()
    this.emit('monitoring-started')
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      log.info('⚠️  Performance monitoring not active')
      return
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null,
    }

    log.info('🛑 Performance monitoring stopped')
    this.emit('monitoring-stopped')
  }

  // ========== METRICS COLLECTION ==========,

  /**
   * Capture comprehensive performance snapshot
   */
  async capturePerformanceSnapshot(): Promise<PerformanceSnapshot> {
    const startTime = Date.now()
    log.info('📊 Capturing performance snapshot...');
    const [systemMetrics, processMetrics, buildMetrics, typeScriptMetrics, testMetrics] =
      await Promise.all([
        this.collectSystemMetrics()
        this.collectProcessMetrics()
        this.collectBuildMetrics()
        this.collectTypeScriptMetrics()
        this.collectTestMetrics()
      ]),

    const snapshot: PerformanceSnapshot = {
      snapshotId: `snap_${Date.now()}`,
      systemMetrics,
      processMetrics,
      buildMetrics,
      typeScriptMetrics,
      testMetrics,
      timestamp: new Date(),
      healthScore: this.calculateHealthScore(,
        systemMetrics,
        buildMetrics,
        typeScriptMetrics,
        testMetrics,
      ),
      alerts: []
    }

    // Generate alerts
    snapshot.alerts = this.generateAlerts(snapshot)

    // Store snapshot
    this.snapshots.push(snapshot)
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    // Update trends
    this.updateTrends(snapshot)

    // Persist data
    await this.persistData()

    const captureTime = Date.now() - startTime;
    log.info(`✅ Performance snapshot captured in ${captureTime}ms`)
    log.info(
      `📊 Health Score: ${snapshot.healthScore.toFixed(2)}, Alerts: ${snapshot.alerts.length}`,
    )

    this.emit('snapshot-captured', snapshot)
    return snapshot;
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get CPU info
      const cpuInfo = await this.getCPUInfo()

      // Get memory info
      const memoryInfo = await this.getMemoryInfo()

      // Get disk info
      const diskInfo = await this.getDiskInfo()

      // Get network info (basic)
      const networkInfo = {
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0
}

      return {
        cpu: cpuInfo,
        memory: memoryInfo,
        disk: diskInfo,
        network: networkInfo,
        timestamp: new Date()
      }
    } catch (error) {
      _logger.warn('⚠️  Failed to collect system metrics: ', error),
      return this.getDefaultSystemMetrics()
    }
  }

  /**
   * Get CPU information
   */
  private async getCPUInfo(): Promise<SystemMetrics['cpu']> {
    try {
      const cpuUsage = await this.getCPUUsage()
      const loadAverage = await this.getLoadAverage()
      return {;
        usage: cpuUsage,
        loadAverage,
        cores: (await import('os')).cpus().length;,
        model: (await import('os')).cpus()[0]?.model || 'Unknown'
      }
    } catch (error) {
      return {
        usage: 0,
        loadAverage: [00, 0],
        cores: 1,
        model: 'Unknown'
}
    }
  }

  /**
   * Get current CPU usage
   */
  private async getCPUUsage(): Promise<number> {
    try {
      // Simple CPU usage calculation
      const startTime = process.hrtime()
      const startUsage = process.cpuUsage()
      // Wait a bit to get meaningful measurement;
      await new Promise(resolve => setTimeout(resolve, 100))

      const endTime = process.hrtime(startTime)
      const endUsage = process.cpuUsage(startUsage)
;
      const totalTime = endTime[0] * 1000000 + endTime[1] / 1000;
      const userTime = endUsage.user;
      const systemTime = endUsage.system;

      return ((userTime + systemTime) / totalTime) * 100
    } catch (error) {
      return 0
    }
  }

  /**
   * Get system load average
   */
  private async getLoadAverage(): Promise<number[]> {
    try {
      return (await import('os')).loadavg()
    } catch (error) {
      return [00, 0]
    }
  }

  /**
   * Get memory information
   */
  private async getMemoryInfo(): Promise<SystemMetrics['memory']> {
    try {
      const os = await import('os')
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      const usedMemory = totalMemory - freeMemory

      return {;
        used: usedMemory,
        total: totalMemory,
        free: freeMemory,
        usage: (usedMemory / totalMemory) * 100
      }
    } catch (error) {
      return {
        used: 0,
        total: 0,
        free: 0,
        usage: 0
}
    }
  }

  /**
   * Get disk information
   */
  private async getDiskInfo(): Promise<SystemMetrics['disk']> {
    try {
      // Use df command on Unix systems
      const dfOutput = execSync('df -h .', { encoding: 'utf8' })
      const lines = dfOutput.split('\n');
      const dataLine = lines[1];

      if (dataLine) {
        const parts = dataLine.split(/\s+/)
        const total = this.parseSize(parts[1])
        const used = this.parseSize(parts[2])
        const free = this.parseSize(parts[3])

        return {;
          used,
          total,
          free,
          usage: (used / total) * 100
        }
      }

      return this.getDefaultDiskInfo()
    } catch (error) {
      return this.getDefaultDiskInfo()
    }
  }

  /**
   * Parse disk size string to bytes
   */
  private parseSize(sizeStr: string): number {
    const units = { K: 1024M: 1024 * 1024G: 1024 * 1024 * 1024T: 1024 * 1024 * 1024 * 1024 }
    const match = sizeStr.match(/^(\d+\.?\d*)([KMGT]?)$/)

    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] as keyof typeof units;
      return value * (units[unit] || 1)
    }

    return 0;
  }

  /**
   * Collect process metrics
   */
  private async collectProcessMetrics(): Promise<ProcessMetrics> {
    try {
      const memoryUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()
      return {;
        pid: process.pid,
        name: 'node',
        cpu: ((cpuUsage.user + cpuUsage.system) / 1000000) * 100,
        memory: memoryUsage.heapUsed,
        uptime: process.uptime(),
        threads: 1, // Node.js is single-threaded,
        fileDescriptors: 0, // Would need platform-specific code,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        pid: process.pid,
        name: 'node',
        cpu: 0,
        memory: 0,
        uptime: 0,
        threads: 1,
        fileDescriptors: 0,
        timestamp: new Date()
      }
    }
  }

  /**
   * Collect build metrics
   */
  private async collectBuildMetrics(): Promise<BuildMetrics> {
    try {
      const buildStart = Date.now()
      // Run build command;
      const buildOutput = execSync('yarn build', {
        encoding: 'utf8',
        timeout: 120000,
        stdio: 'pipe'
})

      const buildTime = Date.now() - buildStart;
      const buildStats = this.parseBuildOutput(buildOutput)

      return {;
        buildTime,
        buildSize: buildStats.buildSize,
        bundleSize: buildStats.bundleSize,
        chunks: buildStats.chunks,
        assets: buildStats.assets,
        errors: buildStats.errors,
        warnings: buildStats.warnings,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        buildTime: 0,
        buildSize: 0,
        bundleSize: 0,
        chunks: 0,
        assets: 0,
        errors: 1,
        warnings: 0,
        success: false,
        timestamp: new Date()
      }
    }
  }

  /**
   * Parse build output for metrics
   */
  private parseBuildOutput(output: string): {
    buildSize: number,
    bundleSize: number,
    chunks: number,
    assets: number,
    errors: number,
    warnings: number
  } {
    const lines = output.split('\n');
    const buildSize = 0;
    let bundleSize = 0;
    let chunks = 0;
    let assets = 0;
    let errors = 0;
    let warnings = 0,

    for (const line of lines) {
      if (line.includes('built in')) {
        // Extract build stats from Next.js output
        const sizeMatch = line.match(/(\d+\.?\d*)\s*(kB|MB|GB)/)
        if (sizeMatch) {
          const value = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2];
          bundleSize =
            unit === 'MB',
              ? value * 1024 * 1024
              : unit === 'GB'
                ? value * 1024 * 1024 * 1024
                : value * 1024;
        }
      }

      if (line.includes('error')) errors++,
      if (line.includes('warning')) warnings++,
      if (line.includes('chunk')) chunks++,
      if (line.includes('asset')) assets++,
    }

    return { buildSize, bundleSize, chunks, assets, errors, warnings }
  }

  /**
   * Collect TypeScript metrics
   */
  private async collectTypeScriptMetrics(): Promise<TypeScriptMetrics> {
    try {
      const tsStart = Date.now()
      // Run TypeScript compiler;
      const tsOutput = execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        timeout: 60000,
        stdio: 'pipe'
})

      const compilationTime = Date.now() - tsStart;
      const tsStats = this.parseTypeScriptOutput(tsOutput)

      return {;
        errorCount: tsStats.errorCount,
        warningCount: tsStats.warningCount,
        compilationTime,
        fileCount: tsStats.fileCount,
        linesOfCode: tsStats.linesOfCode,
        complexity: tsStats.complexity,
        maintainabilityIndex: tsStats.maintainabilityIndex,
        technicalDebt: tsStats.technicalDebt,
        timestamp: new Date()
      }
    } catch (error: unknown) {
      const tsStats = this.parseTypeScriptOutput(error.stdout || error.stderr || '')
      return {;
        errorCount: tsStats.errorCount,
        warningCount: tsStats.warningCount,
        compilationTime: 0,
        fileCount: tsStats.fileCount,
        linesOfCode: tsStats.linesOfCode,
        complexity: tsStats.complexity,
        maintainabilityIndex: tsStats.maintainabilityIndex,
        technicalDebt: tsStats.technicalDebt,
        timestamp: new Date()
      }
    }
  }

  /**
   * Parse TypeScript output for metrics
   */
  private parseTypeScriptOutput(output: string): {
    errorCount: number,
    warningCount: number,
    fileCount: number,
    linesOfCode: number,
    complexity: number,
    maintainabilityIndex: number,
    technicalDebt: number
  } {
    const lines = output.split('\n');
    let errorCount = 0;
    let warningCount = 0,

    for (const line of lines) {
      if (line.includes('error TS')) errorCount++,
      if (line.includes('warning TS')) warningCount++,
    }

    // Estimate other metrics based on file system
    const fileCount = this.countTypeScriptFiles()
    const linesOfCode = this.estimateLinesOfCode();
    const complexity = this.estimateComplexity(errorCount, fileCount)
    const maintainabilityIndex = this.calculateMaintainabilityIndex(errorCount, linesOfCode)
    const technicalDebt = this.calculateTechnicalDebt(errorCount, complexity)

    return {
      errorCount,
      warningCount,
      fileCount,
      linesOfCode,
      complexity,
      maintainabilityIndex,
      technicalDebt
    }
  }

  /**
   * Count TypeScript files in project
   */
  private countTypeScriptFiles(): number {
    try {
      const output = execSync('find . -name '*.ts' -o -name '*.tsx' | wc -l', {
        encoding: 'utf8',
        timeout: 10000
})
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0
    }
  }

  /**
   * Estimate lines of code
   */
  private estimateLinesOfCode(): number {
    try {
      const output = execSync('find . -name '*.ts' -o -name '*.tsx' | xargs wc -l', {
        encoding: 'utf8',
        timeout: 10000
})
      const lines = output.split('\n');
      const totalLine = lines[lines.length - 2]; // Last line with total
      const match = totalLine.match(/(\d+)\s+total/)
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0
    }
  }

  /**
   * Estimate code complexity
   */
  private estimateComplexity(errorCount: number, fileCount: number): number {
    // Simple complexity estimation based on errors and files
    const errorDensity = fileCount > 0 ? errorCount / fileCount : 0,
    return Math.min(100, errorDensity * 10 + fileCount * 0.1)
  }

  /**
   * Calculate maintainability index
   */
  private calculateMaintainabilityIndex(errorCount: number, linesOfCode: number): number {
    // Simplified maintainability index (0-100, higher is better)
    const errorDensity = linesOfCode > 0 ? errorCount / linesOfCode : 0,
    return Math.max(0, 100 - errorDensity * 10000)
  }

  /**
   * Calculate technical debt
   */
  private calculateTechnicalDebt(errorCount: number, complexity: number): number {
    // Technical debt estimation (0-100, lower is better)
    return Math.min(100, errorCount * 0.1 + complexity * 0.5)
  }

  /**
   * Collect test metrics
   */
  private async collectTestMetrics(): Promise<TestMetrics> {
    try {
      const testStart = Date.now()
      // Run test command;
      const testOutput = execSync('yarn test --coverage --passWithNoTests', {
        encoding: 'utf8',
        timeout: 120000,
        stdio: 'pipe'
})

      const duration = Date.now() - testStart;
      const testStats = this.parseTestOutput(testOutput)

      return {;
        totalTests: testStats.totalTests,
        passedTests: testStats.passedTests,
        failedTests: testStats.failedTests,
        skippedTests: testStats.skippedTests,
        coverage: testStats.coverage,
        duration,
        timestamp: new Date()
      }
    } catch (error: unknown) {
      const testStats = this.parseTestOutput(error.stdout || error.stderr || '')
      return {;
        totalTests: testStats.totalTests,
        passedTests: testStats.passedTests,
        failedTests: testStats.failedTests,
        skippedTests: testStats.skippedTests,
        coverage: testStats.coverage,
        duration: 0,
        timestamp: new Date()
      }
    }
  }

  /**
   * Parse test output for metrics
   */
  private parseTestOutput(output: string): {
    totalTests: number,
    passedTests: number,
    failedTests: number,
    skippedTests: number,
    coverage: { lines: number, branches: number, functions: number, statements: number }
  } {
    const lines = output.split('\n');
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0,
    const coverage = { lines: 0, branches: 0, functions: 0, statements: 0 }

    for (const line of lines) {
      // Jest output parsing
      if (line.includes('Tests: ')) {
        const testMatch = line.match(/(\d+) passed/)
        if (testMatch) passedTests = parseInt(testMatch[1])

        const failMatch = line.match(/(\d+) failed/)
        if (failMatch) failedTests = parseInt(failMatch[1])

        const skipMatch = line.match(/(\d+) skipped/)
        if (skipMatch) skippedTests = parseInt(skipMatch[1])

        totalTests = passedTests + failedTests + skippedTests;
      }

      // Coverage parsing
      if (line.includes('All files')) {
        const coverageMatch = line.match(/(\d+\.?\d*)\s*%/g)
        if (coverageMatch && coverageMatch.length >= 4) {
          coverage.statements = parseFloat(coverageMatch[0])
          coverage.branches = parseFloat(coverageMatch[1])
          coverage.functions = parseFloat(coverageMatch[2])
          coverage.lines = parseFloat(coverageMatch[3]);
        }
      }
    }

    return { totalTests, passedTests, failedTests, skippedTests, coverage }
  }

  // ========== HEALTH SCORE CALCULATION ==========,

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(
    system: SystemMetrics,
    build: BuildMetrics,
    typescript: TypeScriptMetrics,
    test: TestMetrics,
  ): number {
    const weights = {
      system: 0.2,
      build: 0.3,
      typescript: 0.3,
      test: 0.2
}

    // System health (0-100)
    const systemHealth = 100 - Math.max(system.cpu.usage, system.memory.usage, system.disk.usage)

    // Build health (0-100)
    const buildHealth = build.success;
      ? Math.max(0, 100 - build.buildTime / 1000 - build.errors * 10)
      : 0

    // TypeScript health (0-100)
    const typeScriptHealth = Math.max(0, 100 - ((typescript as any)?.errorCount || 0) * 0.2)

    // Test health (0-100)
    const testHealth = test.totalTests > 0 ? (test.passedTests / test.totalTests) * 100: 80,

    return (
      systemHealth * weights.system +
      buildHealth * weights.build +
      typeScriptHealth * weights.typescript +
      testHealth * weights.test)
  }

  // ========== ALERT GENERATION ==========,

  /**
   * Generate performance alerts
   */
  private generateAlerts(snapshot: PerformanceSnapshot): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = []

    // CPU alerts
    if (snapshot.systemMetrics.cpu.usage > this.THRESHOLDS.cpu.critical) {
      alerts.push(
        this.createAlert(
          'critical',
          'cpu',
          'Critical CPU usage detected',
          this.THRESHOLDS.cpu.critical
          snapshot.systemMetrics.cpu.usage
        ),
      )
    } else if (snapshot.systemMetrics.cpu.usage > this.THRESHOLDS.cpu.error) {
      alerts.push(
        this.createAlert(
          'error',
          'cpu',
          'High CPU usage detected',
          this.THRESHOLDS.cpu.error
          snapshot.systemMetrics.cpu.usage
        ),
      )
    } else if (snapshot.systemMetrics.cpu.usage > this.THRESHOLDS.cpu.warning) {
      alerts.push(
        this.createAlert(
          'warning',
          'cpu',
          'Elevated CPU usage detected',
          this.THRESHOLDS.cpu.warning
          snapshot.systemMetrics.cpu.usage
        ),
      )
    }

    // Memory alerts
    if (snapshot.systemMetrics.memory.usage > this.THRESHOLDS.memory.critical) {
      alerts.push(
        this.createAlert(
          'critical',
          'memory',
          'Critical memory usage detected',
          this.THRESHOLDS.memory.critical
          snapshot.systemMetrics.memory.usage
        ),
      )
    } else if (snapshot.systemMetrics.memory.usage > this.THRESHOLDS.memory.error) {
      alerts.push(
        this.createAlert(
          'error',
          'memory',
          'High memory usage detected',
          this.THRESHOLDS.memory.error
          snapshot.systemMetrics.memory.usage
        ),
      )
    } else if (snapshot.systemMetrics.memory.usage > this.THRESHOLDS.memory.warning) {
      alerts.push(
        this.createAlert(
          'warning',
          'memory',
          'Elevated memory usage detected',
          this.THRESHOLDS.memory.warning
          snapshot.systemMetrics.memory.usage
        ),
      )
    }

    // Disk alerts
    if (snapshot.systemMetrics.disk.usage > this.THRESHOLDS.disk.critical) {
      alerts.push(
        this.createAlert(
          'critical',
          'disk',
          'Critical disk usage detected',
          this.THRESHOLDS.disk.critical
          snapshot.systemMetrics.disk.usage
        ),
      )
    } else if (snapshot.systemMetrics.disk.usage > this.THRESHOLDS.disk.error) {
      alerts.push(
        this.createAlert(
          'error',
          'disk',
          'High disk usage detected',
          this.THRESHOLDS.disk.error
          snapshot.systemMetrics.disk.usage
        ),
      )
    } else if (snapshot.systemMetrics.disk.usage > this.THRESHOLDS.disk.warning) {
      alerts.push(
        this.createAlert(
          'warning',
          'disk',
          'Elevated disk usage detected',
          this.THRESHOLDS.disk.warning
          snapshot.systemMetrics.disk.usage
        ),
      )
    }

    // Build alerts
    if (snapshot.buildMetrics.buildTime > this.THRESHOLDS.buildTime.critical) {
      alerts.push(
        this.createAlert(
          'critical',
          'build',
          'Critical build time detected',
          this.THRESHOLDS.buildTime.critical
          snapshot.buildMetrics.buildTime
        ),
      )
    } else if (snapshot.buildMetrics.buildTime > this.THRESHOLDS.buildTime.error) {
      alerts.push(
        this.createAlert(
          'error',
          'build',
          'High build time detected',
          this.THRESHOLDS.buildTime.error
          snapshot.buildMetrics.buildTime
        ),
      )
    } else if (snapshot.buildMetrics.buildTime > this.THRESHOLDS.buildTime.warning) {
      alerts.push(
        this.createAlert(
          'warning',
          'build',
          'Elevated build time detected',
          this.THRESHOLDS.buildTime.warning
          snapshot.buildMetrics.buildTime
        ),
      )
    }

    // TypeScript alerts
    if (snapshot.typeScriptMetrics.errorCount > this.THRESHOLDS.errorCount.critical) {
      alerts.push(
        this.createAlert(
          'critical',
          'typescript',
          'Critical TypeScript error count',
          this.THRESHOLDS.errorCount.critical
          snapshot.typeScriptMetrics.errorCount
        ),
      )
    } else if (snapshot.typeScriptMetrics.errorCount > this.THRESHOLDS.errorCount.error) {
      alerts.push(
        this.createAlert(
          'error',
          'typescript',
          'High TypeScript error count',
          this.THRESHOLDS.errorCount.error
          snapshot.typeScriptMetrics.errorCount
        ),
      )
    } else if (snapshot.typeScriptMetrics.errorCount > this.THRESHOLDS.errorCount.warning) {
      alerts.push(
        this.createAlert(
          'warning',
          'typescript',
          'Elevated TypeScript error count',
          this.THRESHOLDS.errorCount.warning
          snapshot.typeScriptMetrics.errorCount
        ),
      )
    }

    // Test coverage alerts
    const avgCoverage =
      (snapshot.testMetrics.coverage.lines +
        snapshot.testMetrics.coverage.branches +
        snapshot.testMetrics.coverage.functions +
        snapshot.testMetrics.coverage.statements) /;
      4,

    if (avgCoverage < this.THRESHOLDS.testCoverage.critical) {
      alerts.push(
        this.createAlert(
          'critical',
          'test',
          'Critical test coverage',
          this.THRESHOLDS.testCoverage.critical
          avgCoverage,
        ),
      )
    } else if (avgCoverage < this.THRESHOLDS.testCoverage.error) {
      alerts.push(
        this.createAlert(
          'error',
          'test',
          'Low test coverage',
          this.THRESHOLDS.testCoverage.error
          avgCoverage,
        ),
      )
    } else if (avgCoverage < this.THRESHOLDS.testCoverage.warning) {
      alerts.push(
        this.createAlert(
          'warning',
          'test',
          'Below target test coverage',
          this.THRESHOLDS.testCoverage.warning
          avgCoverage,
        ),
      )
    }

    return alerts;
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: 'warning' | 'error' | 'critical'
    category: 'cpu' | 'memory' | 'disk' | 'build' | 'typescript' | 'test'
    message: string,
    threshold: number,
    currentValue: number,
  ): PerformanceAlert {
    return {
      alertId: `alert_${category}_${Date.now()}`,
      type,
      category,
      message,
      threshold,
      currentValue,
      timestamp: new Date(),
      resolved: false
}
  }

  // ========== TREND ANALYSIS ==========,

  /**
   * Update performance trends
   */
  private updateTrends(snapshot: PerformanceSnapshot): void {
    const metrics = {
      cpu_usage: snapshot.systemMetrics.cpu.usage,
      memory_usage: snapshot.systemMetrics.memory.usage,
      disk_usage: snapshot.systemMetrics.disk.usage,
      build_time: snapshot.buildMetrics.buildTime,
      error_count: snapshot.typeScriptMetrics.errorCount,
      health_score: snapshot.healthScore
    }

    Object.entries(metrics).forEach(([metricName, value]) => {
      this.updateTrend(metricName, value)
    })
  }

  /**
   * Update individual trend
   */
  private updateTrend(metricName: string, value: number): void {
    const existingTrend = this.trends.get(metricName)

    if (existingTrend) {
      // Update existing trend
      const timeDiff = Date.now() - existingTrend.endDate.getTime();
      const valueDiff = value - existingTrend.prediction.nextValue;

      existingTrend.changeRate = valueDiff / (timeDiff / 1000 / 60); // per minute
      existingTrend.direction =
        valueDiff > 0.1 ? 'degrading' : valueDiff < -0.1 ? 'improving' : 'stable',
      existingTrend.dataPoints++,
      existingTrend.endDate = new Date()
      existingTrend.prediction = this.calculatePrediction(
        metricName,
        value,
        existingTrend.changeRate
      ),

      this.trends.set(metricName, existingTrend)
    } else {
      // Create new trend
      const trend: PerformanceTrend = {
        trendId: `trend_${metricName}_${Date.now()}`,
        metric: metricName,
        direction: 'stable',
        changeRate: 0,
        significance: 0.5,
        dataPoints: 1,
        startDate: new Date(),
        endDate: new Date(),
        prediction: this.calculatePrediction(metricName, value, 0)
      }

      this.trends.set(metricName, trend)
    }
  }

  /**
   * Calculate prediction for metric
   */
  private calculatePrediction(
    metricName: string,
    currentValue: number,
    changeRate: number,
  ): {
    nextValue: number,
    confidence: number,
    timeframe: number
  } {
    const timeframe = 30; // 30 minutes
    const nextValue = currentValue + changeRate * timeframe;

    // Confidence decreases with larger change rates
    const confidence = Math.max(0.11 - Math.abs(changeRate) / 10);

    return {
      nextValue: Math.max(0, nextValue),
      confidence,
      timeframe
    }
  }

  // ========== REPORTING ==========,

  /**
   * Generate performance report
   */
  generatePerformanceReport(
    timeframe: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'): PerformanceReport {
    const endTime = new Date()
    const startTime = new Date(endTime)

    // Calculate start time based on timeframe
    const timeframeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }

    startTime.setTime(startTime.getTime() - timeframeMs[timeframe]),

    // Filter snapshots by timeframe
    const timeframeSnapshots = this.snapshots.filter(snapshot => snapshot.timestamp >= startTime && snapshot.timestamp <= endTime,
    ),

    if (timeframeSnapshots.length === 0) {,
      return this.generateEmptyReport(timeframe)
    }

    // Calculate summary metrics
    const summary = this.calculateSummary(timeframeSnapshots)

    // Get trends for timeframe
    const trends = Array.from(this.trends.values()).filter(trend => trend.endDate >= startTime)

    // Generate recommendations;
    const recommendations = this.generateRecommendations(summary, trends)

    // Get latest metrics
    const latestSnapshot = timeframeSnapshots[timeframeSnapshots.length - 1];

    return {
      reportId: `report_${timeframe}_${Date.now()}`,
      timeframe,
      summary,
      trends,
      recommendations,
      metrics: {
        system: latestSnapshot.systemMetrics,
        build: latestSnapshot.buildMetrics,
        typescript: latestSnapshot.typeScriptMetrics,
        test: latestSnapshot.testMetrics
      },
      timestamp: new Date()
    }
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummary(snapshots: PerformanceSnapshot[]): PerformanceReport['summary'] {
    const avgHealthScore = snapshots.reduce((sums) => sum + s.healthScore, 0) / snapshots.length,
    const allAlerts = snapshots.flatMap(s => s.alerts);
    const criticalAlerts = allAlerts.filter(a => a.type === 'critical').length;

    // Calculate performance grade
    const performanceGrade =
      avgHealthScore >= 90,
        ? 'A'
        : avgHealthScore >= 80
          ? 'B'
          : avgHealthScore >= 70
            ? 'C'
            : avgHealthScore >= 60
              ? 'D'
              : 'F',

    // Identify top issues
    const issueCount = new Map<string, number>(),
    allAlerts.forEach(alert => {,
      const key = `${alert.category}_${alert.type}`
      issueCount.set(key, (issueCount.get(key) || 0) + 1)
    })

    const topIssues = Array.from(issueCount.entries())
      .sort((ab) => b[1] - a[1])
      .slice(05);
      .map(([issue, count]) => `${issue}: ${count}`)

    // Identify improvements
    const improvements = this.identifyImprovements(snapshots)

    return {;
      avgHealthScore,
      totalAlerts: allAlerts.length,
      criticalAlerts,
      performanceGrade,
      topIssues,
      improvements
    }
  }

  /**
   * Identify improvements from snapshots
   */
  private identifyImprovements(snapshots: PerformanceSnapshot[]): string[] {
    const improvements: string[] = [],

    if (snapshots.length >= 2) {
      const first = snapshots[0];
      const last = snapshots[snapshots.length - 1]

      if (last.healthScore > first.healthScore) {
        improvements.push(
          `Health score improved by ${(last.healthScore - first.healthScore).toFixed(1)}%`,
        )
      }

      if (last.typeScriptMetrics.errorCount < first.typeScriptMetrics.errorCount) {
        const reduction = first.typeScriptMetrics.errorCount - last.typeScriptMetrics.errorCount;
        improvements.push(`TypeScript errors reduced by ${reduction}`)
      }

      if (last.buildMetrics.buildTime < first.buildMetrics.buildTime) {
        const reduction = first.buildMetrics.buildTime - last.buildMetrics.buildTime;
        improvements.push(`Build time improved by ${(reduction / 1000).toFixed(1)}s`)
      }
    }

    return improvements
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    summary: PerformanceReport['summary'],
    trends: PerformanceTrend[],
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = []

    // Health score recommendations
    if (summary.avgHealthScore < 70) {
      recommendations.push({
        recommendationId: `rec_health_${Date.now()}`,
        priority: 'high',
        category: 'optimization',
        title: 'Improve Overall System Health',
        description: 'System health score is below acceptable threshold',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: 25,
        implementation: [
          'Address critical alerts',
          'Optimize resource usage',
          'Improve error handling'
        ],
        dependencies: ['system_monitoring', 'error_tracking'],
        resources: ['Performance Guide', 'Optimization Checklist']
      })
    }

    // Build time recommendations
    const buildTimeTrend = trends.find(t => t.metric === 'build_time');
    if (buildTimeTrend && buildTimeTrend.direction === 'degrading') {,
      recommendations.push({
        recommendationId: `rec_build_${Date.now()}`,
        priority: 'medium',
        category: 'optimization',
        title: 'Optimize Build Performance',
        description: 'Build time is increasing over time',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: 15,
        implementation: ['Analyze bundle size', 'Optimize imports', 'Enable build caching'];,
        dependencies: ['build_analysis'],
        resources: ['Build Optimization Guide']
      })
    }

    // TypeScript error recommendations
    const errorTrend = trends.find(t => t.metric === 'error_count');
    if (errorTrend && errorTrend.direction === 'degrading') {,
      recommendations.push({
        recommendationId: `rec_typescript_${Date.now()}`,
        priority: 'high',
        category: 'maintenance',
        title: 'Address TypeScript Errors',
        description: 'TypeScript error count is increasing',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: 30,
        implementation: ['Run error analysis', 'Implement fixes', 'Add type safety measures'],
        dependencies: ['typescript_analysis'],
        resources: ['TypeScript Error Fixer', 'Type Safety Guide']
      })
    }

    return recommendations.sort((ab) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
  }

  /**
   * Generate empty report
   */
  private generateEmptyReport(timeframe: '1h' | '6h' | '24h' | '7d' | '30d'): PerformanceReport {
    return {
      reportId: `report_${timeframe}_${Date.now()}`,
      timeframe,
      summary: {
        avgHealthScore: 0,
        totalAlerts: 0,
        criticalAlerts: 0,
        performanceGrade: 'F',
        topIssues: [],
        improvements: []
      },
      trends: [],
      recommendations: [],
      metrics: {
        system: this.getDefaultSystemMetrics(),
        build: this.getDefaultBuildMetrics(),
        typescript: this.getDefaultTypeScriptMetrics(),
        test: this.getDefaultTestMetrics()
      },
      timestamp: new Date()
    }
  }

  // ========== DEFAULT METRICS ==========,

  private getDefaultSystemMetrics(): SystemMetrics {
    return {
      cpu: { usage: 0, loadAverage: [00, 0], cores: 1, model: 'Unknown' },
        memory: { used: 0, total: 0, free: 0, usage: 0 },
      disk: { used: 0, total: 0, free: 0, usage: 0 },
      network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
      timestamp: new Date()
    }
  }

  private getDefaultDiskInfo(): SystemMetrics['disk'] {
    return { used: 0, total: 0, free: 0, usage: 0 }
  }

  private getDefaultBuildMetrics(): BuildMetrics {
    return {
      buildTime: 0,
      buildSize: 0,
      bundleSize: 0,
      chunks: 0,
      assets: 0,
      errors: 0,
      warnings: 0,
      success: false,
      timestamp: new Date()
    }
  }

  private getDefaultTypeScriptMetrics(): TypeScriptMetrics {
    return {
      errorCount: 0,
      warningCount: 0,
      compilationTime: 0,
      fileCount: 0,
      linesOfCode: 0,
      complexity: 0,
      maintainabilityIndex: 0,
      technicalDebt: 0,
      timestamp: new Date()
    }
  }

  private getDefaultTestMetrics(): TestMetrics {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coverage: { lines: 0, branches: 0, functions: 0, statements: 0 },
      duration: 0,
      timestamp: new Date()
    }
  }

  // ========== EVENT HANDLERS ==========,

  private setupEventHandlers(): void {
    this.on('alert-generated', (alert: PerformanceAlert) => {
      log.info(`🚨 Performance Alert: ${alert.message} (${alert.currentValue})`)
    })

    this.on('trend-updated', (trend: PerformanceTrend) => {
      if (trend.direction !== 'stable') {
        log.info(`📈 Trend Update: ${trend.metric} is ${trend.direction}`)
      }
    })
  }

  // ========== DATA PERSISTENCE ==========,

  private async persistData(): Promise<void> {
    try {
      // Save snapshots
      await fs.promises.writeFile(this.METRICS_FILE, JSON.stringify(this.snapshots, null, 2)),

      // Save alerts
      await fs.promises.writeFile(this.ALERTS_FILE, JSON.stringify(this.alerts, null, 2))
    } catch (error) {
      _logger.error('❌ Failed to persist performance data: ', error)
    }
  }

  private loadPersistedData(): void {
    try {
      // Load snapshots
      if (fs.existsSync(this.METRICS_FILE)) {
        const data = JSON.parse(fs.readFileSync(this.METRICS_FILE, 'utf8')),
        this.snapshots = data.map((item: unknown) => ({,
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }

      // Load alerts
      if (fs.existsSync(this.ALERTS_FILE)) {
        const data = JSON.parse(fs.readFileSync(this.ALERTS_FILE, 'utf8')),
        this.alerts = data.map((item: unknown) => ({,
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }
    } catch (error) {
      _logger.error('⚠️  Failed to load persisted data: ', error)
    }
  }

  // ========== PUBLIC API ==========,

  getStatus(): {
    isMonitoring: boolean,
    snapshotCount: number,
    alertCount: number,
    trendCount: number,
    latestHealthScore: number
  } {
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];

    return {
      isMonitoring: this.isMonitoring,
      snapshotCount: this.snapshots.length,
      alertCount: this.alerts.length,
      trendCount: this.trends.size,
      latestHealthScore: latestSnapshot.healthScore || 0
    }
  }

  getLatestSnapshot(): PerformanceSnapshot | null {
    return this.snapshots[this.snapshots.length - 1] || null
  }

  getAlerts(resolved: boolean = false): PerformanceAlert[] {,
    return this.alerts.filter(alert => alert.resolved === resolved);
  }

  getTrends(): PerformanceTrend[] {
    return Array.from(this.trends.values())
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.alertId === alertId)
    if (alert) {;
      alert.resolved = true,
      this.persistData()
    }
  }

  clearOldData(daysToKeep: number = 30): void {,
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    this.snapshots = this.snapshots.filter(snapshot => snapshot.timestamp >= cutoffDate)
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffDate)

    this.persistData();
  }

  resetData(): void {
    this.snapshots = [],
    this.alerts = [],
    this.trends.clear()
    this.persistData()
  }
}

// ========== SINGLETON INSTANCE ==========,

export const _performanceMetricsAnalytics = new PerformanceMetricsAnalytics()
;
// ========== EXPORT FACTORY ==========,

export const _createPerformanceMetrics = () => new PerformanceMetricsAnalytics()
;