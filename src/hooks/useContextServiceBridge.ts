import { useServices } from './useServices';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useEffect, useState } from 'react';
import { _PlanetaryPosition } from "@/types/celestial";

/**
 * A bridge hook that allows components to work with both legacy AlchemicalContext 
 * and new service-based architecture during the transition period.
 * 
 * This hook merges data from both sources, prioritizing services when available,
 * and falling back to context data when needed.
 */
export function useAlchemicalBridge() {
  // Get data from both legacy context and new services
  const { planetaryPositions: contextPositions, state: contextState } = useAlchemical();
  const serviceData = useServices();
  const { 
    isLoading, 
    error, 
    astrologyService
  } = serviceData;
  
  const elementalCalculator = (serviceData as unknown)?.elementalCalculator;
  const chakraService = (serviceData as unknown)?.chakraService;

  // Create state for service-based data
  const [servicePositions, setServicePositions] = useState<Record<string, any>>({});
  const [daytime, setDaytime] = useState<boolean | undefined>(undefined);

  // Fetch data from services when available
  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const fetchData = async () => {
        try {
          // Get planetary positions from service
          const positions = await astrologyService.getCurrentPlanetaryPositions();
          setServicePositions(positions);
          
          // Get daytime information
          const _isDaytime = await astrologyService.isDaytime();
          setDaytime(isDaytime);
        } catch (err) {
          // console.error('Error in useAlchemicalBridge:', err);
        }
      };
      
      fetchData();
    }
  }, [isLoading, error, astrologyService]);

  // Merge data from both sources, prioritizing services when available
  const mergedPositions = {
    ...contextPositions,
    ...servicePositions
  };

  return {
    // Basic status flags from services
    isLoading,
    error,
    
    // Merged and individual data sources
    planetaryPositions: mergedPositions,
    contextPositions,
    servicePositions,
    
    // State information
    isDaytime: daytime !== undefined ? daytime : (contextState as unknown)?.isDaytime,
    
    // Service references for direct access
    astrologyService,
    elementalCalculator,
    chakraService,
    
    // Flag indicating if services are ready to use
    servicesReady: !isLoading && !error && !!astrologyService
  };
}

/**
 * A bridge hook that allows components to work with both legacy ChakraContext
 * and new service-based architecture during the transition period.
 */
export function useChakraBridge() {
  // Get services
  const chakraServiceData = useServices();
  const { 
    isLoading, 
    error
  } = chakraServiceData;
  
  const chakraService = (chakraServiceData as unknown)?.chakraService;
  
  // State for chakra data
  const [chakras, setChakras] = useState<Record<string, any>>({});
  const [activeChakra, setActiveChakra] = useState<string | null>(null);

  // Fetch chakra data when service is available
  useEffect(() => {
    if (!isLoading && !error && chakraService) {
      const fetchChakraData = async () => {
        try {
          const allChakras = await chakraService.getAllChakras();
          // ✅ Pattern MM-1: Ensure object type for setChakras state setter
          setChakras(typeof allChakras === 'object' && allChakras !== null ? allChakras : {});
          
          const active = await chakraService.getActiveChakra();
          setActiveChakra(active);
        } catch (err) {
          // console.error('Error in useChakraBridge:', err);
        }
      };
      
      fetchChakraData();
    }
  }, [isLoading, error, chakraService]);

  return {
    isLoading,
    error,
    chakras,
    activeChakra,
    chakraService,
    servicesReady: !isLoading && !error && !!chakraService
  };
}

/**
 * A bridge hook that provides planetary hour data from both legacy context and new services
 */
export function usePlanetaryHoursBridge() {
  const { 
    isLoading, 
    error, 
    astrologyService 
  } = useServices();
  
  // State for planetary hours data
  const [currentHour, setCurrentHour] = useState<Record<string, any> | null>(null);
  const [currentDay, setCurrentDay] = useState<string | null>(null);
  const [dailyHours, setDailyHours] = useState<Map<number, string>>(new Map());

  // Fetch planetary hours data when service is available
  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const fetchPlanetaryHoursData = async () => {
        try {
          const hourInfo = await astrologyService.getCurrentPlanetaryHour();
          // ✅ Pattern MM-1: Ensure object type for setCurrentHour state setter
          setCurrentHour(typeof hourInfo === 'object' && hourInfo !== null ? hourInfo : { value: hourInfo });
          
          const dayPlanet = await astrologyService.getCurrentPlanetaryDay();
          // ✅ Pattern MM-1: Ensure string type for setCurrentDay
          setCurrentDay(typeof dayPlanet === 'string' ? dayPlanet : String(dayPlanet));
          
          const hours = await astrologyService.getDailyPlanetaryHours(new Date());
          // ✅ Pattern MM-1: Convert Planet[] to Map<number, string> for setDailyHours
          if (Array.isArray(hours)) {
            const hoursMap = new Map<number, string>();
            hours.forEach((planet, index) => {
              hoursMap.set(index, typeof planet === 'string' ? planet : String(planet));
            });
            setDailyHours(hoursMap);
          } else if (hours instanceof Map) {
            setDailyHours(hours);
          } else {
            setDailyHours(new Map());
          }
        } catch (err) {
          // console.error('Error in usePlanetaryHoursBridge:', err);
        }
      };
      
      fetchPlanetaryHoursData();
      
      // Update every minute
      const interval = setInterval(fetchPlanetaryHoursData, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoading, error, astrologyService]);

  return {
    isLoading,
    error,
    currentHour,
    currentDay,
    dailyHours,
    astrologyService,
    servicesReady: !isLoading && !error && !!astrologyService
  };
}

/**
 * A general adapter that creates a custom bridge hook for any service
 * 
 * @param serviceName The name of the service to bridge
 * @param fetchFunction The function to fetch data when the service is ready
 * @returns A hook with status, data, and service reference
 */
export function createServiceBridge<T, S>(
  serviceName: string, 
  fetchFunction: (service: S) => Promise<T>
) {
  return function useCustomBridge() {
    const { isLoading, error, ...services } = useServices();
    const service = services[serviceName as keyof typeof services] as S;
    
    const [data, setData] = useState<T | null>(null);
    const [fetchError, setFetchError] = useState<Error | null>(null);
    
    useEffect(() => {
      if (!isLoading && !error && service) {
        const fetchData = async () => {
          try {
            const result = await fetchFunction(service);
            setData(result);
          } catch (err) {
            // console.error(`Error in custom bridge for ${serviceName}:`, err);
            setFetchError(err instanceof Error ? err : new Error(String(err)));
          }
        };
        
        fetchData();
      }
    }, [isLoading, error, service]);
    
    return {
      isLoading: isLoading || (!data && !fetchError && !error),
      error: error || fetchError,
      data,
      service,
      servicesReady: !isLoading && !error && !!service
    };
  };
}

export default {
  useAlchemicalBridge,
  useChakraBridge,
  usePlanetaryHoursBridge,
  createServiceBridge
}; 