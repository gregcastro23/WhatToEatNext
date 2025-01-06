export const config = {
  api: {
    celestialUpdateInterval: 5 * 60 * 1000, // 5 minutes
    cacheTimeout: 3600000, // 1 hour in milliseconds
  },
  scoring: {
    weights: {
      seasonal: 2,
      elemental: 1.5,
      timeOfDay: 1,
      celestial: 1.25,
      traditional: 1,
    },
  },
  elements: {
    Fire: { opposite: 'Water', complement: 'Air' },
    Water: { opposite: 'Fire', complement: 'Earth' },
    Air: { opposite: 'Earth', complement: 'Fire' },
    Earth: { opposite: 'Air', complement: 'Water' },
  },
} as const; 