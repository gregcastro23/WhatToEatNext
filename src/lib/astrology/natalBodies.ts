/**
 * Turn raw astrologize positions into the bodies of a natal chart — or say why it
 * cannot be done.
 *
 * ── The three fabrications this replaces ────────────────────────────────────
 *
 * `/api/user/charts`, `/api/user/commensals` and `/api/onboarding` each carried a
 * byte-identical copy of this block, and each PERSISTS its result
 * (`createSavedChart`, `createManualCompanion`, the user's profile):
 *
 * ```ts
 * const positions: Record<Planet, ZodiacSignType> = {
 *   Sun: rawPositions.Sun?.sign,                      // silently undefined
 *   …
 *   Ascendant: rawPositions.Ascendant?.sign || "aries",   // fabricated sign
 * };
 * const planets: PlanetInfo[] = Object.entries(positions).map(([pname, sign]) => ({
 *   name: pname as Planet,
 *   sign,
 *   position: rawPositions[pname]?.exactLongitude ?? 0,   // fabricated longitude
 * }));
 * ```
 *
 * 1. `?? 0` invents an ecliptic longitude. A fabricated zero is worse than an
 *    absent value: it survives `Number.isFinite`, satisfies a NOT NULL column, and
 *    STOPS any later `a ?? b ?? c` chain, because 0 is not nullish. Upstream that
 *    exact shape put `longitude: 0` on 710 of 710 stored bodies and made an audit
 *    "find" 71 all-zero charts that were fine — see `normaliseNatalPositions` in
 *    `src/utils/fullChartMonica.ts`.
 * 2. `|| "aries"` invents a rising sign, the one placement a reader is most likely
 *    to quote back to the user as fact.
 * 3. The other ten resolve to `undefined` inside a `Record<Planet, ZodiacSignType>`
 *    that says they cannot be — so `calcDominantElement` and friends silently score
 *    an incomplete chart as if it were whole.
 *
 * ── What replaces them ─────────────────────────────────────────────────────
 *
 * A chart that cannot be stated is REFUSED, not filled in. All three callers
 * already return 503 when the calculation throws; unusable output is the same
 * condition and now takes the same exit. A stored chart is therefore either whole
 * or absent.
 *
 * The longitude is never invented, but it may be DERIVED:
 *   - MEASURED — `exactLongitude` when it states an angle (`statesALongitude`).
 *   - DERIVED  — otherwise `signIndex * 30 + degree`, which is CONSISTENT with the
 *     sign rather than contradicting it, and is exactly the fallback the canonical
 *     reader `parseNatalPositions` applies. Sign-resolution at worst; never 0°
 *     Aries for a body the chart places in Scorpio.
 *
 * `statesALongitude` is imported, not re-implemented: it is the same rule the
 * agent-side writer uses, and a fourth copy is how the rule comes to differ.
 */
import type { Planet, ZodiacSignType } from "@/types/celestial";
import type { PlanetInfo } from "@/types/natalChart";
import { statesALongitude } from "@/utils/fullChartMonica";
import { ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";

const SIGN_KEYS = Object.keys(ZODIAC_ELEMENTS).map((s) => s.toLowerCase());

/**
 * The bodies every stored natal chart here is expected to carry. The Ascendant is
 * included: it is a real computed angle in this pipeline (`fetchPlanetaryPositions`
 * derives one from sidereal time when the backend omits it), and every consumer
 * treats it as present.
 */
export const NATAL_BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  "Ascendant",
] as const;

/** One body as the astrologize layer reports it. Every field is optional there. */
export interface RawBodyPosition {
  sign?: unknown;
  degree?: number;
  exactLongitude?: number;
}

export type NatalBodies =
  | {
      ok: true;
      positions: Record<Planet, ZodiacSignType>;
      planets: PlanetInfo[];
      /** Bodies whose longitude was derived from sign+degree, not measured. */
      derivedLongitudes: string[];
    }
  | { ok: false; unusable: string[] };

/**
 * Build the bodies, or report which ones cannot be stated.
 *
 * A body is unusable when its sign is missing or is not a zodiac sign — there is
 * nothing to derive a placement from, and inventing one is the defect above.
 */
export function natalBodiesFromRawPositions(
  raw: Record<string, RawBodyPosition | undefined> | null | undefined,
): NatalBodies {
  const positions = {} as Record<Planet, ZodiacSignType>;
  const planets: PlanetInfo[] = [];
  const unusable: string[] = [];
  const derivedLongitudes: string[] = [];

  for (const body of NATAL_BODIES) {
    const entry = raw?.[body];
    const sign = String(entry?.sign ?? "").toLowerCase();
    const signIndex = SIGN_KEYS.indexOf(sign);
    if (signIndex < 0) {
      unusable.push(body);
      continue;
    }

    let position: number;
    if (statesALongitude(entry?.exactLongitude as number)) {
      position = entry!.exactLongitude!;
    } else {
      position = signIndex * 30 + (Number.isFinite(entry?.degree) ? entry!.degree! : 0);
      derivedLongitudes.push(body);
    }

    positions[body] = sign as ZodiacSignType;
    planets.push({ name: body, sign: sign as ZodiacSignType, position });
  }

  if (unusable.length > 0) return { ok: false, unusable };
  return { ok: true, positions, planets, derivedLongitudes };
}

/** The 503 body all three routes return when a chart cannot be stated. */
export function unusableChartMessage(unusable: string[]): string {
  return (
    "Planetary calculation returned an unusable chart " +
    `(no valid sign for: ${unusable.join(", ")}). ` +
    "Please try again later."
  );
}
