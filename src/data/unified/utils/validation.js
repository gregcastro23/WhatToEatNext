"use strict";
/**
 * Comprehensive Validation and Type Guards Utility
 *
 * This module provides validation functions and type guards for various data structures
 * used throughout the application. Consolidated from validation.ts and typeGuards.ts.
 */

/**
 * Type guard to check if an object is a valid ElementalProperties structure
 * @param obj Object to check
 * @returns True if the object is a valid ElementalProperties structure
 */
export function isElementalProperties(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const elementalObj = obj;
    // Check for required elemental properties
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    for (const element of requiredElements) {
        if (!(element in elementalObj) || typeof elementalObj[element] !== 'number') {
            return false;
        }
        // Check if values are within valid range (0-1)
        const value = elementalObj[element];
        if (value < 0 || value > 1 || isNaN(value)) {
            return false;
        }
    }
    return true;
}

/**
 * Type guard to check if a string is a valid elemental property key
 * @param key String to check
 * @returns True if the string is a valid elemental property key
 */
export function isElementalPropertyKey(key) {
    return typeof key === 'string' && ['Fire', 'Water', 'Earth', 'Air'].includes(key);
}

/**
 * Type guard to check if an object is a valid ChakraEnergies structure
 * @param obj Object to check
 * @returns True if the object is a valid ChakraEnergies structure
 */
export function isChakraEnergies(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const chakraObj = obj;
    // Check for required chakra properties
    const requiredChakras = [
        'root',
        'sacral',
        'solarPlexus',
        'heart',
        'throat',
        'thirdEye',
        'crown'
    ];
    for (const chakra of requiredChakras) {
        if (!(chakra in chakraObj) || typeof chakraObj[chakra] !== 'number') {
            return false;
        }
        // Validate that chakra energy is in expected range (1-10)
        const energy = chakraObj[chakra];
        if (energy < 1 || energy > 10 || isNaN(energy)) {
            return false;
        }
    }
    return true;
}

/**
 * Type guard to check if a string is a valid chakra key
 * @param key String to check
 * @returns True if the string is a valid chakra key
 */
export function isChakraKey(key) {
    return typeof key === 'string' && ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'].includes(key);
}

/**
 * Type guard to check if an object has planetary position structure
 * @param obj Object to check
 * @returns True if the object has planetary position properties
 */
export function isPlanetaryPositions(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const positionsObj = obj;
    // Check for at least some basic planetary positions
    const basicPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    let foundPlanets = 0;
    for (const planet of basicPlanets) {
        if (planet in positionsObj) {
            foundPlanets++;
        }
    }
    // Should have at least 3 of the basic planets
    return foundPlanets >= 3;
}

/**
 * Type guard to check if an object is a valid zodiac energies structure
 * @param obj Object to check
 * @returns True if the object is a valid zodiac energies structure
 */
export function isZodiacEnergies(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const zodiacObj = obj;
    // Check that all values are numbers
    for (const value of Object.values(zodiacObj)) {
        if (typeof value !== 'number') {
            return false;
        }
    }
    return true;
}

/**
 * Logs unexpected values for debugging purposes
 * @param context Context where the unexpected value occurred
 * @param details Details about the unexpected value
 */
export function logUnexpectedValue(context, details) {
    // console.warn(`Unexpected value in ${context}:`, details);
}

/**
 * Validates that a value is a number within a specified range
 * @param value Value to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns True if the value is a valid number within range
 */
export function isNumberInRange(value, min, max) {
    return typeof value === 'number' &&
        !isNaN(value) &&
        value >= min &&
        value <= max;
}

/**
 * Validates that a value is a positive number
 * @param value Value to validate
 * @returns True if the value is a positive number
 */
export function isPositiveNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates that a value is a non-negative number
 * @param value Value to validate
 * @returns True if the value is a non-negative number
 */
export function isNonNegativeNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Type guard to check if a value is a non-empty string
 * @param value Value to check
 * @returns True if the value is a non-empty string
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}

/**
 * Validates that an object has all required properties
 * @param obj Object to validate
 * @param requiredProps Array of required property names
 * @returns True if the object has all required properties
 */
export function hasRequiredProperties(obj, requiredProps) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const objRecord = obj;
    for (const prop of requiredProps) {
        if (!(prop in objRecord)) {
            return false;
        }
    }
    return true;
}

/**
 * Validates that an array contains only elements of a specific type
 * @param arr Array to validate
 * @param typeCheck Function to check each element's type
 * @returns True if all elements pass the type check
 */
export function isArrayOfType(arr, typeCheck) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every(typeCheck);
}

/**
 * Validates that a string matches an allowed pattern
 * @param str String to validate
 * @param allowedPattern Array of allowed values or regex pattern
 * @returns True if the string matches the allowed pattern
 */
export function isValidString(str, allowedPattern) {
    if (typeof str !== 'string') {
        return false;
    }
    if (Array.isArray(allowedPattern)) {
        return allowedPattern.includes(str);
    }
    if (allowedPattern instanceof RegExp) {
        return allowedPattern.test(str);
    }
    return true; // If no pattern specified, any string is valid
}

// ===== ENTERPRISE VALIDATION INTELLIGENCE SYSTEMS =====

/**
 * UNIFIED_VALIDATION_INTELLIGENCE - Advanced validation system utilizing all validation functions
 */
export const UNIFIED_VALIDATION_INTELLIGENCE = {
    /**
     * Elemental Properties Validation Intelligence
     * Comprehensive validation suite for elemental properties with advanced analytics
     */
    validateElementalPropertiesAdvanced: (obj, context = 'unknown') => {
        const validation = {
            isValid: isElementalProperties(obj),
            validationContext: context,
            timestamp: Date.now(),
            detailedAnalysis: {
                structureValid: false,
                valueRangeValid: false,
                completenessValid: false,
                balanceAnalysis: {}
            },
            recommendations: []
        };

        if (!obj || typeof obj !== 'object') {
            validation.recommendations.push('Provide valid elemental properties object');
            return validation;
        }

        // Structure validation
        const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
        validation.detailedAnalysis.structureValid = hasRequiredProperties(obj, requiredElements);
        
        // Value range validation
        let validValues = true;
        const balanceAnalysis = {};
        
        for (const element of requiredElements) {
            if (element in obj) {
                const value = obj[element];
                const isValidRange = isNumberInRange(value, 0, 1);
                balanceAnalysis[element] = {
                    value: value,
                    isValid: isValidRange,
                    strength: value > 0.6 ? 'high' : value > 0.3 ? 'medium' : 'low',
                    balance: value === 0.25 ? 'balanced' : value > 0.25 ? 'dominant' : 'weak'
                };
                
                if (!isValidRange) {
                    validValues = false;
                    validation.recommendations.push(`Fix ${element} value: ${value} (must be 0-1)`);
                }
            }
        }
        
        validation.detailedAnalysis.valueRangeValid = validValues;
        validation.detailedAnalysis.balanceAnalysis = balanceAnalysis;
        
        // Completeness validation
        validation.detailedAnalysis.completenessValid = 
            Math.abs(Object.values(obj).reduce((sum, val) => sum + val, 0) - 1) < 0.01;
        
        if (!validation.detailedAnalysis.completenessValid) {
            validation.recommendations.push('Elemental values should sum to 1.0');
        }
        
        // Log validation results
        logUnexpectedValue(`Elemental Validation: ${context}`, validation);
        
        return validation;
    },

    /**
     * Chakra Energies Validation Intelligence
     * Advanced chakra energy validation with harmonic analysis
     */
    validateChakraEnergiesAdvanced: (obj, context = 'unknown') => {
        const validation = {
            isValid: isChakraEnergies(obj),
            validationContext: context,
            timestamp: Date.now(),
            chakraAnalysis: {},
            harmonicAnalysis: {
                totalEnergy: 0,
                averageEnergy: 0,
                energyDistribution: {},
                blockages: [],
                strengths: []
            },
            recommendations: []
        };

        if (!obj || typeof obj !== 'object') {
            validation.recommendations.push('Provide valid chakra energies object');
            return validation;
        }

        const chakras = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];
        let totalEnergy = 0;
        
        for (const chakra of chakras) {
            if (chakra in obj) {
                const energy = obj[chakra];
                const isValidEnergy = isNumberInRange(energy, 1, 10);
                
                validation.chakraAnalysis[chakra] = {
                    energy: energy,
                    isValid: isValidEnergy,
                    level: energy >= 8 ? 'high' : energy >= 6 ? 'balanced' : energy >= 4 ? 'moderate' : 'low',
                    status: energy >= 7 ? 'flowing' : energy >= 5 ? 'stable' : 'blocked'
                };
                
                if (isValidEnergy) {
                    totalEnergy += energy;
                    if (energy < 4) {
                        validation.harmonicAnalysis.blockages.push(chakra);
                    }
                    if (energy >= 8) {
                        validation.harmonicAnalysis.strengths.push(chakra);
                    }
                } else {
                    validation.recommendations.push(`Fix ${chakra} energy: ${energy} (must be 1-10)`);
                }
            }
        }
        
        validation.harmonicAnalysis.totalEnergy = totalEnergy;
        validation.harmonicAnalysis.averageEnergy = totalEnergy / chakras.length;
        
        // Energy distribution analysis
        for (const chakra of chakras) {
            if (chakra in obj) {
                validation.harmonicAnalysis.energyDistribution[chakra] = 
                    ((obj[chakra] / totalEnergy) * 100).toFixed(1) + '%';
            }
        }
        
        // Recommendations based on analysis
        if (validation.harmonicAnalysis.blockages.length > 0) {
            validation.recommendations.push(`Address blocked chakras: ${validation.harmonicAnalysis.blockages.join(', ')}`);
        }
        
        if (validation.harmonicAnalysis.averageEnergy < 5) {
            validation.recommendations.push('Overall energy levels are low - consider energy work');
        }
        
        // Log validation results
        logUnexpectedValue(`Chakra Validation: ${context}`, validation);
        
        return validation;
    },

    /**
     * Planetary Positions Validation Intelligence
     * Advanced astrological validation with positional analysis
     */
    validatePlanetaryPositionsAdvanced: (obj, context = 'unknown') => {
        const validation = {
            isValid: isPlanetaryPositions(obj),
            validationContext: context,
            timestamp: Date.now(),
            planetaryAnalysis: {},
            astrologicalInsights: {
                planetCount: 0,
                missingPlanets: [],
                planetaryStrengths: {},
                aspectAnalysis: {}
            },
            recommendations: []
        };

        if (!obj || typeof obj !== 'object') {
            validation.recommendations.push('Provide valid planetary positions object');
            return validation;
        }

        const allPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
        const basicPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
        
        let planetCount = 0;
        
        for (const planet of allPlanets) {
            if (planet in obj) {
                planetCount++;
                const position = obj[planet];
                
                validation.planetaryAnalysis[planet] = {
                    present: true,
                    position: position,
                    isBasicPlanet: basicPlanets.includes(planet),
                    strength: basicPlanets.includes(planet) ? 'essential' : 'extended'
                };
                
                validation.astrologicalInsights.planetaryStrengths[planet] = 
                    basicPlanets.includes(planet) ? 'high' : 'medium';
            } else {
                validation.astrologicalInsights.missingPlanets.push(planet);
            }
        }
        
        validation.astrologicalInsights.planetCount = planetCount;
        
        // Validation recommendations
        if (planetCount < 5) {
            validation.recommendations.push('Missing essential planetary positions - provide at least 5 planets');
        }
        
        if (validation.astrologicalInsights.missingPlanets.includes('Sun')) {
            validation.recommendations.push('Sun position is critical for astrological calculations');
        }
        
        if (validation.astrologicalInsights.missingPlanets.includes('Moon')) {
            validation.recommendations.push('Moon position is essential for lunar calculations');
        }
        
        // Log validation results
        logUnexpectedValue(`Planetary Validation: ${context}`, validation);
        
        return validation;
    },

    /**
     * Comprehensive Multi-System Validation Intelligence
     * Validates multiple systems simultaneously with cross-system analysis
     */
    validateMultiSystemIntelligence: (systems, context = 'unknown') => {
        const validation = {
            timestamp: Date.now(),
            context: context,
            systemValidations: {},
            crossSystemAnalysis: {
                elementalChakraAlignment: null,
                planetaryElementalHarmony: null,
                chakraPlanetaryResonance: null,
                overallSystemHealth: 'unknown'
            },
            recommendations: []
        };

        // Validate each system
        if (systems.elemental) {
            validation.systemValidations.elemental = 
                UNIFIED_VALIDATION_INTELLIGENCE.validateElementalPropertiesAdvanced(systems.elemental, context);
        }
        
        if (systems.chakra) {
            validation.systemValidations.chakra = 
                UNIFIED_VALIDATION_INTELLIGENCE.validateChakraEnergiesAdvanced(systems.chakra, context);
        }
        
        if (systems.planetary) {
            validation.systemValidations.planetary = 
                UNIFIED_VALIDATION_INTELLIGENCE.validatePlanetaryPositionsAdvanced(systems.planetary, context);
        }

        // Cross-system analysis
        if (systems.elemental && systems.chakra) {
            validation.crossSystemAnalysis.elementalChakraAlignment = 
                UNIFIED_VALIDATION_INTELLIGENCE.analyzeElementalChakraAlignment(systems.elemental, systems.chakra);
        }
        
        if (systems.planetary && systems.elemental) {
            validation.crossSystemAnalysis.planetaryElementalHarmony = 
                UNIFIED_VALIDATION_INTELLIGENCE.analyzePlanetaryElementalHarmony(systems.planetary, systems.elemental);
        }
        
        // Overall system health assessment
        const validSystems = Object.values(validation.systemValidations)
            .filter(sys => sys.isValid).length;
        const totalSystems = Object.keys(validation.systemValidations).length;
        
        validation.crossSystemAnalysis.overallSystemHealth = 
            validSystems === totalSystems ? 'excellent' :
            validSystems >= totalSystems * 0.7 ? 'good' :
            validSystems >= totalSystems * 0.5 ? 'moderate' : 'poor';
        
        // Aggregate recommendations
        Object.values(validation.systemValidations).forEach(sys => {
            validation.recommendations.push(...sys.recommendations);
        });
        
        return validation;
    },

    /**
     * Elemental-Chakra Alignment Analysis
     * Advanced cross-system alignment intelligence
     */
    analyzeElementalChakraAlignment: (elemental, chakra) => {
        const alignment = {
            score: 0,
            alignments: {},
            recommendations: []
        };

        const elementChakraMapping = {
            'Fire': 'solarPlexus',
            'Water': 'sacral',
            'Earth': 'root',
            'Air': 'heart'
        };

        let totalAlignment = 0;
        let mappingCount = 0;

        for (const [element, chakraKey] of Object.entries(elementChakraMapping)) {
            if (elemental[element] && chakra[chakraKey]) {
                const elementStrength = elemental[element];
                const chakraStrength = chakra[chakraKey] / 10; // Normalize to 0-1 scale
                
                const alignmentScore = 1 - Math.abs(elementStrength - chakraStrength);
                
                alignment.alignments[element] = {
                    element: element,
                    chakra: chakraKey,
                    elementStrength: elementStrength,
                    chakraStrength: chakraStrength,
                    alignmentScore: alignmentScore,
                    status: alignmentScore > 0.8 ? 'excellent' : 
                           alignmentScore > 0.6 ? 'good' : 
                           alignmentScore > 0.4 ? 'moderate' : 'poor'
                };
                
                totalAlignment += alignmentScore;
                mappingCount++;
            }
        }

        alignment.score = mappingCount > 0 ? totalAlignment / mappingCount : 0;
        
        // Recommendations based on alignment
        if (alignment.score < 0.5) {
            alignment.recommendations.push('Elemental and chakra systems are misaligned - consider balancing work');
        }
        
        for (const [element, data] of Object.entries(alignment.alignments)) {
            if (data.alignmentScore < 0.5) {
                alignment.recommendations.push(`${element} element and ${data.chakra} chakra need alignment work`);
            }
        }
        
        return alignment;
    },

    /**
     * Planetary-Elemental Harmony Analysis
     * Advanced astrological-elemental harmony intelligence
     */
    analyzePlanetaryElementalHarmony: (planetary, elemental) => {
        const harmony = {
            score: 0,
            harmonies: {},
            recommendations: []
        };

        const planetElementMapping = {
            'Sun': 'Fire',
            'Moon': 'Water',
            'Mercury': 'Air',
            'Venus': 'Earth',
            'Mars': 'Fire',
            'Jupiter': 'Fire',
            'Saturn': 'Earth'
        };

        let totalHarmony = 0;
        let mappingCount = 0;

        for (const [planet, element] of Object.entries(planetElementMapping)) {
            if (planetary[planet] && elemental[element]) {
                const planetPresent = planetary[planet] ? 1 : 0;
                const elementStrength = elemental[element];
                
                const harmonyScore = planetPresent * elementStrength;
                
                harmony.harmonies[planet] = {
                    planet: planet,
                    element: element,
                    planetPresent: planetPresent,
                    elementStrength: elementStrength,
                    harmonyScore: harmonyScore,
                    status: harmonyScore > 0.7 ? 'excellent' : 
                           harmonyScore > 0.5 ? 'good' : 
                           harmonyScore > 0.3 ? 'moderate' : 'weak'
                };
                
                totalHarmony += harmonyScore;
                mappingCount++;
            }
        }

        harmony.score = mappingCount > 0 ? totalHarmony / mappingCount : 0;
        
        // Recommendations based on harmony
        if (harmony.score < 0.4) {
            harmony.recommendations.push('Planetary and elemental systems lack harmony - consider cosmic timing');
        }
        
        return harmony;
    }
};

/**
 * SPECIALIZED_VALIDATION_INTELLIGENCE - Specialized validation systems for specific contexts
 */
export const SPECIALIZED_VALIDATION_INTELLIGENCE = {
    /**
     * Zodiac Energies Validation Intelligence
     * Advanced zodiac validation with astrological insights
     */
    validateZodiacEnergiesAdvanced: (obj, context = 'unknown') => {
        const validation = {
            isValid: isZodiacEnergies(obj),
            validationContext: context,
            timestamp: Date.now(),
            zodiacAnalysis: {},
            astrologicalInsights: {
                dominantSigns: [],
                weakSigns: [],
                elementalDistribution: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
                modalityDistribution: { Cardinal: 0, Fixed: 0, Mutable: 0 }
            },
            recommendations: []
        };

        if (!obj || typeof obj !== 'object') {
            validation.recommendations.push('Provide valid zodiac energies object');
            return validation;
        }

        const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                           'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        
        const signElements = {
            'aries': 'Fire', 'leo': 'Fire', 'sagittarius': 'Fire',
            'taurus': 'Earth', 'virgo': 'Earth', 'capricorn': 'Earth',
            'gemini': 'Air', 'libra': 'Air', 'aquarius': 'Air',
            'cancer': 'Water', 'scorpio': 'Water', 'pisces': 'Water'
        };

        const signModalities = {
            'aries': 'Cardinal', 'cancer': 'Cardinal', 'libra': 'Cardinal', 'capricorn': 'Cardinal',
            'taurus': 'Fixed', 'leo': 'Fixed', 'scorpio': 'Fixed', 'aquarius': 'Fixed',
            'gemini': 'Mutable', 'virgo': 'Mutable', 'sagittarius': 'Mutable', 'pisces': 'Mutable'
        };

        let totalEnergy = 0;
        
        for (const sign of zodiacSigns) {
            if (sign in obj) {
                const energy = obj[sign];
                const isValidEnergy = isNonNegativeNumber(energy);
                
                validation.zodiacAnalysis[sign] = {
                    energy: energy,
                    isValid: isValidEnergy,
                    element: signElements[sign],
                    modality: signModalities[sign],
                    strength: energy > 0.7 ? 'high' : energy > 0.4 ? 'medium' : 'low'
                };
                
                if (isValidEnergy) {
                    totalEnergy += energy;
                    
                    // Track dominant and weak signs
                    if (energy > 0.7) {
                        validation.astrologicalInsights.dominantSigns.push(sign);
                    } else if (energy < 0.2) {
                        validation.astrologicalInsights.weakSigns.push(sign);
                    }
                    
                    // Update elemental distribution
                    const element = signElements[sign];
                    validation.astrologicalInsights.elementalDistribution[element] += energy;
                    
                    // Update modality distribution
                    const modality = signModalities[sign];
                    validation.astrologicalInsights.modalityDistribution[modality] += energy;
                } else {
                    validation.recommendations.push(`Fix ${sign} energy: ${energy} (must be non-negative)`);
                }
            }
        }
        
        // Normalize distributions
        if (totalEnergy > 0) {
            for (const element in validation.astrologicalInsights.elementalDistribution) {
                validation.astrologicalInsights.elementalDistribution[element] /= totalEnergy;
            }
            
            for (const modality in validation.astrologicalInsights.modalityDistribution) {
                validation.astrologicalInsights.modalityDistribution[modality] /= totalEnergy;
            }
        }
        
        // Astrological recommendations
        if (validation.astrologicalInsights.dominantSigns.length > 3) {
            validation.recommendations.push('Many dominant signs - consider balancing energies');
        }
        
        if (validation.astrologicalInsights.weakSigns.length > 6) {
            validation.recommendations.push('Many weak signs - consider strengthening zodiac energies');
        }
        
        // Log validation results
        logUnexpectedValue(`Zodiac Validation: ${context}`, validation);
        
        return validation;
    },

    /**
     * Array Type Validation Intelligence
     * Advanced array validation with type-specific insights
     */
    validateArrayTypeAdvanced: (arr, typeCheck, context = 'unknown') => {
        const validation = {
            isValid: isArrayOfType(arr, typeCheck),
            validationContext: context,
            timestamp: Date.now(),
            arrayAnalysis: {
                length: 0,
                validElements: 0,
                invalidElements: 0,
                validationRate: 0,
                elementTypes: {},
                invalidIndices: []
            },
            recommendations: []
        };

        if (!Array.isArray(arr)) {
            validation.recommendations.push('Provide valid array');
            return validation;
        }

        validation.arrayAnalysis.length = arr.length;
        
        arr.forEach((element, index) => {
            const isValid = typeCheck(element);
            
            if (isValid) {
                validation.arrayAnalysis.validElements++;
            } else {
                validation.arrayAnalysis.invalidElements++;
                validation.arrayAnalysis.invalidIndices.push(index);
            }
            
            // Track element types
            const elementType = typeof element;
            validation.arrayAnalysis.elementTypes[elementType] = 
                (validation.arrayAnalysis.elementTypes[elementType] || 0) + 1;
        });
        
        validation.arrayAnalysis.validationRate = 
            validation.arrayAnalysis.length > 0 ? 
            validation.arrayAnalysis.validElements / validation.arrayAnalysis.length : 0;
        
        // Recommendations based on analysis
        if (validation.arrayAnalysis.validationRate < 0.8) {
            validation.recommendations.push(`Array validation rate is low: ${(validation.arrayAnalysis.validationRate * 100).toFixed(1)}%`);
        }
        
        if (validation.arrayAnalysis.invalidElements > 0) {
            validation.recommendations.push(`Fix ${validation.arrayAnalysis.invalidElements} invalid elements at indices: ${validation.arrayAnalysis.invalidIndices.join(', ')}`);
        }
        
        // Log validation results
        logUnexpectedValue(`Array Type Validation: ${context}`, validation);
        
        return validation;
    },

    /**
     * String Pattern Validation Intelligence
     * Advanced string validation with pattern analysis
     */
    validateStringPatternAdvanced: (str, allowedPattern, context = 'unknown') => {
        const validation = {
            isValid: isValidString(str, allowedPattern),
            validationContext: context,
            timestamp: Date.now(),
            stringAnalysis: {
                length: 0,
                isEmpty: false,
                patternType: 'unknown',
                matchDetails: null,
                suggestions: []
            },
            recommendations: []
        };

        if (typeof str !== 'string') {
            validation.recommendations.push('Provide valid string');
            return validation;
        }

        validation.stringAnalysis.length = str.length;
        validation.stringAnalysis.isEmpty = str.length === 0;
        
        if (Array.isArray(allowedPattern)) {
            validation.stringAnalysis.patternType = 'allowed_values';
            validation.stringAnalysis.matchDetails = {
                allowedValues: allowedPattern,
                matches: allowedPattern.includes(str),
                closestMatch: allowedPattern.find(pattern => 
                    pattern.toLowerCase().includes(str.toLowerCase()) || 
                    str.toLowerCase().includes(pattern.toLowerCase())
                )
            };
            
            if (!validation.stringAnalysis.matchDetails.matches && validation.stringAnalysis.matchDetails.closestMatch) {
                validation.stringAnalysis.suggestions.push(validation.stringAnalysis.matchDetails.closestMatch);
            }
        } else if (allowedPattern instanceof RegExp) {
            validation.stringAnalysis.patternType = 'regex';
            validation.stringAnalysis.matchDetails = {
                pattern: allowedPattern.source,
                matches: allowedPattern.test(str),
                flags: allowedPattern.flags
            };
        } else {
            validation.stringAnalysis.patternType = 'no_pattern';
        }
        
        // Recommendations based on analysis
        if (validation.stringAnalysis.isEmpty) {
            validation.recommendations.push('String is empty - provide non-empty value');
        }
        
        if (!validation.isValid && validation.stringAnalysis.suggestions.length > 0) {
            validation.recommendations.push(`Consider using: ${validation.stringAnalysis.suggestions.join(', ')}`);
        }
        
        // Log validation results
        logUnexpectedValue(`String Pattern Validation: ${context}`, validation);
        
        return validation;
    }
};
