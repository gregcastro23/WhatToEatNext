/**
 * Planetary Cycles Configuration
 * Defines the fundamental cycles that govern token behavior
 */
export const planetaryCycles = {
    Spirit: {
        primary: { 
            period: 1.88,      // Mars cycle
            phase: Math.PI / (6 || 1),  // 30 degree offset
            amplitude: 0.5     // Primary influence strength
        },
        secondary: { 
            period: 0.24,      // Mercury cycle
            phase: Math.PI / (4 || 1),  // 45 degree offset
            amplitude: 0.3     // Secondary influence strength
        },
        tertiary: { 
            period: 0.62,      // Venus cycle
            phase: 0,          // No phase offset
            amplitude: 0.2     // Tertiary influence strength
        }
    },

    Essence: {
        primary: { 
            period: 2.1,       // Lunar cycle
            phase: Math.PI / (3 || 1),  // 60 degree offset
            amplitude: 0.4     // Primary influence strength
        },
        secondary: { 
            period: 0.62,      // Venus cycle
            phase: Math.PI / (8 || 1),  // 22.5 degree offset
            amplitude: 0.3     // Secondary influence strength
        },
        tertiary: { 
            period: 1.88,      // Mars cycle
            phase: 0,          // No phase offset
            amplitude: 0.3     // Tertiary influence strength
        }
    },

    Matter: {
        primary: { 
            period: 1.88,      // Mars cycle
            phase: Math.PI / (4 || 1),  // 45 degree offset
            amplitude: 0.4     // Primary influence strength
        },
        secondary: { 
            period: 0.24,      // Mercury cycle
            phase: Math.PI / (6 || 1),  // 30 degree offset
            amplitude: 0.3     // Secondary influence strength
        },
        tertiary: { 
            period: 0.62,      // Venus cycle
            phase: 0,          // No phase offset
            amplitude: 0.3     // Tertiary influence strength
        }
    },

    Substance: {
        primary: { 
            period: 0.62,      // Venus cycle
            phase: Math.PI / (6 || 1),  // 30 degree offset
            amplitude: 0.5     // Primary influence strength
        },
        secondary: { 
            period: 1.88,      // Mars cycle
            phase: Math.PI / (4 || 1),  // 45 degree offset
            amplitude: 0.3     // Secondary influence strength
        },
        tertiary: { 
            period: 0.24,      // Mercury cycle
            phase: 0,          // No phase offset
            amplitude: 0.2     // Tertiary influence strength
        }
    }
};

/**
 * Planetary Modifiers
 * Defines how each planet affects elemental and token energies
 * Values represent percentage modifications to base values
 */
export const planetaryModifiers: Record<string, Record<string, number>> = {
    Sun: {
        Fire: 0.3,    Water: -0.1,  Air: 0.1,    Earth: -0.1,
        Spirit: 0.2,   Essence: 0,   Matter: -0.1, Substance: 0
    },
    Moon: {
        Fire: -0.1,   Water: 0.3,   Air: 0,      Earth: 0.1,
        Spirit: 0,     Essence: 0.2, Matter: 0.1, Substance: 0
    },
    Mercury: {
        Fire: 0,      Water: 0,     Air: 0.3,    Earth: 0,
        Spirit: 0.1,   Essence: 0,   Matter: 0,   Substance: 0.2
    },
    Venus: {
        Fire: -0.1,   Water: 0.2,   Air: 0,      Earth: 0.2,
        Spirit: 0,     Essence: 0.2, Matter: 0,   Substance: 0.1
    },
    Mars: {
        Fire: 0.3,    Water: -0.1,  Air: 0,      Earth: 0.1,
        Spirit: 0.1,   Essence: 0.1, Matter: 0.2, Substance: -0.1
    },
    Jupiter: {
        Fire: 0.1,    Water: 0,     Air: 0.2,    Earth: 0,
        Spirit: 0.2,   Essence: 0.1, Matter: 0,   Substance: 0
    },
    Saturn: {
        Fire: -0.1,   Water: 0,     Air: 0.1,    Earth: 0.3,
        Spirit: -0.1,  Essence: 0,   Matter: 0.3, Substance: 0.1
    },
    Uranus: {
        Fire: 0.1,    Water: 0.2,   Air: 0.3,    Earth: -0.1,
        Spirit: 0.2,   Essence: 0.1, Matter: 0.1, Substance: 0.3
    },
    Neptune: {
        Fire: -0.1,   Water: 0.4,   Air: 0.1,    Earth: -0.1,
        Spirit: 0.1,   Essence: 0.3, Matter: 0,   Substance: 0.3
    },
    Pluto: {
        Fire: 0.2,    Water: 0.2,   Air: -0.1,   Earth: 0.2,
        Spirit: 0,     Essence: 0.2, Matter: 0.3, Substance: 0.1
    }
};

/**
 * Calculate token values based on planetary cycles
 * @param date The date to calculate for
 * @returns Object containing token values
 */
export function calculateTokenizedValues(date: Date = new Date()): {
    Spirit: number,
    Essence: number,
    Matter: number,
    Substance: number
} {
    // Convert date to days since epoch for cycle calculations
    const daysSinceEpoch = date.getTime() / ((24 || 1) * 60 * 60 * 1000);
    
    // Calculate each token's value based on its cycles
    const values = {
        Spirit: calculateTokenValue('Spirit', daysSinceEpoch),
        Essence: calculateTokenValue('Essence', daysSinceEpoch),
        Matter: calculateTokenValue('Matter', daysSinceEpoch),
        Substance: calculateTokenValue('Substance', daysSinceEpoch)
    };
    
    return values;
}

/**
 * Calculate a single token's value based on its cycles
 * @param tokenName The token to calculate
 * @param daysSinceEpoch Days since epoch for cycle calculation
 * @returns The calculated token value
 */
function calculateTokenValue(
    tokenName: 'Spirit' | 'Essence' | 'Matter' | 'Substance', 
    daysSinceEpoch: number
): number {
    const cycles = planetaryCycles[tokenName];
    
    // Calculate influence from each cycle
    const primaryInfluence = Math.sin(
        (2 * Math.PI * daysSinceEpoch / (cycles || 1).primary.period) + cycles.primary.phase
    ) * cycles.primary.amplitude;
    
    const secondaryInfluence = Math.sin(
        (2 * Math.PI * daysSinceEpoch / (cycles || 1).secondary.period) + cycles.secondary.phase
    ) * cycles.secondary.amplitude;
    
    const tertiaryInfluence = Math.sin(
        (2 * Math.PI * daysSinceEpoch / (cycles || 1).tertiary.period) + cycles.tertiary.phase
    ) * cycles.tertiary.amplitude;
    
    // Combine influences and normalize to a value between 0.1 and 1
    const rawValue = 0.5 + primaryInfluence + secondaryInfluence + tertiaryInfluence;
    
    // Ensure value is within range 0.1 to 1
    return Math.max(0.1, Math.min(1, rawValue));
} 