#!/usr/bin/env node

/**
 * Real-Time Progress Monitoring System
 *
 * This script implements batch-by-batch progress tracking with percentage calculations,
 * comprehensive achievement metrics, ROI analysis, and detailed error logging and
 * recovery action tracking for the unused variable elimination campaign.
 *
 * Features:
 * - Real-time batch-by-batch progress tracking
 * - Percentage calculations and velocity analysis
 * - Comprehensive achievement metrics and ROI analysis
 * - Detailed error logging and recovery action tracking
 * - Live dashboard updates and notifications
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class RealTimeProgressMonitor extends EventEmitter {
  constructor() {
    super();

    this.campaignId = `unused-var-campaign-${Date.now()}`;
    this.startTime = new Date();
    this.currentBatch = 0;
    this.totalBatches = 0;

    this.progressData = {
      campaignId: this.campaignId,
      startTime: this.startTime.toISOString(),
      status: 'initializing',
      currentPhase: 'preparation',
      progress: {
        overall: 0,
        currentBatch: 0,
        totalBatches: 0,
        batchProgress: 0
      },
      metrics: {
        baseline: {},
        current: {},
        targets: {},
        achievements: {}
      },
      tracking: {
        eliminated: 0,
        preserved: 0,
        transformed: 0,
        processed: 0,
        remaining: 0,
        errors: 0,
        recoveries: 0
      },
      velocity: {
        variablesPerMinute: 0,
        batchesPerHour: 0,
        estimatedCompletion: null,
        averageBatchTime: 0
      },
      roi: {
        timeInvested: 0,
        errorsReduced: 0,
        warningsReduced: 0,
        buildTimeImprovement: 0,
        codeQualityScore: 0
      },
      batches: [],
      errors: [],
      recoveryActions: [],
      notifications: []
    };

    this.progressFile = path.join(process.cwd(), '.kiro/specs/unused-variable-elimination/progress-tracking.json');
    this.metricsFile = path.join(process.cwd(), '.kiro/specs/unused-variable-elimination/real-time-metrics.json');
    this.errorLogFile = path.join(process.cwd(), '.kiro/specs/unused-variable-elimination/error-log.json');

    this.monitoringInterval = null;
    this.isMonitoring = false;
  }

  /**
   * Initialize monitoring with baseline data
   */
  async initialize(baselineData) {
    console.log('🚀 Initializing Real-Time Progress Monitor...');

    this.progressData.metrics.baseline = baselineData.baseline;
    this.progressData.metrics.targets = baselineData.targets;
    this.progressData.tracking.remaining = baselineData.baseline.unusedVariables.total;
    this.progressData.tracking.preserved = baselineData.baseline.unusedVariables.preserved;

    // Initialize batch plan
    if (baselineData.batchProcessingPlan) {
      this.totalBatches = baselineData.batchProcessingPlan.totalBatches || 0;
      this.progressData.progress.totalBatches = this.totalBatches;
    }

    this.progressData.status = 'initialized';
    this.progressData.currentPhase = 'ready';

    await this.saveProgress();

    console.log(`✅ Monitor initialized for campaign: ${this.campaignId}`);
    console.log(`   Total batches planned: ${this.totalBatches}`);
    console.log(`   Variables to process: ${this.progressData.tracking.remaining}`);

    this.emit('initialized', this.progressData);
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(intervalMs = 30000) { // Default 30 seconds
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already active');
      return;
    }

    console.log(`📊 Starting real-time monitoring (interval: ${intervalMs}ms)`);

    this.isMonitoring = true;
    this.progressData.status = 'monitoring';

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.updateMetrics();
        await this.calculateVelocity();
        await this.updateROI();
        await this.saveProgress();

        this.emit('metricsUpdated', this.progressData);
      } catch (error) {
        console.error('Error during monitoring update:', error.message);
        this.logError('monitoring-update', error);
      }
    }, intervalMs);

    this.emit('monitoringStarted', { campaignId: this.campaignId, interval: intervalMs });
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️  Monitoring not active');
      return;
    }

    console.log('⏹️  Stopping real-time monitoring');

    this.isMonitoring = false;
    this.progressData.status = 'stopped';

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit('monitoringStopped', { campaignId: this.campaignId });
  }

  /**
   * Start a new batch
   */
  async startBatch(batchInfo) {
    this.currentBatch++;

    const batch = {
      batchId: `batch-${this.currentBatch}`,
      batchNumber: this.currentBatch,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'in-progress',
      info: batchInfo,
      metrics: {
        variablesProcessed: 0,
        variablesEliminated: 0,
        variablesPreserved: 0,
        variablesTransformed: 0,
        filesProcessed: 0,
        errors: 0,
        warnings: 0
      },
      performance: {
        processingTime: 0,
        averageTimePerVariable: 0,
        throughput: 0
      },
      safety: {
        validationsPassed: 0,
        validationsFailed: 0,
        rollbacksTriggered: 0,
        safetyEventsLogged: 0
      }
    };

    this.progressData.batches.push(batch);
    this.progressData.progress.currentBatch = this.currentBatch;
    this.progressData.progress.batchProgress = 0;
    this.progressData.currentPhase = `batch-${this.currentBatch}`;

    console.log(`🔄 Started batch ${this.currentBatch}/${this.totalBatches}`);
    console.log(`   Batch ID: ${batch.batchId}`);
    console.log(`   Files to process: ${batchInfo.fileCount || 'unknown'}`);
    console.log(`   Variables to process: ${batchInfo.variableCount || 'unknown'}`);

    await this.saveProgress();
    this.emit('batchStarted', batch);

    return batch;
  }

  /**
   * Update batch progress
   */
  async updateBatchProgress(batchId, progressData) {
    const batch = this.progressData.batches.find(b => b.batchId === batchId);
    if (!batch) {
      console.warn(`Batch ${batchId} not found`);
      return;
    }

    // Update batch metrics
    Object.assign(batch.metrics, progressData.metrics || {});
    Object.assign(batch.performance, progressData.performance || {});
    Object.assign(batch.safety, progressData.safety || {});

    // Calculate batch progress percentage
    if (progressData.totalVariables && progressData.processedVariables) {
      batch.progress = Math.round((progressData.processedVariables / progressData.totalVariables) * 100);
      this.progressData.progress.batchProgress = batch.progress;
    }

    // Update overall tracking
    this.progressData.tracking.processed += progressData.metrics?.variablesProcessed || 0;
    this.progressData.tracking.eliminated += progressData.metrics?.variablesEliminated || 0;
    this.progressData.tracking.preserved += progressData.metrics?.variablesPreserved || 0;
    this.progressData.tracking.transformed += progressData.metrics?.variablesTransformed || 0;
    this.progressData.tracking.errors += progressData.metrics?.errors || 0;

    // Update remaining count
    this.progressData.tracking.remaining = Math.max(0,
      this.progressData.metrics.baseline.unusedVariables.total -
      this.progressData.tracking.eliminated -
      this.progressData.tracking.transformed
    );

    await this.saveProgress();
    this.emit('batchProgressUpdated', { batchId, batch, progressData });
  }

  /**
   * Complete a batch
   */
  async completeBatch(batchId, finalMetrics) {
    const batch = this.progressData.batches.find(b => b.batchId === batchId);
    if (!batch) {
      console.warn(`Batch ${batchId} not found`);
      return;
    }

    batch.endTime = new Date().toISOString();
    batch.status = 'completed';
    batch.progress = 100;

    // Calculate final batch metrics
    const startTime = new Date(batch.startTime);
    const endTime = new Date(batch.endTime);
    batch.performance.processingTime = endTime.getTime() - startTime.getTime();

    if (batch.metrics.variablesProcessed > 0) {
      batch.performance.averageTimePerVariable =
        batch.performance.processingTime / batch.metrics.variablesProcessed;
      batch.performance.throughput =
        (batch.metrics.variablesProcessed / (batch.performance.processingTime / 1000 / 60)).toFixed(2);
    }

    // Update final metrics if provided
    if (finalMetrics) {
      Object.assign(batch.metrics, finalMetrics.metrics || {});
      Object.assign(batch.safety, finalMetrics.safety || {});
    }

    // Calculate overall progress
    this.progressData.progress.overall = Math.round((this.currentBatch / this.totalBatches) * 100);

    console.log(`✅ Completed batch ${this.currentBatch}/${this.totalBatches}`);
    console.log(`   Processing time: ${batch.performance.processingTime}ms`);
    console.log(`   Variables processed: ${batch.metrics.variablesProcessed}`);
    console.log(`   Variables eliminated: ${batch.metrics.variablesEliminated}`);
    console.log(`   Throughput: ${batch.performance.throughput} vars/min`);

    await this.saveProgress();
    this.emit('batchCompleted', batch);

    return batch;
  }

  /**
   * Update current metrics by querying the system
   */
  async updateMetrics() {
    try {
      // Get current unused variable count
      const unusedVarCount = await this.getCurrentUnusedVariableCount();

      // Get current TypeScript error count
      const tsErrorCount = await this.getCurrentTypeScriptErrorCount();

      // Get current ESLint warning count
      const eslintWarningCount = await this.getCurrentESLintWarningCount();

      // Update current metrics
      this.progressData.metrics.current = {
        unusedVariables: unusedVarCount,
        typeScriptErrors: tsErrorCount,
        eslintWarnings: eslintWarningCount,
        timestamp: new Date().toISOString()
      };

      // Calculate achievements
      this.calculateAchievements();

    } catch (error) {
      console.warn('Error updating metrics:', error.message);
      this.logError('metrics-update', error);
    }
  }

  /**
   * Get current unused variable count
   */
  async getCurrentUnusedVariableCount() {
    try {
      const output = execSync('yarn lint --max-warnings=10000 --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get current TypeScript error count
   */
  async getCurrentTypeScriptErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get current ESLint warning count
   */
  async getCurrentESLintWarningCount() {
    try {
      const output = execSync('yarn lint --max-warnings=10000 --format=compact 2>&1 | grep -c "warning" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Calculate achievements based on current vs baseline metrics
   */
  calculateAchievements() {
    const baseline = this.progressData.metrics.baseline;
    const current = this.progressData.metrics.current;
    const targets = this.progressData.metrics.targets;

    if (!baseline.unusedVariables || !current.unusedVariables) return;

    const achievements = {
      unusedVariables: {
        reduced: baseline.unusedVariables.total - current.unusedVariables,
        reductionPercentage: ((baseline.unusedVariables.total - current.unusedVariables) / baseline.unusedVariables.total * 100).toFixed(1),
        targetProgress: ((baseline.unusedVariables.total - current.unusedVariables) / targets.unusedVariables.reductionTarget * 100).toFixed(1)
      },
      typeScriptErrors: {
        reduced: baseline.typeScriptErrors - current.typeScriptErrors,
        reductionPercentage: baseline.typeScriptErrors > 0 ? ((baseline.typeScriptErrors - current.typeScriptErrors) / baseline.typeScriptErrors * 100).toFixed(1) : '0.0',
        targetProgress: baseline.typeScriptErrors > 0 ? ((baseline.typeScriptErrors - current.typeScriptErrors) / baseline.typeScriptErrors * 100).toFixed(1) : '0.0'
      },
      eslintWarnings: {
        reduced: baseline.eslintWarnings - current.eslintWarnings,
        reductionPercentage: baseline.eslintWarnings > 0 ? ((baseline.eslintWarnings - current.eslintWarnings) / baseline.eslintWarnings * 100).toFixed(1) : '0.0',
        targetProgress: ((baseline.eslintWarnings - current.eslintWarnings) / targets.eslintWarnings.reductionTarget * 100).toFixed(1)
      }
    };

    this.progressData.metrics.achievements = achievements;
  }

  /**
   * Calculate velocity metrics
   */
  async calculateVelocity() {
    const now = new Date();
    const elapsedMinutes = (now.getTime() - this.startTime.getTime()) / (1000 * 60);

    if (elapsedMinutes > 0) {
      // Variables per minute
      this.progressData.velocity.variablesPerMinute =
        (this.progressData.tracking.processed / elapsedMinutes).toFixed(2);

      // Batches per hour
      this.progressData.velocity.batchesPerHour =
        (this.currentBatch / (elapsedMinutes / 60)).toFixed(2);

      // Average batch time
      if (this.currentBatch > 0) {
        const completedBatches = this.progressData.batches.filter(b => b.status === 'completed');
        if (completedBatches.length > 0) {
          const totalBatchTime = completedBatches.reduce((sum, batch) => sum + batch.performance.processingTime, 0);
          this.progressData.velocity.averageBatchTime = Math.round(totalBatchTime / completedBatches.length);
        }
      }

      // Estimated completion
      if (this.progressData.velocity.variablesPerMinute > 0 && this.progressData.tracking.remaining > 0) {
        const remainingMinutes = this.progressData.tracking.remaining / parseFloat(this.progressData.velocity.variablesPerMinute);
        const estimatedCompletion = new Date(now.getTime() + (remainingMinutes * 60 * 1000));
        this.progressData.velocity.estimatedCompletion = estimatedCompletion.toISOString();
      }
    }
  }

  /**
   * Update ROI analysis
   */
  async updateROI() {
    const now = new Date();
    const elapsedHours = (now.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);

    const baseline = this.progressData.metrics.baseline;
    const current = this.progressData.metrics.current;
    const achievements = this.progressData.metrics.achievements;

    this.progressData.roi = {
      timeInvested: elapsedHours.toFixed(2),
      errorsReduced: achievements?.typeScriptErrors?.reduced || 0,
      warningsReduced: achievements?.eslintWarnings?.reduced || 0,
      unusedVariablesReduced: achievements?.unusedVariables?.reduced || 0,
      buildTimeImprovement: 0, // Could be calculated if build time is measured
      codeQualityScore: this.calculateCodeQualityScore(),
      efficiency: {
        variablesPerHour: elapsedHours > 0 ? (this.progressData.tracking.processed / elapsedHours).toFixed(2) : '0.00',
        errorsPerHour: elapsedHours > 0 ? ((achievements?.typeScriptErrors?.reduced || 0) / elapsedHours).toFixed(2) : '0.00',
        warningsPerHour: elapsedHours > 0 ? ((achievements?.eslintWarnings?.reduced || 0) / elapsedHours).toFixed(2) : '0.00'
      },
      costBenefit: {
        timeInvestment: elapsedHours,
        qualityImprovement: this.calculateQualityImprovement(),
        maintenanceReduction: this.calculateMaintenanceReduction(),
        developerProductivity: this.calculateProductivityGain()
      }
    };
  }

  /**
   * Calculate code quality score (0-100)
   */
  calculateCodeQualityScore() {
    const baseline = this.progressData.metrics.baseline;
    const current = this.progressData.metrics.current;

    if (!baseline.unusedVariables || !current.unusedVariables) return 0;

    // Base score calculation
    let score = 50; // Starting point

    // Unused variables impact (30 points max)
    const unusedVarReduction = (baseline.unusedVariables.total - current.unusedVariables) / baseline.unusedVariables.total;
    score += unusedVarReduction * 30;

    // TypeScript errors impact (25 points max)
    if (baseline.typeScriptErrors > 0) {
      const tsErrorReduction = (baseline.typeScriptErrors - current.typeScriptErrors) / baseline.typeScriptErrors;
      score += tsErrorReduction * 25;
    }

    // ESLint warnings impact (20 points max)
    if (baseline.eslintWarnings > 0) {
      const eslintReduction = (baseline.eslintWarnings - current.eslintWarnings) / baseline.eslintWarnings;
      score += eslintReduction * 20;
    }

    // Safety and stability bonus (5 points max)
    const safetyScore = this.calculateSafetyScore();
    score += safetyScore * 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Calculate safety score based on error rates and recovery actions
   */
  calculateSafetyScore() {
    const totalBatches = this.progressData.batches.length;
    if (totalBatches === 0) return 1.0;

    const totalErrors = this.progressData.tracking.errors;
    const totalRecoveries = this.progressData.tracking.recoveries;

    // High safety score if low error rate and good recovery rate
    const errorRate = totalErrors / totalBatches;
    const recoveryRate = totalErrors > 0 ? totalRecoveries / totalErrors : 1.0;

    return Math.max(0, 1.0 - errorRate + (recoveryRate * 0.5));
  }

  /**
   * Calculate quality improvement percentage
   */
  calculateQualityImprovement() {
    const achievements = this.progressData.metrics.achievements;
    if (!achievements) return 0;

    const unusedVarImprovement = parseFloat(achievements.unusedVariables?.reductionPercentage || 0);
    const tsErrorImprovement = parseFloat(achievements.typeScriptErrors?.reductionPercentage || 0);
    const eslintImprovement = parseFloat(achievements.eslintWarnings?.reductionPercentage || 0);

    // Weighted average
    return ((unusedVarImprovement * 0.4) + (tsErrorImprovement * 0.35) + (eslintImprovement * 0.25)).toFixed(1);
  }

  /**
   * Calculate maintenance reduction estimate
   */
  calculateMaintenanceReduction() {
    const variablesReduced = this.progressData.tracking.eliminated + this.progressData.tracking.transformed;

    // Estimate: each unused variable represents ~2 minutes of maintenance overhead per month
    const monthlyMaintenanceReduction = variablesReduced * 2; // minutes

    return {
      monthlyMinutes: monthlyMaintenanceReduction,
      monthlyHours: (monthlyMaintenanceReduction / 60).toFixed(1),
      annualHours: (monthlyMaintenanceReduction * 12 / 60).toFixed(1)
    };
  }

  /**
   * Calculate developer productivity gain
   */
  calculateProductivityGain() {
    const achievements = this.progressData.metrics.achievements;
    if (!achievements) return 0;

    const totalReduction = (
      parseInt(achievements.unusedVariables?.reduced || 0) +
      parseInt(achievements.typeScriptErrors?.reduced || 0) +
      parseInt(achievements.eslintWarnings?.reduced || 0)
    );

    // Estimate: each error/warning represents ~30 seconds of developer distraction
    const dailyTimeReduction = totalReduction * 0.5; // minutes

    return {
      dailyMinutes: dailyTimeReduction.toFixed(1),
      weeklyHours: (dailyTimeReduction * 5 / 60).toFixed(1),
      monthlyHours: (dailyTimeReduction * 22 / 60).toFixed(1)
    };
  }

  /**
   * Log an error with recovery action tracking
   */
  logError(errorType, error, recoveryAction = null) {
    const errorEntry = {
      id: `error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: errorType,
      message: error.message || error,
      stack: error.stack || null,
      batchId: this.progressData.batches.length > 0 ? this.progressData.batches[this.progressData.batches.length - 1].batchId : null,
      recoveryAction: recoveryAction,
      resolved: false
    };

    this.progressData.errors.push(errorEntry);
    this.progressData.tracking.errors++;

    // Save error log
    this.saveErrorLog();

    console.error(`❌ Error logged: ${errorType} - ${error.message || error}`);

    this.emit('errorLogged', errorEntry);

    return errorEntry.id;
  }

  /**
   * Log a recovery action
   */
  logRecoveryAction(errorId, action, success = true) {
    const recoveryEntry = {
      id: `recovery-${Date.now()}`,
      timestamp: new Date().toISOString(),
      errorId: errorId,
      action: action,
      success: success,
      batchId: this.progressData.batches.length > 0 ? this.progressData.batches[this.progressData.batches.length - 1].batchId : null
    };

    this.progressData.recoveryActions.push(recoveryEntry);

    if (success) {
      this.progressData.tracking.recoveries++;

      // Mark error as resolved
      const error = this.progressData.errors.find(e => e.id === errorId);
      if (error) {
        error.resolved = true;
        error.recoveryAction = action;
      }
    }

    console.log(`🔧 Recovery action logged: ${action} (${success ? 'success' : 'failed'})`);

    this.emit('recoveryActionLogged', recoveryEntry);

    return recoveryEntry.id;
  }

  /**
   * Add notification
   */
  addNotification(type, message, level = 'info') {
    const notification = {
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
      level: level, // info, warning, error, success
      read: false
    };

    this.progressData.notifications.push(notification);

    // Keep only last 100 notifications
    if (this.progressData.notifications.length > 100) {
      this.progressData.notifications = this.progressData.notifications.slice(-100);
    }

    console.log(`📢 Notification: [${level.toUpperCase()}] ${message}`);

    this.emit('notificationAdded', notification);

    return notification.id;
  }

  /**
   * Save progress data
   */
  async saveProgress() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.progressFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save main progress data
      fs.writeFileSync(this.progressFile, JSON.stringify(this.progressData, null, 2));

      // Save metrics summary
      const metricsData = {
        lastUpdated: new Date().toISOString(),
        campaignId: this.campaignId,
        status: this.progressData.status,
        progress: this.progressData.progress,
        metrics: this.progressData.metrics,
        tracking: this.progressData.tracking,
        velocity: this.progressData.velocity,
        roi: this.progressData.roi
      };

      fs.writeFileSync(this.metricsFile, JSON.stringify(metricsData, null, 2));

    } catch (error) {
      console.error('Error saving progress:', error.message);
    }
  }

  /**
   * Save error log
   */
  saveErrorLog() {
    try {
      const errorLogData = {
        lastUpdated: new Date().toISOString(),
        campaignId: this.campaignId,
        totalErrors: this.progressData.errors.length,
        totalRecoveries: this.progressData.recoveryActions.length,
        errors: this.progressData.errors,
        recoveryActions: this.progressData.recoveryActions
      };

      fs.writeFileSync(this.errorLogFile, JSON.stringify(errorLogData, null, 2));
    } catch (error) {
      console.error('Error saving error log:', error.message);
    }
  }

  /**
   * Generate progress report
   */
  generateProgressReport() {
    const now = new Date();
    const elapsedTime = now.getTime() - this.startTime.getTime();

    return {
      campaignId: this.campaignId,
      reportTimestamp: now.toISOString(),
      campaignDuration: {
        elapsed: elapsedTime,
        elapsedFormatted: this.formatDuration(elapsedTime),
        startTime: this.startTime.toISOString()
      },
      progress: this.progressData.progress,
      metrics: this.progressData.metrics,
      tracking: this.progressData.tracking,
      velocity: this.progressData.velocity,
      roi: this.progressData.roi,
      batches: {
        total: this.progressData.batches.length,
        completed: this.progressData.batches.filter(b => b.status === 'completed').length,
        inProgress: this.progressData.batches.filter(b => b.status === 'in-progress').length,
        failed: this.progressData.batches.filter(b => b.status === 'failed').length
      },
      errors: {
        total: this.progressData.errors.length,
        resolved: this.progressData.errors.filter(e => e.resolved).length,
        unresolved: this.progressData.errors.filter(e => !e.resolved).length
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on current progress
   */
  generateRecommendations() {
    const recommendations = [];

    // Velocity recommendations
    if (parseFloat(this.progressData.velocity.variablesPerMinute) < 1.0) {
      recommendations.push({
        type: 'velocity',
        priority: 'medium',
        message: 'Processing velocity is below optimal. Consider increasing batch sizes or optimizing processing logic.'
      });
    }

    // Error rate recommendations
    const errorRate = this.progressData.tracking.errors / Math.max(1, this.currentBatch);
    if (errorRate > 0.1) {
      recommendations.push({
        type: 'safety',
        priority: 'high',
        message: 'Error rate is elevated. Consider reducing batch sizes and implementing additional safety checks.'
      });
    }

    // Progress recommendations
    if (this.progressData.progress.overall < 50 && this.currentBatch > this.totalBatches * 0.7) {
      recommendations.push({
        type: 'progress',
        priority: 'medium',
        message: 'Progress is behind schedule. Consider adjusting targets or increasing processing efficiency.'
      });
    }

    // ROI recommendations
    const qualityScore = this.progressData.roi.codeQualityScore;
    if (qualityScore > 80) {
      recommendations.push({
        type: 'success',
        priority: 'low',
        message: 'Excellent progress! Code quality improvements are significant.'
      });
    }

    return recommendations;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Print current status
   */
  printStatus() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REAL-TIME PROGRESS STATUS');
    console.log('='.repeat(80));

    const progress = this.progressData.progress;
    const tracking = this.progressData.tracking;
    const velocity = this.progressData.velocity;
    const roi = this.progressData.roi;

    console.log(`\n🎯 Campaign: ${this.campaignId}`);
    console.log(`   Status: ${this.progressData.status}`);
    console.log(`   Phase: ${this.progressData.currentPhase}`);
    console.log(`   Overall Progress: ${progress.overall}%`);
    console.log(`   Current Batch: ${progress.currentBatch}/${progress.totalBatches}`);

    console.log(`\n📈 Tracking:`);
    console.log(`   Variables Processed: ${tracking.processed}`);
    console.log(`   Variables Eliminated: ${tracking.eliminated}`);
    console.log(`   Variables Preserved: ${tracking.preserved}`);
    console.log(`   Variables Transformed: ${tracking.transformed}`);
    console.log(`   Variables Remaining: ${tracking.remaining}`);
    console.log(`   Errors Encountered: ${tracking.errors}`);
    console.log(`   Successful Recoveries: ${tracking.recoveries}`);

    console.log(`\n⚡ Velocity:`);
    console.log(`   Variables/Minute: ${velocity.variablesPerMinute}`);
    console.log(`   Batches/Hour: ${velocity.batchesPerHour}`);
    console.log(`   Average Batch Time: ${velocity.averageBatchTime}ms`);
    if (velocity.estimatedCompletion) {
      console.log(`   Estimated Completion: ${new Date(velocity.estimatedCompletion).toLocaleString()}`);
    }

    console.log(`\n💰 ROI Analysis:`);
    console.log(`   Time Invested: ${roi.timeInvested} hours`);
    console.log(`   Code Quality Score: ${roi.codeQualityScore}/100`);
    console.log(`   Variables Reduced: ${roi.unusedVariablesReduced}`);
    console.log(`   Errors Reduced: ${roi.errorsReduced}`);
    console.log(`   Warnings Reduced: ${roi.warningsReduced}`);

    if (this.progressData.metrics.achievements) {
      const achievements = this.progressData.metrics.achievements;
      console.log(`\n🏆 Achievements:`);
      console.log(`   Unused Variables: ${achievements.unusedVariables?.reductionPercentage}% reduced`);
      console.log(`   TypeScript Errors: ${achievements.typeScriptErrors?.reductionPercentage}% reduced`);
      console.log(`   ESLint Warnings: ${achievements.eslintWarnings?.reductionPercentage}% reduced`);
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Execute if run directly
if (require.main === module) {
  const monitor = new RealTimeProgressMonitor();

  // Example usage
  console.log('🚀 Real-Time Progress Monitor Demo');

  // Load baseline data if available
  const baselineFile = path.join(process.cwd(), '.kiro/specs/unused-variable-elimination/baseline-metrics.json');
  if (fs.existsSync(baselineFile)) {
    const baselineData = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    monitor.initialize(baselineData).then(() => {
      monitor.startMonitoring(10000); // 10 second intervals for demo
      monitor.printStatus();

      // Stop after 30 seconds for demo
      setTimeout(() => {
        monitor.stopMonitoring();
        console.log('\n✅ Demo completed');
      }, 30000);
    });
  } else {
    console.log('❌ No baseline data found. Run BaselineMetricsEstablisher first.');
  }
}

module.exports = RealTimeProgressMonitor;
