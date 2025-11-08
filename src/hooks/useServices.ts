/**
 * useServices.ts
 *
 * A React hook that provides access to the application services.
 * Ensures that services are initialized before they are used.
 */

import { useEffect, useState } from "react";
import { InitializationStatus, servicesManager } from "../services";
import { createLogger } from "../utils/logger";

// Initialize logger
const logger = createLogger("useServices");

/**
 * A hook that provides access to application services with proper initialization
 */
export function useServices() {
  const [isInitialized, setIsInitialized] = useState(
    servicesManager.initialized,
  );
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!servicesManager.initialized);
  const [status, setStatus] = useState<typeof InitializationStatus>(
    servicesManager.initialized
      ? (InitializationStatus.COMPLETED as any)
      : (InitializationStatus.NOT_STARTED as any),
  );

  useEffect(() => {
    // If already initialized, do nothing
    if (servicesManager.initialized) {
      return;
    }

    let isMounted = true;

    const initializeServices = async () => {
      try {
        setIsLoading(true);
        setStatus(InitializationStatus.IN_PROGRESS as any);
        await servicesManager.initialize();

        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
          setStatus(InitializationStatus.COMPLETED as any);
          logger.info("Services initialized successfully");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Error initializing services: ", error);

        if (isMounted) {
          setError(error);
          setIsLoading(false);
          setStatus(InitializationStatus.FAILED as any);
        }
      }
    };

    void initializeServices();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Get all services from the manager
  const services = servicesManager.initialized
    ? (servicesManager as any).getServices()
    : null;

  return {
    isInitialized,
    isLoading,
    error,
    status,
    services,
    serviceResults: (servicesManager as any).serviceResults,
    // Individual services for convenience
    alchemicalEngine: services?.alchemicalEngine,
    astrologyService: services?.astrologyService,
    ingredientService: services?.ingredientService,
    recipeService: services?.recipeService,
    recommendationService: services?.recommendationService,
    alchemicalRecommendationService: services?.alchemicalRecommendationService,
  };
}

export default useServices;
