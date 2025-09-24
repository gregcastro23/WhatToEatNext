"use strict";
/*
  Domain-aware preservation and classification for variables flagged as unused.
  This module provides predicate functions to determine whether a variable should
  be preserved (not eliminated) due to domain significance, and utilities to
  classify files for risk/safety protocols.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.decidePreservation = exports.classifyFileKind = exports.isTestFile = exports.isServiceLayerFile = exports.isCoreCalculationFile = exports.isHighImpactFile = void 0;
const ELEMENT_NAMES = new Set(['Fire', 'Water', 'Earth', 'Air']);
const ASTRO_VARIABLE_NAME_REGEX = /^(?:planet|planets|planetary|degree|longitude|latitude|sign|zodiac|position|coordinates?|house|asc|mc|dignit|retro|ephemer|utc|julian)/i;
const CAMPAIGN_VARIABLE_NAME_REGEX = /^(?:metrics?|progress|safety|campaign|validation|intelligence|monitor|tracking|telemetry|baseline|phase|gate|milestone|roi)/i;
const TEST_CONTEXT_FILE_REGEX = /\/(?:__tests__|tests?|__mocks__|mocks|__fixtures__|fixtures)\//i;
const CULINARY_VARIABLE_NAME_REGEX = /^(?:cuisine|ingredient|recipe|flavor|taste|umami|spice|seasoning|cooking|method|profile|oil|vinegar|protein|vegetable|fruit)/i;
function isHighImpactFile(filePath) {
    // Core calculations and services are considered high impact
    return (/\/src\/calculations\//.test(filePath) ||
        /\/src\/services\//.test(filePath) ||
        /\/src\/utils\/(?:astrology|alchem|element|planet)/i.test(filePath));
}
exports.isHighImpactFile = isHighImpactFile;
function isCoreCalculationFile(filePath) {
    return /\/src\/calculations\//.test(filePath);
}
exports.isCoreCalculationFile = isCoreCalculationFile;
function isServiceLayerFile(filePath) {
    return /\/src\/services\//.test(filePath);
}
exports.isServiceLayerFile = isServiceLayerFile;
function isTestFile(filePath) {
    return TEST_CONTEXT_FILE_REGEX.test(filePath) || /\.(spec|test)\.[tj]sx?$/.test(filePath);
}
exports.isTestFile = isTestFile;
function classifyFileKind(filePath) {
    if (isTestFile(filePath))
        return 'test';
    if (/\/src\/components\//.test(filePath))
        return 'component';
    if (isServiceLayerFile(filePath))
        return 'service';
    if (isCoreCalculationFile(filePath))
        return 'calculation';
    if (/\/src\/utils\//.test(filePath))
        return 'utils';
    if (/\/src\/types\//.test(filePath))
        return 'types';
    return 'other';
}
exports.classifyFileKind = classifyFileKind;
function decidePreservation(variableName, filePath) {
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
exports.decidePreservation = decidePreservation;
//# sourceMappingURL=domainPreservation.js.map