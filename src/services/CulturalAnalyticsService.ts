// Cultural Analytics and Intelligence Service
// Implements cross-cultural compatibility analysis, cultural synergy scoring,
// and fusion cuisine recommendations for the CuisineRecommender component

import {culinaryTraditions, _CuisineProfile} from '@/data/cuisines/culinaryTraditions';
import {culturalRules, _getCulturalRecommendations} from '@/data/culturalrules';
import {ElementalProperties, _ZodiacSign, LunarPhase} from '@/types/alchemy';
import {logger} from '@/utils/logger';

// ===== INTERFACES =====,

export interface CulturalAnalytics {
  culturalSynergy: number,
  culturalCompatibility: number,
  historicalSignificance: string,
  culturalContext: string,
  fusionPotential: number,
  culturalDiversityScore: number,
  traditionalPrinciples: string[],
  modernAdaptations: string[]
}

export interface CulturalSynergyScore {
  score: number,
  reasoning: string[],
  culturalGroup: string,
  proximityBonus: number,
  diversityBonus: number
}

export interface FusionCuisineRecommendation {
  name: string,
  parentCuisines: string[],
  fusionScore: number,
  culturalHarmony: number,
  recommendedDishes: string[],
  culturalNotes: string[],
  blendRatio: number,
  seasonalOptimization: Record<string, number>
}

export interface CulturalContext {
  origin: string,
  historicalPeriod: string,
  culturalInfluences: string[],
  traditionalOccasions: string[],
  modernEvolution: string[],
  globalAdaptations: string[]
}

// ===== CULTURAL GROUPS AND PROXIMITY =====,

const CULTURAL_GROUPS = {
  east_asian: {
    cuisines: ['chinese', 'japanese', 'korean', 'vietnamese', 'thai', 'sichuanese'],
    characteristics: ['rice-based', 'umami-focused', 'balance-oriented', 'seasonal'],
    sharedPrinciples: ['five elements', 'yin-yang balance', 'seasonal harmony']
  },
  south_asian: {
    cuisines: ['indian'],
    characteristics: ['spice-complex', 'ayurvedic', 'vegetarian-friendly', 'medicinal'],
    sharedPrinciples: ['six tastes', 'dosha balance', 'medicinal cooking']
  },
  mediterranean: {
    cuisines: ['italian', 'greek', 'spanish', 'middle-eastern', 'mediterranean'],
    characteristics: ['olive oil-based', 'herb-rich', 'seafood-focused', 'communal'],
    sharedPrinciples: ['simplicity', 'fresh ingredients', 'social dining']
  },
  european: {
    cuisines: ['french', 'italian', 'spanish', 'greek'],
    characteristics: ['technique-focused', 'wine-paired', 'seasonal', 'refined'],
    sharedPrinciples: ['culinary artistry', 'terroir', 'classical techniques']
  },
  latin_american: {
    cuisines: ['mexican'],
    characteristics: ['corn-based', 'chili-focused', 'indigenous-influenced', 'festive'],
    sharedPrinciples: ['indigenous wisdom', 'celebration food', 'heat balance']
  },
  african: {
    cuisines: ['african'],
    characteristics: ['grain-based', 'communal', 'spice-rich', 'preservation-focused'],
    sharedPrinciples: ['community sharing', 'spice mastery', 'resourcefulness']
  }
},

const HISTORICAL_CONTEXTS: Record<string, CulturalContext> = {
  japanese: {
    origin: 'Japan',
    historicalPeriod: '8th century - present',
    culturalInfluences: [
      'Buddhist philosophy',
      'Shinto traditions',
      'Chinese techniques',
      'Portuguese tempura'
    ],
    traditionalOccasions: ['tea ceremony', 'seasonal festivals', 'New Year celebrations'],
    modernEvolution: ['kaiseki refinement', 'bento culture', 'fusion innovations'],
    globalAdaptations: ['sushi worldwide', 'ramen culture', 'Japanese-French fusion']
  },
  chinese: {
    origin: 'China',
    historicalPeriod: '3000 BCE - present',
    culturalInfluences: ['Confucian philosophy', 'Taoist principles', 'Silk Road trade'],
    traditionalOccasions: ['Chinese New Year', 'Mid-Autumn Festival', 'family gatherings'],
    modernEvolution: ['regional specialization', 'Cantonese refinement', 'Sichuan popularity'],
    globalAdaptations: ['American Chinese', 'fusion techniques', 'dim sum culture']
  },
  indian: {
    origin: 'Indian subcontinent',
    historicalPeriod: '3000 BCE - present',
    culturalInfluences: [
      'Ayurvedic medicine',
      'Mughal empire',
      'British colonial',
      'regional kingdoms'
    ],
    traditionalOccasions: ['Diwali feasts', 'wedding celebrations', 'religious festivals'],
    modernEvolution: [
      'regional cuisine recognition',
      'health-conscious adaptations',
      'global spice trade'
    ],
    globalAdaptations: ['curry houses worldwide', 'Indian-British fusion', 'vegetarian influence']
  },
  italian: {
    origin: 'Italy',
    historicalPeriod: 'Roman Empire - present',
    culturalInfluences: [
      'Roman traditions',
      'Arab Sicily',
      'Renaissance refinement',
      'regional diversity'
    ],
    traditionalOccasions: ['Sunday family meals', 'harvest festivals', 'religious celebrations'],
    modernEvolution: ['pasta perfection', 'pizza globalization', 'slow food movement'],
    globalAdaptations: ['Italian-American', 'pizza worldwide', 'pasta culture']
  },
  french: {
    origin: 'France',
    historicalPeriod: 'Medieval - present',
    culturalInfluences: [
      'Roman Gaul',
      'Medieval guilds',
      'Royal court cuisine',
      'Revolutionary changes'
    ],
    traditionalOccasions: ['harvest celebrations', 'religious feasts', 'family gatherings'],
    modernEvolution: ['haute cuisine development', 'nouvelle cuisine', 'bistro culture'],
    globalAdaptations: ['French technique worldwide', 'culinary schools', 'fine dining standards']
  },
  mexican: {
    origin: 'Mexico',
    historicalPeriod: 'Pre-Columbian - present',
    culturalInfluences: [
      'Aztec traditions',
      'Mayan cuisine',
      'Spanish colonization',
      'indigenous wisdom'
    ],
    traditionalOccasions: ['Day of the Dead', 'harvest festivals', 'family celebrations'],
    modernEvolution: [
      'regional cuisine recognition',
      'street food culture',
      'modern Mexican movement'
    ],
    globalAdaptations: ['Tex-Mex fusion', 'taco culture', 'Mexican-American cuisine']
  },
  thai: {
    origin: 'Thailand',
    historicalPeriod: '13th century - present',
    culturalInfluences: [
      'Khmer empire',
      'Chinese immigration',
      'Indian spices',
      'Royal court refinement'
    ],
    traditionalOccasions: ['Songkran festival', 'Buddhist ceremonies', 'royal celebrations'],
    modernEvolution: ['street food culture', 'royal cuisine preservation', 'global popularity'],
    globalAdaptations: ['Thai restaurants worldwide', 'pad thai popularity', 'curry adaptations']
  },
  'middle-eastern': {
    origin: 'Middle East',
    historicalPeriod: 'Ancient civilizations - present',
    culturalInfluences: ['Persian empire', 'Ottoman rule', 'Arab traditions', 'Spice route trade'],
    traditionalOccasions: ['Ramadan iftar', 'wedding feasts', 'hospitality traditions'],
    modernEvolution: ['regional specialization', 'health consciousness', 'diaspora influence'],
    globalAdaptations: ['Mediterranean diet', 'hummus popularity', 'Middle Eastern fusion']
  }
},

// ===== CULTURAL ANALYTICS SERVICE =====,

export class CulturalAnalyticsService {
  /**
   * Calculate cultural synergy score between cuisines (5% weight in 7-factor algorithm)
   */
  static calculateCulturalSynergy(
    primaryCuisine: string,
    secondaryCuisines: string[] = [],
    options: {
      includeHistoricalContext?: boolean,
      includeFusionPotential?: boolean,
      season?: string
    } = {}
  ): CulturalSynergyScore {
    try {
      const primaryGroup = this.getCulturalGroup(primaryCuisine)
      const allCuisines = [primaryCuisine, ...secondaryCuisines],

      // Base synergy calculation
      let synergyScore = 0.7; // Base score
      let proximityBonus = 0,
      let diversityBonus = 0,
      const reasoning: string[] = []

      // Calculate proximity bonus (same cultural group)
      const sameGroupCuisines = secondaryCuisines.filter(
        cuisine => this.getCulturalGroup(cuisine) === primaryGroup,
      )

      if (sameGroupCuisines.length > 0) {
        proximityBonus = 0.15,
        synergyScore += proximityBonus,
        reasoning.push(`High cultural proximity within ${primaryGroup} group (+${proximityBonus})`)
      }

      // Calculate diversity bonus (different but compatible groups)
      const uniqueGroups = new Set(allCuisines.map(c => this.getCulturalGroup(c)))
      if (uniqueGroups.size > 1 && uniqueGroups.size <= 3) {
        diversityBonus = 0.1,
        synergyScore += diversityBonus,
        reasoning.push(
          `Cultural diversity bonus for ${uniqueGroups.size} cultural groups (+${diversityBonus})`,
        )
      }

      // Apply seasonal cultural preferences
      if (options.season) {
        const seasonalBonus = this.calculateSeasonalCulturalBonus(primaryCuisine, options.season),
        synergyScore += seasonalBonus,
        if (seasonalBonus > 0) {
          reasoning.push(
            `Seasonal cultural alignment for ${options.season} (+${seasonalBonus.toFixed(2)})`,
          )
        }
      }

      // Cap the score at 1.0
      synergyScore = Math.min(1.0, synergyScore)

      return {
        score: synergyScore,
        reasoning,
        culturalGroup: primaryGroup,
        proximityBonus,
        diversityBonus
      },
    } catch (error) {
      logger.error('Error calculating cultural synergy:', error),
      return {
        score: 0.7,
        reasoning: ['Default cultural synergy applied due to calculation error'],
        culturalGroup: 'unknown',
        proximityBonus: 0,
        diversityBonus: 0
      },
    }
  }

  /**
   * Generate comprehensive cultural analytics for a cuisine
   */
  static generateCulturalAnalytics(
    cuisineName: string,
    elementalProfile: ElementalProperties,
    astrologicalState: {
      zodiacSign: any,
      lunarPhase: LunarPhase
    },
  ): CulturalAnalytics {
    try {
      const culturalRulesData = culturalRules[cuisineName];
      const culinaryTradition = culinaryTraditions[cuisineName];
      const historicalContext = HISTORICAL_CONTEXTS[cuisineName]

      // Calculate cultural compatibility with current astrological state
      const culturalCompatibility = this.calculateAstrologicalCulturalCompatibility(
        cuisineName,
        astrologicalState,
      )

      // Calculate cultural synergy
      const synergyData = this.calculateCulturalSynergy(cuisineName)

      // Generate historical significance
      const historicalSignificance = this.generateHistoricalSignificance(
        cuisineName,
        historicalContext,
      )

      // Generate cultural context
      const culturalContext = this.generateCulturalContext(cuisineName, historicalContext)

      // Calculate fusion potential
      const fusionPotential = this.calculateFusionPotential(cuisineName, elementalProfile)

      // Calculate cultural diversity score
      const culturalDiversityScore = this.calculateCulturalDiversityScore(cuisineName)

      // Extract traditional principles
      const traditionalPrinciples = culturalRulesData.principles || [];

      // Generate modern adaptations
      const modernAdaptations = this.generateModernAdaptations(cuisineName, historicalContext),

      return {
        culturalSynergy: synergyData.score
        culturalCompatibility,
        historicalSignificance,
        culturalContext,
        fusionPotential,
        culturalDiversityScore,
        traditionalPrinciples,
        modernAdaptations
      },
    } catch (error) {
      logger.error('Error generating cultural analytics:', error),
      return this.getDefaultCulturalAnalytics(cuisineName)
    }
  }

  /**
   * Generate fusion cuisine recommendations
   */
  static generateFusionRecommendations(
    primaryCuisine: string,
    availableCuisines: string[],
    maxRecommendations: number = 3
  ): FusionCuisineRecommendation[] {
    try {
      const fusionRecommendations: FusionCuisineRecommendation[] = [];

      // Filter out the primary cuisine and evaluate fusion potential
      const candidateCuisines = availableCuisines.filter(c => c !== primaryCuisine)
      for (const secondaryCuisine of candidateCuisines) {
        const fusionData = this.calculateFusionCompatibility(primaryCuisine, secondaryCuisine),

        if (fusionData.fusionScore > 0.6) {
          // Only recommend good fusion potential
          const fusionRecommendation: FusionCuisineRecommendation = {
            name: this.generateFusionName(primaryCuisine, secondaryCuisine),
            parentCuisines: [primaryCuisine, secondaryCuisine],
            fusionScore: fusionData.fusionScore,
            culturalHarmony: fusionData.culturalHarmony,
            recommendedDishes: this.generateFusionDishes(primaryCuisine, secondaryCuisine),
            culturalNotes: this.generateFusionCulturalNotes(primaryCuisine, secondaryCuisine),
            blendRatio: fusionData.blendRatio,
            seasonalOptimization: this.calculateSeasonalFusionOptimization(
              primaryCuisine,
              secondaryCuisine,
            )
          },

          fusionRecommendations.push(fusionRecommendation)
        }
      }

      // Sort by fusion score and return top recommendations
      return fusionRecommendations
        .sort((ab) => b.fusionScore - a.fusionScore)
        .slice(0, maxRecommendations)
    } catch (error) {
      logger.error('Error generating fusion recommendations:', error),
      return []
    }
  }

  // ===== PRIVATE HELPER METHODS =====,

  private static getCulturalGroup(cuisine: string): string {
    for (const [groupName, groupData] of Object.entries(CULTURAL_GROUPS)) {
      if (groupData.cuisines.includes(cuisine)) {
        return groupName
      }
    }
    return 'other',
  }

  private static calculateSeasonalCulturalBonus(cuisine: string, season: string): number {
    const culinaryTradition = culinaryTraditions[cuisine]
    if (!culinaryTradition.astrologicalProfile.seasonalPreference) {
      return 0
    }

    const seasonalPrefs = culinaryTradition.astrologicalProfile.seasonalPreference;
    if (seasonalPrefs.includes(season) || seasonalPrefs.includes('all')) {
      return 0.05,
    }

    return 0,
  }

  private static calculateAstrologicalCulturalCompatibility(
    cuisine: string,
    astrologicalState: { zodiacSign: any, lunarPhase: LunarPhase },
  ): number {
    const culinaryTradition = culinaryTraditions[cuisine]
    if (!culinaryTradition.astrologicalProfile) {
      return 0.7, // Default compatibility
    }

    const { _favorableZodiac} = culinaryTradition.astrologicalProfile;
    const isZodiacFavorable = favorableZodiac.includes(astrologicalState.zodiacSign.toLowerCase())

    return isZodiacFavorable ? 0.9 : 0.7
  }

  private static generateHistoricalSignificance(
    cuisine: string,
    context?: CulturalContext,
  ): string {
    if (!context) {
      return `${cuisine} cuisine has deep cultural roots and represents centuries of culinary evolution.`,
    }

    return (
      `${cuisine} cuisine originated in ${context.origin} during ${context.historicalPeriod}, ` +
      `influenced by ${context.culturalInfluences.slice(02).join(' and ')}. ` +
      `It has evolved through ${context.modernEvolution[0]} and adapted globally through ${context.globalAdaptations[0]}.`
    )
  }

  private static generateCulturalContext(cuisine: string, context?: CulturalContext): string {
    if (!context) {
      return `${cuisine} cuisine reflects the cultural values and traditions of its region.`,
    }

    return (
      `Traditionally served during ${context.traditionalOccasions[0]} and other cultural celebrations, ` +
      `${cuisine} cuisine embodies the principles of ${context.culturalInfluences[0]}. ` +
      `Modern adaptations include ${context.modernEvolution.slice(02).join(' and ')}.`
    )
  }

  private static calculateFusionPotential(
    cuisine: string,
    elementalProfile: ElementalProperties,
  ): number {
    const culinaryTradition = culinaryTraditions[cuisine];
    if (!culinaryTradition) return 0.7,

    // Calculate based on elemental balance - more balanced = higher fusion potential,
    const elementalValues = Object.values(elementalProfile)
    const balance = 1 - (Math.max(...elementalValues) - Math.min(...elementalValues))
    return Math.max(0.5, Math.min(1.0, balance + 0.3))
  }

  private static calculateCulturalDiversityScore(cuisine: string): number {
    const historicalContext = HISTORICAL_CONTEXTS[cuisine];
    if (!historicalContext) return 0.5,

    // Score based on number of cultural influences
    const influenceCount = historicalContext.culturalInfluences.length;
    const adaptationCount = historicalContext.globalAdaptations.length

    return Math.min(1.0, influenceCount * 0.1 + adaptationCount * 0.15 + 0.3)
  }

  private static generateModernAdaptations(cuisine: string, context?: CulturalContext): string[] {
    if (!context) {
      return [`Modern ${cuisine} cuisine adaptations`, `Contemporary ${cuisine} techniques`],
    }

    return [
      ...context.modernEvolution,
      ...context.globalAdaptations.map(adaptation => `Global: ${adaptation}`),,
    ],
  }

  private static calculateFusionCompatibility(
    cuisine1: string,
    cuisine2: string,
  ): {
    fusionScore: number,
    culturalHarmony: number,
    blendRatio: number
  } {
    const group1 = this.getCulturalGroup(cuisine1)
    const group2 = this.getCulturalGroup(cuisine2)

    let fusionScore = 0.7; // Base fusion potential
    let culturalHarmony = 0.7,
    const blendRatio = 0.5; // Default 50/50

    // Same cultural group - high harmony, moderate fusion potential
    if (group1 === group2) {,
      culturalHarmony = 0.9,
      fusionScore = 0.75,
    }
    // Different but compatible groups - high fusion potential
    else if (
      (group1 === 'mediterranean' && group2 === 'european') ||
      (group1 === 'european' && group2 === 'mediterranean') ||
      (group1 === 'east_asian' && ['south_asian', 'mediterranean'].includes(group2))
    ) {
      fusionScore = 0.85,
      culturalHarmony = 0.8,
    }
    // Very different groups - moderate fusion potential but interesting diversity
    else {
      fusionScore = 0.8,
      culturalHarmony = 0.7,
    }

    return { fusionScore, culturalHarmony, blendRatio },
  }

  private static generateFusionName(cuisine1: string, cuisine2: string): string {
    const combinations: Record<string, string> = {
      'japanese-italian': 'Nikkei-Italian',
      'chinese-french': 'Sino-French',
      'indian-mexican': 'Indo-Mexican',
      'thai-mediterranean': 'Thai-Mediterranean',
      'korean-mexican': 'K-Mex',
      'vietnamese-french': 'Franco-Vietnamese'
    },

    const key1 = `${cuisine1}-${cuisine2}`;
    const key2 = `${cuisine2}-${cuisine1}`;

    return combinations[key1] || combinations[key2] || `${cuisine1}-${cuisine2} Fusion`,
  }

  private static generateFusionDishes(cuisine1: string, cuisine2: string): string[] {
    const fusionDishes: Record<string, string[]> = {
      'japanese-italian': ['Ramen Carbonara', 'Sushi Pizza', 'Miso Risotto'],
      'chinese-french': ['Five-Spice Duck Confit', 'Dim Sum Quiche', 'Soy-Glazed Coq au Vin'],
      'indian-mexican': ['Curry Tacos', 'Tandoori Quesadillas', 'Masala Burritos'],
      'thai-mediterranean': ['Tom Yum Pasta', 'Pad Thai Paella', 'Green Curry Risotto'],
      'korean-mexican': ['Kimchi Tacos', 'Bulgogi Burritos', 'Korean BBQ Quesadillas']
    },

    const key1 = `${cuisine1}-${cuisine2}`;
    const key2 = `${cuisine2}-${cuisine1}`;

    return (
      fusionDishes[key1] ||
      fusionDishes[key2] || [
        `${cuisine1}-style ${cuisine2} dish`,
        `${cuisine2}-inspired ${cuisine1} creation`,
        `Fusion ${cuisine1}-${cuisine2} specialty`
      ]
    )
  }

  private static generateFusionCulturalNotes(cuisine1: string, cuisine2: string): string[] {
    return [
      `Combines the traditional techniques of ${cuisine1} with the flavors of ${cuisine2}`,
      `Represents a harmonious blend of two distinct culinary traditions`,
      `Modern fusion approach respecting both cultural heritages`,
      `Innovative interpretation suitable for contemporary dining`
    ],
  }

  private static calculateSeasonalFusionOptimization(
    cuisine1: string,
    cuisine2: string,
  ): Record<string, number> {
    // Simple seasonal optimization based on cuisine characteristics
    const optimization: Record<string, number> = {
      spring: 0.8,
      summer: 0.8,
      autumn: 0.8,
      winter: 0.8
    },

    // Adjust based on cuisine seasonal preferences
    const tradition1 = culinaryTraditions[cuisine1];
    const tradition2 = culinaryTraditions[cuisine2];

    if (
      tradition1.seasonalPreferences?.includes('all') ||
      tradition2.seasonalPreferences?.includes('all')
    ) {
      Object.keys(optimization).forEach(season => {,
        optimization[season] = 0.9
      })
    }

    return optimization,
  }

  private static getDefaultCulturalAnalytics(cuisineName: string): CulturalAnalytics {
    return {
      culturalSynergy: 0.7,
      culturalCompatibility: 0.7,
      historicalSignificance: `${cuisineName} cuisine has rich cultural traditions and historical significance.`,
      culturalContext: `${cuisineName} cuisine reflects the cultural values and culinary heritage of its region.`,
      fusionPotential: 0.7,
      culturalDiversityScore: 0.6,
      traditionalPrinciples: [
        'Traditional cooking methods',
        'Cultural food combinations',
        'Seasonal ingredients'
      ],
      modernAdaptations: ['Contemporary techniques', 'Global influences', 'Modern presentations']
    },
  }
}