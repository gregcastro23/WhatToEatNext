# 🔧 Common Issues and Solutions

This guide covers the most frequently encountered issues in the WhatToEatNext
project and their proven solutions.

## 🚨 Critical Issues (Immediate Action Required)

### Build Completely Broken

**Symptoms:**

- `bun run build` fails with errors
- Development server won't start
- TypeScript compilation errors prevent startup

**Immediate Solutions:**

```bash
# Emergency reset procedure
git stash                          # Save current work
bun run emergency:reset            # Reset to last known good state
bun install                        # Reinstall dependencies
bun run build                      # Test build

# If still failing
rm -rf node_modules .next bun.lock
bun install
bun run build
```

**Root Causes:**

- Dependency version conflicts
- Corrupted node_modules
- Invalid TypeScript configuration
- Missing environment variables

### Astrological Calculations Completely Failing

**Symptoms:**

- All planetary position requests return errors
- Fallback mechanisms not working
- "Invalid planetary positions" errors everywhere

**Immediate Solutions:**

```bash
# Enable emergency fallback mode
bun run fallback:enable

# Test fallback data
node -e "console.log(require('./src/utils/reliableAstronomy').getMarch2025Positions())"

# Verify API connectivity
bun run test:api-connectivity
```

**Emergency Fallback:**

```typescript
// Temporary hardcoded positions (March 28, 2025)
const EMERGENCY_POSITIONS = {
  sun: { sign: "aries", degree: 8.5, exactLongitude: 8.5 },
  moon: { sign: "aries", degree: 1.57, exactLongitude: 1.57 },
  // ... other planets
};
```

## ⚡ High Priority Issues

### TypeScript Errors Overwhelming System

**Symptoms:**

- Error count > 1000
- Build times extremely slow
- IDE becomes unresponsive

**Solutions:**

```bash
# Check current error count
bun run type-check 2>&1 | grep -c "error TS"

# Run automated error reduction campaign
bun run campaign:typescript

# Monitor campaign progress
bun run campaign:monitor

# Emergency manual fixes for critical files
bun run fix:critical-errors
```

**Prevention:**

```bash
# Set up pre-commit hooks
bun run setup:git-hooks

# Enable incremental TypeScript checking
# Add to tsconfig.json:
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### Performance Severely Degraded

**Symptoms:**

- Astrological calculations > 10 seconds
- Page load times > 5 seconds
- Memory usage continuously growing

**Immediate Actions:**

```bash
# Clear all caches
bun run cache:clear

# Profile performance
bun run performance:profile

# Check memory usage
bun run memory:check

# Restart with performance monitoring
bun run dev:performance
```

**Quick Fixes:**

```typescript
// Enable calculation caching
const memoizedCalculation = useMemo(() => {
  return expensiveAstrologicalCalculation(planetaryPositions);
}, [planetaryPositions]);

// Implement request throttling
const throttledApiCall = throttle(apiCall, 1000);
```

### Kiro Integration Broken

**Symptoms:**

- Steering files not loading
- Agent hooks not triggering
- MCP servers disconnected

**Solutions:**

```bash
# Restart Kiro completely
# Close Kiro application and reopen

# Check steering file syntax
bun run validate:steering

# Test agent hooks manually
bun run test:hooks

# Reconnect MCP servers
bun run mcp:reconnect
```

## 🟡 Medium Priority Issues

### Elemental Compatibility Scores Below 0.7

**Symptoms:**

- Compatibility calculations returning < 0.7
- "Opposition logic detected" warnings
- Inconsistent elemental recommendations

**Solutions:**

```typescript
// Fix compatibility calculation
function calculateElementalCompatibility(
  source: ElementalProperties,
  target: ElementalProperties,
): number {
  const sourceDominant = getDominantElement(source);
  const targetDominant = getDominantElement(target);

  // Same elements: highest compatibility
  if (sourceDominant === targetDominant) {
    return Math.max(0.9, baseCompatibility);
  }

  // Different elements: good compatibility
  return Math.max(0.7, baseCompatibility);
}

// Validate all compatibility scores
function validateCompatibilityScore(score: number): boolean {
  if (score < 0.7) {
    console.error(`Invalid compatibility score: ${score}. Must be >= 0.7`);
    return false;
  }
  return true;
}
```

**Code Review Checklist:**

- [ ] No opposition logic (Fire vs Water)
- [ ] All compatibility scores ≥ 0.7
- [ ] Same-element combinations ≥ 0.9
- [ ] Self-reinforcement principles applied

### Transit Date Validation Failures

**Symptoms:**

- "Invalid transit date" warnings
- Planetary positions don't match expected signs
- Fallback positions used frequently

**Solutions:**

```bash
# Update transit data
bun run update:transit-dates

# Validate specific planet
node -e "
const mars = require('./src/data/planets/mars.js');
console.log('Mars transit dates:', mars.TransitDates);
"

# Test validation function
bun run test:transit-validation
```

**Manual Update Process:**

```typescript
// Update src/data/planets/[planet].ts
export const TransitDates = {
  cancer: {
    Start: "2024-07-15",
    End: "2024-09-04",
  },
  leo: {
    Start: "2024-09-04",
    End: "2024-10-30",
  },
  // ... other signs
};
```

### API Rate Limiting Issues

**Symptoms:**

- "Rate limit exceeded" errors
- API calls failing frequently
- Fallback mode activated often

**Solutions:**

```typescript
// Implement intelligent caching
const CACHE_CONFIG = {
  astronomical: 6 * 60 * 60 * 1000, // 6 hours
  nutritional: 24 * 60 * 60 * 1000, // 24 hours
  recipes: 12 * 60 * 60 * 1000, // 12 hours
};

// Add request throttling
const throttledRequest = throttle(async (url: string) => {
  return await fetch(url);
}, 1000); // 1 request per second

// Monitor API usage
function trackApiUsage(endpoint: string) {
  const usage = getApiUsage(endpoint);
  if (usage.remaining < 10) {
    console.warn(
      `API limit approaching for ${endpoint}: ${usage.remaining} remaining`,
    );
  }
}
```

## 🟢 Low Priority Issues

### Linting Warnings Excessive

**Symptoms:**

- ESLint warnings > 5000
- Code quality metrics declining
- Inconsistent code style

**Solutions:**

```bash
# Run automated linting campaign
bun run campaign:lint

# Fix auto-fixable issues
bun run lint:fix

# Check specific file types
bunx eslint "src/**/*.ts" --fix

# Update ESLint configuration for development
# In eslint.config.cjs:
module.exports = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // Relaxed during development
    '@typescript-eslint/no-unused-vars': 'warn'
  }
};
```

### Bundle Size Too Large

**Symptoms:**

- Bundle size > 5MB
- Slow initial page load
- Poor performance on mobile

**Solutions:**

```bash
# Analyze bundle composition
bun run analyze:bundle

# Implement code splitting
bun run optimize:splitting

# Optimize images and assets
bun run optimize:assets
```

**Code Splitting Example:**

```typescript
// Lazy load astrological components
const AstrologyChart = lazy(() => import('./components/AstrologyChart'));
const PlanetaryDisplay = lazy(() => import('./components/PlanetaryDisplay'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <AstrologyChart />
</Suspense>
```

### Memory Leaks in Calculations

**Symptoms:**

- Memory usage grows over time
- Browser becomes sluggish
- Calculation performance degrades

**Solutions:**

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const interval = setInterval(async () => {
    const positions = await getReliablePlanetaryPositions();
    updatePlanetaryState(positions);
  }, 60000);

  // Critical: cleanup interval
  return () => clearInterval(interval);
}, []);

// Memoize expensive calculations
const memoizedCalculation = useMemo(() => {
  return calculateElementalHarmony(ingredients);
}, [ingredients]);

// Clear caches periodically
useEffect(() => {
  const cleanup = setInterval(
    () => {
      clearOldCacheEntries();
    },
    30 * 60 * 1000,
  ); // Every 30 minutes

  return () => clearInterval(cleanup);
}, []);
```

## 🔍 Diagnostic Commands

### System Health Check

```bash
# Comprehensive system check
bun run health:check

# Specific subsystem checks
bun run health:astrological
bun run health:performance
bun run health:integrations
bun run health:kiro
```

### Debug Information

```bash
# Generate debug report
bun run debug:report

# Check specific components
bun run debug:astronomy
bun run debug:campaigns
bun run debug:mcp-servers

# Performance profiling
bun run profile:calculations
bun run profile:memory
bun run profile:bundle
```

### Testing Commands

```bash
# Run all tests
bun run test

# Test specific areas
bun run test:astrological
bun run test:elemental
bun run test:performance
bun run test:integration

# Test with coverage
bun run test:coverage
```

## 📊 Monitoring and Alerts

### Key Metrics to Monitor

```typescript
interface SystemMetrics {
  astrologicalCalculationTime: number; // Target: < 2 seconds
  apiResponseTime: number; // Target: < 5 seconds
  cacheHitRate: number; // Target: > 80%
  errorRate: number; // Target: < 1%
  typeScriptErrors: number; // Target: < 100
  memoryUsage: number; // Monitor for leaks
}
```

### Automated Alerts

```bash
# Set up monitoring alerts
bun run setup:monitoring

# Configure thresholds
bun run configure:alerts

# Test alert system
bun run test:alerts
```

## 🎯 Prevention Strategies

### Daily Maintenance

```bash
# Run daily health check
bun run health:daily

# Update dependencies (weekly)
bun run update:dependencies

# Clean up caches (weekly)
bun run cleanup:caches

# Validate data integrity (daily)
bun run validate:data
```

### Code Quality Gates

```bash
# Pre-commit checks
bun run pre-commit:check

# Pre-push validation
bun run pre-push:validate

# Continuous integration checks
bun run ci:validate
```

### Proactive Monitoring

```typescript
// Set up performance monitoring
const performanceMonitor = new PerformanceMonitor({
  thresholds: {
    calculationTime: 2000, // 2 seconds
    memoryUsage: 100 * 1024 * 1024, // 100MB
    errorRate: 0.01, // 1%
  },
  alerts: {
    email: "dev-team@example.com",
    slack: "#alerts",
  },
});
```

## 📚 Additional Resources

### Documentation Links

- **[Astrological Debugging Guide](astrological-debugging.md)** - Specialized
  astronomical debugging
- **[Performance Optimization Guide](performance-optimization.md)** -
  Performance tuning
- **[Escalation Procedures](escalation-procedures.md)** - When to escalate
  issues
- **[Campaign System Debugging](campaign-system-debugging.md)** - Campaign
  troubleshooting

### Community Resources

- **GitHub Issues**: Search existing issues before creating new ones
- **Discussions**: Community Q&A and best practices
- **Wiki**: Detailed technical documentation
- **Code Examples**: Reference implementations

### Emergency Contacts

- **Critical Issues**: Use escalation procedures
- **Security Issues**: Report immediately through secure channels
- **Performance Issues**: Check monitoring dashboards first
- **Data Issues**: Validate against known good states

---

**Remember**: Most issues have been encountered before. Check this guide, search
the documentation, and use the diagnostic tools before escalating. 🌟
