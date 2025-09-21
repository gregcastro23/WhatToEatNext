# WhatToEatNext Project Structure Guide

## Project Architecture Overview

WhatToEatNext is a sophisticated Next.js application that combines modern web development with astrological calculations and culinary recommendations. The architecture follows a layered approach with clear separation between presentation, business logic, data management, and specialized astrological computations.

## Core Directory Structure

### `/src/app` - Next.js App Router Architecture
**Purpose:** Modern Next.js 15 App Router with route-based organization and astrological feature integration.

**Key Patterns:**
- Route-based organization with specialized astrological demos
- API routes for external service integration (Spoonacular, nutritional data)
- Layout components with astrological context providers
- Error boundaries with cosmic-aware error handling

**Notable Routes:**
- `/alchemize-demo` - Alchemical transformation demonstrations
- `/astrologize-demo` - Astrological calculation showcases  
- `/cooking-methods` - Elemental cooking method recommendations
- `/what-to-eat-next` - Main recommendation engine interface

### `/src/calculations` - Astrological & Alchemical Computation Engines
**Purpose:** Core mathematical and astrological calculation systems that power the recommendation engine.

**Key Components:**
- `culinary/` - Specialized culinary astrology calculations
- `core/` - Fundamental astrological computation primitives
- `alchemicalEngine.ts` - Primary alchemical transformation system
- `culinaryAstrology.ts` - Integration of astrological principles with food recommendations
- `enhancedAlchemicalMatching.ts` - Advanced ingredient compatibility algorithms

**Architectural Principles:**
- Pure functions for mathematical calculations
- Fallback mechanisms for astronomical data failures
- Validation of planetary positions against transit dates
- Elemental harmony calculations based on four-element system

### `/src/data` - Ingredient Databases & Astrological Reference Data
**Purpose:** Comprehensive data stores with elemental properties, planetary correspondences, and nutritional information.

**Organization:**
- `ingredients/` - Categorized ingredient databases with elemental properties
- `planets/` - Planetary position data and transit information
- `recipes/` - Recipe databases with astrological timing
- `cuisines/` - Cultural cuisine data with astrological correspondences
- `cooking/` - Cooking method data with elemental associations

**Data Patterns:**
- All ingredients have Fire/Water/Earth/Air elemental values
- Planetary correspondences for timing recommendations
- Cultural sensitivity in ingredient naming and categorization
- Nutritional data integration with USDA standards

### `/src/components` - React Components with Astrological Context
**Purpose:** Reusable UI components that integrate astrological state and cosmic timing.

**Component Categories:**
- `AstrologyChart/` - Astrological chart visualization components
- `CelestialDisplay/` - Planetary position and lunar phase displays
- `ElementalDisplay/` - Four-element system visualizations
- `FoodRecommender/` - Core recommendation interface components
- `error-boundaries/` - Cosmic-aware error handling components
- `debug/` - Development and debugging utilities

**Integration Patterns:**
- Context-aware components that respond to planetary changes
- Elemental property displays with visual harmony indicators
- Real-time updates based on astronomical calculations
- Cultural sensitivity in food presentation

### `/src/services` - Business Logic & External Integrations
**Purpose:** Service layer that orchestrates business logic, external API calls, and data transformations.

**Service Categories:**
- `campaign/` - Automated code quality improvement systems
- Core services for astrological calculations and recommendations
- API integration services for external data sources
- Caching and performance optimization services

**Key Services:**
- `AstrologicalService.ts` - Primary astrological calculation service
- `AlchemicalService.ts` - Alchemical transformation orchestration
- `RecommendationService.ts` - Unified recommendation engine
- `PerformanceMonitoringService.ts` - System performance tracking

**Campaign System Integration:**
The `/src/services/campaign/` directory contains a sophisticated automated code quality improvement system:
- TypeScript error reduction campaigns (targeting <100 errors from 4,310)
- Automated linting and code cleanup systems
- Performance monitoring and optimization campaigns
- Safety protocols and rollback mechanisms

### `/src/context` & `/src/contexts` - State Management
**Purpose:** React context providers for sharing astrological state across the component tree.

**Context Providers:**
- `AstrologicalContext` - Current planetary positions and cosmic state
- `ChartContext` - User's personal astrological chart data
- `AlchemicalContext` - Alchemical transformation state
- `ThemeContext` - UI theming with seasonal adaptations

**State Management Patterns:**
- Centralized astrological state with real-time updates
- Context consolidation to prevent provider nesting issues
- Performance optimization through selective context subscriptions
- Fallback state management for calculation failures

### `/src/constants` - Configuration & Reference Data
**Purpose:** Static configuration data, elemental properties, and astrological reference information.

**Key Constants:**
- `elementalProperties.ts` - Four-element system definitions and compatibility scores
- `planetaryElements.ts` - Planetary correspondences and elemental associations
- `alchemicalPillars.ts` - The 14 Alchemical Pillars system definitions
- `seasonalConstants.ts` - Astronomical season calculations and transitions

**Design Principles:**
- Immutable reference data for consistent calculations
- Elemental harmony principles (no opposing elements, self-reinforcement)
- Cultural sensitivity in naming and categorization
- Extensible structure for adding new correspondences

### `/src/types` - TypeScript Type Definitions
**Purpose:** Comprehensive type system that ensures type safety across astrological calculations and UI components.

**Type Categories:**
- `astrological.ts` - Core astrological calculation types
- `elemental.ts` - Four-element system type definitions
- `ingredient.ts` - Ingredient and recipe type structures
- `campaign.ts` - Campaign system type definitions

**Type Safety Patterns:**
- Strict typing for astrological calculations to prevent errors
- Union types for elemental properties and planetary positions
- Generic types for flexible recommendation algorithms
- Validation types for runtime data checking

### `/src/utils` - Utility Functions & Helpers
**Purpose:** Pure utility functions for calculations, validations, and data transformations.

**Utility Categories:**
- `astrology/` - Astrological calculation utilities
- `elemental/` - Elemental harmony and compatibility functions
- `recipe/` - Recipe matching and enhancement utilities
- `common/` - Shared utility functions

**Key Utilities:**
- `planetaryConsistencyCheck.ts` - Validates planetary position data
- `elementalCalculations.ts` - Core elemental harmony calculations
- `reliableAstronomy.ts` - Fallback mechanisms for astronomical calculations
- `validation.ts` - Data validation and error checking

### `/src/hooks` - Custom React Hooks
**Purpose:** Reusable React hooks that encapsulate astrological state logic and API interactions.

**Hook Categories:**
- Astrological state hooks (`useAstrologicalState`, `useRealtimePlanetaryPositions`)
- Recommendation hooks (`useFoodRecommendations`, `useIngredientRecommendations`)
- Performance hooks (`usePerformanceMetrics`, `useDebugSettings`)
- Integration hooks (`useAstrologize`, `useContextServiceBridge`)

## Key Architectural Patterns

### Elemental Properties System
Every ingredient and recipe component includes elemental properties:
```typescript
interface ElementalProperties {
  fire: number;    // Energy, spice, quick cooking
  water: number;   // Cooling, fluid, steaming
  earth: number;   // Grounding, root vegetables, slow cooking
  air: number;     // Light, leafy, raw preparations
}
```

### Planetary Correspondences
Components integrate current planetary positions for timing recommendations:
```typescript
interface PlanetaryInfluence {
  planet: Planet;
  position: number;
  element: Element;
  influence: number;
  timing: OptimalTiming;
}
```

### Campaign Systems Integration
Automated code quality improvement systems that:
- Monitor TypeScript error counts and trigger cleanup campaigns
- Implement safety protocols with rollback mechanisms
- Track performance metrics and quality improvements
- Integrate with development workflows for continuous improvement

### Context Provider Patterns
Hierarchical context structure that provides:
- Real-time astrological state updates
- Cached calculation results for performance
- Fallback mechanisms for API failures
- Cultural sensitivity settings and preferences

### Error Handling and Fallbacks
Robust error handling that:
- Gracefully degrades when astrological APIs fail
- Uses cached planetary positions as fallbacks
- Maintains user experience during calculation errors
- Logs errors for debugging while preserving functionality

## Component Organization Principles

### Atomic Design with Astrological Context
- **Atoms:** Basic UI elements with elemental styling
- **Molecules:** Ingredient cards, planetary displays, elemental indicators
- **Organisms:** Recommendation engines, astrological charts, recipe builders
- **Templates:** Page layouts with cosmic context integration
- **Pages:** Complete user experiences with full astrological integration

### Separation of Concerns
- **Presentation:** React components focused on UI rendering
- **Logic:** Services and hooks handling business logic
- **Data:** Separate data layer with caching and validation
- **Calculations:** Pure functions for mathematical operations

### Performance Optimization
- **Lazy Loading:** Components load based on astrological relevance
- **Memoization:** Expensive calculations cached with appropriate invalidation
- **Context Optimization:** Selective subscriptions to prevent unnecessary re-renders
- **Bundle Splitting:** Astrological features loaded on demand

## Service Layer Architecture

### Service Integration Patterns
Services follow a consistent pattern for:
- **Initialization:** Setup with fallback configurations
- **Caching:** Intelligent caching with cosmic timing considerations
- **Error Handling:** Graceful degradation with user-friendly messages
- **Performance:** Monitoring and optimization for astrological calculations

### External API Integration
- **Spoonacular API:** Recipe data with rate limiting and caching
- **Nutritional APIs:** USDA and other nutritional databases
- **Astrological APIs:** Planetary position services with local fallbacks
- **Cultural APIs:** Cuisine and ingredient databases with sensitivity

### Campaign System Architecture
The campaign system provides:
- **Automated Quality Improvement:** Systematic error reduction
- **Performance Monitoring:** Real-time quality metrics
- **Safety Protocols:** Rollback mechanisms and validation
- **Integration Points:** Hooks into development workflows

## Data Flow Architecture

### Astrological Data Flow
1. **Astronomical Calculations:** Real-time planetary position calculations
2. **Validation:** Transit date verification and consistency checking
3. **Caching:** Intelligent caching with cosmic timing considerations
4. **Distribution:** Context providers distribute state to components
5. **Rendering:** Components render with current astrological context

### Recommendation Engine Flow
1. **Input Collection:** User preferences and current cosmic conditions
2. **Elemental Analysis:** Four-element compatibility calculations
3. **Cultural Integration:** Cuisine and dietary restriction considerations
4. **Timing Optimization:** Planetary timing for optimal preparation
5. **Presentation:** Formatted recommendations with explanations

### Error Recovery Flow
1. **Detection:** Automatic error detection and classification
2. **Fallback:** Graceful degradation to cached or default data
3. **Recovery:** Attempt to restore full functionality
4. **Reporting:** Error logging and user notification
5. **Learning:** System improvement based on error patterns

## Integration with External Systems

### Development Tool Integration
- **TypeScript:** Strict typing for astrological calculations
- **ESLint:** Custom rules for astrological code patterns
- **Jest:** Testing framework with astronomical calculation validation
- **Campaign Systems:** Automated quality improvement integration

### API Integration Patterns
- **Rate Limiting:** Respectful API usage with intelligent caching
- **Fallback Strategies:** Multiple data sources with priority ordering
- **Error Handling:** Graceful degradation when external services fail
- **Security:** Secure credential management and API key protection

### Cultural Sensitivity Integration
- **Inclusive Design:** Respectful representation of diverse culinary traditions
- **Accessibility:** Universal design principles throughout the application
- **Internationalization:** Support for multiple languages and cultural contexts
- **Ethical AI:** Responsible use of AI for cultural food recommendations

## References and Documentation

### Architecture Documentation
- #[[file:src/docs/architecture-principles.md]] - Detailed architectural principles
- #[[file:src/docs/phase3-migration-guide.md]] - Component migration guidelines
- #[[file:src/services/README.md]] - Service layer documentation

### Component Documentation
- #[[file:src/components/README.md]] - Component organization guide
- #[[file:src/contexts/README.md]] - Context provider documentation
- #[[file:src/types/README.md]] - Type system documentation

### Campaign System Documentation
- #[[file:src/services/campaign/README.md]] - Campaign system overview
- #[[file:src/services/campaign/DEPLOYMENT_GUIDE.md]] - Deployment procedures
- #[[file:src/services/campaign/TROUBLESHOOTING_GUIDE.md]] - Troubleshooting guide