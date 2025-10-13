/**
 * Ingredient Data Validation Utilities
 *
 * This module provides comprehensive validation for ingredient data integrity,
 * elemental properties consistency, and alchemical mapping accuracy.
 */

import type { Ingredient } from '@/types';
import type { ElementalProperties } from '@/types/elemental';

import { allIngredients } from '../data/ingredients';

import { calculateElementalAffinity } from './elementalUtils';
import { logger } from './logger';

// Validation result interfaces
export interface IngredientValidationResult {
  isValid: boolean,
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[],
  summary: string,
  timestamp: Date,
  kineticsValidation?: {
    powerConservationEfficiency: number,
    circuitStability: number,
    forceMagnitude: number,
    thermalDirection: 'heating' | 'cooling' | 'neutral'
  }
}

export interface IngredientValidationError {
  type: | 'ELEMENTAL_INVALID'
    | 'COMPATIBILITY_VIOLATION'
    | 'ALCHEMICAL_MISMATCH'
    | 'DATA_INCOMPLETE'
    | 'CATEGORY_MISMATCH'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ingredient?: string,
  property?: string
  expectedValue?: unknown,
  actualValue?: unknown,
  message: string,
  timestamp: Date
}

export interface IngredientValidationWarning {
  type: 'MINOR_INCONSISTENCY' | 'DATA_OUTDATED' | 'PERFORMANCE_SLOW' | 'MISSING_OPTIONAL'
  ingredient?: string,
  property?: string,
  message: string,
  timestamp: Date
}

export interface IngredientTestResult {
  testName: string,
  passed: boolean,
  duration: number,
  error?: string,
  details?: Record<string, unknown>
}

// Validation tolerances
const VALIDATION_TOLERANCES = {
  ELEMENTAL_SUM_TOLERANCE: 0.01,
  SELF_COMPATIBILITY_THRESHOLD: 0.9,
  CROSS_COMPATIBILITY_THRESHOLD: 0.7,
  _ALCHEMICAL_CONSISTENCY_THRESHOLD: 0.8
}

/**
 * Main validation function for ingredient data
 */
export async function validateIngredientData(): Promise<IngredientValidationResult> {
  const startTime = Date.now()
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    logger.info('Starting comprehensive ingredient data validation')

    // 1. Validate elemental properties
    const elementalValidation = await validateElementalProperties()
    errors.push(...elementalValidation.errors)
    warnings.push(...elementalValidation.warnings)

    // 2. Check compatibility scores
    const compatibilityValidation = await validateCompatibilityScores()
    errors.push(...compatibilityValidation.errors)
    warnings.push(...compatibilityValidation.warnings)

    // 3. Verify alchemical mappings
    const alchemicalValidation = await validateAlchemicalMappings()
    errors.push(...alchemicalValidation.errors)
    warnings.push(...alchemicalValidation.warnings)

    // 4. Run ingredient tests
    const testResults = await runIngredientTests()
    const testValidation = analyzeIngredientTestResults(testResults)
    errors.push(...testValidation.errors)
    warnings.push(...testValidation.warnings)

    // 5. Validate data completeness
    const completenessValidation = await validateDataCompleteness()
    errors.push(...completenessValidation.errors)
    warnings.push(...completenessValidation.warnings)

    // 6. Validate kinetics integration
    const kineticsValidation = await validateKineticsIntegration()
    errors.push(...kineticsValidation.errors)
    warnings.push(...kineticsValidation.warnings)

    const duration = Date.now() - startTime;
    const isValid =
      errors.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length === 0
;
    const summary = generateIngredientValidationSummary(isValid, errors, warnings, duration);

    logger.info(
      `Ingredient validation completed in ${duration}ms: ${isValid ? 'PASSED' : 'FAILED'}`
    );

    // Calculate kinetics validation metrics
    const kineticsMetrics = await calculateKineticsValidationMetrics();

    return {
      isValid,
      errors,
      warnings,
      summary,
      timestamp: new Date(),
      kineticsValidation: kineticsMetrics
    }
  } catch (error) {
    const criticalError: IngredientValidationError = {
      type: 'DATA_INCOMPLETE',
      severity: 'CRITICAL',
      message: `Ingredient validation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    }

    return {
      isValid: false,
      errors: [criticalError],
      warnings,
      summary: 'Critical validation failure - process could not complete',
      timestamp: new Date()
    }
  }
}

/**
 * Validate elemental properties for all ingredients
 */
async function validateElementalProperties(): Promise<{
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[]
}> {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    const ingredients = allIngredients
;
    for (const [name, ingredient] of Object.entries(ingredients)) {
      try {
        const validation = validateIngredientElementalProperties(name, ingredient)
        errors.push(...validation.errors)
        warnings.push(...validation.warnings)
      } catch (error) {
        errors.push({
          type: 'ELEMENTAL_INVALID',
          severity: 'MEDIUM',
          ingredient: name,
          message: `Failed to validate elemental properties for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        })
      }
    }
  } catch (error) {
    errors.push({
      type: 'DATA_INCOMPLETE',
      severity: 'HIGH',
      message: `Elemental properties validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    })
  }

  return { errors, warnings }
}

/**
 * Validate individual ingredient elemental properties
 */
function validateIngredientElementalProperties(
  name: string,
  ingredient: Ingredient,
): { errors: IngredientValidationError[], warnings: IngredientValidationWarning[] } {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = []

  try {
    if (!ingredient.elementalProperties) {
      errors.push({
        type: 'ELEMENTAL_INVALID',
        severity: 'HIGH',
        ingredient: name,
        property: 'elementalProperties',
        message: `Missing elemental properties for ${name}`,
        timestamp: new Date()
      })
      return { errors, warnings }
    }

    const props = ingredient.elementalProperties;
    const elements = ['Fire', 'Water', 'Earth', 'Air']

    // Check that all elements are present and numeric
    for (const element of elements) {
      const value = props[element as any];
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({
          type: 'ELEMENTAL_INVALID',
          severity: 'HIGH',
          ingredient: name,
          property: element,
          actualValue: value,
          message: `Invalid ${element} value for ${name}: ${value} (should be a number)`,
          timestamp: new Date()
        })
      } else if (value < 0 || value > 1) {
        errors.push({
          type: 'ELEMENTAL_INVALID',
          severity: 'MEDIUM',
          ingredient: name,
          property: element,
          actualValue: value,
          message: `${element} value for ${name} out of range: ${value} (should be 0-1)`,
          timestamp: new Date()
        })
      }
    }

    // Check that elemental properties sum to approximately 1.0
    const sum = elements.reduce((total, element) => {
      const value = props[element as any];
      return total + (typeof value === 'number' ? value : 0)
    }, 0)

    if (Math.abs(sum - 1.0) > VALIDATION_TOLERANCES.ELEMENTAL_SUM_TOLERANCE) {
      errors.push({
        type: 'ELEMENTAL_INVALID',
        severity: 'MEDIUM',
        ingredient: name,
        property: 'elementalProperties',
        expectedValue: 1.0,
        actualValue: sum,
        message: `Elemental properties sum for ${name} is ${sum.toFixed(3)}, should be 1.0 (±${VALIDATION_TOLERANCES.ELEMENTAL_SUM_TOLERANCE})`,
        timestamp: new Date()
      })
    }

    // Check for elemental dominance (at least one element should be > 0.3)
    const maxElement = Math.max(...elements.map(el => {
        const value = props[el as unknown];
        return typeof value === 'number' ? value : 0;
      })
    )

    if (maxElement < 0.3) {
      warnings.push({
        type: 'MINOR_INCONSISTENCY',
        ingredient: name,
        property: 'elementalProperties',
        message: `No dominant element for ${name} (max: ${maxElement.toFixed(3)})`,
        timestamp: new Date()
      })
    }
  } catch (error) {
    errors.push({
      type: 'ELEMENTAL_INVALID',
      severity: 'MEDIUM',
      ingredient: name,
      message: `Error validating elemental properties for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    })
  }

  return { errors, warnings }
}

/**
 * Calculate compatibility between two ElementalProperties objects
 */
function calculateElementalPropertiesCompatibility(
  props1: ElementalProperties,
  props2: ElementalProperties,
): number {
  const elements: Array<'Fire' | 'Water' | 'Earth' | 'Air'> = ['Fire', 'Water', 'Earth', 'Air'],
  const totalCompatibility = 0;
  const totalWeight = 0;

  for (const element of elements) {
    const affinity = calculateElementalAffinity(element, element);
    const weight = (props1[element] || 0) * (props2[element] || 0);
    totalCompatibility += affinity * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalCompatibility / totalWeight : 0.5
}

/**
 * Validate compatibility scores follow self-reinforcement principles
 */
async function validateCompatibilityScores(): Promise<{
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[]
}> {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    const ingredients = allIngredients;
    const ingredientList = Object.values(ingredients)

    // Test self-compatibility for each ingredient
    for (const ingredient of ingredientList) {
      try {
        if (!ingredient.elementalProperties) continue;

        const selfCompatibility = calculateElementalPropertiesCompatibility(ingredient.elementalProperties;
          ingredient.elementalProperties
        );

        // Self-reinforcement: same ingredient should have high compatibility (≥0.9)
        if (selfCompatibility < VALIDATION_TOLERANCES.SELF_COMPATIBILITY_THRESHOLD) {
          errors.push({
            type: 'COMPATIBILITY_VIOLATION',
            severity: 'HIGH',
            ingredient: ingredient.name,
            property: 'self-compatibility',
            expectedValue: `≥${VALIDATION_TOLERANCES.SELF_COMPATIBILITY_THRESHOLD}`,
            actualValue: selfCompatibility,
            message: `Self-compatibility score ${selfCompatibility.toFixed(3)} below ${VALIDATION_TOLERANCES.SELF_COMPATIBILITY_THRESHOLD} threshold for ${ingredient.name}`,
            timestamp: new Date()
          })
        }
      } catch (error) {
        warnings.push({
          type: 'PERFORMANCE_SLOW',
          ingredient: ingredient.name,
          message: `Could not calculate self-compatibility for ${ingredient.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        })
      }
    }

    // Test cross-compatibility for a sample of ingredient pairs
    const sampleSize = Math.min(50, ingredientList.length); // Limit to avoid performance issues
    const sampleIngredients = ingredientList.slice(0, sampleSize)

    for (let i = 0; i < sampleIngredients.length; i++) {
      for (let j = i + 1, j < Math.min(i + 5, sampleIngredients.length); j++) {
        const ingredient1 = sampleIngredients[i];
        const ingredient2 = sampleIngredients[j];

        if (!ingredient1.elementalProperties || !ingredient2.elementalProperties) continue;

        try {
          const crossCompatibility = calculateElementalPropertiesCompatibility(
            ingredient1.elementalProperties,
            ingredient2.elementalProperties
          );

          // Cross-compatibility should be at least 0.7 (no opposing elements)
          if (crossCompatibility < VALIDATION_TOLERANCES.CROSS_COMPATIBILITY_THRESHOLD) {
            errors.push({
              type: 'COMPATIBILITY_VIOLATION',
              severity: 'MEDIUM',
              ingredient: `${ingredient1.name} + ${ingredient2.name}`,
              property: 'cross-compatibility',
              expectedValue: `≥${VALIDATION_TOLERANCES.CROSS_COMPATIBILITY_THRESHOLD}`,
              actualValue: crossCompatibility,
              message: `Cross-compatibility score ${crossCompatibility.toFixed(3)} below ${VALIDATION_TOLERANCES.CROSS_COMPATIBILITY_THRESHOLD} threshold for ${ingredient1.name} + ${ingredient2.name}`,
              timestamp: new Date()
            })
          }
        } catch (error) {
          warnings.push({
            type: 'PERFORMANCE_SLOW',
            ingredient: `${ingredient1.name} + ${ingredient2.name}`,
            message: `Could not calculate cross-compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date()
          })
        }
      }
    }
  } catch (error) {
    errors.push({
      type: 'COMPATIBILITY_VIOLATION',
      severity: 'HIGH',
      message: `Compatibility score validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    })
  }

  return { errors, warnings }
}

/**
 * Validate alchemical mappings are consistent with elemental properties
 */
async function validateAlchemicalMappings(): Promise<{
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[]
}> {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    const ingredients = allIngredients
;
    for (const [name, ingredient] of Object.entries(ingredients)) {
      try {
        if ((ingredient as unknown as any).alchemicalProperties) {
          const validation = validateAlchemicalConsistency(name, ingredient)
          errors.push(...validation.errors)
          warnings.push(...validation.warnings)
        } else {
          warnings.push({
            type: 'MISSING_OPTIONAL',
            ingredient: name,
            property: 'alchemicalProperties',
            message: `Missing alchemical properties for ${name}`,
            timestamp: new Date()
          })
        }
      } catch (error) {
        warnings.push({
          type: 'MINOR_INCONSISTENCY',
          ingredient: name,
          message: `Could not validate alchemical properties for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        })
      }
    }
  } catch (error) {
    errors.push({
      type: 'ALCHEMICAL_MISMATCH',
      severity: 'MEDIUM',
      message: `Alchemical mapping validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    })
  }

  return { errors, warnings }
}

/**
 * Validate alchemical consistency for a single ingredient
 */
function validateAlchemicalConsistency(
  name: string,
  ingredient: Ingredient,
): { errors: IngredientValidationError[], warnings: IngredientValidationWarning[] } {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    const ingredientData = ingredient as unknown as any;
    if (!ingredientData.alchemicalProperties || !ingredient.elementalProperties) {
      return { errors, warnings };
    }

    const alchemical = ingredientData.alchemicalProperties ;
    const elemental = ingredient.elementalProperties;

    // Check that alchemical properties are numeric and in valid range
    const alchemicalProps = ['spirit', 'essence', 'matter', 'substance'],
    for (const prop of alchemicalProps) {
      const value = alchemical[prop] as number;
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({
          type: 'ALCHEMICAL_MISMATCH',
          severity: 'MEDIUM',
          ingredient: name,
          property: prop,
          actualValue: value,
          message: `Invalid ${prop} value for ${name}: ${value} (should be a number)`,
          timestamp: new Date()
        })
      } else if (value < 0 || value > 1) {
        warnings.push({
          type: 'MINOR_INCONSISTENCY',
          ingredient: name,
          property: prop,
          message: `${prop} value for ${name} out of typical range: ${value} (typically 0-1)`,
          timestamp: new Date()
        })
      }
    }

    // Check consistency between alchemical and elemental properties
    // Spirit should correlate with Air and Fire
    const airFire = (elemental.Air || 0) + (elemental.Fire || 0)
    const spirit = (alchemical.spirit) || 0;
    if (Math.abs(spirit - airFire * 0.5) > 0.3) {
      warnings.push({
        type: 'MINOR_INCONSISTENCY',
        ingredient: name,
        property: 'spirit-elemental correlation',
        message: `Spirit (${spirit.toFixed(3)}) doesn't correlate well with Air+Fire (${airFire.toFixed(3)}) for ${name}`,
        timestamp: new Date()
      })
    }

    // Matter should correlate with Earth and Water
    const earthWater = (elemental.Earth || 0) + (elemental.Water || 0)
    const matter = (alchemical.matter) || 0;
    if (Math.abs(matter - earthWater * 0.5) > 0.3) {
      warnings.push({
        type: 'MINOR_INCONSISTENCY',
        ingredient: name,
        property: 'matter-elemental correlation',
        message: `Matter (${matter.toFixed(3)}) doesn't correlate well with Earth+Water (${earthWater.toFixed(3)}) for ${name}`,
        timestamp: new Date()
      })
    }
  } catch (error) {
    errors.push({
      type: 'ALCHEMICAL_MISMATCH',
      severity: 'LOW',
      ingredient: name,
      message: `Error validating alchemical consistency for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    })
  }

  return { errors, warnings }
}

/**
 * Validate data completeness for ingredients
 */
async function validateDataCompleteness(): Promise<{
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[]
}> {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    const ingredients = allIngredients;
    const requiredFields = ['name', 'category', 'elementalProperties'],
    const recommendedFields = ['qualities', 'storage'],

    for (const [name, ingredient] of Object.entries(ingredients)) {
      // Check required fields
      for (const field of requiredFields) {
        if (!ingredient[field as keyof Ingredient]) {
          errors.push({
            type: 'DATA_INCOMPLETE',
            severity: 'HIGH',
            ingredient: name,
            property: field,
            message: `Missing required field '${field}' for ${name}`,
            timestamp: new Date()
          })
        }
      }

      // Check recommended fields
      for (const field of recommendedFields) {
        if (!ingredient[field as keyof Ingredient]) {
          warnings.push({
            type: 'MISSING_OPTIONAL',
            ingredient: name,
            property: field,
            message: `Missing recommended field '${field}' for ${name}`,
            timestamp: new Date()
          })
        }
      }

      // Check category validity
      const validCategories = [
        'culinary_herb',
        'spice',
        'vegetable',
        'fruit',
        'protein',
        'grain',
        'dairy',
        'oil',
        'vinegar',
        'seasoning'
      ],

      if (ingredient.category && !validCategories.includes(ingredient.category)) {
        errors.push({
          type: 'CATEGORY_MISMATCH',
          severity: 'MEDIUM',
          ingredient: name,
          property: 'category',
          actualValue: ingredient.category,
          expectedValue: validCategories,
          message: `Invalid category '${ingredient.category}' for ${name}`,
          timestamp: new Date()
        })
      }
    }
  } catch (error) {
    errors.push({
      type: 'DATA_INCOMPLETE',
      severity: 'MEDIUM',
      message: `Data completeness validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    })
  }

  return { errors, warnings }
}

/**
 * Run comprehensive ingredient tests
 */
async function runIngredientTests(): Promise<IngredientTestResult[]> {
  const testResults: IngredientTestResult[] = [];

  // Test, 1: Ingredient data loading
  testResults.push(await testIngredientDataLoading())

  // Test, 2: Elemental properties validation
  testResults.push(await testElementalPropertiesValidation())

  // Test, 3: Compatibility calculations
  testResults.push(await testCompatibilityCalculations())

  // Test, 4: Alchemical mappings
  testResults.push(await testAlchemicalMappings())

  // Test, 5: Category consistency
  testResults.push(await testCategoryConsistency())
  return testResults
}

/**
 * Test ingredient data loading
 */
async function testIngredientDataLoading(): Promise<IngredientTestResult> {
  const startTime = Date.now()

  try {
    const ingredients = allIngredients;
    const ingredientCount = Object.keys(ingredients).length;

    const passed = ingredientCount > 0;
    const duration = Date.now() - startTime

    return {
      testName: 'Ingredient Data Loading',
      passed,
      duration,
      details: {
        ingredientCount,
        _loadTime: duration
      }
    }
  } catch (error) {
    return {
      testName: 'Ingredient Data Loading',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
}
  }
}

/**
 * Test elemental properties validation
 */
async function testElementalPropertiesValidation(): Promise<IngredientTestResult> {
  const startTime = Date.now()

  try {
    const ingredients = allIngredients;
    let validCount = 0;
    const totalCount = 0;

    for (const ingredient of Object.values(ingredients)) {
      totalCount++
      if (ingredient.elementalProperties) {
        const elements = ['Fire', 'Water', 'Earth', 'Air']
        const hasValidElements = elements.every(el => {
          const value = ingredient.elementalProperties[el as unknown];
          return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 1;
        })

        if (hasValidElements) {
          validCount++
        }
      }
    }

    const passed = validCount === totalCount;
    const duration = Date.now() - startTime;

    return {
      testName: 'Elemental Properties Validation',
      passed,
      duration,
      details: {
        validCount,
        totalCount,
        successRate: totalCount > 0 ? (validCount / totalCount) * 100 : 0
}
    }
  } catch (error) {
    return {
      testName: 'Elemental Properties Validation',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
}
  }
}

/**
 * Test compatibility calculations
 */
async function testCompatibilityCalculations(): Promise<IngredientTestResult> {
  const startTime = Date.now()

  try {
    const ingredients = Object.values(allIngredients).slice(0, 10); // Test with first 10 ingredients
    let validCalculations = 0;
    const totalCalculations = 0;

    for (const ingredient of ingredients) {
      if (!ingredient.elementalProperties) continue;

      try {
        totalCalculations++;
        const selfCompatibility = calculateElementalPropertiesCompatibility(ingredient.elementalProperties;
          ingredient.elementalProperties
        );

        // Self-compatibility should be high (≥0.9)
        if (selfCompatibility >= 0.9) {
          validCalculations++
        }
      } catch (error) {
        // Calculation failed
      }
    }

    const passed = validCalculations === totalCalculations && totalCalculations > 0;
    const duration = Date.now() - startTime;

    return {
      testName: 'Compatibility Calculations',
      passed,
      duration,
      details: {
        validCalculations,
        totalCalculations,
        successRate: totalCalculations > 0 ? (validCalculations / totalCalculations) * 100 : 0
}
    }
  } catch (error) {
    return {
      testName: 'Compatibility Calculations',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
}
  }
}

/**
 * Test alchemical mappings
 */
async function testAlchemicalMappings(): Promise<IngredientTestResult> {
  const startTime = Date.now()

  try {
    const ingredients = allIngredients;
    let validMappings = 0;
    let totalMappings = 0;

    for (const ingredient of Object.values(ingredients)) {
      const ingredientData = ingredient as unknown as any;
      if (ingredientData.alchemicalProperties) {
        totalMappings++;

        const alchemical = ingredientData.alchemicalProperties;
        const hasValidProps = ['spirit', 'essence', 'matter', 'substance'].every(prop => {
          const value = alchemical[prop] as number;
          return typeof value === 'number' && !isNaN(value);
        });

        if (hasValidProps) {
          validMappings++
        }
      }
    }

    const passed = totalMappings === 0 || validMappings === totalMappings;
    const duration = Date.now() - startTime;

    return {
      testName: 'Alchemical Mappings',
      passed,
      duration,
      details: {
        validMappings,
        totalMappings,
        successRate: totalMappings > 0 ? (validMappings / totalMappings) * 100 : 100
}
    }
  } catch (error) {
    return {
      testName: 'Alchemical Mappings',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
}
  }
}

/**
 * Test category consistency
 */
async function testCategoryConsistency(): Promise<IngredientTestResult> {
  const startTime = Date.now()

  try {
    const ingredients = allIngredients
    const validCategories = [
      'culinary_herb',
      'spice',
      'vegetable',
      'fruit',
      'protein',
      'grain',
      'dairy',
      'oil',
      'vinegar',
      'seasoning'
    ];

    let validCategories_count = 0;
    const totalIngredients = 0;

    for (const ingredient of Object.values(ingredients)) {
      totalIngredients++;
      if (ingredient.category && validCategories.includes(ingredient.category)) {
        validCategories_count++;
      }
    }

    const passed = validCategories_count === totalIngredients;
    const duration = Date.now() - startTime;

    return {
      testName: 'Category Consistency',
      passed,
      duration,
      details: {
        validCategories: validCategories_count,
        totalIngredients,
        successRate: totalIngredients > 0 ? (validCategories_count / totalIngredients) * 100 : 0
}
    }
  } catch (error) {
    return {
      testName: 'Category Consistency',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
}
  }
}

/**
 * Analyze ingredient test results and generate validation errors
 */
function analyzeIngredientTestResults(_testResults: IngredientTestResult[]): {
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[]
} {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

  if (passRate < 80) {
    // 80% pass rate threshold
    errors.push({
      type: 'DATA_INCOMPLETE',
      severity: 'HIGH',
      message: `Test pass rate ${passRate.toFixed(1)}% below 80% threshold`,
      timestamp: new Date()
    });
  }

  // Check individual test failures
  for (const test of testResults) {
    if (!test.passed) {
      const severity =
        test.testName.includes('Loading') || test.testName.includes('Properties')
          ? 'HIGH'
          : 'MEDIUM',

      errors.push({
        type: 'DATA_INCOMPLETE',
        severity: severity,
        message: `Test failed: ${test.testName}${test.error ? ` - ${test.error}` : ''}`,
        timestamp: new Date()
      })
    }

    // Check for slow tests
    if (test.duration > 5000) {
      // More than 5 seconds
      warnings.push({
        type: 'PERFORMANCE_SLOW',
        message: `Test ${test.testName} took ${test.duration}ms (>5s)`,
        timestamp: new Date()
      })
    }
  }

  return { errors, warnings }
}

/**
 * Generate validation summary
 */
function generateIngredientValidationSummary(
  isValid: boolean,
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[],
  duration: number,
): string {
  const criticalErrors = errors.filter(e => e.severity === 'CRITICAL').length;
  const highErrors = errors.filter(e => e.severity === 'HIGH').length;
  const mediumErrors = errors.filter(e => e.severity === 'MEDIUM').length;
  const lowErrors = errors.filter(e => e.severity === 'LOW').length;
  let summary = `Ingredient Data Validation ${isValid ? 'PASSED' : 'FAILED'} (${duration}ms)\n`;
  summary += `Errors: ${errors.length} (Critical: ${criticalErrors}, High: ${highErrors}, Medium: ${mediumErrors}, Low: ${lowErrors})\n`,
  summary += `Warnings: ${warnings.length}\n`;

  if (!isValid) {
    summary += '\nCritical Issues: \n';
    errors
      .filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH')
      .forEach(error => {
        summary += `- ${error.message}\n`;
      });
  }

  if (warnings.length > 0) {
    summary += '\nWarnings: \n';
    warnings.slice(0, 5).forEach(warning => {
      summary += `- ${warning.message}\n`;
    });

    if (warnings.length > 5) {
      summary += `... and ${warnings.length - 5} more warnings\n`;
    }
  }

  return summary;
}

/**
 * Check if validation should trigger rollback
 */
export function shouldRollbackIngredients(validationResult: IngredientValidationResult): boolean {
  const criticalErrors = validationResult.errors.filter(e => e.severity === 'CRITICAL').length;
  const highErrors = validationResult.errors.filter(e => e.severity === 'HIGH').length;

  // Rollback if there are any critical errors or more than 3 high-severity errors
  return criticalErrors > 0 || highErrors > 3;
}

/**
 * Validate kinetics integration and power conservation
 */
async function validateKineticsIntegration(): Promise<{
  errors: IngredientValidationError[],
  warnings: IngredientValidationWarning[]
}> {
  const errors: IngredientValidationError[] = [];
  const warnings: IngredientValidationWarning[] = [];

  try {
    const ingredients = allIngredients;

    for (const [name, ingredient] of Object.entries(ingredients)) {
      try {
        if (!ingredient.elementalProperties) continue;

        // Validate force magnitude based on element dominance
        const forceMagnitude = calculateForceMagnitude(ingredient.elementalProperties);
        if (forceMagnitude > 5.0) {
          errors.push({
            type: 'COMPATIBILITY_VIOLATION',
            severity: 'MEDIUM',
            ingredient: name,
            property: 'kinetics-force-magnitude',
            actualValue: forceMagnitude,
            message: `Force magnitude ${forceMagnitude.toFixed(3)} exceeds safe threshold (5.0) for ${name}`,
            timestamp: new Date()
          });
        } else if (forceMagnitude < 0.1) {
          warnings.push({
            type: 'MINOR_INCONSISTENCY',
            ingredient: name,
            property: 'kinetics-force-magnitude',
            message: `Very low force magnitude ${forceMagnitude.toFixed(3)} may indicate weak kinetics for ${name}`,
            timestamp: new Date()
          });
        }

        // Validate thermal direction consistency
        const thermalDirection = determineThermalDirection(ingredient.elementalProperties);
        if (thermalDirection === 'heating' && ingredient.elementalProperties.Water > 0.6) {
          warnings.push({
            type: 'MINOR_INCONSISTENCY',
            ingredient: name,
            property: 'kinetics-thermal-direction',
            message: `Heating direction conflicts with high water content (${(ingredient.elementalProperties.Water * 100).toFixed(1)}%) for ${name}`,
            timestamp: new Date()
          });
        }

      } catch (error) {
        warnings.push({
          type: 'PERFORMANCE_SLOW',
          ingredient: name,
          message: `Could not validate kinetics for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        });
      }
    }
  } catch (error) {
    errors.push({
      type: 'DATA_INCOMPLETE',
      severity: 'MEDIUM',
      message: `Kinetics integration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    });
  }

  return { errors, warnings };
}

/**
 * Calculate force magnitude from elemental properties
 */
function calculateForceMagnitude(elementalProperties: ElementalProperties): number {
  // Force magnitude based on elemental intensity and opposition
  const fireWater = elementalProperties.Fire * elementalProperties.Water;
  const earthAir = elementalProperties.Earth * elementalProperties.Air;

  // High opposing elements create greater force
  const opposingForce = Math.sqrt(fireWater + earthAir) * 2;

  // Element dominance adds to force
  const maxElement = Math.max(
    elementalProperties.Fire,
    elementalProperties.Water,
    elementalProperties.Earth,
    elementalProperties.Air
  );

  return opposingForce + maxElement;
}

/**
 * Determine thermal direction from elemental properties
 */
function determineThermalDirection(elementalProperties: ElementalProperties): 'heating' | 'cooling' | 'neutral' {
  const fireIntensity = elementalProperties.Fire;
  const waterIntensity = elementalProperties.Water;

  if (fireIntensity > waterIntensity + 0.3) {
    return 'heating';
  } else if (waterIntensity > fireIntensity + 0.3) {
    return 'cooling';
  } else {
    return 'neutral';
  }
}

/**
 * Calculate overall kinetics validation metrics
 */
async function calculateKineticsValidationMetrics(): Promise<{
  powerConservationEfficiency: number,
  circuitStability: number,
  forceMagnitude: number,
  thermalDirection: 'heating' | 'cooling' | 'neutral'
}> {
  try {
    const ingredients = Object.values(allIngredients);
    let totalPowerEfficiency = 0;
    let totalStability = 0;
    let totalForceMagnitude = 0;
    let heatingCount = 0;
    let coolingCount = 0;
    let neutralCount = 0;

    for (const ingredient of ingredients) {
      if (!ingredient.elementalProperties) continue;

      // Calculate power conservation (simulate P=IV)
      const charge = (ingredient.elementalProperties.Earth + ingredient.elementalProperties.Water) / 2; // Matter + Substance
      const potential = (ingredient.elementalProperties.Fire + ingredient.elementalProperties.Air) / 2; // Spirit + Essence via elements
      const powerEfficiency = charge > 0 ? Math.min(potential / charge, 1.0) : 0.5;

      // Calculate stability (entropy resistance)
      const stability = 1 - Math.abs(ingredient.elementalProperties.Fire - ingredient.elementalProperties.Water);

      // Calculate force magnitude
      const forceMag = calculateForceMagnitude(ingredient.elementalProperties);

      // Track thermal direction
      const thermalDir = determineThermalDirection(ingredient.elementalProperties);
      if (thermalDir === 'heating') heatingCount++;
      else if (thermalDir === 'cooling') coolingCount++;
      else neutralCount++;

      totalPowerEfficiency += powerEfficiency;
      totalStability += stability;
      totalForceMagnitude += forceMag;
    }

    const count = ingredients.length;
    const avgPowerEfficiency = count > 0 ? totalPowerEfficiency / count : 0.5;
    const avgStability = count > 0 ? totalStability / count : 0.5;
    const avgForceMagnitude = count > 0 ? totalForceMagnitude / count : 0;

    // Determine dominant thermal direction
    let dominantThermal: 'heating' | 'cooling' | 'neutral'
    if (heatingCount > coolingCount && heatingCount > neutralCount) {
      dominantThermal = 'heating';
    } else if (coolingCount > heatingCount && coolingCount > neutralCount) {
      dominantThermal = 'cooling';
    } else {
      dominantThermal = 'neutral';
    }

    return {
      powerConservationEfficiency: avgPowerEfficiency,
      circuitStability: avgStability,
      forceMagnitude: avgForceMagnitude,
      thermalDirection: dominantThermal
    };

  } catch (error) {
    // Return default values on error
    return {
      powerConservationEfficiency: 0.5,
      circuitStability: 0.5,
      forceMagnitude: 0,
      thermalDirection: 'neutral'
};
  }
}

/**
 * Export validation functions for testing
 */
export {
    calculateKineticsValidationMetrics, runIngredientTests, validateAlchemicalMappings, validateCompatibilityScores, validateDataCompleteness, validateElementalProperties, validateKineticsIntegration
};
