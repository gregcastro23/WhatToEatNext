/**
 * API Response Type Definitions
 * 
 * This file contains standardized type definitions for external API responses.
 */

import { ZodiacSign } from './alchemy';

/**
 * Base response for NASA JPL Horizons API
 */
export interface NasaHorizonsResponse {
  /**
   * Result string containing the data in text format
   */
  result?: string;
  
  /**
   * Error message if the request failed
   */
  error?: string;
  
  /**
   * Signature indicating the type of error
   */
  signature?: {
    source?: string;
    version?: string;
  };
}

/**
 * Base response for Astronomy API
 */
export interface AstronomyApiResponse {
  /**
   * Response data containing planetary positions
   */
  data?: {
    /**
     * Table of planetary data
     */
    table?: {
      /**
       * Rows of planetary information
       */
      rows?: Array<{
        /**
         * Entry containing planet details
         */
        entry?: {
          /**
           * Unique identifier
           */
          id?: string;
          
          /**
           * Planet name
           */
          name?: string;
          
          /**
           * Equatorial coordinates (right ascension and declination)
           */
          equatorialCoordinates?: {
            rightAscension?: {
              hours?: number;
              minutes?: number;
              seconds?: number;
            };
            declination?: {
              degrees?: number;
              minutes?: number;
              seconds?: number;
            };
          };
          
          /**
           * Ecliptic coordinates (longitude and latitude)
           */
          eclipticCoordinates?: {
            longitude?: {
              degrees?: number;
              minutes?: number;
              seconds?: number;
            };
            latitude?: {
              degrees?: number;
              minutes?: number;
              seconds?: number;
            };
          };
        };
      }>;
    };
  };
  
  /**
   * Error information
   */
  error?: {
    code?: number;
    message?: string;
  };
}

/**
 * Base response for public Swiss Ephemeris API
 */
export interface SwissEphemerisApiResponse {
  /**
   * Array of planet information
   */
  planets?: Array<{
    /**
     * Planet name
     */
    name?: string;
    
    /**
     * Position information
     */
    position?: {
      /**
       * Longitude in degrees (0-360)
       */
      longitude?: number;
      
      /**
       * Whether the planet is retrograde
       */
      retrograde?: boolean;
      
      /**
       * Speed of the planet
       */
      speed?: number;
    };
  }>;
  
  /**
   * Error information
   */
  error?: string | {
    message?: string;
    code?: number;
  };
}

/**
 * Standardized planetary position from any API source
 */
export interface StandardizedPlanetaryPosition {
  /**
   * Zodiac sign (e.g., 'aries', 'taurus')
   */
  sign: ZodiacSign;
  
  /**
   * Degree within the sign (0-29)
   */
  degree: number;
  
  /**
   * Exact longitude in degrees (0-360)
   */
  exactLongitude?: number;
  
  /**
   * Whether the planet is retrograde
   */
  isRetrograde?: boolean;
  
  /**
   * Minutes within the degree (0-59)
   */
  minute?: number;
  
  /**
   * Speed of the planet (positive for direct, negative for retrograde)
   */
  speed?: number;
}

/**
 * Type guard to validate NASA Horizons API response
 */
export function isValidNasaHorizonsResponse(data: unknown): data is NasaHorizonsResponse {
  return (
    typeof data === 'object' && 
    data !== null && 
    (
      'result' in data && typeof (data as NasaHorizonsResponse).result === 'string' ||
      'error' in data && typeof (data as NasaHorizonsResponse).error === 'string'
    )
  );
}

/**
 * Type guard to validate Astronomy API response
 */
export function isValidAstronomyApiResponse(data: unknown): data is AstronomyApiResponse {
  return (
    typeof data === 'object' && 
    data !== null && 
    'data' in data && 
    typeof (data as AstronomyApiResponse).data === 'object'
  );
}

/**
 * Type guard to validate Swiss Ephemeris API response
 */
export function isValidSwissEphemerisApiResponse(data: unknown): data is SwissEphemerisApiResponse {
  return (
    typeof data === 'object' && 
    data !== null && 
    'planets' in data && 
    Array.isArray((data as SwissEphemerisApiResponse).planets)
  );
} 