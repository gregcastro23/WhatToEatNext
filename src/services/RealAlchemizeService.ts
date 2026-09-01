import fs from "fs";
import {
  calculateKalchm,
  calculateMonica,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";
import { _logger } from "@/lib/logger";
import type { ElementalProperties } from "@/types/celestial";
import { type DegradedInfo, mergeDegraded } from "@/types/degraded";
import { signDegreeToLongitude } from "@/utils/aspectCalculator";
import {
  getAccuratePlanetaryPositionsWithMeta,
  isCurrentSkyDiurnal,
} from "@/utils/astrology/positions";
import {
  getPlanetarySectElement,
  calculateAlchemicalFromPlanetsDetailed,
  inertialMassWeight,
  type AlchemicalPlanetPositions,
} from "@/utils/planetaryAlchemyMapping";

// Zodiac modality lookup + dominant-modality tally, computed from the live
// planetary positions instead of a hardcoded "Cardinal".
const SIGN_MODALITY: Record<string, "Cardinal" | "Fixed" | "Mutable"> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable",
};

function computeDominantModality(
  positions: Record<string, { sign?: string }>,
): "Cardinal" | "Fixed" | "Mutable" {
  const tally: Record<"Cardinal" | "Fixed" | "Mutable", number> = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };
  for (const pos of Object.values(positions)) {
    const signKey = (pos.sign ?? "").toLowerCase();
    const modality = SIGN_MODALITY[signKey];
    if (modality) {
      tally[modality] += 1;
    }
  }
  const [top] = (
    Object.entries(tally) as Array<["Cardinal" | "Fixed" | "Mutable", number]>
  ).sort((a, b) => b[1] - a[1]);
  if (!top) return "Cardinal";
  return top[1] > 0 ? top[0] : "Cardinal";
}

// REMOVED (ADR-009 decision 5): this module's PRIVATE copy of
// PLANET_ALCHM_PERIODS / PERIOD_LOG_MIN / PERIOD_LOG_MAX / normalizeAlchmWeight.
//
// It was a byte-identical duplicate of the table in src/data/planets.ts, and a
// duplicate is how the two runtimes drifted apart in the first place (PR #697
// deleted the Python table from backend/utils/ and left main.py's private copy
// running for a month — see ADR-009 decision 4).
//
// Its only consumer here was the momentum weight. ESMS and the elementals never
// used it: ESMS comes from `engine.totals` (the canonical inertial-mass engine)
// and the elementals from the flat SIGN_WEIGHT/SECT_WEIGHT split. So retiring it
// moves `planetaryMomentum` and nothing else — momentum is a display quantity
// (two API responses and the /quantities tide readout), never persisted.
//
// Momentum now uses `inertialMassWeight`, the one scale. The Ascendant special
// case went with it: inertialMassWeight applies the RULED vessel weight 1.0
// itself, so the local `=== "Ascendant" ? 1.0 :` conditional is redundant.

/**
 * Bodies excluded from the ESMS aspect universe — not real planets, so they
 * carry no planetaryAlchemy/dignity entry and must not seed Layer-3 aspects.
 *
 * Matched case- and whitespace-insensitively. The Swiss-Ephemeris backend and
 * the static backup use slightly different casing/spacing for node and angle
 * names, so we strip both before matching.
 */
const EXCLUDED_ASPECT_BODIES = new Set<string>([
  "northnode",
  "southnode",
  "truenode",
  "meannode",
  "chiron",
  "lilith",
  "vertex",
  "parsfortune",
  "mc",
]);

function isExcludedAspectBody(planet: string): boolean {
  return EXCLUDED_ASPECT_BODIES.has(planet.toLowerCase().replace(/\s+/g, ""));
}

/**
 * Real Alchemize Service
 *
 * This service provides real alchemical calculations based on actual planetary positions.
 * It uses the proven standalone alchemize function that produces meaningful, nonzero results.
 *
 * Sectarian Logic (January 2026):
 * The elemental totals are now a blend of:
 *   60% — the element of the zodiac sign the planet occupies (traditional)
 *   40% — the planet's own sectarian element (diurnal or nocturnal)
 * This means the elemental profile of the sky shifts at every sunrise and sunset,
 * making the quantities truly dynamic.
 */
// Types
export interface PlanetaryPosition {
  sign: string;
  degree: number;
  minute: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  distance?: number;
}
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
}
export interface StandardizedAlchemicalResult {
  elementalProperties: ElementalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  planetaryMomentum: Record<string, number>;
  kalchm: number;
  monica: number;
  score: number;
  normalized: boolean;
  confidence: number;
  metadata: {
    source: string;
    dominantElement: string;
    dominantModality: string;
    sunSign: string;
    chartRuler: string;
    isDiurnal: boolean;
  };
  /**
   * Non-null when this result was produced under degraded conditions:
   *   - "stale-positions": static fallback positions were used instead of live ephemeris
   *   - "monica-degenerate": ln(kalchm) ≈ 0, so monica collapsed to the φ fallback
   *   - "single-point-gradient": gradient calculated from only 1 moment
   */
  degraded?: DegradedInfo;
}

function toCanonicalESMSPositions(
  planetaryPositions: Record<string, PlanetaryPosition>,
): AlchemicalPlanetPositions {
  const positions: AlchemicalPlanetPositions = {};
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    if (isExcludedAspectBody(planet)) continue;
    const sign = String(position.sign);
    positions[planet] = {
      sign,
      degree: position.degree,
      exactLongitude:
        position.exactLongitude ??
        signDegreeToLongitude(sign, position.degree, position.minute) ??
        undefined,
      distance: position.distance,
    };
  }
  return positions;
}

const VALID_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type ZodiacSign = (typeof VALID_SIGNS)[number];

// Utility functions
function normalizeSign(sign: string): ZodiacSign {
  const normalized = sign.toLowerCase() as ZodiacSign;
  if (VALID_SIGNS.includes(normalized)) {
    return normalized;
  }
  throw new Error(`Invalid zodiac sign: ${sign}`);
}
function getZodiacElement(sign: string): string {
  const elementMap: Record<string, string> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };
  return elementMap[sign.toLowerCase()] || "Air";
}
/**
 * Core alchemize function that calculates alchemical properties from planetary positions
 * This is the proven implementation that produces meaningful, nonzero results
 *
 * @param planetaryPositions - CURRENT planetary positions
 * @param historicalPositions - PREVIOUS planetary positions (for momentum calculation)
 * @param date - The moment being calculated
 * @param options.diurnal - Override the computed sect. Sect is otherwise derived
 *   from `date` at the site's NEW YORK reference observer, which is right for
 *   the live sky and WRONG for a natal chart: a birth chart's sect belongs to
 *   the birth moment at the BIRTHPLACE. Natal callers should compute it with
 *   `isDiurnalAt(birthMoment, lat, lon)` and pass it here.
 */
export function alchemize(
  planetaryPositions: Record<string, PlanetaryPosition>,
  historicalPositions: Record<string, PlanetaryPosition> | null = null,
  date: Date = new Date(),
  options: { incomingDegraded?: DegradedInfo | null; diurnal?: boolean } = {},
): StandardizedAlchemicalResult {
  // Initialize totals
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };
  // Determine sect (diurnal / nocturnal) for the moment being calculated.
  // Using the provided `date` parameter ensures historical/forecast
  // calculations use the correct sect for that point in time.
  //
  // `options.diurnal` overrides it entirely. Required for NATAL charts: the
  // default resolves sect at the site's New York reference observer, so a
  // birth chart would otherwise inherit the sect of whoever's sky it was
  // computed under rather than its own. See the @param note above.
  const diurnal = options.diurnal ?? isCurrentSkyDiurnal(date);
  const engine = calculateAlchemicalFromPlanetsDetailed(
    toCanonicalESMSPositions(planetaryPositions),
    diurnal,
  );
  const canonicalBodyByLower = new Map(
    Object.keys(engine.perPlanet).map((planet) => [planet.toLowerCase(), planet]),
  );

  // Momentum Tracking
  const planetaryMomentum: Record<string, number> = {};
  // Elemental blending weights:
  //   60% from the planet's zodiac sign (WHERE it is — the medium)
  //   40% from the planet's sectarian element (WHAT it is — its nature)
  const SIGN_WEIGHT = 0.6;
  const SECT_WEIGHT = 0.4;
  // Process each planet
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Non-planets (nodes, MC, Chiron, Lilith, Vertex, Pars Fortune) contribute
    // nothing here either — same rule as the aspect pass below.
    //
    // Without this gate they still reached the elemental blend: 60% from
    // getZodiacElement(sign), which is real, plus 40% from
    // getPlanetarySectElement(), which silently returns "Air" for any body it
    // does not know. A live sky carrying MC and both nodes therefore had three
    // phantom bodies each pushing 0.4 of pure Air into the totals, skewing
    // elementalProperties and everything derived from it (thermodynamics,
    // monica). Their momentum was fabricated too: the weight lookup falls back
    // to Pluto's period under the old scale (and to Earth's mass under the
    // inertial one that replaced it — the fabrication survives the migration,
    // only its magnitude changes), so MC was handed a mass it has no basis for.
    // This gate, not the fallback, is what keeps them out.
    if (isExcludedAspectBody(planet)) {
      continue;
    }
    const canonicalPlanet = canonicalBodyByLower.get(planet.toLowerCase());
    if (!canonicalPlanet) continue;
    // ONE scale (ADR-009 decision 5): momentum shares the inertial-mass weight
    // with ESMS, which `engine.totals` already computes below.
    const alchmWeight = inertialMassWeight(canonicalPlanet);
    // Elemental contribution — blend of zodiac sign element and sectarian element.
    // Sign element: the element of the sign the planet currently occupies.
    const signElement = getZodiacElement(position.sign);
    // Sectarian element: the planet's own elemental nature under the current sect.
    const sectElement = getPlanetarySectElement(canonicalPlanet, diurnal);
    // Apply both weights (total weight per planet remains 1.0)
    const addElement = (el: string, weight: number): void => {
      if (el === "Fire") totals.Fire += weight;
      else if (el === "Water") totals.Water += weight;
      else if (el === "Air") totals.Air += weight;
      else if (el === "Earth") totals.Earth += weight;
    };
    addElement(signElement, SIGN_WEIGHT);
    addElement(sectElement, SECT_WEIGHT);

    // Momentum Calculation: (Current Longitude - Historical Longitude) * Mass
    // Using decimalDegrees for arc-minute precise difference.
    if (historicalPositions?.[planet]) {
      const histPos = historicalPositions[planet];
      // Note: handles 12*60=720 arc-minute / 360 degree wrap implicitly
      // as DecimalDegrees are typically 0-360.
      let delta = (position.exactLongitude ?? (position.degree + position.minute/60)) -
                  (histPos.exactLongitude ?? (histPos.degree + histPos.minute/60));

      // Handle the 360 -> 0 wrap
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // Momentum = Velocity (delta) * Alchemical Mass (alchmWeight)
      planetaryMomentum[planet] = delta * alchmWeight;
    } else {
      planetaryMomentum[planet] = 0;
    }
  }

  totals.Spirit = engine.totals.Spirit;
  totals.Essence = engine.totals.Essence;
  totals.Matter = engine.totals.Matter;
  totals.Substance = engine.totals.Substance;

  // Calculate thermodynamic metrics using the exact formulas
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } =
    totals;
  // Heat
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(
    Substance + Essence + Matter + Water + Air + Earth,
    2,
  );
  const heat = heatNum / Math.max(heatDen, 0.01); // canonical floor (§17c)
  // Entropy
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / Math.max(entropyDen, 0.01);
  // Reactivity — CANONICAL form (§17c): reactivityNum / (Matter + Earth)².
  //
  // This previously used the divergent `(Σ / Matter) + Earth²` form, which read
  // 9.09 on the shared probe against the canonical 2.05 and grew without bound as
  // Earth rose (Earth had moved from the denominator to an additive term). The
  // (Matter + Earth)² denominator keeps Earth grounding reactivity, matches every
  // other live engine, and the 0.01 floor preserves the non-zero baseline the old
  // comment relied on the Ascendant's Matter for. See SYNTHESIS_MODEL.md §14a.
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivity =
    reactivityNum / Math.max(Math.pow(Matter + Earth, 2), 0.01);
  // Greg's Energy;
  const gregsEnergy = heat - entropy * reactivity;
  // Kalchm (K_alchm) via THE canonical engine. This is the production ESMS
  // path, so it is the copy whose values reach agent monica and the API payload.
  //
  // The local clamp it replaces used 1e-9 rather than 0. The intent — stop a
  // negative base (reachable after aspect modifications subtract below 0) from
  // making Math.pow return NaN — was right, but clamping to 1e-9 instead of 0
  // is a floor, and a floor at eps inflates kalchm by exactly eps^(-eps) − 1
  // per zeroed axis. Canonical clamps negatives to 0 and leaves a genuine zero
  // alone, because 0**0 is exactly 1 — the true limit of x^x — so the accurate
  // value needs no epsilon at all.
  const kalchm = calculateKalchm({ Spirit, Essence, Matter, Substance });
  // Monica constant: −GregsEnergy / (Reactivity × ln(Kalchm))
  // Guards: kalchm must be > 0; lnK must be non-zero; reactivity must be non-zero
  // Monica via the canonical engine (§17c): always finite, and returns φ at the
  // equilibrium point (kalchm ≈ 1) instead of the old 1.0 placeholder. The
  // degraded flag still fires when the value is that fallback rather than a real
  // deviation, so consumers can still distinguish a degenerate monica.
  const monica = calculateMonica(gregsEnergy, reactivity, kalchm);
  const lnK = kalchm > 0 && Number.isFinite(kalchm) ? Math.log(kalchm) : 0;
  const monicaDegenerate = !(
    Math.abs(lnK) >= MONICA_LN_EPSILON && reactivity !== 0
  );
  // A degraded result is surfaced when the inbound positions were not live
  // (passed via options.incomingDegraded) or monica never escaped its default.
  const degraded = mergeDegraded(
    options.incomingDegraded,
    monicaDegenerate ? { reasons: ["monica-degenerate"] } : null,
  );
  // Calculate dominant element
  const elements = { Fire, Water, Air, Earth };
  const sortedElements = Object.entries(elements).sort(
    (a, b) => b[1] - a[1],
  );
  const [firstElementEntry] = sortedElements;
  const dominantElement = firstElementEntry ? firstElementEntry[0] : "Fire";
  // Calculate score based on total energy
  const score = Math.min(
    1.0,
    Math.max(
      0.0,
      (Spirit + Essence + Matter + Substance + Fire + Water + Air + Earth) / 20,
    ),
  );
  const sunPos = planetaryPositions["Sun"] as PlanetaryPosition | undefined;
  return {
    elementalProperties: {
      Fire: Fire / Math.max(1, Fire + Water + Air + Earth),
      Water: Water / Math.max(1, Fire + Water + Air + Earth),
      Earth: Earth / Math.max(1, Fire + Water + Air + Earth),
      Air: Air / Math.max(1, Fire + Water + Air + Earth),
    },
    thermodynamicProperties: {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
    },
    esms: { Spirit, Essence, Matter, Substance },
    planetaryMomentum,
    kalchm,
    monica,
    score,
    normalized: true,
    confidence: 0.8,
    metadata: {
      source: "alchemize",
      dominantElement,
      dominantModality: computeDominantModality(planetaryPositions),
      sunSign: sunPos?.sign ?? "",
      chartRuler: getZodiacElement(sunPos?.sign ?? "aries"),
      isDiurnal: diurnal,
    },
    ...(degraded ? { degraded } : {}),
  };
}
/**
 * Per-planet contribution to the alchemize totals at a single moment.
 * - `esms`     : canonical Layer-1 × Layer-2 ESMS contribution
 *                (sect × inertial Λ × dignityMultiplier).
 * - `elements` : Fire/Water/Earth/Air contributed (sign-element × 0.6 + sect-element × 0.4).
 * - `signElement` / `sectElement` : the two elemental sources that blended.
 * - `alchmWeight` / `dignityMultiplier` : the scalars applied this moment.
 */
export interface PerPlanetBreakdown {
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  elements: { Fire: number; Water: number; Earth: number; Air: number };
  sign: string;
  signElement: string;
  sectElement: string;
  alchmWeight: number;
  dignityMultiplier: number;
}

export type DetailedAlchemicalResult = StandardizedAlchemicalResult & {
  /** Each contributing planet's decomposition. Keyed by planet name. */
  perPlanet: Record<string, PerPlanetBreakdown>;
  /** Layer-3 field; perPlanet ESMS plus this vector equals the returned ESMS. */
  aspectModifications: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
};

/**
 * Same calculation as {@link alchemize}, but additionally returns the
 * per-planet contribution to ESMS and to each element. Used by the
 * pre-computation pipeline and the statistics layer.
 *
 * Both this function and {@link alchemize} delegate ESMS to the same canonical
 * engine; this variant additionally exposes that engine's exact decomposition.
 */
export function alchemizeDetailed(
  planetaryPositions: Record<string, PlanetaryPosition>,
  historicalPositions: Record<string, PlanetaryPosition> | null = null,
  date: Date = new Date(),
  options: { incomingDegraded?: DegradedInfo | null } = {},
): DetailedAlchemicalResult {
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };
  const diurnal = isCurrentSkyDiurnal(date);
  const engine = calculateAlchemicalFromPlanetsDetailed(
    toCanonicalESMSPositions(planetaryPositions),
    diurnal,
  );
  const enginePerPlanetByLower = new Map(
    Object.entries(engine.perPlanet).map(([planet, contribution]) => [
      planet.toLowerCase(),
      { planet, contribution },
    ]),
  );
  const planetaryMomentum: Record<string, number> = {};
  const perPlanet: Record<string, PerPlanetBreakdown> = {};
  const SIGN_WEIGHT = 0.6;
  const SECT_WEIGHT = 0.4;

  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Same exclusion as alchemize() above and the aspect pass below — see the
    // comment there. Additionally keeps non-planets out of `perPlanet`, whose
    // consumers reasonably assume its keys are real planets (an MC entry
    // carried populated `elements` beside all-zero `esms`).
    if (isExcludedAspectBody(planet)) {
      continue;
    }
    const engineEntry = enginePerPlanetByLower.get(planet.toLowerCase());
    if (!engineEntry) continue;
    const { planet: canonicalPlanet, contribution } = engineEntry;
    // ONE scale (ADR-009 decision 5) — same weight the engine used for ESMS.
    const momentumWeight = inertialMassWeight(canonicalPlanet);

    const signElement = getZodiacElement(position.sign);
    const sectElement = getPlanetarySectElement(canonicalPlanet, diurnal);
    const planetElements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const addElement = (el: string, weight: number): void => {
      if (el === "Fire") {
        totals.Fire += weight;
        planetElements.Fire += weight;
      } else if (el === "Water") {
        totals.Water += weight;
        planetElements.Water += weight;
      } else if (el === "Air") {
        totals.Air += weight;
        planetElements.Air += weight;
      } else if (el === "Earth") {
        totals.Earth += weight;
        planetElements.Earth += weight;
      }
    };
    addElement(signElement, SIGN_WEIGHT);
    addElement(sectElement, SECT_WEIGHT);

    // Momentum Calculation: (Current Longitude - Historical Longitude) * Mass
    // Using decimalDegrees for arc-minute precise difference.
    if (historicalPositions?.[planet]) {
      const histPos = historicalPositions[planet];
      let delta =
        (position.exactLongitude ?? (position.degree + position.minute / 60)) -
        (histPos.exactLongitude ?? (histPos.degree + histPos.minute / 60));
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      planetaryMomentum[planet] = delta * momentumWeight;
    } else {
      planetaryMomentum[planet] = 0;
    }

    perPlanet[canonicalPlanet] = {
      esms: contribution.esms,
      elements: planetElements,
      sign: String(position.sign).toLowerCase(),
      signElement,
      sectElement,
      alchmWeight: contribution.alchmWeight,
      dignityMultiplier: contribution.dignityMultiplier,
    };
  }

  totals.Spirit = engine.totals.Spirit;
  totals.Essence = engine.totals.Essence;
  totals.Matter = engine.totals.Matter;
  totals.Substance = engine.totals.Substance;

  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } = totals;
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  const heat = heatNum / Math.max(heatDen, 0.01);
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / Math.max(entropyDen, 0.01);
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  // Canonical (Matter + Earth)² form — see §14a.
  const reactivity =
    reactivityNum / Math.max(Math.pow(Matter + Earth, 2), 0.01);
  const gregsEnergy = heat - entropy * reactivity;
  // Kalchm via THE canonical engine (first of the two sites in this file).
  const kalchm = calculateKalchm({ Spirit, Essence, Matter, Substance });
  // Monica via the canonical engine (§17c): always finite, and returns φ at the
  // equilibrium point (kalchm ≈ 1) instead of the old 1.0 placeholder. The
  // degraded flag still fires when the value is that fallback rather than a real
  // deviation, so consumers can still distinguish a degenerate monica.
  const monica = calculateMonica(gregsEnergy, reactivity, kalchm);
  const lnK = kalchm > 0 && Number.isFinite(kalchm) ? Math.log(kalchm) : 0;
  const monicaDegenerate = !(
    Math.abs(lnK) >= MONICA_LN_EPSILON && reactivity !== 0
  );
  const degraded = mergeDegraded(
    options.incomingDegraded,
    monicaDegenerate ? { reasons: ["monica-degenerate"] } : null,
  );

  const elements = { Fire, Water, Air, Earth };
  const sortedElements = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  const [firstElementEntry] = sortedElements;
  const dominantElement = firstElementEntry ? firstElementEntry[0] : "Fire";
  const score = Math.min(
    1.0,
    Math.max(0.0, (Spirit + Essence + Matter + Substance + Fire + Water + Air + Earth) / 20),
  );
  const elementalSum = Math.max(1, Fire + Water + Air + Earth);

  const sunPos = planetaryPositions["Sun"] as PlanetaryPosition | undefined;
  return {
    elementalProperties: {
      Fire: Fire / elementalSum,
      Water: Water / elementalSum,
      Earth: Earth / elementalSum,
      Air: Air / elementalSum,
    },
    thermodynamicProperties: { heat, entropy, reactivity, gregsEnergy },
    esms: { Spirit, Essence, Matter, Substance },
    planetaryMomentum,
    kalchm,
    monica,
    score,
    normalized: true,
    confidence: 0.8,
    metadata: {
      source: "alchemizeDetailed",
      dominantElement,
      dominantModality: computeDominantModality(planetaryPositions),
      sunSign: sunPos?.sign ?? "",
      chartRuler: getZodiacElement(sunPos?.sign ?? "aries"),
      isDiurnal: diurnal,
    },
    perPlanet,
    aspectModifications: engine.aspectModifications,
    ...(degraded ? { degraded } : {}),
  };
}

/**
 * Load planetary positions from the extracted data file, reporting whether the
 * result is degraded (interpolated / static fallback rather than live data).
 */
export function loadPlanetaryPositionsWithMeta(): {
  positions: Record<string, PlanetaryPosition>;
  degraded: DegradedInfo | null;
} {
  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // In browser, use the frozen static snapshot — not live, so degraded.
      return {
        positions: getFallbackPlanetaryPositions(),
        degraded: { reasons: ["stale-positions"] },
      };
    }
    // In Node.js environment, try to read the file
    const rawData = fs.readFileSync(
      "extracted-planetary-positions.json",
      "utf8",
    );
    const parsed = JSON.parse(rawData) as unknown;
    const positions =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, Record<string, unknown>>)
        : {};
    // Convert to the format expected by alchemize
    const convertedPositions: Record<string, PlanetaryPosition> = {};
    for (const [planetName, planetData] of Object.entries(positions)) {
      if (typeof planetData === "object") {
        convertedPositions[planetName] = {
          sign: normalizeSign(String(planetData.sign ?? "")),
          degree: Number(planetData.degree) || 0,
          minute: Number(planetData.minute) || 0,
          isRetrograde: Boolean(planetData.isRetrograde),
        };
      }
    }
    return { positions: convertedPositions, degraded: null };
  } catch (error) {
    _logger.warn(
      "Error loading planetary positions from file, using dynamic Swiss/Astronomy-Engine positions: ",
      error,
    );
    try {
      const { positions: accurate, degraded } =
        getAccuratePlanetaryPositionsWithMeta(new Date());
      const convertedPositions: Record<string, PlanetaryPosition> = {};
      for (const [planetName, planetData] of Object.entries(accurate)) {
        convertedPositions[planetName] = {
          sign: normalizeSign(String(planetData.sign)),
          degree: Math.floor(planetData.degree),
          minute: Math.floor((planetData.degree - Math.floor(planetData.degree)) * 60),
          isRetrograde: planetData.isRetrograde,
          exactLongitude: planetData.exactLongitude,
        };
      }
      return { positions: convertedPositions, degraded };
    } catch (calcError) {
      _logger.error("Failed to dynamically compute fallback planetary positions, reverting to static backup:", calcError);
      return {
        positions: getFallbackPlanetaryPositions(),
        degraded: { reasons: ["stale-positions"] },
      };
    }
  }
}

/**
 * Load planetary positions from the extracted data file.
 *
 * Thin wrapper over {@link loadPlanetaryPositionsWithMeta} that drops the
 * degraded signal, preserving the original signature.
 */
export function loadPlanetaryPositions(): Record<string, PlanetaryPosition> {
  return loadPlanetaryPositionsWithMeta().positions;
}
/**
 * Get fallback planetary positions for when file loading fails
 */
function getFallbackPlanetaryPositions(): Record<string, PlanetaryPosition> {
  // Current planetary positions as of July 2025
  return {
    Sun: { sign: "cancer", degree: 15, minute: 30, isRetrograde: false },
    Moon: { sign: "virgo", degree: 8, minute: 45, isRetrograde: false },
    Mercury: { sign: "gemini", degree: 22, minute: 10, isRetrograde: false },
    Venus: { sign: "leo", degree: 3, minute: 20, isRetrograde: false },
    Mars: { sign: "taurus", degree: 18, minute: 55, isRetrograde: false },
    Jupiter: { sign: "gemini", degree: 12, minute: 40, isRetrograde: false },
    Saturn: { sign: "pisces", degree: 7, minute: 15, isRetrograde: false },
    Uranus: { sign: "taurus", degree: 25, minute: 30, isRetrograde: false },
    Neptune: { sign: "aries", degree: 29, minute: 45, isRetrograde: false },
    Pluto: { sign: "aquarius", degree: 1, minute: 20, isRetrograde: false },
  };
}
/**
 * Get current alchemical state based on real planetary positions
 */
export function getCurrentAlchemicalState(): StandardizedAlchemicalResult {
  const { positions, degraded } = loadPlanetaryPositionsWithMeta();
  return alchemize(positions, null, new Date(), { incomingDegraded: degraded });
}
/**
 * Calculate alchemical properties for a specific set of planetary positions
 */
export function calculateAlchemicalProperties(
  positions: Record<string, PlanetaryPosition>,
  historicalPositions: Record<string, PlanetaryPosition> | null = null,
): StandardizedAlchemicalResult {
  return alchemize(positions, historicalPositions);
}

/**
 * Real alchemical signature for a planetary alignment, computed by the
 * canonical {@link alchemize} engine.
 *
 * The recommendation layer historically carried positions as `{ sign, degree }`
 * and could only map them to elemental properties — which cannot yield kalchm or
 * monica, since those require the Spirit/Essence/Matter/Substance axes. This
 * adapts those positions onto the canonical engine so callers get REAL ESMS,
 * kalchm, monica, thermodynamics, and the engine's own sect-aware elemental
 * profile from a single, internally-consistent computation.
 *
 * `degree`/`minute` are optional: they only feed inter-moment momentum, which is
 * not computed here (no historical positions passed), so the sign alone drives
 * the result. Inherits all of {@link alchemize}'s guards (epsilon-clamped kalchm,
 * degenerate-monica detection, degraded flag).
 */
export interface PlanetaryAlignmentAlchemy {
  elementalProperties: ElementalProperties;
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  kalchm: number;
  monica: number;
  thermodynamics: ThermodynamicProperties;
  degraded?: DegradedInfo;
}

export function planetaryAlignmentAlchemy(
  positions: Record<string, { sign: string; degree?: number; minute?: number }>,
  date: Date = new Date(),
): PlanetaryAlignmentAlchemy {
  const full: Record<string, PlanetaryPosition> = {};
  for (const [planet, p] of Object.entries(positions)) {
    full[planet] = { sign: p.sign, degree: p.degree ?? 0, minute: p.minute ?? 0 };
  }
  const result = alchemize(full, null, date);
  return {
    elementalProperties: result.elementalProperties,
    esms: result.esms,
    kalchm: result.kalchm,
    monica: result.monica,
    thermodynamics: result.thermodynamicProperties,
    ...(result.degraded ? { degraded: result.degraded } : {}),
  };
}
// Export the service as default
export default {
  alchemize,
  loadPlanetaryPositions,
  getCurrentAlchemicalState,
  calculateAlchemicalProperties,
};
