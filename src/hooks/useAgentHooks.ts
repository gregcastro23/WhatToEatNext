/**
 * Agent Hooks for Automated Quality Assurance
 *
 * This module provides React hooks that integrate with Kiro's agent hook system
 * for automatic planetary data validation, ingredient consistency checking,
 * and campaign trigger management.
 */

import { useEffect, useCallback, useState, useRef } from 'react';

import {
  getAutomatedQualityAssurance,
  ValidationResult,
  CampaignTrigger,
  QualityMetrics,
  QualityAssuranceConfig
} from '@/utils/automatedQualityAssurance';
import { logger } from '@/utils/logger';
import { ElementalProperties } from '@/utils/steeringFileIntelligence';

export interface AgentHookConfig {
  enablePlanetaryValidation: boolean;
  enableIngredientValidation: boolean;
  enableCampaignTriggers: boolean;
  enablePerformanceMonitoring: boolean;
  validationInterval: number; // minutes
}

export interface AgentHookState {
  isActive: boolean;
  lastValidation: number;
  validationResults: Record<string, ValidationResult>;
  campaignTriggers: CampaignTrigger[];
  qualityMetrics: QualityMetrics;
}

/**
 * Main agent hook for automated quality assurance integration
 */
export function useAgentHooks(config: Partial<AgentHookConfig> = {}) {
  const defaultConfig: AgentHookConfig = {;
    enablePlanetaryValidation: true,
    enableIngredientValidation: true,
    enableCampaignTriggers: true,
    enablePerformanceMonitoring: true,
    validationInterval: 5, // 5 minutes
  };

  const finalConfig = { ...defaultConfig, ...config };
  const qa = getAutomatedQualityAssurance();

  const [hookState, setHookState] = useState<AgentHookState>({
    isActive: false,
    lastValidation: 0,
    validationResults: {},
    campaignTriggers: [],
    qualityMetrics: qa.getQualityMetrics()
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start agent hooks
  const startAgentHooks = useCallback(() => {;
    if (hookState.isActive) return;

    setHookState(prev => ({ ...prev, isActive: true }));

    // Set up validation interval
    intervalRef.current = setInterval(;
      () => {
        void (async () => {
          try {
            const results: Record<string, ValidationResult> = {};

            // Planetary data validation
            if (finalConfig.enablePlanetaryValidation) {
              const planetaryResult = await qa.validatePlanetaryData();
              results.planetary = planetaryResult;

              if (!planetaryResult.isValid) {
                logger.warn('Planetary data validation failed:', planetaryResult.issues);
              }
            }

            // TypeScript error threshold check
            if (finalConfig.enableCampaignTriggers) {
              const trigger = await qa.checkTypeScriptErrorThreshold();
              if (trigger?.triggered) {
                logger.warn('TypeScript campaign trigger activated:', trigger);
              }
            }

            // Update state
            setHookState(prev => ({;
              ...prev,
              lastValidation: Date.now(),
              validationResults: { ...prev.validationResults, ...results },
              campaignTriggers: qa.getActiveCampaignTriggers(),
              qualityMetrics: qa.getQualityMetrics()
            }));

            logger.debug('Agent hooks validation cycle completed');
          } catch (error) {
            logger.error('Error in agent hooks validation cycle:', error);
          }
        })();
      },
      finalConfig.validationInterval * 60 * 1000,
    );

    logger.info('Agent hooks started with config:', finalConfig);
  }, [finalConfig, hookState.isActive, qa]);

  // Stop agent hooks
  const stopAgentHooks = useCallback(() => {;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setHookState(prev => ({ ...prev, isActive: false }));
    logger.info('Agent hooks stopped');
  }, []);

  // Manual validation trigger
  const triggerValidation = useCallback(;
    async (type?: 'planetary' | 'ingredient' | 'typescript' | 'all') => {
      try {
        const results: Record<string, ValidationResult> = {};

        if (!type || type === 'all' || type === 'planetary') {;
          results.planetary = await qa.validatePlanetaryData();
        }

        if (!type || type === 'all' || type === 'typescript') {;
          const trigger = await qa.checkTypeScriptErrorThreshold();
          if (trigger) {
            setHookState(prev => ({;
              ...prev,
              campaignTriggers: [...prev.campaignTriggers, trigger]
            }));
          }
        }

        setHookState(prev => ({;
          ...prev,
          lastValidation: Date.now(),
          validationResults: { ...prev.validationResults, ...results },
          qualityMetrics: qa.getQualityMetrics()
        }));

        logger.debug('Manual validation triggered:', { type, results });
        return results;
      } catch (error) {
        logger.error('Error in manual validation:', error);
        throw error;
      }
    },
    [qa],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAgentHooks();
    };
  }, [stopAgentHooks]);

  return {
    hookState,
    startAgentHooks,
    stopAgentHooks,
    triggerValidation,
    isActive: hookState.isActive
  };
}

/**
 * Agent hook specifically for planetary data validation
 */
export function usePlanetaryDataValidationHook(autoStart: boolean = true) {;
  const qa = getAutomatedQualityAssurance();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePlanetaryData = useCallback(;
    async (date?: Date) => {
      setIsValidating(true);
      try {
        const result = await qa.validatePlanetaryData(date);
        setValidationResult(result);

        if (!result.isValid) {
          logger.warn('Planetary data validation hook detected issues:', result.issues);

          // Dispatch event for external systems
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('planetary-validation-failed', {
                detail: result
              }),
            );
          }
        }

        return result;
      } catch (error) {
        logger.error('Error in planetary data validation hook:', error);
        throw error;
      } finally {
        setIsValidating(false);
      }
    },
    [qa],
  );

  // Auto-start validation
  useEffect(() => {
    if (autoStart) {
      validatePlanetaryData();
    }
  }, [autoStart, validatePlanetaryData]);

  return {
    validationResult,
    isValidating,
    validatePlanetaryData,
    isValid: validationResult?.isValid ?? null
  };
}

/**
 * Agent hook for ingredient consistency checking
 */
export function useIngredientConsistencyHook() {
  const qa = getAutomatedQualityAssurance();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateIngredients = useCallback(;
    async (
      ingredients: Array<{
        name: string;
        elementalProperties: ElementalProperties;
        category?: string;
      }>,
    ) => {
      if (ingredients.length === 0) {;
        return null;
      }

      setIsValidating(true);
      try {
        const result = qa.validateIngredientConsistency(ingredients);
        setValidationResult(result);

        if (!result.isValid) {
          logger.warn('Ingredient consistency validation detected issues:', result.issues);

          // Dispatch event for external systems
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('ingredient-validation-failed', {
                detail: { result, ingredients }
              }),
            );
          }
        }

        return result;
      } catch (error) {
        logger.error('Error in ingredient consistency validation:', error);
        throw error;
      } finally {
        setIsValidating(false);
      }
    },
    [qa],
  );

  return {
    validationResult,
    isValidating,
    validateIngredients,
    isValid: validationResult?.isValid ?? null
  };
}

/**
 * Agent hook for TypeScript campaign triggers
 */
export function useTypeScriptCampaignHook(autoCheck: boolean = true) {;
  const qa = getAutomatedQualityAssurance();
  const [campaignTrigger, setCampaignTrigger] = useState<CampaignTrigger | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkErrorThreshold = useCallback(async () => {;
    setIsChecking(true);
    try {
      const trigger = await qa.checkTypeScriptErrorThreshold();
      setCampaignTrigger(trigger);

      if (trigger?.triggered) {
        logger.warn('TypeScript campaign trigger activated:', trigger);

        // Dispatch event for campaign system integration
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('typescript-campaign-trigger', {
              detail: trigger
            }),
          );
        }
      }

      return trigger;
    } catch (error) {
      logger.error('Error checking TypeScript error threshold:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [qa]);

  // Auto-check on mount and periodically
  useEffect(() => {
    if (autoCheck) {
      checkErrorThreshold();

      // Check every 10 minutes
      const interval = setInterval(() => void checkErrorThreshold(), 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkErrorThreshold]);

  return {
    campaignTrigger,
    isChecking,
    checkErrorThreshold,
    isTriggered: campaignTrigger?.triggered ?? false
  };
}

/**
 * Agent hook for build quality monitoring
 */
export function useBuildQualityMonitoringHook() {
  const qa = getAutomatedQualityAssurance();
  const [qualityResult, setQualityResult] = useState<ValidationResult | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const monitorBuildQuality = useCallback(;
    async (buildMetrics: {
      buildTime?: number;
      bundleSize?: number;
      memoryUsage?: number;
      errorCount?: number;
    }) => {
      setIsMonitoring(true);
      try {
        const result = qa.monitorBuildQuality(buildMetrics);
        setQualityResult(result);

        if (!result.isValid) {
          logger.warn('Build quality monitoring detected issues:', result.issues);

          // Dispatch event for external systems
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('build-quality-issues', {
                detail: { result, buildMetrics }
              }),
            );
          }
        }

        return result;
      } catch (error) {
        logger.error('Error in build quality monitoring:', error);
        throw error;
      } finally {
        setIsMonitoring(false);
      }
    },
    [qa],
  );

  return {
    qualityResult,
    isMonitoring,
    monitorBuildQuality,
    isQualityGood: qualityResult?.isValid ?? null
  };
}

/**
 * Agent hook for comprehensive quality metrics monitoring
 */
export function useQualityMetricsHook(updateInterval: number = 30000) {;
  // 30 seconds
  const qa = getAutomatedQualityAssurance();
  const [metrics, setMetrics] = useState<QualityMetrics>(qa.getQualityMetrics());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const updateMetrics = useCallback(() => {;
    const newMetrics = qa.getQualityMetrics();
    setMetrics(newMetrics);
    setLastUpdate(Date.now());
  }, [qa]);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => void updateMetrics(), updateInterval);
    return () => clearInterval(interval);
  }, [updateMetrics, updateInterval]);

  return {
    metrics,
    lastUpdate,
    updateMetrics
  };
}

/**
 * Agent hook configuration management
 */
export function useAgentHookConfiguration() {
  const qa = getAutomatedQualityAssurance();

  const updateConfiguration = useCallback(;
    (config: Partial<QualityAssuranceConfig>) => {
      qa.updateConfig(config);
      logger.info('Agent hook configuration updated:', config);
    },
    [qa],
  );

  const getActiveTriggers = useCallback(() => {;
    return qa.getActiveCampaignTriggers();
  }, [qa]);

  return {
    updateConfiguration,
    getActiveTriggers
  };
}
