/*
  Domain-aware preservation and classification for variables flagged as unused.
  This module provides predicate functions to determine whether a variable should
  be preserved (not eliminated) due to domain significance, and utilities to
  classify files for risk/safety protocols.
*/

export type PreservationReason =
  | 'astrological-variable'
  | 'elemental-property'
  | 'campaign-system'
  | 'test-context'
  | 'culinary-domain'
  | 'recipe-domain'
  | 'high-impact-file'
  | 'service-layer'
  | 'core-calculation'
  | 'none';

export interface PreservationDecision {
  preserve: boolean;
  reason: PreservationReason;
  confidence: number; // 0..1
}

const ELEMENT_NAMES = new Set(['Fire', 'Water', 'Earth', 'Air']);

const ASTRO_VARIABLE_NAME_REGEX =
  /^(?:planet|planets|planetary|degree|longitude|latitude|sign|zodiac|position|coordinates?|house|asc|mc|dignit|retro|ephemer|utc|julian)/i;

const CAMPAIGN_VARIABLE_NAME_REGEX =
  /^(?:metrics?|progress|safety|campaign|validation|intelligence|monitor|tracking|telemetry|baseline|phase|gate|milestone|roi)/i;

const TEST_CONTEXT_FILE_REGEX = /\/(?:__tests__|tests?|__mocks__|mocks|__fixtures__|fixtures)\//i;

const CULINARY_VARIABLE_NAME_REGEX =
  /^(?:cuisine|ingredient|recipe|flavor|taste|umami|spice|seasoning|cooking|method|profile|oil|vinegar|protein|vegetable|fruit)/i;

export function isHighImpactFile(filePath: string): boolean {
  // Core calculations and services are considered high impact
  return (
    /\/src\/calculations\//.test(filePath) ||
    /\/src\/services\//.test(filePath) ||
    /\/src\/utils\/(?:astrology|alchem|element|planet)/i.test(filePath)
  );
}

export function isCoreCalculationFile(filePath: string): boolean {
  return /\/src\/calculations\//.test(filePath);
}

export function isServiceLayerFile(filePath: string): boolean {
  return /\/src\/services\//.test(filePath);
}

export function isTestFile(filePath: string): boolean {
  return TEST_CONTEXT_FILE_REGEX.test(filePath) || /\.(spec|test)\.[tj]sx?$/.test(filePath);
}

export function classifyFileKind(filePath: string):
  | 'component'
  | 'service'
  | 'calculation'
  | 'utils'
  | 'types'
  | 'test'
  | 'other' {
  if (isTestFile(filePath)) return 'test';
  if (/\/src\/components\//.test(filePath)) return 'component';
  if (isServiceLayerFile(filePath)) return 'service';
  if (isCoreCalculationFile(filePath)) return 'calculation';
  if (/\/src\/utils\//.test(filePath)) return 'utils';
  if (/\/src\/types\//.test(filePath)) return 'types';
  return 'other';
}

export function decidePreservation(
  variableName: string,
  filePath: string
): PreservationDecision {
  // Elemental properties must always be preserved per workspace rules
  if (ELEMENT_NAMES.has(variableName)) {
    return { preserve: true, reason: 'elemental-property', confidence: 0.95 };
  }

  // Astrological variables used across calculations and services
  if (ASTRO_VARIABLE_NAME_REGEX.test(variableName)) {
    return { preserve: true, reason: 'astrological-variable', confidence: 0.85 };
  }

  // Campaign/metrics/monitoring system variables
  if (CAMPAIGN_VARIABLE_NAME_REGEX.test(variableName)) {
    return { preserve: true, reason: 'campaign-system', confidence: 0.8 };
  }

  // Culinary/recipe domain variables in tests and components
  if (CULINARY_VARIABLE_NAME_REGEX.test(variableName)) {
    return { preserve: true, reason: 'culinary-domain', confidence: 0.75 };
  }

  if (isTestFile(filePath)) {
    return { preserve: true, reason: 'test-context', confidence: 0.9 };
  }

  // Elevate caution for high-impact files
  if (isCoreCalculationFile(filePath)) {
    return { preserve: true, reason: 'core-calculation', confidence: 0.7 };
  }
  if (isServiceLayerFile(filePath)) {
    return { preserve: true, reason: 'service-layer', confidence: 0.65 };
  }

  return { preserve: false, reason: 'none', confidence: 0.5 };
}
