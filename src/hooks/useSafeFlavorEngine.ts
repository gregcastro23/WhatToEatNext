'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { _useFlavorEngine } from '../contexts/FlavorEngineContext';
import type { UnifiedFlavorProfile } from '../data/unified/unifiedFlavorEngine';

// Keep track of global init state across hook instances
const globalInitState = {
  initialized: false,
  attempted: false,
  checkCount: 0,
  lastCheckTime: Date.now()
}

/**
 * A safer hook for accessing the flavor engine with error handling
 * and protection against re-render loops
 */
export function useSafeFlavorEngine() {
  const flavorEngine = _useFlavorEngine();
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Use refs to track component lifecycle and prevent useEffect loops
  const isMountedRef = useRef(false);
  const initCheckedRef = useRef(false);
  const renderCountRef = useRef(0);

  // Increment render count on each render
  renderCountRef.current += 1;

  // Add circuit breaker to prevent infinite update loops
  if (renderCountRef.current > 100) {
    // logger.error('Potential infinite loop in useSafeFlavorEngine detected - render count exceeded 100')

    // If we're entering an infinite loop, use the most recent valid state
    if (!isReady && globalInitState.initialized) {
      // logger.warn('Using globally initialized state to break potential loop')
      return {
        isReady: true,
        error: null,
        getProfile: () => undefined,
        searchProfiles: () => [],
        calculateCompatibility: () => null,
        profileCount: 0,
        categories: {}
      };
    }
  }

  // Check if flavor engine is ready (only once per component)
  useEffect(() => {
    isMountedRef.current = true;

    // Skip if we've already checked in this component
    if (initCheckedRef.current) return;
    initCheckedRef.current = true;

    // Circuit breaker: prevent checking more than once every 100ms globally
    const now = Date.now();
    if (now - globalInitState.lastCheckTime < 100) {
      // logger.warn('Throttling flavor engine initialization checks')
      return;
    }
    globalInitState.lastCheckTime = now;

    // If we already know globally it's initialized, use that state
    if (globalInitState.initialized) {
      setIsReady(flavorEngine.isInitialized);
      setError(flavorEngine.error);
      return;
    }

    // Limit check attempts to prevent infinite loops
    if (globalInitState.checkCount >= 3) {
      if (isMountedRef.current) {
        setError(new Error('Failed to initialize flavor engine after multiple attempts'));
      }
      return;
    }

    // Only check if the engine is actually available
    if (flavorEngine) {
      globalInitState.checkCount++;
      globalInitState.attempted = true;

      if (flavorEngine.isInitialized) {
        globalInitState.initialized = true;
        if (isMountedRef.current) {
          setIsReady(true);
        }
      } else if (flavorEngine.error) {
        if (isMountedRef.current) {
          setError(flavorEngine.error);
        }
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [flavorEngine]);

  // Create safe, memoized versions of the engine methods to prevent re-renders
  const getProfile = useCallback(
    (id: string): UnifiedFlavorProfile | undefined => {
      if (!isReady) return undefined;
      try {
        return flavorEngine.getProfile(id);
      } catch (err) {
        // logger.error('Error getting flavor profile: ', err)
        return undefined;
      }
    },
    [isReady, flavorEngine]
  );

  // Safe search profiles function with error handling
  const searchProfiles = useCallback(
    (_criteria: unknown): UnifiedFlavorProfile[] => {
      if (!isReady) return [];
      try {
        return flavorEngine.searchProfiles(_criteria);
      } catch (err) {
        // logger.error('Error searching flavor profiles: ', err)
        return [];
      }
    },
    [isReady, flavorEngine]
  );

  // Safe compatibility calculation with error handling
  const calculateCompatibility = useCallback(
    (profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile) => {
      if (!isReady) return null;

      try {
        return flavorEngine.calculateCompatibility(profile1, profile2);
      } catch (err) {
        // logger.error('Error calculating compatibility: ', err)
        return null;
      }
    },
    [isReady, flavorEngine]
  );

  // Extract values to avoid complex expressions in dependency array
  const profileCount = isReady ? flavorEngine.profileCount : 0;
  const categoriesString = isReady ? JSON.stringify(flavorEngine.categories) : '{}';

  // Memoize the complete API to prevent unnecessary re-renders
  return useMemo(
    () => ({
      isReady,
      error,
      getProfile,
      searchProfiles,
      calculateCompatibility,
      profileCount,
      categories: isReady ? flavorEngine.categories : {}
    }),
    [
      isReady,
      error,
      getProfile,
      searchProfiles,
      calculateCompatibility,
      profileCount,
      categoriesString
    ]
  );
}

export default useSafeFlavorEngine;
