"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDominantElement = exports.calculateElementalCompatibility = exports.scaleElementalProperties = exports.mergeElementalProperties = exports.getElementalProperty = exports.isElementalProperties = exports.createElementalProperties = void 0;
/**
 * Creates a properly initialized ElementalProperties object with default values
 */
function createElementalProperties(props) {
    return { Fire: props?.Fire ?? 0, Water: props?.Water ?? 0, Earth: props?.Earth ?? 0, Air: props?.Air ?? 0,
    };
}
exports.createElementalProperties = createElementalProperties;
/**
 * Type guard to check if an object is a valid ElementalProperties object
 */
function isElementalProperties(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    return (typeof obj.Fire === 'number' &&
        typeof obj.Water === 'number' &&
        typeof obj.Earth === 'number' &&
        typeof obj.Air === 'number');
}
exports.isElementalProperties = isElementalProperties;
/**
 * Safely access elemental properties with fallback to default values
 */
function getElementalProperty(props, element) {
    if (!props)
        return 0;
    return props[element] ?? 0;
}
exports.getElementalProperty = getElementalProperty;
/**
 * Merge two ElementalProperties objects
 */
function mergeElementalProperties(base, override) {
    return createElementalProperties({ Fire: (base?.Fire ?? 0) + (override?.Fire ?? 0), Water: (base?.Water ?? 0) + (override?.Water ?? 0), Earth: (base?.Earth ?? 0) + (override?.Earth ?? 0), Air: (base?.Air ?? 0) + (override?.Air ?? 0),
    });
}
exports.mergeElementalProperties = mergeElementalProperties;
/**
 * Scale elemental properties by a factor
 */
function scaleElementalProperties(props, factor) {
    if (!props)
        return createElementalProperties();
    return createElementalProperties({ Fire: (props.Fire ?? 0) * factor, Water: (props.Water ?? 0) * factor, Earth: (props.Earth ?? 0) * factor, Air: (props.Air ?? 0) * factor,
    });
}
exports.scaleElementalProperties = scaleElementalProperties;
/**
 * Calculate compatibility score between two ElementalProperties objects
 * Following our elemental principles:
 * 1. Elements reinforce themselves most strongly
 * 2. All element combinations have good compatibility (0.7+)
 * 3. No opposing elements - all elements work together harmoniously
 *
 * @param source - The source elemental properties
 * @param target - The target elemental properties to compare against
 * @returns A compatibility score between 0 and 1
 */
function calculateElementalCompatibility(source, target) {
    // Return default score if either source or target is missing
    if (!source || !target)
        return 0.5;
    // Ensure we have complete properties objects
    const sourceProps = createElementalProperties(source);
    const targetProps = createElementalProperties(target);
    // Define element compatibility scores (same elements have highest compatibility)
    const compatibilityScores = { Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
        Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
        Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
        Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
    };
    // Get dominant elements for each profile
    const sourceDominant = getDominantElement(sourceProps);
    const targetDominant = getDominantElement(targetProps);
    // Calculate direct compatibility between dominant elements
    const baseCompatibility = compatibilityScores[sourceDominant][targetDominant] || 0.7;
    // Calculate weighted compatibility across all elements
    let weightedSum = 0;
    let totalWeight = 0;
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    for (const sourceElement of elements) {
        const sourceValue = sourceProps[sourceElement];
        if (sourceValue <= 0)
            continue; // Skip elements with no presence
        // Weight by the element's prominence in the source
        const weight = sourceValue;
        // For each source element, calculate its compatibility with each target element
        let bestCompatibility = 0;
        for (const targetElement of elements) {
            const targetValue = targetProps[targetElement];
            if (targetValue <= 0)
                continue; // Skip elements with no presence
            // Get compatibility between these two elements
            const elementCompatibility = compatibilityScores[sourceElement][targetElement] || 0.7;
            // Scale by the target element's prominence
            const scaledCompatibility = elementCompatibility * targetValue;
            bestCompatibility = Math.max(bestCompatibility, scaledCompatibility);
        }
        weightedSum += bestCompatibility * weight;
        totalWeight += weight;
    }
    // Calculate final score - ensure minimum of 0.7 following our principles
    const finalScore = totalWeight > 0
        ? Math.max(0.7, weightedSum / totalWeight)
        : 0.7;
    return finalScore;
}
exports.calculateElementalCompatibility = calculateElementalCompatibility;
/**
 * Get the dominant element from elemental properties
 */
function getDominantElement(properties) {
    return Object.entries(properties)
        .reduce((max, [element, value]) => value > max.value ? { element: element, value } : max, { element: 'Fire', value: 0 }).element;
}
exports.getDominantElement = getDominantElement;
