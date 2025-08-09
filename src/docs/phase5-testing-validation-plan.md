# Phase 5: Testing and Validation Plan

## Overview

Phase 5 focuses on establishing a comprehensive testing strategy to ensure the
reliability, correctness, and type safety of the application. This includes
implementing unit tests for all services, integration tests for service
interactions, and thorough type validation. The goal is to create a robust
testing framework that catches issues early and provides confidence in the
refactored codebase.

## Goals

1. Ensure complete unit test coverage for all services
2. Validate service interactions through integration tests
3. Verify type correctness throughout the application
4. Establish automated testing pipelines
5. Create performance testing baselines
6. Document testing strategies and patterns

## Implementation Strategy

### 1. Testing Infrastructure

#### 1.1 Configure Test Environment

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/**/*.stories.{ts,tsx}',
    '!src/pages/_*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/services/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### 1.2 Create Test Utilities

```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock services that access browser APIs
jest.mock('@/services/localStorage', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Add custom matchers if needed
expect.extend({
  // Custom matchers here
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 1.3 Service Test Factory

Create a factory pattern for testing services:

```typescript
// src/tests/factories/serviceTestFactory.ts
import { createServiceMock } from '@/tests/mocks/serviceMocks';

export interface ServiceTestContext<T> {
  service: T;
  dependencies: Record<string, jest.Mock>;
  reset(): void;
}

export function createServiceTestContext<T>(
  ServiceClass: new (...args: any[]) => T,
  dependencyNames: string[] = []
): ServiceTestContext<T> {
  // Create mock dependencies
  const dependencies: Record<string, jest.Mock> = {};

  dependencyNames.forEach(name => {
    dependencies[name] = createServiceMock(name);
  });

  // Create service instance with mocked dependencies
  const service = new ServiceClass(...Object.values(dependencies));

  return {
    service,
    dependencies,
    reset() {
      // Reset all dependency mocks
      Object.values(dependencies).forEach(mock => mock.mockReset());
    }
  };
}
```

### 2. Unit Testing Strategy

#### 2.1 Service Unit Tests

Example pattern for testing a service:

```typescript
// src/__tests__/services/AstrologyService.test.ts
import { AstrologyService } from '@/services/AstrologyService';
import { createServiceTestContext } from '@/tests/factories/serviceTestFactory';
import { mockPlanetaryData } from '@/tests/mocks/astrologyMocks';

describe('AstrologyService', () => {
  // Create test context with dependencies
  const ctx = createServiceTestContext(AstrologyService, [
    'httpClient',
    'cacheService',
    'locationService',
  ]);

  beforeEach(() => {
    ctx.reset();
  });

  describe('getCurrentPlanetaryPositions', () => {
    it('should return planetary positions from API', async () => {
      // Arrange
      ctx.dependencies.httpClient.get.mockResolvedValue({
        data: mockPlanetaryData,
        status: 200,
        success: true,
      });

      // Act
      const result = await ctx.service.getCurrentPlanetaryPositions();

      // Assert
      expect(result).toEqual(mockPlanetaryData);
      expect(ctx.dependencies.httpClient.get).toHaveBeenCalledWith(
        '/astrology/planetary-positions',
        expect.any(Object)
      );
    });

    it('should use cached data when available', async () => {
      // Arrange
      ctx.dependencies.cacheService.get.mockReturnValue(mockPlanetaryData);

      // Act
      const result = await ctx.service.getCurrentPlanetaryPositions();

      // Assert
      expect(result).toEqual(mockPlanetaryData);
      expect(ctx.dependencies.httpClient.get).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const error = new Error('API Error');
      ctx.dependencies.httpClient.get.mockRejectedValue(error);

      // Act & Assert
      await expect(ctx.service.getCurrentPlanetaryPositions()).rejects.toThrow('API Error');
    });
  });

  // Additional test suites for other methods
});
```

#### 2.2 Utility Function Tests

Example pattern for testing utility functions:

```typescript
// src/__tests__/utils/elementalCalculator.test.ts
import { calculateElementalProperties } from '@/utils/elementalCalculator';
import { mockPlanetaryPositions } from '@/tests/mocks/astrologyMocks';

describe('elementalCalculator', () => {
  describe('calculateElementalProperties', () => {
    it('should calculate elemental properties correctly', () => {
      // Arrange
      const expectedProperties = {
        fire: 2.5,
        water: 1.75,
        earth: 3.0,
        Air: 2.25,
      };

      // Act
      const result = calculateElementalProperties(mockPlanetaryPositions);

      // Assert
      expect(result).toEqual(expectedProperties);
    });

    it('should handle empty input', () => {
      // Act
      const result = calculateElementalProperties({});

      // Assert
      expect(result).toEqual({
        fire: 0,
        water: 0,
        earth: 0,
        Air: 0,
      });
    });

    it('should handle missing planet properties', () => {
      // Arrange
      const incompleteData = {
        sun: { sign: 'leo' }, // Missing degree
      };

      // Act
      const result = calculateElementalProperties(incompleteData);

      // Assert
      expect(result.fire).toBeGreaterThan(0);
      expect(result.water).toBe(0);
      expect(result.earth).toBe(0);
      expect(result.Air).toBe(0);
    });
  });
});
```

### 3. Integration Testing Strategy

#### 3.1 Service Interaction Tests

Test how services work together:

```typescript
// src/__tests__/integration/astrologyElementalIntegration.test.ts
import { AstrologyService } from '@/services/AstrologyService';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { mockPlanetaryData } from '@/tests/mocks/astrologyMocks';

describe('Astrology and Elemental Integration', () => {
  // Create actual service instances for integration testing
  const httpClient = {
    get: jest.fn().mockResolvedValue({
      data: mockPlanetaryData,
      status: 200,
      success: true,
    }),
  };

  const cacheService = {
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
  };

  const locationService = {
    getCurrentLocation: jest.fn().mockResolvedValue({
      latitude: 40.7128,
      longitude: -74.0060,
    }),
  };

  const astrologyService = new AstrologyService(
    httpClient,
    cacheService,
    locationService
  );

  const elementalCalculator = new ElementalCalculator();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate elemental properties from planetary positions', async () => {
    // Act
    const positions = await astrologyService.getCurrentPlanetaryPositions();
    const elementalProperties = elementalCalculator.calculateProperties(positions);

    // Assert
    expect(positions).toEqual(mockPlanetaryData);
    expect(elementalProperties).toHaveProperty('fire');
    expect(elementalProperties).toHaveProperty('water');
    expect(elementalProperties).toHaveProperty('earth');
    expect(elementalProperties).toHaveProperty('Air');
  });
});
```

#### 3.2 API Endpoint Tests

Test API endpoints with supertest:

```typescript
// src/__tests__/api/astrology.test.ts
import { createRequest, createResponse } from 'node-mocks-http';
import { GET } from '@/app/api/astrology/planetary-positions/route';

describe('Astrology API Endpoints', () => {
  describe('GET /api/astrology/planetary-positions', () => {
    it('should return planetary positions', async () => {
      // Arrange
      const req = createRequest({
        method: 'GET',
        url: '/api/astrology/planetary-positions',
      });
      const res = createResponse();

      // Act
      const result = await GET(req);
      const data = await result.json();

      // Assert
      expect(result.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('sun');
      expect(data.data).toHaveProperty('moon');
    });

    it('should handle invalid parameters', async () => {
      // Arrange
      const req = createRequest({
        method: 'GET',
        url: '/api/astrology/planetary-positions?latitude=invalid',
      });

      // Act
      const result = await GET(req);
      const data = await result.json();

      // Assert
      expect(result.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid request parameters');
    });
  });
});
```

### 4. Component Testing

#### 4.1 Presentational Component Tests

```typescript
// src/__tests__/components/ElementalVisualizer.test.tsx
import { render, screen } from '@testing-library/react';
import ElementalVisualizerMigrated from '@/components/ElementalVisualizer.migrated';
import { ServicesProvider } from '@/providers/ServicesProvider';
import { mockElementalProperties } from '@/tests/mocks/elementalMocks';

// Mock the useServices hook
jest.mock('@/hooks/useServices', () => ({
  useServices: () => ({
    isLoading: false,
    error: null,
    elementalCalculator: {
      calculateCompatibility: jest.fn().mockReturnValue(0.85),
    },
  }),
}));

describe('ElementalVisualizer', () => {
  it('should render bar chart visualization', () => {
    // Arrange & Act
    render(
      <ServicesProvider>
        <ElementalVisualizerMigrated
          elementalProperties={mockElementalProperties}
          visualizationType="bar"
        />
      </ServicesProvider>
    );

    // Assert
    expect(screen.getByText('Elemental Properties')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Air')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // Mock loading state
    jest.mock('@/hooks/useServices', () => ({
      useServices: () => ({
        isLoading: true,
        error: null,
      }),
    }));

    // Arrange & Act
    render(
      <ServicesProvider>
        <ElementalVisualizerMigrated
          elementalProperties={mockElementalProperties}
        />
      </ServicesProvider>
    );

    // Assert
    expect(screen.getByText('Loading services...')).toBeInTheDocument();
  });
});
```

#### 4.2 Container Component Tests

```typescript
// src/__tests__/components/MoonDisplay.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import MoonDisplayMigrated from '@/components/MoonDisplay.migrated';
import { ServicesProvider } from '@/providers/ServicesProvider';
import { mockMoonData, mockLunarPhaseData } from '@/tests/mocks/astrologyMocks';

// Mock the useServices hook
jest.mock('@/hooks/useServices', () => ({
  useServices: () => ({
    isLoading: false,
    error: null,
    astrologyService: {
      getCurrentPlanetaryPositions: jest.fn().mockResolvedValue({ moon: mockMoonData }),
      getMoonTimes: jest.fn().mockResolvedValue({ rise: new Date(), set: new Date() }),
      getLunarPhaseData: jest.fn().mockResolvedValue(mockLunarPhaseData),
      getUserLocation: jest.fn().mockResolvedValue({ latitude: 40.7, longitude: -74 }),
    },
  }),
}));

describe('MoonDisplay', () => {
  it('should render moon information', async () => {
    // Arrange & Act
    render(
      <ServicesProvider>
        <MoonDisplayMigrated />
      </ServicesProvider>
    );

    // Assert - wait for async data loading
    await waitFor(() => {
      expect(screen.getByText(/Moon in/i)).toBeInTheDocument();
    });
  });

  it('should expand to show detailed information', async () => {
    // Arrange
    render(
      <ServicesProvider>
        <MoonDisplayMigrated />
      </ServicesProvider>
    );

    // Act - wait for component to load then click to expand
    await waitFor(() => {
      expect(screen.getByText(/Moon in/i)).toBeInTheDocument();
    });

    screen.getByText(/Moon in/i).click();

    // Assert expanded content is visible
    await waitFor(() => {
      expect(screen.getByText('Lunar Phase')).toBeInTheDocument();
    });
  });
});
```

### 5. Type Validation

#### 5.1 TypeScript Project References

Configure TypeScript project references for better type checking:

```json
// tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true
  },
  "references": [
    { "path": "./src/types" },
    { "path": "./src/services" },
    { "path": "./src/api" },
    { "path": "./src/components" }
  ]
}
```

#### 5.2 Type Testing

Use `tsd` to test your type definitions:

```typescript
// src/__tests__/types/api.test-d.ts
import { expectType, expectError } from 'tsd';
import { ApiResponse, ApiError } from '@/types/api';
import { PlanetaryPosition } from '@/types/api/astrology';

// Test ApiResponse type
expectType<ApiResponse<number>>({ data: 42, status: 200, success: true });

// Error if missing required properties
expectError<ApiResponse<string>>({ data: 'test' });

// Test PlanetaryPosition type
expectType<PlanetaryPosition>({
  planet: 'sun',
  sign: 'leo',
  degree: 15.5,
  exactLongitude: 135.5,
  isRetrograde: false,
});

// Error on incorrect types
expectError<PlanetaryPosition>({
  planet: 'sun',
  sign: 'leo',
  degree: '15.5', // should be number
  exactLongitude: 135.5,
  isRetrograde: false,
});
```

### 6. Test Coverage and CI/CD Integration

#### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Type check
        run: yarn tsc --noEmit

      - name: Lint
        run: yarn lint

      - name: Test
        run: yarn test --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

## Implementation Phases

### Phase 5.1: Testing Infrastructure (Weeks 1-2)

1. Set up testing frameworks and libraries
2. Create test utilities and helpers
3. Implement test mocks and factories
4. Configure CI/CD integration

### Phase 5.2: Unit Tests Implementation (Weeks 3-5)

1. Write unit tests for core services
2. Write unit tests for utility functions
3. Create test coverage reports
4. Document testing patterns

### Phase 5.3: Integration Testing (Weeks 6-7)

1. Implement integration tests for service interactions
2. Test API endpoints
3. Create end-to-end tests for critical user flows
4. Measure and optimize performance

### Phase 5.4: Component Testing (Weeks 8-9)

1. Test presentational components
2. Test container components with service interactions
3. Validate component migration completeness
4. Create visual regression tests

## Success Criteria

1. Achieve at least 80% code coverage for services
2. All API endpoints have comprehensive tests
3. Critical user flows have end-to-end tests
4. Type validation is integrated into the CI pipeline
5. Tests run automatically on pull requests
6. Performance tests establish baselines for key metrics

## Risks and Mitigations

| Risk                      | Impact | Mitigation                                                            |
| ------------------------- | ------ | --------------------------------------------------------------------- |
| Test maintenance overhead | Medium | Focus on testing behaviors rather than implementations                |
| Slow test execution       | Medium | Implement test parallelization and optimize slow tests                |
| Flaky tests               | High   | Implement test retries and detailed logging for intermittent failures |
| Incomplete test coverage  | High   | Use coverage reports to identify gaps and prioritize critical areas   |

## Conclusion

A comprehensive testing strategy is essential for ensuring the reliability and
correctness of the refactored codebase. By implementing unit tests, integration
tests, and type validation, we can catch issues early and provide confidence in
the application's behavior. The testing infrastructure will also provide a
foundation for future development and ensure that new features maintain the
quality standards established during the refactoring process.
