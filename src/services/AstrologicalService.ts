import { AstrologicalState } from '@/types/celestial';

// Add these constants if they don't exist elsewhere in the file
const PROKERALA_API_URL = 'https://api.prokerala.com';
const PROKERALA_CLIENT_ID = process.env.NEXT_PUBLIC_PROKERALA_CLIENT_ID || '';
const PROKERALA_CLIENT_SECRET = process.env.NEXT_PUBLIC_PROKERALA_CLIENT_SECRET || '';
const NASA_HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const NASA_DEFAULT_PARAMS = {
  format: 'json',
  OBJ_DATA: 'YES',
};

// Add these constants at the top of the file
const ASTRONOMY_API_URL = 'https://api.astronomyapi.com/api/v2';
const ASTRONOMY_API_APP_ID = process.env.NEXT_PUBLIC_ASTRONOMY_API_APP_ID || '';
const ASTRONOMY_API_APP_SECRET = process.env.NEXT_PUBLIC_ASTRONOMY_API_APP_SECRET || '';

// Remove the astronomia import
// import { solar, planetposition, julian, moonphase, moon } from 'astronomia';
import * as path from 'path';
import * as fs from 'fs';
import { PlanetaryHourCalculator } from '../lib/PlanetaryHourCalculator';

// Add import for dynamic import utility at top of file
import { dynamicImportAndExecute, dynamicImportFunction } from '../utils/dynamicImport';
import { createLogger } from '../utils/logger';
// Import centralized types
import {
  CelestialPosition,
  PlanetaryAlignment,
  ZodiacSign,
  Planet,
  LunarPhase,
  AstrologicalState as CentralizedAstrologicalState
} from '@/types/celestial';

// Create a component-specific logger
const logger = createLogger('AstrologicalService');

// Set up path for ephemeris data
const EPHE_PATH = typeof window === 'undefined' 
  ? path.join(process.cwd(), 'public', 'ephe') 
  : '/ephe';

const isEphemerisFileAvailable = (fileName: string): boolean => {
  if (typeof window !== 'undefined') {
    // In browser, we can't synchronously check files, assume true if running client side
    return true;
  }
  
  try {
    const filePath = path.join(EPHE_PATH, fileName);
    return fs.existsSync(filePath);
  } catch (e) {
    logger.warn(`Error checking ephemeris file ${fileName}:`, e);
    return false;
  }
};

// Export simplified aliases for backward compatibility
export type PlanetName = Planet;
// Export ZodiacSign from centralized types

// Interface for legacy code support - use the centralized CelestialPosition type internally
export interface PlanetPosition {
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde: boolean;
}

// MoonPhase type for API compatibility - using string literals
export type MoonPhase = 'new' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 
                       'full' | 'waning gibbous' | 'last quarter' | 'waning crescent';

// AstrologicalState for service interface - we'll map this to the centralized one internally
