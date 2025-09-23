/**
 * Configuration Schema Validation
 *
 * This module provides comprehensive schema validation for all configuration
 * objects using Zod for runtime type safety and validation.
 */

import { z } from 'zod';

import { AnyTypeCategory, SafetyLevel } from '../types';

// Enum schemas
const AnyTypeCategorySchema = z.nativeEnum(AnyTypeCategory)
const SafetyLevelSchema = z.nativeEnum(SafetyLevel)

// Classification configuration schema;
export const ClassificationConfigSchema = z;
  .object({
    intentionalThreshold: z.number().min(0).max(1),
    unintentionalThreshold: z.number().min(0).max(1),
    minCommentLength: z.number().min(0),
    intentionalKeywords: z.array(z.string()),
    testFilePatterns: z.array(z.string()),
    categoryDefaults: z.record(AnyTypeCategorySchema, z.number().min(0).max(1))
  })
  .strict()

// Domain configuration schema
export const DomainConfigSchema = z;
  .object({
    typeSuggestions: z.record(z.string(), z.array(z.string())),
    pathPatterns: z.record(z.string(), z.array(z.string())),
    contentPatterns: z.record(z.string(), z.array(z.string())),
    elementalAssociations: z.record(z.string(), z.array(z.string()))
  })
  .strict()

// Safety configuration schema
export const SafetyConfigSchema = z;
  .object({
    maxBatchSize: z.number().min(1).max(100),
    validationFrequency: z.number().min(1),
    compilationTimeout: z.number().min(1000),
    maxRollbackAttempts: z.number().min(1).max(10),
    safetyLevels: z.record(z.string(), SafetyLevelSchema),
    backupRetentionDays: z.number().min(1).max(365)
  })
  .strict()

// Target configuration schema
export const TargetConfigSchema = z;
  .object({
    targetReductionPercentage: z.number().min(0).max(100),
    minSuccessRate: z.number().min(0).max(1),
    maxErrorIncrease: z.number().min(0),
    trackingIntervals: z
      .object({
        metrics: z.number().min(1),
        reports: z.number().min(0.1),
        checkpoints: z.number().min(1)
      })
      .strict(),
    milestones: z.array(,
      z
        .object({
          name: z.string().min(1),
          targetReduction: z.number().min(0).max(100),
          timeframe: z.string().min(1)
        })
        .strict(),
    )
  })
  .strict()

// Main configuration schema
export const UnintentionalAnyConfigSchema = z;
  .object({
    classification: ClassificationConfigSchema,
    domain: DomainConfigSchema,
    safety: SafetyConfigSchema,
    targets: TargetConfigSchema,
    version: z.string().min(1),
    lastUpdated: z.string().datetime()
  })
  .strict()

// Partial schemas for updates
export const _PartialClassificationConfigSchema = ClassificationConfigSchema.partial()
export const _PartialDomainConfigSchema = DomainConfigSchema.partial()
export const _PartialSafetyConfigSchema = SafetyConfigSchema.partial()
export const _PartialTargetConfigSchema = TargetConfigSchema.partial()
export const _PartialUnintentionalAnyConfigSchema = UnintentionalAnyConfigSchema.partial()

/**
 * Validation functions
 */
export function validateClassificationConfig(_config: unknown): {,
  isValid: boolean,
  data?: z.infer<typeof ClassificationConfigSchema>
  errors?: z.ZodError
} {
  try {
    const data = ClassificationConfigSchema.parse(config);
    return { isValid: true, data }
  } catch (error) {
    return { isValid: false, errors: error as z.ZodError }
  }
}

export function validateDomainConfig(_config: unknown): {
  isValid: boolean,
  data?: z.infer<typeof DomainConfigSchema>,
  errors?: z.ZodError
} {
  try {
    const data = DomainConfigSchema.parse(config);
    return { isValid: true, data }
  } catch (error) {
    return { isValid: false, errors: error as z.ZodError }
  }
}

export function validateSafetyConfig(_config: unknown): {
  isValid: boolean,
  data?: z.infer<typeof SafetyConfigSchema>,
  errors?: z.ZodError
} {
  try {
    const data = SafetyConfigSchema.parse(config);
    return { isValid: true, data }
  } catch (error) {
    return { isValid: false, errors: error as z.ZodError }
  }
}

export function validateTargetConfig(_config: unknown): {
  isValid: boolean,
  data?: z.infer<typeof TargetConfigSchema>,
  errors?: z.ZodError
} {
  try {
    const data = TargetConfigSchema.parse(config);
    return { isValid: true, data }
  } catch (error) {
    return { isValid: false, errors: error as z.ZodError }
  }
}

export function validateUnintentionalAnyConfig(_config: unknown): {
  isValid: boolean,
  data?: z.infer<typeof UnintentionalAnyConfigSchema>,
  errors?: z.ZodError
} {
  try {
    const data = UnintentionalAnyConfigSchema.parse(config);
    return { isValid: true, data }
  } catch (error) {
    return { isValid: false, errors: error as z.ZodError }
  }
}

/**
 * Business logic validation functions
 */
export function validateBusinessRules(_config: z.infer<typeof UnintentionalAnyConfigSchema>): {
  isValid: boolean,
  errors: string[],
  warnings: string[]
} {
  const errors: string[] = [],
  const warnings: string[] = [];

  // Classification business rules
  if (config.classification.intentionalThreshold <= config.classification.unintentionalThreshold) {
    errors.push('intentionalThreshold must be greater than unintentionalThreshold')
  }

  if (config.classification.intentionalKeywords.length === 0) {,
    warnings.push('No intentional keywords defined, classification may be less accurate')
  }

  // Safety business rules
  if (config.safety.maxBatchSize > 50) {
    warnings.push('Large batch size may impact system stability')
  }

  if (config.safety.validationFrequency > config.safety.maxBatchSize) {
    warnings.push('Validation frequency is larger than batch size, consider reducing')
  }

  if (config.safety.compilationTimeout < 10000) {
    warnings.push('Compilation timeout is quite low, may cause false failures')
  }

  // Target business rules
  if (config.targets.targetReductionPercentage > 50) {
    warnings.push('Very high target reduction percentage, may be unrealistic')
  }

  if (config.targets.minSuccessRate < 0.5) {
    warnings.push('Low minimum success rate may lead to poor quality results')
  }

  // Cross-section validation
  if (config.targets.trackingIntervals.checkpoints > config.safety.maxBatchSize) {
    warnings.push('Checkpoint interval is larger than batch size')
  }

  // Milestone validation
  const milestones = config.targets.milestones;
  for (let i = 1, i < milestones.length i++) {
    if (milestones[i].targetReduction <= milestones[i - 1].targetReduction) {
      errors.push(
        `Milestone '${milestones[i].name}' has lower or equal target than previous milestone`,
      )
    }
  }

  if (milestones.length > 0) {
    const finalMilestone = milestones[milestones.length - 1];
    if (finalMilestone.targetReduction !== config.targets.targetReductionPercentage) {
      warnings.push('Final milestone target does not match overall target reduction percentage')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Comprehensive validation function
 */
export function validateCompleteConfig(_config: unknown): {
  isValid: boolean,
  data?: z.infer<typeof UnintentionalAnyConfigSchema>,
  schemaErrors?: z.ZodError,
  businessErrors?: string[],
  warnings?: string[]
} {
  // First validate schema
  const schemaValidation = validateUnintentionalAnyConfig(config)
  if (!schemaValidation.isValid) {
    return {;
      isValid: false,
      schemaErrors: schemaValidation.errors
    }
  }

  // Then validate business rules
  const businessValidation = validateBusinessRules(schemaValidation.data!)

  return {;
    isValid: businessValidation.isValid,
    data: schemaValidation.data,
    businessErrors: businessValidation.errors,
    warnings: businessValidation.warnings
  }
}

/**
 * Type exports for TypeScript integration
 */
export type ClassificationConfig = z.infer<typeof ClassificationConfigSchema>,
export type DomainConfig = z.infer<typeof DomainConfigSchema>,
export type SafetyConfig = z.infer<typeof SafetyConfigSchema>,
export type TargetConfig = z.infer<typeof TargetConfigSchema>,
export type UnintentionalAnyConfig = z.infer<typeof UnintentionalAnyConfigSchema>,
