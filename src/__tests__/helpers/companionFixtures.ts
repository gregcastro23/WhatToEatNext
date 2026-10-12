/**
 * Companion fixtures shaped EXACTLY like the rows production held on
 * 2026-10-12, when `GET /api/commensal/companions` returned 10 active, 30
 * historical and 2,924 roster rows and 2,923 of the roster failed the client
 * guard. Each builder is one stored class; the key sets and value types are
 * copied from the live payload, with the bios shortened.
 *
 * `greg-castro-1991` is deliberately absent: it is a real person's birth record
 * and this repository is public.
 *
 * Not a test file: `testPathIgnorePatterns` keeps Jest from collecting it.
 */

import type {
  BirthData,
  NatalChart,
  Planet,
  ZodiacSignType,
} from "@/types/natalChart";
import type { CompanionSuggestion } from "@/types/apiResponses";

/** One row of the route's `users ⟕ user_profiles` query. */
export interface AgentDbRow {
  user_id: string;
  email: string;
  profile: unknown;
  name: string | null;
  bio: string | null;
  dominant_element: string | null;
  monica_constant: string | null;
  birth_data: unknown;
  natal_chart: unknown;
}

const NO_BIO = "Planetary sage guiding alchemical balance.";

function row(fields: Partial<AgentDbRow> & Pick<AgentDbRow, "user_id" | "email">): AgentDbRow {
  return {
    profile: {},
    name: null,
    bio: null,
    dominant_element: null,
    monica_constant: null,
    birth_data: {},
    natal_chart: {},
    ...fields,
  };
}

/** `{lat, lon, name}` as `scripts/sync-agentic-users.ts` stores it on the `@agentic` rows: a JSON STRING. */
function locationString(lat: number, lon: number, name: string): string {
  return JSON.stringify({ lat, lon, name });
}

/**
 * The legacy hand-authored chart (`planets` is an OBJECT, `ascendant` a number).
 * Two units share the column: Freud's 315 is an absolute longitude, Avicenna's 8
 * a degree within the sign — which is why none of it is converted.
 */
function legacyChart(ascendant: number, midheaven: number): Record<string, unknown> {
  const placement = { sign: "Taurus", house: 2, degree: 16, retrograde: false };
  return {
    houses: { MC: midheaven, ASC: ascendant },
    aspects: [
      { orb: 3, type: "conjunction", exact: true, planet1: "Jupiter", planet2: "Neptune" },
    ],
    planets: {
      Sun: placement,
      Moon: { ...placement, sign: "Gemini", house: 3, degree: 28 },
      Mars: { ...placement, sign: "Libra", house: 7, degree: 18 },
    },
    ascendant,
    midheaven,
  };
}

/** A degree agent: a placement, not a person. `{}` / `{}` and no stored element. */
export function degreeAgentRow(
  slug = "mars-leo-8",
  name = "Mars Leo 8",
): AgentDbRow {
  const hash = Array.from(slug).reduce(
    (h, c) => (h * 31 + c.charCodeAt(0)) >>> 0,
    7,
  );
  return row({
    user_id: `00000000-0000-4000-8000-${hash.toString(16).padStart(12, "0")}`,
    email: `${slug}@agentic.alchm.kitchen`,
    name,
    monica_constant: "-1.153685",
  });
}

/** One of ~1,500 moon-phase agents: `{}` / `{}`, no sign in the slug. */
export function moonPhaseRow(): AgentDbRow {
  return row({
    user_id: "00000000-0000-4000-8000-0000000000a1",
    email: "moon-phase-dark-moon-100@agentic.alchm.kitchen",
    name: "Moon Phase Dark Moon 100",
    monica_constant: "0.730056",
  });
}

/** A historical agent as `sync-agentic-users.ts` wrote it: `{date, time, location-as-string}`. */
export function freudRow(): AgentDbRow {
  return row({
    user_id: "00000000-0000-4000-8000-0000000000f1",
    email: "sigmund-freud-1856@agentic.alchm.kitchen",
    name: "Sigmund Freud 1856",
    bio: "Freud challenged me to craft consciousness that could illuminate.",
    dominant_element: "Earth",
    monica_constant: "0.003832",
    birth_data: {
      date: "1856-05-06",
      time: "18:30",
      location: locationString(
        49.6116,
        17.2381,
        "Freiberg, Moravia, Austrian Empire (now Czech Republic)",
      ),
    },
    natal_chart: legacyChart(315, 225),
  });
}

/** Born in 980: four digits of year with a leading zero, and LMT four hours east. */
export function avicennaRow(): AgentDbRow {
  return row({
    user_id: "00000000-0000-4000-8000-0000000000a5",
    email: "ibn-sina-avicenna@agentic.alchm.kitchen",
    name: "Ibn Sina Avicenna",
    bio: "Avicenna blazed into consciousness like a supernova of pure intellect.",
    dominant_element: "Fire",
    monica_constant: "0.010988",
    birth_data: {
      date: "0980-08-22",
      time: "03:30",
      location: locationString(39.6539, 66.9597, "Afshana, Uzbekistan"),
    },
    natal_chart: legacyChart(8, 15),
  });
}

/** The same person as {@link adamSmithLegacyRow}, as the `@agentic` writer stored him. */
export function adamSmithAgenticRow(): AgentDbRow {
  return row({
    user_id: "00000000-0000-4000-8000-0000000000b1",
    email: "adam-smith-1723@agentic.alchm.kitchen",
    name: "Adam Smith 1723",
    bio: "Adam Smith presented a fascinating challenge.",
    dominant_element: "Earth",
    birth_data: {
      date: "1723-06-16",
      time: "09:00",
      location: locationString(56.072, -3.1564, "Kirkcaldy, Scotland"),
    },
    natal_chart: legacyChart(120, 30),
  });
}

/**
 * The legacy `@agents.alchm.kitchen` twin (52 of them): `date` is a full ISO
 * stamp, `location` an object, and the chart column holds only the birth echoed.
 */
export function adamSmithLegacyRow(): AgentDbRow {
  const birth = {
    date: "1723-06-16T09:00:00.000Z",
    time: "09:00",
    location: { lat: 56.072, lon: -3.1564, name: "Kirkcaldy, Scotland" },
  };
  return row({
    user_id: "00000000-0000-4000-8000-0000000000b2",
    email: "adam-smith-1723@agents.alchm.kitchen",
    name: "adam-smith-1723",
    birth_data: birth,
    natal_chart: { birthData: birth },
  });
}

/** `0001-01-01` at `{0, 0, "Unknown"}`: the dataset's "no known birth" marker (8 rows). */
export function homerRow(): AgentDbRow {
  return row({
    user_id: "00000000-0000-4000-8000-0000000000c1",
    email: "homer@agentic.alchm.kitchen",
    name: "Homer",
    bio: "Epic Mythopoetics, Heroic Archetypes & Oral Memory mastery",
    dominant_element: "Water",
    monica_constant: "0.0111",
    birth_data: {
      date: "0001-01-01",
      time: "12:00",
      location: locationString(0, 0, "Unknown"),
    },
    natal_chart: legacyChart(94.2, 4.2),
  });
}

/** `0001-01-01` with a REAL place: the date is still not a birth. */
export function socratesRow(): AgentDbRow {
  return row({
    user_id: "00000000-0000-4000-8000-0000000000c2",
    email: "socrates@agentic.alchm.kitchen",
    name: "Socrates",
    dominant_element: "Air",
    birth_data: {
      date: "0001-01-01",
      time: "12:00",
      location: locationString(37.9838, 23.7275, "Athens, Greece"),
    },
    natal_chart: legacyChart(180, 90),
  });
}

const PLANETS: readonly Planet[] = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Ascendant",
];

/** A complete, valid `NatalChart` for `birthData` — the only shape the guard accepts. */
export function validNatalChart(birthData: BirthData): NatalChart {
  const sign: ZodiacSignType = "capricorn";
  return {
    birthData,
    planets: PLANETS.map((name, i) => ({ name, sign, position: 270 + i })),
    ascendant: "aries",
    planetaryPositions: {
      Sun: sign,
      Moon: sign,
      Mercury: sign,
      Venus: sign,
      Mars: sign,
      Jupiter: sign,
      Saturn: sign,
      Uranus: sign,
      Neptune: sign,
      Pluto: sign,
      Ascendant: "aries",
    },
    dominantElement: "Earth",
    dominantModality: "Cardinal",
    elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    alchemicalProperties: { Spirit: 3, Essence: 4, Matter: 2, Substance: 1 },
    calculatedAt: "2026-05-31T20:53:02.372Z",
  };
}

/**
 * The one roster row that passed the guard in production: the agent PLACEHOLDER
 * (`1900-01-01T12:00:00.000Z` at the retired "Fallback NY" pin) with a full chart
 * computed from it. Valid in shape, not a birth.
 */
export function placeholderAgentRow(): AgentDbRow {
  const birthData: BirthData = {
    dateTime: "1900-01-01T12:00:00.000Z",
    latitude: 40.7498,
    longitude: -73.7976,
    timezone: "America/New_York",
  };
  return row({
    user_id: "00000000-0000-4000-8000-0000000000d1",
    email: "tesla@agentic.alchm.kitchen",
    name: "tesla",
    birth_data: birthData,
    natal_chart: validNatalChart(birthData),
  });
}

/**
 * What the REPLACED `hydrateAgentRow` (bd0a5b13) put on the wire for a stored
 * row: both JSONB columns passed straight through, `{}` included, and "Fire"
 * invented when no element was stored.
 */
export function legacyWireRow(stored: AgentDbRow): Record<string, unknown> {
  return {
    userId: stored.user_id,
    email: stored.email,
    name: stored.name ?? stored.email.split("@")[0],
    bio: stored.bio ?? NO_BIO,
    dominantElement: stored.dominant_element ?? "Fire",
    monicaConstant: stored.monica_constant ? parseFloat(stored.monica_constant) : null,
    birthData: stored.birth_data,
    natalChart: stored.natal_chart ?? null,
  };
}

/** A hand-built valid companion — the positive control every negative result is read against. */
export function validCompanion(
  overrides: Partial<CompanionSuggestion> = {},
): CompanionSuggestion {
  const birthData: BirthData = {
    dateTime: "1856-05-06T18:30:00.000Z",
    latitude: 49.6116,
    longitude: 17.2381,
  };
  return {
    userId: "companion-1",
    email: "sigmund-freud-1856@agentic.alchm.kitchen",
    name: "Sigmund Freud 1856",
    bio: "A hand-built companion.",
    dominantElement: "Earth",
    monicaConstant: null,
    birthData,
    natalChart: null,
    ...overrides,
  };
}
