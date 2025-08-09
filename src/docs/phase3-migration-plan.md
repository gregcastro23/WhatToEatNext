# Phase 3: Component Migration Plan

This document outlines the plan for migrating components to the new service
architecture in Phase 3 of the TypeScript refactoring project.

## Migration Strategy

The migration will follow a bottom-up approach:

1. Start with lower-level utility components that have minimal dependencies
2. Progress to mid-level components that consume these utilities
3. Finally migrate top-level page components and layouts

Components will be prioritized based on:

- Usage frequency across the application
- Complexity of service interactions
- Dependencies on legacy services

## Component Migration Tracking

| Component                  | Current Services Used                  | Migration Priority | Dependencies              | Status      |
| -------------------------- | -------------------------------------- | ------------------ | ------------------------- | ----------- |
| ElementalEnergyDisplay     | ElementalCalculator, AstrologyService  | High               | None                      | Not Started |
| ElementalVisualizer        | ElementalCalculator                    | High               | None                      | Not Started |
| MoonDisplay                | AstrologyService                       | High               | None                      | Not Started |
| SunDisplay                 | AstrologyService                       | High               | None                      | Not Started |
| IngredientRecommendations  | ElementalCalculator, IngredientService | Medium             | ElementalEnergyDisplay    | Not Started |
| ElementalAlchemicalDisplay | AlchemicalContext                      | Medium             | None                      | Not Started |
| FoodRecommender            | IngredientFilterService                | Medium             | IngredientRecommendations | Not Started |
| NutritionalRecommender     | IngredientFilterService                | Medium             | None                      | Not Started |
| RecipeDisplay              | RecipeService                          | Medium             | None                      | Not Started |
| ChakraInfluencedFood       | ChakraAlchemyService                   | Low                | ElementalEnergyDisplay    | Not Started |
| RecipeRecommendations      | RecommendationService                  | Low                | RecipeDisplay             | Not Started |
| AlchemicalRecommendations  | AlchemicalService                      | Low                | ElementalEnergyDisplay    | Not Started |

## Migration Phases

### Phase 3.1: Core Utility Components (Week 1)

Focus on basic display components that use the ElementalCalculator and
AstrologyService:

- ElementalEnergyDisplay
- ElementalVisualizer
- MoonDisplay
- SunDisplay
- ElementalAlchemicalDisplay

### Phase 3.2: Ingredient and Recipe Components (Week 2)

Focus on components that use ingredient and recipe services:

- IngredientRecommendations
- FoodRecommender
- NutritionalRecommender
- RecipeDisplay

### Phase 3.3: Complex Integration Components (Week 3)

Focus on components that integrate multiple services:

- ChakraInfluencedFood
- RecipeRecommendations
- AlchemicalRecommendations

## Migration Process for Each Component

For each component, follow these steps:

1. Create a new version of the component using the useServices hook
2. Run tests to ensure functionality is preserved
3. Replace the old component with the new version
4. Update any dependent components

## Implementation Progress

### Completed

- Example components:
  - Phase3Example.tsx
  - RecipeRecommendations.tsx

### In Progress

- None

### Remaining

- All components listed in the tracking table

## Validation Strategy

Each migrated component will be validated through:

1. Unit tests comparing output with the original component
2. Integration tests verifying interaction with other components
3. Manual testing of the full component in the application

## Challenges and Mitigations

| Challenge                                                    | Mitigation Strategy                                            |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| Components with complex state derived from multiple services | Break down into smaller components or use custom hooks         |
| Legacy contexts still being used alongside services          | Create adapter hooks that bridge between contexts and services |
| Performance impact during transition                         | Implement memoization and optimize render cycles               |
| Data inconsistency between old and new implementations       | Create validation tests to ensure data equivalence             |

## Next Steps After Phase 3

Once all components are migrated:

1. Remove legacy service direct imports
2. Clean up any remaining adapter code
3. Update documentation to reflect the new architecture
4. Proceed to Phase 4: API Standardization
