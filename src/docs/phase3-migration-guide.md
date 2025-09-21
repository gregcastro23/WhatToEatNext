# Phase 3: Component Integration Guide

This guide provides instructions for migrating React components to the new
service architecture implemented in Phase 1 and Phase 2.

## Table of Contents

1. [Overview](#overview)
2. [Migration Steps](#migration-steps)
3. [Using the useServices Hook](#using-the-useservices-hook)
4. [Handling Loading and Error States](#handling-loading-and-error-states)
5. [Example Patterns](#example-patterns)
6. [Migration Checklist](#migration-checklist)
7. [Troubleshooting](#troubleshooting)

## Overview

Phase 3 focuses on updating React components to use the new service
architecture. The key goals are:

- Replace direct service imports with the `useServices` hook
- Ensure proper initialization and error handling
- Remove direct service instantiation
- Provide consistent loading states

This approach centralizes service management, improves error handling, and
creates a more maintainable architecture.

## Migration Steps

### 1. Identify Components Using Legacy Services

First, identify components that directly import and use legacy services:

```jsx
// Before (Legacy approach)
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { AstrologicalService } from '@/services/AstrologicalService';

const MyComponent = () => {
  // Direct service usage
  const positions = AstrologicalService.getCurrentPositions();
  const elementalState = ElementalCalculator.calculateElementalState(positions);
  // ...
};
```

### 2. Update Imports

Replace direct service imports with the `useServices` hook:

```jsx
// After (New approach)
import { useServices } from '@/hooks/useServices';

const MyComponent = () => {
  const {
    astrologyService,
    alchemicalEngine
  } = useServices();
  // ...
};
```

### 3. Update Service Access

Update how services are accessed within the component:

```jsx
// Before
useEffect(() => {
  const positions = AstrologicalService.getCurrentPositions();
  // ...
}, []);

// After
useEffect(() => {
  if (astrologyService) {
    const positions = await astrologyService.getCurrentPlanetaryPositions();
    // ...
  }
}, [astrologyService]);
```

### 4. Add Loading and Error Handling

Use the loading and error states provided by the `useServices` hook:

```jsx
const {
  isLoading,
  error,
  astrologyService
} = useServices();

// Show loading state
if (isLoading) {
  return <div>Loading services...</div>;
}

// Show error state
if (error) {
  return <div>Error: {error.message}</div>;
}
```

## Using the useServices Hook

The `useServices` hook provides:

1. Access to all services in a type-safe way
2. Loading and error states
3. Initialization handling

Basic usage:

```jsx
import { useServices } from '@/hooks/useServices';

function MyComponent() {
  const {
    // Status indicators
    isLoading,
    error,
    status,
    isInitialized,

    // Services
    alchemicalEngine,
    astrologyService,
    ingredientService,
    recipeService,
    recommendationService,
    alchemicalRecommendationService
  } = useServices();

  // Component logic...
}
```

## Handling Loading and Error States

Always check for loading and error states before using services:

```jsx
function MyComponent() {
  const { isLoading, error, astrologyService } = useServices();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Skip if services aren't loaded yet
    if (isLoading || error || !astrologyService) {
      return;
    }

    const loadData = async () => {
      try {
        const result = await astrologyService.getCurrentPlanetaryPositions();
        setData(result);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    loadData();
  }, [isLoading, error, astrologyService]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  return <div>{/* Render component */}</div>;
}
```

## Example Patterns

### Basic Pattern

```jsx
import React, { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';

const MyComponent = () => {
  const { isLoading, error, serviceA, serviceB } = useServices();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isLoading || error || !serviceA || !serviceB) return;

    const loadData = async () => {
      const result = await serviceA.someMethod();
      setData(result);
    };

    loadData();
  }, [isLoading, error, serviceA, serviceB]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Component JSX */}</div>;
};
```

### Using Multiple Services Together

```jsx
import React, { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';

const MultiServiceComponent = () => {
  const {
    isLoading,
    error,
    astrologyService,
    alchemicalEngine,
    ingredientService
  } = useServices();

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (isLoading || error || !astrologyService || !alchemicalEngine || !ingredientService) return;

    const getRecommendations = async () => {
      // 1. Get planetary positions from astrologyService
      const positions = await astrologyService.getCurrentPlanetaryPositions();

      // 2. Calculate alchemical properties using alchemicalEngine
      const formattedPositions = convertPositions(positions);
      const thermodynamics = alchemicalEngine.alchemize(formattedPositions);

      // 3. Get ingredient recommendations based on those properties
      const elemental = deriveElementalProperties(thermodynamics);
      const ingredients = ingredientService.getRecommendedIngredients(elemental);

      setRecommendations(ingredients);
    };

    getRecommendations();
  }, [isLoading, error, astrologyService, alchemicalEngine, ingredientService]);

  // Component JSX...
};
```

## Migration Checklist

Use this checklist to ensure your component migration is complete:

- [ ] Replace direct service imports with `useServices` hook
- [ ] Add proper loading state handling
- [ ] Add proper error state handling
- [ ] Update all service method calls to use the new APIs
- [ ] Add services to dependency arrays in useEffect
- [ ] Test the component with services in different states
- [ ] Remove any remaining references to legacy services
- [ ] Verify that the component behaves correctly when services are initializing

## Troubleshooting

### Component Re-renders Too Often

If your component re-renders too often, you might be using services directly in
your render function. Move service calls to useEffect:

```jsx
// Problematic
const { recipeService } = useServices();
const recipes = recipeService.getAllRecipes(); // Causes re-render on every render

// Better
const { recipeService } = useServices();
const [recipes, setRecipes] = useState([]);

useEffect(() => {
  if (recipeService) {
    const loadRecipes = async () => {
      const data = await recipeService.getAllRecipes();
      setRecipes(data);
    };
    loadRecipes();
  }
}, [recipeService]);
```

### Services Are Undefined

If services are undefined despite the loading state being false, ensure you're
checking for the service existence:

```jsx
const { isLoading, astrologyService } = useServices();

// Always check that the service exists before using it
if (!isLoading && astrologyService) {
  // Now safe to use astrologyService
}
```

### Infinite Render Loops

If you're experiencing infinite render loops, check your useEffect dependencies:

```jsx
// Problem: data from service included in dependency array
useEffect(() => {
  const data = astrologyService.getSomeData();
  setMyData(data);
}, [astrologyService, myData]); // Including myData causes loop

// Fixed version
useEffect(() => {
  if (astrologyService) {
    const data = astrologyService.getSomeData();
    setMyData(data);
  }
}, [astrologyService]); // Only depend on the service itself
```

### Legacy Context Usage

If your component uses both the new services and legacy contexts, separate the
concerns:

```jsx
const MyComponent = () => {
  // New services architecture
  const { astrologyService, alchemicalEngine } = useServices();

  // Legacy context (still needed during migration)
  const { state } = useAlchemical();

  // Use both as needed, but migrate functionality to new services gradually
};
```
