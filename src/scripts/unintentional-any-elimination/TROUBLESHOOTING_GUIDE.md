# Unintentional Any Elimination System - Troubleshooting Guide

## Quick Reference

### Emergency Commands
```bash
# Stop all campaigns immediately
pkill -f "unintentional-any"

# Check current system status
node src/scripts/quality-gates/QualityGatesSystem.ts metrics

# Emergency rollback
git stash pop  # If using git stash safety
# OR
cp -r .any-elimination-backups-$(date +%Y%m%d)/* ./

# Verify system integrity
yarn tsc --noEmit --skipLibCheck && yarn build
```

### System Health Check
```bash
# Complete system health check
./scripts/system-health-check.sh

# Quick status check
yarn lint --format=compact 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | wc -l
```

## Common Issues and Solutions

### Issue 1: Campaign Execution Failures

#### Symptom: TypeScript Compilation Errors During Campaign
```
Error: Command failed: yarn tsc --noEmit --skipLibCheck
src/components/Example.tsx(15,7): error TS2322: Type 'unknown' is not assignable to type 'string'.
```

**Root Cause**: Replacement created type incompatibility

**Diagnosis Steps**:
```bash
# 1. Check specific error details
yarn tsc --noEmit --skipLibCheck 2>&1 | head -20

# 2. Identify problematic files
yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | cut -d'(' -f1 | sort -u

# 3. Check recent campaign changes
git diff HEAD~1 --name-only | grep -E "\.(ts|tsx)$"
```

**Solutions**:

**Solution A: Immediate Rollback**
```bash
# 1. Stop campaign
pkill -f "unintentional-any"

# 2. Rollback changes
git stash pop  # If using git stash
# OR restore from backup
cp ".any-elimination-backups-$(date +%Y%m%d)/src/components/Example.tsx" "src/components/Example.tsx"

# 3. Verify fix
yarn tsc --noEmit --skipLibCheck
```

**Solution B: Selective Fix**
```bash
# 1. Identify the specific line causing issues
grep -n "unknown" src/components/Example.tsx

# 2. Manually fix the type issue
# Change: const value: unknown = getData();
# To:     const value: string = getData() as string;
# OR:     const value = getData() as string;

# 3. Verify fix
yarn tsc --noEmit --skipLibCheck
```

**Solution C: Add to Exemption List**
```javascript
// In campaign configuration
const exemptFiles = [
  'src/components/Example.tsx',  // Add problematic file
  // ... other exempt files
];
```

#### Symptom: Build Failures After Campaign
```
Error: Build failed with exit code 1
Module not found: Can't resolve './utils' in '/src/components'
```

**Root Cause**: Import/export issues or circular dependencies

**Diagnosis Steps**:
```bash
# 1. Check build output
yarn build 2>&1 | head -30

# 2. Check for circular dependencies
npx madge --circular --extensions ts,tsx src/

# 3. Verify import/export integrity
grep -r "export.*any" src/ | head -10
```

**Solutions**:

**Solution A: Fix Import Issues**
```bash
# 1. Check for missing imports
grep -r "import.*any" src/ | grep -v "eslint-disable"

# 2. Fix import paths
# Ensure all imports are properly typed and paths are correct
```

**Solution B: Resolve Circular Dependencies**
```bash
# 1. Identify circular dependencies
npx madge --circular --extensions ts,tsx src/

# 2. Refactor to break cycles
# Move shared types to separate files
# Use dependency injection patterns
```

### Issue 2: False Positive Classifications

#### Symptom: Intentional Any Types Being Replaced
```
Warning: Replacing intentional any type in API response handler
File: src/services/ApiService.ts:42
```

**Root Cause**: Classification algorithm incorrectly identified intentional any as unintentional

**Diagnosis Steps**:
```bash
# 1. Check the specific file and line
grep -n -B2 -A2 "any" src/services/ApiService.ts

# 2. Look for existing documentation
grep -B5 -A5 "eslint-disable.*no-explicit-any" src/services/ApiService.ts

# 3. Check classification logic
node src/scripts/unintentional-any-elimination/comprehensive-campaign.cjs --analyze-only --file=src/services/ApiService.ts
```

**Solutions**:

**Solution A: Add Proper Documentation**
```typescript
// BEFORE (gets replaced incorrectly)
const apiResponse: any = await fetch('/api/data');

// AFTER (properly documented)
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API response structure
const apiResponse: any = await fetch('/api/data');
```

**Solution B: Update Classification Rules**
```javascript
// Add to classification exemptions
const intentionalPatterns = [
  /api.*response/i,
  /external.*data/i,
  /legacy.*system/i,
  // Add new pattern based on false positive
];
```

**Solution C: File-Level Exemption**
```javascript
// Add to campaign configuration
const exemptFiles = [
  'src/services/ApiService.ts',  // Exempt entire file
  'src/services/**/api*.ts',     // Pattern-based exemption
];
```

#### Symptom: Test Files Being Modified Incorrectly
```
Error: Test utilities broken after any type replacement
File: src/__tests__/utils/mockHelpers.ts
```

**Root Cause**: Test utilities require flexible typing that was incorrectly replaced

**Solutions**:

**Solution A: Restore Test File**
```bash
# 1. Restore from backup
cp ".any-elimination-backups-$(date +%Y%m%d)/src/__tests__/utils/mockHelpers.ts" "src/__tests__/utils/mockHelpers.ts"

# 2. Add to permanent exemption
# Update campaign configuration to exclude test files
```

**Solution B: Update Test Exemption Patterns**
```javascript
const testExemptionPatterns = [
  'src/__tests__/**/*',
  'src/**/*.test.ts',
  'src/**/*.spec.ts',
  'src/**/test-utils/**/*',
  'src/**/mocks/**/*',
  'src/**/__mocks__/**/*'
];
```

### Issue 3: Performance Degradation

#### Symptom: Slow Build Times After Campaign
```
Build time increased from 15s to 45s after any elimination campaign
```

**Root Cause**: Complex type inference or circular dependencies introduced

**Diagnosis Steps**:
```bash
# 1. Measure build time with diagnostics
time yarn build
yarn tsc --noEmit --skipLibCheck --diagnostics

# 2. Check for complex type operations
grep -r "unknown.*unknown" src/ | head -10

# 3. Analyze bundle size
du -sh .next/
```

**Solutions**:

**Solution A: Optimize Type Complexity**
```typescript
// BEFORE (complex type inference)
const data: Record<string, unknown> = processComplexData(input as unknown);

// AFTER (simplified)
const data = processComplexData(input) as Record<string, unknown>;
```

**Solution B: Add Type Hints**
```typescript
// Add explicit type annotations to help TypeScript
interface ProcessedData {
  [key: string]: unknown;
}

const data: ProcessedData = processComplexData(input);
```

**Solution C: Revert Problematic Changes**
```bash
# 1. Identify files with performance impact
git diff HEAD~1 --name-only | xargs -I {} sh -c 'echo "File: {}"; wc -l {}'

# 2. Selectively revert complex files
git checkout HEAD~1 -- src/complex/problematic-file.ts

# 3. Re-run campaign with exclusions
```

#### Symptom: Memory Usage Increase
```
Node.js heap out of memory during TypeScript compilation
```

**Solutions**:

**Solution A: Increase Memory Limit**
```bash
# Temporary fix
NODE_OPTIONS="--max-old-space-size=4096" yarn build

# Permanent fix in package.json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```

**Solution B: Optimize TypeScript Configuration**
```json
// tsconfig.json optimizations
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  }
}
```

### Issue 4: Regression Detection

#### Symptom: Any Type Count Increasing Over Time
```
Warning: Any type count increased from 275 to 285 over the past week
```

**Root Cause**: New code introducing unintentional any types

**Diagnosis Steps**:
```bash
# 1. Check recent commits
git log --oneline --since="1 week ago" | head -10

# 2. Find files with new any types
git log --since="1 week ago" --name-only --pretty=format: | sort -u | xargs grep -l "any" | head -10

# 3. Identify specific additions
git log --since="1 week ago" -p | grep -A5 -B5 "any"
```

**Solutions**:

**Solution A: Immediate Cleanup**
```bash
# 1. Run targeted campaign on recent files
node src/scripts/unintentional-any-elimination/execute-full-campaign.cjs --recent-files-only

# 2. Focus on specific problematic files
node src/scripts/unintentional-any-elimination/direct-file-campaign.cjs --file=src/new/problematic.ts
```

**Solution B: Strengthen Prevention**
```bash
# 1. Update pre-commit hook configuration
# Reduce maxNewAnyTypes threshold
# Add stricter validation

# 2. Enable automatic documentation generation
node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts generate

# 3. Add developer education
node src/scripts/quality-gates/QualityGatesSystem.ts education
```

**Solution C: Process Improvement**
```bash
# 1. Add to CI/CD pipeline
# Fail builds if any type count increases beyond threshold

# 2. Add code review checklist item
# "Check for new any types and ensure proper documentation"

# 3. Schedule regular cleanup
# Weekly automated campaigns for maintenance
```

### Issue 5: Documentation Coverage Issues

#### Symptom: Low Documentation Coverage Warning
```
Warning: Documentation coverage 65% below 80% requirement
45 undocumented any types found
```

**Diagnosis Steps**:
```bash
# 1. Generate documentation report
node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts report

# 2. Find undocumented any types
node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts scan

# 3. Check specific files
grep -r "any" src/ | grep -v "eslint-disable" | head -20
```

**Solutions**:

**Solution A: Automated Documentation Generation**
```bash
# 1. Generate documentation (dry run first)
node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts generate --dry-run

# 2. Review suggested documentation
# Check the output for accuracy

# 3. Apply documentation
node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts generate

# 4. Verify coverage
node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts validate
```

**Solution B: Manual Documentation Review**
```typescript
// Add proper documentation for each category:

// External API
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API response structure
const apiData: any = response.data;

// Legacy Code
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Legacy system compatibility
const legacyConfig: any = getLegacyConfig();

// Dynamic Content
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- User-generated content structure
const userContent: Record<string, any> = parseUserInput();
```

### Issue 6: CI/CD Integration Problems

#### Symptom: Quality Gates Failing in CI/CD
```
Error: Quality gates failed in CI/CD pipeline
Exit code: 1 from quality-gates check
```

**Diagnosis Steps**:
```bash
# 1. Run quality gates locally
node src/scripts/quality-gates/QualityGatesSystem.ts ci-cd

# 2. Check specific gate failures
node src/scripts/quality-gates/QualityGatesSystem.ts audit

# 3. Compare local vs CI environment
# Check Node.js version, dependencies, etc.
```

**Solutions**:

**Solution A: Environment Consistency**
```yaml
# Ensure CI uses same Node.js version
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Match local development
    cache: 'yarn'

# Use exact dependency versions
- run: yarn install --frozen-lockfile
```

**Solution B: Adjust CI Thresholds**
```javascript
// Different thresholds for CI vs local
const ciConfig = {
  explicitAny: {
    warningThreshold: 285,  // Slightly higher for CI
    criticalThreshold: 310
  }
};
```

**Solution C: Skip Non-Critical Checks in CI**
```javascript
// Disable performance checks in CI
const ciChecks = {
  explicitAny: true,
  typescript: true,
  linting: true,
  documentation: true,
  performance: false  // Too slow for CI
};
```

## Advanced Troubleshooting

### Debug Mode Execution

#### Enable Verbose Logging
```bash
# Run campaign with debug output
DEBUG=1 node src/scripts/unintentional-any-elimination/execute-full-campaign.cjs

# Run quality gates with verbose output
node src/scripts/quality-gates/QualityGatesSystem.ts audit --verbose

# Enable TypeScript diagnostics
yarn tsc --noEmit --skipLibCheck --diagnostics --extendedDiagnostics
```

#### Trace Specific File Processing
```bash
# Trace single file through campaign
node src/scripts/unintentional-any-elimination/direct-file-campaign.cjs \
  --file=src/problematic/file.ts \
  --trace \
  --dry-run

# Analyze classification for specific file
node src/scripts/unintentional-any-elimination/comprehensive-campaign.cjs \
  --analyze-only \
  --file=src/problematic/file.ts \
  --verbose
```

### System State Analysis

#### Check System Integrity
```bash
# Verify all system components
./scripts/system-integrity-check.sh

# Check configuration consistency
node src/scripts/quality-gates/QualityGatesSystem.ts validate-config

# Verify backup integrity
ls -la .any-elimination-backups-*/
```

#### Analyze Historical Trends
```bash
# Check metrics history
cat .kiro/specs/unintentional-any-elimination/quality-metrics.json | jq '.[] | {date: .lastAuditDate, count: .explicitAnyCount}'

# Generate trend report
node src/scripts/quality-gates/QualityGatesSystem.ts trend-analysis

# Compare with baseline
echo "Baseline: 435, Current: $(yarn lint --format=compact 2>/dev/null | grep '@typescript-eslint/no-explicit-any' | wc -l)"
```

### Recovery Procedures

#### Complete System Reset
```bash
# 1. Stop all processes
pkill -f "unintentional-any"
pkill -f "quality-gates"

# 2. Reset to known good state
git stash push -m "Emergency backup $(date)"
git reset --hard HEAD~1  # Or specific known good commit

# 3. Clean build artifacts
rm -rf .next/ node_modules/.cache/ .tsbuildinfo

# 4. Reinstall dependencies
yarn install --frozen-lockfile

# 5. Verify system health
yarn tsc --noEmit --skipLibCheck
yarn build
yarn test --passWithNoTests

# 6. Re-run conservative campaign
node src/scripts/unintentional-any-elimination/execute-full-campaign.cjs --conservative
```

#### Partial Recovery
```bash
# 1. Identify scope of issues
git diff HEAD~1 --name-only > changed_files.txt

# 2. Selectively restore problematic files
while read file; do
  if yarn tsc --noEmit "$file" 2>/dev/null; then
    echo "✅ $file is OK"
  else
    echo "❌ Restoring $file"
    git checkout HEAD~1 -- "$file"
  fi
done < changed_files.txt

# 3. Verify partial recovery
yarn tsc --noEmit --skipLibCheck
```

## Prevention Strategies

### Proactive Monitoring

#### Daily Health Checks
```bash
#!/bin/bash
# daily-health-check.sh

echo "🔍 Daily Any Elimination System Health Check"
echo "Date: $(date)"

# Check current count
CURRENT_COUNT=$(yarn lint --format=compact 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | wc -l)
echo "Current any type count: $CURRENT_COUNT"

# Check against thresholds
if [ "$CURRENT_COUNT" -gt 300 ]; then
  echo "❌ CRITICAL: Count exceeds critical threshold (300)"
  # Trigger emergency campaign
elif [ "$CURRENT_COUNT" -gt 280 ]; then
  echo "⚠️ WARNING: Count exceeds warning threshold (280)"
  # Send notification
else
  echo "✅ Count within acceptable range"
fi

# Check system health
node src/scripts/quality-gates/QualityGatesSystem.ts metrics > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Quality gates system healthy"
else
  echo "❌ Quality gates system issues detected"
fi
```

#### Automated Alerts
```javascript
// alert-system.js
const thresholds = {
  warning: 280,
  critical: 300,
  emergency: 350
};

async function checkAndAlert() {
  const currentCount = await getCurrentAnyCount();

  if (currentCount > thresholds.emergency) {
    await sendAlert('EMERGENCY', `Any count: ${currentCount}`);
    await triggerEmergencyCampaign();
  } else if (currentCount > thresholds.critical) {
    await sendAlert('CRITICAL', `Any count: ${currentCount}`);
  } else if (currentCount > thresholds.warning) {
    await sendAlert('WARNING', `Any count: ${currentCount}`);
  }
}
```

### Best Practices for Prevention

#### Code Review Checklist
- [ ] Check for new any types in changed files
- [ ] Verify any types have proper documentation
- [ ] Ensure intentional any types are justified
- [ ] Check for alternatives to any types
- [ ] Validate TypeScript compilation
- [ ] Run quality gates locally before push

#### Developer Education
```typescript
// Good practices examples

// ✅ GOOD: Properly documented external API
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API response
const apiResponse: any = await fetchExternalData();

// ✅ GOOD: Use unknown instead of any when possible
const userInput: unknown = getUserInput();
if (typeof userInput === 'string') {
  // Type narrowing
  processString(userInput);
}

// ✅ GOOD: Generic types instead of any
function processData<T>(data: T): T {
  return data;
}

// ❌ BAD: Undocumented any type
const data: any = someFunction();

// ❌ BAD: Using any to bypass type checking
const result = (someObject as any).unknownProperty;
```

## Support and Escalation

### Internal Support Process
1. **Check this troubleshooting guide first**
2. **Run system health check**: `./scripts/system-health-check.sh`
3. **Check recent changes**: `git log --oneline -10`
4. **Try safe recovery procedures**
5. **Document the issue for future reference**

### Escalation Criteria
- System completely broken (build fails, TypeScript errors)
- Data loss or corruption detected
- Performance degradation > 50%
- Security implications identified
- Multiple failed recovery attempts

### Issue Documentation Template
```markdown
## Issue Report

**Date**: [Date and time]
**Reporter**: [Name]
**Severity**: [Low/Medium/High/Critical]

### Problem Description
[Detailed description of the issue]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Environment
- Node.js version: [version]
- Yarn version: [version]
- System: [OS and version]
- Branch: [git branch]
- Commit: [git commit hash]

### Error Messages
```
[Paste error messages here]
```

### Attempted Solutions
- [Solution 1] - [Result]
- [Solution 2] - [Result]

### System State
- Any type count: [current count]
- TypeScript errors: [count]
- Build status: [pass/fail]
- Last successful campaign: [date]

### Additional Context
[Any other relevant information]
```

---
**Document Version**: 1.0
**Last Updated**: ${new Date().toISOString()}
**Covers System Version**: Unintentional Any Elimination v2.0
