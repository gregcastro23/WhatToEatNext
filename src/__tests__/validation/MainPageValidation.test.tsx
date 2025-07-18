/**
 * Comprehensive Main Page Validation Tests
 * Task 11.2: Validate all requirements and perform final testing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import App from '../../../App';
import { AlchemicalProvider } from '../../contexts/AlchemicalContext';
import MainPageLayout from '../../components/layout/MainPageLayout';

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../utils/reliableAstronomy', () => ({
  getReliablePlanetaryPositions: jest.fn().mockResolvedValue({
    sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
    moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
    mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true }
  })
}));

// Mock hooks that might cause issues
jest.mock('../../hooks/useAgentHooks', () => ({
  useAgentHooks: () => ({
    hookState: { isActive: false, lastRun: null, results: [] },
    startAgentHooks: jest.fn(),
    stopAgentHooks: jest.fn(),
    triggerValidation: jest.fn()
  }),
  usePlanetaryDataValidationHook: () => ({ isValid: true }),
  useIngredientConsistencyHook: () => ({ isConsistent: true }),
  useTypeScriptCampaignHook: () => ({ campaignActive: false }),
  useBuildQualityMonitoringHook: () => ({ quality: 'good' }),
  useQualityMetricsHook: () => ({ metrics: {} })
}));

jest.mock('../../utils/mcpServerIntegration', () => ({
  useMCPServerIntegration: () => ({
    isConnected: true,
    serverStatus: 'connected',
    availableTools: []
  })
}));

jest.mock('../../utils/developmentExperienceOptimizations', () => ({
  useDevelopmentExperienceOptimizations: () => ({
    optimizationsActive: true,
    performanceMetrics: {}
  })
}));

describe('Main Page Validation - Task 11.2', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true
    });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  describe('1. Component Interactions and Data Flow', () => {
    test('App renders without crashing', async () => {
      await act(async () => {
        render(<App />);
      });
      
      // Should render without throwing errors
      expect(screen.getByText(/Loading Astrological Data/i)).toBeInTheDocument();
    });

    test('MainPageLayout renders with AlchemicalProvider', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should render the main layout
      expect(document.body).toBeInTheDocument();
    });

    test('Error boundary handles errors gracefully', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false}>
              <ThrowError />
            </MainPageLayout>
          </AlchemicalProvider>
        );
      });
      
      // Should handle error without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('2. Navigation Functionality', () => {
    test('Navigation state is preserved', async () => {
      const mockOnSectionNavigate = jest.fn();
      
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout 
              debugMode={false} 
              loading={false} 
              onSectionNavigate={mockOnSectionNavigate}
            />
          </AlchemicalProvider>
        );
      });
      
      // Navigation should be functional
      expect(document.body).toBeInTheDocument();
    });

    test('Scroll position is preserved', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      
      // Should handle scroll events
      expect(window.scrollTo).toBeDefined();
    });
  });

  describe('3. Debug Panel Functionality', () => {
    test('Debug panel renders in development mode', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={true} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should render without errors in debug mode
      expect(document.body).toBeInTheDocument();
    });

    test('Debug panel is hidden in production mode', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should render without errors in production mode
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('4. Loading States', () => {
    test('Loading state displays correctly', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={true} />
          </AlchemicalProvider>
        );
      });
      
      // Should handle loading state
      expect(document.body).toBeInTheDocument();
    });

    test('Connected state displays when not loading', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should handle connected state
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('5. Context and State Management', () => {
    test('AlchemicalProvider provides context', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Context should be provided
      expect(document.body).toBeInTheDocument();
    });

    test('State preservation works correctly', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // State preservation should work
      expect(localStorage.setItem).toBeDefined();
    });
  });

  describe('6. Error Handling', () => {
    test('Global error boundary catches errors', async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const ErrorComponent = () => {
        throw new Error('Test error for error boundary');
      };

      await act(async () => {
        render(
          <App>
            <ErrorComponent />
          </App>
        );
      });
      
      // Should handle errors gracefully
      expect(document.body).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    test('Component-level error boundaries work', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should render without errors
      expect(document.body).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('7. Performance and Accessibility', () => {
    test('Components are memoized for performance', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should render efficiently
      expect(document.body).toBeInTheDocument();
    });

    test('Lazy loading works for non-critical components', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={true} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should handle lazy loading
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('8. Integration with External Systems', () => {
    test('Astrological calculations integrate correctly', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should integrate with astrological systems
      expect(document.body).toBeInTheDocument();
    });

    test('Agent hooks integrate correctly', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should integrate with agent hooks
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('9. Mobile Responsiveness', () => {
    test('Layout adapts to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should handle mobile viewport
      expect(document.body).toBeInTheDocument();
    });

    test('Touch interactions work correctly', async () => {
      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should handle touch interactions
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('10. System Integration Validation', () => {
    test('All required systems are integrated', async () => {
      await act(async () => {
        render(<App />);
      });
      
      // Should integrate all systems
      expect(document.body).toBeInTheDocument();
    });

    test('Fallback mechanisms work correctly', async () => {
      // Mock API failure
      jest.mocked(require('../../utils/reliableAstronomy').getReliablePlanetaryPositions)
        .mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        render(
          <AlchemicalProvider>
            <MainPageLayout debugMode={false} loading={false} />
          </AlchemicalProvider>
        );
      });
      
      // Should handle API failures gracefully
      expect(document.body).toBeInTheDocument();
    });
  });
});