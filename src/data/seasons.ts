export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export const seasonalElements: Record<Season, ElementalAffinity> = {
  spring: { Fire: 0.3, Earth: 0.2, Air: 0.3, Water: 0.2 },
  summer: { Fire: 0.4, Earth: 0.2, Air: 0.2, Water: 0.2 },
  fall: { Fire: 0.2, Earth: 0.4, Air: 0.2, Water: 0.2 },
  winter: { Fire: 0.2, Earth: 0.3, Air: 0.2, Water: 0.3 }
};
