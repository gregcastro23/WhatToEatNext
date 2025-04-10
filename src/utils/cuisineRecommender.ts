import type { LunarPhase, ZodiacSign, PlanetaryAspect } from '@/types/alchemy';
import { LUNAR_PHASES } from '@/constants/lunar';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import type { Ingredient } from '@/data/ingredients/types';
import { calculateLunarPhase, calculatePlanetaryPositions, calculatePlanetaryAspects } from '@/utils/astrologyUtils';
import venusData from '@/data/planets/venus';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import jupiterData from '@/data/planets/jupiter';
import saturnData from '@/data/planets/saturn';

interface AstrologicalState {
  lunarPhase: LunarPhase;
  zodiacSign?: ZodiacSign;
  celestialEvents?: string[];
  aspects?: PlanetaryAspect[];
  retrograde?: string[];
}

interface CuisineRecommendation {
  cuisine: string;
  score: number;
  lunarAffinity: number;
  seasonalAffinity: number;
  elementalAffinity: number;
  flavorAffinity: number;
  recommendedDishes: string[];
  scoreDetails?: Record<string, number>;
}

interface RecommendationOptions {
  season?: string;
  dietary?: string[];
  ingredients?: string[];
  mealType?: string;
  mood?: string;
  preferredElements?: Record<string, number>;
  limit?: number;
}

/**
 * Recommend cuisines based on lunar phase, astrological state, and other factors
 */
export function recommendCuisines(
  astroState: AstrologicalState,
  options: RecommendationOptions = {}
): CuisineRecommendation[] {
  const { 
    lunarPhase,
    zodiacSign,
    aspects = []
  } = astroState;
  
  const {
    season = 'any',
    dietary = [],
    ingredients = [],
    mealType = 'any',
    mood = 'any',
    preferredElements = {}
  } = options;
  
  // BOOST COEFFICIENT - Apply to all scores
  const GLOBAL_BOOST = 5.0;
  
  // Get lunar phase data - convert spaces to camelCase format if needed
  const lunarPhaseKey = lunarPhase.replace(/\s+/g, '') as keyof typeof LUNAR_PHASES;
  const lunarPhaseData = LUNAR_PHASES[lunarPhaseKey] || LUNAR_PHASES.new;
  
  // Initialize scores object
  const scores: Record<string, CuisineRecommendation> = {};
  
  // Check if Venus is active in the current astrological state
  const isVenusActive = aspects.some(aspect => 
    aspect.planets.includes('Venus')
  );
  
  // Check if Venus is retrograde
  const isVenusRetrograde = astroState.retrograde?.includes('Venus') || false;
  
  // Check if Mars is active in the current astrological state
  const isMarsActive = aspects.some(aspect => 
    aspect.planets.includes('Mars')
  );
  
  // Check if Mars is retrograde
  const isMarsRetrograde = astroState.retrograde?.includes('Mars') || false;
  
  // Check if Mercury is active in the current astrological state
  const isMercuryActive = aspects.some(aspect => 
    aspect.planets.includes('Mercury')
  );
  
  // Check if Mercury is retrograde
  const isMercuryRetrograde = astroState.retrograde?.includes('Mercury') || false;
  
  // Check if Jupiter is active in the current astrological state
  const isJupiterActive = aspects.some(aspect => 
    aspect.planets.includes('Jupiter')
  );
  
  // Check if Jupiter is retrograde
  const isJupiterRetrograde = astroState.retrograde?.includes('Jupiter') || false;
  
  // Check if Saturn is active in the current astrological state
  const isSaturnActive = aspects.some(aspect => 
    aspect.planets.includes('Saturn')
  );
  
  // Check if Saturn is retrograde
  const isSaturnRetrograde = astroState.retrograde?.includes('Saturn') || false;
  
  // Get Venus-specific flavor recommendations based on current zodiac sign
  const venusZodiacTransit = zodiacSign && venusData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Mars-specific flavor recommendations based on current zodiac sign
  const marsZodiacTransit = zodiacSign && marsData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Mercury-specific flavor recommendations based on current zodiac sign
  const mercuryZodiacTransit = zodiacSign && mercuryData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Jupiter-specific flavor recommendations based on current zodiac sign
  const jupiterZodiacTransit = zodiacSign && jupiterData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Saturn-specific flavor recommendations based on current zodiac sign
  const saturnZodiacTransit = zodiacSign && saturnData.PlanetSpecific?.ZodiacTransit?.[zodiacSign];
  
  // Get Venus flavor profiles
  const venusFlavorProfile = venusData.FlavorProfiles;
  
  // Get Mars flavor profiles
  const marsFlavorProfile = marsData.FlavorProfiles;
  
  // Get Mercury flavor profiles
  const mercuryFlavorProfile = mercuryData.FlavorProfiles;
  
  // Get Jupiter flavor profiles
  const jupiterFlavorProfile = jupiterData.FlavorProfiles;
  
  // Get Saturn flavor profiles
  const saturnFlavorProfile = saturnData.FlavorProfiles;
  
  // Determine Venus culinary temperament based on sign type
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  const fireSigns = ['aries', 'leo', 'sagittarius'];
  
  let venusTemperament = null;
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    if (earthSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.EarthVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.EarthVenus;
    } else if (airSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.AirVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.AirVenus;
    } else if (waterSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.WaterVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.WaterVenus;
    } else if (fireSigns.includes(lowerSign) && venusData.PlanetSpecific?.CulinaryTemperament?.FireVenus) {
      venusTemperament = venusData.PlanetSpecific.CulinaryTemperament.FireVenus;
    }
  }
  
  // Determine Mars culinary temperament based on sign type
  let marsTemperament = null;
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    if (fireSigns.includes(lowerSign) && marsData.PlanetSpecific?.CulinaryTemperament?.FireMars) {
      marsTemperament = marsData.PlanetSpecific.CulinaryTemperament.FireMars;
    } else if (waterSigns.includes(lowerSign) && marsData.PlanetSpecific?.CulinaryTemperament?.WaterMars) {
      marsTemperament = marsData.PlanetSpecific.CulinaryTemperament.WaterMars;
    }
  }
  
  // Determine Mercury culinary temperament based on sign type
  let mercuryTemperament = null;
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    if (airSigns.includes(lowerSign) && mercuryData.PlanetSpecific?.CulinaryTemperament?.AirMercury) {
      mercuryTemperament = mercuryData.PlanetSpecific.CulinaryTemperament.AirMercury;
    } else if (earthSigns.includes(lowerSign) && mercuryData.PlanetSpecific?.CulinaryTemperament?.EarthMercury) {
      mercuryTemperament = mercuryData.PlanetSpecific.CulinaryTemperament.EarthMercury;
    }
  }
  
  // Determine Jupiter culinary temperament based on sign type
  let jupiterTemperament = null;
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    if (fireSigns.includes(lowerSign) && jupiterData.PlanetSpecific?.CulinaryTemperament?.FireJupiter) {
      jupiterTemperament = jupiterData.PlanetSpecific.CulinaryTemperament.FireJupiter;
    } else if (airSigns.includes(lowerSign) && jupiterData.PlanetSpecific?.CulinaryTemperament?.AirJupiter) {
      jupiterTemperament = jupiterData.PlanetSpecific.CulinaryTemperament.AirJupiter;
    }
  }
  
  // Determine Saturn culinary temperament based on sign type
  let saturnTemperament = null;
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    if (earthSigns.includes(lowerSign) && saturnData.PlanetSpecific?.CulinaryTemperament?.EarthSaturn) {
      saturnTemperament = saturnData.PlanetSpecific.CulinaryTemperament.EarthSaturn;
    } else if (airSigns.includes(lowerSign) && saturnData.PlanetSpecific?.CulinaryTemperament?.AirSaturn) {
      saturnTemperament = saturnData.PlanetSpecific.CulinaryTemperament.AirSaturn;
    }
  }
  
  for (const [cuisineName, cuisineData] of Object.entries(cuisineFlavorProfiles)) {
    // Skip cuisines that don't meet dietary requirements
    if (dietary.length > 0 && !meetsAllDietaryRequirements(cuisineData, dietary)) {
      continue;
    }
    
    // Initialize the recommendation
    scores[cuisineName] = {
      cuisine: cuisineName,
      score: 0,
      lunarAffinity: 0,
      seasonalAffinity: 0,
      elementalAffinity: 0,
      flavorAffinity: 0,
      recommendedDishes: [],
      scoreDetails: {}
    };
    
    // Calculate lunar affinity
    const lunarAffinity = calculateLunarAffinity(cuisineData, lunarPhaseData);
    scores[cuisineName].lunarAffinity = lunarAffinity;
    scores[cuisineName].score += lunarAffinity * 3.5 * GLOBAL_BOOST; // Even higher weight for lunar phase
    
    // Add zodiac sign boost with much higher weighting
    if (zodiacSign && cuisineData.zodiacInfluences?.includes(zodiacSign)) {
      scores[cuisineName].score += 3.0 * GLOBAL_BOOST; // Massive boost for zodiac alignment
    }
    
    // Add aspect-based score adjustments with much higher weighting
    if (aspects.length > 0 && cuisineData.planetaryResonance) {
      const aspectScore = calculateAspectAffinity(aspects, cuisineData.planetaryResonance);
      scores[cuisineName].score += aspectScore * 3.0 * GLOBAL_BOOST; // Huge boost for planetary aspects
    }
    
    // Calculate Venus-specific score if Venus is active
    if (isVenusActive) {
      let venusScore = 0;
      
      // Check if cuisine matches Venus flavor preferences
      if (venusFlavorProfile && cuisineData.flavor) {
        const flavorMatch = calculateVenusFlavorAffinity(venusFlavorProfile, cuisineData.flavor);
        venusScore += flavorMatch * 2.5;
      }
      
      // Check if cuisine contains Venus-associated ingredients
      if (venusData.FoodAssociations && cuisineData.commonIngredients) {
        const ingredientMatch = venusData.FoodAssociations.filter(food => 
          cuisineData.commonIngredients.some(ingredient => 
            ingredient.toLowerCase().includes(food.toLowerCase()) || 
            food.toLowerCase().includes(ingredient.toLowerCase())
          )
        ).length;
        
        venusScore += ingredientMatch * 0.8;
      }

      // Check if cuisine contains Venus-associated herbs
      if (venusData.HerbalAssociations?.Herbs && cuisineData.commonHerbs) {
        const herbMatch = venusData.HerbalAssociations.Herbs.filter(herb => 
          cuisineData.commonHerbs.some(cuisineHerb => 
            cuisineHerb.toLowerCase().includes(herb.toLowerCase()) || 
            herb.toLowerCase().includes(cuisineHerb.toLowerCase())
          )
        ).length;
        
        venusScore += herbMatch * 1.0; // Higher weight for herb matches
      }
      
      // Boost cuisine based on Venus transit data for current zodiac
      if (venusZodiacTransit && venusZodiacTransit.FoodFocus) {
        // Parse the food focus and check for cuisine matches
        const foodFocus = venusZodiacTransit.FoodFocus.toLowerCase();
        const cuisineKeywords = cuisineData.description?.toLowerCase() || '';
        
        // Check for keyword matches between Venus transit food focus and cuisine description
        const keywords = foodFocus.split(/,|\s+/);
        const matchCount = keywords.filter(keyword => 
          keyword.length > 3 && cuisineKeywords.includes(keyword)
        ).length;
        
        venusScore += matchCount * 1.5;
        
        // Add score for Elements alignment in the current zodiac transit
        if (venusZodiacTransit.Elements && cuisineData.elementalProperties) {
          for (const element in venusZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              venusScore += venusZodiacTransit.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.2;
            }
          }
        }
        
        // Add score for alignment with transit ingredients 
        if (venusZodiacTransit.Ingredients && cuisineData.commonIngredients) {
          const transitIngredients = venusZodiacTransit.Ingredients.map(i => i.toLowerCase());
          const matchingIngredients = cuisineData.commonIngredients.filter(ingredient => 
            transitIngredients.some(transit => 
              ingredient.toLowerCase().includes(transit) || transit.includes(ingredient.toLowerCase())
            )
          ).length;
          
          venusScore += matchingIngredients * 1.3;
        }
      }

      // Apply Venus temperament-based scoring
      if (venusTemperament) {
        const tempFoodFocus = venusTemperament.FoodFocus.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check for matching temperament keywords
        const tempKeywords = tempFoodFocus.split(/,|\s+/);
        const tempMatchCount = tempKeywords.filter(keyword => 
          keyword.length > 3 && cuisineDesc.includes(keyword)
        ).length;
        
        venusScore += tempMatchCount * 2.0; // Higher weight for temperament matches
        
        // Check for Elements alignment with Venus temperament
        if (venusTemperament.Elements && cuisineData.elementalProperties) {
          for (const element in venusTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              venusScore += venusTemperament.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.5;
            }
          }
        }
      }
      
      // Check if cuisine aligns with Venus culinary techniques
      if (venusData.PlanetSpecific?.CulinaryTechniques && cuisineData.techniques) {
        const techniques = cuisineData.techniques.join(' ').toLowerCase();
        
        // Check for technique alignment
        if (techniques.includes('presentation') && 
            venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aesthetic Presentation'] * 1.2;
        }
        
        if (techniques.includes('aroma') && 
            venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Aroma Infusion'] * 1.2;
        }
        
        if (techniques.includes('balance') && 
            venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Flavor Balancing'] * 1.5;
        }
        
        // New: Check for Sensory Harmony technique
        if (techniques.includes('harmony') && 
            venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Sensory Harmony'] * 1.8;
        }
        
        // New: Check for Textural Contrast technique
        if ((techniques.includes('texture') || techniques.includes('contrast')) && 
            venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Textural Contrast'] * 1.3;
        }
        
        // New: Check for Tasting Menu Orchestration technique
        if ((techniques.includes('tasting') || techniques.includes('menu')) && 
            venusData.PlanetSpecific.CulinaryTechniques['Tasting Menu Orchestration']) {
          venusScore += venusData.PlanetSpecific.CulinaryTechniques['Tasting Menu Orchestration'] * 1.4;
        }
      }
      
      // Check for alignment with Venus-focused meal types
      if (mealType !== 'any' && venusData.PlanetSpecific?.MealTypes) {
        const venusMealType = venusData.PlanetSpecific.MealTypes[mealType as keyof typeof venusData.PlanetSpecific.MealTypes];
        if (venusMealType && venusMealType.Influence) {
          venusScore += venusMealType.Influence * 2.0;
        }
        
        // New: Check associated flavors for this meal type
        if (venusMealType && venusMealType.Flavors && cuisineData.flavor) {
          for (const flavor in venusMealType.Flavors) {
            if (cuisineData.flavor[flavor]) {
              venusScore += venusMealType.Flavors[flavor] * cuisineData.flavor[flavor] * 1.5;
            }
          }
        }
      }
      
      // Adjust for Venus retrograde
      if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
        // Check if cuisine matches retrograde food focus
        if (venusData.PlanetSpecific.Retrograde.FoodFocus) {
          const retroFocus = venusData.PlanetSpecific.Retrograde.FoodFocus.toLowerCase();
          const cuisineDesc = cuisineData.description?.toLowerCase() || '';
          
          if (retroFocus.includes('traditional') && 
              (cuisineDesc.includes('traditional') || cuisineDesc.includes('classic'))) {
            venusScore *= 1.5; // Boost traditional cuisines during retrograde
          } else if (retroFocus.includes('revisit') && cuisineData.history?.includes('ancient')) {
            venusScore *= 1.4; // Boost ancestral cuisines during retrograde
          } else if (retroFocus.includes('comfort') && cuisineData.tags?.includes('comfort food')) {
            venusScore *= 1.6; // Boost comfort food during retrograde
          } else if (retroFocus.includes('nostalgic') && cuisineData.cultural_significance?.includes('nostalgic')) {
            venusScore *= 1.5; // Boost nostalgic cuisines during retrograde
          } else {
            venusScore *= 0.85; // Slightly reduce other Venus influences
          }
        }
        
        // Apply retrograde elements influence
        if (venusData.PlanetSpecific.Retrograde.Elements && cuisineData.elementalProperties) {
          for (const element in venusData.PlanetSpecific.Retrograde.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              venusScore *= (1 + (venusData.PlanetSpecific.Retrograde.Elements[element] * 
                                 cuisineData.elementalProperties[elementProperty] * 0.1));
            }
          }
        }
      }
      
      // Check for Venus-Moon phase alignment
      if (venusData.LunarConnection && lunarPhase) {
        const phaseData = venusData.LunarConnection[lunarPhase as keyof typeof venusData.LunarConnection];
        
        if (phaseData && phaseData.CulinaryFocus) {
          const focusKeywords = phaseData.CulinaryFocus.toLowerCase().split(/[\s,;]+/);
          const cuisineKeywords = cuisineData.description?.toLowerCase() || '';
          
          const lunationMatches = focusKeywords.filter(keyword => 
            keyword.length > 3 && cuisineKeywords.includes(keyword)
          ).length;
          
          venusScore += lunationMatches * phaseData.Influence * 1.2;
        }
      }
      
      // Apply cuisine-specific Venus score boosts
      const specialCuisines = {
        'Italian': 1.2,
        'French': 1.3,
        'Mediterranean': 1.25,
        'Greek': 1.15,
        'Middle Eastern': 1.1,
        'Japanese': 1.1, // For its aesthetic focus
        'Dessert': 1.4,
        'Pastry': 1.5
      };
      
      if (specialCuisines[cuisineName]) {
        venusScore *= specialCuisines[cuisineName];
      }
      
      // Add Venus score to total
      scores[cuisineName].score += venusScore * GLOBAL_BOOST;
      
      // Add Venus score to details for transparency
      scores[cuisineName].scoreDetails.venusInfluence = venusScore;
    }
    
    // Calculate Mars-specific score if Mars is active
    if (isMarsActive) {
      let marsScore = 0;
      
      // Check if cuisine matches Mars flavor preferences
      if (marsFlavorProfile && cuisineData.flavor) {
        // Calculate flavor affinity between Mars and the cuisine
        let flavorMatch = 0;
        for (const flavor in marsFlavorProfile) {
          if (cuisineData.flavor[flavor]) {
            flavorMatch += marsFlavorProfile[flavor] * cuisineData.flavor[flavor];
          }
        }
        marsScore += flavorMatch * 2.0;
      }
      
      // Check if cuisine contains Mars-associated ingredients
      if (marsData.FoodAssociations && cuisineData.commonIngredients) {
        const ingredientMatch = marsData.FoodAssociations.filter(food => 
          cuisineData.commonIngredients.some(ingredient => 
            ingredient.toLowerCase().includes(food.toLowerCase()) || 
            food.toLowerCase().includes(ingredient.toLowerCase())
          )
        ).length;
        
        marsScore += ingredientMatch * 1.0; // Higher weight for Mars ingredient matches
      }

      // Check if cuisine contains Mars-associated herbs
      if (marsData.HerbalAssociations?.Herbs && cuisineData.commonHerbs) {
        const herbMatch = marsData.HerbalAssociations.Herbs.filter(herb => 
          cuisineData.commonHerbs.some(cuisineHerb => 
            cuisineHerb.toLowerCase().includes(herb.toLowerCase()) || 
            herb.toLowerCase().includes(cuisineHerb.toLowerCase())
          )
        ).length;
        
        marsScore += herbMatch * 1.2; // Higher weight for herb matches
      }
      
      // Boost cuisine based on Mars transit data for current zodiac
      if (marsZodiacTransit && marsZodiacTransit.FoodFocus) {
        // Parse the food focus and check for cuisine matches
        const foodFocus = marsZodiacTransit.FoodFocus.toLowerCase();
        const cuisineKeywords = cuisineData.description?.toLowerCase() || '';
        
        // Check for keyword matches between Mars transit food focus and cuisine description
        const keywords = foodFocus.split(/,|\s+/);
        const matchCount = keywords.filter(keyword => 
          keyword.length > 3 && cuisineKeywords.includes(keyword)
        ).length;
        
        marsScore += matchCount * 1.8;
        
        // Add score for Elements alignment in the current zodiac transit
        if (marsZodiacTransit.Elements && cuisineData.elementalProperties) {
          for (const element in marsZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              marsScore += marsZodiacTransit.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.5;
            }
          }
        }
        
        // Add score for alignment with transit ingredients 
        if (marsZodiacTransit.Ingredients && cuisineData.commonIngredients) {
          const transitIngredients = marsZodiacTransit.Ingredients.map(i => i.toLowerCase());
          const matchingIngredients = cuisineData.commonIngredients.filter(ingredient => 
            transitIngredients.some(transit => 
              ingredient.toLowerCase().includes(transit) || transit.includes(ingredient.toLowerCase())
            )
          ).length;
          
          marsScore += matchingIngredients * 1.5;
        }
      }

      // Apply Mars temperament-based scoring
      if (marsTemperament) {
        const tempFoodFocus = marsTemperament.FoodFocus.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check for matching temperament keywords
        const tempKeywords = tempFoodFocus.split(/,|\s+/);
        const tempMatchCount = tempKeywords.filter(keyword => 
          keyword.length > 3 && cuisineDesc.includes(keyword)
        ).length;
        
        marsScore += tempMatchCount * 2.5; // Higher weight for temperament matches
        
        // Check if cuisine contains recommended cooking methods from Mars temperament
        if (marsTemperament.Recommendations && cuisineData.techniques) {
          const techniques = cuisineData.techniques.join(' ').toLowerCase();
          const recommendationMatches = marsTemperament.Recommendations.filter(rec => 
            techniques.includes(rec.toLowerCase())
          ).length;
          
          marsScore += recommendationMatches * 2.0;
        }
      }
      
      // Check if cuisine aligns with Mars culinary techniques
      if (marsData.PlanetSpecific?.CulinaryTechniques && cuisineData.techniques) {
        const techniques = cuisineData.techniques.join(' ').toLowerCase();
        
        // Check for Mars technique alignment
        if (techniques.includes('high heat') && 
            marsData.PlanetSpecific.CulinaryTechniques['High Heat Cooking']) {
          marsScore += marsData.PlanetSpecific.CulinaryTechniques['High Heat Cooking'] * 1.5;
        }
        
        if (techniques.includes('grill') && 
            marsData.PlanetSpecific.CulinaryTechniques['Grilling']) {
          marsScore += marsData.PlanetSpecific.CulinaryTechniques['Grilling'] * 1.5;
        }
        
        if (techniques.includes('smoke') && 
            marsData.PlanetSpecific.CulinaryTechniques['Smoking']) {
          marsScore += marsData.PlanetSpecific.CulinaryTechniques['Smoking'] * 1.3;
        }
        
        if (techniques.includes('ferment') && 
            marsData.PlanetSpecific.CulinaryTechniques['Fermentation']) {
          marsScore += marsData.PlanetSpecific.CulinaryTechniques['Fermentation'] * 1.2;
        }
      }
      
      // Apply Mars retrograde effects if applicable
      if (isMarsRetrograde && marsData.PlanetSpecific?.Retrograde) {
        // Retrograde Mars favors slow cooking and traditional methods
        if (cuisineData.techniques && cuisineData.techniques.some(t => 
          t.toLowerCase().includes('slow') || t.toLowerCase().includes('traditional')
        )) {
          marsScore += 1.8;
        }
      }
      
      // Add the Mars score to the total
      if (marsScore > 0) {
        scores[cuisineName].score += marsScore * 2.2 * GLOBAL_BOOST;
        scores[cuisineName].scoreDetails = scores[cuisineName].scoreDetails || {};
        scores[cuisineName].scoreDetails['Mars Influence'] = marsScore * 2.2 * GLOBAL_BOOST;
      }
    }
    
    // Calculate Mercury-specific score if Mercury is active
    if (isMercuryActive) {
      let mercuryScore = 0;
      
      // Check if cuisine matches Mercury flavor preferences
      if (mercuryFlavorProfile && cuisineData.flavor) {
        const flavorMatch = calculateMercuryFlavorAffinity(mercuryFlavorProfile, cuisineData.flavor);
        mercuryScore += flavorMatch * 2.5;
      }
      
      // Check if cuisine contains Mercury-associated ingredients
      if (mercuryData.FoodAssociations && cuisineData.commonIngredients) {
        const ingredientMatch = mercuryData.FoodAssociations.filter(food => 
          cuisineData.commonIngredients.some(ingredient => 
            ingredient.toLowerCase().includes(food.toLowerCase()) || 
            food.toLowerCase().includes(ingredient.toLowerCase())
          )
        ).length;
        
        mercuryScore += ingredientMatch * 0.8;
      }

      // Check if cuisine contains Mercury-associated herbs
      if (mercuryData.HerbalAssociations?.Herbs && cuisineData.commonHerbs) {
        const herbMatch = mercuryData.HerbalAssociations.Herbs.filter(herb => 
          cuisineData.commonHerbs.some(cuisineHerb => 
            cuisineHerb.toLowerCase().includes(herb.toLowerCase()) || 
            herb.toLowerCase().includes(cuisineHerb.toLowerCase())
          )
        ).length;
        
        mercuryScore += herbMatch * 1.0; // Higher weight for herb matches
      }
      
      // Boost cuisine based on Mercury transit data for current zodiac
      if (mercuryZodiacTransit && mercuryZodiacTransit.FoodFocus) {
        // Parse the food focus and check for cuisine matches
        const foodFocus = mercuryZodiacTransit.FoodFocus.toLowerCase();
        const cuisineKeywords = cuisineData.description?.toLowerCase() || '';
        
        // Check for keyword matches between Mercury transit food focus and cuisine description
        const keywords = foodFocus.split(/,|\s+/);
        const matchCount = keywords.filter(keyword => 
          keyword.length > 3 && cuisineKeywords.includes(keyword)
        ).length;
        
        mercuryScore += matchCount * 1.5;
        
        // Add score for Elements alignment in the current zodiac transit
        if (mercuryZodiacTransit.Elements && cuisineData.elementalProperties) {
          for (const element in mercuryZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              mercuryScore += mercuryZodiacTransit.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.2;
            }
          }
        }
        
        // Add score for alignment with transit ingredients 
        if (mercuryZodiacTransit.Ingredients && cuisineData.commonIngredients) {
          const transitIngredients = mercuryZodiacTransit.Ingredients.map(i => i.toLowerCase());
          const matchingIngredients = cuisineData.commonIngredients.filter(ingredient => 
            transitIngredients.some(transit => 
              ingredient.toLowerCase().includes(transit) || transit.includes(ingredient.toLowerCase())
            )
          ).length;
          
          mercuryScore += matchingIngredients * 1.3;
        }
      }

      // Apply Mercury temperament-based scoring
      if (mercuryTemperament) {
        const tempFoodFocus = mercuryTemperament.FoodFocus.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check for matching temperament keywords
        const tempKeywords = tempFoodFocus.split(/,|\s+/);
        const tempMatchCount = tempKeywords.filter(keyword => 
          keyword.length > 3 && cuisineDesc.includes(keyword)
        ).length;
        
        mercuryScore += tempMatchCount * 2.0; // Higher weight for temperament matches
        
        // Check for Elements alignment with Mercury temperament
        if (mercuryTemperament.Elements && cuisineData.elementalProperties) {
          for (const element in mercuryTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              mercuryScore += mercuryTemperament.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.5;
            }
          }
        }
      }
      
      // Apply Mercury retrograde modifier if applicable
      if (isMercuryRetrograde) {
        // During retrograde, favor cuisine with clear instructions and simple techniques
        if (cuisineData.complexity === 'low' || cuisineData.complexity === 'medium') {
          mercuryScore *= 1.25; // Boost for simpler cuisines during retrograde
        } else {
          mercuryScore *= 0.8; // Penalty for complex cuisines during retrograde
        }
        
        // During retrograde, emphasis on familiar, traditional cuisines
        if (cuisineData.attributes?.includes('traditional') || cuisineData.attributes?.includes('comfort')) {
          mercuryScore *= 1.3; // Boost for traditional cuisines during retrograde
        }
        
        // During retrograde, special consideration for Mercury's retrograde flavor profile
        if (mercuryData.PlanetSpecific?.Mercury?.FlavorModulation?.Retrograde && cuisineData.flavor) {
          const retrogradeMatch = calculateMercuryFlavorAffinity(
            mercuryData.PlanetSpecific.Mercury.FlavorModulation.Retrograde,
            cuisineData.flavor
          );
          mercuryScore += retrogradeMatch * 2.0;
        }
      }
      
      // Apply communication-related scores
      if (cuisineData.attributes?.includes('interactive') || 
          cuisineData.attributes?.includes('social') ||
          cuisineData.description?.toLowerCase().includes('communal')) {
        mercuryScore *= 1.2; // Boost for cuisines that encourage communication
      }
      
      // Add Mercury score to the total with appropriate weight
      scores[cuisineName].score += mercuryScore * 2.0 * GLOBAL_BOOST;
      
      // Store Mercury score in details
      if (scores[cuisineName].scoreDetails) {
        scores[cuisineName].scoreDetails['mercuryAffinity'] = mercuryScore * 2.0 * GLOBAL_BOOST;
      }
    }
    
    // Check meal type alignment with Venus meal preferences
    if (mealType !== 'any' && venusData.PlanetSpecific?.MealTypes && 
        venusData.PlanetSpecific.MealTypes[mealType as keyof typeof venusData.PlanetSpecific.MealTypes]) {
      const mealTypeData = venusData.PlanetSpecific.MealTypes[mealType as keyof typeof venusData.PlanetSpecific.MealTypes];
      
      // Add Venus meal type influence to score
      if (isVenusActive && mealTypeData) {
        scores[cuisineName].score += mealTypeData.Influence * 2.5 * GLOBAL_BOOST;
      }
    }
    
    // Calculate seasonal affinity with much higher weighting
    if (season !== 'any' && cuisineData.seasonalPreference) {
      let seasonalAffinity = 0.5; // Base affinity
      
      if (cuisineData.seasonalPreference.includes(season)) {
        seasonalAffinity = 1.5; // Even stronger match
      } else if (cuisineData.seasonalPreference.includes('all')) {
        seasonalAffinity = 1.0; // Increased year-round cuisine
      }
      
      // Check for opposing seasons (summer↔winter, spring↔fall)
      const opposingSeason = {
        'summer': 'winter',
        'winter': 'summer',
        'spring': 'fall',
        'fall': 'spring'
      }[season];
      
      if (opposingSeason && cuisineData.seasonalPreference.includes(opposingSeason)) {
        seasonalAffinity = 0.3; // Less suitable for opposing season
      }
      
      scores[cuisineName].seasonalAffinity = seasonalAffinity;
      scores[cuisineName].score += seasonalAffinity * 2.5 * GLOBAL_BOOST; // Much higher weight for seasonal factors
    }
    
    // Calculate elemental affinity with much higher weighting
    if (cuisineData.elementalAlignment && Object.keys(preferredElements).length > 0) {
      const elementalAffinity = calculateElementalAffinity(
        cuisineData.elementalAlignment,
        preferredElements
      );
      
      // Give bonus for dominant element match
      const cuisineDominantElement = getDominantElement(cuisineData.elementalAlignment);
      const preferredDominantElement = getDominantElement(preferredElements);
      
      scores[cuisineName].elementalAffinity = elementalAffinity;
      
      // Base elemental score with much higher weight
      let elementalScore = elementalAffinity * 3.0 * GLOBAL_BOOST;
      
      // Huge bonus for matching dominant elements (like to like)
      if (cuisineDominantElement === preferredDominantElement) {
        elementalScore += 2.5 * GLOBAL_BOOST; // Massive bonus for matching the dominant element
      }
      
      // Check for cardinal modality influence with higher boost
      const useCardinalInfluence = checkCardinalInfluence(zodiacSign);
      if (useCardinalInfluence && cuisineData.modalityInfluence === 'cardinal') {
        elementalScore += 1.5 * GLOBAL_BOOST; // Huge boost for cardinal influence
      }
      
      scores[cuisineName].score += elementalScore;
    }
    
    // Calculate flavor affinity based on ingredients with much higher weighting
    if (ingredients.length > 0 && cuisineData.flavorProfiles) {
      const flavorAffinity = calculateFlavorAffinity(cuisineData, ingredients);
      scores[cuisineName].flavorAffinity = flavorAffinity;
      scores[cuisineName].score += flavorAffinity * 4.0 * GLOBAL_BOOST; // Massive emphasis on ingredient matches
    }
    
    // Add bonus for suitable meal types with much higher weighting
    if (mealType !== 'any' && cuisineData.traditionalMealPatterns) {
      const mealPatterns = cuisineData.traditionalMealPatterns;
      
      if (mealPatterns.includes(mealType)) {
        scores[cuisineName].score += 2.0 * GLOBAL_BOOST; // Huge match for the meal type
      } else if (mealPatterns.includes('all') || mealPatterns.includes('any')) {
        scores[cuisineName].score += 1.0 * GLOBAL_BOOST; // High boost for flexible cuisine
      } else if (
        (mealType === 'breakfast' && mealPatterns.some(p => p.includes('breakfast') || p.includes('morning'))) ||
        (mealType === 'lunch' && mealPatterns.some(p => p.includes('lunch') || p.includes('midday'))) ||
        (mealType === 'dinner' && mealPatterns.some(p => p.includes('dinner') || p.includes('evening')))
      ) {
        scores[cuisineName].score += 1.5 * GLOBAL_BOOST; // Higher partial match for the meal type
      }
    }
    
    // Force minimum base score to ensure no cuisine gets below certain threshold
    scores[cuisineName].score = Math.max(scores[cuisineName].score, 3.0 * GLOBAL_BOOST);
    
    // Find recommended dishes based on factors
    const dishes = findRecommendedDishes(
      cuisineData, 
      lunarPhase, 
      zodiacSign, 
      ingredients, 
      season
    );
    
    scores[cuisineName].recommendedDishes = dishes;
    
    // Calculate Jupiter-specific score if Jupiter is active
    if (isJupiterActive) {
      let jupiterScore = 0;
      
      // Check if cuisine matches Jupiter flavor preferences
      if (jupiterFlavorProfile && cuisineData.flavor) {
        const flavorMatch = calculateJupiterFlavorAffinity(jupiterFlavorProfile, cuisineData.flavor);
        jupiterScore += flavorMatch * 2.5;
      }
      
      // Check if cuisine contains Jupiter-associated ingredients
      if (jupiterData.FoodAssociations && cuisineData.commonIngredients) {
        const ingredientMatch = jupiterData.FoodAssociations.filter(food => 
          cuisineData.commonIngredients.some(ingredient => 
            ingredient.toLowerCase().includes(food.toLowerCase()) || 
            food.toLowerCase().includes(ingredient.toLowerCase())
          )
        ).length;
        
        jupiterScore += ingredientMatch * 0.8;
      }

      // Check if cuisine contains Jupiter-associated herbs
      if (jupiterData.HerbalAssociations?.Herbs && cuisineData.commonHerbs) {
        const herbMatch = jupiterData.HerbalAssociations.Herbs.filter(herb => 
          cuisineData.commonHerbs.some(cuisineHerb => 
            cuisineHerb.toLowerCase().includes(herb.toLowerCase()) || 
            herb.toLowerCase().includes(cuisineHerb.toLowerCase())
          )
        ).length;
        
        jupiterScore += herbMatch * 1.0; // Higher weight for herb matches
      }
      
      // Check for culinary abundance - Jupiter favors abundant cuisines
      if (cuisineData.attributes?.includes('abundant') || 
          cuisineData.attributes?.includes('festive') ||
          cuisineData.attributes?.includes('celebratory')) {
        jupiterScore += 1.5; // Major boost for abundant celebratory cuisines
      }
      
      // Boost cuisine based on Jupiter transit data for current zodiac
      if (jupiterZodiacTransit && jupiterZodiacTransit.FoodFocus) {
        // Parse the food focus and check for cuisine matches
        const foodFocus = jupiterZodiacTransit.FoodFocus.toLowerCase();
        const cuisineKeywords = cuisineData.description?.toLowerCase() || '';
        
        // Check for keyword matches between Jupiter transit food focus and cuisine description
        const keywords = foodFocus.split(/,|\s+/);
        const matchCount = keywords.filter(keyword => 
          keyword.length > 3 && cuisineKeywords.includes(keyword)
        ).length;
        
        jupiterScore += matchCount * 1.5;
        
        // Add score for Elements alignment in the current zodiac transit
        if (jupiterZodiacTransit.Elements && cuisineData.elementalProperties) {
          for (const element in jupiterZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              jupiterScore += jupiterZodiacTransit.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.2;
            }
          }
        }
        
        // Add score for alignment with transit ingredients 
        if (jupiterZodiacTransit.Ingredients && cuisineData.commonIngredients) {
          const transitIngredients = jupiterZodiacTransit.Ingredients.map(i => i.toLowerCase());
          const matchingIngredients = cuisineData.commonIngredients.filter(ingredient => 
            transitIngredients.some(transit => 
              ingredient.toLowerCase().includes(transit) || transit.includes(ingredient.toLowerCase())
            )
          ).length;
          
          jupiterScore += matchingIngredients * 1.3;
        }
      }

      // Apply Jupiter temperament-based scoring
      if (jupiterTemperament) {
        const tempFoodFocus = jupiterTemperament.FoodFocus.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check for matching temperament keywords
        const tempKeywords = tempFoodFocus.split(/,|\s+/);
        const tempMatchCount = tempKeywords.filter(keyword => 
          keyword.length > 3 && cuisineDesc.includes(keyword)
        ).length;
        
        jupiterScore += tempMatchCount * 2.0; // Higher weight for temperament matches
        
        // Check for Elements alignment with Jupiter temperament
        if (jupiterTemperament.Elements && cuisineData.elementalProperties) {
          for (const element in jupiterTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              jupiterScore += jupiterTemperament.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.5;
            }
          }
        }
        
        // Check for alignment with Jupiter temperament recommendations
        if (jupiterTemperament.Recommendations) {
          const recMatches = jupiterTemperament.Recommendations.filter(rec => 
            cuisineData.description?.toLowerCase().includes(rec.toLowerCase()) ||
            cuisineData.attributes?.some(attr => attr.toLowerCase().includes(rec.toLowerCase()))
          ).length;
          
          jupiterScore += recMatches * 1.2;
        }
      }
      
      // Apply Jupiter retrograde modifier if applicable
      if (isJupiterRetrograde && jupiterData.PlanetSpecific?.Retrograde) {
        // During retrograde, Jupiter calls for moderation and simplicity
        const retroEffect = jupiterData.PlanetSpecific.Retrograde.CulinaryEffect.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check if cuisine aligns with Jupiter retrograde themes
        if (cuisineDesc.includes('simple') || cuisineDesc.includes('moderate') || 
            cuisineDesc.includes('traditional') || cuisineDesc.includes('balanced')) {
          jupiterScore *= 1.3; // Boost for cuisines aligned with retrograde themes
        } else if (cuisineDesc.includes('excessive') || cuisineDesc.includes('indulgent') ||
                  cuisineDesc.includes('overwhelming')) {
          jupiterScore *= 0.7; // Penalty for excessive cuisines during retrograde
        }
      }
      
      // Add Jupiter score to the total with appropriate weight
      scores[cuisineName].score += jupiterScore * 2.0 * GLOBAL_BOOST;
      
      // Store Jupiter score in details
      if (scores[cuisineName].scoreDetails) {
        scores[cuisineName].scoreDetails['jupiterAffinity'] = jupiterScore * 2.0 * GLOBAL_BOOST;
      }
    }
    
    // Calculate Saturn-specific score if Saturn is active
    if (isSaturnActive) {
      let saturnScore = 0;
      
      // Check if cuisine matches Saturn flavor preferences
      if (saturnFlavorProfile && cuisineData.flavor) {
        const flavorMatch = calculateSaturnFlavorAffinity(saturnFlavorProfile, cuisineData.flavor);
        saturnScore += flavorMatch * 2.5;
      }
      
      // Check if cuisine contains Saturn-associated ingredients
      if (saturnData.FoodAssociations && cuisineData.commonIngredients) {
        const ingredientMatch = saturnData.FoodAssociations.filter(food => 
          cuisineData.commonIngredients.some(ingredient => 
            ingredient.toLowerCase().includes(food.toLowerCase()) || 
            food.toLowerCase().includes(ingredient.toLowerCase())
          )
        ).length;
        
        saturnScore += ingredientMatch * 0.8;
      }

      // Check if cuisine contains Saturn-associated herbs
      if (saturnData.HerbalAssociations?.Herbs && cuisineData.commonHerbs) {
        const herbMatch = saturnData.HerbalAssociations.Herbs.filter(herb => 
          cuisineData.commonHerbs.some(cuisineHerb => 
            cuisineHerb.toLowerCase().includes(herb.toLowerCase()) || 
            herb.toLowerCase().includes(cuisineHerb.toLowerCase())
          )
        ).length;
        
        saturnScore += herbMatch * 1.0; // Higher weight for herb matches
      }
      
      // Check for Saturn-aligned cuisine attributes
      if (cuisineData.attributes?.includes('traditional') || 
          cuisineData.attributes?.includes('preserved') ||
          cuisineData.attributes?.includes('aged') ||
          cuisineData.attributes?.includes('fermented')) {
        saturnScore += 1.5; // Major boost for Saturn-aligned cuisine attributes
      }
      
      // Boost cuisine based on Saturn transit data for current zodiac
      if (saturnZodiacTransit && saturnZodiacTransit.FoodFocus) {
        // Parse the food focus and check for cuisine matches
        const foodFocus = saturnZodiacTransit.FoodFocus.toLowerCase();
        const cuisineKeywords = cuisineData.description?.toLowerCase() || '';
        
        // Check for keyword matches between Saturn transit food focus and cuisine description
        const keywords = foodFocus.split(/,|\s+/);
        const matchCount = keywords.filter(keyword => 
          keyword.length > 3 && cuisineKeywords.includes(keyword)
        ).length;
        
        saturnScore += matchCount * 1.5;
        
        // Add score for Elements alignment in the current zodiac transit
        if (saturnZodiacTransit.Elements && cuisineData.elementalProperties) {
          for (const element in saturnZodiacTransit.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              saturnScore += saturnZodiacTransit.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.2;
            }
          }
        }
        
        // Add score for alignment with transit ingredients 
        if (saturnZodiacTransit.Ingredients && cuisineData.commonIngredients) {
          const transitIngredients = saturnZodiacTransit.Ingredients.map(i => i.toLowerCase());
          const matchingIngredients = cuisineData.commonIngredients.filter(ingredient => 
            transitIngredients.some(transit => 
              ingredient.toLowerCase().includes(transit) || transit.includes(ingredient.toLowerCase())
            )
          ).length;
          
          saturnScore += matchingIngredients * 1.3;
        }
      }

      // Apply Saturn temperament-based scoring
      if (saturnTemperament) {
        const tempFoodFocus = saturnTemperament.FoodFocus.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check for matching temperament keywords
        const tempKeywords = tempFoodFocus.split(/,|\s+/);
        const tempMatchCount = tempKeywords.filter(keyword => 
          keyword.length > 3 && cuisineDesc.includes(keyword)
        ).length;
        
        saturnScore += tempMatchCount * 2.0; // Higher weight for temperament matches
        
        // Check for Elements alignment with Saturn temperament
        if (saturnTemperament.Elements && cuisineData.elementalProperties) {
          for (const element in saturnTemperament.Elements) {
            const elementProperty = element as keyof ElementalProperties;
            if (cuisineData.elementalProperties[elementProperty]) {
              saturnScore += saturnTemperament.Elements[element] * cuisineData.elementalProperties[elementProperty] * 1.5;
            }
          }
        }
        
        // Check for alignment with Saturn temperament recommendations
        if (saturnTemperament.Recommendations) {
          const recMatches = saturnTemperament.Recommendations.filter(rec => 
            cuisineData.description?.toLowerCase().includes(rec.toLowerCase()) ||
            cuisineData.attributes?.some(attr => attr.toLowerCase().includes(rec.toLowerCase()))
          ).length;
          
          saturnScore += recMatches * 1.2;
        }
      }
      
      // Apply Saturn retrograde modifier if applicable
      if (isSaturnRetrograde && saturnData.PlanetSpecific?.Retrograde) {
        // During retrograde, Saturn emphasizes revision of traditional methods
        const retroEffect = saturnData.PlanetSpecific.Retrograde.CulinaryEffect.toLowerCase();
        const cuisineDesc = cuisineData.description?.toLowerCase() || '';
        
        // Check if cuisine aligns with Saturn retrograde themes
        if (cuisineDesc.includes('traditional') || cuisineDesc.includes('heritage') || 
            cuisineDesc.includes('preserved') || cuisineDesc.includes('slow')) {
          saturnScore *= 1.3; // Boost for cuisines aligned with retrograde themes
        }
      }
      
      // Saturn has a stronger influence on time-tested cuisines vs. trendy ones
      if (cuisineData.attributes?.includes('ancient') || 
          cuisineData.attributes?.includes('old-world') ||
          cuisineData.attributes?.includes('time-honored')) {
        saturnScore *= 1.4; // Significant boost for ancient cuisines
      } else if (cuisineData.attributes?.includes('modern') || 
                cuisineData.attributes?.includes('trendy') ||
                cuisineData.attributes?.includes('fusion')) {
        saturnScore *= 0.8; // Reduction for modern/trendy cuisines
      }
      
      // Add Saturn score to the total with appropriate weight
      scores[cuisineName].score += saturnScore * 1.8 * GLOBAL_BOOST;
      
      // Store Saturn score in details
      if (scores[cuisineName].scoreDetails) {
        scores[cuisineName].scoreDetails['saturnAffinity'] = saturnScore * 1.8 * GLOBAL_BOOST;
      }
    }
  }
  
  // Now process all scores with our score calculator function
  for (const cuisineName in scores) {
    if (scores[cuisineName]) {
      const cuisineProfile = worldCuisines[cuisineName];
      if (cuisineProfile) {
        // Use our enhanced score calculation with multiplier
        scores[cuisineName].score = calculateCuisineScore(cuisineProfile, astroState);
      }
    }
  }
  
  // Sort by score and return top recommendations
  return Object.values(scores)
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 20);
}

/**
 * Calculate how well a cuisine aligns with the current lunar phase
 */
function calculateLunarAffinity(
  cuisineData: any,
  lunarPhaseData: any
): number {
  // Base affinity score
  let affinity = 0.5;
  
  // Check if the cuisine has specific lunar phase affinity
  if (cuisineData.lunarPhaseAffinity) {
    const phaseAffinity = cuisineData.lunarPhaseAffinity[lunarPhaseData.name];
    if (phaseAffinity) {
      affinity = phaseAffinity;
    }
  }
  
  // Check elements
  if (cuisineData.elementalAlignment && lunarPhaseData.elementalModifier) {
    let elementalMatch = 0;
    let totalWeight = 0;
    
    for (const [element, weight] of Object.entries(cuisineData.elementalAlignment)) {
      if (lunarPhaseData.elementalModifier[element]) {
        elementalMatch += (weight as number) * lunarPhaseData.elementalModifier[element];
      }
      totalWeight += weight as number;
    }
    
    // Normalize and add to affinity
    if (totalWeight > 0) {
      affinity += (elementalMatch / totalWeight) * 0.5;
    }
  }
  
  // Check enhanced categories
  if (cuisineData.specialties && lunarPhaseData.enhancedCategories) {
    const specialtyMatch = cuisineData.specialties.some(
      (specialty: string) => lunarPhaseData.enhancedCategories.includes(specialty)
    );
    
    if (specialtyMatch) {
      affinity += 0.2;
    }
  }
  
  // Check cooking methods
  if (cuisineData.cookingTechniques && lunarPhaseData.cookingMethods) {
    const techniqueMatch = cuisineData.cookingTechniques.some(
      (technique: string) => lunarPhaseData.cookingMethods.includes(technique)
    );
    
    if (techniqueMatch) {
      affinity += 0.2;
    }
  }
  
  return Math.min(1, affinity);
}

/**
 * Calculate how well a cuisine matches the preferred elemental properties
 * Using the like-to-like matching strategy where same elements have highest affinity
 */
function calculateElementalAffinity(
  cuisineElements: Record<string, number>,
  preferredElements: Record<string, number>
): number {
  let affinity = 0;
  let totalWeight = 0;
  
  for (const [element, weight] of Object.entries(preferredElements)) {
    if (cuisineElements[element]) {
      // Like-to-like matching: direct multiplication of same elements
      affinity += (weight * cuisineElements[element]);
      
      // Boost exact element matches more than partial matches
      if (weight > 0.5 && cuisineElements[element] > 0.5) {
        affinity += 0.2; // Additional bonus for strong elemental alignment
      }
    }
    totalWeight += weight;
  }
  
  // Normalize to 0-1 range
  const normalizedAffinity = totalWeight > 0 ? affinity / totalWeight : 0.5;
  
  // Calculate the total sum of element values in the cuisine
  const cuisineElementSum = Object.values(cuisineElements).reduce((sum, val) => sum + val, 0);
  
  // Calculate the total sum of element values in the preferred elements
  const preferredElementSum = Object.values(preferredElements).reduce((sum, val) => sum + val, 0);
  
  // Add bonus for having similar total elemental presence
  const elementalPresenceSimilarity = 1 - Math.abs(cuisineElementSum - preferredElementSum) / Math.max(cuisineElementSum, preferredElementSum);
  
  // Final affinity with consideration of overall elemental balance
  return normalizedAffinity * 0.8 + elementalPresenceSimilarity * 0.2;
}

/**
 * Calculate how well a cuisine matches the flavor profile of the given ingredients
 */
function calculateFlavorAffinity(
  cuisineData: any,
  ingredientNames: string[]
): number {
  // If no flavor profile data available, return neutral score
  if (!cuisineData.flavorProfiles) {
    return 0.5;
  }
  
  // Get flavor profiles of ingredients
  const ingredientProfiles = ingredientNames.map(name => {
    try {
      // This should be replaced with actual ingredient lookup logic
      return getFlavorProfileForIngredient(name);
    } catch (e) {
      return null;
    }
  }).filter(profile => profile !== null);
  
  if (ingredientProfiles.length === 0) {
    return 0.5;
  }
  
  // Calculate average ingredient flavor profile
  const avgProfile = {
    spicy: 0,
    sweet: 0,
    sour: 0,
    bitter: 0,
    salty: 0,
    umami: 0
  };
  
  for (const profile of ingredientProfiles) {
    Object.keys(avgProfile).forEach(flavor => {
      avgProfile[flavor as keyof typeof avgProfile] += profile[flavor as keyof typeof profile] || 0;
    });
  }
  
  // Normalize the average profile
  Object.keys(avgProfile).forEach(flavor => {
    avgProfile[flavor as keyof typeof avgProfile] /= ingredientProfiles.length;
  });
  
  // Calculate cosine similarity between avgProfile and cuisineData.flavorProfiles
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  
  Object.keys(avgProfile).forEach(flavor => {
    const a = avgProfile[flavor as keyof typeof avgProfile];
    const b = cuisineData.flavorProfiles[flavor] || 0;
    
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  });
  
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  
  const similarity = dotProduct / (magA * magB);
  
  // Check if any ingredients directly match signature ingredients of the cuisine
  let signatureIngredientMatch = 0;
  if (cuisineData.signatureIngredients && cuisineData.signatureIngredients.length > 0) {
    // Count how many ingredients match signature ingredients
    const matchCount = ingredientNames.filter(name => 
      cuisineData.signatureIngredients.some((sigIngredient: string) => 
        name.toLowerCase().includes(sigIngredient.toLowerCase()) || 
        sigIngredient.toLowerCase().includes(name.toLowerCase())
      )
    ).length;
    
    if (matchCount > 0) {
      // Calculate match score - higher if more signature ingredients are matched
      signatureIngredientMatch = Math.min(1, matchCount / Math.min(3, cuisineData.signatureIngredients.length));
    }
  }
  
  // Check ingredient categories match (seafood, meat, vegetables, etc.)
  let categoryMatch = 0;
  if (cuisineData.primaryIngredientCategories) {
    const ingredientCategories = getIngredientCategories(ingredientNames);
    
    // Count matching categories
    const matchingCategoryCount = Object.entries(ingredientCategories)
      .filter(([category, count]) => 
        cuisineData.primaryIngredientCategories.includes(category) && count > 0
      ).length;
    
    if (matchingCategoryCount > 0) {
      categoryMatch = Math.min(1, matchingCategoryCount / Math.min(3, cuisineData.primaryIngredientCategories.length));
    }
  }
  
  // Combine all factors, with more weight on direct signature ingredient matches
  return (
    (similarity * 0.5) + 
    (signatureIngredientMatch * 0.35) + 
    (categoryMatch * 0.15)
  );
}

/**
 * Get categories for a list of ingredients (helper function)
 */
function getIngredientCategories(ingredientNames: string[]): Record<string, number> {
  const categories: Record<string, number> = {
    'seafood': 0,
    'meat': 0,
    'poultry': 0,
    'vegetables': 0,
    'fruits': 0,
    'dairy': 0,
    'grains': 0,
    'legumes': 0,
    'herbs': 0,
    'spices': 0
  };
  
  // Simple keyword matching for categories
  const categoryKeywords: Record<string, string[]> = {
    'seafood': ['fish', 'seafood', 'shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'squid', 'octopus', 'salmon', 'tuna'],
    'meat': ['beef', 'pork', 'lamb', 'mutton', 'veal', 'venison', 'bison', 'meat', 'steak', 'bacon', 'ham', 'sausage'],
    'poultry': ['chicken', 'turkey', 'duck', 'goose', 'quail', 'poultry'],
    'vegetables': ['vegetable', 'tomato', 'potato', 'onion', 'garlic', 'carrot', 'broccoli', 'spinach', 'kale', 'cabbage', 'lettuce', 'pepper', 'eggplant', 'zucchini', 'cucumber'],
    'fruits': ['fruit', 'apple', 'orange', 'banana', 'grape', 'berry', 'pear', 'melon', 'mango', 'pineapple', 'avocado', 'lemon', 'lime'],
    'dairy': ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'dairy'],
    'grains': ['rice', 'wheat', 'oat', 'barley', 'quinoa', 'corn', 'grain', 'pasta', 'noodle', 'bread', 'flour'],
    'legumes': ['bean', 'lentil', 'pea', 'chickpea', 'soybean', 'tofu', 'tempeh', 'legume'],
    'herbs': ['herb', 'basil', 'thyme', 'oregano', 'rosemary', 'mint', 'cilantro', 'parsley', 'sage', 'dill'],
    'spices': ['spice', 'pepper', 'cumin', 'coriander', 'cinnamon', 'nutmeg', 'cardamom', 'turmeric', 'paprika', 'chili']
  };
  
  // Count ingredients by category
  for (const ingredient of ingredientNames) {
    const lowerIngredient = ingredient.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
        categories[category]++;
        break;  // Each ingredient counts for only one category
      }
    }
  }
  
  return categories;
}

/**
 * Check if a cuisine meets all dietary requirements
 */
function meetsAllDietaryRequirements(cuisineData: any, requirements: string[]): boolean {
  if (!cuisineData.dietarySuitability) {
    return false;
  }
  
  return requirements.every(req => 
    cuisineData.dietarySuitability[req] && cuisineData.dietarySuitability[req] >= 0.6
  );
}

/**
 * Find recommended dishes from a cuisine based on various factors
 */
function findRecommendedDishes(
  cuisineData: any,
  lunarPhase: LunarPhase,
  zodiacSign?: ZodiacSign,
  ingredients: string[] = [],
  season: string = 'any'
): string[] {
  const recommendations: string[] = [];
  
  // Make sure cuisineData has dishes
  if (!cuisineData.dishes) {
    return recommendations;
  }
  
  // Go through all dishes in the cuisine
  Object.entries(cuisineData.dishes || {}).forEach(([dishName, dishData]) => {
    // Type the dishData properly
    const typedDishData = dishData as { 
      seasonal?: string[]; 
      ingredients?: string[]; 
      recommendedFor?: string[];
      lunarPhases?: string[];
      zodiacSigns?: string[];
      score?: number;
    };
    
    // Check if this dish matches the current season
    if (season !== 'any' && typedDishData.seasonal && !typedDishData.seasonal.includes(season)) {
      return; // Skip this dish
    }
    
    // Check if this dish uses the requested ingredients
    if (ingredients.length > 0 && typedDishData.ingredients) {
      const matchesIngredients = ingredients.some(ing => 
        typedDishData.ingredients?.includes(ing)
      );
      if (!matchesIngredients) {
        return; // Skip this dish
      }
    }
    
    // Check lunar phase compatibility
    if (typedDishData.lunarPhases && !typedDishData.lunarPhases.includes(lunarPhase)) {
      return; // Skip this dish
    }
    
    // Check zodiac compatibility
    if (zodiacSign && typedDishData.zodiacSigns && !typedDishData.zodiacSigns.includes(zodiacSign)) {
      return; // Skip this dish
    }
    
    // Add the dish to recommendations
    recommendations.push(dishName);
  });
  
  return recommendations;
}

/**
 * Mock function to get ingredient flavor profile
 * This should be replaced with actual data lookup
 */
function getFlavorProfileForIngredient(name: string) {
  // Default flavor profile
  return {
    spicy: 0.2,
    sweet: 0.3,
    sour: 0.2,
    bitter: 0.1,
    salty: 0.2,
    umami: 0.3
  };
}

/**
 * Get a quick cuisine recommendation based on lunar phase
 * This is a simpler version for when a full calculation isn't needed
 */
export function getQuickCuisineRecommendation(lunarPhase: LunarPhase): string[] {
  // Lunar phase preferences for different cuisine types
  const lunarPhaseCuisineMap: Record<string, string[]> = {
    'new moon': [
      'japanese', 'vietnamese', 'korean', 'cantonese', 'raw',
      'mediterranean', 'thai', 'plant-based'
    ],
    'waxing crescent': [
      'lebanese', 'turkish', 'moroccan', 'greek', 'spanish',
      'vietnamese', 'californian', 'farm-to-table'
    ],
    'first quarter': [
      'italian', 'mexican', 'spanish', 'middle eastern', 'peruvian',
      'fusion', 'contemporary'
    ],
    'waxing gibbous': [
      'french', 'italian', 'spanish', 'greek', 'californian', 
      'new american', 'fusion', 'farm-to-table'
    ],
    'full moon': [
      'italian', 'french', 'spanish', 'moroccan', 'turkish',
      'greek', 'indian', 'thai', 'cajun', 'creole'
    ],
    'waning gibbous': [
      'indian', 'french', 'cajun', 'creole', 'southern',
      'comfort food', 'barbecue', 'soul food'
    ],
    'last quarter': [
      'mexican', 'tex-mex', 'cajun', 'creole', 'southern',
      'soul food', 'barbecue', 'comfort food'
    ],
    'waning crescent': [
      'indian', 'thai', 'vietnamese', 'korean', 'japanese',
      'plant-based', 'cleansing', 'raw'
    ]
  };
  
  // Get specific cuisine recommendations for the lunar phase
  const recommendedCuisines = lunarPhaseCuisineMap[lunarPhase] || [];
  
  // If no specific recommendations are available, provide a fallback based on elemental associations
  if (recommendedCuisines.length === 0) {
    // Map lunar phases to elements
    const lunarElementMap: Record<string, string> = {
      'new moon': 'Fire',
      'waxing crescent': 'Fire',
      'first quarter': 'Air',
      'waxing gibbous': 'Air',
      'full moon': 'Water',
      'waning gibbous': 'Water',
      'last quarter': 'Earth',
      'waning crescent': 'Earth'
    };
    
    const element = lunarElementMap[lunarPhase] || 'balanced';
    
    // Provide element-based recommendations
    const elementalCuisines: Record<string, string[]> = {
      'Fire': ['mexican', 'sichuanese', 'thai', 'cajun', 'korean'],
      'Air': ['mediterranean', 'japanese', 'californian', 'fusion', 'lebanese'],
      'Water': ['cantonese', 'vietnamese', 'japanese', 'peruvian', 'scandinavian'],
      'Earth': ['french', 'italian', 'german', 'russian', 'american']
    };
    
    return elementalCuisines[element] || [
      'italian', 'japanese', 'mediterranean', 'indian', 'chinese'
    ];
  }
  
  // Get current time of day for context-aware recommendations
  const currentHour = new Date().getHours();
  
  // Morning (5-11 AM): Breakfast-friendly cuisines
  if (currentHour >= 5 && currentHour < 11) {
    // Filter for breakfast-friendly cuisines or add some if none match
    const breakfastCuisines = [
      'mediterranean', 'american', 'mexican', 'japanese', 
      'french', 'middle eastern', 'indian'
    ];
    
    // Find overlapping cuisines that work for breakfast
    const morningRecommendations = recommendedCuisines.filter(
      cuisine => breakfastCuisines.includes(cuisine)
    );
    
    // If we have breakfast-compatible lunar recommendations, use those
    if (morningRecommendations.length > 0) {
      return morningRecommendations;
    }
    
    // Otherwise, offer a mix of lunar recommendations and breakfast-friendly options
    return [
      ...recommendedCuisines.slice(0, 3),
      ...breakfastCuisines.slice(0, 2)
    ];
  }
  
  // Evening (17-23): Dinner-friendly cuisines
  if (currentHour >= 17 && currentHour < 23) {
    // More elaborate cuisines that work well for dinner
    const dinnerCuisines = [
      'french', 'italian', 'japanese', 'indian', 'korean', 
      'spanish', 'moroccan', 'thai', 'vietnamese'
    ];
    
    // Find overlapping cuisines that work for dinner
    const eveningRecommendations = recommendedCuisines.filter(
      cuisine => dinnerCuisines.includes(cuisine)
    );
    
    // If we have dinner-compatible lunar recommendations, use those
    if (eveningRecommendations.length > 0) {
      return eveningRecommendations;
    }
  }
  
  // Return the recommendations for the specified lunar phase
  return recommendedCuisines;
}

/**
 * Calculate how strongly a set of planetary aspects influences a cuisine
 */
function calculateAspectAffinity(
  aspects: PlanetaryAspect[],
  cuisinePlanets: string[]
): number {
  if (!aspects.length || !cuisinePlanets.length) {
    return 0;
  }
  
  // Define planetary resonance weights
  const resonanceWeights = {
    // Primary, dominant influences
    primary: {
      conjunction: 1.0,    // Planets aligned - very strong influence
      opposition: 0.8,     // Planets opposed - strong but potentially conflicting
      trine: 0.7,          // 120° - harmonious flow
      square: 0.6,         // 90° - tension that can be creative
      sextile: 0.5,        // 60° - supportive influence
      // Minor aspects
      quincunx: 0.3,       // 150° - adjustment required
      semisextile: 0.2     // 30° - subtle connection
    },
    // Secondary, moderate influences
    secondary: {
      conjunction: 0.5,
      opposition: 0.4,
      trine: 0.35,
      square: 0.3,
      sextile: 0.25,
      quincunx: 0.15,
      semisextile: 0.1
    },
    // Tertiary, minor influences
    tertiary: {
      conjunction: 0.25,
      opposition: 0.2,
      trine: 0.18,
      square: 0.15,
      sextile: 0.12,
      quincunx: 0.08,
      semisextile: 0.05
    }
  };

  // Define planetary importance tiers for cuisine
  const planetaryTiers: Record<string, string[]> = {
    // Cultural foundations of cuisine
    primary: ['Sun', 'Moon', 'Venus', 'Jupiter'],
    // Nuance and character of cuisine
    secondary: ['Mercury', 'Mars', 'Saturn'],
    // Subtle influences
    tertiary: ['Uranus', 'Neptune', 'Pluto']
  };
  
  // Map cuisine planets to their tiers
  const cuisinePlanetTiers: Record<string, string> = {};
  for (const planet of cuisinePlanets) {
    let tier = 'tertiary'; // Default tier
    
    for (const [t, planets] of Object.entries(planetaryTiers)) {
      if (planets.includes(planet)) {
        tier = t;
        break;
      }
    }
    
    cuisinePlanetTiers[planet] = tier;
  }
  
  let totalAffinity = 0;
  let relevantAspects = 0;
  
  // Calculate weighted affinity from each aspect
  for (const aspect of aspects) {
    // Skip aspects with orbs that are too wide (imprecise)
    if (aspect.orb > 6) continue;
    
    const { planet1, planet2, type } = aspect;
    const matchingPlanets = [
      cuisinePlanets.includes(planet1) ? planet1 : null,
      cuisinePlanets.includes(planet2) ? planet2 : null
    ].filter(Boolean);
    
    // Skip if neither planet is relevant to this cuisine
    if (matchingPlanets.length === 0) {
      continue;
    }
    
    // Calculate aspect strength based on matching planets
    let aspectAffinity = 0;
    
    if (matchingPlanets.length === 2) {
      // Both planets match - strongest influence
      const tier1 = cuisinePlanetTiers[matchingPlanets[0]];
      const tier2 = cuisinePlanetTiers[matchingPlanets[1]];
      
      // Use the higher tier between the two planets
      const effectiveTier = tier1 === 'primary' || tier2 === 'primary' ? 'primary' :
                            tier1 === 'secondary' || tier2 === 'secondary' ? 'secondary' : 'tertiary';
      
      aspectAffinity = resonanceWeights[effectiveTier][type] || 0;
      
      // Boost for both planets matching
      aspectAffinity *= 1.2;
    } else {
      // Only one planet matches
      const matchingPlanet = matchingPlanets[0];
      const tier = cuisinePlanetTiers[matchingPlanet];
      
      aspectAffinity = resonanceWeights[tier][type] || 0;
    }
    
    // Adjust for aspect orb (closeness to exact aspect)
    // Smaller orbs (more precise aspects) get higher weight
    const orbFactor = 1 - (aspect.orb / 8); // Scale from 1.0 (0° orb) to 0 (8° orb)
    aspectAffinity *= Math.max(0.5, orbFactor); // At least 50% of base value
    
    // Sum up affinity
    totalAffinity += aspectAffinity;
    relevantAspects++;
  }
  
  // Normalize to a 0-1 range with diminishing returns for many aspects
  if (relevantAspects > 0) {
    // Apply diminishing returns - square root function means 4 aspects aren't 4x as strong
    return Math.min(1, totalAffinity / Math.sqrt(relevantAspects + 2));
  }
  
  return 0;
}

/**
 * Recommend cuisines based on current date's astrological state
 */
export function recommendCuisinesForCurrentDate(options: RecommendationOptions = {}): CuisineRecommendation[] {
  // Get current astrological data
  const lunarPhase = calculateLunarPhase(new Date());
  const planetaryPositions = calculatePlanetaryPositions(new Date());
  const aspects = calculatePlanetaryAspects(planetaryPositions);
  
  // Determine season (Northern Hemisphere)
  const date = new Date();
  const month = date.getMonth(); // 0-11
  let season = 'spring';
  
  if (month >= 2 && month <= 4) {
    season = 'spring';
  } else if (month >= 5 && month <= 7) {
    season = 'summer';
  } else if (month >= 8 && month <= 10) {
    season = 'fall';
  } else {
    season = 'winter';
  }
  
  // For Southern Hemisphere, reverse the seasons
  const isSouthernHemisphere = false; // This would ideally be determined by user location
  if (isSouthernHemisphere) {
    season = {
      'spring': 'fall',
      'summer': 'winter',
      'fall': 'spring',
      'winter': 'summer'
    }[season] || season;
  }
  
  // Determine current zodiac sign from Sun position
  let zodiacSign: ZodiacSign | undefined;
  if (planetaryPositions.Sun) {
    const sunLongitude = planetaryPositions.Sun.exactLongitude;
    
    // Convert solar longitude to zodiac sign (each sign is 30 degrees)
    const signIndex = Math.floor(sunLongitude / 30);
    const signs: ZodiacSign[] = [
      'aries', 'taurus', 'gemini', 'cancer', 
      'leo', 'virgo', 'libra', 'scorpio',
      'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    zodiacSign = signs[signIndex];
  }
  
  // Get elements corresponding to the current zodiac sign
  const zodiacToElement: Record<string, string> = {
    'aries': 'Fire',
    'taurus': 'Earth',
    'gemini': 'Air',
    'cancer': 'Water',
    'leo': 'Fire',
    'virgo': 'Earth',
    'libra': 'Air',
    'scorpio': 'Water',
    'sagittarius': 'Fire',
    'capricorn': 'Earth',
    'aquarius': 'Air',
    'pisces': 'Water'
  };
  
  // Set preferred elements based on current zodiac and lunar phase
  const preferredElements: Record<string, number> = {
    'Fire': 0.2,   // Base fire element value
    'Water': 0.2,  // Base water element value
    'Earth': 0.2,  // Base earth element value
    'Air': 0.2     // Base air element value
  };
  
  if (zodiacSign) {
    const primaryElement = zodiacToElement[zodiacSign];
    // Strongly boost the zodiac's element
    preferredElements[primaryElement] = 1.0;
    
    // Secondary elemental influence from lunar phase
    const lunarElementMap: Record<string, string> = {
      'new moon': 'Fire',
      'waxing crescent': 'Fire',
      'first quarter': 'Air',
      'waxing gibbous': 'Air',
      'full moon': 'Water',
      'waning gibbous': 'Water',
      'last quarter': 'Earth',
      'waning crescent': 'Earth'
    };
    
    const secondaryElement = lunarElementMap[lunarPhase];
    if (secondaryElement) {
      // If secondary element matches primary, enhance it further
      if (secondaryElement === primaryElement) {
        // Like-to-like reinforcement
        preferredElements[secondaryElement] = 1.2; // Super boost for matching elements
      } else {
        // If different, still boost but not as much
        preferredElements[secondaryElement] = 0.7;
      }
    }
    
    // Apply cardinal influence if applicable
    if (checkCardinalInfluence(zodiacSign)) {
      // Cardinal signs get extra elemental boost
      Object.keys(preferredElements).forEach(element => {
        if (preferredElements[element] > 0.3) {
          preferredElements[element] += 0.1; // Additional boost for cardinal influence
        }
      });
    }
  }
  
  // Merge user options with astrological state
  const mergedOptions = {
    ...options,
    season: options.season || season,
    preferredElements: options.preferredElements || preferredElements
  };
  
  return recommendCuisines(
    {
    lunarPhase,
    zodiacSign,
    aspects
    },
    mergedOptions
  );
}

/**
 * Get the dominant element from elemental properties
 */
function getDominantElement(elementalProps: Record<string, number>): string {
  const entries = Object.entries(elementalProps);
  if (entries.length === 0) return "balanced";
  
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0]; // Return the element with highest value
}

/**
 * Check if the zodiac sign has cardinal influence
 * Cardinal signs: Aries, Cancer, Libra, Capricorn
 */
function checkCardinalInfluence(zodiacSign?: ZodiacSign): boolean {
  if (!zodiacSign) return false;
  
  const cardinalSigns = ['aries', 'cancer', 'libra', 'capricorn'];
  return cardinalSigns.includes(zodiacSign);
}

// Helper function to calculate Venus flavor affinity
function calculateVenusFlavorAffinity(
  venusFlavorProfile: Record<string, number>,
  cuisineFlavorProfile: Record<string, number>
): number {
  let totalMatch = 0;
  let totalPossible = 0;
  
  // Calculate how well the cuisine matches Venus flavor preferences
  for (const flavor in venusFlavorProfile) {
    if (cuisineFlavorProfile[flavor]) {
      const venusValue = venusFlavorProfile[flavor];
      const cuisineValue = cuisineFlavorProfile[flavor];
      
      // Higher weight for sweet flavor, the dominant Venus flavor
      const flavorWeight = flavor.toLowerCase() === 'sweet' ? 1.5 : 1.0;
      
      // Higher score for closer matches
      const match = (1 - Math.abs(venusValue - cuisineValue)) * flavorWeight;
      totalMatch += match;
      totalPossible += flavorWeight;
    }
  }
  
  // Return normalized score (0-1 range)
  return totalPossible > 0 ? totalMatch / totalPossible : 0;
}

// Add a Mars flavor affinity calculation function similar to Venus
function calculateMarsFlavorAffinity(
  marsFlavorProfile: Record<string, number>,
  cuisineFlavorProfile: Record<string, number>
): number {
  let score = 0;
  let matchCount = 0;
  
  for (const flavor in marsFlavorProfile) {
    if (cuisineFlavorProfile[flavor]) {
      // Higher score when Mars preference is high and cuisine has matching high value
      score += marsFlavorProfile[flavor] * cuisineFlavorProfile[flavor];
      matchCount++;
    }
  }
  
  // Normalize the score
  if (matchCount > 0) {
    score = score / matchCount;
  }
  
  return score;
}

// Add the new function for Mercury flavor affinity
function calculateMercuryFlavorAffinity(
  mercuryFlavorProfile: Record<string, number>,
  cuisineFlavorProfile: Record<string, number>
): number {
  let affinityScore = 0;
  let totalPossible = 0;
  
  for (const flavor in mercuryFlavorProfile) {
    if (flavor in cuisineFlavorProfile) {
      const mercuryPreference = mercuryFlavorProfile[flavor];
      const cuisineValue = cuisineFlavorProfile[flavor];
      
      // Calculate the match - higher scores for closer matches
      const match = 1 - Math.abs(mercuryPreference - cuisineValue);
      affinityScore += match * mercuryPreference; // Weight by Mercury's preference intensity
      totalPossible += mercuryPreference;
    }
  }
  
  // Normalize score (0-1 range)
  return totalPossible > 0 ? affinityScore / totalPossible : 0;
}

// Add the new function for Jupiter flavor affinity
function calculateJupiterFlavorAffinity(
  jupiterFlavorProfile: Record<string, number>,
  cuisineFlavorProfile: Record<string, number>
): number {
  let affinityScore = 0;
  let totalPossible = 0;
  
  for (const flavor in jupiterFlavorProfile) {
    if (flavor in cuisineFlavorProfile) {
      const jupiterPreference = jupiterFlavorProfile[flavor];
      const cuisineValue = cuisineFlavorProfile[flavor];
      
      // Calculate the match - higher scores for closer matches
      const match = 1 - Math.abs(jupiterPreference - cuisineValue);
      affinityScore += match * jupiterPreference; // Weight by Jupiter's preference intensity
      totalPossible += jupiterPreference;
    }
  }
  
  // Normalize score (0-1 range)
  return totalPossible > 0 ? affinityScore / totalPossible : 0;
}

// Add the new function for Saturn flavor affinity
function calculateSaturnFlavorAffinity(
  saturnFlavorProfile: Record<string, number>,
  cuisineFlavorProfile: Record<string, number>
): number {
  let affinityScore = 0;
  let totalPossible = 0;
  
  for (const flavor in saturnFlavorProfile) {
    if (flavor in cuisineFlavorProfile) {
      const saturnPreference = saturnFlavorProfile[flavor];
      const cuisineValue = cuisineFlavorProfile[flavor];
      
      // Calculate the match - higher scores for closer matches
      const match = 1 - Math.abs(saturnPreference - cuisineValue);
      affinityScore += match * saturnPreference; // Weight by Saturn's preference intensity
      totalPossible += saturnPreference;
    }
  }
  
  // Normalize score (0-1 range)
  return totalPossible > 0 ? affinityScore / totalPossible : 0;
}

export function calculateCuisineScore(cuisine: CuisineProfile, astroState: AstrologicalState): number {
  // Use the existing score calculation
  const baseScore = calculateBaseScore(cuisine, astroState);
  
  // Apply a multiplier to better reflect improved recommendation logic
  const multiplier = 2.0;  // Adjustable multiplier to improve displayed percentages
  return Math.min(1.0, baseScore * multiplier);  // Cap at 1.0 (100%)
} 