/**
 * Tarot Decan Alchemy Map — Authoritative Source
 *
 * Maps each of the 36 zodiacal decans (10° segments) to:
 *   - Zodiac sign & decan number (1-3)
 *   - Decan ruling planet (Chaldean order / modern rulership)
 *   - Associated Minor Arcana tarot card
 *   - Element (Fire/Water/Earth/Air)
 *   - Primary ESMS token (Spirit/Essence/Matter/Substance)
 *   - Computed ESMS quantities
 *
 * ESMS Derivation:
 *   70%  suit-base × (cardNumber / 10)
 * + 30%  decan-ruler planet's authoritative ESMS from PLANETARY_ALCHEMY
 *
 * This ensures per-decan alchemical quantities are mathematically derived
 * from the project's existing authoritative constants, never hardcoded.
 *
 * @module data/tarot/decanAlchemyMap
 */

import { PLANETARY_ALCHEMY } from "@/utils/planetaryAlchemyMapping";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type TarotSuit = "Wands" | "Cups" | "Swords" | "Pentacles";
export type ESMSToken = "Spirit" | "Essence" | "Matter" | "Substance";
export type DecanElement = "Fire" | "Water" | "Earth" | "Air";

export interface ESMSValues {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export interface DecanAlchemyEntry {
  /** Degree range key, e.g. "0-10" */
  degreeRange: string;
  /** Zodiac sign (lowercase) */
  sign: string;
  /** Decan number within the sign (1, 2, or 3) */
  decan: 1 | 2 | 3;
  /** Start degree in absolute zodiac (0-360) */
  startDegree: number;
  /** End degree in absolute zodiac (0-360) */
  endDegree: number;
  /** Planetary ruler of this decan */
  ruler: string;
  /** Minor Arcana card name */
  tarotCard: string;
  /** Suit of the card */
  suit: TarotSuit;
  /** Card number (2-10 for pip cards) */
  cardNumber: number;
  /** Element derived from suit */
  element: DecanElement;
  /** Primary ESMS token from suit */
  primaryToken: ESMSToken;
  /** Computed ESMS quantities */
  esms: ESMSValues;
}

// ─────────────────────────────────────────────
// Suit Constants
// ─────────────────────────────────────────────

/** Suit → Element mapping */
export const SUIT_TO_ELEMENT: Record<TarotSuit, DecanElement> = {
  Wands: "Fire",
  Cups: "Water",
  Swords: "Air",
  Pentacles: "Earth",
};

/** Suit → Primary ESMS token mapping */
export const SUIT_TO_TOKEN: Record<TarotSuit, ESMSToken> = {
  Wands: "Spirit",
  Cups: "Essence",
  Swords: "Substance",
  Pentacles: "Matter",
};

/**
 * Suit → Base ESMS vector (unit vector with 1.0 in the primary token slot)
 *
 * Wands    → Spirit   = 1
 * Cups     → Essence  = 1
 * Swords   → Substance= 1
 * Pentacles→ Matter   = 1
 */
const SUIT_ESMS: Record<TarotSuit, ESMSValues> = {
  Wands:     { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
  Cups:      { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
  Swords:    { Spirit: 0, Essence: 0, Matter: 0, Substance: 1 },
  Pentacles: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 },
};

// ─────────────────────────────────────────────
// ESMS Derivation
// ─────────────────────────────────────────────

/**
 * Compute the ESMS quantities for a decan's tarot card.
 *
 * Formula:
 *   result[token] = suitBase[token] × (cardNumber / 10) × 0.7
 *                 + rulerESMS[token] × 0.3
 *
 * @param suit       - The card's suit (Wands, Cups, Swords, Pentacles)
 * @param cardNumber - The pip number (2-10)
 * @param ruler      - The planetary ruler of the decan (Sun, Moon, Mars, etc.)
 * @returns Computed ESMS values
 */
export function computeDecanESMS(
  suit: TarotSuit,
  cardNumber: number,
  ruler: string,
): ESMSValues {
  const suitBase = SUIT_ESMS[suit];
  const numberWeight = cardNumber / 10;

  // Get ruler's ESMS from the authoritative PLANETARY_ALCHEMY constant
  const rulerKey = ruler as keyof typeof PLANETARY_ALCHEMY;
  const rulerESMS = PLANETARY_ALCHEMY[rulerKey] ?? { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

  return {
    Spirit:    round(suitBase.Spirit    * numberWeight * 0.7 + rulerESMS.Spirit    * 0.3),
    Essence:   round(suitBase.Essence   * numberWeight * 0.7 + rulerESMS.Essence   * 0.3),
    Matter:    round(suitBase.Matter    * numberWeight * 0.7 + rulerESMS.Matter    * 0.3),
    Substance: round(suitBase.Substance * numberWeight * 0.7 + rulerESMS.Substance * 0.3),
  };
}

/** Round to 3 decimal places to avoid floating-point noise */
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ─────────────────────────────────────────────
// Decan Entry Factory
// ─────────────────────────────────────────────

function decan(
  startDegree: number,
  sign: string,
  decanNum: 1 | 2 | 3,
  ruler: string,
  cardNumber: number,
  suit: TarotSuit,
): DecanAlchemyEntry {
  const endDegree = startDegree + 10;
  const suitWord = suit;
  const tarotCard = `${cardNumber} of ${suitWord}`;

  return {
    degreeRange: `${startDegree}-${endDegree}`,
    sign,
    decan: decanNum,
    startDegree,
    endDegree,
    ruler,
    tarotCard,
    suit,
    cardNumber,
    element: SUIT_TO_ELEMENT[suit],
    primaryToken: SUIT_TO_TOKEN[suit],
    esms: computeDecanESMS(suit, cardNumber, ruler),
  };
}

// ─────────────────────────────────────────────
// The 36 Decans — Authoritative Map
// ─────────────────────────────────────────────
//
// Decan assignments follow the Golden Dawn / Chaldean system:
//   - Suit rotation: Wands (Fire signs) → Cups (Water signs) →
//     Swords (Air signs) → Pentacles (Earth signs)
//   - Card numbers: 2-10 cycle through three signs per element
//   - Rulers from _DECAN_RULERS in constants/tarotCards.ts

export const DECAN_ALCHEMY_MAP: Record<string, DecanAlchemyEntry> = {
  // ═══ ARIES (0°–30°) — Fire / Wands ═══
  "0-10":   decan(0,   "aries",   1, "Mars",    2, "Wands"),
  "10-20":  decan(10,  "aries",   2, "Sun",     3, "Wands"),
  "20-30":  decan(20,  "aries",   3, "Jupiter", 4, "Wands"),

  // ═══ TAURUS (30°–60°) — Earth / Pentacles ═══
  "30-40":  decan(30,  "taurus",  1, "Venus",   5, "Pentacles"),
  "40-50":  decan(40,  "taurus",  2, "Mercury", 6, "Pentacles"),
  "50-60":  decan(50,  "taurus",  3, "Saturn",  7, "Pentacles"),

  // ═══ GEMINI (60°–90°) — Air / Swords ═══
  "60-70":  decan(60,  "gemini",  1, "Mercury", 8, "Swords"),
  "70-80":  decan(70,  "gemini",  2, "Venus",   9, "Swords"),
  "80-90":  decan(80,  "gemini",  3, "Uranus",  10, "Swords"),

  // ═══ CANCER (90°–120°) — Water / Cups ═══
  "90-100":  decan(90,  "cancer",  1, "Moon",    2, "Cups"),
  "100-110": decan(100, "cancer",  2, "Pluto",   3, "Cups"),
  "110-120": decan(110, "cancer",  3, "Neptune", 4, "Cups"),

  // ═══ LEO (120°–150°) — Fire / Wands ═══
  "120-130": decan(120, "leo",     1, "Sun",     5, "Wands"),
  "130-140": decan(130, "leo",     2, "Jupiter", 6, "Wands"),
  "140-150": decan(140, "leo",     3, "Mars",    7, "Wands"),

  // ═══ VIRGO (150°–180°) — Earth / Pentacles ═══
  "150-160": decan(150, "virgo",   1, "Mercury", 8, "Pentacles"),
  "160-170": decan(160, "virgo",   2, "Saturn",  9, "Pentacles"),
  "170-180": decan(170, "virgo",   3, "Venus",   10, "Pentacles"),

  // ═══ LIBRA (180°–210°) — Air / Swords ═══
  "180-190": decan(180, "libra",   1, "Venus",   2, "Swords"),
  "190-200": decan(190, "libra",   2, "Uranus",  3, "Swords"),
  "200-210": decan(200, "libra",   3, "Mercury", 4, "Swords"),

  // ═══ SCORPIO (210°–240°) — Water / Cups ═══
  "210-220": decan(210, "scorpio", 1, "Pluto",   5, "Cups"),
  "220-230": decan(220, "scorpio", 2, "Neptune", 6, "Cups"),
  "230-240": decan(230, "scorpio", 3, "Moon",    7, "Cups"),

  // ═══ SAGITTARIUS (240°–270°) — Fire / Wands ═══
  "240-250": decan(240, "sagittarius", 1, "Jupiter", 8, "Wands"),
  "250-260": decan(250, "sagittarius", 2, "Mars",    9, "Wands"),
  "260-270": decan(260, "sagittarius", 3, "Sun",     10, "Wands"),

  // ═══ CAPRICORN (270°–300°) — Earth / Pentacles ═══
  "270-280": decan(270, "capricorn", 1, "Saturn",  2, "Pentacles"),
  "280-290": decan(280, "capricorn", 2, "Venus",   3, "Pentacles"),
  "290-300": decan(290, "capricorn", 3, "Mercury", 4, "Pentacles"),

  // ═══ AQUARIUS (300°–330°) — Air / Swords ═══
  "300-310": decan(300, "aquarius", 1, "Uranus",  5, "Swords"),
  "310-320": decan(310, "aquarius", 2, "Mercury", 6, "Swords"),
  "320-330": decan(320, "aquarius", 3, "Venus",   7, "Swords"),

  // ═══ PISCES (330°–360°) — Water / Cups ═══
  "330-340": decan(330, "pisces",  1, "Neptune", 8, "Cups"),
  "340-350": decan(340, "pisces",  2, "Moon",    9, "Cups"),
  "350-360": decan(350, "pisces",  3, "Pluto",   10, "Cups"),
};

// ─────────────────────────────────────────────
// Lookup Helpers
// ─────────────────────────────────────────────

/**
 * Look up a decan's alchemy entry by absolute zodiacal degree (0-359).
 *
 * @param degree - Ecliptic longitude (0 = 0° Aries, 90 = 0° Cancer, etc.)
 * @returns The decan entry, or undefined if degree is out of range
 */
export function getDecanAlchemy(degree: number): DecanAlchemyEntry | undefined {
  // Normalise to [0, 360)
  const norm = ((degree % 360) + 360) % 360;
  const decanStart = Math.floor(norm / 10) * 10;
  const key = `${decanStart}-${decanStart + 10}`;
  return DECAN_ALCHEMY_MAP[key];
}

/**
 * Approximate the current decan from a calendar date.
 *
 * Uses the standard tropical zodiac: 0° Aries ≈ March 20.
 * Accuracy is ±1 day; for precise work use the Swiss Ephemeris sun longitude.
 *
 * @param date - The date to evaluate
 * @returns The decan entry for the approximate solar position
 */
export function getDecanAlchemyForDate(date: Date): DecanAlchemyEntry | undefined {
  // Day of year (0-based)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // March 20 ≈ day 79 (non-leap) or 80 (leap)
  const isLeap = (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || date.getFullYear() % 400 === 0;
  const vernalEquinoxDay = isLeap ? 80 : 79;

  // Days since vernal equinox
  let daysSinceEquinox = dayOfYear - vernalEquinoxDay;
  if (daysSinceEquinox < 0) daysSinceEquinox += isLeap ? 366 : 365;

  // Approximate degree (360° / 365.25 ≈ 0.9856° per day)
  const approxDegree = (daysSinceEquinox * 360) / (isLeap ? 366 : 365);

  return getDecanAlchemy(approxDegree);
}

/**
 * Look up a decan entry by zodiac sign and decan number.
 *
 * @param sign  - Zodiac sign (case-insensitive, e.g. "aries", "Aries")
 * @param decan - Decan number (1, 2, or 3)
 * @returns The matching entry, or undefined if not found
 */
export function getDecanAlchemyForSign(
  sign: string,
  decanNum: 1 | 2 | 3,
): DecanAlchemyEntry | undefined {
  const normalised = sign.toLowerCase();
  return Object.values(DECAN_ALCHEMY_MAP).find(
    (entry) => entry.sign === normalised && entry.decan === decanNum,
  );
}

/**
 * Get all decan entries for a zodiac sign (all three decans).
 *
 * @param sign - Zodiac sign (case-insensitive)
 * @returns Array of 3 entries ordered by decan number, or empty if sign not found
 */
export function getDecansForSign(sign: string): DecanAlchemyEntry[] {
  const normalised = sign.toLowerCase();
  return Object.values(DECAN_ALCHEMY_MAP)
    .filter((entry) => entry.sign === normalised)
    .sort((a, b) => a.decan - b.decan);
}

/**
 * Get the ESMS quantities for the current decan based on today's date.
 *
 * Convenience function for components that just need the alchemical numbers.
 *
 * @returns ESMS values for today's approximate solar decan
 */
export function getCurrentDecanESMS(): ESMSValues {
  const entry = getDecanAlchemyForDate(new Date());
  return entry?.esms ?? { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 };
}
