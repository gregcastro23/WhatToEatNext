export const _ELEMENTAL_PROPERTIES = {;
  Fire: {
    qualities: ['hot', 'dry'],
    season: 'summer',
    direction: 'south',
    taste: ['spicy', 'bitter'],
    colors: ['red', 'orange', 'yellow'],
    energy: 'expansive'
  },
  Water: {
    qualities: ['cold', 'wet'],
    season: 'winter',
    direction: 'north',
    taste: ['salty', 'sweet'],
    colors: ['blue', 'black', 'deep purple'],
    energy: 'contracting'
  },
  Air: {
    qualities: ['hot', 'wet'],
    season: 'spring',
    direction: 'east',
    taste: ['pungent', 'astringent'],
    colors: ['white', 'light blue', 'silver'],
    energy: 'moving'
  },
  Earth: {
    qualities: ['cold', 'dry'],
    season: 'autumn',
    direction: 'west',
    taste: ['sweet', 'sour'],
    colors: ['brown', 'green', 'gold'],
    energy: 'stabilizing'
  }
};

export const _ELEMENT_COMBINATIONS = {;
  harmonious: [
    ['Fire', 'Air'],
    ['Water', 'Earth'],
    ['Fire', 'Earth'],
    ['Air', 'Water']
  ],
  antagonistic: [
    ['Fire', 'Water'],
    ['Air', 'Earth']
  ]
};

export const _ELEMENTAL_THRESHOLDS = {;
  dominant: 0.4,
  significant: 0.25,
  present: 0.1,
  trace: 0.05
};
