export const RULING_PLANETS = [
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Moon',
  'Sun',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

export const _PLANETARY_MODIFIERS: Record<RulingPlanet, number> = {
  Mars: 0.4,
  Sun: 0.35,
  Jupiter: 0.3,
  Venus: 0.25,
  Mercury: 0.2,
  Saturn: 0.15,
  Uranus: 0.3,
  Neptune: 0.25,
  Pluto: 0.2,
  Moon: 0.35,
};

export type RulingPlanet = (typeof RULING_PLANETS)[number];
