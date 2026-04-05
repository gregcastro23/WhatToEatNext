/**
 * Birth Chart Sign Estimator
 *
 * Estimates expected zodiac sign placements for all planets given a date,
 * using astronomical lookup tables. Provides validation for birth chart
 * calculations by comparing API results against known planetary positions.
 *
 * This serves as a sanity check — if the API returns Sun in Leo for a
 * January birthday, something is clearly wrong.
 */

import { getZodiacSignType } from "@/utils/zodiacUtils";
import * as Astronomy from "astronomy-engine";

// ─── Types ──────────────────────────────────────────────────

interface SignTransitEntry {
  sign: string;
  start: string; // ISO date "YYYY-MM-DD"
  end: string;   // ISO date "YYYY-MM-DD"
}

export interface SignEstimate {
  expectedSign: string | null;
  allowedSigns: string[];
  confidence: "high" | "medium" | "low" | "skip";
  source: string;
}

export interface PlanetValidationWarning {
  planet: string;
  expectedSigns: string[];
  actualSign: string;
  confidence: string;
  severity: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  hasWarnings: boolean;
  warnings: PlanetValidationWarning[];
  validatedPlanets: number;
  passedPlanets: number;
  skippedPlanets: number;
  isStaticFallback: boolean;
}

// ─── Constants ──────────────────────────────────────────────

const ZODIAC_ORDER: string[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

/**
 * The exact static fallback signature from astrologizeApi.ts lines 207-288.
 * If all positions match this, the API circuit breaker fired and returned
 * garbage positions unrelated to the actual birth date.
 */
const STATIC_FALLBACK_SIGNATURE: Record<string, string> = {
  Sun: "sagittarius",
  Moon: "cancer",
  Mercury: "sagittarius",
  Venus: "capricorn",
  Mars: "leo",
  Jupiter: "gemini",
  Saturn: "pisces",
  Uranus: "taurus",
  Neptune: "pisces",
  Pluto: "aquarius",
};

// ─── Planetary Sign Transit Lookup Tables ───────────────────
// Sources: Standard astronomical ephemeris data (final ingress dates).
// For retrograde ingress periods, tables include overlapping date ranges.

/** Jupiter sign transits 1940–2030 (~1 year per sign) */
const JUPITER_SIGN_TRANSITS: SignTransitEntry[] = [
  { sign: "aries", start: "1940-05-16", end: "1941-05-26" },
  { sign: "taurus", start: "1941-05-26", end: "1942-06-10" },
  { sign: "gemini", start: "1942-06-10", end: "1943-06-30" },
  { sign: "cancer", start: "1943-06-30", end: "1944-07-26" },
  { sign: "leo", start: "1944-07-26", end: "1945-08-25" },
  { sign: "virgo", start: "1945-08-25", end: "1946-09-25" },
  { sign: "libra", start: "1946-09-25", end: "1947-10-24" },
  { sign: "scorpio", start: "1947-10-24", end: "1948-11-15" },
  { sign: "sagittarius", start: "1948-11-15", end: "1949-04-12" },
  { sign: "capricorn", start: "1949-04-12", end: "1950-04-15" },
  { sign: "aquarius", start: "1950-04-15", end: "1951-04-21" },
  { sign: "pisces", start: "1951-04-21", end: "1952-04-28" },
  { sign: "aries", start: "1952-04-28", end: "1953-05-09" },
  { sign: "taurus", start: "1953-05-09", end: "1954-05-24" },
  { sign: "gemini", start: "1954-05-24", end: "1955-06-13" },
  { sign: "cancer", start: "1955-06-13", end: "1956-11-17" },
  { sign: "leo", start: "1956-11-17", end: "1957-02-19" },
  { sign: "virgo", start: "1957-08-07", end: "1958-01-13" },
  { sign: "libra", start: "1958-01-13", end: "1958-03-20" },
  { sign: "virgo", start: "1958-03-20", end: "1958-09-07" },
  { sign: "libra", start: "1958-09-07", end: "1959-02-10" },
  { sign: "scorpio", start: "1959-02-10", end: "1960-03-01" },
  { sign: "sagittarius", start: "1960-03-01", end: "1961-01-14" },
  { sign: "capricorn", start: "1961-01-14", end: "1962-01-26" },
  { sign: "aquarius", start: "1962-01-26", end: "1962-03-25" },
  { sign: "pisces", start: "1962-03-25", end: "1963-04-04" },
  { sign: "aries", start: "1963-04-04", end: "1964-04-12" },
  { sign: "taurus", start: "1964-04-12", end: "1965-04-22" },
  { sign: "gemini", start: "1965-04-22", end: "1966-09-21" },
  { sign: "cancer", start: "1966-09-21", end: "1967-01-16" },
  { sign: "leo", start: "1967-01-16", end: "1967-05-23" },
  { sign: "cancer", start: "1967-05-23", end: "1967-10-19" },
  { sign: "leo", start: "1967-10-19", end: "1968-02-27" },
  { sign: "virgo", start: "1968-02-27", end: "1968-06-15" },
  { sign: "leo", start: "1968-06-15", end: "1968-11-15" },
  { sign: "virgo", start: "1968-11-15", end: "1969-03-30" },
  { sign: "libra", start: "1969-03-30", end: "1970-07-15" },
  { sign: "scorpio", start: "1970-07-15", end: "1971-01-14" },
  { sign: "sagittarius", start: "1971-01-14", end: "1971-06-05" },
  { sign: "scorpio", start: "1971-06-05", end: "1971-09-11" },
  { sign: "sagittarius", start: "1971-09-11", end: "1972-02-06" },
  { sign: "capricorn", start: "1972-02-06", end: "1972-07-24" },
  { sign: "sagittarius", start: "1972-07-24", end: "1972-09-25" },
  { sign: "capricorn", start: "1972-09-25", end: "1973-02-23" },
  { sign: "aquarius", start: "1973-02-23", end: "1974-03-08" },
  { sign: "pisces", start: "1974-03-08", end: "1975-03-18" },
  { sign: "aries", start: "1975-03-18", end: "1976-03-26" },
  { sign: "taurus", start: "1976-03-26", end: "1976-08-23" },
  { sign: "gemini", start: "1976-08-23", end: "1976-10-16" },
  { sign: "taurus", start: "1976-10-16", end: "1977-04-03" },
  { sign: "gemini", start: "1977-04-03", end: "1977-08-20" },
  { sign: "cancer", start: "1977-08-20", end: "1977-12-31" },
  { sign: "gemini", start: "1977-12-31", end: "1978-04-12" },
  { sign: "cancer", start: "1978-04-12", end: "1978-09-05" },
  { sign: "leo", start: "1978-09-05", end: "1979-02-28" },
  { sign: "cancer", start: "1979-02-28", end: "1979-04-20" },
  { sign: "leo", start: "1979-04-20", end: "1979-09-29" },
  { sign: "virgo", start: "1979-09-29", end: "1980-10-27" },
  { sign: "libra", start: "1980-10-27", end: "1981-11-27" },
  { sign: "scorpio", start: "1981-11-27", end: "1982-12-26" },
  { sign: "sagittarius", start: "1982-12-26", end: "1984-01-19" },
  { sign: "capricorn", start: "1984-01-19", end: "1985-02-06" },
  { sign: "aquarius", start: "1985-02-06", end: "1986-02-20" },
  { sign: "pisces", start: "1986-02-20", end: "1987-03-02" },
  { sign: "aries", start: "1987-03-02", end: "1988-03-08" },
  { sign: "taurus", start: "1988-03-08", end: "1988-07-22" },
  { sign: "gemini", start: "1988-07-22", end: "1988-11-30" },
  { sign: "taurus", start: "1988-11-30", end: "1989-03-11" },
  { sign: "gemini", start: "1989-03-11", end: "1989-07-31" },
  { sign: "cancer", start: "1989-07-31", end: "1990-08-18" },
  { sign: "leo", start: "1990-08-18", end: "1991-09-12" },
  { sign: "virgo", start: "1991-09-12", end: "1992-10-10" },
  { sign: "libra", start: "1992-10-10", end: "1993-11-10" },
  { sign: "scorpio", start: "1993-11-10", end: "1994-12-09" },
  { sign: "sagittarius", start: "1994-12-09", end: "1996-01-03" },
  { sign: "capricorn", start: "1996-01-03", end: "1997-01-21" },
  { sign: "aquarius", start: "1997-01-21", end: "1998-02-04" },
  { sign: "pisces", start: "1998-02-04", end: "1999-02-13" },
  { sign: "aries", start: "1999-02-13", end: "1999-06-28" },
  { sign: "taurus", start: "1999-06-28", end: "1999-10-23" },
  { sign: "aries", start: "1999-10-23", end: "2000-02-14" },
  { sign: "taurus", start: "2000-02-14", end: "2000-06-30" },
  { sign: "gemini", start: "2000-06-30", end: "2001-07-13" },
  { sign: "cancer", start: "2001-07-13", end: "2002-08-01" },
  { sign: "leo", start: "2002-08-01", end: "2003-08-27" },
  { sign: "virgo", start: "2003-08-27", end: "2004-09-25" },
  { sign: "libra", start: "2004-09-25", end: "2005-10-26" },
  { sign: "scorpio", start: "2005-10-26", end: "2006-11-24" },
  { sign: "sagittarius", start: "2006-11-24", end: "2007-12-18" },
  { sign: "capricorn", start: "2007-12-18", end: "2009-01-05" },
  { sign: "aquarius", start: "2009-01-05", end: "2010-01-18" },
  { sign: "pisces", start: "2010-01-18", end: "2010-06-06" },
  { sign: "aries", start: "2010-06-06", end: "2010-09-09" },
  { sign: "pisces", start: "2010-09-09", end: "2011-01-22" },
  { sign: "aries", start: "2011-01-22", end: "2011-06-04" },
  { sign: "taurus", start: "2011-06-04", end: "2012-06-11" },
  { sign: "gemini", start: "2012-06-11", end: "2013-06-26" },
  { sign: "cancer", start: "2013-06-26", end: "2014-07-16" },
  { sign: "leo", start: "2014-07-16", end: "2015-08-11" },
  { sign: "virgo", start: "2015-08-11", end: "2016-09-09" },
  { sign: "libra", start: "2016-09-09", end: "2017-10-10" },
  { sign: "scorpio", start: "2017-10-10", end: "2018-11-08" },
  { sign: "sagittarius", start: "2018-11-08", end: "2019-12-02" },
  { sign: "capricorn", start: "2019-12-02", end: "2020-12-19" },
  { sign: "aquarius", start: "2020-12-19", end: "2021-05-13" },
  { sign: "pisces", start: "2021-05-13", end: "2021-07-28" },
  { sign: "aquarius", start: "2021-07-28", end: "2021-12-29" },
  { sign: "pisces", start: "2021-12-29", end: "2022-05-10" },
  { sign: "aries", start: "2022-05-10", end: "2022-10-28" },
  { sign: "pisces", start: "2022-10-28", end: "2022-12-20" },
  { sign: "aries", start: "2022-12-20", end: "2023-05-16" },
  { sign: "taurus", start: "2023-05-16", end: "2024-05-26" },
  { sign: "gemini", start: "2024-05-26", end: "2025-06-09" },
  { sign: "cancer", start: "2025-06-09", end: "2026-06-30" },
  { sign: "leo", start: "2026-06-30", end: "2027-07-26" },
  { sign: "virgo", start: "2027-07-26", end: "2028-08-24" },
  { sign: "libra", start: "2028-08-24", end: "2029-09-24" },
  { sign: "scorpio", start: "2029-09-24", end: "2030-10-22" },
];

/** Saturn sign transits 1940–2030 (~2.5 years per sign) */
const SATURN_SIGN_TRANSITS: SignTransitEntry[] = [
  { sign: "taurus", start: "1939-07-06", end: "1942-05-08" },
  { sign: "gemini", start: "1942-05-08", end: "1944-06-20" },
  { sign: "cancer", start: "1944-06-20", end: "1946-08-02" },
  { sign: "leo", start: "1946-08-02", end: "1948-09-19" },
  { sign: "virgo", start: "1948-09-19", end: "1950-11-20" },
  { sign: "libra", start: "1950-11-20", end: "1953-10-22" },
  { sign: "scorpio", start: "1953-10-22", end: "1956-01-12" },
  { sign: "sagittarius", start: "1956-01-12", end: "1959-01-05" },
  { sign: "capricorn", start: "1959-01-05", end: "1962-01-03" },
  { sign: "aquarius", start: "1962-01-03", end: "1964-03-24" },
  { sign: "pisces", start: "1964-03-24", end: "1967-03-03" },
  { sign: "aries", start: "1967-03-03", end: "1969-04-29" },
  { sign: "taurus", start: "1969-04-29", end: "1971-06-18" },
  { sign: "gemini", start: "1971-06-18", end: "1973-08-01" },
  { sign: "cancer", start: "1973-08-01", end: "1975-09-17" },
  { sign: "leo", start: "1975-09-17", end: "1977-11-17" },
  { sign: "virgo", start: "1977-11-17", end: "1980-09-21" },
  { sign: "libra", start: "1980-09-21", end: "1982-11-29" },
  { sign: "scorpio", start: "1982-11-29", end: "1985-11-17" },
  { sign: "sagittarius", start: "1985-11-17", end: "1988-02-13" },
  { sign: "capricorn", start: "1988-02-13", end: "1991-02-06" },
  { sign: "aquarius", start: "1991-02-06", end: "1993-05-21" },
  { sign: "pisces", start: "1993-05-21", end: "1996-04-07" },
  { sign: "aries", start: "1996-04-07", end: "1998-06-09" },
  { sign: "taurus", start: "1998-06-09", end: "2000-08-10" },
  { sign: "gemini", start: "2000-08-10", end: "2003-06-04" },
  { sign: "cancer", start: "2003-06-04", end: "2005-07-16" },
  { sign: "leo", start: "2005-07-16", end: "2007-09-02" },
  { sign: "virgo", start: "2007-09-02", end: "2009-10-29" },
  { sign: "libra", start: "2009-10-29", end: "2012-10-05" },
  { sign: "scorpio", start: "2012-10-05", end: "2014-12-23" },
  { sign: "sagittarius", start: "2014-12-23", end: "2017-12-20" },
  { sign: "capricorn", start: "2017-12-20", end: "2020-03-22" },
  { sign: "aquarius", start: "2020-03-22", end: "2020-07-01" },
  { sign: "capricorn", start: "2020-07-01", end: "2020-12-17" },
  { sign: "aquarius", start: "2020-12-17", end: "2023-03-07" },
  { sign: "pisces", start: "2023-03-07", end: "2025-05-25" },
  { sign: "aries", start: "2025-05-25", end: "2025-09-01" },
  { sign: "pisces", start: "2025-09-01", end: "2026-02-14" },
  { sign: "aries", start: "2026-02-14", end: "2028-04-13" },
  { sign: "taurus", start: "2028-04-13", end: "2030-06-01" },
];

/** Uranus sign transits 1935–2033 (~7 years per sign) */
const URANUS_SIGN_TRANSITS: SignTransitEntry[] = [
  { sign: "taurus", start: "1935-06-06", end: "1942-05-15" },
  { sign: "gemini", start: "1942-05-15", end: "1948-08-30" },
  { sign: "cancer", start: "1948-08-30", end: "1955-08-24" },
  { sign: "leo", start: "1955-08-24", end: "1962-01-10" },
  { sign: "virgo", start: "1962-01-10", end: "1968-09-28" },
  { sign: "libra", start: "1968-09-28", end: "1975-11-21" },
  { sign: "scorpio", start: "1975-11-21", end: "1981-11-16" },
  { sign: "sagittarius", start: "1981-11-16", end: "1988-02-15" },
  { sign: "capricorn", start: "1988-02-15", end: "1995-04-01" },
  { sign: "aquarius", start: "1995-04-01", end: "2003-03-10" },
  { sign: "pisces", start: "2003-03-10", end: "2010-05-28" },
  { sign: "aries", start: "2010-05-28", end: "2018-05-15" },
  { sign: "taurus", start: "2018-05-15", end: "2025-07-07" },
  { sign: "gemini", start: "2025-07-07", end: "2033-01-01" },
];

/** Neptune sign transits 1928–2052 (~14 years per sign) */
const NEPTUNE_SIGN_TRANSITS: SignTransitEntry[] = [
  { sign: "virgo", start: "1928-09-21", end: "1942-10-03" },
  { sign: "libra", start: "1942-10-03", end: "1955-12-24" },
  { sign: "scorpio", start: "1955-12-24", end: "1970-01-04" },
  { sign: "sagittarius", start: "1970-01-04", end: "1984-01-19" },
  { sign: "capricorn", start: "1984-01-19", end: "1998-01-29" },
  { sign: "aquarius", start: "1998-01-29", end: "2012-02-03" },
  { sign: "pisces", start: "2012-02-03", end: "2025-03-30" },
  { sign: "aries", start: "2025-03-30", end: "2039-05-21" },
  { sign: "taurus", start: "2039-05-21", end: "2052-10-22" },
];

/** Pluto sign transits 1914–2066 (~12-31 years per sign) */
const PLUTO_SIGN_TRANSITS: SignTransitEntry[] = [
  { sign: "cancer", start: "1914-07-09", end: "1937-10-07" },
  { sign: "leo", start: "1937-10-07", end: "1956-10-20" },
  { sign: "virgo", start: "1956-10-20", end: "1971-10-05" },
  { sign: "libra", start: "1971-10-05", end: "1983-11-05" },
  { sign: "scorpio", start: "1983-11-05", end: "1995-01-17" },
  { sign: "sagittarius", start: "1995-01-17", end: "2008-01-25" },
  { sign: "capricorn", start: "2008-01-25", end: "2024-01-21" },
  { sign: "aquarius", start: "2024-01-21", end: "2044-03-09" },
  // Pluto retrograded back to Capricorn in 2023-2024; overlap handled by cusp tolerance
  { sign: "pisces", start: "2044-03-09", end: "2066-08-31" },
];

// ─── Helper Functions ───────────────────────────────────────

/**
 * Get the index of a zodiac sign in the wheel (0-11).
 */
function signIndex(sign: string): number {
  const idx = ZODIAC_ORDER.indexOf(sign.toLowerCase());
  return idx >= 0 ? idx : 0;
}

/**
 * Check if a sign is within N positions of a center sign on the zodiac wheel.
 * Accounts for circular wraparound (Pisces is adjacent to Aries).
 */
function isSignWithinRange(sign: string, centerSign: string, range: number): boolean {
  const a = signIndex(sign);
  const b = signIndex(centerSign);
  const distance = Math.min(
    Math.abs(a - b),
    12 - Math.abs(a - b),
  );
  return distance <= range;
}

/**
 * Get adjacent signs within a range.
 */
function getSignsInRange(centerSign: string, range: number): string[] {
  const center = signIndex(centerSign);
  const signs: string[] = [];
  for (let i = -range; i <= range; i++) {
    signs.push(ZODIAC_ORDER[((center + i) % 12 + 12) % 12]);
  }
  return [...new Set(signs)];
}

/**
 * Parse an ISO date string "YYYY-MM-DD" to a Date at midnight UTC.
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

/**
 * Calculate days between two dates.
 */
function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000);
}

/**
 * Look up the expected sign for a date from a sign transit table.
 * Returns all matching signs (can be multiple for retrograde overlaps)
 * plus adjacent signs within cusp tolerance.
 */
function lookupSignForDate(
  date: Date,
  table: SignTransitEntry[],
  cuspToleranceDays: number,
): { signs: string[]; primarySign: string | null } {
  const matchingSigns: string[] = [];
  const cuspSigns: Set<string> = new Set();

  for (const entry of table) {
    const start = parseDate(entry.start);
    const end = parseDate(entry.end);

    // Direct match: date is within this transit period
    if (date >= start && date <= end) {
      matchingSigns.push(entry.sign);
    }

    // Cusp check: date is near a boundary
    if (daysBetween(date, start) <= cuspToleranceDays) {
      cuspSigns.add(entry.sign);
      // Also add the previous sign (the one ending at this boundary)
      const prevIdx = (signIndex(entry.sign) - 1 + 12) % 12;
      cuspSigns.add(ZODIAC_ORDER[prevIdx]);
    }
    if (daysBetween(date, end) <= cuspToleranceDays) {
      cuspSigns.add(entry.sign);
      // Also add the next sign
      const nextIdx = (signIndex(entry.sign) + 1) % 12;
      cuspSigns.add(ZODIAC_ORDER[nextIdx]);
    }
  }

  // Combine direct matches with cusp allowances
  const allSigns = new Set([...matchingSigns, ...cuspSigns]);

  return {
    signs: [...allSigns],
    primarySign: matchingSigns.length > 0 ? matchingSigns[0] : null,
  };
}

// ─── Main Estimation Function ───────────────────────────────

/**
 * Estimate expected zodiac signs for all planets given a date.
 *
 * Uses known astronomical data to provide a sanity-check baseline.
 * For slow-moving outer planets, the sign is deterministic from the date.
 * For inner planets, we allow a tolerance range relative to the Sun.
 */
export function estimateBirthChartSigns(
  date: Date,
): Record<string, SignEstimate> {
  const estimates: Record<string, SignEstimate> = {};

  // Sun — deterministic from date
  const sunSign = getZodiacSignType(date);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Check if near a cusp (within 1 day of sign boundary)
  const isSunCusp = isCuspDate(month, day);
  const sunAllowed = isSunCusp ? getSignsInRange(sunSign, 1) : [sunSign];

  estimates.Sun = {
    expectedSign: sunSign,
    allowedSigns: sunAllowed,
    confidence: "high",
    source: "zodiac-seasons",
  };

  try {
    const astroTime = new Astronomy.AstroTime(date);
    
    // Moon calculation (moves ~13° per day)
    const moonLong = Astronomy.EclipticLongitude(Astronomy.Body.Moon, astroTime);
    const moonSignIndex = Math.floor((((moonLong % 360) + 360) % 360) / 30);
    const moonSign = ZODIAC_ORDER[moonSignIndex];
    
    estimates.Moon = {
      expectedSign: moonSign,
      allowedSigns: getSignsInRange(moonSign, 1), // allow ±1 sign for cusp variance throughout the day
      confidence: "high",
      source: "astronomy-engine",
    };

    // Mars calculation
    const marsLong = Astronomy.EclipticLongitude(Astronomy.Body.Mars, astroTime);
    const marsSignIndex = Math.floor((((marsLong % 360) + 360) % 360) / 30);
    const marsSign = ZODIAC_ORDER[marsSignIndex];
    
    estimates.Mars = {
      expectedSign: marsSign,
      allowedSigns: getSignsInRange(marsSign, 1), // allow ±1 sign for cusp variance
      confidence: "high",
      source: "astronomy-engine",
    };
  } catch (error) {
    // Graceful fallback if astronomy-engine throws an exception
    estimates.Moon = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "too-fast-fallback",
    };
    estimates.Mars = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "too-variable-fallback",
    };
  }

  // Mercury — always within ±1 sign of Sun
  estimates.Mercury = {
    expectedSign: sunSign,
    allowedSigns: getSignsInRange(sunSign, 1),
    confidence: "medium",
    source: "sun-proximity",
  };

  // Venus — always within ±2 signs of Sun
  estimates.Venus = {
    expectedSign: sunSign,
    allowedSigns: getSignsInRange(sunSign, 2),
    confidence: "medium",
    source: "sun-proximity",
  };

  // Jupiter — lookup table with 30-day cusp tolerance
  const jupiterResult = lookupSignForDate(date, JUPITER_SIGN_TRANSITS, 30);
  if (jupiterResult.signs.length > 0) {
    estimates.Jupiter = {
      expectedSign: jupiterResult.primarySign,
      allowedSigns: jupiterResult.signs,
      confidence: "high",
      source: "transit-table",
    };
  } else {
    estimates.Jupiter = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "outside-table-range",
    };
  }

  // Saturn — lookup table with 60-day cusp tolerance
  const saturnResult = lookupSignForDate(date, SATURN_SIGN_TRANSITS, 60);
  if (saturnResult.signs.length > 0) {
    estimates.Saturn = {
      expectedSign: saturnResult.primarySign,
      allowedSigns: saturnResult.signs,
      confidence: "high",
      source: "transit-table",
    };
  } else {
    estimates.Saturn = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "outside-table-range",
    };
  }

  // Uranus — lookup table with 90-day cusp tolerance
  const uranusResult = lookupSignForDate(date, URANUS_SIGN_TRANSITS, 90);
  if (uranusResult.signs.length > 0) {
    estimates.Uranus = {
      expectedSign: uranusResult.primarySign,
      allowedSigns: uranusResult.signs,
      confidence: "high",
      source: "transit-table",
    };
  } else {
    estimates.Uranus = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "outside-table-range",
    };
  }

  // Neptune — lookup table with 90-day cusp tolerance
  const neptuneResult = lookupSignForDate(date, NEPTUNE_SIGN_TRANSITS, 90);
  if (neptuneResult.signs.length > 0) {
    estimates.Neptune = {
      expectedSign: neptuneResult.primarySign,
      allowedSigns: neptuneResult.signs,
      confidence: "high",
      source: "transit-table",
    };
  } else {
    estimates.Neptune = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "outside-table-range",
    };
  }

  // Pluto — lookup table with 90-day cusp tolerance
  const plutoResult = lookupSignForDate(date, PLUTO_SIGN_TRANSITS, 90);
  if (plutoResult.signs.length > 0) {
    estimates.Pluto = {
      expectedSign: plutoResult.primarySign,
      allowedSigns: plutoResult.signs,
      confidence: "high",
      source: "transit-table",
    };
  } else {
    estimates.Pluto = {
      expectedSign: null,
      allowedSigns: ZODIAC_ORDER,
      confidence: "skip",
      source: "outside-table-range",
    };
  }

  // Ascendant — skip (depends on exact birth time and location)
  estimates.Ascendant = {
    expectedSign: null,
    allowedSigns: ZODIAC_ORDER,
    confidence: "skip",
    source: "location-dependent",
  };

  return estimates;
}

// ─── Validation Functions ───────────────────────────────────

/**
 * Detect whether the returned positions match the static fallback
 * from astrologizeApi.ts — a known bad pattern that returns the same
 * positions regardless of the actual birth date.
 */
export function detectStaticFallback(
  positions: Record<string, any>,
): boolean {
  let matches = 0;
  let total = 0;

  for (const [planet, expectedSign] of Object.entries(STATIC_FALLBACK_SIGNATURE)) {
    const pos = positions[planet];
    if (!pos) continue;
    total++;

    const actualSign = typeof pos === "string" ? pos : pos.sign || pos;
    if (String(actualSign).toLowerCase() === expectedSign) {
      matches++;
    }
  }

  // If 8+ of 10 planets match the static fallback, it's almost certainly the fallback
  return total >= 8 && matches >= 8;
}

/**
 * Validate birth chart planetary positions against estimated signs.
 *
 * Compares API results to astronomical estimates and flags mismatches.
 * This is logging-only — it never overrides API results.
 */
export function validateBirthChartAgainstEstimates(
  birthDate: Date,
  positions: Record<string, any>,
): ValidationResult {
  const isStaticFallback = detectStaticFallback(positions);
  const estimates = estimateBirthChartSigns(birthDate);
  const warnings: PlanetValidationWarning[] = [];
  let validatedPlanets = 0;
  let passedPlanets = 0;
  let skippedPlanets = 0;

  for (const [planet, estimate] of Object.entries(estimates)) {
    if (estimate.confidence === "skip") {
      skippedPlanets++;
      continue;
    }

    const pos = positions[planet];
    if (!pos) {
      skippedPlanets++;
      continue;
    }

    const actualSign = (typeof pos === "string" ? pos : String(pos)).toLowerCase();
    validatedPlanets++;

    if (estimate.allowedSigns.includes(actualSign)) {
      passedPlanets++;
    } else {
      const severity = (estimate.confidence === "high") ? "error" as const : "warning" as const;
      warnings.push({
        planet,
        expectedSigns: estimate.allowedSigns,
        actualSign,
        confidence: estimate.confidence,
        severity,
        message: `${planet} in ${actualSign} but expected ${estimate.allowedSigns.join("/")} (source: ${estimate.source})`,
      });
    }
  }

  return {
    hasWarnings: warnings.length > 0,
    warnings,
    validatedPlanets,
    passedPlanets,
    skippedPlanets,
    isStaticFallback,
  };
}

// ─── Cusp Detection Helper ──────────────────────────────────

/**
 * Check if a month/day is within 1 day of a zodiac sign boundary.
 */
function isCuspDate(month: number, day: number): boolean {
  const boundaries = [
    [3, 20], [3, 21],   // Pisces/Aries
    [4, 19], [4, 20],   // Aries/Taurus
    [5, 20], [5, 21],   // Taurus/Gemini
    [6, 20], [6, 21],   // Gemini/Cancer
    [7, 22], [7, 23],   // Cancer/Leo
    [8, 22], [8, 23],   // Leo/Virgo
    [9, 22], [9, 23],   // Virgo/Libra
    [10, 22], [10, 23], // Libra/Scorpio
    [11, 21], [11, 22], // Scorpio/Sagittarius
    [12, 21], [12, 22], // Sagittarius/Capricorn
    [1, 19], [1, 20],   // Capricorn/Aquarius
    [2, 18], [2, 19],   // Aquarius/Pisces
  ];

  return boundaries.some(([m, d]) => month === m && day === d);
}
