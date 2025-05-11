// Basic astrology data for the ElementalCalculator
export const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const elements = {
  'Aries': 'Fire',
  'Leo': 'Fire',
  'Sagittarius': 'Fire',
  'Taurus': 'Earth',
  'Virgo': 'Earth',
  'Capricorn': 'Earth',
  'Gemini': 'Air',
  'Libra': 'Air',
  'Aquarius': 'Air',
  'Cancer': 'Water',
  'Scorpio': 'Water',
  'Pisces': 'Water'
};

export const planetaryRulers = {
  'Aries': 'Mars',
  'Taurus': 'Venus',
  'Gemini': 'Mercury',
  'Cancer': 'Moon',
  'Leo': 'Sun',
  'Virgo': 'Mercury',
  'Libra': 'Venus',
  'Scorpio': 'Pluto',
  'Sagittarius': 'Jupiter',
  'Capricorn': 'Saturn',
  'Aquarius': 'Uranus',
  'Pisces': 'Neptune'
};

// Export planetInfo data structure needed by the calculations
export const planetInfo = {
  'Sun': {
    'Dignity Effect': {'Leo': 1, 'Aries': 2, 'Aquarius': -1, 'Libra': -2},
    'Elements': ['Fire', 'Fire'],
    'Alchemy': {'Spirit': 1, 'Essence': 0, 'Matter': 0, 'Substance': 0},
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire'
  },
  'Moon': {
    'Dignity Effect': {'Cancer': 1, 'Taurus': 2, 'Capricorn': -1, 'Scorpio': -2},
    'Elements': ['Water', 'Water'],
    'Alchemy': {'Spirit': 0, 'Essence': 1, 'Matter': 1, 'Substance': 0},
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  'Mercury': {
    'Dignity Effect': {'Gemini': 1, 'Virgo': 3, 'Sagittarius': 1, 'Pisces': -3},
    'Elements': ['Air', 'Earth'],
    'Alchemy': {'Spirit': 1, 'Essence': 0, 'Matter': 0, 'Substance': 1},
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  'Venus': {
    'Dignity Effect': {'Libra': 1, 'Taurus': 1, 'Pisces': 2, 'Aries': -1, 'Scorpio': -1, 'Virgo': -2},
    'Elements': ['Water', 'Earth'],
    'Alchemy': {'Spirit': 0, 'Essence': 1, 'Matter': 1, 'Substance': 0},
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Earth'
  },
  'Mars': {
    'Dignity Effect': {'Aries': 1, 'Scorpio': 1, 'Capricorn': 2, 'Taurus': -1, 'Libra': -1, 'Cancer': -2},
    'Elements': ['Fire', 'Water'],
    'Alchemy': {'Spirit': 0, 'Essence': 1, 'Matter': 1, 'Substance': 0},
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Water'
  },
  'Jupiter': {
    'Dignity Effect': {'Pisces': 1, 'Sagittarius': 1, 'Cancer': 2, 'Gemini': -1, 'Virgo': -1, 'Capricorn': -2},
    'Elements': ['Air', 'Fire'],
    'Alchemy': {'Spirit': 1, 'Essence': 1, 'Matter': 0, 'Substance': 0},
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Fire'
  },
  'Saturn': {
    'Dignity Effect': {'Aquarius': 1, 'Capricorn': 1, 'Libra': 2, 'Cancer': -1, 'Leo': -1, 'Aries': -2},
    'Elements': ['Air', 'Earth'],
    'Alchemy': {'Spirit': 1, 'Essence': 0, 'Matter': 1, 'Substance': 0},
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  'Uranus': {
    'Dignity Effect': {'Aquarius': 1, 'Scorpio': 2, 'Taurus': -3},
    'Elements': ['Water', 'Air'],
    'Alchemy': {'Spirit': 0, 'Essence': 1, 'Matter': 1, 'Substance': 0},
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Air'
  },
  'Neptune': {
    'Dignity Effect': {'Pisces': 1, 'Cancer': 2, 'Virgo': -1, 'Capricorn': -2},
    'Elements': ['Water', 'Water'],
    'Alchemy': {'Spirit': 0, 'Essence': 1, 'Matter': 0, 'Substance': 1},
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  'Pluto': {
    'Dignity Effect': {'Scorpio': 1, 'Leo': 2, 'Taurus': -1, 'Aquarius': -2},
    'Elements': ['Earth', 'Water'],
    'Alchemy': {'Spirit': 0, 'Essence': 1, 'Matter': 1, 'Substance': 0},
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Water'
  },
  'Ascendant': {
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Earth'
  }
};

// Export signInfo data structure needed by the calculations
export const signInfo = {
  "Aries": {
    "Element": "Fire",
    "Start": {"Day": 21, "Month": 3, "Year": 2022},
    "End": {"Day": 19, "Month": 4, "Year": 2022},
    "Major Tarot Card": "The Emperor",
    "Minor Tarot Cards": {"1st Decan": "2 of Wands", "2nd Decan": "3 of Wands", "3rd Decan": "4 of Wands"},
    "Decan Effects": {"1st Decan": ["Mars"], "2nd Decan": ["Sun"], "3rd Decan": ["Venus"]},
    "Degree Effects": {"Mercury": [15, 21], "Venus": [7, 14], "Mars": [22, 26], "Jupiter": [1, 6], "Saturn": [27, 30]},
    "Ruler": "Mars",
    "Modality": "Cardinal"
  },
  "Taurus": {
    "Element": "Earth",
    "Start": {"Day": 20, "Month": 4, "Year": 2022},
    "End": {"Day": 20, "Month": 5, "Year": 2022},
    "Major Tarot Card": "The Heirophant",
    "Minor Tarot Cards": {"1st Decan": "5 of Pentacles", "2nd Decan": "6 of Pentacles", "3rd Decan": "7 of Pentacles"},
    "Decan Effects": {"1st Decan": ["Mercury"], "2nd Decan": ["Moon"], "3rd Decan": ["Saturn"]},
    "Degree Effects": {"Mercury": [9, 15], "Venus": [1, 8], "Mars": [27, 30], "Jupiter": [16, 22], "Saturn": [23, 26]},
    "Ruler": "Venus",
    "Modality": "Fixed"
  },
  "Gemini": {
    "Element": "Air",
    "Start": {"Day": 21, "Month": 5, "Year": 2022},
    "End": {"Day": 20, "Month": 6, "Year": 2022},
    "Major Tarot Card": "The Lovers",
    "Minor Tarot Cards": {"1st Decan": "8 of Swords", "2nd Decan": "9 of Swords", "3rd Decan": "10 of Swords"},
    "Decan Effects": {"1st Decan": ["Jupiter"], "2nd Decan": ["Mars"], "3rd Decan": ["Uranus", "Sun"]},
    "Degree Effects": {"Mercury": [1, 7], "Venus": [15, 20], "Mars": [26, 30], "Jupiter": [8, 14], "Saturn": [22, 25]},
    "Ruler": "Mercury",
    "Modality": "Mutable"
  },
  "Cancer": {
    "Element": "Water",
    "Start": {"Day": 21, "Month": 6, "Year": 2022},
    "End": {"Day": 22, "Month": 7, "Year": 2022},
    "Major Tarot Card": "The Chariot",
    "Minor Tarot Cards": {"1st Decan": "2 of Cups", "2nd Decan": "3 of Cups", "3rd Decan": "4 of Cups"},
    "Decan Effects": {"1st Decan": ["Venus"], "2nd Decan": ["Mercury", "Pluto"], "3rd Decan": ["Neptune", "Moon"]},
    "Degree Effects": {"Mercury": [14, 20], "Venus": [21, 27], "Mars": [1, 6], "Jupiter": [7, 13], "Saturn": [28, 30]},
    "Ruler": "Moon",
    "Modality": "Cardinal"
  },
  "Leo": {
    "Element": "Fire",
    "Start": {"Day": 23, "Month": 7, "Year": 2022},
    "End": {"Day": 22, "Month": 8, "Year": 2022},
    "Major Tarot Card": "Strength",
    "Minor Tarot Cards": {"1st Decan": "5 of Wands", "2nd Decan": "6 of Wands", "3rd Decan": "7 of Wands"},
    "Decan Effects": {"1st Decan": ["Saturn"], "2nd Decan": ["Jupiter"], "3rd Decan": ["Mars"]},
    "Degree Effects": {"Mercury": [7, 13], "Venus": [14, 19], "Mars": [26, 30], "Jupiter": [20, 25], "Saturn": [1, 6]},
    "Ruler": "Sun",
    "Modality": "Fixed"
  },
  "Virgo": {
    "Element": "Earth",
    "Start": {"Day": 23, "Month": 8, "Year": 2022},
    "End": {"Day": 22, "Month": 9, "Year": 2022},
    "Major Tarot Card": "The Hermit",
    "Minor Tarot Cards": {"1st Decan": "8 of Pentacles", "2nd Decan": "9 of Pentacles", "3rd Decan": "10 of Pentacles"},
    "Decan Effects": {"1st Decan": ["Mars", "Sun"], "2nd Decan": ["Venus"], "3rd Decan": ["Mercury"]},
    "Degree Effects": {"Mercury": [1, 7], "Venus": [8, 13], "Mars": [25, 30], "Jupiter": [14, 18], "Saturn": [19, 24]},
    "Ruler": "Mercury",
    "Modality": "Mutable"
  },
  "Libra": {
    "Element": "Air",
    "Start": {"Day": 23, "Month": 9, "Year": 2022},
    "End": {"Day": 22, "Month": 10, "Year": 2022},
    "Major Tarot Card": "Justice",
    "Minor Tarot Cards": {"1st Decan": "2 of Swords", "2nd Decan": "3 of Swords", "3rd Decan": "4 of Swords"},
    "Decan Effects": {"1st Decan": ["Moon"], "2nd Decan": ["Saturn", "Uranus"], "3rd Decan": ["Jupiter"]},
    "Degree Effects": {"Mercury": [20, 24], "Venus": [7, 11], "Mars": [], "Jupiter": [12, 19], "Saturn": [1, 6]},
    "Ruler": "Venus",
    "Modality": "Cardinal"
  },
  "Scorpio": {
    "Element": "Water",
    "Start": {"Day": 23, "Month": 10, "Year": 2022},
    "End": {"Day": 21, "Month": 11, "Year": 2022},
    "Major Tarot Card": "Death",
    "Minor Tarot Cards": {"1st Decan": "5 of Cups", "2nd Decan": "6 of Cups", "3rd Decan": "7 of Cups"},
    "Decan Effects": {"1st Decan": ["Pluto"], "2nd Decan": ["Neptune", "Sun"], "3rd Decan": ["Venus"]},
    "Degree Effects": {"Mercury": [22, 27], "Venus": [15, 21], "Mars": [1, 6], "Jupiter": [7, 14], "Saturn": [28, 30]},
    "Ruler": "Mars",
    "Modality": "Fixed"
  },
  "Sagittarius": {
    "Element": "Fire",
    "Start": {"Day": 22, "Month": 11, "Year": 2022},
    "End": {"Day": 21, "Month": 12, "Year": 2022},
    "Major Tarot Card": "Temperance",
    "Minor Tarot Cards": {"1st Decan": "8 of Wands", "2nd Decan": "9 of Wands", "3rd Decan": "10 of Wands"},
    "Decan Effects": {"1st Decan": ["Mercury"], "2nd Decan": ["Moon"], "3rd Decan": ["Saturn"]},
    "Degree Effects": {"Mercury": [15, 20], "Venus": [9, 14], "Mars": [], "Jupiter": [1, 8], "Saturn": [21, 25]},
    "Ruler": "Jupiter",
    "Modality": "Mutable"
  },
  "Capricorn": {
    "Element": "Earth",
    "Start": {"Day": 22, "Month": 12, "Year": 2022},
    "End": {"Day": 19, "Month": 1, "Year": 2023},
    "Major Tarot Card": "The Devil",
    "Minor Tarot Cards": {"1st Decan": "2 of Pentacles", "2nd Decan": "3 of Pentacles", "3rd Decan": "4 of Pentacles"},
    "Decan Effects": {"1st Decan": ["Jupiter"], "2nd Decan": [], "3rd Decan": ["Sun"]},
    "Degree Effects": {"Mercury": [7, 12], "Venus": [1, 6], "Mars": [], "Jupiter": [13, 19], "Saturn": [26, 30]},
    "Ruler": "Saturn",
    "Modality": "Cardinal"
  },
  "Aquarius": {
    "Element": "Air",
    "Start": {"Day": 20, "Month": 1, "Year": 2023},
    "End": {"Day": 18, "Month": 2, "Year": 2023},
    "Major Tarot Card": "The Star",
    "Minor Tarot Cards": {"1st Decan": "5 of Swords", "2nd Decan": "6 of Swords", "3rd Decan": "7 of Swords"},
    "Decan Effects": {"1st Decan": ["Uranus"], "2nd Decan": ["Mercury"], "3rd Decan": ["Moon"]},
    "Degree Effects": {"Mercury": [], "Venus": [13, 20], "Mars": [26, 30], "Jupiter": [21, 25], "Saturn": [1, 6]},
    "Ruler": "Saturn",
    "Modality": "Fixed"
  },
  "Pisces": {
    "Element": "Water",
    "Start": {"Day": 19, "Month": 2, "Year": 2023},
    "End": {"Day": 20, "Month": 3, "Year": 2023},
    "Major Tarot Card": "The Moon",
    "Minor Tarot Cards": {"1st Decan": "8 of Cups", "2nd Decan": "9 of Cups", "3rd Decan": "10 of Cups"},
    "Decan Effects": {"1st Decan": ["Saturn", "Neptune", "Venus"], "2nd Decan": ["Jupiter"], "3rd Decan": ["Pisces", "Mars"]},
    "Degree Effects": {"Mercury": [15, 20], "Venus": [1, 8], "Mars": [21, 26], "Jupiter": [9, 14], "Saturn": [27, 30]},
    "Ruler": "Jupiter",
    "Modality": "Mutable"
  }
};

// NOTE: signInfo is truncated for brevity - please add the remaining signs as needed

export default {
  zodiacSigns,
  elements,
  planetaryRulers,
  planetInfo,
  signInfo
};