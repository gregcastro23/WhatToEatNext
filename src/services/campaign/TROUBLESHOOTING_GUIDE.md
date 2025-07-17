# Perfect Codebase Campaign - Troubleshooting Guide

## Emergency Recovery Procedures

### 🚨 Critical Failure Recovery

#### Immediate Response Protocol

When critical failures occur during campaign execution:

```bash
# STEP 1: STOP ALL PROCESSES
pkill -f "node.*campaign"
pkill -f "yarn.*"

# STEP 2: ASSESS DAMAGE
echo "=== EMERGENCY ASSESSMENT ===" > emergency-report.txt
echo "Timestamp: $(date)" >> emergency-report.txt
echo "Git Status:" >> emergency-report.txt
git status >> emergency-report.txt
echo "Build Status:" >> emergency-report.txt
yarn build >> emergency-report.txt 2>&1
echo "Test Status:" >> emergency-report.txt
yarn test --run >> emergency-report.txt 2>&1

# STEP 3: CREATE EMERGENCY BACKUP
git stash push -m "EMERGENCY_BACKUP_$(date +%Y%m%d_%H%M%S)"

# STEP 4: RESTORE TO LAST KNOWN GOOD STATE
git stash list | grep CAMPAIGN_CHECKPOINT | head -1
# Apply the most recent checkpoint stash
```

#### Nuclear Recovery Option

If all else fails, complete project reset:

```bash
# WARNING: This will lose all uncommitted changes
git reset --hard HEAD~1
git clean -fd
rm -rf node_modules/
rm -rf .next/
yarn install
yarn build
yarn test --run
```

### 🔧 Common Issues and Solutions

#### Issue 1: TypeScript Compilation Explosion

**Symptoms**: 
- Error count increases dramatically (>100 new errors)
- Build fails completely
- IDE shows red squiggles everywhere

**Root Causes**:
- Import/export corruption
- Type definition corruption
- Circular dependency introduction

**Solution Protocol**:

```bash
# 1. Immediate rollback
git stash apply stash@{LAST_TYPESCRIPT_CHECKPOINT}

# 2. Validate rollback success
yarn tsc --noEmit --skipLibCheck

# 3. Identify corruption patterns
node src/services/campaign/TypeScriptErrorAnalyzer.ts --corruption-analysis

# 4. Re-execute with ultra-conservative settings
cat > .campaign-config/emergency-safety.json << 'EOF'
{
  "maxFilesPerBatch": 3,
  "buildValidationFrequency": 1,
  "testValidationFrequency": 1,
  "corruptionDetectionEnabled": true,
  "automaticRollbackEnabled": true,
  "emergencyMode": true
}
EOF

# 5. Re-execute with emergency settings
node src/services/campaign/test-enhanced-fixer-integration.js --emergency-mode
```

#### Issue 2: Build Performance Catastrophic Degradation

**Symptoms**:
- Build time >60 seconds (was <10 seconds)
- Memory usage >500MB (was <50MB)
- System becomes unresponsive

**Root Causes**:
- Circular dependency loops
- Memory leaks in generated code
- Cache corruption

**Solution Protocol**:

```bash
# 1. Kill all processes
pkill -f "node"
pkill -f "yarn"

# 2. Clear all caches
rm -rf .next/cache/
rm -rf node_modules/.cache/
yarn cache clean

# 3. Rollback to performance checkpoint
git stash apply stash@{PERFORMANCE_CHECKPOINT}

# 4. Validate performance restoration
time yarn build  # Should be <10 seconds

# 5. If still slow, nuclear cache reset
rm -rf node_modules/
yarn install
```

#### Issue 3: Linting Warning Explosion

**Symptoms**:
- Warning count increases instead of decreases
- New warning categories appear
- ESLint crashes or hangs

**Root Causes**:
- ESLint configuration corruption
- New code patterns introduced
- Rule conflicts

**Solution Protocol**:

```bash
# 1. Rollback to linting checkpoint
git stash apply stash@{LINTING_CHECKPOINT}

# 2. Validate ESLint configuration
yarn lint --print-config src/index.ts

# 3. Check for new warning patterns
yarn lint --format=json > current-warnings.json
diff baseline-warnings.json current-warnings.json

# 4. Re-execute with conservative approach
node src/services/campaign/test-console-removal.js --dry-run --conservative
```

#### Issue 4: Git Stash Corruption

**Symptoms**:
- Cannot create new stashes
- Cannot apply existing stashes
- Git operations fail

**Root Causes**:
- Git repository corruption
- Disk space exhaustion
- File permission issues

**Solution Protocol**:

```bash
# 1. Check git repository health
git fsck --full

# 2. Check disk space
df -h .

# 3. Check file permissions
ls -la .git/

# 4. If corruption detected, repair
git gc --prune=now
git repack -ad

# 5. If still failing, backup and re-clone
cp -r . ../project-backup/
cd ..
git clone <repository-url> project-fresh
cd project-fresh
# Manually restore campaign progress
```

### 🛠️ Advanced Troubleshooting

#### Memory Leak Detection

```bash
# Monitor memory usage during campaign
cat > monitor-memory.sh << 'EOF'
#!/bin/bash
while true; do
    echo "$(date): Memory usage:"
    ps aux | grep node | grep -v grep | awk '{print $2, $4, $11}' | sort -k2 -nr | head -5
    echo "---"
    sleep 30
done
EOF

chmod +x monitor-memory.sh
./monitor-memory.sh &
MONITOR_PID=$!

# Run campaign
node src/services/campaign/CampaignController.ts

# Stop monitoring
kill $MONITOR_PID
```

#### Corruption Pattern Detection

```bash
# Create corruption detection script
cat > detect-corruption.sh << 'EOF'
#!/bin/bash
echo "=== CORRUPTION DETECTION ==="

# Check for import/export corruption
echo "Import/Export Issues:"
grep -r "import.*from.*undefined" src/ || echo "None found"
grep -r "export.*undefined" src/ || echo "None found"

# Check for syntax corruption
echo "Syntax Issues:"
find src/ -name "*.ts" -o -name "*.tsx" | xargs -I {} sh -c 'node -c {} 2>&1 | grep -v "SyntaxError: Unexpected token" || echo "Syntax error in {}"'

# Check for circular dependencies
echo "Circular Dependencies:"
npx madge --circular src/ || echo "None found"

# Check for type corruption
echo "Type Issues:"
yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "(TS2304|TS2339|TS2345)" | head -10

echo "=== DETECTION COMPLETE ==="
EOF

chmod +x detect-corruption.sh
./detect-corruption.sh
```

#### Performance Regression Analysis

```bash
# Create performance analysis script
cat > analyze-performance.sh << 'EOF'
#!/bin/bash
echo "=== PERFORMANCE ANALYSIS ==="

# Measure build time components
echo "Build Time Analysis:"
time yarn build 2>&1 | tee build-time.log

# Analyze bundle size
echo "Bundle Size Analysis:"
du -sh .next/ 2>/dev/null || echo "No .next directory"

# Check cache effectiveness
echo "Cache Analysis:"
ls -la .next/cache/ 2>/dev/null | wc -l || echo "No cache directory"

# Memory usage during build
echo "Memory Usage Analysis:"
/usr/bin/time -v yarn build 2>&1 | grep -E "(Maximum resident set size|User time|System time)"

echo "=== ANALYSIS COMPLETE ==="
EOF

chmod +x analyze-performance.sh
./analyze-performance.sh
```

### 🔍 Diagnostic Tools

#### Campaign Health Check

```bash
# Create comprehensive health check
cat > campaign-health-check.sh << 'EOF'
#!/bin/bash
echo "=== CAMPAIGN HEALTH CHECK ==="
echo "Timestamp: $(date)"
echo

# 1. Git Health
echo "1. Git Repository Health:"
git status --porcelain | wc -l | xargs echo "Uncommitted files:"
git stash list | grep CAMPAIGN | wc -l | xargs echo "Campaign stashes:"
echo

# 2. Build Health
echo "2. Build Health:"
yarn build >/dev/null 2>&1 && echo "✅ Build: PASS" || echo "❌ Build: FAIL"
echo

# 3. Test Health
echo "3. Test Health:"
yarn test --run --silent >/dev/null 2>&1 && echo "✅ Tests: PASS" || echo "❌ Tests: FAIL"
echo

# 4. TypeScript Health
echo "4. TypeScript Health:"
ERROR_COUNT=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS")
echo "TypeScript errors: $ERROR_COUNT"
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "✅ TypeScript: PASS"
else
    echo "❌ TypeScript: FAIL"
fi
echo

# 5. Linting Health
echo "5. Linting Health:"
WARNING_COUNT=$(yarn lint 2>&1 | grep -c "warning")
echo "Linting warnings: $WARNING_COUNT"
if [ "$WARNING_COUNT" -eq 0 ]; then
    echo "✅ Linting: PASS"
else
    echo "❌ Linting: FAIL"
fi
echo

# 6. Performance Health
echo "6. Performance Health:"
BUILD_TIME=$(time yarn build 2>&1 | grep real | awk '{print $2}')
echo "Build time: $BUILD_TIME"
echo

# 7. Campaign Infrastructure Health
echo "7. Campaign Infrastructure Health:"
ls -la src/services/campaign/CampaignController.ts >/dev/null 2>&1 && echo "✅ Controller: EXISTS" || echo "❌ Controller: MISSING"
ls -la src/services/campaign/SafetyProtocol.ts >/dev/null 2>&1 && echo "✅ Safety: EXISTS" || echo "❌ Safety: MISSING"
ls -la src/services/campaign/ProgressTracker.ts >/dev/null 2>&1 && echo "✅ Tracker: EXISTS" || echo "❌ Tracker: MISSING"

echo "=== HEALTH CHECK COMPLETE ==="
EOF

chmod +x campaign-health-check.sh
./campaign-health-check.sh
```

#### Error Pattern Analysis

```bash
# Create error pattern analyzer
node -e "
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== ERROR PATTERN ANALYSIS ===');

try {
    // Get TypeScript errors
    const tsErrors = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
    const errorLines = tsErrors.split('\n').filter(line => line.includes('error TS'));
    
    // Categorize errors
    const errorCategories = {};
    errorLines.forEach(line => {
        const match = line.match(/error (TS\d+):/);
        if (match) {
            const errorCode = match[1];
            errorCategories[errorCode] = (errorCategories[errorCode] || 0) + 1;
        }
    });
    
    console.log('Error Distribution:');
    Object.entries(errorCategories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([code, count]) => {
            console.log(\`  \${code}: \${count} errors\`);
        });
    
    // Get most problematic files
    const fileErrors = {};
    errorLines.forEach(line => {
        const match = line.match(/^([^(]+)\(/);
        if (match) {
            const file = match[1];
            fileErrors[file] = (fileErrors[file] || 0) + 1;
        }
    });
    
    console.log('\nMost Problematic Files:');
    Object.entries(fileErrors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([file, count]) => {
            console.log(\`  \${file}: \${count} errors\`);
        });
        
} catch (error) {
    console.log('No TypeScript errors found or analysis failed');
}

console.log('=== ANALYSIS COMPLETE ===');
"
```

### 📋 Recovery Checklists

#### Pre-Recovery Checklist

Before attempting any recovery:

- [ ] Stop all running campaign processes
- [ ] Create emergency backup stash
- [ ] Document current error state
- [ ] Verify disk space availability
- [ ] Check git repository health
- [ ] Identify last known good checkpoint

#### Post-Recovery Validation

After recovery operations:

- [ ] Verify build succeeds
- [ ] Verify tests pass
- [ ] Check TypeScript error count
- [ ] Check linting warning count
- [ ] Validate performance metrics
- [ ] Test campaign infrastructure
- [ ] Create new safety checkpoint

#### Emergency Contact Protocol

If recovery fails completely:

1. **Document Everything**:
   ```bash
   # Create comprehensive failure report
   cat > EMERGENCY_REPORT_$(date +%Y%m%d_%H%M%S).txt << 'EOF'
   EMERGENCY FAILURE REPORT
   ========================
   Timestamp: $(date)
   Git Status: $(git status --porcelain)
   Last Commit: $(git log -1 --oneline)
   Available Stashes: $(git stash list | grep CAMPAIGN)
   Error Count: $(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS")
   Warning Count: $(yarn lint 2>&1 | grep -c "warning")
   Build Status: $(yarn build >/dev/null 2>&1 && echo "PASS" || echo "FAIL")
   Test Status: $(yarn test --run --silent >/dev/null 2>&1 && echo "PASS" || echo "FAIL")
   EOF
   ```

2. **Preserve Evidence**:
   ```bash
   # Create evidence archive
   mkdir -p emergency-evidence/
   cp -r .git/refs/ emergency-evidence/
   cp -r .campaign-config/ emergency-evidence/ 2>/dev/null || true
   cp -r .campaign-progress/ emergency-evidence/ 2>/dev/null || true
   git stash list > emergency-evidence/stash-list.txt
   git log --oneline -20 > emergency-evidence/recent-commits.txt
   ```

3. **Seek Expert Help**:
   - Contact senior developer
   - Provide emergency report and evidence
   - Do not attempt further recovery without guidance

### 🎯 Prevention Strategies

#### Proactive Monitoring

Set up continuous monitoring to prevent issues:

```bash
# Create monitoring daemon
cat > campaign-monitor.sh << 'EOF'
#!/bin/bash
LOGFILE="campaign-monitor.log"
ALERT_THRESHOLD_ERRORS=50
ALERT_THRESHOLD_WARNINGS=100

while true; do
    TIMESTAMP=$(date)
    ERROR_COUNT=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS")
    WARNING_COUNT=$(yarn lint 2>&1 | grep -c "warning")
    
    echo "$TIMESTAMP - Errors: $ERROR_COUNT, Warnings: $WARNING_COUNT" >> $LOGFILE
    
    if [ "$ERROR_COUNT" -gt "$ALERT_THRESHOLD_ERRORS" ]; then
        echo "ALERT: Error count exceeded threshold ($ERROR_COUNT > $ALERT_THRESHOLD_ERRORS)" >> $LOGFILE
        # Could send notification here
    fi
    
    if [ "$WARNING_COUNT" -gt "$ALERT_THRESHOLD_WARNINGS" ]; then
        echo "ALERT: Warning count exceeded threshold ($WARNING_COUNT > $ALERT_THRESHOLD_WARNINGS)" >> $LOGFILE
        # Could send notification here
    fi
    
    sleep 300  # Check every 5 minutes
done
EOF

chmod +x campaign-monitor.sh
# Run in background: ./campaign-monitor.sh &
```

#### Automated Safety Checkpoints

```bash
# Create automated checkpoint system
cat > auto-checkpoint.sh << 'EOF'
#!/bin/bash
CHECKPOINT_INTERVAL=1800  # 30 minutes

while true; do
    sleep $CHECKPOINT_INTERVAL
    
    # Only create checkpoint if system is healthy
    if yarn build >/dev/null 2>&1 && yarn test --run --silent >/dev/null 2>&1; then
        CHECKPOINT_NAME="AUTO_CHECKPOINT_$(date +%Y%m%d_%H%M%S)"
        git stash push -m "$CHECKPOINT_NAME"
        echo "$(date): Created automatic checkpoint: $CHECKPOINT_NAME" >> auto-checkpoint.log
    else
        echo "$(date): Skipped checkpoint due to build/test failures" >> auto-checkpoint.log
    fi
done
EOF

chmod +x auto-checkpoint.sh
# Run in background: ./auto-checkpoint.sh &
```

## Conclusion

This troubleshooting guide provides comprehensive recovery procedures for all known failure scenarios in the Perfect Codebase Campaign. Remember:

1. **Safety First**: Always create backups before attempting recovery
2. **Document Everything**: Keep detailed logs of failures and recovery attempts
3. **Start Conservative**: Use the least invasive recovery method first
4. **Validate Thoroughly**: Always verify recovery success before proceeding
5. **Learn and Improve**: Update procedures based on new failure patterns

**Emergency Mantra**: "Stop, Backup, Assess, Recover, Validate"

---

*Last updated: January 15, 2025*  
*Version: 1.0.0*  
*Status: ✅ TROUBLESHOOTING GUIDE COMPLETE*