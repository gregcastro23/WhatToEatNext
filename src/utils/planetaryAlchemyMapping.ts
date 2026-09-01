/**
 * Planetary Alchemy Mapping - Authoritative Source
 *
 * This module contains the ONLY correct method for calculating ESMS properties
 * (Spirit, Essence, Matter, Substance) from planetary positions.
 *
 * CRITICAL: ESMS values CANNOT be derived from elemental properties (Fire/Water/Earth/Air).
 * They MUST be calculated from planetary alchemy values.
 *
 * Based on the core alchemizer engine specification.
 *
 * Sectarian Logic (January 2026):
 * Each planet has two elemental natures - one for the day sect (diurnal) and one
 * for the night sect (nocturnal). Saturn, for example, is Air by day and Earth by
 * night. These sectarian elements drive the dynamic elemental profile of the sky.
 */

import {
  dignityFoldsAtLongitude,
  dignityFoldsForSign,
  toLegacyDignityType,
  toLegacyEsmsScale,
  MANIFEST_PLANETS,
  type DignityFoldSummary,
  type ManifestPlanet,
} from "@/calculations/dignityManifest";
import { PLANET_WEIGHTS } from "@/data/planets";
import { _logger } from "@/lib/logger";
import type { DignityType, ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";
import { buildAspectsWithStrength } from "./aspectCalculator";
import { calculateAspectESMSModifications } from "./aspectESMSEffects";
// The real sect primitive: the Sun's altitude above a given observer's horizon.
// `positions` imports only astronomy-engine, the logger and types, so this
// direction introduces no cycle.
import { isDiurnalAt } from "./astrology/positions";

export type { AlchemicalProperties };

/**
 * Planetary Alchemy Values (Authoritative from Alchemizer Engine)
 *
 * Each planet contributes specific ESMS values:
 * - Sun: Pure Spirit (consciousness, vitality)
 * - Moon: Essence + Matter (emotion, substance)
 * - Mercury: Spirit + Substance (intellect, communication)
 * - Venus: Essence + Matter (beauty, harmony)
 * - Mars: Essence + Matter (action, energy)
 * - Jupiter: Spirit + Essence (expansion, wisdom)
 * - Saturn: Spirit + Matter (structure, discipline)
 * - Uranus: Essence + Matter (innovation, change)
 * - Neptune: Essence + Substance (intuition, dissolution)
 * - Pluto: Essence + Matter (transformation, power)
 */
export const PLANETARY_ALCHEMY = {
  Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
  Moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
  Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
  Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
  Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
  Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
} as const;

/**
 * Planetary Sectarian ESMS - Day vs Night Alchemy
 *
 * Based on traditional astrological sect (day/night planetary dignity),
 * planets express different ESMS qualities depending on whether the chart
 * is diurnal (day) or nocturnal (night).
 *
 * Key principle: Day sect emphasizes Spirit (consciousness, vitality);
 * Night sect emphasizes Matter/Substance (material, emotional, transformative).
 *
 * User's Dignity Table Data:
 * - Day (Diurnal): Sun, Mercury, Jupiter, Saturn → Spirit
 * - Night (Nocturnal):
 *   - Moon, Venus, Mars, Saturn, Uranus, Pluto → Matter
 *   - Mercury, Neptune → Substance
 *   - Jupiter → Essence
 *   - Sun → always Spirit
 */
export const PLANETARY_SECTARIAN_ESMS = {
  Sun: {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, // Sun always contributes Spirit
  },
  Moon: {
    diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 }, // Night: Matter
  },
  Mercury: {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, // Day: Spirit
    nocturnal: { Spirit: 0, Essence: 0, Matter: 0, Substance: 1 }, // Night: Substance
  },
  Venus: {
    diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 }, // Night: Matter
  },
  Mars: {
    diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 }, // Night: Matter
  },
  Jupiter: {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, // Day: Spirit
    nocturnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, // Night: Essence
  },
  Saturn: {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, // Day: Spirit
    nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 }, // Night: Matter
  },
  Uranus: {
    diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 }, // Night: Matter
  },
  Neptune: {
    diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0, Matter: 0, Substance: 1 }, // Night: Substance
  },
  Pluto: {
    diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 }, // Night: Matter
  },
  /**
   * Ascendant — Physical Vessel / Grounding Constant
   *
   * The Ascendant (column AJ in Dignity Tables) contributes (+++) to ALL
   * principles. It represents the "Physical Vessel" — the embodied reality
   * that grounds Spirit/Essence into the material world.
   *
   * Critically, this provides the baseline Matter and Substance values that
   * prevent the Reactivity formula from division-by-zero in pure Day charts.
   * The Ascendant's sect-invariance (same day and night) reflects that the
   * physical body exists in both states equally.
   */
  Ascendant: {
    diurnal:   { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 }, // (+++) to all
    nocturnal: { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 }, // sect-invariant
  },
} as const;

/**
 * Zodiac Sign to Element Mapping
 *
 * Used to aggregate elemental properties from planetary positions.
 * Each planet's sign contributes its element to the total.
 */
export type AlchemicalElement = "Fire" | "Water" | "Earth" | "Air";

export const ZODIAC_ELEMENTS = {
  Aries: "Fire",
  Taurus: "Earth",
  Gemini: "Air",
  Cancer: "Water",
  Leo: "Fire",
  Virgo: "Earth",
  Libra: "Air",
  Scorpio: "Water",
  Sagittarius: "Fire",
  Capricorn: "Earth",
  Aquarius: "Air",
  Pisces: "Water",
} as const satisfies Record<string, AlchemicalElement>;

export type ZodiacSignType = keyof typeof ZODIAC_ELEMENTS;
export type PlanetName = keyof typeof PLANETARY_ALCHEMY;
export type ZodiacQuality = "Cardinal" | "Fixed" | "Mutable";

/**
 * Planetary Sectarian Elements - Traditional Western Astrology
 *
 * In classical astrology each planet belongs to a sect (diurnal or nocturnal).
 * When it functions within its preferred sect it expresses one element; in the
 * contrary sect it expresses another. This produces the dynamic "live sky" profile
 * that shifts at every sunrise and sunset.
 *
 * Day sect planets: Sun, Jupiter, Saturn
 * Night sect planets: Moon, Venus, Mars
 * Mercury is adaptable - it joins whichever sect it rises with
 *
 * Diurnal / Nocturnal element assignments (traditional authority).
 *
 * ⚠️ This table is TRANSCRIBED FROM THE CODE BELOW, which is authoritative.
 * It previously disagreed with its own code for FOUR of the ten planets
 * (Venus, Jupiter, Uranus, Pluto had their pairs swapped or altered), so
 * anyone hand-porting the engine from this header — as the sibling repos
 * must — encoded four wrong sect elements. Sect drives the 0.4-weight pull
 * vector on every FBD card, so a wrong pair silently tilts the elemental
 * push. If you change the code, change this list in the same commit.
 *
 *   Sun     Fire  / Fire    (luminary - always Fire)
 *   Moon    Water / Water   (luminary - always Water)
 *   Mercury Air   / Earth   (adapts to sect)
 *   Venus   Water / Earth
 *   Mars    Fire  / Water
 *   Jupiter Air   / Fire
 *   Saturn  Air   / Earth   ← key correction (was wrong before)
 *   Uranus  Water / Air     (modern)
 *   Neptune Water / Water   (modern - watery by nature)
 *   Pluto   Earth / Water   (modern - transformative)
 */
export const PLANETARY_SECTARIAN_ELEMENTS = {
  Sun:     { diurnal: "Fire"  as AlchemicalElement, nocturnal: "Fire"  as AlchemicalElement },
  Moon:    { diurnal: "Water" as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Mercury: { diurnal: "Air"   as AlchemicalElement, nocturnal: "Earth" as AlchemicalElement },
  Venus:   { diurnal: "Water" as AlchemicalElement, nocturnal: "Earth" as AlchemicalElement },
  Mars:    { diurnal: "Fire"  as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Jupiter: { diurnal: "Air"   as AlchemicalElement, nocturnal: "Fire"  as AlchemicalElement },
  Saturn:  { diurnal: "Air"   as AlchemicalElement, nocturnal: "Earth" as AlchemicalElement },
  Uranus:  { diurnal: "Water" as AlchemicalElement, nocturnal: "Air"   as AlchemicalElement },
  Neptune: { diurnal: "Water" as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
  Pluto:   { diurnal: "Earth" as AlchemicalElement, nocturnal: "Water" as AlchemicalElement },
} as const;

export const PLANETARY_SECTARIAN_ALCHEMICAL = {
  Sun:     { diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 } },
  Moon:    { diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 } },
  Mercury: { diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 0, Substance: 1 } },
  Venus:   { diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 } },
  Mars:    { diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 } },
  Jupiter: { diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 } },
  Saturn:  { diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 } },
  Uranus:  { diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 } },
  Neptune: { diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 0, Substance: 1 } },
  Pluto:   { diurnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }, nocturnal: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 } },
} as const;

/**
 * Zodiac Sign Qualities (Modalities)
 *
 * Each sign belongs to one of three qualities that describe the MODE of its action:
 *   Cardinal - initiates, begins, leads (Aries, Cancer, Libra, Capricorn)
 *   Fixed    - sustains, concentrates, endures (Taurus, Leo, Scorpio, Aquarius)
 *   Mutable  - adapts, disperses, transitions (Gemini, Virgo, Sagittarius, Pisces)
 */
export const ZODIAC_QUALITIES: Record<string, ZodiacQuality> = {
  Aries:       "Cardinal",
  Taurus:      "Fixed",
  Gemini:      "Mutable",
  Cancer:      "Cardinal",
  Leo:         "Fixed",
  Virgo:       "Mutable",
  Libra:       "Cardinal",
  Scorpio:     "Fixed",
  Sagittarius: "Mutable",
  Capricorn:   "Cardinal",
  Aquarius:    "Fixed",
  Pisces:      "Mutable",
};

/**
 * Mean geocentric distances r̄ (AU) for the Λ(r) tensor — BASIS: MEASURED over
 * the 2026 epoch (astronomy-engine GeoVector, 6-hour grid, 1460 samples;
 * re-derived by `esmsConformance.test.ts` on every run).
 *
 * These replace the old `PLANET_MEAN_DISTANCES` table, which pinned the Moon
 * (real r̄ ≈ 0.00257 AU) and Mercury to `1.000` — a silent fudge that papered
 * over the dimensional incoherence of dividing a log-normalized weight by a
 * physical distance. Both live chart calculators emit REAL distances, so in
 * production the Moon's M/r² came out at 43,043 vs the Sun's 0.51 and the live
 * natal ESMS was 99.99% Moon (spec §7). Under the RULED Λ = diag(M̂·(r̄/r)²)
 * these means are the per-body normalization, not a stand-in for r.
 */
export const PLANET_MEAN_GEOCENTRIC_AU: Record<string, number> = {
  Sun:      1.0001517506922113,
  Moon:     0.002571016680904456,
  Mercury:  1.0527771261580632,
  Venus:    1.0162138470401183,
  Mars:     1.9442585501420186,
  Jupiter:  5.429789190115696,
  Saturn:   9.484384119258557,
  Uranus:  19.49876988921305,
  Neptune: 29.88354939796314,
  Pluto:   35.52718536398905,
};

/**
 * The Ascendant is the "Physical Vessel" grounding anchor, not an orbiting body.
 * RULED weight 1.0 — the same special case every period-scale path in this repo
 * already applies (`calculateESMSWithDegrees` below: "fixed (+1) to anchor the
 * system"; RealAlchemizeService.ts twice). The inertia functions here previously
 * had NO special case, so "Ascendant" fell through `?? 1.0` to Earth's relative
 * MASS and came out as normalizePlanetWeight(1.0) ≈ 0.3249 — an accident of the
 * fallback, not a ruling. The Python port was worse: its period scale is
 * min-anchored AT the Ascendant, so the same lookup returned exactly 0.0 and the
 * vessel was inert (11/20 golden charts collapsed to Matter = Substance = 0).
 * Both runtimes now pin THIS constant; `esmsConformance.test.ts` and
 * `test_esms_conformance.py` each assert it.
 */
export const ASCENDANT_VESSEL_WEIGHT = 1.0;

/**
 * The inertial mass scale — physical mass, log-normalized, with the zero
 * anchored OFF the charted set.
 *
 * `normalizePlanetWeight` anchors its minimum AT Pluto (0.0022), so Pluto's
 * weight is exactly 0 on that scale — the same extremum-annihilation that
 * zeroed the Ascendant on the Python period scale (§18k; PR #683). The inertia
 * tensor gets its own anchor, RULED one decade below the lightest charted body:
 * the scale's zero is a mass no charted body has, so no member is annihilated.
 * Pluto lands at ≈ 0.109, Sun stays exactly 1.0.
 *
 * This scale is DELIBERATELY separate from `normalizePlanetWeight`. The canonical
 * ESMS path and thermodynamic-affinity calibration are pinned against this
 * inertial scale; re-anchoring it would silently move both.
 */
const _INERTIAL_LOG_MIN = Math.log10(0.0022 / 10); // one decade below Pluto — RULED
const _INERTIAL_LOG_MAX = Math.log10(333054.2532); // Sun

export function inertialMassWeight(planet: string): number {
  if (planet === "Ascendant") return ASCENDANT_VESSEL_WEIGHT;
  // NOTE: unknown bodies still fall back to Earth's relative mass (1.0). That is
  // a silent-fabrication hazard kept only because every caller filters to the
  // known-body set first; tightening it to a throw is out of scope here.
  const relMass = PLANET_WEIGHTS[planet] ?? 1.0;
  return (Math.log10(Math.max(relMass, 1e-9)) - _INERTIAL_LOG_MIN) / (_INERTIAL_LOG_MAX - _INERTIAL_LOG_MIN);
}

/**
 * Gravitational inertia under the RULED Λ tensor (spec §7, option C):
 *
 *   Λ = diag( M̂_k · (r̄_k / r_k)² )
 *
 * Dimensionless by construction — each body's contribution oscillates about its
 * own measured mean distance instead of dividing a normalized weight by raw AU.
 * MEASURED consequences vs the old M/r²: |ln(kalchm)| ≤ 16.9 over the 2026
 * epoch (was ±155,724, overflowing canonical kalchm into the φ fallback), 1460/
 * 1460 distinct states, and real per-body modulation (Moon ±13%, Mercury
 * 0.53–3.4×, Venus 0.35–13.9×). With no live distance supplied, r = r̄ and the
 * factor is exactly 1 — the weight itself.
 */
export function getGravitationalInertia(planet: string, distanceAu?: number): number {
  const mass = inertialMassWeight(planet);
  const rBar = (PLANET_MEAN_GEOCENTRIC_AU as Record<string, number | undefined>)[planet];
  if (rBar === undefined) return mass; // Ascendant / unknown: no distance concept, factor 1
  const r = (distanceAu !== undefined && distanceAu > 0) ? distanceAu : rBar;
  return mass * (rBar / r) * (rBar / r);
}

/**
 * Tidal pull under the same RULED tensor: M̂ · (r̄/r)³.
 */
export function getTidalPull(planet: string, distanceAu?: number): number {
  const mass = inertialMassWeight(planet);
  const rBar = (PLANET_MEAN_GEOCENTRIC_AU as Record<string, number | undefined>)[planet];
  if (rBar === undefined) return mass;
  const r = (distanceAu !== undefined && distanceAu > 0) ? distanceAu : rBar;
  return mass * (rBar / r) * (rBar / r) * (rBar / r);
}

/**
 * Calculates dynamic Ascendant Grounding Vessel based on sign element and decan.
 * Prevents Day chart Matter/Substance collapse while introducing continuous positional modulation.
 * Decans: 1st (0-10°), 2nd (10-20°), 3rd (20-30°).
 */
export function calculatePositionalAscendantVessel(sign: string, degree = 0): AlchemicalProperties {
  const signClean = sign.trim().charAt(0).toUpperCase() + sign.trim().slice(1).toLowerCase();
  const element: AlchemicalElement =
    (ZODIAC_ELEMENTS as Record<string, AlchemicalElement | undefined>)[signClean] ?? "Earth";

  const deg = Math.max(0.0, Math.min(29.999, Number(degree) || 0));
  const decanIndex = Math.floor(deg / 10); // 0, 1, or 2

  const vessel: AlchemicalProperties = { Spirit: 0.5, Essence: 0.5, Matter: 0.5, Substance: 0.5 };

  if (element === "Fire") {
    vessel.Spirit += 0.5;
    vessel.Substance += 0.25;
  } else if (element === "Earth") {
    vessel.Matter += 0.5;
    vessel.Substance += 0.25;
  } else if (element === "Water") {
    vessel.Essence += 0.5;
    vessel.Matter += 0.25;
  } else {
    vessel.Spirit += 0.25;
    vessel.Substance += 0.5;
  }

  if (decanIndex === 0) {
    vessel.Matter += 0.1;
  } else if (decanIndex === 1) {
    vessel.Essence += 0.1;
  } else {
    vessel.Spirit += 0.1;
  }

  return vessel;
}

/**
 * Location-less sect fallback: 06:00–18:00 UTC → diurnal.
 *
 * ⚠️ PREFER {@link isSectDiurnalForBirth} (natal) or `isCurrentSkyDiurnal`
 * (live sky). Both compute the Sun's REAL altitude above a real horizon. This
 * function cannot: with no coordinates there is no horizon to be above, so it
 * substitutes the UTC clock for the sky.
 *
 * The substitution is wrong by the observer's offset from Greenwich — a little
 * over 5 hours for New York, where it reads US afternoons as "night". It
 * survives only as the degraded path for callers that genuinely have no
 * location, and as the catch-branch when astronomy-engine throws.
 *
 * @param date - Optional date/time to evaluate (defaults to now)
 * @returns true if diurnal (day), false if nocturnal (night)
 */
export function isSectDiurnal(date?: Date): boolean {
  const d = date ?? new Date();
  const hour = d.getUTCHours();
  return hour >= 6 && hour < 18;
}

/**
 * The inputs sect actually needs: an instant, and a place to stand.
 * A `BirthData` satisfies this directly — every natal call site already has one.
 */
export interface BirthSectInput {
  /** Wall clock, UTC-labelled. The fallback when `utcInstant` is absent. */
  dateTime: string;
  /**
   * The true UTC instant. PREFERRED, because solar altitude is a physical fact
   * about an absolute moment — a wall clock is not a moment until a zone is
   * applied to it. Written by `scripts/backfillBirthInstant.ts`.
   */
  utcInstant?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Determine the sect of a *birth* moment — was the Sun above the horizon at the
 * birthplace.
 *
 * ⚠️ PASS THE WHOLE `birthData`, not a bare `Date`. Sect drives the entire
 * day/night ESMS split (day → Spirit/Essence, night → Matter/Substance), so
 * getting it wrong rewrites the chart and the archetype with it.
 *
 * ── WHY THIS TAKES THE TRUE INSTANT WHERE THE OLD ONE TOOK THE WALL CLOCK ──
 *
 * This function used to insist on `birthData.dateTime` and explicitly forbid
 * `utcInstant`. That was correct FOR THE OLD IMPLEMENTATION, and is wrong for
 * this one, so the reversal is deliberate rather than a regression:
 *
 *   The 06:00–18:00 rule was never a definition of sect. It was a PROXY for
 *   "the Sun is up", phrased in local clock hours. Feeding a true instant into
 *   a local-clock proxy mixes two frames: 18:24Z reads nocturnal (`18 < 18` is
 *   false) for a Brooklyn birth that was plainly 2:24pm in broad daylight.
 *   Hence the old rule, which managed the hazard rather than removing it.
 *
 *   {@link isDiurnalAt} is not a proxy — it computes the Sun's real altitude,
 *   and altitude is a fact about an ABSOLUTE moment at a REAL place. So the
 *   correct inputs flip to `utcInstant` + coordinates, and the wall-clock
 *   hazard dissolves instead of needing to be remembered.
 *
 * MEASURED: both readings agree on all 6 migrated prod rows. The difference is
 * that this one keeps agreeing near dawn, near dusk, and at high latitude,
 * where a 06:00–18:00 window is simply not what the sky is doing.
 *
 * Degrades in documented steps, never silently — no `utcInstant` or no
 * coordinates falls back to the clock proxy on the wall clock, i.e. exactly the
 * previous behaviour, preserved on purpose for unmigrated rows.
 *
 * @param birth - the full birth data, or (legacy, degraded) a bare wall-clock Date
 * @returns true if diurnal (day), false if nocturnal (night)
 */
export function isSectDiurnalForBirth(birth: Date | BirthSectInput): boolean {
  // Legacy shape: a bare Date carries no horizon, so the proxy is all there is.
  if (birth instanceof Date) return isSectDiurnal(birth);

  const { dateTime, utcInstant, latitude, longitude } = birth;

  const hasPlace =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude);

  if (hasPlace && utcInstant) {
    const instant = new Date(utcInstant);
    if (!Number.isNaN(instant.getTime())) {
      return isDiurnalAt(instant, latitude, longitude);
    }
  }

  // The wall clock is not an instant, so use the clock proxy it was designed
  // for rather than computing an altitude for demonstrably the wrong moment.
  const wall = new Date(dateTime);
  return isSectDiurnal(Number.isNaN(wall.getTime()) ? undefined : wall);
}

/**
 * Get the element a planet expresses under a given sect.
 *
 * In traditional astrology, diurnal planets are at peak dignity by day,
 * nocturnal planets by night. Their element shifts accordingly.
 *
 * @param planet   - Planet name (e.g. "Saturn", "Venus")
 * @param diurnal  - true = Day sect, false = Night sect
 * @returns The active AlchemicalElement ("Fire" | "Water" | "Earth" | "Air")
 */
export function getPlanetarySectElement(
  planet: string,
  diurnal: boolean,
): AlchemicalElement {
  const entry = (PLANETARY_SECTARIAN_ELEMENTS as Record<
    string,
    { diurnal: AlchemicalElement; nocturnal: AlchemicalElement } | undefined
  >)[planet];
  if (!entry) return "Air"; // safe fallback
  return diurnal ? entry.diurnal : entry.nocturnal;
}

/**
 * Get the quality (modality) for a zodiac sign.
 *
 * @param sign - Zodiac sign name (any capitalisation)
 * @returns Cardinal, Fixed, or Mutable
 */
export function getZodiacQuality(sign: string): ZodiacQuality {
  const key = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  return ZODIAC_QUALITIES[key] ?? "Mutable";
}

/** A position accepted by the canonical ESMS engine. */
export interface AlchemicalPlanetPosition {
  sign: string;
  /** Degree within the occupied sign. */
  degree?: number;
  /** Absolute ecliptic longitude. Preferred for aspect derivation. */
  exactLongitude?: number;
  /** Geocentric distance in AU for Λ = M̂(r̄/r)². */
  distance?: number;
  /** Alias used by oscillator callers. */
  distanceAu?: number;
}

export type AlchemicalPlanetPositions = Record<
  string,
  string | AlchemicalPlanetPosition
>;

const ZODIAC_ORDER = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

/** The Ascendant and any unrecognised body carry no essential dignity. */
const NO_DIGNITY_FOLDS: DignityFoldSummary = {
  domicile: 0, exaltation: 0, triplicity: 0, term: 0, face: 0,
  detriment: 0, fall: 0, score: 0, multiplier: 1.0, resolution: "degree",
};

function isManifestBody(body: string): body is ManifestPlanet {
  return (MANIFEST_PLANETS as readonly string[]).includes(body);
}

/**
 * Absolute ecliptic longitude for dignity, or null when the position genuinely
 * does not carry one.
 *
 * Returning null — rather than 0 — is the whole point. `exactLongitude ??
 * degree ?? 0` would be wrong twice over: a real 0° Aries body short-circuits
 * the chain at a legitimate zero, and a sign-only body silently becomes 0°
 * Aries, inheriting Jupiter's term and Mars' face. Both failures are on record
 * in this codebase, so every branch below tests for a finite number explicitly.
 */
function resolveDignityLongitude(
  position: AlchemicalPlanetPosition,
  sign: string,
): number | null {
  if (typeof position.exactLongitude === "number" && Number.isFinite(position.exactLongitude)) {
    return position.exactLongitude;
  }
  const signIndex = ZODIAC_ORDER.indexOf(String(sign).toLowerCase());
  if (signIndex < 0) return null;
  if (typeof position.degree === "number" && Number.isFinite(position.degree)) {
    return signIndex * 30 + position.degree;
  }
  return null;
}

export interface AlchemicalCalculationOptions {
  /** Inject the historical Aries vessel when a legacy surface lacks an Ascendant. */
  injectAscendant?: boolean;
}

/** One body's Layer-1 × Layer-2 contribution to the ESMS totals. */
export interface EnhancedPlanetContribution {
  /** baseESMS(sect) × inertia × dignityMultiplier — this body's share. */
  esms: AlchemicalProperties;
  /** The sign fed in (as provided). */
  sign: string;
  /**
   * Λ inertia M̂(r̄/r)² (physical-mass scale; Ascendant pinned to 1.0).
   * @deprecated Historical field name retained for downstream display adapters.
   */
  alchmWeight: number;
  /**
   * Legacy 5-state dignity, degraded from {@link dignityFolds} by the historic
   * precedence chain (Domicile → Exaltation → Detriment → Fall → Neutral).
   * Retained unchanged so existing consumers cannot break; it can no longer
   * express everything the engine computes — read `dignityFolds` for that.
   */
  dignityType: DignityType;
  /**
   * Percentage form of the applied multiplier: (𝒟 − 1) × 100.
   * Consumers contract on this being a /100 percentage — agentMonica.ts:107 and
   * agentMonicaTwoBody.ts:665 compute `1 + dignityEsmsScale/100`, and
   * planetaryFBD.ts:741 renders it as "+10%".
   */
  dignityEsmsScale: number;
  /** The multiplier actually applied: 1 + esmsScale/100. */
  dignityMultiplier: number;
  /**
   * Full cumulative 5-fold dignity from the degree manifest — domicile,
   * exaltation, triplicity, term, face, detriment, fall — with the resolution
   * that produced it ('degree', or 'sign-mean' for legacy sign-only input).
   */
  dignityFolds: DignityFoldSummary;
  /** True for the Physical-Vessel Ascendant grounding constant. */
  isGroundingVessel: boolean;
}

export interface EnhancedAlchemicalDetail {
  /** Identical to what {@link calculateAlchemicalFromPlanets} returns. */
  totals: AlchemicalProperties;
  /** Per-body Layer 1×2 contributions. Guaranteed: Σ perPlanet + aspectModifications = totals. */
  perPlanet: Record<string, EnhancedPlanetContribution>;
  /** Layer-3 total (0 when no aspects were supplied). */
  aspectModifications: AlchemicalProperties;
  /** True when the grounding Ascendant was injected rather than supplied. */
  ascendantInjected: boolean;
}

const CANONICAL_ESMS_BODY_BY_LOWER = new Map<
  string,
  keyof typeof PLANETARY_SECTARIAN_ESMS
>(
  Object.keys(PLANETARY_SECTARIAN_ESMS).map((body) => [
    body.toLowerCase(),
    body as keyof typeof PLANETARY_SECTARIAN_ESMS,
  ]),
);

const IGNORED_ALCHEMICAL_BODY_KEYS = new Set([
  "midheaven",
  "truenode",
  "northnode",
  "southnode",
  "chiron",
  "lilith",
  "vertex",
  "parsfortune",
  "meannode",
  "mc",
]);

function canonicalESMSBodyName(
  body: string,
): keyof typeof PLANETARY_SECTARIAN_ESMS | undefined {
  return CANONICAL_ESMS_BODY_BY_LOWER.get(body.trim().toLowerCase());
}

function compactBodyKey(body: string): string {
  return body.replace(/\s+/g, "").toLowerCase();
}

/**
 * The canonical three-layer ESMS calculation, exposing its decomposition.
 * Rich positions derive aspects internally; sign-only legacy inputs still get
 * sect, dignity and the non-annihilating inertial mass scale.
 *   Σ perPlanet[*].esms + aspectModifications === totals
 */
export function calculateAlchemicalFromPlanetsDetailed(
  planetaryPositions: AlchemicalPlanetPositions,
  diurnal = true,
  options: AlchemicalCalculationOptions = {},
): EnhancedAlchemicalDetail {
  const totals: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };
  const perPlanet: Record<string, EnhancedPlanetContribution> = {};

  const canonicalPositions: AlchemicalPlanetPositions = {};
  for (const [rawBody, position] of Object.entries(planetaryPositions)) {
    const body = canonicalESMSBodyName(rawBody);
    if (body) {
      canonicalPositions[body] = position;
    } else if (!IGNORED_ALCHEMICAL_BODY_KEYS.has(compactBodyKey(rawBody))) {
      _logger.error(`Unknown planet in alchemical calculation: ${rawBody}`);
    }
  }

  const ascendantInjected = Boolean(
    options.injectAscendant && !canonicalPositions.Ascendant,
  );
  const positions: AlchemicalPlanetPositions = ascendantInjected
    ? { ...canonicalPositions, Ascendant: { sign: "aries", degree: 0 } }
    : canonicalPositions;

  for (const planet in positions) {
    const rawPosition = positions[planet];
    if (rawPosition === undefined) {
      _logger.error(`Planet has no position in alchemical calculation: ${planet}`);
      continue;
    }
    const position =
      typeof rawPosition === "string" ? { sign: rawPosition } : rawPosition;
    const { sign } = position;
    if (!sign) {
      _logger.error(`Planet has no sign in alchemical calculation: ${planet}`);
      continue;
    }

    const body = planet as keyof typeof PLANETARY_SECTARIAN_ESMS;
    const sectEntry = PLANETARY_SECTARIAN_ESMS[body];

    const baseESMS =
      body === "Ascendant"
        ? calculatePositionalAscendantVessel(sign, position.degree ?? 0)
        : diurnal
          ? sectEntry.diurnal
          : sectEntry.nocturnal;

    const distance = position.distance ?? position.distanceAu;
    const inertia = getGravitationalInertia(body, distance);

    let dignityFolds: DignityFoldSummary;
    if (!isManifestBody(body)) {
      dignityFolds = NO_DIGNITY_FOLDS;
    } else {
      const longitude = resolveDignityLongitude(position, sign);
      dignityFolds =
        longitude !== null
          ? dignityFoldsAtLongitude(body, longitude, diurnal ? "diurnal" : "nocturnal")
          : dignityFoldsForSign(body, sign, diurnal ? "diurnal" : "nocturnal");
    }

    const dignityMultiplier = dignityFolds.multiplier;

    const contribution: AlchemicalProperties = {
      Spirit: baseESMS.Spirit * inertia * dignityMultiplier,
      Essence: baseESMS.Essence * inertia * dignityMultiplier,
      Matter: baseESMS.Matter * inertia * dignityMultiplier,
      Substance: baseESMS.Substance * inertia * dignityMultiplier,
    };

    totals.Spirit += contribution.Spirit;
    totals.Essence += contribution.Essence;
    totals.Matter += contribution.Matter;
    totals.Substance += contribution.Substance;

    perPlanet[body] = {
      esms: contribution,
      sign,
      alchmWeight: inertia,
      dignityType: toLegacyDignityType(dignityFolds),
      dignityEsmsScale: toLegacyEsmsScale(dignityFolds.score),
      dignityMultiplier,
      dignityFolds,
      isGroundingVessel: body === "Ascendant",
    };
  }

  const aspectModifications: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };
  const aspectPositions: Record<string, AlchemicalPlanetPosition> = {};
  for (const [key, pos] of Object.entries(canonicalPositions)) {
    if (typeof pos === "object") {
      aspectPositions[key] = pos;
    }
  }
  const aspects = buildAspectsWithStrength(aspectPositions);
  if (aspects.length > 0) {
    const aspectMods = calculateAspectESMSModifications(aspects);

    aspectModifications.Spirit = aspectMods.Spirit;
    aspectModifications.Essence = aspectMods.Essence;
    aspectModifications.Matter = aspectMods.Matter;
    aspectModifications.Substance = aspectMods.Substance;

    totals.Spirit += aspectMods.Spirit;
    totals.Essence += aspectMods.Essence;
    totals.Matter += aspectMods.Matter;
    totals.Substance += aspectMods.Substance;
  }

  return {
    totals,
    perPlanet,
    aspectModifications,
    ascendantInjected,
  };
}

/**
 * The one authoritative ESMS engine for natal charts and live skies.
 * Aspects are derived from rich positions; sign-only inputs remain supported
 * for stored legacy charts but cannot fabricate geometry they do not carry.
 */
export function calculateAlchemicalFromPlanets(
  planetaryPositions: AlchemicalPlanetPositions,
  diurnal = true,
): AlchemicalProperties {
  return calculateAlchemicalFromPlanetsDetailed(planetaryPositions, diurnal)
    .totals;
}

/**
 * Aggregate Elemental Properties from Zodiac Sign Positions
 *
 * Each planet's zodiac sign contributes its element to the total.
 * Results are normalized to sum to 1.0.
 *
 * @param planetaryPositions - Map of planet names to zodiac sign positions
 * @returns Normalized elemental properties (Fire, Water, Earth, Air)
 *
 * @example
 * const positions = { Sun: 'Gemini', Moon: 'Leo', Mercury: 'Taurus' };
 * const elementals = aggregateZodiacElementals(positions);
 * // Result: { Fire: 0.33, Water: 0, Earth: 0.33, Air: 0.33 }
 */
export function aggregateZodiacElementals(planetaryPositions: {
  [planet: string]: string;
}): ElementalProperties {
  const totals: Record<AlchemicalElement, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  let count = 0;

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet];
    const element =
      sign === undefined
        ? undefined
        : (ZODIAC_ELEMENTS as Record<string, AlchemicalElement | undefined>)[sign];

    if (!element) {
      _logger.error(`Unknown zodiac sign in elemental aggregation: ${sign}`);
      continue;
    }

    const w = inertialMassWeight(planet);
    totals[element] += w;
    count += w;
  }

  if (count === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: totals.Fire / count,
    Water: totals.Water / count,
    Earth: totals.Earth / count,
    Air: totals.Air / count,
  };
}

/**
 * Enhanced Aggregate Elemental Properties from Zodiac Sign Positions
 * Includes sectarian shifts in the calculation:
 * Elemental mix = 60% sign element + 40% sect element
 */
export function aggregateEnhancedZodiacElementals(
  planetaryPositions: Record<string, string>,
  isDiurnal = true
): ElementalProperties {
  const totals: Record<AlchemicalElement, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  let count = 0;

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet] ?? "";
    const signElement = (ZODIAC_ELEMENTS as Record<string, AlchemicalElement | undefined>)[sign];

    const sectInfo = (PLANETARY_SECTARIAN_ELEMENTS as Record<
      string,
      { diurnal: AlchemicalElement; nocturnal: AlchemicalElement } | undefined
    >)[planet];
    let sectElement = signElement;
    if (sectInfo) {
      sectElement = isDiurnal ? sectInfo.diurnal : sectInfo.nocturnal;
    }

    if (!signElement || !sectElement) {
      continue;
    }

    const w = inertialMassWeight(planet);

    totals[signElement] += w * 0.6;
    totals[sectElement] += w * 0.4;
    count += w;
  }

  if (count === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: totals.Fire / count,
    Water: totals.Water / count,
    Earth: totals.Earth / count,
    Air: totals.Air / count,
  };
}

/**
 * Get the dominant alchemical property
 *
 * @param alchemical - Alchemical properties
 * @returns The name of the dominant property
 */
export function getDominantAlchemicalProperty(
  alchemical: AlchemicalProperties,
): keyof AlchemicalProperties {
  const entries = Object.entries(alchemical) as Array<
    [keyof AlchemicalProperties, number]
  >;
  entries.sort((a, b) => b[1] - a[1]);
  const [dominant] = entries;
  if (!dominant) {
    throw new Error("getDominantAlchemicalProperty: no alchemical properties supplied");
  }
  return dominant[0];
}

/**
 * Get the dominant element from elemental properties
 *
 * @param elemental - Elemental properties
 * @returns The name of the dominant element
 */
export function getDominantElement(
  elemental: ElementalProperties,
): keyof ElementalProperties {
  const entries = Object.entries(elemental) as Array<
    [keyof ElementalProperties, number]
  >;
  entries.sort((a, b) => b[1] - a[1]);
  const [dominant] = entries;
  if (!dominant) {
    throw new Error("getDominantElement: no elemental properties supplied");
  }
  return dominant[0];
}

/**
 * Get the full contribution profile for a single planet at a given moment.
 *
 * Returns:
 *   - ESMS values (from PLANETARY_ALCHEMY — the authoritative source)
 *   - The sect element the planet expresses under the current sect
 *   - The sign element (derived from the zodiac sign, if provided)
 *
 * This is the convenience function the UI should call for each planet card.
 *
 * @param planet   - Planet name (capitalised: "Sun", "Moon", etc.)
 * @param diurnal  - true if the current sect is diurnal (day)
 * @param sign     - Optional zodiac sign the planet occupies (for sign element)
 */
export function getCurrentPlanetaryContribution(
  planet: string,
  diurnal: boolean,
  sign?: string,
): {
  esms: AlchemicalProperties;
  sectElement: AlchemicalElement;
  signElement: AlchemicalElement | null;
} {
  const entry = (PLANETARY_SECTARIAN_ALCHEMICAL as Record<
    string,
    { diurnal: AlchemicalProperties; nocturnal: AlchemicalProperties } | undefined
  >)[planet];
  const legacyAlchemy = (PLANETARY_ALCHEMY as Record<
    string,
    AlchemicalProperties | undefined
  >)[planet];
  const resolvedAlchemy = entry ? (diurnal ? entry.diurnal : entry.nocturnal) : legacyAlchemy;

  const esms: AlchemicalProperties = resolvedAlchemy
    ? { Spirit: resolvedAlchemy.Spirit, Essence: resolvedAlchemy.Essence, Matter: resolvedAlchemy.Matter, Substance: resolvedAlchemy.Substance }
    : { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

  const sectElement = getPlanetarySectElement(planet, diurnal);

  let signElement: AlchemicalElement | null = null;
  if (sign) {
    const normalised = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
    signElement = (ZODIAC_ELEMENTS as Record<string, AlchemicalElement | undefined>)[normalised] ?? null;
  }

  return { esms, sectElement, signElement };
}

/**
 * Validate planetary positions object
 *
 * @param positions - Object to validate
 * @returns True if valid, false otherwise
 */
export function validatePlanetaryPositions(
  positions: unknown,
): positions is { [planet: string]: string } {
  if (typeof positions !== "object" || positions === null) {
    return false;
  }

  const posObj = positions as { [key: string]: unknown };

  // Check that all values are strings
  for (const key in posObj) {
    if (typeof posObj[key] !== "string") {
      return false;
    }
  }

  return true;
}
