# WhatToEatNext Technology Stack Documentation

## Core Technology Stack

### Frontend Framework
**Next.js 15.3.4** - Modern React framework with App Router
- **App Router Architecture:** Route-based organization with nested layouts
- **Server Components:** Optimized rendering for astrological calculations
- **API Routes:** Integrated backend for external service connections
- **Static Generation:** Pre-rendered pages for optimal performance
- **Image Optimization:** Automatic optimization for ingredient and recipe images

### React Ecosystem
**React 19.1.0** - Latest React with concurrent features
- **Concurrent Features:** Improved performance for real-time astrological updates
- **Suspense:** Graceful loading states for astronomical calculations
- **Error Boundaries:** Cosmic-aware error handling with fallback UI
- **Context API:** Centralized astrological state management
- **Custom Hooks:** Reusable logic for astrological calculations and API calls

### TypeScript Configuration
**TypeScript 5.1.6** - Strict typing with astrological domain modeling
```json
{
  "compilerOptions": {
    "target": "es2018",
    "strict": true,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

**TypeScript Patterns:**
- **Domain-Specific Types:** Comprehensive type system for astrological calculations
- **Union Types:** Flexible typing for elemental properties and planetary positions
- **Generic Constraints:** Type-safe recommendation algorithms
- **Utility Types:** Helper types for data transformations
- **Strict Mode Relaxation:** Balanced strictness for rapid development with quality

## Specialized Astrological Libraries

### Astronomical Calculation Libraries
**Astronomia 4.1.1** - High-precision astronomical calculations
- **Planetary Positions:** Accurate planetary position calculations
- **Coordinate Systems:** Conversion between astronomical coordinate systems
- **Time Calculations:** Precise temporal calculations for astrological timing
- **Ephemeris Data:** Access to astronomical ephemeris calculations

**Astronomy-Engine 2.1.17** - Modern astronomical computation library
- **Real-time Calculations:** Current planetary positions and lunar phases
- **Event Predictions:** Eclipse, transit, and conjunction calculations
- **Coordinate Transformations:** Celestial to terrestrial coordinate conversions
- **Performance Optimized:** Fast calculations suitable for real-time applications

**SunCalc 1.9.0** - Solar position and timing calculations
- **Solar Positions:** Sun position calculations for any location and time
- **Sunrise/Sunset:** Precise sunrise and sunset timing calculations
- **Solar Phases:** Dawn, dusk, and twilight calculations
- **Seasonal Integration:** Solar timing for seasonal food recommendations

### Date and Time Management
**Date-fns 2.30.0** - Modern date utility library
- **Timezone Handling:** Accurate timezone calculations for global users
- **Date Arithmetic:** Precise date calculations for astrological timing
- **Formatting:** Consistent date formatting across the application
- **Locale Support:** Internationalization support for date displays

### Data Validation and Schema
**Zod 3.24.1** - TypeScript-first schema validation
- **Runtime Validation:** Validate astrological data at runtime
- **Type Inference:** Automatic TypeScript type generation from schemas
- **Error Handling:** Detailed validation error messages
- **API Integration:** Validate external API responses for reliability

## Development Tools and Quality Assurance

### Code Quality and Linting
**ESLint 8.57.0** with TypeScript integration
- **Custom Rules:** Project-specific linting rules for astrological code patterns
- **Max Warnings:** Configured for 10,000 warnings during active development
- **Auto-fixing:** Automated code formatting and simple error corrections
- **TypeScript Integration:** Full TypeScript support with @typescript-eslint

**ESLint Configuration:**
```javascript
// eslint.config.cjs
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off', // Relaxed for rapid development
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

**Prettier 2.8.8** - Code formatting
- **Consistent Formatting:** Automated code formatting across the codebase
- **Integration:** Seamless integration with ESLint and development workflow
- **Configuration:** Project-specific formatting rules for readability

### Testing Framework
**Jest 29.6.1** - Comprehensive testing framework
- **Unit Testing:** Component and utility function testing
- **Integration Testing:** Service layer and API integration testing
- **Astrological Testing:** Specialized tests for astronomical calculations
- **Coverage Reporting:** Code coverage analysis and reporting

**Testing Library Integration:**
- **@testing-library/react 16.1.0:** React component testing utilities
- **@testing-library/jest-dom 6.6.3:** Custom Jest matchers for DOM testing
- **@testing-library/user-event 14.5.1:** User interaction simulation

**Astrological Testing Patterns:**
```typescript
// Example: Testing planetary position calculations
describe('Planetary Calculations', () => {
  test('validates transit dates against stored data', () => {
    const transitDate = new Date('2024-05-16');
    const positions = calculatePlanetaryPositions(transitDate);
    expect(positions).toMatchValidTransitData();
  });
});
```

### Build and Development Tools
**Tailwind CSS 3.3.2** - Utility-first CSS framework
- **Elemental Theming:** Custom color schemes reflecting the four elements
- **Responsive Design:** Mobile-first approach for all astrological interfaces
- **Component Styling:** Consistent styling patterns across components
- **Performance:** Optimized CSS bundle with unused style purging

**PostCSS Configuration:**
- **Autoprefixer:** Automatic vendor prefix handling
- **Custom Properties:** CSS variables for dynamic theming
- **Nesting:** Enhanced CSS nesting capabilities
- **Import Resolution:** Efficient CSS import handling

**Husky 8.0.3** - Git hooks for quality assurance
- **Pre-commit Hooks:** Automated linting and formatting before commits
- **Pre-push Hooks:** Testing and validation before pushing changes
- **Quality Gates:** Prevent commits that break build or tests

## Campaign System Integration

### Automated Code Quality Improvement
The project includes a sophisticated campaign system for automated code quality improvement:

**Campaign Types:**
- **TypeScript Error Reduction:** Systematic reduction from 4,310 to <100 errors
- **Linting Cleanup:** Automated fixing of ESLint violations
- **Import Optimization:** Unused import detection and removal
- **Performance Optimization:** Bundle size and runtime performance improvements

**Campaign Infrastructure:**
```typescript
// Campaign system integration
interface CampaignConfig {
  errorThreshold: number;
  automationLevel: 'conservative' | 'aggressive';
  rollbackStrategy: 'git-stash' | 'file-backup';
  validationRequired: boolean;
}

const typescriptCampaign: CampaignConfig = {
  errorThreshold: 100,
  automationLevel: 'conservative',
  rollbackStrategy: 'git-stash',
  validationRequired: true
};
```

**Safety Protocols:**
- **Rollback Mechanisms:** Automatic rollback on build failures
- **Validation Steps:** Multi-stage validation before applying changes
- **Progress Tracking:** Detailed metrics and progress reporting
- **Human Oversight:** Manual approval for critical changes

### Performance Monitoring
**Custom Performance Monitoring System:**
- **Build Performance:** TypeScript compilation time tracking
- **Runtime Performance:** Component render time and memory usage
- **Astrological Calculations:** Calculation speed and accuracy monitoring
- **API Performance:** External service response time tracking

## External API Integration

### Nutritional Data APIs
**USDA Food Data Central API Integration:**
- **Ingredient Data:** Comprehensive nutritional information
- **Caching Strategy:** Intelligent caching with appropriate TTL
- **Rate Limiting:** Respectful API usage with backoff strategies
- **Fallback Data:** Local nutritional data for offline functionality

**Spoonacular API Integration:**
- **Recipe Data:** Extensive recipe database access
- **Search Functionality:** Advanced recipe search capabilities
- **Rate Limiting:** Daily quota management (150 requests/day)
- **Caching:** Aggressive caching to minimize API calls

### Astrological Data APIs
**Custom Astrological API Integration:**
- **Planetary Positions:** Real-time planetary position data
- **Lunar Phases:** Current and future lunar phase information
- **Transit Calculations:** Planetary transit timing and effects
- **Fallback Strategy:** Local ephemeris data for reliability

**API Integration Patterns:**
```typescript
// Example: Robust API integration with fallbacks
class AstrologicalApiClient {
  async getPlanetaryPositions(date: Date): Promise<PlanetaryPositions> {
    try {
      return await this.fetchFromPrimaryApi(date);
    } catch (error) {
      console.warn('Primary API failed, using cached data');
      return await this.getCachedPositions(date);
    }
  }
}
```

## Error Handling and Reliability

### Error Handling Strategy
**Multi-layered Error Handling:**
- **Component Level:** Error boundaries with cosmic-aware fallback UI
- **Service Level:** Graceful degradation with cached data
- **API Level:** Retry mechanisms and circuit breakers
- **Calculation Level:** Validation and fallback for astronomical calculations

**Error Recovery Patterns:**
```typescript
// Example: Astrological calculation error handling
function calculateWithFallback<T>(
  calculation: () => T,
  fallback: T,
  validator: (result: T) => boolean
): T {
  try {
    const result = calculation();
    return validator(result) ? result : fallback;
  } catch (error) {
    logError('Calculation failed, using fallback', error);
    return fallback;
  }
}
```

### Data Validation and Consistency
**Validation Strategies:**
- **Runtime Validation:** Zod schemas for API responses and user input
- **Type Guards:** TypeScript type guards for runtime type checking
- **Data Consistency:** Cross-validation of astrological calculations
- **Fallback Validation:** Ensure fallback data meets quality standards

## Development Workflow Integration

### TypeScript Configuration Optimization
**Balanced Strictness for Development Velocity:**
- **Strict Mode:** Enabled for type safety
- **Relaxed Rules:** Some strict checks disabled for rapid development
- **Path Mapping:** Convenient import paths for better developer experience
- **Incremental Compilation:** Faster builds during development

### Build Optimization
**Next.js Build Configuration:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['astronomia', 'astronomy-engine']
  },
  webpack: (config) => {
    // Optimize astronomical library bundling
    config.resolve.fallback = {
      fs: false,
      path: false
    };
    return config;
  }
};
```

**Performance Optimizations:**
- **Bundle Splitting:** Separate bundles for astrological calculations
- **Tree Shaking:** Eliminate unused code from astronomical libraries
- **Code Splitting:** Lazy loading of non-critical astrological features
- **Image Optimization:** Automatic optimization for ingredient images

### Development Scripts
**Custom Development Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint --config eslint.config.cjs src --max-warnings=10000",
    "lint:fix": "eslint --config eslint.config.cjs --fix src",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "clean:backups": "node src/scripts/clean-backups.js"
  }
}
```

## Security and Best Practices

### API Security
**Secure API Integration:**
- **Environment Variables:** Secure storage of API keys and secrets
- **Rate Limiting:** Client-side rate limiting to prevent abuse
- **Input Validation:** Comprehensive validation of all external data
- **CORS Configuration:** Proper CORS setup for API endpoints

### Data Privacy
**Privacy-First Approach:**
- **Local Storage:** Sensitive astrological data stored locally when possible
- **Minimal Data Collection:** Only collect necessary user information
- **Anonymization:** User data anonymized for analytics and improvement
- **Consent Management:** Clear consent mechanisms for data usage

### Performance Security
**Performance and Security Balance:**
- **Bundle Analysis:** Regular analysis of bundle size and dependencies
- **Dependency Auditing:** Regular security audits of npm dependencies
- **CSP Headers:** Content Security Policy for XSS protection
- **HTTPS Enforcement:** Secure communication for all API calls

## Future Technology Considerations

### Scalability Preparations
**Architecture for Growth:**
- **Microservices Ready:** Service layer designed for potential microservices migration
- **Database Abstraction:** Data layer ready for database integration
- **Caching Strategy:** Redis-ready caching layer for horizontal scaling
- **CDN Integration:** Asset delivery optimization for global users

### Technology Evolution
**Staying Current:**
- **React 19 Features:** Leveraging latest React concurrent features
- **Next.js Evolution:** Ready for Next.js updates and new features
- **TypeScript Advancement:** Prepared for TypeScript language improvements
- **Astronomical Libraries:** Monitoring for new astronomical calculation libraries

## References and Integration Points

### Configuration Files
- #[[file:package.json]] - Complete dependency and script configuration
- #[[file:tsconfig.json]] - TypeScript compiler configuration
- #[[file:next.config.js]] - Next.js build and runtime configuration
- #[[file:eslint.config.cjs]] - ESLint rules and configuration

### Campaign System Integration
- #[[file:src/services/campaign/README.md]] - Campaign system overview
- #[[file:src/services/campaign/CampaignController.ts]] - Campaign orchestration
- #[[file:src/services/campaign/TypeScriptErrorAnalyzer.ts]] - Error analysis system

### Performance Monitoring
- #[[file:src/services/PerformanceMonitoringService.ts]] - Performance tracking
- #[[file:src/hooks/usePerformanceMetrics.ts]] - Performance monitoring hooks
- #[[file:src/components/debug/ConsolidatedDebugInfo.tsx]] - Debug information display