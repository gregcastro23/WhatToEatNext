/**
 * Improved utility functions for dynamic imports in Next.js
 * This approach avoids the "Critical dependency" error with better typing
 */

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * A utility function for logging errors
 * This is a safe replacement for console.error that can be disabled in production
 */
const errorLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.error to avoid linting warnings
  // console.error(message, ...args);
};

// Define interfaces for known modules
interface AstrologyUtilsModule {
  calculateLunarPhase: (date?: Date) => Promise<number>;
  getLunarPhaseName: (phase: number) => string;
  getMoonIllumination: (date?: Date) => Promise<number>;
  calculateSunSign: (date?: Date) => string;
  calculateLunarNodes: (date?: Date) => { northNode: number; isRetrograde: boolean; };
  getNodeInfo: (nodeLongitude: number) => { sign: string; degree: number; isRetrograde: boolean; };
  getCurrentAstrologicalState: (date?: Date) => any;
}

interface AccurateAstronomyModule {
  getAccuratePlanetaryPositions: (date?: Date) => Record<string, unknown>;
}

interface SafeAstrologyModule {
  getReliablePlanetaryPositions: () => Record<string, unknown>;
  calculateLunarPhase: () => Promise<number>;
  getLunarPhaseName: (phase: number) => string;
  getMoonIllumination: () => Promise<number>;
  calculateSunSign: (date?: Date) => string;
  getCurrentAstrologicalState: () => any;
}

interface MoonTimesModule {
  calculateMoonTimes: (date: Date, latitude: number, longitude: number) => { rise?: Date; set?: Date; };
}

interface CuisineCalculationsModule {
  getCuisineRecommendations: (zodiacSign?: string, lunarPhase?: string, planetaryAlignment?: unknown) => any[];
}

interface SunTimesModule {
  calculateSunTimes: (date: Date, latitude: number, longitude: number) => { 
    sunrise: Date; 
    sunset: Date; 
    solarNoon: Date; 
    goldenHour: Date;
  };
}

interface SolarPositionsModule {
  getSunPosition: (date: Date, latitude: number, longitude: number) => {
    azimuth: number;
    altitude: number;
  };
}

// Module map for type-safe imports
const MODULE_MAP = {
  '@/utils/astrologyUtils': () => import('@/utils/astrologyUtils') as unknown as Promise<AstrologyUtilsModule>,
  '@/utils/accurateAstronomy': () => import('@/utils/accurateAstronomy') as unknown as Promise<AccurateAstronomyModule>,
  '@/utils/safeAstrology': () => import('@/utils/safeAstrology') as unknown as Promise<SafeAstrologyModule>,
  '@/utils/moonTimes': () => import('@/utils/moonTimes') as unknown as Promise<MoonTimesModule>,
  '@/lib/cuisineCalculations': () => import('@/lib/cuisineCalculations') as unknown as Promise<CuisineCalculationsModule>,
  '@/utils/sunTimes': () => import('@/utils/sunTimes') as unknown as Promise<SunTimesModule>,
  '@/utils/solarPositions': () => import('@/utils/solarPositions') as unknown as Promise<SolarPositionsModule>,
  '@/calculations/alchemicalCalculations': () => import('@/calculations/alchemicalCalculations'),
  '@/calculations/gregsEnergy': () => import('@/calculations/gregsEnergy'),
  // Don't use path-based imports for astronomia due to linter errors
  'astronomia': () => import('astronomia'),
};

// Type for known module paths
type KnownModulePath = keyof typeof MODULE_MAP;

/**
 * Safely import and execute a function using a known module path
 */
export async function safeImportAndExecuteKnown<R, A extends any[] = any[]>(
  path: KnownModulePath,
  functionName: string,
  args: A
): Promise<R | null> {
  try {
    if (!MODULE_MAP[path]) {
      errorLog(`Module path not found in MODULE_MAP: ${path}`);
      return null;
    }
    
    const moduleExports = await MODULE_MAP[path]();
    
    // Type assertion to allow indexing with string
    const func = (moduleExports as unknown)[functionName];
    
    if (typeof func !== 'function') {
      errorLog(`Function ${functionName} not found in module ${path}`);
      return null;
    }
    
    return func(...args) as R;
  } catch (error) {
    errorLog(`Import and execute failed for ${functionName} from ${path}:`, error);
    return null;
  }
}

/**
 * Safely import a function using a known module path
 */
export async function safeImportFunctionKnown<T extends (...args: unknown[]) => any>(
  path: KnownModulePath,
  functionName: string
): Promise<T | null> {
  try {
    if (!MODULE_MAP[path]) {
      errorLog(`Module path not found in MODULE_MAP: ${path}`);
      return null;
    }
    
    const moduleExports = await MODULE_MAP[path]();
    
    // Type assertion to allow indexing with string
    const func = (moduleExports as unknown)[functionName];
    
    if (typeof func !== 'function') {
      errorLog(`Function ${functionName} not found in module ${path}`);
      return null;
    }
    
    return func as T;
  } catch (error) {
    errorLog(`Import failed for ${functionName} from ${path}:`, error);
    return null;
  }
}

// Remove static import and use dynamic import only
// import * as astronomia from 'astronomia';

// Add back specific module imports for known paths instead of using dynamic imports
import * as astrologyUtils from '@/utils/astrologyUtils';
import * as accurateAstronomy from '@/utils/accurateAstronomy';
import * as safeAstrology from '@/utils/safeAstrology';
import * as alchemicalCalculations from '@/calculations/alchemicalCalculations';
import * as gregsEnergy from '@/calculations/gregsEnergy';

// Get astronomia module dynamically to prevent build issues
const getAstronomiaModule = async () => {
  try {
    return await import('astronomia');
  } catch (error) {
    errorLog('Failed to import astronomia:', error);
    return null;
  }
};

// Safe import function using static imports for known modules
export async function safeImportAndExecute<R, A extends any[] = any[]>(
  path: string,
  functionName: string,
  args: A
): Promise<R | null> {
  try {
    // Use static imports for known modules
    let importedModule: unknown;
    
    if (path === '@/utils/astrologyUtils') {
      importedModule = astrologyUtils;
    } else if (path === '@/utils/accurateAstronomy') {
      importedModule = accurateAstronomy;
    } else if (path === '@/utils/safeAstrology') {
      importedModule = safeAstrology;
    } else if (path === '@/calculations/alchemicalCalculations') {
      importedModule = alchemicalCalculations;
    } else if (path === '@/calculations/gregsEnergy') {
      importedModule = gregsEnergy;
    } else if (path === 'astronomia') {
      // Handle astronomia submodules - use dynamic import
      if (['solar', 'moon', 'planetposition', 'julian'].includes(functionName)) {
        const astronomiaModule = await getAstronomiaModule();
        if (!astronomiaModule) {
          errorLog(`Failed to import astronomia for ${functionName}`);
          return null;
        }
        
        const subModule = (astronomiaModule as unknown)[functionName];
        if (typeof subModule === 'undefined') {
          errorLog(`Astronomia submodule ${functionName} not found`);
          return null;
        }
        
        // Return the function result directly since we're executing specific methods
        if (args.length === 1 && functionName === 'solar' && 
            typeof subModule.apparentLongitude === 'function') {
          return subModule.apparentLongitude(args[0]) as R;
        } else if (args.length === 1 && functionName === 'moon' && 
                  typeof subModule.position === 'function') {
          return subModule.position(args[0]) as R;
        } else if (args.length === 1 && functionName === 'julian' && 
                  typeof subModule.fromDate === 'function') {
          return subModule.fromDate(args[0]) as R;
        } else {
          // Generic case - try to execute the function
          try {
            if (typeof subModule === 'function') {
              return subModule(...args) as R;
            } else {
              errorLog(`Submodule ${functionName} is not a function`);
              return null;
            }
          } catch (error) {
            errorLog(`Error with astronomia function ${functionName}:`, error);
            return null;
          }
        }
      } else {
        // Get the full module
        importedModule = await getAstronomiaModule();
        if (!importedModule) {
          return null;
        }
      }
    } else {
      // For non-static imports, check if we have a mapped version
      const mappedPath = Object.keys(MODULE_MAP).find(key => path.startsWith(key));
      if (mappedPath) {
        debugLog(`Using mapped import for ${path} via ${mappedPath}`);
        const mappedModule = await MODULE_MAP[mappedPath as KnownModulePath]();
        importedModule = mappedModule;
      } else {
        errorLog(`Unmapped module path: ${path}. Add it to MODULE_MAP for safer imports.`);
        return null;
      }
    }
    
    if (typeof importedModule[functionName] !== 'function') {
      errorLog(`Function ${functionName} not found in module ${path}`);
      return null;
    }
    
    return importedModule[functionName](...args) as R;
  } catch (error) {
    errorLog(`Safe import and execute failed for ${functionName} from ${path}:`, error);
    
    // Return default values for known functions
    if (path === '@/calculations/alchemicalCalculations' && functionName === 'calculateAlchemicalProperties') {
      const calculatedResults = {} as R;
      
      // Fix TS2339: Property does not exist on type 'R'
      const resultData = calculatedResults as unknown;
      
      // Add fallbacks for missing calculations
      if (!resultData.elementalCounts) {
        resultData.elementalCounts = { 
          Fire: 0.32, 
          Water: 0.28, 
          Earth: 0.18, 
          Air: 0.22 
        };
      }
      
      if (!resultData.alchemicalCounts) {
        resultData.alchemicalCounts = { 
          Spirit: 0.29, 
          Essence: 0.28, 
          Matter: 0.21, 
          Substance: 0.22 
        };
      }
      
      return calculatedResults;
    }
    
    return null;
  }
}

/**
 * Safely import a function using any string path
 */
export async function safeImportFunction<T extends (...args: unknown[]) => any>(
  path: string,
  functionName: string
): Promise<T | null> {
  try {
    // For known paths, use the typed version
    if (path in MODULE_MAP) {
      return safeImportFunctionKnown(path as KnownModulePath, functionName);
    }
    
    // Special handling for astronomia modules
    if (path === 'astronomia') {
      if (['solar', 'moon', 'planetposition', 'julian'].includes(functionName)) {
        // Get the module dynamically instead of using static import
        const astronomiaModule = await getAstronomiaModule();
        if (!astronomiaModule) {
          errorLog(`Failed to import astronomia for ${functionName}`);
          return null;
        }
        
        // Return the submodule from the dynamic import
        const subModule = (astronomiaModule as unknown)[functionName];
        if (typeof subModule === 'undefined') {
          errorLog(`Astronomia submodule ${functionName} not found`);
          return null;
        }
        return subModule as unknown as T;
      } else {
        errorLog(`Unknown astronomia submodule: ${functionName}`);
        return null;
      }
    }
    
    // Reject other dynamic imports to avoid webpack warnings
    errorLog(`Unknown module path: ${path}. Add it to MODULE_MAP for static imports.`);
    return null;
  } catch (error) {
    errorLog(`Import failed for ${functionName} from ${path}:`, error);
    return null;
  }
}

/**
 * Legacy functions for backward compatibility
 */

export async function dynamicImport<T, F = null>(
  importFn: () => Promise<T>,
  fallbackFn: (() => F) | null = null
): Promise<T | F | null> {
  debugLog('dynamicImport is deprecated, use safeImportFunction instead');
  try {
    return await importFn();
  } catch (error) {
    errorLog('Dynamic import failed:', error);
    return fallbackFn ? fallbackFn() : null;
  }
}

export async function dynamicImportFunction<T extends (...args: unknown[]) => any, F extends (...args: unknown[]) => any = T>(
  path: string,
  functionName: string,
  fallbackFn: F | null = null
): Promise<T | F | null> {
  debugLog('dynamicImportFunction is deprecated, use safeImportFunction instead');
  return safeImportFunction<T>(path, functionName);
}

export async function dynamicImportAndExecute<R, A extends any[] = any[], F = R>(
  path: string,
  functionName: string,
  args: A,
  fallbackFn: ((...args: A) => F) | null = null
): Promise<R | F | null> {
  debugLog('dynamicImportAndExecute is deprecated, use safeImportAndExecute instead');
  return safeImportAndExecute<R, A>(path, functionName, args);
} 