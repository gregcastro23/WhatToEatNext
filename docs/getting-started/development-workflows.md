# 🔄 Development Workflows Guide

This guide covers common development workflows for the WhatToEatNext project, from basic tasks to advanced astrological feature development.

## 🎯 Overview of Development Workflows

### Workflow Categories
1. **Basic Development** - Standard coding tasks and maintenance
2. **Astrological Feature Development** - Cosmic-aware feature implementation
3. **Quality Assurance** - Testing, validation, and campaign management
4. **Cultural Integration** - Respectful addition of diverse traditions
5. **Performance Optimization** - Speed and reliability improvements

### Core Principles
- **Elemental Harmony** - All features respect the four-element system
- **Cultural Sensitivity** - Inclusive design in every workflow
- **Quality First** - Comprehensive testing and validation
- **Fallback Ready** - Every critical feature has backup mechanisms

## 🚀 Workflow 1: Basic Development Tasks

### 1.1 Setting Up for Development
```bash
# Clone and setup
git clone https://github.com/your-org/WhatToEatNext.git
cd WhatToEatNext

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, run continuous testing
npm run test:watch
```

### 1.2 Daily Development Routine
```bash
# Morning routine
git pull origin main                    # Get latest changes
npm run type-check                      # Verify TypeScript
npm run lint                           # Check code quality
npm test                               # Run test suite

# Development work
git checkout -b feature/your-feature    # Create feature branch
# ... make your changes ...
npm run test                           # Test your changes
git add .                              # Stage changes
git commit -m "feat: descriptive message"  # Commit with conventional format

# End of day
npm run build                          # Verify production build
git push origin feature/your-feature    # Push changes
```

### 1.3 Code Quality Workflow
```bash
# Before committing
npm run lint:fix                       # Auto-fix linting issues
npm run type-check                     # Verify TypeScript compilation
npm run test:coverage                  # Check test coverage
npm run build                          # Verify production build

# Campaign system integration
npm run campaign:check                 # Check if campaigns needed
npm run campaign:typescript            # Run TypeScript error reduction
npm run campaign:lint                  # Run linting improvements
```

## 🌟 Workflow 2: Astrological Feature Development

### 2.1 Planning Astrological Features
```typescript
// Step 1: Define the astrological concept
interface AstrologicalFeature {
  concept: string;                     // e.g., "Mercury retrograde cooking"
  elementalAspects: ElementalProperties; // Fire/Water/Earth/Air involvement
  planetaryCorrespondences: Planet[];   // Relevant planets
  culturalConsiderations: string[];     // Cultural sensitivity factors
  timingFactors: TimingRequirement[];   // When feature is most relevant
}

// Step 2: Plan the implementation
interface ImplementationPlan {
  calculations: CalculationRequirement[];
  dataRequirements: DataRequirement[];
  uiComponents: ComponentRequirement[];
  fallbackMechanisms: FallbackStrategy[];
  testingStrategy: TestingApproach[];
}
```

### 2.2 Implementing Astrological Calculations
```typescript
// Template for astrological calculations
async function calculateAstrologicalFeature(
  date: Date = new Date(),
  userProfile?: UserProfile
): Promise<AstrologicalResult> {
  try {
    // Step 1: Get reliable planetary positions
    const positions = await getReliablePlanetaryPositions(date);
    
    // Step 2: Validate astronomical data
    if (!validatePlanetaryPositions(positions)) {
      throw new Error('Invalid planetary positions');
    }
    
    // Step 3: Apply astrological logic
    const astrologicalInfluence = calculateInfluence(positions, userProfile);
    
    // Step 4: Apply elemental principles
    const elementalHarmony = calculateElementalHarmony(astrologicalInfluence);
    
    // Step 5: Generate recommendations
    const recommendations = generateRecommendations(elementalHarmony);
    
    return {
      influence: astrologicalInfluence,
      harmony: elementalHarmony,
      recommendations,
      timing: calculateOptimalTiming(positions),
      confidence: calculateConfidence(positions)
    };
    
  } catch (error) {
    logger.error('Astrological calculation failed', error);
    
    // Fallback to cached or default values
    return getFallbackAstrologicalResult(date, userProfile);
  }
}
```

### 2.3 Astrological Feature Testing
```typescript
// Test template for astrological features
describe('Astrological Feature', () => {
  test('calculates correctly with valid planetary positions', async () => {
    const testDate = new Date('2024-05-16T12:00:00Z');
    const result = await calculateAstrologicalFeature(testDate);
    
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.harmony).toMatchElementalPrinciples();
  });
  
  test('handles API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));
    
    const result = await calculateAstrologicalFeature();
    
    expect(result).toBeDefined();
    expect(result.recommendations).toHaveLength(expect.any(Number));
  });
  
  test('respects elemental self-reinforcement', () => {
    const fireProps = { fire: 0.8, water: 0.1, earth: 0.1, air: 0.0 };
    const compatibility = calculateElementalCompatibility(fireProps, fireProps);
    
    expect(compatibility).toBeGreaterThanOrEqual(0.9);
  });
});
```

## 🧪 Workflow 3: Quality Assurance and Testing

### 3.1 Comprehensive Testing Workflow
```bash
# Unit testing
npm run test:unit                      # Run unit tests
npm run test:unit:watch               # Watch mode for development

# Integration testing
npm run test:integration              # Test service integrations
npm run test:astrological            # Test astrological calculations

# End-to-end testing
npm run test:e2e                     # Full application testing
npm run test:e2e:headed              # Visual testing mode

# Coverage and quality
npm run test:coverage                # Generate coverage report
npm run test:coverage:open           # Open coverage in browser
```

### 3.2 Campaign System Workflow
```bash
# Check current quality metrics
npm run campaign:status              # View current error counts and metrics

# Run specific campaigns
npm run campaign:typescript          # TypeScript error reduction
npm run campaign:lint               # Linting improvement
npm run campaign:performance        # Performance optimization
npm run campaign:security           # Security vulnerability fixes

# Monitor campaign progress
npm run campaign:monitor            # Real-time campaign monitoring
npm run campaign:report             # Generate progress report

# Emergency procedures
npm run campaign:rollback           # Rollback last campaign
npm run campaign:emergency-stop     # Stop all running campaigns
```

### 3.3 Quality Gates Workflow
```typescript
// Pre-commit quality checks
interface QualityGates {
  typescript: {
    errorCount: number;              // Must be < 100
    warningCount: number;            // Must be < 1000
    strictMode: boolean;             // Must be true
  };
  
  testing: {
    coverage: number;                // Must be > 80%
    passingTests: number;            // Must be 100%
    astrologicalValidation: boolean; // Must pass
  };
  
  linting: {
    errorCount: number;              // Must be 0
    warningCount: number;            // Must be < 10000 (development)
    elementalPrincipleCompliance: boolean; // Must be true
  };
  
  performance: {
    buildTime: number;               // Must be < 60 seconds
    bundleSize: number;              // Must be < 5MB
    calculationSpeed: number;        // Must be < 2 seconds
  };
}
```

## 🌍 Workflow 4: Cultural Integration

### 4.1 Adding New Cuisines
```typescript
// Step 1: Research and consultation
interface CuisineResearch {
  culturalBackground: string;
  traditionalIngredients: Ingredient[];
  cookingMethods: CookingMethod[];
  seasonalPatterns: SeasonalPattern[];
  culturalSensitivities: string[];
  expertConsultation: boolean;
}

// Step 2: Respectful integration
interface CuisineIntegration {
  authenticRepresentation: boolean;
  properAttribution: boolean;
  culturalContext: string;
  astrologicalEnhancement: AstrologicalTiming;
  communityFeedback: boolean;
}
```

### 4.2 Cultural Sensitivity Workflow
```bash
# Before adding cultural content
1. Research authentic sources
2. Consult with cultural experts
3. Review existing similar implementations
4. Plan respectful integration approach

# During implementation
1. Use authentic ingredient names
2. Respect traditional preparation methods
3. Add astrological timing without claiming ownership
4. Include proper cultural context

# After implementation
1. Seek community feedback
2. Iterate based on cultural input
3. Monitor for cultural sensitivity issues
4. Maintain ongoing cultural consultation
```

### 4.3 Inclusive Design Workflow
```typescript
// Inclusive design checklist
interface InclusiveDesign {
  accessibility: {
    screenReaderCompatible: boolean;
    keyboardNavigable: boolean;
    colorBlindFriendly: boolean;
    multipleLanguageSupport: boolean;
  };
  
  culturalInclusion: {
    diverseRepresentation: boolean;
    noAssumptions: boolean;
    progressiveDisclosure: boolean;
    respectfulLanguage: boolean;
  };
  
  astrologicalInclusion: {
    optionalFeatures: boolean;
    comfortLevelSettings: boolean;
    educationalContent: boolean;
    nonJudgmentalApproach: boolean;
  };
}
```

## ⚡ Workflow 5: Performance Optimization

### 5.1 Performance Monitoring Workflow
```bash
# Performance analysis
npm run analyze:bundle              # Analyze bundle size
npm run analyze:performance         # Performance profiling
npm run analyze:memory             # Memory usage analysis
npm run analyze:calculations       # Astrological calculation speed

# Optimization implementation
npm run optimize:images            # Image optimization
npm run optimize:code              # Code splitting and tree shaking
npm run optimize:cache             # Cache optimization
npm run optimize:calculations      # Calculation performance tuning
```

### 5.2 Caching Strategy Workflow
```typescript
// Caching implementation pattern
class AstronomicalCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    validator?: (data: T) => boolean
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && this.isValid(cached)) {
      return cached.data;
    }
    
    // Fetch new data
    const data = await fetcher();
    
    // Validate if validator provided
    if (validator && !validator(data)) {
      throw new Error('Data validation failed');
    }
    
    // Cache the result
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
    
    return data;
  }
  
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }
}
```

### 5.3 Performance Testing Workflow
```typescript
// Performance test template
describe('Performance Tests', () => {
  test('astrological calculations complete within 2 seconds', async () => {
    const startTime = performance.now();
    
    await calculateAstrologicalRecommendations();
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });
  
  test('cache hit rate exceeds 80%', async () => {
    const cache = new AstronomicalCache();
    const cacheStats = await cache.getStatistics();
    
    expect(cacheStats.hitRate).toBeGreaterThan(0.8);
  });
  
  test('bundle size remains under 5MB', () => {
    const bundleSize = getBundleSize();
    expect(bundleSize).toBeLessThan(5 * 1024 * 1024);
  });
});
```

## 🔧 Workflow 6: Advanced Development Patterns

### 6.1 Spec-Driven Development Workflow
```bash
# Create new feature spec
kiro spec create feature-name

# Follow iterative workflow
1. Requirements gathering and refinement
2. Design document creation
3. Task breakdown and planning
4. Implementation with validation

# Use Kiro's spec system
kiro spec status                    # Check spec progress
kiro spec execute task-id           # Execute specific task
kiro spec validate                  # Validate implementation
```

### 6.2 Campaign Development Workflow
```typescript
// Creating custom campaigns
interface CustomCampaign {
  name: string;
  description: string;
  targetMetrics: QualityMetric[];
  safetyLevel: 'MAXIMUM' | 'HIGH' | 'MEDIUM';
  phases: CampaignPhase[];
  rollbackStrategy: RollbackStrategy;
}

// Campaign implementation
class CustomQualityCampaign extends CampaignController {
  async execute(): Promise<CampaignResult> {
    // Phase 1: Analysis
    const analysis = await this.analyzeCurrentState();
    
    // Phase 2: Planning
    const plan = await this.createImprovementPlan(analysis);
    
    // Phase 3: Execution with safety protocols
    const result = await this.executeWithSafety(plan);
    
    // Phase 4: Validation
    await this.validateResults(result);
    
    return result;
  }
}
```

### 6.3 MCP Integration Workflow
```python
# Creating custom MCP servers
from mcp import FastMCP

app = FastMCP("Custom Astrological Server")

@app.tool()
def calculate_custom_aspect(date: str, aspect_type: str) -> dict:
    """Calculate custom astrological aspects"""
    try:
        # Implement custom calculation
        result = perform_calculation(date, aspect_type)
        
        # Validate result
        if not validate_result(result):
            raise ValueError("Invalid calculation result")
            
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "fallback": get_fallback_data(date, aspect_type)
        }

if __name__ == "__main__":
    app.run()
```

## 🎯 Workflow Best Practices

### Do's ✅
- **Always validate astrological data** before using in calculations
- **Implement comprehensive fallbacks** for all critical features
- **Follow elemental principles** in all compatibility calculations
- **Test with multiple cultural contexts** to ensure inclusivity
- **Monitor performance continuously** and optimize proactively
- **Use the campaign system** for systematic quality improvements
- **Document cultural considerations** for all new features

### Don'ts ❌
- **Never implement opposing elements** (Fire vs Water logic)
- **Don't skip cultural sensitivity review** for new features
- **Avoid hardcoding astrological assumptions** about users
- **Don't ignore fallback mechanisms** in critical paths
- **Never compromise on accessibility** or inclusive design
- **Don't bypass quality gates** even for urgent fixes

### Common Pitfalls
1. **Forgetting fallback mechanisms** - Always implement backup strategies
2. **Ignoring cultural sensitivity** - Every feature needs cultural review
3. **Skipping elemental validation** - All calculations must follow principles
4. **Inadequate testing** - Astrological features need comprehensive testing
5. **Performance oversight** - Monitor calculation speed and memory usage

## 📚 Workflow Resources

### Essential Commands Reference
```bash
# Development
npm run dev                         # Start development server
npm run build                       # Production build
npm run type-check                  # TypeScript validation

# Testing
npm run test                        # Run all tests
npm run test:astrological          # Astrological feature tests
npm run test:coverage              # Coverage report

# Quality Assurance
npm run lint                       # Code linting
npm run campaign:status            # Quality metrics
npm run campaign:typescript        # Error reduction

# Performance
npm run analyze:bundle             # Bundle analysis
npm run optimize:calculations      # Calculation optimization
```

### Documentation Links
- **[Architecture Guide](architecture-guide.md)** - System design and patterns
- **[Astrological Integration](../guides/astrological-integration.md)** - Cosmic feature development
- **[Cultural Sensitivity](../guides/cultural-sensitivity.md)** - Inclusive design guidelines
- **[Campaign System](../../src/services/campaign/README.md)** - Quality improvement system

---

**These workflows provide structured approaches to common development tasks while maintaining the project's high standards for quality, cultural sensitivity, and astrological accuracy.** 🌟

*Ready to start developing? Choose the workflow that matches your current task and follow the step-by-step guidance provided.*