# TODO and FIXME Triage

This document contains a summary of the `TODO` and `FIXME` comments found in the `src` directory. These comments indicate areas of the code that require further attention, and they should be triaged to identify high-priority issues before the closed beta.

## High-Priority Areas

### 1. Missing API Endpoints and Implementations

- **`app/api/zodiac-calendar/route.ts`**: `// TODO: Replace with actual implementations or remove endpoints`
- **`app/menu-planner/page.tsx`**: `// TODO: Implement this API endpoint` (/api/user/saved-charts)
- **`components/CelestialEquilibrium.tsx`**: `// TODO: Implement this API endpoint` (/api/transmutation_recommendations)

**Impact:** These comments indicate that critical API endpoints are not yet implemented. This will lead to broken functionality in the UI.

### 2. Incomplete Data and Logic in Core Features

- **`contexts/MenuPlannerContext.tsx`**: Multiple `TODO`s related to implementing recommendation logic, backend persistence, and stats calculation.
- **`data/unified/recipeBuilding.ts`**: Numerous `TODO`s for implementing core recipe building logic, including ingredient selection, instruction generation, and seasonal adaptations.
- **`hooks/usePlanetaryKinetics.ts`**: `// TODO: Replace with actual planetary position service`

**Impact:** The core functionality of the app, such as menu planning and recipe generation, is incomplete.

### 3. Data Integrity and Type Safety

- **`components/menu-planner/MealSlot.tsx`**: `// TODO: Define proper type`
- **`data/unified/`**: Multiple files with `// TODO: Fix import` comments.

**Impact:** These issues can lead to runtime errors and data corruption.

### 4. Recipe Data Quality

- **`utils/recipe/recipeAutoFixer.ts`**: `// FIXME: fixMealTypes`
- **`data/cuisines.ts.bak6`**: `// TODO: Fix apostrophes in cuisine files and re-enable`

**Impact:** The recipe data may be inconsistent or incorrect, leading to a poor user experience.

## Next Steps

It is recommended to review these `TODO` and `FIXME` comments and prioritize them based on their impact on the user experience and the stability of the application.
