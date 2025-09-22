// Basic astrology data for the ElementalCalculator
export const zodiacSigns = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
];

export const elements = {
  aries: 'Fire',
  leo: 'Fire',
  sagittarius: 'Fire',
  taurus: 'Earth',
  virgo: 'Earth',
  capricorn: 'Earth',
  gemini: 'Air',
  libra: 'Air',
  aquarius: 'Air',
  cancer: 'Water',
  scorpio: 'Water',
  pisces: 'Water'
};

export const planetaryRulers = {
  aries: 'Mars',
  taurus: 'Venus',
  gemini: 'Mercury',
  cancer: 'Moon',
  leo: 'Sun',
  virgo: 'Mercury',
  libra: 'Venus',
  scorpio: 'Pluto',
  sagittarius: 'Jupiter',
  capricorn: 'Saturn',
  aquarius: 'Uranus',
  pisces: 'Neptune'
};

// Export planetInfo data structure needed by the calculations
export const planetInfo = {
  Sun: {
    'Dignity Effect': { leo: 1, aries: 2, aquarius: -1, libra: -2 },
    Elements: ['Fire', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire'
  },
  Moon: {
    'Dignity Effect': { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Mercury: {
    'Dignity Effect': { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  Venus: {
    'Dignity Effect': { libra: 1, taurus: 1, pisces: 2, aries: -1, scorpio: -1, virgo: -2 },
    Elements: ['Water', 'Earth'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Earth'
  },
  Mars: {
    'Dignity Effect': { aries: 1, scorpio: 1, capricorn: 2, taurus: -1, libra: -1, cancer: -2 },
    Elements: ['Fire', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Water'
  },
  Jupiter: {
    'Dignity Effect': {
      pisces: 1,
      sagittarius: 1,
      cancer: 2,
      gemini: -1,
      virgo: -1,
      capricorn: -2
    },
    Elements: ['Air', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Fire'
  },
  Saturn: {
    'Dignity Effect': { aquarius: 1, capricorn: 1, libra: 2, cancer: -1, leo: -1, aries: -2 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  Uranus: {
    'Dignity Effect': { aquarius: 1, scorpio: 2, taurus: -3 },
    Elements: ['Water', 'Air'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Air'
  },
  Neptune: {
    'Dignity Effect': { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Pluto: {
    'Dignity Effect': { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 },
    Elements: ['Earth', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Water'
  },
  Ascendant: {
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Earth'
  }
};

// Export signInfo data structure needed by the calculations
export const signInfo = {
  aries: {
    Element: 'Fire',
    Start: { Day: 21, Month: 3, Year: 2022 },
    End: { Day: 19, Month: 4, Year: 2022 },
    'Major Tarot Card': 'The Emperor',
    'Minor Tarot Cards': {
      '1st Decan': '2 of Wands',
      '2nd Decan': '3 of Wands',
      '3rd Decan': '4 of Wands'
    },
    'Decan Effects': { '1st Decan': ['Mars'], '2nd Decan': ['Sun'], '3rd Decan': ['Venus'] },
    'Degree Effects': {
      Mercury: [1521],
      Venus: [714],
      Mars: [2226],
      Jupiter: [16],
      Saturn: [2730]
    },
    Ruler: 'Mars',
    Modality: 'Cardinal'
  },
  taurus: {
    Element: 'Earth',
    Start: { Day: 20, Month: 4, Year: 2022 },
    End: { Day: 20, Month: 5, Year: 2022 },
    'Major Tarot Card': 'The Heirophant',
    'Minor Tarot Cards': {
      '1st Decan': '5 of Pentacles',
      '2nd Decan': '6 of Pentacles',
      '3rd Decan': '7 of Pentacles'
    },
    'Decan Effects': { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    'Degree Effects': {
      Mercury: [915],
      Venus: [18],
      Mars: [2730],
      Jupiter: [1622],
      Saturn: [2326]
    },
    Ruler: 'Venus',
    Modality: 'Fixed'
  },
  gemini: {
    Element: 'Air',
    Start: { Day: 21, Month: 5, Year: 2022 },
    End: { Day: 20, Month: 6, Year: 2022 },
    'Major Tarot Card': 'The Lovers',
    'Minor Tarot Cards': {
      '1st Decan': '8 of Swords',
      '2nd Decan': '9 of Swords',
      '3rd Decan': '10 of Swords'
    },
    'Decan Effects': {
      '1st Decan': ['Jupiter'],
      '2nd Decan': ['Mars'],
      '3rd Decan': ['Uranus', 'Sun']
    },
    'Degree Effects': {
      Mercury: [17],
      Venus: [1520],
      Mars: [2630],
      Jupiter: [814],
      Saturn: [2225]
    },
    Ruler: 'Mercury',
    Modality: 'Mutable'
  },
  cancer: {
    Element: 'Water',
    Start: { Day: 21, Month: 6, Year: 2022 },
    End: { Day: 22, Month: 7, Year: 2022 },
    'Major Tarot Card': 'The Chariot',
    'Minor Tarot Cards': {
      '1st Decan': '2 of Cups',
      '2nd Decan': '3 of Cups',
      '3rd Decan': '4 of Cups'
    },
    'Decan Effects': {
      '1st Decan': ['Venus'],
      '2nd Decan': ['Mercury', 'Pluto'],
      '3rd Decan': ['Neptune', 'Moon']
    },
    'Degree Effects': {
      Mercury: [1420],
      Venus: [2127],
      Mars: [16],
      Jupiter: [713],
      Saturn: [2830]
    },
    Ruler: 'Moon',
    Modality: 'Cardinal'
  },
  leo: {
    Element: 'Fire',
    Start: { Day: 23, Month: 7, Year: 2022 },
    End: { Day: 22, Month: 8, Year: 2022 },
    'Major Tarot Card': 'Strength',
    'Minor Tarot Cards': {
      '1st Decan': '5 of Wands',
      '2nd Decan': '6 of Wands',
      '3rd Decan': '7 of Wands'
    },
    'Decan Effects': { '1st Decan': ['Saturn'], '2nd Decan': ['Jupiter'], '3rd Decan': ['Mars'] },
    'Degree Effects': {
      Mercury: [713],
      Venus: [1419],
      Mars: [2630],
      Jupiter: [2025],
      Saturn: [16]
    },
    Ruler: 'Sun',
    Modality: 'Fixed'
  },
  virgo: {
    Element: 'Earth',
    Start: { Day: 23, Month: 8, Year: 2022 },
    End: { Day: 22, Month: 9, Year: 2022 },
    'Major Tarot Card': 'The Hermit',
    'Minor Tarot Cards': {
      '1st Decan': '8 of Pentacles',
      '2nd Decan': '9 of Pentacles',
      '3rd Decan': '10 of Pentacles'
    },
    'Decan Effects': {
      '1st Decan': ['Mars', 'Sun'],
      '2nd Decan': ['Venus'],
      '3rd Decan': ['Mercury']
    },
    'Degree Effects': {
      Mercury: [17],
      Venus: [813],
      Mars: [2530],
      Jupiter: [1418],
      Saturn: [1924]
    },
    Ruler: 'Mercury',
    Modality: 'Mutable'
  },
  libra: {
    Element: 'Air',
    Start: { Day: 23, Month: 9, Year: 2022 },
    End: { Day: 22, Month: 10, Year: 2022 },
    'Major Tarot Card': 'Justice',
    'Minor Tarot Cards': {
      '1st Decan': '2 of Swords',
      '2nd Decan': '3 of Swords',
      '3rd Decan': '4 of Swords'
    },
    'Decan Effects': {
      '1st Decan': ['Moon'],
      '2nd Decan': ['Saturn', 'Uranus'],
      '3rd Decan': ['Jupiter']
    },
    'Degree Effects': {
      Mercury: [2024],
      Venus: [711],
      Mars: [],
      Jupiter: [1219],
      Saturn: [16]
    },
    Ruler: 'Venus',
    Modality: 'Cardinal'
  },
  scorpio: {
    Element: 'Water',
    Start: { Day: 23, Month: 10, Year: 2022 },
    End: { Day: 21, Month: 11, Year: 2022 },
    'Major Tarot Card': 'Death',
    'Minor Tarot Cards': {
      '1st Decan': '5 of Cups',
      '2nd Decan': '6 of Cups',
      '3rd Decan': '7 of Cups'
    },
    'Decan Effects': {
      '1st Decan': ['Pluto'],
      '2nd Decan': ['Neptune', 'Sun'],
      '3rd Decan': ['Venus']
    },
    'Degree Effects': {
      Mercury: [2227],
      Venus: [1521],
      Mars: [16],
      Jupiter: [714],
      Saturn: [2830]
    },
    Ruler: 'Mars',
    Modality: 'Fixed'
  },
  sagittarius: {
    Element: 'Fire',
    Start: { Day: 22, Month: 11, Year: 2022 },
    End: { Day: 21, Month: 12, Year: 2022 },
    'Major Tarot Card': 'Temperance',
    'Minor Tarot Cards': {
      '1st Decan': '8 of Wands',
      '2nd Decan': '9 of Wands',
      '3rd Decan': '10 of Wands'
    },
    'Decan Effects': { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    'Degree Effects': {
      Mercury: [1520],
      Venus: [914],
      Mars: [],
      Jupiter: [18],
      Saturn: [2125]
    },
    Ruler: 'Jupiter',
    Modality: 'Mutable'
  },
  capricorn: {
    Element: 'Earth',
    Start: { Day: 22, Month: 12, Year: 2022 },
    End: { Day: 19, Month: 1, Year: 2023 },
    'Major Tarot Card': 'The Devil',
    'Minor Tarot Cards': {
      '1st Decan': '2 of Pentacles',
      '2nd Decan': '3 of Pentacles',
      '3rd Decan': '4 of Pentacles'
    },
    'Decan Effects': { '1st Decan': ['Jupiter'], '2nd Decan': [], '3rd Decan': ['Sun'] },
    'Degree Effects': {
      Mercury: [712],
      Venus: [16],
      Mars: [],
      Jupiter: [1319],
      Saturn: [2630]
    },
    Ruler: 'Saturn',
    Modality: 'Cardinal'
  },
  aquarius: {
    Element: 'Air',
    Start: { Day: 20, Month: 1, Year: 2023 },
    End: { Day: 18, Month: 2, Year: 2023 },
    'Major Tarot Card': 'The Star',
    'Minor Tarot Cards': {
      '1st Decan': '5 of Swords',
      '2nd Decan': '6 of Swords',
      '3rd Decan': '7 of Swords'
    },
    'Decan Effects': { '1st Decan': ['Uranus'], '2nd Decan': ['Mercury'], '3rd Decan': ['Moon'] },
    'Degree Effects': {
      Mercury: [],
      Venus: [1320],
      Mars: [2630],
      Jupiter: [2125],
      Saturn: [16]
    },
    Ruler: 'Saturn',
    Modality: 'Fixed'
  },
  pisces: {
    Element: 'Water',
    Start: { Day: 19, Month: 2, Year: 2023 },
    End: { Day: 20, Month: 3, Year: 2023 },
    'Major Tarot Card': 'The Moon',
    'Minor Tarot Cards': {
      '1st Decan': '8 of Cups',
      '2nd Decan': '9 of Cups',
      '3rd Decan': '10 of Cups'
    },
    'Decan Effects': {
      '1st Decan': ['Saturn', 'Neptune', 'Venus'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Pisces', 'Mars']
    },
    'Degree Effects': {
      Mercury: [1520],
      Venus: [18],
      Mars: [2126],
      Jupiter: [914],
      Saturn: [2730]
    },
    Ruler: 'Jupiter',
    Modality: 'Mutable'
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
