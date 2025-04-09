import { ElementalAffinity, Season } from '@/types/alchemy';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export const seasonalElements: Record<Season, ElementalAffinity> = {
  spring: { base: 'Air', element: 'Air', strength: 0.7, source: 'seasonal' },
  summer: { base: 'Fire', element: 'Fire', strength: 0.8, source: 'seasonal' },
  fall: { base: 'Earth', element: 'Earth', strength: 0.6, source: 'seasonal' },
  winter: { base: 'Water', element: 'Water', strength: 0.75, source: 'seasonal' },
  autumn: { base: 'Earth', element: 'Earth', strength: 0.6, source: 'seasonal' },
  all: { base: 'Air', element: 'Air', strength: 0.5, source: 'all_seasons' }
};
