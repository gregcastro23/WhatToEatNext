/**
 * Comprehensive Astrological Validation System
 * 
 * Provides a unified interface for validating all astrological calculations,
 * planetary positions, elemental properties, and transit dates.
 */

import { ElementalProperties } from '@/types/alchemy';
import { logger } from '@/utils/logger';
import { 
  validateElementalProperties, 
  normalizeElementalProperties,
  ELEMENTAL_CONSTANTS 
} from './elementalValidation';
import { 
  validateTransitDate, 
  validatePlanetaryPosition,
  TRANSIT_CONSTANTS 
} from './transitValidation';

/**
 * Planetary position structure
 */
export interface PlanetaryPosition {
  sign: string;
  degree: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctedData?: unknown;
}

/**
 * Comprehensive validation options
 */
export interface ValidationOptions {
  strictMode?: boolean;
  autoCorrect?: boolean;
  logWarnings?: boolean;
  validateTransits?: boolean;
}

/**
 * Validate a complete planetary positions object
 */
export function validatePlanetaryPositions(
  positions: Record<string, unknown>,
  options: ValidationOptions = {}
): ValidationResult {
  const { strictMode = false, autoCorrect = false, logWarnings = true } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  const correctedData: Record<string, PlanetaryPosition> = {};

  try {
    if (!positions || typeof positions !== 'object') {
      errors.push('Planetary positions must be an object');
      return { isValid: false, errors, warnings };
    }

    const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    const optionalPlanets = ['uranus', 'neptune', 'pluto', 'northNode', 'southNode'];
    const allPlanets = [...requiredPlanets, ...optionalPlanets];

    // Check for required planets
    for (const planet of requiredPlanets) {
      if (!(planet in positions)) {
        errors.push(`Missing required planet: ${planet}`);
        continue;
      }

      const position = positions[planet];
      const validation = validateSinglePlanetaryPosition(planet, position, strictMode);
      
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
      
      // Always collect warnings, regardless of validity
      warnings.push(...validation.warnings);
      
      if (validation.correctedData && autoCorrect) {
        correctedData[planet] = validation.correctedData as PlanetaryPosition;
      }
    }

    // Check optional planets
    for (const planet of optionalPlanets) {
      if (planet in positions) {
        const position = positions[planet];
        const validation = validateSinglePlanetaryPosition(planet, position, strictMode);
        
        if (!validation.isValid) {
          if (strictMode) {
            errors.push(...validation.errors);
          } else {
            warnings.push(...validation.errors);
          }
        }
        
        // Always collect warnings, regardless of validity
        warnings.push(...validation.warnings);
        
        if (validation.correctedData && autoCorrect) {
          correctedData[planet] = validation.correctedData as PlanetaryPosition;
        }
      }
    }

    // Check for unknown planets
    const unknownPlanets = Object.keys(positions).filter(planet => !allPlanets.includes(planet));
    if (unknownPlanets.length > 0) {
      const message = `Unknown planets found: ${unknownPlanets.join(', ')}`;
      if (strictMode) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    // Log warnings if requested
    if (logWarnings && warnings.length > 0) {
      logger.warn('Planetary position validation warnings:', warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData: Object.keys(correctedData).length > 0 ? correctedData : undefined
    };
  } catch (error) {
    const errorMessage = `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Validate a single planetary position
 */
function validateSinglePlanetaryPosition(
  planet: string,
  position: unknown,
  strictMode: boolean = false
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let correctedData: PlanetaryPosition | undefined;

  try {
    if (!position || typeof position !== 'object') {
      errors.push(`${planet} position must be an object`);
      return { isValid: false, errors, warnings };
    }

    const pos = position as Record<string, unknown>;
    const requiredProps = ['sign', 'degree', 'exactLongitude', 'isRetrograde'];
    
    // Check required properties
    for (const prop of requiredProps) {
      if (!(prop in pos)) {
        errors.push(`${planet} missing required property: ${prop}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Validate sign
    const sign = pos.sign;
    if (typeof sign !== 'string' || !TRANSIT_CONSTANTS.VALID_SIGNS.includes(sign.toLowerCase())) {
      errors.push(`${planet} has invalid sign: ${sign}`);
    }

    // Validate degree
    const degree = pos.degree;
    if (typeof degree !== 'number' || degree < 0 || degree >= TRANSIT_CONSTANTS.DEGREES_PER_SIGN) {
      const message = `${planet} degree ${degree} must be between 0 and ${TRANSIT_CONSTANTS.DEGREES_PER_SIGN}`;
      if (strictMode) {
        errors.push(message);
      } else {
        warnings.push(message);
        // Auto-correct if possible
        if (typeof degree === 'number') {
          correctedData = {
            sign: String(sign),
            degree: Math.max(0, Math.min(TRANSIT_CONSTANTS.DEGREES_PER_SIGN - 0.01, degree)),
            exactLongitude: Number(pos.exactLongitude),
            isRetrograde: Boolean(pos.isRetrograde)
          };
        }
      }
    }

    // Validate longitude
    const longitude = pos.exactLongitude;
    if (typeof longitude !== 'number' || longitude < 0 || longitude >= TRANSIT_CONSTANTS.MAX_LONGITUDE) {
      const message = `${planet} longitude ${longitude} must be between 0 and ${TRANSIT_CONSTANTS.MAX_LONGITUDE}`;
      if (strictMode) {
        errors.push(message);
      } else {
        warnings.push(message);
        // Auto-correct if possible
        if (typeof longitude === 'number') {
          const correctedLongitude = ((longitude % TRANSIT_CONSTANTS.MAX_LONGITUDE) + TRANSIT_CONSTANTS.MAX_LONGITUDE) % TRANSIT_CONSTANTS.MAX_LONGITUDE;
          if (!correctedData) {
            correctedData = {
              sign: String(sign),
              degree: Number(degree),
              exactLongitude: correctedLongitude,
              isRetrograde: Boolean(pos.isRetrograde)
            };
          } else {
            correctedData.exactLongitude = correctedLongitude;
          }
        }
      }
    }

    // Validate retrograde status
    const isRetrograde = pos.isRetrograde;
    if (typeof isRetrograde !== 'boolean') {
      warnings.push(`${planet} isRetrograde should be boolean, got ${typeof isRetrograde}`);
      if (!correctedData) {
        correctedData = {
          sign: String(sign),
          degree: Number(degree),
          exactLongitude: Number(longitude),
          isRetrograde: Boolean(isRetrograde)
        };
      } else {
        correctedData.isRetrograde = Boolean(isRetrograde);
      }
    }

    // Validate retrograde logic
    if (TRANSIT_CONSTANTS.ALWAYS_DIRECT.includes(planet.toLowerCase()) && isRetrograde) {
      warnings.push(`${planet} cannot be retrograde`);
      if (correctedData) {
        correctedData.isRetrograde = false;
      }
    }

    if (TRANSIT_CONSTANTS.ALWAYS_RETROGRADE.includes(planet.toLowerCase()) && !isRetrograde) {
      warnings.push(`${planet} should always be retrograde`);
      if (correctedData) {
        correctedData.isRetrograde = true;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData
    };
  } catch (error) {
    errors.push(`Error validating ${planet}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Validate elemental properties with astrological context
 */
export function validateAstrologicalElementalProperties(
  properties: unknown,
  context?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let correctedData: ElementalProperties | undefined;

  try {
    if (!validateElementalProperties(properties)) {
      errors.push(`Invalid elemental properties${context ? ` in ${context}` : ''}`);
      
      // Try to normalize the properties
      if (properties && typeof properties === 'object') {
        correctedData = normalizeElementalProperties(properties as Partial<ElementalProperties>);
        warnings.push('Elemental properties were normalized to valid values');
      }
      
      return { isValid: false, errors, warnings, correctedData };
    }

    const props = properties as ElementalProperties;
    
    // Check for elemental balance
    const total = Object.values(props).reduce((sum, val) => sum + val, 0);
    if (total > 1.2) {
      warnings.push(`Elemental properties total ${total.toFixed(2)} exceeds recommended maximum of 1.2`);
    }

    // Check for self-reinforcement patterns
    const dominant = Object.entries(props).reduce((max, current) => 
      current[1] > max[1] ? current : max
    );

    if (dominant[1] < ELEMENTAL_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD) {
      warnings.push(`No dominant element found (highest: ${dominant[0]} at ${dominant[1].toFixed(2)}). Consider strengthening elemental focus.`);
    }

    return {
      isValid: true,
      errors,
      warnings
    };
  } catch (error) {
    errors.push(`Elemental validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Validate mathematical constants used in calculations
 */
export function validateMathematicalConstants(constants: Record<string, number>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const expectedConstants = {
      DEGREES_PER_SIGN: 30,
      SIGNS_PER_CIRCLE: 12,
      MAX_LONGITUDE: 360,
      MIN_ELEMENT_VALUE: 0.05,
      MAX_ELEMENT_VALUE: 1.0,
      SELF_REINFORCEMENT_THRESHOLD: 0.3,
      HARMONY_THRESHOLD: 0.7
    };

    Object.entries(expectedConstants).forEach(([name, expectedValue]) => {
      if (name in constants) {
        const actualValue = constants[name];
        if (Math.abs(actualValue - expectedValue) > 0.001) {
          warnings.push(`Constant ${name} has unexpected value: ${actualValue} (expected: ${expectedValue})`);
        }
      }
    });

    // Check for NaN or infinite values
    Object.entries(constants).forEach(([name, value]) => {
      if (!Number.isFinite(value)) {
        errors.push(`Constant ${name} has invalid value: ${value}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    errors.push(`Constants validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Comprehensive astrological calculation validation
 */
export async function validateAstrologicalCalculation(
  input: {
    planetaryPositions?: Record<string, unknown>;
    elementalProperties?: unknown;
    constants?: Record<string, number>;
    date?: Date;
  },
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const { validateTransits = false } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  const correctedData: Record<string, unknown> = {};

  try {
    // Validate planetary positions
    if (input.planetaryPositions) {
      const positionValidation = validatePlanetaryPositions(input.planetaryPositions, options);
      errors.push(...positionValidation.errors);
      warnings.push(...positionValidation.warnings);
      
      if (positionValidation.correctedData) {
        correctedData.planetaryPositions = positionValidation.correctedData;
      }

      // Validate against transit dates if requested
      if (validateTransits && positionValidation.isValid && input.date) {
        for (const [planet, position] of Object.entries(input.planetaryPositions)) {
          try {
            const isValid = await validatePlanetaryPosition(planet, position as any, input.date);
            if (!isValid) {
              warnings.push(`Transit validation failed for ${planet}`);
            }
          } catch (error) {
            warnings.push(`Could not validate transit for ${planet}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    }

    // Validate elemental properties
    if (input.elementalProperties) {
      const elementalValidation = validateAstrologicalElementalProperties(
        input.elementalProperties,
        'calculation input'
      );
      errors.push(...elementalValidation.errors);
      warnings.push(...elementalValidation.warnings);
      
      if (elementalValidation.correctedData) {
        correctedData.elementalProperties = elementalValidation.correctedData;
      }
    }

    // Validate constants
    if (input.constants) {
      const constantsValidation = validateMathematicalConstants(input.constants);
      errors.push(...constantsValidation.errors);
      warnings.push(...constantsValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData: Object.keys(correctedData).length > 0 ? correctedData : undefined
    };
  } catch (error) {
    errors.push(`Comprehensive validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Quick validation for development use
 */
export function quickValidate(data: unknown, type: 'planetary' | 'elemental' | 'constants'): boolean {
  try {
    switch (type) {
      case 'planetary':
        return validatePlanetaryPositions(data as Record<string, unknown>).isValid;
      case 'elemental':
        return validateElementalProperties(data);
      case 'constants':
        return validateMathematicalConstants(data as Record<string, number>).isValid;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Export all validation constants
 */
export const VALIDATION_CONSTANTS = {
  ...ELEMENTAL_CONSTANTS,
  ...TRANSIT_CONSTANTS,
  VALIDATION_TIMEOUT: 5000,
  MAX_VALIDATION_ERRORS: 50,
  AUTO_CORRECT_THRESHOLD: 0.1
} as const;