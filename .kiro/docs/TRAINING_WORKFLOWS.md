# Kiro Optimization Training Workflows

## Overview

This document provides structured training workflows for team members to
effectively use the optimized Kiro workspace configuration. The training is
designed to be progressive, building from basic concepts to advanced usage
patterns.

## Training Levels

### Level 1: Basic Kiro Usage (1-2 hours)

**Target Audience**: New team members, basic Kiro users **Prerequisites**: Basic
understanding of TypeScript and React

### Level 2: Astrological Development (2-3 hours)

**Target Audience**: Developers working on astrological features
**Prerequisites**: Level 1 completion, understanding of the project domain

### Level 3: Advanced Automation (1-2 hours)

**Target Audience**: Senior developers, DevOps team members **Prerequisites**:
Level 2 completion, campaign system familiarity

### Level 4: Configuration Management (1 hour)

**Target Audience**: Tech leads, system administrators **Prerequisites**: Level
3 completion, system administration experience

## Level 1: Basic Kiro Usage

### Learning Objectives

- Understand Kiro's role in the development workflow
- Navigate the optimized workspace effectively
- Use basic steering file guidance
- Recognize automated assistance features

### Module 1.1: Workspace Overview (20 minutes)

#### Hands-on Exercise: Workspace Exploration

1. **Open the WhatToEatNext project in Kiro**

   ```bash
   # Ensure you're in the project directory
   cd /path/to/WhatToEatNext

   # Open in Kiro
   kiro .
   ```

2. **Explore the sidebar organization**
   - Notice pinned directories for frequent access
   - Observe custom folder icons for astrological directories
   - Test quick access shortcuts

3. **Test enhanced TypeScript support**
   - Open `src/services/AlchemicalRecommendationService.ts`
   - Notice enhanced IntelliSense suggestions
   - Try auto-import functionality
   - Observe type hints and parameter suggestions

#### Knowledge Check

- Where are the steering files located?
- What file extensions get special TypeScript treatment?
- How do you access the command palette?

### Module 1.2: Steering File System (30 minutes)

#### Hands-on Exercise: Understanding Context

1. **Explore steering files**

   ```bash
   # Navigate to steering directory
   ls -la .kiro/steering/
   ```

2. **Read product vision**
   - Open `.kiro/steering/product.md`
   - Understand the 14 Alchemical Pillars
   - Learn about elemental self-reinforcement

3. **Review project structure**
   - Open `.kiro/steering/structure.md`
   - Understand directory organization
   - Learn component patterns

4. **Study technology stack**
   - Open `.kiro/steering/tech.md`
   - Understand specialized libraries
   - Learn about campaign system integration

#### Practice Activity

Create a simple component that demonstrates understanding of:

- Elemental properties structure
- Astrological context integration
- Proper import patterns

```typescript
// Example: Create src/components/training/ElementalDisplay.tsx
import React from 'react';
import { ElementalProperties } from '@/types/alchemy';

interface ElementalDisplayProps {
  properties: ElementalProperties;
  title: string;
}

export const ElementalDisplay: React.FC<ElementalDisplayProps> = ({
  properties,
  title
}) => {
  return (
    <div className="elemental-display">
      <h3>{title}</h3>
      <div className="elements">
        <div>Fire: {properties.Fire}</div>
        <div>Water: {properties.Water}</div>
        <div>Earth: {properties.Earth}</div>
        <div>Air: {properties.Air}</div>
      </div>
    </div>
  );
};
```

#### Knowledge Check

- What are the four elements in our system?
- What is the minimum compatibility score between different elements?
- What is the self-reinforcement principle?

### Module 1.3: Development Workflow (30 minutes)

#### Hands-on Exercise: Enhanced Development

1. **Code editing enhancements**
   - Open a TypeScript file
   - Use auto-completion for astrological types
   - Try automatic import organization
   - Test ESLint integration

2. **File navigation**
   - Use path IntelliSense
   - Navigate between related files
   - Use breadcrumb navigation

3. **Search and discovery**
   - Search for astrological terms
   - Use file exclusion patterns
   - Find references across the codebase

#### Practice Activity

Modify an existing component to add elemental properties:

1. Choose a simple component
2. Add elemental properties interface
3. Use Kiro's auto-completion
4. Observe automatic import suggestions

#### Knowledge Check

- How do you organize imports automatically?
- What file types are excluded from search?
- How do you navigate to type definitions?

## Level 2: Astrological Development

### Learning Objectives

- Understand astrological calculation principles
- Work with planetary position systems
- Implement elemental harmony logic
- Use specialized astrological libraries

### Module 2.1: Astrological Principles (45 minutes)

#### Hands-on Exercise: Planetary Positions

1. **Study reliable astronomy utility**

   ```typescript
   // Open src/utils/reliableAstronomy.ts
   import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';

   // Understand the fallback hierarchy
   // 1. NASA JPL Horizons API
   // 2. Public Astronomy APIs
   // 3. TimeAndDate.com API
   // 4. Local Fallback Data (March 28, 2025)
   ```

2. **Explore planetary data structure**

   ```typescript
   // Example planetary position structure
   const positions = {
     sun: {
       sign: 'aries',
       degree: 8.5,
       exactLongitude: 8.5,
       isRetrograde: false,
     },
     moon: {
       sign: 'aries',
       degree: 1.57,
       exactLongitude: 1.57,
       isRetrograde: false,
     },
     // ... other planets
   };
   ```

3. **Practice transit date validation**
   ```typescript
   // Check transit dates in src/data/planets/
   // Understand validation requirements
   // Learn fallback mechanisms
   ```

#### Practice Activity

Create a function that safely gets planetary positions:

```typescript
async function getSafePlanetaryPositions(
  date?: Date
): Promise<PlanetaryPositions> {
  try {
    const positions = await getReliablePlanetaryPositions(date);
    // Add validation logic
    // Implement error handling
    return positions;
  } catch (error) {
    // Handle gracefully with fallback
    console.warn('Using fallback positions:', error);
    return getFallbackPositions();
  }
}
```

### Module 2.2: Elemental Harmony System (45 minutes)

#### Hands-on Exercise: Elemental Calculations

1. **Study elemental principles**
   - Review `.kiro/steering/elemental-principles.md`
   - Understand self-reinforcement (same elements = 0.9+ compatibility)
   - Learn minimum compatibility (different elements = 0.7+ compatibility)

2. **Implement compatibility calculation**

   ```typescript
   function calculateElementalCompatibility(
     source: ElementalProperties,
     target: ElementalProperties
   ): number {
     const sourceDominant = getDominantElement(source);
     const targetDominant = getDominantElement(target);

     // Self-reinforcement: same elements have highest compatibility
     if (sourceDominant === targetDominant) {
       return Math.max(0.9, baseCompatibility);
     }

     // All different combinations have good compatibility
     return Math.max(0.7, baseCompatibility);
   }
   ```

3. **Practice validation**
   ```typescript
   function validateElementalProperties(
     properties: ElementalProperties
   ): boolean {
     // Check all elements are present and non-negative
     // Verify reasonable bounds
     // Return validation result
   }
   ```

#### Practice Activity

Build an elemental compatibility checker:

1. Create input for two sets of elemental properties
2. Calculate compatibility using self-reinforcement principles
3. Display results with explanations
4. Add validation and error handling

### Module 2.3: Astrological Integration (30 minutes)

#### Hands-on Exercise: Service Integration

1. **Study AlchemicalRecommendationService**

   ```typescript
   // Open src/services/AlchemicalRecommendationService.ts
   // Understand service patterns
   // Learn recommendation generation
   ```

2. **Practice with alchemical engine**

   ```typescript
   // Use the AlchemicalEngine
   import { AlchemicalEngine } from '@/calculations/core/alchemicalEngine';

   const engine = new AlchemicalEngine();
   const thermodynamics = engine.alchemize(planetaryPositions);
   ```

3. **Implement recommendation logic**
   ```typescript
   // Generate recommendations based on planetary positions
   // Consider elemental compatibility
   // Apply self-reinforcement principles
   ```

#### Knowledge Check

- What is the fallback date for planetary positions?
- What is the minimum compatibility score between elements?
- How do you validate elemental properties?

## Level 3: Advanced Automation

### Learning Objectives

- Configure and manage agent hooks
- Understand campaign system integration
- Monitor automated processes
- Troubleshoot automation issues

### Module 3.1: Agent Hooks System (45 minutes)

#### Hands-on Exercise: Hook Configuration

1. **Study existing hooks**

   ```bash
   # Explore hook configurations
   ls -la .kiro/hooks/
   cat .kiro/hooks/planetary-data-validator.md
   ```

2. **Understand hook structure**

   ```yaml
   ---
   name: 'Hook Name'
   triggers:
     - file_change: 'path/pattern'
   scope: 'operation-scope'
   approval: auto|manual
   rollback: git_stash|file_backup
   ---
   ```

3. **Test hook execution**
   - Modify a planetary data file
   - Observe automatic validation
   - Check rollback mechanisms

#### Practice Activity

Create a custom hook for ingredient validation:

```yaml
---
name: 'Custom Ingredient Validator'
triggers:
  - file_change: 'src/data/ingredients/custom/*.ts'
scope: 'custom-ingredients'
approval: auto
rollback: file_backup
---
## Custom Ingredient Validation Hook

This hook validates custom ingredient files for:
  - Proper elemental properties
  - Valid nutritional data
  - Correct naming conventions
```

### Module 3.2: Campaign System Integration (45 minutes)

#### Hands-on Exercise: Campaign Monitoring

1. **Study campaign controller**

   ```typescript
   // Open src/services/campaign/CampaignController.ts
   // Understand campaign orchestration
   // Learn safety protocols
   ```

2. **Monitor campaign progress**

   ```typescript
   // Use ProgressTracker
   import { ProgressTracker } from '@/services/campaign/ProgressTracker';

   const tracker = new ProgressTracker();
   const metrics = await tracker.getProgressMetrics();
   ```

3. **Understand error thresholds**
   ```typescript
   const ERROR_THRESHOLDS = {
     typescript: {
       current: 2566,
       target: 0,
       criticalThreshold: 100,
     },
   };
   ```

#### Practice Activity

Create a campaign monitoring dashboard:

1. Display current error counts
2. Show campaign progress
3. Implement threshold alerts
4. Add manual campaign triggers

### Module 3.3: Automation Troubleshooting (30 minutes)

#### Hands-on Exercise: Debug Automation

1. **Run validation tools**

   ```bash
   # Test complete configuration
   node .kiro/validation/complete-config-validator.cjs

   # Test workflows
   node .kiro/validation/workflow-tester.cjs

   # Run comprehensive tests
   node .kiro/validation/comprehensive-test-suite.cjs
   ```

2. **Analyze results**
   - Identify failing components
   - Understand error messages
   - Plan remediation steps

3. **Fix common issues**
   - Hook configuration errors
   - MCP server connection problems
   - Performance bottlenecks

#### Knowledge Check

- How do you test hook configurations?
- What are the TypeScript error thresholds?
- How do you troubleshoot MCP server issues?

## Level 4: Configuration Management

### Learning Objectives

- Manage Kiro configurations
- Update and maintain steering files
- Handle system upgrades
- Implement backup and recovery

### Module 4.1: Configuration Maintenance (30 minutes)

#### Hands-on Exercise: System Maintenance

1. **Weekly maintenance routine**

   ```bash
   # Run configuration validation
   node .kiro/validation/complete-config-validator.cjs

   # Check performance benchmarks
   node .kiro/validation/comprehensive-test-suite.cjs

   # Review steering file accuracy
   ```

2. **Update procedures**
   - Review and update steering files
   - Update astrological data
   - Check MCP server versions
   - Analyze performance trends

3. **Backup configurations**
   ```bash
   # Create configuration backup
   tar -czf kiro-config-backup-$(date +%Y%m%d).tar.gz .kiro/
   ```

### Module 4.2: Advanced Configuration (30 minutes)

#### Hands-on Exercise: Custom Configurations

1. **Create custom steering files**

   ```markdown
   ---
   inclusion: conditional
   fileMatchPattern: 'src/custom/**'
   ---

   # Custom Feature Guidance

   This steering file provides guidance for custom features...
   ```

2. **Configure specialized hooks**

   ```yaml
   ---
   name: 'Custom Feature Validator'
   triggers:
     - file_change: 'src/custom/**/*.ts'
   scope: 'custom-features'
   approval: manual
   ---
   ```

3. **Optimize performance settings**
   ```json
   {
     "typescript.preferences.includePackageJsonAutoImports": "on",
     "custom.feature.enabled": true,
     "performance.optimization.level": "high"
   }
   ```

#### Knowledge Check

- How do you create conditional steering files?
- What is the backup procedure for configurations?
- How do you optimize performance settings?

## Training Assessment

### Level 1 Assessment

**Practical Exercise**: Create a simple component that uses elemental properties
**Time Limit**: 30 minutes **Success Criteria**:

- Proper TypeScript usage
- Correct elemental properties structure
- Appropriate imports and exports
- Basic error handling

### Level 2 Assessment

**Practical Exercise**: Implement an astrological calculation function **Time
Limit**: 45 minutes **Success Criteria**:

- Uses reliable astronomy utility
- Implements elemental compatibility
- Follows self-reinforcement principles
- Includes proper validation

### Level 3 Assessment

**Practical Exercise**: Configure and test a custom agent hook **Time Limit**:
30 minutes **Success Criteria**:

- Proper YAML configuration
- Appropriate trigger conditions
- Correct safety settings
- Successful test execution

### Level 4 Assessment

**Practical Exercise**: Perform complete system maintenance **Time Limit**: 45
minutes **Success Criteria**:

- Run all validation tools
- Identify and fix issues
- Update configurations
- Document changes

## Ongoing Learning Resources

### Documentation

- `.kiro/docs/KIRO_OPTIMIZATION_GUIDE.md` - Complete configuration guide
- `.kiro/steering/` - Contextual guidance files
- `.kiro/validation/` - Testing and validation tools

### Practice Projects

- Create custom elemental calculations
- Build astrological visualization components
- Implement campaign monitoring tools
- Design custom automation workflows

### Community Resources

- Internal knowledge sharing sessions
- Code review best practices
- Troubleshooting workshops
- Advanced feature demonstrations

## Feedback and Continuous Improvement

### Training Feedback Collection

- Post-training surveys
- Practical exercise reviews
- Ongoing usage monitoring
- Regular check-ins with trainees

### Training Material Updates

- Quarterly review of training content
- Integration of new features
- Incorporation of user feedback
- Performance optimization updates

### Success Metrics

- Training completion rates
- Post-training competency assessments
- Time to productivity for new team members
- Reduction in configuration-related issues

This training program ensures team members can effectively leverage the
optimized Kiro workspace configuration while maintaining high code quality and
development velocity.
