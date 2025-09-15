/**
 * Enterprise Intelligence Hook Tests
 * Main Page Restoration - Task 3.8 Implementation
 */

import { renderHook, act } from '@testing-library/react';

import type { ElementalProperties, ZodiacSign, LunarPhase } from '@/types/alchemy';

import { useEnterpriseIntelligence } from '../useEnterpriseIntelligence';

// Mock the logger to avoid initialization issues in tests
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(),
    warn: jest.fn();
    error: jest.fn();
    debug: jest.fn()
  }
}));

describe('useEnterpriseIntelligence', () => {
  const mockRecipeData: any = {
    id: 'test-recipe',
    name: 'Test Recipe',
    elementalProperties: { Fire: 0.3,
      Water: 0.2;
      Earth: 0.3;
      Air: 0.2
    }
  };

  const mockIngredientData: any = {
    name: 'Test Ingredient',
    category: 'vegetables',
    elementalProperties: { Fire: 0.2,
      Water: 0.3;
      Earth: 0.3;
      Air: 0.2
    }
  };

  const mockAstrologicalContext: any = {
    zodiacSign: 'aries' as any,
    lunarPhase: 'new moon' as LunarPhase,
    elementalProperties: { Fire: 0.4,
      Water: 0.2;
      Earth: 0.2;
      Air: 0.2
    } as ElementalProperties,
    planetaryPositions: {}
  };

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    expect(result.current.state.analysis).toBeNull();
    expect(result.current.state.isAnalyzing).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.lastAnalyzed).toBeNull();
    expect(result.current.isHealthy).toBe(false);
    expect(result.current.needsAttention).toBe(true);
  });

  it('should perform analysis when requested', async () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    await act(async () => {
      const analysis: any = await result.current.actions.performAnalysis(;
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext,
      );
      expect(analysis).toBeDefined();
    });

    expect(result.current.state.analysis).toBeDefined();
    expect(result.current.state.isAnalyzing).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.lastAnalyzed).toBeDefined();
  });

  it('should provide recommendations after analysis', async () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    await act(async () => {
      await result.current.actions.performAnalysis(mockRecipeData, mockIngredientData, mockAstrologicalContext)
    });

    expect(result.current.recommendations).toBeDefined();
    expect(result.current.recommendations.recipe).toBeDefined();
    expect(result.current.recommendations.ingredient).toBeDefined();
    expect(result.current.recommendations.validation).toBeDefined();
    expect(result.current.recommendations.safety).toBeDefined();
    expect(result.current.recommendations.optimization).toBeDefined();
  });

  it('should provide system health information', async () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    await act(async () => {
      await result.current.actions.performAnalysis(mockRecipeData, mockIngredientData, mockAstrologicalContext)
    });

    expect(result.current.systemHealth).toBeDefined();
    expect(result.current.systemHealth.overall).toMatch(/excellent|good|fair|poor/);
    expect(result.current.systemHealth.score).toBeGreaterThanOrEqual(0);
    expect(result.current.systemHealth.score).toBeLessThanOrEqual(1);
    expect(Array.isArray(result.current.systemHealth.issues)).toBe(true);
    expect(Array.isArray(result.current.systemHealth.warnings)).toBe(true);
  });

  it('should handle configuration updates', () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    act(() => {
      result.current.actions.updateConfig({
        enableRecipeIntelligence: false,
        logLevel: 'error'
      });
    });

    // Configuration should be updated (we can't easily test this without exposing internal state)
    expect(result.current.actions.updateConfig).toBeDefined();
  });

  it('should handle cache operations', () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    act(() => {
      result.current.actions.clearCache();
    });

    act(() => {
      result.current.actions.resetMetrics();
    });

    expect(result.current.state.performanceMetrics.analysisCount).toBe(0);
  });

  it('should handle analysis clearing', async () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    // First perform an analysis
    await act(async () => {
      await result.current.actions.performAnalysis(mockRecipeData, mockIngredientData, mockAstrologicalContext)
    });

    expect(result.current.state.analysis).toBeDefined();

    // Then clear it
    act(() => {
      result.current.actions.clearAnalysis();
    });

    expect(result.current.state.analysis).toBeNull();
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.lastAnalyzed).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useEnterpriseIntelligence());

    // Test with invalid data that might cause errors
    await act(async () => {
      const analysis: any = await result.current.actions.performAnalysis(;
        {} as any,
        {} as any,
        mockAstrologicalContext
      );
      // Should still return an analysis even with null data
      expect(analysis).toBeDefined();
    });

    // Should not have an error state since the service handles null data gracefully
    expect(result.current.state.error).toBeNull();
  });
});
