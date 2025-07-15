import { ElementalAffinity, Season } from '@/types/alchemy';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export const seasonalElements: Record<Season, ElementalAffinity> = {
  spring: { 
    primary: 'Air', 
    strength: 0.7, 
    compatibility: { Fire: 0.8, Water: 0.6, Earth: 0.7, Air: 0.9 } 
  },
  summer: { 
    primary: 'Fire', 
    strength: 0.8, 
    compatibility: { Fire: 0.9, Water: 0.5, Earth: 0.7, Air: 0.8 } 
  },
  fall: { 
    primary: 'Earth', 
    strength: 0.6, 
    compatibility: { Fire: 0.7, Water: 0.8, Earth: 0.9, Air: 0.6 } 
  },
  winter: { 
    primary: 'Water', 
    strength: 0.75, 
    compatibility: { Fire: 0.5, Water: 0.9, Earth: 0.8, Air: 0.7 } 
  },
  autumn: { 
    primary: 'Earth', 
    strength: 0.6, 
    compatibility: { Fire: 0.7, Water: 0.8, Earth: 0.9, Air: 0.6 } 
  },
  all: { 
    primary: 'Air', 
    strength: 0.5, 
    compatibility: { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.7 } 
  }
};

// Export consolidated seasonal data object that components expect
export const seasonalData = {
  getCurrentSeason,
  seasonalElements,
  seasons: ['spring', 'summer', 'fall', 'winter', 'autumn', 'all'] as Season[],
  
  // Additional seasonal data helpers
  getSeasonalElement: (season: Season) => seasonalElements[season]?.primary || 'Air',
  getSeasonalStrength: (season: Season) => seasonalElements[season]?.strength || 0.5,
  getSeasonalCompatibility: (season: Season) => seasonalElements[season]?.compatibility || { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.7 }
};
