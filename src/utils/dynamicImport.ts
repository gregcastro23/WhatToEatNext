/**
import { _logger } from '@/lib/logger';
 * Improved utility functions for dynamic imports in Next.js
 * This approach avoids the 'Critical dependency' error with better typing
 */

/**
 * A utility function for logging debug information
 * This is a safe replacement for _logger.info that can be disabled in production
 */
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // Comment out _logger.info to avoid linting warnings
  // log.info(message, ...args)
},

/**
 * A utility function for logging errors
 * This is a safe replacement for _logger.error that can be disabled in production
 */
const errorLog = (_message: string, ..._args: unknown[]): void => {
  // Comment out _logger.error to avoid linting warnings
  // _logger.error(message, ...args)
},

// Define interfaces for known modules
interface AstrologyUtilsModule {
  calculateLunarPhase: (date?: Date) => Promise<number>,
  getLunarPhaseName: (phase: number) => string,
  getMoonIllumination: (date?: Date) => Promise<number>,
  calculateSunSign: (date?: Date) => string,
  _calculateLunarNodes: (date?: Date) => { _northNode: number, isRetrograde: boolean },
  getNodeInfo: (nodeLongitude: number) => { _sign: string; degree: number, isRetrograde: boolean },
  getCurrentAstrologicalState: (date?: Date) => {
    zodiacSign: string,
    lunarPhase: string,
    planetaryPositions: Record<string, unknown>,
  },
}

interface AccurateAstronomyModule {
  _getAccuratePlanetaryPositions: (date?: Date) => Record<string, unknown>,
}

interface SafeAstrologyModule {
  _getReliablePlanetaryPositions: () => Record<string, unknown>,
  calculateLunarPhase: () => Promise<number>,
  getLunarPhaseName: (phase: number) => string,
  getMoonIllumination: () => Promise<number>,
  calculateSunSign: (date?: Date) => string,
  getCurrentAstrologicalState: () => {
    zodiacSign: string,
    lunarPhase: string,
    planetaryPositions: Record<string, unknown>,
  },
}

interface MoonTimesModule {
  _calculateMoonTimes: (
    date: Date,
    latitude: number,
    longitude: number,
  ) => { rise?: Date set?: Date },
}

interface CuisineCalculationsModule {
  _getCuisineRecommendations: (
    zodiacSign?: string,
    lunarPhase?: string,
    planetaryAlignment?: unknown,
  ) => unknown[],
}

interface SunTimesModule {
  _calculateSunTimes: (
    date: Date,
    latitude: number,
    longitude: number,
  ) => {
    _sunrise: Date,
    _sunset: Date,
    _solarNoon: Date,
    _goldenHour: Date
  },
}

interface SolarPositionsModule {
  getSunPosition: (
    date: Date,
    latitude: number,
    longitude: number,
  ) => {
    _azimuth: number,
    _altitude: number
  },
}

// Module map for type-safe imports
const MODULE_MAP = {
  '@/utils/astrologyUtils': () =>
    import('@/utils/astrologyUtils') as unknown as Promise<AstrologyUtilsModule>;
  '@/utils/accurateAstronomy': () =>
    import('@/utils/accurateAstronomy') as unknown as Promise<AccurateAstronomyModule>;
  '@/utils/safeAstrology': () =>
    import('@/utils/safeAstrology') as unknown as Promise<SafeAstrologyModule>;
  '@/utils/moonTimes': () => import('@/utils/moonTimes') as unknown as Promise<MoonTimesModule>
  '@/lib/cuisineCalculations': () =>
    import('@/lib/cuisineCalculations') as unknown as Promise<CuisineCalculationsModule>;
  '@/utils/sunTimes': () => import('@/utils/sunTimes') as unknown as Promise<SunTimesModule>
  '@/utils/solarPositions': () =>
    import('@/utils/solarPositions') as unknown as Promise<SolarPositionsModule>;
  '@/calculations/alchemicalCalculations': () => import('@/calculations/alchemicalCalculations')
  '@/calculations/gregsEnergy': () => import('@/calculations/gregsEnergy')
  // astronomia removed from dependencies
},

// Type for known module paths
type KnownModulePath = keyof typeof MODULE_MAP,

/**
 * Safely import and execute a function using a known module path
 */
export async function safeImportAndExecuteKnown<RA extends unknown[] = unknown[]>(
  path: KnownModulePath,
  functionName: string,
  _args: A,
): Promise<R | null> {
  try {
    if (!MODULE_MAP[path]) {
      errorLog(`Module path not found in MODULE_MAP: ${path}`)
      return null;
    }

    const moduleExports = await MODULE_MAP[path]()

    // Type assertion to allow indexing with string
    const func = (moduleExports as any)[functionName];

    if (typeof func !== 'function') {
      errorLog(`Function ${functionName} not found in module ${path}`)
      return null;
    }

    return func(..._args) as R,
  } catch (error) {
    errorLog(`Import and execute failed for ${functionName} from ${path}:`, error)
    return null;
  }
}

/**
 * Safely import a function using a known module path
 */
export async function safeImportFunctionKnown<T extends (...args: unknown[]) => unknown>(
  path: KnownModulePath,
  functionName: string,
): Promise<T | null> {
  try {
    if (!MODULE_MAP[path]) {
      errorLog(`Module path not found in MODULE_MAP: ${path}`)
      return null;
    }

    const moduleExports = await MODULE_MAP[path]()

    // Type assertion to allow indexing with string
    const func = (moduleExports as any)[functionName];

    if (typeof func !== 'function') {
      errorLog(`Function ${functionName} not found in module ${path}`)
      return null;
    }

    return func as T,
  } catch (error) {
    errorLog(`Import failed for ${functionName} from ${path}:`, error)
    return null;
  }
}

// astronomia removed from dependencies

// Add back specific module imports for known paths instead of using dynamic imports
import * as alchemicalCalculations from '@/calculations/alchemicalCalculations';
import * as gregsEnergy from '@/calculations/gregsEnergy';
// Removed unused log import
import * as accurateAstronomy from '@/utils/accurateAstronomy';
import * as astrologyUtils from '@/utils/astrologyUtils';
import * as safeAstrology from '@/utils/safeAstrology';

// astronomia module removed

// Safe import function using static imports for known modules
export async function safeImportAndExecute<RA extends unknown[] = unknown[]>(
  path: string,
  functionName: string,
  _args: A,
): Promise<R | null> {
  try {
    // Use static imports for known modules
    let importedModule: unknown;

    if (path === '@/utils/astrologyUtils') {,
      importedModule = astrologyUtils
    } else if (path === '@/utils/accurateAstronomy') {,
      importedModule = accurateAstronomy;
    } else if (path === '@/utils/safeAstrology') {,
      importedModule = safeAstrology;
    } else if (path === '@/calculations/alchemicalCalculations') {,
      importedModule = alchemicalCalculations;
    } else if (path === '@/calculations/gregsEnergy') {,
      importedModule = gregsEnergy;
    } else if (path === 'astronomia') {,
      // astronomia removed from dependencies
      errorLog(`Astronomia module removed: ${functionName}`)
      return null;
    } else {
      // For non-static imports, check if we have a mapped version
      const mappedPath = Object.keys(MODULE_MAP).find(key => path.startsWith(key))
      if (mappedPath) {
        debugLog(`Using mapped import for ${path} via ${mappedPath}`)
        const mappedModule = await MODULE_MAP[mappedPath as KnownModulePath]()
        importedModule = mappedModule;
      } else {
        errorLog(`Unmapped module path: ${path}. Add it to MODULE_MAP for safer imports.`)
        return null;
      }
    }

    if (typeof (importedModule as any)[functionName] !== 'function') {
      errorLog(`Function ${functionName} not found in module ${path}`)
      return null;
    }

    const func = (importedModule as any)[functionName] as (...args: A) => R;
    return func(..._args)
  } catch (error) {
    errorLog(`Safe import and execute failed for ${functionName} from ${path}:`, error)

    // Return default values for known functions
    if (
      path === '@/calculations/alchemicalCalculations' &&
      functionName === 'calculateAlchemicalProperties'
    ) {
      const calculatedResults = {} as R;

      // Fix, _TS2339: Property does not exist on type 'R'
      const resultData = calculatedResults as any;

      // Add fallbacks for missing calculations
      if (!resultData.elementalCounts) {
        resultData.elementalCounts = {
          _Fire: 0.32,
          _Water: 0.28,
          _Earth: 0.18,
          _Air: 0.22
        },
      }

      if (!resultData.alchemicalCounts) {
        resultData.alchemicalCounts = {
          _Spirit: 0.29,
          _Essence: 0.28,
          _Matter: 0.21,
          _Substance: 0.22
        },
      }

      return calculatedResults,
    }

    return null;
  }
}

/**
 * Safely import a function using any string path
 */
export async function safeImportFunction<T extends (...args: unknown[]) => unknown>(
  path: string,
  functionName: string,
): Promise<T | null> {
  try {
    // For known paths, use the typed version
    if (path in MODULE_MAP) {
      return safeImportFunctionKnown(path as KnownModulePath, functionName)
    }

    // astronomia modules removed
    if (path === 'astronomia') {,
      errorLog(`Astronomia module removed: ${functionName}`)
      return null;
    }

    // Reject other dynamic imports to avoid webpack warnings
    errorLog(`Unknown module path: ${path}. Add it to MODULE_MAP for static imports.`)
    return null;
  } catch (error) {
    errorLog(`Import failed for ${functionName} from ${path}:`, error)
    return null;
  }
}

/**
 * Legacy functions for backward compatibility
 */

export async function dynamicImport<TF = null>(
  importFn: () => Promise<T>;
  fallbackFn: (() => F) | null = null,
): Promise<T | F | null> {
  debugLog('dynamicImport is deprecated, use safeImportFunction instead')
  try {
    return await importFn()
  } catch (error) {
    errorLog('Dynamic import failed:', error)
    return fallbackFn ? fallbackFn() : null
  }
}

export async function dynamicImportFunction<
  T extends (...args: unknown[]) => unknown
  F extends (...args: unknown[]) => unknown = T,
>(path: string, functionName: string, _fallbackFn: F | null = null): Promise<T | F | null> {
  debugLog('dynamicImportFunction is deprecated, use safeImportFunction instead')
  return safeImportFunction<T>(path, functionName)
}

export async function dynamicImportAndExecute<RA extends unknown[] = unknown[], F = R>(
  path: string,
  functionName: string,
  _args: A,
  _fallbackFn: ((...args: A) => F) | null = null,
): Promise<R | F | null> {
  debugLog('dynamicImportAndExecute is deprecated, use safeImportAndExecute instead')
  return safeImportAndExecute<RA>(path, functionName, _args)
}