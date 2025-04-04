// Astrological signs data
export const signs = {
  0: 'aries',
  1: 'taurus',
  2: 'gemini',
  3: 'cancer',
  4: 'leo',
  5: 'virgo',
  6: 'Libra',
  7: 'Scorpio',
  8: 'sagittarius',
  9: 'capricorn',
  10: 'aquarius',
  11: 'pisces'
};

// Planetary information including dignity effects and elemental associations
export const planetInfo = {
  'Sun': {
    'Dignity Effect': {
      'leo': 1,
      'aries': 2,
      'aquarius': -1,
      'Libra': -2
    },
    'Elements': ['Fire', 'Fire'],
    'Alchemy': {
      'Spirit': 1,
      'Essence': 0,
      'Matter': 0,
      'Substance': 0
    },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire'
  },
  'Moon': {
    'Dignity Effect': {
      'cancer': 1,
      'taurus': 2,
      'capricorn': -1,
      'Scorpio': -2
    },
    'Elements': ['Water', 'Water'],
    'Alchemy': {
      'Spirit': 0,
      'Essence': 1,
      'Matter': 1,
      'Substance': 0
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  'Mercury': {
    'Dignity Effect': {
      'gemini': 1, 
      'virgo': 3,
      'sagittarius': 1, 
      'pisces': -3
    },
    'Elements': ['Air', 'Earth'],
    'Alchemy': {
      'Spirit': 1,
      'Essence': 0,
      'Matter': 0,
      'Substance': 1
    },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  'Venus': {
    'Dignity Effect': {
      'Libra': 1, 
      'taurus': 1,
      'pisces': 2, 
      'aries': -1,
      'Scorpio': -1,
      'virgo': -2
    },
    'Elements': ['Water', 'Earth'],
    'Alchemy': {
      'Spirit': 0,
      'Essence': 1,
      'Matter': 1,
      'Substance': 0
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Earth'
  },
  'Mars': {
    'Dignity Effect': {
      'aries': 1,
      'Scorpio': 1, 
      'capricorn': 2,
      'taurus': -1,
      'Libra': -1,
      'cancer': -2
    },
    'Elements': ['Fire', 'Water'],
    'Alchemy': {
      'Spirit': 0,
      'Essence': 1,
      'Matter': 1,
      'Substance': 0
    },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Water'
  },
  'Jupiter': {
    'Dignity Effect': {
      'pisces': 1,
      'sagittarius': 1,
      'cancer': 2,
      'gemini': -1,
      'virgo': -1,
      'capricorn': -2
    },
    'Elements': ['Air', 'Fire'],
    'Alchemy': {
      'Spirit': 1,
      'Essence': 1,
      'Matter': 0,
      'Substance': 0
    },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Fire'
  },
  'Saturn': {
    'Dignity Effect': {
      'aquarius': 1,
      'capricorn': 1,
      'Libra': 2,
      'cancer': -1,
      'leo': -1,
      'aries': -2
    },
    'Elements': ['Air', 'Earth'],
    'Alchemy': {
      'Spirit': 1,
      'Essence': 0,
      'Matter': 1,
      'Substance': 0
    },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  'Uranus': {
    'Dignity Effect': {
      'aquarius': 1,
      'Scorpio': 2,
      'taurus': -3
    },
    'Elements': ['Water', 'Air'],
    'Alchemy': {
      'Spirit': 0,
      'Essence': 1,
      'Matter': 1,
      'Substance': 0
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Air'
  },
  'Neptune': {
    'Dignity Effect': {
      'pisces': 1,
      'cancer': 2,
      'virgo': -1,
      'capricorn': -2
    },
    'Elements': ['Water', 'Water'],
    'Alchemy': {
      'Spirit': 0,
      'Essence': 1,
      'Matter': 0,
      'Substance': 1
    },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  'Pluto': {
    'Dignity Effect': {
      'Scorpio': 1,
      'leo': 2,
      'taurus': -1,
      'aquarius': -2
    },
    'Elements': ['Earth', 'Water'],
    'Alchemy': {
      'Spirit': 0,
      'Essence': 1,
      'Matter': 1,
      'Substance': 0
    },
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Water'
  },
  'Ascendant': {
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Earth'
  }
};

// Optional: For convenience, also export sign information
export const signInfo = {
  "aries": {
    "Element": "Fire",
    'Start': {'Day': 21, 'Month': 3, 'Year': 2022},
    'End': {'Day': 19, 'Month': 4, 'Year': 2022},
    "Major Tarot Card": "The Emperor",
    "Minor Tarot Cards": {
      "1st Decan": "2 of Wands",
      "2nd Decan": "3 of Wands",
      "3rd Decan": "4 of Wands"
    },
    "Decan Effects": {
      "1st Decan": ["Mars"],
      "2nd Decan": ["Sun"],
      "3rd Decan": ["Venus"]
    },
    "Degree Effects": {
      "Mercury": [15, 21],
      "Venus": [7, 14],
      "Mars": [22, 26],
      "Jupiter": [1, 6],
      "Saturn": [27, 30]
    },
    "Ruler": "Mars",
    "Modality": "Cardinal"
  },
  // Add other signs as needed for your application
};

export default { signs, planetInfo, signInfo }; 