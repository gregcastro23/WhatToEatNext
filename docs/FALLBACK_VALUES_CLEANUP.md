# Fallback Values Cleanup Plan

This document tracks the remaining fallback and default values in the codebase
that need to be removed or replaced with actual calculations using real
planetary data.

## Progress Update

Since the initial creation of this document, we've made progress in replacing
placeholder values with real data. This document now reflects the current state
of fallback values that still need attention.

### Latest Progress (June 2023)

- ✅ Context providers have been fixed to remove default values
- ✅ Loading states properly implemented in context providers
- ✅ Error handling improved in AlchemicalContext and ChartContext providers
- ✅ Created robust data provider that tries multiple sources for planetary
  positions
- ✅ Updated calculation utilities to throw errors instead of using fallbacks
- ✅ Added system status indicator to show data source being used

## Priority Areas

### 1. Default Constants (`src/constants/systemDefaults.ts`)

- `DEFAULT_ELEMENTAL_PROPERTIES` (e.g.,
  `{fire: 0.25, water: 0.25, earth: 0.25, Air: 0.25}`)
  - Used in various places as a fallback
  - Some files now include comments indicating "for type safety only"
- `DEFAULT_ASTROLOGICAL_STATE` with hardcoded zodiac signs
  - Still present but some components now using real data
- `DEFAULT_PLANETARY_POSITIONS` with hardcoded sign positions
  - ✅ Replaced with reliable data from safeAstrology module
- Various utility functions that use these defaults
  - ✅ Most have been updated to retrieve real data

### 2. Astrological Calculation Utilities (`src/utils/astrology/core.ts`)

- ✅ Error handling has been improved to throw errors instead of using fallbacks
- ✅ `getCurrentAstrologicalState` now uses our data provider pipeline
- ✅ `calculateElementalProfile` throws errors instead of using fallbacks
- ✅ Created `astrologyDataProvider.ts` module for reliable data access

### 3. Context Providers

- ✅ `AlchemicalContext` provider now uses empty initial state and exposes
  loading state
- ✅ `ChartContext` provider no longer uses hardcoded default positions
- ✅ Other context providers already properly implemented without fallbacks
- ✅ Added proper error handling and loading states
- 🔄 Components using these contexts still need to handle loading and error
  states better

### 4. Component-Level Fallbacks

- `CuisineRecommender` has been fixed to use real data
- `IngredientRecommender` may still have fallback issues
- 🔄 UI components should show explicit loading states rather than fallback data
- ✅ Added SystemStatusIndicator component to show data source

### 5. Data Files and Utilities

- Some data files may still use "unknown" category
- ✅ Calculation utilities updated to handle missing data properly

## Current Planetary Positions (Reference)

These are the actual planetary positions to use instead of defaults:

```
Sun
in
11° 11'
Gemini

Moon
in
21° 7'
Leo

Mercury
in
13° 59'
Gemini

Venus
in
25° 20'
Aries

Mars
in
21° 17'
Leo

Jupiter
in
28° 5'
Gemini

Saturn
in
0° 30'
Aries

Uranus
in
28° 8'
Taurus

Neptune
in
1° 52'
Aries

Pluto
in
3° 38'
Aquarius
(r)

North Node
in
23° 28'
Pisces
(r)


Ascendant
in
24° 11'
Gemini


```

## Approach for Each Area

### Constants Files

- Mark as "for type safety only" (progress made in some files)
- Remove values from defaults, use empty values or zeros
- Add warning comments

### Calculation Utilities

- ✅ Replace fallbacks with error states or undefined returns
- ✅ Add proper error handling in core calculation functions
- ✅ Ensure real planetary data is used when available
- ✅ Create a reliable data pipeline with multiple sources

### Context Providers

- ✅ Remove all defaults from state (completed)
- ✅ Display loading or error UI when data is missing (completed)
- ✅ Never silently use a fallback (completed)

### UI Components

- 🔄 Add explicit loading and error states
- 🔄 Remove all hardcoded zodiac signs, elements, and percentages
- ✅ Created SystemStatusIndicator component to show data source

## Implementation Order

1. ✅ Fix context providers to remove default values (completed)
2. ✅ Update calculation utilities to throw or return undefined (completed)
3. 🔄 Enhance UI components with proper loading/error states (in progress)
4. ⬜ Refactor constants and types for type safety only
5. ⬜ Final testing to ensure no fallbacks remain

**Note:** This is a living document to be updated as we find more fallbacks.
While addressing these issues is important, our immediate priority remains
fixing build errors and getting the dev environment running.

## Comprehensive Removal Plan

Based on the current state of the project, we estimate it would take
approximately 6-8 chat sessions to completely remove all fallback values and
implement full functionality. Here's a detailed plan:

### Session 1: Analysis and Planning (1 chat)

- ✅ Perform a comprehensive audit of all remaining fallback values
- ✅ Create a detailed inventory of each file containing placeholders
- ✅ Develop a specific, file-by-file remediation plan

### Session 2: Core Astrology Services (1 chat)

- ✅ Enhance the planetary position service to never use fallbacks
- ✅ Implement proper error handling and status reporting
- ✅ Create a "system status" indicator that shows when real data is available
- ✅ Add telemetry to track when fallbacks would have been used

### Session 3: Context Providers (1-2 chats)

- ✅ Remove all default values from context initial states
- ✅ Add proper loading states to all contexts
- ✅ Implement error boundaries around astrological calculations
- ✅ Create robust fallback UI components that clearly indicate they're
  placeholders

### Session 4: Component Refactoring (1-2 chats)

- 🔄 Update all UI components to handle loading/error states
- 🔄 Replace any hardcoded values with dynamic calculations
- 🔄 Add skeletons or loading indicators when data is being fetched
- 🔄 Implement "safe render" patterns to gracefully handle missing data

### Session 5: Constants and Types (1 chat)

- ⬜ Refactor all default constants to be type-only
- ⬜ Remove default values from exported constants
- ✅ Add extensive documentation about real data sources
- ⬜ Create validation utilities to verify data integrity

### Session 6: Testing and Verification (1 chat)

- ⬜ Develop comprehensive tests for all data flows
- ⬜ Create simulation mode for testing edge cases
- ✅ Implement automated detection of accidental fallback usage
- ⬜ Document verification procedures for future development

### Tracking Progress

We'll track progress with these metrics:

- Number of files with fallbacks remaining: Significantly reduced
- Percentage of UI components with proper loading states: ~60%
- Test coverage for error conditions: Improved
- Successful runs with debug logging enabled: Working properly

This plan assumes that the build and dev environment issues will be resolved
first, allowing us to focus on improving the actual functionality rather than
fixing immediate errors.
