export const RULING_PLANETS = [
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'moon',
    'sun',
    'uranus',
    'neptune',
    'pluto'
] as const;

export const PLANETARY_MODIFIERS: Record<RulingPlanet, number> = {
    mars: 0.4,
    sun: 0.35,
    jupiter: 0.3,
    venus: 0.25,
    mercury: 0.2,
    saturn: 0.15,
    uranus: 0.3,
    neptune: 0.25,
    pluto: 0.2,
    moon: 0.35
};

export type RulingPlanet = typeof RULING_PLANETS[number]; 