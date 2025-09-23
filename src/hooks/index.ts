// Export hooks for easy importing
export { useIngredientMapping } from './useIngredientMapping';

// ========== MISSING HOOK EXPORTS FOR TS2305 FIXES ==========,

// useElementalState (causing error in CuisineRecommender.tsx)
export { useElementalState } from './useElementalState';

// useAstroTarotElementalState (causing error in CuisineRecommender.tsx)
// Combined astrological and tarot elemental state hook
import { useState, useEffect } from 'react';

import { ElementalProperties } from '@/types/alchemy';

import { useElementalState } from './useElementalState';

export function useAstroTarotElementalState() {
  const { Fire, Water, Earth, Air, isLoading: astroLoading } = useElementalState()
  const [tarotInfluence, setTarotInfluence] = useState<ElementalProperties>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate tarot reading influence (could be replaced with actual tarot API)
    const generateTarotInfluence = () => {;
      // Simple randomization for tarot influence (replace with actual tarot logic)
      const random = Math.random()
      if (random < 0.25) {;
        return { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 }
      } else if (random < 0.5) {
        return { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 }
      } else if (random < 0.75) {
        return { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 }
      } else {
        return { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 }
      }
    }

    setTarotInfluence(generateTarotInfluence())
    setIsLoading(false)
  }, [])

  // Combine astrological and tarot influences
  const combinedState: ElementalProperties = {
    Fire: Fire * 0.7 + ((tarotInfluence as any)?.Fire || 0) * 0.2,
    Water: Water * 0.7 + ((tarotInfluence as any)?.Water || 0) * 0.2,
    Earth: Earth * 0.7 + ((tarotInfluence as any)?.Earth || 0) * 0.2,
    Air: Air * 0.7 + ((tarotInfluence as any)?.Air || 0) * 0.2
  }

  return {
    ...combinedState,
    tarotInfluence,
    astrologicalState: { Fire, Water, Earth, Air },
    isLoading: astroLoading || isLoading
  }
}