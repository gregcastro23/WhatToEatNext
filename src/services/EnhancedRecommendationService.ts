import { AstrologicalState, _ElementalProperties, _ChakraEnergies, Season , _Element } from '@/types/alchemy';
import { getTarotCardsForDate, getTarotFoodRecommendations } from '../lib/tarotCalculations';
import { getRecommendedIngredients } from '../utils/recommendation/foodRecommendation';

import { SignEnergyState, ZodiacSign } from '../constants/signEnergyStates';
import { CHAKRA_BALANCING_FOODS, calculateChakraEnergies } from '../constants/chakraMappings';
import { EnhancedIngredient } from '../utils/recommendation/ingredientRecommendation';
import { 
// NEW: Phase 7 unified flavor system integration
  calculateFlavorCompatibility,
  UnifiedFlavorProfile,
  getFlavorProfile,
  unifiedFlavorEngine
} from '../data/unified/unifiedFlavorEngine';
import { getCurrentSeason } from '../utils/dateUtils';
import { ChakraService, ChakraEnergyState } from '@/services/ChakraService';
import { WiccanCorrespondenceService } from '@/services/WiccanCorrespondenceService';


import { CHAKRA_NUTRITIONAL_CORRELATIONS, CHAKRA_HERBS } from "@/constants/chakraSymbols";
// Phase 8: Performance optimization imports
import { 
  flavorCompatibilityCache, 
  astrologicalProfileCache, 
  ingredientProfileCache, 
  performanceMonitor 
} from './PerformanceCache';


export interface EnhancedRecommendation {
  ingredient: EnhancedIngredient;
  score: number;
  reasons: string[];
  chakraAlignment: {
    dominantChakra: string;
    energyLevel: number;
    balanceState: 'balanced' | 'underactive' | 'overactive';
  };
  tarotInfluence?: {
    card: string;
    element: Element;
    recommendation: string;
  };
  wiccanProperties?: {
    magicalAttributes: string[];
    planetaryRulers: string[];
  };
  // NEW: Phase 7 unified flavor scoring
  flavorCompatibility?: {
    overall: number;
    elemental: number;
    kalchm: number;
    monica: number;
    seasonal: number;
    cultural: number;
    nutritional: number;
    breakdown: {
      elementalDetails: { [key: string]: number };
      flavorHarmony: { [key: string]: number };
      seasonalAlignment: { [key: string]: number };
      culturalResonance: string[];
    };
    recommendations: string[];
    optimizations: string[];
  };
}

export interface EnhancedRecommendationResult {
  recommendations: EnhancedRecommendation[];
  chakraGuidance: {
    imbalancedChakras: string[];
    recommendedFoods: Record<string, string[]>;
    dietaryAdjustments: string[];
  };
  tarotGuidance: {
    dailyCard: string;
    element: Element;
    cookingApproach: string;
    flavors: string[];
    insights: string;
  };
  overallScore: number;
}

export class EnhancedRecommendationService {
  private chakraService: ChakraService;
  private wiccanService: WiccanCorrespondenceService;

  constructor() {
    this.chakraService = new ChakraService();
    this.wiccanService = new WiccanCorrespondenceService();
  }

  /**
   * Get enhanced food recommendations with chakra, tarot, and wiccan influences
   */
  async getEnhancedRecommendations(
    astroState: AstrologicalState,
    userPreferences?: {
      dietary?: string[];
      taste?: { [key: string]: number };
      chakraFocus?: string[];
    }
  ): Promise<EnhancedRecommendationResult>  {
    try {
      // Get base recommendations
      const baseRecommendations = await getRecommendedIngredients(astroState);

      // Calculate chakra energies from astrological state
      const chakraEnergies = this.calculateChakraEnergiesFromAstroState(astroState);
      
      // Get chakra energy states
      const signEnergyStates = this.convertAstroStateToSignEnergies(astroState);
      const chakraEnergyStates = this.chakraService.calculateChakraEnergyStates(signEnergyStates);

      // Get tarot guidance for today
      const tarotGuidance = getTarotFoodRecommendations(new Date());

      // Get chakra-based food recommendations
      const chakraFoodRecommendations = this.chakraService.getFoodRecommendations(chakraEnergyStates);

      // Enhance each recommendation with additional data including unified flavor system
      const enhancedRecommendations = await Promise.all(
        baseRecommendations.slice(0, 20).map(async (ingredient) => {
          return await this.enhanceRecommendation(
            ingredient as unknown,
            chakraEnergyStates,
            tarotGuidance,
            astroState,
            chakraEnergies // Pass chakra energies for flavor compatibility
          );
        })
      );

      // Sort by enhanced score
      enhancedRecommendations.sort((a, b) => b.score - a.score);

      // Generate chakra guidance
      const chakraGuidance = {
        imbalancedChakras: chakraEnergyStates
          .filter(state => state.balanceState !== 'balanced')
          .map(state => state.chakra),
        recommendedFoods: chakraFoodRecommendations,
        dietaryAdjustments: this.chakraService.suggestDietaryAdjustments(
          chakraEnergyStates,
          {
            moonPhase: astroState.lunarPhase,
            sunSign: astroState.currentZodiac
          }
        )
      };

      // Calculate overall score
      const overallScore = enhancedRecommendations.reduce((sum, rec) => sum + rec.score, 0) / enhancedRecommendations.length;

      return {
        recommendations: enhancedRecommendations,
        chakraGuidance,
        tarotGuidance: {
          dailyCard: (tarotGuidance as unknown)?.dailyCard || 'Unknown',
          element: (tarotGuidance as unknown)?.element as unknown as Element,
          cookingApproach: (tarotGuidance as unknown)?.cookingApproach || 'Balanced',
          flavors: (tarotGuidance as unknown)?.flavors || [],
          insights: (tarotGuidance as unknown)?.insights || 'Follow your intuition today.'
        },
        overallScore
      };

    } catch (error) {
      // console.error('Error in enhanced recommendations:', error);
      
      // Fallback to base recommendations with interface compliance
      const baseRecommendations = await getRecommendedIngredients(astroState);
      const fallbackRecommendations: EnhancedRecommendation[] = baseRecommendations.slice(0, 10).map(ingredient => ({
        ingredient,
        score: (ingredient as unknown)?.score || 0.5,
        reasons: ['Base astrological alignment'],
        chakraAlignment: {
          dominantChakra: 'heart',
          energyLevel: 0.5,
          balanceState: 'balanced' as const
        }
      } as unknown as EnhancedRecommendation));

      return {
        recommendations: fallbackRecommendations,
        chakraGuidance: {
          imbalancedChakras: [],
          recommendedFoods: {},
          dietaryAdjustments: []
        },
        tarotGuidance: {
          dailyCard: 'The Sun', // ← Pattern GG-6: dailyCard property already present in fallback
          element: 'Fire' as unknown as Element,
          cookingApproach: 'Energizing',
          flavors: ['warm', 'spicy'],
          insights: 'Focus on warming, energizing foods today.'
        },
        overallScore: 0.5
      };
    }
  }

  /**
   * Enhance a single recommendation with chakra, tarot, wiccan data, and unified flavor compatibility
   */
  private async enhanceRecommendation(
    ingredient: EnhancedIngredient,
    chakraStates: ChakraEnergyState[],
    tarotGuidance,
    astroState: AstrologicalState,
    chakraEnergies?: ChakraEnergies
  ): Promise<EnhancedRecommendation>  {
    let enhancedScore = ingredient.score || 0.5;
    const reasons: string[] = [];

    // Analyze chakra alignment
    const chakraAlignment = this.analyzeChakraAlignment(ingredient, chakraStates);
    
    // Boost score based on chakra needs
    if (chakraAlignment.balanceState === 'underactive') {
      enhancedScore += 0.2;
      reasons?.push(`Helps balance ${chakraAlignment.dominantChakra} chakra`);
    }

    // Analyze tarot influence
    const tarotInfluence = this.analyzeTarotInfluence(ingredient, tarotGuidance);
    if (tarotInfluence) {
      enhancedScore += 0.15;
      reasons?.push(`Aligns with ${tarotInfluence.card} energy`);
    }

    // Get wiccan properties (simplified for now)
    const wiccanProperties = await this.getWiccanProperties(ingredient.name);

    // NEW: Calculate unified flavor compatibility
    const flavorCompatibility = await this.calculateUnifiedFlavorCompatibility(
      ingredient,
      astroState,
      chakraEnergies
    );
    
    if (flavorCompatibility) {
      // Boost score based on flavor compatibility (weighted at 25% of total enhancement)
      const flavorBoost = flavorCompatibility.overall * 0.25;
      enhancedScore += flavorBoost;
      
      // Add flavor-based reasons
      if (flavorCompatibility.overall > 0.8) {
        reasons?.push(`Exceptional flavor harmony (${(flavorCompatibility.overall * 100)?.toFixed(0)}%)`);
      } else if (flavorCompatibility.overall > 0.7) {
        reasons?.push(`Strong flavor compatibility (${(flavorCompatibility.overall * 100)?.toFixed(0)}%)`);
      }
      
      if (flavorCompatibility.kalchm > 0.8) {
        reasons?.push(`High Kalchm resonance`);
      }
      
      if (flavorCompatibility.seasonal > 0.8) {
        reasons?.push(`Perfect seasonal alignment`);
      }
      
      // Add optimization suggestions to reasons
      if ((flavorCompatibility.optimizations || []).length > 0) {
        reasons?.push(...flavorCompatibility.optimizations?.slice(0, 2)); // Limit to 2 optimizations
      }
    }

    // Add base reasons
    if (ingredient.elementalPropertiesState) {
      const dominantElement = this.getDominantElement(ingredient.elementalPropertiesState);
      reasons?.push(`Strong ${dominantElement} element alignment`);
    }

    return {
      ingredient,
      score: Math.min(1.0, enhancedScore),
      reasons,
      chakraAlignment,
      flavorCompatibility,
      tarotInfluence,
      wiccanProperties
    };
  }

  /**
   * Analyze how an ingredient aligns with chakra needs
   */
  private analyzeChakraAlignment(
    ingredient: EnhancedIngredient,
    chakraStates: ChakraEnergyState[]
  ): { dominantChakra: string; energyLevel: number; balanceState: 'balanced' | 'underactive' | 'overactive' } {
    // Map ingredient elements to chakras
    const elementChakraMap: { [key: string]: string } = {
      'Fire': 'Solar Plexus',
      'Water': 'Sacral',
      'Earth': 'Root',
      'Air': 'Heart'
    };

    let dominantChakra = 'Heart';
    let energyLevel = 0.5;
    let balanceState: 'balanced' | 'underactive' | 'overactive' = 'balanced';

    if (ingredient.elementalPropertiesState) {
      const dominantElement = this.getDominantElement(ingredient.elementalPropertiesState);
      dominantChakra = elementChakraMap[dominantElement] || 'Heart';
      
      // Find the corresponding chakra state
      const chakraState = chakraStates.find(state => state.chakra === dominantChakra);
      if (chakraState) {
        energyLevel = chakraState.energyLevel;
        balanceState = chakraState.balanceState;
      }
    }

    return { dominantChakra, energyLevel, balanceState };
  }

  /**
   * Analyze tarot influence on ingredient
   */
  private analyzeTarotInfluence(
    ingredient: EnhancedIngredient,
    tarotGuidance: {}
  ): { card: string; element: Element; recommendation: string } | undefined {
    if (!tarotGuidance || !ingredient.elementalPropertiesState) return undefined;

    // Use safe type casting for tarot guidance property access
    const tarotData = tarotGuidance as unknown;
    
    const dominantElement = this.getDominantElement(ingredient.elementalPropertiesState);
    
    // Check if ingredient element matches tarot element
    if (dominantElement?.toLowerCase() === tarotData?.element?.toLowerCase()) {
      return {
        card: tarotData?.dailyCard || 'Unknown',
        element: tarotData?.element,
        recommendation: `This ${dominantElement} ingredient resonates with today's ${tarotData?.element} energy`
      };
    }

    return undefined;
  }

  /**
   * Get wiccan properties for an ingredient
   */
  private async getWiccanProperties(ingredientName: string): Promise<{
    magicalAttributes: string[];
    planetaryRulers: string[];
  }> {
    try {
      const properties = await this.wiccanService.getMagicalProperties(ingredientName);
      return {
        magicalAttributes: properties.magicalAttributes || [],
        planetaryRulers: (properties.planetaryRulers || []).map(p => p?.toString()) || []
      };
    } catch (error) {
      // Return default properties if service fails
      return {
        magicalAttributes: ['nourishing', 'grounding'],
        planetaryRulers: ['Earth']
      };
    }
  }

  /**
   * Calculate chakra energies from astrological state
   */
  private calculateChakraEnergiesFromAstroState(astroState: AstrologicalState): ChakraEnergies {
    // Create zodiac energy record
    const zodiacEnergies: { [key: string]: number } = {
      'aries': 0.5,
      'taurus': 0.5,
      'gemini': 0.5,
      'cancer': 0.5,
      'leo': 0.5,
      'virgo': 0.5,
      'libra': 0.5,
      'scorpio': 0.5,
      'sagittarius': 0.5,
      'capricorn': 0.5,
      'aquarius': 0.5,
      'pisces': 0.5
    };

    // Boost current zodiac sign
    if (astroState.currentZodiac) {
      zodiacEnergies[astroState.currentZodiac?.toLowerCase()] = 0.8;
    }

    // Apply elemental properties if available
    // Use safe type casting for astroState property access
    const astroData = astroState as unknown;
    if (astroData?.elementalState) {
      const { Fire, Water, Earth, Air } = astroData.elementalState;
      
      // Fire signs
      zodiacEnergies['aries'] += Fire * 0.3;
      zodiacEnergies['leo'] += Fire * 0.3;
      zodiacEnergies['sagittarius'] += Fire * 0.3;
      
      // Water signs
      zodiacEnergies['cancer'] += Water * 0.3;
      zodiacEnergies['scorpio'] += Water * 0.3;
      zodiacEnergies['pisces'] += Water * 0.3;
      
      // Earth signs
      zodiacEnergies['taurus'] += Earth * 0.3;
      zodiacEnergies['virgo'] += Earth * 0.3;
      zodiacEnergies['capricorn'] += Earth * 0.3;
      
      // Air signs
      zodiacEnergies['gemini'] += Air * 0.3;
      zodiacEnergies['libra'] += Air * 0.3;
      zodiacEnergies['aquarius'] += Air * 0.3;
    }

    return calculateChakraEnergies(zodiacEnergies as unknown);
  }

  /**
   * Convert astrological state to sign energy states
   */
  private convertAstroStateToSignEnergies(astroState: AstrologicalState): SignEnergyState[] {
    const signs: ZodiacSign[] = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    return (signs || []).map(sign => ({
      sign,
      currentEnergy: sign === astroState.currentZodiac?.toLowerCase() ? 0.8 : 0.5,
      baseEnergy: 0.5,
      planetaryInfluence: 0.1,
      lunarInfluence: 0.1
    })) as unknown as SignEnergyState[];
  }

  /**
   * Get the dominant element from elemental properties
   */
  private getDominantElement(elementalProperties: ElementalProperties): string {
    if (!elementalProperties) {
      return 'Water'; // Default to Water if no properties exist
    }

    const elements = Object.entries(elementalProperties)
      .filter(([key]) => ['Fire', 'Water', 'Earth', 'Air'].includes(key))
      .sort((a, b) => b[1] - a[1]);

    return (elements || []).length > 0 ? elements[0][0] : 'Water';
  }

  /**
   * Calculate unified flavor compatibility for an ingredient
   * Integrates the 7-factor compatibility system from Phase 4
   */
  private async calculateUnifiedFlavorCompatibility(
    ingredient: EnhancedIngredient,
    astroState: AstrologicalState,
    chakraEnergies?: ChakraEnergies
  ): Promise< {
    overall: number;
    elemental: number;
    kalchm: number;
    monica: number;
    seasonal: number;
    cultural: number;
    nutritional: number;
    breakdown: {
      elementalDetails: { [key: string]: number };
      flavorHarmony: { [key: string]: number };
      seasonalAlignment: { [key: string]: number };
      culturalResonance: string[];
    };
    recommendations: string[];
    optimizations: string[];
  } | null> {
    // Phase 8: Performance monitoring
    const endTiming = performanceMonitor.startTiming('flavorCompatibility');
    
    try {
      // Phase 8: Create cache key for flavor compatibility
      const cacheKey = `${ingredient.name}-${astroState.currentZodiac}-${JSON.stringify(chakraEnergies || {})}-${getCurrentSeason()}`;
      
      // Check cache first
      const cachedResult = flavorCompatibilityCache.get(cacheKey);
      if (cachedResult) {
        endTiming();
        return cachedResult;
      }
      
      // Convert ingredient to UnifiedFlavorProfile (with caching)
      const ingredientProfile = this.convertToFlavorProfileCached(ingredient);
      if (!ingredientProfile) {
        endTiming();
        return null;
      }
      
      // Create reference profile based on current astrological and chakra state (with caching)
      const referenceProfile = this.createAstrologicalReferenceProfileCached(astroState, chakraEnergies);
      
      // Calculate compatibility using unified engine
      const compatibility = calculateFlavorCompatibility(
        ingredientProfile,
        referenceProfile,
        {
          season: getCurrentSeason() as Season,
          culturalPreference: 'universal', // Default to universal
          preparationMethod: 'balanced' // Default preparation method
        }
      );
      
      const result = {
        overall: compatibility.overall,
        elemental: compatibility.elemental,
        kalchm: compatibility.kalchm,
        monica: compatibility.monica,
        seasonal: compatibility.seasonal,
        cultural: compatibility.cultural,
        nutritional: compatibility.nutritional,
        breakdown: {
          elementalDetails: compatibility.breakdown.elementalDetails,
          flavorHarmony: compatibility.breakdown.flavorHarmony,
          seasonalAlignment: compatibility.breakdown.seasonalAlignment,
          culturalResonance: compatibility.breakdown.culturalResonance
        },
        recommendations: compatibility.recommendations,
        optimizations: compatibility.optimizations
      };
      
      // Phase 8: Cache the result with 10-minute TTL
      flavorCompatibilityCache.set(cacheKey, result, 600000);
      
      endTiming();
      return result;
    } catch (error) {
      // console.warn('Error calculating unified flavor compatibility:', error);
      endTiming();
      return null;
    }
  }

  /**
   * Convert ingredient to UnifiedFlavorProfile (Phase 8: Cached version)
   */
  private convertToFlavorProfileCached(ingredient: EnhancedIngredient): UnifiedFlavorProfile | null {
    const cacheKey = `ingredient-profile-${ingredient.name}`;
    
    // Check cache first
    const cachedProfile = ingredientProfileCache.get(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }
    
    const profile = this.convertToFlavorProfile(ingredient);
    if (profile) {
      // Cache for 30 minutes
      ingredientProfileCache.set(cacheKey, profile, 1800000);
    }
    
    return profile;
  }

  /**
   * Convert ingredient to UnifiedFlavorProfile (original method)
   */
  private convertToFlavorProfile(ingredient: EnhancedIngredient): UnifiedFlavorProfile | null {
    try {
      // Check if profile already exists in unified system
      const existingProfile = getFlavorProfile(ingredient.name?.toLowerCase()?.replace(/\s+/g, '-'));
      if (existingProfile) return existingProfile;
      
      // Create profile from ingredient data
      return {
        id: ingredient.name?.toLowerCase()?.replace(/\s+/g, '-'),
        name: ingredient.name,
        category: 'ingredient',
        baseNotes: {
          sweet: ingredient.flavorProfile?.sweet || 0.2,
          sour: ingredient.flavorProfile?.sour || 0.2,
          salty: ingredient.flavorProfile?.salty || 0.2,
          bitter: ingredient.flavorProfile?.bitter || 0.2,
          umami: ingredient.flavorProfile?.umami || 0.2,
          spicy: ingredient.flavorProfile?.spicy || 0
        },
        elementalFlavors: ingredient.elementalPropertiesState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        },
        intensity: ingredient.intensity || 0.5,
        complexity: ingredient.complexity || 0.5,
        kalchm: ingredient.kalchm || 1.0,
        monicaOptimization: ingredient.monica || 1.0,
        alchemicalProperties: {
          Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25
        },
        seasonalPeak: (ingredient.currentSeason as Season[]) || ['spring', 'summer', 'autumn', 'winter'],
        seasonalModifiers: {
          spring: 1,
          summer: 1,
          autumn: 1,
          winter: 1,
          all: 1,
          fall: 1
        },
        culturalOrigins: ingredient.culturalOrigins || [ingredient.category || 'universal'],
        pairingRecommendations: [],
        preparationMethods: ['raw', 'cooked'],
        nutritionalSynergy: 0.7,
        temperatureOptimal: 20,
        description: `${ingredient.name} ingredient`,
        tags: ingredient.qualities || [],
        lastUpdated: new Date()
      };
    } catch (error) {
      // console.warn('Error converting ingredient to flavor profile:', error);
      return null;
    }
  }

  /**
   * Create reference profile based on current astrological and chakra state (Phase 8: Cached version)
   */
  private createAstrologicalReferenceProfileCached(
    astroState: AstrologicalState,
    chakraEnergies?: ChakraEnergies
  ): UnifiedFlavorProfile  {
    const cacheKey = `astro-profile-${astroState.currentZodiac}-${JSON.stringify(chakraEnergies || {})}`;
    
    // Check cache first
    const cachedProfile = astrologicalProfileCache.get(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }
    
    const profile = this.createAstrologicalReferenceProfile(astroState, chakraEnergies);
    
    // Cache for 5 minutes (astrological states change frequently)
    astrologicalProfileCache.set(cacheKey, profile, 300000);
    
    return profile;
  }

  /**
   * Create reference profile based on current astrological and chakra state (original method)
   */
  private createAstrologicalReferenceProfile(
    astroState: AstrologicalState,
    chakraEnergies?: ChakraEnergies
  ): UnifiedFlavorProfile  {
    // Calculate elemental properties from astrological state
    // Use safe type casting for astroState property access
    const astroData = astroState as unknown;
    const elementalProps = astroData?.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    };
    
    // Enhance with chakra influences if available
    if (chakraEnergies) {
      // Root chakra influences Earth element
      elementalProps.Earth += (chakraEnergies.root || 0) * 0.1;
      // Heart chakra influences Air element
      elementalProps.Air += (chakraEnergies.heart || 0) * 0.1;
      // Solar plexus influences Fire element
      elementalProps.Fire += (chakraEnergies.solarPlexus || 0) * 0.1;
      // Sacral chakra influences Water element
      elementalProps.Water += (chakraEnergies.sacral || 0) * 0.1;
      
      // Normalize to ensure sum equals 1
      // Pattern KK-8: Advanced calculation safety for reduction and division operations
      const sum = Object.values(elementalProps)?.reduce((a, b) => {
        const numericA = Number(a) || 0;
        const numericB = Number(b) || 0;
        return numericA + numericB;
      }, 0) || 0;
      const numericSum = Number(sum) || 0;
      if (numericSum > 0) {
        Object.keys(elementalProps || {}).forEach(key => {
          const currentValue = Number(elementalProps[key as "Fire" | "Water" | "Earth" | "Air"]) || 0;
          elementalProps[key as "Fire" | "Water" | "Earth" | "Air"] = currentValue / numericSum;
        });
      }
    }
    
    return {
      id: 'astrological-state',
      name: 'Current Astrological State',
      category: 'elemental',
      baseNotes: {
        sweet: elementalProps.Earth * 0.4 + elementalProps.Water * 0.3,
        sour: elementalProps.Fire * 0.3 + elementalProps.Air * 0.2,
        salty: elementalProps.Water * 0.4 + elementalProps.Earth * 0.3,
        bitter: elementalProps.Fire * 0.4 + elementalProps.Air * 0.3,
        umami: elementalProps.Earth * 0.5 + elementalProps.Water * 0.2,
        spicy: elementalProps.Fire * 0.6 + elementalProps.Air * 0.2
      },
      elementalFlavors: elementalProps,
      intensity: 0.5,
      complexity: 0.5,
      kalchm: 1.0,
      monicaOptimization: 1.0,
      alchemicalProperties: {
        Spirit: elementalProps.Fire * 0.7 + elementalProps.Air * 0.3,
        Essence: elementalProps.Water * 0.6 + elementalProps.Fire * 0.4,
        Matter: elementalProps.Earth * 0.8 + elementalProps.Water * 0.2,
        Substance: elementalProps.Earth * 0.5 + elementalProps.Air * 0.5
      },
      seasonalPeak: [getCurrentSeason() as Season],
      seasonalModifiers: {
        spring: 1,
        summer: 1,
        autumn: 1,
        winter: 1,
        all: 1,
        fall: 1
      },
      culturalOrigins: ['universal'],
      pairingRecommendations: [],
      preparationMethods: ['balanced'],
      nutritionalSynergy: 0.7,
      temperatureOptimal: 20,
      description: 'Current astrological and chakra state',
      tags: ['current', 'astrological', 'chakra'],
      lastUpdated: new Date()
    };
  }
}

export const enhancedRecommendationService = new EnhancedRecommendationService(); 