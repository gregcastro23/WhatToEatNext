# Key Architecture Principles

This document outlines the core architectural principles that should guide all development work in the WhatToEatNext application, especially during the TypeScript refactoring phases. Following these principles ensures consistency, maintainability, and long-term success of the codebase.

## 1. Singleton Implementation for Services

### Principle
Services should follow the singleton pattern, with a single instance accessible throughout the application.

### Implementation Guidelines
- Use dependency injection container to manage service instances
- Register services as singletons at application startup
- Access services through hooks or provider patterns
- Avoid direct instantiation of services in components
- Export interfaces, not implementations

### Example

```typescript
// src/services/index.ts
import { createContainer } from '@/utils/container';
import { AstrologyService } from './AstrologyService';
import { IAstrologyService } from '@/services/interfaces/IAstrologyService';
import { ElementalCalculator } from './ElementalCalculator';
import { IElementalCalculator } from '@/services/interfaces/IElementalCalculator';

// Create service container
export const serviceContainer = createContainer();

// Register services as singletons
serviceContainer.registerSingleton<IAstrologyService>('astrologyService', AstrologyService);
serviceContainer.registerSingleton<IElementalCalculator>('elementalCalculator', ElementalCalculator);
```

## 2. Interface-Based Design

### Principle
Define service contracts through interfaces, decoupling implementation details from service consumers.

### Implementation Guidelines
- Create clear, comprehensive interfaces for all services
- Define interfaces first, implementations second
- Keep interfaces focused on specific functionality domains
- Document interface methods with JSDoc
- Export interfaces for use by consumers

### Example

```typescript
// src/services/interfaces/IAstrologyService.ts
import { PlanetaryPosition } from '@/types';

export interface IAstrologyService {
  /**
   * Gets the current planetary positions based on current date and time
   * @returns A promise resolving to an object with planetary positions
   */
  getCurrentPlanetaryPositions(): Promise<Record<string, PlanetaryPosition>>;
  
  /**
   * Gets planetary positions for a specific date
   * @param date The date to calculate positions for
   * @returns A promise resolving to an object with planetary positions
   */
  getPlanetaryPositions(date: Date): Promise<Record<string, PlanetaryPosition>>;
  
  /**
   * Determines if the current time is daytime based on user's location
   * @returns A promise resolving to true if daytime, false if nighttime
   */
  isDaytime(): Promise<boolean>;
}
```

## 3. Clear Dependency Management

### Principle
Services should explicitly declare their dependencies, making relationships transparent and testable.

### Implementation Guidelines
- Use constructor injection for service dependencies
- Declare dependencies in the constructor signature
- Use meaningful parameter names that match dependency roles
- Document dependency requirements
- Keep dependency lists focused and minimal

### Example

```typescript
// src/services/AstrologyService.ts
import { IAstrologyService } from './interfaces/IAstrologyService';
import { IHttpClient } from './interfaces/IHttpClient';
import { ICacheService } from './interfaces/ICacheService';
import { ILocationService } from './interfaces/ILocationService';
import { PlanetaryPosition } from '@/types';

export class AstrologyService implements IAstrologyService {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly cacheService: ICacheService,
    private readonly locationService: ILocationService
  ) {}
  
  async getCurrentPlanetaryPositions(): Promise<Record<string, PlanetaryPosition>> {
    // Implementation using injected dependencies
  }
  
  async getPlanetaryPositions(date: Date): Promise<Record<string, PlanetaryPosition>> {
    // Implementation using injected dependencies
  }
  
  async isDaytime(): Promise<boolean> {
    // Implementation using injected dependencies
  }
}
```

## 4. Consistent Error Handling

### Principle
Implement standardized error handling and reporting across all services and components.

### Implementation Guidelines
- Create custom error classes for different error categories
- Use consistent error formats and messaging
- Propagate errors with appropriate context
- Implement graceful degradation in components
- Log errors with meaningful information
- Implement retry mechanisms for transient failures

### Example

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ServiceError extends AppError {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly methodName: string,
    public readonly originalError?: Error
  ) {
    super(`${serviceName}.${methodName}: ${message}`);
    this.name = 'ServiceError';
  }
}

// Usage in service
try {
  // Operation that might fail
} catch (error) {
  throw new ServiceError(
    'Failed to fetch planetary positions', 
    'AstrologyService', 
    'getCurrentPlanetaryPositions',
    error instanceof Error ? error : new Error(String(error))
  );
}
```

## 5. Proper Initialization Flow

### Principle
Services should follow a clear, predictable initialization sequence, avoiding race conditions and ensuring dependencies are available.

### Implementation Guidelines
- Use asynchronous initialization when needed
- Signal initialization state through flags or promises
- Implement timeout and retry mechanisms for critical services
- Provide fallback functionality when initialization fails
- Follow dependency order during initialization
- Document initialization requirements

### Example

```typescript
// src/services/ServiceInitializer.ts
import { serviceContainer } from '@/services';
import { IAstrologyService } from './interfaces/IAstrologyService';
import { IElementalCalculator } from './interfaces/IElementalCalculator';

export class ServiceInitializer {
  private static initPromise: Promise<void> | null = null;
  
  /**
   * Initialize all services in the correct order
   */
  static async initialize(): Promise<void> {
    // Only initialize once
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        // Get service instances
        const astrologyService = serviceContainer.resolve<IAstrologyService>('astrologyService');
        const elementalCalculator = serviceContainer.resolve<IElementalCalculator>('elementalCalculator');
        
        // Initialize services in dependency order
        await this.initializeWithTimeout(
          astrologyService.initialize(),
          'AstrologyService',
          5000
        );
        
        await this.initializeWithTimeout(
          elementalCalculator.initialize(),
          'ElementalCalculator',
          2000
        );
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Service initialization failed:', error);
        throw error;
      }
    })();
    
    return this.initPromise;
  }
  
  /**
   * Initialize a service with timeout
   */
  private static async initializeWithTimeout(
    promise: Promise<void>,
    serviceName: string,
    timeoutMs: number
  ): Promise<void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${serviceName} initialization timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
}
```

## 6. Legacy Service Compatibility

### Principle
Maintain backward compatibility with legacy code while implementing the new architecture.

### Implementation Guidelines
- Create adapter services bridging new and old implementations
- Use feature flags to toggle between implementations
- Gradually migrate components to new services
- Implement backward-compatible APIs
- Document migration paths for components
- Test both implementations during transition

### Example

```typescript
// src/services/adapters/LegacyAstrologyAdapter.ts
import { IAstrologyService } from '../interfaces/IAstrologyService';
import { legacyAstrologyAPI } from '@/legacy/astrology';
import { PlanetaryPosition } from '@/types';

/**
 * Adapter service that implements the new IAstrologyService interface
 * but uses the legacy astrology API implementation
 */
export class LegacyAstrologyAdapter implements IAstrologyService {
  async getCurrentPlanetaryPositions(): Promise<Record<string, PlanetaryPosition>> {
    // Call legacy API
    const legacyData = await legacyAstrologyAPI.getCurrentPositions();
    
    // Transform to new format
    const result: Record<string, PlanetaryPosition> = {};
    
    Object.entries(legacyData).forEach(([planet, data]) => {
      result[planet] = {
        planet,
        sign: data.zodiacSign,
        degree: data.degreeInSign,
        exactLongitude: data.longitude,
        isRetrograde: data.isRetro
      };
    });
    
    return result;
  }
  
  // Implement other methods from IAstrologyService
}
```

## 7. Testability

### Principle
Code should be designed for testability, enabling isolated and comprehensive testing.

### Implementation Guidelines
- Keep services focused on a single responsibility
- Use dependency injection to enable mock replacement
- Create test helpers for common testing patterns
- Avoid hidden dependencies and global state
- Separate business logic from UI
- Implement clear interfaces for testing

### Example

```typescript
// src/__tests__/services/AstrologyService.test.ts
import { AstrologyService } from '@/services/AstrologyService';
import { mockHttpClient, mockCacheService, mockLocationService } from '@/tests/mocks';
import { mockPlanetaryData } from '@/tests/fixtures';

describe('AstrologyService', () => {
  // Create fresh instances for each test
  let httpClient: any;
  let cacheService: any;
  let locationService: any;
  let service: AstrologyService;
  
  beforeEach(() => {
    // Create mock dependencies
    httpClient = mockHttpClient();
    cacheService = mockCacheService();
    locationService = mockLocationService();
    
    // Create service with mocked dependencies
    service = new AstrologyService(httpClient, cacheService, locationService);
  });
  
  describe('getCurrentPlanetaryPositions', () => {
    it('should fetch planetary positions from API', async () => {
      // Arrange
      httpClient.get.mockResolvedValue({ data: mockPlanetaryData });
      
      // Act
      const result = await service.getCurrentPlanetaryPositions();
      
      // Assert
      expect(result).toEqual(mockPlanetaryData);
      expect(httpClient.get).toHaveBeenCalledWith('/api/planetary-positions');
    });
  });
});
```

## 8. Performance Considerations

### Principle
Implement performant code that remains responsive and efficient at scale.

### Implementation Guidelines
- Cache expensive calculations and API calls
- Implement request batching for related data
- Use lazy loading for non-critical services
- Monitor and optimize critical paths
- Implement resource cleanup for unused services
- Avoid redundant calculations and API calls

### Example

```typescript
// src/services/CacheService.ts
import { ICacheService } from './interfaces/ICacheService';

export class CacheService implements ICacheService {
  private cache = new Map<string, { value: any; expiry: number }>();
  
  set(key: string, value: any, ttlMs: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

## 9. Documentation

### Principle
Code should be self-documenting with clear interfaces, meaningful names, and explicit documentation.

### Implementation Guidelines
- Use TypeScript interfaces to document contracts
- Add JSDoc comments to methods and classes
- Create dedicated documentation for complex systems
- Document architectural decisions
- Keep documentation in sync with code
- Generate API documentation automatically

### Example

```typescript
/**
 * Calculates elemental properties based on planetary positions
 * 
 * @param positions - An object containing planetary positions
 * @param isDaytime - Whether the calculation should use daytime or nighttime values
 * @returns An object containing the calculated elemental properties
 * 
 * @example
 * ```ts
 * const positions = await astrologyService.getCurrentPlanetaryPositions();
 * const elementalProperties = calculateElementalProperties(positions, true);
 * ```
 */
export function calculateElementalProperties(
  positions: Record<string, PlanetaryPosition>,
  isDaytime: boolean = true
): ElementalProperties {
  // Implementation details
}
```

## Conclusion

Following these core architectural principles will ensure that the WhatToEatNext application maintains a high level of quality, maintainability, and extensibility. These principles should be treated as guidelines for all development work and used to evaluate code quality during reviews. 