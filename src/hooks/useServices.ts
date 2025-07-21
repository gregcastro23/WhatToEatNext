/**
 * useServices.ts
 * 
 * A React hook that provides access to the application services.
 * Ensures that services are initialized before they are used.
 */

import { useEffect, useState } from 'react';

import { servicesManager, InitializationStatus } from '../services';
import { createLogger } from '../utils/logger';

// Initialize logger
const logger = createLogger('useServices');

/**
 * A hook that provides access to application services with proper initialization
 */
export function useServices() {
  const [isInitialized, setIsInitialized] = useState(servicesManager.isInitialized);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!servicesManager.isInitialized);
  const [status, setStatus] = useState<InitializationStatus>(
    servicesManager.isInitialized 
      ? InitializationStatus.COMPLETED 
      : InitializationStatus.NOT_STARTED
  );

  useEffect(() => {
    // If already initialized, do nothing
    if (servicesManager.isInitialized) {
      return;
    }

    let isMounted = true;
    
    const initializeServices = async () => {
      try {
        setIsLoading(true);
        setStatus(InitializationStatus.IN_PROGRESS);
        await servicesManager.initialize();
        
        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
          setStatus(InitializationStatus.COMPLETED);
          logger.info('Services initialized successfully');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Error initializing services:', error);
        
        if (isMounted) {
          setError(error);
          setIsLoading(false);
          setStatus(InitializationStatus.FAILED);
        }
      }
    };

    initializeServices();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Get all services from the manager
  const services = servicesManager.isInitialized 
    ? servicesManager.getServices() 
    : null;

  return {
    isInitialized,
    isLoading,
    error,
    status,
    services,
    serviceResults: servicesManager.serviceResults,
    // Individual services for convenience
    alchemicalEngine: services?.alchemicalEngine,
    astrologyService: services?.astrologyService,
    ingredientService: services?.ingredientService,
    recipeService: services?.recipeService,
    recommendationService: services?.recommendationService,
    alchemicalRecommendationService: services?.alchemicalRecommendationService
  };
}

export default useServices; 