import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LunarPhase,
  PlanetaryPosition,
  ZodiacSign,
} from "@/types/astrology";
import { createLogger } from "@/utils/logger";
import * as safeAstrology from "@/utils/safeAstrology";

const logger = createLogger("useAstrology");

// Track active API requests to prevent duplicate calls
 
const activeRequests = new Map<string, Promise<any>>();

interface AstrologyOptions {
  latitude?: number | null;
  longitude?: number | null;
  date?: Date;
  autoLoad?: boolean;
  useFallback?: boolean;
}

interface AstrologyState {
  loading: boolean;
  error: string | null;
  data: {
    planetaryPositions: Record<string, PlanetaryPosition> | null;
    currentSign: ZodiacSign | null;
    lunarPhase: LunarPhase | null;
    elementalBalance: Record<string, number> | null;
    aspectsInfluence: number | null;
  };
  lastUpdated: number | null;
}

const initialAstrologyState: AstrologyState = {
  loading: false,
  error: null,
  data: {
    planetaryPositions: null,
    currentSign: null,
    lunarPhase: null,
    elementalBalance: null,
    aspectsInfluence: null,
  },
  lastUpdated: null,
};

/**
 * React hook for accessing astrological data and calculations
 * Provides an easy interface for components to get planetary positions;
 * elemental balance, and other astrological information
 */
export function useAstrology(options: AstrologyOptions = {}) {
  const {
    latitude = null,
    longitude = null,
    date: _providedDate,
    autoLoad = true,
    useFallback = false,
  } = options;

  // Use ref for date to prevent recreating on each render
  const dateRef = useRef(options.date || new Date());
  const [state, setState] = useState<AstrologyState>(initialAstrologyState);
  const [isClient, setIsClient] = useState(false);

  // Track if the component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Ensure we only run client-side code in the browser
  useEffect(() => {
    setIsClient(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Create a cache key for requests to prevent duplicate calls
   */
  const createCacheKey = useCallback(
    (lat: number, lng: number, date: Date): string =>
      `${lat}_${lng}_${date.getTime()}`,
    [],
  );

  /**
   * Fetch astrological data from the API
   */
  const fetchAstrologyData = useCallback(
    async (lat: number, lng: number, targetDate: Date = dateRef.current) => {
      // Safety checks to prevent redundant calls
      if (!isClient || !isMountedRef.current) return null;
      if (state.loading) {
        logger.debug("Skipping redundant API call while loading");
        return null;
      }

      // Validate inputs before proceeding
      if (lat === null || lng === null) {
        const error = "Latitude and longitude are required";
        setState((prev) => ({ ...prev, error, loading: false }));
        return null;
      }

      if (lat < -90 || lat > 90) {
        const error = "Latitude must be between -90 and 90";
        setState((prev) => ({ ...prev, error, loading: false }));
        return null;
      }

      if (lng < -180 || lng > 180) {
        const error = "Longitude must be between -180 and 180";
        setState((prev) => ({ ...prev, error, loading: false }));
        return null;
      }

      // Check cache for active requests with the same parameters
      const cacheKey = createCacheKey(lat, lng, targetDate);
      const existingRequest = activeRequests.get(cacheKey);

      if (existingRequest) {
        logger.debug("Using existing API request from cache");
        return existingRequest;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Create the request promise
      const requestPromise = (async () => {
        try {
          // Format date as ISO string for API
          const dateParam = targetDate.toISOString();

          // Call the API with exponential backoff retry
          const maxRetries = 2;
          let retryCount = 0;
          let response: Response | null = null;

          while (retryCount <= maxRetries) {
            try {
              response = await fetch(
                `/api/astrology?lat=${lat}&lng=${lng}&date=${dateParam}`,
              );
              if (response.ok) break;

              // Only retry server errors, not client errors
              if (response && response.status < 500) break;

              // Exponential backoff
              const delay = Math.pow(2, retryCount) * 300;
              await new Promise((resolve) => setTimeout(resolve, delay));
              retryCount++;
            } catch (fetchError) {
              if (retryCount >= maxRetries) throw fetchError;
              retryCount++;
              const delay = Math.pow(2, retryCount) * 300;
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }

          if (!response || !response.ok) {
            const errorData = (await response?.json()) || {
              error: `API error: ${response?.status || "Network error"}`,
            };
            throw new Error(
              errorData.error || `API error: ${response?.status || "Unknown"}`,
            );
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Unknown error occurred");
          }

          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: null,
              lastUpdated: Date.now(),
              data: {
                planetaryPositions: data.data.positions,
                currentSign: data.data.currentSign,
                lunarPhase: data.data.lunarPhase,
                elementalBalance:
                  data.data.elementalBalance || prev.data.elementalBalance,
                aspectsInfluence:
                  data.data.aspectsInfluence || prev.data.aspectsInfluence,
              },
            }));
          }

          return data.data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          logger.error("Error fetching astrological data: ", error);

          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: errorMessage,
            }));

            // Use fallback if specified
            if (useFallback) {
              applyFallbackData();
            }
          }

          return null;
        } finally {
          // Clean up the cache entry
          activeRequests.delete(cacheKey);
        }
      })();

      // Store the promise in the cache
      activeRequests.set(cacheKey, requestPromise);

      return requestPromise;
    },
    [isClient, state.loading, useFallback, createCacheKey],
  );

  /**
   * Calculate elemental balance based on planetary positions
   */
  const calculateElementalBalance = useCallback(
    async (lat?: number, lng?: number, targetDate: Date = dateRef.current) => {
      if (!isClient || !isMountedRef.current) return null;
      if (state.loading) return null; // Prevent concurrent requests

      try {
        // Use provided coordinates or fall back to the ones in options
        const calcLat = lat !== undefined ? lat : latitude;
        const calcLng = lng !== undefined ? lng : longitude;

        if (calcLat === null || calcLng === null) {
          throw new Error("Latitude and longitude are required");
        }

        // Create cache key for this request
        const cacheKey = `elemBalance_${calcLat}_${calcLng}_${targetDate.getTime()}`;
        const existingRequest = activeRequests.get(cacheKey);

        if (existingRequest) {
          return existingRequest;
        }

        const requestPromise = (async () => {
          try {
            const response = await fetch("/api/astrology", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: calcLat,
                longitude: calcLng,
                timestamp: targetDate.toISOString(),
                calculation: "elementalBalance",
              }),
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || "Unknown error occurred");
            }

            if (isMountedRef.current) {
              setState((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  elementalBalance: data.data,
                },
              }));
            }

            return data.data;
          } catch (error) {
            logger.error("Error calculating elemental balance: ", error);

            // Use fallback if fallback mode is on
            if (useFallback) {
              return applyFallbackElementalBalance();
            }

            return null;
          } finally {
            activeRequests.delete(cacheKey);
          }
        })();

        activeRequests.set(cacheKey, requestPromise);
        return requestPromise;
      } catch (error) {
        logger.error("Error in calculateElementalBalance: ", error);
        return null;
      }
    },
    [isClient, latitude, longitude, useFallback, state.loading],
  );

  /**
   * Get astrological profile for a specific date
   */
  const getAstrologicalProfile = useCallback(
    async (
      profileDate: Date = dateRef.current,
      calcLatitude: number = latitude || 0,
      calcLongitude: number = longitude || 0,
    ) => {
      if (
        !isClient ||
        !isMountedRef.current ||
        calcLatitude === null ||
        calcLongitude === null
      ) {
        return null;
      }

      if (state.loading) return null; // Prevent concurrent requests

      const cacheKey = `profile_${calcLatitude}_${calcLongitude}_${profileDate.getTime()}`;
      const existingRequest = activeRequests.get(cacheKey);

      if (existingRequest) {
        return existingRequest;
      }

      const requestPromise = (async () => {
        try {
          const response = await fetch("/api/astrology", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: calcLatitude,
              longitude: calcLongitude,
              timestamp: profileDate.toISOString(),
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Unknown error occurred");
          }

          // Transform API data to AstrologicalProfile format
          const planetaryPositions = Object.entries(
            data.data.positions || {},
          ).map(([planet, position]: [string, any]) => ({
            planet,
            sign: position.sign,
            degree: position.degree,
            isRetrograde: position.isRetrograde,
          }));

          const profile = {
            zodiac: [data.data.currentSign],
            lunar: [data.data.lunarPhase],
            planetary: planetaryPositions,
          };

          return profile;
        } catch (error) {
          logger.error("Error getting astrological profile: ", error);
          return null;
        } finally {
          activeRequests.delete(cacheKey);
        }
      })();

      activeRequests.set(cacheKey, requestPromise);
      return requestPromise;
    },
    [isClient, latitude, longitude, state.loading],
  );

  /**
   * Apply fallback data from safeAstrology when API fails
   */
  const applyFallbackData = useCallback(() => {
    if (!isMountedRef.current) return null;

    try {
      const positions = safeAstrology.getReliablePlanetaryPositions();
      const lunarPhase = safeAstrology.getLunarPhaseName(
        safeAstrology.calculateLunarPhase(),
      ) as LunarPhase;
      const currentSign = safeAstrology.calculateSunSign();

      setState((prev: any) => ({
        ...prev,
        loading: false,
        error: "Using fallback data due to API error",
        data: {
          ...prev.data,
          planetaryPositions: positions,
          currentSign,
          lunarPhase,
        },
        lastUpdated: Date.now(),
      }));

      return {
        positions,
        currentSign,
        lunarPhase,
      };
    } catch (error) {
      logger.error("Error using fallback data: ", error);
      return null;
    }
  }, []);

  /**
   * Apply fallback elemental balance calculation
   */
  const applyFallbackElementalBalance = useCallback(() => {
    if (!isMountedRef.current) return null;

    try {
      const positions = safeAstrology.getReliablePlanetaryPositions();
      const elementalBalance: Record<string, number> = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };

      // Simple calculation based on sign elements
      const signElements: Record<string, string> = {
        aries: "Fire",
        leo: "Fire",
        sagittarius: "Fire",
        taurus: "Earth",
        virgo: "Earth",
        capricorn: "Earth",
        gemini: "Air",
        libra: "Air",
        aquarius: "Air",
        cancer: "Water",
        scorpio: "Water",
        pisces: "Water",
      };

      // Planet weights
      const weights: Record<string, number> = {
        sun: 3,
        moon: 2,
        mercury: 1,
        venus: 1,
        mars: 1,
        jupiter: 1,
        saturn: 1,
      };

      let totalWeight = 0;

      // Calculate weighted elemental balance
      Object.entries(positions).forEach(([planet, data]) => {
        const planetName = planet.toLowerCase();
        const weight = weights[planetName] || 0.5;
        const sign = (data.sign || "aries").toLowerCase();
        const element = signElements[sign];

        if (element) {
          elementalBalance[element] += weight;
          totalWeight += weight;
        }
      });

      // Normalize
      if (totalWeight > 0) {
        Object.keys(elementalBalance).forEach((element) => {
          elementalBalance[element] /= totalWeight;
        });
      }

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            elementalBalance,
          },
        }));
      }

      return elementalBalance;
    } catch (error) {
      logger.error("Error using fallback elemental balance: ", error);
      return {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };
    }
  }, []);

  /**
   * Get dominant zodiac element based on current positions
   */
  const getDominantElement = useCallback((): string => {
    const { elementalBalance } = state.data;

    if (!elementalBalance) {
      return "Fire"; // Default
    }

    let dominantElement = "Fire";
    let highestValue = 0;

    Object.entries(elementalBalance).forEach(([element, value]) => {
      if (value > highestValue) {
        highestValue = value;
        dominantElement = element;
      }
    });

    return dominantElement;
  }, [state.data.elementalBalance]);

  // Load data automatically when coordinates are available and autoLoad is true
  // Use stable reference via dateRef to prevent effect from running on every render
  useEffect(() => {
    if (
      isClient &&
      autoLoad &&
      latitude !== null &&
      longitude !== null &&
      isMountedRef.current
    ) {
      // Prevent duplicate fetch requests shortly after fetching
      const now = Date.now();
      const THROTTLE_TIME = 5000; // 5 seconds

      if (!state.lastUpdated || now - state.lastUpdated > THROTTLE_TIME) {
        void fetchAstrologyData(latitude, longitude, dateRef.current);
      }
    }
  }, [
    isClient,
    autoLoad,
    latitude,
    longitude,
    fetchAstrologyData,
    state.lastUpdated,
  ]);

  // Force refresh data method
  const refreshData = useCallback(() => {
    if (latitude !== null && longitude !== null) {
      void fetchAstrologyData(latitude, longitude, dateRef.current);
    }
  }, [latitude, longitude, fetchAstrologyData]);

  return {
    ...state,
    fetchAstrologyData,
    calculateElementalBalance,
    getAstrologicalProfile,
    getDominantElement,
    refreshData,
    isClient,
  };
}

export default useAstrology;
