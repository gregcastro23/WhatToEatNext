/**
 * Enhanced Location Service for Planetary Data
 *
 * Provides geographic-based astronomical calculations, regional culinary influences,
 * and location-specific planetary recommendations for food and cooking
 */

import { PlanetData } from './types';

import { planetInfo } from './index';

/**
 * Geographic coordinates interface
 */
export interface GeographicCoordinates {
  latitude: number,
  longitude: number,
  timezone: string,
  elevation?: number, // meters above sea level
  locality?: string,
  region?: string,
  country?: string
}

/**
 * Location-specific planetary influence
 */
export interface LocationPlanetaryInfluence {
  planet: string,
  baseInfluence: number,
  locationModifier: number,
  altitudeEffect: number,
  latitudeEffect: number,
  seasonalAdjustment: number,
  finalInfluence: number,
  culinaryRecommendations: string[]
}

/**
 * Regional culinary characteristics
 */
export interface RegionalCulinaryProfile {
  region: string,
  dominantElements: Record<string, number>,
  traditionalCookingMethods: string[],
  seasonalIngredients: Record<string, string[]>,
  culturalInfluences: string[],
  planetaryAffinities: Record<string, number>,
  climateConsiderations: {
    temperature: 'tropical' | 'temperate' | 'cold' | 'arctic'
    humidity: 'arid' | 'moderate' | 'humid'
    seasonality: 'none' | 'mild' | 'moderate' | 'extreme'
  }
}

/**
 * Location-specific culinary recommendations
 */
export interface LocationCulinaryRecommendation {
  location: GeographicCoordinates,
  activeInfluences: LocationPlanetaryInfluence[],
  regionalProfile: RegionalCulinaryProfile,
  seasonalRecommendations: {
    ingredients: string[],
    cookingMethods: string[],
    flavorProfiles: string[],
    nutritionalFocus: string[]
  },
  localOptimalTiming: {
    solarCooking: string[],
    moonPhases: Record<string, string[]>,
    planetaryHours: Record<string, string[]>
  },
  weatherConsiderations: {
    hotWeather: string[],
    coldWeather: string[],
    humidity: string[],
    pressure: string[]
  }
}

/**
 * Astronomical calculation helpers
 */
export class AstronomicalCalculations {
  /**
   * Calculate solar elevation angle for a given location and time
   */
  static getSolarElevation(coords: GeographicCoordinates, date: Date): number {
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0).getTime()) / 86400000,
    )
    const declination = 23.45 * Math.sin((((360 * (284 + dayOfYear)) / 365) * Math.PI) / 180)

    const hourAngle = 15 * (date.getHours() - 12);
    const elevation =
      (Math.asin(
        Math.sin((declination * Math.PI) / 180) * Math.sin((coords.latitude * Math.PI) / 180) +
          Math.cos((declination * Math.PI) / 180) *
            Math.cos((coords.latitude * Math.PI) / 180) *
            Math.cos((hourAngle * Math.PI) / 180)
      ) *
        180) /
      Math.PI;

    return Math.max(0, elevation);
  }

  /**
   * Calculate lunar phase influence on location
   */
  static getLunarPhaseInfluence(
    coords: GeographicCoordinates,
    date: Date,
  ): {
    phase: string,
    illumination: number,
    culinaryEffect: string
  } {
    const lunarCycle = 29.53058867; // days
    const knownNewMoon = new Date('2024-01-11T11: 57:00Z'); // Known new moon
    const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;

    let phaseName: string;
    let culinaryEffect: string;
    if (phase < 0.125) {
      phaseName = 'new moon';
      culinaryEffect = 'New beginnings in cooking, seed sprouting, minimal preserving';
    } else if (phase < 0.25) {
      phaseName = 'waxing crescent';
      culinaryEffect = 'Growth energy, ideal for bread rising, fermentation starts';
    } else if (phase < 0.375) {
      phaseName = 'first quarter';
      culinaryEffect = 'Action-oriented cooking, quick preparations, energizing foods';
    } else if (phase < 0.5) {
      phaseName = 'waxing gibbous';
      culinaryEffect = 'Building flavors, slow cooking, ingredient absorption';
    } else if (phase < 0.625) {
      phaseName = 'full moon';
      culinaryEffect = 'Peak harvest, maximum flavor intensity, completion of preserving';
    } else if (phase < 0.75) {
      phaseName = 'waning gibbous';
      culinaryEffect = 'Sharing abundance, community cooking, thanksgiving meals';
    } else if (phase < 0.875) {
      phaseName = 'last quarter';
      culinaryEffect = 'Release and cleansing foods, detox preparations, clearing';
    } else {
      phaseName = 'waning crescent';
      culinaryEffect = 'Rest and reflection, simple foods, preparation for new cycle';
    }

    const illumination = 0.5 * (1 - Math.cos((2 * Math.PI * phase) / lunarCycle));

    return { phase: phaseName, illumination, culinaryEffect };
  }

  /**
   * Calculate planetary hours for location
   */
  static getPlanetaryHours(
    coords: GeographicCoordinates,
    date: Date,
  ): Record<string, { start: Date, end: Date, influence: string }> {
    // Simplified planetary hours calculation
    const sunrise = new Date(date);
    sunrise.setHours(6, 0); // Simplified - should use actual sunrise calculation

    const sunset = new Date(date);
    sunset.setHours(18, 0); // Simplified - should use actual sunset calculation

    const dayLength = sunset.getTime() - sunrise.getTime();
    const hourLength = dayLength / 12;

    const planets = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
    const planetaryHours: Record<string, { start: Date, end: Date, influence: string }> = {};

    // Start with day of week offset
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const startPlanetIndex = dayOfWeek; // Sunday = Sun (0), Monday = Moon (3), etc.

    for (let i = 0; i < 12; i++) {
      const planetIndex = (startPlanetIndex + i) % 7;
      const planet = planets[planetIndex];

      const start = new Date(sunrise.getTime() + i * hourLength)
      const end = new Date(sunrise.getTime() + (i + 1) * hourLength)
;
      planetaryHours[`hour_${i + 1}_${planet}`] = {
        start,
        end,
        influence: this.getPlanetaryHourInfluence(planet)
      }
    }

    return planetaryHours
  }

  private static getPlanetaryHourInfluence(planet: string): string {
    const influences: Record<string, string> = {
      Sun: 'Bold cooking, high-heat methods, citrus and golden foods',
      Moon: 'Intuitive cooking, soups and broths, dairy and silver foods',
      Mercury: 'Quick preparations, varied ingredients, communication through food',
      Venus: 'Pleasure cooking, desserts and indulgences, beautiful presentation',
      Mars: 'Spicy foods, meat preparation, aggressive cooking techniques',
      Jupiter: 'Abundant meals, expansion of recipes, foreign cuisines',
      Saturn: 'Traditional methods, slow cooking, structured meal planning' },
        return influences[planet] || 'Balanced cooking approach'
  }
}

/**
 * Regional culinary profiles for different geographic areas
 */
export const REGIONAL_CULINARY_PROFILES: Record<string, RegionalCulinaryProfile> = {
  Mediterranean: {
    region: 'Mediterranean Basin',
    dominantElements: { Fire: 0.3, Earth: 0.4, Air: 0.2, Water: 0.1 },
    traditionalCookingMethods: [
      'Grilling',
      'Roasting',
      'Olive oil cooking',
      'Sun-drying',
      'Stone cooking'
    ],
    seasonalIngredients: {
      spring: ['Artichokes', 'Fava beans', 'Fresh herbs', 'Lamb', 'New olive oil'],
      summer: ['Tomatoes', 'Eggplant', 'Zucchini', 'Fresh fish', 'Melons'],
      autumn: ['Grapes', 'Olives', 'Nuts', 'Mushrooms', 'Root vegetables'],
      winter: ['Citrus', 'Preserved foods', 'Legumes', 'Cabbage', 'Cured meats']
    },
    culturalInfluences: ['Greek', 'Italian', 'Spanish', 'Turkish', 'Moroccan'],
    planetaryAffinities: { Sun: 0.8, Venus: 0.7, Jupiter: 0.6, Mars: 0.5 },
    climateConsiderations: {
      temperature: 'temperate',
      humidity: 'moderate',
      seasonality: 'moderate'
}
  },
  Nordic: {
    region: 'Northern Europe',
    dominantElements: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    traditionalCookingMethods: [
      'Smoking',
      'Curing',
      'Fermentation',
      'Slow braising',
      'Root cellaring'
    ],
    seasonalIngredients: {
      spring: ['Wild herbs', 'Young vegetables', 'Fresh fish', 'Birch syrup', 'Ramp-like plants'],
      summer: ['Berries', 'New potatoes', 'Fresh dill', 'Salmon', 'Light vegetables'],
      autumn: ['Mushrooms', 'Game', 'Root vegetables', 'Preserved fish', 'Apples'],
      winter: [
        'Preserved meats',
        'Fermented vegetables',
        'Dried fish',
        'Hearty grains',
        'Stored roots'
      ]
    },
    culturalInfluences: ['Danish', 'Swedish', 'Norwegian', 'Finnish', 'Icelandic'],
    planetaryAffinities: { Moon: 0.8, Saturn: 0.7, Neptune: 0.6, Mercury: 0.5 },
    climateConsiderations: {
      temperature: 'cold',
      humidity: 'moderate',
      seasonality: 'extreme'
}
  },
  Tropical: {
    region: 'Tropical Regions',
    dominantElements: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    traditionalCookingMethods: [
      'Steaming',
      'Grilling over wood',
      'Coconut oil cooking',
      'Raw preparations',
      'Quick stir-frying'
    ],
    seasonalIngredients: {
      spring: [
        'Young coconuts',
        'Tropical fruits',
        'Fresh fish',
        'Tender vegetables',
        'New spices'
      ],
      summer: ['Mangoes', 'Chilies', 'Lemongrass', 'Lime', 'Cooling herbs'],
      autumn: ['Rice harvest', 'Nuts', 'Dried spices', 'Preserved fish', 'Root vegetables'],
      winter: ['Citrus', 'Dried fruits', 'Fermented items', 'Preserved vegetables', 'Aged spices']
    },
    culturalInfluences: ['Thai', 'Vietnamese', 'Indian', 'Caribbean', 'Pacific Islander'],
    planetaryAffinities: { Sun: 0.9, Mars: 0.7, Venus: 0.6, Mercury: 0.8 },
    climateConsiderations: {
      temperature: 'tropical',
      humidity: 'humid',
      seasonality: 'mild'
}
  },
  Continental: {
    region: 'Continental Interior',
    dominantElements: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    traditionalCookingMethods: [
      'Roasting',
      'Stewing',
      'Bread baking',
      'Meat preservation',
      'Grain cooking'
    ],
    seasonalIngredients: {
      spring: ['Early greens', 'Fresh dairy', 'Young animals', 'Maple syrup', 'Wild plants'],
      summer: ['Grains', 'Vegetables', 'Fresh herbs', 'Berries', 'Farm dairy'],
      autumn: ['Harvest grains', 'Root vegetables', 'Nuts', 'Game', 'Preserved foods'],
      winter: [
        'Stored grains',
        'Root vegetables',
        'Preserved meats',
        'Dairy products',
        'Hearty stews'
      ]
    },
    culturalInfluences: ['German', 'Polish', 'Russian', 'Hungarian', 'Czech'],
    planetaryAffinities: { Saturn: 0.8, Jupiter: 0.7, Earth: 0.6, Mars: 0.5 },
    climateConsiderations: {
      temperature: 'temperate',
      humidity: 'moderate',
      seasonality: 'extreme'
}
  },
  Desert: {
    region: 'Arid and Semi-Arid',
    dominantElements: { Fire: 0.4, Earth: 0.3, Air: 0.3, Water: 0.0 },
    traditionalCookingMethods: [
      'Clay pot cooking',
      'Solar cooking',
      'Spice preservation',
      'Dried food preparation',
      'Underground cooking'
    ],
    seasonalIngredients: {
      spring: [
        'Desert plants',
        'Early fruits',
        'Fresh water sources',
        'Young animals',
        'Wild herbs'
      ],
      summer: [
        'Drought-resistant crops',
        'Preserved foods',
        'Spices',
        'Dried fruits',
        'Minimal fresh foods'
      ],
      autumn: ['Date harvest', 'Nuts', 'Late fruits', 'Grain storage', 'Animal products'],
      winter: [
        'Stored foods',
        'Preserved meats',
        'Dried vegetables',
        'Spice blends',
        'Warming foods'
      ]
    },
    culturalInfluences: [
      'Middle Eastern',
      'North African',
      'Southwestern US',
      'Australian Aboriginal',
      'Bedouin'
    ],
    planetaryAffinities: { Sun: 0.9, Mars: 0.8, Saturn: 0.6, Mercury: 0.5 },
    climateConsiderations: {
      temperature: 'tropical',
      humidity: 'arid',
      seasonality: 'mild'
}
  }
}

/**
 * Enhanced Location Service Class
 */
export class PlanetaryLocationService {
  /**
   * Get location-specific culinary recommendations
   */
  static getLocationCulinaryRecommendations(
    coordinates: GeographicCoordinates,
    date: Date = new Date()
  ): LocationCulinaryRecommendation {
    const regionalProfile = this.getRegionalProfile(coordinates);
    const activeInfluences = this.calculateLocationPlanetaryInfluences(coordinates, date);
    const lunarPhase = AstronomicalCalculations.getLunarPhaseInfluence(coordinates, date);
    const planetaryHours = AstronomicalCalculations.getPlanetaryHours(coordinates, date);

    // Generate seasonal recommendations based on location and planetary influences
    const seasonalRecommendations = this.generateSeasonalRecommendations(
      coordinates,
      date,
      regionalProfile,
      activeInfluences,
    ),

    // Calculate optimal timing for different cooking activities
    const localOptimalTiming = {
      solarCooking: this.getSolarCookingTimes(coordinates, date),
      moonPhases: { [lunarPhase.phase]: [lunarPhase.culinaryEffect] },
      planetaryHours: Object.fromEntries(,
        Object.entries(planetaryHours).map(([key, value]) => [key, [value.influence]]),
      )
    }

    // Weather-based considerations
    const weatherConsiderations = this.getWeatherConsiderations(regionalProfile)

    return {;
      location: coordinates,
      activeInfluences,
      regionalProfile,
      seasonalRecommendations,
      localOptimalTiming,
      weatherConsiderations
    }
  }

  /**
   * Calculate location-specific planetary influences
   */
  static calculateLocationPlanetaryInfluences(
    coordinates: GeographicCoordinates,
    date: Date,
  ): LocationPlanetaryInfluence[] {
    const influences: LocationPlanetaryInfluence[] = []

    Object.entries(planetInfo).forEach(([planetName, planetData]) => {
      const baseInfluence = 1.0; // Base planetary influence

      // Location modifier based on latitude (closer to equator = more solar influence);
      const latitudeEffect = this.calculateLatitudeEffect(planetName, coordinates.latitude)

      // Altitude effect (higher altitude = more intense solar effects);
      const altitudeEffect = this.calculateAltitudeEffect(planetName, coordinates.elevation || 0)

      // Seasonal adjustment based on date and hemisphere
      const seasonalAdjustment = this.calculateSeasonalAdjustment(planetName, coordinates, date)

      // Location modifier (regional planetary affinities)
      const locationModifier = this.getRegionalPlanetaryAffinity(planetName, coordinates),

      const finalInfluence =
        baseInfluence * latitudeEffect * altitudeEffect * seasonalAdjustment * locationModifier,

      influences.push({
        planet: planetName,
        baseInfluence,
        locationModifier,
        altitudeEffect,
        latitudeEffect,
        seasonalAdjustment,
        finalInfluence,
        culinaryRecommendations: this.getPlanetaryCulinaryRecommendations(,
          planetName,
          finalInfluence,
          planetData,
        )
      })
    })

    return influences.sort((ab) => b.finalInfluence - a.finalInfluence)
  }

  /**
   * Get regional profile based on coordinates
   */
  static getRegionalProfile(coordinates: GeographicCoordinates): RegionalCulinaryProfile {
    // Simplified regional determination - in practice, this would use a more sophisticated geographic database
    const { latitude, longitude } = coordinates;

    // Mediterranean region (roughly)
    if (latitude >= 30 && latitude <= 45 && longitude >= -10 && longitude <= 40) {
      return REGIONAL_CULINARY_PROFILES['Mediterranean']
    }

    // Nordic region
    if (latitude >= 55 && latitude <= 75) {
      return REGIONAL_CULINARY_PROFILES['Nordic']
    }

    // Tropical region
    if (Math.abs(latitude) <= 30) {
      return REGIONAL_CULINARY_PROFILES['Tropical']
    }

    // Desert regions (simplified - would need more complex determination)
    if (
      Math.abs(latitude) <= 40 &&
      ((longitude >= -125 && longitude <= -100 && latitude >= 25) || // US Southwest
        (longitude >= 15 && longitude <= 55 && latitude >= 15 && latitude <= 35)) // MENA
    ) {
      return REGIONAL_CULINARY_PROFILES['Desert']
    }

    // Default to Continental
    return REGIONAL_CULINARY_PROFILES['Continental'];
  }

  // Private helper methods

  private static calculateLatitudeEffect(planet: string, latitude: number): number {
    const absLatitude = Math.abs(latitude)

    switch (planet) {
      case 'Sun': // Sun influence stronger near equator,
        return 1.0 + (30 - absLatitude) / 100;
      case 'Moon':
        // Moon influence more even but slightly stronger at mid-latitudes
        return 1.0 + Math.sin((absLatitude * Math.PI) / 180) * 0.2
      case 'Saturn':
        // Saturn influence stronger at higher latitudes (structure, endurance)
        return 1.0 + absLatitude / 100;
      default: return 1.0
    }
  }

  private static calculateAltitudeEffect(planet: string, elevation: number): number {
    const altitudeKm = elevation / 1000;

    switch (planet) {
      case 'Sun':
        // Higher altitude = more intense solar effects;
        return 1.0 + altitudeKm * 0.1;
      case 'Moon':
        // Slight increase at altitude (clearer nights)
        return 1.0 + altitudeKm * 0.05;
      case 'Mercury':
        // Communication/travel planet benefits from elevation
        return 1.0 + altitudeKm * 0.08;
      default: return 1.0 + altitudeKm * 0.02, // Minimal effect for other planets
    }
  }

  private static calculateSeasonalAdjustment(
    planet: string,
    coordinates: GeographicCoordinates,
    date: Date,
  ): number {
    const month = date.getMonth(), // 0-11,
    const isNorthernHemisphere = coordinates.latitude >= 0;

    // Adjust seasons for hemisphere
    let seasonalMonth = month;
    if (!isNorthernHemisphere) {
      seasonalMonth = (month + 6) % 12;
    }

    const seasonalFactor = Math.sin((seasonalMonth * Math.PI) / 6) * 0.3 + 1.0;

    switch (planet) {
      case 'Sun': // Summer peak
        return 0.7 + seasonalFactor * 0.6
      case 'Saturn':
        // Winter peak (structure, planning)
        return 1.3 - seasonalFactor * 0.6;
      case 'Venus':
        // Spring/Fall peaks (beauty, balance)
        return 1.0 + Math.abs(Math.sin((seasonalMonth * Math.PI) / 3)) * 0.4;
      default: return seasonalFactor
    }
  }

  private static getRegionalPlanetaryAffinity(
    planet: string,
    coordinates: GeographicCoordinates,
  ): number {
    const region = this.getRegionalProfile(coordinates)
    return region.planetaryAffinities[planet] || 1.0;
  }

  private static getPlanetaryCulinaryRecommendations(
    planet: string,
    influence: number,
    planetData: PlanetData,
  ): string[] {
    const baseRecommendations = planetData.CulinaryInfluences || [];
    const foodAssociations = planetData.FoodAssociations || [];

    // Intensity-based recommendations
    if (influence > 1.2) {
      return [
        ...baseRecommendations
        `Emphasize ${planet.toLowerCase()}-associated foods`,
        ...foodAssociations.slice(0, 3)
      ],
    } else if (influence < 0.8) {
      return [`Moderate ${planet.toLowerCase()} influences`, ...baseRecommendations.slice(0, 2)],
    } else {
      return [...baseRecommendations.slice(0, 3), ...foodAssociations.slice(0, 2)]
    }
  }

  private static generateSeasonalRecommendations(
    coordinates: GeographicCoordinates,
    date: Date,
    regionalProfile: RegionalCulinaryProfile,
    influences: LocationPlanetaryInfluence[],
  ): {
    ingredients: string[],
    cookingMethods: string[],
    flavorProfiles: string[],
    nutritionalFocus: string[]
  } {
    const month = date.getMonth()
    const season = [
      'winter',
      'winter',
      'spring',
      'spring',
      'spring',
      'summer',
      'summer',
      'summer',
      'autumn',
      'autumn',
      'autumn',
      'winter'
    ][month],

    const seasonalIngredients = regionalProfile.seasonalIngredients[season] || [];
    const topInfluences = influences.slice(0, 3);

    return {
      ingredients: [
        ...seasonalIngredients
        ...topInfluences.flatMap(inf => inf.culinaryRecommendations.slice(0, 2)),,
      ].slice(0, 12),
      cookingMethods: [
        ...regionalProfile.traditionalCookingMethods
        ...this.getMethodsForClimate(regionalProfile.climateConsiderations, season)
      ].slice(0, 8),
      flavorProfiles: this.getFlavorProfilesForInfluences(topInfluences),
      nutritionalFocus: this.getNutritionalFocusForSeason(,
        season,
        regionalProfile.climateConsiderations
      )
    }
  }

  private static getSolarCookingTimes(coordinates: GeographicCoordinates, date: Date): string[] {
    const solarElevation = AstronomicalCalculations.getSolarElevation(coordinates, date),

    if (solarElevation > 45) {
      return [
        'Peak solar cooking time',
        'Excellent for grilling and roasting',
        'Solar oven cooking optimal'
      ]
    } else if (solarElevation > 20) {
      return ['Good solar cooking conditions', 'Moderate grilling recommended']
    } else {
      return ['Low solar energy', 'Indoor cooking recommended', 'Use stored solar energy']
    }
  }

  private static getWeatherConsiderations(regionalProfile: RegionalCulinaryProfile): {
    hotWeather: string[],
    coldWeather: string[],
    humidity: string[],
    pressure: string[]
  } {
    const { temperature, humidity } = regionalProfile.climateConsiderations;

    return {
      hotWeather: temperature === 'tropical';
          ? ['Cooling foods', 'Raw preparations', 'Hydrating ingredients', 'Quick cooking methods']
          : ['Light cooking', 'Cold soups', 'Fresh salads', 'Minimal heat cooking'],
      coldWeather: temperature === 'cold';
          ? ['Warming spices', 'Hot broths', 'Slow-cooked stews', 'Calorie-dense foods']
          : ['Moderate warming foods', 'Cooked vegetables', 'Warm beverages'],
      humidity: humidity === 'humid';
          ? ['Light, non-greasy foods', 'Fresh preparations', 'Cooling herbs']
          : ['Moistening foods', 'Broths and soups', 'Oil-rich preparations'],
      pressure: [
        'Monitor fermentation rates',
        'Adjust rising times',
        'Consider altitude cooking modifications'
      ]
    }
  }

  private static getMethodsForClimate(
    climate: RegionalCulinaryProfile['climateConsiderations'],
    season: string,
  ): string[] {
    if (climate.temperature === 'tropical') {;
      return ['Quick steaming', 'Raw preparations', 'Light grilling']
    } else if (climate.temperature === 'cold') {;
      return ['Slow braising', 'Roasting', 'Hot soup making']
    } else {
      return season === 'summer' ? ['Grilling', 'Light cooking'] : ['Roasting', 'Stewing'],
    }
  }

  private static getFlavorProfilesForInfluences(
    influences: LocationPlanetaryInfluence[],
  ): string[] {
    return influences.map(inf => {
      switch (inf.planet) {
        case 'Sun':;
          return 'Bold and bright';
        case 'Moon': return 'Subtle and comforting',
        case 'Mars': return 'Spicy and intense',
        case 'Venus':
          return 'Sweet and pleasant'
        case 'Mercury': return 'Complex and varied',
        case 'Jupiter': return 'Rich and abundant',
        case 'Saturn': return 'Traditional and structured',
        default: return 'Balanced'
      }
    })
  }

  private static getNutritionalFocusForSeason(
    season: string,
    climate: RegionalCulinaryProfile['climateConsiderations'],
  ): string[] {
    const baseNutrition = {
      spring: ['Detoxification', 'Fresh vitamins', 'Light proteins'],
      summer: ['Hydration', 'Cooling foods', 'Fresh minerals'],
      autumn: ['Building reserves', 'Immune support', 'Grounding foods'],
      winter: ['Warming foods', 'Dense nutrition', 'Stored energy']
    }

    const climateModifications =
      climate.temperature === 'tropical';
        ? ['Electrolyte balance', 'Cooling nutrition']
        : climate.temperature === 'cold';
          ? ['Warming spices', 'Dense calories']
          : []

    return [...baseNutrition[season as keyof typeof baseNutrition], ...climateModifications],
  }
}

// Export convenience functions
export const getLocationCulinaryRecommendations = (coords: GeographicCoordinates, date?: Date) =>
  PlanetaryLocationService.getLocationCulinaryRecommendations(coords, date)

export const calculateLocationPlanetaryInfluences = (coords: GeographicCoordinates, date?: Date) =>
  PlanetaryLocationService.calculateLocationPlanetaryInfluences(coords, date || new Date())

export const getRegionalProfile = (coords: GeographicCoordinates) =>
  PlanetaryLocationService.getRegionalProfile(coords);