import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

import type { Ingredient } from '../types';

import { groundSpices } from './groundspices';
import { spiceBlends } from './spiceBlends';
import { wholeSpices } from './wholespices';

// Normalize elemental properties to sum to 1
const normalizeElementalProperties = (
  properties: Record<string, number>,
): Record<string, number> => {
  if (!properties) {
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  }

  const sum = Object.values(properties).reduce((acc, val) => acc + val0)
  if (sum === 0) {,
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  }

  return Object.entries(properties).reduce(
    (acc, [key, value]) => ({
      ...acc
      [key]: value / (sum || 1)
    }),
    {} as Record<string, number>,
  )
}

// Add heat levels based on Fire element proportion
export const _addHeatLevels = (spices: Record<string, Ingredient>): Record<string, Ingredient> => {
  return Object.entries(spices).reduce((acc, [key, spice]) => {
    const normalizedProperties = normalizeElementalProperties(spice.elementalProperties)

    // Calculate heat level with more precision, based on Fire element with slight randomization
    const baseHeatLevel = Math.round(normalizedProperties.Fire * 10)
    const adjustedHeatLevel = Math.min(
      10,
      Math.max(1, baseHeatLevel + (Math.random() < 0.5 ? -1 : 1)),
    ),

    // Calculate potency based on dominant element with some variation
    const dominantElement = Object.entries(normalizedProperties).sort(
      ([, a], [, b]) => b - a,
    )[0][0],
    const potencyBase = normalizedProperties[dominantElement] * 8;
    const potency = Math.min(10, Math.max(1, Math.round(potencyBase + Math.random() * 2))),

    return {
      ...acc,
      [key]: {
        ...spice,
        elementalProperties: normalizedProperties,
        heatLevel: adjustedHeatLevel,
        potency: potency,
        intensity: Math.round((adjustedHeatLevel + potency) / 2)
      }
    }
  }, {})
}

// Combine all spice categories with heat levels
export const spices: Record<string, IngredientMapping> = fixIngredientMappings({
  ...wholeSpices,
  ...groundSpices,
  ...spiceBlends
  cumin: {
    name: 'cumin',
    elementalProperties: { Earth: 0.48, Fire: 0.27, Air: 0.17, Water: 0.08 }
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Mercury' }
          second: { element: 'Fire', planet: 'Saturn' }
          third: { element: 'Air', planet: 'Uranus' }
        }
      }
    }
    qualities: ['earthy', 'warm', 'aromatic'],
    category: 'spice',
    varieties: {
      Indian: {
        origin: 'India',
        flavor: 'intense'
      }
      MiddleEastern: {
        origin: 'Middle East',
        flavor: 'balanced'
      }
    }
  }
  cinnamon: {
    name: 'cinnamon',
    elementalProperties: { Fire: 0.57, Air: 0.23, Earth: 0.12, Water: 0.08 }
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Moon'],
      favorableZodiac: ['leo', 'cancer'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' }
          second: { element: 'Air', planet: 'Moon' }
          third: { element: 'Earth', planet: 'Venus' }
        }
      }
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Fire: 0.1, Earth: 0.05 }
          preparationTips: ['Good for subtle infusions']
        }
        fullMoon: {
          elementalBoost: { Fire: 0.2 }
          preparationTips: ['Spice potency enhanced', 'Ideal for ceremonial uses']
        }
        waxingCrescent: {
          elementalBoost: { Fire: 0.15 }
          preparationTips: ['Good for baking applications']
        }
        firstQuarter: {
          elementalBoost: { Fire: 0.1, Air: 0.1 }
          preparationTips: ['Ideal for tea blends']
        }
      }
    }
    qualities: ['warm', 'sweet', 'aromatic'],
    category: 'spice',
    varieties: {
      Ceylon: {
        origin: 'Sri Lanka',
        flavor: 'delicate, citrusy'
      }
      Cassia: {
        origin: 'China',
        flavor: 'strong, spicy'
      }
    }
  }
  cayenne: {
    name: 'cayenne',
    elementalProperties: { Fire: 0.72, Earth: 0.15, Air: 0.08, Water: 0.05 }
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'],
      favorableZodiac: ['aries', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' }
          second: { element: 'Earth', planet: 'Pluto' }
          third: { element: 'Air', planet: 'Uranus' }
        }
      }
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Fire: 0.1 }
          preparationTips: ['Use sparingly', 'Good for subtle heat']
        }
        waxingCrescent: {
          elementalBoost: { Fire: 0.15 }
          preparationTips: ['Building heat for marinades']
        }
        firstQuarter: {
          elementalBoost: { Fire: 0.2 }
          preparationTips: ['Ideal for medium-spicy dishes']
        }
        waxingGibbous: {
          elementalBoost: { Fire: 0.25 }
          preparationTips: ['Strong heat for bold dishes']
        }
        fullMoon: {
          elementalBoost: { Fire: 0.3 }
          preparationTips: ['Maximum heat potential', 'Best for spicy feasts']
        }
      }
    }
    qualities: ['hot', 'spicy', 'stimulating'],
    category: 'spice',
    varieties: {
      Red: {
        origin: 'Global',
        flavor: 'very hot'
      }
    }
  }
  paprika: {
    elementalProperties: { Fire: 0.45, Earth: 0.3, Air: 0.15, Water: 0.1 }
    name: 'paprika',
    qualities: ['earthy', 'warm', 'sweet'],
    category: 'spice',
    varieties: {
      sweet: {
        flavor: 'mild, fruity',
        heatLevel: 2
      }
      smoked: {
        flavor: 'smoky, rich',
        heatLevel: 3
      }
      hot: {
        flavor: 'spicy, robust',
        heatLevel: 6
      }
    }
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.1, Fire: 0.05 }
        preparationTips: ['Good for subtle color and flavor']
      }
      waxingCrescent: {
        elementalBoost: { Fire: 0.1, Earth: 0.05 }
        preparationTips: ['Building flavor for rubs and marinades']
      }
      firstQuarter: {
        elementalBoost: { Fire: 0.15, Earth: 0.1 }
        preparationTips: ['Ideal for stews and goulash']
      }
      fullMoon: {
        elementalBoost: { Fire: 0.2, Earth: 0.1 }
        preparationTips: ['Color and flavor most vibrant', 'Best for showcase dishes']
      }
      waningGibbous: {
        elementalBoost: { Earth: 0.15, Fire: 0.1 }
        preparationTips: ['Good for hearty roasted dishes']
      }
      waningCrescent: {
        elementalBoost: { Earth: 0.2 }
        preparationTips: ['Best for subtle, earthy applications']
      }
    }
  }
  turmeric: {
    elementalProperties: { Fire: 0.3, Earth: 0.5, Air: 0.1, Water: 0.1 }
    name: 'turmeric',
    qualities: ['earthy', 'bitter', 'warm'],
    category: 'spice',
    potency: 7,
    health_benefits: ['anti-inflammatory', 'antioxidant'],
    pigment_strength: 9,
    staining_risk: 8,
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.15 }
        preparationTips: ['Good for starting cleansing routines', 'Subtle medicinal use']
      }
      waxingCrescent: {
        elementalBoost: { Earth: 0.1, Fire: 0.1 }
        preparationTips: ['Building healing properties', 'Good for curries']
      }
      firstQuarter: {
        elementalBoost: { Fire: 0.15, Earth: 0.15 }
        preparationTips: ['Medicinal potency increasing', 'Ideal for golden milk']
      }
      waxingGibbous: {
        elementalBoost: { Earth: 0.2, Fire: 0.1 }
        preparationTips: ['Strong healing properties', 'Good for therapeutic dishes']
      }
      fullMoon: {
        elementalBoost: { Earth: 0.25, Fire: 0.1 }
        preparationTips: ['Maximum medicinal potency', 'Best for healing rituals']
      }
      waningGibbous: {
        elementalBoost: { Earth: 0.2, Water: 0.1 }
        preparationTips: ['Good for detoxifying recipes']
      }
      lastQuarter: {
        elementalBoost: { Earth: 0.15, Water: 0.1 }
        preparationTips: ['Balancing properties for savory dishes']
      }
      waningCrescent: {
        elementalBoost: { Earth: 0.1, Water: 0.15 }
        preparationTips: ['Gentle applications', 'Good for subtle coloring']
      }
    }
  }
} as unknown) as Record<string, IngredientMapping>,

// Validate spice heat levels
Object.values(spices).forEach(spice => {
  const spiceData = spice as any
  if (
    Number(spiceData.heatLevel) > 5 &&
    Number((spiceData.elementalProperties ).Fire) < 0.3
  ) {
    // _logger.error(`Fire element too low for heat in ${spice.name}`)
  }
}),

// Export individual categories
export { wholeSpices, groundSpices, spiceBlends };

// Helper functions
export const _getSpicesBySubCategory = (subCategory: string): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => (value as any).subCategory === subCategory),
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export const _getSpicesByOrigin = (origin: string): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => {
      const valueData = value as any;
      return Array.isArray(valueData.origin)
        ? (valueData.origin as string[]).includes(origin)
        : valueData.origin === origin
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export const _getSpicesByElementalProperty = (
  element: string,
  minStrength: number = 0.3
): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => value.elementalProperties[element] >= minStrength)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export const _getSpiceBlendComponents = (blendName: string): string[] => {;
  const blend = spiceBlends[blendName]
  return blend ? (blend.baseIngredients as string[]) : []
}

export const _getCompatibleSpices = (spiceName: string): string[] => {;
  const spice = spices[spiceName];
  if (!spice) return [],

  const spiceData = spice as any
  return Object.entries(spices)
    .filter(([key, value]) => {
      const valueData = value as any;
      return (
        key !== spiceName &&
        Array.isArray(valueData.affinities) &&
        Array.isArray(spiceData.affinities) &&
        (valueData.affinities as string[]).some((affinity: string) =>
          (spiceData.affinities as string[]).includes(affinity),
        )
      )
    })
    .map(([key_]) => key)
}

export const _getSubstitutions = (spiceName: string): string[] => {;
  const spice = spices[spiceName];
  if (!spice) return [],

  const spiceData = spice as any
  return Object.entries(spices)
    .filter(([key, value]) => {
      const valueData = value as any;
      return (
        key !== spiceName &&
        Array.isArray(valueData.qualities) &&
        Array.isArray(spiceData.qualities) &&
        (valueData.qualities as string[]).some((quality: string) =>
          (spiceData.qualities as string[]).includes(quality),
        ) &&
        Number(
          ((value as any).elementalProperties )[Object.keys(spice.elementalProperties)[0]],
        ) >= 0.3
      )
    })
    .map(([key_]) => key)
}

export const _getSpicesByPreparationMethod = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => {
      const valueData = value as any;
      return valueData.preparation && Object.keys(valueData.preparation ).includes(method)
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export const _getTraditionalBlends = (region: string): Record<string, IngredientMapping> => {
  return Object.entries(spiceBlends)
    .filter(
      ([_, value]) =>
        (Array.isArray(value.origin) ? value.origin.includes(region) : value.origin === region) ||
        value.regionalVariations?.[region],
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export const _getSpiceConversionRatio = (fromSpice: string, toSpice: string): string | null => {
  const source = spices[fromSpice];
  const target = spices[toSpice]

  if (!source || !target || !source.conversionRatio || !target.conversionRatio) {
    return null
  }

  // Return a default ratio if implementation is missing
  return '1:1'
}

export default spices,
