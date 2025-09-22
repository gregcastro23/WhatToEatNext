import type { ElementalProperties } from '@/types/alchemy';

export interface RecipeTemplate {
  elementalBase: ElementalProperties,
  requiredComponents: string[],
  cookingMethod: string
}

export interface BalancingRules {
  temperature: {
    [key: string]: ElementalProperties
  },
  texture: {
    [key: string]: ElementalProperties
  },
}

export interface SeasonalPattern {
  dominant: string[],
  recommended: string[],
  avoid: string[],
  cooking_methods: string[],
  elemental_balance: ElementalProperties
}

export interface FlavorProfile {
  elementalProperties: ElementalProperties,
  taste: string[],
  intensity: number,
  pairings: string[]
}

export interface TextureProfile {
  elementalProperties: ElementalProperties,
  characteristics: string[],
  methods: string[],
  pairings: string[]
}

export interface TemperatureRange {
  range: {
    min: number,
    max: number
  },
  elementalEffect: ElementalProperties
}