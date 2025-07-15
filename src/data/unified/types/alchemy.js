// Mapping between the two formats
export const LUNAR_PHASE_MAPPING = {
    'new moon': 'new_moon',
    'waxing crescent': 'waxing_crescent',
    'first quarter': 'first_quarter',
    'waxing gibbous': 'waxing_gibbous',
    'full moon': 'full_moon',
    'waning gibbous': 'waning_gibbous',
    'last quarter': 'last_quarter',
    'waning crescent': 'waning_crescent'
};
// Reverse mapping (can be useful in some contexts)
export const LUNAR_PHASE_REVERSE_MAPPING = {
    'new_moon': 'new moon',
    'waxing_crescent': 'waxing crescent',
    'first_quarter': 'first quarter',
    'waxing_gibbous': 'waxing gibbous',
    'full_moon': 'full moon',
    'waning_gibbous': 'waning gibbous',
    'last_quarter': 'last quarter',
    'waning_crescent': 'waning crescent'
};
// Define standard thermodynamic properties for cooking methods
export const COOKING_METHOD_THERMODYNAMICS = {
    baking: { heat: 0.7, entropy: 0.5, reactivity: 0.6, energy: 0.65 },
    boiling: { heat: 0.9, entropy: 0.8, reactivity: 0.7, energy: 0.8 },
    roasting: { heat: 0.8, entropy: 0.6, reactivity: 0.5, energy: 0.7 },
    steaming: { heat: 0.6, entropy: 0.4, reactivity: 0.3, energy: 0.5 },
    frying: { heat: 0.9, entropy: 0.7, reactivity: 0.9, energy: 0.85 },
    grilling: { heat: 0.8, entropy: 0.5, reactivity: 0.8, energy: 0.75 },
    sauteing: { heat: 0.7, entropy: 0.5, reactivity: 0.7, energy: 0.65 },
    simmering: { heat: 0.5, entropy: 0.6, reactivity: 0.5, energy: 0.55 },
    poaching: { heat: 0.4, entropy: 0.3, reactivity: 0.2, energy: 0.35 },
    braising: { heat: 0.6, entropy: 0.7, reactivity: 0.6, energy: 0.65 },
    stir_frying: { heat: 0.8, entropy: 0.6, reactivity: 0.8, energy: 0.75 },
    fermenting: { heat: 0.2, entropy: 0.8, reactivity: 0.9, energy: 0.6 },
    pickling: { heat: 0.3, entropy: 0.7, reactivity: 0.8, energy: 0.55 },
    curing: { heat: 0.2, entropy: 0.6, reactivity: 0.5, energy: 0.4 },
    infusing: { heat: 0.4, entropy: 0.5, reactivity: 0.7, energy: 0.5 },
    distilling: { heat: 0.8, entropy: 0.7, reactivity: 0.6, energy: 0.7 },
    raw: { heat: 0.0, entropy: 0.1, reactivity: 0.1, energy: 0.05 },
    smoking: { heat: 0.5, entropy: 0.6, reactivity: 0.7, energy: 0.6 },
    sous_vide: { heat: 0.5, entropy: 0.2, reactivity: 0.3, energy: 0.35 },
    pressure_cooking: { heat: 0.8, entropy: 0.7, reactivity: 0.8, energy: 0.75 },
    spherification: { heat: 0.1, entropy: 0.4, reactivity: 0.9, energy: 0.45 },
    cryo_cooking: { heat: 0.1, entropy: 0.4, reactivity: 0.6, energy: 0.35 },
    emulsification: { heat: 0.3, entropy: 0.6, reactivity: 0.8, energy: 0.55 },
    gelification: { heat: 0.2, entropy: 0.5, reactivity: 0.7, energy: 0.45 },
    broiling: { heat: 0.9, entropy: 0.5, reactivity: 0.7, energy: 0.7 }
};
// Define the planetary harmony matrix based on your Food Alchemy System
export const PLANETARY_HARMONY_MATRIX = {
    Sun: {
        Sun: 1.0, Moon: -0.5, Mercury: 0.3, Venus: 0.4, Mars: 0.6,
        Jupiter: 0.8, Saturn: -0.3, Uranus: 0.2, Neptune: 0.1, Pluto: 0.5
    },
    Moon: {
        Sun: -0.5, Moon: 1.0, Mercury: 0.4, Venus: 0.6, Mars: -0.4,
        Jupiter: 0.5, Saturn: -0.2, Uranus: -0.3, Neptune: 0.7, Pluto: 0.2
    },
    Mercury: {
        Sun: 0.3, Moon: 0.4, Mercury: 1.0, Venus: 0.7, Mars: 0.3,
        Jupiter: 0.4, Saturn: 0.5, Uranus: 0.6, Neptune: 0.3, Pluto: 0.4
    },
    Venus: {
        Sun: 0.4, Moon: 0.6, Mercury: 0.7, Venus: 1.0, Mars: -0.3,
        Jupiter: 0.6, Saturn: 0.2, Uranus: 0.1, Neptune: 0.5, Pluto: 0.0
    },
    Mars: {
        Sun: 0.6, Moon: -0.4, Mercury: 0.3, Venus: -0.3, Mars: 1.0,
        Jupiter: 0.4, Saturn: 0.3, Uranus: 0.5, Neptune: -0.2, Pluto: 0.7
    },
    Jupiter: {
        Sun: 0.8, Moon: 0.5, Mercury: 0.4, Venus: 0.6, Mars: 0.4,
        Jupiter: 1.0, Saturn: -0.2, Uranus: 0.3, Neptune: 0.4, Pluto: 0.2
    },
    Saturn: {
        Sun: -0.3, Moon: -0.2, Mercury: 0.5, Venus: 0.2, Mars: 0.3,
        Jupiter: -0.2, Saturn: 1.0, Uranus: 0.4, Neptune: 0.3, Pluto: 0.6
    }
};
// Elemental associations for planets
export const PLANET_ELEMENT_MAPPING = {
    Sun: 'Fire',
    Moon: 'Water',
    Mercury: 'Air',
    Venus: 'Earth',
    Mars: 'Fire',
    Jupiter: 'Air',
    Saturn: 'Earth',
    Uranus: 'Air',
    Neptune: 'Water',
    Pluto: 'Earth'
};
// Cooking method elemental associations
export const COOKING_METHOD_ELEMENTS = {
    'roasting': 'Fire',
    'grilling': 'Fire',
    'baking': 'Earth',
    'boiling': 'Water',
    'fermenting': 'Water',
    'pickling': 'Water',
    'curing': 'Air',
    'infusing': 'Water',
    'distilling': 'Fire',
    'steaming': 'Water',
    'frying': 'Fire',
    'raw': 'Air',
    'braising': 'Water',
    'fermentation': 'Water',
    'smoking': 'Air',
    'sous_vide': 'Water',
    'pressure_cooking': 'Water',
    'spherification': 'Water',
    'cryo_cooking': 'Air',
    'emulsification': 'Water',
    'gelification': 'Earth',
    'broiling': 'Fire',
    'stir-frying': 'Fire',
    'sauteing': 'Fire',
    'simmering': 'Water',
    'poaching': 'Water'
};
// Lunar phase effect multipliers
export const LUNAR_PHASE_MULTIPLIERS = {
    'new moon': { heat: 0.3, entropy: 0.8, reactivity: 0.5, energy: 0.5 },
    'waxing crescent': { heat: 0.4, entropy: 0.7, reactivity: 0.6, energy: 0.6 },
    'first quarter': { heat: 0.5, entropy: 0.6, reactivity: 0.7, energy: 0.6 },
    'waxing gibbous': { heat: 0.6, entropy: 0.5, reactivity: 0.8, energy: 0.6 },
    'full moon': { heat: 0.8, entropy: 0.4, reactivity: 0.9, energy: 0.7 },
    'waning gibbous': { heat: 0.7, entropy: 0.5, reactivity: 0.8, energy: 0.7 },
    'last quarter': { heat: 0.6, entropy: 0.6, reactivity: 0.7, energy: 0.6 },
    'waning crescent': { heat: 0.7, entropy: 0.6, reactivity: 0.6, energy: 0.6 }
};
