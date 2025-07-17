# 👨‍💻 Developer Getting Started Guide

Welcome, developer! This guide will get you from zero to productive contributor in 30-60 minutes.

## 🎯 Prerequisites

### Required Knowledge
- **JavaScript/TypeScript**: Intermediate to advanced
- **React/Next.js**: Familiarity with modern React patterns
- **Git**: Basic version control operations
- **Command Line**: Comfortable with terminal/command prompt

### Optional but Helpful
- **Astrological Concepts**: Basic understanding helpful but not required
- **Node.js Ecosystem**: npm/yarn, package management
- **Testing**: Jest, unit testing concepts
- **CSS**: Tailwind CSS experience

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-org/WhatToEatNext.git
cd WhatToEatNext

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

### 2. Verify Setup
```bash
# Check TypeScript compilation
npm run type-check

# Run tests
npm test

# Check linting
npm run lint
```

### 3. Open in Browser
- Navigate to `http://localhost:3000`
- You should see the WhatToEatNext application running
- Try the astrological demo features to verify functionality

## 🏗️ Project Architecture Overview

### Directory Structure
```
src/
├── app/                    # Next.js App Router (pages and layouts)
├── calculations/           # Astrological computation engines
│   ├── culinary/          # Culinary astrology calculations
│   └── core/              # Core astronomical calculations
├── data/                  # Ingredient databases & planetary data
│   ├── ingredients/       # Categorized ingredient databases
│   ├── planets/           # Planetary position data
│   └── recipes/           # Recipe databases
├── components/            # React components with cosmic context
│   ├── AstrologyChart/    # Astrological visualization
│   ├── ElementalDisplay/  # Four-element system UI
│   └── FoodRecommender/   # Core recommendation interface
├── services/              # Business logic & API integrations
│   └── campaign/          # Automated quality improvement
├── contexts/              # React context providers
├── utils/                 # Pure utility functions
├── types/                 # TypeScript type definitions
└── constants/             # Configuration and reference data
```

### Key Technologies
- **Next.js 15.3.4**: App Router with server components
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5.1.6**: Strict typing with astrological domain modeling
- **Tailwind CSS**: Utility-first styling with elemental theming
- **astronomy-engine**: High-precision astronomical calculations
- **Jest**: Comprehensive testing framework

## 🌟 Core Concepts for Developers

### Astrological Integration
```typescript
// Example: Getting current planetary positions
import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';

async function calculateRecommendations() {
  try {
    const positions = await getReliablePlanetaryPositions();
    // Use positions for recommendations
  } catch (error) {
    // Fallback to cached positions from March 28, 2025
    const fallbackPositions = getMarch2025Positions();
  }
}
```

### Four-Element System
```typescript
// Example: Elemental compatibility calculation
interface ElementalProperties {
  fire: number;    // Energy, spice, quick cooking
  water: number;   // Cooling, fluid, steaming
  earth: number;   // Grounding, root vegetables, slow cooking
  air: number;     // Light, leafy, raw preparations
}

// Self-reinforcement principle: same elements have highest compatibility
function calculateCompatibility(source: ElementalProperties, target: ElementalProperties): number {
  const sourceDominant = getDominantElement(source);
  const targetDominant = getDominantElement(target);
  
  // Same elements: 0.9+ compatibility
  if (sourceDominant === targetDominant) {
    return Math.max(0.9, baseCompatibility);
  }
  
  // Different elements: 0.7+ compatibility (no opposing elements)
  return Math.max(0.7, baseCompatibility);
}
```

### Campaign System Integration
```typescript
// Example: Using the automated quality improvement system
import { CampaignController } from '@/services/campaign/CampaignController';

const campaign = new CampaignController({
  type: 'typescript-error-reduction',
  safetyLevel: 'MAXIMUM',
  batchSize: 15,
  validationFrequency: 5
});

await campaign.execute();
```

## 🧪 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes with frequent commits
git add .
git commit -m "feat: add astrological feature"

# Run quality checks
npm run type-check
npm run lint
npm test

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: Minimum 80% code coverage
- **Linting**: ESLint with project-specific rules
- **Formatting**: Prettier with consistent configuration

### 3. Astrological Feature Development
```typescript
// Always validate astronomical data
function validatePlanetaryPositions(positions: Record<string, unknown>): boolean {
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  
  for (const planet of requiredPlanets) {
    if (!positions[planet]) return false;
    
    const pos = positions[planet] as any;
    if (!pos.sign || typeof pos.degree !== 'number') return false;
    if (pos.degree < 0 || pos.degree >= 30) return false;
  }
  
  return true;
}

// Always include fallback mechanisms
async function safeAstrologicalCalculation<T>(
  calculation: () => Promise<T>,
  fallback: T,
  validator: (result: T) => boolean
): Promise<T> {
  try {
    const result = await calculation();
    return validator(result) ? result : fallback;
  } catch (error) {
    logger.error('Astrological calculation failed', error);
    return fallback;
  }
}
```

## 🔧 Development Tools

### Essential Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Quality Assurance
npm run type-check      # TypeScript compilation check
npm run lint            # ESLint checking
npm run lint:fix        # Auto-fix linting issues
npm test                # Run test suite
npm run test:coverage   # Test with coverage report

# Campaign System
npm run campaign:ts     # Run TypeScript error reduction
npm run campaign:lint   # Run linting improvement
npm run campaign:perf   # Run performance optimization
```

### IDE Setup Recommendations
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.md": "markdown"
  }
}
```

### Debugging Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

## 🧪 Testing Approach

### Unit Testing
```typescript
// Example: Testing astrological calculations
describe('Planetary Calculations', () => {
  test('validates transit dates against stored data', async () => {
    const testDate = new Date('2024-05-16');
    const positions = await getReliablePlanetaryPositions(testDate);
    
    expect(positions).toBeDefined();
    expect(validatePlanetaryPositions(positions)).toBe(true);
  });
  
  test('handles API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));
    
    const positions = await getReliablePlanetaryPositions();
    expect(positions).toEqual(expect.objectContaining({
      sun: expect.objectContaining({ sign: expect.any(String) })
    }));
  });
});
```

### Integration Testing
```typescript
// Example: Testing elemental compatibility
describe('Elemental Compatibility', () => {
  test('same elements have highest compatibility', () => {
    const fireProps = { fire: 0.8, water: 0.1, earth: 0.1, air: 0.0 };
    const otherFireProps = { fire: 0.7, water: 0.2, earth: 0.1, air: 0.0 };
    
    const compatibility = calculateElementalCompatibility(fireProps, otherFireProps);
    expect(compatibility).toBeGreaterThanOrEqual(0.9);
  });
  
  test('different elements have good compatibility', () => {
    const fireProps = { fire: 0.8, water: 0.1, earth: 0.1, air: 0.0 };
    const waterProps = { fire: 0.1, water: 0.8, earth: 0.1, air: 0.0 };
    
    const compatibility = calculateElementalCompatibility(fireProps, waterProps);
    expect(compatibility).toBeGreaterThanOrEqual(0.7);
    expect(compatibility).toBeLessThan(0.9);
  });
});
```

## 🚀 Advanced Topics

### Campaign System Development
The project includes a sophisticated automated quality improvement system:

```typescript
// Creating custom campaigns
interface CampaignConfig {
  errorThreshold: number;
  automationLevel: 'conservative' | 'aggressive';
  rollbackStrategy: 'git-stash' | 'file-backup';
  validationRequired: boolean;
}

// Campaign with safety protocols
const campaign = new CampaignController({
  type: 'custom-improvement',
  config: {
    errorThreshold: 100,
    automationLevel: 'conservative',
    rollbackStrategy: 'git-stash',
    validationRequired: true
  }
});
```

### Performance Optimization
```typescript
// Caching astronomical calculations
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

class AstronomicalCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

### Cultural Sensitivity in Code
```typescript
// Respectful cultural integration
interface CulturalContext {
  cuisine: string;
  dietaryRestrictions: string[];
  culturalPreferences: string[];
  astrologicalComfort: 'none' | 'basic' | 'advanced';
}

function generateCulturallyAwareRecommendations(
  context: CulturalContext,
  astrologicalData: any
): Recommendation[] {
  // Honor cultural preferences while adding cosmic timing
  const baseRecommendations = getCulturalRecommendations(context);
  
  if (context.astrologicalComfort !== 'none') {
    return enhanceWithCosmicTiming(baseRecommendations, astrologicalData);
  }
  
  return baseRecommendations;
}
```

## 🎯 First Contribution Ideas

### Beginner-Friendly Tasks
1. **Add unit tests** for existing utility functions
2. **Improve documentation** with examples and clarifications
3. **Fix TypeScript warnings** using the campaign system
4. **Add ingredient data** with proper elemental properties

### Intermediate Tasks
1. **Implement new astrological calculations** with proper validation
2. **Create new UI components** following elemental design principles
3. **Optimize performance** of existing calculations
4. **Add cultural cuisine integration** with respectful design

### Advanced Tasks
1. **Develop new campaign types** for quality improvement
2. **Implement complex astrological features** with cultural sensitivity
3. **Create advanced testing scenarios** for edge cases
4. **Design new architectural patterns** for scalability

## 📚 Essential Reading

### Must-Read Documentation
- [Project Overview](project-overview.md) - Vision and principles
- [Architecture Guide](../technical/architecture.md) - System design
- [Astrological Integration](../guides/astrological-integration.md) - Cosmic features
- [Contributing Guidelines](../development/contributing.md) - Contribution process

### Key Source Files
- `src/utils/reliableAstronomy.ts` - Astronomical calculations
- `src/constants/elementalProperties.ts` - Four-element system
- `src/services/campaign/CampaignController.ts` - Quality improvement
- `src/calculations/culinary/` - Culinary astrology

### Steering Files (Kiro Context)
- `.kiro/steering/tech.md` - Technology stack guidance
- `.kiro/steering/astrology-rules.md` - Astrological calculation rules
- `.kiro/steering/elemental-principles.md` - Four-element system enforcement
- `.kiro/steering/campaign-integration.md` - Campaign system patterns

## 🤝 Getting Help

### When You're Stuck
1. **Check the documentation** - Most questions are answered here
2. **Look at existing code** - Find similar implementations
3. **Run the tests** - Understanding tests helps understand requirements
4. **Ask in discussions** - Community is helpful and welcoming

### Code Review Process
1. **Self-review first** - Check your own code thoroughly
2. **Write descriptive commits** - Explain what and why
3. **Include tests** - New features need test coverage
4. **Be responsive** - Address review feedback promptly

## 🎉 Welcome to the Team!

You're now ready to contribute to WhatToEatNext! Remember:

- **Start small** - Pick up beginner-friendly issues first
- **Ask questions** - The community is here to help
- **Follow standards** - Quality is important to us
- **Have fun** - You're building something unique and meaningful

**Ready to code? Check out the [Contributing Guidelines](../development/contributing.md) and pick your first issue!** 🚀

---

*Need help with setup? Check the [Troubleshooting Guide](../development/troubleshooting.md) or create an issue.*