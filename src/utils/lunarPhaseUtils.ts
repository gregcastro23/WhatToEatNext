import type { ElementalProperties, LunarPhaseModifier } from '@/data/ingredients/types';

/**
 * Generates default lunar phase modifiers based on an ingredient's elemental properties
 */
export function generateDefaultLunarPhaseModifiers(
  elementalProps: ElementalProperties, 
  ingredientName: string,
  category: string
): Record<string, LunarPhaseModifier> {
  // Find dominant element
  const dominantElement = Object.entries(elementalProps)
    .sort(([_, a], [__, b]) => b - a)[0][0];
  
  const secondaryElement = Object.entries(elementalProps)
    .sort(([_, a], [__, b]) => b - a)[1][0];
  
  // Base modifiers on dominant element
  const lunarModifiers: Record<string, LunarPhaseModifier> = {
    newMoon: {
      elementalBoost: { [dominantElement]: 0.1, [secondaryElement]: 0.05 },
      preparationTips: [`Good for subtle ${category} preparations`]
    },
    fullMoon: {
      elementalBoost: { [dominantElement]: 0.2 },
      preparationTips: [`${ingredientName} properties are enhanced`, `Best time for ${category} highlights`]
    }
  };
  
  // Add additional phases based on dominant element
  if (dominantElement === 'Fire') {
    lunarModifiers.waxingGibbous = {
      elementalBoost: { Fire: 0.15, Air: 0.05 },
      preparationTips: ['Excellent for cooking with heat', 'Good for spicy preparations']
    };
  } else if (dominantElement === 'Water') {
    lunarModifiers.waningGibbous = {
      elementalBoost: { Water: 0.15, Earth: 0.05 },
      preparationTips: ['Good for preserves and sauces', 'Liquid preparations enhanced']
    };
  } else if (dominantElement === 'Earth') {
    lunarModifiers.lastQuarter = {
      elementalBoost: { Earth: 0.15, Water: 0.05 },
      preparationTips: ['Best for grounding dishes', 'Good for preservation']
    };
  } else if (dominantElement === 'Air') {
    lunarModifiers.firstQuarter = {
      elementalBoost: { Air: 0.15, Fire: 0.05 },
      preparationTips: ['Perfect for aromatic preparations', 'Enhances subtle flavors']
    };
  }
  
  return lunarModifiers;
} 