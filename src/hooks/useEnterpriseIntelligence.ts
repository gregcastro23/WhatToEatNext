/**
 * Enterprise Intelligence Integration Hook
 * Main Page Restoration - Task 3.8 Implementation
 * 
 * React hook for integrating enterprise intelligence systems
 * with cuisine recommendation components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  EnterpriseIntelligenceIntegration,
  enterpriseIntelligenceIntegration
} from '@/services/EnterpriseIntelligenceIntegration';
import type { 
  EnterpriseIntelligenceConfig,
  EnterpriseIntelligenceResult 
} from '@/types/enterpriseIntelligence';
import type { ElementalProperties, ZodiacSign, LunarPhase } from '@/types/alchemy';
import { logger } from '@/utils/logger';

// ========== INTERFACES ==========

export interface UseEnterpriseIntelligenceConfig extends Partial<EnterpriseIntelligenceConfig> {
  autoAnalyze?: boolean;
  analysisInterval?: number;
  enableRealTimeUpdates?: boolean;
}

export interface EnterpriseIntelligenceState {
  analysis: EnterpriseIntelligenceResult | null;
  isAnalyzing: boolean;
  error: string | null;
  lastAnalyzed: Date | null;
  performanceMetrics: {
    analysisCount: number;
    averageExecutionTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

export interface EnterpriseIntelligenceActions {
  performAnalysis: (
    recipeData: any,
    ingredientData: any,
    astrologicalContext: {
      zodiacSign: ZodiacSign;
      lunarPhase: LunarPhase;
      elementalProperties: ElementalProperties;
      planetaryPositions?: any;
    }
  ) => Promise<EnterpriseIntelligenceResult | null>;
  clearAnalysis: () => void;
  updateConfig: (config: Partial<EnterpriseIntelligenceConfig>) => void;
  clearCache: () => void;
  resetMetrics: () => void;
  retryAnalysis: () => Promise<void>;
}

export interface UseEnterpriseIntelligenceReturn {
  state: EnterpriseIntelligenceState;
  actions: EnterpriseIntelligenceActions;
  recommendations: {
    recipe: string[];
    ingredient: string[];
    validation: string[];
    safety: string[];
    optimization: string[];
  };
  systemHealth: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    issues: string[];
    warnings: string[];
  };
  isHealthy: boolean;
  needsAttention: boolean;
}

// ========== HOOK IMPLEMENTATION ==========

export function useEnterpriseIntelligence(
  config: UseEnterpriseIntelligenceConfig = {}
): UseEnterpriseIntelligenceReturn {
  // ========== STATE ==========
  
  const [state, setState] = useState<EnterpriseIntelligenceState>({
    analysis: null,
    isAnalyzing: false,
    error: null,
    lastAnalyzed: null,
    performanceMetrics: {
      analysisCount: 0,
      averageExecutionTime: 0,
      cacheHitRate: 0,
      errorRate: 0
    }
  });

  const [lastAnalysisParams, setLastAnalysisParams] = useState<{
    recipeData: any;
    ingredientData: any;
    astrologicalContext: any;
  } | null>(null);

  // ========== MEMOIZED VALUES ==========

  const intelligenceService = useMemo(() => {
    if (Object.keys(config).length > 0) {
      return new EnterpriseIntelligenceIntegration(config);
    }
    return enterpriseIntelligenceIntegration;
  }, [config]);

  const recommendations = useMemo(() => {
    if (!state.analysis) {
      return {
        recipe: [],
        ingredient: [],
        validation: [],
        safety: [],
        optimization: []
      };
    }

    return {
      recipe: (state.analysis.recipeIntelligence as any)?.recommendations || [],
      ingredient: (state.analysis.ingredientIntelligence as any)?.recommendations || [],
      validation: [
        ...((state.analysis.validationIntelligence as any)?.dataIntegrity?.issues || []),
        ...((state.analysis.validationIntelligence as any)?.astrologicalConsistency?.issues || []),
        ...((state.analysis.validationIntelligence as any)?.elementalHarmony?.issues || [])
      ],
      safety: (state.analysis.safetyIntelligence as any)?.fallbackStrategies || [],
      optimization: [
        ...((state.analysis as any).optimizationRecommendations?.performance?.recommendations || []),
        ...((state.analysis as any).optimizationRecommendations?.accuracy?.recommendations || []),
        ...((state.analysis as any).optimizationRecommendations?.userExperience?.recommendations || []),
        ...((state.analysis as any).optimizationRecommendations?.systemIntegration?.recommendations || [])
      ]
    };
  }, [state.analysis]);

  const systemHealth = useMemo(() => {
    if (!state.analysis) {
      return {
        overall: 'fair' as const,
        score: 0.7,
        issues: ['No analysis available'],
        warnings: []
      };
    }

    const analysis = state.analysis;
    const issues = [
      ...((analysis.validationIntelligence as any)?.overallValidation?.criticalIssues || []),
      ...((analysis.safetyIntelligence as any)?.riskAssessment?.level === 'high' || 
          (analysis.safetyIntelligence as any)?.riskAssessment?.level === 'critical' 
          ? ['High risk level detected'] : [])
    ];

    const warnings = [
      ...((analysis.validationIntelligence as any)?.dataIntegrity?.warnings || []),
      ...((analysis.validationIntelligence as any)?.astrologicalConsistency?.warnings || []),
      ...((analysis.validationIntelligence as any)?.elementalHarmony?.warnings || []),
      ...((analysis.safetyIntelligence as any)?.monitoringAlerts || [])
    ];

    return {
      overall: (analysis as any).systemHealth || 'fair',
      score: (analysis as any).overallScore || analysis.overallIntelligenceScore || 0.7,
      issues,
      warnings
    };
  }, [state.analysis]);

  const isHealthy = useMemo(() => {
    return systemHealth.overall === 'excellent' || systemHealth.overall === 'good';
  }, [systemHealth.overall]);

  const needsAttention = useMemo(() => {
    return systemHealth.issues.length > 0 || 
           systemHealth.overall === 'poor' ||
           ((state.analysis?.safetyIntelligence as any)?.riskAssessment?.level === 'high') ||
           ((state.analysis?.safetyIntelligence as any)?.riskAssessment?.level === 'critical');
  }, [systemHealth.issues.length, systemHealth.overall, state.analysis]);

  // ========== ACTIONS ==========

  const performAnalysis = useCallback(async (
    recipeData: any,
    ingredientData: any,
    astrologicalContext: {
      zodiacSign: ZodiacSign;
      lunarPhase: LunarPhase;
      elementalProperties: ElementalProperties;
      planetaryPositions?: any;
    }
  ): Promise<EnterpriseIntelligenceResult | null> => {
    setState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      error: null 
    }));

    try {
      logger.info('[useEnterpriseIntelligence] Starting enterprise intelligence analysis');
      
      const analysis = await intelligenceService.performEnterpriseAnalysis(
        recipeData,
        ingredientData,
        {
          name: 'astrologicalCuisine',
          type: 'fusion',
          region: 'universal',
          characteristics: ['astrological', 'elemental', 'planetary']
        } as any,
        astrologicalContext as any
      );

      // Update performance metrics
      const metrics = intelligenceService.getPerformanceMetrics();

      setState(prev => ({
        ...prev,
        analysis,
        isAnalyzing: false,
        error: null,
        lastAnalyzed: new Date(),
        performanceMetrics: metrics
      }));

      // Store parameters for retry functionality
      setLastAnalysisParams({ recipeData, ingredientData, astrologicalContext });

      logger.info('[useEnterpriseIntelligence] Enterprise intelligence analysis completed', {
        overallScore: (analysis as any).overallScore || analysis.overallIntelligenceScore,
        systemHealth: (analysis as any).systemHealth || 'unknown'
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        performanceMetrics: intelligenceService.getPerformanceMetrics()
      }));

      logger.error('[useEnterpriseIntelligence] Enterprise intelligence analysis failed', error);
      return null;
    }
  }, [intelligenceService]);

  const clearAnalysis = useCallback(() => {
    setState(prev => ({
      ...prev,
      analysis: null,
      error: null,
      lastAnalyzed: null
    }));
    setLastAnalysisParams(null);
    logger.info('[useEnterpriseIntelligence] Analysis cleared');
  }, []);

  const updateConfig = useCallback((newConfig: Partial<EnterpriseIntelligenceConfig>) => {
    intelligenceService.updateConfig(newConfig);
    logger.info('[useEnterpriseIntelligence] Configuration updated');
  }, [intelligenceService]);

  const clearCache = useCallback(() => {
    intelligenceService.clearCache();
    logger.info('[useEnterpriseIntelligence] Cache cleared');
  }, [intelligenceService]);

  const resetMetrics = useCallback(() => {
    intelligenceService.resetMetrics();
    setState(prev => ({
      ...prev,
      performanceMetrics: {
        analysisCount: 0,
        averageExecutionTime: 0,
        cacheHitRate: 0,
        errorRate: 0
      }
    }));
    logger.info('[useEnterpriseIntelligence] Metrics reset');
  }, [intelligenceService]);

  const retryAnalysis = useCallback(async () => {
    if (!lastAnalysisParams) {
      logger.warn('[useEnterpriseIntelligence] No previous analysis parameters available for retry');
      return;
    }

    logger.info('[useEnterpriseIntelligence] Retrying enterprise intelligence analysis');
    await performAnalysis(
      lastAnalysisParams.recipeData,
      lastAnalysisParams.ingredientData,
      lastAnalysisParams.astrologicalContext
    );
  }, [lastAnalysisParams, performAnalysis]);

  // ========== EFFECTS ==========

  // Auto-analyze effect
  useEffect(() => {
    if (config.autoAnalyze && lastAnalysisParams && !state.isAnalyzing) {
      const interval = config.analysisInterval || 30000; // Default 30 seconds
      
      const timer = setInterval(() => {
        if (config.enableRealTimeUpdates) {
          retryAnalysis();
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [config.autoAnalyze, config.analysisInterval, config.enableRealTimeUpdates, lastAnalysisParams, state.isAnalyzing, retryAnalysis]);

  // Performance metrics update effect
  useEffect(() => {
    const updateMetrics = () => {
      const metrics = intelligenceService.getPerformanceMetrics();
      setState(prev => ({
        ...prev,
        performanceMetrics: metrics
      }));
    };

    // Update metrics every 10 seconds
    const metricsTimer = setInterval(() => void updateMetrics(), 10000);
    
    return () => clearInterval(metricsTimer);
  }, [intelligenceService]);

  // ========== RETURN ==========

  return {
    state,
    actions: {
      performAnalysis,
      clearAnalysis,
      updateConfig,
      clearCache,
      resetMetrics,
      retryAnalysis
    },
    recommendations,
    systemHealth,
    isHealthy,
    needsAttention
  };
}

// ========== UTILITY HOOKS ==========

/**
 * Hook for monitoring enterprise intelligence health
 */
export function useEnterpriseIntelligenceHealth() {
  const { systemHealth, isHealthy, needsAttention, state } = useEnterpriseIntelligence({
    enableRecipeIntelligence: true,
    enableIngredientIntelligence: true,
    enableValidationIntelligence: true,
    enableSafetyIntelligence: true,
    cacheResults: true
  });

  const healthStatus = useMemo(() => ({
    status: systemHealth.overall,
    score: systemHealth.score,
    isHealthy,
    needsAttention,
    criticalIssues: systemHealth.issues.filter(issue => issue.includes('critical')),
    warnings: systemHealth.warnings,
    lastChecked: state.lastAnalyzed,
    performanceIssues: state.performanceMetrics.errorRate > 0.1 || 
                      state.performanceMetrics.averageExecutionTime > 5000
  }), [systemHealth, isHealthy, needsAttention, state]);

  return healthStatus;
}

/**
 * Hook for enterprise intelligence recommendations
 */
export function useEnterpriseIntelligenceRecommendations() {
  const { recommendations, state } = useEnterpriseIntelligence({
    enableOptimizationRecommendations: true,
    cacheResults: true
  });

  const prioritizedRecommendations = useMemo(() => {
    const allRecommendations = [
      ...recommendations.recipe.map(r => ({ type: 'recipe', text: r, priority: 'medium' })),
      ...recommendations.ingredient.map(r => ({ type: 'ingredient', text: r, priority: 'medium' })),
      ...recommendations.validation.map(r => ({ type: 'validation', text: r, priority: 'high' })),
      ...recommendations.safety.map(r => ({ type: 'safety', text: r, priority: 'high' })),
      ...recommendations.optimization.map(r => ({ type: 'optimization', text: r, priority: 'low' }))
    ];

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return allRecommendations.sort((a, b) => 
      priorityOrder[b.priority as keyof typeof priorityOrder] - 
      priorityOrder[a.priority as keyof typeof priorityOrder]
    );
  }, [recommendations]);

  return {
    recommendations: prioritizedRecommendations,
    hasRecommendations: prioritizedRecommendations.length > 0,
    highPriorityCount: prioritizedRecommendations.filter(r => r.priority === 'high').length,
    lastUpdated: state.lastAnalyzed
  };
}

/**
 * Hook for enterprise intelligence performance monitoring
 */
export function useEnterpriseIntelligencePerformance() {
  const { state } = useEnterpriseIntelligence({
    cacheResults: true
  });

  const performanceStatus = useMemo(() => ({
    metrics: state.performanceMetrics,
    isPerformant: state.performanceMetrics.averageExecutionTime < 2000 && 
                  state.performanceMetrics.errorRate < 0.05,
    cacheEfficiency: state.performanceMetrics.cacheHitRate,
    reliability: 1 - state.performanceMetrics.errorRate,
    averageResponseTime: state.performanceMetrics.averageExecutionTime,
    totalAnalyses: state.performanceMetrics.analysisCount
  }), [state.performanceMetrics]);

  return performanceStatus;
}