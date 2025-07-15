# WhatToEatNext Service Architecture

This document provides an overview of the service architecture in the WhatToEatNext application. It explains the design principles, service hierarchy, and how to use the services.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Hierarchy](#service-hierarchy)
3. [Design Principles](#design-principles)
4. [Using Services](#using-services)
5. [Migration from Legacy Services](#migration-from-legacy-services)
6. [Adding New Services](#adding-new-services)

## Architecture Overview

The WhatToEatNext service architecture follows a layered approach with clear separation of concerns. The architecture is designed to be:

- **Modular**: Each service has a specific responsibility
- **Consistent**: All services follow the same patterns and conventions
- **Testable**: Services are designed for easy unit testing
- **Extensible**: New services can be added easily

## Service Hierarchy

The service architecture is organized into the following layers:

### 1. Core Engine Services

These services provide fundamental calculations and data:

- **AlchemicalEngine**: Performs alchemical calculations based on planetary positions
- **AstrologyService**: Provides planetary positions and astrological data

### 2. Domain Services

These services build on the core engines to provide domain-specific functionality:

- **UnifiedIngredientService**: Manages ingredient data and operations
- **UnifiedRecipeService**: Manages recipe data and operations
- **UnifiedRecommendationService**: Provides recommendation functionality

### 3. Service Manager

The **ServicesManager** acts as a central point for initializing and accessing all services.

## Design Principles

All services in the WhatToEatNext application adhere to the following principles:

### Singleton Pattern

Services are implemented as singletons to ensure there's only one instance throughout the application:

```typescript
export class ExampleService {
  private static instance: ExampleService;
  
  private constructor() {}
  
  public static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }
}
```

### Interface-Based Design

Services implement interfaces to ensure consistent APIs:

```typescript
export interface ServiceInterface {
  doSomething(): void;
  getSomething(): any;
}

export class ServiceImplementation implements ServiceInterface {
  doSomething(): void {
    // Implementation
  }
  
  getSomething(): any {
    // Implementation
    return result;
  }
}
```

### Clear Dependency Management

Services explicitly declare their dependencies:

```typescript
export class DependentService {
  private dependency: DependencyService;
  
  private constructor() {
    this.dependency = DependencyService.getInstance();
  }
}
```

### Error Handling

Services include comprehensive error handling:

```typescript
try {
  // Service logic
} catch (error) {
  logger.error('Error in service operation:', error);
  // Error recovery or rethrow
}
```

## Using Services

### Initialization

Services should be initialized through the ServicesManager:

```typescript
import { servicesManager } from '../services';

// Initialize all services
await servicesManager.initialize();

// Access services
const { 
  alchemicalEngine,
  astrologyService,
  ingredientService,
  recipeService,
  recommendationService
} = servicesManager.getServices();
```

### Direct Service Access

For simpler cases, services can be accessed directly:

```typescript
import { unifiedIngredientService } from '../services';

// Use the service
const ingredients = unifiedIngredientService.getAllIngredients();
```

### Using in React Components

In React components, services should be accessed through hooks:

```typescript
import { useEffect, useState } from 'react';
import { unifiedRecipeService } from '../services';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  
  useEffect(() => {
    async function loadRecipes() {
      const result = await unifiedRecipeService.getAllRecipes();
      setRecipes(result);
    }
    
    loadRecipes();
  }, []);
  
  return (
    <div>
      {recipes.map(recipe => (
        <div key={recipe.id}>{recipe.name}</div>
      ))}
    </div>
  );
}
```

## Migration from Legacy Services

The application includes adapter classes to facilitate migration from legacy services to the new architecture. These adapters implement the legacy service interface but delegate to the new services.

### Example of using a legacy adapter:

```typescript
import { legacyIngredientAdapter } from '../services';

// Use the adapter as if it were the legacy service
const ingredients = legacyIngredientAdapter.getAllIngredients();
```

### Available Adapters:

- **LegacyIngredientAdapter**: Bridges between legacy IngredientService and UnifiedIngredientService
- **LegacyRecipeAdapter**: Bridges between legacy recipe services and UnifiedRecipeService
- **LegacyRecommendationAdapter**: Bridges between legacy recommendation services and UnifiedRecommendationService

## Adding New Services

To add a new service to the architecture:

1. Define the service interface in `src/services/interfaces/`
2. Implement the service class following the design principles
3. Add the service to the ServicesManager
4. Export the service from `src/services/index.ts`

### Example of a new service:

```typescript
// src/services/interfaces/NewServiceInterface.ts
export interface NewServiceInterface {
  performOperation(): void;
  getData(): any;
}

// src/services/NewService.ts
import { NewServiceInterface } from './interfaces/NewServiceInterface';
import { createLogger } from '../utils/logger';

const logger = createLogger('NewService');

export class NewService implements NewServiceInterface {
  private static instance: NewService;
  
  private constructor() {
    logger.info('NewService initialized');
  }
  
  public static getInstance(): NewService {
    if (!NewService.instance) {
      NewService.instance = new NewService();
    }
    return NewService.instance;
  }
  
  public performOperation(): void {
    try {
      // Implementation
    } catch (error) {
      logger.error('Error in performOperation:', error);
    }
  }
  
  public getData(): any {
    try {
      // Implementation
      return result;
    } catch (error) {
      logger.error('Error in getData:', error);
      return null;
    }
  }
}

export const newService = NewService.getInstance();
export default newService;
```

Then update the ServicesManager and index file to include the new service. 