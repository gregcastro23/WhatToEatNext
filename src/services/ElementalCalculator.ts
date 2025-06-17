import {
  ElementalProperties,
  Recipe,
  Season,
  Element,
  Ingredient,
  ZodiacSign,
  AstrologicalState,
} from '../types/alchemy';
import { normalizeProperties } from '../utils/elementalUtils';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '../constants/elementalConstants';
import { createLogger } from '@/utils/logger';
import { planetInfo, signInfo, signs } from '../data/astrology';

interface ElementalSummary {
  totalFire: number;
  totalWater: number;
  totalEarth: number;
  totalAir: number;
  dominantElement: keyof ElementalProperties;
}

let logger = createLogger('ElementalCalculator');

export class ElementalCalculator {
  private static instance: ElementalCalculator;
  private currentBalance: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;
  private initialized = false;
  private debugMode: boolean;

  public constructor(debugMode = false) {
    this.debugMode = debugMode;
    
    if (this.debugMode) {
      console.log("[ElementalCalculator] Instance created with debug mode");
    }
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): ElementalCalculator {
    if (!ElementalCalculator.instance) {
      ElementalCalculator.instance = new ElementalCalculator();
    }
    return ElementalCalculator.instance;
  }

  /**
   * Create a new instance (helper method for when singleton is not needed)
   */
  static createInstance(debugMode = false): ElementalCalculator {
    return new ElementalCalculator(debugMode);
  }

  static initialize(initialState?: ElementalProperties): void {
    let instance = ElementalCalculator.getInstance();
    instance.currentBalance = initialState || {
      ...DEFAULT_ELEMENTAL_PROPERTIES,
    };
    instance.initialized = true;
    logger.debug(
      'ElementalCalculator initialized with',
      instance.currentBalance
    );
  }

  static updateElementalState(newState: ElementalProperties): void {
    let instance = ElementalCalculator.getInstance();
    instance.currentBalance = { ...newState };
    logger.debug('ElementalCalculator state updated', instance.currentBalance);
  }

  static getCurrentElementalState(): ElementalProperties {
    let instance = ElementalCalculator.getInstance();
    if (!instance.initialized) {
      // Only use direct initialization without the dynamic import of useAlchemical
      // which causes "Invalid hook call" errors in tests
      ElementalCalculator.initialize();

      // In a browser, the AlchemicalContext provider will call updateElementalState
      // so we don't need to worry about initializing with the correct state here
    }
    return instance.currentBalance;
  }

  static calculateMatchScore(
    item: Recipe | { elementalProperties: ElementalProperties | undefined }
  ): number {
    if (!item.elementalProperties) {
      return 0;
    }

    let currentBalance = ElementalCalculator.getCurrentElementalState();

    // Use the more robust weighted calculation instead of simplified approach
    let matchScore = 0;
    let totalWeight = 0;

    Object.entries(currentBalance).forEach(([element, value]) => {
      let elementKey = element as keyof ElementalProperties;
      // Use optional chaining with nullish coalescing to handle undefined values
      let itemValue =
        (item.elementalProperties && item.elementalProperties[elementKey]) || 0;

      // Calculate weighted difference (more important elements get higher weight)
      let weight = value * 2; // Emphasize elements that are strong in current state
      matchScore += (1 - Math.abs(value - itemValue)) * weight;
      totalWeight += weight;
    });

    // Normalize to 0-100 range
    return Math.round(totalWeight > 0 ? (matchScore /totalWeight) * 100 : 50);
  }

  static getSeasonalModifiers(season: Season): ElementalProperties {
    // Start with a balanced base
    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };

    // Normalize season to lowercase for consistency with type definition
    let seasonLower = season.toLowerCase() as Season;

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

  calculateElementalState(positions: any): {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  } {
    if (this.debugMode) {
      console.log("[ElementalCalculator] Calculating elemental state from: ", positions);
    }

    // Initialize elemental values
    const elementalValues: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    };

    // Handle empty or invalid positions
    if (!positions || typeof positions !== 'object') {
      if (this.debugMode) {
        console.log("[ElementalCalculator] No elemental data calculated, returning default values");
      }
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }

    // Try to extract planet positions directly if they exist
    try {
      if (this.debugMode) {
        console.log("[ElementalCalculator] Trying to extract planets from general structure");
      }

      // Handle different API response formats
      let hasPlanets = 'planets' in positions;
      let hasCelestialBodies = 'CelestialBodies' in positions;
      let hasTropical = 'tropical' in positions;

      // Process planets if available in various formats
      if (hasPlanets) {
        // Direct planets object
        this.processPlanetsObject(positions.planets, elementalValues);
      } else if (hasCelestialBodies) {
        // Celestial bodies from API
        this.processCelestialBodies(positions.CelestialBodies, elementalValues);
      } else if (hasTropical && positions.tropical?.CelestialBodies) {
        // Nested within tropical
        this.processCelestialBodies(positions.tropical.CelestialBodies, elementalValues);
      } else {
        // Try to process as generic structure
        this.processPlanetKeys(positions, elementalValues);
      }

      // Normalize values
      let total = Object.values(elementalValues).reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        Object.keys(elementalValues).forEach((element) => {
          let elementKey = element as keyof ElementalProperties;
          elementalValues[elementKey] = elementalValues[elementKey] /total;
        });
      } else {
        // Return default values if we couldn't calculate anything
        if (this.debugMode) {
          console.log("[ElementalCalculator] No elemental data calculated, returning default values");
        }
        return { ...DEFAULT_ELEMENTAL_PROPERTIES };
      }

      return elementalValues;
    } catch (error) {
      console.error("[ElementalCalculator] Error calculating elemental state:", error);
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }
  }

  // Fix method naming conflict - rename the second implementation to avoid duplicate method name
  calculatePlanetaryElementalState(positions: any): ElementalProperties {
    return this.calculateElementalState(positions);
  }

  // Add methods to process different types of planetary position data
  private processPlanetsObject(planets: any, elementalValues: ElementalProperties): void {
    if (!planets) return;
    if (!planets) return;
    
    // Handle both array and object formats of planets
    if (Array.isArray(planets)) {
      planets.forEach(planet => {
        if (planet) this.processPlanetData(planet, elementalValues);
      });
    } else if (typeof planets === 'object') {
      // Process object format where keys are planet names
      Object.entries(planets).forEach(([name, data]) => {
        if (data) {
          let planetData = { ...data as any, name, label: name };
          this.processPlanetData(planetData, elementalValues);
        }
      });
    }
  }

  private processCelestialBodies(bodies: any, elementalValues: ElementalProperties): void {
    if (!bodies) return;
    if (!bodies) return;
    
    // Handle CelestialBodies format from API
    if (Array.isArray(bodies.all)) {
      bodies.all.forEach((body: any) => {
        if (body) this.processPlanetData(body, elementalValues);
      });
    } else {
      // Handle individual planet objects
      let planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 
                          'saturn', 'uranus', 'neptune', 'pluto'];
      
      planetNames.forEach(planetName => {
        if (bodies[planetName]) {
          let planet = bodies[planetName];
          // Add name and label if not present
          let enhancedPlanet = {
            ...planet,
            name: planetName,
            label: planetName
          };
          this.processPlanetData(enhancedPlanet, elementalValues);
        }
      });

      // Process ascendant if available
      if (bodies.ascendant || bodies.Ascendant) {
        let ascendant = bodies.ascendant || bodies.Ascendant;
        this.processAscendantData(ascendant, elementalValues);
      }
    }
  }

  private processPlanetKeys(data: any, elementalValues: ElementalProperties): void {
    if (!data) return;
    if (!data) return;
    
    // Try to find planets in a generic object structure
    let planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 
                        'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    // Look for objects that might represent planets
    this.findPlanetsRecursively(data, planetNames, elementalValues);
    
    // Also look for ascendant
    if (data.Ascendant || data.ascendant) {
      this.processAscendantData(data.Ascendant || data.ascendant, elementalValues);
    }
  }

  private findPlanetsRecursively(obj: any, planetNames: string[], elementalValues: ElementalProperties, depth = 0): void {
    if (!obj || typeof obj !== 'object' || depth > 5) return; // Limit recursion depth
    
    // Check if this object looks like a planet
    if (this.objectLooksPlanetLike(obj, planetNames)) {
      this.processPlanetData(obj, elementalValues);
      return;
    }
    
    // Search through all properties
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        // If key name matches a planet, augment with that name
        let isPlanetKey = planetNames.find(p => 
          p.toLowerCase() === key.toLowerCase()
        );
        
        if (isPlanetKey && obj[key]) {
          // Add planet name to object if not already present
          let planetObj = {
            ...obj[key],
            name: isPlanetKey,
            label: isPlanetKey
          };
          this.processPlanetData(planetObj, elementalValues);
        } else {
          this.findPlanetsRecursively(obj[key], planetNames, elementalValues, depth + 1);
        }
      }
    }
  }

  private objectLooksPlanetLike(obj: any, planetNames: string[]): boolean {
    // Check for typical planet properties
    if (!obj) return false;
    
    // Has sign property directly
    if (obj.sign || obj.Sign) return true;
    
    // Has a name or label that matches a planet name
    if (obj.name && planetNames.includes(obj.name)) return true;
    if (obj.label && planetNames.includes(obj.label)) return true;
    
    return false;
  }

  private processPlanetData(planet: any, elementalValues: ElementalProperties): void {
    if (!planet) return;
    
    try {
      // Extract planet info
      let planetName = planet.name || planet.label || planet.planet || '';
      let sign = planet.Sign?.label || planet.sign || '';
      
      if (!planetName || !sign) return;
      
      // Get element from sign
      let signElement = this.getSignElement(sign);
      if (signElement) {
        // Weight by planet importance
        let weight = this.getPlanetWeight(planetName);
        
        // Add to appropriate element
        switch (signElement) {
          case 'Fire': elementalValues.Fire += weight; break;
          case 'Water': elementalValues.Water += weight; break;
          case 'Earth': elementalValues.Earth += weight; break;
          case 'Air': elementalValues.Air += weight; break;
        }
      }
    } catch (error) {
      console.error("[ElementalCalculator] Error processing planet data:", error);
    }
  }

  private processAscendantData(ascendant: any, elementalValues: ElementalProperties): void {
    try {
      let ascendantSign = typeof ascendant === 'string' 
        ? ascendant 
        : ascendant?.Sign?.label || ascendant.sign || '';
      
      if (ascendantSign) {
        let ascendantElement = this.getSignElement(ascendantSign);
        if (ascendantElement) {
          let weight = 0.75; // Ascendant has significant influence
          
          switch (ascendantElement) {
            case 'Fire': elementalValues.Fire += weight; break;
            case 'Water': elementalValues.Water += weight; break;
            case 'Earth': elementalValues.Earth += weight; break;
            case 'Air': elementalValues.Air += weight; break;
          }
        }
      }
    } catch (error) {
      console.error("[ElementalCalculator] Error processing ascendant data:", error);
    }
  }

  /**
   * Get the elemental association of a zodiac sign
   */
  private getSignElement(sign: string): string | null {
    let lowerSign = sign.toLowerCase();
    
    // Fire signs
    if (lowerSign.includes('aries') || lowerSign.includes('leo') || lowerSign.includes('sagittarius')) {
      return 'Fire';
    }
    
    // Water signs
    if (lowerSign.includes('cancer') || lowerSign.includes('scorpio') || lowerSign.includes('pisces')) {
      return 'Water';
    }
    
    // Earth signs
    if (lowerSign.includes('taurus') || lowerSign.includes('virgo') || lowerSign.includes('capricorn')) {
      return 'Earth';
    }
    
    // Air signs
    if (lowerSign.includes('gemini') || lowerSign.includes('libra') || lowerSign.includes('aquarius')) {
      return 'Air';
    }
    
    console.warn(`[ElementalCalculator] Unknown sign: ${sign}`);
    return null;
  }
  
  /**
   * Get the weight of planetary influence
   */
  private getPlanetWeight(planet: string): number {
    let lowerPlanet = planet.toLowerCase();
    
    // Luminaries have strongest influence
    if (lowerPlanet.includes('sun') || lowerPlanet.includes('moon')) {
      return 1.0;
    }
    
    // Personal planets have significant influence
    if (
      lowerPlanet.includes('mercury') || 
      lowerPlanet.includes('venus') || 
      lowerPlanet.includes('mars')
    ) {
      return 0.8;
    }
    
    // Social planets have moderate influence
    if (lowerPlanet.includes('jupiter') || lowerPlanet.includes('saturn')) {
      return 0.6;
    }
    
    // Outer planets have subtle influence
    if (
      lowerPlanet.includes('uranus') || 
      lowerPlanet.includes('neptune') || 
      lowerPlanet.includes('pluto')
    ) {
      return 0.4;
    }
    
    // Default weight for unknown planets
    return 0.3;
  }

  private static validateElementalProperties(
    properties: ElementalProperties
  ): boolean {
    if (!properties) return false;

    let requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    let hasAllElements = requiredElements.every(
      (element) =>
        typeof properties[element as keyof ElementalProperties] === 'number'
    );

    if (!hasAllElements) return false;

    let sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 1) < 0.01;
  }

  public static calculateIngredientMatch(ingredient: unknown): number {
    // Apply surgical type casting with variable extraction
    const ingredientData = ingredient as any;
    const elementalProperties = ingredientData?.elementalProperties;
    
    // If the ingredient has elementalProperties, use those
    if (elementalProperties) {
      let currentState = this.getCurrentElementalState();

      // Calculate similarity between ingredient's elemental properties and current state
      let matchScore = 0;
      let totalWeight = 0;

      Object.entries(currentState).forEach(([element, value]) => {
        let elementKey = element as keyof ElementalProperties;
        let ingredientValue = elementalProperties[elementKey] || 0;

        // Calculate weighted difference (more important elements get higher weight)
        let weight = value * 2; // Emphasize elements that are strong in current state
        matchScore += (1 - Math.abs(value - ingredientValue)) * weight;
        totalWeight += weight;
      });

      // Normalize score to 0-100 range
      return totalWeight > 0 ? (matchScore /totalWeight) * 100 : 50;
    }

    // Default score if no elemental properties
    return 50;
  }

  public static calculateElementalBalance(
    elementalProperties: ElementalProperties
  ): number {
    // Use actual current elemental state for comparison
    let currentState = this.getCurrentElementalState();

    // Calculate similarity between ingredient and current state
    let totalSimilarity = 0;
    let count = 0;

    // Use all four elements for calculation
    ['Fire', 'Water', 'Earth', 'Air'].forEach((element) => {
      let elementKey = element as keyof ElementalProperties;
      let currentValue = currentState[elementKey] || 0;
      let ingredientValue = elementalProperties[elementKey] || 0;

      // Calculate similarity (1 - difference)
      let similarity = 1 - Math.abs(currentValue - ingredientValue);
      totalSimilarity += similarity;
      count++;
    });

    // Return average similarity as percentage
    return count > 0 ? (totalSimilarity /count) * 100 : 50;
  }

  private calculateElementalTotals(
    properties: ElementalProperties
  ): ElementalSummary {
    return {
      totalFire: properties.Fire,
      totalWater: properties.Water,
      totalEarth: properties.Earth,
      totalAir: properties.Air,
      dominantElement: this.getDominantElement(properties),
    };
  }

  private static getSeasonFromZodiacSign(sign: ZodiacSign): Season {
    // Map zodiac signs to seasons
    const zodiacSeasons: Record<ZodiacSign, Season> = {
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
  public static getZodiacSeasonalModifiers(
    sign: ZodiacSign
  ): ElementalProperties {
    let season = this.getSeasonFromZodiacSign(sign);
    return this.getSeasonalModifiers(season);
  }

  public static getZodiacElementalInfluence(
    sign: ZodiacSign
  ): ElementalProperties {
    // Base seasonal influence
    let seasonalModifiers = this.getZodiacSeasonalModifiers(sign);

    // Specific zodiac sign adjustments
    const zodiacModifiers: Record<ZodiacSign, Partial<ElementalProperties>> = {
      aries: { Fire: 0.2 }, // Extra Fire boost for aries
      taurus: { Earth: 0.2 }, // Extra Earth boost for taurus
      gemini: { Air: 0.2 }, // Extra Air boost for gemini
      cancer: { Water: 0.2 }, // Extra Water boost for cancer
      leo: { Fire: 0.2 }, // Extra Fire boost for leo
      virgo: { Earth: 0.2 }, // Extra Earth boost for virgo
      libra: { Air: 0.2 }, // Extra Air boost for Libra
      scorpio: { Water: 0.2 }, // Extra Water boost for Scorpio
      sagittarius: { Fire: 0.2 }, // Extra Fire boost for sagittarius
      capricorn: { Earth: 0.2 }, // Extra Earth boost for capricorn
      aquarius: { Air: 0.2 }, // Extra Air boost for aquarius
      pisces: { Water: 0.2 }, // Extra Water boost for pisces
    };

    // Apply specific zodiac adjustments
    let specificAdjustments = zodiacModifiers[sign] || {};

    // Combine seasonal modifiers with specific zodiac adjustments
    let result = { ...seasonalModifiers };
    Object.entries(specificAdjustments).forEach(([element, value]) => {
      // Use nullish coalescing to ensure value is never undefined
      result[element as keyof ElementalProperties] += value || 0;
    });

    // Normalize to ensure values stay in valid range
    return normalizeProperties(result);
  }

  public static combineElementalProperties(
    properties: ElementalProperties[]
  ): ElementalProperties {
    const result: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    };

    if (properties.length === 0) {
      return {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };
    }

    // Sum up all properties
    properties.forEach((prop) => {
      Object.entries(prop).forEach(([element, value]) => {
        // Use nullish coalescing to handle undefined values
        let elementKey = element as keyof ElementalProperties;
        result[elementKey] += value || 0;
      });
    });

    // Normalize to ensure they sum to 1
    let total = Object.values(result).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(result).forEach((element) => {
        let elementKey = element as keyof ElementalProperties;
        result[elementKey] = result[elementKey] /total;
      });
    } else {
      // Default to equal distribution if total is 0
      Object.keys(result).forEach((element) => {
        let elementKey = element as keyof ElementalProperties;
        result[elementKey] = 0.25;
      });
    }

    return result;
  }

  private getDominantElement(
    elementalProperties: ElementalProperties
  ): keyof ElementalProperties {
    let maxElement: keyof ElementalProperties = 'Fire';
    let maxValue = elementalProperties.Fire;

    // Check each element to find the one with the highest value
    Object.entries(elementalProperties).forEach(([element, value]) => {
      let elementKey = element as keyof ElementalProperties;
      if (value > maxValue) {
        maxValue = value;
        maxElement = elementKey;
      }
    });

    return maxElement;
  }

  // Method to process planet object and extract elemental properties
  processPlanetsObject(planet: any, sign: string): Record<string, number> {
    if (!planet || !sign) {
      return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    }
    
    let elementalEffect: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    
    // Process dignity effect
    if (planetInfo[planet]?.["Dignity Effect"]?.[sign]) {
      const dignityEffectValue = planetInfo[planet]["Dignity Effect"][sign];
      if (dignityEffectValue) {
        if (Math.abs(dignityEffectValue) === 1 || Math.abs(dignityEffectValue) === 3) {
          const signElement = signInfo[sign]?.Element || 'Fire';
          elementalEffect[signElement] = 1 * (dignityEffectValue / Math.abs(dignityEffectValue));
        }
        
        if (Math.abs(dignityEffectValue) > 1) {
          const diurnalElement = planetInfo[planet]?.['Diurnal Element'] || 'Fire';
          const nocturnalElement = planetInfo[planet]?.['Nocturnal Element'] || 'Fire';
          
          elementalEffect[diurnalElement] += (1 * (dignityEffectValue / (Math.abs(dignityEffectValue || 1))));
          elementalEffect[nocturnalElement] += (1 * (dignityEffectValue / Math.abs(dignityEffectValue)));
        }
      }
    }
    
    return elementalEffect;
  }

  // Method to process celestial bodies data
  processCelestialBodies(celestialData: any): Record<string, number> {
    if (!celestialData) {
      return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    }
    
    let totalElementalEffect: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    
    // Process each planet
    for (const planetKey of Object.keys(planetInfo)) {
      if (celestialData[planetKey.toLowerCase()]) {
        const planet = planetKey;
        let sign = celestialData[planetKey.toLowerCase()]?.Sign?.label;
        
        if (sign) {
          let planetEffect = this.processPlanetsObject(planet, sign);
          
          // Combine effects
          for (const element of Object.keys(totalElementalEffect)) {
            totalElementalEffect[element] += planetEffect[element] || 0;
          }
        }
      }
    }
    
    return totalElementalEffect;
  }

  // Process planet keys to get element effects
  processPlanetKeys(planets: any): Record<string, number> {
    if (!planets) {
      return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    }
    
    let elementalEffect: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    
    // Extract all planet keys
    let planetKeys = Object.keys(planets).filter(key => 
      typeof planets[key] === 'object' && planets[key] !== null && 
      (planetInfo && planetInfo[key] || false)
    );
    
    // Process each planet
    for (const planet of planetKeys) {
      if (planets[planet]?.Sign) {
        let sign = planets[planet].Sign;
        let planetEffect = this.processPlanetsObject(planet, sign);
        
        // Combine effects
        for (const element of Object.keys(elementalEffect)) {
          elementalEffect[element] += planetEffect[element] || 0;
        }
      }
    }
    
    return elementalEffect;
  }

  // Get dominant element from elemental effects
  getDominantElement(elementalEffects: Record<string, number>): string {
    if (!elementalEffects) {
      return 'Fire';
    }
    
    let dominantElement = 'Fire';
    let highestValue = -Infinity;
    
    for (const [element, value] of Object.entries(elementalEffects)) {
      if (value > highestValue) {
        highestValue = value;
        dominantElement = element;
      }
    }
    
    return dominantElement;
  }

  // Normalize elemental values to ensure they sum to 1.0
  normalizeElementalValues(elementalEffects: Record<string, number>): Record<string, number> {
    if (!elementalEffects) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    const sum = Object.values(elementalEffects).reduce((a, b) => a + b, 0);
    
    // If sum is zero or very small, return equal distribution
    if (Math.abs(sum) < 0.001) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    const normalized: Record<string, number> = {};
    
    for (const element of Object.keys(elementalEffects)) {
      normalized[element] = elementalEffects[element] /sum;
    }
    
    return normalized;
  }
}

export default ElementalCalculator;
