/**
 * The fundamental elemental nature of alchemical properties
 * Based on core principles of the alchemizer engine
 */
/**
 * The fundamental elemental nature of alchemical properties
 * Based on core principles of the alchemizer engine
 */
export const ALCHEMICAL_PROPERTY_ELEMENTS = {
    Spirit: { primary: 'Fire', secondary: 'Air' },
    Essence: { primary: 'Fire', secondary: 'Water' },
    Matter: { primary: 'Earth', secondary: 'Water' },
    Substance: { primary: 'Air', secondary: 'Earth' } // Substance exists between Air and earth
};
/**
 * The 14 Alchemical Pillars representing ways in which the four
 * fundamental alchemical properties (Spirit, Essence, Matter, Substance)
 * are transformed during alchemical processes
 */
export const ALCHEMICAL_PILLARS = [
    {
        id: 1,
        name: 'Solution',
        description: 'The process of dissolving a solid in a liquid, increasing Essence and Matter while decreasing Spirit and Substance',
        effects: {
            Spirit: -1,
            Essence: 1,
            Matter: 1,
            Substance: -1
        },
        planetaryAssociations: ['Moon', 'Neptune'],
        tarotAssociations: ['2 of Cups', 'Queen of Cups'],
        elementalAssociations: {
            primary: 'Water',
            secondary: 'Earth'
        }
    },
    {
        id: 2,
        name: 'Filtration',
        description: 'The separation of solids from liquids, increasing Essence, Spirit, and Substance while decreasing Matter',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: -1,
            Substance: 1
        },
        planetaryAssociations: ['Mercury', 'Saturn'],
        tarotAssociations: ['8 of Pentacles', 'Temperance'],
        elementalAssociations: {
            primary: 'Air',
            secondary: 'Water'
        }
    },
    {
        id: 3,
        name: 'Evaporation',
        description: 'The transition from liquid to gaseous state, increasing Essence and Spirit while decreasing Matter and Substance',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: -1,
            Substance: -1
        },
        planetaryAssociations: ['Mercury', 'Uranus'],
        tarotAssociations: ['6 of Swords', '8 of Wands'],
        elementalAssociations: {
            primary: 'Air',
            secondary: 'Fire'
        }
    },
    {
        id: 4,
        name: 'Distillation',
        description: 'The purification of liquids through evaporation and condensation, increasing Essence, Spirit, and Substance while decreasing Matter',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: -1,
            Substance: 1
        },
        planetaryAssociations: ['Mercury', 'Neptune'],
        tarotAssociations: ['Temperance', 'The Star'],
        elementalAssociations: {
            primary: 'Water',
            secondary: 'Air'
        }
    },
    {
        id: 5,
        name: 'Separation',
        description: 'The division of a Substance into its constituents, increasing Essence, Matter, and Spirit while decreasing Substance',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: 1,
            Substance: -1
        },
        planetaryAssociations: ['Mercury', 'Uranus', 'Pluto'],
        tarotAssociations: ['2 of Swords', 'The Tower'],
        elementalAssociations: {
            primary: 'Fire',
            secondary: 'Water'
        }
    },
    {
        id: 6,
        name: 'Rectification',
        description: 'The refinement and purification of all elements, increasing all alchemical properties',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: 1,
            Substance: 1
        },
        planetaryAssociations: ['Sun', 'Jupiter'],
        tarotAssociations: ['The World', 'The Star'],
        elementalAssociations: {
            primary: 'Fire'
        }
    },
    {
        id: 7,
        name: 'Calcination',
        description: 'The reduction of a Substance through intense heat, increasing Essence and Matter while decreasing Spirit and Substance',
        effects: {
            Spirit: -1,
            Essence: 1,
            Matter: 1,
            Substance: -1
        },
        planetaryAssociations: ['Mars', 'Saturn'],
        tarotAssociations: ['Tower', 'King of Wands'],
        elementalAssociations: {
            primary: 'Fire',
            secondary: 'Earth'
        }
    },
    {
        id: 8,
        name: 'Comixion',
        description: 'The thorough mixing of substances, increasing Matter, Spirit, and Substance while decreasing Essence',
        effects: {
            Spirit: 1,
            Essence: -1,
            Matter: 1,
            Substance: 1
        },
        planetaryAssociations: ['Venus', 'Jupiter', 'Pluto'],
        tarotAssociations: ['3 of Cups', '10 of Pentacles'],
        elementalAssociations: {
            primary: 'Earth',
            secondary: 'Air'
        }
    },
    {
        id: 9,
        name: 'Purification',
        description: 'The removal of impurities, increasing Essence and Spirit while decreasing Matter and Substance',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: -1,
            Substance: -1
        },
        planetaryAssociations: ['Mercury', 'Neptune', 'Moon'],
        tarotAssociations: ['The Hermit', 'Temperance'],
        elementalAssociations: {
            primary: 'Fire',
            secondary: 'Air'
        }
    },
    {
        id: 10,
        name: 'Inhibition',
        description: 'The restraint of reactive processes, increasing Matter and Substance while decreasing Essence and Spirit',
        effects: {
            Spirit: -1,
            Essence: -1,
            Matter: 1,
            Substance: 1
        },
        planetaryAssociations: ['Saturn', 'Pluto'],
        tarotAssociations: ['4 of Pentacles', 'The Hanged Man'],
        elementalAssociations: {
            primary: 'Earth',
            secondary: 'Water'
        }
    },
    {
        id: 11,
        name: 'Fermentation',
        description: 'The transformation through microbial action, increasing Essence, Matter, and Spirit while decreasing Substance',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: 1,
            Substance: -1
        },
        planetaryAssociations: ['Pluto', 'Jupiter', 'Mars'],
        tarotAssociations: ['Death', 'Wheel of Fortune'],
        elementalAssociations: {
            primary: 'Water',
            secondary: 'Fire'
        }
    },
    {
        id: 12,
        name: 'Fixation',
        description: 'The stabilization of volatile substances, increasing Matter and Substance while decreasing Essence and Spirit',
        effects: {
            Spirit: -1,
            Essence: -1,
            Matter: 1,
            Substance: 1
        },
        planetaryAssociations: ['Saturn', 'Venus'],
        tarotAssociations: ['4 of Pentacles', 'King of Pentacles'],
        elementalAssociations: {
            primary: 'Earth',
            secondary: 'Air'
        }
    },
    {
        id: 13,
        name: 'Multiplication',
        description: 'The amplification of alchemical virtues, increasing Essence, Matter, and Spirit while decreasing Substance',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: 1,
            Substance: -1
        },
        planetaryAssociations: ['Jupiter', 'Sun', 'Uranus'],
        tarotAssociations: ['The Sun', '3 of Wands'],
        elementalAssociations: {
            primary: 'Fire',
            secondary: 'Water'
        }
    },
    {
        id: 14,
        name: 'Projection',
        description: 'The culminating transformation that protects and stabilizes, increasing all alchemical properties',
        effects: {
            Spirit: 1,
            Essence: 1,
            Matter: 1,
            Substance: 1
        },
        planetaryAssociations: ['Sun', 'Moon', 'Mercury', 'Jupiter'],
        tarotAssociations: ['The World', 'The Magician'],
        elementalAssociations: {
            primary: 'Fire',
            secondary: 'Earth'
        }
    }
];
/**
 * Maps cooking methods to their corresponding alchemical pillars
 */
export const COOKING_METHOD_PILLAR_MAPPING = {
    // Wet Cooking Methods
    'boiling': 1,
    'steaming': 3,
    'poaching': 1,
    'simmering': 1,
    'braising': 11,
    'stewing': 11,
    'sous_vide': 12,
    'pressure_cooking': 1,
    // Dry Cooking Methods
    'baking': 7,
    'roasting': 7,
    'broiling': 7,
    'grilling': 7,
    'frying': 7,
    'sauteing': 5,
    'stir-frying': 5,
    // Transformation Methods
    'fermenting': 11,
    'pickling': 11,
    'curing': 12,
    'smoking': 13,
    'drying': 3,
    'dehydrating': 3,
    // Modern/Molecular Methods
    'spherification': 6,
    'emulsification': 8,
    'gelification': 12,
    'foam': 3,
    'cryo_cooking': 10,
    // No-heat Methods
    'raw': 9,
    'ceviche': 1,
    'marinating': 4 // Distillation (flavor extraction)
};
/**
 * Define the thermodynamic properties for each element
 */
export const ELEMENTAL_THERMODYNAMIC_PROPERTIES = {
    'Fire': { heat: 0.8, entropy: 0.6, reactivity: 0.7 },
    'Air': { heat: 0.4, entropy: 0.7, reactivity: 0.6 },
    'Water': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
    'Earth': { heat: 0.2, entropy: 0.1, reactivity: 0.2 }
};
/**
 * Maps planets to their alchemical effects based on day/night status
 * Values represent the contribution to each alchemical property
 */
export const PLANETARY_ALCHEMICAL_EFFECTS = {
    'Sun': {
        diurnal: {},
        nocturnal: { Spirit: 0.8, Essence: 0.2, Matter: 0, Substance: 0 }
    },
    'Moon': {
        diurnal: {},
        nocturnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }
    },
    'Mercury': {
        diurnal: {},
        nocturnal: { Spirit: 0.3, Essence: 0, Matter: 0.3, Substance: 0.4 }
    },
    'Venus': {
        diurnal: {},
        nocturnal: { Spirit: 0, Essence: 0.4, Matter: 0.6, Substance: 0 }
    },
    'Mars': {
        diurnal: {},
        nocturnal: { Spirit: 0.2, Essence: 0.2, Matter: 0.6, Substance: 0 }
    },
    'Jupiter': {
        diurnal: {},
        nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0.4, Substance: 0 }
    },
    'Saturn': {
        diurnal: {},
        nocturnal: { Spirit: 0.2, Essence: 0, Matter: 0, Substance: 0.8 }
    },
    'Uranus': {
        diurnal: {},
        nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0, Substance: 0.4 }
    },
    'Neptune': {
        diurnal: {},
        nocturnal: { Spirit: 0, Essence: 0.5, Matter: 0, Substance: 0.5 }
    },
    'Pluto': {
        diurnal: {},
        nocturnal: { Spirit: 0, Essence: 0.3, Matter: 0.3, Substance: 0.4 }
    }
};
/**
 * Maps tarot suits to their alchemical property contributions
 */
export const TAROT_SUIT_ALCHEMICAL_MAPPING = {
    'Wands': { Spirit: 0.7, Essence: 0.2, Matter: 0, Substance: 0.1 },
    'Cups': { Spirit: 0.1, Essence: 0.7, Matter: 0.1, Substance: 0.1 },
    'Swords': { Spirit: 0.5, Essence: 0.1, Matter: 0.1, Substance: 0.3 },
    'Pentacles': { Spirit: 0, Essence: 0.2, Matter: 0.7, Substance: 0.1 }
};
/**
 * Get the alchemical pillar associated with a cooking method
 * @param cookingMethod The cooking method to map
 * @returns The corresponding alchemical pillar or undefined if not mapped
 */
export function getCookingMethodPillar(cookingMethod) {
    const pillerId = COOKING_METHOD_PILLAR_MAPPING[cookingMethod.toLowerCase()];
    if (!pillerId)
        return undefined;
    return ALCHEMICAL_PILLARS.find(pillar => pillar.id === pillerId);
}
/**
 * Calculate the alchemical effect of a cooking method
 * @param cookingMethod The cooking method
 * @returns The effect on alchemical properties or null if method not recognized
 */
export function getCookingMethodAlchemicalEffect(cookingMethod) {
    const pillar = getCookingMethodPillar(cookingMethod);
    if (!pillar)
        return null;
    return pillar.effects;
}
/**
 * Calculate the thermodynamic properties of a cooking method based on its elemental associations
 * @param cookingMethod The cooking method
 * @returns Thermodynamic properties (heat, entropy, reactivity) or null if method not recognized
 */
export function getCookingMethodThermodynamics(cookingMethod) {
    const pillar = getCookingMethodPillar(cookingMethod);
    if (!pillar || !pillar.elementalAssociations)
        return null;
    const _primaryElement = pillar.elementalAssociations.primary;
    const secondaryElement = pillar.elementalAssociations.secondary;
    const primaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[primaryElement];
    // If no secondary element, return primary properties
    if (!secondaryElement)
        return primaryProps;
    // If secondary element exists, blend properties (70% primary, 30% secondary)
    const secondaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[secondaryElement];
    return {
        heat: (primaryProps.heat * 0.7) + (secondaryProps.heat * 0.3),
        entropy: (primaryProps.entropy * 0.7) + (secondaryProps.entropy * 0.3),
        reactivity: (primaryProps.reactivity * 0.7) + (secondaryProps.reactivity * 0.3)
    };
}
/**
 * Calculate the alchemical effect of a planet based on day/night status
 * @param planet The planet name
 * @param isDaytime Whether it is day (true) or night (false)
 * @returns The alchemical effect of the planet
 */
export function getPlanetaryAlchemicalEffect(planet, _isDaytime = true) {
    const planetEffects = PLANETARY_ALCHEMICAL_EFFECTS[planet];
    if (!planetEffects)
        return null;
    return isDaytime ? planetEffects.diurnal : planetEffects.nocturnal;
}
/**
 * Get the alchemical effect of a tarot card based on its suit
 * @param cardName The full name of the tarot card (e.g., "10 of Cups")
 * @returns The alchemical effect of the tarot card or null if not recognized
 */
export function getTarotCardAlchemicalEffect(cardName) {
    // Extract the suit from the card name
    const suitMatch = cardName.match(/of\s+(\w+)/i);
    if (!suitMatch)
        return null;
    const suit = suitMatch[1];
    return TAROT_SUIT_ALCHEMICAL_MAPPING[suit] || null;
}
/**
 * Calculate Monica constant for an alchemical pillar
 * Formula: M = -Greg's Energy / (Reactivity × ln(Kalchm))
 */
function calculatePillarMonica(gregsEnergy, reactivity, kalchm) {
    if (kalchm <= 0 || reactivity === 0)
        return NaN;
    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0)
        return NaN;
    return -gregsEnergy / (reactivity * lnKalchm);
}
/**
 * Calculate Kalchm for an alchemical pillar based on its effects
 * Formula: K_alchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
 */
function calculatePillarKalchm(effects) {
    // Convert effects to positive values for calculation (add 2 to shift range from [-1,1] to [1,3])
    const Spirit = Math.max(0.1, effects.Spirit + 2);
    const Essence = Math.max(0.1, effects.Essence + 2);
    const Matter = Math.max(0.1, effects.Matter + 2);
    const Substance = Math.max(0.1, effects.Substance + 2);
    const numerator = Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence);
    const denominator = Math.pow(Matter, Matter) * Math.pow(Substance, Substance);
    return numerator / denominator;
}
/**
 * Calculate Greg's Energy for an alchemical pillar
 * Formula: Greg's Energy = Heat - (Entropy × Reactivity)
 */
function calculatePillarGregsEnergy(heat, entropy, reactivity) {
    return heat - (entropy * reactivity);
}
/**
 * Calculate enhanced properties for an alchemical pillar
 */
export function enhanceAlchemicalPillar(pillar) {
    // Get thermodynamic properties from elemental associations
    const thermodynamics = getCookingMethodThermodynamics(pillar.name.toLowerCase()) || {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5
    };
    // Calculate Kalchm from pillar effects
    const kalchm = calculatePillarKalchm(pillar.effects);
    // Calculate Greg's Energy
    const gregsEnergy = calculatePillarGregsEnergy(thermodynamics.heat, thermodynamics.entropy, thermodynamics.reactivity);
    // Calculate Monica constant
    const monicaConstant = calculatePillarMonica(gregsEnergy, thermodynamics.reactivity, kalchm);
    // Determine Monica classification
    const monicaClassification = determinePillarMonicaClassification(monicaConstant, kalchm);
    // Calculate Monica modifiers
    const monicaModifiers = calculatePillarMonicaModifiers(monicaConstant);
    return {
        ...pillar,
        monicaProperties: {
            kalchm,
            gregsEnergy,
            monicaConstant: isNaN(monicaConstant) ? 0 : monicaConstant,
            thermodynamicProfile: thermodynamics,
            monicaClassification,
            monicaModifiers
        }
    };
}

/**
 * Determine Monica classification for a pillar
 */
function determinePillarMonicaClassification(monica, kalchm) {
    if (isNaN(monica)) {
        return kalchm > 1.0 ? 'Spirit-Dominant Pillar' : 'Matter-Dominant Pillar';
    }
    if (Math.abs(monica) > 2.0)
        return 'Highly Volatile Pillar';
    if (Math.abs(monica) > 1.0)
        return 'Transformative Pillar';
    if (Math.abs(monica) > 0.5)
        return 'Balanced Pillar';
    return 'Stable Pillar';
}
/**
 * Calculate Monica modifiers for a pillar
 */
function calculatePillarMonicaModifiers(monica) {
    if (isNaN(monica)) {
        return {
            temperatureAdjustment: 0,
            timingAdjustment: 0,
            intensityModifier: 'neutral'
        };
    }
    return {
        temperatureAdjustment: Math.round(monica * 15),
        timingAdjustment: Math.round(monica * 10),
        intensityModifier: monica > 0.1 ? 'increase' : monica < -0.1 ? 'decrease' : 'maintain'
    };
}
/**
 * Create enhanced cooking method with Monica constants from alchemical pillars
 */
export function createEnhancedCookingMethod(cookingMethodName) {
    // Get the alchemical pillar for this cooking method
    const pillar = getCookingMethodPillar(cookingMethodName);
    if (!pillar)
        return null;
    // Enhance the pillar with Monica properties
    const enhancedPillar = enhanceAlchemicalPillar(pillar);
    if (!enhancedPillar.monicaProperties)
        return null;
    // Calculate optimal conditions based on Monica constant
    const optimalConditions = calculateOptimalCookingConditions(enhancedPillar.monicaProperties.monicaConstant, enhancedPillar.monicaProperties.thermodynamicProfile);
    return {
        name: cookingMethodName,
        alchemicalPillar: enhancedPillar,
        monicaConstant: enhancedPillar.monicaProperties.monicaConstant,
        monicaModifiers: {
            ...enhancedPillar.monicaProperties.monicaModifiers,
            planetaryAlignment: calculatePlanetaryAlignment(enhancedPillar),
            lunarPhaseBonus: calculateLunarPhaseBonus(enhancedPillar)
        },
        kalchm: enhancedPillar.monicaProperties.kalchm,
        thermodynamicProfile: {
            ...enhancedPillar.monicaProperties.thermodynamicProfile,
            gregsEnergy: enhancedPillar.monicaProperties.gregsEnergy
        },
        monicaClassification: enhancedPillar.monicaProperties.monicaClassification,
        optimalConditions
    };
}

/**
 * Calculate optimal cooking conditions based on Monica constant
 */
function calculateOptimalCookingConditions(monica, thermodynamics) {
    // Base temperature (350°F) adjusted by Monica and thermodynamics
    const baseTemp = 350;
    const monicaAdjustment = isNaN(monica) ? 0 : monica * 15;
    const thermodynamicAdjustment = (thermodynamics.heat - 0.5) * 50;
    const temperature = Math.round(baseTemp + monicaAdjustment + thermodynamicAdjustment);
    // Timing based on Monica and entropy
    let timing = 'medium';
    if (!isNaN(monica)) {
        if (monica > 0.5 && thermodynamics.entropy < 0.4)
            timing = 'quick';
        else if (monica < -0.5 && thermodynamics.entropy > 0.6)
            timing = 'slow';
        else if (Math.abs(monica) < 0.2)
            timing = 'steady';
    }
    // Planetary hours based on thermodynamic dominance
    const planetaryHours = [];
    if (thermodynamics.heat > 0.6)
        planetaryHours.push('Sun', 'Mars');
    if (thermodynamics.reactivity > 0.6)
        planetaryHours.push('Mercury', 'Uranus');
    if (thermodynamics.entropy > 0.6)
        planetaryHours.push('Neptune', 'Pluto');
    if (planetaryHours.length === 0)
        planetaryHours.push('Jupiter'); // Default
    // Lunar phases based on Monica classification
    const lunarPhases = [];
    if (!isNaN(monica)) {
        if (monica > 0.5)
            lunarPhases.push('waxing_gibbous', 'full_moon');
        else if (monica < -0.5)
            lunarPhases.push('waning_crescent', 'new_moon');
        else
            lunarPhases.push('first_quarter', 'third_quarter');
    }
    else {
        lunarPhases.push('all'); // Stable for all phases
    }
    return {
        temperature,
        timing,
        planetaryHours,
        lunarPhases
    };
}
/**
 * Calculate planetary alignment bonus for enhanced pillar
 */
function calculatePlanetaryAlignment(enhancedPillar) {
    if (!enhancedPillar.planetaryAssociations || !enhancedPillar.monicaProperties) {
        return 0;
    }
    // Base alignment from number of planetary associations
    const baseAlignment = enhancedPillar.planetaryAssociations.length * 0.1;
    // Monica modifier
    const monicaModifier = isNaN(enhancedPillar.monicaProperties.monicaConstant)
        ? 0
        : Math.abs(enhancedPillar.monicaProperties.monicaConstant) * 0.05;
    return Math.min(1.0, baseAlignment + monicaModifier);
}
/**
 * Calculate lunar phase bonus for enhanced pillar
 */
function calculateLunarPhaseBonus(enhancedPillar) {
    if (!enhancedPillar.monicaProperties)
        return 0;
    const monica = enhancedPillar.monicaProperties.monicaConstant;
    if (isNaN(monica))
        return 0.5; // Neutral bonus for stable pillars
    // Higher Monica = more lunar sensitivity
    return Math.min(1.0, Math.abs(monica) * 0.3 + 0.2);
}
/**
 * Get all enhanced cooking methods with Monica constants
 */
export function getAllEnhancedCookingMethods() {
    const enhancedMethods = {};
    for (const [methodName] of Object.entries(COOKING_METHOD_PILLAR_MAPPING)) {
        const enhanced = createEnhancedCookingMethod(methodName);
        if (enhanced) {
            enhancedMethods[methodName] = enhanced;
        }
    }
    return enhancedMethods;
}

/**
 * Find cooking methods by Monica constant range
 */
export function findCookingMethodsByMonicaRange(minMonica, maxMonica) {
    const allMethods = getAllEnhancedCookingMethods();
    return Object.values(allMethods).filter(method => {
        const monica = method.monicaConstant;
        if (isNaN(monica))
            return false;
        return monica >= minMonica && monica <= maxMonica;
    });
}

/**
 * Get cooking method recommendations based on Monica compatibility
 */
export function getMonicaCompatibleCookingMethods(targetMonica, tolerance = 0.5) {
    if (isNaN(targetMonica))
        return [];
    return findCookingMethodsByMonicaRange(targetMonica - tolerance, targetMonica + tolerance).sort((a, b) => {
        const diffA = Math.abs(a.monicaConstant - targetMonica);
        const diffB = Math.abs(b.monicaConstant - targetMonica);
        return diffA - diffB;
    });
}

