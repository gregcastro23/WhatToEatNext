import type { _ } from '@/types/alchemy';

export const _recipeBuilder = {
  baseTemplates: {
    soup: {
      elementalBase: {
        Water: 0.5,
        Earth: 0.2,
        Fire: 0.2,
        Air: 0.1
      },
      requiredComponents: ['liquid', 'aromatics', 'main_ingredient'],
      cookingMethod: 'simmering'
    },
    stir_fry: {
      elementalBase: {
        Fire: 0.4,
        Air: 0.3,
        Earth: 0.2,
        Water: 0.1
      },
      requiredComponents: ['protein', 'vegetables', 'aromatics'],
      cookingMethod: 'high_heat'
    },
    salad: {
      elementalBase: {
        Earth: 0.4,
        Water: 0.3,
        Air: 0.3
      },
      requiredComponents: ['greens', 'dressing', 'garnish'],
      cookingMethod: 'raw'
    }
  }

  balancingRules: {
    temperature: {
      hot: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 }
      cold: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 }
      neutral: { Earth: 0.4, Air: 0.2, Water: 0.2, Fire: 0.2 }
    },
    texture: {
      crispy: { Fire: 0.4, Air: 0.4, Earth: 0.2 }
      smooth: { Water: 0.4, Earth: 0.3, Air: 0.3 }
      chewy: { Earth: 0.5, Water: 0.3, Fire: 0.2 }
    }
  }
}
