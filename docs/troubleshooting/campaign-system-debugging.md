# 🚀 Campaign System Debugging Guide

This guide provides comprehensive troubleshooting for the automated Campaign System that handles TypeScript error reduction, code quality improvement, and systematic codebase optimization.

## 🎯 Campaign System Overview

### Campaign System Components
```typescript
interface CampaignSystemComponents {
  controller: 'CampaignController.ts';           // Main orchestration
  progressTracker: 'ProgressTracker.ts';        // Metrics and progress
  safetyProtocol: 'SafetyProtocol.ts';         // Safety and rollback
  intelligenceSystem: 'CampaignIntelligenceSystem.ts'; // Analytics
  validationFramework: 'ValidationFramework.ts'; // Success validation
}
```

### Quick Diagnostic Commands
```bash
# Campaign system health check
npm run campaign:health-check

# Check campaign status
npm run campaign:status

# View campaign logs
npm run campaign:logs

# Test campaign safety protocols
npm run campaign:test-safety

# Emergency campaign stop
npm run campaign:emergency-stop
```

## 🔍 Common Campaign Issues

### Campaign Won't Start

#### Issue: Campaign Fails to Initialize
**Symptoms:**
```
Campaign start command hangs
"Campaign initialization failed" error
No campaign process visible
```

**Debugging Steps:**
```bash
# 1. Check system prerequisites
node --version                    # Should be 20.18.0+
npm --version
git status                       # Should be clean working directory

# 2. Check campaign configuration
cat src/services/campaign/config.json

# 3. Test campaign controller
node -e "
const { CampaignController } = require('./src/services/campaign/CampaignController.ts');
console.log('Controller loaded successfully');
"

# 4. Check for conflicting processes
ps aux | grep campaign
ps aux | grep node | grep typescript
```

**Common Causes and Solutions:**
```typescript
// Issue: Node.js version incompatibility
// Solution: Upgrade to Node.js 20.18.0+
nvm install 20.18.0
nvm use 20.18.0

// Issue: Dirty git working directory
// Solution: Stash or commit changes
git stash
git status  // Should show "working tree clean"

// Issue: Campaign already running
// Solution: Stop existing campaign
npm run campaign:stop
killall node  // If necessary

// Issue: Missing dependencies
// Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Campaign Configuration Errors
**Symptoms:**
```
"Invalid campaign configuration" error
Campaign starts but immediately fails
Configuration validation errors
```

**Configuration Validation:**
```typescript
// Validate campaign configuration
function validateCampaignConfig() {
  const config = require('./src/services/campaign/config.json');
  
  // Required fields
  const requiredFields = [
    'errorThresholds',
    'safetyProtocols',
    'batchSizes',
    'timeouts',
    'rollbackStrategies'
  ];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate error thresholds
  if (config.errorThresholds.typescript < 0) {
    console.error('❌ Invalid TypeScript error threshold');
    return false;
  }
  
  // Validate batch sizes
  if (config.batchSizes.default < 1 || config.batchSizes.default > 50) {
    console.error('❌ Invalid batch size (should be 1-50)');
    return false;
  }
  
  console.log('✅ Campaign configuration is valid');
  return true;
}
```

**Correct Configuration Example:**
```json
{
  "errorThresholds": {
    "typescript": 100,
    "linting": 1000,
    "critical": 10
  },
  "safetyProtocols": {
    "buildValidation": true,
    "rollbackOnFailure": true,
    "maxRetries": 3,
    "corruptionDetection": true
  },
  "batchSizes": {
    "default": 15,
    "conservative": 5,
    "aggressive": 25
  },
  "timeouts": {
    "buildValidation": 30000,
    "scriptExecution": 60000,
    "rollback": 15000
  },
  "rollbackStrategies": {
    "primary": "git-stash",
    "secondary": "file-backup",
    "emergency": "full-reset"
  }
}
```

### Campaign Execution Issues

#### Issue: Campaign Stalls or Hangs
**Symptoms:**
```
Campaign progress stops updating
No error messages but no progress
Campaign process consuming high CPU
```

**Debugging Process:**
```bash
# 1. Check campaign process status
ps aux | grep campaign
top -p $(pgrep -f campaign)

# 2. Check campaign logs for last activity
tail -f logs/campaign-execution.log

# 3. Check for deadlocks
npm run campaign:debug-deadlock

# 4. Monitor system resources
npm run campaign:monitor-resources
```

**Deadlock Detection:**
```typescript
// Campaign deadlock detection
class CampaignDeadlockDetector {
  private lastProgressTime: number = Date.now();
  private progressThreshold: number = 5 * 60 * 1000; // 5 minutes
  
  checkForDeadlock(): boolean {
    const timeSinceProgress = Date.now() - this.lastProgressTime;
    
    if (timeSinceProgress > this.progressThreshold) {
      console.warn(`⚠️ Potential deadlock detected: No progress for ${timeSinceProgress / 1000}s`);
      return true;
    }
    
    return false;
  }
  
  updateProgress() {
    this.lastProgressTime = Date.now();
  }
  
  async resolveDeadlock() {
    console.log('🔧 Attempting to resolve campaign deadlock...');
    
    // 1. Try gentle intervention
    await this.sendProgressSignal();
    
    // 2. If still stuck, force restart current batch
    if (this.checkForDeadlock()) {
      await this.restartCurrentBatch();
    }
    
    // 3. If still stuck, emergency stop
    if (this.checkForDeadlock()) {
      await this.emergencyStop();
    }
  }
}
```

#### Issue: Campaign Safety Violations
**Symptoms:**
```
"Safety protocol violation" errors
Automatic rollbacks triggered
Build failures during campaign
```

**Safety Protocol Debugging:**
```typescript
// Debug safety protocol violations
class SafetyProtocolDebugger {
  async debugSafetyViolation(violationType: string) {
    console.log(`🔍 Debugging safety violation: ${violationType}`);
    
    switch (violationType) {
      case 'BUILD_FAILURE':
        await this.debugBuildFailure();
        break;
      case 'CORRUPTION_DETECTED':
        await this.debugCorruption();
        break;
      case 'PERFORMANCE_DEGRADATION':
        await this.debugPerformanceDegradation();
        break;
      case 'ERROR_INCREASE':
        await this.debugErrorIncrease();
        break;
    }
  }
  
  async debugBuildFailure() {
    console.log('Debugging build failure...');
    
    // Check build logs
    const buildLogs = await this.getBuildLogs();
    console.log('Build logs:', buildLogs);
    
    // Check for syntax errors
    const syntaxErrors = await this.checkSyntaxErrors();
    if (syntaxErrors.length > 0) {
      console.log('Syntax errors found:', syntaxErrors);
    }
    
    // Check for missing dependencies
    const missingDeps = await this.checkMissingDependencies();
    if (missingDeps.length > 0) {
      console.log('Missing dependencies:', missingDeps);
    }
  }
  
  async debugCorruption() {
    console.log('Debugging data corruption...');
    
    // Check file integrity
    const corruptedFiles = await this.checkFileIntegrity();
    if (corruptedFiles.length > 0) {
      console.log('Corrupted files detected:', corruptedFiles);
    }
    
    // Check git status
    const gitStatus = await this.checkGitStatus();
    console.log('Git status:', gitStatus);
    
    // Validate critical data files
    const dataValidation = await this.validateCriticalData();
    console.log('Data validation:', dataValidation);
  }
}
```

#### Issue: Campaign Performance Problems
**Symptoms:**
```
Campaign running very slowly
High memory usage during campaign
System becomes unresponsive
```

**Performance Optimization:**
```typescript
// Campaign performance monitoring
class CampaignPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  async monitorCampaignPerformance() {
    const interval = setInterval(async () => {
      const metrics = await this.collectMetrics();
      this.recordMetrics(metrics);
      
      // Check for performance issues
      if (metrics.memoryUsage > 500 * 1024 * 1024) { // 500MB
        console.warn('⚠️ High memory usage detected');
        await this.optimizeMemoryUsage();
      }
      
      if (metrics.cpuUsage > 80) {
        console.warn('⚠️ High CPU usage detected');
        await this.reduceCampaignIntensity();
      }
      
    }, 10000); // Check every 10 seconds
    
    return interval;
  }
  
  async optimizeMemoryUsage() {
    console.log('🔧 Optimizing memory usage...');
    
    // Reduce batch size
    await this.reduceBatchSize();
    
    // Clear caches
    await this.clearCaches();
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
  }
  
  async reduceCampaignIntensity() {
    console.log('🔧 Reducing campaign intensity...');
    
    // Increase delays between operations
    await this.increaseOperationDelays();
    
    // Reduce parallel processing
    await this.reduceParallelism();
    
    // Pause non-essential operations
    await this.pauseNonEssentialOperations();
  }
}
```

### Campaign Results Issues

#### Issue: Campaign Completes but Errors Remain
**Symptoms:**
```
Campaign reports success but TypeScript errors still high
Error count doesn't match expected reduction
Some files not processed
```

**Results Validation:**
```bash
# 1. Check actual error count
npm run type-check 2>&1 | grep -c "error TS"

# 2. Compare with campaign report
cat logs/campaign-final-report.json

# 3. Check for unprocessed files
npm run campaign:check-coverage

# 4. Validate specific error types
npm run type-check 2>&1 | grep "error TS" | cut -d':' -f4 | sort | uniq -c
```

**Error Count Validation:**
```typescript
// Validate campaign results
async function validateCampaignResults(campaignId: string) {
  console.log(`🔍 Validating campaign results for ${campaignId}...`);
  
  // Get campaign report
  const report = await getCampaignReport(campaignId);
  console.log('Campaign report:', report);
  
  // Get actual current error count
  const actualErrors = await getCurrentErrorCount();
  console.log('Actual error count:', actualErrors);
  
  // Compare with expected
  const expectedErrors = report.targetMetrics.typeScriptErrors;
  const discrepancy = Math.abs(actualErrors - expectedErrors);
  
  if (discrepancy > 10) {
    console.warn(`⚠️ Error count discrepancy: Expected ${expectedErrors}, Actual ${actualErrors}`);
    
    // Investigate discrepancy
    await investigateErrorDiscrepancy(expectedErrors, actualErrors);
  } else {
    console.log('✅ Error count matches expected results');
  }
  
  // Check for regression
  const initialErrors = report.initialMetrics.typeScriptErrors;
  const improvement = initialErrors - actualErrors;
  const expectedImprovement = initialErrors - expectedErrors;
  
  if (improvement < expectedImprovement * 0.8) {
    console.warn(`⚠️ Campaign underperformed: Expected ${expectedImprovement} reduction, got ${improvement}`);
  }
}

async function investigateErrorDiscrepancy(expected: number, actual: number) {
  console.log('🔍 Investigating error count discrepancy...');
  
  // Check for new errors introduced
  const errorBreakdown = await getErrorBreakdown();
  console.log('Current error breakdown:', errorBreakdown);
  
  // Check campaign coverage
  const coverage = await getCampaignCoverage();
  console.log('Campaign coverage:', coverage);
  
  // Check for files that weren't processed
  const unprocessedFiles = coverage.totalFiles - coverage.processedFiles;
  if (unprocessedFiles > 0) {
    console.log(`Found ${unprocessedFiles} unprocessed files`);
  }
  
  // Check for errors in excluded files
  const excludedFileErrors = await getExcludedFileErrors();
  if (excludedFileErrors > 0) {
    console.log(`Found ${excludedFileErrors} errors in excluded files`);
  }
}
```

#### Issue: Campaign Rollback Problems
**Symptoms:**
```
Rollback fails to restore previous state
"Rollback incomplete" warnings
System in inconsistent state after rollback
```

**Rollback Debugging:**
```bash
# 1. Check rollback logs
cat logs/campaign-rollback.log

# 2. Check git stash status
git stash list
git stash show -p stash@{0}

# 3. Verify file restoration
npm run campaign:verify-rollback

# 4. Check for partial rollbacks
npm run campaign:check-rollback-completeness
```

**Rollback Validation:**
```typescript
// Validate rollback completeness
async function validateRollback(rollbackId: string) {
  console.log(`🔍 Validating rollback ${rollbackId}...`);
  
  // Check git status
  const gitStatus = await execAsync('git status --porcelain');
  if (gitStatus.trim()) {
    console.warn('⚠️ Working directory not clean after rollback');
    console.log('Uncommitted changes:', gitStatus);
  }
  
  // Check error count restoration
  const currentErrors = await getCurrentErrorCount();
  const preRollbackErrors = await getPreRollbackErrorCount(rollbackId);
  
  if (Math.abs(currentErrors - preRollbackErrors) > 5) {
    console.warn(`⚠️ Error count not properly restored: Expected ${preRollbackErrors}, got ${currentErrors}`);
  } else {
    console.log('✅ Error count properly restored');
  }
  
  // Check file integrity
  const integrityCheck = await checkFileIntegrity();
  if (!integrityCheck.passed) {
    console.warn('⚠️ File integrity check failed after rollback');
    console.log('Integrity issues:', integrityCheck.issues);
  }
  
  // Check build status
  const buildResult = await testBuild();
  if (!buildResult.success) {
    console.warn('⚠️ Build fails after rollback');
    console.log('Build errors:', buildResult.errors);
  } else {
    console.log('✅ Build successful after rollback');
  }
}
```

## 🛡️ Campaign Safety Protocol Debugging

### Safety Protocol Failures

#### Issue: Build Validation Failures
**Symptoms:**
```
Campaign stops with "Build validation failed"
TypeScript compilation errors during campaign
Build succeeds manually but fails in campaign
```

**Build Validation Debugging:**
```typescript
// Debug build validation issues
class BuildValidationDebugger {
  async debugBuildValidation() {
    console.log('🔍 Debugging build validation...');
    
    // Test manual build
    const manualBuild = await this.testManualBuild();
    console.log('Manual build result:', manualBuild);
    
    // Test campaign build environment
    const campaignBuild = await this.testCampaignBuild();
    console.log('Campaign build result:', campaignBuild);
    
    // Compare environments
    await this.compareEnvironments();
    
    // Check for timing issues
    await this.checkBuildTiming();
  }
  
  async testManualBuild() {
    try {
      const result = await execAsync('npm run build');
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async testCampaignBuild() {
    // Simulate campaign build environment
    const env = {
      ...process.env,
      NODE_ENV: 'campaign',
      CAMPAIGN_MODE: 'true'
    };
    
    try {
      const result = await execAsync('npm run build', { env });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async compareEnvironments() {
    console.log('Comparing build environments...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log('Node.js version:', nodeVersion);
    
    // Check npm version
    const npmVersion = await execAsync('npm --version');
    console.log('npm version:', npmVersion.trim());
    
    // Check TypeScript version
    const tsVersion = await execAsync('npx tsc --version');
    console.log('TypeScript version:', tsVersion.trim());
    
    // Check environment variables
    const relevantEnvVars = [
      'NODE_ENV',
      'CAMPAIGN_MODE',
      'CI',
      'BUILD_MODE'
    ];
    
    for (const envVar of relevantEnvVars) {
      console.log(`${envVar}:`, process.env[envVar] || 'undefined');
    }
  }
}
```

#### Issue: Corruption Detection False Positives
**Symptoms:**
```
Campaign stops with "Corruption detected"
Files appear normal but corruption check fails
Frequent false positive corruption alerts
```

**Corruption Detection Debugging:**
```typescript
// Debug corruption detection
class CorruptionDetectionDebugger {
  async debugCorruptionDetection() {
    console.log('🔍 Debugging corruption detection...');
    
    // Check file checksums
    await this.checkFileChecksums();
    
    // Validate file syntax
    await this.validateFileSyntax();
    
    // Check for encoding issues
    await this.checkFileEncoding();
    
    // Test corruption detection sensitivity
    await this.testDetectionSensitivity();
  }
  
  async checkFileChecksums() {
    console.log('Checking file checksums...');
    
    const criticalFiles = [
      'src/utils/reliableAstronomy.ts',
      'src/constants/elementalProperties.ts',
      'src/data/planets/mars.ts'
    ];
    
    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const checksum = crypto.createHash('md5').update(content).digest('hex');
        console.log(`${file}: ${checksum}`);
        
        // Check for suspicious patterns
        if (content.includes('\0') || content.includes('\uFFFD')) {
          console.warn(`⚠️ Suspicious characters in ${file}`);
        }
      } else {
        console.warn(`⚠️ Critical file missing: ${file}`);
      }
    }
  }
  
  async validateFileSyntax() {
    console.log('Validating file syntax...');
    
    // Check TypeScript files
    try {
      const result = await execAsync('npx tsc --noEmit --skipLibCheck');
      console.log('✅ TypeScript syntax validation passed');
    } catch (error) {
      console.warn('⚠️ TypeScript syntax errors found');
      console.log(error.message);
    }
    
    // Check JSON files
    const jsonFiles = ['package.json', 'tsconfig.json', '.kiro/settings/mcp.json'];
    
    for (const file of jsonFiles) {
      if (fs.existsSync(file)) {
        try {
          JSON.parse(fs.readFileSync(file, 'utf8'));
          console.log(`✅ ${file} is valid JSON`);
        } catch (error) {
          console.warn(`⚠️ ${file} has invalid JSON:`, error.message);
        }
      }
    }
  }
}
```

## 📊 Campaign Monitoring and Metrics

### Metrics Collection Issues

#### Issue: Progress Tracking Not Working
**Symptoms:**
```
Campaign progress shows 0% throughout
Metrics not updating in real-time
Progress reports empty or incorrect
```

**Progress Tracking Debugging:**
```typescript
// Debug progress tracking
class ProgressTrackingDebugger {
  async debugProgressTracking() {
    console.log('🔍 Debugging progress tracking...');
    
    // Test metrics collection
    await this.testMetricsCollection();
    
    // Check progress calculation
    await this.testProgressCalculation();
    
    // Validate progress persistence
    await this.testProgressPersistence();
    
    // Check real-time updates
    await this.testRealTimeUpdates();
  }
  
  async testMetricsCollection() {
    console.log('Testing metrics collection...');
    
    const progressTracker = new ProgressTracker();
    
    // Test error count collection
    const errorCount = await progressTracker.getTypeScriptErrorCount();
    console.log('Current error count:', errorCount);
    
    if (errorCount === -1) {
      console.warn('⚠️ Error count collection failed');
      await this.debugErrorCountCollection();
    }
    
    // Test other metrics
    const metrics = await progressTracker.getAllMetrics();
    console.log('All metrics:', metrics);
  }
  
  async debugErrorCountCollection() {
    console.log('Debugging error count collection...');
    
    // Test TypeScript command directly
    try {
      const result = await execAsync('npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"');
      console.log('Direct error count:', result.trim());
    } catch (error) {
      console.log('Error count command failed:', error.message);
      
      // Try alternative method
      try {
        const result = await execAsync('npx tsc --noEmit --skipLibCheck');
        console.log('No TypeScript errors found');
      } catch (tsError) {
        const errorLines = tsError.message.split('\n').filter(line => line.includes('error TS'));
        console.log('Error count (alternative method):', errorLines.length);
      }
    }
  }
}
```

### Campaign Intelligence Issues

#### Issue: Intelligence System Not Providing Insights
**Symptoms:**
```
Campaign intelligence reports empty
No predictive analytics or recommendations
Intelligence system errors in logs
```

**Intelligence System Debugging:**
```typescript
// Debug campaign intelligence system
class CampaignIntelligenceDebugger {
  async debugIntelligenceSystem() {
    console.log('🔍 Debugging campaign intelligence system...');
    
    // Test data collection
    await this.testDataCollection();
    
    // Test pattern recognition
    await this.testPatternRecognition();
    
    // Test predictive analytics
    await this.testPredictiveAnalytics();
    
    // Test recommendation generation
    await this.testRecommendationGeneration();
  }
  
  async testDataCollection() {
    console.log('Testing intelligence data collection...');
    
    const intelligence = new CampaignIntelligenceSystem();
    
    // Test historical data collection
    const historicalData = await intelligence.collectHistoricalData();
    console.log('Historical data points:', historicalData.length);
    
    if (historicalData.length === 0) {
      console.warn('⚠️ No historical data available');
      await this.initializeHistoricalData();
    }
    
    // Test real-time data collection
    const realtimeData = await intelligence.collectRealtimeData();
    console.log('Real-time data:', realtimeData);
  }
  
  async testPatternRecognition() {
    console.log('Testing pattern recognition...');
    
    const intelligence = new CampaignIntelligenceSystem();
    
    // Test error pattern recognition
    const errorPatterns = await intelligence.recognizeErrorPatterns();
    console.log('Recognized error patterns:', errorPatterns);
    
    // Test performance patterns
    const performancePatterns = await intelligence.recognizePerformancePatterns();
    console.log('Performance patterns:', performancePatterns);
    
    // Test success patterns
    const successPatterns = await intelligence.recognizeSuccessPatterns();
    console.log('Success patterns:', successPatterns);
  }
}
```

## 🔧 Campaign System Maintenance

### Regular Maintenance Tasks

#### Daily Maintenance
```bash
#!/bin/bash
# daily-campaign-maintenance.sh

echo "🔧 Daily Campaign System Maintenance"

# 1. Check campaign system health
npm run campaign:health-check

# 2. Clean up old logs
find logs/ -name "campaign-*.log" -mtime +7 -delete

# 3. Validate campaign configuration
npm run campaign:validate-config

# 4. Check for stuck campaigns
npm run campaign:check-stuck

# 5. Update campaign metrics
npm run campaign:update-metrics

echo "✅ Daily maintenance completed"
```

#### Weekly Maintenance
```bash
#!/bin/bash
# weekly-campaign-maintenance.sh

echo "🔧 Weekly Campaign System Maintenance"

# 1. Archive old campaign data
npm run campaign:archive-old-data

# 2. Update campaign intelligence models
npm run campaign:update-intelligence

# 3. Validate safety protocols
npm run campaign:test-safety-protocols

# 4. Performance optimization
npm run campaign:optimize-performance

# 5. Generate maintenance report
npm run campaign:generate-maintenance-report

echo "✅ Weekly maintenance completed"
```

### Campaign System Recovery

#### Emergency Recovery Procedures
```bash
#!/bin/bash
# emergency-campaign-recovery.sh

echo "🚨 Emergency Campaign System Recovery"

# 1. Stop all running campaigns
npm run campaign:emergency-stop-all

# 2. Check system integrity
npm run campaign:check-integrity

# 3. Restore from backup if needed
if [ "$1" = "--restore-backup" ]; then
    npm run campaign:restore-backup
fi

# 4. Reset campaign system
npm run campaign:reset-system

# 5. Validate recovery
npm run campaign:validate-recovery

echo "✅ Emergency recovery completed"
```

---

**Remember**: The Campaign System is complex but well-instrumented. Most issues can be diagnosed through logs and metrics. When in doubt, use the emergency stop procedures and validate system integrity before restarting campaigns. 🚀