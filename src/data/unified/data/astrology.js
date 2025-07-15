"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInfo = exports.planetInfo = exports.planetaryRulers = exports.elements = exports.zodiacSigns = void 0;
// Basic astrology data for the ElementalCalculator
exports.zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];
exports.elements = { 'aries': 'Fire',
    'leo': 'Fire',
    'sagittarius': 'Fire',
    'taurus': 'Earth',
    'virgo': 'Earth',
    'capricorn': 'Earth',
    'gemini': 'Air',
    'libra': 'Air',
    'aquarius': 'Air',
    'cancer': 'Water',
    'scorpio': 'Water',
    'pisces': 'Water'
};
exports.planetaryRulers = { 'aries': 'Mars',
    'taurus': 'Venus',
    'gemini': 'Mercury',
    'cancer': 'Moon',
    'leo': 'Sun',
    'virgo': 'Mercury',
    'libra': 'Venus',
    'scorpio': 'Pluto',
    'sagittarius': 'Jupiter',
    'capricorn': 'Saturn',
    'aquarius': 'Uranus',
    'pisces': 'Neptune'
};

// Export planetInfo data structure needed by the calculations
exports.planetInfo = {
    'Sun': {
        'Elements': ['Fire', 'Fire'],
        'Alchemy': { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
        'Diurnal Element': 'Fire',
        'Nocturnal Element': 'Fire'
    },
    'Moon': {
        'Elements': ['Water', 'Water'],
        'Alchemy': { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
        'Diurnal Element': 'Water',
        'Nocturnal Element': 'Water'
    },
    'Mercury': {
        'Elements': ['Air', 'Earth'],
        'Alchemy': { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
        'Diurnal Element': 'Air',
        'Nocturnal Element': 'Earth'
    },
    'Venus': {
        'Elements': ['Water', 'Earth'],
        'Alchemy': { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
        'Diurnal Element': 'Water',
        'Nocturnal Element': 'Earth'
    },
    'Mars': {
        'Elements': ['Fire', 'Water'],
        'Alchemy': { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
        'Diurnal Element': 'Fire',
        'Nocturnal Element': 'Water'
    },
    'Jupiter': {
        'Elements': ['Air', 'Fire'],
        'Alchemy': { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
        'Diurnal Element': 'Air',
        'Nocturnal Element': 'Fire'
    },
    'Saturn': {
        'Elements': ['Air', 'Earth'],
        'Alchemy': { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
        'Diurnal Element': 'Air',
        'Nocturnal Element': 'Earth'
    },
    'Uranus': {
        'Elements': ['Water', 'Air'],
        'Alchemy': { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
        'Diurnal Element': 'Water',
        'Nocturnal Element': 'Air'
    },
    'Neptune': {
        'Elements': ['Water', 'Water'],
        'Alchemy': { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
        'Diurnal Element': 'Water',
        'Nocturnal Element': 'Water'
    },
    'Pluto': {
        'Elements': ['Earth', 'Water'],
        'Alchemy': { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
        'Diurnal Element': 'Earth',
        'Nocturnal Element': 'Water'
    },
    'Ascendant': {
        'Diurnal Element': 'Earth',
        'Nocturnal Element': 'Earth'
    }
};
// Export signInfo data structure needed by the calculations
exports.signInfo = {
    "aries": {
        "Element": 'Fire',
        "Start": { month: 3, day: 21 },
        "End": { month: 4, day: 19 },
        "Major Tarot Card": "The Emperor",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Mars",
        "Modality": "Cardinal"
    },
    "taurus": {
        "Element": 'Earth',
        "Start": { month: 4, day: 20 },
        "End": { month: 5, day: 20 },
        "Major Tarot Card": "The Heirophant",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Venus",
        "Modality": "Fixed"
    },
    "gemini": {
        "Element": "Air",
        "Start": { month: 5, day: 21 },
        "End": { month: 6, day: 20 },
        "Major Tarot Card": "The Lovers",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Mercury",
        "Modality": "Mutable"
    },
    "cancer": {
        "Element": 'Water',
        "Start": { month: 6, day: 21 },
        "End": { month: 7, day: 22 },
        "Major Tarot Card": "The Chariot",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Moon",
        "Modality": "Cardinal"
    },
    "leo": {
        "Element": 'Fire',
        "Start": { month: 7, day: 23 },
        "End": { month: 8, day: 22 },
        "Major Tarot Card": "Strength",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Sun",
        "Modality": "Fixed"
    },
    "virgo": {
        "Element": 'Earth',
        "Start": { month: 8, day: 23 },
        "End": { month: 9, day: 22 },
        "Major Tarot Card": "The Hermit",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Mercury",
        "Modality": "Mutable"
    },
    "libra": {
        "Element": "Air",
        "Start": { month: 9, day: 23 },
        "End": { month: 10, day: 22 },
        "Major Tarot Card": "Justice",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Venus",
        "Modality": "Cardinal"
    },
    "scorpio": {
        "Element": 'Water',
        "Start": { month: 10, day: 23 },
        "End": { month: 11, day: 21 },
        "Major Tarot Card": "Death",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Mars",
        "Modality": "Fixed"
    },
    "sagittarius": {
        "Element": 'Fire',
        "Start": { month: 11, day: 22 },
        "End": { month: 12, day: 21 },
        "Major Tarot Card": "Temperance",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Jupiter",
        "Modality": "Mutable"
    },
    "capricorn": {
        "Element": 'Earth',
        "Start": { month: 12, day: 22 },
        "End": { month: 1, day: 19 },
        "Major Tarot Card": "The Devil",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Saturn",
        "Modality": "Cardinal"
    },
    "aquarius": {
        "Element": "Air",
        "Start": { month: 1, day: 20 },
        "End": { month: 2, day: 18 },
        "Major Tarot Card": "The Star",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Saturn",
        "Modality": "Fixed"
    },
    "pisces": {
        "Element": 'Water',
        "Start": { month: 2, day: 19 },
        "End": { month: 3, day: 20 },
        "Major Tarot Card": "The moon",
        "Minor Tarot Cards": {},
        "Decan Effects": {},
        "Degree Effects": {},
        "Ruler": "Jupiter",
        "Modality": "Mutable"
    }
};
// NOTE: signInfo is truncated for brevity - please add the remaining signs as needed,
exports.default = {
    zodiacSigns: exports.zodiacSigns,
    elements: exports.elements,
    planetaryRulers: exports.planetaryRulers,
    planetInfo: exports.planetInfo,
    signInfo: exports.signInfo
};
