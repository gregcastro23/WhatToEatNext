import { ElementalProperties, Season, ZodiacSign } from '@/types/alchemy';

export const SCORE_THRESHOLDS = {
    EXCELLENT: 80,
    GOOD: 60,
    MODERATE: 40,
    POOR: 20
};

export const SEASONAL_MODIFIERS: Record<Season, ElementalProperties> = {
    Spring: {
        Air: 0.4,
        Water: 0.3,
        Earth: 0.2,
        Fire: 0.1
    },
    Summer: {
        Fire: 0.4,
        Air: 0.3,
        Water: 0.2,
        Earth: 0.1
    },
    Autumn: {
        Earth: 0.4,
        Air: 0.3,
        Fire: 0.2,
        Water: 0.1
    },
    Winter: {
        Water: 0.4,
        Earth: 0.3,
        Fire: 0.2,
        Air: 0.1
    }
};

export const ZODIAC_SEASONS: Record<Season, ZodiacSign[]> = {
    Spring: ['Aries', 'Taurus', 'Gemini'],
    Summer: ['Cancer', 'Leo', 'Virgo'],
    Autumn: ['Libra', 'Scorpio', 'Sagittarius'],
    Winter: ['Capricorn', 'Aquarius', 'Pisces']
};

export const VALIDATION_THRESHOLDS = {
    MINIMUM_ELEMENT: 0,
    MAXIMUM_ELEMENT: 1,
    BALANCE_PRECISION: 0.000001
};

export const VALID_SEASONS = [
    'Spring',
    'Summer',
    'Autumn',
    'Winter',
    'all'
] as const;