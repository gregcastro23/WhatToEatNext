# 🌟 Astrological Documentation Index

## Overview

This index provides a comprehensive guide to all astrological documentation in the WhatToEatNext project. Use this as your starting point for understanding and working with the astrological systems.

## 📚 Core Documentation

### 1. **[Astrological Domain Knowledge Base](./astrological-domain-knowledge.md)**
**Primary Reference** - Complete guide to astrological concepts and implementation
- Core astrological concepts (planets, zodiac, elements, alchemy)
- Planetary position calculations and data structures
- Lunar phase calculations and modifiers
- Alchemical calculations and thermodynamic metrics
- Implementation patterns and best practices
- Common pitfalls and anti-patterns

### 2. **[Planetary Calculations Guide](./planetary-calculations-guide.md)**
**Implementation Guide** - Detailed instructions for planetary calculations
- Primary calculation functions and API hierarchy
- Longitude to zodiac sign conversion
- Lunar node calculations using Meeus formulas
- Planetary dignity system and strength calculations
- Elemental influence mappings (diurnal/nocturnal)
- Performance optimization and caching strategies

### 3. **[Elemental Systems Guide](./elemental-systems-guide.md)**
**Critical Reference** - Four-element system implementation and principles
- Self-reinforcement principle (elements work best with themselves)
- Elemental compatibility matrix (no opposing elements)
- Seasonal and lunar phase modifiers
- Advanced elemental intelligence systems
- Forbidden anti-patterns and code review guidelines
- Testing patterns for elemental logic

### 4. **[Astronomical Testing Guide](./astronomical-testing-guide.md)**
**Testing Strategy** - Comprehensive testing approaches for astronomical calculations
- Unit testing patterns for planetary positions and lunar phases
- Integration testing for complete astrological flows
- Performance testing and memory usage validation
- Edge case testing and data consistency validation
- Mock data generators and test utilities
- Continuous integration configuration

## 🔗 Related Documentation

### Existing Guides
- **[Astrological Integration Guide](./ASTROLOGICAL_INTEGRATION.md)** - API integration and service layer
- **[Planetary System Guide](./planetary-system.md)** - Transit validation and position system
- **[Alchemical Pillars Guide](./alchemical-pillars.md)** - 14 alchemical transformation processes

### Implementation Files
- **[Elemental Principles Guide](./elemental-principles-guide.md)** - Four-element system rules
- **[Current Moment System](./CURRENT_MOMENT_SYSTEM.md)** - Real-time astrological state

## 🎯 Quick Reference by Use Case

### For New Developers
1. Start with **[Astrological Domain Knowledge Base](./astrological-domain-knowledge.md)**
2. Review **[Elemental Systems Guide](./elemental-systems-guide.md)** for critical principles
3. Check **[Astronomical Testing Guide](./astronomical-testing-guide.md)** for testing patterns

### For API Integration
1. **[Planetary Calculations Guide](./planetary-calculations-guide.md)** - Data source hierarchy
2. **[Astrological Integration Guide](./ASTROLOGICAL_INTEGRATION.md)** - Service layer patterns
3. **[Planetary System Guide](./planetary-system.md)** - Transit validation

### For Testing Implementation
1. **[Astronomical Testing Guide](./astronomical-testing-guide.md)** - Complete testing strategy
2. **[Astrological Domain Knowledge Base](./astrological-domain-knowledge.md)** - Testing approaches section
3. **[Elemental Systems Guide](./elemental-systems-guide.md)** - Anti-pattern detection tests

### For Code Review
1. **[Elemental Systems Guide](./elemental-systems-guide.md)** - Code review checklist
2. **[Astrological Domain Knowledge Base](./astrological-domain-knowledge.md)** - Best practices summary
3. **[Planetary Calculations Guide](./planetary-calculations-guide.md)** - Common pitfalls

## 🔧 Key Implementation Files

### Core Calculation Files
```
src/calculations/
├── alchemicalEngine.ts              # Main alchemical calculations
├── core/
│   ├── elementalCalculations.ts     # Elemental balance calculations
│   └── planetaryInfluences.ts       # Planetary influence calculations
├── culinaryAstrology.ts             # Culinary astrology integration
└── enhancedAlchemicalMatching.ts    # Advanced compatibility algorithms
```

### Utility Functions
```
src/utils/
├── reliableAstronomy.ts             # Reliable planetary position calculations
├── elemental/
│   └── elementalUtils.ts            # Elemental utility functions
└── astrology/
    ├── core.ts                      # Core astrological utilities
    ├── positions.ts                 # Position calculation utilities
    └── validation.ts                # Validation utilities
```

### Type Definitions
```
src/types/
├── alchemy.ts                       # Alchemical type definitions
├── celestial.ts                     # Celestial type definitions
├── astrology.ts                     # Astrological type definitions
└── elemental.ts                     # Elemental type definitions
```

### Data Files
```
src/data/
├── planets/                         # Planetary transit data
├── transits/                        # Transit date mappings
└── constants/
    └── planetaryElements.ts         # Planetary element mappings
```

### Testing Files
```
src/__tests__/
├── alchemicalPillars.test.ts        # Core alchemical tests
├── astrologize-integration.test.ts  # API integration tests
├── culinaryAstrology.test.ts        # Culinary astrology tests
└── utils/
    └── elementalCompatibility.test.ts # Elemental compatibility tests
```

## 🚨 Critical Principles to Remember

### 1. Elemental Logic (NEVER VIOLATE)
```typescript
// ✅ CORRECT: Elements work best with themselves
const compatibility = { Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 } };

// ❌ FORBIDDEN: Opposition logic
const opposingElements = { Fire: 'Water' }; // NEVER implement this
```

### 2. Data Source Hierarchy
```typescript
// Always follow this order:
// 1. NASA JPL Horizons API (primary)
// 2. Public Astronomy APIs (secondary)  
// 3. TimeAndDate.com API (tertiary)
// 4. Fallback cached data (last resort)
```

### 3. Validation Requirements
```typescript
// Always validate:
// - Planetary positions (sign, degree, longitude ranges)
// - Elemental properties (sum to 1.0)
// - Compatibility scores (≥ 0.7)
// - API responses (structure and data types)
```

### 4. Performance Standards
```typescript
// Requirements:
// - Planetary calculations: < 2 seconds
// - Elemental calculations: < 100ms
// - API timeouts: 5 seconds maximum
// - Cache duration: 6 hours for positions
```

## 🔍 Troubleshooting Guide

### Common Issues and Solutions

| Issue | Documentation | Solution |
|-------|---------------|----------|
| Planetary positions returning null | [Planetary Calculations Guide](./planetary-calculations-guide.md) | Check API hierarchy and fallback mechanisms |
| Elemental compatibility below 0.7 | [Elemental Systems Guide](./elemental-systems-guide.md) | Review self-reinforcement principles |
| Tests failing for astronomical calculations | [Astronomical Testing Guide](./astronomical-testing-guide.md) | Check mock data and validation patterns |
| API integration errors | [Astrological Integration Guide](./ASTROLOGICAL_INTEGRATION.md) | Review error handling and timeout settings |
| Alchemical calculations returning NaN | [Astrological Domain Knowledge Base](./astrological-domain-knowledge.md) | Check for zero values in denominators |

### Debug Checklist
1. **Planetary Positions**: Are all required planets present with valid ranges?
2. **Elemental Properties**: Do they sum to 1.0 and follow self-reinforcement?
3. **API Responses**: Are timeouts and fallbacks working correctly?
4. **Type Safety**: Are all inputs validated before processing?
5. **Performance**: Are calculations completing within time limits?

## 📈 Development Workflow

### 1. Before Making Changes
- [ ] Read relevant documentation sections
- [ ] Understand elemental self-reinforcement principles
- [ ] Review existing test patterns
- [ ] Check for anti-patterns in similar code

### 2. During Implementation
- [ ] Follow established calculation patterns
- [ ] Use safe property access with type guards
- [ ] Implement proper fallback mechanisms
- [ ] Add comprehensive error handling

### 3. Before Submitting
- [ ] Run all astronomical tests
- [ ] Validate elemental compatibility scores ≥ 0.7
- [ ] Check performance requirements
- [ ] Review code against anti-pattern checklist

## 🎓 Learning Path

### Beginner (New to Astrological Systems)
1. **[Astrological Domain Knowledge Base](./astrological-domain-knowledge.md)** - Core concepts
2. **[Elemental Systems Guide](./elemental-systems-guide.md)** - Critical principles
3. **[Astronomical Testing Guide](./astronomical-testing-guide.md)** - Basic testing

### Intermediate (Implementing Features)
1. **[Planetary Calculations Guide](./planetary-calculations-guide.md)** - Implementation details
2. **[Astrological Integration Guide](./ASTROLOGICAL_INTEGRATION.md)** - Service integration
3. **[Alchemical Pillars Guide](./alchemical-pillars.md)** - Advanced concepts

### Advanced (System Architecture)
1. All documentation sections
2. Campaign system integration patterns
3. Performance optimization strategies
4. Advanced testing and validation techniques

## 📞 Support and Contribution

### Getting Help
- Check this index for relevant documentation
- Review troubleshooting guide above
- Examine existing test files for patterns
- Look at implementation files for examples

### Contributing to Documentation
- Follow established patterns and formatting
- Include code examples and test cases
- Update this index when adding new documentation
- Ensure all links are working and up-to-date

---

*This index is maintained as the central hub for all astrological documentation. Update it whenever new guides are added or existing ones are modified.*