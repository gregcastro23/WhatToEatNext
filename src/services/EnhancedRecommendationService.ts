import { CHAKRA_NUTRITIONAL_CORRELATIONS, CHAKRA_HERBS } from "@/constants/chakraSymbols";
import { ChakraService, ChakraEnergyState } from '@/services/ChakraService';
import { WiccanCorrespondenceService } from '@/services/WiccanCorrespondenceService';
import { AstrologicalState, ElementalProperties, ChakraEnergies, Season , Element } from '@/types/alchemy';

import { CHAKRA_BALANCING_FOODS, calculateChakraEnergies } from '../constants/chakraMappings';
import { SignEnergyState, ZodiacSign } from '../constants/signEnergyStates';
import { 
// NEW: Phase 7 unified flavor system integration
  calculateFlavorCompatibility,
  UnifiedFlavorProfile,
  getFlavorProfile,
  unifiedFlavorEngine
} from '../data/unified/unifiedFlavorEngine';
import { getTarotCardsForDate, getTarotFoodRecommendations } from '../lib/tarotCalculations';
import { getCurrentSeason } from '../utils/dateUtils';
import { getRecommendedIngredients } from '../utils/recommendation/foodRecommendation';
import { EnhancedIngredient } from '../utils/recommendation/ingredientRecommendation';

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
   * Safe element extraction with validation
   */
  private safeGetElement(value: unknown): Element | null {
    if (typeof value === 'string') {
      const validElements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() as Element;
      return validElements.includes(capitalizedValue) ? capitalizedValue : null;
    }
    return null;
  }
  
  /**
   * Safe string extraction
   */
  private safeGetString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }
  
  /**
   * Safe number extraction
   */
  private safeGetNumber(value: unknown): number {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  }
  
  /**
   * Safe elemental properties extraction
   */
  private safeExtractElementalProperties(value: unknown): ElementalProperties {
    if (!value || typeof value !== 'object') {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    const props = value as Record<string, unknown>;
    return {
      Fire: this.safeGetNumber(props.Fire),
      Water: this.safeGetNumber(props.Water),
      Earth: this.safeGetNumber(props.Earth),
      Air: this.safeGetNumber(props.Air)
    };
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
  ): Promise<EnhancedRecommendationResult> {
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
          // Create a proper EnhancedIngredient from the base recommendation
          const ingredientData = ingredient as unknown as Record<string, unknown>;
          const enhancedIngredient: EnhancedIngredient = {
            ...ingredient,
            name: ingredient.name || 'Unknown',
            astrologicalProfile: ingredientData.astrologicalProfile || {},
            elementalPropertiesState: ingredient.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            score: typeof ingredientData.score === 'number' ? ingredientData.score : 0.5,
            // Add missing required properties for EnhancedIngredient
            amount: typeof ingredientData.amount === 'number' ? ingredientData.amount : 1,
            unit: typeof ingredientData.unit === 'string' ? ingredientData.unit : 'serving',
            element: this.safeGetElement(ingredientData.element) || 'Air'
          };
          
          return await this.enhanceRecommendation(
            enhancedIngredient,
            chakraEnergyStates,
            tarotGuidance as Record<string, unknown>,
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
          dailyCard: (tarotGuidance as { dailyCard?: string }).dailyCard || 'Unknown',
          element: (tarotGuidance as { element?: Element }).element || 'Air',
          cookingApproach: (tarotGuidance as { cookingApproach?: string }).cookingApproach || 'Balanced',
          flavors: (tarotGuidance as { flavors?: string[] }).flavors || [],
          insights: (tarotGuidance as { insights?: string }).insights || 'Follow your intuition today.'
        },
        overallScore
      };

    } catch (error) {
      console.error('Error in enhanced recommendations:', error);
      
      // Fallback to base recommendations with interface compliance
      const baseRecommendations = await getRecommendedIngredients(astroState);
      const fallbackRecommendations: EnhancedRecommendation[] = baseRecommendations.slice(0, 10).map(ingredient => ({
        ingredient,
        score: (ingredient as unknown as Record<string, unknown>).score || 0.5,
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
  ): Promise<EnhancedRecommendation> {
    let enhancedScore = ingredient.score || 0.5;
    const reasons: string[] = [];

    // Analyze chakra alignment
    const chakraAlignment = this.analyzeChakraAlignment(ingredient, chakraStates);
    
    // Boost score based on chakra needs
    if (chakraAlignment.balanceState === 'underactive') {
      enhancedScore += 0.2;
      reasons.push(`Helps balance ${chakraAlignment.dominantChakra} chakra`);
    }

    // Analyze tarot influence
    const tarotInfluence = this.analyzeTarotInfluence(ingredient, tarotGuidance);
    if (tarotInfluence) {
      enhancedScore += 0.15;
      reasons.push(`Aligns with ${tarotInfluence.card} energy`);
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
        reasons.push(`Exceptional flavor harmony (${(flavorCompatibility.overall * 100).toFixed(0)}%)`);
      } else if (flavorCompatibility.overall > 0.7) {
        reasons.push(`Strong flavor compatibility (${(flavorCompatibility.overall * 100).toFixed(0)}%)`);
      }
      
      if (flavorCompatibility.kalchm > 0.8) {
        reasons.push(`High Kalchm resonance`);
      }
      
      if (flavorCompatibility.seasonal > 0.8) {
        reasons.push(`Perfect seasonal alignment`);
      }
      
      // Add optimization suggestions to reasons
      if ((flavorCompatibility.optimizations || []).length > 0) {
        reasons.push(...flavorCompatibility.optimizations.slice(0, 2)); // Limit to 2 optimizations
      }
    }

    // Add base reasons
    if (ingredient.elementalProperties) {
      const dominantElement = this.getDominantElement(ingredient.elementalProperties);
      reasons.push(`Strong ${dominantElement} element alignment`);
    }

    return {
      ingredient,
      score: Math.min(1.0, enhancedScore),
      reasons,
      chakraAlignment,
      flavorCompatibility: flavorCompatibility as any,
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

    if (ingredient.elementalProperties) {
      const dominantElement = this.getDominantElement(ingredient.elementalProperties);
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
    if (!tarotGuidance || !ingredient.elementalProperties) return undefined;

    // Use safe type casting for tarot guidance property access
    const tarotData = tarotGuidance as Record<string, unknown>;
    
    const dominantElement = this.getDominantElement(ingredient.elementalProperties);
    
    // Check if ingredient element matches tarot element
    const tarotElement = this.safeGetString(tarotData.element);
    if (dominantElement.toLowerCase() === tarotElement?.toLowerCase()) {
      return {
        card: this.safeGetString(tarotData.dailyCard) || 'Unknown',
        element: this.safeGetElement(tarotData.element) || 'Air',
        recommendation: `This ${dominantElement} ingredient resonates with today's ${tarotElement} energy`
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
        planetaryRulers: (properties.planetaryRulers || []).map(p => p.toString()) || []
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
      zodiacEnergies[astroState.currentZodiac.toLowerCase()] = 0.8;
    }

    // Apply elemental properties if available
    // Use safe type casting for astroState property access
    const astroData = astroState as Record<string, unknown>;
    if (astroData.elementalState) {
      const elementalState = this.safeExtractElementalProperties(astroData.elementalState);
      
      // Fire signs
      zodiacEnergies['aries'] += elementalState.Fire * 0.3;
      zodiacEnergies['leo'] += elementalState.Fire * 0.3;
      zodiacEnergies['sagittarius'] += elementalState.Fire * 0.3;
      
      // Water signs
      zodiacEnergies['cancer'] += elementalState.Water * 0.3;
      zodiacEnergies['scorpio'] += elementalState.Water * 0.3;
      zodiacEnergies['pisces'] += elementalState.Water * 0.3;
      
      // Earth signs
      zodiacEnergies['taurus'] += elementalState.Earth * 0.3;
      zodiacEnergies['virgo'] += elementalState.Earth * 0.3;
      zodiacEnergies['capricorn'] += elementalState.Earth * 0.3;
      
      // Air signs
      zodiacEnergies['gemini'] += elementalState.Air * 0.3;
      zodiacEnergies['libra'] += elementalState.Air * 0.3;
      zodiacEnergies['aquarius'] += elementalState.Air * 0.3;
    }

    const chakraRecord = calculateChakraEnergies(zodiacEnergies as any);
    // Map from Record<Chakra, number> to ChakraEnergies interface
    return {
      root: chakraRecord['Root'] || 0.14,
      sacral: chakraRecord['Sacral'] || 0.14,
      solarPlexus: chakraRecord['Solar Plexus'] || 0.14,
      heart: chakraRecord['Heart'] || 0.14,
      throat: chakraRecord['Throat'] || 0.14,
      thirdEye: chakraRecord['Third Eye'] || 0.14,
      crown: chakraRecord['Crown'] || 0.14
    };
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
    try {
      // Convert ingredient to flavor profile
      const ingredientProfile = this.convertToFlavorProfileCached(ingredient);
      if (!ingredientProfile) {
        return null;
      }

      // Create astrological reference profile
      const astroProfile = this.createAstrologicalReferenceProfileCached(astroState, chakraEnergies);

      // Calculate compatibility using unified flavor engine
      const compatibility = calculateFlavorCompatibility(ingredientProfile, astroProfile);

      // Return structured compatibility result
      return {
        overall: compatibility.overall || 0.5,
        elemental: compatibility.elemental || 0.5,
        kalchm: compatibility.kalchm || 0.5,
        monica: compatibility.monica || 0.5,
        seasonal: compatibility.seasonal || 0.5,
        cultural: compatibility.cultural || 0.5,
        nutritional: compatibility.nutritional || 0.5,
        breakdown: {
          elementalDetails: compatibility.breakdown.elementalDetails || {},
          flavorHarmony: compatibility.breakdown.flavorHarmony || {},
          seasonalAlignment: compatibility.breakdown.seasonalAlignment || {},
          culturalResonance: compatibility.breakdown.culturalResonance || []
        },
        recommendations: compatibility.recommendations || [],
        optimizations: compatibility.optimizations || []
      };
    } catch (error) {
      console.warn('Error calculating unified flavor compatibility:', error);
      return null;
    }
  }

  private convertToFlavorProfileCached(ingredient: EnhancedIngredient): UnifiedFlavorProfile | null {
    try {
      // Check cache first
      const cacheKey = `ingredient_${ingredient.name}`;
      const cached = ingredientProfileCache.get(cacheKey);
      if (cached) {
        return cached as UnifiedFlavorProfile;
      }

      // Convert to flavor profile
      const profile = this.convertToFlavorProfile(ingredient);
      if (profile) {
        ingredientProfileCache.set(cacheKey, profile);
      }
      return profile;
    } catch (error) {
      console.warn('Error converting ingredient to flavor profile:', error);
      return null;
    }
  }

  private convertToFlavorProfile(ingredient: EnhancedIngredient): UnifiedFlavorProfile | null {
    try {
      // Extract ingredient data with safe property access
      const ingredientData = ingredient as unknown as Record<string, unknown>;
      
      // Create basic flavor profile structure
      const profile = {
        id: ingredient.name || 'unknown',
        name: ingredient.name || 'Unknown Ingredient',
        category: 'ingredient' as const,
        baseNotes: {
          sweet: 0, sour: 0, salty: 0, bitter: 0, umami: 0, spicy: 0,
          ...(Array.isArray(ingredientData.baseNotes) ? {} : ingredientData.baseNotes as Record<string, number> || {})
        },
        heartNotes: (ingredientData.heartNotes as string[]) || [],
        topNotes: (ingredientData.topNotes as string[]) || [],
        elementalProfile: {
          Fire: this.safeGetNumber((ingredientData.elementalProperties as Record<string, unknown>).Fire),
          Water: this.safeGetNumber((ingredientData.elementalProperties as Record<string, unknown>).Water),
          Earth: this.safeGetNumber((ingredientData.elementalProperties as Record<string, unknown>).Earth),
          Air: this.safeGetNumber((ingredientData.elementalProperties as Record<string, unknown>).Air)
        },
        flavorIntensity: this.safeGetNumber(ingredientData.flavorIntensity) || 0.5,
        complexity: this.safeGetNumber(ingredientData.complexity) || 0.5,
        seasonality: (ingredientData.seasonality as string[]) || [],
        culturalOrigins: (ingredientData.culturalOrigins as string[]) || [],
        nutritionalProfile: {
          calories: this.safeGetNumber((ingredientData.nutritionalProfile as Record<string, unknown>).calories),
          protein: this.safeGetNumber((ingredientData.nutritionalProfile as Record<string, unknown>).protein),
          fat: this.safeGetNumber((ingredientData.nutritionalProfile as Record<string, unknown>).fat),
          carbohydrates: this.safeGetNumber((ingredientData.nutritionalProfile as Record<string, unknown>).carbohydrates),
          fiber: this.safeGetNumber((ingredientData.nutritionalProfile as Record<string, unknown>).fiber)
        },
        preparationMethods: (ingredientData.preparationMethods as string[]) || [],
        pairings: (ingredientData.pairings as string[]) || [],
        contraindications: (ingredientData.contraindications as string[]) || [],
        kalchm: this.safeGetNumber(ingredientData.kalchm) || 0.5,
        monica: this.safeGetNumber(ingredientData.monica) || 0.5
      };

      return profile as unknown as UnifiedFlavorProfile;
    } catch (error) {
      console.warn('Error creating flavor profile:', error);
      return null;
    }
  }

  private createAstrologicalReferenceProfileCached(
    astroState: AstrologicalState,
    chakraEnergies?: ChakraEnergies
  ): UnifiedFlavorProfile {
    try {
      // Check cache first
      const cacheKey = `astro_${astroState.currentZodiac}_${astroState.lunarPhase}`;
      const cached = astrologicalProfileCache.get(cacheKey);
      if (cached) {
        return cached as UnifiedFlavorProfile;
      }

      // Create profile
      const profile = this.createAstrologicalReferenceProfile(astroState, chakraEnergies);
      astrologicalProfileCache.set(cacheKey, profile);
      return profile;
    } catch (error) {
      console.warn('Error creating cached astrological profile:', error);
      return this.createAstrologicalReferenceProfile(astroState, chakraEnergies);
    }
  }

  private createAstrologicalReferenceProfile(
    astroState: AstrologicalState,
    chakraEnergies?: ChakraEnergies
  ): UnifiedFlavorProfile  {
    try {
      // Extract astro state data with safe property access
      const astroData = astroState as unknown as Record<string, unknown>;
      const elementalProps = astroData.elementalProperties as Record<string, unknown>;
      
      // Create astrological reference profile
      const profile = {
        id: `astro_${astroState.currentZodiac}`,
        name: `Astrological Profile - ${astroState.currentZodiac}`,
        category: 'elemental' as const,
        baseNotes: {
          sweet: 0.3, sour: 0.1, salty: 0.1, bitter: 0.2, umami: 0.2, spicy: 0.1
        },
        heartNotes: ['balanced', 'aligned', 'resonant'],
        topNotes: ['dynamic', 'flowing', 'energetic'],
        elementalProfile: {
          Fire: this.safeGetNumber(elementalProps.Fire),
          Water: this.safeGetNumber(elementalProps.Water),
          Earth: this.safeGetNumber(elementalProps.Earth),
          Air: this.safeGetNumber(elementalProps.Air)
        },
        flavorIntensity: 0.7,
        complexity: 0.8,
        seasonality: [getCurrentSeason()],
        culturalOrigins: ['universal'],
        nutritionalProfile: {
          calories: 0,
          protein: 0,
          fat: 0,
          carbohydrates: 0,
          fiber: 0
        },
        preparationMethods: ['meditation', 'alignment', 'harmony'],
        pairings: ['all ingredients'],
        contraindications: [],
        kalchm: 0.5,
        monica: 0.5
      };

      return profile as unknown as UnifiedFlavorProfile;
    } catch (error) {
      console.warn('Error creating astrological profile:', error);
      // Return default profile
      return {
        id: 'default_astro',
        name: 'Default Astrological Profile',
        category: 'elemental' as const,
        baseNotes: {
          sweet: 0.25, sour: 0.25, salty: 0.25, bitter: 0.25, umami: 0, spicy: 0
        },
        heartNotes: ['balanced'],
        topNotes: ['harmonious'],
        elementalProfile: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        flavorIntensity: 0.5,
        complexity: 0.5,
        seasonality: ['all'],
        culturalOrigins: ['universal'],
        nutritionalProfile: { calories: 0, protein: 0, fat: 0, carbohydrates: 0, fiber: 0 },
        preparationMethods: ['general'],
        pairings: ['all'],
        contraindications: [],
        kalchm: 0.5,
        monica: 0.5
      } as unknown as UnifiedFlavorProfile;
    }
  }
}

export const enhancedRecommendationService = new EnhancedRecommendationService(); 