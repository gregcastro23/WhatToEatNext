/**
 * Sky Conditions Service
 *
 * Computes the live planetary snapshot for the admin dashboard's Sky
 * Conditions panel — ecliptic positions, daily motion, retrograde/stationing
 * state, and the tightest current aspects between the seven traditional
 * planets — from the server ephemeris. Replaces the seeded fixture the
 * dashboard prototype shipped.
 *
 * Degrades gracefully: any failure resolves to a neutral cached snapshot
 * with `live: false`, so the dashboard never hard-fails.
 */

import { _logger } from "@/lib/logger";
import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";
import type { Planet } from "@/types/celestial";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import { getCurrentPlanetaryPositionsServer } from "@/utils/serverPlanetaryCalculations";

export interface SkyPlanet {
  /** astrological glyph, e.g. "☿" */
  symbol: string;
  /** planet name, e.g. "Mercury" */
  name: string;
  /** formatted ecliptic position, e.g. "06°41′ Gem" */
  position: string;
  /** formatted daily motion, e.g. "+0.96°/d" — "—" when unavailable */
  speed: string;
  retrograde: boolean;
  /** daily motion near zero — the planet is stationing */
  stationing: boolean;
}

export interface SkyAspect {
  /** glyph of the faster-moving body */
  a: string;
  /** aspect glyph: ☌ conjunction · ✶ sextile · □ square · △ trine · ☍ opposition */
  op: string;
  /** glyph of the slower-moving body */
  b: string;
  /** orb from exact, e.g. "0°14′" */
  orb: string;
  /** true when the aspect is tightening toward exact */
  applying: boolean;
}

export interface PlanetaryHourSegment {
  /** clock hour 0-23 */
  hour: number;
  /** planet ruling this hour, as an astrological glyph */
  symbol: string;
  /** planet name (e.g. "Mars") */
  planet: Planet;
  /** true for the segment containing now */
  isLive: boolean;
  /** true for hours earlier today than now */
  isPast: boolean;
}

export interface PlanetaryHourSnapshot {
  /** glyph of the current planetary hour ruler */
  symbol: string;
  /** name of the current planetary hour ruler */
  planet: Planet;
  /** planetary day ruler (e.g. "Mars" on a Tuesday) */
  dayRuler: Planet;
  /** day-or-night index of the current planetary hour, 0-11 */
  hourNumber: number;
  isDaytime: boolean;
  /** 24-clock-hour view used by the dashboard's planetary-hour bar */
  segments: PlanetaryHourSegment[];
  /** true when computed from the calculator; false when degraded. */
  live: boolean;
}

export interface SkyConditionsData {
  /** short derived summary, e.g. "Mercury stationing · 2 planets retrograde" */
  headline: string;
  planets: SkyPlanet[];
  aspects: SkyAspect[];
  /** current planetary day/hour + 24-hour bar for the planetary-hour widget */
  planetaryHour: PlanetaryHourSnapshot;
  /** true when computed from the live ephemeris; false when degraded. */
  live: boolean;
  generatedAt: string;
}

const TRADITIONAL_PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
] as const;

type PlanetName = (typeof TRADITIONAL_PLANETS)[number];

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

const SIGN_ABBR: Record<string, string> = {
  aries: "Ari",
  taurus: "Tau",
  gemini: "Gem",
  cancer: "Can",
  leo: "Leo",
  virgo: "Vir",
  libra: "Lib",
  scorpio: "Sco",
  sagittarius: "Sag",
  capricorn: "Cap",
  aquarius: "Aqu",
  pisces: "Pis",
};

const MAJOR_ASPECTS: Array<{ angle: number; op: string }> = [
  { angle: 0, op: "☌" },
  { angle: 60, op: "✶" },
  { angle: 90, op: "□" },
  { angle: 120, op: "△" },
  { angle: 180, op: "☍" },
];

/** Maximum orb (degrees) for a pair to count as an aspect. */
const ASPECT_ORB = 6;

/** Daily motion (deg/day) below which a non-luminary is "stationing". */
const STATIONING_SPEED = 0.08;

const DEGRADED_PLANETARY_HOUR: PlanetaryHourSnapshot = {
  symbol: "—",
  planet: "Sun",
  dayRuler: "Sun",
  hourNumber: 0,
  isDaytime: true,
  segments: [],
  live: false,
};

/** Neutral snapshot returned when the ephemeris is unavailable. */
const DEGRADED_SKY: Omit<SkyConditionsData, "generatedAt" | "planetaryHour"> = {
  headline: "Sky telemetry unavailable",
  live: false,
  planets: TRADITIONAL_PLANETS.map((name) => ({
    symbol: PLANET_GLYPH[name] ?? "?",
    name,
    position: "—",
    speed: "—",
    retrograde: false,
    stationing: false,
  })),
  aspects: [],
};

/**
 * Resolve the current planetary hour bar from `PlanetaryHourCalculator`,
 * including the 24-clock-hour view consumed by the dashboard widget.
 * Degrades independently — a failure here doesn't bring down the rest of
 * the sky snapshot.
 */
function buildPlanetaryHourSnapshot(now: Date): PlanetaryHourSnapshot {
  try {
    const calc = new PlanetaryHourCalculator();
    const current = calc.getCurrentPlanetaryHour();
    const dayRuler = calc.getCurrentPlanetaryDay();
    const dailyHours = calc.getDailyPlanetaryHours(now);
    const liveClockHour = now.getHours();

    const segments: PlanetaryHourSegment[] = Array.from(
      { length: 24 },
      (_, hour) => {
        const planet: Planet = dailyHours.get(hour) ?? dayRuler;
        return {
          hour,
          symbol: PLANET_GLYPH[planet] ?? "?",
          planet,
          isLive: hour === liveClockHour,
          isPast: hour < liveClockHour,
        };
      },
    );

    return {
      symbol: PLANET_GLYPH[current.planet] ?? "?",
      planet: current.planet,
      dayRuler,
      hourNumber: current.hourNumber,
      isDaytime: current.isDaytime,
      segments,
      live: true,
    };
  } catch (error) {
    _logger.error("[skyConditions] planetary-hour calculation failed:", error);
    return DEGRADED_PLANETARY_HOUR;
  }
}

function formatPosition(p: PlanetPosition): string {
  const degree = Number.isFinite(p.degree) ? p.degree : 0;
  const minute = Number.isFinite(p.minute) ? p.minute : 0;
  const abbr = SIGN_ABBR[String(p.sign).toLowerCase()] ?? "—";
  return `${String(degree).padStart(2, "0")}°${String(minute).padStart(2, "0")}′ ${abbr}`;
}

function formatSpeed(speed: number | undefined): string {
  if (speed === undefined || !Number.isFinite(speed)) return "—";
  const decimals = Math.abs(speed) >= 10 ? 1 : 2;
  return `${speed >= 0 ? "+" : "-"}${Math.abs(speed).toFixed(decimals)}°/d`;
}

/** Folded angular separation of two ecliptic longitudes, in [0, 180]. */
function foldSeparation(lonA: number, lonB: number): number {
  let d = Math.abs(lonA - lonB) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function formatOrb(orb: number): string {
  const deg = Math.floor(orb);
  const min = Math.round((orb - deg) * 60);
  if (min === 60) return `${deg + 1}°00′`;
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

/** Tightest major aspects between the traditional planets, closest orb first. */
function computeAspects(positions: Record<string, PlanetPosition>): SkyAspect[] {
  const bodies = TRADITIONAL_PLANETS.map((name) => ({
    name,
    lon: positions[name]?.exactLongitude,
    speed: positions[name]?.longitudeSpeed ?? 0,
  })).filter(
    (b): b is { name: PlanetName; lon: number; speed: number } =>
      typeof b.lon === "number" && Number.isFinite(b.lon),
  );

  const found: Array<{ aspect: SkyAspect; orbValue: number }> = [];

  for (let i = 0; i < bodies.length; i++) {
    const bodyA = bodies[i];
    if (!bodyA) continue;
    for (let j = i + 1; j < bodies.length; j++) {
      const bodyB = bodies[j];
      if (!bodyB) continue;

      const separation = foldSeparation(bodyA.lon, bodyB.lon);
      let best: { angle: number; op: string; orb: number } | null = null;
      for (const aspect of MAJOR_ASPECTS) {
        const orb = Math.abs(separation - aspect.angle);
        if (orb <= ASPECT_ORB && (best === null || orb < best.orb)) {
          best = { angle: aspect.angle, op: aspect.op, orb };
        }
      }
      if (best === null) continue;

      // Applying when the orb tightens projecting one day forward.
      const separationNext = foldSeparation(
        bodyA.lon + bodyA.speed,
        bodyB.lon + bodyB.speed,
      );
      const applying = Math.abs(separationNext - best.angle) < best.orb;

      // Faster-moving body listed first.
      const aIsFaster = Math.abs(bodyA.speed) >= Math.abs(bodyB.speed);
      const faster = aIsFaster ? bodyA : bodyB;
      const slower = aIsFaster ? bodyB : bodyA;

      found.push({
        aspect: {
          a: PLANET_GLYPH[faster.name] ?? "?",
          op: best.op,
          b: PLANET_GLYPH[slower.name] ?? "?",
          orb: formatOrb(best.orb),
          applying,
        },
        orbValue: best.orb,
      });
    }
  }

  return found
    .sort((x, y) => x.orbValue - y.orbValue)
    .slice(0, 4)
    .map((entry) => entry.aspect);
}

function buildHeadline(planets: SkyPlanet[]): string {
  const stationing = planets.filter((p) => p.stationing).map((p) => p.name);
  const retrograde = planets.filter((p) => p.retrograde);
  const parts: string[] = [];
  if (stationing.length > 0) {
    parts.push(`${stationing.join(" & ")} stationing`);
  }
  if (retrograde.length === 1) {
    parts.push(`${retrograde[0]?.name} retrograde`);
  } else if (retrograde.length > 1) {
    parts.push(`${retrograde.length} planets retrograde`);
  }
  return parts.length > 0 ? parts.join(" · ") : "All planets direct";
}

/**
 * Resolve the live sky-conditions snapshot for the admin dashboard.
 * Never rejects — ephemeris and planetary-hour sources degrade
 * independently to `live: false` so the dashboard never hard-fails.
 */
export async function getSkyConditions(): Promise<SkyConditionsData> {
  const now = new Date();
  const generatedAt = now.toISOString();
  // Planetary-hour data is local-only and cheap — compute it first so it can
  // ship even when the ephemeris call fails.
  const planetaryHour = buildPlanetaryHourSnapshot(now);

  try {
    const positions = await getCurrentPlanetaryPositionsServer();

    const planets: SkyPlanet[] = [];
    for (const name of TRADITIONAL_PLANETS) {
      const p = positions[name];
      if (!p) continue;
      const speed = p.longitudeSpeed;
      const stationing =
        name !== "Sun" &&
        name !== "Moon" &&
        typeof speed === "number" &&
        Number.isFinite(speed) &&
        Math.abs(speed) < STATIONING_SPEED;
      planets.push({
        symbol: PLANET_GLYPH[name] ?? "?",
        name,
        position: formatPosition(p),
        speed: formatSpeed(speed),
        retrograde: Boolean(p.isRetrograde),
        stationing,
      });
    }

    if (planets.length === 0) {
      _logger.error("[skyConditions] ephemeris returned no traditional planets");
      return { ...DEGRADED_SKY, planetaryHour, generatedAt };
    }

    return {
      headline: buildHeadline(planets),
      planets,
      aspects: computeAspects(positions),
      planetaryHour,
      live: true,
      generatedAt,
    };
  } catch (error) {
    _logger.error("[skyConditions] ephemeris computation failed:", error);
    return { ...DEGRADED_SKY, planetaryHour, generatedAt };
  }
}
