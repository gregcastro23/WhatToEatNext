import {
  calculateLunarPhase,
  getAccuratePlanetaryPositionsSync,
  getLunarPhaseName,
} from "@/utils/accurateAstronomy";
import type { AspectKind, SkySnapshot } from "./types";

/**
 * The sky right now, COMPUTED with astronomy-engine (geocentric ecliptic
 * longitudes, the same engine behind /api/planetary-positions). Nothing here
 * is authored or cached; a failure returns null and the quiz simply asks no
 * sky questions.
 */

/** The Moon's mean motion along the ecliptic: 13.176°/day. */
const MOON_DEGREES_PER_HOUR = 13.176 / 24;

const ASPECT_ANGLES: ReadonlyArray<{ kind: AspectKind; angle: number }> = [
  { kind: "conjunction", angle: 0 },
  { kind: "sextile", angle: 60 },
  { kind: "square", angle: 90 },
  { kind: "trine", angle: 120 },
  { kind: "opposition", angle: 180 },
];

/** Bodies whose aspects the quiz talks about, fastest-changing first. */
const ASPECT_BODIES: readonly string[] = ["moon", "venus", "mars", "mercury", "sun", "jupiter", "saturn"];
const RETROGRADE_BODIES: readonly string[] = ["mercury", "venus", "mars", "jupiter", "saturn"];

/** Orb allowance in degrees: wider for the fast-moving Moon. */
function orbLimit(a: string, b: string): number {
  return a === "moon" || b === "moon" ? 6 : 4;
}

interface BodyPosition {
  sign: string;
  degree: number;
  exactLongitude: number;
  isRetrograde?: boolean;
}

function separation(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

/**
 * The tightest aspect between two quiz bodies. Sun–Mercury and Sun–Venus are
 * skipped: those planets never stray far from the Sun, so their conjunctions
 * are near-constant rather than news.
 */
export function tightestAspect(
  positions: Readonly<Record<string, BodyPosition | undefined>>,
): SkySnapshot["aspect"] {
  let best: SkySnapshot["aspect"] = null;
  for (const [i, a] of ASPECT_BODIES.entries()) {
    for (const b of ASPECT_BODIES.slice(i + 1)) {
      if (a === "sun" && (b === "mercury" || b === "venus")) continue;
      if (b === "sun" && (a === "mercury" || a === "venus")) continue;
      const pa = positions[a];
      const pb = positions[b];
      if (!pa || !pb) continue;
      const sep = separation(pa.exactLongitude, pb.exactLongitude);
      for (const { kind, angle } of ASPECT_ANGLES) {
        const orb = Math.abs(sep - angle);
        if (orb <= orbLimit(a, b) && (!best || orb < best.orb)) best = { a, b, kind, orb };
      }
    }
  }
  return best;
}

export function computeSky(date: Date): SkySnapshot | null {
  try {
    const positions: Record<string, BodyPosition | undefined> = getAccuratePlanetaryPositionsSync(date);
    const { moon, sun } = positions;
    if (!moon || !sun) return null;
    const phase = calculateLunarPhase(date);
    return {
      computedAt: date.toISOString(),
      moon: {
        sign: moon.sign,
        degree: moon.degree,
        hoursLeftInSign: Math.max(0, (30 - moon.degree) / MOON_DEGREES_PER_HOUR),
      },
      sun: { sign: sun.sign },
      phase: {
        name: getLunarPhaseName(phase),
        illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2,
      },
      retrogrades: RETROGRADE_BODIES.filter((body) => positions[body]?.isRetrograde === true),
      aspect: tightestAspect(positions),
    };
  } catch {
    return null;
  }
}
