export interface SignEnergyState {
    sign: ZodiacSign;
    baseEnergy: number;
    planetaryModifiers: Record<string, number>;
    currentEnergy: number;
}

export const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Base energy levels for each sign
const BASE_SIGN_ENERGIES: Record<ZodiacSign, number> = {
    Aries: 1.0,
    Taurus: 0.8,
    Gemini: 0.6,
    Cancer: 0.7,
    Leo: 0.9,
    Virgo: 0.6,
    Libra: 0.7,
    Scorpio: 0.8,
    Sagittarius: 0.9,
    Capricorn: 0.7,
    Aquarius: 0.6,
    Pisces: 0.8
};

// Planetary rulerships and their energy multipliers
const PLANETARY_RULERSHIPS: Record<ZodiacSign, string[]> = {
    Aries: ['Mars'],
    Taurus: ['Venus'],
    Gemini: ['Mercury'],
    Cancer: ['Moon'],
    Leo: ['Sun'],
    Virgo: ['Mercury'],
    Libra: ['Venus'],
    Scorpio: ['Mars', 'Pluto'],
    Sagittarius: ['Jupiter'],
    Capricorn: ['Saturn'],
    Aquarius: ['Uranus', 'Saturn'],
    Pisces: ['Neptune', 'Jupiter']
};

// Planetary energy multipliers
const PLANETARY_ENERGY_MULTIPLIERS: Record<string, number> = {
    Sun: 1.2,
    Moon: 1.1,
    Mercury: 0.9,
    Venus: 1.0,
    Mars: 1.3,
    Jupiter: 1.1,
    Saturn: 0.8,
    Uranus: 0.9,
    Neptune: 1.0,
    Pluto: 1.2
};

// Aspect strength multipliers
const ASPECT_STRENGTHS: Record<string, number> = {
    conjunction: 1.2,
    sextile: 1.1,
    square: 0.9,
    trine: 1.1,
    opposition: 0.8
};

export function calculateSignEnergyStates(planetaryPositions: Record<string, any>, aspects: Aspect[]): SignEnergyState[] {
    return ZODIAC_SIGNS.map(sign => {
        const baseEnergy = BASE_SIGN_ENERGIES[sign];
        const planetaryModifiers: Record<string, number> = {};
        
        // Apply planetary rulers' influences
        PLANETARY_RULERSHIPS[sign].forEach(planet => {
            const planetPosition = planetaryPositions[planet];
            if (planetPosition) {
                // Calculate influence based on planet's position and strength
                const positionStrength = 1 - (planetPosition.degree / 30);
                const planetMultiplier = PLANETARY_ENERGY_MULTIPLIERS[planet] || 1.0;
                
                // Apply aspect modifiers
                const aspectModifier = aspects.reduce((mod, aspect) => {
                    if (aspect.planet1 === planet || aspect.planet2 === planet) {
                        return mod * ASPECT_STRENGTHS[aspect.type] || 1.0;
                    }
                    return mod;
                }, 1.0);
                
                planetaryModifiers[planet] = positionStrength * planetMultiplier * aspectModifier;
            }
        });
        
        // Calculate current energy
        const currentEnergy = Object.values(planetaryModifiers).reduce(
            (total, modifier) => total * modifier,
            baseEnergy
        );
        
        return {
            sign,
            baseEnergy,
            planetaryModifiers,
            currentEnergy: Math.min(1.0, Math.max(0.1, currentEnergy))
        };
    });
} 