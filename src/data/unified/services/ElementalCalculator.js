"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementalCalculator = void 0;
const elementalUtils_1 = require("../utils/elementalUtils");
const elementalCore_1 = require("../constants/elementalCore");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('ElementalCalculator');
class ElementalCalculator {
    constructor(debugMode = false) {
        this.currentBalance = elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES;
        this.initialized = false;
        this.debugMode = debugMode;
        if (this.debugMode) {
            console.log("[ElementalCalculator] Instance created with debug mode");
        }
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!ElementalCalculator.instance) {
            ElementalCalculator.instance = new ElementalCalculator();
        }
        return ElementalCalculator.instance;
    }
    /**
     * Create a new instance (helper method for when singleton is not needed)
     */
    static createInstance(debugMode = false) {
        return new ElementalCalculator(debugMode);
    }
    static initialize(initialState) {
        const instance = ElementalCalculator.getInstance();
        instance.currentBalance = initialState || {
            ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES,
        };
        instance.initialized = true;
        logger.debug('ElementalCalculator initialized with', instance.currentBalance);
    }
    static updateElementalState(newState) {
        const instance = ElementalCalculator.getInstance();
        instance.currentBalance = { ...newState };
        logger.debug('ElementalCalculator state updated', instance.currentBalance);
    }
    static getCurrentElementalState() {
        const instance = ElementalCalculator.getInstance();
        if (!instance.initialized) {
            // Only use direct initialization without the dynamic import of useAlchemical
            // which causes "Invalid hook call" errors in tests
            ElementalCalculator.initialize();
            // In a browser, the AlchemicalContext provider will call updateElementalState
            // so we don't need to worry about initializing with the correct state here
        }
        return instance.currentBalance;
    }
    static calculateMatchScore(item) {
        if (!item.elementalProperties) {
            return 0;
        }
        const currentBalance = ElementalCalculator.getCurrentElementalState();
        // Use the more robust weighted calculation instead of simplified approach
        let matchScore = 0;
        let totalWeight = 0;
        Object.entries(currentBalance).forEach(([element, value]) => {
            const elementKey = element;
            // Use optional chaining with nullish coalescing to handle undefined values
            const itemValue = (item.elementalProperties && item.elementalProperties[elementKey]) || 0;
            // Calculate weighted difference (more important elements get higher weight)
            const weight = value * 2; // Emphasize elements that are strong in current state
            matchScore += (1 - Math.abs(value - itemValue)) * weight;
            totalWeight += weight;
        });
        // Normalize to 0-100 range
        return Math.round(totalWeight > 0 ? (matchScore / totalWeight) * 100 : 50);
    }
    static getSeasonalModifiers(season) {
        // Start with a balanced base
        const baseModifiers = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25,
        };
        // Normalize season to lowercase for consistency with type definition
        const seasonLower = season.toLowerCase();
        switch (seasonLower) {
            case 'spring':
                baseModifiers.Air = 0.4;
                baseModifiers.Fire = 0.3;
                baseModifiers.Water = 0.2;
                baseModifiers.Earth = 0.1;
                break;
            case 'summer':
                baseModifiers.Fire = 0.4;
                baseModifiers.Air = 0.3;
                baseModifiers.Earth = 0.2;
                baseModifiers.Water = 0.1;
                break;
            case 'autumn':
            case 'fall':
                baseModifiers.Earth = 0.4;
                baseModifiers.Air = 0.3;
                baseModifiers.Water = 0.2;
                baseModifiers.Fire = 0.1;
                break;
            case 'winter':
                baseModifiers.Water = 0.4;
                baseModifiers.Earth = 0.3;
                baseModifiers.Fire = 0.2;
                baseModifiers.Air = 0.1;
                break;
            case 'all':
                // Balanced for 'all' season
                baseModifiers.Fire = 0.25;
                baseModifiers.Water = 0.25;
                baseModifiers.Earth = 0.25;
                baseModifiers.Air = 0.25;
                break;
            default:
                // Balanced for unknown seasons
                baseModifiers.Fire = 0.25;
                baseModifiers.Water = 0.25;
                baseModifiers.Earth = 0.25;
                baseModifiers.Air = 0.25;
        }
        return baseModifiers;
    }
    calculateElementalState(positions) {
        const elementalValues = { Fire: 0, Water: 0, Earth: 0, Air: 0,
        };
        this.processPlanetsObjectInternal(positions.planets, elementalValues);
        this.processCelestialBodiesInternal(positions.CelestialBodies, elementalValues);
        this.processPlanetKeysInternal(positions, elementalValues);
        // Check if tropical.CelestialBodies exists and process it
        if (positions.tropical && positions.tropical.CelestialBodies) {
            this.processCelestialBodiesInternal(positions.tropical.CelestialBodies, elementalValues);
        }
        // Normalize values to sum to 1.0
        const total = Object.values(elementalValues).reduce((a, b) => a + b, 0);
        if (total > 0) {
            Object.keys(elementalValues).forEach(key => {
                const elementKey = key;
                elementalValues[elementKey] = elementalValues[elementKey] / total;
            });
        }
        else {
            // Default distribution if no values were calculated
            elementalValues.Fire = 0.25;
            elementalValues.Water = 0.25;
            elementalValues.Earth = 0.25;
            elementalValues.Air = 0.25;
        }
        return elementalValues;
    }
    calculatePlanetaryElementalState(positions) {
        return this.calculateElementalState(positions);
    }
    processPlanetsObjectInternal(planets, elementalValues) {
        if (!planets)
            return;
        // Handle array format
        if (Array.isArray(planets)) {
            planets.forEach(planet => {
                this.processPlanetData(planet, elementalValues);
            });
        }
        // Handle object format
        else if (typeof planets === 'object') {
            Object.entries(planets).forEach(([key, planetData]) => {
                if (typeof planetData === 'object' && planetData !== null) {
                    this.processPlanetData(planetData, elementalValues);
                }
            });
        }
    }
    processCelestialBodiesInternal(bodies, elementalValues) {
        if (!bodies)
            return;
        // Process 'all' array if it exists
        if (bodies.all && Array.isArray(bodies.all)) {
            bodies.all.forEach(body => {
                this.processPlanetData(body, elementalValues);
            });
        }
        // Process individual planet entries
        Object.entries(bodies).forEach(([key, value]) => {
            // Skip 'all' since we already processed it
            if (key === 'all')
                return;
            if (typeof value === 'object' && value !== null) {
                // Check if it's Ascendant data
                if (key.toLowerCase() === 'ascendant' || key.toLowerCase() === 'asc') {
                    this.processAscendantData(value, elementalValues);
                }
                else {
                    this.processPlanetData(value, elementalValues);
                }
            }
        });
    }
    processPlanetKeysInternal(data, elementalValues) {
        // List of common planet names to look for
        const planetNames = [
            'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
            'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
            'ascendant', 'asc', 'mc', 'midheaven'
        ];
        this.findPlanetsRecursively(data, planetNames, elementalValues);
    }
    processPlanetData(planet, elementalValues) {
        if (!planet || !planet.sign) {
            if (this.debugMode) {
                console.log("[ElementalCalculator] Skipping planet with no sign: ", planet);
            }
            return;
        }
        // Extract the sign from the planet data
        const sign = planet.sign;
        const element = this.getSignElement(sign);
        if (!element) {
            if (this.debugMode) {
                console.log(`[ElementalCalculator] Unknown element for sign: ${sign}`);
            }
            return;
        }
        // Determine planetary weight based on planet name
        let weight = 1.0;
        if (planet.name) {
            weight = this.getPlanetWeight(planet.name);
        }
        // Add to the elemental value based on element and weight
        elementalValues[element] += weight;
        if (this.debugMode) {
            console.log(`[ElementalCalculator] Processed planet ${planet.name} in sign ${sign} (${element}) with weight ${weight}`);
        }
    }
    processAscendantData(Ascendant, elementalValues) {
        if (!Ascendant)
            return;
        // Get the ascendant's sign
        const sign = typeof Ascendant === 'string' ?
            ascendant :
            (Ascendant.sign || Ascendant.Sign || '');
        if (!sign) {
            if (this.debugMode)
                console.log(`[ElementalCalculator] No sign found for ascendant:`, Ascendant);
            return;
        }
        // Get the element associated with the sign
        const element = this.getSignElement(sign.toString());
        if (!element) {
            if (this.debugMode)
                console.log(`[ElementalCalculator] No element found for Ascendant sign: ${sign}`);
            return;
        }
        // Ascendant has a fixed weight
        const weight = 0.75; // Ascendant is weighted less than Sun/Moon but more than other planets
        // Add to the appropriate element
        const elementKey = element;
        elementalValues[elementKey] += weight;
        if (this.debugMode) {
            console.log(`[ElementalCalculator] Processed Ascendant in sign ${sign} (${element}), weight: ${weight}`);
        }
    }
    /**
     * Get the elemental association of a zodiac sign
     */
    getSignElement(sign) {
        // Normalize sign to lowercase for case-insensitive comparison
        const signLower = sign.toLowerCase();
        // Map signs to elements using a standardized approach
        if (['aries', 'leo', 'sagittarius'].includes(signLower)) {
            return 'Fire';
        }
        else if (['taurus', 'virgo', 'capricorn'].includes(signLower)) {
            return 'Earth';
        }
        else if (['gemini', 'libra', 'aquarius'].includes(signLower)) {
            return 'Air';
        }
        else if (['cancer', 'scorpio', 'pisces'].includes(signLower)) {
            return 'Water';
        }
        // If sign is not recognized, return null
        return null;
    }
    /**
     * Get the weight of planetary influence
     */
    getPlanetWeight(planet) {
        const lowerPlanet = planet.toLowerCase();
        // Luminaries have strongest influence
        if (lowerPlanet.includes('Sun') || lowerPlanet.includes('Moon')) {
            return 1.0;
        }
        // Personal planets have significant influence
        if (lowerPlanet.includes('Mercury') ||
            lowerPlanet.includes('Venus') ||
            lowerPlanet.includes('Mars')) {
            return 0.8;
        }
        // Social planets have moderate influence
        if (lowerPlanet.includes('Jupiter') || lowerPlanet.includes('Saturn')) {
            return 0.6;
        }
        // Outer planets have subtle influence
        if (lowerPlanet.includes('Uranus') ||
            lowerPlanet.includes('Neptune') ||
            lowerPlanet.includes('Pluto')) {
            return 0.4;
        }
        // Default weight for unknown planets
        return 0.3;
    }
    static validateElementalProperties(properties) {
        if (!properties)
            return false;
        const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
        const hasAllElements = requiredElements.every((element) => typeof properties[element] === 'number');
        if (!hasAllElements)
            return false;
        const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
        return Math.abs(sum - 1) < 0.01;
    }
    // This method is for public use
    static calculateIngredientMatch(ingredient) {
        if (!ingredient || typeof ingredient !== 'object' || !('elementalProperties' in ingredient)) {
            return 0; // No match if ingredient has no elemental properties
        }
        const elementalProps = ingredient.elementalProperties;
        if (!elementalProps)
            return 0;
        const currentBalance = ElementalCalculator.getCurrentElementalState();
        // Use the more robust weighted calculation instead of simplified approach
        let matchScore = 0;
        let totalWeight = 0;
        Object.entries(currentBalance).forEach(([element, value]) => {
            const elementKey = element;
            // Use optional chaining with nullish coalescing to handle undefined values
            const itemValue = elementalProps[elementKey] || 0;
            // Calculate weighted difference (more important elements get higher weight)
            const weight = value * 2; // Emphasize elements that are strong in current state
            matchScore += (1 - Math.abs(value - itemValue)) * weight;
            totalWeight += weight;
        });
        // Normalize to 0-100 range
        return Math.round(totalWeight > 0 ? (matchScore / totalWeight) * 100 : 50);
    }
    static calculateElementalBalance(elementalProperties) {
        // Use actual current elemental state for comparison
        const currentState = ElementalCalculator.getCurrentElementalState();
        // Calculate similarity between ingredient and current state
        let totalSimilarity = 0;
        let count = 0;
        // Use all four elements for calculation
        ['Fire', 'Water', 'Earth', 'Air'].forEach((element) => {
            const elementKey = element;
            const currentValue = currentState[elementKey] || 0;
            const ingredientValue = elementalProperties[elementKey] || 0;
            // Calculate similarity (1 - difference)
            const similarity = 1 - Math.abs(currentValue - ingredientValue);
            totalSimilarity += similarity;
            count++;
        });
        // Return average similarity as percentage
        return count > 0 ? (totalSimilarity / count) * 100 : 50;
    }
    calculateElementalTotals(properties) {
        return {
            totalfire: properties.Fire,
            totalwater: properties.Water,
            totalearth: properties.Earth,
            totalAir: properties.Air,
            dominantElement: this.getDominantElement(properties),
        };
    }
    static getSeasonFromZodiacSign(sign) {
        // Map zodiac signs to seasons
        const zodiacSeasons = {
            aries: 'spring',
            taurus: 'spring',
            gemini: 'spring',
            cancer: 'summer',
            leo: 'summer',
            virgo: 'summer',
            libra: 'autumn',
            scorpio: 'autumn',
            sagittarius: 'autumn',
            capricorn: 'winter',
            aquarius: 'winter',
            pisces: 'winter',
        };
        return zodiacSeasons[sign] || 'all';
    }
    // Method to get seasonal modifiers based on zodiac sign
    static getZodiacSeasonalModifiers(sign) {
        const season = ElementalCalculator.getSeasonFromZodiacSign(sign);
        return ElementalCalculator.getSeasonalModifiers(season);
    }
    static getZodiacElementalInfluence(sign) {
        // Base seasonal influence
        const seasonalModifiers = ElementalCalculator.getZodiacSeasonalModifiers(sign);
        // Specific zodiac sign adjustments
        const zodiacModifiers = {
            aries: { Fire: 0.2 },
            taurus: { Earth: 0.2 },
            gemini: { Air: 0.2 },
            cancer: { Water: 0.2 },
            leo: { Fire: 0.2 },
            virgo: { Earth: 0.2 },
            libra: { Air: 0.2 },
            scorpio: { Water: 0.2 },
            sagittarius: { Fire: 0.2 },
            capricorn: { Earth: 0.2 },
            aquarius: { Air: 0.2 },
            pisces: { Water: 0.2 }, // Extra water boost for pisces
        };
        // Apply specific zodiac adjustments
        const specificAdjustments = zodiacModifiers[sign] || {};
        // Combine seasonal modifiers with specific zodiac adjustments
        const result = { ...seasonalModifiers };
        Object.entries(specificAdjustments).forEach(([element, value]) => {
            // Use nullish coalescing to ensure value is never undefined
            result[element] += value || 0;
        });
        // Normalize to ensure values stay in valid range
        return (0, elementalUtils_1.normalizeProperties)(result);
    }
    static combineElementalProperties(properties) {
        const result = { Fire: 0, Water: 0, Earth: 0, Air: 0,
        };
        if (properties.length === 0) {
            return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25,
            };
        }
        // Sum up all properties
        properties.forEach((prop) => {
            Object.entries(prop).forEach(([element, value]) => {
                // Use nullish coalescing to handle undefined values
                const elementKey = element;
                result[elementKey] += value || 0;
            });
        });
        // Normalize to ensure they sum to 1
        const total = Object.values(result).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
            Object.keys(result).forEach((element) => {
                const elementKey = element;
                result[elementKey] = result[elementKey] / total;
            });
        }
        else {
            // Default to equal distribution if total is 0
            Object.keys(result).forEach((element) => {
                const elementKey = element;
                result[elementKey] = 0.25;
            });
        }
        return result;
    }
    getDominantElement(elementalProperties) {
        // Find the element with the highest value
        let maxElement = 'Fire';
        let maxValue = elementalProperties.Fire;
        if (elementalProperties.Water > maxValue) {
            maxElement = 'Water';
            maxValue = elementalProperties.Water;
        }
        if (elementalProperties.Earth > maxValue) {
            maxElement = 'Earth';
            maxValue = elementalProperties.Earth;
        }
        if (elementalProperties.Air > maxValue) {
            maxElement = 'Air';
            maxValue = elementalProperties.Air;
        }
        return maxElement;
    }
    findPlanetsRecursively(obj, planetNames, elementalValues, depth = 0) {
        if (!obj || typeof obj !== 'object' || depth > 5)
            return; // Limit recursion depth
        // Check if this object looks like a planet
        if (this.objectLooksPlanetLike(obj, planetNames)) {
            this.processPlanetData(obj, elementalValues);
            return;
        }
        // Search through all properties
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                // If key name matches a planet, augment with that name
                const isPlanetKey = planetNames.find(p => p.toLowerCase() === key.toLowerCase());
                if (isPlanetKey && obj[key]) {
                    // Add planet name to object if not already present
                    const planetObj = {
                        ...obj[key],
                        name: isPlanetKey,
                        label: isPlanetKey
                    };
                    this.processPlanetData(planetObj, elementalValues);
                }
                else {
                    this.findPlanetsRecursively(obj[key], planetNames, elementalValues, depth + 1);
                }
            }
        }
    }
    objectLooksPlanetLike(obj, planetNames) {
        // Check if this object has properties that would indicate it's a planet
        if (!obj)
            return false;
        // If it has a name property that matches a planet name
        if ('name' in obj && typeof obj.name === 'string' &&
            planetNames.some(p => p.toLowerCase() === obj.name?.toString().toLowerCase())) {
            return true;
        }
        // If it has a sign property (indicating it might be a celestial body)
        if ('sign' in obj || 'Sign' in obj) {
            return true;
        }
        return false;
    }
}
exports.ElementalCalculator = ElementalCalculator;
exports.default = ElementalCalculator;
