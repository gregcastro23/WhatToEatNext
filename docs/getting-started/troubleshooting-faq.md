# 🔧 Troubleshooting and FAQ Guide

This comprehensive guide addresses common issues, questions, and solutions for
the WhatToEatNext project.

## 🚨 Quick Problem Resolution

### Emergency Fixes

```bash
# Build is broken
npm run campaign:emergency-stop     # Stop all campaigns
git stash                          # Stash current changes
npm run build                      # Test clean build

# TypeScript errors overwhelming
npm run campaign:typescript        # Run error reduction campaign
npm run type-check                 # Check current status

# Development server won't start
rm -rf node_modules .next          # Clean installation
yarn install                        # Reinstall dependencies
yarn dev                        # Restart server
```

## 🏗️ Setup and Installation Issues

### Q: Node.js version conflicts

**Problem**: Getting version compatibility errors

**Solutions**:

```bash
# Check current version
node --version

# Install correct version (20.18.0+)
nvm install 20.18.0
nvm use 20.18.0

# Use safe development script
npm run dev:safe

# Or use direnv for automatic switching
direnv allow
```

### Q: Dependencies won't install

**Problem**: npm/yarn installation failures

**Solutions**:

```bash
# Clear caches
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstall
yarn install

# If still failing, try yarn
yarn install

# Check for Node.js version compatibility
node --version  # Should be 20.18.0+
```

### Q: Development server fails to start

**Problem**: `npm run dev` throws errors

**Solutions**:

```bash
# Check port availability
lsof -i :3000                     # Check if port 3000 is in use
kill -9 <PID>                     # Kill process if needed

# Clean build artifacts
rm -rf .next
npm run build                     # Rebuild

# Check environment variables
cp .env.example .env.local        # Create local environment file

# Verify TypeScript compilation
npm run type-check
```

## 🌟 Astrological Feature Issues

### Q: Planetary position calculations failing

**Problem**: Getting "Invalid planetary positions" errors

**Solutions**:

```typescript
// Check API connectivity
const positions = await getReliablePlanetaryPositions();
console.log('Positions:', positions);

// Verify fallback mechanism
const fallback = getMarch2025Positions();
console.log('Fallback available:', fallback);

// Check validation function
const isValid = validatePlanetaryPositions(positions);
console.log('Validation result:', isValid);
```

**Common Causes**:

- API timeout or connectivity issues
- Invalid date format passed to calculation
- Missing fallback data
- Validation function too strict

### Q: Elemental compatibility calculations incorrect

**Problem**: Getting compatibility scores below 0.7

**Solutions**:

```typescript
// Verify elemental properties structure
interface ElementalProperties {
  fire: number;    // Should be 0-1
  water: number;   // Should be 0-1
  earth: number;   // Should be 0-1
  air: number;     // Should be 0-1
}

// Check calculation logic
function calculateCompatibility(source: ElementalProperties, target: ElementalProperties): number {
  const sourceDominant = getDominantElement(source);
  const targetDominant = getDominantElement(target);

  // Same elements: 0.9+ compatibility
  if (sourceDominant === targetDominant) {
    return Math.max(0.9, baseCompatibility);
  }

  // Different elements: 0.7+ compatibility
  return Math.max(0.7, baseCompatibility);
}
```

**Red Flags to Avoid**:

- Opposition logic (Fire vs Water)
- Compatibility scores below 0.7
- Complex balancing that reduces elemental strength

### Q: Transit date validation errors

**Problem**: "Invalid transit date" warnings

**Solutions**:

```bash
# Check transit data files
ls src/data/planets/              # Verify planet files exist

# Validate specific planet data
node -e "console.log(require('./src/data/planets/mars.js'))"

# Update transit dates if needed
# Edit src/data/planets/[planet].ts files with current data
```

**Data Structure**:

```typescript
interface TransitDates {
  [sign: string]: {
    Start: string; // ISO date format YYYY-MM-DD
    End: string;   // ISO date format YYYY-MM-DD
  };
  RetrogradePhases?: {
    [phase: string]: {
      Start: string;
      End: string;
      Peak?: string;
    };
  };
}
```

## 🎯 Kiro-Specific Issues

### Q: Kiro steering files not loading

**Problem**: Kiro doesn't seem to understand project context

**Solutions**:

```bash
# Verify steering files exist
ls .kiro/steering/                # Should show all steering files

# Check file format
head .kiro/steering/product.md    # Verify markdown format

# Restart Kiro
# Close and reopen Kiro to reload steering files

# Check inclusion patterns
grep -r "inclusion:" .kiro/steering/
```

### Q: Agent hooks not triggering

**Problem**: File changes don't trigger automated hooks

**Solutions**:

```bash
# Check hook configurations
ls .kiro/hooks/                   # Verify hook files exist

# Test specific hook
# Make a change to src/data/planets/mars.ts
# Save file and check if validation runs

# Check Kiro's Agent Hooks panel
# View > Agent Hooks to see status

# Restart Kiro if hooks seem stuck
```

### Q: MCP servers not connecting

**Problem**: MCP servers show as disconnected

**Solutions**:

```bash
# Check Python/uv installation
uv --version
uvx --version

# Install if missing
curl -LsSf https://astral.sh/uv/install.sh | sh

# Check MCP configuration
cat .kiro/settings/mcp.json

# Test server manually
uvx mcp-servers/astrology-server.py

# Check Kiro's MCP panel for error messages
```

### Q: Campaign system not working

**Problem**: Campaigns fail to run or complete

**Solutions**:

```bash
# Check campaign status
npm run campaign:status

# View campaign logs
ls logs/                          # Check for campaign log files

# Test simple campaign
npm run campaign:typescript --dry-run

# Check git status (campaigns need clean working directory)
git status
git stash                         # Stash changes if needed

# Verify Node.js version
node --version                    # Should be 20.18.0+
```

## 🧪 Testing and Quality Issues

### Q: Tests failing after changes

**Problem**: Test suite has failures

**Solutions**:

```bash
# Run specific test categories
npm run test:unit                 # Unit tests only
npm run test:integration          # Integration tests only
npm run test:astrological        # Astrological feature tests

# Check test coverage
npm run test:coverage

# Debug specific test
npm test -- --testNamePattern="specific test name"

# Update snapshots if needed
npm test -- --updateSnapshot
```

### Q: TypeScript errors overwhelming

**Problem**: Too many TypeScript errors to fix manually

**Solutions**:

```bash
# Check current error count
npm run type-check 2>&1 | grep -c "error TS"

# Run automated error reduction
npm run campaign:typescript

# Check campaign progress
npm run campaign:monitor

# Focus on high-impact files
npm run type-check 2>&1 | grep "error TS" | head -20
```

### Q: Linting warnings excessive

**Problem**: ESLint warnings over 10,000

**Solutions**:

```bash
# Check current warning count
npm run lint 2>&1 | grep -c "warning"

# Run automated linting improvements
npm run campaign:lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/path/to/file.ts
```

## 🌍 Cultural and Accessibility Issues

### Q: Cultural sensitivity concerns

**Problem**: Worried about cultural appropriation

**Solutions**:

1. **Research First**: Always research authentic sources
2. **Consult Experts**: Work with cultural practitioners
3. **Respectful Integration**: Add cosmic timing without claiming ownership
4. **Community Feedback**: Seek input from relevant communities
5. **Proper Attribution**: Credit traditional knowledge

**Review Checklist**:

- [ ] Authentic ingredient names used
- [ ] Traditional preparation methods respected
- [ ] Cultural context provided
- [ ] Expert consultation completed
- [ ] Community feedback sought

### Q: Accessibility compliance

**Problem**: Ensuring inclusive design

**Solutions**:

```bash
# Run accessibility tests
npm run test:a11y

# Check color contrast
# Use browser dev tools accessibility panel

# Test keyboard navigation
# Tab through interface without mouse

# Test screen reader compatibility
# Use NVDA, JAWS, or VoiceOver
```

**Accessibility Checklist**:

- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Color blind friendly
- [ ] Multiple language support
- [ ] Progressive disclosure for astrological features

## ⚡ Performance Issues

### Q: Slow astrological calculations

**Problem**: Calculations taking longer than 2 seconds

**Solutions**:

```typescript
// Profile calculation performance
console.time('astrological-calculation');
const result = await calculateAstrologicalFeature();
console.timeEnd('astrological-calculation');

// Check caching
const cache = new AstronomicalCache();
const stats = await cache.getStatistics();
console.log('Cache hit rate:', stats.hitRate);

// Optimize expensive operations
const memoizedCalculation = useMemo(() => {
  return expensiveAstrologicalCalculation(planetaryPositions);
}, [planetaryPositions]);
```

### Q: Large bundle size

**Problem**: Application bundle exceeding 5MB

**Solutions**:

```bash
# Analyze bundle
npm run analyze:bundle

# Check for large dependencies
npx webpack-bundle-analyzer .next/static/chunks/

# Implement code splitting
# Use dynamic imports for astrological features
const AstrologyChart = lazy(() => import('./AstrologyChart'));

# Optimize images
npm run optimize:images
```

### Q: Memory leaks

**Problem**: Application memory usage growing over time

**Solutions**:

```typescript
// Check for memory leaks in calculations
useEffect(() => {
  const interval = setInterval(async () => {
    const positions = await getReliablePlanetaryPositions();
    // Process positions
  }, 60000);

  // Cleanup interval
  return () => clearInterval(interval);
}, []);

// Monitor memory usage
console.log('Memory usage:', process.memoryUsage());
```

## 🔌 API and Integration Issues

### Q: External API failures

**Problem**: Astrological APIs not responding

**Solutions**:

```typescript
// Check API status
const testConnection = async () => {
  try {
    const response = await fetch('https://api.example.com/status');
    console.log('API Status:', response.status);
  } catch (error) {
    console.error('API Connection failed:', error);
  }
};

// Verify fallback mechanisms
const positions = await getReliablePlanetaryPositions();
console.log('Using fallback:', positions.source === 'fallback');

// Check cache validity
const cacheAge = Date.now() - positions.timestamp;
console.log('Cache age (hours):', cacheAge / (1000 * 60 * 60));
```

### Q: Rate limiting issues

**Problem**: API rate limits exceeded

**Solutions**:

```typescript
// Implement intelligent caching
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours for astronomical data

// Use request throttling
const throttledRequest = throttle(apiRequest, 1000); // 1 request per second

// Monitor API usage
console.log('API calls today:', getApiCallCount());
console.log('Rate limit remaining:', getRateLimitRemaining());
```

## 🎯 Common Error Messages

### "Cannot find name" TypeScript errors

**Error**: `TS2304: Cannot find name 'ElementalProperties'`

**Solution**:

```typescript
// Add proper import
import { ElementalProperties } from '@/types/elemental';

// Or check if type is exported
export interface ElementalProperties {
  fire: number;
  water: number;
  earth: number;
  air: number;
}
```

### "Property does not exist" errors

**Error**: `TS2339: Property 'fire' does not exist on type`

**Solution**:

```typescript
// Ensure proper type definition
interface Ingredient {
  name: string;
  elementalProperties: ElementalProperties;
  // ... other properties
}

// Use type assertion if needed (carefully)
const properties = ingredient.elementalProperties as ElementalProperties;
```

### "Argument of type X is not assignable" errors

**Error**:
`TS2345: Argument of type 'string' is not assignable to parameter of type 'Element'`

**Solution**:

```typescript
// Use proper type definitions
type Element = 'fire' | 'water' | 'earth' | 'air';

// Type guard for validation
function isElement(value: string): value is Element {
  return ['fire', 'water', 'earth', 'air'].includes(value);
}

// Usage
if (isElement(userInput)) {
  processElement(userInput); // Now TypeScript knows it's an Element
}
```

## 📚 Additional Resources

### Documentation Links

- **[Architecture Guide](architecture-guide.md)** - System design and patterns
- **[Development Workflows](development-workflows.md)** - Common development
  tasks
- **[Kiro Setup Guide](kiro-setup-guide.md)** - Kiro configuration and usage
- **[Campaign System Docs](../../src/services/campaign/README.md)** - Quality
  improvement system

### Community Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community Q&A and general discussion
- **Code Review**: Learn from others' implementations
- **Documentation**: Contribute improvements to guides

### Emergency Contacts

- **Build Issues**: Check campaign system status first
- **Security Concerns**: Report immediately through proper channels
- **Cultural Sensitivity**: Consult with cultural experts
- **Performance Problems**: Use profiling tools and monitoring

## 🎉 Success Indicators

### You're on the right track when:

- ✅ All tests pass consistently
- ✅ TypeScript errors under 100
- ✅ Astrological calculations complete under 2 seconds
- ✅ Elemental compatibility scores always ≥ 0.7
- ✅ Cultural features reviewed by experts
- ✅ Campaign system running smoothly
- ✅ Kiro providing helpful contextual assistance

### Red flags to address:

- ❌ Compatibility scores below 0.7
- ❌ Opposition logic in elemental calculations
- ❌ Cultural appropriation concerns
- ❌ API failures without fallbacks
- ❌ Memory leaks or performance degradation
- ❌ Accessibility barriers
- ❌ Campaign system failures

---

**This troubleshooting guide covers the most common issues you'll encounter.
When in doubt, start with the basics: clean installation, verify configuration,
and check the logs.** 🌟

_Can't find your issue here? Check the
[GitHub Issues](https://github.com/your-org/WhatToEatNext/issues) or create a
new issue with detailed information about your problem._
