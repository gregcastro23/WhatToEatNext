import type { NextApiRequest, NextApiResponse } from 'next';
import { AstrologyService } from '../../services/AstrologyService';
import { createLogger } from '../../utils/logger';
import { validateCoordinates, validateDate } from '../../utils/astrologyValidation';

const logger = createLogger('AstrologyAPI');

// Add request tracking to prevent duplicate intensive calculations
const processingRequests = new Map<string, Promise<any>>();
const CACHE_TIME = 60 * 1000; // 1 minute cache
const cache = new Map<string, { data: unknown, timestamp: number }>();

type ResponseData = {
  success: boolean;
  data?: unknown;
  error?: string;
  validationErrors?: Record<string, string>;
  cached?: boolean;
};

/**
 * Create a cache key from request parameters
 */
function createCacheKey(params: Record<string, unknown>): string {
  return Object.entries(params)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .map(([key, value]) => {
      if (value instanceof Date) {
        return `${key}:${value.toISOString()}`;
      }
      return `${key}:${value}`;
    })
    .join('|');
}

/**
 * API endpoint for astrology-related data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { method } = req;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Add timeout to prevent hanging requests
  const timeout = setTimeout(() => {
    logger.warn('API request timed out');
    if (!res.writableEnded) {
      return res.status(408).json({
        success: false,
        error: 'Request timed out'
      });
    }
  }, 15000); // 15 second timeout

  try {
    // Initialize the astrology service
    const astrologyService = AstrologyService.getInstance();
    
    switch (method) {
      case 'GET': {
        // Handle GET requests
        const { lat, lng, date } = req.query;
        
        // Validate required coordinates
        const validationErrors: Record<string, string> = {};
        
        if (!lat) {
          validationErrors.lat = 'Latitude is required';
        } else if (isNaN(parseFloat(lat as string)) || parseFloat(lat as string) < -90 || parseFloat(lat as string) > 90) {
          validationErrors.lat = 'Latitude must be a number between -90 and 90';
        }
        
        if (!lng) {
          validationErrors.lng = 'Longitude is required';
        } else if (isNaN(parseFloat(lng as string)) || parseFloat(lng as string) < -180 || parseFloat(lng as string) > 180) {
          validationErrors.lng = 'Longitude must be a number between -180 and 180';
        }
        
        // Validate date if provided
        let targetDate: Date;
        if (date) {
          try {
            targetDate = new Date(date as string);
            if (isNaN(targetDate.getTime())) {
              validationErrors.date = 'Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)';
            }
          } catch (error) {
            validationErrors.date = 'Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)';
          }
        } else {
          targetDate = new Date();
        }
        
        // Return validation errors if any
        if (Object.keys(validationErrors).length > 0) {
          clearTimeout(timeout);
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            validationErrors
          });
        }
        
        // Create a cache key for this request
        const params = {
          lat: parseFloat(lat as string),
          lng: parseFloat(lng as string),
          date: targetDate.toISOString()
        };
        const cacheKey = createCacheKey(params);
        
        // Check if this exact request is already cached
        const cachedData = cache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TIME)) {
          clearTimeout(timeout);
          return res.status(200).json({
            success: true,
            data: cachedData.data,
            cached: true
          });
        }
        
        // Check if this request is already being processed
        let processingPromise = processingRequests.get(cacheKey);
        if (!processingPromise) {
          // Create a new promise for this calculation
          processingPromise = (async () => {
            try {
              // Calculate planetary positions
              const positions = await astrologyService.calculatePlanetaryPositions({
                latitude: parseFloat(lat as string),
                longitude: parseFloat(lng as string),
                date: targetDate
              });
              
              // Calculate current sign and other astrological data
              const currentSign = astrologyService.getCurrentSign(positions);
              const planetaryHour = astrologyService.getPlanetaryHour(targetDate);
              const lunarPhaseData = astrologyService.getLunarPhase(targetDate);
              
              // Store result in cache
              const result = {
                positions,
                currentSign,
                planetaryHour,
                lunarPhase: lunarPhaseData.phase,
                moonIllumination: lunarPhaseData.illumination
              };
              
              cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              return result;
            } catch (calculationError) {
              logger.error('Error calculating planetary positions:', calculationError);
              
              // Use fallback mechanism if calculation fails
              try {
                const fallbackPositions = astrologyService.getReliablePlanetaryPositions();
                const fallbackSign = astrologyService.getCurrentSign(fallbackPositions);
                const fallbackLunarPhase = astrologyService.getLunarPhase(new Date());
                
                const fallbackResult = {
                  positions: fallbackPositions,
                  currentSign: fallbackSign,
                  lunarPhase: fallbackLunarPhase.phase,
                  moonIllumination: fallbackLunarPhase.illumination,
                  isFallback: true
                };
                
                return fallbackResult;
              } catch (fallbackError) {
                logger.error('Error with fallback mechanism:', fallbackError);
                throw new Error('Failed to get astrological data, even with fallback');
              }
            } finally {
              // Remove this request from processing map
              processingRequests.delete(cacheKey);
            }
          })();
          
          // Store the promise
          processingRequests.set(cacheKey, processingPromise);
        }
        
        // Wait for the result
        try {
          const result = await processingPromise;
          clearTimeout(timeout);
          return res.status(200).json({
            success: true,
            data: result
          });
        } catch (executionError) {
          clearTimeout(timeout);
          return res.status(500).json({
            success: false,
            error: executionError instanceof Error ? executionError.message : 'Error calculating astrological data'
          });
        }
      }
        
      case 'POST': {
        // Handle POST requests for custom calculations
        const { latitude, longitude, timestamp, calculation } = req.body;
        
        // Validate required fields with more detailed errors
        const validationErrors: Record<string, string> = {};
        
        if (latitude === undefined || latitude === null) {
          validationErrors.latitude = 'Latitude is required';
        } else if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
          validationErrors.latitude = 'Latitude must be a number between -90 and 90';
        }
        
        if (longitude === undefined || longitude === null) {
          validationErrors.longitude = 'Longitude is required';
        } else if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
          validationErrors.longitude = 'Longitude must be a number between -180 and 180';
        }
        
        // Validate calculation parameter
        const validCalculations = ['elementalBalance', 'planetaryPositions', 'aspectCalculation', 'lunarPhase'];
        if (calculation && !validCalculations.includes(calculation)) {
          validationErrors.calculation = `Invalid calculation type. Must be one of: ${validCalculations.join(', ')}`;
        }
        
        // Validate timestamp if provided
        let calcDate: Date;
        if (timestamp) {
          try {
            calcDate = new Date(timestamp);
            if (isNaN(calcDate.getTime())) {
              validationErrors.timestamp = 'Invalid timestamp format';
            }
          } catch (error) {
            validationErrors.timestamp = 'Invalid timestamp format';
          }
        } else {
          calcDate = new Date();
        }
        
        // Return validation errors if any
        if (Object.keys(validationErrors).length > 0) {
          clearTimeout(timeout);
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            validationErrors
          });
        }
        
        // Create a cache key for this calculation
        const params = {
          latitude,
          longitude,
          timestamp: calcDate.toISOString(),
          calculation: calculation || 'planetaryPositions'
        };
        const cacheKey = createCacheKey(params);
        
        // Check cache
        const cachedData = cache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TIME)) {
          clearTimeout(timeout);
          return res.status(200).json({
            success: true,
            data: cachedData.data,
            cached: true
          });
        }
        
        // Check if this calculation is already in progress
        let processingPromise = processingRequests.get(cacheKey);
        if (!processingPromise) {
          processingPromise = (async () => {
            try {
              // Determine which calculation to perform
              let result;
              switch (calculation) {
                case 'elementalBalance': {
                  result = await astrologyService.calculateElementalBalance({
                    latitude,
                    longitude,
                    date: calcDate
                  });
                  break;
                }
                
                case 'aspectCalculation': {
                  result = await astrologyService.calculatePlanetaryAspects({
                    latitude,
                    longitude,
                    date: calcDate
                  });
                  break;
                }
                
                case 'lunarPhase': {
                  result = {
                    lunarPhase: astrologyService.getLunarPhase(calcDate).phase,
                    moonIllumination: astrologyService.getLunarPhase(calcDate).illumination
                  };
                  break;
                }
                  
                case 'planetaryPositions':
                default: {
                  result = await astrologyService.calculatePlanetaryPositions({
                    latitude,
                    longitude,
                    date: calcDate
                  });
                  break;
                }
              }
              
              // Cache the result
              cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              return result;
            } catch (calculationError) {
              logger.error(`Error calculating ${calculation || 'planetary positions'}:`, calculationError);
              
              // For some calculations, we can use fallback data
              if (calculation === 'elementalBalance' || calculation === 'planetaryPositions' || !calculation) {
                try {
                  // Use fallback data
                  const fallbackData = calculation === 'elementalBalance' 
                    ? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
                    : astrologyService.getReliablePlanetaryPositions();
                  
                  return {
                    ...fallbackData,
                    isFallback: true
                  };
                } catch (fallbackError) {
                  logger.error('Fallback also failed:', fallbackError);
                  throw new Error(`Failed to calculate ${calculation || 'planetary positions'}`);
                }
              }
              
              throw new Error(`Failed to calculate ${calculation || 'planetary positions'}`);
            } finally {
              processingRequests.delete(cacheKey);
            }
          })();
          
          processingRequests.set(cacheKey, processingPromise);
        }
        
        try {
          const result = await processingPromise;
          clearTimeout(timeout);
          return res.status(200).json({
            success: true,
            data: result
          });
        } catch (executionError) {
          clearTimeout(timeout);
          return res.status(500).json({
            success: false,
            error: `Error calculating ${calculation || 'planetary positions'}`
          });
        }
      }
        
      default: {
        // Method not allowed
        clearTimeout(timeout);
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${method} Not Allowed` 
        });
      }
    }
  } catch (error) {
    clearTimeout(timeout);
    logger.error('Error in astrology API:', error);
    
    // Determine if this is a server error that needs to be reported
    const isServerError = !(error instanceof Error && error.message.includes('Validation'));
    
    if (isServerError) {
      // Log for monitoring/alerting
      logger.error('CRITICAL: Unexpected server error in astrology API', {
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : String(error)
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      // Add error details if in development environment
      ...(process.env.NODE_ENV === 'development' && {
        errorDetails: error instanceof Error ? {
          name: error.name,
          stack: error.stack
        } : String(error)
      })
    });
  }
} 