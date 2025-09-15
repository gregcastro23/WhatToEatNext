import type { _IngredientMapping } from '@/types/alchemy';


export const _grainCuisineMatrix: Record<string, string[]> = {
  white_rice: ['japanese', 'chinese', 'korean', 'indian', 'thai'],
  brown_rice: ['american', 'macrobiotic', 'health_focused'],
  quinoa: ['peruvian', 'bolivian', 'health_focused'],
  semolina: ['italian', 'north_african', 'indian']
};

export const _traditionalPairings: Record<string, string[]> = {
  japanese: ['short_grain_white', 'brown_rice'],
  italian: ['semolina', 'arborio', 'farro'],
  indian: ['basmati', 'brown_rice', 'semolina'],
  middle_eastern: ['bulgur', 'freekeh', 'couscous']
};
