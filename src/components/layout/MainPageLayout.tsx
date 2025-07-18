'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, memo, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/utils/logger';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import ErrorBoundary from '@/components/error-boundaries/ErrorBoundary';
import { 
  useNavigationState, 
  useScrollPreservation, 
  useAutoStateCleanup,
  useAstrologicalStatePreservation,
  useCulturalSensitivityGuidance,
  usePerformanceOptimizationGuidance
} from '@/hooks/useStatePreservation';
import { useErrorHandler } from '@/utils/errorHandling';
import { ComponentFallbacks } from '@/components/fallbacks/ComponentFallbacks';
import { useSteeringFileIntelligence, ElementalProperties } from '@/utils/steeringFileIntelligence';
import { 
  useAgentHooks,
  usePlanetaryDataValidationHook,
  useIngredientConsistencyHook,
  useTypeScriptCampaignHook,
  useBuildQualityMonitoringHook,
  useQualityMetricsHook
} from '@/hooks/useAgentHooks';
import { useMCPServerIntegration } from '@/utils/mcpServerIntegration';
import { useDevelopmentExperienceOptimizations } from '@/utils/developmentExperienceOptimizations';

// Lazy load non-critical components for better performance
const ConsolidatedDebugInfo = lazy(() => import('@/components/debug/ConsolidatedDebugInfo'));
const CuisineRecommender = lazy(() => import('@/components/CuisineRecommender'));
const IngredientRecommender = lazy(() => import('@/components/IngredientRecommender'));
const CookingMethodsSection = lazy(() => import('@/components/CookingMethodsSection'));
const RecipeBuilderSimple = lazy(() => import('@/components/recipes/RecipeBuilderSimple'));

interface MainPageLayoutProps {
  children?: React.ReactNode;
  debugMode?: boolean;
  loading?: boolean;
  onSectionNavigate?: (sectionId: string) => void;
}

interface SectionConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  loading: boolean;
  error: string | null;
}

// Main Page Context for cross-component data sharing
interface MainPageContextType {
  // Shared state
  selectedIngredients: string[];
  selectedCuisine: string | null;
  selectedCookingMethods: string[];
  currentRecipe: any | null;
  
  // Navigation state
  activeSection: string | null;
  navigationHistory: string[];
  
  // Update functions
  updateSelectedIngredients: (ingredients: string[]) => void;
  updateSelectedCuisine: (cuisine: string | null) => void;
  updateSelectedCookingMethods: (methods: string[]) => void;
  updateCurrentRecipe: (recipe: any | null) => void;
  setActiveSection: (section: string | null) => void;
  
  // Cross-component communication
  notifyComponentUpdate: (componentId: string, data: any) => void;
  subscribeToUpdates: (componentId: string, callback: (data: any) => void) => () => void;
}

const MainPageContext = createContext<MainPageContextType | null>(null);

export const useMainPageContext = () => {
  const context = useContext(MainPageContext);
  if (!context) {
    throw new Error('useMainPageContext must be used within MainPageLayout');
  }
  return context;
};

// Memoized loading fallback component for better performance
const ComponentLoadingFallback = memo(function ComponentLoadingFallback({ 
  componentName 
}: { 
  componentName: string 
}) {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span className="text-gray-600">Loading {componentName}...</span>
      </div>
    </div>
  );
});

const MainPageLayout: React.FC<MainPageLayoutProps> = memo(function MainPageLayout({
  children,
  debugMode = process.env.NODE_ENV === 'development',
  loading = false,
  onSectionNavigate
}) {
  const router = useRouter();
  const { state, planetaryPositions, isDaytime } = useAlchemical();
  
  // Use new state preservation hooks
  const { saveState: saveNavState, getState: getNavState } = useNavigationState();
  const { restoreScrollPosition } = useScrollPreservation('main-page');
  useAutoStateCleanup();

  // Enhanced hooks with steering file intelligence
  const steeringIntelligence = useSteeringFileIntelligence();
  // Temporarily disabled for testing
  // const { 
  //   saveAstrologicalState, 
  //   restoreAstrologicalState,
  //   validateElementalCompatibility,
  //   getArchitecturalGuidance,
  //   getTechnologyStackGuidance
  // } = useAstrologicalStatePreservation('main-page-layout');
  
  // Temporarily disabled for testing
  // const { validateCulturalContent, getInclusiveLanguageGuidelines } = useCulturalSensitivityGuidance();
  // const { getOptimizationRecommendations, validatePerformanceMetrics } = usePerformanceOptimizationGuidance();

  // Agent hooks for automated quality assurance - temporarily disabled for testing
  // const { hookState: agentHookState, startAgentHooks, stopAgentHooks, triggerValidation } = useAgentHooks({
  //   enablePlanetaryValidation: true,
  //   enableIngredientValidation: true,
  //   enableCampaignTriggers: true,
  //   enablePerformanceMonitoring: true,
  //   validationInterval: 5 // 5 minutes
  // });

  // const { validationResult: planetaryValidation, validatePlanetaryData } = usePlanetaryDataValidationHook(true);
  
  // Temporary placeholders for disabled hooks
  const agentHookState = null;
  const planetaryValidation = null;
  const { validationResult: ingredientValidation, validateIngredients } = useIngredientConsistencyHook();
  const { campaignTrigger: typescriptTrigger, checkErrorThreshold } = useTypeScriptCampaignHook(true);
  const { qualityResult: buildQuality, monitorBuildQuality } = useBuildQualityMonitoringHook();
  const { metrics: qualityMetrics, updateMetrics } = useQualityMetricsHook(30000); // 30 seconds

  // MCP server integration for reliable external APIs
  const { 
    getAstrologicalData, 
    getNutritionalData, 
    getRecipeData, 
    testFallbackStrategy, 
    getServerStatus 
  } = useMCPServerIntegration();

  // Development experience optimizations
  const {
    updatePerformanceMetrics: updateDevMetrics,
    getDevelopmentMetrics,
    getPerformanceOptimizationRecommendations: getDevOptimizationRecommendations,
    applyAutomaticOptimizations
  } = useDevelopmentExperienceOptimizations();

  const [sectionStates, setSectionStates] = useState<Record<string, { loading: boolean; error: string | null }>>({
    cuisine: { loading: false, error: null },
    ingredients: { loading: false, error: null },
    cooking: { loading: false, error: null },
    recipe: { loading: false, error: null }
  });

  // Main Page Context State - Initialize from preserved state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedCookingMethods, setSelectedCookingMethods] = useState<string[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  // Component update subscribers
  const [updateSubscribers, setUpdateSubscribers] = useState<Record<string, ((data: any) => void)[]>>({});

  // Steering file intelligence state
  const [astrologicalGuidance, setAstrologicalGuidance] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [culturalValidation, setCulturalValidation] = useState<any>(null);

  // Initialize state from preserved navigation state
  useEffect(() => {
    const restoredState = getNavState();
    if (restoredState) {
      if (restoredState.selectedIngredients?.length > 0) {
        setSelectedIngredients(restoredState.selectedIngredients);
      }
      if (restoredState.selectedCuisine) {
        setSelectedCuisine(restoredState.selectedCuisine);
      }
      if (restoredState.selectedCookingMethods?.length > 0) {
        setSelectedCookingMethods(restoredState.selectedCookingMethods);
      }
      if (restoredState.currentRecipe) {
        setCurrentRecipe(restoredState.currentRecipe);
      }
      if (restoredState.activeSection) {
        setActiveSection(restoredState.activeSection);
      }
      if (restoredState.navigationHistory?.length > 0) {
        setNavigationHistory(restoredState.navigationHistory);
      }
      
      logger.debug('Restored main page context from enhanced state preservation');
    }
    
    // Restore scroll position after a short delay to ensure DOM is ready
    setTimeout(() => {
      restoreScrollPosition();
    }, 100);
  }, [getNavState, restoreScrollPosition]);

  // Initialize steering file intelligence guidance
  useEffect(() => {
    const initializeGuidance = async () => {
      try {
        const guidance = await steeringIntelligence.getGuidance();
        setAstrologicalGuidance(guidance);
        
        // Apply architectural guidance for component optimization - temporarily disabled
        // const archGuidance = getArchitecturalGuidance();
        // logger.debug('Applied architectural guidance from steering files:', archGuidance);
        
        // Validate cultural content if we have any - temporarily disabled
        // if (selectedCuisine || selectedIngredients.length > 0) {
        //   const validation = validateCulturalContent({
        //     ingredientNames: selectedIngredients,
        //     cuisineDescriptions: selectedCuisine ? [selectedCuisine] : []
        //   });
        //   setCulturalValidation(validation);
        //   
        //   if (!validation.isCompliant) {
        //     logger.warn('Cultural sensitivity issues detected:', validation.issues);
        //   }
        // }
        
        // Get performance optimization recommendations - temporarily disabled
        // const perfRecommendations = getOptimizationRecommendations('main-page-layout');
        // logger.debug('Performance optimization recommendations:', perfRecommendations);
        
      } catch (error) {
        logger.error('Error initializing steering file intelligence:', error);
      }
    };

    initializeGuidance();
  }, [steeringIntelligence, selectedCuisine, selectedIngredients]);

  // Monitor performance metrics using steering file guidance
  useEffect(() => {
    const startTime = performance.now();
    
    const measurePerformance = () => {
      const renderTime = performance.now() - startTime;
      const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;
      
      const metrics = {
        renderTime,
        memoryUsage,
        componentCount: Object.keys(sectionStates).length,
        activeSubscribers: Object.values(updateSubscribers).reduce((sum, subs) => sum + subs.length, 0)
      };
      
      setPerformanceMetrics(metrics);
      
      // Validate performance against steering file thresholds - temporarily disabled
      // const validation = validatePerformanceMetrics({
      //   renderTime,
      //   memoryUsage
      // });
      // 
      // if (!validation.isOptimal) {
      //   logger.warn('Performance issues detected:', validation.issues);
      //   logger.info('Performance recommendations:', validation.recommendations);
      // }
    };

    // Measure performance after component mounts and updates
    const timeoutId = setTimeout(measurePerformance, 100);
    
    return () => clearTimeout(timeoutId);
  }, [sectionStates, updateSubscribers]);

  // Enhanced state preservation with astrological context
  useEffect(() => {
    const saveEnhancedState = async () => {
      try {
        // Calculate elemental properties from current selections
        const elementalProps: ElementalProperties = {
          Fire: selectedCookingMethods.filter(method => method.includes('grill') || method.includes('sauté')).length * 0.3,
          Water: selectedIngredients.filter(ing => ing.includes('soup') || ing.includes('steam')).length * 0.3,
          Earth: selectedIngredients.filter(ing => ing.includes('root') || ing.includes('grain')).length * 0.3,
          Air: selectedIngredients.filter(ing => ing.includes('herb') || ing.includes('spice')).length * 0.3
        };

        // Save astrological state with steering file intelligence
        // Temporarily disabled for testing
        // await saveAstrologicalState({
        //   elementalProperties: elementalProps,
        //   selectedIngredients,
        //   astrologicalContext: {
        //     selectedCuisine,
        //     selectedCookingMethods,
        //     currentRecipe,
        //     activeSection,
        //     navigationHistory
        //   }
        // });
      } catch (error) {
        logger.error('Error saving enhanced astrological state:', error);
      }
    };

    if (selectedIngredients.length > 0 || selectedCuisine || selectedCookingMethods.length > 0) {
      saveEnhancedState();
    }
  }, [selectedIngredients, selectedCuisine, selectedCookingMethods, currentRecipe, activeSection, navigationHistory]);

  // Initialize agent hooks for automated quality assurance - temporarily disabled for testing
  // useEffect(() => {
  //   startAgentHooks();
  //   logger.info('Agent hooks started for automated quality assurance');
  //   
  //   return () => {
  //     stopAgentHooks();
  //     logger.info('Agent hooks stopped');
  //   };
  // }, [startAgentHooks, stopAgentHooks]);

  // Monitor ingredient consistency when ingredients change
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      const ingredientsWithElementalProps = selectedIngredients.map(ingredient => ({
        name: ingredient,
        elementalProperties: {
          Fire: ingredient.includes('spice') || ingredient.includes('pepper') ? 0.8 : 0.2,
          Water: ingredient.includes('soup') || ingredient.includes('broth') ? 0.8 : 0.2,
          Earth: ingredient.includes('root') || ingredient.includes('grain') ? 0.8 : 0.2,
          Air: ingredient.includes('herb') || ingredient.includes('leaf') ? 0.8 : 0.2
        } as ElementalProperties,
        category: ingredient.includes('spice') ? 'spices' : 
                 ingredient.includes('herb') ? 'herbs' : 
                 ingredient.includes('grain') ? 'grains' : 'other'
      }));

      validateIngredients(ingredientsWithElementalProps).then(result => {
        if (result && !result.isValid) {
          logger.warn('Ingredient consistency validation failed:', result.issues);
        }
      }).catch(error => {
        logger.error('Error validating ingredient consistency:', error);
      });
    }
  }, [selectedIngredients]);

  // Monitor build quality and performance metrics
  useEffect(() => {
    const monitorQuality = async () => {
      try {
        const buildMetrics = {
          buildTime: performanceMetrics.renderTime || 0,
          memoryUsage: performanceMetrics.memoryUsage || 0,
          bundleSize: 150 * 1024, // Estimated 150KB for main page
          errorCount: 0 // No build errors in this context
        };

        const qualityResult = await monitorBuildQuality(buildMetrics);
        if (qualityResult && !qualityResult.isValid) {
          logger.warn('Build quality issues detected:', qualityResult.issues);
        }
      } catch (error) {
        logger.error('Error monitoring build quality:', error);
      }
    };

    // Monitor quality every 30 seconds
    const qualityInterval = setInterval(monitorQuality, 30000);
    
    // Initial quality check
    monitorQuality();
    
    return () => clearInterval(qualityInterval);
  }, [performanceMetrics, monitorBuildQuality]);

  // Test MCP server integration and fallback strategy
  useEffect(() => {
    const testMCPIntegration = async () => {
      try {
        // Test fallback strategy on component mount
        const fallbackTest = await testFallbackStrategy();
        logger.info('MCP server fallback strategy test completed:', {
          overallReliability: fallbackTest.overallReliability,
          astrological: fallbackTest.astrological.source,
          nutritional: fallbackTest.nutritional.source,
          recipes: fallbackTest.recipes.source
        });

        // Monitor server status
        const serverStatus = getServerStatus();
        logger.debug('MCP server status:', serverStatus);

        // Test individual API integrations if needed
        if (selectedIngredients.length > 0) {
          const nutritionalData = await getNutritionalData(selectedIngredients[0]);
          if (nutritionalData.success) {
            logger.debug(`Nutritional data fetched via ${nutritionalData.source} for ${selectedIngredients[0]}`);
          }
        }

      } catch (error) {
        logger.error('Error testing MCP server integration:', error);
      }
    };

    // Test MCP integration on mount and when ingredients change
    testMCPIntegration();

    // Set up periodic server status monitoring
    const statusInterval = setInterval(() => {
      const serverStatus = getServerStatus();
      logger.debug('MCP server status check:', serverStatus);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(statusInterval);
  }, [testFallbackStrategy, getServerStatus, getNutritionalData, selectedIngredients]);

  // Apply development experience optimizations
  useEffect(() => {
    const applyDevOptimizations = async () => {
      try {
        // Update development metrics with current performance data
        const devMetrics = {
          compilationTime: performanceMetrics.renderTime || 0,
          memoryUsage: performanceMetrics.memoryUsage || 0,
          bundleSize: 150 * 1024, // Estimated bundle size
          errorCount: 0, // No compilation errors in runtime
          warningCount: 0,
          hotReloadTime: 0
        };

        updateDevMetrics(devMetrics);

        // Get development optimization recommendations
        const devRecommendations = getDevOptimizationRecommendations();
        if (debugMode) {
          logger.debug('Development optimization recommendations:', devRecommendations);
        }

        // Apply automatic optimizations in development mode
        if (debugMode && process.env.NODE_ENV === 'development') {
          const optimizationResults = applyAutomaticOptimizations();
          if (optimizationResults.applied.length > 0) {
            logger.info('Applied automatic development optimizations:', optimizationResults.applied);
          }
          if (optimizationResults.errors.length > 0) {
            logger.warn('Development optimization errors:', optimizationResults.errors);
          }
        }

        // Monitor development metrics
        const currentDevMetrics = getDevelopmentMetrics();
        if (debugMode) {
          logger.debug('Current development metrics:', currentDevMetrics);
        }

      } catch (error) {
        logger.error('Error applying development experience optimizations:', error);
      }
    };

    // Apply optimizations on mount and when performance metrics change
    applyDevOptimizations();

    // Set up periodic optimization monitoring
    const devOptimizationInterval = setInterval(applyDevOptimizations, 60000); // Every minute

    return () => clearInterval(devOptimizationInterval);
  }, [performanceMetrics, updateDevMetrics, getDevOptimizationRecommendations, applyAutomaticOptimizations, getDevelopmentMetrics, debugMode]);

  // Log quality metrics and campaign triggers for debugging
  useEffect(() => {
    if (debugMode) {
      logger.debug('Quality Metrics:', qualityMetrics);
      logger.debug('Agent Hook State:', agentHookState);
      
      if (planetaryValidation && !planetaryValidation.isValid) {
        logger.warn('Planetary validation issues:', planetaryValidation.issues);
      }
      
      if (typescriptTrigger?.triggered) {
        logger.warn('TypeScript campaign trigger active:', typescriptTrigger);
      }
      
      if (buildQuality && !buildQuality.isValid) {
        logger.warn('Build quality issues:', buildQuality.issues);
      }

      // Log MCP server status in debug mode
      const serverStatus = getServerStatus();
      logger.debug('MCP Server Status:', serverStatus);

      // Log development metrics in debug mode
      const devMetrics = getDevelopmentMetrics();
      logger.debug('Development Experience Metrics:', devMetrics);
    }
  }, [debugMode, qualityMetrics, agentHookState, planetaryValidation, typescriptTrigger, buildQuality, getServerStatus, getDevelopmentMetrics]);



  // Save state changes using enhanced state preservation
  useEffect(() => {
    saveNavState({
      selectedIngredients,
      selectedCuisine,
      selectedCookingMethods,
      currentRecipe,
      activeSection,
      navigationHistory,
      scrollPosition: window.scrollY
    });
  }, [selectedIngredients, selectedCuisine, selectedCookingMethods, currentRecipe, activeSection, navigationHistory, saveNavState]);

  // Context update functions
  const updateSelectedIngredients = useCallback((ingredients: string[]) => {
    setSelectedIngredients(ingredients);
    notifyComponentUpdate('ingredients', { selectedIngredients: ingredients });
    logger.debug('Updated selected ingredients:', ingredients);
  }, []);

  const updateSelectedCuisine = useCallback((cuisine: string | null) => {
    setSelectedCuisine(cuisine);
    notifyComponentUpdate('cuisine', { selectedCuisine: cuisine });
    logger.debug('Updated selected cuisine:', cuisine);
  }, []);

  const updateSelectedCookingMethods = useCallback((methods: string[]) => {
    setSelectedCookingMethods(methods);
    notifyComponentUpdate('cooking', { selectedCookingMethods: methods });
    logger.debug('Updated selected cooking methods:', methods);
  }, []);

  const updateCurrentRecipe = useCallback((recipe: any | null) => {
    setCurrentRecipe(recipe);
    notifyComponentUpdate('recipe', { currentRecipe: recipe });
    logger.debug('Updated current recipe:', recipe);
  }, []);

  const handleSetActiveSection = useCallback((section: string | null) => {
    setActiveSection(section);
    if (section) {
      setNavigationHistory(prev => [...prev.slice(-9), section]); // Keep last 10 sections
    }
  }, []);

  // Cross-component communication
  const notifyComponentUpdate = useCallback((componentId: string, data: any) => {
    const subscribers = updateSubscribers[componentId] || [];
    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error(`Error in component update callback for ${componentId}:`, error);
      }
    });
  }, [updateSubscribers]);

  const subscribeToUpdates = useCallback((componentId: string, callback: (data: any) => void) => {
    setUpdateSubscribers(prev => ({
      ...prev,
      [componentId]: [...(prev[componentId] || []), callback]
    }));

    // Return unsubscribe function
    return () => {
      setUpdateSubscribers(prev => ({
        ...prev,
        [componentId]: (prev[componentId] || []).filter(cb => cb !== callback)
      }));
    };
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue: MainPageContextType = useMemo(() => ({
    // Shared state
    selectedIngredients,
    selectedCuisine,
    selectedCookingMethods,
    currentRecipe,
    activeSection,
    navigationHistory,
    
    // Update functions
    updateSelectedIngredients,
    updateSelectedCuisine,
    updateSelectedCookingMethods,
    updateCurrentRecipe,
    setActiveSection: handleSetActiveSection,
    
    // Cross-component communication
    notifyComponentUpdate,
    subscribeToUpdates
  }), [
    selectedIngredients,
    selectedCuisine,
    selectedCookingMethods,
    currentRecipe,
    activeSection,
    navigationHistory,
    updateSelectedIngredients,
    updateSelectedCuisine,
    updateSelectedCookingMethods,
    updateCurrentRecipe,
    handleSetActiveSection,
    notifyComponentUpdate,
    subscribeToUpdates
  ]);

  // Handle section navigation with enhanced context preservation and smooth transitions
  const handleSectionNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Add smooth transition effect
      element.style.transition = 'all 0.3s ease-in-out';
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update active section and navigation history
      handleSetActiveSection(sectionId);
      onSectionNavigate?.(sectionId);
      
      // Save navigation state using enhanced preservation system
      saveNavState({
        selectedIngredients,
        selectedCuisine,
        selectedCookingMethods,
        currentRecipe,
        activeSection: sectionId,
        navigationHistory: [...navigationHistory, sectionId].slice(-10), // Keep last 10
        scrollPosition: window.scrollY
      });
      
      // Add visual feedback for navigation
      element.classList.add('highlight-section');
      setTimeout(() => {
        element.classList.remove('highlight-section');
        element.style.transition = '';
      }, 1000);
    }
  }, [onSectionNavigate, handleSetActiveSection, navigationHistory, saveNavState, selectedIngredients, selectedCuisine, selectedCookingMethods, currentRecipe]);

  // Update section loading state
  const updateSectionState = useCallback((sectionId: string, updates: Partial<{ loading: boolean; error: string | null }>) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...updates }
    }));
  }, []);

  // Section error boundary fallback
  const SectionErrorFallback: React.FC<{ error: Error; sectionId: string; onRetry: () => void }> = ({ 
    error, 
    sectionId, 
    onRetry 
  }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Section Error: {sectionId}
      </h3>
      <p className="text-red-600 mb-4">
        {error.message || 'An unexpected error occurred in this section.'}
      </p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        Retry Section
      </button>
    </div>
  );

  // Section wrapper with error boundary
  const SectionWrapper: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ id, title, children, className = '' }) => {
    const [retryKey, setRetryKey] = useState(0);
    
    const handleRetry = useCallback(() => {
      setRetryKey(prev => prev + 1);
      updateSectionState(id, { loading: false, error: null });
    }, [id]);

    return (
      <section 
        id={id} 
        className={`bg-white rounded-lg shadow-md p-6 scroll-mt-20 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          {sectionStates[id]?.loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
        
        <ErrorBoundary
          key={retryKey}
          fallback={(error) => (
            <SectionErrorFallback 
              error={error} 
              sectionId={id} 
              onRetry={handleRetry} 
            />
          )}
        >
          {children}
        </ErrorBoundary>
      </section>
    );
  };

  return (
    <MainPageContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">
            What to Eat Next
          </h1>
          <p className="text-indigo-600 mb-4">
            Food recommendations based on the current celestial energies
          </p>
          
          {/* Loading Status Indicator */}
          <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                <p className="text-sm text-gray-600">Loading astrological data...</p>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p className="text-sm text-gray-600">
                  Connected • {isDaytime ? 'Day' : 'Night'} • {state.astrologicalState?.sunSign || 'Loading...'}
                </p>
              </div>
            )}
          </div>
        </header>
        
        {/* Sticky Navigation with Jump Links */}
        <nav className="flex flex-wrap justify-center gap-4 mb-8 bg-white rounded-lg shadow-md p-4 sticky top-2 z-10">
          <button
            onClick={() => handleSectionNavigate('cuisine')}
            className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            Cuisine Recommendations
          </button>
          <button
            onClick={() => handleSectionNavigate('ingredients')}
            className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            Ingredient Recommendations
          </button>
          <button
            onClick={() => handleSectionNavigate('cooking')}
            className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            Cooking Methods
          </button>
          <button
            onClick={() => handleSectionNavigate('recipe')}
            className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            Recipe Builder
          </button>
        </nav>
        
        {/* Main Content - Single Column Stacked Layout */}
        <main className="flex flex-col gap-8 max-w-6xl mx-auto">
          {/* Cuisine Recommender Section */}
          <SectionWrapper id="cuisine" title="Cuisine Recommendations">
            <ErrorBoundary
              fallback={(error) => (
                <ComponentFallbacks.CuisineRecommender 
                  onRetry={() => window.location.reload()}
                  error={error}
                />
              )}
            >
              <Suspense fallback={<ComponentFallbacks.Loading componentName="Cuisine Recommender" />}>
                <CuisineRecommender />
              </Suspense>
            </ErrorBoundary>
          </SectionWrapper>
          
          {/* Ingredient Recommender Section */}
          <SectionWrapper id="ingredients" title="Ingredient Recommendations">
            <ErrorBoundary
              fallback={(error) => (
                <ComponentFallbacks.IngredientRecommender 
                  onRetry={() => window.location.reload()}
                  error={error}
                />
              )}
            >
              <Suspense fallback={<ComponentFallbacks.Loading componentName="Ingredient Recommender" />}>
                <IngredientRecommender 
                  isFullPageVersion={false}
                  maxDisplayed={8}
                />
              </Suspense>
            </ErrorBoundary>
          </SectionWrapper>
          
          {/* Cooking Methods Section */}
          <SectionWrapper id="cooking" title="Cooking Methods">
            <ErrorBoundary
              fallback={(error) => (
                <ComponentFallbacks.CookingMethods 
                  onRetry={() => window.location.reload()}
                  error={error}
                />
              )}
            >
              <Suspense fallback={<ComponentFallbacks.Loading componentName="Cooking Methods" />}>
                <CookingMethodsSection 
                  isMainPageVersion={true}
                  maxDisplayed={6}
                  onViewMore={() => router.push('/cooking-methods')}
                />
              </Suspense>
            </ErrorBoundary>
          </SectionWrapper>
          
          {/* Recipe Builder Section */}
          <SectionWrapper id="recipe" title="Recipe Builder">
            <ErrorBoundary
              fallback={(error) => (
                <ComponentFallbacks.RecipeBuilder 
                  onRetry={() => window.location.reload()}
                  error={error}
                />
              )}
            >
              <Suspense fallback={<ComponentFallbacks.Loading componentName="Recipe Builder" />}>
                <RecipeBuilderSimple />
              </Suspense>
            </ErrorBoundary>
          </SectionWrapper>
          
          {/* Additional children if provided */}
          {children}
        </main>
        
        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="mx-auto mb-4" style={{ maxWidth: '250px' }}>
            <form action="https://www.paypal.com/ncp/payment/SVN6Q368TKKLS" method="post" target="_blank">
              <input 
                type="submit" 
                value="HELP" 
                style={{
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: '0.25rem',
                  width: '100%',
                  padding: '0 2rem',
                  height: '2.625rem',
                  fontWeight: 'bold',
                  backgroundColor: '#FFD140',
                  color: '#000000',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: '1rem',
                  lineHeight: '1.25rem',
                  cursor: 'pointer'
                }}
              />
            </form>
          </div>
        </footer>
      </div>
      
      {/* Debug Panel - Fixed Bottom Right */}
      {debugMode && (
        <Suspense fallback={null}>
          <ConsolidatedDebugInfo 
            position="bottom-right"
            collapsible={true}
            showPerformanceMetrics={true}
            showAstrologicalData={true}
            showComponentStates={true}
          />
        </Suspense>
      )}
      
      {/* CSS for smooth navigation transitions */}
      <style jsx>{`
        .highlight-section {
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
          border: 2px solid rgba(99, 102, 241, 0.3);
        }
        
        section {
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
        }
        
        nav button:hover {
          transform: translateY(-1px);
        }
        
        nav button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
    </MainPageContext.Provider>
  );
});

export default MainPageLayout;