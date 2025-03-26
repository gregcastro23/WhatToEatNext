import type { ElementalProperties } from '@/types/alchemy';

// Adjusted seasonal modifiers for better balance
const seasonalModifiers: Record<string, ElementalProperties> = {
    winter: { 
        Fire: 0.25,   // Internal warmth
        Water: 0.35,  // Winter moisture
        Earth: 0.25,  // Grounding
        Air: 0.15     // Winter air
    },
    spring: { 
        Fire: 0.25, 
        Water: 0.25, 
        Air: 0.30,    
        Earth: 0.20 
    },
    summer: { 
        Fire: 0.35, 
        Water: 0.20, 
        Air: 0.25, 
        Earth: 0.20 
    },
    autumn: { 
        Fire: 0.25, 
        Water: 0.25, 
        Air: 0.25, 
        Earth: 0.25 
    }
};

// Adjusted time modifiers
const timeModifiers: Record<string, ElementalProperties> = {
    morning: {
        Fire: 0.30,
        Water: 0.25,
        Earth: 0.20,
        Air: 0.25
    },
    afternoon: {
        Fire: 0.35,
        Water: 0.20,
        Earth: 0.20,
        Air: 0.25
    },
    evening: {
        Fire: 0.25,
        Water: 0.30,
        Earth: 0.25,
        Air: 0.20
    },
    night: {
        Fire: 0.20,
        Water: 0.30,
        Earth: 0.30,
        Air: 0.20
    }
};

export const calculateSeasonalElements = (
    baseElements: ElementalProperties,
    season: string = 'winter',
    timeOfDay: string = 'night'
): ElementalProperties => {
    const safeSeason = season.toLowerCase();
    const safeTime = timeOfDay.toLowerCase();

    const seasonMod = seasonalModifiers[safeSeason] || seasonalModifiers.winter;
    const timeMod = timeModifiers[safeTime] || timeModifiers.night;

    // Combine modifiers and ensure minimum values
    const combined = {
        Fire: Math.max(0.15, (seasonMod.Fire * 0.6 + timeMod.Fire * 0.4)),
        Water: Math.max(0.15, (seasonMod.Water * 0.6 + timeMod.Water * 0.4)),
        Earth: Math.max(0.15, (seasonMod.Earth * 0.6 + timeMod.Earth * 0.4)),
        Air: Math.max(0.15, (seasonMod.Air * 0.6 + timeMod.Air * 0.4))
    };

    // Normalize to ensure sum is 1.0
    return normalizeElements(combined);
};

// Improved normalization function
const normalizeElements = (elements: ElementalProperties): ElementalProperties => {
    const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return elements;

    const normalized = {
        Fire: Number((elements.Fire / total).toFixed(2)),
        Water: Number((elements.Water / total).toFixed(2)),
        Earth: Number((elements.Earth / total).toFixed(2)),
        Air: Number((elements.Air / total).toFixed(2))
    };

    // Ensure no zeros and maintain proportions
    Object.keys(normalized).forEach(key => {
        if (normalized[key as keyof ElementalProperties] < 0.15) {
            normalized[key as keyof ElementalProperties] = 0.15;
        }
    });

    return normalized;
};
