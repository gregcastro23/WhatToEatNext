import { UserBirthInfo } from '../types/user';
import { BirthChart, ZodiacSign, Planet, LunarPhase, AstrologicalAspect } from '../types/astrology';
import { ElementalProperties } from '../types/alchemy';
import { AstrologicalService } from './AstrologicalService';
import { Logger } from '../utils/logger';
import { ElementalCharacter } from '../constants/planetaryElements';

/**
 * Interface for the composite chart that combines birth chart with current chart
 */
export interface CompositeChart {
  timestamp: number;
  birthChart: BirthChart;
  currentChart: {
    elementalState: Record<ElementalCharacter, number>;
    planetaryPositions: Record<Planet, number>;
    ascendant: string;
    lunarPhase: LunarPhase;
  };
  compositeElementalBalance: ElementalProperties;
  alchemicalProperties: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
    Heat: number;
    Entropy: number;
    Reactivity: number;
    Energy: number;
  };
  dominantElement: string;
}

/**
 * Service for handling birth charts, current charts, and composite charts
 */
export class ChartService {
  private static instance: ChartService;
  
  private constructor() {
    Logger.info('ChartService initialized');
  }
  
  /**
   * Get the singleton instance of the ChartService
   */
  public static getInstance(): ChartService {
    if (!ChartService.instance) {
      ChartService.instance = new ChartService();
    }
    return ChartService.instance;
  }
  
  /**
   * Create a birth chart from user birth information
   * @param birthInfo User's birth information
   * @returns Birth chart data
   */
  public async createBirthChart(birthInfo: UserBirthInfo): Promise<BirthChart> {
    try {
      // Convert birthInfo to a Date object
      const birthDate = new Date(birthInfo.birthDate);
      
      // Get astrological state for birth time
      const birthTime = birthInfo.birthTime ? 
        new Date(`${birthInfo.birthDate}T${birthInfo.birthTime}`) : 
        new Date(birthInfo.birthDate);
      
      const astroState = await AstrologicalService.getAstrologicalState(birthTime, true);
      
      // Extract planetary positions
      const planetaryPositions = {} as Record<Planet, number>;
      
      if (astroState.planetaryPositions) {
        Object.entries(astroState.planetaryPositions).forEach(([planet, position]) => {
          // Skip non-planet entries
          if (!['sun', 'Moon', 'mercury', 'venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(planet)) {
            return;
          }
          
          // Convert to numeric longitude for calculations
          const longDegrees = typeof position === 'number' ? 
            position : 
            (position as any).longitude || 0;
          
          planetaryPositions[planet as Planet] = longDegrees;
        });
      }
      
      // Calculate elemental state based on planet positions
      const elementalState = this.calculateElementalState(planetaryPositions, astroState.dominantElement);
      
      // Create the birth chart
      const birthChart: BirthChart = {
        elementalState,
        planetaryPositions,
        ascendant: astroState.currentZodiac.toLowerCase() as ZodiacSign,
        ascendantDegree: (astroState.ascendantDegree || 0) % 30, // Get the degree within the sign (0-29)
        lunarPhase: (astroState.moonPhase?.toLowerCase().replace(' ', '_') || 'new_moon') as LunarPhase,
        aspects: this.extractAspects(astroState)
      };
      
      Logger.info(`Created birth chart for birth date ${birthInfo.birthDate}`);
      return birthChart;
      
    } catch (error) {
      Logger.error('Error creating birth chart:', error);
      throw new Error('Failed to create birth chart');
    }
  }
  
  /**
   * Get the current astrological chart
   * @returns Current chart data in the same format as BirthChart
   */
  public async getCurrentChart(): Promise<{
    elementalState: Record<ElementalCharacter, number>;
    planetaryPositions: Record<Planet, number>;
    ascendant: string;
    lunarPhase: LunarPhase;
  }> {
    try {
      const now = new Date();
      const astroState = await AstrologicalService.getAstrologicalState(now, true);
      
      // Extract planetary positions
      const planetaryPositions = {} as Record<Planet, number>;
      
      if (astroState.planetaryPositions) {
        Object.entries(astroState.planetaryPositions).forEach(([planet, position]) => {
          // Skip non-planet entries
          if (!['sun', 'Moon', 'mercury', 'venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(planet)) {
            return;
          }
          
          // Convert to numeric longitude for calculations
          const longDegrees = typeof position === 'number' ? 
            position : 
            (position as any).longitude || 0;
          
          planetaryPositions[planet as Planet] = longDegrees;
        });
      }
      
      // Calculate elemental state based on planet positions
      const elementalState = this.calculateElementalState(planetaryPositions, astroState.dominantElement);
      
      return {
        elementalState,
        planetaryPositions,
        ascendant: astroState.currentZodiac.toLowerCase() as ZodiacSign,
        lunarPhase: (astroState.moonPhase?.toLowerCase().replace(' ', '_') || 'new_moon') as LunarPhase
      };
      
    } catch (error) {
      Logger.error('Error getting current chart:', error);
      throw new Error('Failed to get current chart');
    }
  }
  
  /**
   * Create a composite chart from a birth chart and the current chart
   * @param birthChart User's birth chart
   * @returns Composite chart combining birth and current charts
   */
  public async createCompositeChart(birthChart: BirthChart): Promise<CompositeChart> {
    try {
      // Get the current chart
      const currentChart = await this.getCurrentChart();
      
      // Combine elemental states from both charts (weighted average)
      const compositeElemental = this.combineElementalStates(
        birthChart.elementalState,
        currentChart.elementalState
      );
      
      // Convert to ElementalProperties format
      const compositeElementalBalance: ElementalProperties = {
        Fire: compositeElemental.fire || 0,
        Water: compositeElemental.water || 0,
        Earth: compositeElemental.earth || 0,
        Air: compositeElemental.air || 0
      };
      
      // Calculate alchemical properties using the alchemize function
      const birthInfo = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };
      
      // Create a simplified horoscope dictionary for the alchemizer
      const horoscopeDict = {
        tropical: {
          CelestialBodies: this.createCelestialBodiesFromPositions(
            birthChart.planetaryPositions, 
            currentChart.planetaryPositions
          ),
          Ascendant: { 
            Sign: { label: currentChart.ascendant } 
          },
          Aspects: { points: {} }
        }
      };
      
      // Import and use the alchemize function
      const { alchemize } = require('@/calculations/alchemicalEngine');
      const alchemicalResult = alchemize(birthInfo, horoscopeDict);
      
      // Create the composite chart
      const compositeChart: CompositeChart = {
        timestamp: Date.now(),
        birthChart,
        currentChart,
        compositeElementalBalance,
        alchemicalProperties: {
          Spirit: alchemicalResult.Alchemy_Effects?.Total_Spirit || alchemicalResult.spirit || 0,
          Essence: alchemicalResult.Alchemy_Effects?.Total_Essence || alchemicalResult.essence || 0,
          Matter: alchemicalResult.Alchemy_Effects?.Total_Matter || alchemicalResult.matter || 0,
          Substance: alchemicalResult.Alchemy_Effects?.Total_Substance || alchemicalResult.substance || 0,
          Heat: alchemicalResult.Heat || 0,
          Entropy: alchemicalResult.Entropy || 0,
          Reactivity: alchemicalResult.Reactivity || 0,
          Energy: alchemicalResult.Energy || 0
        },
        dominantElement: alchemicalResult.Dominant_Element || alchemicalResult.dominantElement || 'Balanced'
      };
      
      Logger.info('Created composite chart combining birth and current charts');
      return compositeChart;
      
    } catch (error) {
      Logger.error('Error creating composite chart:', error);
      throw new Error('Failed to create composite chart');
    }
  }
  
  /**
   * Calculate elemental state from planetary positions
   */
  private calculateElementalState(
    planetaryPositions: Record<Planet, number>,
    dominantElement?: string
  ): Record<ElementalCharacter, number> {
    // Map of zodiac signs to elements
    const signToElement: Record<string, ElementalCharacter> = {
      // Fire signs
      'aries': 'Fire',
      'leo': 'Fire',
      'sagittarius': 'Fire',
      // Earth signs
      'taurus': 'Earth',
      'virgo': 'Earth',
      'capricorn': 'Earth',
      // Air signs
      'gemini': 'Air',
      'libra': 'Air',
      'aquarius': 'Air',
      // Water signs
      'cancer': 'Water',
      'scorpio': 'Water',
      'pisces': 'Water'
    };
    
    // Initialize elemental state
    const elementalState: Record<ElementalCharacter, number> = {
      Fire: 0,
      Earth: 0,
      Air: 0,
      Water: 0
    };
    
    // Calculate the sign for each planet position
    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      const signIndex = Math.floor((position % 360) / 30);
      const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                     'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      const sign = signs[signIndex];
      const element = signToElement[sign];
      
      // Weight planets differently
      let weight = 1;
      if (planet === 'sun' || planet === 'Moon') {
        weight = 3;
      } else if (planet === 'mercury' || planet === 'venus' || planet === 'Mars') {
        weight = 2;
      }
      
      // Add to elemental state
      elementalState[element] += weight;
    });
    
    // If we have a dominant element from the astrological state, boost it
    if (dominantElement) {
      const domElement = dominantElement.charAt(0).toUpperCase() + dominantElement.slice(1).toLowerCase();
      if (elementalState[domElement as ElementalCharacter] !== undefined) {
        elementalState[domElement as ElementalCharacter] += 2;
      }
    }
    
    // Normalize values to be between 0 and 1
    const total = Object.values(elementalState).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(elementalState).forEach(key => {
        elementalState[key as ElementalCharacter] /= total;
      });
    }
    
    return elementalState;
  }
  
  /**
   * Combine elemental states from birth and current charts
   * Using a weighted average (60% birth chart, 40% current chart)
   */
  private combineElementalStates(
    birthElemental: Record<ElementalCharacter, number>,
    currentElemental: Record<ElementalCharacter, number>,
    birthWeight = 0.6
  ): Record<string, number> {
    const currentWeight = 1 - birthWeight;
    
    // Convert to lowercase keys for consistency with alchemize function
    return {
      fire: (birthElemental.Fire * birthWeight) + (currentElemental.Fire * currentWeight),
      earth: (birthElemental.Earth * birthWeight) + (currentElemental.Earth * currentWeight),
      water: (birthElemental.Water * birthWeight) + (currentElemental.Water * currentWeight),
      air: (birthElemental.Air * birthWeight) + (currentElemental.Air * currentWeight)
    };
  }
  
  /**
   * Extract astrological aspects from astro state
   */
  private extractAspects(astroState: unknown): AstrologicalAspect[] {
    const aspects: AstrologicalAspect[] = [];
    const validPlanets = ['sun', 'Moon', 'mercury', 'venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    // Check if we have an aspects object
    if (!astroState.activeAspects || !Array.isArray(astroState.activeAspects)) {
      return aspects;
    }
    
    // Convert string aspects to typed aspects
    astroState.activeAspects.forEach((aspect: string) => {
      // Parse aspects in format "Planet1 AspectType Planet2"
      const parts = aspect.split(' ');
      if (parts.length >= 3) {
        const planet1 = parts[0];
        const aspectType = parts[1];
        const planet2 = parts[2];
        
        // Only include aspects between valid planets
        if (validPlanets.includes(planet1) && validPlanets.includes(planet2)) {
          aspects.push({
            planet1: planet1 as Planet,
            planet2: planet2 as Planet,
            aspectType: this.normalizeAspectType(aspectType),
            orb: 2 // Default orb
          });
        }
      }
    });
    
    return aspects;
  }
  
  /**
   * Normalize aspect type to standard format
   */
  private normalizeAspectType(aspectType: string): 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile' {
    const normalized = aspectType.toLowerCase();
    
    if (normalized.includes('conjunct')) return 'Conjunction';
    if (normalized.includes('oppos')) return 'Opposition';
    if (normalized.includes('trine')) return 'Trine';
    if (normalized.includes('square')) return 'Square';
    if (normalized.includes('sextile')) return 'Sextile';
    
    // Default to conjunction
    return 'Conjunction';
  }
  
  /**
   * Create CelestialBodies object for alchemizer from planetary positions
   */
  private createCelestialBodiesFromPositions(
    birthPositions: Record<Planet, number>,
    currentPositions: Record<Planet, number>
  ): Record<string, unknown> {
    const celestialBodies: Record<string, unknown> = {
      all: []
    };
    
    // Map of zodiac signs by index
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Create entries for each planet combining birth and current positions
    Object.entries(birthPositions).forEach(([planet, birthPosition]) => {
      const currentPosition = currentPositions[planet as Planet] || birthPosition;
      
      // Weight birth positions more heavily (60/40)
      const combinedPosition = (birthPosition * 0.6) + (currentPosition * 0.4);
      
      // Calculate sign and degree
      const signIndex = Math.floor((combinedPosition % 360) / 30);
      const degreeInSign = combinedPosition % 30;
      
      // Create planet entry
      const planetEntry = {
        label: planet,
        Sign: { label: signs[signIndex] },
        House: { label: '1' }, // Default house
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: `${Math.floor(degreeInSign)}°`,
            ArcDegreesInSign: degreeInSign
          }
        }
      };
      
      // Add to celestial bodies
      celestialBodies[planet.toLowerCase()] = planetEntry;
      celestialBodies.all.push(planetEntry);
    });
    
    return celestialBodies;
  }
  
  /**
   * Create a default composite chart using current planetary data
   * Used when we need to create a chart without birth data
   */
  public async getDefaultCompositeChart(): Promise<CompositeChart> {
    try {
      // Get the current chart
      const currentChart = await this.getCurrentChart();
      
      // Import the alchemize function
      const { alchemize } = require('@/calculations/alchemicalEngine');
      
      // Create a minimal birth chart using the current positions
      const birthChart: BirthChart = {
        elementalState: currentChart.elementalState,
        planetaryPositions: currentChart.planetaryPositions,
        ascendant: currentChart.ascendant,
        lunarPhase: currentChart.lunarPhase,
        aspects: []
      };
      
      // Create a minimal horoscope dictionary for the alchemizer
      const birthInfo = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };
      
      const horoscopeDict = {
        tropical: {
          CelestialBodies: this.createCelestialBodiesFromPositions(
            currentChart.planetaryPositions,
            currentChart.planetaryPositions
          ),
          Ascendant: { 
            Sign: { label: currentChart.ascendant } 
          },
          Aspects: { points: {} }
        }
      };
      
      const alchemicalResult = alchemize(birthInfo, horoscopeDict);
      
      // Convert elementalState to ElementalProperties format
      const elementalProperties: ElementalProperties = {
        Fire: currentChart.elementalState.Fire || 0,
        Water: currentChart.elementalState.Water || 0,
        Earth: currentChart.elementalState.Earth || 0,
        Air: currentChart.elementalState.Air || 0
      };
      
      // Create the composite chart
      const compositeChart: CompositeChart = {
        timestamp: Date.now(),
        birthChart,
        currentChart,
        compositeElementalBalance: elementalProperties,
        alchemicalProperties: {
          Spirit: alchemicalResult.Alchemy_Effects?.Total_Spirit || alchemicalResult.spirit || 0,
          Essence: alchemicalResult.Alchemy_Effects?.Total_Essence || alchemicalResult.essence || 0,
          Matter: alchemicalResult.Alchemy_Effects?.Total_Matter || alchemicalResult.matter || 0,
          Substance: alchemicalResult.Alchemy_Effects?.Total_Substance || alchemicalResult.substance || 0,
          Heat: alchemicalResult.Heat || 0,
          Entropy: alchemicalResult.Entropy || 0,
          Reactivity: alchemicalResult.Reactivity || 0,
          Energy: alchemicalResult.Energy || 0
        },
        dominantElement: alchemicalResult.Dominant_Element || alchemicalResult.dominantElement || 'Balanced'
      };
      
      Logger.info('Created default composite chart from current chart');
      return compositeChart;
      
    } catch (error) {
      Logger.error('Error creating default composite chart:', error);
      throw new Error('Failed to create default composite chart');
    }
  }
} 