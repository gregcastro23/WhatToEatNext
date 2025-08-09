# Component Migration Checklist

This document provides a systematic checklist for migrating components from
using contexts to the new service-based architecture. Following these steps
ensures consistency and completeness in the migration process.

## Pre-Migration Analysis

- [ ] Analyze component's context dependencies
- [ ] Identify which services will replace context functionality
- [ ] Check if component is part of a critical user flow
- [ ] Review if component has been updated recently
- [ ] Determine if component has unit tests that will need updating

## Preparation

- [ ] Create a new file with `.migrated.tsx` extension
- [ ] Import the `useServices` hook
- [ ] Understand which services will be needed for this component
- [ ] Review the component's lifecycle methods and state management

## Implementation

- [ ] Replace context imports with `useServices` hook
- [ ] Add proper destructuring of required services
- [ ] Add loading state handling
- [ ] Add error state handling
- [ ] Update component lifecycle methods to use service dependencies
- [ ] Update component name to include "Migrated" suffix
- [ ] Ensure all direct service instantiations are removed
- [ ] Add proper TypeScript types for all services and data
- [ ] Implement caching where appropriate for expensive operations
- [ ] Add proper cleanup of resources in useEffect hooks

## Specific Patterns to Implement

- [ ] Extract data fetching logic into useEffect hooks
- [ ] Add proper dependencies to useEffect calls
- [ ] Optimize expensive calculations with useMemo
- [ ] Use React.memo for the component export if appropriate
- [ ] Ensure consistent null/undefined checking
- [ ] Add meaningful error messages
- [ ] Ensure consistent styling for loading/error states

## Testing

- [ ] Add the component to the test page
      (`src/app/test/migrated-components/page.tsx`)
- [ ] Compare visual appearance with the original component
- [ ] Test all interactions and functionalities
- [ ] Verify that data loading works correctly
- [ ] Verify that error states display appropriately
- [ ] Check that the component updates when data changes

## Final Review

- [ ] Check for any remaining references to contexts
- [ ] Review console for any errors or warnings
- [ ] Check performance compared to original component
- [ ] Ensure the component follows project code style
- [ ] Update documentation in the migration progress file
- [ ] Test in different screen sizes and browsers if UI-related

## Post-Migration

- [ ] Update the migration progress document
- [ ] Consider if any patterns from this component should be documented for
      future migrations
- [ ] Identify any reusable hooks or utilities that could be extracted

## Common Patterns for Specific Service Types

### AstrologyService

- [ ] Replace planetary position calculations with service calls
- [ ] Update direct imports of calculation utilities
- [ ] Handle loading state for async planetary data

### ElementalCalculator

- [ ] Replace direct element calculations with service methods
- [ ] Use getCachedCalculation for expensive operations
- [ ] Ensure proper typing of elemental properties

### ChakraService

- [ ] Replace direct chakra mappings with service methods
- [ ] Ensure proper chakra type definitions
- [ ] Handle nullish chakra data appropriately

### NutritionService

- [ ] Replace direct nutrition data access with service methods
- [ ] Add proper error handling for nutrition data fetching
- [ ] Consider caching for nutrition data

## Example Transformation

Before:

```tsx
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const MyComponent = () => {
  const { planetaryPositions, state } = useAlchemical();

  // Component logic using context data
}
```

After:

```tsx
import { useServices } from '@/hooks/useServices';

const MyComponentMigrated = () => {
  const { isLoading, error, astrologyService } = useServices();
  const [planetaryPositions, setPlanetaryPositions] = useState({});

  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const fetchPositions = async () => {
        try {
          const positions = await astrologyService.getCurrentPlanetaryPositions();
          setPlanetaryPositions(positions);
        } catch (err) {
          console.error('Error fetching positions:', err);
        }
      };

      fetchPositions();
    }
  }, [isLoading, error, astrologyService]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Component logic using service data
}
```

This checklist serves as a guide to ensure consistent and complete migrations
across the codebase.
