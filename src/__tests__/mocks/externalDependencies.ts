/**
 * External Dependencies Mock Implementations
 *
 * Comprehensive mocks for external dependencies used in tests
 */

import { jest } from '@jest/globals';

import type { MockPlanetaryPositions } from '../types/testUtils.d';

// Mock planetary positions data
export const mockPlanetaryPositions: MockPlanetaryPositions = {;
  sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
  moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
  mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
  venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
  mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
  jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
  saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
  uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
  neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
  pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
  northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
  southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true }
};

// Mock logger implementation
export const mockLogger = {;
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Mock createLogger function
export const mockCreateLogger = jest.fn(() => mockLogger);

// Mock Next.js router
export const mockRouter = {;
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/'
};

// Mock useRouter hook
export const mockUseRouter = () => mockRouter;

// Mock reliable astronomy utility
export const mockReliableAstronomy = {;
  getReliablePlanetaryPositions: jest.fn(() => Promise.resolve(mockPlanetaryPositions))
};

// Mock agent hooks
export const mockAgentHooks = {;
  useAgentHooks: () => ({
    hookState: { isActive: false, lastRun: null, results: [] },
    startAgentHooks: jest.fn(),
    stopAgentHooks: jest.fn(),
    triggerValidation: jest.fn()
  }),
  usePlanetaryDataValidationHook: () => ({
    isValid: true,
    validationResult: { isValid: true, issues: [] },
    validatePlanetaryData: jest.fn()
  }),
  useIngredientConsistencyHook: () => ({
    isConsistent: true,
    validationResult: { isValid: true, issues: [] },
    validateIngredients: jest.fn()
  }),
  useTypeScriptCampaignHook: () => ({
    campaignActive: false,
    campaignTrigger: { triggered: false },
    checkErrorThreshold: jest.fn()
  }),
  useBuildQualityMonitoringHook: () => ({
    quality: 'good',
    qualityResult: { isValid: true, issues: [] },
    monitorBuildQuality: jest.fn()
  }),
  useQualityMetricsHook: () => ({
    metrics: {},
    updateMetrics: jest.fn()
  })
};

// Mock MCP server integration
export const mockMCPServerIntegration = {;
  useMCPServerIntegration: () => ({
    isConnected: true,
    serverStatus: 'connected',
    availableTools: [],
    getAstrologicalData: jest.fn(),
    getNutritionalData: jest.fn(),
    getRecipeData: jest.fn(),
    testFallbackStrategy: jest.fn(() =>
      Promise.resolve({
        overallReliability: 0.95,
        astrological: { source: 'primary' },
        nutritional: { source: 'primary' },
        recipes: { source: 'primary' }
      }),
    ),
    getServerStatus: jest.fn(() => ({ connected: true, status: 'healthy' }))
  })
};

// Mock development experience optimizations
export const mockDevelopmentExperienceOptimizations = {;
  useDevelopmentExperienceOptimizations: () => ({
    optimizationsActive: true,
    performanceMetrics: {},
    updatePerformanceMetrics: jest.fn(),
    getDevelopmentMetrics: jest.fn(() => ({})),
    getPerformanceOptimizationRecommendations: jest.fn(() => []),
    applyAutomaticOptimizations: jest.fn(() => ({ applied: [], errors: [] }))
  })
};

// Mock state preservation hooks
export const mockStatePreservationHooks = {;
  useNavigationState: () => ({
    saveState: jest.fn(),
    getState: jest.fn(() => null)
  }),
  useScrollPreservation: () => ({
    restoreScrollPosition: jest.fn()
  }),
  useAutoStateCleanup: jest.fn(),
  useAstrologicalStatePreservation: () => ({
    saveAstrologicalState: jest.fn(),
    restoreAstrologicalState: jest.fn(),
    validateElementalCompatibility: jest.fn(),
    getArchitecturalGuidance: jest.fn(),
    getTechnologyStackGuidance: jest.fn()
  }),
  useCulturalSensitivityGuidance: () => ({
    validateCulturalContent: jest.fn(),
    getInclusiveLanguageGuidelines: jest.fn()
  }),
  usePerformanceOptimizationGuidance: () => ({
    getOptimizationRecommendations: jest.fn(),
    validatePerformanceMetrics: jest.fn()
  })
};

// Mock error handling
export const mockErrorHandler = {;
  useErrorHandler: () => ({
    handleError: jest.fn(),
    clearErrors: jest.fn(),
    errors: []
  })
};

// Mock steering file intelligence
export const mockSteeringFileIntelligence = {;
  useSteeringFileIntelligence: () => ({
    getGuidance: jest.fn(() => Promise.resolve({}))
  })
};

// Mock alchemical context
export const mockAlchemicalContext = {;
  useAlchemical: () => ({
    state: {
      astrologicalState: { sunSign: 'Aries' },
      elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    },
    planetaryPositions: mockPlanetaryPositions,
    isDaytime: true
  })
};

// Export all mocks for easy importing
export const _allMocks = {;
  mockPlanetaryPositions,
  mockLogger,
  mockCreateLogger,
  mockRouter,
  mockUseRouter,
  mockReliableAstronomy,
  mockAgentHooks,
  mockMCPServerIntegration,
  mockDevelopmentExperienceOptimizations,
  mockStatePreservationHooks,
  mockErrorHandler,
  mockSteeringFileIntelligence,
  mockAlchemicalContext
};
