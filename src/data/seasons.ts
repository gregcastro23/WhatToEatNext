export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';

export const seasons: Record<Season, {
  name: Season;
  borderClass: string;
  textClass: string;
  bgClass: string;
}> = {
  spring: {
    name: 'spring',
    borderClass: 'border-green-400',
    textClass: 'text-green-600',
    bgClass: 'bg-green-50'
  },
  summer: {
    name: 'summer',
    borderClass: 'border-yellow-400',
    textClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50'
  },
  fall: {
    name: 'fall',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-600',
    bgClass: 'bg-orange-50'
  },
  winter: {
    name: 'winter',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  all: {
    name: 'all',
    borderClass: 'border-gray-300',
    textClass: 'text-gray-600',
    bgClass: 'bg-gray-50'
  }
};

export const getSeasonalClass = (season?: string): string => {
  if (!season) return seasons.all.borderClass;
  
  const normalizedSeason = season.toLowerCase() as Season;
  return seasons[normalizedSeason]?.borderClass || seasons.all.borderClass;
};

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

export const getSeasonalTextClass = (season?: string): string => {
  if (!season) return seasons.all.textClass;
  
  const normalizedSeason = season.toLowerCase() as Season;
  return seasons[normalizedSeason]?.textClass || seasons.all.textClass;
};
