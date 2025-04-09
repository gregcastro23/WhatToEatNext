import { planetInfo as planets } from './planets';

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

// Export the planetInfo from our new modular structure
export const planetInfo = planets;

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