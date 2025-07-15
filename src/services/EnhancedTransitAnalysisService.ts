/**
 * Enhanced Transit Analysis Service
 * 
 * Integrates location service, planetary dignity data, and comprehensive transit analysis
 * for sophisticated food and cooking recommendations based on celestial influences
 */

import { 
  COMPREHENSIVE_TRANSIT_DATABASE, 
  TransitAnalysisService,
  type TransitSeason 
} from '@/data/transits/comprehensiveTransitDatabase';
import type { PlanetaryAspect } from '@/types/celestial';
import { 
  PlanetaryLocationService,
  AstronomicalCalculations,
  type GeographicCoordinates,
  type LocationPlanetaryInfluence 
} from '@/data/planets/locationService';
import { 
  PLANETARY_DIGNITIES,
  calculatePlanetaryDignity,
  calculatePlanetaryStrength 
} from '@/calculations/core/planetaryInfluences';
import planetInfo from '@/data/planets';

/**
 * Enhanced planetary position with dignity and location modifiers
 */
export interface EnhancedPlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  exactLongitude?: number;
  isRetrograde: boolean;
  dignity: {
    type: 'rulership' | 'exaltation' | 'detriment' | 'fall' | 'neutral';
    modifier: number;
  };
  strength: number;
  locationInfluence: number;
  culinaryRecommendations: string[];
}

/**
 * Enhanced transit influence calculation
 */
export interface EnhancedTransitInfluence {
  season: TransitSeason;
  location: GeographicCoordinates;
  enhancedPlanetaryPositions: EnhancedPlanetaryPosition[];
  aspectInfluences: {
    aspect: PlanetaryAspect;
    dignityModifiedInfluence: number;
    culinaryEffects: string[];
  }[];
  locationSpecificRecommendations: {
    ingredients: string[];
    cookingMethods: string[];
    flavorProfiles: string[];
    timing: string[];
  };
  dominantInfluences: {
    strongestPlanet: EnhancedPlanetaryPosition;
    dominantElement: string;
    seasonalTheme: string;
    optimalCookingTimes: string[];
  };
}

/**
 * Enhanced Transit Analysis Service
 */
export class EnhancedTransitAnalysisService {
  
  /**
   * Get comprehensive transit analysis for a location and date
   */
  static async getEnhancedTransitAnalysis(
    location: GeographicCoordinates,
    date: Date = new Date()
  ): Promise<EnhancedTransitInfluence> {
    
    // Get current season transit data
    const year = date.getFullYear().toString();
    const yearData = COMPREHENSIVE_TRANSIT_DATABASE[year];
    if (!yearData) {
      throw new Error('No transit data available for the current year');
    }
    
    const season = yearData.seasons.find(s => 
      date >= s.startDate && date <= s.endDate
    );
    if (!season) {
      throw new Error('No transit data available for the current date');
    }

    // Get location-specific planetary influences
    const locationInfluences = PlanetaryLocationService.calculateLocationPlanetaryInfluences(location, date);
    
    // Calculate enhanced planetary positions with dignity and location modifiers
    const enhancedPositions = this.calculateEnhancedPlanetaryPositions(
      season.planetaryPlacements,
      locationInfluences,
      date
    );

    // Calculate aspect influences with dignity modifiers
    const aspectInfluences = this.calculateEnhancedAspectInfluences(
      season.keyAspects,
      enhancedPositions,
      location
    );

    // Generate location-specific recommendations
    const locationRecommendations = this.generateLocationSpecificRecommendations(
      enhancedPositions,
      aspectInfluences,
      season,
      location,
      date
    );

    // Determine dominant influences
    const dominantInfluences = this.calculateDominantInfluences(
      enhancedPositions,
      aspectInfluences,
      season,
      location,
      date
    );

    return {
      season,
      location,
      enhancedPlanetaryPositions: enhancedPositions,
      aspectInfluences,
      locationSpecificRecommendations: locationRecommendations,
      dominantInfluences
    };
  }

  /**
   * Calculate enhanced planetary positions with dignity and location effects
   */
  private static calculateEnhancedPlanetaryPositions(
    planetaryPlacements: Record<string, Record<string, string>>,
    locationInfluences: LocationPlanetaryInfluence[],
    date: Date
  ): EnhancedPlanetaryPosition[] {
    
    return Object.entries(planetaryPlacements).map(([planet, position]) => {
      // Calculate dignity
      const dignity = calculatePlanetaryDignity(planet, position.sign);
      
      // Get location influence for this planet
      const locationInfluence = locationInfluences.find(
        li => li.planet.toLowerCase() === planet.toLowerCase()
      );
      
      // Calculate overall strength
      const strength = calculatePlanetaryStrength(planet, position);
      
      // Get planet data for culinary recommendations
      const planetData = planetInfo[planet];
      const culinaryRecommendations = this.generatePlanetaryCulinaryRecommendations(
        planet,
        dignity,
        strength,
        locationInfluence,
        planetData
      );

      return {
        planet,
        sign: position.sign,
        degree: position.degree,
        exactLongitude: position.exactLongitude,
        isRetrograde: position.isRetrograde || false,
        dignity,
        strength,
        locationInfluence: locationInfluence?.finalInfluence || 1.0,
        culinaryRecommendations
      };
    });
  }

  /**
   * Calculate enhanced aspect influences with dignity modifiers
   */
  private static calculateEnhancedAspectInfluences(
    aspects: PlanetaryAspect[],
    enhancedPositions: EnhancedPlanetaryPosition[],
    location: GeographicCoordinates
  ): { aspect: PlanetaryAspect; dignityModifiedInfluence: number; culinaryEffects: string[] }[] {
    
    return aspects.map(aspect => {
      // Get enhanced positions for the aspecting planets
      const planet1Data = enhancedPositions.find(
        ep => ep.planet.toLowerCase() === aspect.planet1.toLowerCase()
      );
      const planet2Data = enhancedPositions.find(
        ep => ep.planet.toLowerCase() === aspect.planet2.toLowerCase()
      );

      // Calculate dignity-modified influence
      let dignityModifiedInfluence = aspect.influence;
      
      if (planet1Data && planet2Data) {
        // Modify influence based on planetary dignities
        const averageDignityModifier = (planet1Data.dignity.modifier + planet2Data.dignity.modifier) / 2;
        dignityModifiedInfluence *= averageDignityModifier;
        
        // Further modify based on location influences
        const averageLocationInfluence = (planet1Data.locationInfluence + planet2Data.locationInfluence) / 2;
        dignityModifiedInfluence *= averageLocationInfluence;
      }

      // Generate culinary effects for this aspect
      const culinaryEffects = this.generateAspectCulinaryEffects(
        aspect,
        planet1Data,
        planet2Data,
        location
      );

      return {
        aspect,
        dignityModifiedInfluence,
        culinaryEffects
      };
    });
  }

  /**
   * Generate planetary culinary recommendations based on dignity and location
   */
  private static generatePlanetaryCulinaryRecommendations(
    planet: string,
    dignity: { type: string; modifier: number },
    strength: number,
    locationInfluence: LocationPlanetaryInfluence | undefined,
    planetData: Planet
  ): string[] {
    const recommendations: string[] = [];
    
    // Base recommendations from planet data
    if (planetData?.FoodAssociations) {
      recommendations.push(...planetData.FoodAssociations.slice(0, 3));
    }
    
    // Modify recommendations based on dignity
    if (dignity.type === 'rulership' || dignity.type === 'exaltation') {
      recommendations.push(`Enhanced ${planet.toLowerCase()} foods - maximize traditional associations`);
      recommendations.push(`Strong preparation methods reflecting ${planet} energy`);
    } else if (dignity.type === 'detriment' || dignity.type === 'fall') {
      recommendations.push(`Gentle ${planet.toLowerCase()} foods - use with moderation`);
      recommendations.push(`Supportive cooking methods to strengthen ${planet} influence`);
    }
    
    // Add location-specific recommendations
    if (locationInfluence?.culinaryRecommendations) {
      recommendations.push(...locationInfluence.culinaryRecommendations.slice(0, 2));
    }
    
    return recommendations;
  }

  /**
   * Generate culinary effects for planetary aspects
   */
  private static generateAspectCulinaryEffects(
    aspect: PlanetaryAspect,
    planet1Data: EnhancedPlanetaryPosition | undefined,
    planet2Data: EnhancedPlanetaryPosition | undefined,
    location: GeographicCoordinates
  ): string[] {
    const effects: string[] = [];
    
    // Base aspect effect
    if (aspect.additionalInfo?.description && typeof aspect.additionalInfo.description === 'string') {
      effects.push(aspect.additionalInfo.description);
    }
    
    // Combine planetary influences
    if (planet1Data && planet2Data) {
      const aspectType = aspect.aspectType;
      const planets = `${planet1Data.planet}-${planet2Data.planet}`;
      
      switch (aspectType) {
        case 'conjunction':
          effects.push(`${planets} fusion - blend both planetary food associations`);
          break;
        case 'trine':
          effects.push(`${planets} harmony - complementary cooking styles`);
          break;
        case 'sextile':
          effects.push(`${planets} opportunity - creative fusion possibilities`);
          break;
        case 'square':
          effects.push(`${planets} tension - balance contrasting flavors`);
          break;
        case 'opposition':
          effects.push(`${planets} polarity - alternate between contrasting approaches`);
          break;
      }
    }
    
    return effects;
  }

  /**
   * Generate comprehensive location-specific recommendations
   */
  private static generateLocationSpecificRecommendations(
    enhancedPositions: EnhancedPlanetaryPosition[],
    aspectInfluences: PlanetaryPosition[],
    season: TransitSeason,
    location: GeographicCoordinates,
    date: Date
  ): {
    ingredients: string[];
    cookingMethods: string[];
    flavorProfiles: string[];
    timing: string[];
  } {
    
    // Get regional profile
    const regionalProfile = PlanetaryLocationService.getRegionalProfile(location);
    
    // Get planetary hours
    const planetaryHours = AstronomicalCalculations.getPlanetaryHours(location, date);
    
    // Combine all influences for comprehensive recommendations
    const ingredients: string[] = [];
    const cookingMethods: string[] = [];
    const flavorProfiles: string[] = [];
    const timing: string[] = [];

    // Add seasonal ingredients
    ingredients.push(...season.culinaryInfluences.slice(0, 3));
    
    // Add regional traditional ingredients
    if (regionalProfile.seasonalIngredients[season.sunSign]) {
      ingredients.push(...regionalProfile.seasonalIngredients[season.sunSign].slice(0, 2));
    }
    
    // Add strongest planetary influences
    enhancedPositions
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
      .forEach(planet => {
        ingredients.push(...planet.culinaryRecommendations.slice(0, 1));
      });

    // Add regional cooking methods
    cookingMethods.push(...regionalProfile.traditionalCookingMethods.slice(0, 3));
    
    // Add aspect-influenced methods
    aspectInfluences.forEach(aspectInfluence => {
      cookingMethods.push(...aspectInfluence.culinaryEffects.slice(0, 1));
    });

    // Generate flavor profiles based on elemental dominance
    Object.entries(season.dominantElements)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .forEach(([element, strength]) => {
        flavorProfiles.push(`${element.toLowerCase()}-dominant flavors (${Math.round(strength * 100)}% influence)`);
      });

    // Generate optimal timing recommendations
    Object.entries(planetaryHours).slice(0, 3).forEach(([hourKey, hourData]) => {
      timing.push(`${hourKey}: ${hourData.influence}`);
    });

    return {
      ingredients: [...new Set(ingredients)].slice(0, 8),
      cookingMethods: [...new Set(cookingMethods)].slice(0, 6),
      flavorProfiles: [...new Set(flavorProfiles)].slice(0, 4),
      timing: [...new Set(timing)].slice(0, 6)
    };
  }

  /**
   * Calculate dominant influences for the current transit
   */
  private static calculateDominantInfluences(
    enhancedPositions: EnhancedPlanetaryPosition[],
    aspectInfluences: PlanetaryPosition[],
    season: TransitSeason,
    location: GeographicCoordinates,
    date: Date
  ): {
    strongestPlanet: EnhancedPlanetaryPosition;
    dominantElement: string;
    seasonalTheme: string;
    optimalCookingTimes: string[];
  } {
    
    // Find strongest planet (highest combined strength and location influence)
    const strongestPlanet = enhancedPositions.reduce((strongest, current) => {
      const currentScore = current.strength * current.locationInfluence;
      const strongestScore = strongest.strength * strongest.locationInfluence;
      return currentScore > strongestScore ? current : strongest;
    });

    // Determine dominant element
    const dominantElement = Object.entries(season.dominantElements)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Get seasonal theme
    const seasonalTheme = season.seasonalThemes[0] || 'Balanced seasonal cooking';

    // Calculate optimal cooking times
    const solarTimes = AstronomicalCalculations.getSolarElevation(location, date);
    const optimalCookingTimes = [
      `Peak solar energy: ${solarTimes > 45 ? 'High-heat cooking optimal' : 'Gentle cooking preferred'}`,
      `${strongestPlanet.planet} influence: Enhanced during planetary hour`,
      `Seasonal focus: ${seasonalTheme}`
    ];

    return {
      strongestPlanet,
      dominantElement,
      seasonalTheme,
      optimalCookingTimes
    };
  }

  /**
   * Get food recommendations for current location and time
   */
  static async getFoodRecommendationsForLocation(
    location: GeographicCoordinates,
    preferences: {
      dietaryRestrictions?: string[];
      preferredCuisines?: string[];
      mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    } = {}
  ): Promise<{
    analysis: EnhancedTransitInfluence;
    recommendations: {
      primarySuggestions: string[];
      alternativeSuggestions: string[];
      cookingGuidance: string[];
      timingAdvice: string[];
    };
  }> {
    
    const analysis = await this.getEnhancedTransitAnalysis(location);
    
    // Generate targeted recommendations based on analysis
    const primarySuggestions = analysis.locationSpecificRecommendations.ingredients.slice(0, 5);
    const alternativeSuggestions = analysis.enhancedPlanetaryPositions
      .flatMap(planet => planet.culinaryRecommendations)
      .slice(0, 5);
    
    const cookingGuidance = analysis.locationSpecificRecommendations.cookingMethods.slice(0, 4);
    const timingAdvice = analysis.dominantInfluences.optimalCookingTimes.slice(0, 3);

    return {
      analysis,
      recommendations: {
        primarySuggestions,
        alternativeSuggestions,
        cookingGuidance,
        timingAdvice
      }
    };
  }
} 