import { planetInfo } from './astrology';

// Astrological signs data with consistent lowercase for all signs
export const signs = {
  0: 'aries',
  1: 'taurus',
  2: 'gemini',
  3: 'cancer',
  4: 'leo',
  5: 'virgo',
  6: 'libra',
  7: 'scorpio',
  8: 'sagittarius',
  9: 'capricorn',
  10: 'aquarius',
  11: 'pisces'
};

// Export the planetInfo directly from astrology.ts
export { planetInfo };

// Complete sign information for all zodiac signs
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
  "taurus": {
    "Element": "Earth",
    'Start': {'Day': 20, 'Month': 4, 'Year': 2022},
    'End': {'Day': 20, 'Month': 5, 'Year': 2022},
    "Major Tarot Card": "The Hierophant",
    "Minor Tarot Cards": {
      "1st Decan": "5 of Pentacles",
      "2nd Decan": "6 of Pentacles",
      "3rd Decan": "7 of Pentacles"
    },
    "Decan Effects": {
      "1st Decan": ["Mercury"],
      "2nd Decan": ["Moon"],
      "3rd Decan": ["Saturn"]
    },
    "Degree Effects": {
      "Mercury": [9, 15],
      "Venus": [1, 8],
      "Mars": [27, 30],
      "Jupiter": [16, 22],
      "Saturn": [23, 26]
    },
    "Ruler": "Venus",
    "Modality": "Fixed"
  },
  "gemini": {
    "Element": "Air",
    'Start': {'Day': 21, 'Month': 5, 'Year': 2022},
    'End': {'Day': 20, 'Month': 6, 'Year': 2022},
    "Major Tarot Card": "The Lovers",
    "Minor Tarot Cards": {
      "1st Decan": "8 of Swords",
      "2nd Decan": "9 of Swords",
      "3rd Decan": "10 of Swords"
    },
    "Decan Effects": {
      "1st Decan": ["Jupiter"],
      "2nd Decan": ["Mars"],
      "3rd Decan": ["Sun"]
    },
    "Degree Effects": {
      "Mercury": [1, 7],
      "Venus": [15, 20],
      "Mars": [26, 30],
      "Jupiter": [8, 14],
      "Saturn": [22, 25]
    },
    "Ruler": "Mercury",
    "Modality": "Mutable"
  },
  "cancer": {
    "Element": "Water",
    'Start': {'Day': 21, 'Month': 6, 'Year': 2022},
    'End': {'Day': 22, 'Month': 7, 'Year': 2022},
    "Major Tarot Card": "The Chariot",
    "Minor Tarot Cards": {
      "1st Decan": "2 of Cups",
      "2nd Decan": "3 of Cups",
      "3rd Decan": "4 of Cups"
    },
    "Decan Effects": {
      "1st Decan": ["Venus"],
      "2nd Decan": ["Mercury"],
      "3rd Decan": ["Moon"]
    },
    "Degree Effects": {
      "Mercury": [14, 20],
      "Venus": [21, 27],
      "Mars": [1, 6],
      "Jupiter": [7, 13],
      "Saturn": [28, 30]
    },
    "Ruler": "Moon",
    "Modality": "Cardinal"
  },
  "leo": {
    "Element": "Fire",
    'Start': {'Day': 23, 'Month': 7, 'Year': 2022},
    'End': {'Day': 22, 'Month': 8, 'Year': 2022},
    "Major Tarot Card": "Strength",
    "Minor Tarot Cards": {
      "1st Decan": "5 of Wands",
      "2nd Decan": "6 of Wands",
      "3rd Decan": "7 of Wands"
    },
    "Decan Effects": {
      "1st Decan": ["Saturn"],
      "2nd Decan": ["Jupiter"],
      "3rd Decan": ["Mars"]
    },
    "Degree Effects": {
      "Mercury": [7, 13],
      "Venus": [14, 19],
      "Mars": [26, 30],
      "Jupiter": [20, 25],
      "Saturn": [1, 6]
    },
    "Ruler": "Sun",
    "Modality": "Fixed"
  },
  "virgo": {
    "Element": "Earth",
    'Start': {'Day': 23, 'Month': 8, 'Year': 2022},
    'End': {'Day': 22, 'Month': 9, 'Year': 2022},
    "Major Tarot Card": "The Hermit",
    "Minor Tarot Cards": {
      "1st Decan": "8 of Pentacles",
      "2nd Decan": "9 of Pentacles",
      "3rd Decan": "10 of Pentacles"
    },
    "Decan Effects": {
      "1st Decan": ["Sun"],
      "2nd Decan": ["Venus"],
      "3rd Decan": ["Mercury"]
    },
    "Degree Effects": {
      "Mercury": [1, 7],
      "Venus": [8, 13],
      "Mars": [25, 30],
      "Jupiter": [14, 18],
      "Saturn": [19, 24]
    },
    "Ruler": "Mercury",
    "Modality": "Mutable"
  },
  "libra": {
    "Element": "Air",
    'Start': {'Day': 23, 'Month': 9, 'Year': 2022},
    'End': {'Day': 22, 'Month': 10, 'Year': 2022},
    "Major Tarot Card": "Justice",
    "Minor Tarot Cards": {
      "1st Decan": "2 of Swords",
      "2nd Decan": "3 of Swords",
      "3rd Decan": "4 of Swords"
    },
    "Decan Effects": {
      "1st Decan": ["Moon"],
      "2nd Decan": ["Saturn"],
      "3rd Decan": ["Jupiter"]
    },
    "Degree Effects": {
      "Mercury": [20, 24],
      "Venus": [7, 11],
      "Mars": [1, 6],
      "Jupiter": [12, 19],
      "Saturn": [1, 6]
    },
    "Ruler": "Venus",
    "Modality": "Cardinal"
  },
  "scorpio": {
    "Element": "Water",
    'Start': {'Day': 23, 'Month': 10, 'Year': 2022},
    'End': {'Day': 21, 'Month': 11, 'Year': 2022},
    "Major Tarot Card": "Death",
    "Minor Tarot Cards": {
      "1st Decan": "5 of Cups",
      "2nd Decan": "6 of Cups",
      "3rd Decan": "7 of Cups"
    },
    "Decan Effects": {
      "1st Decan": ["Mars"],
      "2nd Decan": ["Sun"],
      "3rd Decan": ["Venus"]
    },
    "Degree Effects": {
      "Mercury": [22, 27],
      "Venus": [15, 21],
      "Mars": [1, 6],
      "Jupiter": [7, 14],
      "Saturn": [28, 30]
    },
    "Ruler": "Mars",
    "Modality": "Fixed"
  },
  "sagittarius": {
    "Element": "Fire",
    'Start': {'Day': 22, 'Month': 11, 'Year': 2022},
    'End': {'Day': 21, 'Month': 12, 'Year': 2022},
    "Major Tarot Card": "Temperance",
    "Minor Tarot Cards": {
      "1st Decan": "8 of Wands",
      "2nd Decan": "9 of Wands",
      "3rd Decan": "10 of Wands"
    },
    "Decan Effects": {
      "1st Decan": ["Mercury"],
      "2nd Decan": ["Moon"],
      "3rd Decan": ["Saturn"]
    },
    "Degree Effects": {
      "Mercury": [15, 20],
      "Venus": [9, 14],
      "Mars": [1, 6],
      "Jupiter": [1, 8],
      "Saturn": [21, 25]
    },
    "Ruler": "Jupiter",
    "Modality": "Mutable"
  },
  "capricorn": {
    "Element": "Earth",
    'Start': {'Day': 22, 'Month': 12, 'Year': 2022},
    'End': {'Day': 19, 'Month': 1, 'Year': 2023},
    "Major Tarot Card": "The Devil",
    "Minor Tarot Cards": {
      "1st Decan": "2 of Pentacles",
      "2nd Decan": "3 of Pentacles",
      "3rd Decan": "4 of Pentacles"
    },
    "Decan Effects": {
      "1st Decan": ["Jupiter"],
      "2nd Decan": ["Mars"],
      "3rd Decan": ["Sun"]
    },
    "Degree Effects": {
      "Mercury": [7, 12],
      "Venus": [1, 6],
      "Mars": [13, 18],
      "Jupiter": [13, 19],
      "Saturn": [26, 30]
    },
    "Ruler": "Saturn",
    "Modality": "Cardinal"
  },
  "aquarius": {
    "Element": "Air",
    'Start': {'Day': 20, 'Month': 1, 'Year': 2023},
    'End': {'Day': 18, 'Month': 2, 'Year': 2023},
    "Major Tarot Card": "The Star",
    "Minor Tarot Cards": {
      "1st Decan": "5 of Swords",
      "2nd Decan": "6 of Swords",
      "3rd Decan": "7 of Swords"
    },
    "Decan Effects": {
      "1st Decan": ["Saturn"],
      "2nd Decan": ["Mercury"],
      "3rd Decan": ["Venus"]
    },
    "Degree Effects": {
      "Mercury": [7, 12],
      "Venus": [13, 20],
      "Mars": [26, 30],
      "Jupiter": [21, 25],
      "Saturn": [1, 6]
    },
    "Ruler": "Saturn",
    "Modality": "Fixed"
  },
  "pisces": {
    "Element": "Water",
    'Start': {'Day': 19, 'Month': 2, 'Year': 2023},
    'End': {'Day': 20, 'Month': 3, 'Year': 2023},
    "Major Tarot Card": "The Moon",
    "Minor Tarot Cards": {
      "1st Decan": "8 of Cups",
      "2nd Decan": "9 of Cups",
      "3rd Decan": "10 of Cups"
    },
    "Decan Effects": {
      "1st Decan": ["Saturn"],
      "2nd Decan": ["Jupiter"],
      "3rd Decan": ["Mars"]
    },
    "Degree Effects": {
      "Mercury": [15, 20],
      "Venus": [1, 8],
      "Mars": [21, 26],
      "Jupiter": [9, 14],
      "Saturn": [27, 30]
    },
    "Ruler": "Jupiter",
    "Modality": "Mutable"
  }
};

export default { signs, planetInfo, signInfo }; 