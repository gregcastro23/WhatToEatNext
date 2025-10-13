/**
 * Campaign System Test Mocks
 *
 * Comprehensive mocking system for campaign operations during test execution.
 * Prevents actual build processes from running and provides test-safe alternatives.
 */

import {
  CampaignConfig,
  CampaignPhase,
  CorruptionReport,
  CorruptionSeverity,
  GitStash,
  MetricsImprovement,
  PhaseReport,
  PhaseResult,
  PhaseStatus,
  ProgressMetrics,
  ProgressReport,
  RecoveryAction,
  SafetyEvent,
  SafetyEventSeverity,
  SafetyEventType,
  ValidationResult,
} from '../../types/campaign';

/**
 * Mock Campaign Controller for test environments
 */
export class MockCampaignController {
  private config: CampaignConfig,
  private currentPhase: CampaignPhase | null = null,
  private safetyEvents: SafetyEvent[] = [];
  private _isPaused: boolean = false,
  private _isRunning: boolean = false,
  private mockMetrics: ProgressMetrics,
  private mockStashes: Map<string, GitStash> = new Map();

  constructor(config: CampaignConfig) {
    this.config = config;
    this.mockMetrics = this.createMockMetrics();
    this.initializeMockStashes();
  }

  /**
   * Mock phase execution - does not run actual scripts
   */
  async executePhase(phase: CampaignPhase): Promise<PhaseResult> {
    if (this.isPaused()) {
      throw new Error('Campaign is paused');
    }

    this._isRunning = true;
    this.currentPhase = phase;

    const startTime = Date.now();

    // Add mock safety event
    this.addSafetyEvent({
      type: SafetyEventType.CHECKPOINT_CREATED,
      timestamp: new Date(),
      description: `Mock phase execution: ${phase.name}`,
      severity: SafetyEventSeverity.INFO,
      action: 'MOCK_PHASE_START'
});

    // Simulate phase execution without running actual scripts
    const mockResult = await this.simulatePhaseExecution(phase);

    const executionTime = Date.now() - startTime;
    this._isRunning = false;

    return {
      phaseId: phase.id,
      success: mockResult.success,
      metricsImprovement: mockResult.metricsImprovement,
      filesProcessed: mockResult.filesProcessed,
      errorsFixed: mockResult.errorsFixed,
      warningsFixed: mockResult.warningsFixed,
      executionTime,
      safetyEvents: [...this.safetyEvents]
};
  }

  /**
   * Mock phase validation - does not run actual validation
   */
  async validatePhaseCompletion(phase: CampaignPhase): Promise<ValidationResult> {
    // Return mock validation result based on phase success criteria
    const mockErrors: string[] = [];
    const mockWarnings: string[] = [];

    // Simulate validation logic without actual checks
    if (phase.successCriteria.typeScriptErrors !== undefined) {
      if (this.mockMetrics.typeScriptErrors.current > phase.successCriteria.typeScriptErrors) {
        mockErrors.push(`Mock: TypeScript errors not met`);
      }
    }

    return {
      success: mockErrors.length === 0,
      errors: mockErrors,
      warnings: mockWarnings,
      metrics: this.mockMetrics
};
  }

  /**
   * Mock safety checkpoint creation
   */
  async createSafetyCheckpoint(description: string): Promise<string> {
    const checkpointId = `mock_checkpoint_${Date.now()}`;

    // Create mock stash
    const mockStash: GitStash = {
      id: checkpointId,
      description: `Mock stash: ${description}`,
      timestamp: new Date(),
      branch: 'mock-branch',
      ref: `stash@{${this.mockStashes.size}}`
};

    this.mockStashes.set(checkpointId, mockStash);

    this.addSafetyEvent({
      type: SafetyEventType.CHECKPOINT_CREATED,
      timestamp: new Date(),
      description: `Mock checkpoint created: ${description}`,
      severity: SafetyEventSeverity.INFO,
      action: 'MOCK_CHECKPOINT_CREATE'
});

    return checkpointId;
  }

  /**
   * Mock rollback to checkpoint
   */
  async rollbackToCheckpoint(checkpointId: string): Promise<void> {
    const stash = this.mockStashes.get(checkpointId);
    if (!stash) {
      throw new Error(`Mock stash not found: ${checkpointId}`);
    }

    this.addSafetyEvent({
      type: SafetyEventType.ROLLBACK_TRIGGERED,
      timestamp: new Date(),
      description: `Mock rollback to: ${checkpointId}`,
      severity: SafetyEventSeverity.WARNING,
      action: 'MOCK_ROLLBACK'
});

    // Simulate rollback by resetting mock metrics
    this.mockMetrics = this.createMockMetrics();
  }

  /**
   * Get mock progress metrics without running actual measurements
   */
  async getProgressMetrics(): Promise<ProgressMetrics> {
    return { ...this.mockMetrics };
  }

  /**
   * Generate mock phase report
   */
  async generatePhaseReport(phase: CampaignPhase): Promise<PhaseReport> {
    const validation = await this.validatePhaseCompletion(phase);

    return {
      phaseId: phase.id,
      phaseName: phase.name,
      startTime: new Date(),
      status: validation.success ? PhaseStatus.COMPLETED : PhaseStatus.IN_PROGRESS,
      metrics: this.mockMetrics,
      achievements: ['Mock achievement 1', 'Mock achievement 2'],
      issues: validation.errors,
      recommendations: ['Mock recommendation 1']
};
  }

  /**
   * Pause campaign execution
   */
  pauseCampaign(): void {
    this._isPaused = true;
    this.addSafetyEvent({
      type: SafetyEventType.CHECKPOINT_CREATED,
      timestamp: new Date(),
      description: 'Campaign paused for test isolation',
      severity: SafetyEventSeverity.INFO,
      action: 'CAMPAIGN_PAUSED'
});
  }

  /**
   * Resume campaign execution
   */
  resumeCampaign(): void {
    this._isPaused = false;
    this.addSafetyEvent({
      type: SafetyEventType.CHECKPOINT_CREATED,
      timestamp: new Date(),
      description: 'Campaign resumed after test isolation',
      severity: SafetyEventSeverity.INFO,
      action: 'CAMPAIGN_RESUMED'
});
  }

  /**
   * Check if campaign is paused
   */
  isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Check if campaign is running
   */
  isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): CampaignPhase | null {
    return this.currentPhase;
  }

  /**
   * Get safety events
   */
  getSafetyEvents(): SafetyEvent[] {
    return [...this.safetyEvents];
  }

  /**
   * Update mock metrics for testing
   */
  updateMockMetrics(updates: Partial<ProgressMetrics>): void {
    this.mockMetrics = { ...this.mockMetrics, ...updates };
  }

  /**
   * Reset mock state
   */
  resetMockState(): void {
    this.safetyEvents = [];
    this._isPaused = false;
    this._isRunning = false;
    this.currentPhase = null;
    this.mockMetrics = this.createMockMetrics();
    this.mockStashes.clear();
    this.initializeMockStashes();
  }

  // Private helper methods

  private async simulatePhaseExecution(_phase: CampaignPhase): Promise<{
    success: boolean,
    metricsImprovement: MetricsImprovement,
    filesProcessed: number,
    errorsFixed: number,
    warningsFixed: number;
  }> {
    // Simulate processing without running actual scripts
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for realism

    return {
      success: true,
      metricsImprovement: {
        typeScriptErrorsReduced: 5,
        lintingWarningsReduced: 10,
        buildTimeImproved: 0.5,
        enterpriseSystemsAdded: 2
},
      filesProcessed: 15,
      errorsFixed: 5,
      warningsFixed: 10
};
  }

  private createMockMetrics(): ProgressMetrics {
    return {
      typeScriptErrors: {
        current: 50,
        target: 0,
        reduction: 36,
        percentage: 42
},
      lintingWarnings: {
        current: 2000,
        target: 0,
        reduction: 2506,
        percentage: 56
},
      buildPerformance: {
        currentTime: 8.5,
        targetTime: 10,
        cacheHitRate: 0.8,
        memoryUsage: 45
},
      enterpriseSystems: {
        current: 50,
        target: 200,
        transformedExports: 50
},
    };
  }

  private initializeMockStashes(): void {
    // Create some initial mock stashes
    const initialStashes = [
      {
        id: 'mock_stash_1',
        description: 'Initial mock stash',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        branch: 'mock-branch',
        ref: 'stash@{0}'
},
      {
        id: 'mock_stash_2',
        description: 'Secondary mock stash',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        branch: 'mock-branch',
        ref: 'stash@{1}'
},
    ];

    initialStashes.forEach(stash => {
      this.mockStashes.set(stash.id, stash);
    });
  }

  private addSafetyEvent(event: SafetyEvent): void {
    this.safetyEvents.push(event);

    // Keep only recent events to prevent memory issues
    if (this.safetyEvents.length > 100) {
      this.safetyEvents = this.safetyEvents.slice(-50);
    }
  }
}

/**
 * Mock Progress Tracker for test environments
 */
export class MockProgressTracker {
  private mockMetrics: ProgressMetrics,
  private metricsHistory: ProgressMetrics[] = [];
  private isTracking: boolean = false,

  constructor() {
    this.mockMetrics = this.createMockMetrics();
  }

  /**
   * Mock TypeScript error count - does not run actual tsc
   */
  async getTypeScriptErrorCount(): Promise<number> {
    return this.mockMetrics.typeScriptErrors.current;
  }

  /**
   * Mock TypeScript error breakdown - does not run actual analysis
   */
  async getTypeScriptErrorBreakdown(): Promise<Record<string, number>> {
    return {
      TS2352: 15,
      TS2339: 20,
      TS2304: 10,
      TS2345: 5
};
  }

  /**
   * Mock linting warning count - does not run actual linting
   */
  async getLintingWarningCount(): Promise<number> {
    return this.mockMetrics.lintingWarnings.current;
  }

  /**
   * Mock linting warning breakdown - does not run actual analysis
   */
  async getLintingWarningBreakdown(): Promise<Record<string, number>> {
    return {
      '@typescript-eslint/no-explicit-any': 800,
      '@typescript-eslint/no-unused-vars': 600,
      'no-console': 400,
      'prefer-const': 200,
    };
  }

  /**
   * Mock build time measurement - does not run actual build
   */
  async getBuildTime(): Promise<number> {
    return this.mockMetrics.buildPerformance.currentTime;
  }

  /**
   * Mock enterprise system count - does not run actual analysis
   */
  async getEnterpriseSystemCount(): Promise<number> {
    return this.mockMetrics.enterpriseSystems.current;
  }

  /**
   * Mock cache hit rate - returns simulated value
   */
  async getCacheHitRate(): Promise<number> {
    return this.mockMetrics.buildPerformance.cacheHitRate;
  }

  /**
   * Mock memory usage - returns simulated value
   */
  async getMemoryUsage(): Promise<number> {
    return this.mockMetrics.buildPerformance.memoryUsage;
  }

  /**
   * Get mock progress metrics without running actual measurements
   */
  async getProgressMetrics(): Promise<ProgressMetrics> {
    const metrics = { ...this.mockMetrics };

    // Add to history for tracking
    this.metricsHistory.push(metrics);

    // Keep only recent history to prevent memory issues
    if (this.metricsHistory.length > 50) {
      this.metricsHistory = this.metricsHistory.slice(-25);
    }

    return metrics;
  }

  /**
   * Generate mock progress report
   */
  async generateProgressReport(): Promise<ProgressReport> {
    const currentMetrics = await this.getProgressMetrics();
    const targetMetrics = this.createTargetMetrics();

    return {
      campaignId: 'mock-campaign',
      overallProgress: 65,
      phases: [
        {
          phaseId: 'phase1',
          phaseName: 'Mock Phase 1',
          startTime: new Date(),
          status: PhaseStatus.COMPLETED,
          metrics: currentMetrics,
          achievements: ['Mock achievement'],
          issues: [],
          recommendations: ['Mock recommendation']
},
      ],
      currentMetrics,
      targetMetrics,
      estimatedCompletion: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }

  /**
   * Start tracking (mock implementation)
   */
  startTracking(): void {
    this.isTracking = true;
  }

  /**
   * Stop tracking (mock implementation)
   */
  stopTracking(): void {
    this.isTracking = false;
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Update mock metrics for testing
   */
  updateMockMetrics(updates: Partial<ProgressMetrics>): void {
    this.mockMetrics = { ...this.mockMetrics, ...updates };
  }

  /**
   * Reset mock state
   */
  resetMockState(): void {
    this.mockMetrics = this.createMockMetrics();
    this.metricsHistory = [];
    this.isTracking = false;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): ProgressMetrics[] {
    return [...this.metricsHistory];
  }

  // Private helper methods

  private createMockMetrics(): ProgressMetrics {
    return {
      typeScriptErrors: {
        current: 50,
        target: 0,
        reduction: 36,
        percentage: 42
},
      lintingWarnings: {
        current: 2000,
        target: 0,
        reduction: 2506,
        percentage: 56
},
      buildPerformance: {
        currentTime: 8.5,
        targetTime: 10,
        cacheHitRate: 0.8,
        memoryUsage: 45
},
      enterpriseSystems: {
        current: 50,
        target: 200,
        transformedExports: 50
},
    };
  }

  private createTargetMetrics(): ProgressMetrics {
    return {
      typeScriptErrors: {
        current: 0,
        target: 0,
        reduction: 86,
        percentage: 100
},
      lintingWarnings: {
        current: 0,
        target: 0,
        reduction: 4506,
        percentage: 100
},
      buildPerformance: {
        currentTime: 8,
        targetTime: 10,
        cacheHitRate: 0.8,
        memoryUsage: 45
},
      enterpriseSystems: {
        current: 200,
        target: 200,
        transformedExports: 200
},
    };
  }
}

/**
 * Mock Safety Protocol for test environments
 */
export class MockSafetyProtocol {
  private mockStashes: Map<string, GitStash> = new Map();
  private safetyEvents: SafetyEvent[] = [];
  private stashCounter: number = 0,

  constructor() {
    this.initializeMockStashes();
  }

  /**
   * Mock stash creation - does not run actual git commands
   */
  async createStash(description: string, _phase?: string): Promise<string> {
    this.stashCounter++;
    const stashId = `mock_stash_${this.stashCounter}_${Date.now()}`;

    const mockStash: GitStash = {
      id: stashId,
      description: `Mock stash: ${description}`,
      timestamp: new Date(),
      branch: 'mock-branch',
      ref: `stash@{${this.stashCounter}}`
};

    this.mockStashes.set(stashId, mockStash);

    this.addSafetyEvent({
      type: SafetyEventType.CHECKPOINT_CREATED,
      timestamp: new Date(),
      description: `Mock stash created: ${stashId}`,
      severity: SafetyEventSeverity.INFO,
      action: 'MOCK_STASH_CREATE'
});

    return stashId;
  }

  /**
   * Mock stash application - does not run actual git commands
   */
  async applyStash(stashId: string, _validateAfter: boolean = true): Promise<void> {
    const stash = this.mockStashes.get(stashId);
    if (!stash) {
      throw new Error(`Mock stash not found: ${stashId}`);
    }

    this.addSafetyEvent({
      type: SafetyEventType.ROLLBACK_TRIGGERED,
      timestamp: new Date(),
      description: `Mock stash applied: ${stashId}`,
      severity: SafetyEventSeverity.WARNING,
      action: 'MOCK_STASH_APPLY'
});
  }

  /**
   * Mock corruption detection - does not run actual file analysis
   */
  async detectCorruption(_files: string[]): Promise<CorruptionReport> {
    // Return mock corruption report
    return {
      detectedFiles: [],
      corruptionPatterns: [],
      severity: CorruptionSeverity.LOW,
      recommendedAction: RecoveryAction.CONTINUE
};
  }

  /**
   * Mock git state validation - does not run actual git commands
   */
  async validateGitState(): Promise<ValidationResult> {
    return {
      success: true,
      errors: [],
      warnings: []
};
  }

  /**
   * Mock emergency rollback - does not run actual git commands
   */
  async emergencyRollback(): Promise<void> {
    this.addSafetyEvent({
      type: SafetyEventType.EMERGENCY_RECOVERY,
      timestamp: new Date(),
      description: 'Mock emergency rollback performed',
      severity: SafetyEventSeverity.WARNING,
      action: 'MOCK_EMERGENCY_ROLLBACK'
});
  }

  /**
   * List mock stashes
   */
  async listStashes(): Promise<GitStash[]> {
    return Array.from(this.mockStashes.values());
  }

  /**
   * Get safety events
   */
  getSafetyEvents(): SafetyEvent[] {
    return [...this.safetyEvents];
  }

  /**
   * Reset mock state
   */
  resetMockState(): void {
    this.mockStashes.clear();
    this.safetyEvents = [];
    this.stashCounter = 0;
    this.initializeMockStashes();
  }

  // Private helper methods

  private initializeMockStashes(): void {
    // Create some initial mock stashes
    const initialStashes = [
      {
        id: 'mock_initial_stash',
        description: 'Initial mock stash for testing',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        branch: 'mock-branch',
        ref: 'stash@{0}'
},
    ];

    initialStashes.forEach(stash => {
      this.mockStashes.set(stash.id, stash);
    });
  }

  private addSafetyEvent(event: SafetyEvent): void {
    this.safetyEvents.push(event);

    // Keep only recent events to prevent memory issues
    if (this.safetyEvents.length > 100) {
      this.safetyEvents = this.safetyEvents.slice(-50);
    }
  }
}

/**
 * Campaign Test Isolation Manager
 *
 * Manages campaign system state during test execution to ensure
 * tests don't interfere with each other or trigger actual builds.
 */
export class CampaignTestIsolationManager {
  private static instance: CampaignTestIsolationManager | null = null,
  private mockController: MockCampaignController | null = null,
  private mockTracker: MockProgressTracker | null = null,
  private mockSafety: MockSafetyProtocol | null = null,
  private originalProcessEnv: Record<string, string | undefined> = {};

  private constructor() {
    this.setupTestEnvironment();
  }

  static getInstance(): CampaignTestIsolationManager {
    if (!CampaignTestIsolationManager.instance) {
      CampaignTestIsolationManager.instance = new CampaignTestIsolationManager();
    }
    return CampaignTestIsolationManager.instance;
  }

  /**
   * Initialize mock campaign system for tests
   */
  initializeMockCampaignSystem(config?: Partial<CampaignConfig>): {
    controller: MockCampaignController,
    tracker: MockProgressTracker,
    safety: MockSafetyProtocol;
  } {
    const defaultConfig: CampaignConfig = {
      phases: [
        {
          id: 'test-phase',
          name: 'Test Phase',
          description: 'Mock phase for testing',
          tools: [],
          successCriteria: { typeScriptErrors: 0 },
          safetyCheckpoints: []
},
      ],
      safetySettings: {
        maxFilesPerBatch: 10,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
},
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
},
      toolConfiguration: {
        enhancedErrorFixer: 'mock-script',
        explicitAnyFixer: 'mock-script',
        unusedVariablesFixer: 'mock-script',
        consoleStatementFixer: 'mock-script'
},
    };

    const fullConfig = { ...defaultConfig, ...config };

    this.mockController = new MockCampaignController(fullConfig);
    this.mockTracker = new MockProgressTracker();
    this.mockSafety = new MockSafetyProtocol();

    return {
      controller: this.mockController,
      tracker: this.mockTracker,
      safety: this.mockSafety
};
  }

  /**
   * Pause all campaign operations for test isolation
   */
  pauseCampaignOperations(): void {
    if (this.mockController) {
      this.mockController.pauseCampaign();
    }
    if (this.mockTracker) {
      this.mockTracker.stopTracking();
    }
  }

  /**
   * Resume campaign operations after test isolation
   */
  resumeCampaignOperations(): void {
    if (this.mockController) {
      this.mockController.resumeCampaign();
    }
    if (this.mockTracker) {
      this.mockTracker.startTracking();
    }
  }

  /**
   * Reset all mock states for clean test isolation
   */
  resetAllMockStates(): void {
    if (this.mockController) {
      this.mockController.resetMockState();
    }
    if (this.mockTracker) {
      this.mockTracker.resetMockState();
    }
    if (this.mockSafety) {
      this.mockSafety.resetMockState();
    }
  }

  /**
   * Get current mock instances
   */
  getMockInstances(): {
    controller: MockCampaignController | null,
    tracker: MockProgressTracker | null,
    safety: MockSafetyProtocol | null;
  } {
    return {
      controller: this.mockController,
      tracker: this.mockTracker,
      safety: this.mockSafety
};
  }

  /**
   * Setup test environment to prevent actual campaign operations
   */
  private setupTestEnvironment(): void {
    // Store original environment variables
    this.originalProcessEnv = { ...process.env };

    // Set test environment flags to prevent actual operations
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true }),
    process.env.CAMPAIGN_TEST_MODE = 'true';
    process.env.DISABLE_ACTUAL_BUILDS = 'true';
    process.env.DISABLE_GIT_OPERATIONS = 'true';
    process.env.MOCK_CAMPAIGN_SYSTEM = 'true';
  }

  /**
   * Restore original environment after tests
   */
  restoreEnvironment(): void {
    // Restore original environment variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('CAMPAIGN_') || key.startsWith('DISABLE_') || key.startsWith('MOCK_')) {
        delete process.env[key];
      }
    });

    Object.entries(this.originalProcessEnv).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value;
      }
    });
  }

  /**
   * Cleanup and destroy singleton instance
   */
  static cleanup(): void {
    if (CampaignTestIsolationManager.instance) {
      CampaignTestIsolationManager.instance.restoreEnvironment();
      CampaignTestIsolationManager.instance = null;
    }
  }
}

// Export singleton instance for easy access
export const campaignTestIsolation = CampaignTestIsolationManager.getInstance();

// Classes are already exported at their declarations above
